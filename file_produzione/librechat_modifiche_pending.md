# Modifiche pending per librechat.yaml di produzione

---

## 0. Rilascio v0.8.7-simpleai.1 su het-saas-5 (2026-07-28)

Primo rilascio con **immagine custom del fork**: le novità sono in parte backend
(rotta `POST /api/improvement-reports` col model Mongo, rotte di scrittura delle
categorie agent) e il backend **non è bind-montabile**. La strada documentata in
`docs/deployment-pipeline.md` — immagine ufficiale + `client/dist` montata — pubblica
solo il frontend, quindi con quella quelle rotte darebbero 404.

Immagine pubblicata e verificata:
```
ghcr.io/digital-automations-srl/simpleai:v0.8.7-simpleai.1
digest sha256:53ad85fde5489c48b319f7b717a8a362049c240bf0a3662422fd99c27cb8624b
```

### Due conflitti da risolvere prima di avviare

1. **Nomi container identici.** Il `docker-compose.yml` di SimpleAI usa
   `container_name: LibreChat`, `chat-mongodb`, `chat-meilisearch`, `vectordb`,
   `rag_api` — gli stessi cinque nomi dell'istanza vanilla in
   `/home/digital_automations/LibreChat`. Essendo `container_name` espliciti, il
   conflitto avviene anche cambiando nome al progetto compose.
2. **Porte.** L'api mappa `"${PORT}:${PORT}"` e mongo `27017:27017`; la vanilla
   occupa già 3080 e 27017.

Le due istanze **non possono coesistere** così come sono: o si ferma la vanilla, o si
rinominano i container e si cambia `PORT` nel `.env` di SimpleAI.

### Passi

```bash
# 0. Ferma la vanilla (se si sceglie di non far coesistere le istanze)
cd /home/digital_automations/LibreChat && docker compose down

# 1. Aggiorna il repo
cd /home/digital_automations/SimpleAI
git checkout -- docker-compose.yml          # scarta la modifica locale malformata:
                                            # ha volumi elencati sotto env_file
rm -f packages/client/rollup.config-*.cjs   # temporaneo residuo
git pull origin main
git log -1 --format='%h %s'                 # atteso: b9194729f
```

`docker-compose.override.yml` deve diventare:
```yaml
services:
  api:
    image: ghcr.io/digital-automations-srl/simpleai:v0.8.7-simpleai.1
    volumes:
      - type: bind
        source: ./librechat.yaml
        target: /app/librechat.yaml
      - ./api/data:/api/data
  mongodb:
    image: mongo:8.2
```

> **Rimuovere il mount `./client/dist:/app/client/dist`.** Con l'immagine custom la
> dist è dentro l'immagine; quella sul server è di aprile e monterla declasserebbe il
> frontend alla versione vecchia, vanificando il rilascio.

```bash
# 2. Avvia. NON usare "docker compose pull": l'immagine è già nello store del
#    daemon (scaricata da marco_nucci) e digital_automations non ha credenziali GHCR.
docker compose up -d
```

### librechat.yaml

Non serve più scrivere modifiche a mano: `file_produzione/librechat.yaml` in questo
repo è ora allineato al rilascio (region Vertex `global`, 9 modelli Anthropic, 9 Azure,
8 modelSpecs con etichette leggibili e icone). Va copiato sopra quello dell'istanza,
conservandone eventuali differenze locali.

### .env — valori da allineare

Riferimento: il `.env` dell'istanza vanilla `/home/digital_automations/LibreChat`, dove
questi valori sono già in uso e verificati.

```bash
ENDPOINTS=azureOpenAI,google,anthropic,agents
AZURE_API_VERSION=2025-04-01-preview
OPENAI_API_VERSION=2025-04-01-preview
EMBEDDINGS_PROVIDER=azure
EMBEDDINGS_MODEL=text-embedding-3-small
CHECK_BALANCE=true
START_BALANCE=1000000000
ANTHROPIC_MODELS=claude-sonnet-5@default,claude-fable-5@default,claude-opus-4-8@default,claude-opus-4-7@default,claude-opus-4-6@default,claude-opus-4-5@20251101,claude-sonnet-4-6@default,claude-sonnet-4-5@20250929,claude-haiku-4-5@20251001
GOOGLE_MODELS=gemini-3.1-pro-preview,gemini-3-flash-preview,gemini-2.5-pro,gemini-2.5-flash
```

**`GOOGLE_KEY` va rimossa o commentata se presente.** Con `GOOGLE_KEY=user_provided`
LibreChat considera l'endpoint Google come "chiave fornita dall'utente" e ignora
`GOOGLE_SERVICE_KEY_FILE`: Gemini risponde "Nessuna chiave trovata". Sulla vanilla la
variabile non esiste, ed è per questo che là funziona.

Perché `ENDPOINTS` conta: senza quella variabile LibreChat mostra *tutti* gli endpoint,
compreso `openAI` che non è configurato — l'utente lo sceglie e ottiene un errore.

### Verifica

```bash
PORT=$(grep -E '^PORT=' .env | cut -d= -f2)
docker compose exec api sh -c 'grep -m1 version /app/package.json'   # v0.8.7-simpleai.1
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:$PORT/api/improvement-reports -d '{}' -H 'Content-Type: application/json'
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:$PORT/api/agents/categories  -d '{}' -H 'Content-Type: application/json'
curl -s -o /dev/null -w '%{http_code}\n' localhost:$PORT/changelog.json
```

