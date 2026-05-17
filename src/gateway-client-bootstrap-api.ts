import type {
  SpaceCreateInitialAgentPayload,
  SpaceCreatePayload,
  SpaceListPayload,
  SpaceSummary,
} from "./gateway-protocol.js";

/**
 * Options for ensuring a "main" space exists for app bootstrap.
 */
export interface MainSpaceBootstrapOptions {
  apiVersion?: string;
  spaceId?: string;
  resourceId?: string;
  name?: string;
  goal?: string;
  createIfMissing?: boolean;
  subscribe?: boolean;
  initialAgents?: SpaceCreateInitialAgentPayload[];
}

/**
 * Result returned by main-space bootstrap helpers.
 */
export interface MainSpaceBootstrapResult {
  space: SpaceSummary;
  created: boolean;
  subscribed: boolean;
}

/**
 * Result returned by connect + bootstrap helper.
 */
export interface ConnectAndBootstrapResult extends MainSpaceBootstrapResult {
  connected: boolean;
}

export interface GatewayClientMainSpaceBootstrapContext {
  listSpaces(payload: SpaceListPayload): Promise<SpaceSummary[]>;
  createSpace(payload: SpaceCreatePayload): Promise<SpaceSummary>;
  subscribe(spaceUids: string[]): Promise<void>;
}

export interface GatewayClientConnectBootstrapContext {
  isConnected(): boolean;
  connect(): Promise<void>;
  ensureMainSpace(
    options: MainSpaceBootstrapOptions,
  ): Promise<MainSpaceBootstrapResult>;
}

export async function ensureMainSpace(
  context: GatewayClientMainSpaceBootstrapContext,
  options: MainSpaceBootstrapOptions = {},
): Promise<MainSpaceBootstrapResult> {
  const spaceId = options.spaceId ?? 'main-space';
  const resourceId = options.resourceId ?? 'resource:main';
  const name = options.name ?? 'Main Space';
  const goal = options.goal ?? 'Default shared space for gateway startup and orchestrator coordination.';
  const createIfMissing = options.createIfMissing ?? true;
  const shouldSubscribe = options.subscribe ?? true;

  const spaces = await context.listSpaces({
    apiVersion: options.apiVersion,
    resourceId,
    limit: 200,
  });

  let space = spaces.find((candidate) => candidate.id === spaceId) ?? null;
  let created = false;

  if (!space && createIfMissing) {
    space = await context.createSpace({
      apiVersion: options.apiVersion,
      spaceId,
      resourceId,
      name,
      goal,
      visibility: 'shared',
      initialAgents: options.initialAgents,
    });
    created = true;
  }

  if (!space) {
    throw new Error(`Main space not found: ${spaceId}`);
  }

  let subscribed = false;
  if (shouldSubscribe) {
    await context.subscribe([space.spaceUid]);
    subscribed = true;
  }

  return {
    space,
    created,
    subscribed,
  };
}

export async function connectAndBootstrapMainSpace(
  context: GatewayClientConnectBootstrapContext,
  options: MainSpaceBootstrapOptions = {},
): Promise<ConnectAndBootstrapResult> {
  let connected = false;
  if (!context.isConnected()) {
    await context.connect();
    connected = true;
  }

  const result = await context.ensureMainSpace(options);
  return {
    connected,
    ...result,
  };
}
