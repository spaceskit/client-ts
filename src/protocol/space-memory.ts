/**
 * Protocol payload and event contracts extracted from gateway-client.ts.
 */
export interface SpaceExperienceRecord {
  experienceId: string;
  spaceId: string;
  title?: string;
  summary?: string;
  observationSummary?: string;
  status?: string;
  sourceTurnId?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListExperiencesPayload {
  apiVersion?: string;
  spaceId: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListExperiencesResponsePayload {
  experiences: SpaceExperienceRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetExperiencePayload {
  apiVersion?: string;
  spaceId: string;
  experienceId: string;
}

export interface SpaceGetExperienceResponsePayload {
  experience: SpaceExperienceRecord;
}

export interface SpacePersonalityInsightRecord {
  insightId: string;
  spaceId: string;
  experienceId?: string;
  agentId?: string;
  title?: string;
  summary?: string;
  rationale?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  dismissedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListInsightsPayload {
  apiVersion?: string;
  spaceId: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListInsightsResponsePayload {
  insights: SpacePersonalityInsightRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceGetInsightPayload {
  apiVersion?: string;
  spaceId: string;
  insightId: string;
}

export interface SpaceGetInsightResponsePayload {
  insight: SpacePersonalityInsightRecord;
}

export interface SpaceAcceptInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  notes?: string;
}

export interface SpaceRejectInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  reason?: string;
}

export interface SpaceDismissInsightPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  insightId: string;
  reason?: string;
}

export interface SpaceInsightActionResponsePayload {
  insight: SpacePersonalityInsightRecord;
}

export interface SpaceAgentNotesRecord {
  spaceId: string;
  agentId: string;
  notes: string;
  updatedAt: string;
  createdAt?: string;
}

export interface SpaceGetSpaceAgentNotesPayload {
  apiVersion?: string;
  spaceId: string;
  agentId: string;
}

export interface SpaceUpdateSpaceAgentNotesPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  agentId: string;
  notes: string;
}

export interface SpaceAgentNotesResponsePayload {
  notes?: SpaceAgentNotesRecord | null;
}

export interface SpaceUserProfileRecord {
  principalId: string;
  displayName?: string;
  summary?: string;
  facts: string[];
  preferences: string[];
  corrections: string[];
  metadata?: Record<string, unknown>;
  updatedAt: string;
  createdAt?: string;
}

export interface SpaceGetUserProfilePayload {
  apiVersion?: string;
  principalId?: string;
}

export interface SpaceUpdateUserProfilePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  principalId?: string;
  displayName?: string;
  summary?: string;
  facts?: string[];
  preferences?: string[];
  corrections?: string[];
  metadata?: Record<string, unknown>;
}

export interface SpaceUserProfileResponsePayload {
  profile?: SpaceUserProfileRecord | null;
}

export interface SpaceMemoryRecord {
  memoryId: string;
  spaceId: string;
  principalId?: string;
  sourceType?: string;
  sourceId?: string;
  status?: string;
  scopeType?: string;
  scopeId?: string;
  category?: string;
  textPreview?: string;
  importance?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SpaceListMemoriesPayload {
  apiVersion?: string;
  spaceId: string;
  principalId?: string;
  sourceType?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface SpaceListMemoriesResponsePayload {
  memories: SpaceMemoryRecord[];
  total: number;
  nextOffset?: number;
}

export interface SpaceDeleteMemoryPayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  memoryId: string;
}

export interface SpaceDeleteMemoryResponsePayload {
  deleted: boolean;
  memoryId: string;
}

export interface SpaceUpdateMemoryImportancePayload {
  apiVersion?: string;
  idempotencyKey?: string;
  spaceId: string;
  memoryId: string;
  importance: number;
}

export interface SpaceUpdateMemoryImportanceResponsePayload {
  memory: SpaceMemoryRecord;
}
