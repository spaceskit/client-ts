/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
import type { BudgetSummary, ProviderUsageSnapshot, UsageWindowSummary } from "./gateway-usage.js";

export type GatewayExternalConnectivityMode = "DISABLED" | "TAILSCALE";

export type GatewayExternalConnectivityState =
  | "disabled"
  | "unsupported"
  | "missing_dependency"
  | "logged_out"
  | "serve_missing"
  | "ready"
  | "error";

export interface GatewayExternalConnectivitySettings {
  mode: GatewayExternalConnectivityMode;
  funnelEnabled?: boolean | null;
  updatedAt: string;
}

export type GatewayExternalConnectivityFunnelState =
  | "disabled"
  | "unavailable"
  | "not_configured"
  | "ready"
  | "error";

export interface GatewayExternalConnectivityFunnelStatus {
  state: GatewayExternalConnectivityFunnelState;
  funnelConfigured: boolean;
  funnelUrl?: string;
  exposedPaths: string[];
  summary?: string;
  remediation?: string;
}

export interface GatewayExternalConnectivityAdvertisedEndpoint {
  provider: "tailscale";
  label: string;
  host: string;
  port: number;
  websocketUrl: string;
  healthUrl: string;
}

export interface GatewayExternalConnectivityTailscaleStatus {
  cliAvailable: boolean;
  version?: string;
  backendState?: string;
  health: string[];
  hostName?: string;
  dnsName?: string;
  magicDnsSuffix?: string;
  tailscaleIps: string[];
  serveConfigured: boolean;
  serveTarget?: string;
  servePort?: number;
}

export interface GatewayExternalConnectivityStatus {
  state: GatewayExternalConnectivityState;
  summary: string;
  remediation?: string;
  advertisedEndpoints: GatewayExternalConnectivityAdvertisedEndpoint[];
  tailscaleStatus?: GatewayExternalConnectivityTailscaleStatus;
  funnelStatus?: GatewayExternalConnectivityFunnelStatus;
}

export interface GatewayGetExternalConnectivityPayload {
  apiVersion?: string;
}

export interface GatewayGetExternalConnectivityResponsePayload {
  settings: GatewayExternalConnectivitySettings;
  status: GatewayExternalConnectivityStatus;
}

export interface GatewaySetExternalConnectivityPayload {
  apiVersion?: string;
  mode: GatewayExternalConnectivityMode;
  funnelEnabled?: boolean | null;
}

export interface GatewaySetExternalConnectivityResponsePayload {
  settings: GatewayExternalConnectivitySettings;
  status: GatewayExternalConnectivityStatus;
}

export interface GatewayFactoryResetPayload {
  apiVersion?: string;
  confirmation: string;
}

export interface GatewayFactoryResetResponsePayload {
  gatewayId: string;
  gatewayUuid?: string;
  resetAt: string;
  tablesCleared: number;
  rowsDeleted: number;
}

export interface SpaceResetPayload {
  apiVersion?: string;
  spaceId: string;
}

export interface SpaceResetResponsePayload {
  spaceId: string;
  resetAt: string;
  tablesCleared: number;
  rowsDeleted: number;
}

export interface VoiceUsageWindowSummary {
  sttSeconds: number;
  ttsChars: number;
  ttsSeconds: number;
  estimatedCostUsd: number;
}

export type VoiceProviderSource =
  | 'managed'
  | 'byok'
  | 'local_model'
  | 'apple_speech'
  | 'unknown';

export type VoiceChannel = 'stt' | 'tts';

export type VoiceProviderHealthStatus =
  | 'unknown'
  | 'healthy'
  | 'degraded'
  | 'unavailable';

export interface VoiceUsageSourceSummary extends VoiceUsageWindowSummary {
  source: VoiceProviderSource;
  usage?: VoiceUsageWindowSummary;
}

export interface VoiceUsageProviderSummary {
  channel: VoiceChannel;
  source: VoiceProviderSource;
  providerId: string;
  usage: VoiceUsageWindowSummary;
}

export interface VoiceUsageLockSummary {
  enabled: boolean;
  managedSttSecondsMonthlyLimit?: number;
  managedTtsCharsMonthlyLimit?: number;
  managedTtsSecondsMonthlyLimit?: number;
  managedCurrentMonthSttSeconds?: number;
  managedCurrentMonthTtsChars?: number;
  managedCurrentMonthTtsSeconds?: number;
}

export interface VoiceUsageSnapshot {
  windows: {
    last5h: VoiceUsageWindowSummary;
    last7d: VoiceUsageWindowSummary;
    last30d: VoiceUsageWindowSummary;
    lifetime: VoiceUsageWindowSummary;
  };
  bySource: VoiceUsageSourceSummary[];
  lock?: VoiceUsageLockSummary;
  byProvider?: VoiceUsageProviderSummary[];
}

export interface UsageSnapshot {
  computedAt: string;
  currency: 'USD';
  windows: {
    last5h: UsageWindowSummary;
    last7d: UsageWindowSummary;
    last30d: UsageWindowSummary;
    lifetime: UsageWindowSummary;
  };
  budget: BudgetSummary;
  providerUsage: ProviderUsageSnapshot[];
  voice?: VoiceUsageSnapshot;
}

export interface GatewayPolicy {
  allowedCapabilityTypes: string[];
  deniedCapabilityTypes: string[];
  allowedSkillIds: string[];
  deniedSkillIds: string[];
  globalFlags: Record<string, unknown>;
  updatedAt: string;
}

export interface GatewayPolicyUpdatePayload {
  apiVersion?: string;
  allowedCapabilityTypes?: string[];
  deniedCapabilityTypes?: string[];
  allowedSkillIds?: string[];
  deniedSkillIds?: string[];
  globalFlags?: Record<string, unknown>;
}
