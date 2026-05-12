import type { GatewayClientEventBus } from "./gateway-client-events.js";
import {
  normalizeTurnEventPayload,
  normalizeTurnStreamPayload,
} from "./gateway-client-normalizers.js";
import type { GatewayClientPendingRequest } from "./gateway-client-request.js";
import type {
  AdapterCapabilityInvokePayload,
  AgentIdlePayload,
  AgentMessagePayload,
  AgentPokePayload,
  AuthChallengePayload,
  AuthResultPayload,
  ErrorPayload,
  GatewayMessage,
  NotificationPayload,
  OrchestratorEventPayload,
  SpaceAgentUpdatedEventPayload,
  SpaceStatePayload,
  SpeechEventPayload,
  TaskDependencyPayload,
  TaskDependencyResolvedPayload,
  TurnEventPayload,
  TurnStreamPayload,
} from "./gateway-protocol.js";

export interface GatewayClientMessageDispatchContext {
  pendingRequests: Map<string, GatewayClientPendingRequest>;
  events: GatewayClientEventBus;
  handleAuthChallenge: (payload: AuthChallengePayload) => void;
  handleAuthResult: (payload: AuthResultPayload) => void;
  onParseError?: (error: Error) => void;
  warnUnknownMessage?: (type: string) => void;
}

export function dispatchGatewayClientMessage(
  data: string,
  context: GatewayClientMessageDispatchContext,
): void {
  try {
    const message: GatewayMessage = JSON.parse(data);
    const { type, replyTo, payload } = message;

    if (replyTo && context.pendingRequests.has(replyTo)) {
      resolvePendingRequest(type, replyTo, payload, context.pendingRequests);
      return;
    }

    dispatchUnsolicitedMessage(type, payload, context);
  } catch (error) {
    context.onParseError?.(new Error(`Failed to parse message: ${error}`));
  }
}

function resolvePendingRequest(
  type: string,
  replyTo: string,
  payload: unknown,
  pendingRequests: Map<string, GatewayClientPendingRequest>,
): void {
  const pending = pendingRequests.get(replyTo);
  if (!pending) return;

  pendingRequests.delete(replyTo);
  clearTimeout(pending.timeout);

  if (type === "error") {
    pending.reject(new Error((payload as ErrorPayload).message));
    return;
  }

  pending.resolve(payload);
}

function dispatchUnsolicitedMessage(
  type: string,
  payload: unknown,
  context: GatewayClientMessageDispatchContext,
): void {
  switch (type) {
    case "auth_challenge":
      context.handleAuthChallenge(payload as AuthChallengePayload);
      break;
    case "auth_result":
      context.handleAuthResult(payload as AuthResultPayload);
      break;
    case "turn_event":
      context.events.emitTurnEvent(
        normalizeTurnEventPayload(payload as TurnEventPayload | Record<string, unknown>),
      );
      break;
    case "turn_stream": {
      const normalized = normalizeTurnStreamPayload(
        payload as TurnStreamPayload | Record<string, unknown>,
      );
      if (normalized) {
        context.events.emitTurnStream(normalized);
      }
      break;
    }
    case "capability.invoke":
      context.events.emitCapabilityInvoke(payload as AdapterCapabilityInvokePayload);
      break;
    case "space_state":
      context.events.emitSpaceState(payload as SpaceStatePayload);
      break;
    case "space.agent_updated":
      context.events.emitSpaceAgentUpdated(payload as SpaceAgentUpdatedEventPayload);
      break;
    case "notification":
      context.events.emitNotification(payload as NotificationPayload);
      break;
    case "error":
      context.events.emitError(payload as ErrorPayload);
      break;
    case "agent_message":
      context.events.emitAgentMessage(payload as AgentMessagePayload);
      break;
    case "agent_poke":
      context.events.emitAgentPoke(payload as AgentPokePayload);
      break;
    case "agent_idle":
      context.events.emitAgentIdle(payload as AgentIdlePayload);
      break;
    case "task_dependency":
      context.events.emitTaskDependency(payload as TaskDependencyPayload);
      break;
    case "task_dependency_resolved":
      context.events.emitTaskDependencyResolved(payload as TaskDependencyResolvedPayload);
      break;
    case "orchestrator.event":
      context.events.emitOrchestratorEvent(payload as OrchestratorEventPayload);
      break;
    case "speech.event":
      context.events.emitSpeechEvent(payload as SpeechEventPayload);
      break;
    case "pong":
      break;
    default:
      context.warnUnknownMessage?.(type);
  }
}
