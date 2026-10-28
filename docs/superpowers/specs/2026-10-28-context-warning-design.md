# Avviso di contesto pieno (T146) — design

## Perché

La rotella di saturazione del contesto accanto al pulsante di invio è poco chiara
(parere di Marco, 2026-10-28): l'utente non capisce cosa indica né cosa farci.
Quando il contesto si riempie le risposte peggiorano, costano di più e alla fine
la chat si blocca, ma l'utente non lo sa finché non succede.

Richiesta di Marco: sopra il 45% del contesto un avviso **non invasivo ma che
l'utente vede**, con tre azioni:

1. **Cancella il contesto** — chiude la chat e ne apre una nuova;
2. **Compatta**;
3. **Prompt di handoff**.

Marco ha chiesto di saltare le domande e di proporre il design: tutto ciò che
non è nei tre punti sopra è una mia scelta, segnata come tale.

## Obiettivi

- L'utente medio, non tecnico, capisce *che* la chat sta diventando lunga e *cosa
  può fare*, senza leggere numeri di token.
- Le tre azioni sono a un clic dall'avviso.
- Si riusa ciò che esiste: la compattazione manuale c'è già
  (`useCompactConversation`, `CompactAction`, abilitata da `summarization.enabled`,
  attiva di default e quindi anche su lbc).

## Non obiettivi

- Nessuna compattazione automatica nuova (quella di LibreChat resta com'è).
- Nessun nuovo endpoint server: le tre azioni usano la pipeline di chat esistente.
- Nessuna soglia configurabile da yaml per ora (45% costante; *mia scelta*,
  si aggiunge quando un tenant la chiede).

## Anti-obiettivi (sarebbe un fallimento anche se funziona)

- Un avviso modale o che copre la chat: deve stare nel flusso, non interrompere.
- Un avviso che ricompare a ogni messaggio dopo che l'utente l'ha chiuso.
- "Cancella il contesto" che perde il modello/agente scelto: la nuova chat deve
  ripartire con lo stesso modello, spec o agente (anche in modalità Automatico).
- Testo tecnico ("token", "context window") nell'avviso.

## Come appare

Una **striscia sottile sopra la casella di scrittura**, dentro l'area del
composer, larga quanto il composer, di colore neutro-ambra (*mia scelta*):

```
┌──────────────────────────────────────────────────────────────────────┐
│ ⓘ Questa chat sta diventando lunga (52%). Le risposte potrebbero     │
│   peggiorare.   [Nuova chat]  [Compatta]  [Prompt di handoff]    ×   │
└──────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────┐
│ Scrivi un messaggio…                                            ➤    │
└──────────────────────────────────────────────────────────────────────┘
```

- Compare quando `percent >= 45` della conversazione corrente (stesso calcolo di
  `useTokenUsage`). Se il massimo del contesto non è noto (`maxTokens` assente)
  l'avviso non compare.
- Sopra l'80% il testo diventa più deciso ("La chat è quasi piena…") e il colore
  passa a rosso tenue (*mia scelta*).
- `×` chiude l'avviso **per quella conversazione**; ricompare solo se si supera
  l'80% (*mia scelta*). Lo stato "chiuso" vive in memoria lato client per
  conversazione (non serve persistenza: al reload ricompare, accettabile).
- Su mobile i tre pulsanti vanno a capo sotto il testo.
- `role="status"` per gli screen reader, annunciato una volta sola.

### La rotella

**Mia scelta:** la rotella sparisce dal composer quando il massimo del contesto
è noto, **dietro un'opzione yaml `interface.contextGauge: false`** (default
`true` = comportamento upstream). Motivo emerso scrivendo il piano: ~100
asserzioni delle e2e upstream (`usage.spec.ts`, `compaction-rerun-controls`, …)
passano dalla rotella; toglierla per tutti significherebbe riscriverle e
divergere da upstream a ogni bump. Su lbc (e nei tenant del fork) si imposta
`false`. Il riepilogo dettagliato che apriva (token, costo, link Langfuse) resta
raggiungibile da un link "Dettagli" nell'avviso. Sotto il 45% non si vede nulla.
Su lbc `contextCost` non è attivo, quindi non si perde nessuna informazione
visibile oggi. Se il massimo **non** è noto (`maxTokens` assente) l'avviso non
può calcolare la soglia: lì resta la rotella di oggi in stato indeterminato,
così l'utente non resta senza nessuna indicazione.

## Le tre azioni

### 1. Nuova chat ("Cancella il contesto")

