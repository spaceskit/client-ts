import {
  GatewayAdapterClient,
  generateAuthKeyPair,
  type AdapterProviderRegistration,
} from "../src/index.js";

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
    on?: (event: string, handler: () => void) => void;
    exit?: (code?: number) => void;
  };
}).process;
const env = runtimeProcess?.env ?? {};
const gatewayUrl = env.GATEWAY_URL ?? "ws://127.0.0.1:9320";

async function main(): Promise<void> {
  const keyPair = await generateAuthKeyPair();
  const adapter = new GatewayAdapterClient({
    url: gatewayUrl,
    authKeyPair: keyPair,
    clientVersion: "1.0.0",
  });

  adapter.client.onError((error) => {
    console.error(`[adapter:error] ${error.code}: ${error.message}`);
  });

  const registration: AdapterProviderRegistration = {
    provider: {
      id: "example.echo.adapter",
      name: "Example Echo Adapter",
      source: "adapter",
      capabilityType: "example",
      operations: ["echo"],
    },
    handlers: {
      echo: async (args: Record<string, unknown>) => {
        console.log("Received capability invocation:", args);
        return {
          ok: true,
          echoed: args,
          handledAt: new Date().toISOString(),
        };
      },
    },
  };

  await adapter.registerProvider(registration);
  await adapter.connect();

  console.log(`Adapter connected to ${gatewayUrl}`);
  console.log(
    `Registered provider "${registration.provider.id}" (${registration.provider.capabilityType}.echo)`,
  );
  console.log("Waiting for capability.invoke messages. Press Ctrl+C to stop.");

  let shuttingDown = false;
  const shutdown = async (): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log("\nShutting down adapter...");
    await adapter.disconnect();
    runtimeProcess?.exit?.(0);
  };

  runtimeProcess?.on?.("SIGINT", () => {
    void shutdown();
  });
  runtimeProcess?.on?.("SIGTERM", () => {
    void shutdown();
  });

  // Keep process alive while the adapter handles capability invocations.
  await new Promise<void>(() => {});
}

main().catch((error) => {
  console.error("Adapter example failed:", error);
  runtimeProcess?.exit?.(1);
});
