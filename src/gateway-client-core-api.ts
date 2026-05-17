import type {
  ApprovalGrantPayload,
  CapabilityInvokePayload,
  ExecuteTurnOptions,
  ExecuteTurnPayload,
  ResumeFeedbackPayload,
  SubscribePayload,
  TurnEffort,
  TurnMode,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export interface TurnResult {
  turnId: string;
  spaceId: string;
  output?: string;
  status: 'completed' | 'pending_feedback' | 'failed';
  error?: string;
  mode?: TurnMode;
  effort?: TurnEffort;
}

/**
 * Capability invocation result
 */
export interface CapabilityResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function executeTurn(
  requests: GatewayClientRequestInvoker,
  optionsOrSpaceUid: ExecuteTurnOptions | string,
  input?: string,
  targetAgentId?: string,
): Promise<TurnResult> {
  const options: ExecuteTurnOptions = typeof optionsOrSpaceUid === 'string'
    ? {
        spaceUid: optionsOrSpaceUid,
        input: input ?? '',
        targetAgentId,
      }
    : optionsOrSpaceUid;
  const payload: ExecuteTurnPayload = {
    spaceUid: options.spaceUid,
    input: options.input,
    targetAgentId: options.targetAgentId,
    targetAgentIds: options.targetAgentIds,
    replyToTurnId: options.replyToTurnId,
    conversationTopology: options.conversationTopology,
    mode: options.mode,
    effort: options.effort,
    accessMode: options.accessMode,
  };

  const result = await requests.request<
    ExecuteTurnPayload,
    TurnResult
  >('execute_turn', payload);
  return result;
}

export async function resumeFeedback(
  requests: GatewayClientRequestInvoker,
  spaceUid: string,
  turnId: string,
  response: 'approve' | 'reject' | 'revise' | 'defer',
  revision?: string,
  approvalGrant?: ApprovalGrantPayload,
): Promise<void> {
  const payload: ResumeFeedbackPayload = {
    spaceUid,
    turnId,
    response,
    revision,
    approvalGrant,
  };

  await requests.request<ResumeFeedbackPayload, void>(
    'resume_feedback',
    payload,
  );
}

export async function subscribe(
  requests: GatewayClientRequestInvoker,
  spaceUids: string[],
): Promise<void> {
  const payload: SubscribePayload = {
    spaceUids,
  };
  await requests.request<SubscribePayload, void>(
    'subscribe',
    payload,
  );
}

export async function invokeCapability(
  requests: GatewayClientRequestInvoker,
  capability: string,
  method: string,
  params: Record<string, unknown>,
  targetProvider?: string,
): Promise<CapabilityResult> {
  const payload: CapabilityInvokePayload = {
    capability,
    method,
    params,
    targetProvider,
  };

  const result = await requests.request<
    CapabilityInvokePayload,
    CapabilityResult
  >('capability_invoke', payload);
  return result;
}