Apre una conversazione nuova con lo **stesso modello, spec o agente** della
corrente e ci porta l'utente. Attenzione: il pulsante "Nuova chat" di oggi
**non** lo fa (`startNewChat` chiama `newConversation()` senza template e, con
`modelSpecs.prioritize: true`, applica la spec di default). Qui invece si
passa la spec/preset della conversazione corrente forzandola oltre
`prioritize` (con i relativi `applyModelSpecEffects`); se la chat era in
modalità Automatico, la nuova resta in Automatico (*mia scelta*: l'utente vuole
ripulire la chat, non cambiare modello). La vecchia chat **non viene
cancellata**: resta nella cronologia (*mia scelta*: "cancella il contesto"
significa ripartire da zero, non perdere il lavoro). Etichetta nell'avviso:
"Nuova chat" (più chiaro di "Cancella il contesto" per chi non sa cos'è il
contesto; *mia scelta*).

### 2. Compatta

Chiama il `compact()` esistente di `useCompactConversation`. Durante la
compattazione l'avviso mostra lo spinner al posto dei pulsanti
("Sto riassumendo la conversazione…"). Finita la compattazione l'avviso si
nasconde per quella conversazione fino al turno successivo, che ricalcola la
percentuale sul contesto compattato (*mia scelta*: non è verificato che il turno
di compattazione scriva subito una misura più bassa; il costruttore lo verifica
e, se la scrive, basta la soglia). Se `compactionEnabled` è falso o l'endpoint non la supporta
(`supportsCompaction`), il pulsante non c'è.

### 3. Prompt di handoff

Obiettivo: proseguire il lavoro in una chat nuova portandosi dietro solo
l'essenziale.

1. Manda nella chat corrente un messaggio predefinito (localizzato, visibile
   come un normale messaggio dell'utente) che chiede al modello di scrivere un
   prompt di passaggio: obiettivo, decisioni prese, stato attuale, prossimi
   passi, informazioni indispensabili (nomi, numeri, file), in forma di prompt
   pronto da incollare.
2. Quando la risposta è completa, apre una **nuova chat con lo stesso
   modello/spec/agente** e mette la risposta **nella casella di scrittura, non
   inviata**: l'utente la rilegge, la ritocca e la invia.
3. Se l'utente nel frattempo cambia chat o interrompe la generazione, non si
   apre niente: la risposta resta nella chat vecchia e si può copiare a mano.
4. Il testo di handoff **sostituisce** l'eventuale bozza salvata nello slot
   "nuova chat": va gestito esplicitamente contro il ripristino delle bozze di
   `useAutoSave`, che altrimenti lo sovrascrive (*mia scelta*: l'utente ha
   appena chiesto quel testo).
5. Lo stato "handoff in corso" vive in un atomo globale per conversazione, come
   `compactingConversationAtom`, non nel componente dell'avviso: l'avviso può
   smontarsi (×, compattazione, cambio di indice) mentre la risposta è in
   streaming.
6. Nessuna gestione speciale vicino al 100%: è un turno normale, con gli
   strumenti dell'agente e la compattazione automatica di LibreChat se scatta;
   se fallisce, l'errore si vede come per qualunque messaggio (*mia scelta*).

*Mia scelta* rispetto a una chiamata nascosta lato server: costa un turno come
la compattazione, ma riusa tutto (streaming, fallback, contabilità dei token) e
l'utente vede cosa viene portato nella nuova chat. Il testo passa da uno stato
client, non dall'URL (`?prompt=`), per non finire in cronologia e log.

## Vincoli

- Codice fork in `client/src/components/Chat/Input/TokenUsage/` (nuovo
  componente dell'avviso accanto agli esistenti) e un hook per l'handoff in
  `client/src/hooks/Chat/`; nessuna modifica a `/api`.
- Testi con `useLocalize()`: chiavi `com_ui_context_warning_*` in `en` e anche
  in `it` (come le altre funzioni del fork); aggiungere in `it` anche le chiavi
  `com_ui_context_compact*` che oggi mancano.
- Rispetta `interface.contextUsage === false`: se il tenant spegne l'indicatore,
  niente avviso.
- Test: unit per la logica di soglia/chiusura e per l'hook di handoff; e2e in
  `e2e/specs/mock/simpleai.spec.ts` per comparsa a 45%, chiusura, Nuova chat
  (stesso modello), Compatta, Handoff (casella precompilata nella nuova chat);
  aggiornare i test upstream che cercano `data-testid="token-usage"`.
- Novità in changelog utente (versione successiva a 2.2.0).

## Lasciato al costruttore

- Componenti e stile esatti (usare `Button` di `@librechat/client` e i token
  colore del tema).
- Come aprire la nuova chat conservando modello/spec/agente (`useNewConvo` con
  template dalla conversazione corrente) e come precompilare la casella (atomo
  o metodo del form del composer).
- Testo esatto del messaggio di handoff (in italiano e inglese).
