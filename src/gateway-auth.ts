/**
 * An Ed25519 key pair for gateway authentication.
 * Generate with `generateAuthKeyPair()`, or provide your own CryptoKeyPair.
 */
export interface AuthKeyPair {
  /** Ed25519 private key (CryptoKey) */
  privateKey: CryptoKey;
  /** Ed25519 public key (CryptoKey) */
  publicKey: CryptoKey;
  /** Base64-encoded raw public key bytes (for sending to server) */
  publicKeyBase64: string;
}

/**
 * Generate a new Ed25519 key pair for gateway authentication.
 * Uses Web Crypto API — works in Bun, Node 20+, and browsers.
 */
export async function generateAuthKeyPair(): Promise<AuthKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "Ed25519" } as any,
    true,
    ["sign", "verify"],
  );

  const rawPub = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(rawPub)),
  );

  return {
    privateKey: keyPair.privateKey,
    publicKey: keyPair.publicKey,
    publicKeyBase64,
  };
}

/**
 * Sign a base64-encoded challenge with an Ed25519 private key.
 * Returns the signature as a base64 string.
 */
export async function signChallenge(
  challengeBase64: string,
  privateKey: CryptoKey,
): Promise<string> {
  const challengeBytes = Uint8Array.from(
    atob(challengeBase64),
    (c) => c.charCodeAt(0),
  );

  const signature = await crypto.subtle.sign(
    { name: "Ed25519" } as any,
    privateKey,
    challengeBytes,
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
