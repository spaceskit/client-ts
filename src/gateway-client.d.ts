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
 * An Ed25519 key pair for gateway authentication.
 * Generate with `generateAuthKeyPair()`, or provide your own CryptoKeyPair.
 */
export interface AuthKeyPair {
    /** Ed25519 private key (CryptoKey) */
    privateKey: CryptoKey;
    /** Ed25519 public key (CryptoKey) */
    publicKey: CryptoKey;
    /** Base64-encoded raw public key bytes (for sending to server) */
    publicKeyBase64: string;
}
/**
 * Generate a new Ed25519 key pair for gateway authentication.
 * Uses Web Crypto API — works in Bun, Node 20+, and browsers.
 */
export declare function generateAuthKeyPair(): Promise<AuthKeyPair>;
/**
 * Sign a base64-encoded challenge with an Ed25519 private key.
 * Returns the signature as a base64 string.
 */
export declare function signChallenge(challengeBase64: string, privateKey: CryptoKey): Promise<string>;
/**
 * Message envelope for all Spaceskit protocol messages
 */
export interface GatewayMessage<T = unknown> {
    type: string;
    id: string;
    replyTo?: string;
    ts: string;
    payload: T;
}
/**
 * Client-to-Gateway: Authenticate with the gateway
 */
export interface AuthenticatePayload {
    publicKey: string;
    signature: string;
    clientType: string;
    clientVersion: string;
    deviceId?: string;
    devicePublicKey?: string;
    deviceProofSignature?: string;
}
/**
 * Client-to-Gateway: Execute a turn in a space
 */
export interface ExecuteTurnPayload {
    spaceUid: string;
    input: string;
    targetAgentId?: string;
    targetAgentIds?: string[];
    replyToTurnId?: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    mode?: 'ask' | 'plan' | 'execute';
    effort?: 'low' | 'medium' | 'high';
    accessMode?: 'default' | 'full_access';
}
export type TurnMode = 'ask' | 'plan' | 'execute';
export type TurnEffort = 'low' | 'medium' | 'high';
export type TurnAccessMode = 'default' | 'full_access';
export interface ExecuteTurnOptions {
    spaceUid: string;
    input: string;
    targetAgentId?: string;
    targetAgentIds?: string[];
    replyToTurnId?: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    mode?: TurnMode;
    effort?: TurnEffort;
    accessMode?: TurnAccessMode;
}
/**
 * Client-to-Gateway: Resume a turn with feedback
 */
export interface ResumeFeedbackPayload {
    spaceUid: string;
    turnId: string;
    response: 'approve' | 'reject' | 'revise' | 'defer';
    revision?: string;
}
/**
 * Client-to-Gateway: Subscribe to space events
 */
export interface SubscribePayload {
    spaceUids: string[];
}
/**
 * Client-to-Gateway: Invoke a capability
 */
export interface CapabilityInvokePayload {
    capability: string;
    method: string;
    params: Record<string, unknown>;
    targetProvider?: string;
}
/**
 * Space Admin: create a new space.
 */
export interface SpaceCreatePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId?: string;
    workspaceRoot?: string;
    resourceId: string;
    spaceType?: string;
    name: string;
    goal?: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    turnModel?: string;
    templateId?: string;
    templateRevision?: number;
    capabilities?: string[];
    capabilityOverrides?: Record<string, string>;
    visibility?: 'shared' | 'private';
    turnModelConfig?: Record<string, unknown>;
    maxTurns?: number;
    thinkingCapturePolicy?: ThinkingCapturePolicy;
    moderatorProfileId?: string;
    initialAgents?: SpaceCreateInitialAgentPayload[];
}
/**
 * Space Admin: fetch one space by ID.
 */
export interface SpaceGetPayload {
    apiVersion?: string;
    spaceId: string;
}
/**
 * Space Admin: list spaces.
 */
export interface SpaceListPayload {
    apiVersion?: string;
    statuses?: string[];
    resourceId?: string;
    limit?: number;
}
export interface SpaceArchivePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
}
export interface SpaceDeletePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
}
/**
 * Space Admin: add agent assignment.
 */
export interface SpaceAddAgentPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    agentId: string;
    agentDefinitionId?: string;
    profileId?: string;
    securityScope?: Record<string, unknown>;
    spawnContext?: string;
    contextOverrides?: Record<string, unknown>;
    role?: SpaceAssignmentRole;
    turnOrder?: number;
    isPrimary?: boolean;
}
/**
 * Space Admin: remove agent assignment.
 */
export interface SpaceRemoveAgentPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    agentId: string;
}
/**
 * Space Admin: update assignment.
 */
export interface SpaceUpdateAgentAssignmentPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    agentId: string;
    agentDefinitionId?: string;
    profileId?: string;
    securityScope?: Record<string, unknown> | null;
    spawnContext?: string | null;
    contextOverrides?: Record<string, unknown> | null;
    role?: SpaceAssignmentRole;
    turnOrder?: number;
    isPrimary?: boolean;
}
/**
 * Space Admin: set orchestrator profile.
 */
export interface SpaceSetOrchestratorPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    agentDefinitionId?: string;
    profileId?: string;
}
/**
 * Space Admin: list assignments for one space.
 */
export interface SpaceListAgentAssignmentsPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceGetMcpEndpointPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceSetMcpEndpointPayload {
    apiVersion?: string;
    spaceId: string;
    transport: 'sse' | 'stdio';
    endpoint: string;
    args?: string[];
    secretRef?: string;
    enabled?: boolean;
}
export interface SpaceClearMcpEndpointPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceDiscoverMcpAgentsPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceApproveMcpAgentPayload {
    apiVersion?: string;
    spaceId: string;
    remoteAgentId: string;
    displayName?: string;
    agentId?: string;
    agentDefinitionId?: string;
    profileId?: string;
}
/**
 * Space Admin: add one skill to a space.
 */
export interface SpaceAddSkillPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    skillId: string;
}
/**
 * Space Admin: remove one skill from a space.
 */
export interface SpaceRemoveSkillPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    skillId: string;
}
/**
 * Space Admin: list all skills assigned to a space.
 */
