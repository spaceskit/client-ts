import type {
  AgentIdleHandler,
  AgentMessageHandler,
  AgentPokeHandler,
  CapabilityInvokeHandler,
  ErrorHandler,
  GatewayClientEventBus,
  NotificationHandler,
  OrchestratorEventHandler,
  SpaceAgentUpdatedHandler,
  SpaceStateHandler,
  SpeechEventHandler,
  TaskDependencyHandler,
  TaskDependencyResolvedHandler,
  TurnEventHandler,
  TurnStreamHandler,
  UnsubscribeHandler,
} from "./gateway-client-events.js";

export interface GatewayClientEventApi {
  /**
   * Subscribe to turn events
   */
  onTurnEvent(handler: TurnEventHandler): UnsubscribeHandler;

  /**
   * Subscribe to turn stream events
   */
  onTurnStream(handler: TurnStreamHandler): UnsubscribeHandler;

  /**
   * Subscribe to space state updates
   */
  onSpaceState(handler: SpaceStateHandler): UnsubscribeHandler;

  /**
   * Subscribe to profile-swap events for space agent assignments.
   */
  onSpaceAgentUpdated(handler: SpaceAgentUpdatedHandler): UnsubscribeHandler;

  /**
   * Subscribe to notifications
   */
  onNotification(handler: NotificationHandler): UnsubscribeHandler;

  /**
   * Subscribe to error events
   */
  onError(handler: ErrorHandler): UnsubscribeHandler;

  /**
   * Subscribe to inter-agent messages
   */
  onAgentMessage(handler: AgentMessageHandler): UnsubscribeHandler;

  /**
   * Subscribe to agent poke events
   */
  onAgentPoke(handler: AgentPokeHandler): UnsubscribeHandler;

  /**
   * Subscribe to agent idle notifications
   */
  onAgentIdle(handler: AgentIdleHandler): UnsubscribeHandler;

  /**
   * Subscribe to task dependency declarations
   */
  onTaskDependency(handler: TaskDependencyHandler): UnsubscribeHandler;

  /**
   * Subscribe to task dependency resolved notifications
   */
  onTaskDependencyResolved(
    handler: TaskDependencyResolvedHandler,
  ): UnsubscribeHandler;

  /**
   * Subscribe to orchestrator command lifecycle events.
   */
  onOrchestratorEvent(handler: OrchestratorEventHandler): UnsubscribeHandler;

  /**
   * Subscribe to speech session events.
   */
  onSpeechEvent(handler: SpeechEventHandler): UnsubscribeHandler;

  /**
   * Subscribe to adapter capability invocation requests.
   */
  onCapabilityInvoke(handler: CapabilityInvokeHandler): UnsubscribeHandler;
}

interface GatewayClientEventApiContext {
  events: GatewayClientEventBus;
}

function onTurnEvent(
  this: GatewayClientEventApiContext,
  handler: TurnEventHandler,
): UnsubscribeHandler {
  return this.events.subscribe("turnEventHandlers", handler);
}

function onTurnStream(
  this: GatewayClientEventApiContext,
  handler: TurnStreamHandler,
): UnsubscribeHandler {
  return this.events.subscribe("turnStreamHandlers", handler);
}

function onSpaceState(
  this: GatewayClientEventApiContext,
  handler: SpaceStateHandler,
): UnsubscribeHandler {
  return this.events.subscribe("spaceStateHandlers", handler);
}

function onSpaceAgentUpdated(
  this: GatewayClientEventApiContext,
  handler: SpaceAgentUpdatedHandler,
): UnsubscribeHandler {
  return this.events.subscribe("spaceAgentUpdatedHandlers", handler);
}

function onNotification(
  this: GatewayClientEventApiContext,
  handler: NotificationHandler,
): UnsubscribeHandler {
  return this.events.subscribe("notificationHandlers", handler);
}

function onError(
  this: GatewayClientEventApiContext,
  handler: ErrorHandler,
): UnsubscribeHandler {
  return this.events.subscribe("errorHandlers", handler);
}

function onAgentMessage(
  this: GatewayClientEventApiContext,
  handler: AgentMessageHandler,
): UnsubscribeHandler {
  return this.events.subscribe("agentMessageHandlers", handler);
}

function onAgentPoke(
  this: GatewayClientEventApiContext,
  handler: AgentPokeHandler,
): UnsubscribeHandler {
  return this.events.subscribe("agentPokeHandlers", handler);
}

function onAgentIdle(
  this: GatewayClientEventApiContext,
  handler: AgentIdleHandler,
): UnsubscribeHandler {
  return this.events.subscribe("agentIdleHandlers", handler);
}

function onTaskDependency(
  this: GatewayClientEventApiContext,
  handler: TaskDependencyHandler,
): UnsubscribeHandler {
  return this.events.subscribe("taskDependencyHandlers", handler);
}

function onTaskDependencyResolved(
  this: GatewayClientEventApiContext,
  handler: TaskDependencyResolvedHandler,
): UnsubscribeHandler {
  return this.events.subscribe("taskDependencyResolvedHandlers", handler);
}

function onOrchestratorEvent(
  this: GatewayClientEventApiContext,
  handler: OrchestratorEventHandler,
): UnsubscribeHandler {
  return this.events.subscribe("orchestratorEventHandlers", handler);
}

function onSpeechEvent(
  this: GatewayClientEventApiContext,
  handler: SpeechEventHandler,
): UnsubscribeHandler {
  return this.events.subscribe("speechEventHandlers", handler);
}

function onCapabilityInvoke(
  this: GatewayClientEventApiContext,
  handler: CapabilityInvokeHandler,
): UnsubscribeHandler {
  return this.events.subscribe("capabilityInvokeHandlers", handler);
}

const eventApiDescriptors: PropertyDescriptorMap = {
  onTurnEvent: { value: onTurnEvent, writable: true, configurable: true },
  onTurnStream: { value: onTurnStream, writable: true, configurable: true },
  onSpaceState: { value: onSpaceState, writable: true, configurable: true },
  onSpaceAgentUpdated: {
    value: onSpaceAgentUpdated,
    writable: true,
    configurable: true,
  },
  onNotification: {
    value: onNotification,
    writable: true,
    configurable: true,
  },
  onError: { value: onError, writable: true, configurable: true },
  onAgentMessage: {
    value: onAgentMessage,
    writable: true,
    configurable: true,
  },
  onAgentPoke: { value: onAgentPoke, writable: true, configurable: true },
  onAgentIdle: { value: onAgentIdle, writable: true, configurable: true },
  onTaskDependency: {
    value: onTaskDependency,
    writable: true,
    configurable: true,
  },
  onTaskDependencyResolved: {
    value: onTaskDependencyResolved,
    writable: true,
    configurable: true,
  },
  onOrchestratorEvent: {
    value: onOrchestratorEvent,
    writable: true,
    configurable: true,
  },
  onSpeechEvent: {
    value: onSpeechEvent,
    writable: true,
    configurable: true,
  },
  onCapabilityInvoke: {
    value: onCapabilityInvoke,
    writable: true,
    configurable: true,
  },
};

export function installGatewayClientEventApi(prototype: object): void {
  Object.defineProperties(prototype, eventApiDescriptors);
}
