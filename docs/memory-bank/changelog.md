# Changelog — SimpleAI (fork di LibreChat)

Registro delle modifiche del **fork** SimpleAI di Digital Automations. Le modifiche di LibreChat
upstream non sono elencate una per una: ogni allineamento compare come voce unica
("Allineamento a upstream vX.Y.Z") con le sole risoluzioni che riguardano il fork.

Formato ispirato a [Keep a Changelog](https://keepachangelog.com/it/1.1.0/). Le release seguono la
versione di `package.json` (`v<upstream>-simpleai.<N>`), che è anche il tag dell'immagine
`ghcr.io/digital-automations-srl/simpleai`. Categorie: Aggiunto, Modificato, Corretto, Rimosso,
Test, Documentazione. L'hash tra parentesi è il commit principale della voce.

Le novità per l'utente finale (finestra "Novità" in app) stanno in `client/public/changelog.json`,
con numerazione propria (2.x): questo file è il registro tecnico.

## [Non rilasciato]

## [v0.8.8-simpleai.11] - 2026-11-06

Novità 2.3.5. Contiene anche T293, T287 e T295, committati dopo la `.10`.

### Allegati in modalità Automatico (T293)

#### Corretto
- I tipi testuali (html, markdown, json, codice, OpenDocument, mail) sono ammessi anche da
  `default`/`agents` nel yaml, come già da Anthropic: prima sparivano dalla cronologia nei turni
  instradati su GPT. Un documento inviato al provider salva anche il testo estratto, così un turno
  successivo su un endpoint che lo legge come testo (PDF da Claude a GPT) lo riceve; il limite sul
  testo estratto non conta i file inviati come originale (381e150d6).
- `config:check` segnala i tipi testuali ammessi in Automatico ma scartati da un candidato.

### Config
- `titleModel` su modelli abilitati (anthropic `claude-haiku-5-5`, azure `gpt-6-luna`) e
  `config:check` non tollera più quelli non disponibili (T287, 157258ee8).
- Rimosso `claude-fable-5-1` dai modelli Vertex (T295, a23786eb3).

### Progetto AIDA (T265)

Prototipo chiesto da Tommaso al SAL del 02/11 per l'evento del 10/11 (c6f892a95).

#### Aggiunto
- Progetti chat: campo `instructions` (max 4000 caratteri) in schema, tipi, metodi e handler. Il
  server lo aggiunge alle istruzioni aggiuntive dell'agente principale di ogni chat del progetto
  (`applyProjectInstructions` in `packages/api/src/projects/instructions.ts`, chiamato da
  `api/server/services/Endpoints/agents/initialize.js`); il progetto si legge con l'utente come
  proprietario, quindi l'id di un progetto altrui non aggiunge nulla.
- Dialog "Nuovo progetto": con `interface.aida.url` configurato compare la sezione "Progetto AIDA"
  (ruolo, cartella AIDA) che genera le istruzioni (`client/src/components/Projects/aidaProject.ts`);
  senza AIDA il dialog è invariato.
- Dialog "Modifica progetto": campo "Istruzioni del progetto" per vederle e cambiarle.

#### Decisioni
- La cartella AIDA si scrive a mano: l'elenco dei repository richiede un'API di AIDA che oggi non
  usiamo.

#### Test
- Unit su `applyProjectInstructions`, sul builder delle istruzioni e sui metodi DB di
  `chatProject`; e2e in `e2e/specs/mock/simpleai.spec.ts`: progetto AIDA creato con ruolo e
  cartella, istruzioni salvate e visibili in modifica, campi assenti senza AIDA.

### Router Automatico: margine di cambio modello (T291)

#### Aggiunto
- `router.switchMargin` (default 0.15): in una conversazione già instradata il router resta sulla
  spec del turno precedente se la probabilità che Jev le dà è entro il margine da quella della sua
  scelta, per non buttare la cache del prompt del provider su differenze minime. `0` riporta al
  comportamento di prima (43bf9cde0).
- La spec precedente si legge dall'ultima decisione della conversazione (`getLastRouterSpec` in
  data-schemas, filtrata per utente); se non è più candidata o la lettura fallisce si decide come
  prima.