export interface SpaceListSkillsPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceWorkspace {
    spaceId: string;
    spaceUid: string;
    mode: "managed" | "folder_bound";
    explicitWorkspaceRoot?: string;
    effectiveWorkspaceRoot: string;
    metaPath: string;
    logsPath: string;
    workPath: string;
    sharedContextPath: string;
    scratchpadsPath: string;
    layoutVersion: number;
    gitRepoDetected: boolean;
    metadataStatus: "unknown" | "ready" | "conflict";
    updatedAt: string;
}
export interface SpaceGetWorkspacePayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceSetWorkspacePayload {
    apiVersion?: string;
    spaceId: string;
    workspaceRoot?: string | null;
}
export interface SpaceGetWorkspaceResponsePayload {
    workspace: SpaceWorkspace;
}
export interface SpaceSetWorkspaceResponsePayload {
    workspace: SpaceWorkspace;
}
export interface SpaceCreateInitialAgentPayload {
    agentId: string;
    agentDefinitionId?: string;
    profileId?: string;
    securityScope?: Record<string, unknown>;
    spawnContext?: string;
    contextOverrides?: Record<string, unknown>;
    role?: SpaceAssignmentRole;
    turnOrder?: number;
    isPrimary?: boolean;
}
export type SpaceAssignmentRole = 'participant' | 'global_coordinator' | 'space_moderator';
export interface SpaceAgentAssignment {
    spaceId: string;
    agentId: string;
    agentDefinitionId?: string;
    profileId: string;
    securityScope?: Record<string, unknown>;
    spawnContext?: string;
    contextOverrides?: Record<string, unknown>;
    role: SpaceAssignmentRole;
    turnOrder: number;
    isPrimary: boolean;
    assignedAt: string;
    runtimeKind?: 'local' | 'external_mcp';
    endpointId?: string;
    remoteAgentId?: string;
    displayName?: string;
}
export interface SpaceSummary {
    id: string;
    spaceUid: string;
    workspace?: SpaceWorkspace;
    status?: string;
    resourceId: string;
    name: string;
    goal?: string;
    orchestratorAgentDefinitionId?: string;
    orchestratorProfileId?: string;
    templateId?: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    turnModel: string;
    turnModelConfig?: Record<string, unknown>;
    skillIds?: string[];
    agents: SpaceAgentAssignment[];
    capabilities: string[];
    capabilityOverrides: Record<string, string>;
    maxTurns?: number;
    visibility: 'shared' | 'private';
    moderatorProfileId?: string;
    archivedAt?: string;
    deletedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpaceCreateResponsePayload {
    space: SpaceSummary;
}
export interface SpaceGetResponsePayload {
    space: SpaceSummary;
}
export interface SpaceListResponsePayload {
    spaces: SpaceSummary[];
}
export interface SpaceArchiveResponsePayload {
    space: SpaceSummary;
    archived: boolean;
}
export interface SpaceDeleteResponsePayload {
    spaceId: string;
    spaceUid: string;
    deleted: boolean;
    space?: SpaceSummary | null;
}
export interface SpaceAddAgentResponsePayload {
    assignment: SpaceAgentAssignment;
    space?: SpaceSummary | null;
}
export interface SpaceRemoveAgentResponsePayload {
    removed: boolean;
    spaceId: string;
    spaceUid: string;
    agentId: string;
    space?: SpaceSummary | null;
}
export interface SpaceUpdateAgentAssignmentResponsePayload {
    assignment: SpaceAgentAssignment;
    space?: SpaceSummary | null;
}
export interface SpaceListAgentAssignmentsResponsePayload {
    assignments: SpaceAgentAssignment[];
}
export interface SpaceMcpEndpoint {
    endpointId: string;
    spaceId: string;
    transport: 'sse' | 'stdio';
    endpoint: string;
    args: string[];
    secretRef?: string;
    enabled: boolean;
    healthStatus: 'unknown' | 'ok' | 'degraded' | 'error';
    healthMessage?: string;
    lastConnectedAt?: string;
    lastErrorAt?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpaceGetMcpEndpointResponsePayload {
    spaceId: string;
    endpoint?: SpaceMcpEndpoint;
    fallbackEnabled: boolean;
}
export interface SpaceSetMcpEndpointResponsePayload {
    endpoint: SpaceMcpEndpoint;
}
export interface SpaceClearMcpEndpointResponsePayload {
    spaceId: string;
    cleared: boolean;
}
export interface McpDiscoveredAgent {
    remoteAgentId: string;
    displayName: string;
    description?: string;
    metadata?: Record<string, unknown>;
}
export interface SpaceDiscoverMcpAgentsResponsePayload {
    spaceId: string;
    endpointId?: string;
    agents: McpDiscoveredAgent[];
}
export interface ExternalAgentRuntimeBinding {
    runtimeKind: 'external_mcp';
    spaceId: string;
    agentId: string;
    endpointId: string;
    remoteAgentId: string;
    displayName?: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpaceApproveMcpAgentResponsePayload {
    spaceId: string;
    assignment: SpaceAgentAssignment;
    binding: ExternalAgentRuntimeBinding;
}
export interface SpaceAddSkillResponsePayload {
    spaceId: string;
    spaceUid: string;
    skillId: string;
    skills: string[];
    space?: SpaceSummary | null;
}
export interface SpaceRemoveSkillResponsePayload {
    removed: boolean;
    spaceId: string;
    spaceUid: string;
    skillId: string;
    skills: string[];
    space?: SpaceSummary | null;
}
export interface SpaceListSkillsResponsePayload {
    spaceId: string;
    spaceUid: string;
    skills: string[];
}
export interface SpaceResource {
    resourceId: string;
    spaceId: string;
    spaceUid: string;
    uri: string;
    type: 'folder' | 'url';
    label?: string;
    addedAt: string;
}
export interface SpaceAddResourcePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    resourceId?: string;
    spaceId: string;
    uri: string;
    type: 'folder' | 'url';
    label?: string;
}
export interface SpaceRemoveResourcePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    spaceId: string;
    resourceId: string;
}
export interface SpaceListResourcesPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceAddResourceResponsePayload {
    resource: SpaceResource;
}
export interface SpaceRemoveResourceResponsePayload {
    removed: boolean;
    spaceId: string;
    spaceUid: string;
    resourceId: string;
}
export interface SpaceListResourcesResponsePayload {
    spaceId: string;
    spaceUid: string;
    resources: SpaceResource[];
}
export interface SpaceListOrchestrationJournalPayload {
    apiVersion?: string;
    spaceId?: string;
    spaceUid?: string;
    turnId?: string;
    limit?: number;
    offset?: number;
}
export interface OrchestrationJournalEntry {
    eventId: string;
    spaceId: string;
    spaceUid: string;
    turnId?: string;
    seq: number;
    eventType: string;
    actorId: string;
    lineageId?: string;
    hopCount: number;
    payload: Record<string, unknown>;
    createdAt: string;
}
export interface SpaceListOrchestrationJournalResponsePayload {
    spaceId: string;
    spaceUid: string;
    entries: OrchestrationJournalEntry[];
    total: number;
    nextOffset?: number;
}
export interface ProfileModelConfig {
    preferredModels: string[];
    fallbackModels?: string[];
    constraints?: Record<string, unknown>;
}
export interface ProfileSummary {
    profileId: string;
    name: string;
    description: string;
    personalityPrompt: string;
    defaultSkillIds: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    canModerate: boolean;
    isDefault: boolean;
    status: 'active' | 'archived';
    activeRevision: number;
    source: string;
    createdAt: string;
    updatedAt: string;
}
export interface ProfileCreatePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    profileId?: string;
    name: string;
    description?: string;
    personalityPrompt?: string;
    defaultSkillIds?: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    canModerate?: boolean;
    isDefault?: boolean;
}
export interface ProfileCreateResponsePayload {
    profile: ProfileSummary;
    created: boolean;
}
export interface ProfileGetPayload {
    apiVersion?: string;
    profileId: string;
}
export interface ProfileGetResponsePayload {
    profile: ProfileSummary;
}
export interface ProfileListPayload {
    apiVersion?: string;
    includeArchived?: boolean;
}
export interface ProfileListResponsePayload {
    profiles: ProfileSummary[];
}
export interface ProfileUpdatePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    profileId: string;
    name?: string;
    description?: string;
    personalityPrompt?: string;
    defaultSkillIds?: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    canModerate?: boolean;
    isDefault?: boolean;
}
export interface ProfileUpdateResponsePayload {
    profile: ProfileSummary;
    newRevision: number;
}
export interface ProfileArchivePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    profileId: string;
}
export interface ProfileArchiveResponsePayload {
    profile: ProfileSummary;
    archived: boolean;
}
export type ManagedRecordStatus = 'active' | 'archived';
export interface AgentDefinitionSummary {
    agentDefinitionId: string;
    personaId?: string;
    name: string;
    description: string;
    instructions: string;
    defaultSkillIds: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    isDefault: boolean;
    status: ManagedRecordStatus;
    activeRevision: number;
    source: string;
    createdAt: string;
    updatedAt: string;
}
export interface AgentDefinitionCreateResult {
    agentDefinition: AgentDefinitionSummary;
    created: boolean;
}
export interface AgentDefinitionUpdateResult {
    agentDefinition: AgentDefinitionSummary;
    newRevision: number;
}
export interface AgentDefinitionArchiveResult {
    agentDefinition: AgentDefinitionSummary;
    archived: boolean;
}
export interface PersonaSummary {
    personaId: string;
    name: string;
    description: string;
    tone?: string;
    style?: string;
    emotionalLayer?: string;
    constraints: string[];
    instructions: string;
    isDefault: boolean;
    status: ManagedRecordStatus;
    activeRevision: number;
    source: string;
    createdAt: string;
    updatedAt: string;
}
export interface PersonaCreateResult {
    persona: PersonaSummary;
    created: boolean;
}
export interface PersonaUpdateResult {
    persona: PersonaSummary;
    newRevision: number;
}
export interface PersonaArchiveResult {
    persona: PersonaSummary;
    archived: boolean;
}
export type CompiledInstructionSectionKey = 'system_scaffold' | 'agent_definition' | 'persona' | 'skills' | 'policy_appendices' | 'workspace_context';
export interface CompiledInstructionSection {
    key: CompiledInstructionSectionKey;
    title: string;
    content: string;
}
export interface CompiledInstructionsPreview {
    agentDefinitionId: string;
    personaId?: string;
    sections: CompiledInstructionSection[];
    compiledText: string;
    generatedAt: string;
}
export type RuntimeSystemPromptSectionKey = "agent_definition" | "persona" | "active_skill_context" | "workspace_context" | "conversation_prompt" | "assignment_context";
export interface RuntimeSystemPromptSection {
    key: RuntimeSystemPromptSectionKey;
    title: string;
    content: string;
}
export interface RuntimeSystemPromptPreview {
    spaceId: string;
    agentId?: string;
    profileId: string;
    personaId?: string;
    targetKind: "agent_assignment" | "space_profile";
    conversationTopology?: "direct" | "shared_team_chat" | "broadcast_team";
    promptPackId?: string;
    sections: RuntimeSystemPromptSection[];
    compiledText: string;
    generatedAt: string;
}
export interface IdentityListAgentDefinitionsPayload {
    apiVersion?: string;
    includeArchived?: boolean;
}
export interface IdentityListAgentDefinitionsResponsePayload {
    agentDefinitions: AgentDefinitionSummary[];
}
export interface IdentityGetAgentDefinitionPayload {
    apiVersion?: string;
    agentDefinitionId: string;
}
export interface IdentityGetAgentDefinitionResponsePayload {
    agentDefinition: AgentDefinitionSummary;
}
export interface IdentityCreateAgentDefinitionPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    agentDefinitionId?: string;
    personaId?: string;
    name: string;
    description?: string;
    instructions?: string;
    defaultSkillIds?: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    isDefault?: boolean;
}
export interface IdentityCreateAgentDefinitionResponsePayload {
    agentDefinition: AgentDefinitionSummary;
    created: boolean;
}
export interface IdentityUpdateAgentDefinitionPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    agentDefinitionId: string;
    personaId?: string;
    name?: string;
    description?: string;
    instructions?: string;
    defaultSkillIds?: string[];
    providerHint?: string;
    modelHint?: string;
    modelConfig?: ProfileModelConfig;
    isDefault?: boolean;
}
export interface IdentityUpdateAgentDefinitionResponsePayload {
    agentDefinition: AgentDefinitionSummary;
    newRevision: number;
}
export interface IdentityArchiveAgentDefinitionPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    agentDefinitionId: string;
}
export interface IdentityArchiveAgentDefinitionResponsePayload {
    agentDefinition: AgentDefinitionSummary;
    archived: boolean;
}
export interface IdentityListPersonasPayload {
    apiVersion?: string;
    includeArchived?: boolean;
}
export interface IdentityListPersonasResponsePayload {
    personas: PersonaSummary[];
}
export interface IdentityGetPersonaPayload {
    apiVersion?: string;
    personaId: string;
}
export interface IdentityGetPersonaResponsePayload {
    persona: PersonaSummary;
}
export interface IdentityCreatePersonaPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    personaId?: string;
    name: string;
    description?: string;
    tone?: string;
    style?: string;
    emotionalLayer?: string;
    constraints?: string[];
    instructions?: string;
    isDefault?: boolean;
}
export interface IdentityCreatePersonaResponsePayload {
    persona: PersonaSummary;
    created: boolean;
}
export interface IdentityUpdatePersonaPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    personaId: string;
    name?: string;
    description?: string;
    tone?: string;
    style?: string;
    emotionalLayer?: string;
    constraints?: string[];
    instructions?: string;
    isDefault?: boolean;
}
export interface IdentityUpdatePersonaResponsePayload {
    persona: PersonaSummary;
    newRevision: number;
}
export interface IdentityArchivePersonaPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    personaId: string;
}
export interface IdentityArchivePersonaResponsePayload {
    persona: PersonaSummary;
    archived: boolean;
}
export interface IdentityPreviewCompiledInstructionsPayload {
    apiVersion?: string;
    agentDefinitionId: string;
    workspaceContext?: string;
}
export interface IdentityPreviewCompiledInstructionsResponsePayload {
    preview: CompiledInstructionsPreview;
}
export interface IdentityPreviewRuntimeSystemPromptPayload {
    apiVersion?: string;
    spaceId: string;
    agentId?: string;
    profileId?: string;
}
export interface IdentityPreviewRuntimeSystemPromptResponsePayload {
    preview: RuntimeSystemPromptPreview;
}
export interface IdentityPreviewSystemPromptMatrixPayload {
    apiVersion?: string;
    agentDefinitionId: string;
    spaceId?: string;
    agentId?: string;
}
export type PromptBudgetClass = 'full' | 'compact' | 'minimal' | 'cli';
export interface SystemPromptVariant {
    budgetClass: PromptBudgetClass;
    label: string;
    tokenEstimate: number;
    sections: CompiledInstructionSection[];
    compiledText: string;
}
export interface SystemPromptMatrix {
    agentDefinitionId: string;
    personaId?: string;
    generatedAt: string;
    variants: SystemPromptVariant[];
}
export interface IdentityPreviewSystemPromptMatrixResponsePayload {
    matrix: SystemPromptMatrix;
}
export type CommunicationMode = 'async_notes' | 'chat_first' | 'structured_handoff';
export interface TemplateAgentDefinition {
    agentId: string;
    agentDefinitionId?: string;
    profileId?: string;
    role?: SpaceAssignmentRole;
    turnOrder?: number;
    isPrimary?: boolean;
}
export interface SpaceTemplateSummary {
    templateId: string;
    title: string;
    communicationMode: CommunicationMode;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    agentPresetIds: string[];
    createdBy: string;
    updatedAt: string;
    category?: string;
    complexityTier?: string;
    icon?: string;
    featured?: boolean;
    sortOrder?: number;
    description?: string;
    agentCount?: number;
}
export interface SpacePreviewTemplatePayload {
    apiVersion?: string;
    templateId: string;
    resourceId?: string;
    name?: string;
    goal?: string;
}
export interface SpacePreviewTemplateResult {
    template: SpaceTemplateSummary;
    resolved: {
        templateId: string;
        templateRevision: number;
        name: string;
        goal?: string;
        resourceId: string;
        communicationMode: CommunicationMode;
        turnModel: string;
        initialAgents: TemplateAgentDefinition[];
    };
    warnings: string[];
}
export interface SpaceCreateFromTemplatePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    templateId: string;
    spaceId?: string;
    resourceId: string;
    name?: string;
    goal?: string;
    visibility?: 'shared' | 'private';
    workspaceRoot?: string;
}
export interface SpaceCreateFromTemplateResult {
    template: SpaceTemplateSummary;
    space: SpaceSummary;
}
export interface SpaceSaveTemplatePayload {
    apiVersion?: string;
    templateId?: string;
    title: string;
    description?: string;
    communicationMode?: CommunicationMode;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    baseAgents?: TemplateAgentDefinition[];
    agentPresetIds?: string[];
    sourceSpaceId?: string;
    tags?: string[];
}
export interface SpaceSaveTemplateResult {
    template: SpaceTemplateSummary;
    created: boolean;
}
export interface SpaceTemplateListPayload {
    apiVersion?: string;
    includeArchived?: boolean;
    includeSystem?: boolean;
}
export interface SpaceTemplateGetPayload {
    apiVersion?: string;
    templateId: string;
}
export interface SpaceTemplatePreviewPayload {
    apiVersion?: string;
    templateId: string;
    resourceId?: string;
    name?: string;
    goal?: string;
}
export interface SpaceTemplateCreateSpacePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    templateId: string;
    spaceId?: string;
    resourceId: string;
    name?: string;
    goal?: string;
    visibility?: 'shared' | 'private';
    workspaceRoot?: string;
}
export interface SpaceTemplateSavePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    templateId?: string;
    name: string;
    description?: string;
    communicationMode?: CommunicationMode;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    baseAgents?: TemplateAgentDefinition[];
    sourceSpaceId?: string;
}
export interface SpaceTemplateArchivePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    templateId: string;
}
export interface SpaceTemplatePreviewResolved {
    templateId: string;
    templateRevision: number;
    name: string;
    goal?: string;
    resourceId: string;
    communicationMode: CommunicationMode;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    turnModel: string;
    initialAgents: TemplateAgentDefinition[];
}
export interface SpaceTemplateRecord {
    templateId: string;
    name: string;
    description?: string;
    status: ManagedRecordStatus;
    activeRevision: number;
    communicationMode: CommunicationMode;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    promptPackId?: string;
    turnModel: string;
    agentDefinitions: TemplateAgentDefinition[];
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    category?: string;
    complexityTier?: string;
    icon?: string;
    featured?: boolean;
    sortOrder?: number;
    agentCount?: number;
}
export interface SpaceTemplateListResponsePayload {
    templates: SpaceTemplateRecord[];
}
export interface SpaceTemplateGetResponsePayload {
    template: SpaceTemplateRecord;
}
export interface SpaceTemplatePreviewResponsePayload {
    template: SpaceTemplateRecord;
    resolved: SpaceTemplatePreviewResolved;
    warnings: string[];
}
export interface SpaceTemplateCreateSpaceResponsePayload {
    template: SpaceTemplateRecord;
    space: SpaceSummary;
}
export interface SpaceTemplateSaveResponsePayload {
    template: SpaceTemplateRecord;
    created: boolean;
}
export interface SpaceTemplateArchiveResponsePayload {
    template: SpaceTemplateRecord;
    archived: boolean;
}
export interface SpaceTemplatePreviewResult {
    template: SpaceTemplateRecord;
    resolved: SpaceTemplatePreviewResolved;
    warnings: string[];
}
export interface SpaceTemplateCreateSpaceResult {
    template: SpaceTemplateRecord;
    space: SpaceSummary;
}
export interface SpaceTemplateSaveResult {
    template: SpaceTemplateRecord;
    created: boolean;
}
export interface SpaceTemplateArchiveResult {
    template: SpaceTemplateRecord;
    archived: boolean;
}
export type LibrarySourceKind = 'installed' | 'scanned' | 'verified' | 'system';
export type LibraryEntryStatus = 'enabled' | 'disabled' | 'archived';
export interface LibraryEntry {
    entryId: string;
    skillId?: string;
    name: string;
    description?: string;
    contentMarkdown?: string;
    sourceKind: LibrarySourceKind;
    sourceRef?: string;
    provenance?: Record<string, unknown>;
    tags: string[];
    status: LibraryEntryStatus;
    importable: boolean;
    importedSkillId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface LibraryListEntriesPayload {
    apiVersion?: string;
    query?: string;
    sourceKinds?: LibrarySourceKind[];
    includeArchived?: boolean;
    includeContent?: boolean;
    limit?: number;
}
export interface LibraryListEntriesResponsePayload {
    entries: LibraryEntry[];
}
export interface LibraryGetEntryPayload {
    apiVersion?: string;
    entryId: string;
    includeContent?: boolean;
}
export interface LibraryGetEntryResponsePayload {
    entry: LibraryEntry;
}
export interface LibrarySaveSkillPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    entryId?: string;
    skillId?: string;
    name: string;
    description?: string;
    contentMarkdown: string;
    tags?: string[];
    sourceKind?: LibrarySourceKind;
    sourceRef?: string;
    enabled?: boolean;
}
export interface LibrarySaveSkillResponsePayload {
    entry: LibraryEntry;
    created: boolean;
}
export interface LibraryImportEntryPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    entryId: string;
    skillId?: string;
    name?: string;
}
export interface LibraryImportEntryResponsePayload {
    entry: LibraryEntry;
    created: boolean;
}
export interface LibraryArchiveEntryPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    entryId: string;
}
export interface LibraryArchiveEntryResponsePayload {
    entry: LibraryEntry;
    archived: boolean;
}
export interface LibrarySetEntryEnabledPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    entryId: string;
    enabled: boolean;
}
export interface LibrarySetEntryEnabledResponsePayload {
    entry: LibraryEntry;
}
export interface LibraryDeleteEntryPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    entryId: string;
}
export interface LibraryDeleteEntryResponsePayload {
    entryId: string;
    deleted: boolean;
}
export interface LibraryScanEntriesPayload {
    apiVersion?: string;
}
export interface LibraryScanEntriesResponsePayload {
    entries: LibraryEntry[];
    scannedAt: string;
}
export interface SkillDraft {
    draftId: string;
    name: string;
    description?: string;
    requestPrompt: string;
    contentMarkdown: string;
    createdAt: string;
    updatedAt: string;
}
export interface LibraryListSkillDraftsPayload {
    apiVersion?: string;
}
export interface LibraryListSkillDraftsResponsePayload {
    drafts: SkillDraft[];
}
export interface LibraryGetSkillDraftPayload {
    apiVersion?: string;
    draftId: string;
}
export interface LibraryGetSkillDraftResponsePayload {
    draft: SkillDraft;
}
export interface LibraryCreateSkillDraftPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    draftId?: string;
    name?: string;
    description?: string;
    requestPrompt: string;
}
export interface LibraryCreateSkillDraftResponsePayload {
    draft: SkillDraft;
    created: boolean;
}
export interface LibraryDeleteSkillDraftPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    draftId: string;
}
export interface LibraryDeleteSkillDraftResponsePayload {
    draftId: string;
    deleted: boolean;
}
export interface DeviceIdentity {
    deviceId: string;
    principalId: string;
    publicKey: string;
    platform?: string;
    keyVersion: string;
    status: 'active' | 'revoked' | 'rotated';
    createdAt: string;
    updatedAt: string;
    lastSeenAt?: string;
    revokedAt?: string;
}
export interface AuthRegisterDevicePayload {
    apiVersion?: string;
    deviceId: string;
    publicKey: string;
    platform?: string;
}
export interface AuthRegisterDeviceResult {
    device: DeviceIdentity;
    created: boolean;
}
export interface AuthRotateDeviceKeyPayload {
    apiVersion?: string;
    deviceId: string;
    nextPublicKey: string;
    platform?: string;
}
export interface AuthRotateDeviceKeyResult {
    device: DeviceIdentity;
}
export interface AuthRevokeDevicePayload {
    apiVersion?: string;
    deviceId: string;
}
export interface AuthRevokeDeviceResult {
    deviceId: string;
    revoked: boolean;
    device?: DeviceIdentity;
}
export interface AuthListDevicesPayload {
    apiVersion?: string;
    includeRevoked?: boolean;
}
export interface AuthIssueHttpPrincipalTokenPayload {
    apiVersion?: string;
    ttlSeconds?: number;
}
export interface AuthIssueHttpPrincipalTokenResult {
    token: string;
    tokenType: 'Bearer';
    principalId: string;
    deviceId?: string;
    issuedAt: string;
    expiresAt: string;
    ttlSeconds: number;
}
/**
 * Adapter -> Gateway: Register one or more native capability providers.
 */
