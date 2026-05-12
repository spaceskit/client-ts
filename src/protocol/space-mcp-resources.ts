/**
 * Space MCP endpoint, skill, and resource protocol contracts.
 */
import type { SpaceAgentAssignment, SpaceSummary } from "./spaces-admin.js";

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
