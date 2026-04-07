# Pipeline di messa in produzione — SimpleAI

Documento di riferimento per il deploy delle versioni custom di SimpleAI (fork di LibreChat).

---

## Pipeline in sintesi

```
[PC sviluppatore]                        [Server produzione]
Modifica codice                          git pull
      ↓                                        ↓
npm run build (compila client/dist/)     docker compose restart api
      ↓                                        ↓
git commit + git push                    ✅ Online con le modifiche
```

**Principio chiave**: la build si fa sul PC dello sviluppatore, mai sul server. Il server fa solo `git pull` + restart.

---

## 1. Sviluppo e test in locale

### Requisiti
- Node.js v20 LTS (v20.19.0+)
- Docker Desktop
- Repository clonato: `https://github.com/Digital-Automations-srl/SimpleAI.git`

### Test locale con dev server (veloce, per iterare)
```bash
npm run smart-reinstall     # installa dipendenze + build pacchetti
npm run backend:dev         # porta 3080
npm run frontend:dev        # porta 3090, proxy verso 3080
```

### Test locale con Docker (simula la produzione)
Configurare `docker-compose.override.yml` locale:
```yaml
services:
  api:
    image: ghcr.io/danny-avila/librechat:v0.8.2
    volumes:
      - type: bind
        source: ./librechat.yaml
        target: /app/librechat.yaml
      - ./api/data:/api/data
      - ./client/dist:/app/client/dist
```
```bash
docker compose up -d
```

---

## 2. Build e push

Quando le modifiche sono pronte e testate:

```bash
# Pulire cache e compilare tutto
# Su Windows, rimuovere .turbo e client/dist prima se necessario
npm run build               # compila tutti i pacchetti + client/dist via Turbo

# Verificare che la build esista
ls client/dist/index.html

# Commit e push (la dist è tracciata da Git)
git add -A
git commit -m "feat: descrizione della modifica"
git push origin main
```

`client/dist/` è inclusa nel repository (rimossa dal `.gitignore`), quindi il server riceve la build già compilata.

---

## 3. Deploy su server di produzione

### Aggiornamento di routine
```bash
cd ~/SimpleAI
git pull && docker compose restart api
```

Questo è tutto. Solo il container `api` (LibreChat) viene riavviato. MongoDB, Meilisearch, vectordb e rag_api **non vengono toccati** → i dati sono al sicuro.

### Quando usare `down + up` (raro)
Usare solo se si modifica `docker-compose.yml`, `docker-compose.override.yml` o le immagini Docker:
```bash
docker compose down && docker compose up -d
```

---

## 4. Configurazione server di produzione

### File che vivono SOLO sul server (non nel repo)

Questi file sono nel `.gitignore` e vanno configurati manualmente su ogni server:

| File | Scopo |
|---|---|
| `docker-compose.override.yml` | Immagini Docker, volumi locali, override specifici del server |
| `.env` | Chiavi API, credenziali, configurazione ambiente |
| `librechat.yaml` | Endpoint AI, modelli, configurazione applicativa |
| `api/data/auth.json` | Service account Google Cloud (Vertex AI) |
| `data-node/` | Dati MongoDB (volume Docker) |

### docker-compose.override.yml (template server)
```yaml
services:
  api:
    image: ghcr.io/danny-avila/librechat:v0.8.2
    volumes:
      - type: bind
        source: ./librechat.yaml
        target: /app/librechat.yaml
      - ./api/data:/api/data
      - ./client/dist:/app/client/dist
  mongodb:
    image: mongo:8.2
```

**Nota**: l'immagine MongoDB deve corrispondere alla versione dei dati in `data-node/`. Non fare downgrade (es. da 8.2 a 8.0) altrimenti MongoDB non parte.

### Setup iniziale di un nuovo server
```bash
# 1. Clona il repo
git clone git@github.com:Digital-Automations-srl/SimpleAI.git ~/SimpleAI
cd ~/SimpleAI

# 2. Crea i file di configurazione locali
nano .env                           # copia da template o da altro server
nano librechat.yaml                 # configurazione endpoint/modelli
nano docker-compose.override.yml    # vedi template sopra
# Copiare api/data/auth.json se necessario (Vertex AI)

# 3. Avvia
docker compose up -d

# 4. Crea utente admin
docker exec LibreChat node /app/config/create-user.js

# 5. Configura cron per aggiornamenti automatici (opzionale)
chmod +x scripts/deploy-update.sh
crontab -e
# Aggiungi: 0 3 * * * /home/digital_automations/SimpleAI/scripts/deploy-update.sh
```

---

## 5. Automazione (script deploy-update.sh)

Lo script `scripts/deploy-update.sh` automatizza il deploy via cron:

1. `git fetch` + confronto hash → se non ci sono aggiornamenti, esce silenziosamente
2. `git pull` → scarica il nuovo codice + dist compilata
3. `docker compose restart api` → riavvia solo il container app
4. Health check → verifica HTTP 200 e container running
5. Email di notifica → successo o errore via msmtp

Configurazione msmtp: vedi `scripts/msmtp-setup.md`.

---

## 6. Aggiornamenti upstream (LibreChat)

Il repository SimpleAI è un **fork** di `danny-avila/LibreChat`. Per incorporare aggiornamenti upstream:

```bash
# Configurazione iniziale (una sola volta)
git remote add upstream https://github.com/danny-avila/LibreChat.git

# Aggiornamento
git fetch upstream
git diff upstream/main --name-only    # verifica quali file cambiano
git merge upstream/main               # merge (risolvere conflitti se necessario)
npm run build                         # ricompilare il frontend
git push origin main                  # push con la nuova build
```

**Linea guida**: verificare sempre i file cambiati prima del merge. Se toccano file che abbiamo modificato, risolvere i conflitti manualmente.

---

## 7. Struttura container

| Container | Immagine | Ruolo | Dati persistenti |
|---|---|---|---|
| `LibreChat` | `ghcr.io/.../librechat:v0.8.2` | API + Frontend | No (stateless, dist montata) |
| `chat-mongodb` | `mongo:8.2` | Database | `data-node/` |
| `chat-meilisearch` | `getmeili/meilisearch:v1.35.1` | Ricerca full-text | `meili_data_v1.35.1/` |
| `vectordb` | `pgvector/pgvector:0.8.0-pg15-trixie` | Vector DB (RAG) | volume `pgdata2` |
| `rag_api` | `librechat-rag-api-dev-lite:latest` | API RAG | No |

### Path nel container LibreChat

| Path | Contenuto |
|---|---|
| `/app/client/dist/` | **Build frontend** (montata da host) |
| `/app/.env` | Configurazione (montata da host) |
| `/app/librechat.yaml` | Config YAML (montata da host) |
| `/api/data/` | Service account e dati auth (montata da host) |

---

## Checklist pre-deploy

- [ ] Modifiche testate in locale (dev server o Docker)
- [ ] `npm run build` completata senza errori (5/5 tasks)
- [ ] `client/dist/index.html` esiste
- [ ] Commit include sia i sorgenti modificati che `client/dist/`
- [ ] Push su `origin/main`
- [ ] Sul server: `git pull && docker compose restart api`
- [ ] Verifica: pagina caricata su `http://<server>:3080`
