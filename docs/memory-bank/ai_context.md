# AI context — SimpleAI

Contesto sintetico per un assistente AI che lavora sul fork. Per LibreChat in generale (monorepo,
workspace, stile del codice, comandi) vale `CLAUDE.md` alla radice: qui c'è solo ciò che il fork
aggiunge.

## Cos'è

SimpleAI ("Simple AI" in UI) è il fork di Digital Automations di
[LibreChat](https://github.com/danny-avila/LibreChat). Versione corrente in `package.json`:
`v<upstream>-simpleai.<N>` (oggi `v0.8.8-simpleai.7`), che è anche il tag dell'immagine
`ghcr.io/digital-automations-srl/simpleai`. Gira su più installazioni cliente `het-saas-*`;
"lbc" è het-saas-5.

Remote: `origin` = repo Digital Automations, `upstream` = LibreChat.

## Decisione chiave: il fork è uno strato sottile

- Ogni modifica sparsa nel codice upstream è un conflitto al prossimo merge. Il codice nuovo sta in
  moduli propri (`packages/api/src/<feature>`, componenti nuovi in `client/src`), con agganci
  minimi nel codice upstream.
- Un fix su un bug upstream con issue aperta è una **patch del fork da togliere** quando upstream
  la chiude: il commit cita l'issue (`#16658`, `#16024`, `#16636`, `#16659`).
- Il fork aggiunge modelli Mongo e rotte backend, quindi si distribuisce come **immagine Docker
  custom** (da v0.8.7), non più come `client/dist` montata sull'immagine ufficiale.
- `client/dist/` è versionata: ogni feature UI ha un commit `🏗️ build: Rebuild client/dist …`.
- I domini nuovi evitano i nomi già usati da upstream (es. `improvementReport`, non `feedback`).
- Dettagli: `docs/deployment-pipeline.md`, sezione "Aggiornamenti upstream".

## Cosa aggiunge il fork e dove

| Funzione | Backend | Frontend | Config `librechat.yaml` |
|---|---|---|---|
| Modalità Automatico (router Jev) | `packages/api/src/modelRouter`, modello `RouterDecision` | `Chat/Input/AutoModelToggle.tsx` | spec con blocco `router:` |
| Ripiego automatico dei modelli | `packages/api/src/modelFallback` (aggancio in `agents/initialize.ts`) | `Chat/Messages/ModelFallbackNote.tsx` | `modelFallback.tiers` |
| Scheda "Crea" agenti | `packages/api/src/agentBuilder`, `POST /api/agents/builder/draft` | `SidePanel/Agents/Create/` | `agentBuilder.spec` |
| Avviso di contesto pieno | — | `Chat/Input/TokenUsage/ContextWarning.tsx` | `interface.contextGauge` |
| Segnalazioni di miglioramento | `packages/api/src/improvementReports`, `POST /api/improvement-reports`, modello `ImprovementReport` | `ui/FeedbackModal.tsx` | — |
| Finestra Novità | — | `ui/ChangelogModal.tsx`, `client/public/changelog.json` | — |
| Categorie agenti | `POST /api/agents/categories` | `Agents/CategoryManager.tsx` | — |
| Copia semantica (Ctrl+C) | — | `hooks/Messages/useSemanticCopy.ts` | — |
| Server MCP Gmail | `mcp-servers/gmail` (servizio separato) | — | `mcpServers.gmail` |
| Code Interpreter self-hosted | submodule `code-interpreter/` | — | — |
| Branding Simple AI | — | Footer, `index.html`, manifest | — |

Path frontend relativi a `client/src/components/` salvo dove indicato.

Altre parti del fork:
- `file_produzione/`: `librechat.yaml` e compose di produzione (copia allineata a lbc);
  `librechat_modifiche_pending.md` con l'handover dei rilasci.
- `config/`: script `cost-per-user`, `cost-remote`, `router-report`, `check-librechat-config`
  (controllo statico del yaml).
- `docs/superpowers/specs|plans/`: design e piani delle feature (ripiego, avviso contesto, suite
  limiti, upload).
- `docs/exceptions-log.md`: eccezioni alle regole (es. commit con `--no-verify` per falsi positivi).

## Glossario

- **Jev**: servizio TypeSafe (`POST /v1/systemone`, chiave `TYPESAFE_API_KEY`) che sceglie spec e
  strumenti in modalità Automatico. Se manca o fallisce si usa la spec `fallback`.
- **Spec automatica / `autoRouter`**: model spec con `router:`; la conversazione resta salvata
  sulla spec automatica, gli strumenti non toccati restano non impostati perché Jev possa accenderli.
- **Ripiego (fallback)**: passaggio a un altro modello su 429/sovraccarico/5xx prima del primo
  token. Errori senza status non attivano il ripiego (decisione).
- **Fascia (tier)**: gruppo di model spec in `modelFallback.tiers`, dalla più economica.
- **Novità**: changelog utente in app (numerazione 2.x, distinta dalla versione del pacchetto).
- **lbc**: het-saas-5, installazione principale con l'immagine custom.

## Vincoli

- Ogni modifica del fork ha i suoi test nello stesso commit (unit + e2e UI in
  `e2e/specs/mock/simpleai.spec.ts`); vedi `developer_guide.md`.
- `e2e/specs/simpleai-custom.spec.ts` gira contro la **produzione**: mai senza OK esplicito.
- Nessun commit o push senza conferma di Marco.
- Le mappe `models:` nel yaml restano complete anche se gli spec esposti sono meno: togliere un
  modello Azure rompe gli agenti fissati su quel modello.

## Stato corrente (2026-10-29)

- In produzione su lbc almeno fino a `v0.8.8-simpleai.6` (Automatico, ripiego, Crea, avviso
  contesto); il deploy di `.7` non risulta dal repo, da confermare.
- Branch `feature/suite-e2e-limiti`: suite E2E sui limiti e `config:check`, non ancora in `main`.
- Modifiche non committate: punti minori del ripiego (T145), vedi `changelog.md` → Non rilasciato.
- Aperti noti: fallimenti A4 (PDF rifiutato ripetuto a ogni turno) e H1 (allegato in bozza perso
  cambiando chat), tenuti come `test.fixme`; conteggio token 2x da ri-misurare dopo v0.8.7.