- Campo `preferredSpec` nelle decisioni del router (la scelta di Jev non seguita);
  `config/model-router-report.js` conta i turni rimasti sul modello precedente.

#### Test
- Unit su `resolveRouterDecision` (resta, cambia, margine 0, spec non più candidata), middleware
  con conversazione esistente, metodo DB.

### Corretto
- Router Automatico (T292): con un agente il pulsante «Auto» non compare più e il router non
  instrada un turno indirizzato a un agente salvato (`agent_id` `agent_…`), anche se la richiesta
  porta la spec automatica. Prima attivarlo sostituiva l'agente (es. Scheda Opportunità SGO) con la
  spec automatica. Il toggle usa `isModelChatEndpoint` (in `AutoModelToggle.tsx`), la stessa
  condizione con cui `BadgeRow` nasconde i badge effimeri, ora condivisa invece di essere riscritta
  in `ChatForm` (ec9445999; riordino import in c371ceba8).
- Chat continuata da link condiviso (T335): sotto gli allegati senza `file_id` (fuori dalla pagina
  del link) compare l'avviso che il modello non li legge più e vanno ricaricati (`Files.tsx`, chiave
  `com_ui_shared_files_detached` en/it, chiave React di riserva per i file senza `file_id`).
  Scelta: avviso invece della copia dei file al nuovo proprietario, che duplicherebbe record,
  storage, testo estratto, embedding, retention e tenant e allargherebbe l'accesso oltre la lettura
  del link (15f33d4cd).

### Test
- T292: unit su `isModelChatEndpoint` e sul middleware del router (fallisce senza la guardia); e2e
  in `simpleai.spec.ts`: con un agente selezionato il checkbox «Auto» non c'è, tornando al modello
  ricompare.
- T335: unit su `Files` (avviso sì/no, niente avviso sulla pagina del link); e2e in
  `simpleai.spec.ts`: chat con allegato, link condiviso, fork, avviso visibile.

## [v0.8.8-simpleai.10] - 2026-11-04

In rilascio su lbc (het-saas-5) dal 2026-11-04, per la prova del bottone AIDA prima dell'evento
del 10/11.

### File AIDA nella chat (T264)

Richiesta di Tommaso per l'evento del 10/11.

#### Aggiunto
- Bottone "File AIDA" nell'header della chat: apre in una finestra modale l'iframe della gestione
  file di AIDA (`<url>/embed/esplora?skin=simpleai&theme=dark|light`). Il tema segue quello attivo
  e, se cambia, l'iframe si ricarica. Componente `client/src/components/Chat/AidaFiles.tsx`, una
  riga in `client/src/components/Chat/Header.tsx`, chiave `com_ui_aida_files` in en/it.
- Il bottone compare solo se nel `librechat.yaml` c'è `interface.aida.url` (indirizzo base
  dell'AIDA dell'istanza, es. `https://aida-da.digitalautomations.it`). Schema in
  `packages/data-provider/src/config.ts`, passaggio in `packages/data-schemas/src/app/interface.ts`.

#### Decisioni
- Iframe senza sandbox: il login AIDA passa da un popup e servono caricamenti e download.
- Lato AIDA l'origine di ogni istanza va abilitata in `AIDA_EMBED_ORIGINS`: Tommaso ha abilitato
  tutte le 11 istanze `*.digitalautomations.it` (lbc, studioai, ai, cancellotti, 4bild, lef,
  verduci, brahma, cimolai, giotto, coesi).

#### Test
- Unit `client/src/components/Chat/__tests__/AidaFiles.spec.tsx` e
  `packages/data-schemas/src/app/interface.spec.ts`; e2e describe "SimpleAI AIDA files" in
  `e2e/specs/mock/simpleai.spec.ts`; mock di `AidaFiles` aggiunto in `Header.stacking.spec.tsx`.

### Modelli: contesto, output e prezzi

#### Aggiunto
- Claude Haiku 5.5 con contesto 1M e output 128k: `supportsContext1m`/`supportsOutput128k` in
  `packages/data-provider/src/bedrock.ts`, pattern 128k in `packages/data-provider/src/schemas.ts`,
  voci `claude-haiku-5-5`/`claude-haiku-5.5` in `packages/api/src/utils/tokens.ts`.