export interface CapabilitiesRegisterPayload {
    providers: AdapterCapabilityProvider[];
}
/**
 * Adapter -> Gateway: Deregister one or more native capability providers.
 */
export interface CapabilitiesDeregisterPayload {
    providerIds: string[];
}
/**
 * Shared provider descriptor used by adapter registration.
 */
export interface AdapterCapabilityProvider {
    id: string;
    name: string;
    source: 'adapter';
    capabilityType: string;
    operations: string[];
}
/**
 * Gateway -> Adapter: Invoke a native capability.
 */
export interface AdapterCapabilityInvokePayload {
    invocationId: string;
    capability: string;
    operation: string;
    args: Record<string, unknown>;
    targetProvider?: string;
}
/**
 * Adapter -> Gateway: Invocation success payload.
 */
export interface AdapterCapabilityResultPayload {
    invocationId: string;
    providerId: string;
    data: unknown;
    durationMs?: number;
}
/**
 * Adapter -> Gateway: Invocation failure payload.
 */
export interface AdapterCapabilityErrorPayload {
    invocationId: string;
    providerId?: string;
    code?: string;
    message: string;
    details?: unknown;
}
/**
 * Inter-Agent: Direct message between agents in a space
 */
export interface AgentMessagePayload {
    spaceId: string;
    spaceUid: string;
    fromAgentId: string;
    /** Target agent ID. Use "*" to broadcast to all agents in the space. */
    toAgentId: string;
    content: string;
}
/**
 * Inter-Agent: Poke an idle agent to resume work
 */
