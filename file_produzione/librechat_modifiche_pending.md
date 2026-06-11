# Modifiche pending per librechat.yaml di produzione

## 1. ModelSpecs — Modelli con reasoning preconfigurato (task #10370/#10372)

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