- Prezzi di Haiku 5.5 in `packages/data-schemas/src/methods/tx.ts`: 0.1/0.5 $/M fino a 100K di
  prompt, oltre 0.5/2.5 in `premiumTokenValues`; cache 0.125/0.01, oltre 100K 0.625/0.05.
- Prezzo di `gemini-3-flash` (0.5/3 $/M).
- Log di avviso, una sola volta per modello, quando un Claude ricade sulla voce generica `claude-`
  per il contesto (`warnGenericContext` in `tokens.ts`) o per il prezzo (`tx.ts`).

#### Rimosso
- Commenti sul prezzo introduttivo di Sonnet 5, scaduto il 2026-08-31.

### Controllo della configurazione

#### Aggiunto
- `config:check`: nuovo controllo `checkModelTables` in `config/check-librechat-config.js`. Ogni
  modello configurato (azure, anthropic vertex, google da `GOOGLE_MODELS`, custom) deve avere una
  voce propria di contesto e di prezzo, oppure un `tokenConfig` completo sull'endpoint custom.
- Registrati come noti in `config/check-librechat-config.known.json` i 4 buchi dei modelli Regolo:
  glm5.2 (contesto e prezzo), qwen3.5-122b e qwen3.8-27b (prezzo).

### Modificato
- Novità 2.3.4 in `client/public/changelog.json`.

### Test
- Unit data-provider (`bedrock`, `schemas`), packages/api (`tokens`, anthropic llm), data-schemas
  (`tx`, `interface`), config (`check-librechat-config`).
- Prima del rilascio: unit verdi salvo i fallimenti ambientali noti; e2e mock 371 passati e 7
  falliti noti (mermaid export, agent-selector-caps, empty-prompts-panel casuale, 4
  agent-management-files con 401 dal mock OIDC); `e2e:limits` 20 passati e 2 saltati;
  `config:check` verde.

## [v0.8.8-simpleai.9] - 2026-10-30

In produzione su lbc (het-saas-5) e studio (het-saas-2) dal 2026-10-29, su
ai.digitalautomations.it (het-saas-1) dal 2026-10-30.

### Corretto
- Ripiego automatico (T193): il modello di riserva lavora come il primario e riceve istruzioni,
  strumenti e allegati dell'agente, nel formato del proprio provider. La correzione è una patch
  `patch-package` su `@librechat/agents` 4.0.1 (`patches/@librechat+agents+4.0.1.patch`),
  applicata dal `postinstall` del `package.json` di root; il `Dockerfile` copia `patches/` prima
  di `npm ci` (22db06a9c).
- La spec scelta dall'utente viene letta dall'endpoint option in `initializeAgent`: il body della
  richiesta a runtime non la porta, e il ripiego partiva dalla spec sbagliata.
- Nessun addebito di token se l'utente interrompe la risposta durante il ripiego quando nessun
  modello ha prodotto output (`isUnbilledFallbackAbort` in `AgentClient`).
