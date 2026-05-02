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

export { generateAuthKeyPair, signChallenge } from "./gateway-auth.js";
export type { AuthKeyPair } from "./gateway-auth.js";
import { signChallenge, type AuthKeyPair } from "./gateway-auth.js";

// ---------------------------------------------------------------------------
// Protocol Types
// ---------------------------------------------------------------------------

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
  approvalGrant?: ApprovalGrantPayload;
}

export interface ApprovalGrantPayload {
  mode: GatewayToolApprovalGrantMode;
  ttlSeconds?: number;
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

export type SpaceAssignmentRole =
  | 'participant'
  | 'global_coordinator'
  | 'space_moderator';

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

export type ThinkingCapturePolicy = 'OFF' | 'SUMMARY' | 'FULL';
export type SpaceExperienceCaptureMode = 'INHERIT' | 'ENABLED' | 'DISABLED';
export type SpacePrivacyMode = 'STANDARD' | 'INCOGNITO_SESSION';

export interface SpaceMemoryPolicy {
  experienceCapture: SpaceExperienceCaptureMode;
  privacyMode: SpacePrivacyMode;
}

export interface GatewayMemoryDefaults {
  defaultExperienceCapture: SpaceExperienceCaptureMode;
  defaultSpacePrivacyMode: SpacePrivacyMode;
  updatedAt: string;
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
  thinkingCapturePolicy?: ThinkingCapturePolicy;
  memoryPolicy?: SpaceMemoryPolicy;
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

export interface SpaceGetMemoryPolicyPayload {
  apiVersion?: string;
  spaceId: string;
}

export interface SpaceGetMemoryPolicyResponsePayload {
  spaceId: string;
  memoryPolicy: SpaceMemoryPolicy;
}

export interface SpaceSetMemoryPolicyPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  memoryPolicy: SpaceMemoryPolicy;
}

export interface SpaceSetMemoryPolicyResponsePayload {
  space: SpaceSummary;
}

export interface SpaceEndIncognitoSessionPayload {
  apiVersion?: string;
  spaceId: string;
}

export interface SpaceEndIncognitoSessionResponsePayload {
  space: SpaceSummary;
  ended: boolean;
  reason: string;
  purgedAt?: string;
  sessionId?: string;
}

export interface GatewayGetMemoryDefaultsPayload {
  apiVersion?: string;
}

export interface GatewayGetMemoryDefaultsResponsePayload {
  defaults: GatewayMemoryDefaults;
}

export interface GatewaySetMemoryDefaultsPayload {
  apiVersion?: string;
  defaultExperienceCapture: SpaceExperienceCaptureMode;
  defaultSpacePrivacyMode?: SpacePrivacyMode;
}

export interface GatewaySetMemoryDefaultsResponsePayload {
  defaults: GatewayMemoryDefaults;
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

export interface SpaceListActivityLogPayload {
  apiVersion?: string;
  spaceId?: string;
  spaceUid?: string;
  turnId?: string;
  includeSystem?: boolean;
  limit?: number;
  offset?: number;
}

export interface SpaceActivityLogEntry {
  entryId: string;
  source: string;
  category: string;
  turnId?: string;
  rootTurnId?: string;
  summaryTurnId?: string;
  agentId?: string;
  actorId?: string;
  eventType: string;
  title: string;
  detail?: string;
  status?: string;
  visibility: string;
  toolCallId?: string;
  toolName?: string;
  createdAt: string;
  seq: number;
  payload: Record<string, unknown>;
}

export interface SpaceListActivityLogResponsePayload {
  spaceId: string;
  spaceUid: string;
  entries: SpaceActivityLogEntry[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetTurnTracePayload {
  apiVersion?: string;
  spaceId: string;
  turnId: string;
  limit?: number;
  offset?: number;
}

export interface SpaceTurnTraceEvent {
  eventId: string;
  seq: number;
  eventType: string;
  eventSubtype?: string;
  agentId?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface SpaceTurnTraceToolCall {
  toolCallId: string;
  toolName?: string;
  status: string;
  agentId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SpaceTurnTraceActivity {
  activityId: string;
  seq: number;
  eventType: string;
  agentId?: string;
  title: string;
  detail?: string;
  status?: string;
  visibility: string;
  toolCallId?: string;
  toolName?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface SpaceTurnTraceExecutionRun {
  executionId: string;
  stepIndex: number;
  agentId?: string;
  providerId?: string;
  modelId?: string;
  status: 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  workingDirectory?: string;
  exitCode?: number;
  commandPreview?: string;
  transcriptArtifactId?: string;
  transcriptTruncated: boolean;
}

export interface SpaceTurnTrace {
  spaceId: string;
  turnId: string;
  total: number;
  events: SpaceTurnTraceEvent[];
  toolCalls: SpaceTurnTraceToolCall[];
  activities: SpaceTurnTraceActivity[];
  executionRuns: SpaceTurnTraceExecutionRun[];
  artifactIds: string[];
}

export interface SpaceGetTurnTraceResponsePayload {
  trace: SpaceTurnTrace;
}

export interface SpaceGetArtifactPayload {
  apiVersion?: string;
  spaceId: string;
  artifactId: string;
}

export interface SpaceGetDebugArtifactPayload {
  apiVersion?: string;
  spaceId: string;
  artifactId: string;
}

export interface SpaceArtifactSummary {
  artifactId: string;
  spaceId: string;
  turnId?: string;
  agentId?: string;
  type: string;
  title: string;
  mimeType?: string;
  sizeBytes: number;
  tags: string[];
  visibility: 'shared' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface SpaceArtifactDetail extends SpaceArtifactSummary {
  content: string | Record<string, unknown>;
}

export interface SpaceListArtifactsPayload {
  apiVersion?: string;
  spaceId: string;
  turnId?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListArtifactsResponsePayload {
  artifacts: SpaceArtifactSummary[];
  total: number;
}

export interface SpaceGetArtifactResponsePayload {
  artifact: SpaceArtifactDetail;
}

export interface SpaceGetDebugArtifactResponsePayload {
  artifact: SpaceArtifactDetail;
}

export interface SpaceExperienceRecord {
  experienceId: string;
  spaceId: string;
  title?: string;
  summary?: string;
  observationSummary?: string;
  status?: string;
  sourceTurnId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListExperiencesPayload {
  apiVersion?: string;
  spaceId: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListExperiencesResponsePayload {
  experiences: SpaceExperienceRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetExperiencePayload {
  apiVersion?: string;
  spaceId: string;
  experienceId: string;
}

export interface SpaceGetExperienceResponsePayload {
  experience: SpaceExperienceRecord;
}

export interface SpacePersonalityInsightRecord {
  insightId: string;
  spaceId: string;
  experienceId?: string;
  agentId?: string;
  title?: string;
  summary?: string;
  rationale?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListInsightsPayload {
  apiVersion?: string;
  spaceId: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListInsightsResponsePayload {
  insights: SpacePersonalityInsightRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetInsightPayload {
  apiVersion?: string;
  spaceId: string;
  insightId: string;
}

export interface SpaceGetInsightResponsePayload {
  insight: SpacePersonalityInsightRecord;
}

export interface SpaceAcceptInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  notes?: string;
}

export interface SpaceRejectInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  reason?: string;
}

export interface SpaceDismissInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  reason?: string;
}

export interface SpaceInsightActionResponsePayload {
  insight: SpacePersonalityInsightRecord;
}

export interface SpaceAgentNotesRecord {
  spaceId: string;
  agentId: string;
  notes: string;
  updatedAt: string;
  createdAt?: string;
}

export interface SpaceGetSpaceAgentNotesPayload {
  apiVersion?: string;
  spaceId: string;
  agentId: string;
}

export interface SpaceUpdateSpaceAgentNotesPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  agentId: string;
  notes: string;
}

export interface SpaceAgentNotesResponsePayload {
  notes?: SpaceAgentNotesRecord | null;
}

export interface SpaceUserProfileRecord {
  principalId: string;
  displayName?: string;
  summary?: string;
  facts: string[];
  preferences: string[];
  corrections: string[];
  metadata?: Record<string, unknown>;
  updatedAt: string;
  createdAt?: string;
}

export interface SpaceGetUserProfilePayload {
  apiVersion?: string;
  principalId?: string;
}

export interface SpaceUpdateUserProfilePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  principalId?: string;
  displayName?: string;
  summary?: string;
  facts?: string[];
  preferences?: string[];
  corrections?: string[];
  metadata?: Record<string, unknown>;
}

export interface SpaceUserProfileResponsePayload {
  profile?: SpaceUserProfileRecord | null;
}

export interface SpaceMemoryRecord {
  memoryId: string;
  spaceId: string;
  principalId?: string;
  sourceType?: string;
  sourceId?: string;
  status?: string;
  scopeType?: string;
  scopeId?: string;
  category?: string;
  textPreview?: string;
  importance?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListMemoriesPayload {
  apiVersion?: string;
  spaceId: string;
  principalId?: string;
  sourceType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListMemoriesResponsePayload {
  memories: SpaceMemoryRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceDeleteMemoryPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  memoryId: string;
}

export interface SpaceDeleteMemoryResponsePayload {
  deleted: boolean;
  memoryId: string;
}

export interface SpaceUpdateMemoryImportancePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  memoryId: string;
  importance: number;
}

export interface SpaceUpdateMemoryImportanceResponsePayload {
  memory: SpaceMemoryRecord;
}

export interface ProfileModelConfig {
  preferredModels: string[];
  fallbackModels?: string[];
  constraints?: Record<string, unknown>;
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

export type CompiledInstructionSectionKey =
  | 'system_scaffold'
  | 'agent_definition'
  | 'persona'
  | 'skills'
  | 'policy_appendices'
  | 'workspace_context';

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

export type RuntimeSystemPromptSectionKey =
  | "agent_definition"
  | "persona"
  | "active_skill_context"
  | "workspace_context"
  | "conversation_prompt"
  | "assignment_context";

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

export type TemplateAgentProfileBinding = 'explicit' | 'gateway_default_main';

export interface TemplateAgentDefinition {
  agentId: string;
  agentDefinitionId?: string;
  profileId?: string;
  profileBinding?: TemplateAgentProfileBinding;
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
 * Gateway-to-Client: Turn event notification
 */
// ---------------------------------------------------------------------------
// Typed event payload union — mirrors gateway TypedTurnEventPayload
// ---------------------------------------------------------------------------

export interface TurnUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface TurnMetadata {
  modelId?: string;
  providerId?: string;
  durationMs?: number;
  finishReason?: string;
  startedAt?: string;
  completedAt?: string;
  tokensPerSecond?: number;
}

export type TypedTurnEventPayload =
  | { kind: 'turn.started'; agentId: string; turnId: string; rootTurnId?: string; conversationTopology?: string; transcriptVisibility?: string }
  | { kind: 'turn.completed'; agentId: string; usage?: TurnUsage; metadata?: TurnMetadata; finalMessage?: string; effectiveSafetyProfileId?: string }
  | { kind: 'turn.failed'; errorMessage: string; errorCode?: string }
  | { kind: 'reasoning.delta'; text: string }
  | { kind: 'tool.started'; toolCallId: string; toolName: string; arguments?: Record<string, unknown>; agentId?: string }
  | { kind: 'tool.completed'; toolCallId: string; toolName?: string; result: unknown; isError: boolean; agentId?: string }
  | { kind: 'state.changed'; state: 'idle' | 'thinking' | 'acting' | 'needs_feedback' | 'errored' }
  | { kind: 'approval.requested'; requestId: string; agentId: string; description: string; options: string[]; context?: Record<string, unknown> }
  | { kind: 'approval.resolved'; requestId: string; response: string; agentId?: string }
  | { kind: 'rate_limited'; retryAfterMs: number; attempt: number; maxAttempts: number; providerId: string; retryAt: string };

// ---------------------------------------------------------------------------

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
  streamKind?: 'assistant_output' | 'provider_client';
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
  providerIds?: string[];
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

export type GatewayToolDangerLevel = 'standard' | 'destructive';
export type GatewayToolHealthStatus = 'unknown' | 'ok' | 'degraded';
export type GatewayToolApprovalGrantMode = 'once' | 'time_window' | 'durable';
export type GatewayToolCwdMode = 'space_root' | 'fixed';
export type GatewayToolOutputMode = 'text' | 'json';

export interface GatewayToolExample {
  name: string;
  description?: string;
  arguments: Record<string, unknown>;
  expectedOutput?: string;
}

export interface GatewayTool {
  schemaVersion: number;
  id: string;
  providerId: string;
  displayName: string;
  description: string;
  bundleId?: string;
  bundleDisplayName?: string;
  bundleDescription?: string;
  toolGroupId?: string;
  toolGroupDisplayName?: string;
  executable: string;
  resolvedExecutable: string;
  argsTemplate: string[];
  inputSchema: Record<string, unknown>;
  instructions?: string;
  examples: GatewayToolExample[];
  timeoutMs: number;
  maxOutputBytes: number;
  cwdMode: GatewayToolCwdMode;
  fixedCwd?: string;
  outputMode: GatewayToolOutputMode;
  dangerLevel: GatewayToolDangerLevel;
  available: boolean;
  healthStatus: GatewayToolHealthStatus;
  healthMessage?: string;
  manifestPath: string;
  readmePath?: string;
  readmeContent?: string;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayToolApprovalGrant {
  principalId: string;
  deviceId: string;
  spaceId: string;
  toolId: string;
  mode: GatewayToolApprovalGrantMode;
  source: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  updatedAt: string;
}

export interface GatewayListToolsPayload {
  apiVersion?: string;
}

export interface GatewayGetToolPayload {
  apiVersion?: string;
  toolId: string;
}

export interface GatewayScaffoldToolPayload {
  apiVersion?: string;
  id: string;
  displayName: string;
  description: string;
  outputMode: GatewayToolOutputMode;
}

export interface GatewayRegisterToolPayload {
  apiVersion?: string;
  schemaVersion?: number;
  id: string;
  displayName: string;
  description: string;
  bundleId?: string;
  bundleDisplayName?: string;
  bundleDescription?: string;
  toolGroupId?: string;
  toolGroupDisplayName?: string;
  executable: string;
  argsTemplate: string[];
  inputSchema: Record<string, unknown>;
  instructions?: string;
  examples?: GatewayToolExample[];
  timeoutMs?: number;
  maxOutputBytes?: number;
  cwdMode: GatewayToolCwdMode;
  fixedCwd?: string;
  outputMode: GatewayToolOutputMode;
  dangerLevel?: GatewayToolDangerLevel;
  readme?: string;
}

export interface GatewayRemoveToolPayload {
  apiVersion?: string;
  toolId: string;
}

export interface GatewayScaffoldedToolBundle {
  manifest: GatewayRegisterToolPayload;
  readme: string;
}

export interface GatewayListToolsResponsePayload {
  tools: GatewayTool[];
}

export interface GatewayGetToolResponsePayload {
  tool: GatewayTool | null;
}

export interface GatewayScaffoldToolResponsePayload {
  manifest: GatewayRegisterToolPayload;
  readme: string;
}

export interface GatewayRegisterToolResponsePayload {
  tool: GatewayTool;
}

export interface GatewayRemoveToolResponsePayload {
  toolId: string;
  removed: boolean;
}

export interface GatewayListToolApprovalGrantsPayload {
  apiVersion?: string;
  principalId?: string;
  deviceId?: string;
  spaceId?: string;
  toolId?: string;
  includeRevoked?: boolean;
  includeExpired?: boolean;
}

export interface GatewayListToolApprovalGrantsResponsePayload {
  grants: GatewayToolApprovalGrant[];
}

export interface GatewayRevokeToolApprovalGrantPayload {
  apiVersion?: string;
  principalId?: string;
  deviceId?: string;
  spaceId: string;
  toolId: string;
  reason?: string;
}

export interface GatewayRevokeToolApprovalGrantResult {
  revoked: boolean;
  toolId: string;
  spaceId: string;
  grant?: GatewayToolApprovalGrant;
}

export type GatewayExternalConnectivityMode = "DISABLED" | "TAILSCALE";

export type GatewayExternalConnectivityState =
  | "disabled"
  | "unsupported"
  | "missing_dependency"
  | "logged_out"
  | "serve_missing"
  | "ready"
  | "error";

export interface GatewayExternalConnectivitySettings {
  mode: GatewayExternalConnectivityMode;
  funnelEnabled?: boolean | null;
  updatedAt: string;
}

export type GatewayExternalConnectivityFunnelState =
  | "disabled"
  | "unavailable"
  | "not_configured"
  | "ready"
  | "error";

export interface GatewayExternalConnectivityFunnelStatus {
  state: GatewayExternalConnectivityFunnelState;
  funnelConfigured: boolean;
  funnelUrl?: string;
  exposedPaths: string[];
  summary?: string;
  remediation?: string;
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
  funnelStatus?: GatewayExternalConnectivityFunnelStatus;
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
  funnelEnabled?: boolean | null;
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

export type VoiceProviderSource =
  | 'managed'
  | 'byok'
  | 'local_model'
  | 'apple_speech'
  | 'unknown';

export type VoiceChannel = 'stt' | 'tts';

export type VoiceProviderHealthStatus =
  | 'unknown'
  | 'healthy'
  | 'degraded'
  | 'unavailable';

export interface VoiceUsageSourceSummary extends VoiceUsageWindowSummary {
  source: VoiceProviderSource;
  usage?: VoiceUsageWindowSummary;
}

export interface VoiceUsageProviderSummary {
  channel: VoiceChannel;
  source: VoiceProviderSource;
  providerId: string;
  usage: VoiceUsageWindowSummary;
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
  byProvider?: VoiceUsageProviderSummary[];
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
  error?: { code: string; message: string };
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
export type SchedulerEvalSummaryMode = 'checkpoints' | 'final_summary';
export type SchedulerEvalRecommendationStatus = 'suggested' | 'applied';
export type SchedulerEvalRecommendationKind = 'flow_variant' | 'prompt_pack' | 'summary_mode';
export type SchedulerEvalScenarioStatus = 'pass' | 'fail' | 'skip';
export type SchedulerEvalCheckpointStatus = 'completed' | 'failed' | 'observed';

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

export interface SchedulerEvalConfig {
  evalDefinitionId: string;
  scenarioIds?: string[];
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  summaryMode?: SchedulerEvalSummaryMode;
  selfImproveEnabled?: boolean;
}

export interface SchedulerEvalSelfImproveState {
  enabled: boolean;
  appliedRevisionIds: string[];
  lastAppliedRunId?: string;
}

export interface SchedulerEvalCheckpoint {
  checkpointId: string;
  kind: string;
  status: SchedulerEvalCheckpointStatus;
  actorId?: string;
  createdAt: string;
  detail?: Record<string, unknown>;
}

export interface SchedulerEvalRecommendation {
  recommendationId: string;
  status: SchedulerEvalRecommendationStatus;
  kind: SchedulerEvalRecommendationKind;
  title: string;
  summary?: string;
  originatingRunId?: string;
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  appliedRevisionId?: string;
  createdAt: string;
  detail?: Record<string, unknown>;
}

export interface SchedulerEvalScenarioResult {
  scenarioId: string;
  status: SchedulerEvalScenarioStatus;
  checkpointCount: number;
  failureReason?: string;
}

export interface SchedulerEvalArtifactRef {
  kind: 'space' | 'turn' | 'scheduler_run';
  id: string;
  label?: string;
}

export interface SchedulerEvalRun {
  evalRunId: string;
  evalDefinitionId: string;
  scenarioIds: string[];
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  summaryMode: SchedulerEvalSummaryMode;
  selfImproveEnabled: boolean;
  spaceId?: string;
  spaceUid?: string;
  rootTurnId?: string;
  finalSummaryText?: string;
  artifactRefs: SchedulerEvalArtifactRef[];
  checkpoints: SchedulerEvalCheckpoint[];
  scenarioResults: SchedulerEvalScenarioResult[];
  recommendations: SchedulerEvalRecommendation[];
}

export interface SchedulerEvalDomain {
  domainId: string;
  description?: string;
  scenarioIds: string[];
}

export interface SchedulerEvalDefinition {
  evalDefinitionId: string;
  suiteId: string;
  description?: string;
  domainIds: string[];
  scenarioIds: string[];
  domains: SchedulerEvalDomain[];
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
  evalConfig?: SchedulerEvalConfig;
  evalSelfImproveState?: SchedulerEvalSelfImproveState;
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
  evalRun?: SchedulerEvalRun;
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
  evalConfig?: SchedulerEvalConfig;
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
  evalConfig?: SchedulerEvalConfig | null;
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

export interface SchedulerListEvalDefinitionsPayload {
  apiVersion?: string;
}

export interface SchedulerListEvalDefinitionsResult {
  definitions: SchedulerEvalDefinition[];
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

export type WorkbenchExecutionMode = 'supervised' | 'autonomous';
export type WorkbenchBatchStatus = 'draft' | 'queued' | 'running' | 'completed' | 'cancelled';
export type WorkbenchRunStatus = 'queued' | 'awaiting_review' | 'running' | 'completed' | 'failed' | 'cancelled';
export type WorkbenchRunStage = 'intake' | 'plan' | 'execute' | 'verify' | 'review_gate' | 'land' | 'report';
export type WorkbenchApprovalState = 'pending' | 'approved' | 'rejected' | 'not_required';
export type WorkbenchVerificationMode = 'machine_readable' | 'review_only';
export type WorkbenchVerificationSuiteStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export type WorkbenchVerificationResultStatus = 'pending' | 'passed' | 'failed';
export type WorkbenchLandingStatus = 'not_started' | 'blocked' | 'landed';
export type WorkbenchExecutionContextStage = 'planning' | 'implementation' | 'verification' | 'completed' | 'failed' | 'paused';

export interface WorkbenchExecutionModeEligibility {
  supervised: boolean;
  autonomous: boolean;
}

export interface WorkbenchQueueItem {
  queueItemId: string;
  queueIndex: number;
  title: string;
  type: string;
  status: string;
  nextAction: string;
  taskFilePath: string;
  delegation: string;
  parallelKeys: string[];
  aiShippable: boolean;
  executionModeEligibility: WorkbenchExecutionModeEligibility;
  verificationMode: WorkbenchVerificationMode;
  executionModeBlockers: string[];
  products: string[];
  verificationCommands: string[];
}

export interface WorkbenchBatch {
  batchId: string;
  name: string;
  status: WorkbenchBatchStatus;
  executionMode: WorkbenchExecutionMode;
  queueItemIds: string[];
  createdByPrincipalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchWorktreeRef {
  path: string;
  branchName: string;
  baseBranchName: string;
  createdAt: string;
}

export interface WorkbenchRepoTouch {
  repoId: string;
  repoPath: string;
  kind: 'meta' | 'submodule';
  committed: boolean;
}

export interface WorkbenchVerificationSuite {
  suiteId: string;
  name: string;
  command: string;
  status: WorkbenchVerificationSuiteStatus;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number;
  durationMs?: number;
  logArtifactId?: string;
  summary?: string;
}

export interface WorkbenchVerificationResult {
  status: WorkbenchVerificationResultStatus;
  summary?: string;
  completedAt?: string;
}

export interface WorkbenchLandingResult {
  status: WorkbenchLandingStatus;
  merged?: boolean;
  summary?: string;
  completedAt?: string;
}

export interface WorkbenchExecutionContext {
  spaceId: string;
  spaceUid?: string;
  spaceName: string;
  planningTurnId?: string;
  implementationTurnId?: string;
  stage: WorkbenchExecutionContextStage;
}

export interface WorkbenchRun {
  runId: string;
  batchId?: string;
  queueItemId: string;
  queueItemPath: string;
  status: WorkbenchRunStatus;
  currentStage: WorkbenchRunStage;
  executionMode: WorkbenchExecutionMode;
  approvalState: WorkbenchApprovalState;
  worktree?: WorkbenchWorktreeRef;
  touchedRepos: WorkbenchRepoTouch[];
  verificationMode: WorkbenchVerificationMode;
  executionModeBlockers: string[];
  verificationSuites: WorkbenchVerificationSuite[];
  verificationResult?: WorkbenchVerificationResult;
  landingResult?: WorkbenchLandingResult;
  executionContext?: WorkbenchExecutionContext;
  createdByPrincipalId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}

export interface WorkbenchArtifact {
  artifactId: string;
  runId: string;
  kind: string;
  title: string;
  contentType: string;
  contentText: string;
  createdAt: string;
}

export interface WorkbenchPolicy {
  defaultExecutionMode: WorkbenchExecutionMode;
  autonomousEnabled: boolean;
  maxParallelRuns: number;
  requireExplicitAutonomousOptIn: boolean;
  requireAiShippableForAutonomous: boolean;
  updatedAt: string;
}

export interface WorkbenchListQueuePayload {
  apiVersion?: string;
  limit?: number;
}

export interface WorkbenchGetQueueItemPayload {
  apiVersion?: string;
  queueItemId: string;
}

export interface WorkbenchCreateBatchPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  name: string;
  queueItemIds: string[];
  executionMode?: WorkbenchExecutionMode;
}

export interface WorkbenchListBatchesPayload {
  apiVersion?: string;
  limit?: number;
}

export interface WorkbenchUpdateBatchPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  batchId: string;
  name?: string;
  queueItemIds?: string[];
  executionMode?: WorkbenchExecutionMode;
  status?: WorkbenchBatchStatus;
}

export interface WorkbenchStartRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  queueItemId: string;
  batchId?: string;
  executionMode?: WorkbenchExecutionMode;
}

export interface WorkbenchRetryRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
}

export interface WorkbenchCancelRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
}

export interface WorkbenchListRunsPayload {
  apiVersion?: string;
  batchId?: string;
  queueItemId?: string;
  limit?: number;
}

export interface WorkbenchGetRunPayload {
  apiVersion?: string;
  runId: string;
}

export interface WorkbenchApproveStagePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
  stage?: WorkbenchRunStage;
}

export interface WorkbenchRejectStagePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
  stage?: WorkbenchRunStage;
  reason?: string;
}

export interface WorkbenchSetModePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId?: string;
  batchId?: string;
  executionMode: WorkbenchExecutionMode;
}

export interface WorkbenchSetModeResult {
  run?: WorkbenchRun;
  batch?: WorkbenchBatch;
}

export interface WorkbenchListArtifactsPayload {
  apiVersion?: string;
  runId: string;
}

export interface WorkbenchGetPolicyPayload {
  apiVersion?: string;
}

export interface WorkbenchUpdatePolicyPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  defaultExecutionMode?: WorkbenchExecutionMode;
  autonomousEnabled?: boolean;
  maxParallelRuns?: number;
  requireExplicitAutonomousOptIn?: boolean;
  requireAiShippableForAutonomous?: boolean;
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
  importedArtifacts: Array<{ sourceArtifactId: string; importedArtifactId: string }>;
  denied: Array<{ transferId: string; reason: string }>;
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
  locale?: string;
  sourceDevice?: string;
  enableTranscription?: boolean;
  enablePlayback?: boolean;
  agentId?: string;
  autoSubmitTurns?: boolean;
  preferredSource?: Exclude<VoiceProviderSource, 'unknown'>;
  preferredProviderId?: string;
  byokProviderId?: string;
  localModelProviderId?: string;
  appleSpeechProviderId?: string;
  allowByokFallback?: boolean;
  allowLocalFallback?: boolean;
  allowAppleSpeechFallback?: boolean;
  sttPreferences?: SpeechRoutePreferencesPayload;
  ttsPreferences?: SpeechRoutePreferencesPayload;
}

export interface SpeechAudioChunkPayload {
  apiVersion?: string;
  sessionId: string;
  sequence: number;
  sequenceNo?: number;
  audioBase64: string;
  sampleRateHz?: number;
  channels?: number;
  codec?: string;
  audioDurationSeconds?: number;
  ttsChars?: number;
  ttsSeconds?: number;
  transcriptText?: string;
  isFinal?: boolean;
  engineMetrics?: SpeechEngineMetricsPayload;
}

export interface SpeechControlPayload {
  apiVersion?: string;
  sessionId: string;
  command: 'stop' | 'interrupt' | 'end';
  reason?: string;
}

export interface SpeechEngineMetricsPayload {
  vadDetectionMs?: number;
  sttTranscriptionMs?: number;
  ttsFirstAudioMs?: number;
  ttsFullSynthesisMs?: number;
}

export interface SpeechRoutePreferencesPayload {
  channel: VoiceChannel;
  preferredSource?: Exclude<VoiceProviderSource, 'unknown'>;
  preferredProviderId?: string;
  byokProviderId?: string;
  localModelProviderId?: string;
  appleSpeechProviderId?: string;
  allowByokFallback?: boolean;
  allowLocalFallback?: boolean;
  allowAppleSpeechFallback?: boolean;
}

export interface VoiceRoutePayload {
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  providerId: string;
}

export interface VoiceProviderConfigPayload {
  providerId: string;
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  priority: number;
  healthStatus: VoiceProviderHealthStatus;
  costProfile?: string;
}

export interface VoiceLockDecisionPayload {
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  allowed: boolean;
  reason: string;
  retryAt?: string;
  fallbackHint?: string;
}

export interface VoiceFallbackEventPayload {
  channel: VoiceChannel;
  fromRoute?: VoiceRoutePayload;
  toRoute?: VoiceRoutePayload;
  reason: 'default' | 'manual_override' | 'quota_fallback' | 'local_forced';
  detail?: string;
}

export interface VoiceIntentDecisionPayload {
  intentType: 'space_content' | 'orchestration_command' | 'clarification_required';
  confidence: number;
  rationale?: string;
  clarificationPrompt?: string;
  capabilityId?: string;
}

export interface SpeechEventPayload {
  sessionId: string;
  spaceId: string;
  spaceUid: string;
  type?: string;
  message?: string;
  intent?: VoiceIntentDecisionPayload;
  state: 'idle' | 'running' | 'stopped' | 'interrupted' | 'ended';
  eventType: string;
  providerSource?: Exclude<VoiceProviderSource, 'unknown'>;
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
  sequenceNo?: number;
  reason?: string;
  emittedAt?: string;
  sttRoute?: VoiceRoutePayload;
  ttsRoute?: VoiceRoutePayload;
  lockDecision?: VoiceLockDecisionPayload;
  fallbackEvent?: VoiceFallbackEventPayload;
  providerConfigs?: VoiceProviderConfigPayload[];
  engineMetrics?: SpeechEngineMetricsPayload;
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
 * Pending request tracker for request/response correlation
 */
interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
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
export type CapabilityInvokeHandler = (
  request: AdapterCapabilityInvokePayload,
) => void | Promise<void>;
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
export class GatewayClient {
  private url: string;
  private clientType: string;
  private clientVersion: string;
  private deviceId?: string;
  private devicePublicKey?: string;
  private deviceProofSignature?: string;
  private reconnect: boolean;
  private reconnectIntervalMs: number;
  private maxReconnectAttempts: number;
  private maxReconnectDelayMs: number;
  private requestTimeoutMs: number;

  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private pendingRequests: Map<string, PendingRequest> = new Map();
  private turnEventHandlers: TurnEventHandler[] = [];
  private turnStreamHandlers: TurnStreamHandler[] = [];
  private spaceStateHandlers: SpaceStateHandler[] = [];
  private spaceAgentUpdatedHandlers: SpaceAgentUpdatedHandler[] = [];
  private notificationHandlers: NotificationHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private capabilityInvokeHandlers: CapabilityInvokeHandler[] = [];
  private agentMessageHandlers: AgentMessageHandler[] = [];
  private agentPokeHandlers: AgentPokeHandler[] = [];
  private agentIdleHandlers: AgentIdleHandler[] = [];
  private taskDependencyHandlers: TaskDependencyHandler[] = [];
  private taskDependencyResolvedHandlers: TaskDependencyResolvedHandler[] = [];
  private orchestratorEventHandlers: OrchestratorEventHandler[] = [];
  private speechEventHandlers: SpeechEventHandler[] = [];

  private authKeyPair: AuthKeyPair | null = null;

  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  constructor(options: GatewayClientOptions) {
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
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.addEventListener('open', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.onOpenCallback?.();
          resolve();
        });

        this.ws.addEventListener('message', (event: MessageEvent) => {
          this.handleMessage(event.data);
        });

        this.ws.addEventListener('close', () => {
          this.connected = false;
          this.onCloseCallback?.();
          this.attemptReconnect();
        });

        this.ws.addEventListener('error', (event: Event) => {
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
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the Spaceskit
   */
  async disconnect(): Promise<void> {
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
  get isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error('Max reconnection attempts reached');
      this.onErrorCallback?.(error);
      return;
    }

    this.reconnectAttempts++;
    const exponential =
      this.reconnectIntervalMs * Math.pow(2, this.reconnectAttempts - 1);
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
  private async send<T>(type: string, payload: T): Promise<string> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const messageId = crypto.randomUUID();
    const message: GatewayMessage<T> = {
      type,
      id: messageId,
      ts: new Date().toISOString(),
      payload,
    };

    this.ws!.send(JSON.stringify(message));
    return messageId;
  }

  /**
   * Send a message and wait for a response
   */
  private async sendAndWaitForResponse<T, R>(
    type: string,
    payload: T,
    timeoutMs: number = this.requestTimeoutMs,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      this.send(type, payload)
        .then((messageId) => {
          const timeout = setTimeout(() => {
            this.pendingRequests.delete(messageId);
            reject(new Error(`Request timeout: ${type}`));
          }, timeoutMs);

          this.pendingRequests.set(messageId, {
            resolve: resolve as (value: unknown) => void,
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
  private handleMessage(data: string): void {
    try {
      const message: GatewayMessage = JSON.parse(data);
      const { type, id, replyTo, payload } = message;

      // Check if this is a response to a pending request
      if (replyTo && this.pendingRequests.has(replyTo)) {
        const pending = this.pendingRequests.get(replyTo)!;
        this.pendingRequests.delete(replyTo);
        clearTimeout(pending.timeout);

        if (type === 'error') {
          pending.reject(new Error((payload as ErrorPayload).message));
        } else {
          pending.resolve(payload);
        }
        return;
      }

      // Handle unsolicited messages
      switch (type) {
        case 'auth_challenge':
          this.handleAuthChallenge(payload as AuthChallengePayload);
          break;
        case 'auth_result':
          this.handleAuthResult(payload as AuthResultPayload);
          break;
        case 'turn_event':
          this.handleTurnEvent(payload as TurnEventPayload | Record<string, unknown>);
          break;
        case 'turn_stream':
          this.handleTurnStream(payload as TurnStreamPayload | Record<string, unknown>);
          break;
        case 'capability.invoke':
          this.handleCapabilityInvoke(payload as AdapterCapabilityInvokePayload);
          break;
        case 'space_state':
          this.handleSpaceState(payload as SpaceStatePayload);
          break;
        case 'space.agent_updated':
          this.spaceAgentUpdatedHandlers.forEach((handler) => handler(payload as SpaceAgentUpdatedEventPayload));
          break;
        case 'notification':
          this.handleNotification(payload as NotificationPayload);
          break;
        case 'error':
          this.handleError(payload as ErrorPayload);
          break;
        case 'agent_message':
          this.agentMessageHandlers.forEach((handler) => handler(payload as AgentMessagePayload));
          break;
        case 'agent_poke':
          this.agentPokeHandlers.forEach((handler) => handler(payload as AgentPokePayload));
          break;
        case 'agent_idle':
          this.agentIdleHandlers.forEach((handler) => handler(payload as AgentIdlePayload));
          break;
        case 'task_dependency':
          this.taskDependencyHandlers.forEach((handler) => handler(payload as TaskDependencyPayload));
          break;
        case 'task_dependency_resolved':
          this.taskDependencyResolvedHandlers.forEach((handler) => handler(payload as TaskDependencyResolvedPayload));
          break;
        case 'orchestrator.event':
          this.orchestratorEventHandlers.forEach((handler) => handler(payload as OrchestratorEventPayload));
          break;
        case 'speech.event':
          this.speechEventHandlers.forEach((handler) => handler(payload as SpeechEventPayload));
          break;
        case 'pong':
          // Silently handle pong
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    } catch (error) {
      const err = new Error(`Failed to parse message: ${error}`);
      this.onErrorCallback?.(err);
    }
  }

  /**
   * Set the authentication key pair for challenge-response auth.
   * Must be called before `connect()` if the gateway requires authentication.
   * Generate a key pair with `generateAuthKeyPair()`.
   */
  setAuthKeyPair(keyPair: AuthKeyPair): void {
    this.authKeyPair = keyPair;
  }

  /**
   * Handle authentication challenge — auto-signs if key pair is set.
   */
  private handleAuthChallenge(payload: AuthChallengePayload): void {
    if (payload.challenge && this.authKeyPair) {
      // Auto-sign the challenge and send AUTHENTICATE
      signChallenge(payload.challenge, this.authKeyPair.privateKey)
        .then((signature) => {
          const effectiveDeviceProofSignature = this.deviceProofSignature
            ?? (
              this.deviceId
              && this.devicePublicKey
              && this.devicePublicKey === this.authKeyPair!.publicKeyBase64
                ? signature
                : undefined
            );

          // Connection may close while challenge signing is in-flight.
          // Skip authenticate send in that case to avoid unhandled rejections.
          if (!this.isConnected) return;
          return this.send<AuthenticatePayload>('authenticate', {
            publicKey: this.authKeyPair!.publicKeyBase64,
            signature,
            clientType: this.clientType,
            clientVersion: this.clientVersion,
            deviceId: this.deviceId,
            devicePublicKey: this.devicePublicKey,
            deviceProofSignature: effectiveDeviceProofSignature,
          });
        })
        .catch((err) => {
          const error: ErrorPayload = {
            code: 'AUTH_SIGN_FAILED',
            message: `Failed to sign auth challenge: ${err}`,
          };
          this.errorHandlers.forEach((handler) => handler(error));
        });
      return;
    }

    if (!payload.success) {
      const error: ErrorPayload = {
        code: 'AUTH_CHALLENGE',
        message: payload.reason || 'Authentication challenge failed',
      };
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }

  /**
   * Handle authentication result
   */
  private handleAuthResult(payload: AuthResultPayload): void {
    if (!payload.success) {
      const error: ErrorPayload = {
        code: 'AUTH_FAILED',
        message: payload.reason || 'Authentication failed',
      };
      this.errorHandlers.forEach((handler) => handler(error));
    }
  }

  /**
   * Handle turn event
   */
  private handleTurnEvent(payload: TurnEventPayload | Record<string, unknown>): void {
    const normalized = this.normalizeTurnEventPayload(payload);
    this.turnEventHandlers.forEach((handler) => handler(normalized));
  }

  /**
   * Handle turn stream
   */
  private handleTurnStream(payload: TurnStreamPayload | Record<string, unknown>): void {
    const normalized = this.normalizeTurnStreamPayload(payload);
    if (!normalized) return;
    this.turnStreamHandlers.forEach((handler) => handler(normalized));
  }

  private normalizeTurnEventPayload(payload: TurnEventPayload | Record<string, unknown>): TurnEventPayload {
    const candidate = payload as Record<string, unknown>;
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

    const rootTurnId = this.pickNonEmptyString(candidate.rootTurnId);
    const agentId = this.pickNonEmptyString(candidate.agentId);
    const conversationTopology = this.pickNonEmptyString(candidate.conversationTopology) as TurnEventPayload['conversationTopology'];
    const transcriptVisibility = this.pickNonEmptyString(candidate.transcriptVisibility) as TurnEventPayload['transcriptVisibility'];
    const typedPayload = candidate.typedPayload && typeof candidate.typedPayload === 'object' && 'kind' in (candidate.typedPayload as Record<string, unknown>)
      ? candidate.typedPayload as TypedTurnEventPayload
      : undefined;
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
      ts,
    };
  }

  private normalizeTurnStreamPayload(
    payload: TurnStreamPayload | Record<string, unknown>,
  ): TurnStreamPayload | null {
    const candidate = payload as Record<string, unknown>;
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
    const rootTurnId = this.pickNonEmptyString(candidate.rootTurnId);
    const conversationTopology = this.pickNonEmptyString(candidate.conversationTopology) as TurnStreamPayload['conversationTopology'];
    const transcriptVisibility = this.pickNonEmptyString(candidate.transcriptVisibility) as TurnStreamPayload['transcriptVisibility'];
    const summaryTurnId = this.pickNonEmptyString(candidate.summaryTurnId);
    const streamKind = this.pickNonEmptyString(candidate.streamKind) as TurnStreamPayload['streamKind'];
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
      done,
    };
  }

  private mapNestedTurnEventType(typeRaw?: string): string | undefined {
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

  private pickNonEmptyString(value: unknown): string | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private readRecord(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    return value as Record<string, unknown>;
  }

  private coerceInteger(value: unknown, fallback: number): number {
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

  private coerceBoolean(value: unknown, fallback: boolean): boolean {
    if (typeof value === 'boolean') return value;
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

  private normalizeSpaceTurnTrace(trace: SpaceTurnTrace): SpaceTurnTrace {
    return {
      ...trace,
      events: Array.isArray(trace.events) ? trace.events : [],
      toolCalls: Array.isArray(trace.toolCalls) ? trace.toolCalls : [],
      activities: Array.isArray(trace.activities) ? trace.activities : [],
      executionRuns: Array.isArray(trace.executionRuns) ? trace.executionRuns : [],
      artifactIds: Array.isArray(trace.artifactIds) ? trace.artifactIds : [],
    };
  }

  /**
   * Handle adapter capability invocation.
   */
  private handleCapabilityInvoke(payload: AdapterCapabilityInvokePayload): void {
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
  private handleSpaceState(payload: SpaceStatePayload): void {
    this.spaceStateHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Handle notification
   */
  private handleNotification(payload: NotificationPayload): void {
    this.notificationHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Handle error
   */
  private handleError(payload: ErrorPayload): void {
    this.errorHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Execute a turn in a space
   */
  async executeTurn(options: ExecuteTurnOptions): Promise<TurnResult>;
  async executeTurn(
    spaceUid: string,
    input: string,
    targetAgentId?: string,
  ): Promise<TurnResult>;
  async executeTurn(
    optionsOrSpaceUid: ExecuteTurnOptions | string,
    input?: string,
    targetAgentId?: string,
  ): Promise<TurnResult> {
    const options: ExecuteTurnOptions = typeof optionsOrSpaceUid === 'string'
      ? {
          spaceUid: optionsOrSpaceUid,
          input: input ?? '',
          targetAgentId,
        }
      : optionsOrSpaceUid;
    const payload: ExecuteTurnPayload = {
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

    const result = await this.sendAndWaitForResponse<
      ExecuteTurnPayload,
      TurnResult
    >('execute_turn', payload);
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
  async ensureMainSpace(
    options: MainSpaceBootstrapOptions = {},
  ): Promise<MainSpaceBootstrapResult> {
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
  async connectAndBootstrapMainSpace(
    options: MainSpaceBootstrapOptions = {},
  ): Promise<ConnectAndBootstrapResult> {
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
  async resumeFeedback(
    spaceUid: string,
    turnId: string,
    response: 'approve' | 'reject' | 'revise' | 'defer',
    revision?: string,
    approvalGrant?: ApprovalGrantPayload,
  ): Promise<void> {
    const payload: ResumeFeedbackPayload = {
      spaceUid,
      turnId,
      response,
      revision,
      approvalGrant,
    };

    await this.sendAndWaitForResponse<ResumeFeedbackPayload, void>(
      'resume_feedback',
      payload,
    );
  }

  /**
   * Subscribe to space events
   */
  async subscribe(spaceUids: string[]): Promise<void> {
    const payload: SubscribePayload = {
      spaceUids,
    };
    await this.sendAndWaitForResponse<SubscribePayload, void>(
      'subscribe',
      payload,
    );
  }

  /**
   * Invoke a capability
   */
  async invokeCapability(
    capability: string,
    method: string,
    params: Record<string, unknown>,
    targetProvider?: string,
  ): Promise<CapabilityResult> {
    const payload: CapabilityInvokePayload = {
      capability,
      method,
      params,
      targetProvider,
    };

    const result = await this.sendAndWaitForResponse<
      CapabilityInvokePayload,
      CapabilityResult
    >('capability_invoke', payload);
    return result;
  }

  /**
   * Create a new space.
   */
  async createSpace(payload: SpaceCreatePayload): Promise<SpaceSummary> {
    const result = await this.sendAndWaitForResponse<
      SpaceCreatePayload,
      SpaceCreateResponsePayload
    >('space.create', payload);
    return result.space;
  }

  /**
   * Get a space by ID.
   */
  async getSpace(spaceId: string, apiVersion?: string): Promise<SpaceSummary> {
    const payload: SpaceGetPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceGetPayload,
      SpaceGetResponsePayload
    >('space.get', payload);
    return result.space;
  }

  /**
   * List spaces with optional filters.
   */
  async listSpaces(payload: SpaceListPayload = {}): Promise<SpaceSummary[]> {
    const result = await this.sendAndWaitForResponse<
      SpaceListPayload,
      SpaceListResponsePayload
    >('space.list', payload);
    return result.spaces;
  }

  /**
   * Archive a space on the gateway.
   */
  async archiveSpace(payload: SpaceArchivePayload): Promise<SpaceArchiveResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceArchivePayload,
      SpaceArchiveResponsePayload
    >('space.archive', payload);
  }

  /**
   * Soft-delete a space on the gateway.
   */
  async deleteSpace(payload: SpaceDeletePayload): Promise<SpaceDeleteResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceDeletePayload,
      SpaceDeleteResponsePayload
    >('space.delete', payload);
  }

  /**
   * Add an agent assignment to a space.
   */
  async addAgent(payload: SpaceAddAgentPayload): Promise<SpaceAddAgentResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceAddAgentPayload,
      SpaceAddAgentResponsePayload
    >('space.add_agent', payload);
  }

  /**
   * Remove an agent assignment from a space.
   */
  async removeAgent(payload: SpaceRemoveAgentPayload): Promise<SpaceRemoveAgentResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceRemoveAgentPayload,
      SpaceRemoveAgentResponsePayload
    >('space.remove_agent', payload);
  }

  /**
   * Update an existing assignment in a space.
   */
  async updateAgentAssignment(
    payload: SpaceUpdateAgentAssignmentPayload,
  ): Promise<SpaceUpdateAgentAssignmentResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceUpdateAgentAssignmentPayload,
      SpaceUpdateAgentAssignmentResponsePayload
    >('space.update_agent_assignment', payload);
  }

  /**
   * Set the orchestrator profile for a space.
   */
  async setSpaceOrchestrator(payload: SpaceSetOrchestratorPayload): Promise<SpaceSummary> {
    const result = await this.sendAndWaitForResponse<
      SpaceSetOrchestratorPayload,
      SpaceGetResponsePayload
    >('space.set_orchestrator', payload);
    return result.space;
  }

  /**
   * List all assignments for a space.
   */
  async listAgentAssignments(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceAgentAssignment[]> {
    const payload: SpaceListAgentAssignmentsPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceListAgentAssignmentsPayload,
      SpaceListAgentAssignmentsResponsePayload
    >('space.list_agent_assignments', payload);
    return result.assignments;
  }

  /**
   * Get per-space MCP endpoint configuration.
   */
  async getSpaceMcpEndpoint(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceGetMcpEndpointResponsePayload> {
    const payload: SpaceGetMcpEndpointPayload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse<
      SpaceGetMcpEndpointPayload,
      SpaceGetMcpEndpointResponsePayload
    >('space.get_mcp_endpoint', payload);
  }

  /**
   * Create or update per-space MCP endpoint configuration.
   */
  async setSpaceMcpEndpoint(
    payload: SpaceSetMcpEndpointPayload,
  ): Promise<SpaceMcpEndpoint> {
    const result = await this.sendAndWaitForResponse<
      SpaceSetMcpEndpointPayload,
      SpaceSetMcpEndpointResponsePayload
    >('space.set_mcp_endpoint', payload);
    return result.endpoint;
  }

  /**
   * Remove per-space MCP endpoint configuration.
   */
  async clearSpaceMcpEndpoint(
    spaceId: string,
    apiVersion?: string,
  ): Promise<boolean> {
    const payload: SpaceClearMcpEndpointPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceClearMcpEndpointPayload,
      SpaceClearMcpEndpointResponsePayload
    >('space.clear_mcp_endpoint', payload);
    return result.cleared;
  }

  /**
   * Discover MCP-backed external agents available to a space.
   */
  async discoverSpaceMcpAgents(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceDiscoverMcpAgentsResponsePayload> {
    const payload: SpaceDiscoverMcpAgentsPayload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse<
      SpaceDiscoverMcpAgentsPayload,
      SpaceDiscoverMcpAgentsResponsePayload
    >('space.discover_mcp_agents', payload);
  }

  /**
   * Approve one discovered MCP agent into a space as an external participant.
   */
  async approveSpaceMcpAgent(
    payload: SpaceApproveMcpAgentPayload,
  ): Promise<SpaceApproveMcpAgentResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceApproveMcpAgentPayload,
      SpaceApproveMcpAgentResponsePayload
    >('space.approve_mcp_agent', payload);
  }

  /**
   * Add one skill assignment to a space.
   */
  async addSkillToSpace(payload: SpaceAddSkillPayload): Promise<SpaceAddSkillResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceAddSkillPayload,
      SpaceAddSkillResponsePayload
    >("space.add_skill", payload);
  }

  /**
   * Remove one skill assignment from a space.
   */
  async removeSkillFromSpace(payload: SpaceRemoveSkillPayload): Promise<SpaceRemoveSkillResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceRemoveSkillPayload,
      SpaceRemoveSkillResponsePayload
    >("space.remove_skill", payload);
  }

  /**
   * List current skill assignments for a space.
   */
  async listSpaceSkills(spaceId: string, apiVersion?: string): Promise<string[]> {
    const payload: SpaceListSkillsPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceListSkillsPayload,
      SpaceListSkillsResponsePayload
    >("space.list_skills", payload);
    return result.skills;
  }

  /**
   * Get effective workspace configuration for a space.
   */
  async getSpaceWorkspace(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceWorkspace> {
    const payload: SpaceGetWorkspacePayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceGetWorkspacePayload,
      SpaceGetWorkspaceResponsePayload
    >("space.get_workspace", payload);
    return result.workspace;
  }

  /**
   * Set or clear the folder binding for a space.
   */
  async setSpaceWorkspace(
    payload: SpaceSetWorkspacePayload,
  ): Promise<SpaceWorkspace> {
    const result = await this.sendAndWaitForResponse<
      SpaceSetWorkspacePayload,
      SpaceSetWorkspaceResponsePayload
    >("space.set_workspace", payload);
    return result.workspace;
  }

  /**
   * Add one resource assignment to a space.
   */
  async addSpaceResource(payload: SpaceAddResourcePayload): Promise<SpaceResource> {
    const result = await this.sendAndWaitForResponse<
      SpaceAddResourcePayload,
      SpaceAddResourceResponsePayload
    >("space.add_resource", payload);
    return result.resource;
  }

  /**
   * Remove one resource assignment from a space.
   */
  async removeSpaceResource(payload: SpaceRemoveResourcePayload): Promise<boolean> {
    const result = await this.sendAndWaitForResponse<
      SpaceRemoveResourcePayload,
      SpaceRemoveResourceResponsePayload
    >("space.remove_resource", payload);
    return result.removed;
  }

  /**
   * List resource assignments for a space.
   */
  async listSpaceResources(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceResource[]> {
    const payload: SpaceListResourcesPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceListResourcesPayload,
      SpaceListResourcesResponsePayload
    >("space.list_resources", payload);
    return result.resources;
  }

  /**
   * List redacted orchestration journal entries for a space.
   */
  async listOrchestrationJournal(
    payload: SpaceListOrchestrationJournalPayload,
  ): Promise<SpaceListOrchestrationJournalResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceListOrchestrationJournalPayload,
      SpaceListOrchestrationJournalResponsePayload
    >("space.list_orchestration_journal", payload);
  }

  async getSpaceMemoryPolicy(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceMemoryPolicy> {
    const payload: SpaceGetMemoryPolicyPayload = { apiVersion, spaceId };
    const result = await this.sendAndWaitForResponse<
      SpaceGetMemoryPolicyPayload,
      SpaceGetMemoryPolicyResponsePayload
    >("space.get_memory_policy", payload);
    return result.memoryPolicy;
  }

  async setSpaceMemoryPolicy(
    payload: SpaceSetMemoryPolicyPayload,
  ): Promise<SpaceSummary> {
    const result = await this.sendAndWaitForResponse<
      SpaceSetMemoryPolicyPayload,
      SpaceSetMemoryPolicyResponsePayload
    >("space.set_memory_policy", payload);
    return result.space;
  }

  async endIncognitoSession(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceEndIncognitoSessionResponsePayload> {
    const payload: SpaceEndIncognitoSessionPayload = { apiVersion, spaceId };
    return this.sendAndWaitForResponse<
      SpaceEndIncognitoSessionPayload,
      SpaceEndIncognitoSessionResponsePayload
    >("space.end_incognito_session", payload);
  }

  async listActivityLog(
    payload: SpaceListActivityLogPayload,
  ): Promise<SpaceListActivityLogResponsePayload> {
    const result = await this.sendAndWaitForResponse<
      SpaceListActivityLogPayload,
      SpaceListActivityLogResponsePayload
    >("space.list_activity_log", payload);
    return {
      ...result,
      entries: result.entries ?? [],
      total: result.total ?? (result.entries?.length ?? 0),
    };
  }

  async getTurnTrace(payload: SpaceGetTurnTracePayload): Promise<SpaceTurnTrace> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetTurnTracePayload,
      SpaceGetTurnTraceResponsePayload | SpaceTurnTrace
    >("space.get_turn_trace", payload);
    const trace = 'trace' in result ? result.trace : result;
    return this.normalizeSpaceTurnTrace(trace);
  }

  async listSpaceArtifacts(
    payload: SpaceListArtifactsPayload,
  ): Promise<SpaceListArtifactsResponsePayload> {
    const result = await this.sendAndWaitForResponse<
      SpaceListArtifactsPayload,
      SpaceListArtifactsResponsePayload
    >("space.list_artifacts", payload);
    return {
      ...result,
      artifacts: result.artifacts ?? [],
      total: result.total ?? (result.artifacts?.length ?? 0),
    };
  }

  async getSpaceArtifact(payload: SpaceGetArtifactPayload): Promise<SpaceArtifactDetail> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetArtifactPayload,
      SpaceGetArtifactResponsePayload
    >("space.get_artifact", payload);
    return result.artifact;
  }

  async getSpaceDebugArtifact(payload: SpaceGetDebugArtifactPayload): Promise<SpaceArtifactDetail> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetDebugArtifactPayload,
      SpaceGetDebugArtifactResponsePayload
    >("space.get_debug_artifact", payload);
    return result.artifact;
  }

  async listExperiences(
    payload: SpaceListExperiencesPayload,
  ): Promise<SpaceListExperiencesResponsePayload> {
    const result = await this.sendAndWaitForResponse<
      SpaceListExperiencesPayload,
      SpaceListExperiencesResponsePayload
    >("space.list_experiences", payload);
    return {
      ...result,
      experiences: result.experiences ?? [],
      total: result.total ?? (result.experiences?.length ?? 0),
    };
  }

  async getExperience(
    payload: SpaceGetExperiencePayload,
  ): Promise<SpaceExperienceRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetExperiencePayload,
      SpaceGetExperienceResponsePayload
    >("space.get_experience", payload);
    return result.experience;
  }

  async listInsights(
    payload: SpaceListInsightsPayload,
  ): Promise<SpaceListInsightsResponsePayload> {
    const result = await this.sendAndWaitForResponse<
      SpaceListInsightsPayload,
      SpaceListInsightsResponsePayload
    >("space.list_insights", payload);
    return {
      ...result,
      insights: result.insights ?? [],
      total: result.total ?? (result.insights?.length ?? 0),
    };
  }

  async getInsight(payload: SpaceGetInsightPayload): Promise<SpacePersonalityInsightRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetInsightPayload,
      SpaceGetInsightResponsePayload
    >("space.get_insight", payload);
    return result.insight;
  }

  async acceptInsight(payload: SpaceAcceptInsightPayload): Promise<SpacePersonalityInsightRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceAcceptInsightPayload,
      SpaceInsightActionResponsePayload
    >("space.accept_insight", payload);
    return result.insight;
  }

  async rejectInsight(payload: SpaceRejectInsightPayload): Promise<SpacePersonalityInsightRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceRejectInsightPayload,
      SpaceInsightActionResponsePayload
    >("space.reject_insight", payload);
    return result.insight;
  }

  async dismissInsight(payload: SpaceDismissInsightPayload): Promise<SpacePersonalityInsightRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceDismissInsightPayload,
      SpaceInsightActionResponsePayload
    >("space.dismiss_insight", payload);
    return result.insight;
  }

  async getSpaceAgentNotes(
    payload: SpaceGetSpaceAgentNotesPayload,
  ): Promise<SpaceAgentNotesRecord | null | undefined> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetSpaceAgentNotesPayload,
      SpaceAgentNotesResponsePayload
    >("space.get_space_agent_notes", payload);
    return result.notes;
  }

  async updateSpaceAgentNotes(
    payload: SpaceUpdateSpaceAgentNotesPayload,
  ): Promise<SpaceAgentNotesRecord | null | undefined> {
    const result = await this.sendAndWaitForResponse<
      SpaceUpdateSpaceAgentNotesPayload,
      SpaceAgentNotesResponsePayload
    >("space.update_space_agent_notes", payload);
    return result.notes;
  }

  async getUserProfile(
    payload: SpaceGetUserProfilePayload = {},
  ): Promise<SpaceUserProfileRecord | null | undefined> {
    const result = await this.sendAndWaitForResponse<
      SpaceGetUserProfilePayload,
      SpaceUserProfileResponsePayload
    >("space.get_user_profile", payload);
    return result.profile;
  }

  async updateUserProfile(
    payload: SpaceUpdateUserProfilePayload,
  ): Promise<SpaceUserProfileRecord | null | undefined> {
    const result = await this.sendAndWaitForResponse<
      SpaceUpdateUserProfilePayload,
      SpaceUserProfileResponsePayload
    >("space.update_user_profile", payload);
    return result.profile;
  }

  async listMemories(
    payload: SpaceListMemoriesPayload,
  ): Promise<SpaceListMemoriesResponsePayload> {
    const result = await this.sendAndWaitForResponse<
      SpaceListMemoriesPayload,
      SpaceListMemoriesResponsePayload
    >("space.list_memories", payload);
    return {
      ...result,
      memories: result.memories ?? [],
      total: result.total ?? (result.memories?.length ?? 0),
    };
  }

  async deleteMemory(
    payload: SpaceDeleteMemoryPayload,
  ): Promise<SpaceDeleteMemoryResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceDeleteMemoryPayload,
      SpaceDeleteMemoryResponsePayload
    >("space.delete_memory", payload);
  }

  async updateMemoryImportance(
    payload: SpaceUpdateMemoryImportancePayload,
  ): Promise<SpaceMemoryRecord> {
    const result = await this.sendAndWaitForResponse<
      SpaceUpdateMemoryImportancePayload,
      SpaceUpdateMemoryImportanceResponsePayload
    >("space.update_memory_importance", payload);
    return result.memory;
  }

  /**
   * List agent definitions, optionally including archived entries.
   */
  async listAgentDefinitions(
    payload: IdentityListAgentDefinitionsPayload = {},
  ): Promise<AgentDefinitionSummary[]> {
    const result = await this.sendAndWaitForResponse<
      IdentityListAgentDefinitionsPayload,
      IdentityListAgentDefinitionsResponsePayload
    >("identity.list_agent_definitions", payload);
    return result.agentDefinitions;
  }

  /**
   * Fetch one agent definition by ID.
   */
  async getAgentDefinition(
    agentDefinitionId: string,
    apiVersion?: string,
  ): Promise<AgentDefinitionSummary> {
    const payload: IdentityGetAgentDefinitionPayload = { apiVersion, agentDefinitionId };
    const result = await this.sendAndWaitForResponse<
      IdentityGetAgentDefinitionPayload,
      IdentityGetAgentDefinitionResponsePayload
    >("identity.get_agent_definition", payload);
    return result.agentDefinition;
  }

  async createAgentDefinition(
    payload: IdentityCreateAgentDefinitionPayload,
  ): Promise<AgentDefinitionCreateResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityCreateAgentDefinitionPayload,
      IdentityCreateAgentDefinitionResponsePayload
    >("identity.create_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      created: result.created,
    };
  }

  async updateAgentDefinition(
    payload: IdentityUpdateAgentDefinitionPayload,
  ): Promise<AgentDefinitionUpdateResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityUpdateAgentDefinitionPayload,
      IdentityUpdateAgentDefinitionResponsePayload
    >("identity.update_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      newRevision: result.newRevision,
    };
  }

  async archiveAgentDefinition(
    payload: IdentityArchiveAgentDefinitionPayload,
  ): Promise<AgentDefinitionArchiveResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityArchiveAgentDefinitionPayload,
      IdentityArchiveAgentDefinitionResponsePayload
    >("identity.archive_agent_definition", payload);
    return {
      agentDefinition: result.agentDefinition,
      archived: result.archived,
    };
  }

  async listPersonas(payload: IdentityListPersonasPayload = {}): Promise<PersonaSummary[]> {
    const result = await this.sendAndWaitForResponse<
      IdentityListPersonasPayload,
      IdentityListPersonasResponsePayload
    >("identity.list_personas", payload);
    return result.personas;
  }

  async getPersona(personaId: string, apiVersion?: string): Promise<PersonaSummary> {
    const payload: IdentityGetPersonaPayload = { apiVersion, personaId };
    const result = await this.sendAndWaitForResponse<
      IdentityGetPersonaPayload,
      IdentityGetPersonaResponsePayload
    >("identity.get_persona", payload);
    return result.persona;
  }

  async createPersona(payload: IdentityCreatePersonaPayload): Promise<PersonaCreateResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityCreatePersonaPayload,
      IdentityCreatePersonaResponsePayload
    >("identity.create_persona", payload);
    return { persona: result.persona, created: result.created };
  }

  async updatePersona(payload: IdentityUpdatePersonaPayload): Promise<PersonaUpdateResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityUpdatePersonaPayload,
      IdentityUpdatePersonaResponsePayload
    >("identity.update_persona", payload);
    return { persona: result.persona, newRevision: result.newRevision };
  }

  async archivePersona(payload: IdentityArchivePersonaPayload): Promise<PersonaArchiveResult> {
    const result = await this.sendAndWaitForResponse<
      IdentityArchivePersonaPayload,
      IdentityArchivePersonaResponsePayload
    >("identity.archive_persona", payload);
    return { persona: result.persona, archived: result.archived };
  }

  async previewCompiledInstructions(
    agentDefinitionId: string,
    apiVersion?: string,
    workspaceContext?: string,
  ): Promise<CompiledInstructionsPreview> {
    const payload: IdentityPreviewCompiledInstructionsPayload = {
      apiVersion,
      agentDefinitionId,
      workspaceContext,
    };
    const result = await this.sendAndWaitForResponse<
      IdentityPreviewCompiledInstructionsPayload,
      IdentityPreviewCompiledInstructionsResponsePayload
    >("identity.preview_compiled_instructions", payload);
    return result.preview;
  }

  async previewRuntimeSystemPrompt(
    payload: IdentityPreviewRuntimeSystemPromptPayload,
  ): Promise<RuntimeSystemPromptPreview> {
    const result = await this.sendAndWaitForResponse<
      IdentityPreviewRuntimeSystemPromptPayload,
      IdentityPreviewRuntimeSystemPromptResponsePayload
    >("identity.preview_runtime_system_prompt", payload);
    return result.preview;
  }

  async previewSystemPromptMatrix(
    payload: IdentityPreviewSystemPromptMatrixPayload,
  ): Promise<SystemPromptMatrix> {
    const result = await this.sendAndWaitForResponse<
      IdentityPreviewSystemPromptMatrixPayload,
      IdentityPreviewSystemPromptMatrixResponsePayload
    >("identity.preview_system_prompt_matrix", payload);
    return result.matrix;
  }

  async previewTemplate(payload: SpacePreviewTemplatePayload): Promise<SpacePreviewTemplateResult> {
    return this.sendAndWaitForResponse<
      SpacePreviewTemplatePayload,
      SpacePreviewTemplateResult
    >('space.preview_template', payload);
  }

  async createSpaceFromTemplate(
    payload: SpaceCreateFromTemplatePayload,
  ): Promise<SpaceCreateFromTemplateResult> {
    return this.sendAndWaitForResponse<
      SpaceCreateFromTemplatePayload,
      SpaceCreateFromTemplateResult
    >('space.create_from_template', payload);
  }

  async saveSpaceTemplate(payload: SpaceSaveTemplatePayload): Promise<SpaceSaveTemplateResult> {
    return this.sendAndWaitForResponse<
      SpaceSaveTemplatePayload,
      SpaceSaveTemplateResult
    >('space.save_template', payload);
  }

  async listSpaceTemplates(payload: SpaceTemplateListPayload = {}): Promise<SpaceTemplateRecord[]> {
    const result = await this.sendAndWaitForResponse<
      SpaceTemplateListPayload,
      SpaceTemplateListResponsePayload
    >("space.list_templates", payload);
    return result.templates;
  }

  async getSpaceTemplate(templateId: string, apiVersion?: string): Promise<SpaceTemplateRecord> {
    const payload: SpaceTemplateGetPayload = { apiVersion, templateId };
    const result = await this.sendAndWaitForResponse<
      SpaceTemplateGetPayload,
      SpaceTemplateGetResponsePayload
    >("space.get_template", payload);
    return result.template;
  }

  async previewSpaceTemplateRecord(
    payload: SpaceTemplatePreviewPayload,
  ): Promise<SpaceTemplatePreviewResult> {
    const [template, result] = await Promise.all([
      this.getSpaceTemplate(payload.templateId, payload.apiVersion),
      this.previewTemplate({
        apiVersion: payload.apiVersion,
        templateId: payload.templateId,
        resourceId: payload.resourceId,
        name: payload.name,
        goal: payload.goal,
      }),
    ]);
    return {
      template,
      resolved: result.resolved,
      warnings: result.warnings,
    };
  }

  async createSpaceFromManagedTemplate(
    payload: SpaceTemplateCreateSpacePayload,
  ): Promise<SpaceTemplateCreateSpaceResult> {
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
        workspaceRoot: payload.workspaceRoot,
      }),
    ]);
    return {
      template,
      space: result.space,
    };
  }

  async saveManagedSpaceTemplate(
    payload: SpaceTemplateSavePayload,
  ): Promise<SpaceTemplateSaveResult> {
    const result = await this.saveSpaceTemplate({
      apiVersion: payload.apiVersion,
      templateId: payload.templateId,
      title: payload.name,
      description: payload.description,
      communicationMode: payload.communicationMode,
      conversationTopology: payload.conversationTopology,
      promptPackId: payload.promptPackId,
      baseAgents: payload.baseAgents,
      sourceSpaceId: payload.sourceSpaceId,
    });
    const template = await this.getSpaceTemplate(result.template.templateId, payload.apiVersion);
    return {
      template,
      created: result.created,
    };
  }

  async archiveSpaceTemplate(
    payload: SpaceTemplateArchivePayload,
  ): Promise<SpaceTemplateArchiveResult> {
    const result = await this.sendAndWaitForResponse<
      SpaceTemplateArchivePayload,
      SpaceTemplateArchiveResponsePayload
    >("space.archive_template", payload);
    return {
      template: result.template,
      archived: result.archived,
    };
  }

  async registerDevice(payload: AuthRegisterDevicePayload): Promise<AuthRegisterDeviceResult> {
    return this.sendAndWaitForResponse<
      AuthRegisterDevicePayload,
      AuthRegisterDeviceResult
    >('auth.register_device', payload);
  }

  async rotateDeviceKey(payload: AuthRotateDeviceKeyPayload): Promise<AuthRotateDeviceKeyResult> {
    return this.sendAndWaitForResponse<
      AuthRotateDeviceKeyPayload,
      AuthRotateDeviceKeyResult
    >('auth.rotate_device_key', payload);
  }

  async revokeDevice(payload: AuthRevokeDevicePayload): Promise<AuthRevokeDeviceResult> {
    return this.sendAndWaitForResponse<
      AuthRevokeDevicePayload,
      AuthRevokeDeviceResult
    >('auth.revoke_device', payload);
  }

  async listDevices(payload: AuthListDevicesPayload = {}): Promise<DeviceIdentity[]> {
    const result = await this.sendAndWaitForResponse<
      AuthListDevicesPayload,
      { devices: DeviceIdentity[] }
    >('auth.list_devices', payload);
    return result.devices;
  }

  /**
   * Issue a short-lived signed bearer token for strict HTTP principal auth.
   */
  async issueHttpPrincipalToken(
    payload: AuthIssueHttpPrincipalTokenPayload = {},
  ): Promise<AuthIssueHttpPrincipalTokenResult> {
    return this.sendAndWaitForResponse<
      AuthIssueHttpPrincipalTokenPayload,
      AuthIssueHttpPrincipalTokenResult
    >('auth.issue_http_principal_token', payload);
  }

  /**
   * Get persisted usage + budget snapshot.
   */
  async getUsageSnapshot(apiVersion?: string): Promise<UsageSnapshot> {
    const result = await this.sendAndWaitForResponse<
      { apiVersion?: string },
      { snapshot: UsageSnapshot }
    >('usage.get_snapshot', { apiVersion });
    return result.snapshot;
  }

  /**
   * Get local provider telemetry (quota windows + local token/session aggregates).
   */
  async getLocalUsageTelemetry(
    apiVersion?: string,
    providerId?: string,
    providerIds?: string[],
  ): Promise<LocalProviderUsageTelemetry[]> {
    const payload: GatewayGetLocalUsageTelemetryPayload = {
      apiVersion,
      providerId,
      providerIds,
    };
    const result = await this.sendAndWaitForResponse<
      GatewayGetLocalUsageTelemetryPayload,
      GatewayGetLocalUsageTelemetryResponsePayload
    >("gateway.get_local_usage_telemetry", payload);
    return result.telemetry;
  }

  async getMemoryDefaults(apiVersion?: string): Promise<GatewayMemoryDefaults> {
    const payload: GatewayGetMemoryDefaultsPayload = { apiVersion };
    const result = await this.sendAndWaitForResponse<
      GatewayGetMemoryDefaultsPayload,
      GatewayGetMemoryDefaultsResponsePayload
    >("gateway.get_memory_defaults", payload);
    return result.defaults;
  }

  async setMemoryDefaults(
    defaultExperienceCapture: SpaceExperienceCaptureMode,
    defaultSpacePrivacyMode: SpacePrivacyMode = 'STANDARD',
    apiVersion?: string,
  ): Promise<GatewayMemoryDefaults> {
    const payload: GatewaySetMemoryDefaultsPayload = {
      apiVersion,
      defaultExperienceCapture,
      defaultSpacePrivacyMode,
    };
    const result = await this.sendAndWaitForResponse<
      GatewaySetMemoryDefaultsPayload,
      GatewaySetMemoryDefaultsResponsePayload
    >("gateway.set_memory_defaults", payload);
    return result.defaults;
  }

  async listTools(apiVersion?: string): Promise<GatewayTool[]> {
    const payload: GatewayListToolsPayload = { apiVersion };
    const result = await this.sendAndWaitForResponse<
      GatewayListToolsPayload,
      GatewayListToolsResponsePayload
    >("tool.list", payload);
    return result.tools;
  }

  async getTool(
    toolId: string,
    apiVersion?: string,
  ): Promise<GatewayTool | null> {
    const payload: GatewayGetToolPayload = { apiVersion, toolId };
    const result = await this.sendAndWaitForResponse<
      GatewayGetToolPayload,
      GatewayGetToolResponsePayload
    >("tool.get", payload);
    return result.tool;
  }

  async scaffoldTool(
    payload: GatewayScaffoldToolPayload,
  ): Promise<GatewayScaffoldedToolBundle> {
    const result = await this.sendAndWaitForResponse<
      GatewayScaffoldToolPayload,
      GatewayScaffoldToolResponsePayload
    >("tool.scaffold", payload);
    return {
      manifest: result.manifest,
      readme: result.readme,
    };
  }

  async registerTool(
    payload: GatewayRegisterToolPayload,
  ): Promise<GatewayTool> {
    const result = await this.sendAndWaitForResponse<
      GatewayRegisterToolPayload,
      GatewayRegisterToolResponsePayload
    >("tool.register", payload);
    return result.tool;
  }

  async removeTool(
    toolId: string,
    apiVersion?: string,
  ): Promise<boolean> {
    const payload: GatewayRemoveToolPayload = { apiVersion, toolId };
    const result = await this.sendAndWaitForResponse<
      GatewayRemoveToolPayload,
      GatewayRemoveToolResponsePayload
    >("tool.remove", payload);
    return result.removed;
  }

  async listToolApprovalGrants(
    payload: GatewayListToolApprovalGrantsPayload = {},
  ): Promise<GatewayToolApprovalGrant[]> {
    const result = await this.sendAndWaitForResponse<
      GatewayListToolApprovalGrantsPayload,
      GatewayListToolApprovalGrantsResponsePayload
    >("tool.list_grants", payload);
    return result.grants;
  }

  async revokeToolApprovalGrant(
    payload: GatewayRevokeToolApprovalGrantPayload,
  ): Promise<GatewayRevokeToolApprovalGrantResult> {
    return this.sendAndWaitForResponse<
      GatewayRevokeToolApprovalGrantPayload,
      GatewayRevokeToolApprovalGrantResult
    >("tool.revoke_grant", payload);
  }

  async getExternalConnectivity(
    apiVersion?: string,
  ): Promise<GatewayGetExternalConnectivityResponsePayload> {
    return this.sendAndWaitForResponse<
      GatewayGetExternalConnectivityPayload,
      GatewayGetExternalConnectivityResponsePayload
    >("gateway.get_external_connectivity", { apiVersion });
  }

  async setExternalConnectivity(
    mode: GatewayExternalConnectivityMode,
    options?: { funnelEnabled?: boolean | null; apiVersion?: string },
  ): Promise<GatewaySetExternalConnectivityResponsePayload> {
    return this.sendAndWaitForResponse<
      GatewaySetExternalConnectivityPayload,
      GatewaySetExternalConnectivityResponsePayload
    >("gateway.set_external_connectivity", {
      apiVersion: options?.apiVersion,
      mode,
      funnelEnabled: options?.funnelEnabled,
    });
  }

  /**
   * Get current gateway-wide capability/skill policy.
   */
  async getGatewayPolicy(apiVersion?: string): Promise<GatewayPolicy> {
    const result = await this.sendAndWaitForResponse<
      { apiVersion?: string },
      { policy: GatewayPolicy }
    >('gateway.get_policy', { apiVersion });
    return result.policy;
  }

  /**
   * Update gateway-wide capability/skill policy.
   */
  async updateGatewayPolicy(
    payload: GatewayPolicyUpdatePayload,
  ): Promise<GatewayPolicy> {
    const result = await this.sendAndWaitForResponse<
      GatewayPolicyUpdatePayload,
      { policy: GatewayPolicy }
    >('gateway.update_policy', payload);
    return result.policy;
  }

  async factoryResetGateway(
    payload: GatewayFactoryResetPayload,
  ): Promise<GatewayFactoryResetResponsePayload> {
    return this.sendAndWaitForResponse<
      GatewayFactoryResetPayload,
      GatewayFactoryResetResponsePayload
    >('gateway.factory_reset', payload, this.minimumRequestTimeout(180_000));
  }

  async resetSpace(
    payload: SpaceResetPayload,
  ): Promise<SpaceResetResponsePayload> {
    return this.sendAndWaitForResponse<
      SpaceResetPayload,
      SpaceResetResponsePayload
    >('space.reset', payload, this.minimumRequestTimeout(180_000));
  }

  async listLibraryEntries(payload: LibraryListEntriesPayload = {}): Promise<LibraryEntry[]> {
    const result = await this.sendAndWaitForResponse<
      LibraryListEntriesPayload,
      LibraryListEntriesResponsePayload
    >("library.list_entries", payload);
    return result.entries;
  }

  async getLibraryEntry(
    entryId: string,
    apiVersion?: string,
    includeContent?: boolean,
  ): Promise<LibraryEntry> {
    const payload: LibraryGetEntryPayload = { apiVersion, entryId, includeContent };
    const result = await this.sendAndWaitForResponse<
      LibraryGetEntryPayload,
      LibraryGetEntryResponsePayload
    >("library.get_entry", payload);
    return result.entry;
  }

  async saveLibrarySkill(payload: LibrarySaveSkillPayload): Promise<LibrarySaveSkillResponsePayload> {
    return this.sendAndWaitForResponse<
      LibrarySaveSkillPayload,
      LibrarySaveSkillResponsePayload
    >("library.save_skill", payload);
  }

  async importLibraryEntry(
    payload: LibraryImportEntryPayload,
  ): Promise<LibraryImportEntryResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryImportEntryPayload,
      LibraryImportEntryResponsePayload
    >("library.import_entry", payload);
  }

  async archiveLibraryEntry(
    payload: LibraryArchiveEntryPayload,
  ): Promise<LibraryArchiveEntryResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryArchiveEntryPayload,
      LibraryArchiveEntryResponsePayload
    >("library.archive_entry", payload);
  }

  async setLibraryEntryEnabled(
    payload: LibrarySetEntryEnabledPayload,
  ): Promise<LibraryEntry> {
    const result = await this.sendAndWaitForResponse<
      LibrarySetEntryEnabledPayload,
      LibrarySetEntryEnabledResponsePayload
    >("library.set_entry_enabled", payload);
    return result.entry;
  }

  async deleteLibraryEntry(
    payload: LibraryDeleteEntryPayload,
  ): Promise<LibraryDeleteEntryResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryDeleteEntryPayload,
      LibraryDeleteEntryResponsePayload
    >("library.delete_entry", payload);
  }

  async scanLibraryEntries(apiVersion?: string): Promise<LibraryScanEntriesResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryScanEntriesPayload,
      LibraryScanEntriesResponsePayload
    >("library.scan_entries", { apiVersion });
  }

  async listSkillDrafts(apiVersion?: string): Promise<SkillDraft[]> {
    const result = await this.sendAndWaitForResponse<
      LibraryListSkillDraftsPayload,
      LibraryListSkillDraftsResponsePayload
    >("library.list_skill_drafts", { apiVersion });
    return result.drafts;
  }

  async getSkillDraft(draftId: string, apiVersion?: string): Promise<SkillDraft> {
    const result = await this.sendAndWaitForResponse<
      LibraryGetSkillDraftPayload,
      LibraryGetSkillDraftResponsePayload
    >("library.get_skill_draft", { apiVersion, draftId });
    return result.draft;
  }

  async createSkillDraft(
    payload: LibraryCreateSkillDraftPayload,
  ): Promise<LibraryCreateSkillDraftResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryCreateSkillDraftPayload,
      LibraryCreateSkillDraftResponsePayload
    >("library.create_skill_draft", payload);
  }

