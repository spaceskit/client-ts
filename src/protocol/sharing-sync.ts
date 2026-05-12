/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
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
