# Suite E2E sui limiti — primo rilascio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mettere in piedi la suite E2E sui limiti con i 10 casi prioritari del design (A4, D1, D2, E1a, F2, F4, F6, G1, H1, I4), eseguibile prima di ogni commit.

**Architecture:** Una config Playwright derivata (`playwright.config.limits.ts`) riusa l'harness mock e vi aggiunge un overlay YAML a valori bassi più due server finti (Actions, Jev). Gli errori dei modelli si simulano nel modello finto in-process (`e2e/setup/fake-model.js`); le chiamate HTTP reali che escono dal grafo (ripiego, router, Actions) vanno ai server finti locali. Il caso I4 è un controllo statico in Node sui `librechat.yaml`.

**Tech Stack:** Playwright, Node (CommonJS per i server finti), `js-yaml` (già in `node_modules`), Jest per il controllo statico.

**Spec:** `docs/superpowers/specs/2026-10-28-suite-e2e-limiti-design.md`

## Global Constraints

- Esito atteso generale (spec §3): messaggio comprensibile; nessuna perdita di bozza, allegati o conversazione; la chat risponde al messaggio successivo; nessun `pageerror` e nessuna "something went wrong".
- Asserzioni sul comportamento, non sul testo esatto dei messaggi d'errore (eccezione: testo prodotto dai finti stessi, es. `E2E fallback reply …`).
- Niente nuovi `data-testid` nei componenti upstream solo per i test.
- Nessun provider reale: tutto locale e deterministico.
- **Casi che oggi falliscono**: se un test fallisce perché il prodotto si comporta diversamente dall'esito atteso (non per un errore del test), si marca `test.fixme(true, '<ID caso>: fallimento noto — <comportamento osservato>')` e si annota nel commento in testa al file. Non si cambia il prodotto in questo piano.
- Tetto: la corsa `npm run e2e:limits` deve restare entro **circa +5 minuti** rispetto alla suite mock.
- Ogni test riporta l'ID del caso e l'origine nel titolo, es. `test('A4 ⚠ saas-8 · …')`.
- Fixture piccole, senza dati reali dei clienti.
- Su Windows di Marco: prefisso `E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180` (vedi `CLAUDE.md` del repo).

## Review Focus

- **Overlay che rompe la suite mock condivisa**: l'overlay deve applicarsi solo con `E2E_LIMITS=true`; la suite `e2e:mock` deve restare identica. Test: Task 1 step 6 rilancia `simpleai.spec.ts` sotto la config mock normale.
- **Ripiego che scatta su errori non idonei**: un errore senza status (es. `E2E_FORCED_ERROR`) non deve far partire il ripiego. Test in Task 2 (`D1 · un errore senza status non ripiega`).
- **Server finti lasciati in uno stato sporco** tra un test e l'altro (modalità errore attiva): ogni spec che cambia comportamento chiama il reset in `afterEach`. Test: Task 2 e Task 7 eseguono `--repeat-each=2`.
- **Bozza persa su reload con allegato in caricamento**: H1 deve attendere la fine dell'upload prima del reload, altrimenti verifica una condizione di gara. Test in Task 8.
- **Controllo statico che dà falsi positivi** sui modelli definiti via variabili d'ambiente (`ANTHROPIC_MODELS` ecc.): il checker accetta un `.env` opzionale. Test in Task 9.

---

## File Structure

- Create `e2e/playwright.config.limits.ts` — config derivata: `testDir: 'specs/limits/'`, webServer della mock + `fake-action-server` + `fake-jev-server`.
- Create `e2e/config/librechat.limits.overlay.yaml` — overlay a valori bassi (fallback, router, sintesi, Actions su 127.0.0.1, spec di contesto piccolo).
- Modify `e2e/playwright.config.mock.ts` — in `writeRuntimeMockConfig()`, se `process.env.E2E_LIMITS === 'true'`, merge profondo dell'overlay sul config generato (`js-yaml` load → merge → dump); liste unite per `name`.
- Modify `e2e/setup/fake-model.js` — marcatori nuovi (Task 2, 3, 5).
- Modify `e2e/setup/fake-label-server.js` — risposte in streaming per le chiamate di chat con `stream: true` (il ripiego), con modalità propria.
- Create `e2e/setup/fake-action-server.js` (porta `E2E_ACTION_PORT`, default 8792).
- Create `e2e/setup/fake-jev-server.js` (porta `E2E_JEV_PORT`, default 8793).
- Create `e2e/specs/limits/helpers.ts` — controllo dei server finti (`setFakeBehavior`, `resetFakes`) e asserzione §3 (`expectNotBroken`).
- Create `e2e/specs/limits/*.spec.ts` — uno per gruppo: `harness`, `d-models`, `a-documents`, `e-long-chat`, `f-actions`, `f-missing-model`, `g-router`, `h-drafts`.
- Create `config/check-librechat-config.js` + `config/__tests__/check-librechat-config.spec.js` + fixture YAML.
- Modify `package.json` — script `e2e:limits`, `config:check`.
- Modify `CLAUDE.md` del repo — "before every commit" include `e2e:limits` e `config:check`.

