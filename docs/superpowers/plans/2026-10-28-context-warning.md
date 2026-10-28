# Avviso di contesto pieno (T146) — piano di implementazione

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** sopra il 45% del contesto una striscia sopra il composer con Nuova chat / Compatta / Prompt di handoff; rotella nascondibile da yaml.

**Architecture:** tutto lato client. Un solo `useTokenUsage` (dentro `TokenUsageIndicator`, come oggi) alimenta sia la rotella sia l'avviso; l'avviso è reso via portal in uno slot che `ChatForm` mette sopra la textarea. Stato per conversazione (chiusura, handoff in corso, testo da precompilare) in atomi jotai, come `compactingConversationAtom`. Unica modifica di config: `interface.contextGauge`.

**Tech Stack:** React 18, jotai, Ariakit, `@librechat/client`, Jest + Testing Library, Playwright (suite mock).

**Spec:** `docs/superpowers/specs/2026-10-28-context-warning-design.md`

## Global Constraints

- Soglie: avviso da `percent >= 45`, livello urgente da `percent >= 80`. Nessun avviso se `maxTokens` è assente o 0.
- `interface.contextUsage === false` ⇒ né rotella né avviso (il gate esistente in `TokenUsage` resta l'unico).
- `interface.contextGauge`: boolean opzionale, default `true`. Con `false` la rotella non si vede quando `maxTokens` è noto; con `maxTokens` ignoto resta la rotella indeterminata.
- Nessun testo tecnico ("token", "context window") nell'avviso. Testi con `useLocalize()`, chiavi `com_ui_context_warning_*` in `en` **e** `it`; aggiungere in `it` anche `com_ui_context_compact`, `com_ui_context_compact_info`, `com_ui_context_compacting`.
- Nuova chat e handoff aprono la chat con **lo stesso spec/modello/agente**, forzandolo oltre `modelSpecs.prioritize` (passare sempre un `preset`). La chat vecchia non si cancella.
- Il testo di handoff va nella casella **non inviato** e **sostituisce** l'eventuale bozza della nuova chat; mai via URL `?prompt=`.
- Nessuna modifica in `/api`.
- Prima del commit: unit dei workspace toccati + e2e mock (CLAUDE.md del repo).

## Review Focus

1. **Cambio chat durante l'handoff** → nessuna nuova chat aperta, nessun testo precompilato altrove. Test nel Task 4.
2. **Handoff interrotto (Stop) o finito in errore** → niente nuova chat. Test nel Task 4.
3. **Bozza già presente nella nuova chat** → il testo di handoff la sostituisce e non ricompare la bozza dopo il re-render. e2e nel Task 6.
4. **Conversazione in modalità Automatico** → la nuova chat resta su Automatico (spec `autoRouter`). Unit nel Task 3.
5. **Chiusura con ×, poi la chat cresce oltre l'80%** → l'avviso ricompare una volta, in versione urgente. Unit nel Task 2.

---

### Task 1: opzione `interface.contextGauge`

**Files:**
- Modify: `packages/data-provider/src/config.ts:2313` (schema) e `:2422` (default `contextGauge: true`)
- Modify: `packages/data-schemas/src/app/interface.ts:46`
- Test: `packages/data-schemas/src/app/interface.spec.ts`

**Interfaces:**
- Produces: `startupConfig.interface?.contextGauge?: boolean`

- [ ] **Step 1: test** in `interface.spec.ts`, sul modello dei casi `contextCost` (righe ~147-177): `contextGauge` assente ⇒ `true`; `{ contextGauge: false }` ⇒ `false`.
- [ ] **Step 2:** `cd packages/data-schemas && npx jest interface.spec` → FAIL.
- [ ] **Step 3:** `contextGauge: z.boolean().optional()` nello schema, `contextGauge: true` nei default, `contextGauge: interfaceConfig?.contextGauge ?? defaults.contextGauge` in `interface.ts`.
- [ ] **Step 4:** `npm run build:data-provider`, poi la jest sopra → PASS.
- [ ] **Step 5: commit** `✨ feat(config): opzione interface.contextGauge per nascondere la rotella del contesto`

### Task 2: logica di visibilità dell'avviso

**Files:**
- Create: `client/src/components/Chat/Input/TokenUsage/contextWarning.ts`
- Test: `client/src/components/Chat/Input/TokenUsage/contextWarning.spec.ts`

**Interfaces:**
- Produces:
  - `type ContextWarningLevel = 'none' | 'notice' | 'urgent'`
  - `CONTEXT_WARNING_NOTICE = 45`, `CONTEXT_WARNING_URGENT = 80`
  - `getContextWarningLevel(percent: number, maxTokens?: number): ContextWarningLevel`
  - `contextWarningDismissedFamily: (conversationId: string) => PrimitiveAtom<ContextWarningLevel>` (jotai `atomFamily`, default `'none'`): il livello in cui l'utente ha premuto ×.
  - `contextWarningSuppressedFamily: (conversationId: string) => PrimitiveAtom<string | null>`: id del messaggio foglia al momento della fine compattazione; l'avviso resta nascosto finché la foglia è quella.
  - `isContextWarningVisible(args: { level: ContextWarningLevel; dismissed: ContextWarningLevel; suppressedAtLeaf: string | null; leafId: string | null }): boolean`

- [ ] **Step 1: test**
  ```ts
  expect(getContextWarningLevel(44.9, 1000)).toBe('none');
  expect(getContextWarningLevel(45, 1000)).toBe('notice');
  expect(getContextWarningLevel(80, 1000)).toBe('urgent');
  expect(getContextWarningLevel(90, undefined)).toBe('none');
  expect(getContextWarningLevel(90, 0)).toBe('none');
  const v = (level, dismissed, suppressedAtLeaf = null, leafId = 'a') =>
    isContextWarningVisible({ level, dismissed, suppressedAtLeaf, leafId });
  expect(v('notice', 'none')).toBe(true);
  expect(v('notice', 'notice')).toBe(false);
  expect(v('urgent', 'notice')).toBe(true);   // Review Focus 5
  expect(v('urgent', 'urgent')).toBe(false);
  expect(v('urgent', 'none', 'a', 'a')).toBe(false); // appena compattato
  expect(v('urgent', 'none', 'a', 'b')).toBe(true);  // turno successivo
  expect(v('none', 'none')).toBe(false);
  ```
- [ ] **Step 2:** `cd client && npx jest contextWarning` → FAIL.
- [ ] **Step 3:** implementare. Visibile se `level !== 'none'`, `suppressedAtLeaf !== leafId` (o null), e `dismissed === 'none' || (dismissed === 'notice' && level === 'urgent')`.
- [ ] **Step 4:** stessa jest → PASS.
- [ ] **Step 5: commit** `✨ feat(chat): logica di soglia e chiusura dell'avviso di contesto`

### Task 3: aprire una nuova chat con lo stesso modello (e testo precompilato)

**Files:**
- Create: `client/src/hooks/Chat/useContinueInNewChat.ts`
- Modify: `client/src/components/Chat/Input/ChatForm.tsx` (consumo del testo precompilato)
- Test: `client/src/hooks/Chat/__tests__/useContinueInNewChat.spec.tsx`

**Interfaces:**
- Produces:
  - `buildContinuationPreset(conversation: TConversation, modelSpecs?: TModelSpec[]): Partial<TPreset>` — se `conversation.spec` corrisponde a una spec in `modelSpecs` ⇒ `getModelSpecPreset(spec)` (vale anche per la spec `autoRouter`); altrimenti `{ endpoint, endpointType, model, agent_id }` della conversazione (solo i campi valorizzati).
  - `composerPrefillAtom: PrimitiveAtom<{ index: number; text: string } | null>`
  - `useContinueInNewChat(index: number): (text?: string) => void` — imposta `composerPrefillAtom` se `text` c'è, poi `newConversation({ preset: buildContinuationPreset(...) })` da `useNewConvo(index)`.
  - In `ChatForm`: un effetto che, quando `conversationId === Constants.NEW_CONVO` e `composerPrefillAtom.index === index`, fa `methods.setValue('text', text)` **dopo** il ripristino bozze di `useAutoSave` (es. in un `requestAnimationFrame` o dopo l'effetto di `useAutoSave`; il costruttore sceglie, il test del Task 6 lo vincola), salva la bozza della nuova chat con quel testo così un re-render non riporta la vecchia, e azzera l'atomo.

- [ ] **Step 1: test** di `buildContinuationPreset`:
  - conversazione con `spec: 'auto'` e lista con `{ name: 'auto', autoRouter: true, preset: {...} }` ⇒ risultato con `spec: 'auto'` (Review Focus 4);
  - conversazione agente `{ endpoint: 'agents', agent_id: 'agent_x' }` senza spec ⇒ `{ endpoint: 'agents', agent_id: 'agent_x' }`;
  - conversazione `{ endpoint: 'openAI', model: 'gpt-x' }` ⇒ `{ endpoint: 'openAI', model: 'gpt-x' }`;
  - spec non più presente nella lista ⇒ ricade su endpoint/model.
  E dell'hook: `newConversation` chiamato con `preset` (non `template`), e `composerPrefillAtom` valorizzato solo se si passa `text`.
- [ ] **Step 2:** `cd client && npx jest useContinueInNewChat` → FAIL.
- [ ] **Step 3:** implementare (hook + effetto in `ChatForm`).
- [ ] **Step 4:** jest → PASS.
- [ ] **Step 5: commit** `✨ feat(chat): nuova chat con lo stesso modello e testo precompilato`

### Task 4: handoff

**Files:**
- Create: `client/src/hooks/Chat/useHandoff.ts`
- Test: `client/src/hooks/Chat/__tests__/useHandoff.spec.tsx`

**Interfaces:**
- Consumes: `useContinueInNewChat` (Task 3), `useChatContext()` (`ask`, `index`, `conversation`, `isSubmitting`), `useLatestMessage(index)`.
- Produces:
  - `handoffConversationAtom: PrimitiveAtom<string | null>` (conversationId del handoff in corso)
  - `useHandoff(): { start: () => void; canStart: boolean; isRunning: boolean }`
  - `start` manda con `ask({ text: localize('com_ui_context_warning_handoff_prompt') })` un normale messaggio utente e segna l'atomo.
  - Sul fronte `isSubmitting` true → false, se l'atomo è la conversazione corrente **e** l'ultimo messaggio è della risposta (non utente), senza `error` e non interrotto (`unfinished !== true`), chiama `continueInNewChat(testo della risposta)`; in ogni caso azzera l'atomo.
  - `canStart` = conversazione salvata e `!isSubmitting`.
  - Montarlo nello stesso componente sempre presente che monta `useCompactConversation` (`TokenUsageIndicator`), non dentro l'avviso.

- [ ] **Step 1: test**
  - risposta completa ⇒ `continueInNewChat` chiamato con il testo della risposta;
  - utente cambia conversazione prima della fine ⇒ non chiamato (Review Focus 1);
  - risposta con `error: true` o `unfinished: true` ⇒ non chiamato (Review Focus 2);
  - `ask` chiamato con il testo della chiave `com_ui_context_warning_handoff_prompt`.
- [ ] **Step 2:** `cd client && npx jest useHandoff` → FAIL.
- [ ] **Step 3:** implementare. Testo della risposta: concatenazione delle parti di testo (`content` di tipo text) o `text` per i messaggi senza parti.
- [ ] **Step 4:** jest → PASS.
- [ ] **Step 5: commit** `✨ feat(chat): prompt di handoff verso una nuova chat`

### Task 5: componente avviso, integrazione, rotella, testi

**Files:**
- Create: `client/src/components/Chat/Input/TokenUsage/ContextWarning.tsx`
- Modify: `client/src/components/Chat/Input/TokenUsage/index.tsx`
- Modify: `client/src/components/Chat/Input/ChatForm.tsx` (slot sopra la textarea, prop a `TokenUsage`)
- Modify: `client/src/locales/en/translation.json`, `client/src/locales/it/translation.json`
- Test: `client/src/components/Chat/Input/TokenUsage/ContextWarning.spec.tsx`

**Interfaces:**
- Consumes: Task 1-4.
- Produces: `TokenUsageProps` guadagna `warningSlot: HTMLElement | null`; `ContextWarning` props `{ level: Exclude<ContextWarningLevel,'none'>; percent: number; onNewChat; onCompact?; isCompacting; onHandoff; canHandoff; isHandoffRunning; onDetails; onDismiss }` (`onCompact` assente ⇒ niente pulsante Compatta).

Comportamento:
- `ChatForm`: `const [warningSlot, setWarningSlot] = useState<HTMLDivElement | null>(null)`, `<div ref={setWarningSlot} />` subito sopra la textarea dentro il riquadro del composer, passato a `TokenUsage`.
- `TokenUsageIndicator` calcola livello e visibilità (Task 2, foglia = `useLatestMessageId(index)`), rende `ContextWarning` con `createPortal` nello slot. Alla fine di una compattazione (fronte `isCompacting` true → false) scrive la foglia corrente in `contextWarningSuppressedFamily`.
- Rotella: se `startupConfig.interface?.contextGauge === false` e `maxTokens` noto, il `PopoverDisclosure` non si rende; "Dettagli" apre lo stesso popover ancorato al pulsante Dettagli (`popover.setAnchorElement` + `show()`). Il `return null` su `usedTokens <= 0` non deve impedire allo slot di restare vuoto senza errori.
- Striscia: `role="status"`, testo `com_ui_context_warning_notice` / `com_ui_context_warning_urgent` con la percentuale arrotondata, pulsanti `Button` di `@librechat/client` size piccola: `com_ui_context_warning_new_chat`, `com_ui_context_compact`, `com_ui_context_warning_handoff`, link `com_ui_context_warning_details`, × con `aria-label` `com_ui_context_warning_dismiss`. Durante compattazione o handoff i pulsanti sono sostituiti da spinner + `com_ui_context_compacting` / `com_ui_context_warning_handoff_running`. Colori: ambra per `notice`, rosso tenue per `urgent` (token del tema). Su schermi stretti i pulsanti vanno a capo.
- `data-testid="context-warning"` sulla striscia.

Testi (en / it):
| chiave | en | it |
|---|---|---|
| `com_ui_context_warning_notice` | This chat is getting long ({{0}}%). Answers may get worse. | Questa chat sta diventando lunga ({{0}}%). Le risposte potrebbero peggiorare. |
| `com_ui_context_warning_urgent` | This chat is almost full ({{0}}%). Start fresh or compact it. | La chat è quasi piena ({{0}}%). Ripartire o compattarla. |
| `com_ui_context_warning_new_chat` | New chat | Nuova chat |
| `com_ui_context_warning_handoff` | Handoff prompt | Prompt di handoff |
| `com_ui_context_warning_handoff_running` | Writing the handoff… | Sto preparando il passaggio… |
| `com_ui_context_warning_details` | Details | Dettagli |
| `com_ui_context_warning_dismiss` | Dismiss | Chiudi |
| `com_ui_context_warning_handoff_prompt` | testo inglese equivalente | Scrivi un prompt che mi permetta di continuare questo lavoro in una nuova chat, senza la cronologia. Includi: obiettivo, decisioni prese e perché, stato attuale, prossimi passi, e tutte le informazioni indispensabili (nomi, numeri, file, vincoli). Scrivilo in seconda persona, rivolto all'assistente della nuova chat, pronto da incollare, senza commenti prima o dopo. |
| `com_ui_context_compact` / `_info` / `com_ui_context_compacting` (solo it) | — | Compatta / Riassume la parte vecchia della chat per liberare spazio / Sto riassumendo la conversazione… |

- [ ] **Step 1: test** di `ContextWarning`: rende il testo `notice` con la percentuale; `urgent` usa l'altro testo; senza `onCompact` non c'è il pulsante Compatta; click sui pulsanti chiama le callback; `isCompacting` mostra lo spinner e nasconde i pulsanti; × chiama `onDismiss`.
- [ ] **Step 2:** `cd client && npx jest ContextWarning` → FAIL.
- [ ] **Step 3:** implementare componente, integrazione e testi.
- [ ] **Step 4:** `cd client && npx jest TokenUsage ContextWarning contextWarning useHandoff useContinueInNewChat useCompactConversation useTokenUsage` → PASS; `npm run lint` pulito sui file toccati.
- [ ] **Step 5: commit** `✨ feat(chat): avviso di contesto pieno sopra il composer`

### Task 6: e2e, changelog utente, verifica completa

**Files:**
- Modify: `e2e/specs/mock/simpleai.spec.ts` (nuovo `test.describe('SimpleAI context warning')`)
- Modify: `client/public/changelog.json` (voce 2.3.0)

Seed: conversazione con snapshot persistito, sul modello di `insertConversation` in `e2e/specs/mock/scenarios/persisted-context-usage.spec.ts` (`maxContextTokens: 300`), con usato 150 (50%) e 270 (90%) e 120 (40%).

- [ ] **Step 1: test e2e**
  - 40% ⇒ `context-warning` assente; 50% ⇒ visibile con "50%"; 90% ⇒ testo urgente.
  - × a 50% ⇒ sparisce e non torna dopo un messaggio che resta sotto l'80%.
  - Nuova chat ⇒ URL `/c/new`, il selettore mostra lo stesso modello della conversazione seminata, la vecchia è nella cronologia.
  - Compatta ⇒ appare il riassunto (stesso selettore usato da `compaction-rerun-controls.spec.ts`) e l'avviso sparisce.
  - Handoff ⇒ il fake model risponde, si apre `/c/new` e la textarea contiene la risposta del fake model, non inviata. Variante con una bozza digitata prima in una nuova chat: la textarea contiene il testo di handoff, non la bozza (Review Focus 3).
- [ ] **Step 2:** `E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180 npx playwright test --config=e2e/playwright.config.mock.ts specs/mock/simpleai.spec.ts` (dopo `npm run frontend`) → PASS.
- [ ] **Step 3:** voce `2.3.0` in `client/public/changelog.json`, stesso formato della 2.2.0: "Quando una chat diventa lunga, un avviso sopra la casella propone di aprirne una nuova, compattarla o preparare un prompt per continuare altrove."
- [ ] **Step 4:** unit dei workspace toccati (`packages/data-schemas`, `packages/data-provider`, `client`) ed e2e mock completa `npm run e2e:mock` con le variabili sopra. Atteso: solo i fallimenti ambientali noti (CLAUDE.md del repo e T145 punto 10).
- [ ] **Step 5: commit** `✅ test(e2e): avviso di contesto pieno` + changelog.

Il deploy (rebuild `client/dist`, immagine `.6`, `interface.contextGauge: false` nello yaml di lbc) è un task separato da aprire dopo.
