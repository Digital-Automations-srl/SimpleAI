# Suite E2E sui limiti — design

Data: 2026-10-28 · Autore: Marco Nucci (con Claude) · Stato: da approvare

## 1. Perché

SimpleAI gira su 9 installazioni clienti. Ogni modifica al fork, e soprattutto ogni merge da
upstream, può rompere un comportamento che gli utenti danno per scontato senza che nessun test
se ne accorga. Esempio del 28/10: dopo il merge di v0.8.8 la Libreria strumenti del builder non
mostrava più le Actions di un agente se la chat aperta era con un modello (fix in
`v0.8.8-simpleai.7`). Nessun test copriva il caso.

Scopo della suite: **le modifiche che facciamo devono "resistere" a questi test**, anticipando i
problemi che gli utenti potrebbero avere. È una rete di protezione che gira sempre, non una
caccia ai bug una tantum. I casi partono dagli errori reali trovati nei log delle installazioni
(ricognizione del 28/10, ultimi 30 giorni), si allargano ai casi vicini e alle funzioni del fork
che un merge può cancellare senza rumore.

## 2. Obiettivi, non-obiettivi, anti-obiettivi

**Obiettivi**
- Casi ai limiti, ognuno con un esito atteso esplicito, eseguiti prima di ogni commit e di ogni
  deploy insieme alla suite mock esistente.
- Copertura delle aree in cui gli utenti si bloccano (documenti, estrazione testo, limiti di
  conversazione, modelli e strumenti in errore, chat lunghe, agenti, Automatico, dati utente) e
  **guardie di merge** sulle funzioni del fork.
- Ogni caso tracciabile all'origine (host dove l'errore è stato visto, area del fork, o previsto).

**Non-obiettivi**
- Correggere i problemi di configurazione dei singoli host (§8): lista separata.
- Strade alternative automatiche (OCR, ripiego su testo estratto, conversioni) come requisito:
  la suite verifica che l'utente non resti bloccato, non che il sistema trovi da solo una
  soluzione.
- Test di carico o prestazioni.

**Anti-obiettivi** (la suite fallisce il suo scopo anche se "funziona")
- Test fragili o lenti che si finisce per ignorare. Meglio pochi casi stabili.
- Provider reali nel percorso bloccante (costi, flakiness, rate limit).
- Asserzioni sul testo esatto dei messaggi d'errore: un cambio di traduzione non deve rompere
  la suite (eccezione: il gruppo I14, che verifica proprio la traduzione).

## 3. Esito atteso generale ("non rotto")

Vale per tutti i casi, salvo dove la tabella dice di più:
1. **Messaggio comprensibile** nell'interfaccia (non spinner infinito, non "Unhandled error",
   non turno vuoto).
2. **Nessuna perdita di dati**: bozza, allegati e conversazione restano.
3. **La chat continua**: il messaggio successivo riceve una risposta.
4. **Nessun errore runtime** nella pagina (`pageerror`) e nessuna "something went wrong".

## 4. Dove e come girano i test

- **Suite mock** (`e2e/specs/mock/`, Mongo in memoria, modello finto `e2e/setup/fake-model.js`,
  server finti MCP/RAG/codice): tutti i casi bloccanti. File dedicato, es.
  `e2e/specs/mock/simpleai-limits.spec.ts`, separato da `simpleai.spec.ts`, con una
  **configurazione dedicata** a valori bassi (pochi allegati, contesto piccolo, timeout brevi)
  così da raggiungere i limiti velocemente senza toccare il yaml condiviso della suite mock.
- **Statico** (gruppo I16-I17): controlli senza browser, nello stesso passo pre-commit.
- **Checklist manuale su lbc** (het-saas-5, provider veri): casi marcati *lbc*. Prima dei
  rilasci che toccano provider, file o upstream. Non bloccante, scrive dati: mai senza OK di
  Marco, come `simpleai-custom.spec.ts`.

**Casi che oggi falliscono** (decisione di Marco, 28/10): entrano subito come **fallimento
noto** (`test.fixme` con riferimento al caso), visibili nel report ma non bloccanti. Diventano
bloccanti uno alla volta, quando il comportamento viene sistemato. Una correzione del prodotto
è un lavoro a parte, con il suo caso come test.