export interface AgentPokePayload {
    spaceId: string;
    spaceUid: string;
    targetAgentId: string;
    reason: string;
    unblockedByTurnId?: string;
}
/**
 * Inter-Agent: Agent idle notification
 */
export interface AgentIdlePayload {
    spaceId: string;
    spaceUid: string;
    agentId: string;
    idleDurationMs: number;
    lastTurnId?: string;
}
/**
 * Inter-Agent: Declare a task dependency between turns
 */
export interface TaskDependencyPayload {
    spaceId: string;
    spaceUid: string;
    blockedTurnId: string;
    dependsOnTurnId: string;
}
/**
 * Inter-Agent: Task dependency resolved notification
 */
export interface TaskDependencyResolvedPayload {
    spaceId: string;
    spaceUid: string;
    unblockedTurnId: string;
    resolvedByTurnId: string;
}
/**
 * Gateway-to-Client: Authentication challenge
 */
export interface AuthChallengePayload {
    challenge?: string;
    success: boolean;
    reason?: string;
}
/**
 * Gateway-to-Client: Authentication result
 */
export interface AuthResultPayload {
    success: boolean;
    reason?: string;
}
/**
 * Structured turn usage information.
 */
export interface TurnUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}
/**
 * Structured turn metadata.
 */
export interface TurnMetadata {
    modelId?: string;
    providerId?: string;
    durationMs?: number;
    finishReason?: string;
    startedAt?: string;
    completedAt?: string;
    tokensPerSecond?: number;
}
/**
 * Typed event payload union — discriminated by `kind` field.
 */
export type TypedTurnEventPayload = {
    kind: 'turn.started';
    agentId: string;
    turnId: string;
    rootTurnId?: string;
    conversationTopology?: string;
    transcriptVisibility?: string;
} | {
    kind: 'turn.completed';
    agentId: string;
    usage?: TurnUsage;
    metadata?: TurnMetadata;
    finalMessage?: string;
    effectiveSafetyProfileId?: string;
} | {
    kind: 'turn.failed';
    errorMessage: string;
    errorCode?: string;
} | {
    kind: 'reasoning.delta';
    text: string;
} | {
    kind: 'tool.started';
    toolCallId: string;
    toolName: string;
    arguments?: Record<string, unknown>;
    agentId?: string;
} | {
    kind: 'tool.completed';
    toolCallId: string;
    toolName?: string;
    result: unknown;
    isError: boolean;
    agentId?: string;
} | {
    kind: 'state.changed';
    state: 'idle' | 'thinking' | 'acting' | 'needs_feedback' | 'errored';
} | {
    kind: 'approval.requested';
    requestId: string;
    agentId: string;
    description: string;
    options: string[];
    context?: Record<string, unknown>;
} | {
    kind: 'approval.resolved';
    requestId: string;
    response: string;
    agentId?: string;
} | {
    kind: 'rate_limited';
    retryAfterMs: number;
    attempt: number;
    maxAttempts: number;
    providerId: string;
    retryAt: string;
};
/**
 * Gateway-to-Client: Turn event notification
 */
export interface TurnEventPayload {
    spaceId: string;
    spaceUid: string;
    turnId: string;
    rootTurnId?: string;
    agentId?: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    transcriptVisibility?: 'visible' | 'activity_only' | 'summary';
    summaryTurnId?: string;
    eventType: string;
    data: unknown;
    typedPayload?: TypedTurnEventPayload;
    ts?: string;
}
/**
 * Gateway-to-Client: Turn stream (delta) data
 */
export interface TurnStreamPayload {
    spaceId: string;
    spaceUid: string;
    turnId: string;
    rootTurnId?: string;
    agentId: string;
    conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
    transcriptVisibility?: 'visible' | 'activity_only' | 'summary';
    summaryTurnId?: string;
    delta: string;
    seq: number;
    done: boolean;
}
/**
 * Gateway-to-Client: Space state update
 */
export interface SpaceStatePayload {
    spaceId: string;
    spaceUid: string;
    state: string;
    turnCount: number;
    activeAgentId?: string;
    pendingFeedback: number;
}
/**
 * Gateway-to-Client: Notification
 */
export interface NotificationPayload {
    notificationId: string;
    category: string;
    severity: string;
    title: string;
    body: string;
    [key: string]: unknown;
}
export interface SpaceAgentUpdatedEventPayload {
    spaceId: string;
    spaceUid: string;
    agentId: string;
    oldProfileId: string;
    newProfileId: string;
    updatedAt: string;
}
/**
 * Gateway-to-Client: Error response
 */
