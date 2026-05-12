/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export type WorkbenchExecutionMode = 'supervised' | 'autonomous';
export type WorkbenchBatchStatus = 'draft' | 'queued' | 'running' | 'completed' | 'cancelled';
export type WorkbenchRunStatus = 'queued' | 'awaiting_review' | 'running' | 'completed' | 'failed' | 'cancelled';
export type WorkbenchRunStage = 'intake' | 'plan' | 'execute' | 'verify' | 'review_gate' | 'land' | 'report';
export type WorkbenchApprovalState = 'pending' | 'approved' | 'rejected' | 'not_required';
export type WorkbenchVerificationMode = 'machine_readable' | 'review_only';
export type WorkbenchVerificationSuiteStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export type WorkbenchVerificationResultStatus = 'pending' | 'passed' | 'failed';
export type WorkbenchLandingStatus = 'not_started' | 'blocked' | 'landed';
export type WorkbenchExecutionContextStage = 'planning' | 'implementation' | 'verification' | 'completed' | 'failed' | 'paused';

export interface WorkbenchExecutionModeEligibility {
  supervised: boolean;
  autonomous: boolean;
}

export interface WorkbenchQueueItem {
  queueItemId: string;
  queueIndex: number;
  title: string;
  type: string;
  status: string;
  nextAction: string;
  taskFilePath: string;
  delegation: string;
  parallelKeys: string[];
  aiShippable: boolean;
  executionModeEligibility: WorkbenchExecutionModeEligibility;
  verificationMode: WorkbenchVerificationMode;
  executionModeBlockers: string[];
  products: string[];
  verificationCommands: string[];
}

export interface WorkbenchBatch {
  batchId: string;
  name: string;
  status: WorkbenchBatchStatus;
  executionMode: WorkbenchExecutionMode;
  queueItemIds: string[];
  createdByPrincipalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchWorktreeRef {
  path: string;
  branchName: string;
  baseBranchName: string;
  createdAt: string;
}

export interface WorkbenchRepoTouch {
  repoId: string;
  repoPath: string;
  kind: 'meta' | 'submodule';
  committed: boolean;
}

export interface WorkbenchVerificationSuite {
  suiteId: string;
  name: string;
  command: string;
  status: WorkbenchVerificationSuiteStatus;
  startedAt?: string;
  completedAt?: string;
  exitCode?: number;
  durationMs?: number;
  logArtifactId?: string;
  summary?: string;
}

export interface WorkbenchVerificationResult {
  status: WorkbenchVerificationResultStatus;
  summary?: string;
  completedAt?: string;
}

export interface WorkbenchLandingResult {
  status: WorkbenchLandingStatus;
  merged?: boolean;
  summary?: string;
  completedAt?: string;
}

export interface WorkbenchExecutionContext {
  spaceId: string;
  spaceUid?: string;
  spaceName: string;
  planningTurnId?: string;
  implementationTurnId?: string;
  stage: WorkbenchExecutionContextStage;
}

export interface WorkbenchRun {
  runId: string;
  batchId?: string;
  queueItemId: string;
  queueItemPath: string;
  status: WorkbenchRunStatus;
  currentStage: WorkbenchRunStage;
  executionMode: WorkbenchExecutionMode;
  approvalState: WorkbenchApprovalState;
  worktree?: WorkbenchWorktreeRef;
  touchedRepos: WorkbenchRepoTouch[];
  verificationMode: WorkbenchVerificationMode;
  executionModeBlockers: string[];
  verificationSuites: WorkbenchVerificationSuite[];
  verificationResult?: WorkbenchVerificationResult;
  landingResult?: WorkbenchLandingResult;
  executionContext?: WorkbenchExecutionContext;
  createdByPrincipalId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
}

export interface WorkbenchArtifact {
  artifactId: string;
  runId: string;
  kind: string;
  title: string;
  contentType: string;
  contentText: string;
  createdAt: string;
}

export interface WorkbenchPolicy {
  defaultExecutionMode: WorkbenchExecutionMode;
  autonomousEnabled: boolean;
  maxParallelRuns: number;
  requireExplicitAutonomousOptIn: boolean;
  requireAiShippableForAutonomous: boolean;
  updatedAt: string;
}

export interface WorkbenchListQueuePayload {
  apiVersion?: string;
  limit?: number;
}

export interface WorkbenchGetQueueItemPayload {
  apiVersion?: string;
  queueItemId: string;
}

export interface WorkbenchCreateBatchPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  name: string;
  queueItemIds: string[];
  executionMode?: WorkbenchExecutionMode;
}

export interface WorkbenchListBatchesPayload {
  apiVersion?: string;
  limit?: number;
}

export interface WorkbenchUpdateBatchPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  batchId: string;
  name?: string;
  queueItemIds?: string[];
  executionMode?: WorkbenchExecutionMode;
  status?: WorkbenchBatchStatus;
}

export interface WorkbenchStartRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  queueItemId: string;
  batchId?: string;
  executionMode?: WorkbenchExecutionMode;
}

export interface WorkbenchRetryRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
}

export interface WorkbenchCancelRunPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
}

export interface WorkbenchListRunsPayload {
  apiVersion?: string;
  batchId?: string;
  queueItemId?: string;
  limit?: number;
}

export interface WorkbenchGetRunPayload {
  apiVersion?: string;
  runId: string;
}

export interface WorkbenchApproveStagePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
  stage?: WorkbenchRunStage;
}

export interface WorkbenchRejectStagePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId: string;
  stage?: WorkbenchRunStage;
  reason?: string;
}

export interface WorkbenchSetModePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  runId?: string;
  batchId?: string;
  executionMode: WorkbenchExecutionMode;
}

export interface WorkbenchSetModeResult {
  run?: WorkbenchRun;
  batch?: WorkbenchBatch;
}

export interface WorkbenchListArtifactsPayload {
  apiVersion?: string;
  runId: string;
}

export interface WorkbenchGetPolicyPayload {
  apiVersion?: string;
}

export interface WorkbenchUpdatePolicyPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  defaultExecutionMode?: WorkbenchExecutionMode;
  autonomousEnabled?: boolean;
  maxParallelRuns?: number;
  requireExplicitAutonomousOptIn?: boolean;
  requireAiShippableForAutonomous?: boolean;
}
