import * as AdapterApi from "./gateway-client-adapter-api.js";
import type { GatewayClientAdapterApiContext } from "./gateway-client-adapter-api.js";
import * as IdentityTemplateApi from "./gateway-client-identity-template-api.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";
import * as SchedulerApi from "./gateway-client-scheduler-api.js";
import * as SharingSyncSpeechApi from "./gateway-client-sharing-sync-speech-api.js";
import * as SpaceContentApi from "./gateway-client-space-content-api.js";
import * as WorkbenchApi from "./gateway-client-workbench-api.js";

type RequestBoundApi<TModule> = {
  [K in keyof TModule as TModule[K] extends (
    requests: GatewayClientRequestInvoker,
    ...args: infer Args
  ) => infer Result
    ? K
    : never]: TModule[K] extends (
    requests: GatewayClientRequestInvoker,
    ...args: infer Args
  ) => infer Result
    ? (...args: Args) => Result
    : never;
};

type AdapterBoundApi<TModule> = {
  [K in keyof TModule as TModule[K] extends (
    context: GatewayClientAdapterApiContext,
    ...args: infer Args
  ) => infer Result
    ? K
    : never]: TModule[K] extends (
    context: GatewayClientAdapterApiContext,
    ...args: infer Args
  ) => infer Result
    ? (...args: Args) => Result
    : never;
};

export type GatewayClientEndpointFacadeApi =
  & RequestBoundApi<typeof SpaceContentApi>
  & RequestBoundApi<typeof IdentityTemplateApi>
  & RequestBoundApi<typeof SchedulerApi>
  & RequestBoundApi<typeof WorkbenchApi>
  & RequestBoundApi<typeof SharingSyncSpeechApi>
  & AdapterBoundApi<typeof AdapterApi>;

interface GatewayClientRequestFacadeContext {
  readonly endpointRequests: GatewayClientRequestInvoker;
}

interface GatewayClientAdapterFacadeContext {
  readonly adapterApi: GatewayClientAdapterApiContext;
}

type RequestApiFunction = (
  requests: GatewayClientRequestInvoker,
  ...args: unknown[]
) => unknown;

type AdapterApiFunction = (
  context: GatewayClientAdapterApiContext,
  ...args: unknown[]
) => unknown;

function createRequestApiDescriptors(api: object): PropertyDescriptorMap {
  return createApiDescriptors(api, (name, value) => {
    const apiMethod = value as unknown as RequestApiFunction;
    const facadeMethod = async function requestFacadeMethod(
      this: GatewayClientRequestFacadeContext,
      ...args: unknown[]
    ): Promise<unknown> {
      return apiMethod(this.endpointRequests, ...args);
    };
    setFacadeMethodMetadata(facadeMethod, name, apiMethod.length - 1);
    return facadeMethod;
  });
}

function createAdapterApiDescriptors(api: object): PropertyDescriptorMap {
  return createApiDescriptors(api, (name, value) => {
    const apiMethod = value as unknown as AdapterApiFunction;
    const facadeMethod = async function adapterFacadeMethod(
      this: GatewayClientAdapterFacadeContext,
      ...args: unknown[]
    ): Promise<unknown> {
      return apiMethod(this.adapterApi, ...args);
    };
    setFacadeMethodMetadata(facadeMethod, name, apiMethod.length - 1);
    return facadeMethod;
  });
}

function createApiDescriptors(
  api: object,
  bind: (name: string, value: unknown) => (...args: unknown[]) => Promise<unknown>,
): PropertyDescriptorMap {
  const descriptors: PropertyDescriptorMap = {};
  for (const [name, value] of Object.entries(api)) {
    if (typeof value !== "function") continue;
    descriptors[name] = {
      value: bind(name, value),
      writable: true,
      configurable: true,
    };
  }
  return descriptors;
}

function setFacadeMethodMetadata(
  method: (...args: unknown[]) => Promise<unknown>,
  name: string,
  length: number,
): void {
  Object.defineProperties(method, {
    name: { value: name, configurable: true },
    length: { value: Math.max(length, 0), configurable: true },
  });
}

const endpointFacadeApiDescriptors: PropertyDescriptorMap = {
  ...createRequestApiDescriptors(SpaceContentApi),
  ...createRequestApiDescriptors(IdentityTemplateApi),
  ...createRequestApiDescriptors(SchedulerApi),
  ...createRequestApiDescriptors(WorkbenchApi),
  ...createRequestApiDescriptors(SharingSyncSpeechApi),
  ...createAdapterApiDescriptors(AdapterApi),
};

export function installGatewayClientEndpointFacadeApi(prototype: object): void {
  Object.defineProperties(prototype, endpointFacadeApiDescriptors);
}
