# Pipeline di messa in produzione — SimpleAI

Documento di riferimento per il deploy delle versioni custom di SimpleAI (fork di LibreChat).
Basato sulla sessione tecnica Marco Nucci / Silvio Benvegnù del 07/04/2026.

---

## Contesto

SimpleAI utilizza le immagini Docker ufficiali di LibreChat. Il container `LibreChat` (servizio `api`) contiene un proprio filesystem con il codice già compilato. Le modifiche ai sorgenti locali **non hanno effetto** a meno che non vengano compilate e montate nel container.

### Cosa NON funziona

| Approccio | Perché non funziona |
|---|---|
| Modificare i file `.ts`/`.tsx` locali e riavviare il container | Il container usa la propria build pre-compilata, ignora i sorgenti |
| Montare la cartella `src/` nel container via volume | Il server Express serve i file dalla cartella `dist/` (build Vite compilata), non i sorgenti TypeScript |

### Cosa funziona

Il container serve il frontend dalla cartella **`/app/client/dist/`**. Montando una build personalizzata in quel path, il container utilizza il nostro codice al posto di quello ufficiale.

---

## Strategia di deploy

```
Sviluppo locale → Build frontend → Push su repo Git → Pull su server produzione → Restart container
```

### 1. Sviluppo e test in locale

Le modifiche vengono fatte sui sorgenti nel repository forkato. Per testare localmente si può:

- **Opzione A — Build locale con Docker** (completa ma lenta, ~10 min):
  ```bash
  # In docker-compose.override.yml abilitare la local build:
  # services:
  #   api:
  #     image: librechat
  #     build:
  #       context: .
  #       target: node

  docker compose down
  docker compose build --no-cache api
  docker compose up -d
  ```

- **Opzione B — Dev server diretto** (veloce, per iterare):
  ```bash
  npm run smart-reinstall
  npm run backend:dev      # porta 3080
  npm run frontend:dev     # porta 3090, proxy verso 3080
  ```

### 2. Build del frontend

Quando le modifiche sono pronte e testate:

```bash
# Requisito: Node.js 20 LTS (v20.19.0+)
node --version  # verificare

# Installare dipendenze e compilare
npm run smart-reinstall   # installa + build pacchetti
npm run frontend          # build del client (genera client/dist/)
```

Il Dockerfile ufficiale esegue esattamente questi step:
```dockerfile
NODE_OPTIONS="--max-old-space-size=6144" npm run frontend
npm prune --production
npm cache clean --force
```

L'output della build si trova in **`client/dist/`** e contiene:
```
client/dist/
├── assets/          # JS/CSS compilati con hash
├── index.html
├── manifest.webmanifest
├── registerSW.js
├── robots.txt
├── sw.js
└── workbox-*.js
```

### 3. Push della build

La cartella `client/dist/` viene committata e pushata sul repository Git del team.

```bash
git add client/dist/
git commit -m "build: frontend v<versione>"
git push
```

> **Nota**: normalmente `dist/` è in `.gitignore`. Per questa strategia va rimosso dal gitignore oppure si usa un repository separato per i build artifacts.

### 4. Deploy su server di produzione

Sul server di produzione:

```bash
# Pull della nuova build
cd /path/to/simpleai-builds
git pull

# Restart del container (il volume monta automaticamente la nuova dist)
cd /path/to/librechat
docker compose restart api
```

### 5. Configurazione Docker in produzione

Il `docker-compose.yml` di produzione usa le immagini ufficiali LibreChat. Il `docker-compose.override.yml` monta la build custom:

```yaml
services:
  api:
    volumes:
      - type: bind
        source: ./librechat.yaml
        target: /app/librechat.yaml
      - ./api/data:/api/data
      # Build frontend custom — sovrascrive la dist ufficiale
      - /path/to/simpleai-builds/client/dist:/app/client/dist
```

