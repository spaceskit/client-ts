import { describe, expect, test } from "bun:test";
import { GatewayClient } from "../src/gateway-client.ts";

describe("GatewayClient turn stream normalization", () => {
  test("preserves transcript visibility and stream kind", () => {
    const client = new GatewayClient({
      url: "ws://127.0.0.1:9320",
      reconnect: false,
    });

    const normalized = (client as any).normalizeTurnStreamPayload({
      spaceId: "space-1",
      spaceUid: "space-uid-1",
      turnId: "turn-1",
      rootTurnId: "root-turn-1",
      agentId: "agent-1",
      conversationTopology: "shared_team_chat",
      transcriptVisibility: "activity_only",
      streamKind: "provider_client",
      delta: "Checking...",
      seq: 1,
      done: false,
    });

    expect(normalized).toEqual({
      spaceId: "space-1",
      spaceUid: "space-uid-1",
      turnId: "turn-1",
      rootTurnId: "root-turn-1",
      agentId: "agent-1",
      conversationTopology: "shared_team_chat",
      transcriptVisibility: "activity_only",
      streamKind: "provider_client",
      delta: "Checking...",
      seq: 1,
      done: false,
    });
  });
});
