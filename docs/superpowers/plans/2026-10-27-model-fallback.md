# Ripiego automatico su un altro modello — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** quando una chiamata al modello fallisce per quota, sovraccarico o 5xx prima di aver mandato testo, la stessa chiamata passa a un altro modello (stessa fascia, poi superiore) e sotto la risposta compare una nota.

**Architecture:** la libreria `@librechat/agents` 4.0.1 ha già `clientOptions.fallbacks` (provati da `Graph` via `tryFallbackProviders` sulla stessa chiamata). Un modulo nuovo `packages/api/src/modelFallback/` calcola la catena dalle fasce dello yaml, costruisce le `FallbackConfig` in `initializeAgent` e installa un "cancello" (callback LangChain): sul primario registra errore e token emessi; su ogni voce di riserva, a `handleChatModelStart`, rilancia l'errore originale se non è ripiegabile o se testo è già uscito (con `raiseError: true` l'eccezione blocca la voce, e `tryFallbackProviders` finisce rilanciando proprio quell'errore). Il cancello registra quali modelli di riserva hanno risposto; l'`AgentClient` lo scrive in `responseMessage.metadata.modelFallback` e il client mostra la nota.

**Tech Stack:** TypeScript (`packages/api`, `packages/data-provider`), JS minimo in `/api`, React (`client`), Jest, Playwright (mock).

**Spec:** `docs/superpowers/specs/2026-10-27-model-fallback-design.md`

## Global Constraints

- Codice nuovo in TypeScript in `packages/api/src/modelFallback/`; in `/api` solo agganci di poche righe.
- Niente `any`, niente import dinamici; import ordinati come da `CLAUDE.md`.
- Config yaml: blocco top-level `modelFallback.tiers`, array di fasce dal più basso al più alto, ogni fascia array di `name` di model spec. Senza blocco → funzione spenta.
- Ripiego solo per errori con status 429, 529, ≥500, o tipo/messaggio "overloaded"/"rate limit"; mai per 400/401/403/404/413/422 né per overflow di contesto.
- Ripiego solo se la chiamata fallita non ha emesso token (`handleLLMNewToken` mai chiamato, anche con stringa vuota).
- Ordine catena: stessa fascia (provider diverso dal primario prima, poi ordine yaml), poi fasce superiori una per volta con lo stesso criterio; mai fasce inferiori; il primario escluso.
- Voce di riserva: `model_parameters` dal `preset` della sua spec; istruzioni/strumenti/allegati dell'agente invariati.
- Ripiego cross-provider sempre ammesso.
- Nota (en, chiave `com_ui_model_fallback_note`): `Answered by {{0}}: {{1}} was temporarily unavailable.`; nomi = `label` della spec il cui `preset.model` combacia, altrimenti id del modello.
- Testi UI solo via `useLocalize()`; aggiornare solo `client/src/locales/en/translation.json`.
- Test nello stesso commit; non toccare i retry interni dei client (`maxRetries`).
- Non committare né pushare senza OK esplicito di Marco: ogni step "Commit" significa *preparare* il commit e chiedere.

## Review Focus

1. Errore a metà stream (testo già mostrato) → nessun ripiego, l'utente vede l'errore come oggi, nessun testo duplicato. Test in Task 3.
2. Prima voce di riserva che fallisce anche lei (429 su due Azure) → si prova la seconda; se anche quella ha già emesso testo, stop. Test in Task 3.
3. Modello primario non presente in nessuna fascia, o yaml senza `modelFallback` → `llmConfig.fallbacks` assente, comportamento identico a oggi. Test in Task 2 e Task 4.
4. Voce di riserva con endpoint non configurato (chiave mancante) → saltata con log, le altre restano. Test in Task 4.
5. Turno senza ripiego → nessun `metadata.modelFallback`, nessuna nota (anche ricaricando la conversazione). Test in Task 5 e Task 6.

---

### Task 1: Schema yaml `modelFallback`

