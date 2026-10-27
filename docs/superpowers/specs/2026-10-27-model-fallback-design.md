# Ripiego automatico su un altro modello — design

Data: 2026-10-27 · Richiesta di Marco · Stato: bozza da approvare

## Perché

Su lbc (2026-10-27, conversazione `5e0bff52-…`) un utente in modalità Automatico ha
ricevuto, a metà risposta e dopo quattro ricerche web, l'errore:

> The model provider could not complete this request.
> Your requests to gpt-6-luna for gpt-6-luna in swedencentral have exceeded token rate limit.

Il "Riprova" ha dato lo stesso errore (limite ancora attivo); l'utente ha dovuto scrivere
"Non usare luna" per uscirne. L'utente non deve vedere questi errori: la richiesta deve
essere servita da un altro modello disponibile, prima della stessa fascia, poi di fascia
superiore.

## Obiettivi

- Quando una chiamata al modello fallisce per **limite di quota/rate limit (429)**,
  **sovraccarico** (es. Anthropic `overloaded_error`, 529) o **errore del provider 5xx**,
  la stessa chiamata viene ripetuta su un altro modello, senza errore visibile.
- Ordine: altri modelli della **stessa fascia**, poi modelli della **fascia superiore**
  (poi quella ancora sopra, se esiste). Mai verso il basso.
- Vale in tutti e tre i casi (decisione di Marco):
  1. modalità Automatico (Jev);
  2. modello scelto dall'utente dal menu (model spec o endpoint/modello);
  3. agenti creati dagli utenti (marketplace, builder), anche se hanno un modello fisso.
- Sotto la risposta servita da un modello di riserva compare una **nota piccola**
  (decisione di Marco), es.: "Risposto con Sonnet 5: GPT-6 Luna era momentaneamente non
  disponibile."
- I token consumati dal modello di riserva sono contabilizzati sul modello che li ha
  consumati (fatturazione e report costi corretti).

## Non obiettivi

- Nessun ripiego per errori che dipendono dalla richiesta: 400/401/403/404/413/422, file
  non supportato, contenuto rifiutato, contesto troppo lungo (quest'ultimo ha già il suo
  recupero nella libreria). Un altro modello non li risolverebbe.
- Nessun ripiego verso una fascia inferiore.
- Nessun "circuit breaker" che ricordi tra richieste diverse che un modello è saturo:
  ogni richiesta riparte dal modello scelto. (Possibile evoluzione futura.)
