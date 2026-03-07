import { createHash } from "node:crypto";

import {
  GatewayClient,
  generateAuthKeyPair,
  type ErrorPayload,
} from "../src/index.js";

const gatewayUrl = Bun.env.SPACESKIT_MAIN_GATEWAY_WS_URL ?? Bun.env.GATEWAY_URL ?? "ws://127.0.0.1:9320";
const prompt = Bun.env.SPACESKIT_RUNTIME_SMOKE_PROMPT ?? "Core runtime smoke: return an immediate ack.";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function retry<T>(
  label: string,
  fn: () => Promise<T>,
  attempts = 15,
  delayMs = 200,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw new Error(`${label} failed after ${attempts} attempts: ${String(lastError)}`);
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main(): Promise<void> {
  const protocolErrors: ErrorPayload[] = [];
  const keyPair = await generateAuthKeyPair();
  const strictDeviceAuth = true;
  const strictDeviceId = `runtime-smoke-${createHash("sha256").update(keyPair.publicKeyBase64).digest("hex").slice(0, 24)}`;

  const client = new GatewayClient({
    url: gatewayUrl,
    clientType: "runtime-smoke",
    clientVersion: "1.0.0",
    deviceId: strictDeviceId,
    devicePublicKey: keyPair.publicKeyBase64,
    reconnect: false,
    requestTimeoutMs: 10_000,
  });

  client.setAuthKeyPair(keyPair);
  client.onError((error) => {
    protocolErrors.push(error);
  });

  try {
    await client.connect();

    await retry("ping", () => client.ping(), 10, 150);

    const bootstrap = await retry(
      "connectAndBootstrapMainSpace",
      () => client.connectAndBootstrapMainSpace({
        subscribe: false,
      }),
      20,
      150,
    );

    assert(bootstrap.space.id.length > 0, "Main space bootstrap returned an empty space id");

    const ack = await retry(
      "executeTurn",
      () => client.executeTurn(bootstrap.space.id, prompt),
      10,
      200,
    );

    const ackRecord = ack as unknown as Record<string, unknown>;
    assert(
      typeof ackRecord.turnId === "string" && ackRecord.turnId.length > 0,
      "executeTurn did not return an ack containing turnId",
    );

    if (protocolErrors.length > 0) {
      throw new Error(`Received protocol error payload(s): ${JSON.stringify(protocolErrors, null, 2)}`);
    }

    await client.disconnect();
    assert(client.isConnected === false, "Client is still connected after disconnect()");

    console.log(JSON.stringify({
      ok: true,
      gatewayUrl,
      strictDeviceAuth,
      spaceId: bootstrap.space.id,
      turnId: ackRecord.turnId,
    }, null, 2));
  } finally {
    if (client.isConnected) {
      await client.disconnect();
    }
  }
}

main().catch((error) => {
  console.error("TypeScript runtime smoke failed:", error);
  process.exit(1);
});