export interface ErrorPayload {
    code: string;
    message: string;
    details?: unknown;
    retryable?: boolean;
    correlationId?: string;
}
export interface UsageWindowSummary {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    spentUsd: number;
    tokenAccuracy: 'reported' | 'estimated' | 'mixed';
    usageSource: 'ledger' | 'local_scanner' | 'legacy_turns';
}
export interface BudgetSummary {
    softCapUsd: number;
    hardCapUsd: number;
    warningThreshold: number;
    spentUsd: number;
    leftUsd: number;
}
export interface ProviderUsageSnapshot {
    providerId: string;
    status: 'available' | 'unavailable' | 'unknown';
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    spentUsd: number;
    tokenAccuracy: 'reported' | 'estimated' | 'mixed';
    usageSource: 'ledger' | 'local_scanner' | 'legacy_turns';
    message?: string;
}
export interface GatewayGetLocalUsageTelemetryPayload {
    apiVersion?: string;
    providerId?: string;
}
export interface LocalUsageInstallHint {
    command: string;
    docsUrl: string;
}
export interface LocalUsageWindow {
    window: 'primary' | 'secondary' | 'tertiary';
    label: 'session' | 'weekly' | 'tertiary';
    usedPercent?: number;
    remainingPercent?: number;
    windowMinutes?: number;
    resetsAt?: string;
    resetDescription?: string;
}
export interface CodexBarQuota {
    available: boolean;
    sourceLabel?: string;
    windows: LocalUsageWindow[];
    creditsRemaining?: number;
    accountLabel?: string;
    updatedAt?: string;
    message?: string;
    installHint?: LocalUsageInstallHint;
}
export interface LocalUsageSession {
    sessionId: string;
    model?: string;
    startedAt?: string;
    lastActivityAt: string;
    inputTokens: number;
    cachedInputTokens?: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd?: number;
    tokenAccuracy: 'reported' | 'estimated' | 'mixed';
    usageSource: 'ledger' | 'local_scanner' | 'legacy_turns';
}
export interface LocalUsageSummary {
    windowDays: number;
    sessionCount: number;
    inputTokens: number;
    cachedInputTokens?: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd?: number;
    tokenAccuracy: 'reported' | 'estimated' | 'mixed';
    usageSource: 'ledger' | 'local_scanner' | 'legacy_turns';
}
export interface LocalProviderUsageTelemetry {
    providerId: string;
    status: 'available' | 'unavailable' | 'unknown';
    fetchedAt: string;
    message?: string;
    quota: CodexBarQuota;
    summary: LocalUsageSummary;
    sessions: LocalUsageSession[];
}
export interface GatewayGetLocalUsageTelemetryResponsePayload {
    telemetry: LocalProviderUsageTelemetry[];
    generatedAt: string;
}
export type GatewayExternalConnectivityMode = "DISABLED" | "TAILSCALE";
export type GatewayExternalConnectivityState = "disabled" | "unsupported" | "missing_dependency" | "logged_out" | "serve_missing" | "ready" | "error";
export interface GatewayExternalConnectivitySettings {
    mode: GatewayExternalConnectivityMode;
    updatedAt: string;
}
export interface GatewayExternalConnectivityAdvertisedEndpoint {
    provider: "tailscale";
    label: string;
    host: string;
    port: number;
    websocketUrl: string;
    healthUrl: string;
}
export interface GatewayExternalConnectivityTailscaleStatus {
    cliAvailable: boolean;
    version?: string;
    backendState?: string;
    health: string[];
    hostName?: string;
    dnsName?: string;
    magicDnsSuffix?: string;
    tailscaleIps: string[];
    serveConfigured: boolean;
    serveTarget?: string;
    servePort?: number;
}
export interface GatewayExternalConnectivityStatus {
    state: GatewayExternalConnectivityState;
    summary: string;
    remediation?: string;
    advertisedEndpoints: GatewayExternalConnectivityAdvertisedEndpoint[];
    tailscaleStatus?: GatewayExternalConnectivityTailscaleStatus;
}
export interface GatewayGetExternalConnectivityPayload {
    apiVersion?: string;
}
export interface GatewayGetExternalConnectivityResponsePayload {
    settings: GatewayExternalConnectivitySettings;
    status: GatewayExternalConnectivityStatus;
}
export interface GatewaySetExternalConnectivityPayload {
    apiVersion?: string;
    mode: GatewayExternalConnectivityMode;
}
export interface GatewaySetExternalConnectivityResponsePayload {
    settings: GatewayExternalConnectivitySettings;
    status: GatewayExternalConnectivityStatus;
}
export interface GatewayFactoryResetPayload {
    apiVersion?: string;
    confirmation: string;
}
export interface GatewayFactoryResetResponsePayload {
    gatewayId: string;
    gatewayUuid?: string;
    resetAt: string;
    tablesCleared: number;
    rowsDeleted: number;
}
export interface SpaceResetPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SpaceResetResponsePayload {
    spaceId: string;
    resetAt: string;
    tablesCleared: number;
    rowsDeleted: number;
}
export interface VoiceUsageWindowSummary {
    sttSeconds: number;
    ttsChars: number;
    ttsSeconds: number;
    estimatedCostUsd: number;
}
export interface VoiceUsageSourceSummary extends VoiceUsageWindowSummary {
    source: 'managed' | 'byok' | 'local_model' | 'apple_speech' | 'unknown';
}
export interface VoiceUsageLockSummary {
    enabled: boolean;
    managedSttSecondsMonthlyLimit?: number;
    managedTtsCharsMonthlyLimit?: number;
    managedTtsSecondsMonthlyLimit?: number;
    managedCurrentMonthSttSeconds?: number;
    managedCurrentMonthTtsChars?: number;
    managedCurrentMonthTtsSeconds?: number;
}
export interface VoiceUsageSnapshot {
    windows: {
        last5h: VoiceUsageWindowSummary;
        last7d: VoiceUsageWindowSummary;
        last30d: VoiceUsageWindowSummary;
        lifetime: VoiceUsageWindowSummary;
    };
    bySource: VoiceUsageSourceSummary[];
    lock?: VoiceUsageLockSummary;
}
export interface UsageSnapshot {
    computedAt: string;
    currency: 'USD';
    windows: {
        last5h: UsageWindowSummary;
        last7d: UsageWindowSummary;
        last30d: UsageWindowSummary;
        lifetime: UsageWindowSummary;
    };
    budget: BudgetSummary;
    providerUsage: ProviderUsageSnapshot[];
    voice?: VoiceUsageSnapshot;
}
export interface GatewayPolicy {
    allowedCapabilityTypes: string[];
    deniedCapabilityTypes: string[];
    allowedSkillIds: string[];
    deniedSkillIds: string[];
    globalFlags: Record<string, unknown>;
    updatedAt: string;
}
export interface GatewayPolicyUpdatePayload {
    apiVersion?: string;
    allowedCapabilityTypes?: string[];
    deniedCapabilityTypes?: string[];
    allowedSkillIds?: string[];
    deniedSkillIds?: string[];
    globalFlags?: Record<string, unknown>;
}
export interface OrchestratorCommandPayload {
    apiVersion?: string;
    correlationId?: string;
    idempotencyKey?: string;
    commandType: 'list_spaces' | 'create_space' | 'list_skills' | 'create_skill' | 'handoff_space' | 'add_agent' | 'share_context' | 'run_space_prompt';
    targetSpaceId?: string;
    targetAgentId?: string;
    payload?: Record<string, unknown>;
}
export interface OrchestratorCommandEvent {
    status: 'accepted' | 'running' | 'completed' | 'failed';
    event: Record<string, unknown>;
    createdAt: string;
}
export interface OrchestratorCommandResult {
    commandId: string;
    correlationId: string;
    apiVersion: string;
    commandType: string;
    targetSpaceId: string;
    targetAgentId?: string;
    status: 'accepted' | 'running' | 'completed' | 'failed';
    result?: Record<string, unknown>;
    error?: {
        code: string;
        message: string;
    };
    createdAt: string;
    updatedAt: string;
    events: OrchestratorCommandEvent[];
}
export interface OrchestratorSummaryParticipant {
    agentId: string;
    turnOrder: number;
    isPrimary: boolean;
    status: 'pending' | 'completed' | 'failed';
    promptTokens: number;
    completionTokens: number;
    finalMessage?: string;
    error?: string;
}
export interface OrchestratorSummaryHighlight {
    agentId: string;
    eventType: 'text_delta' | 'turn_completed' | 'error' | 'feedback_requested';
    text: string;
    timestamp: string;
}
export interface OrchestratorSummaryArtifact {
    summaryId: string;
    version: string;
    spaceId: string;
    turnId: string;
    turnModel: string;
    generatedAt: string;
    status: 'completed' | 'degraded';
    failureReason?: string;
    participants: OrchestratorSummaryParticipant[];
    highlights: OrchestratorSummaryHighlight[];
    finalSummaryText: string;
}
export interface OrchestratorEventPayload {
    commandId: string;
    correlationId: string;
    status: 'accepted' | 'running' | 'completed' | 'failed';
    event: Record<string, unknown>;
    createdAt: string;
    eventType?: string;
    spaceId?: string;
    spaceUid?: string;
    turnId?: string;
}
export type SchedulerJobStatus = 'active' | 'paused' | 'invalid';
export type SchedulerRunStatus = 'running' | 'completed' | 'failed' | 'skipped';
export type SchedulerRunTrigger = 'scheduled' | 'manual';
export type SchedulerScheduleKind = 'hourly' | 'daily' | 'weekly';
export type SchedulerActionType = 'space_prompt';
export type SchedulerExecutionTargetMode = 'existing_space' | 'new_space';
export type SchedulerCalendarSyncStatus = 'pending' | 'synced' | 'error';
export type SchedulerCalendarDriftStatus = 'none' | 'drifted';
export interface SchedulerSchedulePreset {
    kind: SchedulerScheduleKind;
    intervalHours?: number;
    minute: number;
    hour?: number;
    daysOfWeek?: number[];
}
export interface SchedulerAction {
    type: SchedulerActionType;
    promptText: string;
    targetAgentId?: string;
}
export interface SchedulerExecutionTarget {
    mode: SchedulerExecutionTargetMode;
}
export interface SchedulerCalendarBinding {
    providerId: string;
    calendarId: string;
    eventId?: string;
    syncStatus?: SchedulerCalendarSyncStatus;
    driftStatus?: SchedulerCalendarDriftStatus;
    driftMessage?: string;
    lastSyncedAt?: string;
}
export interface SchedulerLinkedSpace {
    spaceId: string;
    spaceUid: string;
    name: string;
    isPrimary: boolean;
    linkedAt: string;
}
export interface SchedulerJob {
    jobId: string;
    name: string;
    status: SchedulerJobStatus;
    enabled: boolean;
    cronExpression: string;
    schedulePreset: SchedulerSchedulePreset;
    timezone: string;
    action: SchedulerAction;
    primarySpaceId?: string;
    invalidReason?: string;
    nextRunAt?: string;
    lastRunAt?: string;
    lastRunStatus?: SchedulerRunStatus;
    lastErrorCode?: string;
    lastErrorMessage?: string;
    createdByPrincipalId: string;
    createdAt: string;
    updatedAt: string;
    linkedSpaces: SchedulerLinkedSpace[];
    executionTarget: SchedulerExecutionTarget;
    calendarBinding?: SchedulerCalendarBinding;
}
export interface SchedulerJobRun {
    runId: string;
    jobId: string;
    trigger: SchedulerRunTrigger;
    status: SchedulerRunStatus;
    commandId?: string;
    scheduledFor?: string;
    startedAt?: string;
    finishedAt?: string;
    skipReason?: string;
    errorCode?: string;
    errorMessage?: string;
    result?: Record<string, unknown>;
}
export interface SchedulerCreateJobPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    name: string;
    timezone: string;
    schedulePreset: SchedulerSchedulePreset;
    action: SchedulerAction;
    primarySpaceId: string;
    relatedSpaceIds?: string[];
    executionTarget?: SchedulerExecutionTarget;
    calendarBinding?: SchedulerCalendarBinding;
}
export interface SchedulerGetJobPayload {
    apiVersion?: string;
    jobId: string;
}
export interface SchedulerListJobsPayload {
    apiVersion?: string;
    statuses?: SchedulerJobStatus[];
    gatewayId?: string;
    limit?: number;
}
export interface SchedulerUpdateJobPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    jobId: string;
    name?: string;
    status?: SchedulerJobStatus;
    timezone?: string;
    schedulePreset?: SchedulerSchedulePreset;
    action?: SchedulerAction;
    primarySpaceId?: string | null;
    relatedSpaceIds?: string[];
    executionTarget?: SchedulerExecutionTarget;
    calendarBinding?: SchedulerCalendarBinding | null;
}
export interface SchedulerDeleteJobPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    jobId: string;
}
export interface SchedulerDeleteJobResult {
    jobId: string;
    deleted: boolean;
}
export interface SchedulerLinkSpacePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    jobId: string;
    spaceId: string;
}
export interface SchedulerUnlinkSpacePayload {
    apiVersion?: string;
    idempotencyKey?: string;
    jobId: string;
    spaceId: string;
}
export interface SchedulerListRunsPayload {
    apiVersion?: string;
    jobId: string;
    limit?: number;
    offset?: number;
}
export interface SchedulerListRunsResult {
    runs: SchedulerJobRun[];
    total: number;
    nextOffset?: number;
}
export interface SchedulerRunNowPayload {
    apiVersion?: string;
    idempotencyKey?: string;
    jobId: string;
}
export interface SchedulerRunNowResult {
    run: SchedulerJobRun;
    job: SchedulerJob;
}
export interface SpaceLinkPayload {
    apiVersion?: string;
    sourceSpaceId: string;
    targetSpaceId: string;
    mode?: string;
}
export interface SpaceLinkResult {
    sourceSpaceId: string;
    targetSpaceId: string;
    mode: string;
    createdAt: string;
    updatedAt: string;
}
export interface SpaceUnlinkPayload {
    apiVersion?: string;
    sourceSpaceId: string;
    targetSpaceId: string;
}
export interface SpaceShareContextPayload {
    apiVersion?: string;
    sourceSpaceId: string;
    targetSpaceId: string;
    artifactId: string;
}
export type SpaceShareAccessMode = 'read_only' | 'collaborator';
export type SpaceShareJoinRoute = 'direct' | 'relay_proxy';
export type SpaceShareIdentityModeHint = 'device_key' | 'strict_apple_id';
export interface SpaceInviteLink {
    version: 'v2';
    relayInviteId: string;
    relayUrl: string;
    spaceIdHint?: string;
    spaceUidHint?: string;
    fallbackGatewayUrl?: string;
}
export interface SpaceShareInvite {
    inviteId: string;
    spaceId: string;
    spaceUid?: string;
    issuedByPrincipalId: string;
    mode: SpaceShareAccessMode;
    status: 'active' | 'used' | 'revoked' | 'expired';
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
    inviteToken?: string;
    inviteLink?: SpaceInviteLink;
}
export interface SpaceParticipant {
    participantId: string;
    spaceId: string;
    principalId: string;
    principalType: string;
    mode: SpaceShareAccessMode;
    status: 'active' | 'revoked';
    joinedViaInviteId?: string;
    deviceId?: string;
    devicePublicKey?: string;
    joinedAt: string;
    updatedAt: string;
    revokedAt?: string;
}
export interface SpaceShareCreateInvitePayload {
    apiVersion?: string;
    spaceId: string;
    mode: SpaceShareAccessMode;
    expiresInSeconds?: number;
}
export interface SpaceShareJoinPayload {
    apiVersion?: string;
    spaceId: string;
    inviteToken: string;
    deviceId?: string;
    devicePublicKey?: string;
    identityModeHint?: SpaceShareIdentityModeHint;
    appleIdAssertion?: string;
    joinRoute?: SpaceShareJoinRoute;
    relaySessionToken?: string;
}
export interface SpaceShareRevokePayload {
    apiVersion?: string;
    spaceId: string;
    inviteId?: string;
    participantId?: string;
}
export interface SpaceShareRevokeResult {
    spaceId: string;
    inviteId?: string;
    participantId?: string;
    revokedInvite: boolean;
    revokedParticipant: boolean;
}
export interface SpaceShareListParticipantsPayload {
    apiVersion?: string;
    spaceId: string;
}
export interface SharedContextRef {
    transferId: string;
    sourceSpaceId: string;
    targetSpaceId: string;
    artifactId: string;
    status: 'shared' | 'imported' | 'denied';
    denialReason?: string;
    createdAt: string;
    appliedAt?: string;
}
export interface SpacePullSharedContextPayload {
    apiVersion?: string;
    sourceSpaceId: string;
    targetSpaceId: string;
    limit?: number;
}
export interface SpacePullSharedContextResult {
    importedArtifacts: Array<{
        sourceArtifactId: string;
        importedArtifactId: string;
    }>;
    denied: Array<{
        transferId: string;
        reason: string;
    }>;
}
export interface SyncResourceRef {
    resourceType: string;
    resourceId: string;
    title?: string;
    updatedAt?: string;
    tags?: string[];
}
export interface SyncResource {
    ref: SyncResourceRef;
    content: Record<string, unknown>;
}
export interface SyncResourceDenied {
    ref: SyncResourceRef;
    reason: string;
}
export interface SyncAnnouncePayload {
    apiVersion?: string;
    peerId: string;
    resourceId: string;
    gatewayVersion: string;
    endpointUrl?: string;
    authSecretHash?: string;
    skillCount?: number;
    actionCount?: number;
    experienceCount?: number;
    profileCount?: number;
}
export interface SyncAnnounceResult {
    peerId: string;
    resourceId: string;
    gatewayVersion: string;
    syncEnabled: boolean;
    announcedAt: string;
}
export interface SyncQueryResourcesPayload {
    apiVersion?: string;
    peerId: string;
    resourceId?: string;
    types?: string[];
    tags?: string[];
    updatedAfter?: string;
    cursor?: string;
    limit?: number;
}
export interface SyncQueryResourcesResult {
    resources: SyncResourceRef[];
    nextCursor?: string;
}
export interface SyncPullResourcesPayload {
    apiVersion?: string;
    peerId: string;
    idempotencyKey: string;
    refs: SyncResourceRef[];
}
export interface SyncPullResourcesResult {
    resources: SyncResource[];
    denied: SyncResourceDenied[];
    appliedCount: number;
    skippedCount: number;
}
export interface SpeechStartPayload {
    apiVersion?: string;
    spaceId: string;
    spaceUid?: string;
    sessionId?: string;
    agentId?: string;
    autoSubmitTurns?: boolean;
    preferredSource?: 'managed' | 'byok' | 'local_model' | 'apple_speech';
    preferredProviderId?: string;
    byokProviderId?: string;
    localModelProviderId?: string;
    appleSpeechProviderId?: string;
    allowByokFallback?: boolean;
    allowLocalFallback?: boolean;
    allowAppleSpeechFallback?: boolean;
}
export interface SpeechAudioChunkPayload {
    apiVersion?: string;
    sessionId: string;
    sequence: number;
    audioBase64: string;
    audioDurationSeconds?: number;
    ttsChars?: number;
    ttsSeconds?: number;
    transcriptText?: string;
    isFinal?: boolean;
}
export interface SpeechControlPayload {
    apiVersion?: string;
    sessionId: string;
    command: 'stop' | 'interrupt' | 'end';
    reason?: string;
}
export interface SpeechEventPayload {
    sessionId: string;
    spaceId: string;
    spaceUid: string;
    state: 'idle' | 'running' | 'stopped' | 'interrupted' | 'ended';
    eventType: string;
    providerSource?: 'managed' | 'byok' | 'local_model' | 'apple_speech';
    providerId?: string;
    fallbackReason?: 'default' | 'manual_override' | 'quota_fallback' | 'local_forced';
    usage?: {
        sttSeconds: number;
        ttsChars: number;
        ttsSeconds: number;
    };
    lockReason?: string;
    transcript?: string;
    turnId?: string;
    sequence?: number;
    reason?: string;
    ts: string;
}
/**
 * Turn execution result
 */
