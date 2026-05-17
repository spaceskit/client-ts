/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
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