I restanti 4 container (mongodb, meilisearch, vectordb, rag_api) restano invariati con le immagini ufficiali.

---

## Automazione (cron notturno)

Per aggiornare automaticamente tutte le installazioni dei clienti:

```bash
#!/bin/bash
# /opt/scripts/simpleai-update.sh
# Eseguire via cron alle 03:00: 0 3 * * * /opt/scripts/simpleai-update.sh

cd /path/to/simpleai-builds

OUTPUT=$(git pull 2>&1)

if echo "$OUTPUT" | grep -q "Already up to date"; then
    echo "Nessun aggiornamento disponibile"
    exit 0
fi

echo "Aggiornamento trovato, restart container..."
cd /path/to/librechat
docker compose restart api
echo "Deploy completato: $(date)"
```

---

## Aggiornamenti upstream (LibreChat)

Il repository SimpleAI è un **fork** di `danny-avila/LibreChat`. Per incorporare aggiornamenti upstream (fix di sicurezza, nuove feature):

```bash
# Configurazione iniziale (una sola volta)
git remote add upstream https://github.com/danny-avila/LibreChat.git

# Aggiornamento
git fetch upstream
git merge upstream/main
```

In caso di conflitti, Git segnalerà i file con marcatori `<<<<<<<` / `>>>>>>>`. Risolvere manualmente controllando che le nostre modifiche custom siano preservate.

**Linea guida**: accettare aggiornamenti upstream solo quando riguardano file che non abbiamo modificato, oppure fix di sicurezza critici. Verificare sempre con `git diff upstream/main --name-only` quali file sono cambiati prima di fare il merge.

---

## Struttura del container

| Container | Immagine | Ruolo | Personalizzato? |
|---|---|---|---|
| `LibreChat` | `registry.librechat.ai/.../librechat-dev:latest` | API Express + Frontend | Sì (mount dist/) |
| `chat-mongodb` | `mongo:8.0.17` | Database | No |
| `chat-meilisearch` | `getmeili/meilisearch:v1.35.1` | Ricerca full-text | No |
| `vectordb` | `pgvector/pgvector:0.8.0-pg15-trixie` | Vector DB per RAG | No |
| `rag_api` | `librechat-rag-api-dev-lite:latest` | API RAG | No |

### Path nel container LibreChat

| Path | Contenuto |
|---|---|
| `/app/` | Root del progetto |
| `/app/client/dist/` | **Build frontend** (quello che montiamo) |
| `/app/client/src/` | Sorgenti TypeScript (non usati a runtime) |
| `/app/api/` | Backend Express |
| `/app/.env` | Configurazione (montato da host) |
| `/app/librechat.yaml` | Config YAML (montato da host) |
| `/api/data/` | Dati auth (es. Google service account) |

---

## Riepilogo dei file di configurazione

| File | Posizione | Scopo |
|---|---|---|
| `docker-compose.yml` | Root progetto | Definizione servizi Docker (non modificare) |
| `docker-compose.override.yml` | Root progetto | Override: mount volumi, build locale |
| `.env` | Root progetto | Variabili d'ambiente (chiavi API, DB, ecc.) |
| `librechat.yaml` | Root progetto | Configurazione applicativa (endpoint, modelli, UI) |
| `Dockerfile` | Root progetto | Build immagine custom (per build locale) |

---

## Validazione tecnica

Verifiche effettuate durante la sessione del 07/04/2026:

- [x] Il mount di `src/` nel container **non funziona** — il server serve da `dist/`
- [x] La build locale del frontend genera `client/dist/` correttamente
- [x] Il mount di `client/dist/` nel container tramite volume **funziona**
- [x] Il container con dist custom serve correttamente il frontend modificato
- [x] I restanti container (mongo, meilisearch, vectordb, rag_api) non richiedono modifiche
- [x] Il Dockerfile ufficiale di LibreChat supporta la local build (`docker-compose.override.yml` con `build: context: .`)
