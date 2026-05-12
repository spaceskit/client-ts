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
  GatewayFactoryResetPayload,
  GatewayFactoryResetResponsePayload,
  GatewayGetExternalConnectivityPayload,
  GatewayGetExternalConnectivityResponsePayload,
  GatewayGetLocalUsageTelemetryPayload,
  GatewayGetLocalUsageTelemetryResponsePayload,
  GatewayGetMemoryDefaultsPayload,
  GatewayGetMemoryDefaultsResponsePayload,
  GatewayGetToolPayload,
  GatewayGetToolResponsePayload,
  GatewayListToolApprovalGrantsPayload,
  GatewayListToolApprovalGrantsResponsePayload,
  GatewayListToolsPayload,
  GatewayListToolsResponsePayload,
  GatewayMemoryDefaults,
  GatewayPolicy,
  GatewayPolicyUpdatePayload,
  GatewayRegisterToolPayload,
  GatewayRegisterToolResponsePayload,
  GatewayRemoveToolPayload,
  GatewayRemoveToolResponsePayload,
  GatewayRevokeToolApprovalGrantPayload,
  GatewayRevokeToolApprovalGrantResult,
  GatewayScaffoldToolPayload,
  GatewayScaffoldToolResponsePayload,
  GatewayScaffoldedToolBundle,
  GatewaySetExternalConnectivityPayload,
  GatewaySetExternalConnectivityResponsePayload,
  GatewaySetMemoryDefaultsPayload,
  GatewaySetMemoryDefaultsResponsePayload,
  GatewayTool,
  GatewayToolApprovalGrant,
  GatewayExternalConnectivityMode,
  LibraryArchiveEntryPayload,
  LibraryArchiveEntryResponsePayload,
  LibraryCreateSkillDraftPayload,
  LibraryCreateSkillDraftResponsePayload,
  LibraryDeleteEntryPayload,
  LibraryDeleteEntryResponsePayload,
  LibraryDeleteSkillDraftPayload,
  LibraryDeleteSkillDraftResponsePayload,
  LibraryEntry,
  LibraryGetEntryPayload,
  LibraryGetEntryResponsePayload,
  LibraryGetSkillDraftPayload,
  LibraryGetSkillDraftResponsePayload,
  LibraryImportEntryPayload,
  LibraryImportEntryResponsePayload,
  LibraryListEntriesPayload,
  LibraryListEntriesResponsePayload,
  LibraryListSkillDraftsPayload,
  LibraryListSkillDraftsResponsePayload,
  LibrarySaveSkillPayload,
  LibrarySaveSkillResponsePayload,
  LibraryScanEntriesPayload,
  LibraryScanEntriesResponsePayload,
  LibrarySetEntryEnabledPayload,
  LibrarySetEntryEnabledResponsePayload,
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
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function registerDevice(
  requests: GatewayClientRequestInvoker,
  payload: AuthRegisterDevicePayload,
): Promise<AuthRegisterDeviceResult> {
  return requests.request<AuthRegisterDevicePayload, AuthRegisterDeviceResult>(
    "auth.register_device",
    payload,
  );
}

export function rotateDeviceKey(
  requests: GatewayClientRequestInvoker,
  payload: AuthRotateDeviceKeyPayload,
): Promise<AuthRotateDeviceKeyResult> {
  return requests.request<AuthRotateDeviceKeyPayload, AuthRotateDeviceKeyResult>(
    "auth.rotate_device_key",
    payload,
  );
}

export function revokeDevice(
  requests: GatewayClientRequestInvoker,
  payload: AuthRevokeDevicePayload,
): Promise<AuthRevokeDeviceResult> {
  return requests.request<AuthRevokeDevicePayload, AuthRevokeDeviceResult>(
    "auth.revoke_device",
    payload,
  );
}

export function listDevices(
  requests: GatewayClientRequestInvoker,
  payload: AuthListDevicesPayload = {},
): Promise<DeviceIdentity[]> {
  return requests.requestField<AuthListDevicesPayload, { devices: DeviceIdentity[] }, "devices">(
    "auth.list_devices",
    payload,
    "devices",
  );
}

