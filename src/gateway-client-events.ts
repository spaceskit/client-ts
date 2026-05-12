import type {
  AdapterCapabilityInvokePayload,
  AgentIdlePayload,
  AgentMessagePayload,
  AgentPokePayload,
  ErrorPayload,
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

export type TurnEventHandler = (event: TurnEventPayload) => void;
export type TurnStreamHandler = (stream: TurnStreamPayload) => void;
export type SpaceStateHandler = (state: SpaceStatePayload) => void;
export type SpaceAgentUpdatedHandler = (event: SpaceAgentUpdatedEventPayload) => void;
export type NotificationHandler = (notification: NotificationPayload) => void;
export type ErrorHandler = (error: ErrorPayload) => void;
export type CapabilityInvokeHandler = (
  request: AdapterCapabilityInvokePayload,
) => void | Promise<void>;
export type AgentMessageHandler = (payload: AgentMessagePayload) => void;
export type AgentPokeHandler = (payload: AgentPokePayload) => void;
export type AgentIdleHandler = (payload: AgentIdlePayload) => void;
export type TaskDependencyHandler = (payload: TaskDependencyPayload) => void;
export type TaskDependencyResolvedHandler = (payload: TaskDependencyResolvedPayload) => void;
export type OrchestratorEventHandler = (payload: OrchestratorEventPayload) => void;
export type SpeechEventHandler = (payload: SpeechEventPayload) => void;
export type UnsubscribeHandler = () => void;

type GatewayClientHandlerLists = {
  turnEventHandlers: TurnEventHandler;
  turnStreamHandlers: TurnStreamHandler;
  spaceStateHandlers: SpaceStateHandler;
  spaceAgentUpdatedHandlers: SpaceAgentUpdatedHandler;
  notificationHandlers: NotificationHandler;
  errorHandlers: ErrorHandler;
  capabilityInvokeHandlers: CapabilityInvokeHandler;
  agentMessageHandlers: AgentMessageHandler;
  agentPokeHandlers: AgentPokeHandler;
  agentIdleHandlers: AgentIdleHandler;
  taskDependencyHandlers: TaskDependencyHandler;
  taskDependencyResolvedHandlers: TaskDependencyResolvedHandler;
  orchestratorEventHandlers: OrchestratorEventHandler;
  speechEventHandlers: SpeechEventHandler;
};

type GatewayClientHandlerListKey = keyof GatewayClientHandlerLists;
type GatewayClientHandlerStore = {
  [K in GatewayClientHandlerListKey]: GatewayClientHandlerLists[K][];
};

export class GatewayClientEventBus {
  private handlers: GatewayClientHandlerStore = {
    turnEventHandlers: [],
    turnStreamHandlers: [],
    spaceStateHandlers: [],
    spaceAgentUpdatedHandlers: [],
    notificationHandlers: [],
    errorHandlers: [],
    capabilityInvokeHandlers: [],
    agentMessageHandlers: [],
    agentPokeHandlers: [],
    agentIdleHandlers: [],
    taskDependencyHandlers: [],
    taskDependencyResolvedHandlers: [],
    orchestratorEventHandlers: [],
    speechEventHandlers: [],
  };

  subscribe<K extends GatewayClientHandlerListKey>(
    key: K,
    handler: GatewayClientHandlerLists[K],
  ): UnsubscribeHandler {
    this.handlers[key].push(handler);
    return () => {
      this.handlers[key] = this.handlers[key].filter(
        (candidate) => candidate !== handler,
      ) as GatewayClientHandlerStore[K];
    };
  }

  emitTurnEvent(payload: TurnEventPayload): void {
    this.emit("turnEventHandlers", payload);
  }

  emitTurnStream(payload: TurnStreamPayload): void {
    this.emit("turnStreamHandlers", payload);
  }

  emitSpaceState(payload: SpaceStatePayload): void {
    this.emit("spaceStateHandlers", payload);
  }

  emitSpaceAgentUpdated(payload: SpaceAgentUpdatedEventPayload): void {
    this.emit("spaceAgentUpdatedHandlers", payload);
  }

  emitNotification(payload: NotificationPayload): void {
    this.emit("notificationHandlers", payload);
  }

  emitError(payload: ErrorPayload): void {
    this.emit("errorHandlers", payload);
  }

  emitCapabilityInvoke(payload: AdapterCapabilityInvokePayload): void {
    for (const handler of this.handlers.capabilityInvokeHandlers) {
      Promise.resolve(handler(payload)).catch((err: unknown) => {
        this.emitError({
          code: "ADAPTER_INVOKE_HANDLER_FAILED",
          message: err instanceof Error ? err.message : String(err),
        });
      });
    }
  }

  emitAgentMessage(payload: AgentMessagePayload): void {
    this.emit("agentMessageHandlers", payload);
  }

  emitAgentPoke(payload: AgentPokePayload): void {
    this.emit("agentPokeHandlers", payload);
  }

  emitAgentIdle(payload: AgentIdlePayload): void {
    this.emit("agentIdleHandlers", payload);
  }

  emitTaskDependency(payload: TaskDependencyPayload): void {
    this.emit("taskDependencyHandlers", payload);
  }

  emitTaskDependencyResolved(payload: TaskDependencyResolvedPayload): void {
    this.emit("taskDependencyResolvedHandlers", payload);
  }

  emitOrchestratorEvent(payload: OrchestratorEventPayload): void {
    this.emit("orchestratorEventHandlers", payload);
  }

  emitSpeechEvent(payload: SpeechEventPayload): void {
    this.emit("speechEventHandlers", payload);
  }

  private emit<K extends GatewayClientHandlerListKey>(
    key: K,
    payload: Parameters<GatewayClientHandlerLists[K]>[0],
  ): void {
    for (const handler of this.handlers[key]) {
      const typedHandler = handler as (
        value: Parameters<GatewayClientHandlerLists[K]>[0],
      ) => void;
      typedHandler(payload);
    }
  }
}
