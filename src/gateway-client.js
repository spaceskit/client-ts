/**
 * Spaceskit Client SDK
 *
 * Self-contained WebSocket client for connecting to Spaceskit.
 * No cross-package dependencies — safe to extract into its own package.
 *
 * Features:
 * - Full WebSocket protocol support (all message types)
 * - Ed25519 challenge-response authentication via Web Crypto API
 * - Auto-reconnect with exponential backoff
 * - Request-response correlation with configurable timeout
 * - Event subscriptions with unsubscribe handlers
 *
 * Contract note:
 * `proto/` is the canonical cross-process contract source of truth.
 * This handwritten WebSocket transport stays aligned to that contract, but it
 * no longer carries compatibility-only alias fields for removed legacy paths.
 */
/**
 * Generate a new Ed25519 key pair for gateway authentication.
 * Uses Web Crypto API — works in Bun, Node 20+, and browsers.
 */
export async function generateAuthKeyPair() {
    const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, // extractable
    ["sign", "verify"]);
    // Export raw public key bytes → base64
    const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
    const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawPub)));
    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        publicKeyBase64,
    };
}
/**
 * Sign a base64-encoded challenge with an Ed25519 private key.
 * Returns the signature as a base64 string.
 */
export async function signChallenge(challengeBase64, privateKey) {
    // Decode challenge from base64
    const challengeBytes = Uint8Array.from(atob(challengeBase64), (c) => c.charCodeAt(0));
    // Sign with Ed25519
    const signature = await crypto.subtle.sign({ name: "Ed25519" }, privateKey, challengeBytes);
    // Encode signature as base64
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
/**
 * Spaceskit WebSocket client SDK
 */
export class GatewayClient {
    url;
    clientType;
    clientVersion;
    deviceId;
    devicePublicKey;
    deviceProofSignature;
    reconnect;
    reconnectIntervalMs;
    maxReconnectAttempts;
    maxReconnectDelayMs;
    requestTimeoutMs;
    ws = null;
    connected = false;
    reconnectAttempts = 0;
    reconnectTimer = null;
    pendingRequests = new Map();
    turnEventHandlers = [];
    turnStreamHandlers = [];
    spaceStateHandlers = [];
    spaceAgentUpdatedHandlers = [];
    notificationHandlers = [];
    errorHandlers = [];
    capabilityInvokeHandlers = [];
    agentMessageHandlers = [];
    agentPokeHandlers = [];
    agentIdleHandlers = [];
    taskDependencyHandlers = [];
    taskDependencyResolvedHandlers = [];
    orchestratorEventHandlers = [];
    speechEventHandlers = [];
    authKeyPair = null;
    onOpenCallback;
    onCloseCallback;
    onErrorCallback;
    constructor(options) {
        this.url = options.url;
        this.clientType = options.clientType ?? 'sdk';
        this.clientVersion = options.clientVersion ?? '1.0.0';
        this.deviceId = options.deviceId?.trim() || undefined;
        this.devicePublicKey = options.devicePublicKey?.trim() || undefined;
        this.deviceProofSignature = options.deviceProofSignature?.trim() || undefined;
        this.reconnect = options.reconnect ?? true;
        this.reconnectIntervalMs = options.reconnectIntervalMs ?? 3000;
        this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
        this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? 30000;
        this.requestTimeoutMs = options.requestTimeoutMs ?? 30000;
        this.onOpenCallback = options.onOpen;
        this.onCloseCallback = options.onClose;
        this.onErrorCallback = options.onError;
    }
    /**
     * Connect to the Spaceskit
     */
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.url);
                this.ws.addEventListener('open', () => {
                    this.connected = true;
                    this.reconnectAttempts = 0;
                    this.onOpenCallback?.();
                    resolve();
                });
                this.ws.addEventListener('message', (event) => {
                    this.handleMessage(event.data);
                });
                this.ws.addEventListener('close', () => {
                    this.connected = false;
                    this.onCloseCallback?.();
                    this.attemptReconnect();
                });
                this.ws.addEventListener('error', (event) => {
                    const error = new Error('WebSocket error');
                    this.onErrorCallback?.(error);
                    this.errorHandlers.forEach((handler) => {
                        handler({
                            code: 'WS_ERROR',
                            message: 'WebSocket connection error',
                            details: error.message,
                        });
                    });
                    reject(error);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Disconnect from the Spaceskit
     */
    async disconnect() {
        this.reconnect = false;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.connected = false;
    }
    /**
     * Check if client is connected
     */
    get isConnected() {
        return this.connected && this.ws?.readyState === WebSocket.OPEN;
    }
    /**
     * Attempt to reconnect with exponential backoff
     */
    attemptReconnect() {
        if (!this.reconnect)
            return;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            const error = new Error('Max reconnection attempts reached');
            this.onErrorCallback?.(error);
            return;
        }
        this.reconnectAttempts++;
        const exponential = this.reconnectIntervalMs * Math.pow(2, this.reconnectAttempts - 1);
        const capped = Math.min(exponential, this.maxReconnectDelayMs);
        const delay = capped * (0.5 + Math.random() * 0.5);
        this.reconnectTimer = setTimeout(() => {
            this.connect().catch((error) => {
                this.onErrorCallback?.(error);
            });
        }, delay);
    }
    /**
     * Send a message to the gateway
     */
    async send(type, payload) {
        if (!this.isConnected) {
            throw new Error('WebSocket not connected');
        }
        const messageId = crypto.randomUUID();
        const message = {
            type,
            id: messageId,
            ts: new Date().toISOString(),
            payload,
        };
        this.ws.send(JSON.stringify(message));
        return messageId;
    }
    /**
     * Send a message and wait for a response
     */
    async sendAndWaitForResponse(type, payload, timeoutMs = this.requestTimeoutMs) {
        return new Promise((resolve, reject) => {
            this.send(type, payload)
                .then((messageId) => {
                const timeout = setTimeout(() => {
                    this.pendingRequests.delete(messageId);
                    reject(new Error(`Request timeout: ${type}`));
                }, timeoutMs);
                this.pendingRequests.set(messageId, {
                    resolve: resolve,
                    reject,
                    timeout,
                });
            })
                .catch(reject);
        });
    }
    /**
     * Handle incoming messages from the gateway
     */
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            const { type, id, replyTo, payload } = message;
            // Check if this is a response to a pending request
            if (replyTo && this.pendingRequests.has(replyTo)) {
                const pending = this.pendingRequests.get(replyTo);
                this.pendingRequests.delete(replyTo);
                clearTimeout(pending.timeout);
                if (type === 'error') {
                    pending.reject(new Error(payload.message));
                }
                else {
                    pending.resolve(payload);
                }
                return;
            }
            // Handle unsolicited messages
            switch (type) {
                case 'auth_challenge':
                    this.handleAuthChallenge(payload);
                    break;
                case 'auth_result':
                    this.handleAuthResult(payload);
                    break;
                case 'turn_event':
                    this.handleTurnEvent(payload);
                    break;
                case 'turn_stream':
                    this.handleTurnStream(payload);
                    break;
                case 'capability.invoke':
                    this.handleCapabilityInvoke(payload);
                    break;
                case 'space_state':
                    this.handleSpaceState(payload);
                    break;
                case 'space.agent_updated':
                    this.spaceAgentUpdatedHandlers.forEach((handler) => handler(payload));
                    break;
                case 'notification':
                    this.handleNotification(payload);
                    break;
                case 'error':
                    this.handleError(payload);
                    break;
                case 'agent_message':
                    this.agentMessageHandlers.forEach((handler) => handler(payload));
                    break;
                case 'agent_poke':
                    this.agentPokeHandlers.forEach((handler) => handler(payload));
                    break;
                case 'agent_idle':
                    this.agentIdleHandlers.forEach((handler) => handler(payload));
                    break;
                case 'task_dependency':
                    this.taskDependencyHandlers.forEach((handler) => handler(payload));
                    break;
                case 'task_dependency_resolved':
                    this.taskDependencyResolvedHandlers.forEach((handler) => handler(payload));
                    break;
                case 'orchestrator.event':
                    this.orchestratorEventHandlers.forEach((handler) => handler(payload));
                    break;
                case 'speech.event':
                    this.speechEventHandlers.forEach((handler) => handler(payload));
                    break;
                case 'pong':
                    // Silently handle pong
                    break;
                default:
                    console.warn(`Unknown message type: ${type}`);
            }
        }
        catch (error) {
            const err = new Error(`Failed to parse message: ${error}`);
            this.onErrorCallback?.(err);
        }
    }
    /**
     * Set the authentication key pair for challenge-response auth.
     * Must be called before `connect()` if the gateway requires authentication.
     * Generate a key pair with `generateAuthKeyPair()`.
     */
    setAuthKeyPair(keyPair) {
        this.authKeyPair = keyPair;
    }
    /**
     * Handle authentication challenge — auto-signs if key pair is set.
     */
    handleAuthChallenge(payload) {
        if (payload.challenge && this.authKeyPair) {
            // Auto-sign the challenge and send AUTHENTICATE
            signChallenge(payload.challenge, this.authKeyPair.privateKey)
                .then((signature) => {
                const effectiveDeviceProofSignature = this.deviceProofSignature
                    ?? (this.deviceId
                        && this.devicePublicKey
                        && this.devicePublicKey === this.authKeyPair.publicKeyBase64
                        ? signature
                        : undefined);
                // Connection may close while challenge signing is in-flight.
                // Skip authenticate send in that case to avoid unhandled rejections.
                if (!this.isConnected)
                    return;
                return this.send('authenticate', {
                    publicKey: this.authKeyPair.publicKeyBase64,
                    signature,
                    clientType: this.clientType,
                    clientVersion: this.clientVersion,
                    deviceId: this.deviceId,
                    devicePublicKey: this.devicePublicKey,
                    deviceProofSignature: effectiveDeviceProofSignature,
                });
            })
                .catch((err) => {
                const error = {
                    code: 'AUTH_SIGN_FAILED',
                    message: `Failed to sign auth challenge: ${err}`,
                };
                this.errorHandlers.forEach((handler) => handler(error));
            });
            return;
        }
        if (!payload.success) {
            const error = {
                code: 'AUTH_CHALLENGE',
                message: payload.reason || 'Authentication challenge failed',
            };
            this.errorHandlers.forEach((handler) => handler(error));
        }
    }
    /**
     * Handle authentication result
     */
    handleAuthResult(payload) {
        if (!payload.success) {
            const error = {
                code: 'AUTH_FAILED',
                message: payload.reason || 'Authentication failed',
            };
            this.errorHandlers.forEach((handler) => handler(error));
        }
    }
    /**
     * Handle turn event
     */
    handleTurnEvent(payload) {
        const normalized = this.normalizeTurnEventPayload(payload);
        this.turnEventHandlers.forEach((handler) => handler(normalized));
    }
    /**
     * Handle turn stream
     */
    handleTurnStream(payload) {
        const normalized = this.normalizeTurnStreamPayload(payload);
        if (!normalized)
            return;
        this.turnStreamHandlers.forEach((handler) => handler(normalized));
    }
    normalizeTurnEventPayload(payload) {
        const candidate = payload;
        const spaceId = this.pickNonEmptyString(candidate.spaceId)
            ?? this.pickNonEmptyString(candidate.spaceUid)
            ?? 'unknown-space';
        const spaceUid = this.pickNonEmptyString(candidate.spaceUid) ?? spaceId;
        const turnId = this.pickNonEmptyString(candidate.turnId) ?? '';
        const explicitEventType = this.pickNonEmptyString(candidate.eventType);
        const nestedEvent = this.readRecord(candidate.event) ?? this.readRecord(candidate.data);
        const nestedEventType = this.pickNonEmptyString(nestedEvent?.type);
        const mappedEventType = explicitEventType
            ?? this.mapNestedTurnEventType(nestedEventType)
            ?? 'streaming';
        const data = candidate.data ?? candidate.event ?? null;
        return {
            spaceId,
            spaceUid,
            turnId,
            eventType: mappedEventType,
            data,
        };
    }
    normalizeTurnStreamPayload(payload) {
        const candidate = payload;
        const spaceId = this.pickNonEmptyString(candidate.spaceId)
            ?? this.pickNonEmptyString(candidate.spaceUid)
            ?? 'unknown-space';
        const spaceUid = this.pickNonEmptyString(candidate.spaceUid) ?? spaceId;
        const turnId = this.pickNonEmptyString(candidate.turnId) ?? '';
        const nestedEvent = this.readRecord(candidate.event);
        const nestedType = this.pickNonEmptyString(nestedEvent?.type);
        const explicitDelta = typeof candidate.delta === 'string' ? candidate.delta : undefined;
        const nestedDelta = typeof nestedEvent?.text === 'string' ? nestedEvent.text : undefined;
        const delta = explicitDelta ?? (nestedType === 'text_delta' ? nestedDelta : undefined);
        if (typeof delta !== 'string') {
            return null;
        }
        const agentId = this.pickNonEmptyString(candidate.agentId)
            ?? this.pickNonEmptyString(nestedEvent?.agentId)
            ?? 'unknown-agent';
        const seq = this.coerceInteger(candidate.seq ?? nestedEvent?.seq, 0);
        const done = this.coerceBoolean(candidate.done ?? nestedEvent?.done, false);
        return {
            spaceId,
            spaceUid,
            turnId,
            agentId,
            delta,
            seq,
            done,
        };
    }
    mapNestedTurnEventType(typeRaw) {
        const type = typeRaw?.trim().toLowerCase();
        switch (type) {
            case 'text_delta':
                return 'streaming';
            case 'tool_call':
            case 'tool_call_start':
            case 'tool_result':
                return 'tool_call';
            case 'feedback_requested':
                return 'feedback_requested';
            case 'turn_completed':
                return 'completed';
            case 'error':
                return 'failed';
            default:
                return undefined;
        }
    }
    pickNonEmptyString(value) {
        if (typeof value !== 'string')
            return undefined;
        const normalized = value.trim();
        return normalized.length > 0 ? normalized : undefined;
    }
    readRecord(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return undefined;
        }
        return value;
    }
    coerceInteger(value, fallback) {
        if (typeof value === 'number' && Number.isFinite(value)) {
            return Math.trunc(value);
        }
        if (typeof value === 'string') {
            const parsed = Number.parseInt(value, 10);
            if (Number.isFinite(parsed)) {
                return parsed;
            }
        }
        return fallback;
    }
    coerceBoolean(value, fallback) {
        if (typeof value === 'boolean')
            return value;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
                return true;
            }
            if (normalized === 'false' || normalized === '0' || normalized === 'no') {
                return false;
            }
        }
        return fallback;
    }
    /**
     * Handle adapter capability invocation.
     */
    handleCapabilityInvoke(payload) {
        this.capabilityInvokeHandlers.forEach((handler) => {
            Promise.resolve(handler(payload)).catch((err) => {
                this.handleError({
                    code: 'ADAPTER_INVOKE_HANDLER_FAILED',
                    message: err instanceof Error ? err.message : String(err),
                });
            });
        });
    }
    /**
     * Handle space state update
     */
    handleSpaceState(payload) {
        this.spaceStateHandlers.forEach((handler) => handler(payload));
    }
    /**
     * Handle notification
     */
    handleNotification(payload) {
        this.notificationHandlers.forEach((handler) => handler(payload));
    }
    /**
     * Handle error
     */
    handleError(payload) {
        this.errorHandlers.forEach((handler) => handler(payload));
    }
    async executeTurn(optionsOrSpaceUid, input, targetAgentId) {
        const options = typeof optionsOrSpaceUid === 'string'
            ? {
                spaceUid: optionsOrSpaceUid,
                input: input ?? '',
                targetAgentId,
            }
            : optionsOrSpaceUid;
        const payload = {
            spaceUid: options.spaceUid,
            input: options.input,
            targetAgentId: options.targetAgentId,
            targetAgentIds: options.targetAgentIds,
            replyToTurnId: options.replyToTurnId,
            conversationTopology: options.conversationTopology,
            mode: options.mode,
            effort: options.effort,
            accessMode: options.accessMode,
        };
        const result = await this.sendAndWaitForResponse('execute_turn', payload);
        return result;
    }
    /**
     * Ensure a main space exists and optionally subscribe to it.
     *
     * This is intended for app bootstrap flows:
     * - find main space by ID
     * - optionally create it if missing
     * - optionally subscribe to its real-time events
     */
    async ensureMainSpace(options = {}) {
        const spaceId = options.spaceId ?? 'main-space';
        const resourceId = options.resourceId ?? 'resource:main';
        const name = options.name ?? 'Main Space';
        const goal = options.goal ?? 'Default shared space for gateway startup and orchestrator coordination.';
        const createIfMissing = options.createIfMissing ?? true;
        const shouldSubscribe = options.subscribe ?? true;
        const spaces = await this.listSpaces({
            apiVersion: options.apiVersion,
            resourceId,
            limit: 200,
        });
        let space = spaces.find((candidate) => candidate.id === spaceId) ?? null;
        let created = false;
        if (!space && createIfMissing) {
            space = await this.createSpace({
                apiVersion: options.apiVersion,
                spaceId,
                resourceId,
                name,
                goal,
                visibility: 'shared',
                initialAgents: options.initialAgents,
            });
            created = true;
        }
        if (!space) {
            throw new Error(`Main space not found: ${spaceId}`);
        }
        let subscribed = false;
        if (shouldSubscribe) {
            await this.subscribe([space.spaceUid]);
            subscribed = true;
        }
        return {
            space,
            created,
            subscribed,
        };
    }
    /**
     * Connect (if needed), then ensure/subscribe main space.
     */
    async connectAndBootstrapMainSpace(options = {}) {
        let connected = false;
        if (!this.isConnected) {
            await this.connect();
            connected = true;
        }
        const result = await this.ensureMainSpace(options);
        return {
            connected,
            ...result,
        };
    }
    /**
     * Resume a turn with feedback
     */
    async resumeFeedback(spaceUid, turnId, response, revision) {
        const payload = {
            spaceUid,
            turnId,
            response,
            revision,
        };
        await this.sendAndWaitForResponse('resume_feedback', payload);
    }
    /**
     * Subscribe to space events
     */
    async subscribe(spaceUids) {
        const payload = {
            spaceUids,
        };
        await this.sendAndWaitForResponse('subscribe', payload);
    }
    /**
     * Invoke a capability
     */
    async invokeCapability(capability, method, params, targetProvider) {
        const payload = {
            capability,
            method,
            params,
            targetProvider,
        };
        const result = await this.sendAndWaitForResponse('capability_invoke', payload);
        return result;
    }
    /**
     * Create a new space.
     */
    async createSpace(payload) {
        const result = await this.sendAndWaitForResponse('space.create', payload);
        return result.space;
    }
    /**
     * Get a space by ID.
     */
    async getSpace(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse('space.get', payload);
        return result.space;
    }
    /**
     * List spaces with optional filters.
     */
    async listSpaces(payload = {}) {
        const result = await this.sendAndWaitForResponse('space.list', payload);
        return result.spaces;
    }
    /**
     * Archive a space on the gateway.
     */
    async archiveSpace(payload) {
        return this.sendAndWaitForResponse('space.archive', payload);
    }
    /**
     * Soft-delete a space on the gateway.
     */
    async deleteSpace(payload) {
        return this.sendAndWaitForResponse('space.delete', payload);
    }
    /**
     * Add an agent assignment to a space.
     */
    async addAgent(payload) {
        return this.sendAndWaitForResponse('space.add_agent', payload);
    }
    /**
     * Remove an agent assignment from a space.
     */
    async removeAgent(payload) {
        return this.sendAndWaitForResponse('space.remove_agent', payload);
    }
    /**
     * Update an existing assignment in a space.
     */
    async updateAgentAssignment(payload) {
        return this.sendAndWaitForResponse('space.update_agent_assignment', payload);
    }
    /**
     * Set the orchestrator profile for a space.
     */
    async setSpaceOrchestrator(payload) {
        const result = await this.sendAndWaitForResponse('space.set_orchestrator', payload);
        return result.space;
    }
    /**
     * List all assignments for a space.
     */
    async listAgentAssignments(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse('space.list_agent_assignments', payload);
        return result.assignments;
    }
    /**
     * Get per-space MCP endpoint configuration.
     */
    async getSpaceMcpEndpoint(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        return this.sendAndWaitForResponse('space.get_mcp_endpoint', payload);
    }
    /**
     * Create or update per-space MCP endpoint configuration.
     */
    async setSpaceMcpEndpoint(payload) {
        const result = await this.sendAndWaitForResponse('space.set_mcp_endpoint', payload);
        return result.endpoint;
    }
    /**
     * Remove per-space MCP endpoint configuration.
     */
    async clearSpaceMcpEndpoint(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse('space.clear_mcp_endpoint', payload);
        return result.cleared;
    }
    /**
     * Discover MCP-backed external agents available to a space.
     */
    async discoverSpaceMcpAgents(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        return this.sendAndWaitForResponse('space.discover_mcp_agents', payload);
    }
    /**
     * Approve one discovered MCP agent into a space as an external participant.
     */
    async approveSpaceMcpAgent(payload) {
        return this.sendAndWaitForResponse('space.approve_mcp_agent', payload);
    }
    /**
     * Add one skill assignment to a space.
     */
    async addSkillToSpace(payload) {
        return this.sendAndWaitForResponse("space.add_skill", payload);
    }
    /**
     * Remove one skill assignment from a space.
     */
    async removeSkillFromSpace(payload) {
        return this.sendAndWaitForResponse("space.remove_skill", payload);
    }
    /**
     * List current skill assignments for a space.
     */
    async listSpaceSkills(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse("space.list_skills", payload);
        return result.skills;
    }
    /**
     * Get effective workspace configuration for a space.
     */
    async getSpaceWorkspace(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse("space.get_workspace", payload);
        return result.workspace;
    }
    /**
     * Set or clear the folder binding for a space.
     */
    async setSpaceWorkspace(payload) {
        const result = await this.sendAndWaitForResponse("space.set_workspace", payload);
        return result.workspace;
    }
    /**
     * Add one resource assignment to a space.
     */
    async addSpaceResource(payload) {
        const result = await this.sendAndWaitForResponse("space.add_resource", payload);
        return result.resource;
    }
    /**
     * Remove one resource assignment from a space.
     */
    async removeSpaceResource(payload) {
        const result = await this.sendAndWaitForResponse("space.remove_resource", payload);
        return result.removed;
    }
    /**
     * List resource assignments for a space.
     */
    async listSpaceResources(spaceId, apiVersion) {
        const payload = { apiVersion, spaceId };
        const result = await this.sendAndWaitForResponse("space.list_resources", payload);
        return result.resources;
    }
    /**
     * List redacted orchestration journal entries for a space.
     */
    async listOrchestrationJournal(payload) {
        return this.sendAndWaitForResponse("space.list_orchestration_journal", payload);
    }
    /**
     * List agent definitions, optionally including archived entries.
     */
    async listAgentDefinitions(payload = {}) {
        const result = await this.sendAndWaitForResponse("identity.list_agent_definitions", payload);
        return result.agentDefinitions;
    }
    /**
     * Fetch one agent definition by ID.
     */
    async getAgentDefinition(agentDefinitionId, apiVersion) {
        const payload = { apiVersion, agentDefinitionId };
        const result = await this.sendAndWaitForResponse("identity.get_agent_definition", payload);
        return result.agentDefinition;
    }
    async createAgentDefinition(payload) {
        const result = await this.sendAndWaitForResponse("identity.create_agent_definition", payload);
        return {
            agentDefinition: result.agentDefinition,
            created: result.created,
        };
    }
    async updateAgentDefinition(payload) {
        const result = await this.sendAndWaitForResponse("identity.update_agent_definition", payload);
        return {
            agentDefinition: result.agentDefinition,
            newRevision: result.newRevision,
        };
    }
    async archiveAgentDefinition(payload) {
        const result = await this.sendAndWaitForResponse("identity.archive_agent_definition", payload);
        return {
            agentDefinition: result.agentDefinition,
            archived: result.archived,
        };
    }
    async listPersonas(payload = {}) {
        const result = await this.sendAndWaitForResponse("identity.list_personas", payload);
        return result.personas;
    }
    async getPersona(personaId, apiVersion) {
        const payload = { apiVersion, personaId };
        const result = await this.sendAndWaitForResponse("identity.get_persona", payload);
        return result.persona;
    }
    async createPersona(payload) {
        const result = await this.sendAndWaitForResponse("identity.create_persona", payload);
        return { persona: result.persona, created: result.created };
    }
    async updatePersona(payload) {
        const result = await this.sendAndWaitForResponse("identity.update_persona", payload);
        return { persona: result.persona, newRevision: result.newRevision };
    }
    async archivePersona(payload) {
        const result = await this.sendAndWaitForResponse("identity.archive_persona", payload);
        return { persona: result.persona, archived: result.archived };
    }
    async previewCompiledInstructions(agentDefinitionId, apiVersion, workspaceContext) {
        const payload = {
            apiVersion,
            agentDefinitionId,
            workspaceContext,
        };
        const result = await this.sendAndWaitForResponse("identity.preview_compiled_instructions", payload);
        return result.preview;
    }
    async previewRuntimeSystemPrompt(payload) {
        const result = await this.sendAndWaitForResponse("identity.preview_runtime_system_prompt", payload);
        return result.preview;
    }
    async previewSystemPromptMatrix(payload) {
        const result = await this.sendAndWaitForResponse("identity.preview_system_prompt_matrix", payload);
        return result.matrix;
    }
    /**
     * Create a profile in gateway persistence.
     */
    async createProfile(payload) {
        return this.sendAndWaitForResponse("profile.create", payload);
    }
    /**
     * Fetch one profile by ID.
     */
    async getProfile(profileId, apiVersion) {
        const payload = { apiVersion, profileId };
        const result = await this.sendAndWaitForResponse("profile.get", payload);
        return result.profile;
    }
    /**
     * List profiles, optionally including archived entries.
     */
    async listProfiles(payload = {}) {
        const result = await this.sendAndWaitForResponse("profile.list", payload);
        return result.profiles;
    }
    /**
     * Update a profile and create a new active revision.
     */
    async updateProfile(payload) {
        return this.sendAndWaitForResponse("profile.update", payload);
    }
    /**
     * Archive a profile.
     */
    async archiveProfile(payload) {
        return this.sendAndWaitForResponse("profile.archive", payload);
    }
    async previewTemplate(payload) {
        return this.sendAndWaitForResponse('space.preview_template', payload);
    }
    async createSpaceFromTemplate(payload) {
        return this.sendAndWaitForResponse('space.create_from_template', payload);
    }
    async saveSpaceTemplate(payload) {
        return this.sendAndWaitForResponse('space.save_template', payload);
    }
    async listSpaceTemplates(payload = {}) {
        const result = await this.sendAndWaitForResponse("space_template.list", payload);
        return result.templates;
    }
    async getSpaceTemplate(templateId, apiVersion) {
        const payload = { apiVersion, templateId };
        const result = await this.sendAndWaitForResponse("space_template.get", payload);
        return result.template;
    }
    async previewSpaceTemplateRecord(payload) {
        const result = await this.sendAndWaitForResponse("space_template.preview", payload);
        return {
            template: result.template,
            resolved: result.resolved,
            warnings: result.warnings,
        };
    }
    async createSpaceFromManagedTemplate(payload) {
        const result = await this.sendAndWaitForResponse("space_template.create_space", payload);
        return {
            template: result.template,
            space: result.space,
        };
    }
    async saveManagedSpaceTemplate(payload) {
        const result = await this.sendAndWaitForResponse("space_template.save", payload);
        return {
            template: result.template,
            created: result.created,
        };
    }
    async archiveSpaceTemplate(payload) {
        const result = await this.sendAndWaitForResponse("space_template.archive", payload);
        return {
            template: result.template,
            archived: result.archived,
        };
    }
    async registerDevice(payload) {
        return this.sendAndWaitForResponse('auth.register_device', payload);
    }
    async rotateDeviceKey(payload) {
        return this.sendAndWaitForResponse('auth.rotate_device_key', payload);
    }
    async revokeDevice(payload) {
        return this.sendAndWaitForResponse('auth.revoke_device', payload);
    }
    async listDevices(payload = {}) {
        const result = await this.sendAndWaitForResponse('auth.list_devices', payload);
        return result.devices;
    }
    /**
     * Issue a short-lived signed bearer token for strict HTTP principal auth.
     */
    async issueHttpPrincipalToken(payload = {}) {
        return this.sendAndWaitForResponse('auth.issue_http_principal_token', payload);
    }
    /**
     * Get persisted usage + budget snapshot.
     */
    async getUsageSnapshot(apiVersion) {
        const result = await this.sendAndWaitForResponse('usage.get_snapshot', { apiVersion });
        return result.snapshot;
    }
    /**
     * Get local provider telemetry (quota windows + local token/session aggregates).
     */
    async getLocalUsageTelemetry(apiVersion, providerId) {
        const payload = {
            apiVersion,
            providerId,
        };
        const result = await this.sendAndWaitForResponse("gateway.get_local_usage_telemetry", payload);
        return result.telemetry;
    }
    async getExternalConnectivity(apiVersion) {
        return this.sendAndWaitForResponse("gateway.get_external_connectivity", { apiVersion });
    }
    async setExternalConnectivity(mode, apiVersion) {
        return this.sendAndWaitForResponse("gateway.set_external_connectivity", {
            apiVersion,
            mode,
        });
    }
    /**
     * Get current gateway-wide capability/skill policy.
     */
    async getGatewayPolicy(apiVersion) {
        const result = await this.sendAndWaitForResponse('gateway.get_policy', { apiVersion });
        return result.policy;
    }
    /**
     * Update gateway-wide capability/skill policy.
     */
    async updateGatewayPolicy(payload) {
        const result = await this.sendAndWaitForResponse('gateway.update_policy', payload);
        return result.policy;
    }
    async factoryResetGateway(payload) {
        return this.sendAndWaitForResponse('gateway.factory_reset', payload, this.minimumRequestTimeout(180_000));
    }
    async resetSpace(payload) {
        return this.sendAndWaitForResponse('space.reset', payload, this.minimumRequestTimeout(180_000));
    }
    async listLibraryEntries(payload = {}) {
        const result = await this.sendAndWaitForResponse("library.list_entries", payload);
        return result.entries;
    }
    async getLibraryEntry(entryId, apiVersion, includeContent) {
        const payload = { apiVersion, entryId, includeContent };
        const result = await this.sendAndWaitForResponse("library.get_entry", payload);
        return result.entry;
    }
    async saveLibrarySkill(payload) {
        return this.sendAndWaitForResponse("library.save_skill", payload);
    }
    async importLibraryEntry(payload) {
        return this.sendAndWaitForResponse("library.import_entry", payload);
    }
    async archiveLibraryEntry(payload) {
        return this.sendAndWaitForResponse("library.archive_entry", payload);
    }
    async setLibraryEntryEnabled(payload) {
        const result = await this.sendAndWaitForResponse("library.set_entry_enabled", payload);
        return result.entry;
    }
    async deleteLibraryEntry(payload) {
        return this.sendAndWaitForResponse("library.delete_entry", payload);
    }
    async scanLibraryEntries(apiVersion) {
        return this.sendAndWaitForResponse("library.scan_entries", { apiVersion });
    }
    async listSkillDrafts(apiVersion) {
        const result = await this.sendAndWaitForResponse("library.list_skill_drafts", { apiVersion });
        return result.drafts;
    }
    async getSkillDraft(draftId, apiVersion) {
        const result = await this.sendAndWaitForResponse("library.get_skill_draft", { apiVersion, draftId });
        return result.draft;
    }
    async createSkillDraft(payload) {
        return this.sendAndWaitForResponse("library.create_skill_draft", payload);
    }
    async deleteSkillDraft(payload) {
        return this.sendAndWaitForResponse("library.delete_skill_draft", payload);
    }
    /**
     * Submit an intent-level orchestrator command.
     */
    async sendOrchestratorCommand(payload) {
        const result = await this.sendAndWaitForResponse('orchestrator.command', payload);
        return result.command;
    }
    /**
     * Get command lifecycle state by command ID.
     */
    async getOrchestratorCommand(commandId, apiVersion) {
        const result = await this.sendAndWaitForResponse('orchestrator.get_command', { apiVersion, commandId });
        return result.command;
    }
    async createSchedulerJob(payload) {
        const result = await this.sendAndWaitForResponse('scheduler.create_job', payload);
        return result.job;
    }
    async getSchedulerJob(jobId, apiVersion) {
        const payload = { apiVersion, jobId };
        const result = await this.sendAndWaitForResponse('scheduler.get_job', payload);
        return result.job;
    }
    async listSchedulerJobs(payload = {}) {
        const result = await this.sendAndWaitForResponse('scheduler.list_jobs', payload);
        return result.jobs;
    }
    async updateSchedulerJob(payload) {
        const result = await this.sendAndWaitForResponse('scheduler.update_job', payload);
        return result.job;
    }
    async deleteSchedulerJob(payload) {
        return this.sendAndWaitForResponse('scheduler.delete_job', payload);
    }
    async linkSchedulerJobSpace(payload) {
        const result = await this.sendAndWaitForResponse('scheduler.link_space', payload);
        return result.job;
    }
    async unlinkSchedulerJobSpace(payload) {
        const result = await this.sendAndWaitForResponse('scheduler.unlink_space', payload);
        return result.job;
    }
    async listSchedulerJobRuns(payload) {
        return this.sendAndWaitForResponse('scheduler.list_runs', payload);
    }
    async runSchedulerJobNow(payload) {
        return this.sendAndWaitForResponse('scheduler.run_now', payload);
    }
    async linkSpaces(payload) {
        const result = await this.sendAndWaitForResponse('space.link', payload);
        return result.link;
    }
    async unlinkSpaces(payload) {
        const result = await this.sendAndWaitForResponse('space.unlink', payload);
        return result.removed;
    }
    async shareSpaceContext(payload) {
        const result = await this.sendAndWaitForResponse('space.share_context', payload);
        return result.transfer;
    }
    async pullSharedContext(payload) {
        return this.sendAndWaitForResponse('space.pull_shared_context', payload);
    }
    async createSpaceShareInvite(payload) {
        const result = await this.sendAndWaitForResponse('space.share_create_invite', payload);
        return result.invite;
    }
    async joinSpaceShareInvite(payload) {
        const result = await this.sendAndWaitForResponse('space.share_join', payload);
        return result.participant;
    }
    async revokeSpaceShareAccess(payload) {
        return this.sendAndWaitForResponse('space.share_revoke', payload);
    }
    async listSpaceParticipants(payload) {
        const result = await this.sendAndWaitForResponse('space.share_list_participants', payload);
        return result.participants;
    }
    async announceSyncPeer(payload) {
        return this.sendAndWaitForResponse('sync.announce', payload);
    }
    async querySyncResources(payload) {
        return this.sendAndWaitForResponse('sync.query_resources', payload);
    }
    async pullSyncResources(payload) {
        return this.sendAndWaitForResponse('sync.pull_resources', payload);
    }
    async startSpeechSession(payload) {
        const result = await this.sendAndWaitForResponse('speech.start', payload);
        return result.event;
    }
    async sendSpeechAudioChunk(payload) {
        const result = await this.sendAndWaitForResponse('speech.audio_chunk', payload);
        return result.events;
    }
    async controlSpeechSession(payload) {
        const result = await this.sendAndWaitForResponse('speech.control', payload);
        return result.event;
    }
    /**
     * Register native adapter providers with the gateway.
     */
    async registerCapabilities(providers) {
        const payload = { providers };
        await this.sendAndWaitForResponse('capabilities.register', payload);
    }
    /**
     * Deregister native adapter providers from the gateway.
     */
    async deregisterCapabilities(providerIds) {
        const payload = { providerIds };
        await this.sendAndWaitForResponse('capabilities.deregister', payload);
    }
    /**
     * Send invocation success for a previously received `capability.invoke`.
     */
    async sendCapabilityResult(payload) {
        await this.send('capability.result', payload);
    }
    /**
     * Send invocation failure for a previously received `capability.invoke`.
     */
    async sendCapabilityError(payload) {
        await this.send('capability.error', payload);
    }
    /**
     * Send a direct message to another agent in a space
     */
    async sendAgentMessage(spaceId, fromAgentId, toAgentId, content, spaceUid) {
        const payload = {
            spaceId,
            spaceUid: spaceUid ?? spaceId,
            fromAgentId,
            toAgentId,
            content,
        };
        await this.send('agent_message', payload);
    }
    /**
     * Poke an idle agent to resume work
     */
    async pokeAgent(spaceId, targetAgentId, reason, unblockedByTurnId, spaceUid) {
        const payload = {
            spaceId,
            spaceUid: spaceUid ?? spaceId,
            targetAgentId,
            reason,
            unblockedByTurnId,
        };
        await this.send('agent_poke', payload);
    }
    /**
     * Declare a task dependency between turns
     */
    async declareTaskDependency(spaceId, blockedTurnId, dependsOnTurnId, spaceUid) {
        const payload = {
            spaceId,
            spaceUid: spaceUid ?? spaceId,
            blockedTurnId,
            dependsOnTurnId,
        };
        await this.send('task_dependency', payload);
    }
    /**
     * Send a ping to the gateway
     */
    async ping() {
        await this.sendAndWaitForResponse('ping', {});
    }
    /**
     * Subscribe to turn events
     */
    onTurnEvent(handler) {
        this.turnEventHandlers.push(handler);
        return () => {
            this.turnEventHandlers = this.turnEventHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to turn stream events
     */
    onTurnStream(handler) {
        this.turnStreamHandlers.push(handler);
        return () => {
            this.turnStreamHandlers = this.turnStreamHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to space state updates
     */
    onSpaceState(handler) {
        this.spaceStateHandlers.push(handler);
        return () => {
            this.spaceStateHandlers = this.spaceStateHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to profile-swap events for space agent assignments.
     */
    onSpaceAgentUpdated(handler) {
        this.spaceAgentUpdatedHandlers.push(handler);
        return () => {
            this.spaceAgentUpdatedHandlers = this.spaceAgentUpdatedHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to notifications
     */
    onNotification(handler) {
        this.notificationHandlers.push(handler);
        return () => {
            this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to error events
     */
    onError(handler) {
        this.errorHandlers.push(handler);
        return () => {
            this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to inter-agent messages
     */
    onAgentMessage(handler) {
        this.agentMessageHandlers.push(handler);
        return () => {
            this.agentMessageHandlers = this.agentMessageHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to agent poke events
     */
    onAgentPoke(handler) {
        this.agentPokeHandlers.push(handler);
        return () => {
            this.agentPokeHandlers = this.agentPokeHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to agent idle notifications
     */
    onAgentIdle(handler) {
        this.agentIdleHandlers.push(handler);
        return () => {
            this.agentIdleHandlers = this.agentIdleHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to task dependency declarations
     */
    onTaskDependency(handler) {
        this.taskDependencyHandlers.push(handler);
        return () => {
            this.taskDependencyHandlers = this.taskDependencyHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to task dependency resolved notifications
     */
    onTaskDependencyResolved(handler) {
        this.taskDependencyResolvedHandlers.push(handler);
        return () => {
            this.taskDependencyResolvedHandlers = this.taskDependencyResolvedHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to orchestrator command lifecycle events.
     */
    onOrchestratorEvent(handler) {
        this.orchestratorEventHandlers.push(handler);
        return () => {
            this.orchestratorEventHandlers = this.orchestratorEventHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to speech session events.
     */
    onSpeechEvent(handler) {
        this.speechEventHandlers.push(handler);
        return () => {
            this.speechEventHandlers = this.speechEventHandlers.filter((h) => h !== handler);
        };
    }
    /**
     * Subscribe to adapter capability invocation requests.
     */
    onCapabilityInvoke(handler) {
        this.capabilityInvokeHandlers.push(handler);
        return () => {
            this.capabilityInvokeHandlers = this.capabilityInvokeHandlers.filter((h) => h !== handler);
        };
    }
    minimumRequestTimeout(minimumMs) {
        return Math.max(this.requestTimeoutMs, minimumMs);
    }
}
export default GatewayClient;
//# sourceMappingURL=gateway-client.js.map
