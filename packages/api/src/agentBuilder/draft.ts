import { z } from 'zod';
import { tool } from '@librechat/agents/langchain/tools';
import { Run, Providers } from '@librechat/agents';
import { AIMessage, HumanMessage } from '@librechat/agents/langchain/messages';
import type {
  AgentBuilderTool,
  AgentBuilderDraft,
  AgentBuilderCurrent,
  AgentBuilderMessage,
  AgentBuilderResponse,
} from 'librechat-data-provider';
import type { BaseMessage } from '@librechat/agents/langchain/messages';
import type { DynamicStructuredTool } from '@librechat/agents/langchain/tools';
import type { LLMConfig } from '@librechat/agents';
import type { AgentBuilderOptions } from './options';
import { applyTestRunHook } from '~/agents/testHook';

export const CONFIGURE_AGENT_TOOL = 'configure_agent';

const NAME_MAX_CHARS = 256;
const DESCRIPTION_MAX_CHARS = 512;
/** Limits of the builder request: a drafted reply or instructions must fit the next request. */
export const BUILDER_MESSAGE_MAX_CHARS = 8000;
export const BUILDER_INSTRUCTIONS_MAX_CHARS = 32000;

const TOOL_DESCRIPTIONS: Record<AgentBuilderTool, string> = {
  web_search: 'ricerca sul web, per informazioni aggiornate o fonti esterne',
  execute_code:
    'esecuzione di codice, per calcoli, analisi di dati, file Excel/CSV, grafici e documenti generati',
};

/** Arguments of `configure_agent` as the model sends them, before they are checked. */
export interface RawAgentDraft {
  reply?: string;
  name?: string;
  description?: string;
  instructions?: string;
  category?: string;
  model?: string;
  tools?: string[];
}

export class AgentBuilderError extends Error {
  constructor(
    message: string,
    readonly code: 'no_draft',
  ) {
    super(message);
    this.name = 'AgentBuilderError';
  }
}

function oneOf(values: string[], description: string) {
  const [first, ...rest] = values;
  return first == null
    ? z.string().describe(description)
    : z.enum([first, ...rest]).describe(description);
}

function bulletList(lines: string[]): string {
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join('\n') : '- (nessuno)';
}

function describeCategory({
  value,
  label,
  description,
}: AgentBuilderOptions['categories'][number]) {
  const readableLabel = label.startsWith('com_') ? '' : ` (${label})`;
  return `${value}${readableLabel}${description && !description.startsWith('com_') ? `: ${description}` : ''}`;
}

/** The builder's system prompt: who it serves, what it may pick, and the form as it stands. */
export function buildBuilderInstructions(
  options: AgentBuilderOptions,
  current?: AgentBuilderCurrent,
): string {
  const sections = [
    `Sei l'assistente di SimpleAI che crea agenti AI per persone non tecniche. L'utente descrive a parole cosa vuole che l'agente faccia; tu prepari tutta la configurazione al posto suo.`,
    `A ogni messaggio chiama una sola volta lo strumento \`${CONFIGURE_AGENT_TOOL}\` con la configurazione COMPLETA, non solo i campi cambiati: se l'utente chiede una modifica, riporta invariato tutto il resto della configurazione attuale.`,
    `Come compilare i campi:
- name: breve e chiaro, al massimo 40 caratteri.
- description: una frase che spiega a cosa serve l'agente, al massimo 200 caratteri.
- instructions: il prompt di sistema dell'agente, in seconda persona ("Sei…"), nella lingua dell'utente. Struttura: ruolo, compiti, come deve lavorare passo per passo, tono e formato delle risposte, cosa non deve fare. Sii concreto e completo: è la parte più importante.
- category: la categoria più adatta.
- model: il modello più economico in grado di svolgere bene il compito.
- tools: solo gli strumenti davvero necessari, altrimenti nessuno.
- reply: un messaggio breve per l'utente, nella sua lingua, che riassume cosa hai impostato. Se la richiesta è vaga, prepara comunque una bozza ragionevole e chiudi la reply con UNA domanda per migliorarla.`,
    `Modelli disponibili:\n${bulletList(options.models.map(({ spec, description }) => `${spec}: ${description}`))}`,
    `Strumenti disponibili:\n${bulletList(options.tools.map((key) => `${key}: ${TOOL_DESCRIPTIONS[key]}`))}`,
    `Categorie disponibili:\n${bulletList(options.categories.map(describeCategory))}`,
  ];

  if (current != null) {
    sections.push(`Configurazione attuale dell'agente:\n${JSON.stringify(current, null, 2)}`);
  }
  return sections.join('\n\n');
}

