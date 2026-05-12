import type {
  SpaceAddAgentPayload,
  SpaceAddAgentResponsePayload,
  SpaceAddResourcePayload,
  SpaceAddResourceResponsePayload,
  SpaceAddSkillPayload,
  SpaceAddSkillResponsePayload,
  SpaceAgentAssignment,
  SpaceApproveMcpAgentPayload,
  SpaceApproveMcpAgentResponsePayload,
  SpaceArchivePayload,
  SpaceArchiveResponsePayload,
  SpaceClearMcpEndpointPayload,
  SpaceClearMcpEndpointResponsePayload,
  SpaceCreatePayload,
  SpaceCreateResponsePayload,
  SpaceDeletePayload,
  SpaceDeleteResponsePayload,
  SpaceDiscoverMcpAgentsPayload,
  SpaceDiscoverMcpAgentsResponsePayload,
  SpaceEndIncognitoSessionPayload,
  SpaceEndIncognitoSessionResponsePayload,
  SpaceGetMcpEndpointPayload,
  SpaceGetMcpEndpointResponsePayload,
  SpaceGetMemoryPolicyPayload,
  SpaceGetMemoryPolicyResponsePayload,
  SpaceGetPayload,
  SpaceGetResponsePayload,
  SpaceGetWorkspacePayload,
  SpaceGetWorkspaceResponsePayload,
  SpaceListAgentAssignmentsPayload,
  SpaceListAgentAssignmentsResponsePayload,
  SpaceListOrchestrationJournalPayload,
  SpaceListOrchestrationJournalResponsePayload,
  SpaceListPayload,
  SpaceListResourcesPayload,
  SpaceListResourcesResponsePayload,
  SpaceListResponsePayload,
  SpaceListSkillsPayload,
  SpaceListSkillsResponsePayload,
  SpaceMcpEndpoint,
  SpaceMemoryPolicy,
  SpaceRemoveAgentPayload,
  SpaceRemoveAgentResponsePayload,
  SpaceRemoveResourcePayload,
  SpaceRemoveResourceResponsePayload,
  SpaceRemoveSkillPayload,
  SpaceRemoveSkillResponsePayload,
  SpaceResource,
  SpaceSetMcpEndpointPayload,
  SpaceSetMcpEndpointResponsePayload,
  SpaceSetMemoryPolicyPayload,
  SpaceSetMemoryPolicyResponsePayload,
  SpaceSetOrchestratorPayload,
  SpaceSetWorkspacePayload,
  SpaceSetWorkspaceResponsePayload,
  SpaceSummary,
  SpaceUpdateAgentAssignmentPayload,
  SpaceUpdateAgentAssignmentResponsePayload,
  SpaceWorkspace,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function createSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceCreatePayload,
): Promise<SpaceSummary> {
  return requests.requestField<SpaceCreatePayload, SpaceCreateResponsePayload, 'space'>(
    'space.create',
    payload,
    'space',
  );
}

export function getSpace(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceSummary> {
  const payload: SpaceGetPayload = { apiVersion, spaceId };
  return requests.requestField<SpaceGetPayload, SpaceGetResponsePayload, 'space'>(
    'space.get',
    payload,
    'space',
  );
}

export function listSpaces(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListPayload = {},
): Promise<SpaceSummary[]> {
  return requests.requestField<SpaceListPayload, SpaceListResponsePayload, 'spaces'>(
    'space.list',
    payload,
    'spaces',
  );
}

export function archiveSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceArchivePayload,
): Promise<SpaceArchiveResponsePayload> {
  return requests.request<SpaceArchivePayload, SpaceArchiveResponsePayload>('space.archive', payload);
}

export function deleteSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceDeletePayload,
): Promise<SpaceDeleteResponsePayload> {
  return requests.request<SpaceDeletePayload, SpaceDeleteResponsePayload>('space.delete', payload);
}

export function addAgent(
  requests: GatewayClientRequestInvoker,
  payload: SpaceAddAgentPayload,
): Promise<SpaceAddAgentResponsePayload> {
  return requests.request<SpaceAddAgentPayload, SpaceAddAgentResponsePayload>('space.add_agent', payload);
}

export function removeAgent(
  requests: GatewayClientRequestInvoker,
  payload: SpaceRemoveAgentPayload,
): Promise<SpaceRemoveAgentResponsePayload> {
  return requests.request<SpaceRemoveAgentPayload, SpaceRemoveAgentResponsePayload>('space.remove_agent', payload);
}

export function updateAgentAssignment(
  requests: GatewayClientRequestInvoker,
  payload: SpaceUpdateAgentAssignmentPayload,
): Promise<SpaceUpdateAgentAssignmentResponsePayload> {
  return requests.request<
    SpaceUpdateAgentAssignmentPayload,
    SpaceUpdateAgentAssignmentResponsePayload
  >('space.update_agent_assignment', payload);
}

export function setSpaceOrchestrator(
  requests: GatewayClientRequestInvoker,
  payload: SpaceSetOrchestratorPayload,
): Promise<SpaceSummary> {
  return requests.requestField<SpaceSetOrchestratorPayload, SpaceGetResponsePayload, 'space'>(
    'space.set_orchestrator',
    payload,
    'space',
  );
}

