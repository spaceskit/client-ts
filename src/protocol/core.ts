/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
import type { GatewayToolApprovalGrantMode } from "./gateway-tools.js";

export interface GatewayMessage<T = unknown> {
  type: string;
  id: string;
  replyTo?: string;
  ts: string;
  payload: T;
}

/**
 * Client-to-Gateway: Authenticate with the gateway
 */
export interface AuthenticatePayload {
  publicKey: string;
  signature: string;
  clientType: string;
  clientVersion: string;
  deviceId?: string;
  devicePublicKey?: string;
  deviceProofSignature?: string;
}

/**
 * Client-to-Gateway: Execute a turn in a space
 */
export interface ExecuteTurnPayload {
  spaceUid: string;
  input: string;
  targetAgentId?: string;
  targetAgentIds?: string[];
  replyToTurnId?: string;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  mode?: 'ask' | 'plan' | 'execute';
  effort?: 'low' | 'medium' | 'high';
  accessMode?: 'default' | 'full_access';
}

export type TurnMode = 'ask' | 'plan' | 'execute';
export type TurnEffort = 'low' | 'medium' | 'high';
export type TurnAccessMode = 'default' | 'full_access';

export interface ExecuteTurnOptions {
  spaceUid: string;
  input: string;
  targetAgentId?: string;
  targetAgentIds?: string[];
  replyToTurnId?: string;
  conversationTopology?: 'direct' | 'shared_team_chat' | 'broadcast_team';
  mode?: TurnMode;
  effort?: TurnEffort;
  accessMode?: TurnAccessMode;
}

/**
 * Client-to-Gateway: Resume a turn with feedback
 */
export interface ResumeFeedbackPayload {
  spaceUid: string;
  turnId: string;
  response: 'approve' | 'reject' | 'revise' | 'defer';
  revision?: string;
  approvalGrant?: ApprovalGrantPayload;
}

export interface ApprovalGrantPayload {
  mode: GatewayToolApprovalGrantMode;
  ttlSeconds?: number;
}

/**
 * Client-to-Gateway: Subscribe to space events
 */
export interface SubscribePayload {
  spaceUids: string[];
}

/**
 * Client-to-Gateway: Invoke a capability
 */
export interface CapabilityInvokePayload {
  capability: string;
  method: string;
  params: Record<string, unknown>;
  targetProvider?: string;
}

/**
 * Space Admin: create a new space.
 */
