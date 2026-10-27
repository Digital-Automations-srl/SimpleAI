const FALLBACK_STATUSES = new Set([429, 529]);
const FALLBACK_TYPES = new Set(['overloaded_error', 'rate_limit_error']);
const FALLBACK_MESSAGE = /rate limit|overloaded/i;
const REASONING_TYPES = new Set(['thinking', 'reasoning', 'reasoning_content']);

type StartHandler = (
  llm?: unknown,
  messages?: unknown,
  runId?: string,
  parentRunId?: string,
) => void;
type TokenHandler = (
  token: string,
  idx?: unknown,
  runId?: string,
  parentRunId?: string,
  tags?: string[],
  fields?: { chunk?: unknown },
) => void;
type ErrorHandler = (error: unknown, runId?: string, parentRunId?: string) => void;

export interface PrimaryFallbackCallback {
  readonly name: 'simpleai-model-fallback-primary';
  readonly awaitHandlers: true;
  readonly handleChatModelStart: StartHandler;
  readonly handleLLMNewToken: TokenHandler;
  readonly handleLLMError: ErrorHandler;
}

export interface FallbackEntryCallback {
  readonly name: 'simpleai-model-fallback-entry';
  readonly awaitHandlers: true;
  readonly raiseError: true;
  readonly handleChatModelStart: StartHandler;
  readonly handleLLMNewToken: TokenHandler;
  readonly handleLLMError: ErrorHandler;
  readonly handleLLMEnd: () => void;
}

export interface ModelFallbackGate {
  readonly primaryCallback: PrimaryFallbackCallback;
  readonly fallbackCallback: (model: string) => FallbackEntryCallback;
  /** Fallback models that completed a call, in order, without duplicates. */
  readonly getServedModels: () => string[];
}

/** One primary model call and the fallbacks tried for it. */
interface CallState {
  failed: boolean;
  primaryError?: unknown;
  emitted: boolean;
}

function readStatus(error: object): number | undefined {
  const { status, statusCode, response } = error as {
    status?: unknown;
    statusCode?: unknown;
    response?: { status?: unknown };
  };
  const candidate = status ?? statusCode ?? response?.status;
  return typeof candidate === 'number' ? candidate : undefined;
}

function readType(error: object): unknown {
  const { type, error: inner } = error as { type?: unknown; error?: { type?: unknown } };
  return type ?? inner?.type;
}

/** Only failures another model can solve: rate limits, overload and provider-side errors. */
export function isFallbackEligibleError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }
  const status = readStatus(error);
  if (status != null && (FALLBACK_STATUSES.has(status) || status >= 500)) {
    return true;
  }
  const type = readType(error);
  if (typeof type === 'string' && FALLBACK_TYPES.has(type)) {
    return true;
  }
  const { message } = error as { message?: unknown };
  return typeof message === 'string' && FALLBACK_MESSAGE.test(message);
}

function hasReasoning(content: unknown): boolean {
  return (
    Array.isArray(content) &&
    content.some((part: { type?: string; thinking?: unknown; reasoning?: unknown }) =>
      REASONING_TYPES.has(part?.type ?? '') ? Boolean(part.thinking ?? part.reasoning) : false,
    )
  );
}

/**
 * Output the user sees: text, a tool call or reasoning. Providers also stream empty tokens for
 * the message start or the role, which show nothing and must not prevent a fallback.
 */
function isVisibleOutput(token: string, fields?: { chunk?: unknown }): boolean {
  if (token !== '') {
    return true;
  }
  const message = (fields?.chunk as { message?: Record<string, unknown> } | undefined)?.message;
  const toolCallChunks = message?.tool_call_chunks;
  const kwargs = message?.additional_kwargs as Record<string, unknown> | undefined;
  return (
    (Array.isArray(toolCallChunks) && toolCallChunks.length > 0) ||
    hasReasoning(message?.content) ||
    Boolean(kwargs?.reasoning_content ?? kwargs?.reasoning)
  );
}

/**
 * Decides, for each fallback attempt `@librechat/agents` makes, whether it may run. The library
 * tries its fallbacks on any failure; the entry callback raises the primary's error at start when
 * that error is not eligible or output already reached the user, so the chain ends with it.
 * State is kept per parent run, so concurrent model calls of the same agent stay apart.
 */
export function createModelFallbackGate(): ModelFallbackGate {
  const calls = new Map<string, CallState>();
  let latest: CallState | undefined;
  const served = new Set<string>();

  const callFor = (parentRunId?: string): CallState => {
    const key = parentRunId ?? '';
    const existing = calls.get(key);
    if (existing) {
      return existing;
    }
    const created: CallState = { failed: false, emitted: false };
    calls.set(key, created);
    return created;
  };
  const attemptFor = (parentRunId?: string): CallState | undefined =>
    calls.get(parentRunId ?? '') ?? latest;

  const primaryCallback: PrimaryFallbackCallback = {
    name: 'simpleai-model-fallback-primary',
    awaitHandlers: true,
    handleChatModelStart(_llm, _messages, _runId, parentRunId) {
      latest = { failed: false, emitted: false };
      calls.set(parentRunId ?? '', latest);
    },
    handleLLMNewToken(token, _idx, _runId, parentRunId, _tags, fields) {
      if (isVisibleOutput(token, fields)) {
        callFor(parentRunId).emitted = true;
      }
    },
    handleLLMError(error, _runId, parentRunId) {
      const call = callFor(parentRunId);
      call.failed = true;
      call.primaryError = error;
      latest = call;
    },
  };

  const fallbackCallback = (model: string): FallbackEntryCallback => {
    const callback: FallbackEntryCallback = {
      name: 'simpleai-model-fallback-entry',
      awaitHandlers: true,
      raiseError: true,
      handleChatModelStart(_llm, _messages, _runId, parentRunId) {
        const call = attemptFor(parentRunId);
        if (call?.failed !== true) {
          return;
        }
        if (call.emitted || !isFallbackEligibleError(call.primaryError)) {
          throw call.primaryError ?? new Error('Model fallback blocked');
        }
      },
      handleLLMNewToken(token, _idx, _runId, parentRunId, _tags, fields) {
        const call = attemptFor(parentRunId);
        if (call && isVisibleOutput(token, fields)) {
          call.emitted = true;
        }
      },
      handleLLMError() {
        /** A fallback failing for its own reasons leaves the decision to the primary's error. */
      },
      handleLLMEnd() {
        served.add(model);
      },
    };
    return Object.freeze(callback);
  };

  return Object.freeze({
    primaryCallback: Object.freeze(primaryCallback),
    fallbackCallback,
    getServedModels: () => [...served],
  });
}
