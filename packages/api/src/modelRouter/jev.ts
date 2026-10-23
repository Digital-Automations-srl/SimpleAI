export interface JevChoiceQuestion {
  type: 'choice';
  instructions?: string;
  criteria: Record<string, string | null>;
}

export interface JevNoulQuestion {
  type: 'noul';
  instructions?: string;
  criteria?: { true?: string; false?: string };
}

export type JevQuestion = JevChoiceQuestion | JevNoulQuestion;

export interface JevChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface JevNoulAnswer {
  type: 'noul';
  noul: number;
}

export type JevAnswer = JevChoiceAnswer | JevNoulAnswer;

export interface JevResponse {
  model: string;
  answers: Record<string, JevAnswer>;
  usage?: { input_tokens: number; output_tokens: number };
}

export interface RouterStateMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface JevState {
  conversation: RouterStateMessage[];
}

export interface CallJevParams {
  baseURL: string;
  apiKey: string;
  model: string;
  state: JevState;
  questions: Record<string, JevQuestion>;
  timeoutMs: number;
  fetchFn?: typeof fetch;
}

export class JevRequestError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'JevRequestError';
  }
}

/** Calls TypeSafe's decision endpoint; throws on non-2xx, timeout, or network failure. */
export async function callJev({
  baseURL,
  apiKey,
  model,
  state,
  questions,
  timeoutMs,
  fetchFn = fetch,
}: CallJevParams): Promise<JevResponse> {
  const response = await fetchFn(`${baseURL.replace(/\/+$/, '')}/v1/systemone`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, state, questions }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new JevRequestError(`Jev request failed with status ${response.status}`, response.status);
  }

  return (await response.json()) as JevResponse;
}