**Primo rilascio**: i casi prioritari del §6, con un tetto di circa **+5 minuti** sulla corsa
della suite mock. Gli altri a gruppi, nell'ordine del §6.

Fixture: file di prova (PDF cifrato, PDF con molte pagine, PDF scansionato, DOCX troncato, file
con estensione falsa, HEIC) piccoli, generati o versionati sotto `e2e/`, senza dati reali dei
clienti.

## 5. I casi

Legenda origine: ⚠ visto nei log (host) · ◆ funzione del fork / area fragile ai merge ·
○ previsto. Host: saas-1 SimpleAI interno DA, saas-2 studio, saas-3 Brahma, saas-4 Cimolai,
saas-5 lbc, saas-6 Giotto, saas-7 VCA, saas-8 Coesi, saas-9 4bild.
"Già in parte" = test esistenti da completare, non da riscrivere.

### A. PDF e documenti ai limiti del provider
| # | Caso | Esito atteso (oltre al §3) | Dove | Origine |
|---|---|---|---|---|
| A1 | PDF oltre il limite di pagine del provider (Anthropic) | Errore chiaro all'invio del turno; la chat resta usabile (bloccarlo prima dell'invio è una miglioria futura, non il criterio) | mock (finto che rifiuta con la forma dell'errore Anthropic) + lbc | ⚠ saas-8, 9 |
| A2 | PDF protetto da password | Errore chiaro all'utente | mock + lbc | ⚠ saas-6, 7, 9 |
| A3 | File `.pdf` il cui contenuto non è PDF | Rifiutato al caricamento con errore chiaro (per le immagini vale già il tipo dedotto dai byte, #16658) | mock | ⚠ saas-8 (`media_type`) |
| A4 | Dopo un errore su un PDF, l'utente scrive un nuovo messaggio | La chat risponde: il documento problematico non fa fallire ogni turno successivo | mock + lbc | ⚠ saas-8 |
| A5 | A1-A2 ripetuti per provider: Claude, GPT, Gemini, Automatico, ripiego | Stesso esito per tutti | lbc (parametrizzato) | ○ |

### B. Estrazione testo
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| B1 | PDF scansionato (solo immagini) | Avviso visibile "nessun testo", non allegato vuoto silenzioso | mock + lbc | ⚠ saas-3, 7 |
| B2 | DOCX / XLSX corrotto o troncato | Errore di caricamento chiaro | mock | ⚠ saas-6, 7 (unit già in `files/documents/crud.spec.ts`) |
| B3 | File appena sotto e appena sopra `fileSizeLimit` / `totalSizeLimit` dell'host | Sotto: caricato; sopra: errore chiaro prima dell'upload | mock (limiti bassi) + lbc (limiti reali) | ○ |
| B4 | Nome file con accenti, emoji, ~200 caratteri | Upload e download funzionano | mock | ⚠ `ENOENT` su download, saas-7 |

### C. Limiti della conversazione
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| C1 | Più allegati del limite in un turno | Messaggio esplicito; testo scritto conservato | mock | ⚠ saas-1, 4, 7, 8, 9 |
| C2 | Testo estratto (o incollato) oltre il limite | Come C1 | mock | ⚠ saas-7, 9 |
| C3 | Incolla di un testo molto lungo | Diventa l'allegato "testo incollato" di upstream (#15017); invio riuscito; oltre il limite vale C2 | mock | ○ |

### D. Modelli in errore
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| D1 | 429 o 529 (overloaded) del modello **prima del primo token** | Ripiego automatico con nota visibile. Serve un vero errore dal modello finto, non metadati iniettati | mock | ⚠ saas-3, 7 · già in parte (solo UI) in `simpleai.spec.ts` |
| D2 | Tutta la catena di ripiego in errore | Errore leggibile con possibilità di riprovare | mock | ⚠ "Unhandled error" su più host · già in parte in `message-tree.spec.ts` |
| D3 | Errore del provider dopo il primo token | Testo parziale conservato, rigenerazione possibile | mock | ○ · già in parte (stop utente) in `message-tree`, `thread-fold` |

### E. Chat lunghe
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| E1a | Conversazione oltre il contesto, **sintesi automatica** (summarization) attiva | Risposta valida, mai vuota ("Empty messages after pruning") | mock + lbc | ⚠ 6 host |
| E1b | Conversazione oltre il contesto, **compattazione dall'avviso** ("Compatta") | Chat compattata, risposta successiva valida | mock | ◆ · già in parte in `simpleai.spec.ts`, `thread-fold.spec.ts` |
| E2 | Sintesi o compattazione che fallisce | Errore chiaro con proposta di nuova chat | mock | ⚠ saas-8 · già in parte in `scenarios/compaction-rerun-controls`, `failed-summary-history` |

### F. Agenti: creazione e modifica
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| F1 | Builder aperto da una chat con un modello, su un agente con Action | L'Action compare | mock | ⚠ 28/10 · **coperto** in `simpleai.spec.ts` |
| F2 | Sostituire lo schema OpenAPI di un'Action esistente | Salvato; autenticazione e chiave conservate; strumenti aggiornati | mock | ⚠ 28/10 (agente SGO) |
| F3 | Schema OpenAPI non valido o con operazioni duplicate | Errore chiaro; Action esistente intatta | mock | ○ |
| F4 | Action che risponde 500, va in timeout, o restituisce un payload oltre ~25% del contesto del modello | L'agente segnala l'errore; la chat continua | mock | ○ (agenti clienti dipendono da API esterne) |
| F5 | Istruzioni lunghe (~40 kB, come il brief SGO) | Salvate e usate intere | mock | ○ |
| F6 | Agente o chat che punta a un modello tolto dalla configurazione | Errore leggibile che invita a scegliere un altro modello | mock | ⚠ `Model named "gpt-5" not found`, tutti gli host · già in parte in `soft-default`, `enforced-model-specs` |
| F7 | Agente condiviso: solo-uso non modifica; chi ha diritto di modifica vede Actions e strumenti | Permessi rispettati, nessun pannello vuoto | mock | ⚠ 28/10 · già in parte in `agent-file-ownership` |
| F8 | Due persone modificano lo stesso agente insieme | Comportamento attuale (vince l'ultimo salvataggio) documentato; nessun errore | mock | ○ · bassa priorità |
| F9 | Duplicare un agente con Action | La copia ha un'Action propria e funzionante | mock | ○ · già in parte (senza Actions) in `agent-handoffs` |
| F10 | Eliminare un'Action usata da un agente | Strumenti ripuliti; la chat successiva non fallisce | mock | ○ |
| F11a | Scheda "Crea": modello dell'`agentBuilder` in 429/5xx o JSON non valido | Messaggio chiaro; conversazione di Crea e bozza conservate; nessun agente salvato a metà | mock | ◆ `agentBuilder/handler.ts`, `draft.ts` |
| F11b | Scheda "Crea" con descrizione vaga, lunga o in altra lingua | Bozza ragionevole o richiesta di chiarimento | lbc | ◆ |
| F12 | Agente con server MCP spento | Risponde senza quello strumento e lo dice | mock | ⚠ saas-1, 4, 5 · già in parte in `agent-handoffs`, `mcp-oauth-readiness` |
| F13 | Ripristino di una versione precedente dell'agente, con Actions | Istruzioni, strumenti e Actions coerenti | mock | ○ · già in parte (senza Actions) |
| F14 | Categorie: eliminare una categoria usata da agenti; utente non admin che modifica/elimina categorie | Agenti ancora visibili nel marketplace; permessi come voluti | mock | ◆ route categorie con solo `checkAgentCreate` (da verificare) |

### G. Modalità Automatico
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| G1 | Router (Jev) in timeout, 500 o senza chiave | Risposta dal `fallback` del router entro il timeout, nessun errore visibile | mock (router finto muto / in errore) | ◆ `modelRouter/middleware.ts` (oggi solo unit) |
| G2 | Allegato PDF o immagine e router che sceglie un candidato di altro provider | L'allegato arriva al modello o errore chiaro | mock (router finto + `E2E_ASSERT_PROVIDER_FILE`) + lbc | ◆ il router non considera gli allegati |
| G3 | Ripiego tra provider diversi con allegati o tool call nella storia (Haiku → Luna) | Risposta dal ripiego con nota; allegati accettati | mock (innesco) + lbc | ◆ fasce miste Anthropic/OpenAI |
| G4 | Cambio di provider tra un turno e l'altro con ragionamento, tool call o risultati web nella storia | Risposta valida, nessun errore di formato | lbc | ◆ fix thinking Haiku 5.5 (`9181cea35`) |
| G5 | Utente che spegne ricerca web o codice in Automatico; reload; spegnimento di Automatico | Strumenti spenti restano spenti; si torna all'ultimo modello scelto a mano | mock | ◆ patch in file upstream (`endpoints.ts`, `useApplyModelSpecAgents.ts`, `AutoModelToggle.tsx`) |
| G6 | Attivare/disattivare Automatico in una chat con bozza o allegati | Bozza e allegati restano | mock | ◆ `useSelectMention.ts` |

### H. Dati utente
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| H1 | Bozza e allegati dopo reload, cambio di chat e ritorno, "Nuova chat" | Testo conservato; su "Nuova chat" allegati scartati come upstream | mock | ◆ `useNewChat.ts` riscritto dal fork (`241a68602`) |
| H2 | Sessione scaduta mentre si scrive o durante una risposta lunga | Refresh silenzioso o nuovo login; invio riuscito; bozza intatta | mock | ○ · `auth.spec.ts` copre solo il bootstrap |
| H3 | Rete che cade a metà risposta e torna | Risposta recuperata o errore con "riprova"; nessun messaggio doppio | mock (`setOffline`) | ○ |

### I. Guardie di merge (funzioni del fork che un merge può cancellare in silenzio)
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| I1 | Nota di ripiego e modello scelto da Automatico visibili nei due renderer e nella pagina di condivisione | Presenti e uguali | mock | ◆ `ModelFallbackNote` montato a mano |
| I2 | Interfaccia in italiano sulle schermate del fork (avviso contesto, Automatico, Crea, Segnalazioni, Novità, Categorie) | Nessuna chiave grezza `com_…` né testo inglese | mock (locale it) | ◆ |
| I3 | Copia di una risposta con tabella o elenco | Appunti con `text/html` (`<table>`) e testo pulito | mock | ◆ `useSemanticCopy.ts` |
| I4 | Configurazione di ogni host coerente: `titleModel`, `modelFallback.tiers`, `router.fallback`/`candidates`, `agentBuilder.spec` puntano a modelli/spec esistenti; TTS attivo solo se configurato | Controllo verde per ogni yaml di host | statico | ⚠ `gpt-5`, TTS (§8) |
| I5 | `client/dist` versionato coincide con la build del sorgente | Controllo verde | statico | ◆ si rilascia il dist committato |

### L. Strumenti in errore
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| L1 | Ricerca web fallita (SSRF, chiave mancante, 5xx) | Il modello risponde e dice che la ricerca non è disponibile; mai turno vuoto | mock (SearXNG finto in errore) | ⚠ saas-1, 4, 5, 9 |
| L2 | Esecuzione codice: sandbox giù, timeout, file generato grande | Errore leggibile; file generato scaricabile anche dopo reload | mock (`fake-code-server`) | ○ |
| L3 | file_search con RAG giù, in upload o al turno dopo | Errore chiaro, nessun allegato "fantasma" | mock (`fake-rag-server` spento) | ○ |

### M. Conversazioni
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| M1 | Modifica di un messaggio con allegato e rigenerazione | Allegato ancora inviato; ramo precedente intatto | mock | ○ |
| M2 | Titolo non generato (modello del titolo in errore) | Chat salvata e ritrovabile con titolo di ripiego | mock | ⚠ saas-4, studio |
| M3 | Link condiviso di una chat con allegati, artifact e nota di ripiego | Si apre senza login; nessun file privato esposto; revoca funziona | mock | ◆ `ShareView` toccato dal fork |
| M4 | Ricerca nelle conversazioni; con Meilisearch giù la sidebar funziona | Trova le chat; degrado senza errori | lbc | ○ |

### N. Dispositivi
| # | Caso | Esito atteso | Dove | Origine |
|---|---|---|---|---|
| N1 | Composer a 375 px con Automatico, avviso di contesto e allegati | Invio visibile, avviso leggibile, nessuno scroll orizzontale | mock | ◆ `ChatForm.tsx` |
| N2 | Foto da smartphone (HEIC, JPEG oltre 10 MB) e screenshot incollato | Allegata (convertita o ridimensionata) o errore chiaro | mock + lbc | ○ |
| N3 | Pulsante voce senza servizio TTS/STT configurato | Pulsante nascosto o errore leggibile | mock | ⚠ saas-4 (630), 6, 7, 8 |

### Checklist lbc (solo manuale)
- Smoke per ogni modello visibile nel menu, con generazione del titolo.
- A5, B3 (limiti reali), E1a, F11b, G2-G4, M4, N2 (limiti dei provider).

## 6. Ordine di consegna

1. **Primo rilascio (prioritari)**: A4, D1, D2, E1a, F2, F4, F6, G1, H1, I4. Sono i casi in cui
   l'utente resta bloccato senza capire perché, in cui un agente cliente in produzione si rompe
   per un cambiamento intorno a lui, o in cui una funzione accesa di default (Automatico) blocca
   tutti.
2. Guardie di merge restanti (I1-I3, I5) e Automatico (G5, G6).
3. Documenti e file (A1-A3, B1-B4, C1-C3).
4. Strumenti, agenti e conversazioni (L, F restanti, M1-M3, D3, E1b, E2, H2, H3).
5. Dispositivi (N).

## 7. Decisioni prese e cosa resta al builder

**Deciso da Marco**
- Scopo: le modifiche devono resistere a questi test, anticipando i problemi degli utenti.
- Casi che oggi falliscono: entrano come fallimento noto (`test.fixme`), non bloccanti.

**Scelte di Claude** (modificabili da Marco)
- Esito atteso generale del §3; nessuna strada alternativa automatica come requisito.
- Verifica dei messaggi generica (§3); messaggi specifici solo dove l'interfaccia ha già un
  aggancio stabile. Niente nuovi `data-testid` nei componenti upstream solo per i test.
- Percorso dei PDF nel mock: il modello finto rifiuta il documento imitando l'errore Anthropic
  (consegna nativa al provider), perché è il percorso che si rompe in produzione; l'estrazione
  testo è coperta dai casi B.
- Configurazione dedicata a valori bassi per la suite dei limiti.
- Primo rilascio e tetto di +5 minuti del §4 e §6.
- Gruppi G-N aggiunti dopo la revisione di completezza; M4 e lo smoke per modello solo su lbc.

**Al builder**
- Estendere `e2e/setup/fake-model.js` per 429/529/5xx prima e dopo il primo token, rifiuto di un
  documento, e un router finto per Automatico; server finti in errore per Actions, SearXNG,
  codice e RAG, sul modello di quelli in `e2e/setup/`.
- Produzione delle fixture, purché piccole.
- Completare i test "già in parte" invece di duplicarli.
- Forma dei controlli statici (I4, I5) e dove eseguirli.

## 8. Fuori dalla suite: correzioni di configurazione emerse dai log

Task separati (stato al 28/10, versioni `simpleai.1` salvo lbc/studio):
- `titleModel: gpt-5` per Azure non più tra i modelli configurati → titoli falliti
  (`Model named "gpt-5" not found`), almeno saas-4 e studio.
- TTS non configurato ma pulsante audio attivo (630 errori su saas-4; anche saas-6, 7, 8).
- SearXNG bloccato dalla protezione SSRF (saas-1, 4, 5, 9); chiavi SearXNG/Firecrawl mancanti
  per utente (saas-4).
- MCP OAuth / connessioni fallite ripetute (saas-1, 4, 5); tool `psql` odoo-ai (saas-1).
- Scheduler non avviato (`SCHEDULES_SINGLE_PROCESS` non impostato) su tutti gli host.
- `audio/ogg` non supportato in upload (saas-7).
- Route di modifica/eliminazione delle categorie agenti protette solo da `checkAgentCreate`
  (da verificare: possibile problema di permessi, non solo di test).
