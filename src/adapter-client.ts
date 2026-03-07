import {
  GatewayClient,
  type AuthKeyPair,
  type GatewayClientOptions,
  type AdapterCapabilityProvider,
  type AdapterCapabilityInvokePayload,
} from "./gateway-client.js";

export type AdapterOperationHandler = (
  args: Record<string, unknown>,
  request: AdapterCapabilityInvokePayload,
) => unknown | Promise<unknown>;

export interface AdapterProviderRegistration {
  provider: AdapterCapabilityProvider;
  handlers: Record<string, AdapterOperationHandler>;
}

export interface GatewayAdapterClientOptions
  extends Omit<GatewayClientOptions, "clientType"> {
  authKeyPair?: AuthKeyPair;
}

/**
 * Adapter-oriented wrapper around GatewayClient.
 *
 * Responsibilities:
 * - Register/deregister adapter capability providers.
 * - Dispatch incoming `capability.invoke` requests to local handlers.
 * - Send `capability.result` / `capability.error` back to the gateway.
 */
export class GatewayAdapterClient {
  private gatewayClient: GatewayClient;
  private providers = new Map<string, AdapterProviderRegistration>();
  private unsubscribeInvoke?: () => void;

  constructor(options: GatewayAdapterClientOptions) {
    this.gatewayClient = new GatewayClient({
      ...options,
      clientType: "adapter",
    });
    if (options.authKeyPair) {
      this.gatewayClient.setAuthKeyPair(options.authKeyPair);
    }
  }

  setAuthKeyPair(keyPair: AuthKeyPair): void {
    this.gatewayClient.setAuthKeyPair(keyPair);
  }

  get client(): GatewayClient {
    return this.gatewayClient;
  }

  get isConnected(): boolean {
    return this.gatewayClient.isConnected;
  }

  async connect(): Promise<void> {
    await this.gatewayClient.connect();

    this.unsubscribeInvoke?.();
    this.unsubscribeInvoke = this.gatewayClient.onCapabilityInvoke((request) => {
      return this.handleInvocation(request);
    });

    if (this.providers.size > 0) {
      await this.gatewayClient.registerCapabilities(
        Array.from(this.providers.values()).map((entry) => entry.provider),
      );
    }
  }

  async disconnect(): Promise<void> {
    this.unsubscribeInvoke?.();
    this.unsubscribeInvoke = undefined;

    if (this.gatewayClient.isConnected && this.providers.size > 0) {
      await this.gatewayClient.deregisterCapabilities(Array.from(this.providers.keys()));
    }

    await this.gatewayClient.disconnect();
  }

  async registerProvider(registration: AdapterProviderRegistration): Promise<void> {
    this.providers.set(registration.provider.id, registration);
    if (this.gatewayClient.isConnected) {
      await this.gatewayClient.registerCapabilities([registration.provider]);
    }
  }

  async registerProviders(registrations: AdapterProviderRegistration[]): Promise<void> {
    for (const registration of registrations) {
      this.providers.set(registration.provider.id, registration);
    }
    if (this.gatewayClient.isConnected && registrations.length > 0) {
      await this.gatewayClient.registerCapabilities(
        registrations.map((registration) => registration.provider),
      );
    }
  }

  async deregisterProvider(providerId: string): Promise<void> {
    this.providers.delete(providerId);
    if (this.gatewayClient.isConnected) {
      await this.gatewayClient.deregisterCapabilities([providerId]);
    }
  }

  private async handleInvocation(request: AdapterCapabilityInvokePayload): Promise<void> {
    const provider = request.targetProvider
      ? this.providers.get(request.targetProvider)
      : Array.from(this.providers.values()).find(
          (entry) => entry.provider.capabilityType === request.capability,
        );

    if (!provider) {
      await this.gatewayClient.sendCapabilityError({
        invocationId: request.invocationId,
        providerId: request.targetProvider,
        code: "PROVIDER_NOT_FOUND",
        message: `No adapter provider found for invocation (${request.capability}.${request.operation})`,
      });
      return;
    }

    const handler = provider.handlers[request.operation];
    if (!handler) {
      await this.gatewayClient.sendCapabilityError({
        invocationId: request.invocationId,
        providerId: provider.provider.id,
        code: "OPERATION_NOT_SUPPORTED",
        message: `Operation not supported: ${request.operation}`,
      });
      return;
    }

    const startedAt = Date.now();
    try {
      const data = await handler(request.args, request);
      await this.gatewayClient.sendCapabilityResult({
        invocationId: request.invocationId,
        providerId: provider.provider.id,
        data,
        durationMs: Date.now() - startedAt,
      });
    } catch (err) {
      await this.gatewayClient.sendCapabilityError({
        invocationId: request.invocationId,
        providerId: provider.provider.id,
        code: "INVOKE_FAILED",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