export function createConfigureAgentTool(
  options: AgentBuilderOptions,
  onDraft: (draft: RawAgentDraft) => void,
): DynamicStructuredTool {
  return tool(
    async (args) => {
      onDraft(args);
      return "Configurazione applicata al modulo dell'agente.";
    },
    {
      name: CONFIGURE_AGENT_TOOL,
      description: "Applica la configurazione completa dell'agente al modulo dell'utente.",
      schema: z.object({
        reply: z.string().describe("Messaggio breve per l'utente su cosa hai impostato"),
        name: z.string().describe("Nome dell'agente"),
        description: z.string().describe("Descrizione in una frase dell'agente"),
        instructions: z.string().describe("Istruzioni (prompt di sistema) dell'agente"),
        category: oneOf(
          options.categories.map(({ value }) => value),
          "Categoria dell'agente",
        ).optional(),
        model: oneOf(
          options.models.map(({ spec }) => spec),
          "Modello che l'agente userà",
        ).optional(),
        tools: z
          .array(oneOf(options.tools, 'Strumento da attivare'))
          .describe("Strumenti da attivare per l'agente"),
      }),
    },
  ) as DynamicStructuredTool;
}

function clip(text: string | undefined, maxChars?: number): string | undefined {
  const trimmed = text?.trim();
  if (!trimmed) {
    return undefined;
  }
  return maxChars != null ? trimmed.slice(0, maxChars) : trimmed;
}

/** Keeps only what the form can take: unknown categories, models and tools are dropped. */
export function sanitizeDraft(
  raw: RawAgentDraft,
  options: AgentBuilderOptions,
): AgentBuilderResponse {
  const categories = new Set(options.categories.map(({ value }) => value));
  const models = new Map(options.models.map((option) => [option.spec, option]));
  const chosenTools = new Set(raw.tools);
  const chosenModel = raw.model != null ? models.get(raw.model) : undefined;

  const draft: AgentBuilderDraft = {
    name: clip(raw.name, NAME_MAX_CHARS),
    description: clip(raw.description, DESCRIPTION_MAX_CHARS),
    instructions: clip(raw.instructions, BUILDER_INSTRUCTIONS_MAX_CHARS),
    category: raw.category != null && categories.has(raw.category) ? raw.category : undefined,
    provider: chosenModel?.provider,
    model: chosenModel?.model,
    tools: options.tools.filter((key) => chosenTools.has(key)),
  };

  return {
    reply:
      clip(raw.reply, BUILDER_MESSAGE_MAX_CHARS) ?? "Ho preparato la configurazione dell'agente.",
    draft,
  };
}

export function toBuilderMessages(messages: AgentBuilderMessage[]): BaseMessage[] {
  return messages.map(({ role, text }) =>
    role === 'user' ? new HumanMessage(text) : new AIMessage(text),
  );
}

export interface GenerateAgentDraftParams {
  llmConfig: LLMConfig;
  messages: AgentBuilderMessage[];
  current?: AgentBuilderCurrent;
  options: AgentBuilderOptions;
  runId: string;
  userId: string;
}

/**
 * Asks the configured model for a complete agent configuration through the `configure_agent`
 * tool, so the answer arrives structured on every provider that supports tool calls.
 */
export async function generateAgentDraft({
  llmConfig,
  messages,
  current,
  options,
  runId,
  userId,
}: GenerateAgentDraftParams): Promise<AgentBuilderResponse> {
  let rawDraft: RawAgentDraft | undefined;
  const configureTool = createConfigureAgentTool(options, (draft) => {
    rawDraft = draft;
  });
  const instructions = buildBuilderInstructions(options, current);

  /** Bedrock's Converse API takes no system prompt ahead of the first user turn. */
  const isBedrock = llmConfig.provider === Providers.BEDROCK;
  const builderMessages = toBuilderMessages(messages);
  const inputMessages = isBedrock
    ? [
        new HumanMessage(`${instructions}\n\n${messages[0]?.text ?? ''}`),
        ...builderMessages.slice(1),
      ]
    : builderMessages;

  const run = await Run.create({
    runId,
    graphConfig: {
      type: 'standard',
      llmConfig: { ...llmConfig, streaming: false, disableStreaming: true } as LLMConfig,
      tools: [configureTool],
      instructions: isBedrock ? undefined : instructions,
      toolEnd: true,
    },
    returnContent: true,
  });
  applyTestRunHook(run, { messages: inputMessages, agents: [{ tools: [configureTool] }] });

  await run.processStream(
    { messages: inputMessages },
    {
      runName: 'AgentBuilderRun',
      configurable: { user_id: userId, thread_id: runId, provider: llmConfig.provider },
      recursionLimit: 4,
      version: 'v2',
    },
  );

  if (rawDraft == null) {
    throw new AgentBuilderError('The model answered without configuring the agent', 'no_draft');
  }
  return sanitizeDraft(rawDraft, options);
}