**Files:**
- Modify: `packages/data-provider/src/config.ts` (accanto ad `agentBuilderSchema`, ~riga 3128, e in `configSchema`)
- Test: `packages/data-provider/specs/config-schemas.spec.ts`

**Interfaces:**
- Produces: `modelFallbackSchema`, `type TModelFallbackConfig = { tiers: string[][] }`, `type TModelFallbackMeta = { from: string; to: string[] }` (esportati da `librechat-data-provider`); `configSchema.modelFallback` opzionale.

- [ ] **Step 1: test** — `describe('modelFallbackSchema (SimpleAI)')`:
  - `configSchema.safeParse({ version: '1.0.0', modelFallback: {} })` fallisce con path `['modelFallback','tiers']`;
  - `{ tiers: [] }` fallisce; `{ tiers: [[]] }` fallisce;
  - `{ tiers: [['haiku-5-5','gpt-6-mini'],['sonnet-5','gpt-6-luna']] }` passa e `configSchema.parse(...).modelFallback` lo restituisce uguale.
- [ ] **Step 2:** `cd packages/data-provider && npx jest specs/config-schemas.spec.ts -t modelFallback` → FAIL.
- [ ] **Step 3:** `modelFallbackSchema = z.object({ tiers: z.array(z.array(z.string()).min(1)).min(1) })`, JSDoc di una riga come `agentBuilderSchema`; tipi sopra.
- [ ] **Step 4:** stesso comando → PASS; `npm run build:data-provider`.
- [ ] **Step 5: Commit** (chiedere a Marco).

### Task 2: Risoluzione della catena

**Files:**
- Create: `packages/api/src/modelFallback/chain.ts`, `packages/api/src/modelFallback/index.ts`
- Modify: `packages/api/src/index.ts` (`export * from './modelFallback';`)
- Test: `packages/api/src/modelFallback/modelFallback.spec.ts`

