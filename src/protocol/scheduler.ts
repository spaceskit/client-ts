/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export type SchedulerJobStatus = 'active' | 'paused' | 'invalid';
export type SchedulerRunStatus = 'running' | 'completed' | 'failed' | 'skipped';
export type SchedulerRunTrigger = 'scheduled' | 'manual';
export type SchedulerScheduleKind = 'hourly' | 'daily' | 'weekly';
export type SchedulerActionType = 'space_prompt';
export type SchedulerExecutionTargetMode = 'existing_space' | 'new_space';
export type SchedulerCalendarSyncStatus = 'pending' | 'synced' | 'error';
export type SchedulerCalendarDriftStatus = 'none' | 'drifted';
export type SchedulerEvalSummaryMode = 'checkpoints' | 'final_summary';
export type SchedulerEvalRecommendationStatus = 'suggested' | 'applied';
export type SchedulerEvalRecommendationKind = 'flow_variant' | 'prompt_pack' | 'summary_mode';
export type SchedulerEvalScenarioStatus = 'pass' | 'fail' | 'skip';
export type SchedulerEvalCheckpointStatus = 'completed' | 'failed' | 'observed';

export interface SchedulerSchedulePreset {
  kind: SchedulerScheduleKind;
  intervalHours?: number;
  minute: number;
  hour?: number;
  daysOfWeek?: number[];
}

export interface SchedulerAction {
  type: SchedulerActionType;
  promptText: string;
  targetAgentId?: string;
}

export interface SchedulerExecutionTarget {
  mode: SchedulerExecutionTargetMode;
}

export interface SchedulerCalendarBinding {
  providerId: string;
  calendarId: string;
  eventId?: string;
  syncStatus?: SchedulerCalendarSyncStatus;
  driftStatus?: SchedulerCalendarDriftStatus;
  driftMessage?: string;
  lastSyncedAt?: string;
}

export interface SchedulerEvalConfig {
  evalDefinitionId: string;
  scenarioIds?: string[];
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  summaryMode?: SchedulerEvalSummaryMode;
  selfImproveEnabled?: boolean;
}

export interface SchedulerEvalSelfImproveState {
  enabled: boolean;
  appliedRevisionIds: string[];
  lastAppliedRunId?: string;
}

export interface SchedulerEvalCheckpoint {
  checkpointId: string;
  kind: string;
  status: SchedulerEvalCheckpointStatus;
  actorId?: string;
  createdAt: string;
  detail?: Record<string, unknown>;
}

export interface SchedulerEvalRecommendation {
  recommendationId: string;
  status: SchedulerEvalRecommendationStatus;
  kind: SchedulerEvalRecommendationKind;
  title: string;
  summary?: string;
  originatingRunId?: string;
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  appliedRevisionId?: string;
  createdAt: string;
  detail?: Record<string, unknown>;
}

export interface SchedulerEvalScenarioResult {
  scenarioId: string;
  status: SchedulerEvalScenarioStatus;
  checkpointCount: number;
  failureReason?: string;
}

export interface SchedulerEvalArtifactRef {
  kind: 'space' | 'turn' | 'scheduler_run';
  id: string;
  label?: string;
}

export interface SchedulerEvalRun {
  evalRunId: string;
  evalDefinitionId: string;
  scenarioIds: string[];
  promptVariantId?: string;
  promptPackId?: string;
  flowVariantId?: string;
  summaryMode: SchedulerEvalSummaryMode;
  selfImproveEnabled: boolean;
  spaceId?: string;
  spaceUid?: string;
  rootTurnId?: string;
  finalSummaryText?: string;
  artifactRefs: SchedulerEvalArtifactRef[];
  checkpoints: SchedulerEvalCheckpoint[];
  scenarioResults: SchedulerEvalScenarioResult[];
  recommendations: SchedulerEvalRecommendation[];
}

export interface SchedulerEvalDomain {
  domainId: string;
  description?: string;
  scenarioIds: string[];
}

export interface SchedulerEvalDefinition {
  evalDefinitionId: string;
  suiteId: string;
  description?: string;
  domainIds: string[];
  scenarioIds: string[];
  domains: SchedulerEvalDomain[];
}

export interface SchedulerLinkedSpace {
  spaceId: string;
  spaceUid: string;
  name: string;
  isPrimary: boolean;
  linkedAt: string;
}

export interface SchedulerJob {
  jobId: string;
  name: string;
  status: SchedulerJobStatus;
  enabled: boolean;
  cronExpression: string;
  schedulePreset: SchedulerSchedulePreset;
  timezone: string;
  action: SchedulerAction;
  primarySpaceId?: string;
  invalidReason?: string;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: SchedulerRunStatus;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdByPrincipalId: string;
  createdAt: string;
  updatedAt: string;
  linkedSpaces: SchedulerLinkedSpace[];
  executionTarget: SchedulerExecutionTarget;
  calendarBinding?: SchedulerCalendarBinding;
  evalConfig?: SchedulerEvalConfig;
  evalSelfImproveState?: SchedulerEvalSelfImproveState;
}

export interface SchedulerJobRun {
  runId: string;
  jobId: string;
  trigger: SchedulerRunTrigger;
  status: SchedulerRunStatus;
  commandId?: string;
  scheduledFor?: string;
  startedAt?: string;
  finishedAt?: string;
  skipReason?: string;
  errorCode?: string;
  errorMessage?: string;
  result?: Record<string, unknown>;
  evalRun?: SchedulerEvalRun;
}

export interface SchedulerCreateJobPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  name: string;
  timezone: string;
  schedulePreset: SchedulerSchedulePreset;
  action: SchedulerAction;
  primarySpaceId: string;
  relatedSpaceIds?: string[];
  executionTarget?: SchedulerExecutionTarget;
  calendarBinding?: SchedulerCalendarBinding;
  evalConfig?: SchedulerEvalConfig;
}

export interface SchedulerGetJobPayload {
  apiVersion?: string;
  jobId: string;
}

export interface SchedulerListJobsPayload {
  apiVersion?: string;
  statuses?: SchedulerJobStatus[];
  gatewayId?: string;
  limit?: number;
}

export interface SchedulerUpdateJobPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  jobId: string;
  name?: string;
  status?: SchedulerJobStatus;
  timezone?: string;
  schedulePreset?: SchedulerSchedulePreset;
  action?: SchedulerAction;
  primarySpaceId?: string | null;
  relatedSpaceIds?: string[];
  executionTarget?: SchedulerExecutionTarget;
  calendarBinding?: SchedulerCalendarBinding | null;
  evalConfig?: SchedulerEvalConfig | null;
}

export interface SchedulerDeleteJobPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  jobId: string;
}

export interface SchedulerDeleteJobResult {
  jobId: string;
  deleted: boolean;
}

export interface SchedulerLinkSpacePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  jobId: string;
  spaceId: string;
}

export interface SchedulerUnlinkSpacePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  jobId: string;
  spaceId: string;
}

export interface SchedulerListRunsPayload {
  apiVersion?: string;
  jobId: string;
  limit?: number;
  offset?: number;
}

export interface SchedulerListRunsResult {
  runs: SchedulerJobRun[];
  total: number;
  nextOffset?: number;
}

export interface SchedulerListEvalDefinitionsPayload {
  apiVersion?: string;
}

export interface SchedulerListEvalDefinitionsResult {
  definitions: SchedulerEvalDefinition[];
}

export interface SchedulerRunNowPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  jobId: string;
}

export interface SchedulerRunNowResult {
  run: SchedulerJobRun;
  job: SchedulerJob;
}
