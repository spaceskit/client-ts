import type {
  WorkbenchApproveStagePayload,
  WorkbenchArtifact,
  WorkbenchBatch,
  WorkbenchCancelRunPayload,
  WorkbenchCreateBatchPayload,
  WorkbenchGetPolicyPayload,
  WorkbenchGetQueueItemPayload,
  WorkbenchGetRunPayload,
  WorkbenchListArtifactsPayload,
  WorkbenchListBatchesPayload,
  WorkbenchListQueuePayload,
  WorkbenchListRunsPayload,
  WorkbenchPolicy,
  WorkbenchQueueItem,
  WorkbenchRejectStagePayload,
  WorkbenchRetryRunPayload,
  WorkbenchRun,
  WorkbenchSetModePayload,
  WorkbenchSetModeResult,
  WorkbenchStartRunPayload,
  WorkbenchUpdateBatchPayload,
  WorkbenchUpdatePolicyPayload,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function listWorkbenchQueue(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchListQueuePayload = {},
): Promise<WorkbenchQueueItem[]> {
  return requests.requestField<WorkbenchListQueuePayload, { items: WorkbenchQueueItem[] }, 'items'>(
    'workbench.list_queue',
    payload,
    'items',
  );
}

export function getWorkbenchQueueItem(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchGetQueueItemPayload,
): Promise<WorkbenchQueueItem> {
  return requests.requestField<WorkbenchGetQueueItemPayload, { item: WorkbenchQueueItem }, 'item'>(
    'workbench.get_queue_item',
    payload,
    'item',
  );
}

export function createWorkbenchBatch(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchCreateBatchPayload,
): Promise<WorkbenchBatch> {
  return requests.requestField<WorkbenchCreateBatchPayload, { batch: WorkbenchBatch }, 'batch'>(
    'workbench.create_batch',
    payload,
    'batch',
  );
}

export function listWorkbenchBatches(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchListBatchesPayload = {},
): Promise<WorkbenchBatch[]> {
  return requests.requestField<WorkbenchListBatchesPayload, { batches: WorkbenchBatch[] }, 'batches'>(
    'workbench.list_batches',
    payload,
    'batches',
  );
}

export function updateWorkbenchBatch(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchUpdateBatchPayload,
): Promise<WorkbenchBatch> {
  return requests.requestField<WorkbenchUpdateBatchPayload, { batch: WorkbenchBatch }, 'batch'>(
    'workbench.update_batch',
    payload,
    'batch',
  );
}

export function startWorkbenchRun(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchStartRunPayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchStartRunPayload, { run: WorkbenchRun }, 'run'>(
    'workbench.start_run',
    payload,
    'run',
  );
}

export function retryWorkbenchRun(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchRetryRunPayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchRetryRunPayload, { run: WorkbenchRun }, 'run'>(
    'workbench.retry_run',
    payload,
    'run',
  );
}

export function cancelWorkbenchRun(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchCancelRunPayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchCancelRunPayload, { run: WorkbenchRun }, 'run'>(
    'workbench.cancel_run',
    payload,
    'run',
  );
}

export function listWorkbenchRuns(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchListRunsPayload = {},
): Promise<WorkbenchRun[]> {
  return requests.requestField<WorkbenchListRunsPayload, { runs: WorkbenchRun[] }, 'runs'>(
    'workbench.list_runs',
    payload,
    'runs',
  );
}

export function getWorkbenchRun(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchGetRunPayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchGetRunPayload, { run: WorkbenchRun }, 'run'>(
    'workbench.get_run',
    payload,
    'run',
  );
}

export function approveWorkbenchStage(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchApproveStagePayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchApproveStagePayload, { run: WorkbenchRun }, 'run'>(
    'workbench.approve_stage',
    payload,
    'run',
  );
}

export function rejectWorkbenchStage(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchRejectStagePayload,
): Promise<WorkbenchRun> {
  return requests.requestField<WorkbenchRejectStagePayload, { run: WorkbenchRun }, 'run'>(
    'workbench.reject_stage',
    payload,
    'run',
  );
}

export function setWorkbenchMode(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchSetModePayload,
): Promise<WorkbenchSetModeResult> {
  return requests.request<WorkbenchSetModePayload, WorkbenchSetModeResult>(
    'workbench.set_mode',
    payload,
  );
}

export function listWorkbenchArtifacts(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchListArtifactsPayload,
): Promise<WorkbenchArtifact[]> {
  return requests.requestField<
    WorkbenchListArtifactsPayload,
    { artifacts: WorkbenchArtifact[] },
    'artifacts'
  >('workbench.list_artifacts', payload, 'artifacts');
}

export function getWorkbenchPolicy(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchGetPolicyPayload = {},
): Promise<WorkbenchPolicy> {
  return requests.requestField<WorkbenchGetPolicyPayload, { policy: WorkbenchPolicy }, 'policy'>(
    'workbench.get_policy',
    payload,
    'policy',
  );
}

export function updateWorkbenchPolicy(
  requests: GatewayClientRequestInvoker,
  payload: WorkbenchUpdatePolicyPayload,
): Promise<WorkbenchPolicy> {
  return requests.requestField<
    WorkbenchUpdatePolicyPayload,
    { policy: WorkbenchPolicy },
    'policy'
  >('workbench.update_policy', payload, 'policy');
}
