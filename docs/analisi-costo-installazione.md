# Analisi costo per installazione SimpleAI

**Data analisi:** 17 aprile 2026
**Autore:** Marco Nucci (con assistenza Claude Code)
**Destinatari:** Tommaso Cardone (PM), team DA

---

## 1. Obiettivo

Capire **quanto costa a Digital Automations mantenere una singola installazione di SimpleAI**, separando:
- i costi fissi di struttura (sistemista + infrastruttura)
- i costi variabili legati all'utilizzo (API AI)
- il peso relativo delle attività di sviluppo vs puro sistemistico

Il risultato deve servire a:
- verificare la marginalità per tenant
- stimare il break-even per una nuova installazione
- identificare voci di costo non ancora tracciate formalmente

---

## 2. Perimetro

Attualmente gestiamo **9 installazioni di LibreChat/SimpleAI** in totale:
- **7 macchine SaaS** sul fleet Hetzner (nominate `het-saas-1, 3, 4, 5, 6, 7, 8`, la `2` manca dalla sequenza storica)
- **2 installazioni non-SaaS** (probabilmente on-prem cliente o server dedicati al di fuori del fleet principale — da confermare con Gianpaolo)

Per ciascuna macchina SaaS c'è un container `chat-mongodb` con il DB `LibreChat` e un tenant dedicato. I tenant attuali:

| Macchina | Tenant | IP Tailscale |
|---|---|---|
| het-saas-1 | Digital Automations (uso interno) | 100.67.34.70 |
| het-saas-3 | Brahma | 100.111.18.5 |
| het-saas-4 | Cimolai | 100.77.39.78 |
| het-saas-5 | DA (nuova, aggiunta 17/04/2026) | 100.90.189.123 |
| het-saas-6 | Giotto Innovazione | 100.122.147.17 |
| het-saas-7 | VCA Partners | 100.72.15.85 |
| het-saas-8 | Coesi Coop | 100.111.10.6 |

---

## 3. Metodologia

Il ragionamento si è articolato in 5 passaggi. Ciascuno produce un numero o una stima che alimenta il modello finale.

### Passaggio 1 — Raccolta dati di utilizzo reali dalle 7 macchine SaaS

È stato usato uno script nuovo (`config/cost-per-user-remote.js`) che si connette via SSH a ciascuna macchina, esegue query `mongosh` sul DB `LibreChat` e aggrega:
- utenti registrati e attivi (almeno 1 transazione in 30 gg)
- token consumati (prompt + completion) per utente e per modello
- numero di messaggi e transazioni

**Risultato (ultimi 30 giorni):**

| Metrica | Valore |
|---|---:|
| Utenti registrati totali | **178** |
| Utenti attivi totali | **102** |
| Token totali | **645 M** (628M prompt, 17M completion) |
| Messaggi totali | 16.149 |
| Transazioni totali | 20.385 |

Il rapporto **prompt/completion ≈ 37×** indica un uso dominato da input lunghi (documenti, contesti RAG) con output brevi, più che chat conversazionali.

### Passaggio 2 — Calcolo costi API reali con listini dei provider

Partendo dai token per modello abbiamo applicato i listini aggiornati a aprile 2026 dei tre provider (Anthropic, Azure OpenAI, Google Vertex):

| Provider | Modello | $/M input | $/M output |
|---|---|---:|---:|
| Anthropic | Claude Opus 4.6 / 4.5 | $5.00 | $25.00 |
| Anthropic | Claude Sonnet 4.6 / 4.5 | $3.00 | $15.00 |
| Anthropic | Claude Haiku 4.5 | $1.00 | $5.00 |
| Azure OpenAI | GPT-5 / 5.1 | $1.25 | $10.00 |
| Azure OpenAI | GPT-5.2 | $0.875 | $7.00 |
| Google Vertex | Gemini 2.5 Pro | $1.25 | $10.00 |
| Google Vertex | Gemini 2.5 Flash | $0.15 | $0.60 |
| Google Vertex | Gemini 3 Pro / 3.1 Pro Preview | $2.00 | $12.00 |
| Google Vertex | Gemini 3 Flash Preview | $0.50 | $3.00 |

