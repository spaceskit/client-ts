// client-ts/src/gateway-auth.ts
async function generateAuthKeyPair() {
  const keyPair = await crypto.subtle.generateKey({ name: "Ed25519" }, true, ["sign", "verify"]);
  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(rawPub)));
  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyBase64
  };
}
async function signChallenge(challengeBase64, privateKey) {
  const challengeBytes = Uint8Array.from(atob(challengeBase64), (c) => c.charCodeAt(0));
  const signature = await crypto.subtle.sign({ name: "Ed25519" }, privateKey, challengeBytes);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
// client-ts/src/gateway-client.ts
class GatewayClient {
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
  pendingRequests = new Map;
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
    this.clientType = options.clientType ?? "sdk";
    this.clientVersion = options.clientVersion ?? "1.0.0";
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
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.addEventListener("open", () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.onOpenCallback?.();
          resolve();
        });
        this.ws.addEventListener("message", (event) => {
          this.handleMessage(event.data);
        });
        this.ws.addEventListener("close", () => {
          this.connected = false;
          this.onCloseCallback?.();
          this.attemptReconnect();
        });
        this.ws.addEventListener("error", (event) => {
          const error = new Error("WebSocket error");
          this.onErrorCallback?.(error);
          this.errorHandlers.forEach((handler) => {
            handler({
              code: "WS_ERROR",
              message: "WebSocket connection error",
              details: error.message
            });
          });
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
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
  get isConnected() {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }
  attemptReconnect() {
    if (!this.reconnect)
      return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error("Max reconnection attempts reached");
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
  async send(type, payload) {
    if (!this.isConnected) {
      throw new Error("WebSocket not connected");
    }
    const messageId = crypto.randomUUID();
    const message = {
      type,
      id: messageId,
      ts: new Date().toISOString(),
      payload
    };
    this.ws.send(JSON.stringify(message));
    return messageId;
  }
  async sendAndWaitForResponse(type, payload, timeoutMs = this.requestTimeoutMs) {
    return new Promise((resolve, reject) => {
      this.send(type, payload).then((messageId) => {
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(messageId);
          reject(new Error(`Request timeout: ${type}`));
        }, timeoutMs);
        this.pendingRequests.set(messageId, {
          resolve,
          reject,
          timeout
        });
      }).catch(reject);
    });
  }
  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const { type, id, replyTo, payload } = message;
      if (replyTo && this.pendingRequests.has(replyTo)) {
        const pending = this.pendingRequests.get(replyTo);
        this.pendingRequests.delete(replyTo);
        clearTimeout(pending.timeout);
        if (type === "error") {
          pending.reject(new Error(payload.message));
        } else {
          pending.resolve(payload);
        }
        return;
      }
      switch (type) {
        case "auth_challenge":
          this.handleAuthChallenge(payload);
          break;
        case "auth_result":
          this.handleAuthResult(payload);
          break;
        case "turn_event":
          this.handleTurnEvent(payload);
          break;
        case "turn_stream":
          this.handleTurnStream(payload);
          break;
        case "capability.invoke":
          this.handleCapabilityInvoke(payload);
          break;
        case "space_state":
          this.handleSpaceState(payload);
          break;
        case "space.agent_updated":
          this.spaceAgentUpdatedHandlers.forEach((handler) => handler(payload));
          break;
        case "notification":
          this.handleNotification(payload);
          break;
        case "error":
          this.handleError(payload);
          break;
        case "agent_message":
          this.agentMessageHandlers.forEach((handler) => handler(payload));
          break;
        case "agent_poke":
          this.agentPokeHandlers.forEach((handler) => handler(payload));
          break;
        case "agent_idle":
          this.agentIdleHandlers.forEach((handler) => handler(payload));
          break;
        case "task_dependency":
          this.taskDependencyHandlers.forEach((handler) => handler(payload));
          break;
        case "task_dependency_resolved":
          this.taskDependencyResolvedHandlers.forEach((handler) => handler(payload));
          break;
        case "orchestrator.event":
          this.orchestratorEventHandlers.forEach((handler) => handler(payload));
          break;
        case "speech.event":
          this.speechEventHandlers.forEach((handler) => handler(payload));
          break;
        case "pong":
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      const err = new Error(`Failed to parse message: ${error}`);
      this.onErrorCallback?.(err);
    }
  }
  setAuthKeyPair(keyPair) {
    this.authKeyPair = keyPair;
  }
  handleAuthChallenge(payload) {
    if (payload.challenge && this.authKeyPair) {
      signChallenge(payload.challenge, this.authKeyPair.privateKey).then((signature) => {
        const effectiveDeviceProofSignature = this.deviceProofSignature ?? (this.deviceId && this.devicePublicKey && this.devicePublicKey === this.authKeyPair.publicKeyBase64 ? signature : undefined);
        if (!this.isConnected)
          return;
        return this.send("authenticate", {
          publicKey: this.authKeyPair.publicKeyBase64,
          signature,
          clientType: this.clientType,
          clientVersion: this.clientVersion,
          deviceId: this.deviceId,
          devicePublicKey: this.devicePublicKey,
          deviceProofSignature: effectiveDeviceProofSignature
        });
      }).catch((err) => {
        const error = {
          code: "AUTH_SIGN_FAILED",
          message: `Failed to sign auth challenge: ${err}`
        };
        this.errorHandlers.forEach((handler) => handler(error));
      });
      return;
    }
    if (!payload.success) {
      const error = {
        code: "AUTH_CHALLENGE",
        message: payload.reason || "Authentication challenge failed"
      };
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }
  handleAuthResult(payload) {
    if (!payload.success) {
      const error = {
        code: "AUTH_FAILED",
        message: payload.reason || "Authentication failed"
      };
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }
  handleTurnEvent(payload) {
    const normalized = this.normalizeTurnEventPayload(payload);
    this.turnEventHandlers.forEach((handler) => handler(normalized));
  }
  handleTurnStream(payload) {
    const normalized = this.normalizeTurnStreamPayload(payload);
    if (!normalized)
      return;
    this.turnStreamHandlers.forEach((handler) => handler(normalized));
  }
  normalizeTurnEventPayload(payload) {
    const candidate = payload;
    const spaceId = this.pickNonEmptyString(candidate.spaceId) ?? this.pickNonEmptyString(candidate.spaceUid) ?? "unknown-space";
    const spaceUid = this.pickNonEmptyString(candidate.spaceUid) ?? spaceId;
    const turnId = this.pickNonEmptyString(candidate.turnId) ?? "";
    const explicitEventType = this.pickNonEmptyString(candidate.eventType);
    const nestedEvent = this.readRecord(candidate.event) ?? this.readRecord(candidate.data);
    const nestedEventType = this.pickNonEmptyString(nestedEvent?.type);
    const mappedEventType = explicitEventType ?? this.mapNestedTurnEventType(nestedEventType) ?? "streaming";
    const data = candidate.data ?? candidate.event ?? null;
    const rootTurnId = this.pickNonEmptyString(candidate.rootTurnId);
    const agentId = this.pickNonEmptyString(candidate.agentId);
    const conversationTopology = this.pickNonEmptyString(candidate.conversationTopology);
    const transcriptVisibility = this.pickNonEmptyString(candidate.transcriptVisibility);
    const typedPayload = candidate.typedPayload && typeof candidate.typedPayload === "object" && "kind" in candidate.typedPayload ? candidate.typedPayload : undefined;
    const ts = this.pickNonEmptyString(candidate.ts);
    return {
      spaceId,
      spaceUid,
      turnId,
      rootTurnId,
      agentId,
      conversationTopology,
      transcriptVisibility,
      eventType: mappedEventType,
      data,
      typedPayload,
      ts
    };
  }
  normalizeTurnStreamPayload(payload) {
    const candidate = payload;
    const spaceId = this.pickNonEmptyString(candidate.spaceId) ?? this.pickNonEmptyString(candidate.spaceUid) ?? "unknown-space";
    const spaceUid = this.pickNonEmptyString(candidate.spaceUid) ?? spaceId;
    const turnId = this.pickNonEmptyString(candidate.turnId) ?? "";
    const nestedEvent = this.readRecord(candidate.event);
    const nestedType = this.pickNonEmptyString(nestedEvent?.type);
    const explicitDelta = typeof candidate.delta === "string" ? candidate.delta : undefined;
    const nestedDelta = typeof nestedEvent?.text === "string" ? nestedEvent.text : undefined;
    const delta = explicitDelta ?? (nestedType === "text_delta" ? nestedDelta : undefined);
    if (typeof delta !== "string") {
      return null;
    }
    const agentId = this.pickNonEmptyString(candidate.agentId) ?? this.pickNonEmptyString(nestedEvent?.agentId) ?? "unknown-agent";
    const rootTurnId = this.pickNonEmptyString(candidate.rootTurnId);
    const conversationTopology = this.pickNonEmptyString(candidate.conversationTopology);
    const transcriptVisibility = this.pickNonEmptyString(candidate.transcriptVisibility);
    const summaryTurnId = this.pickNonEmptyString(candidate.summaryTurnId);
    const streamKind = this.pickNonEmptyString(candidate.streamKind);
    const seq = this.coerceInteger(candidate.seq ?? nestedEvent?.seq, 0);
    const done = this.coerceBoolean(candidate.done ?? nestedEvent?.done, false);
    return {
      spaceId,
      spaceUid,
      turnId,
      rootTurnId,
      agentId,
      conversationTopology,
      transcriptVisibility,
      summaryTurnId,
      streamKind,
      delta,
      seq,
      done
    };
  }
  mapNestedTurnEventType(typeRaw) {
    const type = typeRaw?.trim().toLowerCase();
    switch (type) {
      case "text_delta":
        return "streaming";
      case "tool_call":
      case "tool_call_start":
      case "tool_result":
        return "tool_call";
      case "feedback_requested":
        return "feedback_requested";
      case "turn_completed":
        return "completed";
      case "error":
        return "failed";
      default:
        return;
    }
  }
  pickNonEmptyString(value) {
    if (typeof value !== "string")
      return;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
  readRecord(value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return;
    }
    return value;
  }
  coerceInteger(value, fallback) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return Math.trunc(value);
    }
    if (typeof value === "string") {
      const parsed = Number.parseInt(value, 10);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }
  coerceBoolean(value, fallback) {
    if (typeof value === "boolean")
      return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (normalized === "true" || normalized === "1" || normalized === "yes") {
        return true;
      }
      if (normalized === "false" || normalized === "0" || normalized === "no") {
        return false;
      }
    }
    return fallback;
  }
  normalizeSpaceTurnTrace(trace) {
    return {
      ...trace,
      events: Array.isArray(trace.events) ? trace.events : [],
      toolCalls: Array.isArray(trace.toolCalls) ? trace.toolCalls : [],
      activities: Array.isArray(trace.activities) ? trace.activities : [],
      executionRuns: Array.isArray(trace.executionRuns) ? trace.executionRuns : [],
      artifactIds: Array.isArray(trace.artifactIds) ? trace.artifactIds : []
    };
  }
  handleCapabilityInvoke(payload) {
    this.capabilityInvokeHandlers.forEach((handler) => {
      Promise.resolve(handler(payload)).catch((err) => {
        this.handleError({
          code: "ADAPTER_INVOKE_HANDLER_FAILED",
          message: err instanceof Error ? err.message : String(err)
        });
      });
    });
  }
  handleSpaceState(payload) {
    this.spaceStateHandlers.forEach((handler) => handler(payload));
  }
  handleNotification(payload) {
    this.notificationHandlers.forEach((handler) => handler(payload));
  }
  handleError(payload) {
    this.errorHandlers.forEach((handler) => handler(payload));
  }
  async executeTurn(optionsOrSpaceUid, input, targetAgentId) {
    const options = typeof optionsOrSpaceUid === "string" ? {
      spaceUid: optionsOrSpaceUid,
      input: input ?? "",
      targetAgentId
    } : optionsOrSpaceUid;
    const payload = {
      spaceUid: options.spaceUid,
      input: options.input,
      targetAgentId: options.targetAgentId,
      targetAgentIds: options.targetAgentIds,
      replyToTurnId: options.replyToTurnId,
      conversationTopology: options.conversationTopology,
      mode: options.mode,
      effort: options.effort,
      accessMode: options.accessMode
    };
    const result = await this.sendAndWaitForResponse("execute_turn", payload);
    return result;
  }
  async ensureMainSpace(options = {}) {
    const spaceId = options.spaceId ?? "main-space";
    const resourceId = options.resourceId ?? "resource:main";
    const name = options.name ?? "Main Space";
    const goal = options.goal ?? "Default shared space for gateway startup and orchestrator coordination.";
    const createIfMissing = options.createIfMissing ?? true;
    const shouldSubscribe = options.subscribe ?? true;
    const spaces = await this.listSpaces({
      apiVersion: options.apiVersion,
      resourceId,
      limit: 200
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
        visibility: "shared",
        initialAgents: options.initialAgents
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
      subscribed
    };
  }
  async connectAndBootstrapMainSpace(options = {}) {
    let connected = false;
    if (!this.isConnected) {
      await this.connect();
      connected = true;
    }
    const result = await this.ensureMainSpace(options);
    return {
      connected,
      ...result
    };
  }
  async resumeFeedback(spaceUid, turnId, response, revision, approvalGrant) {
    const payload = {
      spaceUid,
      turnId,
      response,
      revision,
      approvalGrant
    };
    await this.sendAndWaitForResponse("resume_feedback", payload);
  }
  async subscribe(spaceUids) {
    const payload = {
      spaceUids
    };
    await this.sendAndWaitForResponse("subscribe", payload);
  }
  async invokeCapability(capability, method, params, targetProvider) {
    const payload = {
      capability,
      method,
      params,
      targetProvider
    };
    const result = await this.sendAndWaitForResponse("capability_invoke", payload);
    return result;
  }
  async createSpace(payload) {
    const result = await this.sendAndWaitForResponse("space.create", payload);
    return result.space;
  }
  async getSpace(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.get", payload);
    return result.space;
  }
  async listSpaces(payload = {}) {
    const result = await this.sendAndWaitForResponse("space.list", payload);
    return result.spaces;
  }
  async archiveSpace(payload) {
    return this.sendAndWaitForResponse("space.archive", payload);
  }
  async deleteSpace(payload) {
    return this.sendAndWaitForResponse("space.delete", payload);
  }
  async addAgent(payload) {
    return this.sendAndWaitForResponse("space.add_agent", payload);
  }
  async removeAgent(payload) {
    return this.sendAndWaitForResponse("space.remove_agent", payload);
  }
  async updateAgentAssignment(payload) {
    return this.sendAndWaitForResponse("space.update_agent_assignment", payload);
  }
  async setSpaceOrchestrator(payload) {
    const result = await this.sendAndWaitForResponse("space.set_orchestrator", payload);
    return result.space;
  }
  async listAgentAssignments(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.list_agent_assignments", payload);
    return result.assignments;
  }
  async getSpaceMcpEndpoint(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse("space.get_mcp_endpoint", payload);
  }
  async setSpaceMcpEndpoint(payload) {
    const result = await this.sendAndWaitForResponse("space.set_mcp_endpoint", payload);
    return result.endpoint;
  }
  async clearSpaceMcpEndpoint(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.clear_mcp_endpoint", payload);
    return result.cleared;
  }
  async discoverSpaceMcpAgents(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse("space.discover_mcp_agents", payload);
  }
  async approveSpaceMcpAgent(payload) {
    return this.sendAndWaitForResponse("space.approve_mcp_agent", payload);
  }
  async addSkillToSpace(payload) {
    return this.sendAndWaitForResponse("space.add_skill", payload);
  }
  async removeSkillFromSpace(payload) {
    return this.sendAndWaitForResponse("space.remove_skill", payload);
  }
  async listSpaceSkills(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.list_skills", payload);
    return result.skills;
  }
  async getSpaceWorkspace(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.get_workspace", payload);
    return result.workspace;
  }
  async setSpaceWorkspace(payload) {
    const result = await this.sendAndWaitForResponse("space.set_workspace", payload);
    return result.workspace;
  }
  async addSpaceResource(payload) {
    const result = await this.sendAndWaitForResponse("space.add_resource", payload);
    return result.resource;
  }
  async removeSpaceResource(payload) {
    const result = await this.sendAndWaitForResponse("space.remove_resource", payload);
    return result.removed;
  }
  async listSpaceResources(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.list_resources", payload);
    return result.resources;
  }
  async listOrchestrationJournal(payload) {
    return this.sendAndWaitForResponse("space.list_orchestration_journal", payload);
  }
  async getSpaceMemoryPolicy(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse("space.get_memory_policy", payload);
    return result.memoryPolicy;
  }
  async setSpaceMemoryPolicy(payload) {
    const result = await this.sendAndWaitForResponse("space.set_memory_policy", payload);
    return result.space;
  }
  async endIncognitoSession(spaceId, apiVersion) {
    const payload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse("space.end_incognito_session", payload);
  }
  async listActivityLog(payload) {
    const result = await this.sendAndWaitForResponse("space.list_activity_log", payload);
    return {
      ...result,
      entries: result.entries ?? [],
      total: result.total ?? (result.entries?.length ?? 0)
    };
  }
  async getTurnTrace(payload) {
    const result = await this.sendAndWaitForResponse("space.get_turn_trace", payload);
    const trace = "trace" in result ? result.trace : result;
    return this.normalizeSpaceTurnTrace(trace);
  }
  async listSpaceArtifacts(payload) {
    const result = await this.sendAndWaitForResponse("space.list_artifacts", payload);
    return {
      ...result,
      artifacts: result.artifacts ?? [],
      total: result.total ?? (result.artifacts?.length ?? 0)
    };
  }
  async getSpaceArtifact(payload) {
    const result = await this.sendAndWaitForResponse("space.get_artifact", payload);
    return result.artifact;
  }
  async getSpaceDebugArtifact(payload) {
    const result = await this.sendAndWaitForResponse("space.get_debug_artifact", payload);
    return result.artifact;
  }
  async listExperiences(payload) {
    const result = await this.sendAndWaitForResponse("space.list_experiences", payload);
    return {
      ...result,
      experiences: result.experiences ?? [],
      total: result.total ?? (result.experiences?.length ?? 0)
    };
  }
  async getExperience(payload) {
    const result = await this.sendAndWaitForResponse("space.get_experience", payload);
    return result.experience;
  }
  async listInsights(payload) {
    const result = await this.sendAndWaitForResponse("space.list_insights", payload);
    return {
      ...result,
      insights: result.insights ?? [],
      total: result.total ?? (result.insights?.length ?? 0)
    };
  }
  async getInsight(payload) {
    const result = await this.sendAndWaitForResponse("space.get_insight", payload);
    return result.insight;
  }
  async acceptInsight(payload) {
    const result = await this.sendAndWaitForResponse("space.accept_insight", payload);
    return result.insight;
  }
  async rejectInsight(payload) {
    const result = await this.sendAndWaitForResponse("space.reject_insight", payload);
    return result.insight;
  }
  async dismissInsight(payload) {
    const result = await this.sendAndWaitForResponse("space.dismiss_insight", payload);
    return result.insight;
  }
  async getSpaceAgentNotes(payload) {
    const result = await this.sendAndWaitForResponse("space.get_space_agent_notes", payload);
    return result.notes;
  }
  async updateSpaceAgentNotes(payload) {
    const result = await this.sendAndWaitForResponse("space.update_space_agent_notes", payload);
    return result.notes;
  }
  async getUserProfile(payload = {}) {
    const result = await this.sendAndWaitForResponse("space.get_user_profile", payload);
    return result.profile;
  }
  async updateUserProfile(payload) {
    const result = await this.sendAndWaitForResponse("space.update_user_profile", payload);
    return result.profile;
  }
  async listMemories(payload) {
    const result = await this.sendAndWaitForResponse("space.list_memories", payload);
    return {
      ...result,
      memories: result.memories ?? [],
      total: result.total ?? (result.memories?.length ?? 0)
    };
  }
  async deleteMemory(payload) {
    return this.sendAndWaitForResponse("space.delete_memory", payload);
  }
  async updateMemoryImportance(payload) {
    const result = await this.sendAndWaitForResponse("space.update_memory_importance", payload);
    return result.memory;
  }
  async listAgentDefinitions(payload = {}) {
    const result = await this.sendAndWaitForResponse("identity.list_agent_definitions", payload);
    return result.agentDefinitions;
  }
  async getAgentDefinition(agentDefinitionId, apiVersion) {
    const payload = { apiVersion, agentDefinitionId };
    const result = await this.sendAndWaitForResponse("identity.get_agent_definition", payload);
    return result.agentDefinition;
  }
  async createAgentDefinition(payload) {
    const result = await this.sendAndWaitForResponse("identity.create_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      created: result.created
    };
  }
  async updateAgentDefinition(payload) {
    const result = await this.sendAndWaitForResponse("identity.update_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      newRevision: result.newRevision
    };
  }
  async archiveAgentDefinition(payload) {
    const result = await this.sendAndWaitForResponse("identity.archive_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      archived: result.archived
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
      workspaceContext
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
  async previewTemplate(payload) {
    return this.sendAndWaitForResponse("space.preview_template", payload);
  }
  async createSpaceFromTemplate(payload) {
    return this.sendAndWaitForResponse("space.create_from_template", payload);
  }
  async saveSpaceTemplate(payload) {
    return this.sendAndWaitForResponse("space.save_template", payload);
  }
  async listSpaceTemplates(payload = {}) {
    const result = await this.sendAndWaitForResponse("space.list_templates", payload);
    return result.templates;
  }
  async getSpaceTemplate(templateId, apiVersion) {
    const payload = { apiVersion, templateId };
    const result = await this.sendAndWaitForResponse("space.get_template", payload);
    return result.template;
  }
  async previewSpaceTemplateRecord(payload) {
    const [template, result] = await Promise.all([
      this.getSpaceTemplate(payload.templateId, payload.apiVersion),
      this.previewTemplate({
        apiVersion: payload.apiVersion,
        templateId: payload.templateId,
        resourceId: payload.resourceId,
        name: payload.name,
        goal: payload.goal
      })
    ]);
    return {
      template,
      resolved: result.resolved,
      warnings: result.warnings
    };
  }
  async createSpaceFromManagedTemplate(payload) {
    const [template, result] = await Promise.all([
      this.getSpaceTemplate(payload.templateId, payload.apiVersion),
      this.createSpaceFromTemplate({
        apiVersion: payload.apiVersion,
        idempotencyKey: payload.idempotencyKey,
        templateId: payload.templateId,
        spaceId: payload.spaceId,
        resourceId: payload.resourceId,
        name: payload.name,
        goal: payload.goal,
        visibility: payload.visibility,
        workspaceRoot: payload.workspaceRoot
      })
    ]);
    return {
      template,
      space: result.space
    };
  }
  async saveManagedSpaceTemplate(payload) {
    const result = await this.saveSpaceTemplate({
      apiVersion: payload.apiVersion,
      templateId: payload.templateId,
      title: payload.name,
      description: payload.description,
      communicationMode: payload.communicationMode,
      conversationTopology: payload.conversationTopology,
      promptPackId: payload.promptPackId,
      baseAgents: payload.baseAgents,
      sourceSpaceId: payload.sourceSpaceId
    });
    const template = await this.getSpaceTemplate(result.template.templateId, payload.apiVersion);
    return {
      template,
      created: result.created
    };
  }
  async archiveSpaceTemplate(payload) {
    const result = await this.sendAndWaitForResponse("space.archive_template", payload);
    return {
      template: result.template,
      archived: result.archived
    };
  }
  async registerDevice(payload) {
    return this.sendAndWaitForResponse("auth.register_device", payload);
  }
  async rotateDeviceKey(payload) {
    return this.sendAndWaitForResponse("auth.rotate_device_key", payload);
  }
  async revokeDevice(payload) {
    return this.sendAndWaitForResponse("auth.revoke_device", payload);
  }
  async listDevices(payload = {}) {
    const result = await this.sendAndWaitForResponse("auth.list_devices", payload);
    return result.devices;
  }
  async issueHttpPrincipalToken(payload = {}) {
    return this.sendAndWaitForResponse("auth.issue_http_principal_token", payload);
  }
  async getUsageSnapshot(apiVersion) {
    const result = await this.sendAndWaitForResponse("usage.get_snapshot", { apiVersion });
    return result.snapshot;
  }
  async getLocalUsageTelemetry(apiVersion, providerId, providerIds) {
    const payload = {
      apiVersion,
      providerId,
      providerIds
    };
    const result = await this.sendAndWaitForResponse("gateway.get_local_usage_telemetry", payload);
    return result.telemetry;
  }
  async getMemoryDefaults(apiVersion) {
    const payload = { apiVersion };
    const result = await this.sendAndWaitForResponse("gateway.get_memory_defaults", payload);
    return result.defaults;
  }
  async setMemoryDefaults(defaultExperienceCapture, defaultSpacePrivacyMode = "STANDARD", apiVersion) {
    const payload = {
      apiVersion,
      defaultExperienceCapture,
      defaultSpacePrivacyMode
    };
    const result = await this.sendAndWaitForResponse("gateway.set_memory_defaults", payload);
    return result.defaults;
  }
  async listTools(apiVersion) {
    const payload = { apiVersion };
    const result = await this.sendAndWaitForResponse("tool.list", payload);
    return result.tools;
  }
  async getTool(toolId, apiVersion) {
    const payload = { apiVersion, toolId };
    const result = await this.sendAndWaitForResponse("tool.get", payload);
    return result.tool;
  }
  async scaffoldTool(payload) {
    const result = await this.sendAndWaitForResponse("tool.scaffold", payload);
    return {
      manifest: result.manifest,
      readme: result.readme
    };
  }
  async registerTool(payload) {
    const result = await this.sendAndWaitForResponse("tool.register", payload);
    return result.tool;
  }
  async removeTool(toolId, apiVersion) {
    const payload = { apiVersion, toolId };
    const result = await this.sendAndWaitForResponse("tool.remove", payload);
    return result.removed;
  }
  async listToolApprovalGrants(payload = {}) {
    const result = await this.sendAndWaitForResponse("tool.list_grants", payload);
    return result.grants;
  }
  async revokeToolApprovalGrant(payload) {
    return this.sendAndWaitForResponse("tool.revoke_grant", payload);
  }
  async getExternalConnectivity(apiVersion) {
    return this.sendAndWaitForResponse("gateway.get_external_connectivity", { apiVersion });
  }
  async setExternalConnectivity(mode, apiVersion) {
    return this.sendAndWaitForResponse("gateway.set_external_connectivity", {
      apiVersion,
      mode
    });
  }
  async getGatewayPolicy(apiVersion) {
    const result = await this.sendAndWaitForResponse("gateway.get_policy", { apiVersion });
    return result.policy;
  }
  async updateGatewayPolicy(payload) {
    const result = await this.sendAndWaitForResponse("gateway.update_policy", payload);
    return result.policy;
  }
  async factoryResetGateway(payload) {
    return this.sendAndWaitForResponse("gateway.factory_reset", payload, this.minimumRequestTimeout(180000));
  }
  async resetSpace(payload) {
    return this.sendAndWaitForResponse("space.reset", payload, this.minimumRequestTimeout(180000));
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
  async sendOrchestratorCommand(payload) {
    const result = await this.sendAndWaitForResponse("orchestrator.command", payload);
    return result.command;
  }
  async getOrchestratorCommand(commandId, apiVersion) {
    const result = await this.sendAndWaitForResponse("orchestrator.get_command", { apiVersion, commandId });
    return result.command;
  }
  async createSchedulerJob(payload) {
    const result = await this.sendAndWaitForResponse("scheduler.create_job", payload);
    return result.job;
  }
  async getSchedulerJob(jobId, apiVersion) {
    const payload = { apiVersion, jobId };
    const result = await this.sendAndWaitForResponse("scheduler.get_job", payload);
    return result.job;
  }
  async listSchedulerJobs(payload = {}) {
    const result = await this.sendAndWaitForResponse("scheduler.list_jobs", payload);
    return result.jobs;
  }
  async listSchedulerEvalDefinitions(payload = {}) {
    const result = await this.sendAndWaitForResponse("scheduler.list_eval_definitions", payload);
    return result.definitions;
  }
  async updateSchedulerJob(payload) {
    const result = await this.sendAndWaitForResponse("scheduler.update_job", payload);
    return result.job;
  }
  async deleteSchedulerJob(payload) {
    return this.sendAndWaitForResponse("scheduler.delete_job", payload);
  }
  async linkSchedulerJobSpace(payload) {
    const result = await this.sendAndWaitForResponse("scheduler.link_space", payload);
    return result.job;
  }
  async unlinkSchedulerJobSpace(payload) {
    const result = await this.sendAndWaitForResponse("scheduler.unlink_space", payload);
    return result.job;
  }
  async listSchedulerJobRuns(payload) {
    return this.sendAndWaitForResponse("scheduler.list_runs", payload);
  }
  async runSchedulerJobNow(payload) {
    return this.sendAndWaitForResponse("scheduler.run_now", payload);
  }
  async listWorkbenchQueue(payload = {}) {
    const result = await this.sendAndWaitForResponse("workbench.list_queue", payload);
    return result.items;
  }
  async getWorkbenchQueueItem(payload) {
    const result = await this.sendAndWaitForResponse("workbench.get_queue_item", payload);
    return result.item;
  }
  async createWorkbenchBatch(payload) {
    const result = await this.sendAndWaitForResponse("workbench.create_batch", payload);
    return result.batch;
  }
  async listWorkbenchBatches(payload = {}) {
    const result = await this.sendAndWaitForResponse("workbench.list_batches", payload);
    return result.batches;
  }
  async updateWorkbenchBatch(payload) {
    const result = await this.sendAndWaitForResponse("workbench.update_batch", payload);
    return result.batch;
  }
  async startWorkbenchRun(payload) {
    const result = await this.sendAndWaitForResponse("workbench.start_run", payload);
    return result.run;
  }
  async retryWorkbenchRun(payload) {
    const result = await this.sendAndWaitForResponse("workbench.retry_run", payload);
    return result.run;
  }
  async cancelWorkbenchRun(payload) {
    const result = await this.sendAndWaitForResponse("workbench.cancel_run", payload);
    return result.run;
  }
  async listWorkbenchRuns(payload = {}) {
    const result = await this.sendAndWaitForResponse("workbench.list_runs", payload);
    return result.runs;
  }
  async getWorkbenchRun(payload) {
    const result = await this.sendAndWaitForResponse("workbench.get_run", payload);
    return result.run;
  }
  async approveWorkbenchStage(payload) {
    const result = await this.sendAndWaitForResponse("workbench.approve_stage", payload);
    return result.run;
  }
  async rejectWorkbenchStage(payload) {
    const result = await this.sendAndWaitForResponse("workbench.reject_stage", payload);
    return result.run;
  }
  async setWorkbenchMode(payload) {
    return this.sendAndWaitForResponse("workbench.set_mode", payload);
  }
  async listWorkbenchArtifacts(payload) {
    const result = await this.sendAndWaitForResponse("workbench.list_artifacts", payload);
    return result.artifacts;
  }
  async getWorkbenchPolicy(payload = {}) {
    const result = await this.sendAndWaitForResponse("workbench.get_policy", payload);
    return result.policy;
  }
  async updateWorkbenchPolicy(payload) {
    const result = await this.sendAndWaitForResponse("workbench.update_policy", payload);
    return result.policy;
  }
  async linkSpaces(payload) {
    const result = await this.sendAndWaitForResponse("space.link", payload);
    return result.link;
  }
  async unlinkSpaces(payload) {
    const result = await this.sendAndWaitForResponse("space.unlink", payload);
    return result.removed;
  }
  async shareSpaceContext(payload) {
    const result = await this.sendAndWaitForResponse("space.share_context", payload);
    return result.transfer;
  }
  async pullSharedContext(payload) {
    return this.sendAndWaitForResponse("space.pull_shared_context", payload);
  }
  async createSpaceShareInvite(payload) {
    const result = await this.sendAndWaitForResponse("space.share_create_invite", payload);
    return result.invite;
  }
  async joinSpaceShareInvite(payload) {
    const result = await this.sendAndWaitForResponse("space.share_join", payload);
    return result.participant;
  }
  async revokeSpaceShareAccess(payload) {
    return this.sendAndWaitForResponse("space.share_revoke", payload);
  }
  async listSpaceParticipants(payload) {
    const result = await this.sendAndWaitForResponse("space.share_list_participants", payload);
    return result.participants;
  }
  async announceSyncPeer(payload) {
    return this.sendAndWaitForResponse("sync.announce", payload);
  }
  async querySyncResources(payload) {
    return this.sendAndWaitForResponse("sync.query_resources", payload);
  }
  async pullSyncResources(payload) {
    return this.sendAndWaitForResponse("sync.pull_resources", payload);
  }
  async startSpeechSession(payload) {
    const result = await this.sendAndWaitForResponse("speech.start", payload);
    return result.event;
  }
  async sendSpeechAudioChunk(payload) {
    const result = await this.sendAndWaitForResponse("speech.audio_chunk", payload);
    return result.events;
  }
  async controlSpeechSession(payload) {
    const result = await this.sendAndWaitForResponse("speech.control", payload);
    return result.event;
  }
  async registerCapabilities(providers) {
    const payload = { providers };
    await this.sendAndWaitForResponse("capabilities.register", payload);
  }
  async deregisterCapabilities(providerIds) {
    const payload = { providerIds };
    await this.sendAndWaitForResponse("capabilities.deregister", payload);
  }
  async sendCapabilityResult(payload) {
    await this.send("capability.result", payload);
  }
  async sendCapabilityError(payload) {
    await this.send("capability.error", payload);
  }
  async sendAgentMessage(spaceId, fromAgentId, toAgentId, content, spaceUid) {
    const payload = {
      spaceId,
      spaceUid: spaceUid ?? spaceId,
      fromAgentId,
      toAgentId,
      content
    };
    await this.send("agent_message", payload);
  }
  async pokeAgent(spaceId, targetAgentId, reason, unblockedByTurnId, spaceUid) {
    const payload = {
      spaceId,
      spaceUid: spaceUid ?? spaceId,
      targetAgentId,
      reason,
      unblockedByTurnId
    };
    await this.send("agent_poke", payload);
  }
  async declareTaskDependency(spaceId, blockedTurnId, dependsOnTurnId, spaceUid) {
    const payload = {
      spaceId,
      spaceUid: spaceUid ?? spaceId,
      blockedTurnId,
      dependsOnTurnId
    };
    await this.send("task_dependency", payload);
  }
  async ping() {
    await this.sendAndWaitForResponse("ping", {});
  }
  onTurnEvent(handler) {
    this.turnEventHandlers.push(handler);
    return () => {
      this.turnEventHandlers = this.turnEventHandlers.filter((h) => h !== handler);
    };
  }
  onTurnStream(handler) {
    this.turnStreamHandlers.push(handler);
    return () => {
      this.turnStreamHandlers = this.turnStreamHandlers.filter((h) => h !== handler);
    };
  }
  onSpaceState(handler) {
    this.spaceStateHandlers.push(handler);
    return () => {
      this.spaceStateHandlers = this.spaceStateHandlers.filter((h) => h !== handler);
    };
  }
  onSpaceAgentUpdated(handler) {
    this.spaceAgentUpdatedHandlers.push(handler);
    return () => {
      this.spaceAgentUpdatedHandlers = this.spaceAgentUpdatedHandlers.filter((h) => h !== handler);
    };
  }
  onNotification(handler) {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter((h) => h !== handler);
    };
  }
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }
  onAgentMessage(handler) {
    this.agentMessageHandlers.push(handler);
    return () => {
      this.agentMessageHandlers = this.agentMessageHandlers.filter((h) => h !== handler);
    };
  }
  onAgentPoke(handler) {
    this.agentPokeHandlers.push(handler);
    return () => {
      this.agentPokeHandlers = this.agentPokeHandlers.filter((h) => h !== handler);
    };
  }
  onAgentIdle(handler) {
    this.agentIdleHandlers.push(handler);
    return () => {
      this.agentIdleHandlers = this.agentIdleHandlers.filter((h) => h !== handler);
    };
  }
  onTaskDependency(handler) {
    this.taskDependencyHandlers.push(handler);
    return () => {
      this.taskDependencyHandlers = this.taskDependencyHandlers.filter((h) => h !== handler);
    };
  }
  onTaskDependencyResolved(handler) {
    this.taskDependencyResolvedHandlers.push(handler);
    return () => {
      this.taskDependencyResolvedHandlers = this.taskDependencyResolvedHandlers.filter((h) => h !== handler);
    };
  }
  onOrchestratorEvent(handler) {
    this.orchestratorEventHandlers.push(handler);
    return () => {
      this.orchestratorEventHandlers = this.orchestratorEventHandlers.filter((h) => h !== handler);
    };
  }
  onSpeechEvent(handler) {
    this.speechEventHandlers.push(handler);
    return () => {
      this.speechEventHandlers = this.speechEventHandlers.filter((h) => h !== handler);
    };
  }
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
var gateway_client_default = GatewayClient;
export {
  signChallenge,
  generateAuthKeyPair,
  gateway_client_default as default,
  GatewayClient
};
