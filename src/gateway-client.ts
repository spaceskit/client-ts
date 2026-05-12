/**
 * Spaceskit Client SDK
 *
 * Self-contained WebSocket client for connecting to Spaceskit.
 * No cross-package dependencies — safe to extract into its own package.
 *
 * Features:
 * - Full WebSocket protocol support (all message types)
 * - Ed25519 challenge-response authentication via Web Crypto API
 * - Auto-reconnect with exponential backoff
 * - Request-response correlation with configurable timeout
 * - Event subscriptions with unsubscribe handlers
 *
 * Contract note:
 * `proto/` is the canonical cross-process contract source of truth.
 * This handwritten WebSocket transport stays aligned to that contract, but it
 * no longer carries compatibility-only alias fields for removed legacy paths.
 */

export { generateAuthKeyPair, signChallenge } from "./gateway-auth.js";
export type { AuthKeyPair } from "./gateway-auth.js";
import type { AuthKeyPair } from "./gateway-auth.js";
import {
  handleGatewayClientAuthChallenge,
  handleGatewayClientAuthResult,
} from "./gateway-client-authentication.js";
import {
  GatewayClientEventBus,
  type AgentIdleHandler,
  type AgentMessageHandler,
  type AgentPokeHandler,
  type CapabilityInvokeHandler,
  type ErrorHandler,
  type NotificationHandler,
  type OrchestratorEventHandler,
  type SpaceAgentUpdatedHandler,
  type SpaceStateHandler,
  type SpeechEventHandler,
  type TaskDependencyHandler,
  type TaskDependencyResolvedHandler,
  type TurnEventHandler,
  type TurnStreamHandler,
  type UnsubscribeHandler,
} from "./gateway-client-events.js";
import * as AdapterApi from "./gateway-client-adapter-api.js";
import {
  dispatchGatewayClientMessage,
} from "./gateway-client-message-dispatch.js";
import type {
  GatewayClientPendingRequest,
  GatewayClientRequestInvoker,
} from "./gateway-client-request.js";
import * as SchedulerApi from "./gateway-client-scheduler-api.js";
import * as WorkbenchApi from "./gateway-client-workbench-api.js";
import * as SpaceAdminApi from "./gateway-client-space-admin-api.js";
import * as SpaceContentApi from "./gateway-client-space-content-api.js";
import * as IdentityTemplateApi from "./gateway-client-identity-template-api.js";
import * as GatewayAdminApi from "./gateway-client-gateway-admin-api.js";
import * as SharingSyncSpeechApi from "./gateway-client-sharing-sync-speech-api.js";
import {
  normalizeTurnEventPayload as normalizeGatewayTurnEventPayload,
  normalizeTurnStreamPayload as normalizeGatewayTurnStreamPayload,
} from "./gateway-client-normalizers.js";
export type {
  AgentIdleHandler,
  AgentMessageHandler,
  AgentPokeHandler,
  CapabilityInvokeHandler,
  ErrorHandler,
  NotificationHandler,
  OrchestratorEventHandler,
  SpaceAgentUpdatedHandler,
  SpaceStateHandler,
  SpeechEventHandler,
  TaskDependencyHandler,
  TaskDependencyResolvedHandler,
  TurnEventHandler,
  TurnStreamHandler,
  UnsubscribeHandler,
} from "./gateway-client-events.js";

// ---------------------------------------------------------------------------