export function issueHttpPrincipalToken(
  requests: GatewayClientRequestInvoker,
  payload: AuthIssueHttpPrincipalTokenPayload = {},
): Promise<AuthIssueHttpPrincipalTokenResult> {
  return requests.request<AuthIssueHttpPrincipalTokenPayload, AuthIssueHttpPrincipalTokenResult>(
    "auth.issue_http_principal_token",
    payload,
  );
}

export function getUsageSnapshot(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<UsageSnapshot> {
  return requests.requestField<{ apiVersion?: string }, { snapshot: UsageSnapshot }, "snapshot">(
    "usage.get_snapshot",
    { apiVersion },
    "snapshot",
  );
}

export function getLocalUsageTelemetry(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
  providerId?: string,
  providerIds?: string[],
): Promise<LocalProviderUsageTelemetry[]> {
  const payload: GatewayGetLocalUsageTelemetryPayload = {
    apiVersion,
    providerId,
    providerIds,
  };
  return requests.requestField<
    GatewayGetLocalUsageTelemetryPayload,
    GatewayGetLocalUsageTelemetryResponsePayload,
    "telemetry"
  >("gateway.get_local_usage_telemetry", payload, "telemetry");
}

export function getMemoryDefaults(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<GatewayMemoryDefaults> {
  const payload: GatewayGetMemoryDefaultsPayload = { apiVersion };
  return requests.requestField<
    GatewayGetMemoryDefaultsPayload,
    GatewayGetMemoryDefaultsResponsePayload,
    "defaults"
  >("gateway.get_memory_defaults", payload, "defaults");
}

export function setMemoryDefaults(
  requests: GatewayClientRequestInvoker,
  defaultExperienceCapture: SpaceExperienceCaptureMode,
  defaultSpacePrivacyMode: SpacePrivacyMode = "STANDARD",
  apiVersion?: string,
): Promise<GatewayMemoryDefaults> {
  const payload: GatewaySetMemoryDefaultsPayload = {
    apiVersion,
    defaultExperienceCapture,
    defaultSpacePrivacyMode,
  };
  return requests.requestField<
    GatewaySetMemoryDefaultsPayload,
    GatewaySetMemoryDefaultsResponsePayload,
    "defaults"
  >("gateway.set_memory_defaults", payload, "defaults");
}

export function listTools(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<GatewayTool[]> {
  const payload: GatewayListToolsPayload = { apiVersion };
  return requests.requestField<GatewayListToolsPayload, GatewayListToolsResponsePayload, "tools">(
    "tool.list",
    payload,
    "tools",
  );
}

export function getTool(
  requests: GatewayClientRequestInvoker,
  toolId: string,
  apiVersion?: string,
): Promise<GatewayTool | null> {
  const payload: GatewayGetToolPayload = { apiVersion, toolId };
  return requests.requestField<GatewayGetToolPayload, GatewayGetToolResponsePayload, "tool">(
    "tool.get",
    payload,
    "tool",
  );
}

export async function scaffoldTool(
  requests: GatewayClientRequestInvoker,
  payload: GatewayScaffoldToolPayload,
): Promise<GatewayScaffoldedToolBundle> {
  const result = await requests.request<
    GatewayScaffoldToolPayload,
    GatewayScaffoldToolResponsePayload
  >("tool.scaffold", payload);
  return {
    manifest: result.manifest,
    readme: result.readme,
  };
}

export function registerTool(
  requests: GatewayClientRequestInvoker,
  payload: GatewayRegisterToolPayload,
): Promise<GatewayTool> {
  return requests.requestField<GatewayRegisterToolPayload, GatewayRegisterToolResponsePayload, "tool">(
    "tool.register",
    payload,
    "tool",
  );
}

export function removeTool(
  requests: GatewayClientRequestInvoker,
  toolId: string,
  apiVersion?: string,
): Promise<boolean> {
  const payload: GatewayRemoveToolPayload = { apiVersion, toolId };
  return requests.requestField<GatewayRemoveToolPayload, GatewayRemoveToolResponsePayload, "removed">(
    "tool.remove",
    payload,
    "removed",
  );
}

export function listToolApprovalGrants(
  requests: GatewayClientRequestInvoker,
  payload: GatewayListToolApprovalGrantsPayload = {},
): Promise<GatewayToolApprovalGrant[]> {
  return requests.requestField<
    GatewayListToolApprovalGrantsPayload,
    GatewayListToolApprovalGrantsResponsePayload,
    "grants"
  >("tool.list_grants", payload, "grants");
}

export function revokeToolApprovalGrant(
  requests: GatewayClientRequestInvoker,
  payload: GatewayRevokeToolApprovalGrantPayload,
): Promise<GatewayRevokeToolApprovalGrantResult> {
  return requests.request<
    GatewayRevokeToolApprovalGrantPayload,
    GatewayRevokeToolApprovalGrantResult
  >("tool.revoke_grant", payload);
}

export function getExternalConnectivity(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<GatewayGetExternalConnectivityResponsePayload> {
  return requests.request<
    GatewayGetExternalConnectivityPayload,
    GatewayGetExternalConnectivityResponsePayload
  >("gateway.get_external_connectivity", { apiVersion });
}

export function setExternalConnectivity(
  requests: GatewayClientRequestInvoker,
  mode: GatewayExternalConnectivityMode,
  options?: { funnelEnabled?: boolean | null; apiVersion?: string },
): Promise<GatewaySetExternalConnectivityResponsePayload> {
  return requests.request<
    GatewaySetExternalConnectivityPayload,
    GatewaySetExternalConnectivityResponsePayload
  >("gateway.set_external_connectivity", {
    apiVersion: options?.apiVersion,
    mode,
    funnelEnabled: options?.funnelEnabled,
  });
}

export function getGatewayPolicy(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<GatewayPolicy> {
  return requests.requestField<{ apiVersion?: string }, { policy: GatewayPolicy }, "policy">(
    "gateway.get_policy",
    { apiVersion },
    "policy",
  );
}

export function updateGatewayPolicy(
  requests: GatewayClientRequestInvoker,
  payload: GatewayPolicyUpdatePayload,
): Promise<GatewayPolicy> {
  return requests.requestField<GatewayPolicyUpdatePayload, { policy: GatewayPolicy }, "policy">(
    "gateway.update_policy",
    payload,
    "policy",
  );
}

export function factoryResetGateway(
  requests: GatewayClientRequestInvoker,
  payload: GatewayFactoryResetPayload,
  timeoutMs: number,
): Promise<GatewayFactoryResetResponsePayload> {
  return requests.request<GatewayFactoryResetPayload, GatewayFactoryResetResponsePayload>(
    "gateway.factory_reset",
    payload,
    timeoutMs,
  );
}

export function resetSpace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceResetPayload,
  timeoutMs: number,
): Promise<SpaceResetResponsePayload> {
  return requests.request<SpaceResetPayload, SpaceResetResponsePayload>(
    "space.reset",
    payload,
    timeoutMs,
  );
}

export function listLibraryEntries(
  requests: GatewayClientRequestInvoker,
  payload: LibraryListEntriesPayload = {},
): Promise<LibraryEntry[]> {
  return requests.requestField<
    LibraryListEntriesPayload,
    LibraryListEntriesResponsePayload,
    "entries"
  >("library.list_entries", payload, "entries");
}

export function getLibraryEntry(
  requests: GatewayClientRequestInvoker,
  entryId: string,
  apiVersion?: string,
  includeContent?: boolean,
): Promise<LibraryEntry> {
  const payload: LibraryGetEntryPayload = { apiVersion, entryId, includeContent };
  return requests.requestField<LibraryGetEntryPayload, LibraryGetEntryResponsePayload, "entry">(
    "library.get_entry",
    payload,
    "entry",
  );
}

export function saveLibrarySkill(
  requests: GatewayClientRequestInvoker,
  payload: LibrarySaveSkillPayload,
): Promise<LibrarySaveSkillResponsePayload> {
  return requests.request<LibrarySaveSkillPayload, LibrarySaveSkillResponsePayload>(
    "library.save_skill",
    payload,
  );
}

export function importLibraryEntry(
  requests: GatewayClientRequestInvoker,
  payload: LibraryImportEntryPayload,
): Promise<LibraryImportEntryResponsePayload> {
  return requests.request<LibraryImportEntryPayload, LibraryImportEntryResponsePayload>(
    "library.import_entry",
    payload,
  );
}

export function archiveLibraryEntry(
  requests: GatewayClientRequestInvoker,
  payload: LibraryArchiveEntryPayload,
): Promise<LibraryArchiveEntryResponsePayload> {
  return requests.request<LibraryArchiveEntryPayload, LibraryArchiveEntryResponsePayload>(
    "library.archive_entry",
    payload,
  );
}

export function setLibraryEntryEnabled(
  requests: GatewayClientRequestInvoker,
  payload: LibrarySetEntryEnabledPayload,
): Promise<LibraryEntry> {
  return requests.requestField<
    LibrarySetEntryEnabledPayload,
    LibrarySetEntryEnabledResponsePayload,
    "entry"
  >("library.set_entry_enabled", payload, "entry");
}

export function deleteLibraryEntry(
  requests: GatewayClientRequestInvoker,
  payload: LibraryDeleteEntryPayload,
): Promise<LibraryDeleteEntryResponsePayload> {
  return requests.request<LibraryDeleteEntryPayload, LibraryDeleteEntryResponsePayload>(
    "library.delete_entry",
    payload,
  );
}

export function scanLibraryEntries(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<LibraryScanEntriesResponsePayload> {
  return requests.request<LibraryScanEntriesPayload, LibraryScanEntriesResponsePayload>(
    "library.scan_entries",
    { apiVersion },
  );
}

export function listSkillDrafts(
  requests: GatewayClientRequestInvoker,
  apiVersion?: string,
): Promise<SkillDraft[]> {
  return requests.requestField<
    LibraryListSkillDraftsPayload,
    LibraryListSkillDraftsResponsePayload,
    "drafts"
  >("library.list_skill_drafts", { apiVersion }, "drafts");
}

export function getSkillDraft(
  requests: GatewayClientRequestInvoker,
  draftId: string,
  apiVersion?: string,
): Promise<SkillDraft> {
  return requests.requestField<
    LibraryGetSkillDraftPayload,
    LibraryGetSkillDraftResponsePayload,
    "draft"
  >("library.get_skill_draft", { apiVersion, draftId }, "draft");
}

export function createSkillDraft(
  requests: GatewayClientRequestInvoker,
  payload: LibraryCreateSkillDraftPayload,
): Promise<LibraryCreateSkillDraftResponsePayload> {
  return requests.request<LibraryCreateSkillDraftPayload, LibraryCreateSkillDraftResponsePayload>(
    "library.create_skill_draft",
    payload,
  );
}

export function deleteSkillDraft(
  requests: GatewayClientRequestInvoker,
  payload: LibraryDeleteSkillDraftPayload,
): Promise<LibraryDeleteSkillDraftResponsePayload> {
  return requests.request<LibraryDeleteSkillDraftPayload, LibraryDeleteSkillDraftResponsePayload>(
    "library.delete_skill_draft",
    payload,
  );
}

export function sendOrchestratorCommand(
  requests: GatewayClientRequestInvoker,
  payload: OrchestratorCommandPayload,
): Promise<OrchestratorCommandResult> {
  return requests.requestField<
    OrchestratorCommandPayload,
    { command: OrchestratorCommandResult },
    "command"
  >("orchestrator.command", payload, "command");
}

export function getOrchestratorCommand(
  requests: GatewayClientRequestInvoker,
  commandId: string,
  apiVersion?: string,
): Promise<OrchestratorCommandResult> {
  return requests.requestField<
    { apiVersion?: string; commandId: string },
    { command: OrchestratorCommandResult },
    "command"
  >("orchestrator.get_command", { apiVersion, commandId }, "command");
}
