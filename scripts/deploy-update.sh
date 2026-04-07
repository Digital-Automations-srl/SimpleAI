#!/bin/bash
# =============================================================================
# SimpleAI — Script di deploy automatico
# Controlla aggiornamenti, build frontend, restart container, notifica via email
#
# Uso: bash deploy-update.sh
# Cron: 0 3 * * * digital_automations /home/digital_automations/librechat/scripts/deploy-update.sh
# =============================================================================

set -euo pipefail

# ─── Configurazione ──────────────────────────────────────────────────────────

REPO_DIR="/home/digital_automations/librechat"
LIBRECHAT_DIR="/home/digital_automations/librechat"
BRANCH="main"
NOTIFY_EMAIL="marco.nucci@digitalautomations.it"
HEALTH_URL="http://localhost:3080"
HEALTH_RETRIES=5
HEALTH_DELAY=5
LOG_FILE="/var/log/simpleai-update.log"

# ─── Variabili interne ───────────────────────────────────────────────────────

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
HOSTNAME=$(hostname)
OLD_VERSION=""
NEW_VERSION=""
COMMITS_LOG=""
STATUS="SUCCESS"
ERROR_PHASE=""
ERROR_MSG=""

# ─── Funzioni ────────────────────────────────────────────────────────────────

log() {
    echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"
}

send_mail() {
    local subject="$1"
    local body="$2"

    echo "$body" | mail -s "$subject" "$NOTIFY_EMAIL" 2>/dev/null || {
        log "WARN: Impossibile inviare email a $NOTIFY_EMAIL"
    }
}

send_success_mail() {
    local subject="[SimpleAI] ✅ Deploy riuscito su $HOSTNAME"
    local body
    body=$(cat <<MAIL
Deploy SimpleAI completato con successo.

Orario:     $TIMESTAMP
Server:     $HOSTNAME
Branch:     $BRANCH
Versione:   $OLD_VERSION → $NEW_VERSION

Commit inclusi:
$COMMITS_LOG

Health check: OK (HTTP 200 su $HEALTH_URL)
MAIL
)
    send_mail "$subject" "$body"
}

send_error_mail() {
    local subject="[SimpleAI] ❌ Deploy FALLITO su $HOSTNAME"
    local body
    body=$(cat <<MAIL
Deploy SimpleAI FALLITO.

Orario:     $TIMESTAMP
Server:     $HOSTNAME
Branch:     $BRANCH
Fase:       $ERROR_PHASE

Errore:
$ERROR_MSG

Controlla i log: $LOG_FILE
MAIL
)
    send_mail "$subject" "$body"
}

fail() {
    ERROR_PHASE="$1"
    ERROR_MSG="$2"
    STATUS="FAILED"
    log "ERRORE [$ERROR_PHASE]: $ERROR_MSG"
    send_error_mail
    exit 1
}

# ─── 1. Check aggiornamenti ─────────────────────────────────────────────────

log "Controllo aggiornamenti..."

cd "$REPO_DIR" || fail "INIT" "Impossibile accedere a $REPO_DIR"

git fetch origin 2>&1 | tee -a "$LOG_FILE" || fail "GIT FETCH" "git fetch fallito"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
    log "Nessun aggiornamento disponibile."
    exit 0
fi

OLD_VERSION=$(git describe --tags --always 2>/dev/null || echo "$LOCAL")
COMMITS_LOG=$(git log --oneline "$LOCAL..$REMOTE")

log "Aggiornamento trovato: $OLD_VERSION → $(git rev-parse --short origin/$BRANCH)"

# ─── 2. Pull ────────────────────────────────────────────────────────────────

log "Esecuzione git pull..."

git pull origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE" || fail "GIT PULL" "git pull fallito"

NEW_VERSION=$(git describe --tags --always 2>/dev/null || git rev-parse --short HEAD)

# ─── 3. Restart container ───────────────────────────────────────────────────

log "Restart container LibreChat..."

cd "$LIBRECHAT_DIR" || fail "RESTART" "Impossibile accedere a $LIBRECHAT_DIR"

docker compose restart api 2>&1 | tee -a "$LOG_FILE" || fail "RESTART" "docker compose restart fallito"

log "Container riavviato."

# ─── 4. Health check ────────────────────────────────────────────────────────

log "Health check in corso..."

sleep "$HEALTH_DELAY"

HEALTHY=false
for i in $(seq 1 "$HEALTH_RETRIES"); do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        HEALTHY=true
        log "Health check OK (tentativo $i/$HEALTH_RETRIES)"
        break
    fi
    log "Health check tentativo $i/$HEALTH_RETRIES: HTTP $HTTP_CODE"
    sleep "$HEALTH_DELAY"
done

if [ "$HEALTHY" = false ]; then
    CONTAINER_STATUS=$(docker compose ps api --format '{{.Status}}' 2>/dev/null || echo "sconosciuto")
    fail "HEALTH CHECK" "Il servizio non risponde dopo $HEALTH_RETRIES tentativi. Container status: $CONTAINER_STATUS"
fi

# ─── 5. Verifica container running ──────────────────────────────────────────

CONTAINER_RUNNING=$(docker compose ps api --format '{{.State}}' 2>/dev/null || echo "")
if [ "$CONTAINER_RUNNING" != "running" ]; then
    fail "HEALTH CHECK" "Container non in stato 'running'. Stato: $CONTAINER_RUNNING"
fi

# ─── 6. Notifica successo ───────────────────────────────────────────────────

log "Deploy completato: $OLD_VERSION → $NEW_VERSION"
send_success_mail

exit 0