- Non si corregge qui il problema separato visto nella stessa conversazione (dopo "Non
  usare luna" Haiku ha risposto senza ricerca web): va trattato a parte.

## Anti-obiettivi (sarebbe un fallimento anche se "funziona")

- L'utente vede comunque l'errore quando esiste un modello libero nella catena e la
  risposta non era ancora iniziata.
- La risposta riparte da zero e rifà le ricerche già fatte, o duplica testo già mostrato.
- I token del modello di riserva finiscono sul modello originale (o non finiscono da
  nessuna parte) nei report di fatturazione.
- Il ripiego scatta su errori della richiesta e moltiplica il costo senza risolvere nulla.
- La nota compare quando non c'è stato nessun ripiego.

## Vincoli

- Regole del repo (`CLAUDE.md`): codice nuovo in TypeScript in `packages/api`; in `/api`
  solo wrapper minimi; tipi condivisi/schema yaml in `packages/data-provider`; testi UI
  con `useLocalize()` (solo chiavi inglesi in `client/src/locales/en/translation.json`).
- Test nello stesso commit: unit della logica + e2e mock in
  `e2e/specs/mock/simpleai.spec.ts` per la nota.
- Funziona solo dove gira l'immagine del fork (lbc, het-saas-1). I tenant con immagine
  ufficiale non lo avranno.
- La configurazione delle model spec su lbc è diversa da `file_produzione/librechat.yaml`:
  le fasce vanno scritte per ogni server.

## Come funziona (parti decise)

### Il meccanismo esiste già nella libreria

`@librechat/agents` 4.0.1 accetta in `clientOptions` un campo
`fallbacks: FallbackConfig[]` (`{ provider, clientOptions, maxContextTokens? }`).
Quando una chiamata al modello del grafo fallisce, `Graph` chiama
`tryFallbackProviders` (`dist/cjs/llm/invoke.cjs`), che prova i fallback in ordine
**sulla stessa chiamata, con gli stessi messaggi** (risultati degli strumenti compresi):
la risposta continua da dove si era fermata, senza ripartire. La libreria imposta
`metadata.__invoked_model` sul modello di riserva, e
`contextualizeModelUsage` (`api/server/controllers/agents/callbacks.js:1639`) lo usa già
per attribuire l'uso al modello giusto.

LibreChat propaga già `fallbacks` (`packages/api/src/agents/run.ts:1552`,
`withModelCallbacks`) ma nessuno lo valorizza. Il lavoro è quindi **costruire la catena
e appenderla**, non scrivere un meccanismo di retry.

Tutte le chat (anche quelle senza agente) passano dagli agenti (agente effimero), quindi
un solo punto di aggancio copre i tre casi.

### Punto di aggancio

`initializeAgent` (`packages/api/src/agents/initialize.ts`, dopo `getOptions`, ~riga
1312): calcolata `llmConfig` del modello primario, si calcola la catena di ripiego e la
si assegna a `llmConfig.fallbacks`. Ogni voce si costruisce con lo stesso percorso del
primario (`getProviderConfig` + `getOptions` per endpoint/modello della spec di riserva),
così chiavi, URL, versioni API Azure ecc. sono quelle reali.

La logica (risoluzione della catena) sta in un modulo nuovo
`packages/api/src/modelFallback/`, con funzioni pure testabili; `initialize.ts` lo
chiama soltanto.

### Configurazione: fasce esplicite nello yaml

Nuovo blocco top-level in `librechat.yaml` (schema in `packages/data-provider`, come
`agentBuilder`):

```yaml
modelFallback:
  tiers:            # dal più basso al più alto
    - [haiku-5-5, gpt-6-mini]
    - [sonnet-5, gpt-6-luna]
    - [opus-4-8, gpt-6-reasoning]
```

- Ogni voce è il `name` di una model spec concreta (non router).
- Un modello che non appartiene a nessuna fascia non ha ripiego (comportamento attuale).
- Senza il blocco la funzione è spenta.
- Non si ricavano le fasce dal testo "Fascia alta…" delle descrizioni dei candidati di
  Jev: quel testo è per il modello, non per il codice. *(Scelta mia.)*

### Come si individua la fascia del modello di partenza

Il modello di partenza può arrivare come model spec (menu, Jev) o come
endpoint+modello (agente). Si risale alla spec confrontando **endpoint + modello** con il
`preset` delle spec elencate in `tiers`. La prima che combacia determina la fascia.

### Ordine della catena

1. Gli altri modelli della stessa fascia, **prima quelli di un provider diverso** dal
   modello di partenza (se Azure è in rate limit, un altro deployment Azure
   probabilmente lo è anche lui) *(scelta mia)*; a parità, l'ordine scritto nello yaml.
2. Poi le fasce superiori, una alla volta, con lo stesso criterio.
3. Si escludono i modelli che l'utente non può usare (endpoint non configurato/senza
   chiave) — se non si riesce a costruire la `llmConfig` di una voce, la si salta e si
   logga.

### Ripiego solo prima che l'utente veda testo (decisione di Marco)

Il ripiego scatta solo se la chiamata fallita non ha ancora mandato testo al client
(il caso tipico del 429, che arriva prima del primo token). Se l'errore arriva a
risposta già iniziata (sovraccarico o 5xx a metà stream), l'errore resta visibile come
oggi: niente cancellazione del testo parziale. Possibile evoluzione futura.

### Provider diversi (decisione di Marco)

Tutti i modelli configurati su un'installazione possono essere usati da tutti gli utenti
e agenti di quell'installazione: il ripiego verso un altro provider o un'altra regione è
sempre ammesso. Nessuna opzione "solo stesso provider".

### Parametri della voce di riserva *(scelta mia)*