Attesi `401`, `401`, `200`: sono gli stessi tre esiti verificati in locale
sull'immagine prima della pubblicazione. Un `404` sulle prime due significa che sta
girando l'immagine ufficiale invece della nostra.

### Rollback

```bash
cd /home/digital_automations/SimpleAI && docker compose down
cd /home/digital_automations/LibreChat && docker compose up -d
```

Il commit di aprile (`b0862b6f0`) e l'immagine `v0.8.6-simpleai.1` restano entrambi
disponibili.

---

## 1. ModelSpecs — Modelli con reasoning preconfigurato (task #10370/#10372) — APPLICATO

> Applicato il 2026-07-28: gli spec sono ora in `file_produzione/librechat.yaml`,
> estesi a 8 voci con etichette leggibili, descrizioni e icone. Sezione lasciata
> come riferimento storico.

Aggiungere in fondo al file `librechat.yaml`:

```yaml
modelSpecs:
  list:
    - name: "gpt-5.2-reasoning"
      label: "GPT-5.2 Reasoning"
      description: "GPT-5.2 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5.2"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"

    - name: "gpt-5.1-reasoning"
      label: "GPT-5.1 Reasoning"
      description: "GPT-5.1 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5.1"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"

    - name: "gpt-5-reasoning"
      label: "GPT-5 Reasoning"
      description: "GPT-5 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"
```

## 2. Agents share — Tasto condivisione (task #10418)

GIA' APPLICATO nel file. La riga `agents: true` e' stata espansa in:

```yaml
  agents:
    use: true
    create: true
    share: true
```

## 3. Code Interpreter self-hosted (LibreCodeInterpreter)

Permette agli agenti di eseguire codice (capability `execute_code`, gia' attiva in
`librechat.yaml`) senza abbonamento al servizio ufficiale `code.librechat.ai`.

Repo: https://github.com/usnavy13/LibreCodeInterpreter (Apache 2.0).
API compatibile con il Code Interpreter di LibreChat: sandbox nsjail, 13 linguaggi,
include Redis e Garage (S3) nel proprio compose. Richiede host Linux (cap SYS_ADMIN
e NET_ADMIN sul container, gia' previste nel suo docker-compose).

### Procedura sul server di produzione

```bash
# 1. Clona e configura (stack separato, NON dentro ~/SimpleAI)
git clone https://github.com/usnavy13/LibreCodeInterpreter.git ~/LibreCodeInterpreter
cd ~/LibreCodeInterpreter
cp .env.example .env

# 2. Nel .env imposta almeno:
#    API_KEY=<chiave-robusta-generata>          (es. openssl rand -hex 32)
#    MASTER_API_KEY=<altra-chiave-robusta>      (per admin dashboard/CLI)
#    PORT=8000                                  (porta host, default; libera sul server)
# NB: la porta 8000 e' pubblicata su 0.0.0.0 — se il server e' esposto su internet,
#     limitarla con firewall (ufw) o bindarla a 127.0.0.1 via docker-compose.override

# 3. Avvia
docker compose pull && docker compose up -d

# 4. Test diretto dell'API
curl -s -X POST http://localhost:8000/exec \
  -H "x-api-key: <API_KEY>" -H "Content-Type: application/json" \
  -d '{"lang":"py","code":"print(2+2)"}'

# 5. Nel .env di LibreChat (~/SimpleAI/.env) aggiungi:
#    LIBRECHAT_CODE_BASEURL=http://<API_KEY>@host.docker.internal:8000
#    LIBRECHAT_CODE_API_KEY=<API_KEY del punto 2>
#    (host.docker.internal funziona: extra_hosts gia' configurato nel compose di LibreChat)
#    NB da v0.8.6 la chiave DEVE stare embedded nel URL (Basic auth):
#    il nuovo bash_tool non invia piu' l'header x-api-key.

# 6. Restart LibreChat
cd ~/SimpleAI && docker compose restart api
```

### Verifica finale

In SimpleAI: creare/aprire un agente con "Esegui codice" attivo e chiedere ad es.
"esegui in python print(2+2)". Con `LIBRECHAT_CODE_API_KEY` impostata a livello di
sistema gli utenti non devono inserire alcuna chiave personale.

### Note tecniche

- Il base URL va indicato SENZA `/v1`: LibreChat chiama `${BASEURL}/exec` e
  LibreCodeInterpreter espone `/exec` e le route file alla root.
- Admin dashboard su `http://<server>:8000/admin-dashboard` (richiede MASTER_API_KEY);
  da li' (o con `scripts/api_key_cli.py`) si possono creare chiavi con rate limit.
- L'esecuzione codice consuma CPU/RAM dell'host: monitorare il carico; i limiti per
  esecuzione si regolano nel .env di LibreCodeInterpreter (sezione Resources).

## Note

- Dopo aver applicato le modifiche, serve restart del container LibreChat
- I modelSpecs appaiono nel selettore modelli raggruppati sotto Azure OpenAI
- L'utente seleziona "GPT-5.2 Reasoning" e il reasoning funziona senza configurare nulla
- I modelli standard (senza reasoning) restano disponibili come prima