**Risultato: ~$2.016 USD/mese di sola API per le 7 macchine.**

Distribuzione per modello:
- **Claude Sonnet 4.6**: $946 (47% della spesa)
- **Claude Opus 4.6**: $729 (36%)
- **GPT-5.2**: $127 (6%)
- Altri: $214 (11%)

**Claude assorbe l'83% della spesa**, soprattutto concentrato su 2 tenant (DA interno e Brahma).

Variabilità per utente attivo:
- media fleet: **~$20/utente/mese**
- range: da $3/utente (VCA Partners) a **$138/utente (Brahma)** — un outlier forte dovuto a un singolo utente pesante (Aaqib Khatibi, 140M token al mese da solo).

**Limite della stima:** non tiene conto dello sconto da prompt caching (fino al 90% su Claude/Gemini), se attivo in produzione il reale può essere 30-50% inferiore.

### Passaggio 3 — Recupero ore Gianpaolo da Odoo

Obiettivo: capire quanto tempo-persona costa mantenere la piattaforma. Inizialmente cercato sul progetto "SimpleAI" di Odoo, ma trovate solo 9h (sul nuovo "SimpleAI 2.0"). Marco ha segnalato che il tracking reale del sistemista è sul progetto **1395 — Ricerca e Sviluppo - RPA - Digital Automations - Studio e test su Librechat/SimpleAI**.

**Ore totali progetto 1395 (ottobre 2025 → aprile 2026, ~7 mesi):**

| Dipendente | Ore |
|---|---:|
| **Gianpaolo Manfrini** | **319h 50m** (84%) |
| Marco Nucci | 34h 05m |
| Ardit Kurti | 20h 00m |
| Tommaso Cardone | 5h 15m |
| Silvio Benvegnù | 2h 00m |
| **Totale** | **381h 10m** |

Media mensile Gianpaolo: **45.7h/mese**, con picchi a gennaio (76h) e febbraio (77h) 2026 (quasi half-time in quel periodo). Aprile 2026 è parziale (9h al giorno 2).

### Passaggio 4 — Categorizzazione attività Gianpaolo (DEV vs OPS)

Le 112 voci di timesheet di Gianpaolo sono state classificate via regex sulle descrizioni in due macro-categorie:

**DEV (sviluppo nuova piattaforma / R&D)** — 236.6h (**74%**)
- Progetto **SYNCROBOT** (sistema di sincronizzazione multi-installazione) — voce dominante da dicembre 2025
- **Pannello KPI / dashboard statistiche bot**
- **Cpanel gestione spese cross-installazione**
- **Customers Dashboard**
- **Integrazione LiteLLM + Langfuse** in sandbox (tracking consumi unificato)
- **Ricerca disk encryption** (LUKS → gocryptfs)
- **Implementazione gestione balance/credito utenti**
- **Progettazione struttura dati Supabase** per gestione ricariche token
- Override sorgenti LibreChat, Agents AI
- Ricerche su API Bedrock, OpenAI Azure, calcolo token

**OPS (sistemistico / manutenzione)** — 83.1h (**26%**)
- **Setup tenant** (Cimolai, Brahma, Giotto, Coesi, Verduci, Staging)
- **Configurazione SSL, DNS, OAuth** (Microsoft, Google) per singole installazioni
- **Riconfigurazione standardizzata .env** su tutte le macchine
- **Script di update automatico** sulle 8 macchine
- **Troubleshooting produzione**: problemi Azure openai, Anthropic su Cimolai, Google web search, upload documenti Office
- **Attivazione modelli Vertex** su tutte le macchine (incluso tenant specifici)
- **Configurazione chiavi API** Vertex + Azure
- Fleet ops (riconfigurazione 8 macchine, test connettività)

**Bug fix puri**: solo 0.5h in 7 mesi. Segno che la piattaforma LibreChat upstream è stabile e la maggior parte del tempo è costruzione nuova.

