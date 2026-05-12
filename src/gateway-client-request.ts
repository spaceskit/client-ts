export interface GatewayClientPendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
}

export interface GatewayClientRequestInvoker {
  request<T, R>(
    type: string,
    payload: T,
    timeoutMs?: number,
  ): Promise<R>;
  requestField<T, R extends object, K extends keyof R>(
    type: string,
    payload: T,
    key: K,
    timeoutMs?: number,
  ): Promise<R[K]>;
}
