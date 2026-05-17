import * as SpaceAdminApi from "./gateway-client-space-admin-api.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import type {
  SpaceAddAgentPayload,
  SpaceAddAgentResponsePayload,
  SpaceAddResourcePayload,
  SpaceAddSkillPayload,
  SpaceAddSkillResponsePayload,
  SpaceAgentAssignment,
  SpaceApproveMcpAgentPayload,
  SpaceApproveMcpAgentResponsePayload,
  SpaceArchivePayload,
  SpaceArchiveResponsePayload,
  SpaceCreatePayload,
  SpaceDeletePayload,
  SpaceDeleteResponsePayload,
  SpaceDiscoverMcpAgentsResponsePayload,
  SpaceEndIncognitoSessionResponsePayload,
  SpaceGetMcpEndpointResponsePayload,
  SpaceListOrchestrationJournalPayload,
  SpaceListOrchestrationJournalResponsePayload,
  SpaceListPayload,
  SpaceMcpEndpoint,
  SpaceMemoryPolicy,
  SpaceRemoveAgentPayload,
  SpaceRemoveAgentResponsePayload,
  SpaceRemoveResourcePayload,
  SpaceRemoveSkillPayload,
  SpaceRemoveSkillResponsePayload,
  SpaceResource,
  SpaceSetMcpEndpointPayload,
  SpaceSetMemoryPolicyPayload,
  SpaceSetOrchestratorPayload,
  SpaceSetWorkspacePayload,
  SpaceSummary,
  SpaceUpdateAgentAssignmentPayload,
  SpaceUpdateAgentAssignmentResponsePayload,
  SpaceWorkspace,
} from "./gateway-protocol.js";

