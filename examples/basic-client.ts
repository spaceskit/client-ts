import { GatewayClient, generateAuthKeyPair } from "../src/index.js";

const runtimeProcess = (globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
    stdout?: { write: (value: string) => void };
    exit?: (code?: number) => void;
  };
}).process;
const env = runtimeProcess?.env ?? {};
const gatewayUrl = env.GATEWAY_URL ?? "ws://127.0.0.1:9320";
const spaceId = env.SPACE_ID;
const prompt = env.PROMPT ?? "Hello from the TypeScript example client.";

async function main(): Promise<void> {
  const keyPair = await generateAuthKeyPair();
  const client = new GatewayClient({
    url: gatewayUrl,
    clientType: "sdk-example",
    clientVersion: "1.0.0",
  });

  client.setAuthKeyPair(keyPair);

  client.onError((error) => {
    console.error(`[gateway:error] ${error.code}: ${error.message}`);
  });

  client.onTurnStream((stream) => {
    runtimeProcess?.stdout?.write(stream.delta);
    if (stream.done) {
      runtimeProcess?.stdout?.write("\n");
    }
  });

  await client.connect();
  console.log(`Connected to ${gatewayUrl}`);

  await client.ping();
  console.log("Ping successful");

  if (spaceId) {
    console.log(`Executing turn in space "${spaceId}"...`);
    await client.executeTurn(spaceId, prompt);
  } else {
    console.log("SPACE_ID not set; skipping execute_turn example.");
  }

  await client.disconnect();
  console.log("Disconnected");
}

main().catch((error) => {
  console.error("Example client failed:", error);
  runtimeProcess?.exit?.(1);
});
