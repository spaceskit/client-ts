import type {
  SpaceTurnTrace,
  TurnEventPayload,
  TurnStreamPayload,
  TypedTurnEventPayload,
} from "./gateway-protocol.js";

type UnknownRecord = Record<string, unknown>;

export function normalizeTurnEventPayload(
  payload: TurnEventPayload | UnknownRecord,
): TurnEventPayload {
  const candidate = payload as UnknownRecord;
  const spaceId = pickNonEmptyString(candidate.spaceId)
    ?? pickNonEmptyString(candidate.spaceUid)
    ?? "unknown-space";
  const spaceUid = pickNonEmptyString(candidate.spaceUid) ?? spaceId;
  const turnId = pickNonEmptyString(candidate.turnId) ?? "";

  const explicitEventType = pickNonEmptyString(candidate.eventType);
  const nestedEvent = readRecord(candidate.event) ?? readRecord(candidate.data);
  const nestedEventType = pickNonEmptyString(nestedEvent?.type);
  const mappedEventType = explicitEventType
    ?? mapNestedTurnEventType(nestedEventType)
    ?? "streaming";

  const data = candidate.data ?? candidate.event ?? null;

  const rootTurnId = pickNonEmptyString(candidate.rootTurnId);
  const agentId = pickNonEmptyString(candidate.agentId);
  const conversationTopology = pickNonEmptyString(candidate.conversationTopology) as TurnEventPayload["conversationTopology"];
  const transcriptVisibility = pickNonEmptyString(candidate.transcriptVisibility) as TurnEventPayload["transcriptVisibility"];
  const typedPayload = candidate.typedPayload
    && typeof candidate.typedPayload === "object"
    && "kind" in (candidate.typedPayload as UnknownRecord)
    ? candidate.typedPayload as TypedTurnEventPayload
    : undefined;
  const ts = pickNonEmptyString(candidate.ts);

  return {
    spaceId,
    spaceUid,
    turnId,
    rootTurnId,
    agentId,
    conversationTopology,
    transcriptVisibility,
    eventType: mappedEventType,
    data,
    typedPayload,
    ts,
  };
}

export function normalizeTurnStreamPayload(
  payload: TurnStreamPayload | UnknownRecord,
): TurnStreamPayload | null {
  const candidate = payload as UnknownRecord;
  const spaceId = pickNonEmptyString(candidate.spaceId)
    ?? pickNonEmptyString(candidate.spaceUid)
    ?? "unknown-space";
  const spaceUid = pickNonEmptyString(candidate.spaceUid) ?? spaceId;
  const turnId = pickNonEmptyString(candidate.turnId) ?? "";

  const nestedEvent = readRecord(candidate.event);
  const nestedType = pickNonEmptyString(nestedEvent?.type);
  const explicitDelta = typeof candidate.delta === "string" ? candidate.delta : undefined;
  const nestedDelta = typeof nestedEvent?.text === "string" ? nestedEvent.text : undefined;
  const delta = explicitDelta ?? (nestedType === "text_delta" ? nestedDelta : undefined);
  if (typeof delta !== "string") {
    return null;
  }

  const agentId = pickNonEmptyString(candidate.agentId)
    ?? pickNonEmptyString(nestedEvent?.agentId)
    ?? "unknown-agent";
  const rootTurnId = pickNonEmptyString(candidate.rootTurnId);
  const conversationTopology = pickNonEmptyString(candidate.conversationTopology) as TurnStreamPayload["conversationTopology"];
  const transcriptVisibility = pickNonEmptyString(candidate.transcriptVisibility) as TurnStreamPayload["transcriptVisibility"];
  const summaryTurnId = pickNonEmptyString(candidate.summaryTurnId);
  const streamKind = pickNonEmptyString(candidate.streamKind) as TurnStreamPayload["streamKind"];
  const seq = coerceInteger(candidate.seq ?? nestedEvent?.seq, 0);
  const done = coerceBoolean(candidate.done ?? nestedEvent?.done, false);

  return {
    spaceId,
    spaceUid,
    turnId,
    rootTurnId,
    agentId,
    conversationTopology,
    transcriptVisibility,
    summaryTurnId,
    streamKind,
    delta,
    seq,
    done,
  };
}

export function normalizeSpaceTurnTrace(trace: SpaceTurnTrace): SpaceTurnTrace {
  return {
    ...trace,
    events: Array.isArray(trace.events) ? trace.events : [],
    toolCalls: Array.isArray(trace.toolCalls) ? trace.toolCalls : [],
    activities: Array.isArray(trace.activities) ? trace.activities : [],
    executionRuns: Array.isArray(trace.executionRuns) ? trace.executionRuns : [],
    artifactIds: Array.isArray(trace.artifactIds) ? trace.artifactIds : [],
  };
}

function mapNestedTurnEventType(typeRaw?: string): string | undefined {
  const type = typeRaw?.trim().toLowerCase();
  switch (type) {
    case "text_delta":
      return "streaming";
    case "tool_call":
    case "tool_call_start":
    case "tool_result":
      return "tool_call";
    case "feedback_requested":
      return "feedback_requested";
    case "turn_completed":
      return "completed";
    case "error":
      return "failed";
    default:
      return undefined;
  }
}

function pickNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function readRecord(value: unknown): UnknownRecord | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as UnknownRecord;
}

function coerceInteger(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return fallback;
}