- Il modello di riserva risponde subito: niente retry sul modello in rate limit (`maxRetries: 0`
  sul primario e sulle riserve intermedie, l'ultima tiene i propri retry).
- Il log del ripiego nomina il modello che ha fallito davvero e riduce l'errore a una riga.
- Novità 2.3.3.

### Test
- Unit su `modelFallback` (gate, build, integrazione del run con la riserva), `initializeAgent` e
  `AgentClient`; caso D3 della suite limiti (`e2e/specs/limits/d-models.spec.ts`).

### Modificato
- Rebuild di `client/dist` per v0.8.8-simpleai.9 (d0c8f429c).

### Documentazione
- `developer_guide.md`: patch su `node_modules` con `patch-package` e cartella `patches/`.

## [v0.8.8-simpleai.8] - 2026-10-29

In produzione su lbc (het-saas-5) e studio (het-saas-2) dal 2026-10-29 (74c90defe, release
21b4e4891, build c1b4016c4).

### Ripiego automatico dei modelli (T145, punti minori)

#### Corretto
- La sintesi del contesto scritta da un modello di ripiego non mostra più la nota "Risposto da…".
- Le intestazioni `{{LIBRECHAT_BODY_*}}` vengono risolte anche sui client di ripiego.
- Il `maxContextTokens` della spec di ripiego viene rispettato (skip della spec e config del modello).
- La nota distingue le spec che condividono lo stesso modello: usa i nomi delle spec e, per
  l'etichetta del client, cerca prima per nome e poi per modello.
- Il costo di un ripiego su un endpoint custom usa il listino del modello di ripiego.
- I modelli di ripiego sono esclusi dai parametri di ripresa HITL e dall'impronta del contesto
  dell'agente.

#### Aggiunto
- Avviso (una volta per nome) per i nomi sconosciuti in `modelFallback.tiers`.
- Log di livello info quando scatta un ripiego.

#### Decisioni
- Errori di connessione e timeout senza status HTTP **non** attivano il ripiego.
- Non fatto: la nota visibile già durante lo streaming (richiede un nuovo evento SSE).

### Suite E2E sui limiti

#### Test
- Suite E2E sui limiti (`npm run e2e:limits`, ~4 min): harness con overlay YAML attivo solo con
  `E2E_LIMITS=true`, finti endpoint Action e Jev, `workers: 1` (375ffb1f2). Casi coperti:
  documento rifiutato dal provider (A4), modelli in errore e ripiego anche con errore senza status
  prima del primo token (D1-D2), chat oltre il contesto con sintesi (E1a), Actions sostituite e in
  errore (F2-F4), modello rimosso dalla configurazione (F6), router di Automatico in errore e
  decisione con latenza verificata (G1), bozze e allegati (H1). Correzioni dalla review finale:
  messaggi UI letti per chiave dal locale, soglie del router più larghe (466283e24).
- Fallimenti noti tenuti come `test.fixme` (elencati in `e2e/specs/limits/helpers.ts`): A4, il PDF
  rifiutato resta nello storico e ripete il 400 a ogni turno; H1, l'allegato in bozza si perde
  cambiando chat.
- Controllo statico di `file_produzione/librechat.yaml` (`npm run config:check`, unit con
  `npm run test:config`), con problemi tollerati in `config/check-librechat-config.known.json`
  (54406c3de).

#### Corretto
- `config:check`: regola TTS sempre attiva e nota su `titleModel` di Google (2571b99d0).

#### Documentazione
- Design e piano della suite (`docs/superpowers/specs|plans/2026-10-28-suite-e2e-limiti*`) e suite
  limiti + `config:check` inseriti nel flusso pre-commit di `CLAUDE.md` (dbdeb144c, 02dd24f73).

## [v0.8.8-simpleai.7] - 2026-10-28

### Corretto
- Le Azioni di un agente compaiono nella Libreria strumenti anche se il builder è aperto da una
  chat con un modello: la query delle Actions parte quando il pannello è visibile (7f7c4d27c).
  Novità 2.3.1.

## [v0.8.8-simpleai.6] - 2026-10-28

### Aggiunto
- Avviso di contesto pieno: striscia sopra la casella dal 45% del contesto (urgente dall'80%),
  chiudibile per chat, con azioni Nuova chat (stesso modello/agente), Compatta e Prompt di
  handoff (apre una chat nuova col prompt già nella casella, non inviato). Opzione
  `interface.contextGauge: false` per nascondere la rotella (241a68602). Novità 2.3.0.

### Modificato
- `file_produzione/librechat.yaml` riallineato al yaml attivo su lbc, con `contextGauge: false`.

## [v0.8.8-simpleai.5] - 2026-10-27

### Aggiunto
- Ripiego automatico dei modelli: su rate limit, sovraccarico o errore 5xx prima del primo token
  la richiesta passa a un altro modello della stessa fascia (prima un altro provider), poi alle
  fasce superiori. Vale per Automatico, modello scelto a mano e agenti. Configurazione
  `modelFallback.tiers` nel yaml; codice in `packages/api/src/modelFallback`; nota "Risposto da…"
  salvata in `metadata.modelFallback` e mostrata sotto la risposta (653d3dd2c).
- Scheda "Crea" nel pannello agenti: una conversazione con un modello imposta nome, istruzioni,
  categoria, modello e strumenti; "Prova l'agente" apre una chat temporanea con la bozza non
  salvata. Configurazione `agentBuilder.spec` (e `models` opzionale); route
  `POST /api/agents/builder/draft`, codice in `packages/api/src/agentBuilder` (0f482d28d).
  Novità 2.2.0.

## [v0.8.8-simpleai.4] - 2026-10-23

### Corretto
- Claude Haiku 5.5 usa il thinking adattivo: prima riceveva `thinking.type: enabled` con budget e
  rispondeva 400, a ogni messaggio semplice instradato su Haiku in modalità Automatico. Haiku 4.5
  resta sul budget (9181cea35).

## [v0.8.8-simpleai.3] - 2026-10-23

### Corretto
- Router: dal secondo messaggio di una chat nuova gli strumenti non toccati restavano `false`
  (letti come spenti dall'utente), quindi Jev non poteva più accenderli. Per le spec `autoRouter`
  restano non impostati (2ea6e4f76).

## [v0.8.8-simpleai.2] - 2026-10-23

### Aggiunto
- Modalità Automatico: una model spec con blocco `router:` fa scegliere a Jev (TypeSafe,
  `POST /v1/systemone`) la spec candidata e gli strumenti da accendere a ogni messaggio. Middleware
  `createModelRouter` in `packages/api/src/modelRouter`; Jev può solo accendere ricerca web, codice
  e file search; senza `TYPESAFE_API_KEY`, con errore o timeout si usa la spec `fallback`. Ogni
  decisione è salvata nella collezione `routerdecisions` (report con `npm run router-report`).
  Interruttore Automatico nella barra della chat, acceso di base (d5c97c9c9). Novità 2.1.0.

## [v0.8.8-simpleai.1] - 2026-10-05

### Modificato
- **Allineamento a upstream v0.8.8** (93d06695d). Risoluzioni rilevanti per il fork: rimosso il
  reroute degli upload "provider" (ora lo fa upstream lato server), copia di `changelog.json`
  spostata nel plugin `copyPublicAssets` di `client/vite.config.ts`, branding Simple AI su Footer e
  `index.html`, `CLAUDE.md` mantenuto (upstream usa `AGENTS.md`).
- La finestra Novità si apre solo quando esce una versione più nuova di quella già vista; alla
  prima visita la versione corrente è segnata come vista (8304bc8b1).

### Corretto
Patch del fork su issue upstream aperte, da togliere quando upstream le chiude:
- Media type delle immagini dedotto dai byte con sharp, non dall'estensione: un JPEG salvato come
  `.png` bloccava la conversazione con 400 Anthropic (#16658, 53a905d34).
- Tabelle dei `.docx` estratte come righe CSV invece che una cella per paragrafo (#16024, 5950e837c).
- Il cambio modello in una chat nuova conserva gli allegati (#16636, 7c1abdc47).
- In un caricamento multiplo si scartano solo i file di tipo non supportato (#16659, dfdb1dfc7).

Altro:
- Export di `CreateImprovementReportData` da `data-schemas`: il type-check di `packages/api`
  falliva dall'introduzione delle segnalazioni (db20ff8ef).
- Etichette ARIA sui pulsanti Modifica/Elimina del gestore categorie (127ea868b).

### Test
- `e2e/specs/mock/simpleai.spec.ts`: branding, changelog, segnalazioni, categorie del marketplace,
  pagina Share, #16636 e #16659 dalla UI. Suite mock isolata dall'ambiente locale (locale en-US,
  `.env` dello sviluppatore ignorato) (05f6c2392).

### Documentazione
- `CLAUDE.md`: i test viaggiano con il codice, comandi e fallimenti noti.

## [v0.8.7-simpleai.1] - 2026-07-27 / 2026-09-30

Primo rilascio con immagine custom su GHCR (il backend del fork non è bind-montabile).

### Modificato
- **Allineamento a upstream v0.8.7** (cb7e7d637). Rimosso il dedup `CHAT_MODEL_END` del fork
  (incompatibile con la nuova pipeline di usage: il raddoppio dei token va ri-misurato), prese le
  versioni upstream di Share e Help & FAQ, mantenuti ChangelogModal, Feedback e `useSemanticCopy`.
- `file_produzione/librechat.yaml` allineato al rilascio: Vertex in region `global`, modelli
  Anthropic e Azure aggiornati, modelSpecs esposti da 3 a 8 con etichette e icone (22ff7ad9e);
  poi riallineato a lbc con gli endpoint Regolo GLM/Qwen (0f4c21cbd).

### Aggiunto
- Segnalazioni di miglioramento salvate su Mongo (`POST /api/improvement-reports`, collezione
  `improvementreports`) con notifica email server-side; prima il form apriva un `mailto:` e
  confermava comunque l'invio. Logica in `packages/api/src/improvementReports` (ef8766615).
- Server MCP Gmail (`mcp-servers/gmail`) con OAuth per utente: ricerca, lettura e bozze, nessun
  invio (a562cfd06).
- Traduzioni italiane delle chiavi UI introdotte dal fork (2ee3b9eb2).

### Corretto
- La finestra Novità non si apriva in produzione: `changelog.json` non veniva copiato in
  `client/dist`. Pulsante con chiave propria "Ho capito" (b44237adf).
- `gmail-mcp` leggibile dall'utente `node` del container anche con permessi restrittivi sul
  server (9207adbe8).

### Rimosso
- Refactor di AttachFileMenu/DragDropModal riportati a upstream per ridurre la superficie di
  conflitto (e1bb4230b).

### Documentazione
- Modello di gestione del fork come strato sottile in `docs/deployment-pipeline.md` (12300d7dc).
- Handover del rilascio in `file_produzione/librechat_modifiche_pending.md`, sezione 0.

## [v0.8.6-simpleai.1] - 2026-06-11 / 2026-07-27

### Modificato
- **Allineamento a upstream v0.8.6** (f469aeb11). Categorie agenti portate su `agentCategory` di
  upstream, CategoryManager sul nuovo layout del Marketplace, ChangelogModal sulla UnifiedSidebar.

### Aggiunto
- Gestione categorie agenti nel Marketplace (CategoryManager, endpoint `POST /api/agents/categories`)
  (2882dd692).
- LibreCodeInterpreter come submodule `code-interpreter/` per l'esecuzione codice self-hosted
  (3deaccb26); da v0.8.6 la chiave va nel base URL (bda2b7ff5).
- Script di analisi costi per utente/installazione: `npm run cost-per-user`, `npm run cost-remote`
  (287f45bc8).
- Ripiego a testo per gli upload non supportati dal provider (60cf47a87, 7495c32e9, merge
  27e5f8afa). Rimosso poi in v0.8.8.

### Corretto
- Dedup di `CHAT_MODEL_END` per il conteggio token raddoppiato durante il tool-use degli agenti
  (5a711c123). Rimosso nel passaggio a v0.8.7.

### Modificato
- Config di produzione: MCP `odoo-ai`, modelSpecs reasoning, domini actions n8n (09406093a).

### Test
- Test di `useSemanticCopy` e suite E2E custom `e2e/specs/simpleai-custom.spec.ts` (gira contro la
  produzione) (28ada0316).

### Documentazione
- Spec e piano del ripiego a testo per gli upload (`docs/superpowers/*/2026-07-21-*`).

## [v0.8.4-rc1-simpleai.1] - 2026-04-07 / 2026-04-16

Base iniziale del fork su LibreChat v0.8.4-rc1.

### Aggiunto
- Copia semantica (Ctrl+C) dei messaggi AI: conserva grassetto, elenchi, link e titoli
  (`client/src/hooks/Messages/useSemanticCopy.ts`) (db76eb786, df29ca758).
- Rebranding LibreChat → Simple AI (titolo, meta, manifest PWA, footer, auth, marketplace),
  finestra Novità (ChangelogModal + `client/public/changelog.json`) e form di segnalazione
  migliorie (b0862b6f0).
- Script `scripts/deploy-update.sh` con notifica email (073abc4d6).

### Modificato
- `client/dist/` tracciata in git: il server faceva solo `git pull` + restart (31829134c).
  Superato dall'immagine GHCR da v0.8.7.

### Corretto
- Pagina di condivisione: scroll, font e header (b0862b6f0).

### Documentazione
- `CLAUDE.md` e `docs/deployment-pipeline.md`.