export interface GatewayClientSpaceAdminFacadeApi {
  createSpace(payload: SpaceCreatePayload): Promise<SpaceSummary>;
  getSpace(spaceId: string, apiVersion?: string): Promise<SpaceSummary>;
  listSpaces(payload?: SpaceListPayload): Promise<SpaceSummary[]>;
  archiveSpace(payload: SpaceArchivePayload): Promise<SpaceArchiveResponsePayload>;
  deleteSpace(payload: SpaceDeletePayload): Promise<SpaceDeleteResponsePayload>;
  addAgent(payload: SpaceAddAgentPayload): Promise<SpaceAddAgentResponsePayload>;
  removeAgent(payload: SpaceRemoveAgentPayload): Promise<SpaceRemoveAgentResponsePayload>;
  updateAgentAssignment(
    payload: SpaceUpdateAgentAssignmentPayload,
  ): Promise<SpaceUpdateAgentAssignmentResponsePayload>;
  setSpaceOrchestrator(payload: SpaceSetOrchestratorPayload): Promise<SpaceSummary>;
  listAgentAssignments(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceAgentAssignment[]>;
  getSpaceMcpEndpoint(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceGetMcpEndpointResponsePayload>;
  setSpaceMcpEndpoint(payload: SpaceSetMcpEndpointPayload): Promise<SpaceMcpEndpoint>;
  clearSpaceMcpEndpoint(spaceId: string, apiVersion?: string): Promise<boolean>;
  discoverSpaceMcpAgents(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceDiscoverMcpAgentsResponsePayload>;
  approveSpaceMcpAgent(
    payload: SpaceApproveMcpAgentPayload,
  ): Promise<SpaceApproveMcpAgentResponsePayload>;
  addSkillToSpace(payload: SpaceAddSkillPayload): Promise<SpaceAddSkillResponsePayload>;
  removeSkillFromSpace(
    payload: SpaceRemoveSkillPayload,
  ): Promise<SpaceRemoveSkillResponsePayload>;
  listSpaceSkills(spaceId: string, apiVersion?: string): Promise<string[]>;
  getSpaceWorkspace(spaceId: string, apiVersion?: string): Promise<SpaceWorkspace>;
  setSpaceWorkspace(payload: SpaceSetWorkspacePayload): Promise<SpaceWorkspace>;
  addSpaceResource(payload: SpaceAddResourcePayload): Promise<SpaceResource>;
  removeSpaceResource(payload: SpaceRemoveResourcePayload): Promise<boolean>;
  listSpaceResources(spaceId: string, apiVersion?: string): Promise<SpaceResource[]>;
  listOrchestrationJournal(
    payload: SpaceListOrchestrationJournalPayload,
  ): Promise<SpaceListOrchestrationJournalResponsePayload>;
  getSpaceMemoryPolicy(spaceId: string, apiVersion?: string): Promise<SpaceMemoryPolicy>;
  setSpaceMemoryPolicy(payload: SpaceSetMemoryPolicyPayload): Promise<SpaceSummary>;
  endIncognitoSession(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceEndIncognitoSessionResponsePayload>;
}

interface GatewayClientSpaceAdminFacadeContext {
  readonly endpointRequests: GatewayClientRequestInvoker;
}

async function createSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceCreatePayload,
): Promise<SpaceSummary> {
  return SpaceAdminApi.createSpace(this.endpointRequests, payload);
}

async function getSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceSummary> {
  return SpaceAdminApi.getSpace(this.endpointRequests, spaceId, apiVersion);
}

async function listSpaces(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceListPayload = {},
): Promise<SpaceSummary[]> {
  return SpaceAdminApi.listSpaces(this.endpointRequests, payload);
}

async function archiveSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceArchivePayload,
): Promise<SpaceArchiveResponsePayload> {
  return SpaceAdminApi.archiveSpace(this.endpointRequests, payload);
}

async function deleteSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceDeletePayload,
): Promise<SpaceDeleteResponsePayload> {
  return SpaceAdminApi.deleteSpace(this.endpointRequests, payload);
}

async function addAgent(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceAddAgentPayload,
): Promise<SpaceAddAgentResponsePayload> {
  return SpaceAdminApi.addAgent(this.endpointRequests, payload);
}

async function removeAgent(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceRemoveAgentPayload,
): Promise<SpaceRemoveAgentResponsePayload> {
  return SpaceAdminApi.removeAgent(this.endpointRequests, payload);
}

async function updateAgentAssignment(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceUpdateAgentAssignmentPayload,
): Promise<SpaceUpdateAgentAssignmentResponsePayload> {
  return SpaceAdminApi.updateAgentAssignment(this.endpointRequests, payload);
}

async function setSpaceOrchestrator(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceSetOrchestratorPayload,
): Promise<SpaceSummary> {
  return SpaceAdminApi.setSpaceOrchestrator(this.endpointRequests, payload);
}

async function listAgentAssignments(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceAgentAssignment[]> {
  return SpaceAdminApi.listAgentAssignments(this.endpointRequests, spaceId, apiVersion);
}

async function getSpaceMcpEndpoint(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceGetMcpEndpointResponsePayload> {
  return SpaceAdminApi.getSpaceMcpEndpoint(this.endpointRequests, spaceId, apiVersion);
}

async function setSpaceMcpEndpoint(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceSetMcpEndpointPayload,
): Promise<SpaceMcpEndpoint> {
  return SpaceAdminApi.setSpaceMcpEndpoint(this.endpointRequests, payload);
}

async function clearSpaceMcpEndpoint(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<boolean> {
  return SpaceAdminApi.clearSpaceMcpEndpoint(this.endpointRequests, spaceId, apiVersion);
}

async function discoverSpaceMcpAgents(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceDiscoverMcpAgentsResponsePayload> {
  return SpaceAdminApi.discoverSpaceMcpAgents(this.endpointRequests, spaceId, apiVersion);
}

async function approveSpaceMcpAgent(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceApproveMcpAgentPayload,
): Promise<SpaceApproveMcpAgentResponsePayload> {
  return SpaceAdminApi.approveSpaceMcpAgent(this.endpointRequests, payload);
}

async function addSkillToSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceAddSkillPayload,
): Promise<SpaceAddSkillResponsePayload> {
  return SpaceAdminApi.addSkillToSpace(this.endpointRequests, payload);
}

async function removeSkillFromSpace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceRemoveSkillPayload,
): Promise<SpaceRemoveSkillResponsePayload> {
  return SpaceAdminApi.removeSkillFromSpace(this.endpointRequests, payload);
}

async function listSpaceSkills(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<string[]> {
  return SpaceAdminApi.listSpaceSkills(this.endpointRequests, spaceId, apiVersion);
}

async function getSpaceWorkspace(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceWorkspace> {
  return SpaceAdminApi.getSpaceWorkspace(this.endpointRequests, spaceId, apiVersion);
}

async function setSpaceWorkspace(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceSetWorkspacePayload,
): Promise<SpaceWorkspace> {
  return SpaceAdminApi.setSpaceWorkspace(this.endpointRequests, payload);
}

async function addSpaceResource(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceAddResourcePayload,
): Promise<SpaceResource> {
  return SpaceAdminApi.addSpaceResource(this.endpointRequests, payload);
}

async function removeSpaceResource(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceRemoveResourcePayload,
): Promise<boolean> {
  return SpaceAdminApi.removeSpaceResource(this.endpointRequests, payload);
}

async function listSpaceResources(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceResource[]> {
  return SpaceAdminApi.listSpaceResources(this.endpointRequests, spaceId, apiVersion);
}

async function listOrchestrationJournal(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceListOrchestrationJournalPayload,
): Promise<SpaceListOrchestrationJournalResponsePayload> {
  return SpaceAdminApi.listOrchestrationJournal(this.endpointRequests, payload);
}

async function getSpaceMemoryPolicy(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceMemoryPolicy> {
  return SpaceAdminApi.getSpaceMemoryPolicy(this.endpointRequests, spaceId, apiVersion);
}

async function setSpaceMemoryPolicy(
  this: GatewayClientSpaceAdminFacadeContext,
  payload: SpaceSetMemoryPolicyPayload,
): Promise<SpaceSummary> {
  return SpaceAdminApi.setSpaceMemoryPolicy(this.endpointRequests, payload);
}

async function endIncognitoSession(
  this: GatewayClientSpaceAdminFacadeContext,
  spaceId: string,
  apiVersion?: string,
): Promise<SpaceEndIncognitoSessionResponsePayload> {
  return SpaceAdminApi.endIncognitoSession(this.endpointRequests, spaceId, apiVersion);
}

const spaceAdminFacadeApiDescriptors = Object.fromEntries(
  Object.entries({
    createSpace,
    getSpace,
    listSpaces,
    archiveSpace,
    deleteSpace,
    addAgent,
    removeAgent,
    updateAgentAssignment,
    setSpaceOrchestrator,
    listAgentAssignments,
    getSpaceMcpEndpoint,
    setSpaceMcpEndpoint,
    clearSpaceMcpEndpoint,
    discoverSpaceMcpAgents,
    approveSpaceMcpAgent,
    addSkillToSpace,
    removeSkillFromSpace,
    listSpaceSkills,
    getSpaceWorkspace,
    setSpaceWorkspace,
    addSpaceResource,
    removeSpaceResource,
    listSpaceResources,
    listOrchestrationJournal,
    getSpaceMemoryPolicy,
    setSpaceMemoryPolicy,
    endIncognitoSession,
  }).map(([name, value]) => [
    name,
    { value, writable: true, configurable: true },
  ]),
) as PropertyDescriptorMap;

export function installGatewayClientSpaceAdminFacadeApi(prototype: object): void {
  Object.defineProperties(prototype, spaceAdminFacadeApiDescriptors);
}