export function listAgentAssignments(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceAgentAssignment[]> {
  const payload: SpaceListAgentAssignmentsPayload = { apiVersion, spaceId };
  return requests.requestField<
    SpaceListAgentAssignmentsPayload,
    SpaceListAgentAssignmentsResponsePayload,
    'assignments'
  >('space.list_agent_assignments', payload, 'assignments');
}

export function getSpaceMcpEndpoint(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceGetMcpEndpointResponsePayload> {
  const payload: SpaceGetMcpEndpointPayload = { apiVersion, spaceId };
  return requests.request<SpaceGetMcpEndpointPayload, SpaceGetMcpEndpointResponsePayload>(
    'space.get_mcp_endpoint',
    payload,
  );
}

export function setSpaceMcpEndpoint(
  requests: GatewayClientRequestInvoker,
  payload: SpaceSetMcpEndpointPayload,
): Promise<SpaceMcpEndpoint> {
  return requests.requestField<SpaceSetMcpEndpointPayload, SpaceSetMcpEndpointResponsePayload, 'endpoint'>(
    'space.set_mcp_endpoint',
    payload,
    'endpoint',
  );
}

export function clearSpaceMcpEndpoint(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<boolean> {
  const payload: SpaceClearMcpEndpointPayload = { apiVersion, spaceId };
  return requests.requestField<
    SpaceClearMcpEndpointPayload,
    SpaceClearMcpEndpointResponsePayload,
    'cleared'
  >('space.clear_mcp_endpoint', payload, 'cleared');
}

export function discoverSpaceMcpAgents(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceDiscoverMcpAgentsResponsePayload> {
  const payload: SpaceDiscoverMcpAgentsPayload = { apiVersion, spaceId };
  return requests.request<SpaceDiscoverMcpAgentsPayload, SpaceDiscoverMcpAgentsResponsePayload>(
    'space.discover_mcp_agents',
    payload,
  );
}

export function approveSpaceMcpAgent(
  requests: GatewayClientRequestInvoker,
  payload: SpaceApproveMcpAgentPayload,
): Promise<SpaceApproveMcpAgentResponsePayload> {
  return requests.request<SpaceApproveMcpAgentPayload, SpaceApproveMcpAgentResponsePayload>(
    'space.approve_mcp_agent',
    payload,
  );
}

export function addSkillToSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceAddSkillPayload,
): Promise<SpaceAddSkillResponsePayload> {
  return requests.request<SpaceAddSkillPayload, SpaceAddSkillResponsePayload>('space.add_skill', payload);
}

export function removeSkillFromSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceRemoveSkillPayload,
): Promise<SpaceRemoveSkillResponsePayload> {
  return requests.request<SpaceRemoveSkillPayload, SpaceRemoveSkillResponsePayload>(
    'space.remove_skill',
    payload,
  );
}

export function listSpaceSkills(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<string[]> {
  const payload: SpaceListSkillsPayload = { apiVersion, spaceId };
  return requests.requestField<SpaceListSkillsPayload, SpaceListSkillsResponsePayload, 'skills'>(
    'space.list_skills',
    payload,
    'skills',
  );
}

export function getSpaceWorkspace(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceWorkspace> {
  const payload: SpaceGetWorkspacePayload = { apiVersion, spaceId };
  return requests.requestField<SpaceGetWorkspacePayload, SpaceGetWorkspaceResponsePayload, 'workspace'>(
    'space.get_workspace',
    payload,
    'workspace',
  );
}

export function setSpaceWorkspace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceSetWorkspacePayload,
): Promise<SpaceWorkspace> {
  return requests.requestField<SpaceSetWorkspacePayload, SpaceSetWorkspaceResponsePayload, 'workspace'>(
    'space.set_workspace',
    payload,
    'workspace',
  );
}

export function addSpaceResource(
  requests: GatewayClientRequestInvoker,
  payload: SpaceAddResourcePayload,
): Promise<SpaceResource> {
  return requests.requestField<SpaceAddResourcePayload, SpaceAddResourceResponsePayload, 'resource'>(
    'space.add_resource',
    payload,
    'resource',
  );
}

export function removeSpaceResource(
  requests: GatewayClientRequestInvoker,
  payload: SpaceRemoveResourcePayload,
): Promise<boolean> {
  return requests.requestField<SpaceRemoveResourcePayload, SpaceRemoveResourceResponsePayload, 'removed'>(
    'space.remove_resource',
    payload,
    'removed',
  );
}

export function listSpaceResources(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceResource[]> {
  const payload: SpaceListResourcesPayload = { apiVersion, spaceId };
  return requests.requestField<
    SpaceListResourcesPayload,
    SpaceListResourcesResponsePayload,
    'resources'
  >('space.list_resources', payload, 'resources');
}

export function listOrchestrationJournal(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListOrchestrationJournalPayload,
): Promise<SpaceListOrchestrationJournalResponsePayload> {
  return requests.request<
    SpaceListOrchestrationJournalPayload,
    SpaceListOrchestrationJournalResponsePayload
  >('space.list_orchestration_journal', payload);
}

export function getSpaceMemoryPolicy(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceMemoryPolicy> {
  const payload: SpaceGetMemoryPolicyPayload = { apiVersion, spaceId };
  return requests.requestField<
    SpaceGetMemoryPolicyPayload,
    SpaceGetMemoryPolicyResponsePayload,
    'memoryPolicy'
  >('space.get_memory_policy', payload, 'memoryPolicy');
}

export function setSpaceMemoryPolicy(
  requests: GatewayClientRequestInvoker,
  payload: SpaceSetMemoryPolicyPayload,
): Promise<SpaceSummary> {
  return requests.requestField<
    SpaceSetMemoryPolicyPayload,
    SpaceSetMemoryPolicyResponsePayload,
    'space'
  >('space.set_memory_policy', payload, 'space');
}

export function endIncognitoSession(
  requests: GatewayClientRequestInvoker,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceEndIncognitoSessionResponsePayload> {
  const payload: SpaceEndIncognitoSessionPayload = { apiVersion, spaceId };
  return requests.request<SpaceEndIncognitoSessionPayload, SpaceEndIncognitoSessionResponsePayload>(
    'space.end_incognito_session',
    payload,
  );
}
