# Developer guide — SimpleAI

Guida operativa per lavorare sul fork. Comandi di base, struttura del monorepo e stile del codice
sono in `CLAUDE.md` alla radice; qui ci sono le regole specifiche del fork.

## Setup

```bash
npm run smart-reinstall     # dipendenze + build dei pacchetti (Turborepo)
npm run backend:dev         # backend su 3080
npm run frontend:dev        # frontend su 3090, proxy verso 3080
```

Requisiti: Node.js v20.19.0+ (o ^22.12.0 / >= 23), MongoDB, Docker Desktop per l'ambiente locale.
Il submodule `code-interpreter/` serve solo per l'esecuzione codice self-hosted
(`git submodule update --init`).

## Dove mettere il codice

- Backend nuovo: TypeScript in `packages/api/src/<feature>/`; in `/api` solo wrapper sottili.
- Modelli Mongo: `packages/data-schemas/src/models` + `schema/`.
- Tipi, endpoint e data-service condivisi: `packages/data-provider`.
- UI: componenti nuovi in `client/src/components/...`; tocca i file upstream il meno possibile.
- Testi UI con `useLocalize()`. Il fork aggiorna `en/translation.json` **e** `it/translation.json`
  (inserimento alfabetico riga per riga, senza riserializzare il file).
- Novità visibili all'utente: aggiungi una voce in `client/public/changelog.json`.
- Configurazione di produzione: `file_produzione/librechat.yaml` (prima di copiarlo su un server,
  confrontalo con il yaml attivo).

## Test

Ogni modifica del fork arriva con i suoi test nello stesso commit.

### Unit (per workspace)

```bash
cd packages/api && npx jest <pattern>
cd api && npx jest <pattern>
cd client && npx jest <pattern>
cd packages/data-provider && npx jest <pattern>
cd packages/data-schemas && npx jest <pattern>
```

### E2E

Sulla macchina di Marco la porta 3080 è occupata dal container LibreChat locale: usa il prefisso
`E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180`. Prima builda il
frontend con `npm run frontend`.

```bash
# suite mock completa (Mongo in memoria, modello finto)
E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180 npm run e2e:mock

# solo lo spec del fork
E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180 \
  npx playwright test --config=e2e/playwright.config.mock.ts specs/mock/simpleai.spec.ts

# suite sui limiti (~4 min, lo script imposta E2E_LIMITS=true)
E2E_USE_MEMORY_MONGO=true E2E_BASE_URL=http://localhost:3180 E2E_PORT=3180 npm run e2e:limits
```

- Ogni modifica UI del fork aggiunge o aggiorna un test in `e2e/specs/mock/simpleai.spec.ts`.
- Un filtro `simpleai` nudo corrisponde al path del repo e lancia tutto: passa il path dello spec.
- `e2e/specs/simpleai-custom.spec.ts` gira contro la **produzione** e scrive dati: mai senza OK
  esplicito di Marco.

### Configurazione

```bash
npm run config:check   # controllo statico di file_produzione/librechat.yaml
npm run test:config    # unit test del controllo
```

`config:check` tollera solo i problemi in `config/check-librechat-config.known.json`: quelli nuovi
falliscono, quelli spariti vengono segnalati (toglili dal file).

### Prima di ogni commit e deploy

1. Unit dei workspace toccati.
2. `npm run e2e:mock`.
3. `npm run e2e:limits`.
4. `npm run config:check`.

### Fallimenti noti

- Suite limiti: un caso che fallisce per colpa del prodotto resta
  `test.fixme(true, '<ID>: fallimento noto — <comportamento>')` ed è elencato in testa a
  `e2e/specs/limits/helpers.ts` (oggi A4 e H1). Non cancellarlo né allentarlo.
- Ambientali sul Windows di Marco, non regressioni: locale `it-IT` (`formatCost`,
  `ProviderKeyRow`, costi del Trace Viewer), path/shell/symlink POSIX (`packages/api` hooks,
  plugins, `key.test`, `images.agents.test`), suite Redis `cache_integration`, spec Mongo
  replica-set (`rolePermissions`).
- E2E che falliscono anche su v0.8.8 pura: `agent-selector-caps` (agente oltre il taglio),
  `mermaid-artifacts` (export Mermaid grande).
- Un test upstream rotto da una scelta voluta del fork (es. branding) va aggiornato, non cancellato.

## Git

- Branch: `main` + branch di feature (`feature/...`, `bump/vX.Y.Z` per gli allineamenti upstream).
- Messaggi con gitmoji e in italiano: `✨ feat(scope): …`, `🐛 fix(scope): …`, `✅ test(e2e): …`,
  `🏗️ build: Rebuild client/dist con …`, `🔀 merge: Upstream LibreChat vX.Y.Z nel fork SimpleAI`.
- Una patch su bug upstream cita l'issue nel titolo e dice nel corpo quando toglierla.
- Nessun commit o push senza conferma di Marco.

## Versioni e release

- Incrementa `version` in `package.json` (`v0.8.8-simpleai.N` → `N+1`) a ogni rilascio; dopo un
  allineamento upstream riparte da `.1` sulla nuova base.
- Ricostruisci `client/dist` e committala a parte (`🏗️ build`).
- Aggiorna `docs/memory-bank/changelog.md` e, se cambia qualcosa per l'utente,
  `client/public/changelog.json`.

## Allineamento a upstream

1. `git fetch upstream --tags`, branch `bump/vX.Y.Z`, merge del tag di release (così è stato fatto
   per v0.8.6, v0.8.7 e v0.8.8; `docs/deployment-pipeline.md` indica ancora `upstream/main`).
2. Risolvi i conflitti preferendo la versione upstream; ricolloca gli agganci del fork. Se upstream
   ha risolto un problema per cui il fork aveva una patch, togli la patch.
3. Rigenera il lockfile, `package.json` a `vX.Y.Z-simpleai.1`, test completi.
4. Nel messaggio di merge elenca i conflitti risolti e cosa è stato tolto.

Procedura estesa: `docs/deployment-pipeline.md`, sezione 6.

## Deploy

Da v0.8.7 si distribuisce l'immagine `ghcr.io/digital-automations-srl/simpleai:<versione>`; il
`docker-compose.override.yml` del server punta all'immagine e monta solo `librechat.yaml` e
`api/data` (non rimontare `client/dist`). Handover e comandi di verifica:
`file_produzione/librechat_modifiche_pending.md`, sezione 0.

`docs/deployment-pipeline.md` descrive ancora in parte il modello precedente (immagine ufficiale +
`client/dist` montata via `git pull`): per il backend del fork non basta più.

Sui server tieni solo l'immagine in produzione più una precedente per il rollback; per SSH segui
`~/.claude/reference/SSH-CONNESSIONI.md`.

## Troubleshooting

- **La finestra Novità non si apre in produzione**: verifica che `client/dist/changelog.json`
  esista (lo copia il plugin `copyPublicAssets` di `client/vite.config.ts`).
- **Type-check di `packages/api` rosso con build verde**: il bundler non fa type-check; controlla
  gli export di `packages/data-schemas`.
- **E2E che si comportano diversamente in locale**: la suite mock ignora il `.env` dello
  sviluppatore e forza il locale en-US; controlla di aver usato il prefisso porta 3180.