export type * from "./gateway-protocol.js";
import type {
  AdapterCapabilityErrorPayload,
  AdapterCapabilityProvider,
  AdapterCapabilityResultPayload,
  AgentDefinitionArchiveResult,
  AgentDefinitionCreateResult,
  AgentDefinitionSummary,
  AgentDefinitionUpdateResult,
  ApprovalGrantPayload,
  AuthIssueHttpPrincipalTokenPayload,
  AuthIssueHttpPrincipalTokenResult,
  AuthListDevicesPayload,
  AuthRegisterDevicePayload,
  AuthRegisterDeviceResult,
  AuthRevokeDevicePayload,
  AuthRevokeDeviceResult,
  AuthRotateDeviceKeyPayload,
  AuthRotateDeviceKeyResult,
  BudgetSummary,
  CapabilityInvokePayload,
  CodexBarQuota,
  CommunicationMode,
  CompiledInstructionSection,
  CompiledInstructionSectionKey,
  CompiledInstructionsPreview,
  DeviceIdentity,
  ExecuteTurnOptions,
  ExecuteTurnPayload,
  ExternalAgentRuntimeBinding,
  GatewayExternalConnectivityAdvertisedEndpoint,
  GatewayExternalConnectivityFunnelState,
  GatewayExternalConnectivityFunnelStatus,
  GatewayExternalConnectivityMode,
  GatewayExternalConnectivitySettings,
  GatewayExternalConnectivityState,
  GatewayExternalConnectivityStatus,
  GatewayExternalConnectivityTailscaleStatus,
  GatewayFactoryResetPayload,
  GatewayFactoryResetResponsePayload,
  GatewayGetExternalConnectivityPayload,
  GatewayGetExternalConnectivityResponsePayload,
  GatewayGetLocalUsageTelemetryPayload,
  GatewayGetLocalUsageTelemetryResponsePayload,
  GatewayGetMemoryDefaultsPayload,
  GatewayGetMemoryDefaultsResponsePayload,
  GatewayGetToolPayload,
  GatewayGetToolResponsePayload,
  GatewayListToolApprovalGrantsPayload,
  GatewayListToolApprovalGrantsResponsePayload,
  GatewayListToolsPayload,
  GatewayListToolsResponsePayload,
  GatewayMemoryDefaults,
  GatewayMessage,
  GatewayPolicy,
  GatewayPolicyUpdatePayload,
  GatewayRegisterToolPayload,
  GatewayRegisterToolResponsePayload,
  GatewayRemoveToolPayload,
  GatewayRemoveToolResponsePayload,
  GatewayRevokeToolApprovalGrantPayload,
  GatewayRevokeToolApprovalGrantResult,
  GatewayScaffoldToolPayload,
  GatewayScaffoldToolResponsePayload,
  GatewayScaffoldedToolBundle,
  GatewaySetExternalConnectivityPayload,
  GatewaySetExternalConnectivityResponsePayload,
  GatewaySetMemoryDefaultsPayload,
  GatewaySetMemoryDefaultsResponsePayload,
  GatewayTool,
  GatewayToolApprovalGrant,
  GatewayToolApprovalGrantMode,
  GatewayToolCwdMode,
  GatewayToolDangerLevel,
  GatewayToolExample,
  GatewayToolHealthStatus,
  GatewayToolOutputMode,
  IdentityArchiveAgentDefinitionPayload,
  IdentityArchiveAgentDefinitionResponsePayload,
  IdentityArchivePersonaPayload,
  IdentityArchivePersonaResponsePayload,
  IdentityCreateAgentDefinitionPayload,
  IdentityCreateAgentDefinitionResponsePayload,
  IdentityCreatePersonaPayload,
  IdentityCreatePersonaResponsePayload,
  IdentityGetAgentDefinitionPayload,
  IdentityGetAgentDefinitionResponsePayload,
  IdentityGetPersonaPayload,
  IdentityGetPersonaResponsePayload,
  IdentityListAgentDefinitionsPayload,
  IdentityListAgentDefinitionsResponsePayload,
  IdentityListPersonasPayload,
  IdentityListPersonasResponsePayload,
  IdentityPreviewCompiledInstructionsPayload,
  IdentityPreviewCompiledInstructionsResponsePayload,
  IdentityPreviewRuntimeSystemPromptPayload,
  IdentityPreviewRuntimeSystemPromptResponsePayload,
  IdentityPreviewSystemPromptMatrixPayload,
  IdentityPreviewSystemPromptMatrixResponsePayload,
  IdentityUpdateAgentDefinitionPayload,
  IdentityUpdateAgentDefinitionResponsePayload,
  IdentityUpdatePersonaPayload,
  IdentityUpdatePersonaResponsePayload,
  LibraryArchiveEntryPayload,
  LibraryArchiveEntryResponsePayload,
  LibraryCreateSkillDraftPayload,
  LibraryCreateSkillDraftResponsePayload,
  LibraryDeleteEntryPayload,
  LibraryDeleteEntryResponsePayload,
  LibraryDeleteSkillDraftPayload,
  LibraryDeleteSkillDraftResponsePayload,
  LibraryEntry,
  LibraryEntryStatus,
  LibraryGetEntryPayload,
  LibraryGetEntryResponsePayload,
  LibraryGetSkillDraftPayload,
  LibraryGetSkillDraftResponsePayload,
  LibraryImportEntryPayload,
  LibraryImportEntryResponsePayload,
  LibraryListEntriesPayload,
  LibraryListEntriesResponsePayload,
  LibraryListSkillDraftsPayload,
  LibraryListSkillDraftsResponsePayload,
  LibrarySaveSkillPayload,
  LibrarySaveSkillResponsePayload,
  LibraryScanEntriesPayload,
  LibraryScanEntriesResponsePayload,
  LibrarySetEntryEnabledPayload,
  LibrarySetEntryEnabledResponsePayload,
  LibrarySourceKind,
  LocalProviderUsageTelemetry,
  LocalUsageInstallHint,
  LocalUsageSession,
  LocalUsageSummary,
  LocalUsageWindow,
  ManagedRecordStatus,
  McpDiscoveredAgent,
  OrchestrationJournalEntry,
  OrchestratorCommandEvent,
  OrchestratorCommandPayload,
  OrchestratorCommandResult,
  OrchestratorSummaryArtifact,
  OrchestratorSummaryHighlight,
  OrchestratorSummaryParticipant,
  PersonaArchiveResult,
  PersonaCreateResult,
  PersonaSummary,
  PersonaUpdateResult,
  ProfileModelConfig,
  PromptBudgetClass,
  ProviderUsageSnapshot,
  ResumeFeedbackPayload,
  RuntimeSystemPromptPreview,
  RuntimeSystemPromptSection,
  RuntimeSystemPromptSectionKey,
  SchedulerAction,
  SchedulerActionType,
  SchedulerCalendarBinding,
  SchedulerCalendarDriftStatus,
  SchedulerCalendarSyncStatus,
  SchedulerCreateJobPayload,
  SchedulerDeleteJobPayload,
  SchedulerDeleteJobResult,
  SchedulerEvalArtifactRef,
  SchedulerEvalCheckpoint,
  SchedulerEvalCheckpointStatus,
  SchedulerEvalConfig,
  SchedulerEvalDefinition,
  SchedulerEvalDomain,
  SchedulerEvalRecommendation,
  SchedulerEvalRecommendationKind,
  SchedulerEvalRecommendationStatus,
  SchedulerEvalRun,
  SchedulerEvalScenarioResult,
  SchedulerEvalScenarioStatus,
  SchedulerEvalSelfImproveState,
  SchedulerEvalSummaryMode,
  SchedulerExecutionTarget,
  SchedulerExecutionTargetMode,
  SchedulerJob,
  SchedulerJobRun,
  SchedulerJobStatus,
  SchedulerLinkSpacePayload,
  SchedulerLinkedSpace,
  SchedulerListEvalDefinitionsPayload,
  SchedulerListJobsPayload,
  SchedulerListRunsPayload,
  SchedulerListRunsResult,
  SchedulerRunNowPayload,
  SchedulerRunNowResult,
  SchedulerRunStatus,
  SchedulerRunTrigger,
  SchedulerScheduleKind,
  SchedulerSchedulePreset,
  SchedulerUnlinkSpacePayload,
  SchedulerUpdateJobPayload,
  SharedContextRef,
  SkillDraft,
  SpaceAcceptInsightPayload,
  SpaceActivityLogEntry,
  SpaceAddAgentPayload,
  SpaceAddAgentResponsePayload,
  SpaceAddResourcePayload,
  SpaceAddResourceResponsePayload,
  SpaceAddSkillPayload,
  SpaceAddSkillResponsePayload,
  SpaceAgentAssignment,
  SpaceAgentNotesRecord,
  SpaceAgentNotesResponsePayload,
  SpaceApproveMcpAgentPayload,
  SpaceApproveMcpAgentResponsePayload,
  SpaceArchivePayload,
  SpaceArchiveResponsePayload,
  SpaceArtifactDetail,
  SpaceArtifactSummary,
  SpaceAssignmentRole,
  SpaceClearMcpEndpointPayload,
  SpaceClearMcpEndpointResponsePayload,
  SpaceCreateFromTemplatePayload,
  SpaceCreateFromTemplateResult,
  SpaceCreateInitialAgentPayload,
  SpaceCreatePayload,
  SpaceCreateResponsePayload,
  SpaceDeleteMemoryPayload,
  SpaceDeleteMemoryResponsePayload,
  SpaceDeletePayload,
  SpaceDeleteResponsePayload,
  SpaceDiscoverMcpAgentsPayload,
  SpaceDiscoverMcpAgentsResponsePayload,
  SpaceDismissInsightPayload,
  SpaceEndIncognitoSessionPayload,
  SpaceEndIncognitoSessionResponsePayload,
  SpaceExperienceCaptureMode,
  SpaceExperienceRecord,
  SpaceGetArtifactPayload,
  SpaceGetArtifactResponsePayload,
  SpaceGetDebugArtifactPayload,
  SpaceGetDebugArtifactResponsePayload,
  SpaceGetExperiencePayload,
  SpaceGetExperienceResponsePayload,
  SpaceGetInsightPayload,
  SpaceGetInsightResponsePayload,
  SpaceGetMcpEndpointPayload,
  SpaceGetMcpEndpointResponsePayload,
  SpaceGetMemoryPolicyPayload,
  SpaceGetMemoryPolicyResponsePayload,
  SpaceGetPayload,
  SpaceGetResponsePayload,
  SpaceGetSpaceAgentNotesPayload,
  SpaceGetTurnTracePayload,
  SpaceGetTurnTraceResponsePayload,
  SpaceGetUserProfilePayload,
  SpaceGetWorkspacePayload,
  SpaceGetWorkspaceResponsePayload,
  SpaceInsightActionResponsePayload,
  SpaceInviteLink,
  SpaceLinkPayload,
  SpaceLinkResult,
  SpaceListActivityLogPayload,
  SpaceListActivityLogResponsePayload,
  SpaceListAgentAssignmentsPayload,
  SpaceListAgentAssignmentsResponsePayload,
  SpaceListArtifactsPayload,
  SpaceListArtifactsResponsePayload,
  SpaceListExperiencesPayload,
  SpaceListExperiencesResponsePayload,
  SpaceListInsightsPayload,
  SpaceListInsightsResponsePayload,
  SpaceListMemoriesPayload,
  SpaceListMemoriesResponsePayload,
  SpaceListOrchestrationJournalPayload,
  SpaceListOrchestrationJournalResponsePayload,
  SpaceListPayload,
  SpaceListResourcesPayload,
  SpaceListResourcesResponsePayload,
  SpaceListResponsePayload,
  SpaceListSkillsPayload,
  SpaceListSkillsResponsePayload,
  SpaceMcpEndpoint,
  SpaceMemoryPolicy,
  SpaceMemoryRecord,
  SpaceParticipant,
  SpacePersonalityInsightRecord,
  SpacePreviewTemplatePayload,
  SpacePreviewTemplateResult,
  SpacePrivacyMode,
  SpacePullSharedContextPayload,
  SpacePullSharedContextResult,
  SpaceRejectInsightPayload,
  SpaceRemoveAgentPayload,
  SpaceRemoveAgentResponsePayload,
  SpaceRemoveResourcePayload,
  SpaceRemoveResourceResponsePayload,
  SpaceRemoveSkillPayload,
  SpaceRemoveSkillResponsePayload,
  SpaceResetPayload,
  SpaceResetResponsePayload,
  SpaceResource,
  SpaceSaveTemplatePayload,
  SpaceSaveTemplateResult,
  SpaceSetMcpEndpointPayload,
  SpaceSetMcpEndpointResponsePayload,
  SpaceSetMemoryPolicyPayload,
  SpaceSetMemoryPolicyResponsePayload,
  SpaceSetOrchestratorPayload,
  SpaceSetWorkspacePayload,
  SpaceSetWorkspaceResponsePayload,
  SpaceShareAccessMode,
  SpaceShareContextPayload,
  SpaceShareCreateInvitePayload,
  SpaceShareIdentityModeHint,
  SpaceShareInvite,
  SpaceShareJoinPayload,
  SpaceShareJoinRoute,
  SpaceShareListParticipantsPayload,
  SpaceShareRevokePayload,
  SpaceShareRevokeResult,
  SpaceSummary,
  SpaceTemplateArchivePayload,
  SpaceTemplateArchiveResponsePayload,
  SpaceTemplateArchiveResult,
  SpaceTemplateCreateSpacePayload,
  SpaceTemplateCreateSpaceResponsePayload,
  SpaceTemplateCreateSpaceResult,
  SpaceTemplateGetPayload,
  SpaceTemplateGetResponsePayload,
  SpaceTemplateListPayload,
  SpaceTemplateListResponsePayload,
  SpaceTemplatePreviewPayload,
  SpaceTemplatePreviewResolved,
  SpaceTemplatePreviewResponsePayload,
  SpaceTemplatePreviewResult,
  SpaceTemplateRecord,
  SpaceTemplateSavePayload,
  SpaceTemplateSaveResponsePayload,
  SpaceTemplateSaveResult,
  SpaceTemplateSummary,
  SpaceTurnTrace,
  SpaceTurnTraceActivity,
  SpaceTurnTraceEvent,
  SpaceTurnTraceExecutionRun,
  SpaceTurnTraceToolCall,
  SpaceUnlinkPayload,
  SpaceUpdateAgentAssignmentPayload,
  SpaceUpdateAgentAssignmentResponsePayload,
  SpaceUpdateMemoryImportancePayload,
  SpaceUpdateMemoryImportanceResponsePayload,
  SpaceUpdateSpaceAgentNotesPayload,
  SpaceUpdateUserProfilePayload,
  SpaceUserProfileRecord,
  SpaceUserProfileResponsePayload,
  SpaceWorkspace,
  SpeechAudioChunkPayload,
  SpeechControlPayload,
  SpeechEngineMetricsPayload,
  SpeechEventPayload,
  SpeechRoutePreferencesPayload,
  SpeechStartPayload,
  SubscribePayload,
  SyncAnnouncePayload,
  SyncAnnounceResult,
  SyncPullResourcesPayload,
  SyncPullResourcesResult,
  SyncQueryResourcesPayload,
  SyncQueryResourcesResult,
  SyncResource,
  SyncResourceDenied,
  SyncResourceRef,
  SystemPromptMatrix,
  SystemPromptVariant,
  TemplateAgentDefinition,
  TemplateAgentProfileBinding,
  ThinkingCapturePolicy,
  TurnAccessMode,
  TurnEffort,
  TurnEventPayload,
  TurnMetadata,
  TurnMode,
  TurnStreamPayload,
  TurnUsage,
  UsageSnapshot,
  UsageWindowSummary,
  VoiceChannel,
  VoiceFallbackEventPayload,
  VoiceIntentDecisionPayload,
  VoiceLockDecisionPayload,
  VoiceProviderConfigPayload,
  VoiceProviderHealthStatus,
  VoiceProviderSource,
  VoiceRoutePayload,
  VoiceUsageLockSummary,
  VoiceUsageProviderSummary,
  VoiceUsageSnapshot,
  VoiceUsageSourceSummary,
  VoiceUsageWindowSummary,
  WorkbenchApprovalState,
  WorkbenchApproveStagePayload,
  WorkbenchArtifact,
  WorkbenchBatch,
  WorkbenchBatchStatus,
  WorkbenchCancelRunPayload,
  WorkbenchCreateBatchPayload,
  WorkbenchExecutionContext,
  WorkbenchExecutionContextStage,
  WorkbenchExecutionMode,
  WorkbenchExecutionModeEligibility,
  WorkbenchGetPolicyPayload,
  WorkbenchGetQueueItemPayload,
  WorkbenchGetRunPayload,
  WorkbenchLandingResult,
  WorkbenchLandingStatus,
  WorkbenchListArtifactsPayload,
  WorkbenchListBatchesPayload,
  WorkbenchListQueuePayload,
  WorkbenchListRunsPayload,
  WorkbenchPolicy,
  WorkbenchQueueItem,
  WorkbenchRejectStagePayload,
  WorkbenchRepoTouch,
  WorkbenchRetryRunPayload,
  WorkbenchRun,
  WorkbenchRunStage,
  WorkbenchRunStatus,
  WorkbenchSetModePayload,
  WorkbenchSetModeResult,
  WorkbenchStartRunPayload,
  WorkbenchUpdateBatchPayload,
  WorkbenchUpdatePolicyPayload,
  WorkbenchVerificationMode,
  WorkbenchVerificationResult,
  WorkbenchVerificationResultStatus,
  WorkbenchVerificationSuite,
  WorkbenchVerificationSuiteStatus,
  WorkbenchWorktreeRef,
} from "./gateway-protocol.js";

