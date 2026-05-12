import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import type {
  AdapterCapabilityErrorPayload,
  AdapterCapabilityProvider,
  AdapterCapabilityResultPayload,
  AgentMessagePayload,
  AgentPokePayload,
  CapabilitiesDeregisterPayload,
  CapabilitiesRegisterPayload,
  TaskDependencyPayload,
} from "./gateway-protocol.js";

export interface GatewayClientAdapterApiContext {
  requests: GatewayClientRequestInvoker;
  send<T>(type: string, payload: T): Promise<string>;
}

export async function registerCapabilities(
  context: GatewayClientAdapterApiContext,
  providers: AdapterCapabilityProvider[],
): Promise<void> {
  const payload: CapabilitiesRegisterPayload = { providers };
  await context.requests.request<CapabilitiesRegisterPayload, void>(
    "capabilities.register",
    payload,
  );
}

export async function deregisterCapabilities(
  context: GatewayClientAdapterApiContext,
  providerIds: string[],
): Promise<void> {
  const payload: CapabilitiesDeregisterPayload = { providerIds };
  await context.requests.request<CapabilitiesDeregisterPayload, void>(
    "capabilities.deregister",
    payload,
  );
}

export async function sendCapabilityResult(
  context: GatewayClientAdapterApiContext,
  payload: AdapterCapabilityResultPayload,
): Promise<void> {
  await context.send<AdapterCapabilityResultPayload>("capability.result", payload);
}

export async function sendCapabilityError(
  context: GatewayClientAdapterApiContext,
  payload: AdapterCapabilityErrorPayload,
): Promise<void> {
  await context.send<AdapterCapabilityErrorPayload>("capability.error", payload);
}

export async function sendAgentMessage(
  context: GatewayClientAdapterApiContext,
  spaceId: string,
  fromAgentId: string,
  toAgentId: string,
  content: string,
  spaceUid?: string,
): Promise<void> {
  const payload: AgentMessagePayload = {
    spaceId,
    spaceUid: spaceUid ?? spaceId,
    fromAgentId,
    toAgentId,
    content,
  };
  await context.send<AgentMessagePayload>("agent_message", payload);
}

export async function pokeAgent(
  context: GatewayClientAdapterApiContext,
  spaceId: string,
  targetAgentId: string,
  reason: string,
  unblockedByTurnId?: string,
  spaceUid?: string,
): Promise<void> {
  const payload: AgentPokePayload = {
    spaceId,
    spaceUid: spaceUid ?? spaceId,
    targetAgentId,
    reason,
    unblockedByTurnId,
  };
  await context.send<AgentPokePayload>("agent_poke", payload);
}

export async function declareTaskDependency(
  context: GatewayClientAdapterApiContext,
  spaceId: string,
  blockedTurnId: string,
  dependsOnTurnId: string,
  spaceUid?: string,
): Promise<void> {
  const payload: TaskDependencyPayload = {
    spaceId,
    spaceUid: spaceUid ?? spaceId,
    blockedTurnId,
    dependsOnTurnId,
  };
  await context.send<TaskDependencyPayload>("task_dependency", payload);
}

export async function ping(context: GatewayClientAdapterApiContext): Promise<void> {
  await context.requests.request("ping", {});
}