---

### Task 1: Harness della suite dei limiti

**Files:**
- Create: `e2e/playwright.config.limits.ts`, `e2e/config/librechat.limits.overlay.yaml`, `e2e/specs/limits/helpers.ts`, `e2e/specs/limits/harness.spec.ts`
- Modify: `e2e/playwright.config.mock.ts` (`writeRuntimeMockConfig`), `package.json`

**Interfaces:**
- Produces:
  - npm script `e2e:limits` = `npm run e2e:prepare && cross-env E2E_LIMITS=true playwright test --config=e2e/playwright.config.limits.ts`
  - `helpers.ts`: `setFakeBehavior(server: 'label' | 'action' | 'jev', behavior: Record<string, unknown>): Promise<void>` (POST `/__e2e/behavior`), `resetFakes(): Promise<void>` (POST `/__e2e/reset` sui tre), `expectNotBroken(page: Page, pageErrors: string[]): Promise<void>` (nessun testo `/something went wrong/i`, nessun `/unhandled error/i`, `pageErrors` vuoto), `trackPageErrors(page: Page): string[]`.
  - Porte: label 8889, action 8792, jev 8793 (override con `E2E_ACTION_PORT`, `E2E_JEV_PORT`, sostituite nel config generato come già fatto per `LABEL_PORT`).

- [ ] **Step 1: Scrivere `harness.spec.ts`**

```ts
test('harness · overlay attivo e chat funzionante', async ({ page }) => {
  // la spec di contesto piccolo dell'overlay è nel menu
  // invio E2E_REPLY:harness → risposta "E2E reply harness" visibile
  // expectNotBroken(page, errors)
});
```

- [ ] **Step 2: Lanciare e verificare che fallisca** — `npx playwright test --config=e2e/playwright.config.limits.ts` → FAIL (config inesistente).

- [ ] **Step 3: Implementare overlay, merge e config derivata.** Overlay iniziale: solo la spec `e2e-limits-small-context` (label `E2E Limits Small Context`, preset `Mock Provider A`/`mock-model-a`). La config derivata riprende `mockConfig` e aggiunge i due webServer (inizialmente bastano stub che rispondono 200 su `/`, completati nei task 5 e 7).

- [ ] **Step 4: Lanciare `harness.spec.ts`** → PASS.

- [ ] **Step 5: Verificare che la suite mock condivisa non cambi** — `npx playwright test --config=e2e/playwright.config.mock.ts specs/mock/simpleai.spec.ts` → 23 passed; `e2e/.generated/librechat.e2e.yaml` senza la spec `e2e-limits-small-context`.

- [ ] **Step 6: Commit** — `test(e2e): harness della suite sui limiti`.

---

### Task 2: Modelli in errore — D1, D2

**Files:**
- Modify: `e2e/setup/fake-model.js`, `e2e/setup/fake-label-server.js`, `e2e/config/librechat.limits.overlay.yaml`
- Create: `e2e/specs/limits/d-models.spec.ts`

**Interfaces:**
- Consumes: `setFakeBehavior('label', …)`, `resetFakes`, `expectNotBroken` (Task 1).
- Produces:
  - Marcatore `E2E_STATUS_ERROR:<status>:<label>`: il modello finto lancia **prima del primo token** (nessun prelude) un `Error` con proprietà `status: <status>` e messaggio `E2E status error <status> <label>`. Estensione di `overrideModel`/`FakeChatModel`: parametro `thrownErrorStatus?: number` accanto a `thrownErrorString`.
  - `fake-label-server.js`: per `POST /v1/chat/completions` con `stream: true` risponde SSE in stile OpenAI con il testo `E2E fallback reply` (modalità `chatMode: 'ok'`), oppure HTTP 503 (`chatMode: 'error'`). `chatMode` si imposta con `/__e2e/behavior` e torna `'ok'` con `/__e2e/reset`. Le chiamate di label (non stream) restano come oggi.
  - Overlay: `modelFallback.tiers: [[e2e-mock-provider-a, e2e-mock-provider-b]]`.

