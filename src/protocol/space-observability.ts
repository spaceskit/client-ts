/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export interface SpaceListOrchestrationJournalPayload {
  apiVersion?: string;
  spaceId?: string;
  spaceUid?: string;
  turnId?: string;
  limit?: number;
  offset?: number;
}

export interface OrchestrationJournalEntry {
  eventId: string;
  spaceId: string;
  spaceUid: string;
  turnId?: string;
  seq: number;
  eventType: string;
  actorId: string;
  lineageId?: string;
  hopCount: number;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface SpaceListOrchestrationJournalResponsePayload {
  spaceId: string;
  spaceUid: string;
  entries: OrchestrationJournalEntry[];
  total: number;
  nextOffset?: number;
}

export interface SpaceListActivityLogPayload {
  apiVersion?: string;
  spaceId?: string;
  spaceUid?: string;
  turnId?: string;
  includeSystem?: boolean;
  limit?: number;
  offset?: number;
}

export interface SpaceActivityLogEntry {
  entryId: string;
  source: string;
  category: string;
  turnId?: string;
  rootTurnId?: string;
  summaryTurnId?: string;
  agentId?: string;
  actorId?: string;
  eventType: string;
  title: string;
  detail?: string;
  status?: string;
  visibility: string;
  toolCallId?: string;
  toolName?: string;
  createdAt: string;
  seq: number;
  payload: Record<string, unknown>;
}

export interface SpaceListActivityLogResponsePayload {
  spaceId: string;
  spaceUid: string;
  entries: SpaceActivityLogEntry[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetTurnTracePayload {
  apiVersion?: string;
  spaceId: string;
  turnId: string;
  limit?: number;
  offset?: number;
}

export interface SpaceTurnTraceEvent {
  eventId: string;
  seq: number;
  eventType: string;
  eventSubtype?: string;
  agentId?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface SpaceTurnTraceToolCall {
  toolCallId: string;
  toolName?: string;
  status: string;
  agentId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SpaceTurnTraceActivity {
  activityId: string;
  seq: number;
  eventType: string;
  agentId?: string;
  title: string;
  detail?: string;
  status?: string;
  visibility: string;
  toolCallId?: string;
  toolName?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface SpaceTurnTraceExecutionRun {
  executionId: string;
  stepIndex: number;
  agentId?: string;
  providerId?: string;
  modelId?: string;
  status: 'running' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  workingDirectory?: string;
  exitCode?: number;
  commandPreview?: string;
  transcriptArtifactId?: string;
  transcriptTruncated: boolean;
}

export interface SpaceTurnTrace {
  spaceId: string;
  turnId: string;
  total: number;
  events: SpaceTurnTraceEvent[];
  toolCalls: SpaceTurnTraceToolCall[];
  activities: SpaceTurnTraceActivity[];
  executionRuns: SpaceTurnTraceExecutionRun[];
  artifactIds: string[];
}

export interface SpaceGetTurnTraceResponsePayload {
  trace: SpaceTurnTrace;
}

export interface SpaceGetArtifactPayload {
  apiVersion?: string;
  spaceId: string;
  artifactId: string;
}

export interface SpaceGetDebugArtifactPayload {
  apiVersion?: string;
  spaceId: string;
  artifactId: string;
}

export interface SpaceArtifactSummary {
  artifactId: string;
  spaceId: string;
  turnId?: string;
  agentId?: string;
  type: string;
  title: string;
  mimeType?: string;
  sizeBytes: number;
  tags: string[];
  visibility: 'shared' | 'private';
  createdAt: string;
  updatedAt: string;
}

export interface SpaceArtifactDetail extends SpaceArtifactSummary {
  content: string | Record<string, unknown>;
}

export interface SpaceListArtifactsPayload {
  apiVersion?: string;
  spaceId: string;
  turnId?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListArtifactsResponsePayload {
  artifacts: SpaceArtifactSummary[];
  total: number;
}

export interface SpaceGetArtifactResponsePayload {
  artifact: SpaceArtifactDetail;
}

export interface SpaceGetDebugArtifactResponsePayload {
  artifact: SpaceArtifactDetail;
}