### Passaggio 5 — Attribuzione del tempo alle installazioni

Gianpaolo lavora su tutto il fleet, non su una singola installazione. Seguendo l'indicazione di Marco, abbiamo diviso le sue ore equamente sulle **9 installazioni totali**.

**Media mensile per installazione:**

| | Ore | Costo @ €40/h |
|---|---:|---:|
| S1 — tutte le ore | 5.08h | **€203.03** |
| S2 — solo OPS | 1.32h | **€52.79** |

---

## 4. Ipotesi di lavoro concordate

| Parametro | Valore | Fonte |
|---|---|---|
| Tariffa oraria Gianpaolo | **€40/h** | indicazione Marco |
| Costo VM Hetzner mensile | **€5.29/mese per macchina** | indicazione Marco (coerente con CX22) |
| Costo utente mensile | **€15/mese/utente attivo** | indicazione Marco (forfait semplificato per gestione commerciale) |
| Periodo analisi ore | 7 mesi (ott 2025 → apr 2026) | timesheet Odoo |
| Periodo analisi consumi | ultimi 30 giorni | snapshot al 17/04/2026 |
| Installazioni totali | 9 | indicazione Marco |

---

## 5. Risultato finale

### Costo base per installazione (senza utenti)

Componenti fisse indipendenti dal numero di utenti:

| Scenario | Gianpaolo | VM | **Totale/mese** |
|---|---:|---:|---:|
| **S1 — tutti gli sviluppi inclusi** | €203.03 | €5.29 | **€208.32** |
| **S2 — solo attività sistemistiche** | €52.79 | €5.29 | **€58.08** |

Annualizzato per 9 installazioni:
- S1: **€22.499/anno**
- S2: **€6.273/anno**

La differenza (**€150/install/mese = €16.225/anno**) rappresenta l'**investimento in nuova piattaforma** (SYNCROBOT, dashboard KPI, sandbox LiteLLM, ecc.) — un costo che oggi pesa su ogni installazione ma che si amortizzerà quando questi tool passeranno in produzione stabile.

### Costo completo per installazione (con utenti @ €15)

| Installazione | Utenti attivi | S1 (con dev) | S2 (solo ops) |
|---|---:|---:|---:|
| het-saas-1 (DA) | 16 | €448.32 | €298.08 |
| het-saas-3 (Brahma) | 4 | €268.32 | €118.08 |
| het-saas-4 (Cimolai) | 47 | €913.32 | €763.08 |
| het-saas-5 (DA) | 6 | €298.32 | €148.08 |
| het-saas-6 (Giotto) | 5 | €283.32 | €133.08 |
| het-saas-7 (VCA) | 10 | €358.32 | €208.08 |
| het-saas-8 (Coesi) | 14 | €418.32 | €268.08 |

**Media installazione SaaS** (14.6 utenti):
- S1: **€426.90/mese**
- S2: **€276.65/mese**

---

## 6. Costi non ancora inclusi — da valutare

L'analisi finora copre le tre voci principali (sistemista + VM + utenti). Ci sono però almeno **5 voci aggiuntive** che possono spostare il totale, in ordine di impatto:

### 6.1 API reali vs forfait €15 — impatto ALTO
Il forfait €15/utente è una media gestionale. I costi reali API per utente variano da **$3 a $138** tra tenant. Se serve capire la **marginalità per singolo contratto**, bisogna usare i consumi veri, non il forfait. Alcuni tenant (come Brahma) sono potenzialmente sottostimati di 9×.

### 6.2 Altre ore dev sul progetto 1395 — impatto MEDIO
Oltre a Gianpaolo, sul 1395 lavorano anche Marco, Ardit, Tommaso e Silvio per un totale di **61h in 7 mesi (~8.7h/mese)**. A tariffa media €50/h (mix senior/PM) = **~€48 aggiuntivi per installazione**. Porterebbe lo Scenario 1 da €208 a ~€256.

