import * as BootstrapApi from "./gateway-client-bootstrap-api.js";
import type {
  ConnectAndBootstrapResult,
  GatewayClientMainSpaceBootstrapContext,
  MainSpaceBootstrapOptions,
  MainSpaceBootstrapResult,
} from "./gateway-client-bootstrap-api.js";
import * as CoreApi from "./gateway-client-core-api.js";
import type {
  CapabilityResult,
  TurnResult,
} from "./gateway-client-core-api.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import type {
  ApprovalGrantPayload,
  ExecuteTurnOptions,
} from "./gateway-protocol.js";

export interface GatewayClientCoreBootstrapApi {
  /**
   * Execute a turn in a space.
   */
  executeTurn(options: ExecuteTurnOptions): Promise<TurnResult>;
  executeTurn(
    spaceUid: string,
    input: string,
    targetAgentId?: string,
  ): Promise<TurnResult>;

  /**
   * Ensure a main space exists and optionally subscribe to it.
   */
  ensureMainSpace(
    options?: MainSpaceBootstrapOptions,
  ): Promise<MainSpaceBootstrapResult>;

  /**
   * Connect (if needed), then ensure/subscribe main space.
   */
  connectAndBootstrapMainSpace(
    options?: MainSpaceBootstrapOptions,
  ): Promise<ConnectAndBootstrapResult>;

  /**
   * Resume a turn with feedback.
   */
  resumeFeedback(
    spaceUid: string,
    turnId: string,
    response: "approve" | "reject" | "revise" | "defer",
    revision?: string,
    approvalGrant?: ApprovalGrantPayload,
  ): Promise<void>;

  /**
   * Subscribe to space events.
   */
  subscribe(spaceUids: string[]): Promise<void>;

  /**
   * Invoke a capability.
   */
  invokeCapability(
    capability: string,
    method: string,
    params: Record<string, unknown>,
    targetProvider?: string,
  ): Promise<CapabilityResult>;
}

interface GatewayClientCoreBootstrapContext
  extends GatewayClientMainSpaceBootstrapContext {
  readonly endpointRequests: GatewayClientRequestInvoker;
  readonly isConnected: boolean;
  connect(): Promise<void>;
  ensureMainSpace(
    options?: MainSpaceBootstrapOptions,
  ): Promise<MainSpaceBootstrapResult>;
}

async function executeTurn(
  this: GatewayClientCoreBootstrapContext,
  options: ExecuteTurnOptions,
): Promise<TurnResult>;
async function executeTurn(
  this: GatewayClientCoreBootstrapContext,
  spaceUid: string,
  input: string,
  targetAgentId?: string,
): Promise<TurnResult>;
async function executeTurn(
  this: GatewayClientCoreBootstrapContext,
  optionsOrSpaceUid: ExecuteTurnOptions | string,
  input?: string,
  targetAgentId?: string,
): Promise<TurnResult> {
  return CoreApi.executeTurn(
    this.endpointRequests,
    optionsOrSpaceUid,
    input,
    targetAgentId,
  );
}

async function ensureMainSpace(
  this: GatewayClientCoreBootstrapContext,
  options: MainSpaceBootstrapOptions = {},
): Promise<MainSpaceBootstrapResult> {
  return BootstrapApi.ensureMainSpace({
    listSpaces: (payload) => this.listSpaces(payload),
    createSpace: (payload) => this.createSpace(payload),
    subscribe: (spaceUids) => this.subscribe(spaceUids),
  }, options);
}

async function connectAndBootstrapMainSpace(
  this: GatewayClientCoreBootstrapContext,
  options: MainSpaceBootstrapOptions = {},
): Promise<ConnectAndBootstrapResult> {
  return BootstrapApi.connectAndBootstrapMainSpace({
    isConnected: () => this.isConnected,
    connect: () => this.connect(),
    ensureMainSpace: (bootstrapOptions) => this.ensureMainSpace(bootstrapOptions),
  }, options);
}

async function resumeFeedback(
  this: GatewayClientCoreBootstrapContext,
  spaceUid: string,
  turnId: string,
  response: "approve" | "reject" | "revise" | "defer",
  revision?: string,
  approvalGrant?: ApprovalGrantPayload,
): Promise<void> {
  return CoreApi.resumeFeedback(
    this.endpointRequests,
    spaceUid,
    turnId,
    response,
    revision,
    approvalGrant,
  );
}

async function subscribe(
  this: GatewayClientCoreBootstrapContext,
  spaceUids: string[],
): Promise<void> {
  return CoreApi.subscribe(
    this.endpointRequests,
    spaceUids,
  );
}

async function invokeCapability(
  this: GatewayClientCoreBootstrapContext,
  capability: string,
  method: string,
  params: Record<string, unknown>,
  targetProvider?: string,
): Promise<CapabilityResult> {
  return CoreApi.invokeCapability(
    this.endpointRequests,
    capability,
    method,
    params,
    targetProvider,
  );
}

const coreBootstrapApiDescriptors: PropertyDescriptorMap = {
  executeTurn: { value: executeTurn, writable: true, configurable: true },
  ensureMainSpace: {
    value: ensureMainSpace,
    writable: true,
    configurable: true,
  },
  connectAndBootstrapMainSpace: {
    value: connectAndBootstrapMainSpace,
    writable: true,
    configurable: true,
  },
  resumeFeedback: {
    value: resumeFeedback,
    writable: true,
    configurable: true,
  },
  subscribe: { value: subscribe, writable: true, configurable: true },
  invokeCapability: {
    value: invokeCapability,
    writable: true,
    configurable: true,
  },
};

export function installGatewayClientCoreBootstrapApi(prototype: object): void {
  Object.defineProperties(prototype, coreBootstrapApiDescriptors);
}
