/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
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
  typedPayload: TypedTurnEventPayload;
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