### 6.3 Servizi condivisi infrastrutturali — impatto MEDIO
- **Webcrawler SearXNG + Firecrawl + Jina** su `100.116.255.59` (server dedicato condiviso) — stimiamo ~€15-25/mese / 9 install = ~€2-3/install
- **Tailscale** (piano business se >3 utenti) — ~$30/mese / 9 = **~€3/install**
- **RAG API + pgvector** (se su macchine dedicate)

### 6.4 Backup Hetzner e storage — impatto BASSO
- Backup VM Hetzner = +20% sul costo VM → ~**€1/install/mese**
- Object storage per log/export se attivo — trascurabile

### 6.5 Costi non tracciati altrove — impatto VARIABILE
- **Commerciale/onboarding** (Tommaso, Marco): ore registrate su altri progetti Odoo, non sul 1395 — da quantificare separatamente
- **Supporto informale** (risposte Slack/email agli utenti chiave) — non loggato
- **Gestione incidenti fuori orario** — non tracciato

### Stima "all-in" per installazione media (con tutti i costi)

| Voce | S1 (dev+ops) | S2 (solo ops) |
|---|---:|---:|
| Gianpaolo | €203 | €53 |
| Altri dev sul 1395 | +€48 | — |
| VM Hetzner | €5.29 | €5.29 |
| Backup VM | +€1 | +€1 |
| Webcrawler + Tailscale (quota) | +€5 | +€5 |
| Utenti (14.6 × €15) | €219 | €219 |
| **TOTALE** | **~€481** | **~€283** |

---

## 7. Osservazioni e raccomandazioni

### Sulla piattaforma
- **L'83% dei costi API è su Claude** (Sonnet + Opus). Verificare se il prompt caching è attivo: potrebbe ridurre del 30-50% la spesa reale.
- **Solo l'11% del tempo di Gianpaolo è fleet-ops puro**. Il resto è costruzione di nuova piattaforma condivisa — buon segno di stabilità operativa.
- **Lo scaling da 9 a 18 installazioni** non raddoppierebbe le ore di Gianpaolo: raddoppierebbe solo la quota OPS (~+5h/mese = +€200/mese totali). La parte DEV è investimento one-off.

### Sui tenant
- **Utenti dormienti elevati**: 76 utenti su 178 registrati (43%) non hanno fatto nessuna transazione in 30 giorni. In particolare Cimolai ha 42/89 dormienti. Se i licensing sono sugli utenti registrati (non attivi), c'è margine per pulizia.
- **Outlier Brahma**: 4 utenti attivi, $552/mese di API (con 1 solo utente responsabile di $450). **$138/utente è fuori scala** rispetto alla media fleet di $20.
- **Tenant più efficiente: Cimolai** ($7/utente) grazie a GPT-5.2 dominante invece di Claude.

### Prossimi passi suggeriti
1. **Confermare il costo VM €5.29** (è un CX22? se LibreChat + MongoDB + RAG girano tutti lì è tight)
2. **Verificare se prompt caching è attivo** su Claude/Gemini in produzione
3. **Identificare le 2 installazioni non-SaaS** e confermare che il conto di Gianpaolo si divide su tutte le 9 (o ricalibrare il denominatore)
4. **Decidere se usare API reali** invece del forfait €15 per calcolare la marginalità per tenant
5. **Tracciare separatamente** le ore commerciali/onboarding non sul 1395 per avere il costo fully-loaded

---

## 8. Allegati e fonti

- **Dati token**: esportati in `cost-remote-2026-04-17.csv` (root repo), generati via `npm run cost-remote --csv`
- **Script di estrazione**: `config/cost-per-user-remote.js`
- **Script stima costi API**: `config/estimate-cost-usd.js`
- **Timesheet Odoo**: conto analitico `1395 - Ricerca e Sviluppo - RPA - Digital Automations - Studio e test su Librechat/SimpleAI`
- **Listini API** (aprile 2026):
  - Claude: https://platform.claude.com/docs/en/about-claude/pricing
  - Azure OpenAI: https://azure.microsoft.com/en-us/pricing/details/azure-openai/
  - Gemini / Vertex: https://cloud.google.com/vertex-ai/generative-ai/pricing
