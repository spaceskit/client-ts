/**
 * Spaceskit Client SDK
 *
 * Self-contained WebSocket client for connecting to Spaceskit.
 * No cross-package dependencies — safe to extract into its own package.
 *
 * Features:
 * - Full WebSocket protocol support (all message types)
 * - Ed25519 challenge-response authentication via Web Crypto API
 * - Auto-reconnect with exponential backoff
 * - Request-response correlation with configurable timeout
 * - Event subscriptions with unsubscribe handlers
 *
 * Contract note:
 * `proto/` is the canonical cross-process contract source of truth.
 * This handwritten WebSocket transport stays aligned to that contract.
 */

export { generateAuthKeyPair, signChallenge } from "./gateway-auth.js";
export type { AuthKeyPair } from "./gateway-auth.js";
import type { AuthKeyPair } from "./gateway-auth.js";
export type {
  ConnectAndBootstrapResult,
  MainSpaceBootstrapOptions,
  MainSpaceBootstrapResult,
} from "./gateway-client-bootstrap-api.js";
export type {
  CapabilityResult,
  TurnResult,
} from "./gateway-client-core-api.js";
import {
  installGatewayClientCoreBootstrapApi,
  type GatewayClientCoreBootstrapApi,
} from "./gateway-client-core-bootstrap-api.js";
import {
  GatewayClientEventBus,
} from "./gateway-client-events.js";
import {
  installGatewayClientEventApi,
  type GatewayClientEventApi,
} from "./gateway-client-event-api.js";
import {
  installGatewayClientGatewayAdminFacadeApi,
  type GatewayClientGatewayAdminFacadeApi,
} from "./gateway-client-gateway-admin-facade-api.js";
import {
  installGatewayClientSpaceAdminFacadeApi,
  type GatewayClientSpaceAdminFacadeApi,
} from "./gateway-client-space-admin-facade-api.js";
import type { GatewayClientAdapterApiContext } from "./gateway-client-adapter-api.js";
import {
  installGatewayClientEndpointFacadeApi,
  type GatewayClientEndpointFacadeApi,
} from "./gateway-client-endpoint-facade-api.js";
import {
  normalizeTurnEventPayload as normalizeGatewayTurnEventPayload,
  normalizeTurnStreamPayload as normalizeGatewayTurnStreamPayload,
} from "./gateway-client-normalizers.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import {
  GatewayClientTransport,
  type GatewayClientOptions,
} from "./gateway-client-transport.js";
export type { GatewayClientOptions } from "./gateway-client-transport.js";
export type {
  AgentIdleHandler,
  AgentMessageHandler,
  AgentPokeHandler,
  CapabilityInvokeHandler,
  ErrorHandler,
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

// ---------------------------------------------------------------------------

export type * from "./gateway-protocol.js";
import type {
  TurnEventPayload,
  TurnStreamPayload,
} from "./gateway-protocol.js";

/**
 * Spaceskit WebSocket client SDK
 */
export interface GatewayClient
  extends GatewayClientCoreBootstrapApi,
    GatewayClientEventApi,
    GatewayClientGatewayAdminFacadeApi,
    GatewayClientSpaceAdminFacadeApi,
    GatewayClientEndpointFacadeApi {}

export class GatewayClient {
  private events = new GatewayClientEventBus();
  private readonly transport: GatewayClientTransport;
  private readonly endpointRequests: GatewayClientRequestInvoker;
  private readonly adapterApi: GatewayClientAdapterApiContext;

  constructor(options: GatewayClientOptions) {
    this.transport = new GatewayClientTransport(options, this.events);
    this.endpointRequests = this.transport.requests;
    this.adapterApi = {
      requests: this.endpointRequests,
      send: <T>(type: string, payload: T) => this.transport.send<T>(type, payload),
    };
  }

  /**
   * Connect to the Spaceskit
   */
  async connect(): Promise<void> {
    return this.transport.connect();
  }

  /**
   * Disconnect from the Spaceskit
   */
  async disconnect(): Promise<void> {
    return this.transport.disconnect();
  }

  /**
   * Check if client is connected
   */
  get isConnected(): boolean {
    return this.transport.isConnected;
  }

  /**
   * Set the authentication key pair for challenge-response auth.
   * Must be called before `connect()` if the gateway requires authentication.
   * Generate a key pair with `generateAuthKeyPair()`.
   */
  setAuthKeyPair(keyPair: AuthKeyPair): void {
    this.transport.setAuthKeyPair(keyPair);
  }

  private normalizeTurnEventPayload(
    payload: TurnEventPayload | Record<string, unknown>,
  ): TurnEventPayload {
    return normalizeGatewayTurnEventPayload(payload);
  }

  private normalizeTurnStreamPayload(
    payload: TurnStreamPayload | Record<string, unknown>,
  ): TurnStreamPayload | null {
    return normalizeGatewayTurnStreamPayload(payload);
  }

  private minimumRequestTimeout(minimumMs: number): number {
    return this.transport.minimumRequestTimeout(minimumMs);
  }
}

installGatewayClientGatewayAdminFacadeApi(GatewayClient.prototype);
installGatewayClientSpaceAdminFacadeApi(GatewayClient.prototype);
installGatewayClientCoreBootstrapApi(GatewayClient.prototype);
installGatewayClientEventApi(GatewayClient.prototype);
installGatewayClientEndpointFacadeApi(GatewayClient.prototype);

export default GatewayClient;