**Interfaces:**
- Consumes: `TModelFallbackConfig` (Task 1).
- Produces:
  ```ts
  export interface FallbackSpec { name?: string; label?: string; preset?: { endpoint?: string | null; model?: string | null } & Record<string, unknown>; router?: unknown }
  export function resolveFallbackChain(
    config: { tiers?: (string | undefined)[][] } | undefined,
    specs: FallbackSpec[],
    primary: { endpoint: string; model: string },
  ): FallbackSpec[]
  ```
  (tipi "larghi" come `BuilderSpec` in `agentBuilder/options.ts`, perché l'app config è deep-partial.)

- [ ] **Step 1: test** con specs `h(anthropic/claude-haiku-5-5)`, `m(openAI/gpt-6-mini)`, `s(anthropic/claude-sonnet-5)`, `l(azureOpenAI/gpt-6-luna)`, `l2(azureOpenAI/gpt-6-luna-2)`, `o(anthropic/claude-opus-4-8)`, `r(openAI/gpt-6-reasoning)` e tiers `[[h,m],[l,l2,s],[o,r]]`:
  - primario `azureOpenAI/gpt-6-luna` → nomi `['s','l2','o','r']` (altro provider prima, poi stesso provider, poi fascia superiore con `o` prima di `r` per ordine yaml perché entrambi ≠ azure);
  - primario `anthropic/claude-opus-4-8` (fascia più alta) → `['r']`;
  - primario non in nessuna fascia → `[]`; `config` undefined → `[]`;
  - nome in tiers senza spec o spec router o senza `preset.endpoint/model` → ignorato;
  - nessuna voce di fascia inferiore compare mai.
- [ ] **Step 2:** `cd packages/api && npx jest src/modelFallback` → FAIL.
- [ ] **Step 3:** implementare `resolveFallbackChain`: la fascia del primario è la prima che contiene una spec con `preset.endpoint === primary.endpoint && preset.model === primary.model`; ordinamento stabile per "provider diverso prima".
- [ ] **Step 4:** stesso comando → PASS.
- [ ] **Step 5: Commit** (chiedere).

### Task 3: Cancello degli errori

**Files:**
- Create: `packages/api/src/modelFallback/gate.ts`
- Test: `packages/api/src/modelFallback/gate.spec.ts`

**Interfaces:**
- Produces:
  ```ts
  export function isFallbackEligibleError(error: unknown): boolean
  export interface ModelFallbackGate {
    readonly primaryCallback: BaseCallbackHandlerMethodsClass-compatible object; // name, awaitHandlers: true
    fallbackCallback(model: string): object; // name, awaitHandlers: true, raiseError: true
    getServedModels(): string[]; // modelli di riserva che hanno completato una chiamata, senza doppioni, in ordine
  }
  export function createModelFallbackGate(): ModelFallbackGate
  ```
- Comportamento: stato condiviso `{ lastError, emitted }`. Primario: `handleChatModelStart` azzera; `handleLLMNewToken` → `emitted = true`; `handleLLMError(e)` → `lastError = e`. Voce di riserva: `handleChatModelStart` → se `emitted || !isFallbackEligibleError(lastError)` lancia `lastError` (lo stesso oggetto); altrimenti azzera `emitted`; `handleLLMNewToken` → `emitted = true`; `handleLLMError` → `lastError = e`; `handleLLMEnd` → aggiunge `model` ai serviti.
- `isFallbackEligibleError`: `status`/`statusCode`/`response.status` 429, 529 o ≥500; oppure `error.type`/`error.error.type` = `overloaded_error`/`rate_limit_error`; oppure messaggio che contiene (case-insensitive) `rate limit` o `overloaded`. Tutto il resto false (anche `undefined`).

- [ ] **Step 1: test** `isFallbackEligibleError`: `{status:429}`, `{status:529}`, `{status:503}`, `{error:{type:'overloaded_error'}}`, `new Error('... exceeded token rate limit.')` → true; `{status:400}`, `{status:413}`, `new Error('context length exceeded')`, `undefined` → false.
- [ ] **Step 2: test** con callback reali di LangChain: un `FakeListChatModel` (come in `agentBuilder.spec.ts`) con `callbacks: [gate.fallbackCallback('sonnet')]`:
  - dopo `primaryCallback.handleLLMError({status:429})` → `invoke` risolve e `getServedModels()` = `['sonnet']`;
  - dopo `handleLLMError({status:400})` → `invoke` rigetta con **lo stesso oggetto** errore (`toBe`), serviti `[]`;
  - dopo `handleLLMNewToken('Ciao')` + `handleLLMError({status:503})` → rigetta con lo stesso errore;
  - dopo `handleLLMNewToken('')` + 429 → rigetta (anche token vuoti contano);
  - due voci: la prima (`FakeListChatModel` che emette token e poi lancia `{status:503}`) → la seconda rigetta.
- [ ] **Step 3:** `cd packages/api && npx jest src/modelFallback/gate` → FAIL; implementare; → PASS.
- [ ] **Step 4: Commit** (chiedere).

### Task 4: Costruzione delle voci e aggancio in `initializeAgent`

**Files:**
- Create: `packages/api/src/modelFallback/build.ts`
- Modify: `packages/api/src/agents/initialize.ts` (dopo `getOptions`, ~riga 1312–1363)
- Test: `packages/api/src/modelFallback/build.spec.ts`, `packages/api/src/agents/__tests__/initialize.test.ts`

**Interfaces:**
- Consumes: `resolveFallbackChain` (Task 2), `createModelFallbackGate` (Task 3), `FallbackConfig` da `@librechat/agents`.
- Produces:
  ```ts
  export function getSpecModelParameters(preset: Record<string, unknown>): Record<string, unknown>
  export type BuildFallbackEntry = (endpoint: string, modelParameters: Record<string, unknown>) =>
    Promise<{ provider: string; llmConfig: Record<string, unknown>; maxContextTokens?: number }>
  export async function buildModelFallbacks(params: {
    chain: FallbackSpec[]; gate: ModelFallbackGate; buildEntry: BuildFallbackEntry;
  }): Promise<FallbackConfig[]>
  export function attachModelFallbackGate(agent: object, gate: ModelFallbackGate): void // proprietà non enumerabile
  export function getModelFallbackGate(agent: unknown): ModelFallbackGate | undefined
  ```
- `getSpecModelParameters`: passa il preset per `parseCompactConvo` (data-provider) con il suo endpoint e toglie `endpoint`, `endpointType`, `spec`, `iconURL`, `greeting`, `modelLabel`, `promptPrefix`, `maxContextTokens`; `model` resta.
- `buildModelFallbacks`: per ogni spec chiama `buildEntry`; se lancia, log `warn` con nome spec e salta; a ogni `clientOptions` aggiunge `callbacks: [gate.fallbackCallback(model)]`.
- In `initializeAgent`: se `appConfig.config.modelFallback` dà una catena non vuota per `{ endpoint: agent.endpoint, model: agent.model }`, crea il cancello, aggiunge `gate.primaryCallback` a `llmConfig.callbacks` (preservando quelli esistenti), assegna `llmConfig.fallbacks`, e `attachModelFallbackGate(agent, gate)`. `buildEntry` riusa lo stesso percorso del primario: `getProviderConfig` + `getOptions`, poi stessa risoluzione del provider (override, caso Azure senza instance name → `Providers.OPENAI`, `options.provider`) e `maxContextTokens` via `getModelMaxTokens`. Estrarre quella risoluzione in una funzione locale usata da entrambi, senza cambiare il comportamento del primario.

- [ ] **Step 1: test** `build.spec.ts`: due spec, `buildEntry` finto che lancia per la prima → risultato una sola voce con `callbacks` contenente la callback del cancello; `getSpecModelParameters({endpoint:'anthropic', model:'claude-sonnet-5', thinking:true, iconURL:'x', greeting:'y'})` contiene `model` e `thinking` e non `iconURL`/`greeting`/`endpoint`.
- [ ] **Step 2: test** in `initialize.test.ts` (riusare l'harness esistente): con `modelFallback.tiers` e specs che includono il modello dell'agente → `llmConfig.fallbacks` ha le voci attese nell'ordine di Task 2 e `getModelFallbackGate(agent)` è definito; senza `modelFallback` → `fallbacks` undefined e callbacks invariati.
- [ ] **Step 3:** `cd packages/api && npx jest src/modelFallback src/agents/__tests__/initialize.test.ts` → FAIL; implementare; → PASS.
- [ ] **Step 4: Commit** (chiedere).

### Task 5: Nota salvata sul messaggio

**Files:**
- Create: `packages/api/src/modelFallback/note.ts`
- Modify: `api/app/clients/BaseClient.js` (dopo il blocco `contextMeta`, ~riga 1230), `api/server/controllers/agents/client.js` (metodo `getModelFallback`)
- Test: `packages/api/src/modelFallback/modelFallback.spec.ts`, `api/server/controllers/agents/client.test.js`

**Interfaces:**
- Consumes: `getModelFallbackGate` (Task 4), `TModelFallbackMeta` (Task 1).
- Produces: `export function getModelFallbackMeta(agent: unknown): TModelFallbackMeta | undefined` → `{ from: agent.model, to: gate.getServedModels() }` se `to` non è vuoto, altrimenti `undefined`.
- `BaseClient`: `const modelFallback = this.getModelFallback?.(); if (modelFallback) { responseMessage.metadata = { ...responseMessage.metadata, modelFallback }; }`. `AgentClient.getModelFallback()` → `getModelFallbackMeta(this.options.agent)`.

- [ ] **Step 1: test** `getModelFallbackMeta`: agente senza cancello → undefined; cancello senza serviti → undefined; serviti `['claude-sonnet-5']` → `{ from: 'gpt-6-luna', to: ['claude-sonnet-5'] }`.
- [ ] **Step 2: test** in `client.test.js`: client con agente a cui è attaccato un cancello con un servito → il `responseMessage` salvato ha `metadata.modelFallback` atteso; senza → nessuna chiave `modelFallback`.
- [ ] **Step 3:** `cd packages/api && npx jest src/modelFallback` e `cd api && npx jest server/controllers/agents/client.test.js -t modelFallback` → FAIL; implementare; → PASS.
- [ ] **Step 4: Commit** (chiedere).

### Task 6: Nota nel client + e2e

**Files:**
- Create: `client/src/components/Chat/Messages/ModelFallbackNote.tsx`
- Modify: `client/src/components/Messages/ContentRender.tsx`, `client/src/components/Chat/Messages/ui/MessageRender.tsx` (sopra il `footer`/`SubRow`), `client/src/locales/en/translation.json`, `client/public/changelog.json` (voce della versione non ancora rilasciata)
- Test: `client/src/components/Chat/Messages/__tests__/ModelFallbackNote.spec.tsx`, `e2e/specs/mock/simpleai.spec.ts`

**Interfaces:**
- Consumes: `TModelFallbackMeta` letto da `msg.metadata?.modelFallback`.
- Produces: `ModelFallbackNote({ meta }: { meta?: TModelFallbackMeta })` → `null` se `meta` assente o `to` vuoto; altrimenti `<p className="text-xs text-text-secondary">` con `localize('com_ui_model_fallback_note', { 0: toLabels.join(', '), 1: fromLabel })`. Etichette da `useGetStartupConfig().data?.modelSpecs?.list` (spec il cui `preset.model` combacia → `label`, altrimenti l'id).

- [ ] **Step 1: test** componente: con meta `{from:'gpt-6-luna', to:['claude-sonnet-5']}` e startup config con spec `label: 'Sonnet 5'` / `'GPT-6 Luna'` → testo `Answered by Sonnet 5: GPT-6 Luna was temporarily unavailable.`; modello sconosciuto → mostra l'id; meta assente → niente nel DOM.
- [ ] **Step 2:** `cd client && npx jest src/components/Chat/Messages/__tests__/ModelFallbackNote --coverage=false` → FAIL; implementare + chiave en; → PASS.
- [ ] **Step 3: e2e** in `simpleai.spec.ts`: invia un messaggio col modello finto, poi `page.route` sulla GET dei messaggi della conversazione aggiunge `metadata.modelFallback` alla risposta dell'assistente, ricarica la conversazione → la nota è visibile; senza intercettazione → nessuna nota.
- [ ] **Step 4:** `npm run frontend` poi `E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180 npx playwright test --config=e2e/playwright.config.mock.ts specs/mock/simpleai.spec.ts` → tutti verdi.
- [ ] **Step 5: Commit** (chiedere).

### Task 7: Configurazione e verifica finale

**Files:**
- Modify: `librechat.yaml` (locale), `file_produzione/librechat.yaml`

- [ ] **Step 1:** aggiungere `modelFallback.tiers` in entrambi i file usando i `name` delle spec presenti in ciascuno (fasce dalle descrizioni "Fascia bassa/media/alta" dei candidati di `auto`).
- [ ] **Step 2:** suite unit dei workspace toccati: `packages/data-provider`, `packages/api` (`src/modelFallback src/agents`), `api` (`server/controllers/agents`), `client` (`src/components/Chat/Messages`); poi `npm run e2e:mock` con le variabili sopra. Fallimenti ammessi solo quelli ambientali elencati in `CLAUDE.md`, citati per nome.
- [ ] **Step 3:** `npm run lint` sui file toccati → 0 problemi.
- [ ] **Step 4:** prova manuale in locale: spec con un deployment Azure inesistente o chiave sbagliata che dà 429/5xx non è facile da forzare — usare un endpoint custom con `baseURL` verso un server locale che risponde 429, metterlo in una fascia con `haiku-5-5`, scegliere quello spec → la risposta arriva da Haiku con la nota.
- [ ] **Step 5: Commit** (chiedere) e aggiornamento `docs/memory-bank/changelog.md` se esiste.
