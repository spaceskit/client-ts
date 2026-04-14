import { describe, expect, test } from "bun:test";
import { generateAuthKeyPair, signChallenge } from "../src/gateway-auth.js";

describe("gateway-auth", () => {
  test("generates a usable Ed25519 key pair", async () => {
    const keyPair = await generateAuthKeyPair();

    expect(keyPair.publicKeyBase64.length).toBeGreaterThan(40);

    const rawPublicKey = Uint8Array.from(
      atob(keyPair.publicKeyBase64),
      (value) => value.charCodeAt(0),
    );
    expect(rawPublicKey.byteLength).toBe(32);
  });

  test("signs challenges that verify against the generated public key", async () => {
    const keyPair = await generateAuthKeyPair();
    const challengeText = "spaceskit-auth-challenge";
    const challengeBase64 = btoa(challengeText);

    const signatureBase64 = await signChallenge(challengeBase64, keyPair.privateKey);
    const verified = await crypto.subtle.verify(
      { name: "Ed25519" } as any,
      keyPair.publicKey,
      Uint8Array.from(atob(signatureBase64), (value) => value.charCodeAt(0)),
      Uint8Array.from(atob(challengeBase64), (value) => value.charCodeAt(0)),
    );

    expect(verified).toBe(true);
  });
});