- [ ] **Step 1: Scrivere i test**

```ts
test('D1 ⚠ saas-3,7 · 429 prima del primo token → risposta dal ripiego con nota', …)
  // invio E2E_STATUS_ERROR:429:d1 su Mock Provider A
  // atteso: testo "E2E fallback reply" visibile; nota di ripiego visibile
  //   (stesso locator della nota in simpleai.spec.ts › SimpleAI model fallback); expectNotBroken
test('D1 · 529 overloaded → stesso esito', …)
test('D1 · un errore senza status non ripiega', …)
  // invio E2E_FORCED_ERROR:d1-plain → nessun "E2E fallback reply", errore visibile
test('D2 ⚠ più host · tutta la catena in errore → errore leggibile e la chat continua', …)
  // setFakeBehavior('label', { chatMode: 'error' }); invio E2E_STATUS_ERROR:429:d2
  // atteso: un messaggio d'errore visibile nella conversazione, nessun "E2E fallback reply";
  // resetFakes(); invio E2E_REPLY:d2-after → "E2E reply d2-after" visibile; expectNotBroken
```

`afterEach(resetFakes)`.

- [ ] **Step 2: Lanciare** — `… --config=e2e/playwright.config.limits.ts specs/limits/d-models.spec.ts` → FAIL (marcatore sconosciuto).
- [ ] **Step 3: Implementare marcatore, streaming del label server e overlay.**
- [ ] **Step 4: Lanciare con `--repeat-each=2`** → PASS, oppure `test.fixme` motivato per i casi che falliscono per comportamento del prodotto (vedi Global Constraints).
- [ ] **Step 5: Commit** — `test(e2e): D1-D2 modelli in errore e ripiego`.

---

### Task 3: Documento rifiutato dal provider — A4

**Files:**
- Modify: `e2e/setup/fake-model.js`
- Create: `e2e/specs/limits/a-documents.spec.ts`, fixture `e2e/specs/limits/fixtures/e2e-rejected.pdf` (PDF valido di 1 pagina, < 5 kB)

**Interfaces:**
- Consumes: `collectProviderFileNames` (già in `fake-model.js`), `uploadViaUnifiedButton` (`e2e/specs/mock/helpers.ts`).
- Produces: regola nel modello finto — se tra i file consegnati al provider in **qualunque** messaggio della richiesta c'è un nome che inizia con `e2e-rejected`, lancia prima del primo token un errore con `status: 400` e messaggio `messages.0.content.1.document.source.base64.media_type: Input should be 'application/pdf'` (forma osservata su saas-8).

- [ ] **Step 1: Scrivere il test**

```ts
test('A4 ⚠ saas-8 · dopo un documento rifiutato la chat risponde al messaggio successivo', …)
  // allega fixtures/e2e-rejected.pdf, invia E2E_REPLY:a4-first → errore visibile (messaggio comprensibile)
  // invia E2E_REPLY:a4-second senza allegati → atteso "E2E reply a4-second" visibile; expectNotBroken
```

- [ ] **Step 2: Lanciare** → FAIL.
- [ ] **Step 3: Implementare la regola nel modello finto.**
- [ ] **Step 4: Lanciare.** Atteso dal design: oggi probabilmente il secondo turno fallisce (il PDF resta nella storia) → `test.fixme(true, 'A4: fallimento noto — il documento rifiutato viene rimandato a ogni turno')` se confermato. Verificare che il fallimento sia sul secondo turno e non sul primo.
- [ ] **Step 5: Commit** — `test(e2e): A4 documento rifiutato dal provider`.

---

### Task 4: Chat oltre il contesto con sintesi automatica — E1a

**Files:**
- Modify: `e2e/config/librechat.limits.overlay.yaml`
- Create: `e2e/specs/limits/e-long-chat.spec.ts`

