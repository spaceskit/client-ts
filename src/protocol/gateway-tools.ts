/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export type GatewayToolDangerLevel = 'standard' | 'destructive';
export type GatewayToolHealthStatus = 'unknown' | 'ok' | 'degraded';
export type GatewayToolApprovalGrantMode = 'once' | 'time_window' | 'durable';
export type GatewayToolCwdMode = 'space_root' | 'fixed';
export type GatewayToolOutputMode = 'text' | 'json';

export interface GatewayToolExample {
  name: string;
  description?: string;
  arguments: Record<string, unknown>;
  expectedOutput?: string;
}

export interface GatewayTool {
  schemaVersion: number;
  id: string;
  providerId: string;
  displayName: string;
  description: string;
  bundleId?: string;
  bundleDisplayName?: string;
  bundleDescription?: string;
  toolGroupId?: string;
  toolGroupDisplayName?: string;
  executable: string;
  resolvedExecutable: string;
  argsTemplate: string[];
  inputSchema: Record<string, unknown>;
  instructions?: string;
  examples: GatewayToolExample[];
  timeoutMs: number;
  maxOutputBytes: number;
  cwdMode: GatewayToolCwdMode;
  fixedCwd?: string;
  outputMode: GatewayToolOutputMode;
  dangerLevel: GatewayToolDangerLevel;
  available: boolean;
  healthStatus: GatewayToolHealthStatus;
  healthMessage?: string;
  manifestPath: string;
  readmePath?: string;
  readmeContent?: string;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayToolApprovalGrant {
  principalId: string;
  deviceId: string;
  spaceId: string;
  toolId: string;
  mode: GatewayToolApprovalGrantMode;
  source: string;
  reason: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  updatedAt: string;
}

export interface GatewayListToolsPayload {
  apiVersion?: string;
}

export interface GatewayGetToolPayload {
  apiVersion?: string;
  toolId: string;
}

export interface GatewayScaffoldToolPayload {
  apiVersion?: string;
  id: string;
  displayName: string;
  description: string;
  outputMode: GatewayToolOutputMode;
}

export interface GatewayRegisterToolPayload {
  apiVersion?: string;
  schemaVersion?: number;
  id: string;
  displayName: string;
  description: string;
  bundleId?: string;
  bundleDisplayName?: string;
  bundleDescription?: string;
  toolGroupId?: string;
  toolGroupDisplayName?: string;
  executable: string;
  argsTemplate: string[];
  inputSchema: Record<string, unknown>;
  instructions?: string;
  examples?: GatewayToolExample[];
  timeoutMs?: number;
  maxOutputBytes?: number;
  cwdMode: GatewayToolCwdMode;
  fixedCwd?: string;
  outputMode: GatewayToolOutputMode;
  dangerLevel?: GatewayToolDangerLevel;
  readme?: string;
}

export interface GatewayRemoveToolPayload {
  apiVersion?: string;
  toolId: string;
}

export interface GatewayScaffoldedToolBundle {
  manifest: GatewayRegisterToolPayload;
  readme: string;
}

export interface GatewayListToolsResponsePayload {
  tools: GatewayTool[];
}

export interface GatewayGetToolResponsePayload {
  tool: GatewayTool | null;
}

export interface GatewayScaffoldToolResponsePayload {
  manifest: GatewayRegisterToolPayload;
  readme: string;
}

export interface GatewayRegisterToolResponsePayload {
  tool: GatewayTool;
}

export interface GatewayRemoveToolResponsePayload {
  toolId: string;
  removed: boolean;
}

export interface GatewayListToolApprovalGrantsPayload {
  apiVersion?: string;
  principalId?: string;
  deviceId?: string;
  spaceId?: string;
  toolId?: string;
  includeRevoked?: boolean;
  includeExpired?: boolean;
}

export interface GatewayListToolApprovalGrantsResponsePayload {
  grants: GatewayToolApprovalGrant[];
}

export interface GatewayRevokeToolApprovalGrantPayload {
  apiVersion?: string;
  principalId?: string;
  deviceId?: string;
  spaceId: string;
  toolId: string;
  reason?: string;
}

export interface GatewayRevokeToolApprovalGrantResult {
  revoked: boolean;
  toolId: string;
  spaceId: string;
  grant?: GatewayToolApprovalGrant;
}