export interface TurnResult {
    turnId: string;
    spaceId: string;
    output?: string;
    status: 'completed' | 'pending_feedback' | 'failed';
    error?: string;
    mode?: TurnMode;
    effort?: TurnEffort;
}
/**
 * Capability invocation result
 */
export interface CapabilityResult {
    success: boolean;
    data?: unknown;
    error?: string;
}
/**
 * Event handler type definitions
 */
export type TurnEventHandler = (event: TurnEventPayload) => void;
export type TurnStreamHandler = (stream: TurnStreamPayload) => void;
export type SpaceStateHandler = (state: SpaceStatePayload) => void;
export type SpaceAgentUpdatedHandler = (event: SpaceAgentUpdatedEventPayload) => void;
export type NotificationHandler = (notification: NotificationPayload) => void;
export type ErrorHandler = (error: ErrorPayload) => void;
export type CapabilityInvokeHandler = (request: AdapterCapabilityInvokePayload) => void | Promise<void>;
export type AgentMessageHandler = (payload: AgentMessagePayload) => void;
export type AgentPokeHandler = (payload: AgentPokePayload) => void;
export type AgentIdleHandler = (payload: AgentIdlePayload) => void;
export type TaskDependencyHandler = (payload: TaskDependencyPayload) => void;
export type TaskDependencyResolvedHandler = (payload: TaskDependencyResolvedPayload) => void;
export type OrchestratorEventHandler = (payload: OrchestratorEventPayload) => void;
export type SpeechEventHandler = (payload: SpeechEventPayload) => void;
export type UnsubscribeHandler = () => void;
/**
 * GatewayClient configuration options
 */
export interface GatewayClientOptions {
    url: string;
    clientType?: string;
    clientVersion?: string;
    deviceId?: string;
    devicePublicKey?: string;
    deviceProofSignature?: string;
    reconnect?: boolean;
    reconnectIntervalMs?: number;
    maxReconnectAttempts?: number;
    maxReconnectDelayMs?: number;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Error) => void;
    requestTimeoutMs?: number;
}
/**
 * Options for ensuring a "main" space exists for app bootstrap.
 */
export interface MainSpaceBootstrapOptions {
    apiVersion?: string;
    spaceId?: string;
    resourceId?: string;
    name?: string;
    goal?: string;
    createIfMissing?: boolean;
    subscribe?: boolean;
    initialAgents?: SpaceCreateInitialAgentPayload[];
}
/**
 * Result returned by main-space bootstrap helpers.
 */
export interface MainSpaceBootstrapResult {
    space: SpaceSummary;
    created: boolean;
    subscribed: boolean;
}
/**
 * Result returned by connect + bootstrap helper.
 */
export interface ConnectAndBootstrapResult extends MainSpaceBootstrapResult {
    connected: boolean;
}
/**
 * Spaceskit WebSocket client SDK
 */
