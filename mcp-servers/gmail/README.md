# gmail-mcp

Server MCP (Streamable HTTP, stateless) che dà agli agenti SimpleAI accesso alla casella Gmail **dell'utente che lo usa**.

| Tool | Cosa fa |
|---|---|
| `gmail_search` | Ricerca con la sintassi Gmail (`from:`, `subject:`, `newer_than:7d`, `in:draft`…) |
| `gmail_read` | Testo completo di un'email o di una bozza |
| `gmail_create_draft` | Salva una bozza, anche in risposta a un'email esistente (stesso thread) |

**Non esiste un tool di invio**: l'utente rivede la bozza e la invia da Gmail.

## Come funziona l'autenticazione

LibreChat fa da client OAuth verso Google con i parametri in `librechat.yaml` (`mcpServers.gmail.oauth`). Quando l'utente preme "Connetti", ottiene il token e lo passa al server come `Authorization: Bearer`; il server lo inoltra alle API Gmail e non salva nulla. Senza token risponde `401 WWW-Authenticate: Bearer`.

Scope richiesti: `gmail.readonly` + `gmail.compose`.

## Setup

### 1. OAuth client su Google Cloud

Nel progetto GCP (console → *API e servizi*):

1. **Abilita la Gmail API**.
2. **Schermata consenso OAuth**:
   - tipo **Interno** se la casella usata è di `digitalautomations.it`: nessuna verifica Google necessaria;
   - tipo **Esterno** in modalità *Test* per una casella `@gmail.com`: aggiungerla tra gli utenti di test. In questa modalità il refresh token scade dopo 7 giorni.
3. **Credenziali → Crea ID client OAuth → Applicazione web**, con URI di reindirizzamento autorizzato:
   ```
   https://lbc.digitalautomations.it/api/mcp/gmail/oauth/callback
   ```
   Il formato è `${DOMAIN_SERVER}/api/mcp/<nome server>/oauth/callback`. Per il locale aggiungere anche `http://localhost:3080/api/mcp/gmail/oauth/callback`.

### 2. `.env` di LibreChat

```
GMAIL_OAUTH_CLIENT_ID=<client id>
GMAIL_OAUTH_CLIENT_SECRET=<client secret>
```

### 3. `librechat.yaml`

Il blocco `gmail` sotto `mcpServers` e `mcpSettings.allowedAddresses: ["gmail-mcp:8000"]` sono già in `file_produzione/librechat.yaml`. Senza `allowedAddresses` la protezione anti-SSRF blocca l'hostname interno Docker.

### 4. Container

Nel `docker-compose.override.yml` sul server:

```yaml
services:
  gmail-mcp:
    build: ./mcp-servers/gmail
    container_name: gmail-mcp
    restart: unless-stopped
```

Stessa rete di default del compose, quindi `api` lo raggiunge come `gmail-mcp:8000`. Nessuna porta esposta verso l'esterno.

```bash
docker compose up -d --build gmail-mcp
docker compose restart api
```

## Uso

1. In chat o nell'Agent Builder aggiungere il server MCP **Gmail** e premere "Connetti": si apre il login Google.
2. Negli agenti, abilitare i tool `gmail_*`.

## Sviluppo locale

```bash
npm install
npm start          # porta 8000, variabile PORT per cambiarla
npm run typecheck
```

Il server gira direttamente come TypeScript (type stripping nativo di Node ≥ 22.18), senza build.
