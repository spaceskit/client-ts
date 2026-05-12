import { signChallenge, type AuthKeyPair } from "./gateway-auth.js";
import type { GatewayClientEventBus } from "./gateway-client-events.js";
import type {
  AuthenticatePayload,
  AuthChallengePayload,
  AuthResultPayload,
  ErrorPayload,
} from "./gateway-protocol.js";

export interface GatewayClientAuthChallengeContext {
  authKeyPair: AuthKeyPair | null;
  clientType: string;
  clientVersion: string;
  deviceId?: string;
  devicePublicKey?: string;
  deviceProofSignature?: string;
  events: GatewayClientEventBus;
  isConnected: () => boolean;
  send: (payload: AuthenticatePayload) => Promise<unknown>;
}

export function handleGatewayClientAuthChallenge(
  payload: AuthChallengePayload,
  context: GatewayClientAuthChallengeContext,
): void {
  const keyPair = context.authKeyPair;
  if (payload.challenge && keyPair) {
    signChallenge(payload.challenge, keyPair.privateKey)
      .then((signature) => {
        const effectiveDeviceProofSignature = context.deviceProofSignature
          ?? (
            context.deviceId
            && context.devicePublicKey
            && context.devicePublicKey === keyPair.publicKeyBase64
              ? signature
              : undefined
          );

        // Connection may close while challenge signing is in-flight.
        // Skip authenticate send in that case to avoid unhandled rejections.
        if (!context.isConnected()) return;
        return context.send({
          publicKey: keyPair.publicKeyBase64,
          signature,
          clientType: context.clientType,
          clientVersion: context.clientVersion,
          deviceId: context.deviceId,
          devicePublicKey: context.devicePublicKey,
          deviceProofSignature: effectiveDeviceProofSignature,
        });
      })
      .catch((err: unknown) => {
        emitAuthError(context.events, {
          code: "AUTH_SIGN_FAILED",
          message: `Failed to sign auth challenge: ${err}`,
        });
      });
    return;
  }

  if (!payload.success) {
    emitAuthError(context.events, {
      code: "AUTH_CHALLENGE",
      message: payload.reason || "Authentication challenge failed",
    });
  }
}

export function handleGatewayClientAuthResult(
  payload: AuthResultPayload,
  events: GatewayClientEventBus,
): void {
  if (!payload.success) {
    emitAuthError(events, {
      code: "AUTH_FAILED",
      message: payload.reason || "Authentication failed",
    });
  }
}

function emitAuthError(
  events: GatewayClientEventBus,
  error: ErrorPayload,
): void {
  events.emitError(error);
}
