import { logger } from '@librechat/data-schemas';
import { Constants } from 'librechat-data-provider';
import type { TModelRouterConfig, TModelSpec } from 'librechat-data-provider';
import type { CreateRouterDecisionData } from '@librechat/data-schemas';
import type { NextFunction, Response } from 'express';
import type { ModelRouterBody, RouterConversationFields } from './apply';
import type { RouterHistoryMessage } from './state';
import type { RouterDecision } from './decide';
import { applyRouterDecision, getRoutableTools, getRouterConversationFields } from './apply';
import { buildRouterQuestions, fallbackDecision, resolveRouterDecision } from './decide';
import { buildRouterState } from './state';
import { callJev, JevRequestError } from './jev';

export interface ModelRouterState {
  conversation: RouterConversationFields;
  decision: RouterDecision;
}

export interface ModelRouterRequestBody extends ModelRouterBody {
  text?: string;
  conversationId?: string | null;
  parentMessageId?: string | null;
  compact?: boolean;
}

export interface ModelRouterRequest {
  path: string;
  user?: { id?: string };
  config?: { modelSpecs?: { list?: TModelSpec[] } };
  body?: ModelRouterRequestBody;
  modelRouter?: ModelRouterState;
}

export interface ModelRouterDeps {
  getMessages: (
    filter: { conversationId: string; user: string },
    select: string,
  ) => Promise<RouterHistoryMessage[]>;
  createRouterDecision: (data: CreateRouterDecisionData) => Promise<unknown>;
  apiKey?: string;
  fetchFn?: typeof fetch;
}

const HISTORY_FIELDS = 'messageId parentMessageId isCreatedByUser text content';

function isStoredConversation(conversationId?: string | null): conversationId is string {
  return (
    typeof conversationId === 'string' &&
    conversationId !== '' &&
    conversationId !== Constants.NEW_CONVO
  );
}

async function loadHistory(
  deps: ModelRouterDeps,
  userId: string,
  conversationId?: string | null,
): Promise<RouterHistoryMessage[]> {
  if (!isStoredConversation(conversationId)) {
    return [];
  }
  try {
    return await deps.getMessages({ conversationId, user: userId }, HISTORY_FIELDS);
  } catch (error) {
    logger.warn('[modelRouter] History unavailable, routing on the new message alone', error);
    return [];
  }
}

async function decide(
  config: TModelRouterConfig,
  body: ModelRouterRequestBody,
  userId: string,
  deps: ModelRouterDeps,
): Promise<RouterDecision> {
  if (!deps.apiKey) {
    return fallbackDecision(config, 'missing_api_key');
  }

  const toolKeys = getRoutableTools(config, body.ephemeralAgent);
  const history = await loadHistory(deps, userId, body.conversationId);
  const state = buildRouterState({
    history,
    parentMessageId: body.parentMessageId,
    text: body.text ?? '',
    historyMessages: config.historyMessages,
    maxMessageChars: config.maxMessageChars,
  });

  try {
    const response = await callJev({
      baseURL: config.baseURL,
      apiKey: deps.apiKey,
      model: config.model,
      state,
      questions: buildRouterQuestions(config, toolKeys),
      timeoutMs: config.timeoutMs,
      fetchFn: deps.fetchFn,
    });
    return resolveRouterDecision(config, response, toolKeys);
  } catch (error) {
    logger.warn('[modelRouter] Jev unavailable, using the fallback spec', {
      status: error instanceof JevRequestError ? error.status : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
    return fallbackDecision(config, 'request_failed');
  }
}

function findRouterSpec(req: ModelRouterRequest): TModelSpec | undefined {
  const specName = req.body?.spec;
  if (!specName) {
    return undefined;
  }
  return req.config?.modelSpecs?.list?.find(
    (spec) => spec.name === specName && spec.router != null,
  );
}

function resolveTarget(
  specsByName: Map<string, TModelSpec>,
  config: TModelRouterConfig,
  decision: RouterDecision,
): { target?: TModelSpec; decision: RouterDecision } {
  const chosen = specsByName.get(decision.spec);
  if (chosen != null && chosen.router == null) {
    return { target: chosen, decision };
  }
  return {
    target: specsByName.get(config.fallback),
    decision: { ...decision, spec: config.fallback, fallbackReason: 'unknown_spec' },
  };
}

async function routeRequest(
  req: ModelRouterRequest,
  res: Pick<Response, 'once'>,
  deps: ModelRouterDeps,
): Promise<void> {
  const body = req.body;
  const userId = req.user?.id;
  const routerSpec = findRouterSpec(req);
  if (
    body == null ||
    userId == null ||
    routerSpec?.router == null ||
    req.path === '/resume' ||
    body.compact === true
  ) {
    return;
  }

  const config = routerSpec.router;
  const startedAt = Date.now();
  const specsByName = new Map((req.config?.modelSpecs?.list ?? []).map((s) => [s.name, s]));
  const { target, decision } = resolveTarget(
    specsByName,
    config,
    await decide(config, body, userId, deps),
  );
  if (target == null) {
    logger.error(`[modelRouter] Fallback spec "${config.fallback}" is not in modelSpecs.list`);
    return;
  }

  applyRouterDecision(body, target, decision.tools);
  req.modelRouter = { conversation: getRouterConversationFields(routerSpec), decision };
  const latencyMs = Date.now() - startedAt;

  /** A new conversation only gets its id from the controller, so the record waits for it. */
  res.once('close', () => {
    deps
      .createRouterDecision({
        user: userId,
        conversationId: isStoredConversation(body.conversationId) ? body.conversationId : undefined,
        routerSpec: routerSpec.name,
        spec: target.name,
        endpoint: target.preset.endpoint ?? undefined,
        model: target.preset.model ?? undefined,
        tools: decision.tools,
        confidence: decision.confidence,
        probabilities: decision.probabilities,
        toolProbabilities: decision.toolProbabilities,
        fallbackReason: decision.fallbackReason,
        jevModel: decision.jevModel,
        inputTokens: decision.inputTokens,
        latencyMs,
      })
      .catch((error: unknown) => logger.error('[modelRouter] Failed to store the decision', error));
  });
}

/**
 * Express middleware for the "automatic" model spec: asks Jev which configured spec should
 * answer, then rewrites the request as if the user had picked it. Never blocks the turn: any
 * failure leaves the request on the fallback spec, or untouched if even that is misconfigured.
 */
export function createModelRouter(deps: ModelRouterDeps) {
  return async (req: ModelRouterRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await routeRequest(req, res, deps);
    } catch (error) {
      logger.error('[modelRouter] Routing failed, continuing without it', error);
    }
    next();
  };
}