  async deleteSkillDraft(
    payload: LibraryDeleteSkillDraftPayload,
  ): Promise<LibraryDeleteSkillDraftResponsePayload> {
    return this.sendAndWaitForResponse<
      LibraryDeleteSkillDraftPayload,
      LibraryDeleteSkillDraftResponsePayload
    >("library.delete_skill_draft", payload);
  }

  /**
   * Submit an intent-level orchestrator command.
   */
  async sendOrchestratorCommand(
    payload: OrchestratorCommandPayload,
  ): Promise<OrchestratorCommandResult> {
    const result = await this.sendAndWaitForResponse<
      OrchestratorCommandPayload,
      { command: OrchestratorCommandResult }
    >('orchestrator.command', payload);
    return result.command;
  }

  /**
   * Get command lifecycle state by command ID.
   */
  async getOrchestratorCommand(
    commandId: string,
    apiVersion?: string,
  ): Promise<OrchestratorCommandResult> {
    const result = await this.sendAndWaitForResponse<
      { apiVersion?: string; commandId: string },
      { command: OrchestratorCommandResult }
    >('orchestrator.get_command', { apiVersion, commandId });
    return result.command;
  }

  async createSchedulerJob(payload: SchedulerCreateJobPayload): Promise<SchedulerJob> {
    const result = await this.sendAndWaitForResponse<
      SchedulerCreateJobPayload,
      { job: SchedulerJob }
    >('scheduler.create_job', payload);
    return result.job;
  }