**Interfaces:**
- Consumes: spec `e2e-limits-small-context` (Task 1).
- Produces: overlay con la sintesi automatica attiva e un contesto piccolo per quella spec. Chiavi: quelle dello schema `summarization` di upstream (vedi `librechat.example.yaml` § "Automatic conversation summarization") e `maxContextTokens` sulla spec, valore tale che **4 turni** da ~600 caratteri lo superino. Il modello del riassunto è il modello finto (`Mock Provider A`).

- [ ] **Step 1: Scrivere il test**

```ts
test('E1a ⚠ 6 host · oltre il contesto con sintesi attiva ogni risposta è non vuota', …)
  // sulla spec E2E Limits Small Context invia 6 messaggi E2E_REPLY:e1-<n> con ~600 caratteri di riempimento
  // atteso: per ogni n, "E2E reply e1-<n>" visibile; nessun messaggio dell'assistente vuoto; expectNotBroken
```

- [ ] **Step 2: Lanciare** → FAIL (overlay senza sintesi: verificare che il fallimento sia sul limite di contesto).
- [ ] **Step 3: Configurare sintesi e contesto nell'overlay.**
- [ ] **Step 4: Lanciare** → PASS o `test.fixme` motivato ("Empty messages after pruning").
- [ ] **Step 5: Commit** — `test(e2e): E1a chat oltre il contesto con sintesi`.

---

### Task 5: Actions — F2, F4

**Files:**
- Create: `e2e/setup/fake-action-server.js`, `e2e/specs/limits/f-actions.spec.ts`
- Modify: `e2e/setup/fake-model.js`, `e2e/config/librechat.limits.overlay.yaml`, `e2e/playwright.config.limits.ts`

**Interfaces:**
- Consumes: `openAgentBuilder`, `cleanupAgent`, `AgentDetail` (`e2e/specs/mock/agents.helpers.ts`); `getAccessToken`, `requestJson` (`e2e/specs/mock/helpers.ts`); helper Mongo di `e2e/specs/mock/db.ts` per leggere il documento Action.
- Produces:
  - `fake-action-server.js`: `GET /ok` → `{"result":"E2E action ok"}`; `GET /error` → 500; `GET /slow` → risponde dopo `behavior.slowMs` (default 60000); `GET /huge` → JSON di `behavior.hugeBytes` (default 2 000 000); più `/__e2e/behavior`, `/__e2e/reset`.
  - Schema OpenAPI di prova con server `http://127.0.0.1:8792` e operazioni `e2eOk`, `e2eError`, `e2eSlow`, `e2eHuge` (costante in `f-actions.spec.ts`; la versione "v2" per F2 aggiunge `e2eExtra`).
  - Overlay: `actions.allowedDomains` include `127.0.0.1:8792`.
  - Marcatore `E2E_ACTION_CALL:<operationId>`: il modello finto emette una tool call verso lo strumento dell'agente il cui nome inizia con `<operationId>_action_`, poi, ricevuto il risultato, risponde `E2E action done <operationId>`.

- [ ] **Step 1: Scrivere i test**

```ts
test('F2 ⚠ 28/10 · sostituire lo schema di un\'Action conserva autenticazione e chiave', …)
  // crea agente + Action via API (schema v1, auth service_http con api_key "e2e-secret")
  // da una chat con Mock Provider A: builder → agente → Libreria strumenti → Actions → apri l'Action
  // sostituisci lo schema con v2 e salva
  // atteso (DB): metadata.raw_spec contiene "e2eExtra"; metadata.auth.type invariato; metadata.api_key presente
  // atteso (API agente): tools contiene uno strumento che inizia con "e2eExtra_action_"
test('F4 · Action che risponde 500 → la chat risponde e continua', …)        // E2E_ACTION_CALL:e2eError
test('F4 · Action in timeout → la chat risponde e continua', …)               // slowMs oltre il timeout delle Actions
test('F4 · Action con payload enorme → la chat risponde e continua', …)       // E2E_ACTION_CALL:e2eHuge
  // per ciascuno: "E2E action done <op>" visibile oppure un errore leggibile; poi E2E_REPLY:<x> risponde; expectNotBroken
```

`afterEach`: `resetFakes` e `cleanupAgent`.

- [ ] **Step 2: Lanciare** → FAIL.
- [ ] **Step 3: Implementare server, overlay e marcatore.**
- [ ] **Step 4: Lanciare** → PASS o `test.fixme` motivato.
- [ ] **Step 5: Commit** — `test(e2e): F2-F4 Actions sostituite e in errore`.

