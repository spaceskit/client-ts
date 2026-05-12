import type {
  SpaceAcceptInsightPayload,
  SpaceAgentNotesRecord,
  SpaceAgentNotesResponsePayload,
  SpaceArtifactDetail,
  SpaceDeleteMemoryPayload,
  SpaceDeleteMemoryResponsePayload,
  SpaceDismissInsightPayload,
  SpaceExperienceRecord,
  SpaceGetArtifactPayload,
  SpaceGetArtifactResponsePayload,
  SpaceGetDebugArtifactPayload,
  SpaceGetDebugArtifactResponsePayload,
  SpaceGetExperiencePayload,
  SpaceGetExperienceResponsePayload,
  SpaceGetInsightPayload,
  SpaceGetInsightResponsePayload,
  SpaceGetSpaceAgentNotesPayload,
  SpaceGetTurnTracePayload,
  SpaceGetTurnTraceResponsePayload,
  SpaceGetUserProfilePayload,
  SpaceInsightActionResponsePayload,
  SpaceListActivityLogPayload,
  SpaceListActivityLogResponsePayload,
  SpaceListArtifactsPayload,
  SpaceListArtifactsResponsePayload,
  SpaceListExperiencesPayload,
  SpaceListExperiencesResponsePayload,
  SpaceListInsightsPayload,
  SpaceListInsightsResponsePayload,
  SpaceListMemoriesPayload,
  SpaceListMemoriesResponsePayload,
  SpaceMemoryRecord,
  SpacePersonalityInsightRecord,
  SpaceRejectInsightPayload,
  SpaceTurnTrace,
  SpaceUpdateMemoryImportancePayload,
  SpaceUpdateMemoryImportanceResponsePayload,
  SpaceUpdateSpaceAgentNotesPayload,
  SpaceUpdateUserProfilePayload,
  SpaceUserProfileRecord,
  SpaceUserProfileResponsePayload,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import { normalizeSpaceTurnTrace } from "./gateway-client-normalizers.js";
import { withDefaultListTotal } from "./gateway-client-response-normalizers.js";

export async function listActivityLog(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListActivityLogPayload,
): Promise<SpaceListActivityLogResponsePayload> {
  const result = await requests.request<
    SpaceListActivityLogPayload,
    SpaceListActivityLogResponsePayload
  >('space.list_activity_log', payload);
  return withDefaultListTotal(result, 'entries');
}

export async function getTurnTrace(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetTurnTracePayload,
): Promise<SpaceTurnTrace> {
  const result = await requests.request<
    SpaceGetTurnTracePayload,
    SpaceGetTurnTraceResponsePayload | SpaceTurnTrace
  >('space.get_turn_trace', payload);
  const trace = 'trace' in result ? result.trace : result;
  return normalizeSpaceTurnTrace(trace);
}

export async function listSpaceArtifacts(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListArtifactsPayload,
): Promise<SpaceListArtifactsResponsePayload> {
  const result = await requests.request<
    SpaceListArtifactsPayload,
    SpaceListArtifactsResponsePayload
  >('space.list_artifacts', payload);
  return withDefaultListTotal(result, 'artifacts');
}

export function getSpaceArtifact(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetArtifactPayload,
): Promise<SpaceArtifactDetail> {
  return requests.requestField<SpaceGetArtifactPayload, SpaceGetArtifactResponsePayload, 'artifact'>(
    'space.get_artifact',
    payload,
    'artifact',
  );
}

export function getSpaceDebugArtifact(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetDebugArtifactPayload,
): Promise<SpaceArtifactDetail> {
  return requests.requestField<
    SpaceGetDebugArtifactPayload,
    SpaceGetDebugArtifactResponsePayload,
    'artifact'
  >('space.get_debug_artifact', payload, 'artifact');
}

export async function listExperiences(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListExperiencesPayload,
): Promise<SpaceListExperiencesResponsePayload> {
  const result = await requests.request<
    SpaceListExperiencesPayload,
    SpaceListExperiencesResponsePayload
  >('space.list_experiences', payload);
  return withDefaultListTotal(result, 'experiences');
}

export function getExperience(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetExperiencePayload,
): Promise<SpaceExperienceRecord> {
  return requests.requestField<SpaceGetExperiencePayload, SpaceGetExperienceResponsePayload, 'experience'>(
    'space.get_experience',
    payload,
    'experience',
  );
}

export async function listInsights(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListInsightsPayload,
): Promise<SpaceListInsightsResponsePayload> {
  const result = await requests.request<
    SpaceListInsightsPayload,
    SpaceListInsightsResponsePayload
  >('space.list_insights', payload);
  return withDefaultListTotal(result, 'insights');
}

export function getInsight(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetInsightPayload,
): Promise<SpacePersonalityInsightRecord> {
  return requests.requestField<SpaceGetInsightPayload, SpaceGetInsightResponsePayload, 'insight'>(
    'space.get_insight',
    payload,
    'insight',
  );
}

export function acceptInsight(
  requests: GatewayClientRequestInvoker,
  payload: SpaceAcceptInsightPayload,
): Promise<SpacePersonalityInsightRecord> {
  return requests.requestField<SpaceAcceptInsightPayload, SpaceInsightActionResponsePayload, 'insight'>(
    'space.accept_insight',
    payload,
    'insight',
  );
}

export function rejectInsight(
  requests: GatewayClientRequestInvoker,
  payload: SpaceRejectInsightPayload,
): Promise<SpacePersonalityInsightRecord> {
  return requests.requestField<SpaceRejectInsightPayload, SpaceInsightActionResponsePayload, 'insight'>(
    'space.reject_insight',
    payload,
    'insight',
  );
}

export function dismissInsight(
  requests: GatewayClientRequestInvoker,
  payload: SpaceDismissInsightPayload,
): Promise<SpacePersonalityInsightRecord> {
  return requests.requestField<SpaceDismissInsightPayload, SpaceInsightActionResponsePayload, 'insight'>(
    'space.dismiss_insight',
    payload,
    'insight',
  );
}

export function getSpaceAgentNotes(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetSpaceAgentNotesPayload,
): Promise<SpaceAgentNotesRecord | null | undefined> {
  return requests.requestField<SpaceGetSpaceAgentNotesPayload, SpaceAgentNotesResponsePayload, 'notes'>(
    'space.get_space_agent_notes',
    payload,
    'notes',
  );
}

export function updateSpaceAgentNotes(
  requests: GatewayClientRequestInvoker,
  payload: SpaceUpdateSpaceAgentNotesPayload,
): Promise<SpaceAgentNotesRecord | null | undefined> {
  return requests.requestField<SpaceUpdateSpaceAgentNotesPayload, SpaceAgentNotesResponsePayload, 'notes'>(
    'space.update_space_agent_notes',
    payload,
    'notes',
  );
}

export function getUserProfile(
  requests: GatewayClientRequestInvoker,
  payload: SpaceGetUserProfilePayload = {},
): Promise<SpaceUserProfileRecord | null | undefined> {
  return requests.requestField<SpaceGetUserProfilePayload, SpaceUserProfileResponsePayload, 'profile'>(
    'space.get_user_profile',
    payload,
    'profile',
  );
}

export function updateUserProfile(
  requests: GatewayClientRequestInvoker,
  payload: SpaceUpdateUserProfilePayload,
): Promise<SpaceUserProfileRecord | null | undefined> {
  return requests.requestField<SpaceUpdateUserProfilePayload, SpaceUserProfileResponsePayload, 'profile'>(
    'space.update_user_profile',
    payload,
    'profile',
  );
}

export async function listMemories(
  requests: GatewayClientRequestInvoker,
  payload: SpaceListMemoriesPayload,
): Promise<SpaceListMemoriesResponsePayload> {
  const result = await requests.request<
    SpaceListMemoriesPayload,
    SpaceListMemoriesResponsePayload
  >('space.list_memories', payload);
  return withDefaultListTotal(result, 'memories');
}

export function deleteMemory(
  requests: GatewayClientRequestInvoker,
  payload: SpaceDeleteMemoryPayload,
): Promise<SpaceDeleteMemoryResponsePayload> {
  return requests.request<SpaceDeleteMemoryPayload, SpaceDeleteMemoryResponsePayload>(
    'space.delete_memory',
    payload,
  );
}

export function updateMemoryImportance(
  requests: GatewayClientRequestInvoker,
  payload: SpaceUpdateMemoryImportancePayload,
): Promise<SpaceMemoryRecord> {
  return requests.requestField<
    SpaceUpdateMemoryImportancePayload,
    SpaceUpdateMemoryImportanceResponsePayload,
    'memory'
  >('space.update_memory_importance', payload, 'memory');
}