export declare class GatewayClient {
    private url;
    private clientType;
    private clientVersion;
    private deviceId?;
    private devicePublicKey?;
    private deviceProofSignature?;
    private reconnect;
    private reconnectIntervalMs;
    private maxReconnectAttempts;
    private maxReconnectDelayMs;
    private requestTimeoutMs;
    private ws;
    private connected;
    private reconnectAttempts;
    private reconnectTimer;
    private pendingRequests;
    private turnEventHandlers;
    private turnStreamHandlers;
    private spaceStateHandlers;
    private spaceAgentUpdatedHandlers;
    private notificationHandlers;
    private errorHandlers;
    private capabilityInvokeHandlers;
    private agentMessageHandlers;
    private agentPokeHandlers;
    private agentIdleHandlers;
    private taskDependencyHandlers;
    private taskDependencyResolvedHandlers;
    private orchestratorEventHandlers;
    private speechEventHandlers;
    private authKeyPair;
    private onOpenCallback?;
    private onCloseCallback?;
    private onErrorCallback?;
    constructor(options: GatewayClientOptions);
    /**
     * Connect to the Spaceskit
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the Spaceskit
     */
    disconnect(): Promise<void>;
    /**
     * Check if client is connected
     */
    get isConnected(): boolean;
    /**
     * Attempt to reconnect with exponential backoff
     */
    private attemptReconnect;
    /**
     * Send a message to the gateway
     */
    private send;
    /**
     * Send a message and wait for a response
     */
    private sendAndWaitForResponse;
    /**
     * Handle incoming messages from the gateway
     */
    private handleMessage;
    /**
     * Set the authentication key pair for challenge-response auth.
     * Must be called before `connect()` if the gateway requires authentication.
     * Generate a key pair with `generateAuthKeyPair()`.
     */
    setAuthKeyPair(keyPair: AuthKeyPair): void;
    /**
     * Handle authentication challenge — auto-signs if key pair is set.
     */
    private handleAuthChallenge;
    /**
     * Handle authentication result
     */
    private handleAuthResult;
    /**
     * Handle turn event
     */
    private handleTurnEvent;
    /**
     * Handle turn stream
     */
    private handleTurnStream;
    private normalizeTurnEventPayload;
    private normalizeTurnStreamPayload;
    private mapNestedTurnEventType;
    private pickNonEmptyString;
    private readRecord;
    private coerceInteger;
    private coerceBoolean;
    /**
     * Handle adapter capability invocation.
     */
    private handleCapabilityInvoke;
    /**
     * Handle space state update
     */
    private handleSpaceState;
    /**
     * Handle notification
     */
    private handleNotification;
    /**
     * Handle error
     */
    private handleError;
    /**
     * Execute a turn in a space
     */
    executeTurn(options: ExecuteTurnOptions): Promise<TurnResult>;
    executeTurn(spaceUid: string, input: string, targetAgentId?: string): Promise<TurnResult>;
    /**
     * Ensure a main space exists and optionally subscribe to it.
     *
     * This is intended for app bootstrap flows:
     * - find main space by ID
     * - optionally create it if missing
     * - optionally subscribe to its real-time events
     */
    ensureMainSpace(options?: MainSpaceBootstrapOptions): Promise<MainSpaceBootstrapResult>;
    /**
     * Connect (if needed), then ensure/subscribe main space.
     */
    connectAndBootstrapMainSpace(options?: MainSpaceBootstrapOptions): Promise<ConnectAndBootstrapResult>;
    /**
     * Resume a turn with feedback
     */
    resumeFeedback(spaceUid: string, turnId: string, response: 'approve' | 'reject' | 'revise' | 'defer', revision?: string): Promise<void>;
    /**
     * Subscribe to space events
     */
    subscribe(spaceUids: string[]): Promise<void>;
    /**
     * Invoke a capability
     */
    invokeCapability(capability: string, method: string, params: Record<string, unknown>, targetProvider?: string): Promise<CapabilityResult>;
    /**
     * Create a new space.
     */
    createSpace(payload: SpaceCreatePayload): Promise<SpaceSummary>;
    /**
     * Get a space by ID.
     */
    getSpace(spaceId: string, apiVersion?: string): Promise<SpaceSummary>;
    /**
     * List spaces with optional filters.
     */
    listSpaces(payload?: SpaceListPayload): Promise<SpaceSummary[]>;
    /**
     * Archive a space on the gateway.
     */
    archiveSpace(payload: SpaceArchivePayload): Promise<SpaceArchiveResponsePayload>;
    /**
     * Soft-delete a space on the gateway.
     */
    deleteSpace(payload: SpaceDeletePayload): Promise<SpaceDeleteResponsePayload>;
    /**
     * Add an agent assignment to a space.
     */
    addAgent(payload: SpaceAddAgentPayload): Promise<SpaceAddAgentResponsePayload>;
    /**
     * Remove an agent assignment from a space.
     */
    removeAgent(payload: SpaceRemoveAgentPayload): Promise<SpaceRemoveAgentResponsePayload>;
    /**
     * Update an existing assignment in a space.
     */
    updateAgentAssignment(payload: SpaceUpdateAgentAssignmentPayload): Promise<SpaceUpdateAgentAssignmentResponsePayload>;
    /**
     * Set the orchestrator profile for a space.
     */
    setSpaceOrchestrator(payload: SpaceSetOrchestratorPayload): Promise<SpaceSummary>;
    /**
     * List all assignments for a space.
     */
    listAgentAssignments(spaceId: string, apiVersion?: string): Promise<SpaceAgentAssignment[]>;
    /**
     * Get per-space MCP endpoint configuration.
     */
    getSpaceMcpEndpoint(spaceId: string, apiVersion?: string): Promise<SpaceGetMcpEndpointResponsePayload>;
    /**
     * Create or update per-space MCP endpoint configuration.
     */
    setSpaceMcpEndpoint(payload: SpaceSetMcpEndpointPayload): Promise<SpaceMcpEndpoint>;
    /**
     * Remove per-space MCP endpoint configuration.
     */
    clearSpaceMcpEndpoint(spaceId: string, apiVersion?: string): Promise<boolean>;
    /**
     * Discover MCP-backed external agents available to a space.
     */
    discoverSpaceMcpAgents(spaceId: string, apiVersion?: string): Promise<SpaceDiscoverMcpAgentsResponsePayload>;
    /**
     * Approve one discovered MCP agent into a space as an external participant.
     */
    approveSpaceMcpAgent(payload: SpaceApproveMcpAgentPayload): Promise<SpaceApproveMcpAgentResponsePayload>;
    /**
     * Add one skill assignment to a space.
     */
    addSkillToSpace(payload: SpaceAddSkillPayload): Promise<SpaceAddSkillResponsePayload>;
    /**
     * Remove one skill assignment from a space.
     */
    removeSkillFromSpace(payload: SpaceRemoveSkillPayload): Promise<SpaceRemoveSkillResponsePayload>;
    /**
     * List current skill assignments for a space.
     */
    listSpaceSkills(spaceId: string, apiVersion?: string): Promise<string[]>;
    /**
     * Get effective workspace configuration for a space.
     */
    getSpaceWorkspace(spaceId: string, apiVersion?: string): Promise<SpaceWorkspace>;
    /**
     * Set or clear the folder binding for a space.
     */
    setSpaceWorkspace(payload: SpaceSetWorkspacePayload): Promise<SpaceWorkspace>;
    /**
     * Add one resource assignment to a space.
     */
    addSpaceResource(payload: SpaceAddResourcePayload): Promise<SpaceResource>;
    /**
     * Remove one resource assignment from a space.
     */
    removeSpaceResource(payload: SpaceRemoveResourcePayload): Promise<boolean>;
    /**
     * List resource assignments for a space.
     */
    listSpaceResources(spaceId: string, apiVersion?: string): Promise<SpaceResource[]>;
    /**
     * List redacted orchestration journal entries for a space.
     */
    listOrchestrationJournal(payload: SpaceListOrchestrationJournalPayload): Promise<SpaceListOrchestrationJournalResponsePayload>;
    /**
     * List agent definitions, optionally including archived entries.
     */
    listAgentDefinitions(payload?: IdentityListAgentDefinitionsPayload): Promise<AgentDefinitionSummary[]>;
    /**
     * Fetch one agent definition by ID.
     */
    getAgentDefinition(agentDefinitionId: string, apiVersion?: string): Promise<AgentDefinitionSummary>;
    createAgentDefinition(payload: IdentityCreateAgentDefinitionPayload): Promise<AgentDefinitionCreateResult>;
    updateAgentDefinition(payload: IdentityUpdateAgentDefinitionPayload): Promise<AgentDefinitionUpdateResult>;
    archiveAgentDefinition(payload: IdentityArchiveAgentDefinitionPayload): Promise<AgentDefinitionArchiveResult>;
    listPersonas(payload?: IdentityListPersonasPayload): Promise<PersonaSummary[]>;
    getPersona(personaId: string, apiVersion?: string): Promise<PersonaSummary>;
    createPersona(payload: IdentityCreatePersonaPayload): Promise<PersonaCreateResult>;
    updatePersona(payload: IdentityUpdatePersonaPayload): Promise<PersonaUpdateResult>;
    archivePersona(payload: IdentityArchivePersonaPayload): Promise<PersonaArchiveResult>;
    previewCompiledInstructions(agentDefinitionId: string, apiVersion?: string, workspaceContext?: string): Promise<CompiledInstructionsPreview>;
    previewRuntimeSystemPrompt(payload: IdentityPreviewRuntimeSystemPromptPayload): Promise<RuntimeSystemPromptPreview>;
    previewSystemPromptMatrix(payload: IdentityPreviewSystemPromptMatrixPayload): Promise<SystemPromptMatrix>;
    /**
     * Create a profile in gateway persistence.
     */
    createProfile(payload: ProfileCreatePayload): Promise<ProfileCreateResponsePayload>;
    /**
     * Fetch one profile by ID.
     */
    getProfile(profileId: string, apiVersion?: string): Promise<ProfileSummary>;
    /**
     * List profiles, optionally including archived entries.
     */
    listProfiles(payload?: ProfileListPayload): Promise<ProfileSummary[]>;
    /**
     * Update a profile and create a new active revision.
     */
    updateProfile(payload: ProfileUpdatePayload): Promise<ProfileUpdateResponsePayload>;
    /**
     * Archive a profile.
     */
    archiveProfile(payload: ProfileArchivePayload): Promise<ProfileArchiveResponsePayload>;
    previewTemplate(payload: SpacePreviewTemplatePayload): Promise<SpacePreviewTemplateResult>;
    createSpaceFromTemplate(payload: SpaceCreateFromTemplatePayload): Promise<SpaceCreateFromTemplateResult>;
    saveSpaceTemplate(payload: SpaceSaveTemplatePayload): Promise<SpaceSaveTemplateResult>;
    listSpaceTemplates(payload?: SpaceTemplateListPayload): Promise<SpaceTemplateRecord[]>;
    getSpaceTemplate(templateId: string, apiVersion?: string): Promise<SpaceTemplateRecord>;
    previewSpaceTemplateRecord(payload: SpaceTemplatePreviewPayload): Promise<SpaceTemplatePreviewResult>;
    createSpaceFromManagedTemplate(payload: SpaceTemplateCreateSpacePayload): Promise<SpaceTemplateCreateSpaceResult>;
    saveManagedSpaceTemplate(payload: SpaceTemplateSavePayload): Promise<SpaceTemplateSaveResult>;
    archiveSpaceTemplate(payload: SpaceTemplateArchivePayload): Promise<SpaceTemplateArchiveResult>;
    registerDevice(payload: AuthRegisterDevicePayload): Promise<AuthRegisterDeviceResult>;
    rotateDeviceKey(payload: AuthRotateDeviceKeyPayload): Promise<AuthRotateDeviceKeyResult>;
    revokeDevice(payload: AuthRevokeDevicePayload): Promise<AuthRevokeDeviceResult>;
    listDevices(payload?: AuthListDevicesPayload): Promise<DeviceIdentity[]>;
    /**
     * Issue a short-lived signed bearer token for strict HTTP principal auth.
     */
    issueHttpPrincipalToken(payload?: AuthIssueHttpPrincipalTokenPayload): Promise<AuthIssueHttpPrincipalTokenResult>;
    /**
     * Get persisted usage + budget snapshot.
     */
    getUsageSnapshot(apiVersion?: string): Promise<UsageSnapshot>;
    /**
     * Get local provider telemetry (quota windows + local token/session aggregates).
     */
    getLocalUsageTelemetry(apiVersion?: string, providerId?: string): Promise<LocalProviderUsageTelemetry[]>;
    getExternalConnectivity(apiVersion?: string): Promise<GatewayGetExternalConnectivityResponsePayload>;
    setExternalConnectivity(mode: GatewayExternalConnectivityMode, apiVersion?: string): Promise<GatewaySetExternalConnectivityResponsePayload>;
    /**
     * Get current gateway-wide capability/skill policy.
     */
    getGatewayPolicy(apiVersion?: string): Promise<GatewayPolicy>;
    /**
     * Update gateway-wide capability/skill policy.
     */
    updateGatewayPolicy(payload: GatewayPolicyUpdatePayload): Promise<GatewayPolicy>;
    factoryResetGateway(payload: GatewayFactoryResetPayload): Promise<GatewayFactoryResetResponsePayload>;
    resetSpace(payload: SpaceResetPayload): Promise<SpaceResetResponsePayload>;
    listLibraryEntries(payload?: LibraryListEntriesPayload): Promise<LibraryEntry[]>;
    getLibraryEntry(entryId: string, apiVersion?: string, includeContent?: boolean): Promise<LibraryEntry>;
    saveLibrarySkill(payload: LibrarySaveSkillPayload): Promise<LibrarySaveSkillResponsePayload>;
    importLibraryEntry(payload: LibraryImportEntryPayload): Promise<LibraryImportEntryResponsePayload>;
    archiveLibraryEntry(payload: LibraryArchiveEntryPayload): Promise<LibraryArchiveEntryResponsePayload>;
    setLibraryEntryEnabled(payload: LibrarySetEntryEnabledPayload): Promise<LibraryEntry>;
    deleteLibraryEntry(payload: LibraryDeleteEntryPayload): Promise<LibraryDeleteEntryResponsePayload>;
    scanLibraryEntries(apiVersion?: string): Promise<LibraryScanEntriesResponsePayload>;
    listSkillDrafts(apiVersion?: string): Promise<SkillDraft[]>;
    getSkillDraft(draftId: string, apiVersion?: string): Promise<SkillDraft>;
    createSkillDraft(payload: LibraryCreateSkillDraftPayload): Promise<LibraryCreateSkillDraftResponsePayload>;
    deleteSkillDraft(payload: LibraryDeleteSkillDraftPayload): Promise<LibraryDeleteSkillDraftResponsePayload>;
    /**
     * Submit an intent-level orchestrator command.
     */
    sendOrchestratorCommand(payload: OrchestratorCommandPayload): Promise<OrchestratorCommandResult>;
    /**
     * Get command lifecycle state by command ID.
     */
    getOrchestratorCommand(commandId: string, apiVersion?: string): Promise<OrchestratorCommandResult>;
    createSchedulerJob(payload: SchedulerCreateJobPayload): Promise<SchedulerJob>;
    getSchedulerJob(jobId: string, apiVersion?: string): Promise<SchedulerJob>;
    listSchedulerJobs(payload?: SchedulerListJobsPayload): Promise<SchedulerJob[]>;
    updateSchedulerJob(payload: SchedulerUpdateJobPayload): Promise<SchedulerJob>;
    deleteSchedulerJob(payload: SchedulerDeleteJobPayload): Promise<SchedulerDeleteJobResult>;
    linkSchedulerJobSpace(payload: SchedulerLinkSpacePayload): Promise<SchedulerJob>;
    unlinkSchedulerJobSpace(payload: SchedulerUnlinkSpacePayload): Promise<SchedulerJob>;
    listSchedulerJobRuns(payload: SchedulerListRunsPayload): Promise<SchedulerListRunsResult>;
    runSchedulerJobNow(payload: SchedulerRunNowPayload): Promise<SchedulerRunNowResult>;
    linkSpaces(payload: SpaceLinkPayload): Promise<SpaceLinkResult>;
    unlinkSpaces(payload: SpaceUnlinkPayload): Promise<boolean>;
    shareSpaceContext(payload: SpaceShareContextPayload): Promise<SharedContextRef>;
    pullSharedContext(payload: SpacePullSharedContextPayload): Promise<SpacePullSharedContextResult>;
    createSpaceShareInvite(payload: SpaceShareCreateInvitePayload): Promise<SpaceShareInvite>;
    joinSpaceShareInvite(payload: SpaceShareJoinPayload): Promise<SpaceParticipant>;
    revokeSpaceShareAccess(payload: SpaceShareRevokePayload): Promise<SpaceShareRevokeResult>;
    listSpaceParticipants(payload: SpaceShareListParticipantsPayload): Promise<SpaceParticipant[]>;
    announceSyncPeer(payload: SyncAnnouncePayload): Promise<SyncAnnounceResult>;
    querySyncResources(payload: SyncQueryResourcesPayload): Promise<SyncQueryResourcesResult>;
    pullSyncResources(payload: SyncPullResourcesPayload): Promise<SyncPullResourcesResult>;
    startSpeechSession(payload: SpeechStartPayload): Promise<SpeechEventPayload>;
    sendSpeechAudioChunk(payload: SpeechAudioChunkPayload): Promise<SpeechEventPayload[]>;
    controlSpeechSession(payload: SpeechControlPayload): Promise<SpeechEventPayload>;
    /**
     * Register native adapter providers with the gateway.
     */
    registerCapabilities(providers: AdapterCapabilityProvider[]): Promise<void>;
    /**
     * Deregister native adapter providers from the gateway.
     */
    deregisterCapabilities(providerIds: string[]): Promise<void>;
    /**
     * Send invocation success for a previously received `capability.invoke`.
     */
    sendCapabilityResult(payload: AdapterCapabilityResultPayload): Promise<void>;
    /**
     * Send invocation failure for a previously received `capability.invoke`.
     */
    sendCapabilityError(payload: AdapterCapabilityErrorPayload): Promise<void>;
    /**
     * Send a direct message to another agent in a space
     */
    sendAgentMessage(spaceId: string, fromAgentId: string, toAgentId: string, content: string, spaceUid?: string): Promise<void>;
    /**
     * Poke an idle agent to resume work
     */
    pokeAgent(spaceId: string, targetAgentId: string, reason: string, unblockedByTurnId?: string, spaceUid?: string): Promise<void>;
    /**
     * Declare a task dependency between turns
     */
    declareTaskDependency(spaceId: string, blockedTurnId: string, dependsOnTurnId: string, spaceUid?: string): Promise<void>;
    /**
     * Send a ping to the gateway
     */
    ping(): Promise<void>;
    /**
     * Subscribe to turn events
     */
    onTurnEvent(handler: TurnEventHandler): UnsubscribeHandler;
    /**
     * Subscribe to turn stream events
     */
    onTurnStream(handler: TurnStreamHandler): UnsubscribeHandler;
    /**
     * Subscribe to space state updates
     */
    onSpaceState(handler: SpaceStateHandler): UnsubscribeHandler;
    /**
     * Subscribe to profile-swap events for space agent assignments.
     */
    onSpaceAgentUpdated(handler: SpaceAgentUpdatedHandler): UnsubscribeHandler;
    /**
     * Subscribe to notifications
     */
    onNotification(handler: NotificationHandler): UnsubscribeHandler;
    /**
     * Subscribe to error events
     */
    onError(handler: ErrorHandler): UnsubscribeHandler;
    /**
     * Subscribe to inter-agent messages
     */
    onAgentMessage(handler: AgentMessageHandler): UnsubscribeHandler;
    /**
     * Subscribe to agent poke events
     */
    onAgentPoke(handler: AgentPokeHandler): UnsubscribeHandler;
    /**
     * Subscribe to agent idle notifications
     */
    onAgentIdle(handler: AgentIdleHandler): UnsubscribeHandler;
    /**
     * Subscribe to task dependency declarations
     */
    onTaskDependency(handler: TaskDependencyHandler): UnsubscribeHandler;
    /**
     * Subscribe to task dependency resolved notifications
     */
    onTaskDependencyResolved(handler: TaskDependencyResolvedHandler): UnsubscribeHandler;
    /**
     * Subscribe to orchestrator command lifecycle events.
     */
    onOrchestratorEvent(handler: OrchestratorEventHandler): UnsubscribeHandler;
    /**
     * Subscribe to speech session events.
     */
    onSpeechEvent(handler: SpeechEventHandler): UnsubscribeHandler;
    /**
     * Subscribe to adapter capability invocation requests.
     */
    onCapabilityInvoke(handler: CapabilityInvokeHandler): UnsubscribeHandler;
    private minimumRequestTimeout;
}
export default GatewayClient;
//# sourceMappingURL=gateway-client.d.ts.map