---

### Task 6: Agente o chat su un modello rimosso — F6

**Files:**
- Create: `e2e/specs/limits/f-missing-model.spec.ts`

**Interfaces:**
- Consumes: `getAccessToken`, `requestJson`, `cleanupAgent`; helper Mongo di `e2e/specs/mock/db.ts`.
- Produces: nessuna interfaccia nuova. Il modello rimosso si simula con `model: 'mock-model-removed'` su `Mock Provider A`, valore che non è nella config: se l'API di creazione agente lo rifiuta, l'agente si crea valido via API e poi il campo `model` si aggiorna direttamente su Mongo (stessa situazione di un modello tolto dal yaml dopo la creazione).

- [ ] **Step 1: Scrivere i test**

```ts
test('F6 ⚠ tutti gli host · agente su modello rimosso → errore leggibile, nessun crash', …)
  // chat con l'agente, invio E2E_REPLY:f6-agent
  // atteso: un messaggio d'errore visibile; nessun /unhandled error/i; expectNotBroken;
  // la conversazione resta nella sidebar e si riapre
test('F6 · conversazione esistente il cui modello è stato rimosso → si può continuare scegliendo un altro modello', …)
  // conversazione con Mock Provider A; su Mongo il campo model della conversazione → 'mock-model-removed'; reload
  // selezione di Mock Provider B, invio E2E_REPLY:f6-convo → "E2E reply f6-convo" visibile
```

`afterEach(cleanupAgent)`.

- [ ] **Step 2: Lanciare** → PASS o `test.fixme` motivato (il test fissa il comportamento; atteso dal design: oggi errore poco leggibile).
- [ ] **Step 3: Commit** — `test(e2e): F6 modello rimosso dalla configurazione`.

---

### Task 7: Router di Automatico in errore — G1

**Files:**
- Create: `e2e/setup/fake-jev-server.js`, `e2e/specs/limits/g-router.spec.ts`
- Modify: `e2e/config/librechat.limits.overlay.yaml`, `e2e/playwright.config.limits.ts`

**Interfaces:**
- Consumes: spec `e2e-auto` della config mock (`router.fallback: e2e-mock-provider-b`).
- Produces:
  - `fake-jev-server.js`: `POST /v1/systemone` con `behavior.mode` `'ok'` (sceglie `e2e-mock-provider-a`), `'error'` (500), `'slow'` (risponde dopo 10 s); `/__e2e/behavior`, `/__e2e/reset`, `GET /__e2e/requests` (numero di chiamate).
  - Overlay: sulla spec `e2e-auto`, `router.baseURL: http://127.0.0.1:8793`, `router.timeoutMs: 1000`.
  - `playwright.config.limits.ts`: `TYPESAFE_API_KEY=e2e-jev-key` nell'env del server LibreChat.

- [ ] **Step 1: Scrivere i test**

```ts
test('G1 ◆ · router in 500 → risponde il fallback, nessun errore visibile', …)
test('G1 ◆ · router oltre il timeout → risponde il fallback entro ~timeout', …)
  // seleziona E2E Automatico; setFakeBehavior('jev', { mode }); invia E2E_REPLY:g1-<mode>
  // atteso: "E2E reply g1-<mode>" visibile entro 10 s; GET /__e2e/requests ≥ 1 (il router è stato chiamato); expectNotBroken
test('G1 · router ok → la richiesta passa dal router', …)   // controllo che il finto sia davvero usato
```

- [ ] **Step 2: Lanciare** → FAIL.
- [ ] **Step 3: Implementare server, overlay ed env.**
- [ ] **Step 4: Lanciare con `--repeat-each=2`** → PASS.
- [ ] **Step 5: Commit** — `test(e2e): G1 router di Automatico in errore`.

---

### Task 8: Bozza e allegati — H1

**Files:**
- Create: `e2e/specs/limits/h-drafts.spec.ts`, fixture `e2e/specs/limits/fixtures/e2e-note.txt`

**Interfaces:**
- Consumes: `uploadViaUnifiedButton`, `openNewChat`-style navigazione (`NEW_CHAT_PATH`), `trackPageErrors`, `expectNotBroken`.

- [ ] **Step 1: Scrivere i test**

