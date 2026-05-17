import * as GatewayAdminApi from "./gateway-client-gateway-admin-api.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import type {
  AuthIssueHttpPrincipalTokenPayload,
  AuthIssueHttpPrincipalTokenResult,
  AuthListDevicesPayload,
  AuthRegisterDevicePayload,
  AuthRegisterDeviceResult,
  AuthRevokeDevicePayload,
  AuthRevokeDeviceResult,
  AuthRotateDeviceKeyPayload,
  AuthRotateDeviceKeyResult,
  DeviceIdentity,
  GatewayExternalConnectivityMode,
  GatewayFactoryResetPayload,
  GatewayFactoryResetResponsePayload,
  GatewayGetExternalConnectivityResponsePayload,
  GatewayListToolApprovalGrantsPayload,
  GatewayMemoryDefaults,
  GatewayPolicy,
  GatewayPolicyUpdatePayload,
  GatewayRegisterToolPayload,
  GatewayRevokeToolApprovalGrantPayload,
  GatewayRevokeToolApprovalGrantResult,
  GatewayScaffoldToolPayload,
  GatewayScaffoldedToolBundle,
  GatewaySetExternalConnectivityResponsePayload,
  GatewayTool,
  GatewayToolApprovalGrant,
  LibraryArchiveEntryPayload,
  LibraryArchiveEntryResponsePayload,
  LibraryCreateSkillDraftPayload,
  LibraryCreateSkillDraftResponsePayload,
  LibraryDeleteEntryPayload,
  LibraryDeleteEntryResponsePayload,
  LibraryDeleteSkillDraftPayload,
  LibraryDeleteSkillDraftResponsePayload,
  LibraryEntry,
  LibraryImportEntryPayload,
  LibraryImportEntryResponsePayload,
  LibraryListEntriesPayload,
  LibrarySaveSkillPayload,
  LibrarySaveSkillResponsePayload,
  LibraryScanEntriesResponsePayload,
  LibrarySetEntryEnabledPayload,
  LocalProviderUsageTelemetry,
  OrchestratorCommandPayload,
  OrchestratorCommandResult,
  SkillDraft,
  SpaceExperienceCaptureMode,
  SpacePrivacyMode,
  SpaceResetPayload,
  SpaceResetResponsePayload,
  UsageSnapshot,
} from "./gateway-protocol.js";
export interface GatewayClientGatewayAdminFacadeApi {
  registerDevice(payload: AuthRegisterDevicePayload): Promise<AuthRegisterDeviceResult>;
  rotateDeviceKey(payload: AuthRotateDeviceKeyPayload): Promise<AuthRotateDeviceKeyResult>;
  revokeDevice(payload: AuthRevokeDevicePayload): Promise<AuthRevokeDeviceResult>;
  listDevices(payload?: AuthListDevicesPayload): Promise<DeviceIdentity[]>;
  issueHttpPrincipalToken(
    payload?: AuthIssueHttpPrincipalTokenPayload,
  ): Promise<AuthIssueHttpPrincipalTokenResult>;
  getUsageSnapshot(apiVersion?: string): Promise<UsageSnapshot>;
  getLocalUsageTelemetry(
    apiVersion?: string,
    providerId?: string,
    providerIds?: string[],
  ): Promise<LocalProviderUsageTelemetry[]>;
  getMemoryDefaults(apiVersion?: string): Promise<GatewayMemoryDefaults>;
  setMemoryDefaults(
    defaultExperienceCapture: SpaceExperienceCaptureMode,
    defaultSpacePrivacyMode?: SpacePrivacyMode,
    apiVersion?: string,
  ): Promise<GatewayMemoryDefaults>;
  listTools(apiVersion?: string): Promise<GatewayTool[]>;
  getTool(toolId: string, apiVersion?: string): Promise<GatewayTool | null>;
  scaffoldTool(
    payload: GatewayScaffoldToolPayload,
  ): Promise<GatewayScaffoldedToolBundle>;
  registerTool(payload: GatewayRegisterToolPayload): Promise<GatewayTool>;
  removeTool(toolId: string, apiVersion?: string): Promise<boolean>;
  listToolApprovalGrants(
    payload?: GatewayListToolApprovalGrantsPayload,
  ): Promise<GatewayToolApprovalGrant[]>;
  revokeToolApprovalGrant(
    payload: GatewayRevokeToolApprovalGrantPayload,
  ): Promise<GatewayRevokeToolApprovalGrantResult>;
  getExternalConnectivity(
    apiVersion?: string,
  ): Promise<GatewayGetExternalConnectivityResponsePayload>;
  setExternalConnectivity(
    mode: GatewayExternalConnectivityMode,
    options?: { funnelEnabled?: boolean | null; apiVersion?: string },
  ): Promise<GatewaySetExternalConnectivityResponsePayload>;
  getGatewayPolicy(apiVersion?: string): Promise<GatewayPolicy>;
  updateGatewayPolicy(payload: GatewayPolicyUpdatePayload): Promise<GatewayPolicy>;
  factoryResetGateway(
    payload: GatewayFactoryResetPayload,
  ): Promise<GatewayFactoryResetResponsePayload>;
  resetSpace(payload: SpaceResetPayload): Promise<SpaceResetResponsePayload>;
  listLibraryEntries(payload?: LibraryListEntriesPayload): Promise<LibraryEntry[]>;
  getLibraryEntry(
    entryId: string,
    apiVersion?: string,
    includeContent?: boolean,
  ): Promise<LibraryEntry>;
  saveLibrarySkill(
    payload: LibrarySaveSkillPayload,
  ): Promise<LibrarySaveSkillResponsePayload>;
  importLibraryEntry(
    payload: LibraryImportEntryPayload,
  ): Promise<LibraryImportEntryResponsePayload>;
  archiveLibraryEntry(
    payload: LibraryArchiveEntryPayload,
  ): Promise<LibraryArchiveEntryResponsePayload>;
  setLibraryEntryEnabled(payload: LibrarySetEntryEnabledPayload): Promise<LibraryEntry>;
  deleteLibraryEntry(
    payload: LibraryDeleteEntryPayload,
  ): Promise<LibraryDeleteEntryResponsePayload>;
  scanLibraryEntries(
    apiVersion?: string,
  ): Promise<LibraryScanEntriesResponsePayload>;
  listSkillDrafts(apiVersion?: string): Promise<SkillDraft[]>;
  getSkillDraft(draftId: string, apiVersion?: string): Promise<SkillDraft>;
  createSkillDraft(
    payload: LibraryCreateSkillDraftPayload,
  ): Promise<LibraryCreateSkillDraftResponsePayload>;
  deleteSkillDraft(
    payload: LibraryDeleteSkillDraftPayload,
  ): Promise<LibraryDeleteSkillDraftResponsePayload>;
  sendOrchestratorCommand(
    payload: OrchestratorCommandPayload,
  ): Promise<OrchestratorCommandResult>;
  getOrchestratorCommand(
    commandId: string,
    apiVersion?: string,
  ): Promise<OrchestratorCommandResult>;
}
interface GatewayClientGatewayAdminFacadeContext {
  readonly endpointRequests: GatewayClientRequestInvoker;
  minimumRequestTimeout(minimumMs: number): number;
}