  async getSchedulerJob(jobId: string, apiVersion?: string): Promise<SchedulerJob> {
    const payload: SchedulerGetJobPayload = { apiVersion, jobId };
    const result = await this.sendAndWaitForResponse<
      SchedulerGetJobPayload,
      { job: SchedulerJob }
    >('scheduler.get_job', payload);
    return result.job;
  }

  async listSchedulerJobs(payload: SchedulerListJobsPayload = {}): Promise<SchedulerJob[]> {
    const result = await this.sendAndWaitForResponse<
      SchedulerListJobsPayload,
      { jobs: SchedulerJob[] }
    >('scheduler.list_jobs', payload);
    return result.jobs;
  }

  async listSchedulerEvalDefinitions(
    payload: SchedulerListEvalDefinitionsPayload = {},
  ): Promise<SchedulerEvalDefinition[]> {
    const result = await this.sendAndWaitForResponse<
      SchedulerListEvalDefinitionsPayload,
      SchedulerListEvalDefinitionsResult
    >('scheduler.list_eval_definitions', payload);
    return result.definitions;
  }

  async updateSchedulerJob(payload: SchedulerUpdateJobPayload): Promise<SchedulerJob> {
    const result = await this.sendAndWaitForResponse<
      SchedulerUpdateJobPayload,
      { job: SchedulerJob }
    >('scheduler.update_job', payload);
    return result.job;
  }

