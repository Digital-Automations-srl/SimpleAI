# Fix upload file — auto-fallback a testo per tipi non supportati dal provider

**Data:** 2026-07-21
**Richiesta:** Tommaso (mail 22/06 "Test caricamento file SimpleAI")
**Progetto:** SimpleAI (fork LibreChat v0.8.6)

## Problema

Il menu allega e il drag-drop permettono di inviare un file sul path "provider"
(`tool_resource` non impostato → blocco `image`/`document` verso l'API del modello).
L'API Anthropic accetta come `document` **solo** `application/pdf` (+ immagini per vision).
Qualsiasi altro tipo (xlsx, docx, csv…) inviato sul path provider produce
`400 invalid_request_error: media_type: Input should be 'application/pdf'`.

Amplificatore: una singola attach invalida resta nello storico conversazione e viene
re-inviata a ogni turno → da lì in poi ogni messaggio fallisce ("conversazione avvelenata").

Il filtro `accept` dell'`<input file>` non basta: è solo un suggerimento (l'utente può
scegliere "Tutti i file" nel dialog OS) e il **drag-and-drop lo bypassa del tutto**.

## Obiettivo

Quando l'utente allega sul path provider un file non supportato da quel provider come
immagine/documento, reindirizzarlo **automaticamente e in modo trasparente** al path
testo (`document_parser`, `EToolResources.context`), con un **avviso discreto (toast)**.
Nessun invio che generi 400, nessuna conversazione avvelenata.

Perimetro: tutte le porte di ingresso (menu allega, drag-drop, paste) tramite il funnel
comune `handleFiles`. Nessuna guardia backend (i blocchi invalidi non vengono più creati
a monte per i nuovi upload).

## Analisi codice esistente

- **Funnel comune:** `client/src/hooks/Files/useFileHandling.ts` → `handleFiles(files, _toolResource)`.
  Vi passano sia il menu (`AttachFileMenu` → `handleFileChange`) sia il drag-drop
  (`useDragHelpers` → `DragDropModal` → `handleOptionSelect` → `handleFiles`).
  Oggi `_toolResource` è applicato **uniforme all'intero batch** (`useFileHandling.ts:335-337`).
- **Mappatura MIME→provider:** NON esiste un predicato canonico. È duplicata come stringhe
  di estensioni in `AttachFileMenu.handleUploadClick` (`AttachFileMenu.tsx:120-137`) e in
  `DragDropModal`. `documentSupportedProviders` (`schemas.ts:49`) indica solo *quali*
  provider supportano documenti, non *quali MIME*.
- **Costanti riusabili** già in `packages/data-provider/src/file-config.ts`:
  `imageMimeTypes`, `bedrockDocumentFormats`/`isBedrockDocumentType`, `bedrockDocumentExtensions`.
- Config produzione (`file_produzione/librechat.yaml:56-93`): `supportedMimeTypes` è una lista
  esplicita (NON permissiva) → il branch `isPermissiveMimeConfig` non si applica.

## Design

### 1. Predicato condiviso — `packages/data-provider/src/file-config.ts`

Nuova funzione, unica fonte di verità per "questo MIME è inviabile sul path provider":

```
isProviderUploadSupported(
  mimeType: string,
  opts: { provider?: string | null; endpointType?: string | null; useResponsesApi?: boolean },
): boolean
```

Regole (ricalcano i branch dell'accept-filter, ma su MIME):
- Immagini (`imageMimeTypes`) → sempre `true` sui provider con vision.
- anthropic / openAI / custom / azureOpenAI(useResponsesApi) → immagini + `application/pdf`.
- google / openrouter → + video/audio.
- bedrock → immagini + `bedrockDocumentFormats` (`isBedrockDocumentType`).
- provider che non supporta documenti (`!isDocumentSupportedProvider`) → solo immagini.

Nessun tipo nuovo: riuso regex/costanti esistenti. Test unitari dedicati.

### 2. Reinstradamento per-file — `client/src/hooks/Files/useFileHandling.ts`

Spostare la decisione del `tool_resource` da **per-batch** a **per-file** dentro il loop
di `handleFiles`. Per ogni file, quando è sul path provider (`_toolResource` undefined/vuoto):

- se `isProviderUploadSupported(file.type, { provider, endpointType, useResponsesApi }) === false`:
  - **se context disponibile** → `tool_resource = EToolResources.context` per quel file
    + toast discreto (vedi §3);
  - **se context NON disponibile** → non caricare il file, toast d'errore
    (`com_ui_upload_provider_unsupported`), nessun invio.
- altrimenti (immagine, pdf, tipo valido) → invariato.

`provider`/`useResponsesApi` vanno derivati nel contesto dell'hook (agent.provider quando
presente, altrimenti endpoint; `useResponsesApi` da conversation/endpoint config), come già
fa `AttachFileMenu` via `useAgentToolPermissions`.

Disponibilità di context: dedotta dalle capability (come in `AttachFileMenu`
`capabilities.contextEnabled` e in `useDragHelpers` `contextEnabled`).

### 3. Toast (i18n)

Solo chiavi EN in `client/src/locales/en/translation.json`, via `useLocalize`:
- `com_ui_upload_auto_text`: `"\"{{0}}\" uploaded as text — the model doesn't support this file type as a document"`
- `com_ui_upload_provider_unsupported`: `"\"{{0}}\" can't be uploaded to this model and text upload is unavailable"`

### 4. Refactor duplicazione (incluso)

`AttachFileMenu.handleUploadClick` e `DragDropModal` usano il nuovo predicato/mappatura come
unica fonte per costruire i filtri `accept`, eliminando le stringhe di estensioni duplicate.
Comportamento invariato, un solo punto di verità.

## Testing

- **Unit — data-provider:** `isProviderUploadSupported` per ogni provider (xlsx/docx/csv/pdf/
  png/video) con e senza `useResponsesApi`.
- **Unit — client** (`useFileHandling.test.ts`): xlsx su anthropic → `tool_resource=context` + toast;
  pdf e png → invariati; context off → file bloccato + toast errore; batch misto → decisione per-file.
- **E2E (opzionale):** estendere `e2e/.../simpleai-custom.spec.ts` con drag-drop xlsx su Claude.

## Fuori scope

- Guardia backend anti-avvelenamento (le conversazioni già rotte non vengono sanate).
- Fix degli altri bug upload noti (PNG "come testo" → byte binari; PDF scan → 500 OCR;
  allegati immagine persistenti tra chat) — tracciati a parte.

## File toccati

- `packages/data-provider/src/file-config.ts` (nuovo predicato + test)
- `client/src/hooks/Files/useFileHandling.ts` (reinstradamento per-file)
- `client/src/components/Chat/Input/Files/AttachFileMenu.tsx` (usa predicato)
- `client/src/components/Chat/Input/Files/DragDropModal.tsx` (usa predicato)
- `client/src/locales/en/translation.json` (2 chiavi)
- test: `packages/data-provider` + `client/src/hooks/Files/__tests__/useFileHandling.test.ts`