function registerDevice(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: AuthRegisterDevicePayload,
): Promise<AuthRegisterDeviceResult> {
  return GatewayAdminApi.registerDevice(this.endpointRequests, payload);
}

function rotateDeviceKey(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: AuthRotateDeviceKeyPayload,
): Promise<AuthRotateDeviceKeyResult> {
  return GatewayAdminApi.rotateDeviceKey(this.endpointRequests, payload);
}

function revokeDevice(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: AuthRevokeDevicePayload,
): Promise<AuthRevokeDeviceResult> {
  return GatewayAdminApi.revokeDevice(this.endpointRequests, payload);
}

function listDevices(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: AuthListDevicesPayload = {},
): Promise<DeviceIdentity[]> {
  return GatewayAdminApi.listDevices(this.endpointRequests, payload);
}

function issueHttpPrincipalToken(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: AuthIssueHttpPrincipalTokenPayload = {},
): Promise<AuthIssueHttpPrincipalTokenResult> {
  return GatewayAdminApi.issueHttpPrincipalToken(
    this.endpointRequests,
    payload,
  );
}

function getUsageSnapshot(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<UsageSnapshot> {
  return GatewayAdminApi.getUsageSnapshot(this.endpointRequests, apiVersion);
}

function getLocalUsageTelemetry(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
  providerId?: string,
  providerIds?: string[],
): Promise<LocalProviderUsageTelemetry[]> {
  return GatewayAdminApi.getLocalUsageTelemetry(
    this.endpointRequests,
    apiVersion,
    providerId,
    providerIds,
  );
}

function getMemoryDefaults(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<GatewayMemoryDefaults> {
  return GatewayAdminApi.getMemoryDefaults(this.endpointRequests, apiVersion);
}

function setMemoryDefaults(
  this: GatewayClientGatewayAdminFacadeContext,
  defaultExperienceCapture: SpaceExperienceCaptureMode,
  defaultSpacePrivacyMode: SpacePrivacyMode = "STANDARD",
  apiVersion?: string,
): Promise<GatewayMemoryDefaults> {
  return GatewayAdminApi.setMemoryDefaults(
    this.endpointRequests,
    defaultExperienceCapture,
    defaultSpacePrivacyMode,
    apiVersion,
  );
}

function listTools(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<GatewayTool[]> {
  return GatewayAdminApi.listTools(this.endpointRequests, apiVersion);
}

function getTool(
  this: GatewayClientGatewayAdminFacadeContext,
  toolId: string,
  apiVersion?: string,
): Promise<GatewayTool | null> {
  return GatewayAdminApi.getTool(this.endpointRequests, toolId, apiVersion);
}

function scaffoldTool(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayScaffoldToolPayload,
): Promise<GatewayScaffoldedToolBundle> {
  return GatewayAdminApi.scaffoldTool(this.endpointRequests, payload);
}

function registerTool(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayRegisterToolPayload,
): Promise<GatewayTool> {
  return GatewayAdminApi.registerTool(this.endpointRequests, payload);
}

function removeTool(
  this: GatewayClientGatewayAdminFacadeContext,
  toolId: string,
  apiVersion?: string,
): Promise<boolean> {
  return GatewayAdminApi.removeTool(
    this.endpointRequests,
    toolId,
    apiVersion,
  );
}

function listToolApprovalGrants(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayListToolApprovalGrantsPayload = {},
): Promise<GatewayToolApprovalGrant[]> {
  return GatewayAdminApi.listToolApprovalGrants(this.endpointRequests, payload);
}

function revokeToolApprovalGrant(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayRevokeToolApprovalGrantPayload,
): Promise<GatewayRevokeToolApprovalGrantResult> {
  return GatewayAdminApi.revokeToolApprovalGrant(this.endpointRequests, payload);
}

function getExternalConnectivity(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<GatewayGetExternalConnectivityResponsePayload> {
  return GatewayAdminApi.getExternalConnectivity(
    this.endpointRequests,
    apiVersion,
  );
}

function setExternalConnectivity(
  this: GatewayClientGatewayAdminFacadeContext,
  mode: GatewayExternalConnectivityMode,
  options?: { funnelEnabled?: boolean | null; apiVersion?: string },
): Promise<GatewaySetExternalConnectivityResponsePayload> {
  return GatewayAdminApi.setExternalConnectivity(
    this.endpointRequests,
    mode,
    options,
  );
}

function getGatewayPolicy(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<GatewayPolicy> {
  return GatewayAdminApi.getGatewayPolicy(this.endpointRequests, apiVersion);
}

function updateGatewayPolicy(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayPolicyUpdatePayload,
): Promise<GatewayPolicy> {
  return GatewayAdminApi.updateGatewayPolicy(this.endpointRequests, payload);
}

function factoryResetGateway(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: GatewayFactoryResetPayload,
): Promise<GatewayFactoryResetResponsePayload> {
  return GatewayAdminApi.factoryResetGateway(
    this.endpointRequests,
    payload,
    this.minimumRequestTimeout(180_000),
  );
}

function resetSpace(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: SpaceResetPayload,
): Promise<SpaceResetResponsePayload> {
  return GatewayAdminApi.resetSpace(
    this.endpointRequests,
    payload,
    this.minimumRequestTimeout(180_000),
  );
}

function listLibraryEntries(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryListEntriesPayload = {},
): Promise<LibraryEntry[]> {
  return GatewayAdminApi.listLibraryEntries(this.endpointRequests, payload);
}

function getLibraryEntry(
  this: GatewayClientGatewayAdminFacadeContext,
  entryId: string,
  apiVersion?: string,
  includeContent?: boolean,
): Promise<LibraryEntry> {
  return GatewayAdminApi.getLibraryEntry(
    this.endpointRequests,
    entryId,
    apiVersion,
    includeContent,
  );
}

function saveLibrarySkill(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibrarySaveSkillPayload,
): Promise<LibrarySaveSkillResponsePayload> {
  return GatewayAdminApi.saveLibrarySkill(this.endpointRequests, payload);
}

function importLibraryEntry(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryImportEntryPayload,
): Promise<LibraryImportEntryResponsePayload> {
  return GatewayAdminApi.importLibraryEntry(this.endpointRequests, payload);
}

function archiveLibraryEntry(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryArchiveEntryPayload,
): Promise<LibraryArchiveEntryResponsePayload> {
  return GatewayAdminApi.archiveLibraryEntry(this.endpointRequests, payload);
}

function setLibraryEntryEnabled(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibrarySetEntryEnabledPayload,
): Promise<LibraryEntry> {
  return GatewayAdminApi.setLibraryEntryEnabled(this.endpointRequests, payload);
}

function deleteLibraryEntry(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryDeleteEntryPayload,
): Promise<LibraryDeleteEntryResponsePayload> {
  return GatewayAdminApi.deleteLibraryEntry(this.endpointRequests, payload);
}

function scanLibraryEntries(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<LibraryScanEntriesResponsePayload> {
  return GatewayAdminApi.scanLibraryEntries(this.endpointRequests, apiVersion);
}

function listSkillDrafts(
  this: GatewayClientGatewayAdminFacadeContext,
  apiVersion?: string,
): Promise<SkillDraft[]> {
  return GatewayAdminApi.listSkillDrafts(this.endpointRequests, apiVersion);
}

function getSkillDraft(
  this: GatewayClientGatewayAdminFacadeContext,
  draftId: string,
  apiVersion?: string,
): Promise<SkillDraft> {
  return GatewayAdminApi.getSkillDraft(
    this.endpointRequests,
    draftId,
    apiVersion,
  );
}

function createSkillDraft(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryCreateSkillDraftPayload,
): Promise<LibraryCreateSkillDraftResponsePayload> {
  return GatewayAdminApi.createSkillDraft(this.endpointRequests, payload);
}

function deleteSkillDraft(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: LibraryDeleteSkillDraftPayload,
): Promise<LibraryDeleteSkillDraftResponsePayload> {
  return GatewayAdminApi.deleteSkillDraft(this.endpointRequests, payload);
}

function sendOrchestratorCommand(
  this: GatewayClientGatewayAdminFacadeContext,
  payload: OrchestratorCommandPayload,
): Promise<OrchestratorCommandResult> {
  return GatewayAdminApi.sendOrchestratorCommand(this.endpointRequests, payload);
}

function getOrchestratorCommand(
  this: GatewayClientGatewayAdminFacadeContext,
  commandId: string,
  apiVersion?: string,
): Promise<OrchestratorCommandResult> {
  return GatewayAdminApi.getOrchestratorCommand(
    this.endpointRequests,
    commandId,
    apiVersion,
  );
}

const gatewayAdminFacadeApiDescriptors = Object.fromEntries(
  Object.entries({
    registerDevice,
    rotateDeviceKey,
    revokeDevice,
    listDevices,
    issueHttpPrincipalToken,
    getUsageSnapshot,
    getLocalUsageTelemetry,
    getMemoryDefaults,
    setMemoryDefaults,
    listTools,
    getTool,
    scaffoldTool,
    registerTool,
    removeTool,
    listToolApprovalGrants,
    revokeToolApprovalGrant,
    getExternalConnectivity,
    setExternalConnectivity,
    getGatewayPolicy,
    updateGatewayPolicy,
    factoryResetGateway,
    resetSpace,
    listLibraryEntries,
    getLibraryEntry,
    saveLibrarySkill,
    importLibraryEntry,
    archiveLibraryEntry,
    setLibraryEntryEnabled,
    deleteLibraryEntry,
    scanLibraryEntries,
    listSkillDrafts,
    getSkillDraft,
    createSkillDraft,
    deleteSkillDraft,
    sendOrchestratorCommand,
    getOrchestratorCommand,
  }).map(([name, value]) => [
    name,
    { value, writable: true, configurable: true },
  ]),
) as PropertyDescriptorMap;

export function installGatewayClientGatewayAdminFacadeApi(prototype: object): void {
  Object.defineProperties(prototype, gatewayAdminFacadeApiDescriptors);
}