  async deleteSchedulerJob(payload: SchedulerDeleteJobPayload): Promise<SchedulerDeleteJobResult> {
    return this.sendAndWaitForResponse<
      SchedulerDeleteJobPayload,
      SchedulerDeleteJobResult
    >('scheduler.delete_job', payload);
  }

  async linkSchedulerJobSpace(payload: SchedulerLinkSpacePayload): Promise<SchedulerJob> {
    const result = await this.sendAndWaitForResponse<
      SchedulerLinkSpacePayload,
      { job: SchedulerJob }
    >('scheduler.link_space', payload);
    return result.job;
  }

  async unlinkSchedulerJobSpace(payload: SchedulerUnlinkSpacePayload): Promise<SchedulerJob> {
    const result = await this.sendAndWaitForResponse<
      SchedulerUnlinkSpacePayload,
      { job: SchedulerJob }
    >('scheduler.unlink_space', payload);
    return result.job;
  }

  async listSchedulerJobRuns(payload: SchedulerListRunsPayload): Promise<SchedulerListRunsResult> {
    return this.sendAndWaitForResponse<
      SchedulerListRunsPayload,
      SchedulerListRunsResult
    >('scheduler.list_runs', payload);
  }

  async runSchedulerJobNow(payload: SchedulerRunNowPayload): Promise<SchedulerRunNowResult> {
    return this.sendAndWaitForResponse<
      SchedulerRunNowPayload,
      SchedulerRunNowResult
    >('scheduler.run_now', payload);
  }

