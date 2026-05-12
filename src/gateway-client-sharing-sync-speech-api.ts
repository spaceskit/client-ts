import type {
  SharedContextRef,
  SpaceLinkPayload,
  SpaceLinkResult,
  SpaceParticipant,
  SpacePullSharedContextPayload,
  SpacePullSharedContextResult,
  SpaceShareContextPayload,
  SpaceShareCreateInvitePayload,
  SpaceShareInvite,
  SpaceShareJoinPayload,
  SpaceShareListParticipantsPayload,
  SpaceShareRevokePayload,
  SpaceShareRevokeResult,
  SpaceUnlinkPayload,
  SpeechAudioChunkPayload,
  SpeechControlPayload,
  SpeechEventPayload,
  SpeechStartPayload,
  SyncAnnouncePayload,
  SyncAnnounceResult,
  SyncPullResourcesPayload,
  SyncPullResourcesResult,
  SyncQueryResourcesPayload,
  SyncQueryResourcesResult,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function linkSpaces(
  requests: GatewayClientRequestInvoker,
  payload: SpaceLinkPayload,
): Promise<SpaceLinkResult> {
  return requests.requestField<SpaceLinkPayload, { link: SpaceLinkResult }, 'link'>(
    'space.link',
    payload,
    'link',
  );
}

export function unlinkSpaces(
  requests: GatewayClientRequestInvoker,
  payload: SpaceUnlinkPayload,
): Promise<boolean> {
  return requests.requestField<SpaceUnlinkPayload, { removed: boolean }, 'removed'>(
    'space.unlink',
    payload,
    'removed',
  );
}

export function shareSpaceContext(
  requests: GatewayClientRequestInvoker,
  payload: SpaceShareContextPayload,
): Promise<SharedContextRef> {
  return requests.requestField<SpaceShareContextPayload, { transfer: SharedContextRef }, 'transfer'>(
    'space.share_context',
    payload,
    'transfer',
  );
}

export function pullSharedContext(
  requests: GatewayClientRequestInvoker,
  payload: SpacePullSharedContextPayload,
): Promise<SpacePullSharedContextResult> {
  return requests.request<SpacePullSharedContextPayload, SpacePullSharedContextResult>(
    'space.pull_shared_context',
    payload,
  );
}

export function createSpaceShareInvite(
  requests: GatewayClientRequestInvoker,
  payload: SpaceShareCreateInvitePayload,
): Promise<SpaceShareInvite> {
  return requests.requestField<SpaceShareCreateInvitePayload, { invite: SpaceShareInvite }, 'invite'>(
    'space.share_create_invite',
    payload,
    'invite',
  );
}

export function joinSpaceShareInvite(
  requests: GatewayClientRequestInvoker,
  payload: SpaceShareJoinPayload,
): Promise<SpaceParticipant> {
  return requests.requestField<SpaceShareJoinPayload, { participant: SpaceParticipant }, 'participant'>(
    'space.share_join',
    payload,
    'participant',
  );
}

export function revokeSpaceShareAccess(
  requests: GatewayClientRequestInvoker,
  payload: SpaceShareRevokePayload,
): Promise<SpaceShareRevokeResult> {
  return requests.request<SpaceShareRevokePayload, SpaceShareRevokeResult>(
    'space.share_revoke',
    payload,
  );
}

export function listSpaceParticipants(
  requests: GatewayClientRequestInvoker,
  payload: SpaceShareListParticipantsPayload,
): Promise<SpaceParticipant[]> {
  return requests.requestField<
    SpaceShareListParticipantsPayload,
    { spaceId: string; participants: SpaceParticipant[] },
    'participants'
  >('space.share_list_participants', payload, 'participants');
}

export function announceSyncPeer(
  requests: GatewayClientRequestInvoker,
  payload: SyncAnnouncePayload,
): Promise<SyncAnnounceResult> {
  return requests.request<SyncAnnouncePayload, SyncAnnounceResult>(
    'sync.announce',
    payload,
  );
}

export function querySyncResources(
  requests: GatewayClientRequestInvoker,
  payload: SyncQueryResourcesPayload,
): Promise<SyncQueryResourcesResult> {
  return requests.request<SyncQueryResourcesPayload, SyncQueryResourcesResult>(
    'sync.query_resources',
    payload,
  );
}

export function pullSyncResources(
  requests: GatewayClientRequestInvoker,
  payload: SyncPullResourcesPayload,
): Promise<SyncPullResourcesResult> {
  return requests.request<SyncPullResourcesPayload, SyncPullResourcesResult>(
    'sync.pull_resources',
    payload,
  );
}

export function startSpeechSession(
  requests: GatewayClientRequestInvoker,
  payload: SpeechStartPayload,
): Promise<SpeechEventPayload> {
  return requests.requestField<SpeechStartPayload, { event: SpeechEventPayload }, 'event'>(
    'speech.start',
    payload,
    'event',
  );
}

export function sendSpeechAudioChunk(
  requests: GatewayClientRequestInvoker,
  payload: SpeechAudioChunkPayload,
): Promise<SpeechEventPayload[]> {
  return requests.requestField<SpeechAudioChunkPayload, { events: SpeechEventPayload[] }, 'events'>(
    'speech.audio_chunk',
    payload,
    'events',
  );
}

export function controlSpeechSession(
  requests: GatewayClientRequestInvoker,
  payload: SpeechControlPayload,
): Promise<SpeechEventPayload> {
  return requests.requestField<SpeechControlPayload, { event: SpeechEventPayload }, 'event'>(
    'speech.control',
    payload,
    'event',
  );
}
