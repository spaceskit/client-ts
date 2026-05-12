/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
import type { VoiceChannel, VoiceProviderHealthStatus, VoiceProviderSource } from "./gateway-admin.js";

export interface SpeechStartPayload {
  apiVersion?: string;
  spaceId: string;
  spaceUid?: string;
  sessionId?: string;
  locale?: string;
  sourceDevice?: string;
  enableTranscription?: boolean;
  enablePlayback?: boolean;
  agentId?: string;
  autoSubmitTurns?: boolean;
  preferredSource?: Exclude<VoiceProviderSource, 'unknown'>;
  preferredProviderId?: string;
  byokProviderId?: string;
  localModelProviderId?: string;
  appleSpeechProviderId?: string;
  allowByokFallback?: boolean;
  allowLocalFallback?: boolean;
  allowAppleSpeechFallback?: boolean;
  sttPreferences?: SpeechRoutePreferencesPayload;
  ttsPreferences?: SpeechRoutePreferencesPayload;
}

export interface SpeechAudioChunkPayload {
  apiVersion?: string;
  sessionId: string;
  sequence: number;
  sequenceNo?: number;
  audioBase64: string;
  sampleRateHz?: number;
  channels?: number;
  codec?: string;
  audioDurationSeconds?: number;
  ttsChars?: number;
  ttsSeconds?: number;
  transcriptText?: string;
  isFinal?: boolean;
  engineMetrics?: SpeechEngineMetricsPayload;
}

export interface SpeechControlPayload {
  apiVersion?: string;
  sessionId: string;
  command: 'stop' | 'interrupt' | 'end';
  reason?: string;
}

export interface SpeechEngineMetricsPayload {
  vadDetectionMs?: number;
  sttTranscriptionMs?: number;
  ttsFirstAudioMs?: number;
  ttsFullSynthesisMs?: number;
}

export interface SpeechRoutePreferencesPayload {
  channel: VoiceChannel;
  preferredSource?: Exclude<VoiceProviderSource, 'unknown'>;
  preferredProviderId?: string;
  byokProviderId?: string;
  localModelProviderId?: string;
  appleSpeechProviderId?: string;
  allowByokFallback?: boolean;
  allowLocalFallback?: boolean;
  allowAppleSpeechFallback?: boolean;
}

export interface VoiceRoutePayload {
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  providerId: string;
}

export interface VoiceProviderConfigPayload {
  providerId: string;
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  priority: number;
  healthStatus: VoiceProviderHealthStatus;
  costProfile?: string;
}

export interface VoiceLockDecisionPayload {
  channel: VoiceChannel;
  source: Exclude<VoiceProviderSource, 'unknown'>;
  allowed: boolean;
  reason: string;
  retryAt?: string;
  fallbackHint?: string;
}

export interface VoiceFallbackEventPayload {
  channel: VoiceChannel;
  fromRoute?: VoiceRoutePayload;
  toRoute?: VoiceRoutePayload;
  reason: 'default' | 'manual_override' | 'quota_fallback' | 'local_forced';
  detail?: string;
}

export interface VoiceIntentDecisionPayload {
  intentType: 'space_content' | 'orchestration_command' | 'clarification_required';
  confidence: number;
  rationale?: string;
  clarificationPrompt?: string;
  capabilityId?: string;
}

export interface SpeechEventPayload {
  sessionId: string;
  spaceId: string;
  spaceUid: string;
  type?: string;
  message?: string;
  intent?: VoiceIntentDecisionPayload;
  state: 'idle' | 'running' | 'stopped' | 'interrupted' | 'ended';
  eventType: string;
  providerSource?: Exclude<VoiceProviderSource, 'unknown'>;
  providerId?: string;
  fallbackReason?: 'default' | 'manual_override' | 'quota_fallback' | 'local_forced';
  usage?: {
    sttSeconds: number;
    ttsChars: number;
    ttsSeconds: number;
  };
  lockReason?: string;
  transcript?: string;
  turnId?: string;
  sequence?: number;
  sequenceNo?: number;
  reason?: string;
  emittedAt?: string;
  sttRoute?: VoiceRoutePayload;
  ttsRoute?: VoiceRoutePayload;
  lockDecision?: VoiceLockDecisionPayload;
  fallbackEvent?: VoiceFallbackEventPayload;
  providerConfigs?: VoiceProviderConfigPayload[];
  engineMetrics?: SpeechEngineMetricsPayload;
  ts: string;
}

/**
 * Turn execution result
 */
