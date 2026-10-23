import type { TModelRouterConfig } from 'librechat-data-provider';
import type { JevQuestion, JevResponse } from './jev';

export const MODEL_QUESTION = 'model';

const DEFAULT_MODEL_INSTRUCTIONS =
  "Quale modello deve rispondere all'ultimo messaggio dell'utente? Scegli il modello più " +
  'economico in grado di rispondere bene, considerando anche i messaggi precedenti.';

export type RouterFallbackReason =
  | 'missing_api_key'
  | 'request_failed'
  | 'invalid_answer'
  | 'low_confidence'
  | 'unknown_spec';

export interface RouterDecision {
  spec: string;
  tools: string[];
  confidence?: number;
  probabilities?: Record<string, number>;
  toolProbabilities?: Record<string, number>;
  fallbackReason?: RouterFallbackReason;
  jevModel?: string;
  inputTokens?: number;
}

/** Question names stay within letters, digits and underscores whatever the tool key holds. */
export function toolQuestionName(toolKey: string): string {
  return `tool_${toolKey.replace(/[^a-zA-Z0-9_]/g, '_')}`;
}

export function buildRouterQuestions(
  config: TModelRouterConfig,
  toolKeys: string[],
): Record<string, JevQuestion> {
  const toolQuestions = Object.fromEntries(
    toolKeys.map((key): [string, JevQuestion] => [
      toolQuestionName(key),
      {
        type: 'noul',
        instructions: `Per rispondere all'ultimo messaggio dell'utente serve questo strumento? ${config.tools?.[key] ?? key}`,
      },
    ]),
  );

  return {
    [MODEL_QUESTION]: {
      type: 'choice',
      instructions: config.instructions ?? DEFAULT_MODEL_INSTRUCTIONS,
      criteria: config.candidates,
    },
    ...toolQuestions,
  };
}

export function fallbackDecision(
  config: TModelRouterConfig,
  reason: RouterFallbackReason,
): RouterDecision {
  return { spec: config.fallback, tools: [], fallbackReason: reason };
}

/**
 * Maps Jev's answers onto a spec and the tools to switch on. An answer outside the configured
 * candidates, or one below `minConfidence`, degrades to the fallback spec; tool answers are
 * kept either way, since they were judged independently of the model choice.
 */
export function resolveRouterDecision(
  config: TModelRouterConfig,
  response: JevResponse,
  toolKeys: string[],
): RouterDecision {
  const toolProbabilities = Object.fromEntries(
    toolKeys.flatMap((key): [string, number][] => {
      const answer = response.answers?.[toolQuestionName(key)];
      return answer?.type === 'noul' ? [[key, answer.noul]] : [];
    }),
  );
  const tools = Object.entries(toolProbabilities)
    .filter(([, probability]) => probability >= config.toolThreshold)
    .map(([key]) => key);
  const usage = { jevModel: response.model, inputTokens: response.usage?.input_tokens };

  const answer = response.answers?.[MODEL_QUESTION];
  if (answer?.type !== 'choice' || !(answer.choice in config.candidates)) {
    return { ...fallbackDecision(config, 'invalid_answer'), tools, toolProbabilities, ...usage };
  }

  const scored = {
    confidence: answer.confidence,
    probabilities: answer.probabilities,
    tools,
    toolProbabilities,
    ...usage,
  };
  if (answer.confidence < config.minConfidence) {
    return { ...scored, spec: config.fallback, fallbackReason: 'low_confidence' };
  }
  return { ...scored, spec: answer.choice };
}
