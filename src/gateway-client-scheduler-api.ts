import type {
  SchedulerCreateJobPayload,
  SchedulerDeleteJobPayload,
  SchedulerDeleteJobResult,
  SchedulerEvalDefinition,
  SchedulerGetJobPayload,
  SchedulerJob,
  SchedulerLinkSpacePayload,
  SchedulerListEvalDefinitionsPayload,
  SchedulerListEvalDefinitionsResult,
  SchedulerListJobsPayload,
  SchedulerListRunsPayload,
  SchedulerListRunsResult,
  SchedulerRunNowPayload,
  SchedulerRunNowResult,
  SchedulerUnlinkSpacePayload,
  SchedulerUpdateJobPayload,
} from "./gateway-protocol.js";
import type { GatewayClientRequestInvoker } from "./gateway-client-request.js";

export function createSchedulerJob(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerCreateJobPayload,
): Promise<SchedulerJob> {
  return requests.requestField<SchedulerCreateJobPayload, { job: SchedulerJob }, 'job'>(
    'scheduler.create_job',
    payload,
    'job',
  );
}

export function getSchedulerJob(
  requests: GatewayClientRequestInvoker,
  jobId: string,
  apiVersion?: string,
): Promise<SchedulerJob> {
  const payload: SchedulerGetJobPayload = { apiVersion, jobId };
  return requests.requestField<SchedulerGetJobPayload, { job: SchedulerJob }, 'job'>(
    'scheduler.get_job',
    payload,
    'job',
  );
}

export function listSchedulerJobs(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerListJobsPayload = {},
): Promise<SchedulerJob[]> {
  return requests.requestField<SchedulerListJobsPayload, { jobs: SchedulerJob[] }, 'jobs'>(
    'scheduler.list_jobs',
    payload,
    'jobs',
  );
}

export function listSchedulerEvalDefinitions(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerListEvalDefinitionsPayload = {},
): Promise<SchedulerEvalDefinition[]> {
  return requests.requestField<
    SchedulerListEvalDefinitionsPayload,
    SchedulerListEvalDefinitionsResult,
    'definitions'
  >('scheduler.list_eval_definitions', payload, 'definitions');
}

export function updateSchedulerJob(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerUpdateJobPayload,
): Promise<SchedulerJob> {
  return requests.requestField<SchedulerUpdateJobPayload, { job: SchedulerJob }, 'job'>(
    'scheduler.update_job',
    payload,
    'job',
  );
}

export function deleteSchedulerJob(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerDeleteJobPayload,
): Promise<SchedulerDeleteJobResult> {
  return requests.request<SchedulerDeleteJobPayload, SchedulerDeleteJobResult>(
    'scheduler.delete_job',
    payload,
  );
}

export function linkSchedulerJobSpace(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerLinkSpacePayload,
): Promise<SchedulerJob> {
  return requests.requestField<SchedulerLinkSpacePayload, { job: SchedulerJob }, 'job'>(
    'scheduler.link_space',
    payload,
    'job',
  );
}

export function unlinkSchedulerJobSpace(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerUnlinkSpacePayload,
): Promise<SchedulerJob> {
  return requests.requestField<SchedulerUnlinkSpacePayload, { job: SchedulerJob }, 'job'>(
    'scheduler.unlink_space',
    payload,
    'job',
  );
}

export function listSchedulerJobRuns(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerListRunsPayload,
): Promise<SchedulerListRunsResult> {
  return requests.request<SchedulerListRunsPayload, SchedulerListRunsResult>(
    'scheduler.list_runs',
    payload,
  );
}

export function runSchedulerJobNow(
  requests: GatewayClientRequestInvoker,
  payload: SchedulerRunNowPayload,
): Promise<SchedulerRunNowResult> {
  return requests.request<SchedulerRunNowPayload, SchedulerRunNowResult>(
    'scheduler.run_now',
    payload,
  );
}
