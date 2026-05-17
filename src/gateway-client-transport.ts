import type { AuthKeyPair } from "./gateway-auth.js";
import {
  handleGatewayClientAuthChallenge,
  handleGatewayClientAuthResult,
} from "./gateway-client-authentication.js";
import type { GatewayClientEventBus } from "./gateway-client-events.js";
import {
  dispatchGatewayClientMessage,
} from "./gateway-client-message-dispatch.js";
import type {
  GatewayClientPendingRequest,
  GatewayClientRequestInvoker,
} from "./gateway-client-request.js";
import type { GatewayMessage } from "./gateway-protocol.js";

/**
 * GatewayClient configuration options
 */
export interface GatewayClientOptions {
  url: string;
  clientType?: string;
  clientVersion?: string;
  deviceId?: string;
  devicePublicKey?: string;
  deviceProofSignature?: string;
  reconnect?: boolean;
  reconnectIntervalMs?: number;
  maxReconnectAttempts?: number;
  maxReconnectDelayMs?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  requestTimeoutMs?: number;
}

export class GatewayClientTransport {
  private url: string;
  private clientType: string;
  private clientVersion: string;
  private deviceId?: string;
  private devicePublicKey?: string;
  private deviceProofSignature?: string;
  private reconnect: boolean;
  private reconnectIntervalMs: number;
  private maxReconnectAttempts: number;
  private maxReconnectDelayMs: number;
  private requestTimeoutMs: number;

  private ws: WebSocket | null = null;
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private pendingRequests: Map<string, GatewayClientPendingRequest> = new Map();
  private authKeyPair: AuthKeyPair | null = null;

  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  readonly requests: GatewayClientRequestInvoker = {
    request: <T, R>(type: string, payload: T, timeoutMs?: number) => (
      this.request<T, R>(type, payload, timeoutMs)
    ),
    requestField: <T, R extends object, K extends keyof R>(
      type: string,
      payload: T,
      key: K,
      timeoutMs?: number,
    ) => this.requestField<T, R, K>(type, payload, key, timeoutMs),
  };

  constructor(
    options: GatewayClientOptions,
    private readonly events: GatewayClientEventBus,
  ) {
    this.url = options.url;
    this.clientType = options.clientType ?? "sdk";
    this.clientVersion = options.clientVersion ?? "1.0.0";
    this.deviceId = options.deviceId?.trim() || undefined;
    this.devicePublicKey = options.devicePublicKey?.trim() || undefined;
    this.deviceProofSignature = options.deviceProofSignature?.trim() || undefined;
    this.reconnect = options.reconnect ?? true;
    this.reconnectIntervalMs = options.reconnectIntervalMs ?? 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts ?? 10;
    this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? 30000;
    this.requestTimeoutMs = options.requestTimeoutMs ?? 30000;

    this.onOpenCallback = options.onOpen;
    this.onCloseCallback = options.onClose;
    this.onErrorCallback = options.onError;
  }

  /**
   * Connect to the Spaceskit
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.addEventListener("open", () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.onOpenCallback?.();
          resolve();
        });

        this.ws.addEventListener("message", (event: MessageEvent) => {
          this.handleMessage(event.data);
        });

        this.ws.addEventListener("close", () => {
          this.connected = false;
          this.onCloseCallback?.();
          this.attemptReconnect();
        });

        this.ws.addEventListener("error", (_event: Event) => {
          const error = new Error("WebSocket error");
          this.onErrorCallback?.(error);
          this.events.emitError({
            code: "WS_ERROR",
            message: "WebSocket connection error",
            details: error.message,
          });
          reject(error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the Spaceskit
   */
  async disconnect(): Promise<void> {
    this.reconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }

  /**
   * Check if client is connected
   */
  get isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  setAuthKeyPair(keyPair: AuthKeyPair): void {
    this.authKeyPair = keyPair;
  }

  /**
   * Send a message to the gateway
   */
  async send<T>(type: string, payload: T): Promise<string> {
    if (!this.isConnected) {
      throw new Error("WebSocket not connected");
    }

    const messageId = crypto.randomUUID();
    const message: GatewayMessage<T> = {
      type,
      id: messageId,
      ts: new Date().toISOString(),
      payload,
    };

    this.ws!.send(JSON.stringify(message));
    return messageId;
  }

  minimumRequestTimeout(minimumMs: number): number {
    return Math.max(this.requestTimeoutMs, minimumMs);
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error("Max reconnection attempts reached");
      this.onErrorCallback?.(error);
      return;
    }

    this.reconnectAttempts++;
    const exponential =
      this.reconnectIntervalMs * Math.pow(2, this.reconnectAttempts - 1);
    const capped = Math.min(exponential, this.maxReconnectDelayMs);
    const delay = capped * (0.5 + Math.random() * 0.5);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        this.onErrorCallback?.(error);
      });
    }, delay);
  }

  /**
   * Send a message and wait for a response
   */
  private async request<T, R>(
    type: string,
    payload: T,
    timeoutMs: number = this.requestTimeoutMs,
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      this.send(type, payload)
        .then((messageId) => {
          const timeout = setTimeout(() => {
            this.pendingRequests.delete(messageId);
            reject(new Error(`Request timeout: ${type}`));
          }, timeoutMs);

          this.pendingRequests.set(messageId, {
            resolve: resolve as (value: unknown) => void,
            reject,
            timeout,
          });
        })
        .catch(reject);
    });
  }

  private async requestField<T, R extends object, K extends keyof R>(
    type: string,
    payload: T,
    key: K,
    timeoutMs?: number,
  ): Promise<R[K]> {
    const result = await this.request<T, R>(type, payload, timeoutMs);
    return result[key];
  }

  /**
   * Handle incoming messages from the gateway
   */
  private handleMessage(data: string): void {
    dispatchGatewayClientMessage(data, {
      pendingRequests: this.pendingRequests,
      events: this.events,
      handleAuthChallenge: (payload) => handleGatewayClientAuthChallenge(payload, {
        authKeyPair: this.authKeyPair,
        clientType: this.clientType,
        clientVersion: this.clientVersion,
        deviceId: this.deviceId,
        devicePublicKey: this.devicePublicKey,
        deviceProofSignature: this.deviceProofSignature,
        events: this.events,
        isConnected: () => this.isConnected,
        send: (authenticatePayload) => this.send("authenticate", authenticatePayload),
      }),
      handleAuthResult: (payload) => handleGatewayClientAuthResult(payload, this.events),
      onParseError: (error) => {
        this.onErrorCallback?.(error);
      },
      warnUnknownMessage: (type) => {
        console.warn(`Unknown message type: ${type}`);
      },
    });
  }
}
