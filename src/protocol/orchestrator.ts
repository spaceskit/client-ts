/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export interface OrchestratorCommandPayload {
  apiVersion?: string;
  correlationId?: string;
  idempotencyKey?: string;
  commandType: 'list_spaces' | 'create_space' | 'list_skills' | 'create_skill' | 'handoff_space' | 'add_agent' | 'share_context' | 'run_space_prompt';
  targetSpaceId?: string;
  targetAgentId?: string;
  payload?: Record<string, unknown>;
}

export interface OrchestratorCommandEvent {
  status: 'accepted' | 'running' | 'completed' | 'failed';
  event: Record<string, unknown>;
  createdAt: string;
}

export interface OrchestratorCommandResult {
  commandId: string;
  correlationId: string;
  apiVersion: string;
  commandType: string;
  targetSpaceId: string;
  targetAgentId?: string;
  status: 'accepted' | 'running' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  error?: { code: string; message: string };
  createdAt: string;
  updatedAt: string;
  events: OrchestratorCommandEvent[];
}

export interface OrchestratorSummaryParticipant {
  agentId: string;
  turnOrder: number;
  isPrimary: boolean;
  status: 'pending' | 'completed' | 'failed';
  promptTokens: number;
  completionTokens: number;
  finalMessage?: string;
  error?: string;
}

export interface OrchestratorSummaryHighlight {
  agentId: string;
  eventType: 'text_delta' | 'turn_completed' | 'error' | 'feedback_requested';
  text: string;
  timestamp: string;
}

export interface OrchestratorSummaryArtifact {
  summaryId: string;
  version: string;
  spaceId: string;
  turnId: string;
  turnModel: string;
  generatedAt: string;
  status: 'completed' | 'degraded';
  failureReason?: string;
  participants: OrchestratorSummaryParticipant[];
  highlights: OrchestratorSummaryHighlight[];
  finalSummaryText: string;
}

export interface OrchestratorEventPayload {
  commandId: string;
  correlationId: string;
  status: 'accepted' | 'running' | 'completed' | 'failed';
  event: Record<string, unknown>;
  createdAt: string;
  eventType?: string;
  spaceId?: string;
  spaceUid?: string;
  turnId?: string;
}