  async listWorkbenchQueue(payload: WorkbenchListQueuePayload = {}): Promise<WorkbenchQueueItem[]> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchListQueuePayload,
      { items: WorkbenchQueueItem[] }
    >('workbench.list_queue', payload);
    return result.items;
  }

  async getWorkbenchQueueItem(payload: WorkbenchGetQueueItemPayload): Promise<WorkbenchQueueItem> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchGetQueueItemPayload,
      { item: WorkbenchQueueItem }
    >('workbench.get_queue_item', payload);
    return result.item;
  }

  async createWorkbenchBatch(payload: WorkbenchCreateBatchPayload): Promise<WorkbenchBatch> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchCreateBatchPayload,
      { batch: WorkbenchBatch }
    >('workbench.create_batch', payload);
    return result.batch;
  }

  async listWorkbenchBatches(payload: WorkbenchListBatchesPayload = {}): Promise<WorkbenchBatch[]> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchListBatchesPayload,
      { batches: WorkbenchBatch[] }
    >('workbench.list_batches', payload);
    return result.batches;
  }

  async updateWorkbenchBatch(payload: WorkbenchUpdateBatchPayload): Promise<WorkbenchBatch> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchUpdateBatchPayload,
      { batch: WorkbenchBatch }
    >('workbench.update_batch', payload);
    return result.batch;
  }

  async startWorkbenchRun(payload: WorkbenchStartRunPayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchStartRunPayload,
      { run: WorkbenchRun }
    >('workbench.start_run', payload);
    return result.run;
  }

  async retryWorkbenchRun(payload: WorkbenchRetryRunPayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchRetryRunPayload,
      { run: WorkbenchRun }
    >('workbench.retry_run', payload);
    return result.run;
  }

  async cancelWorkbenchRun(payload: WorkbenchCancelRunPayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchCancelRunPayload,
      { run: WorkbenchRun }
    >('workbench.cancel_run', payload);
    return result.run;
  }

  async listWorkbenchRuns(payload: WorkbenchListRunsPayload = {}): Promise<WorkbenchRun[]> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchListRunsPayload,
      { runs: WorkbenchRun[] }
    >('workbench.list_runs', payload);
    return result.runs;
  }

  async getWorkbenchRun(payload: WorkbenchGetRunPayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchGetRunPayload,
      { run: WorkbenchRun }
    >('workbench.get_run', payload);
    return result.run;
  }

  async approveWorkbenchStage(payload: WorkbenchApproveStagePayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchApproveStagePayload,
      { run: WorkbenchRun }
    >('workbench.approve_stage', payload);
    return result.run;
  }

  async rejectWorkbenchStage(payload: WorkbenchRejectStagePayload): Promise<WorkbenchRun> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchRejectStagePayload,
      { run: WorkbenchRun }
    >('workbench.reject_stage', payload);
    return result.run;
  }

  async setWorkbenchMode(payload: WorkbenchSetModePayload): Promise<WorkbenchSetModeResult> {
    return this.sendAndWaitForResponse<
      WorkbenchSetModePayload,
      WorkbenchSetModeResult
    >('workbench.set_mode', payload);
  }

  async listWorkbenchArtifacts(payload: WorkbenchListArtifactsPayload): Promise<WorkbenchArtifact[]> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchListArtifactsPayload,
      { artifacts: WorkbenchArtifact[] }
    >('workbench.list_artifacts', payload);
    return result.artifacts;
  }

  async getWorkbenchPolicy(payload: WorkbenchGetPolicyPayload = {}): Promise<WorkbenchPolicy> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchGetPolicyPayload,
      { policy: WorkbenchPolicy }
    >('workbench.get_policy', payload);
    return result.policy;
  }

  async updateWorkbenchPolicy(payload: WorkbenchUpdatePolicyPayload): Promise<WorkbenchPolicy> {
    const result = await this.sendAndWaitForResponse<
      WorkbenchUpdatePolicyPayload,
      { policy: WorkbenchPolicy }
    >('workbench.update_policy', payload);
    return result.policy;
  }

  async linkSpaces(payload: SpaceLinkPayload): Promise<SpaceLinkResult> {
    const result = await this.sendAndWaitForResponse<
      SpaceLinkPayload,
      { link: SpaceLinkResult }
    >('space.link', payload);
    return result.link;
  }

  async unlinkSpaces(payload: SpaceUnlinkPayload): Promise<boolean> {
    const result = await this.sendAndWaitForResponse<
      SpaceUnlinkPayload,
      { removed: boolean }
    >('space.unlink', payload);
    return result.removed;
  }

  async shareSpaceContext(payload: SpaceShareContextPayload): Promise<SharedContextRef> {
    const result = await this.sendAndWaitForResponse<
      SpaceShareContextPayload,
      { transfer: SharedContextRef }
    >('space.share_context', payload);
    return result.transfer;
  }

  async pullSharedContext(
    payload: SpacePullSharedContextPayload,
  ): Promise<SpacePullSharedContextResult> {
    return this.sendAndWaitForResponse<
      SpacePullSharedContextPayload,
      SpacePullSharedContextResult
    >('space.pull_shared_context', payload);
  }

  async createSpaceShareInvite(payload: SpaceShareCreateInvitePayload): Promise<SpaceShareInvite> {
    const result = await this.sendAndWaitForResponse<
      SpaceShareCreateInvitePayload,
      { invite: SpaceShareInvite }
    >('space.share_create_invite', payload);
    return result.invite;
  }

  async joinSpaceShareInvite(payload: SpaceShareJoinPayload): Promise<SpaceParticipant> {
    const result = await this.sendAndWaitForResponse<
      SpaceShareJoinPayload,
      { participant: SpaceParticipant }
    >('space.share_join', payload);
    return result.participant;
  }

  async revokeSpaceShareAccess(payload: SpaceShareRevokePayload): Promise<SpaceShareRevokeResult> {
    return this.sendAndWaitForResponse<
      SpaceShareRevokePayload,
      SpaceShareRevokeResult
    >('space.share_revoke', payload);
  }

  async listSpaceParticipants(
    payload: SpaceShareListParticipantsPayload,
  ): Promise<SpaceParticipant[]> {
    const result = await this.sendAndWaitForResponse<
      SpaceShareListParticipantsPayload,
      { spaceId: string; participants: SpaceParticipant[] }
    >('space.share_list_participants', payload);
    return result.participants;
  }

  async announceSyncPeer(payload: SyncAnnouncePayload): Promise<SyncAnnounceResult> {
    return this.sendAndWaitForResponse<
      SyncAnnouncePayload,
      SyncAnnounceResult
    >('sync.announce', payload);
  }

  async querySyncResources(
    payload: SyncQueryResourcesPayload,
  ): Promise<SyncQueryResourcesResult> {
    return this.sendAndWaitForResponse<
      SyncQueryResourcesPayload,
      SyncQueryResourcesResult
    >('sync.query_resources', payload);
  }

  async pullSyncResources(
    payload: SyncPullResourcesPayload,
  ): Promise<SyncPullResourcesResult> {
    return this.sendAndWaitForResponse<
      SyncPullResourcesPayload,
      SyncPullResourcesResult
    >('sync.pull_resources', payload);
  }

  async startSpeechSession(payload: SpeechStartPayload): Promise<SpeechEventPayload> {
    const result = await this.sendAndWaitForResponse<
      SpeechStartPayload,
      { event: SpeechEventPayload }
    >('speech.start', payload);
    return result.event;
  }

  async sendSpeechAudioChunk(payload: SpeechAudioChunkPayload): Promise<SpeechEventPayload[]> {
    const result = await this.sendAndWaitForResponse<
      SpeechAudioChunkPayload,
      { events: SpeechEventPayload[] }
    >('speech.audio_chunk', payload);
    return result.events;
  }

  async controlSpeechSession(payload: SpeechControlPayload): Promise<SpeechEventPayload> {
    const result = await this.sendAndWaitForResponse<
      SpeechControlPayload,
      { event: SpeechEventPayload }
    >('speech.control', payload);
    return result.event;
  }

  /**
   * Register native adapter providers with the gateway.
   */
  async registerCapabilities(providers: AdapterCapabilityProvider[]): Promise<void> {
    const payload: CapabilitiesRegisterPayload = { providers };
    await this.sendAndWaitForResponse<CapabilitiesRegisterPayload, void>(
      'capabilities.register',
      payload,
    );
  }

  /**
   * Deregister native adapter providers from the gateway.
   */
  async deregisterCapabilities(providerIds: string[]): Promise<void> {
    const payload: CapabilitiesDeregisterPayload = { providerIds };
    await this.sendAndWaitForResponse<CapabilitiesDeregisterPayload, void>(
      'capabilities.deregister',
      payload,
    );
  }

  /**
   * Send invocation success for a previously received `capability.invoke`.
   */
  async sendCapabilityResult(payload: AdapterCapabilityResultPayload): Promise<void> {
    await this.send<AdapterCapabilityResultPayload>('capability.result', payload);
  }

  /**
   * Send invocation failure for a previously received `capability.invoke`.
   */
  async sendCapabilityError(payload: AdapterCapabilityErrorPayload): Promise<void> {
    await this.send<AdapterCapabilityErrorPayload>('capability.error', payload);
  }

  /**
   * Send a direct message to another agent in a space
   */
  async sendAgentMessage(
    spaceId: string,
    fromAgentId: string,
    toAgentId: string,
    content: string,
    spaceUid?: string,
  ): Promise<void> {
    const payload: AgentMessagePayload = {
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
  async pokeAgent(
    spaceId: string,
    targetAgentId: string,
    reason: string,
    unblockedByTurnId?: string,
    spaceUid?: string,
  ): Promise<void> {
    const payload: AgentPokePayload = {
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
  async declareTaskDependency(
    spaceId: string,
    blockedTurnId: string,
    dependsOnTurnId: string,
    spaceUid?: string,
  ): Promise<void> {
    const payload: TaskDependencyPayload = {
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
  async ping(): Promise<void> {
    await this.sendAndWaitForResponse('ping', {});
  }

  /**
   * Subscribe to turn events
   */
  onTurnEvent(handler: TurnEventHandler): UnsubscribeHandler {
    this.turnEventHandlers.push(handler);
    return () => {
      this.turnEventHandlers = this.turnEventHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  /**
   * Subscribe to turn stream events
   */
  onTurnStream(handler: TurnStreamHandler): UnsubscribeHandler {
    this.turnStreamHandlers.push(handler);
    return () => {
      this.turnStreamHandlers = this.turnStreamHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  /**
   * Subscribe to space state updates
   */
  onSpaceState(handler: SpaceStateHandler): UnsubscribeHandler {
    this.spaceStateHandlers.push(handler);
    return () => {
      this.spaceStateHandlers = this.spaceStateHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  /**
   * Subscribe to profile-swap events for space agent assignments.
   */
  onSpaceAgentUpdated(handler: SpaceAgentUpdatedHandler): UnsubscribeHandler {
    this.spaceAgentUpdatedHandlers.push(handler);
    return () => {
      this.spaceAgentUpdatedHandlers = this.spaceAgentUpdatedHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  /**
   * Subscribe to notifications
   */
  onNotification(handler: NotificationHandler): UnsubscribeHandler {
    this.notificationHandlers.push(handler);
    return () => {
      this.notificationHandlers = this.notificationHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  /**
   * Subscribe to error events
   */
  onError(handler: ErrorHandler): UnsubscribeHandler {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to inter-agent messages
   */
  onAgentMessage(handler: AgentMessageHandler): UnsubscribeHandler {
    this.agentMessageHandlers.push(handler);
    return () => {
      this.agentMessageHandlers = this.agentMessageHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to agent poke events
   */
  onAgentPoke(handler: AgentPokeHandler): UnsubscribeHandler {
    this.agentPokeHandlers.push(handler);
    return () => {
      this.agentPokeHandlers = this.agentPokeHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to agent idle notifications
   */
  onAgentIdle(handler: AgentIdleHandler): UnsubscribeHandler {
    this.agentIdleHandlers.push(handler);
    return () => {
      this.agentIdleHandlers = this.agentIdleHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to task dependency declarations
   */
  onTaskDependency(handler: TaskDependencyHandler): UnsubscribeHandler {
    this.taskDependencyHandlers.push(handler);
    return () => {
      this.taskDependencyHandlers = this.taskDependencyHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to task dependency resolved notifications
   */
  onTaskDependencyResolved(handler: TaskDependencyResolvedHandler): UnsubscribeHandler {
    this.taskDependencyResolvedHandlers.push(handler);
    return () => {
      this.taskDependencyResolvedHandlers = this.taskDependencyResolvedHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to orchestrator command lifecycle events.
   */
  onOrchestratorEvent(handler: OrchestratorEventHandler): UnsubscribeHandler {
    this.orchestratorEventHandlers.push(handler);
    return () => {
      this.orchestratorEventHandlers = this.orchestratorEventHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to speech session events.
   */
  onSpeechEvent(handler: SpeechEventHandler): UnsubscribeHandler {
    this.speechEventHandlers.push(handler);
    return () => {
      this.speechEventHandlers = this.speechEventHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Subscribe to adapter capability invocation requests.
   */
  onCapabilityInvoke(handler: CapabilityInvokeHandler): UnsubscribeHandler {
    this.capabilityInvokeHandlers.push(handler);
    return () => {
      this.capabilityInvokeHandlers = this.capabilityInvokeHandlers.filter(
        (h) => h !== handler,
      );
    };
  }

  private minimumRequestTimeout(minimumMs: number): number {
    return Math.max(this.requestTimeoutMs, minimumMs);
  }
}

export default GatewayClient;