export interface TurnResult {
  turnId: string;
  spaceId: string;
  output?: string;
  status: 'completed' | 'pending_feedback' | 'failed';
  error?: string;
  mode?: TurnMode;
  effort?: TurnEffort;
}

/**
 * Capability invocation result
 */
export interface CapabilityResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

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

/**
 * Spaceskit WebSocket client SDK
 */
export class GatewayClient {
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
  private events = new GatewayClientEventBus();
  private readonly endpointRequests: GatewayClientRequestInvoker = {
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
  private readonly adapterApi: AdapterApi.GatewayClientAdapterApiContext = {
    requests: this.endpointRequests,
    send: <T>(type: string, payload: T) => this.send<T>(type, payload),
  };

  private authKeyPair: AuthKeyPair | null = null;

  private onOpenCallback?: () => void;
  private onCloseCallback?: () => void;
  private onErrorCallback?: (error: Error) => void;

  constructor(options: GatewayClientOptions) {
    this.url = options.url;
    this.clientType = options.clientType ?? 'sdk';
    this.clientVersion = options.clientVersion ?? '1.0.0';
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

        this.ws.addEventListener('open', () => {
          this.connected = true;
          this.reconnectAttempts = 0;
          this.onOpenCallback?.();
          resolve();
        });

        this.ws.addEventListener('message', (event: MessageEvent) => {
          this.handleMessage(event.data);
        });

        this.ws.addEventListener('close', () => {
          this.connected = false;
          this.onCloseCallback?.();
          this.attemptReconnect();
        });

        this.ws.addEventListener('error', (event: Event) => {
          const error = new Error('WebSocket error');
          this.onErrorCallback?.(error);
          this.events.emitError({
            code: 'WS_ERROR',
            message: 'WebSocket connection error',
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

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (!this.reconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      const error = new Error('Max reconnection attempts reached');
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
   * Send a message to the gateway
   */
  private async send<T>(type: string, payload: T): Promise<string> {
    if (!this.isConnected) {
      throw new Error('WebSocket not connected');
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

  /**
   * Set the authentication key pair for challenge-response auth.
   * Must be called before `connect()` if the gateway requires authentication.
   * Generate a key pair with `generateAuthKeyPair()`.
   */
  setAuthKeyPair(keyPair: AuthKeyPair): void {
    this.authKeyPair = keyPair;
  }

  private normalizeTurnEventPayload(
    payload: TurnEventPayload | Record<string, unknown>,
  ): TurnEventPayload {
    return normalizeGatewayTurnEventPayload(payload);
  }

  private normalizeTurnStreamPayload(
    payload: TurnStreamPayload | Record<string, unknown>,
  ): TurnStreamPayload | null {
    return normalizeGatewayTurnStreamPayload(payload);
  }

  /**
   * Execute a turn in a space
   */
  async executeTurn(options: ExecuteTurnOptions): Promise<TurnResult>;
  async executeTurn(
    spaceUid: string,
    input: string,
    targetAgentId?: string,
  ): Promise<TurnResult>;
  async executeTurn(
    optionsOrSpaceUid: ExecuteTurnOptions | string,
    input?: string,
    targetAgentId?: string,
  ): Promise<TurnResult> {
    const options: ExecuteTurnOptions = typeof optionsOrSpaceUid === 'string'
      ? {
          spaceUid: optionsOrSpaceUid,
          input: input ?? '',
          targetAgentId,
        }
      : optionsOrSpaceUid;
    const payload: ExecuteTurnPayload = {
      spaceUid: options.spaceUid,
      input: options.input,
      targetAgentId: options.targetAgentId,
      targetAgentIds: options.targetAgentIds,
      replyToTurnId: options.replyToTurnId,
      conversationTopology: options.conversationTopology,
      mode: options.mode,
      effort: options.effort,
      accessMode: options.accessMode,
    };

    const result = await this.request<
      ExecuteTurnPayload,
      TurnResult
    >('execute_turn', payload);
    return result;
  }

  /**
   * Ensure a main space exists and optionally subscribe to it.
   *
   * This is intended for app bootstrap flows:
   * - find main space by ID
   * - optionally create it if missing
   * - optionally subscribe to its real-time events
   */
  async ensureMainSpace(
    options: MainSpaceBootstrapOptions = {},
  ): Promise<MainSpaceBootstrapResult> {
    const spaceId = options.spaceId ?? 'main-space';
    const resourceId = options.resourceId ?? 'resource:main';
    const name = options.name ?? 'Main Space';
    const goal = options.goal ?? 'Default shared space for gateway startup and orchestrator coordination.';
    const createIfMissing = options.createIfMissing ?? true;
    const shouldSubscribe = options.subscribe ?? true;

    const spaces = await this.listSpaces({
      apiVersion: options.apiVersion,
      resourceId,
      limit: 200,
    });

    let space = spaces.find((candidate) => candidate.id === spaceId) ?? null;
    let created = false;

    if (!space && createIfMissing) {
      space = await this.createSpace({
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
      await this.subscribe([space.spaceUid]);
      subscribed = true;
    }

    return {
      space,
      created,
      subscribed,
    };
  }

  /**
   * Connect (if needed), then ensure/subscribe main space.
   */
  async connectAndBootstrapMainSpace(
    options: MainSpaceBootstrapOptions = {},
  ): Promise<ConnectAndBootstrapResult> {
    let connected = false;
    if (!this.isConnected) {
      await this.connect();
      connected = true;
    }

    const result = await this.ensureMainSpace(options);
    return {
      connected,
      ...result,
    };
  }

  /**
   * Resume a turn with feedback
   */
  async resumeFeedback(
    spaceUid: string,
    turnId: string,
    response: 'approve' | 'reject' | 'revise' | 'defer',
    revision?: string,
    approvalGrant?: ApprovalGrantPayload,
  ): Promise<void> {
    const payload: ResumeFeedbackPayload = {
      spaceUid,
      turnId,
      response,
      revision,
      approvalGrant,
    };

    await this.request<ResumeFeedbackPayload, void>(
      'resume_feedback',
      payload,
    );
  }

  /**
   * Subscribe to space events
   */
  async subscribe(spaceUids: string[]): Promise<void> {
    const payload: SubscribePayload = {
      spaceUids,
    };
    await this.request<SubscribePayload, void>(
      'subscribe',
      payload,
    );
  }

  /**
   * Invoke a capability
   */
  async invokeCapability(
    capability: string,
    method: string,
    params: Record<string, unknown>,
    targetProvider?: string,
  ): Promise<CapabilityResult> {
    const payload: CapabilityInvokePayload = {
      capability,
      method,
      params,
      targetProvider,
    };

    const result = await this.request<
      CapabilityInvokePayload,
      CapabilityResult
    >('capability_invoke', payload);
    return result;
  }

  /**
   * Create a new space.
   */
  async createSpace(payload: SpaceCreatePayload): Promise<SpaceSummary> {
    return SpaceAdminApi.createSpace(this.endpointRequests, payload);
  }

  /**
   * Get a space by ID.
   */
  async getSpace(spaceId: string, apiVersion?: string): Promise<SpaceSummary> {
    return SpaceAdminApi.getSpace(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * List spaces with optional filters.
   */
  async listSpaces(payload: SpaceListPayload = {}): Promise<SpaceSummary[]> {
    return SpaceAdminApi.listSpaces(this.endpointRequests, payload);
  }

  /**
   * Archive a space on the gateway.
   */
  async archiveSpace(payload: SpaceArchivePayload): Promise<SpaceArchiveResponsePayload> {
    return SpaceAdminApi.archiveSpace(this.endpointRequests, payload);
  }

  /**
   * Soft-delete a space on the gateway.
   */
  async deleteSpace(payload: SpaceDeletePayload): Promise<SpaceDeleteResponsePayload> {
    return SpaceAdminApi.deleteSpace(this.endpointRequests, payload);
  }

  /**
   * Add an agent assignment to a space.
   */
  async addAgent(payload: SpaceAddAgentPayload): Promise<SpaceAddAgentResponsePayload> {
    return SpaceAdminApi.addAgent(this.endpointRequests, payload);
  }

  /**
   * Remove an agent assignment from a space.
   */
  async removeAgent(payload: SpaceRemoveAgentPayload): Promise<SpaceRemoveAgentResponsePayload> {
    return SpaceAdminApi.removeAgent(this.endpointRequests, payload);
  }

  /**
   * Update an existing assignment in a space.
   */
  async updateAgentAssignment(
    payload: SpaceUpdateAgentAssignmentPayload,
  ): Promise<SpaceUpdateAgentAssignmentResponsePayload> {
    return SpaceAdminApi.updateAgentAssignment(this.endpointRequests, payload);
  }

  /**
   * Set the orchestrator profile for a space.
   */
  async setSpaceOrchestrator(payload: SpaceSetOrchestratorPayload): Promise<SpaceSummary> {
    return SpaceAdminApi.setSpaceOrchestrator(this.endpointRequests, payload);
  }

  /**
   * List all assignments for a space.
   */
  async listAgentAssignments(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceAgentAssignment[]> {
    return SpaceAdminApi.listAgentAssignments(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Get per-space MCP endpoint configuration.
   */
  async getSpaceMcpEndpoint(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceGetMcpEndpointResponsePayload> {
    return SpaceAdminApi.getSpaceMcpEndpoint(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Create or update per-space MCP endpoint configuration.
   */
  async setSpaceMcpEndpoint(
    payload: SpaceSetMcpEndpointPayload,
  ): Promise<SpaceMcpEndpoint> {
    return SpaceAdminApi.setSpaceMcpEndpoint(this.endpointRequests, payload);
  }

  /**
   * Remove per-space MCP endpoint configuration.
   */
  async clearSpaceMcpEndpoint(
    spaceId: string,
    apiVersion?: string,
  ): Promise<boolean> {
    return SpaceAdminApi.clearSpaceMcpEndpoint(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Discover MCP-backed external agents available to a space.
   */
  async discoverSpaceMcpAgents(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceDiscoverMcpAgentsResponsePayload> {
    return SpaceAdminApi.discoverSpaceMcpAgents(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Approve one discovered MCP agent into a space as an external participant.
   */
  async approveSpaceMcpAgent(
    payload: SpaceApproveMcpAgentPayload,
  ): Promise<SpaceApproveMcpAgentResponsePayload> {
    return SpaceAdminApi.approveSpaceMcpAgent(this.endpointRequests, payload);
  }

  /**
   * Add one skill assignment to a space.
   */
  async addSkillToSpace(payload: SpaceAddSkillPayload): Promise<SpaceAddSkillResponsePayload> {
    return SpaceAdminApi.addSkillToSpace(this.endpointRequests, payload);
  }

  /**
   * Remove one skill assignment from a space.
   */
  async removeSkillFromSpace(payload: SpaceRemoveSkillPayload): Promise<SpaceRemoveSkillResponsePayload> {
    return SpaceAdminApi.removeSkillFromSpace(this.endpointRequests, payload);
  }

  /**
   * List current skill assignments for a space.
   */
  async listSpaceSkills(spaceId: string, apiVersion?: string): Promise<string[]> {
    return SpaceAdminApi.listSpaceSkills(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Get effective workspace configuration for a space.
   */
  async getSpaceWorkspace(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceWorkspace> {
    return SpaceAdminApi.getSpaceWorkspace(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * Set or clear the folder binding for a space.
   */
  async setSpaceWorkspace(
    payload: SpaceSetWorkspacePayload,
  ): Promise<SpaceWorkspace> {
    return SpaceAdminApi.setSpaceWorkspace(this.endpointRequests, payload);
  }

  /**
   * Add one resource assignment to a space.
   */
  async addSpaceResource(payload: SpaceAddResourcePayload): Promise<SpaceResource> {
    return SpaceAdminApi.addSpaceResource(this.endpointRequests, payload);
  }

  /**
   * Remove one resource assignment from a space.
   */
  async removeSpaceResource(payload: SpaceRemoveResourcePayload): Promise<boolean> {
    return SpaceAdminApi.removeSpaceResource(this.endpointRequests, payload);
  }

  /**
   * List resource assignments for a space.
   */
  async listSpaceResources(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceResource[]> {
    return SpaceAdminApi.listSpaceResources(this.endpointRequests, spaceId, apiVersion);
  }

  /**
   * List redacted orchestration journal entries for a space.
   */
  async listOrchestrationJournal(
    payload: SpaceListOrchestrationJournalPayload,
  ): Promise<SpaceListOrchestrationJournalResponsePayload> {
    return SpaceAdminApi.listOrchestrationJournal(this.endpointRequests, payload);
  }

  async getSpaceMemoryPolicy(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceMemoryPolicy> {
    return SpaceAdminApi.getSpaceMemoryPolicy(this.endpointRequests, spaceId, apiVersion);
  }

  async setSpaceMemoryPolicy(
    payload: SpaceSetMemoryPolicyPayload,
  ): Promise<SpaceSummary> {
    return SpaceAdminApi.setSpaceMemoryPolicy(this.endpointRequests, payload);
  }

  async endIncognitoSession(
    spaceId: string,
    apiVersion?: string,
  ): Promise<SpaceEndIncognitoSessionResponsePayload> {
    return SpaceAdminApi.endIncognitoSession(this.endpointRequests, spaceId, apiVersion);
  }

  async listActivityLog(
    payload: SpaceListActivityLogPayload,
  ): Promise<SpaceListActivityLogResponsePayload> {
    return SpaceContentApi.listActivityLog(this.endpointRequests, payload);
  }

  async getTurnTrace(payload: SpaceGetTurnTracePayload): Promise<SpaceTurnTrace> {
    return SpaceContentApi.getTurnTrace(this.endpointRequests, payload);
  }

  async listSpaceArtifacts(
    payload: SpaceListArtifactsPayload,
  ): Promise<SpaceListArtifactsResponsePayload> {
    return SpaceContentApi.listSpaceArtifacts(this.endpointRequests, payload);
  }

  async getSpaceArtifact(payload: SpaceGetArtifactPayload): Promise<SpaceArtifactDetail> {
    return SpaceContentApi.getSpaceArtifact(this.endpointRequests, payload);
  }

  async getSpaceDebugArtifact(payload: SpaceGetDebugArtifactPayload): Promise<SpaceArtifactDetail> {
    return SpaceContentApi.getSpaceDebugArtifact(this.endpointRequests, payload);
  }

  async listExperiences(
    payload: SpaceListExperiencesPayload,
  ): Promise<SpaceListExperiencesResponsePayload> {
    return SpaceContentApi.listExperiences(this.endpointRequests, payload);
  }

  async getExperience(
    payload: SpaceGetExperiencePayload,
  ): Promise<SpaceExperienceRecord> {
    return SpaceContentApi.getExperience(this.endpointRequests, payload);
  }

  async listInsights(
    payload: SpaceListInsightsPayload,
  ): Promise<SpaceListInsightsResponsePayload> {
    return SpaceContentApi.listInsights(this.endpointRequests, payload);
  }

  async getInsight(payload: SpaceGetInsightPayload): Promise<SpacePersonalityInsightRecord> {
    return SpaceContentApi.getInsight(this.endpointRequests, payload);
  }

  async acceptInsight(payload: SpaceAcceptInsightPayload): Promise<SpacePersonalityInsightRecord> {
    return SpaceContentApi.acceptInsight(this.endpointRequests, payload);
  }

  async rejectInsight(payload: SpaceRejectInsightPayload): Promise<SpacePersonalityInsightRecord> {
    return SpaceContentApi.rejectInsight(this.endpointRequests, payload);
  }

  async dismissInsight(payload: SpaceDismissInsightPayload): Promise<SpacePersonalityInsightRecord> {
    return SpaceContentApi.dismissInsight(this.endpointRequests, payload);
  }

  async getSpaceAgentNotes(
    payload: SpaceGetSpaceAgentNotesPayload,
  ): Promise<SpaceAgentNotesRecord | null | undefined> {
    return SpaceContentApi.getSpaceAgentNotes(this.endpointRequests, payload);
  }

  async updateSpaceAgentNotes(
    payload: SpaceUpdateSpaceAgentNotesPayload,
  ): Promise<SpaceAgentNotesRecord | null | undefined> {
    return SpaceContentApi.updateSpaceAgentNotes(this.endpointRequests, payload);
  }

  async getUserProfile(
    payload: SpaceGetUserProfilePayload = {},
  ): Promise<SpaceUserProfileRecord | null | undefined> {
    return SpaceContentApi.getUserProfile(this.endpointRequests, payload);
  }

  async updateUserProfile(
    payload: SpaceUpdateUserProfilePayload,
  ): Promise<SpaceUserProfileRecord | null | undefined> {
    return SpaceContentApi.updateUserProfile(this.endpointRequests, payload);
  }

  async listMemories(
    payload: SpaceListMemoriesPayload,
  ): Promise<SpaceListMemoriesResponsePayload> {
    return SpaceContentApi.listMemories(this.endpointRequests, payload);
  }

  async deleteMemory(
    payload: SpaceDeleteMemoryPayload,
  ): Promise<SpaceDeleteMemoryResponsePayload> {
    return SpaceContentApi.deleteMemory(this.endpointRequests, payload);
  }

  async updateMemoryImportance(
    payload: SpaceUpdateMemoryImportancePayload,
  ): Promise<SpaceMemoryRecord> {
    return SpaceContentApi.updateMemoryImportance(this.endpointRequests, payload);
  }

  /**
   * List agent definitions, optionally including archived entries.
   */
  async listAgentDefinitions(
    payload: IdentityListAgentDefinitionsPayload = {},
  ): Promise<AgentDefinitionSummary[]> {
    return IdentityTemplateApi.listAgentDefinitions(this.endpointRequests, payload);
  }

  /**
   * Fetch one agent definition by ID.
   */
  async getAgentDefinition(
    agentDefinitionId: string,
    apiVersion?: string,
  ): Promise<AgentDefinitionSummary> {
    return IdentityTemplateApi.getAgentDefinition(
      this.endpointRequests,
      agentDefinitionId,
      apiVersion,
    );
  }

  async createAgentDefinition(
    payload: IdentityCreateAgentDefinitionPayload,
  ): Promise<AgentDefinitionCreateResult> {
    return IdentityTemplateApi.createAgentDefinition(this.endpointRequests, payload);
  }

  async updateAgentDefinition(
    payload: IdentityUpdateAgentDefinitionPayload,
  ): Promise<AgentDefinitionUpdateResult> {
    return IdentityTemplateApi.updateAgentDefinition(this.endpointRequests, payload);
  }

  async archiveAgentDefinition(
    payload: IdentityArchiveAgentDefinitionPayload,
  ): Promise<AgentDefinitionArchiveResult> {
    return IdentityTemplateApi.archiveAgentDefinition(this.endpointRequests, payload);
  }

  async listPersonas(payload: IdentityListPersonasPayload = {}): Promise<PersonaSummary[]> {
    return IdentityTemplateApi.listPersonas(this.endpointRequests, payload);
  }

  async getPersona(personaId: string, apiVersion?: string): Promise<PersonaSummary> {
    return IdentityTemplateApi.getPersona(this.endpointRequests, personaId, apiVersion);
  }

  async createPersona(payload: IdentityCreatePersonaPayload): Promise<PersonaCreateResult> {
    return IdentityTemplateApi.createPersona(this.endpointRequests, payload);
  }

  async updatePersona(payload: IdentityUpdatePersonaPayload): Promise<PersonaUpdateResult> {
    return IdentityTemplateApi.updatePersona(this.endpointRequests, payload);
  }

  async archivePersona(payload: IdentityArchivePersonaPayload): Promise<PersonaArchiveResult> {
    return IdentityTemplateApi.archivePersona(this.endpointRequests, payload);
  }

  async previewCompiledInstructions(
    agentDefinitionId: string,
    apiVersion?: string,
    workspaceContext?: string,
  ): Promise<CompiledInstructionsPreview> {
    return IdentityTemplateApi.previewCompiledInstructions(
      this.endpointRequests,
      agentDefinitionId,
      apiVersion,
      workspaceContext,
    );
  }

  async previewRuntimeSystemPrompt(
    payload: IdentityPreviewRuntimeSystemPromptPayload,
  ): Promise<RuntimeSystemPromptPreview> {
    return IdentityTemplateApi.previewRuntimeSystemPrompt(this.endpointRequests, payload);
  }

  async previewSystemPromptMatrix(
    payload: IdentityPreviewSystemPromptMatrixPayload,
  ): Promise<SystemPromptMatrix> {
    return IdentityTemplateApi.previewSystemPromptMatrix(this.endpointRequests, payload);
  }

  async previewTemplate(payload: SpacePreviewTemplatePayload): Promise<SpacePreviewTemplateResult> {
    return IdentityTemplateApi.previewTemplate(this.endpointRequests, payload);
  }

  async createSpaceFromTemplate(
    payload: SpaceCreateFromTemplatePayload,
  ): Promise<SpaceCreateFromTemplateResult> {
    return IdentityTemplateApi.createSpaceFromTemplate(this.endpointRequests, payload);
  }

  async saveSpaceTemplate(payload: SpaceSaveTemplatePayload): Promise<SpaceSaveTemplateResult> {
    return IdentityTemplateApi.saveSpaceTemplate(this.endpointRequests, payload);
  }

  async listSpaceTemplates(payload: SpaceTemplateListPayload = {}): Promise<SpaceTemplateRecord[]> {
    return IdentityTemplateApi.listSpaceTemplates(this.endpointRequests, payload);
  }

  async getSpaceTemplate(templateId: string, apiVersion?: string): Promise<SpaceTemplateRecord> {
    return IdentityTemplateApi.getSpaceTemplate(this.endpointRequests, templateId, apiVersion);
  }

  async previewSpaceTemplateRecord(
    payload: SpaceTemplatePreviewPayload,
  ): Promise<SpaceTemplatePreviewResult> {
    return IdentityTemplateApi.previewSpaceTemplateRecord(this.endpointRequests, payload);
  }

  async createSpaceFromManagedTemplate(
    payload: SpaceTemplateCreateSpacePayload,
  ): Promise<SpaceTemplateCreateSpaceResult> {
    return IdentityTemplateApi.createSpaceFromManagedTemplate(this.endpointRequests, payload);
  }

  async saveManagedSpaceTemplate(
    payload: SpaceTemplateSavePayload,
  ): Promise<SpaceTemplateSaveResult> {
    return IdentityTemplateApi.saveManagedSpaceTemplate(this.endpointRequests, payload);
  }

  async archiveSpaceTemplate(
    payload: SpaceTemplateArchivePayload,
  ): Promise<SpaceTemplateArchiveResult> {
    return IdentityTemplateApi.archiveSpaceTemplate(this.endpointRequests, payload);
  }

  async registerDevice(payload: AuthRegisterDevicePayload): Promise<AuthRegisterDeviceResult> {
    return GatewayAdminApi.registerDevice(this.endpointRequests, payload);
  }

  async rotateDeviceKey(payload: AuthRotateDeviceKeyPayload): Promise<AuthRotateDeviceKeyResult> {
    return GatewayAdminApi.rotateDeviceKey(this.endpointRequests, payload);
  }

  async revokeDevice(payload: AuthRevokeDevicePayload): Promise<AuthRevokeDeviceResult> {
    return GatewayAdminApi.revokeDevice(this.endpointRequests, payload);
  }

  async listDevices(payload: AuthListDevicesPayload = {}): Promise<DeviceIdentity[]> {
    return GatewayAdminApi.listDevices(this.endpointRequests, payload);
  }

  /**
   * Issue a short-lived signed bearer token for strict HTTP principal auth.
   */
  async issueHttpPrincipalToken(
    payload: AuthIssueHttpPrincipalTokenPayload = {},
  ): Promise<AuthIssueHttpPrincipalTokenResult> {
    return GatewayAdminApi.issueHttpPrincipalToken(this.endpointRequests, payload);
  }

  /**
   * Get persisted usage + budget snapshot.
   */
  async getUsageSnapshot(apiVersion?: string): Promise<UsageSnapshot> {
    return GatewayAdminApi.getUsageSnapshot(this.endpointRequests, apiVersion);
  }

  /**
   * Get local provider telemetry (quota windows + local token/session aggregates).
   */
  async getLocalUsageTelemetry(
    apiVersion?: string,
    providerId?: string,
    providerIds?: string[],
  ): Promise<LocalProviderUsageTelemetry[]> {
    return GatewayAdminApi.getLocalUsageTelemetry(
      this.endpointRequests,
      apiVersion,
      providerId,
      providerIds,
    );
  }

  async getMemoryDefaults(apiVersion?: string): Promise<GatewayMemoryDefaults> {
    return GatewayAdminApi.getMemoryDefaults(this.endpointRequests, apiVersion);
  }

  async setMemoryDefaults(
    defaultExperienceCapture: SpaceExperienceCaptureMode,
    defaultSpacePrivacyMode: SpacePrivacyMode = 'STANDARD',
    apiVersion?: string,
  ): Promise<GatewayMemoryDefaults> {
    return GatewayAdminApi.setMemoryDefaults(
      this.endpointRequests,
      defaultExperienceCapture,
      defaultSpacePrivacyMode,
      apiVersion,
    );
  }

  async listTools(apiVersion?: string): Promise<GatewayTool[]> {
    return GatewayAdminApi.listTools(this.endpointRequests, apiVersion);
  }

  async getTool(
    toolId: string,
    apiVersion?: string,
  ): Promise<GatewayTool | null> {
    return GatewayAdminApi.getTool(this.endpointRequests, toolId, apiVersion);
  }

  async scaffoldTool(
    payload: GatewayScaffoldToolPayload,
  ): Promise<GatewayScaffoldedToolBundle> {
    return GatewayAdminApi.scaffoldTool(this.endpointRequests, payload);
  }

  async registerTool(
    payload: GatewayRegisterToolPayload,
  ): Promise<GatewayTool> {
    return GatewayAdminApi.registerTool(this.endpointRequests, payload);
  }

  async removeTool(
    toolId: string,
    apiVersion?: string,
  ): Promise<boolean> {
    return GatewayAdminApi.removeTool(this.endpointRequests, toolId, apiVersion);
  }

  async listToolApprovalGrants(
    payload: GatewayListToolApprovalGrantsPayload = {},
  ): Promise<GatewayToolApprovalGrant[]> {
    return GatewayAdminApi.listToolApprovalGrants(this.endpointRequests, payload);
  }

  async revokeToolApprovalGrant(
    payload: GatewayRevokeToolApprovalGrantPayload,
  ): Promise<GatewayRevokeToolApprovalGrantResult> {
    return GatewayAdminApi.revokeToolApprovalGrant(this.endpointRequests, payload);
  }

  async getExternalConnectivity(
    apiVersion?: string,
  ): Promise<GatewayGetExternalConnectivityResponsePayload> {
    return GatewayAdminApi.getExternalConnectivity(this.endpointRequests, apiVersion);
  }

  async setExternalConnectivity(
    mode: GatewayExternalConnectivityMode,
    options?: { funnelEnabled?: boolean | null; apiVersion?: string },
  ): Promise<GatewaySetExternalConnectivityResponsePayload> {
    return GatewayAdminApi.setExternalConnectivity(this.endpointRequests, mode, options);
  }

  /**
   * Get current gateway-wide capability/skill policy.
   */
  async getGatewayPolicy(apiVersion?: string): Promise<GatewayPolicy> {
    return GatewayAdminApi.getGatewayPolicy(this.endpointRequests, apiVersion);
  }

  /**
   * Update gateway-wide capability/skill policy.
   */
  async updateGatewayPolicy(
    payload: GatewayPolicyUpdatePayload,
  ): Promise<GatewayPolicy> {
    return GatewayAdminApi.updateGatewayPolicy(this.endpointRequests, payload);
  }

  async factoryResetGateway(
    payload: GatewayFactoryResetPayload,
  ): Promise<GatewayFactoryResetResponsePayload> {
    return GatewayAdminApi.factoryResetGateway(
      this.endpointRequests,
      payload,
      this.minimumRequestTimeout(180_000),
    );
  }

  async resetSpace(
    payload: SpaceResetPayload,
  ): Promise<SpaceResetResponsePayload> {
    return GatewayAdminApi.resetSpace(
      this.endpointRequests,
      payload,
      this.minimumRequestTimeout(180_000),
    );
  }

  async listLibraryEntries(payload: LibraryListEntriesPayload = {}): Promise<LibraryEntry[]> {
    return GatewayAdminApi.listLibraryEntries(this.endpointRequests, payload);
  }

  async getLibraryEntry(
    entryId: string,
    apiVersion?: string,
    includeContent?: boolean,
  ): Promise<LibraryEntry> {
    return GatewayAdminApi.getLibraryEntry(
      this.endpointRequests,
      entryId,
      apiVersion,
      includeContent,
    );
  }

  async saveLibrarySkill(payload: LibrarySaveSkillPayload): Promise<LibrarySaveSkillResponsePayload> {
    return GatewayAdminApi.saveLibrarySkill(this.endpointRequests, payload);
  }

  async importLibraryEntry(
    payload: LibraryImportEntryPayload,
  ): Promise<LibraryImportEntryResponsePayload> {
    return GatewayAdminApi.importLibraryEntry(this.endpointRequests, payload);
  }

  async archiveLibraryEntry(
    payload: LibraryArchiveEntryPayload,
  ): Promise<LibraryArchiveEntryResponsePayload> {
    return GatewayAdminApi.archiveLibraryEntry(this.endpointRequests, payload);
  }

  async setLibraryEntryEnabled(
    payload: LibrarySetEntryEnabledPayload,
  ): Promise<LibraryEntry> {
    return GatewayAdminApi.setLibraryEntryEnabled(this.endpointRequests, payload);
  }

  async deleteLibraryEntry(
    payload: LibraryDeleteEntryPayload,
  ): Promise<LibraryDeleteEntryResponsePayload> {
    return GatewayAdminApi.deleteLibraryEntry(this.endpointRequests, payload);
  }

  async scanLibraryEntries(apiVersion?: string): Promise<LibraryScanEntriesResponsePayload> {
    return GatewayAdminApi.scanLibraryEntries(this.endpointRequests, apiVersion);
  }

  async listSkillDrafts(apiVersion?: string): Promise<SkillDraft[]> {
    return GatewayAdminApi.listSkillDrafts(this.endpointRequests, apiVersion);
  }

  async getSkillDraft(draftId: string, apiVersion?: string): Promise<SkillDraft> {
    return GatewayAdminApi.getSkillDraft(this.endpointRequests, draftId, apiVersion);
  }

  async createSkillDraft(
    payload: LibraryCreateSkillDraftPayload,
  ): Promise<LibraryCreateSkillDraftResponsePayload> {
    return GatewayAdminApi.createSkillDraft(this.endpointRequests, payload);
  }

  async deleteSkillDraft(
    payload: LibraryDeleteSkillDraftPayload,
  ): Promise<LibraryDeleteSkillDraftResponsePayload> {
    return GatewayAdminApi.deleteSkillDraft(this.endpointRequests, payload);
  }

  /**
   * Submit an intent-level orchestrator command.
   */
  async sendOrchestratorCommand(
    payload: OrchestratorCommandPayload,
  ): Promise<OrchestratorCommandResult> {
    return GatewayAdminApi.sendOrchestratorCommand(this.endpointRequests, payload);
  }

  /**
   * Get command lifecycle state by command ID.
   */
  async getOrchestratorCommand(
    commandId: string,
    apiVersion?: string,
  ): Promise<OrchestratorCommandResult> {
    return GatewayAdminApi.getOrchestratorCommand(
      this.endpointRequests,
      commandId,
      apiVersion,
    );
  }

  async createSchedulerJob(payload: SchedulerCreateJobPayload): Promise<SchedulerJob> {
    return SchedulerApi.createSchedulerJob(this.endpointRequests, payload);
  }

  async getSchedulerJob(jobId: string, apiVersion?: string): Promise<SchedulerJob> {
    return SchedulerApi.getSchedulerJob(this.endpointRequests, jobId, apiVersion);
  }

  async listSchedulerJobs(payload: SchedulerListJobsPayload = {}): Promise<SchedulerJob[]> {
    return SchedulerApi.listSchedulerJobs(this.endpointRequests, payload);
  }

  async listSchedulerEvalDefinitions(
    payload: SchedulerListEvalDefinitionsPayload = {},
  ): Promise<SchedulerEvalDefinition[]> {
    return SchedulerApi.listSchedulerEvalDefinitions(this.endpointRequests, payload);
  }

  async updateSchedulerJob(payload: SchedulerUpdateJobPayload): Promise<SchedulerJob> {
    return SchedulerApi.updateSchedulerJob(this.endpointRequests, payload);
  }

  async deleteSchedulerJob(payload: SchedulerDeleteJobPayload): Promise<SchedulerDeleteJobResult> {
    return SchedulerApi.deleteSchedulerJob(this.endpointRequests, payload);
  }

  async linkSchedulerJobSpace(payload: SchedulerLinkSpacePayload): Promise<SchedulerJob> {
    return SchedulerApi.linkSchedulerJobSpace(this.endpointRequests, payload);
  }

  async unlinkSchedulerJobSpace(payload: SchedulerUnlinkSpacePayload): Promise<SchedulerJob> {
    return SchedulerApi.unlinkSchedulerJobSpace(this.endpointRequests, payload);
  }

  async listSchedulerJobRuns(payload: SchedulerListRunsPayload): Promise<SchedulerListRunsResult> {
    return SchedulerApi.listSchedulerJobRuns(this.endpointRequests, payload);
  }

  async runSchedulerJobNow(payload: SchedulerRunNowPayload): Promise<SchedulerRunNowResult> {
    return SchedulerApi.runSchedulerJobNow(this.endpointRequests, payload);
  }

  async listWorkbenchQueue(payload: WorkbenchListQueuePayload = {}): Promise<WorkbenchQueueItem[]> {
    return WorkbenchApi.listWorkbenchQueue(this.endpointRequests, payload);
  }

  async getWorkbenchQueueItem(payload: WorkbenchGetQueueItemPayload): Promise<WorkbenchQueueItem> {
    return WorkbenchApi.getWorkbenchQueueItem(this.endpointRequests, payload);
  }

  async createWorkbenchBatch(payload: WorkbenchCreateBatchPayload): Promise<WorkbenchBatch> {
    return WorkbenchApi.createWorkbenchBatch(this.endpointRequests, payload);
  }

  async listWorkbenchBatches(payload: WorkbenchListBatchesPayload = {}): Promise<WorkbenchBatch[]> {
    return WorkbenchApi.listWorkbenchBatches(this.endpointRequests, payload);
  }

  async updateWorkbenchBatch(payload: WorkbenchUpdateBatchPayload): Promise<WorkbenchBatch> {
    return WorkbenchApi.updateWorkbenchBatch(this.endpointRequests, payload);
  }

  async startWorkbenchRun(payload: WorkbenchStartRunPayload): Promise<WorkbenchRun> {
    return WorkbenchApi.startWorkbenchRun(this.endpointRequests, payload);
  }

  async retryWorkbenchRun(payload: WorkbenchRetryRunPayload): Promise<WorkbenchRun> {
    return WorkbenchApi.retryWorkbenchRun(this.endpointRequests, payload);
  }

  async cancelWorkbenchRun(payload: WorkbenchCancelRunPayload): Promise<WorkbenchRun> {
    return WorkbenchApi.cancelWorkbenchRun(this.endpointRequests, payload);
  }

  async listWorkbenchRuns(payload: WorkbenchListRunsPayload = {}): Promise<WorkbenchRun[]> {
    return WorkbenchApi.listWorkbenchRuns(this.endpointRequests, payload);
  }

  async getWorkbenchRun(payload: WorkbenchGetRunPayload): Promise<WorkbenchRun> {
    return WorkbenchApi.getWorkbenchRun(this.endpointRequests, payload);
  }

  async approveWorkbenchStage(payload: WorkbenchApproveStagePayload): Promise<WorkbenchRun> {
    return WorkbenchApi.approveWorkbenchStage(this.endpointRequests, payload);
  }

  async rejectWorkbenchStage(payload: WorkbenchRejectStagePayload): Promise<WorkbenchRun> {
    return WorkbenchApi.rejectWorkbenchStage(this.endpointRequests, payload);
  }

  async setWorkbenchMode(payload: WorkbenchSetModePayload): Promise<WorkbenchSetModeResult> {
    return WorkbenchApi.setWorkbenchMode(this.endpointRequests, payload);
  }

  async listWorkbenchArtifacts(payload: WorkbenchListArtifactsPayload): Promise<WorkbenchArtifact[]> {
    return WorkbenchApi.listWorkbenchArtifacts(this.endpointRequests, payload);
  }

  async getWorkbenchPolicy(payload: WorkbenchGetPolicyPayload = {}): Promise<WorkbenchPolicy> {
    return WorkbenchApi.getWorkbenchPolicy(this.endpointRequests, payload);
  }

  async updateWorkbenchPolicy(payload: WorkbenchUpdatePolicyPayload): Promise<WorkbenchPolicy> {
    return WorkbenchApi.updateWorkbenchPolicy(this.endpointRequests, payload);
  }

  async linkSpaces(payload: SpaceLinkPayload): Promise<SpaceLinkResult> {
    return SharingSyncSpeechApi.linkSpaces(this.endpointRequests, payload);
  }

  async unlinkSpaces(payload: SpaceUnlinkPayload): Promise<boolean> {
    return SharingSyncSpeechApi.unlinkSpaces(this.endpointRequests, payload);
  }

  async shareSpaceContext(payload: SpaceShareContextPayload): Promise<SharedContextRef> {
    return SharingSyncSpeechApi.shareSpaceContext(this.endpointRequests, payload);
  }

  async pullSharedContext(
    payload: SpacePullSharedContextPayload,
  ): Promise<SpacePullSharedContextResult> {
    return SharingSyncSpeechApi.pullSharedContext(this.endpointRequests, payload);
  }

  async createSpaceShareInvite(payload: SpaceShareCreateInvitePayload): Promise<SpaceShareInvite> {
    return SharingSyncSpeechApi.createSpaceShareInvite(this.endpointRequests, payload);
  }

  async joinSpaceShareInvite(payload: SpaceShareJoinPayload): Promise<SpaceParticipant> {
    return SharingSyncSpeechApi.joinSpaceShareInvite(this.endpointRequests, payload);
  }

  async revokeSpaceShareAccess(payload: SpaceShareRevokePayload): Promise<SpaceShareRevokeResult> {
    return SharingSyncSpeechApi.revokeSpaceShareAccess(this.endpointRequests, payload);
  }

  async listSpaceParticipants(
    payload: SpaceShareListParticipantsPayload,
  ): Promise<SpaceParticipant[]> {
    return SharingSyncSpeechApi.listSpaceParticipants(this.endpointRequests, payload);
  }

  async announceSyncPeer(payload: SyncAnnouncePayload): Promise<SyncAnnounceResult> {
    return SharingSyncSpeechApi.announceSyncPeer(this.endpointRequests, payload);
  }

  async querySyncResources(
    payload: SyncQueryResourcesPayload,
  ): Promise<SyncQueryResourcesResult> {
    return SharingSyncSpeechApi.querySyncResources(this.endpointRequests, payload);
  }

  async pullSyncResources(
    payload: SyncPullResourcesPayload,
  ): Promise<SyncPullResourcesResult> {
    return SharingSyncSpeechApi.pullSyncResources(this.endpointRequests, payload);
  }

  async startSpeechSession(payload: SpeechStartPayload): Promise<SpeechEventPayload> {
    return SharingSyncSpeechApi.startSpeechSession(this.endpointRequests, payload);
  }

  async sendSpeechAudioChunk(payload: SpeechAudioChunkPayload): Promise<SpeechEventPayload[]> {
    return SharingSyncSpeechApi.sendSpeechAudioChunk(this.endpointRequests, payload);
  }

  async controlSpeechSession(payload: SpeechControlPayload): Promise<SpeechEventPayload> {
    return SharingSyncSpeechApi.controlSpeechSession(this.endpointRequests, payload);
  }

  /**
   * Register native adapter providers with the gateway.
   */
  async registerCapabilities(providers: AdapterCapabilityProvider[]): Promise<void> {
    return AdapterApi.registerCapabilities(this.adapterApi, providers);
  }

  /**
   * Deregister native adapter providers from the gateway.
   */
  async deregisterCapabilities(providerIds: string[]): Promise<void> {
    return AdapterApi.deregisterCapabilities(this.adapterApi, providerIds);
  }

  /**
   * Send invocation success for a previously received `capability.invoke`.
   */
  async sendCapabilityResult(payload: AdapterCapabilityResultPayload): Promise<void> {
    return AdapterApi.sendCapabilityResult(this.adapterApi, payload);
  }

  /**
   * Send invocation failure for a previously received `capability.invoke`.
   */
  async sendCapabilityError(payload: AdapterCapabilityErrorPayload): Promise<void> {
    return AdapterApi.sendCapabilityError(this.adapterApi, payload);
  }

  /**
   * Send a direct message to another agent in a space
   */
  async sendAgentMessage(
    spaceId: string,
    fromAgentId: string,
    toAgentId: string,
    content: string,
    spaceUid?: string,
  ): Promise<void> {
    return AdapterApi.sendAgentMessage(
      this.adapterApi,
      spaceId,
      fromAgentId,
      toAgentId,
      content,
      spaceUid,
    );
  }

  /**
   * Poke an idle agent to resume work
   */
  async pokeAgent(
    spaceId: string,
    targetAgentId: string,
    reason: string,
    unblockedByTurnId?: string,
    spaceUid?: string,
  ): Promise<void> {
    return AdapterApi.pokeAgent(
      this.adapterApi,
      spaceId,
      targetAgentId,
      reason,
      unblockedByTurnId,
      spaceUid,
    );
  }

  /**
   * Declare a task dependency between turns
   */
  async declareTaskDependency(
    spaceId: string,
    blockedTurnId: string,
    dependsOnTurnId: string,
    spaceUid?: string,
  ): Promise<void> {
    return AdapterApi.declareTaskDependency(
      this.adapterApi,
      spaceId,
      blockedTurnId,
      dependsOnTurnId,
      spaceUid,
    );
  }

  /**
   * Send a ping to the gateway
   */
  async ping(): Promise<void> {
    return AdapterApi.ping(this.adapterApi);
  }

  /**
   * Subscribe to turn events
   */
  onTurnEvent(handler: TurnEventHandler): UnsubscribeHandler {
    return this.events.subscribe('turnEventHandlers', handler);
  }

  /**
   * Subscribe to turn stream events
   */
  onTurnStream(handler: TurnStreamHandler): UnsubscribeHandler {
    return this.events.subscribe('turnStreamHandlers', handler);
  }

  /**
   * Subscribe to space state updates
   */
  onSpaceState(handler: SpaceStateHandler): UnsubscribeHandler {
    return this.events.subscribe('spaceStateHandlers', handler);
  }

  /**
   * Subscribe to profile-swap events for space agent assignments.
   */
  onSpaceAgentUpdated(handler: SpaceAgentUpdatedHandler): UnsubscribeHandler {
    return this.events.subscribe('spaceAgentUpdatedHandlers', handler);
  }

  /**
   * Subscribe to notifications
   */
  onNotification(handler: NotificationHandler): UnsubscribeHandler {
    return this.events.subscribe('notificationHandlers', handler);
  }

  /**
   * Subscribe to error events
   */
  onError(handler: ErrorHandler): UnsubscribeHandler {
    return this.events.subscribe('errorHandlers', handler);
  }

  /**
   * Subscribe to inter-agent messages
   */
  onAgentMessage(handler: AgentMessageHandler): UnsubscribeHandler {
    return this.events.subscribe('agentMessageHandlers', handler);
  }

  /**
   * Subscribe to agent poke events
   */
  onAgentPoke(handler: AgentPokeHandler): UnsubscribeHandler {
    return this.events.subscribe('agentPokeHandlers', handler);
  }

  /**
   * Subscribe to agent idle notifications
   */
  onAgentIdle(handler: AgentIdleHandler): UnsubscribeHandler {
    return this.events.subscribe('agentIdleHandlers', handler);
  }

  /**
   * Subscribe to task dependency declarations
   */
  onTaskDependency(handler: TaskDependencyHandler): UnsubscribeHandler {
    return this.events.subscribe('taskDependencyHandlers', handler);
  }

  /**
   * Subscribe to task dependency resolved notifications
   */
  onTaskDependencyResolved(handler: TaskDependencyResolvedHandler): UnsubscribeHandler {
    return this.events.subscribe('taskDependencyResolvedHandlers', handler);
  }

  /**
   * Subscribe to orchestrator command lifecycle events.
   */
  onOrchestratorEvent(handler: OrchestratorEventHandler): UnsubscribeHandler {
    return this.events.subscribe('orchestratorEventHandlers', handler);
  }

  /**
   * Subscribe to speech session events.
   */
  onSpeechEvent(handler: SpeechEventHandler): UnsubscribeHandler {
    return this.events.subscribe('speechEventHandlers', handler);
  }

  /**
   * Subscribe to adapter capability invocation requests.
   */
  onCapabilityInvoke(handler: CapabilityInvokeHandler): UnsubscribeHandler {
    return this.events.subscribe('capabilityInvokeHandlers', handler);
  }

  private minimumRequestTimeout(minimumMs: number): number {
    return Math.max(this.requestTimeoutMs, minimumMs);
  }
}

export default GatewayClient;