```ts
test('H1 ◆ useNewChat · la bozza resta dopo reload', …)
test('H1 · la bozza resta cambiando chat e tornando', …)
test('H1 · "Nuova chat" svuota gli allegati e non lascia la bozza della chat precedente', …)
  // per i primi due: testo "bozza H1 <n>" + allegato e2e-note.txt, attendere fine upload, poi azione
  // atteso: casella con "bozza H1 <n>"; per il terzo: casella vuota e nessun allegato
```

- [ ] **Step 2: Lanciare** → PASS o `test.fixme` motivato (qui non c'è codice da scrivere: il test fissa il comportamento).
- [ ] **Step 3: Commit** — `test(e2e): H1 bozze e allegati`.

---

### Task 9: Controllo statico della configurazione — I4

**Files:**
- Create: `config/check-librechat-config.js`, `config/__tests__/check-librechat-config.spec.js`, `config/__tests__/fixtures/{ok,bad}.librechat.yaml`, `config/__tests__/fixtures/models.env`
- Modify: `package.json` (`config:check` = `node config/check-librechat-config.js file_produzione/librechat.yaml`)

**Interfaces:**
- Produces: `checkLibrechatConfig(yamlText: string, env?: Record<string, string>): string[]` (lista di problemi, vuota se ok) esportata; CLI `node config/check-librechat-config.js <librechat.yaml> [--env <file .env>]`, exit 1 se ci sono problemi, una riga per problema.
- Regole:
  1. per ogni endpoint (`azureOpenAI.groups[].models`, `anthropic.vertex.models`, `custom[]`), `titleModel` è tra i modelli dell'endpoint (o tra quelli di `<PROVIDER>_MODELS` nell'env, senza suffisso `@…`);
  2. ogni nome in `modelFallback.tiers` è un `name` di `modelSpecs.list`;
  3. per ogni spec con `router`, `fallback` e le chiavi di `candidates` sono `name` di `modelSpecs.list`;
  4. `agentBuilder.spec`, se presente, è un `name` di `modelSpecs.list`;
  5. se il bottone di sintesi vocale è attivo, deve esistere una configurazione TTS (individuare in `librechat.example.yaml` le chiavi che governano il pulsante e il provider TTS).

- [ ] **Step 1: Scrivere i test**

```js
it('ok.librechat.yaml non ha problemi', …)                         // []
it('segnala titleModel assente tra i modelli dell\'endpoint', …)    // contiene 'titleModel "gpt-5"'
it('accetta titleModel definito in ANTHROPIC_MODELS dell\'env', …)
it('segnala tier di modelFallback senza spec', …)
it('segnala fallback o candidato del router senza spec', …)
it('segnala agentBuilder.spec inesistente', …)
it('segnala TTS attivo senza configurazione', …)
```

- [ ] **Step 2: Lanciare** `npx jest config/__tests__/check-librechat-config.spec.js` → FAIL.
- [ ] **Step 3: Implementare `checkLibrechatConfig` e la CLI.**
- [ ] **Step 4: Lanciare i test** → PASS. Poi `npm run config:check`: se segnala problemi reali in `file_produzione/librechat.yaml` (atteso: `titleModel` Azure `gpt-5`, forse Anthropic `claude-haiku-4-5`), **non correggere il yaml in questo piano**: riportarli nel riepilogo finale come input per le correzioni del §8 del design.
- [ ] **Step 5: Commit** — `test(config): I4 controllo statico di librechat.yaml`.

---

### Task 10: Inserimento nel flusso di lavoro

**Files:**
- Modify: `CLAUDE.md` (sezione "SimpleAI fork: tests travel with the code"), `e2e/specs/limits/helpers.ts` (commento in testa con l'elenco dei `test.fixme` e il caso di origine)

- [ ] **Step 1:** Misurare `npm run e2e:limits` (tempo totale) e confrontarlo col tetto di +5 minuti; se lo supera, ridurre ripetizioni/attese prima di proseguire.
- [ ] **Step 2:** In `CLAUDE.md`: "Before every commit and every deploy" include `npm run e2e:limits` e `npm run config:check`; una riga sulla politica dei fallimenti noti (`test.fixme` con ID caso) e il rimando al design.
- [ ] **Step 3:** Rilanciare `e2e:limits` per intero → tutto verde o `fixme` motivati; `simpleai.spec.ts` sotto la config mock → 23 passed.
- [ ] **Step 4: Commit** — `docs: suite sui limiti nel flusso pre-commit`.