Ogni voce usa i `model_parameters` del `preset` della **spec di riserva** (thinking,
max token, temperatura del modello che risponde davvero): i parametri del primario
spesso non hanno senso su un altro provider. Istruzioni, strumenti e allegati restano
quelli dell'agente/conversazione. I flag strumenti della spec di riserva non si
applicano.

### Costo e saldo *(scelta mia)*

Il ripiego verso una fascia superiore costa di più: si addebita al prezzo del modello che
ha risposto, come qualsiasi altra chiamata. Nessun controllo di saldo aggiuntivo prima di
costruire la catena: vale il controllo già fatto all'inizio della richiesta.

### Quali errori fanno scattare il ripiego

La libreria prova i fallback su **qualsiasi** errore della chiamata (tranne overflow di
contesto, che ha il suo recupero, e limiti di stream). Il perimetro deciso con Marco
(solo 429 / sovraccarico / 5xx) richiede quindi un filtro nostro. Da risolvere nel piano
(vedi "Lasciato al builder").

### La nota sotto la risposta

- Il backend sa che c'è stato un ripiego quando l'uso di una chiamata riporta un modello
  diverso dal primario (`__invoked_model`). Lo registra sul messaggio di risposta (es.
  campo `fallback: { from, to }` o equivalente) così la nota resta anche ricaricando la
  conversazione.
- In un turno con più chiamate al modello (agente con strumenti) ogni chiamata riparte
  dal primario, quindi una risposta può essere servita da più modelli. Si registra il
  primario e l'elenco dei modelli di riserva usati, senza doppioni; la nota li nomina
  tutti *(scelta mia)*.
- Il client la mostra sotto la risposta, in piccolo, con i **nomi leggibili** (label della
  spec), non gli id tecnici.
- Testo (chiave nuova `com_ui_model_fallback_note` o simile): "Risposto con {{to}}:
  {{from}} era momentaneamente non disponibile."

## Lasciato al builder

- **Filtro degli errori**: come limitare il ripiego a 429/sovraccarico/5xx **e** al caso
  "nessun testo ancora inviato al client", dato che `tryFallbackProviders` non ha un
  predicato. Strade possibili: un client di riserva che
  rilancia subito l'errore primario se non è "ripiegabile"; un'opzione nella libreria
  (patch o contributo upstream); altro. Se nessuna strada è pulita, tornare da Marco
  prima di scegliere.
- Retry interni dei client (es. `maxRetries` dell'SDK OpenAI su 429) prima che scatti il
  ripiego: verificare quanto attende l'utente e, se serve, ridurli quando c'è una catena.
- Attribuzione nei report costi: `attemptInvoke` imposta sia `__invoked_model` sia
  `__invoked_provider` e `contextualizeModelUsage` li legge già; resta da verificare che
  il prezzo si risolva correttamente per il modello di riserva.
- Compatibilità degli strumenti tra provider (es. ricerca web nativa del provider,
  file inviati "al provider", code interpreter): verificare cosa succede quando il
  ripiego passa da Azure ad Anthropic con strumenti e allegati già nel turno; se una
  combinazione non è sicura, escludere quella voce dalla catena.
- Forma esatta del campo sul messaggio e del componente della nota.
- Subagenti e chiamate secondarie (titoli, etichette attività, Jev stesso): fuori scope
  salvo che il meccanismo non li copra gratis.

## Test

- Unit (`packages/api/src/modelFallback`): risoluzione della fascia da spec e da
  endpoint+modello, ordine della catena (stesso provider in coda, fasce superiori dopo),
  modello fuori fascia → nessun ripiego, config assente → spento, voce non costruibile →
  saltata.
- Unit schema yaml (`config-schemas.spec.ts`): `modelFallback.tiers`.
- Integrazione: un primario che fallisce con 429/529/500 → risposta servita dal ripiego,
  uso attribuito al modello di riserva; con 400 → nessun ripiego; errore dopo testo
  già inviato → nessun ripiego, errore visibile.
- E2E mock (`simpleai.spec.ts`): risposta con ripiego → nota visibile con i nomi
  leggibili; risposta normale → nessuna nota.

## Rilascio

Fasce da scrivere a mano nello yaml di ciascun server (lbc per primo), con i nomi delle
spec realmente presenti lì.
