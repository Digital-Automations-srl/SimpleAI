# Fix Upload Provider Fallback — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reindirizzare automaticamente a testo (`document_parser`) i file allegati sul path "provider" ma non supportati da quel provider come immagine/documento, con toast discreto, coprendo menu e drag-drop.

**Architecture:** Un unico predicato condiviso in `packages/data-provider` decide se un MIME è inviabile sul path provider. Il funnel comune `handleFiles` (in `useFileHandling.ts`) applica la decisione **per-file** appena prima dell'upload: se non supportato e la capability `context` è attiva reindirizza a `EToolResources.context` con toast; altrimenti blocca il file con toast d'errore. Menu e drag-drop vengono rifattorizzati per usare lo stesso predicato (single source of truth).

**Tech Stack:** TypeScript, React 18, Jest, `librechat-data-provider`, `@testing-library/react`.

## Global Constraints

- Nuovo codice backend/shared solo TypeScript, niente `any`, tipi espliciti (CLAUDE.md).
- Non duplicare tipi/logica: il predicato in `file-config.ts` è l'unica fonte per la mappatura MIME→provider.
- Solo chiavi EN in `client/src/locales/en/translation.json`; testo UI via `useLocalize()`.
- Import order e stile del file circostante invariati; niente commenti superflui.
- Testing: logica reale, spie sui mock esistenti; usare i pattern del file `useFileHandling.test.ts` già presente.
- Provider di riferimento per la mappatura (verbatim dal codice esistente in `DragDropModal.tsx:86-100`):
  - google / openrouter → immagini + video + audio + `application/pdf`
  - bedrock → immagini + `isBedrockDocumentType`
  - anthropic / openAI / custom / azureOpenAI(`useResponsesApi=true`) → immagini + `application/pdf`
  - provider senza supporto documenti → solo immagini
- Commit frequenti, un commit per task.

---

### Task 1: Predicato condiviso `isProviderUploadSupported`

**Files:**
- Modify: `packages/data-provider/src/file-config.ts`
- Test: `packages/data-provider/src/file-config.spec.ts` (creare se assente; altrimenti aggiungere describe)

**Interfaces:**
- Produces:
  - `interface ProviderUploadOptions { provider?: string | null; endpoint?: string | null; endpointType?: string | null; useResponsesApi?: boolean }`
  - `isProviderUploadSupported(mimeType: string | null | undefined, opts: ProviderUploadOptions): boolean`
  - `getProviderUploadAccept(opts: ProviderUploadOptions): string`

- [x] **Step 1: Write the failing test**

Creare/estendere `packages/data-provider/src/file-config.spec.ts`:

```ts
import {
  isProviderUploadSupported,
  getProviderUploadAccept,
} from './file-config';

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

describe('isProviderUploadSupported', () => {
  it('rejects xlsx on anthropic (only images + pdf)', () => {
    expect(isProviderUploadSupported(XLSX, { provider: 'anthropic' })).toBe(false);
  });
  it('accepts pdf and png on anthropic', () => {
    expect(isProviderUploadSupported('application/pdf', { provider: 'anthropic' })).toBe(true);
    expect(isProviderUploadSupported('image/png', { provider: 'anthropic' })).toBe(true);
  });
  it('accepts xlsx on bedrock (document formats)', () => {
    expect(isProviderUploadSupported(XLSX, { provider: 'bedrock' })).toBe(true);
  });
  it('accepts video on google, rejects on anthropic', () => {
    expect(isProviderUploadSupported('video/mp4', { provider: 'google' })).toBe(true);
    expect(isProviderUploadSupported('video/mp4', { provider: 'anthropic' })).toBe(false);
  });
  it('azureOpenAI: pdf rejected without responsesApi, accepted with it', () => {
    expect(
      isProviderUploadSupported('application/pdf', { provider: 'azureOpenAI', endpointType: 'azureOpenAI' }),
    ).toBe(false);
    expect(
      isProviderUploadSupported('application/pdf', {
        provider: 'azureOpenAI',
        endpointType: 'azureOpenAI',
        useResponsesApi: true,
      }),
    ).toBe(true);
  });
});

describe('getProviderUploadAccept', () => {
  it('anthropic → images + pdf', () => {
    expect(getProviderUploadAccept({ provider: 'anthropic' })).toBe(
      'image/*,.heif,.heic,.pdf,application/pdf',
    );
  });
});
```

- [x] **Step 2: Run test to verify it fails**

Run: `cd packages/data-provider && npx jest file-config.spec -t "isProviderUploadSupported"`
Expected: FAIL — `isProviderUploadSupported is not a function`.

- [x] **Step 3: Write minimal implementation**

In `packages/data-provider/src/file-config.ts` aggiungere `Providers` all'import esistente da `./schemas`:

```ts
import { EModelEndpoint, isAgentsEndpoint, isDocumentSupportedProvider, Providers } from './schemas';
```

Poi, dopo `bedrockDocumentExtensions` (riga ~179), aggiungere:

```ts
export interface ProviderUploadOptions {
  provider?: string | null;
  endpoint?: string | null;
  endpointType?: string | null;
  useResponsesApi?: boolean;
}

const getProviderUploadCapability = (opts: ProviderUploadOptions) => {
  const { provider, endpoint, endpointType, useResponsesApi } = opts;
  let currentProvider = provider || endpoint;
  if (currentProvider?.toLowerCase() === Providers.OPENROUTER) {
    currentProvider = Providers.OPENROUTER;
  }
  const isAzureWithResponsesApi =
    (currentProvider === EModelEndpoint.azureOpenAI ||
      endpointType === EModelEndpoint.azureOpenAI) &&
    useResponsesApi === true;
  const documentSupported =
    isDocumentSupportedProvider(endpointType) ||
    isDocumentSupportedProvider(currentProvider) ||
    isAzureWithResponsesApi;
  const imageVideoAudio =
    currentProvider === EModelEndpoint.google || currentProvider === Providers.OPENROUTER;
  const bedrock = currentProvider === Providers.BEDROCK || endpointType === EModelEndpoint.bedrock;
  return { documentSupported, imageVideoAudio, bedrock };
};

export const isProviderUploadSupported = (
  mimeType: string | null | undefined,
  opts: ProviderUploadOptions,
): boolean => {
  const type = mimeType ?? '';
  const isImage = type.startsWith('image/');
  const { documentSupported, imageVideoAudio, bedrock } = getProviderUploadCapability(opts);
  if (!documentSupported) {
    return isImage;
  }
  if (imageVideoAudio) {
    return (
      isImage ||
      type.startsWith('video/') ||
      type.startsWith('audio/') ||
      type === 'application/pdf'
    );
  }
  if (bedrock) {
    return isImage || isBedrockDocumentType(type);
  }
  return isImage || type === 'application/pdf';
};

export const getProviderUploadAccept = (opts: ProviderUploadOptions): string => {
  const { documentSupported, imageVideoAudio, bedrock } = getProviderUploadCapability(opts);
  if (!documentSupported) {
    return 'image/*,.heif,.heic';
  }
  if (imageVideoAudio) {
    return 'image/*,.heif,.heic,.pdf,application/pdf,video/*,audio/*';
  }
  if (bedrock) {
    return `image/*,.heif,.heic,${bedrockDocumentExtensions}`;
  }
  return 'image/*,.heif,.heic,.pdf,application/pdf';
};
```

- [x] **Step 4: Run test to verify it passes**

Run: `cd packages/data-provider && npx jest file-config.spec`
Expected: PASS.

- [x] **Step 5: Rebuild data-provider (consumato dal client)**

Run: `npm run build:data-provider`
Expected: build ok, nessun errore TS.

- [x] **Step 6: Commit**

```bash
git add packages/data-provider/src/file-config.ts packages/data-provider/src/file-config.spec.ts
git commit -m "feat(files): predicato condiviso isProviderUploadSupported + getProviderUploadAccept"
```

---

### Task 2: Reinstradamento per-file in `handleFiles` + i18n

**Files:**
- Modify: `client/src/hooks/Files/useFileHandling.ts`
- Modify: `client/src/locales/en/translation.json`
- Test: `client/src/hooks/Files/__tests__/useFileHandling.test.ts`

**Interfaces:**
- Consumes: `isProviderUploadSupported` (Task 1).
- Produces: comportamento di reroute su `handleFiles`; nessuna nuova firma pubblica.

- [x] **Step 1: Add i18n keys**

In `client/src/locales/en/translation.json`, accanto alle altre `com_ui_upload_*` (ordine alfabetico, dopo `com_ui_upload_type` / vicino):

```json
  "com_ui_upload_auto_text": "\"{{0}}\" uploaded as text — the model doesn't support this file type as a document",
  "com_ui_upload_provider_unsupported": "\"{{0}}\" can't be uploaded to this model and text upload is unavailable",
```

- [x] **Step 2: Write the failing test**

Aggiungere in `useFileHandling.test.ts` un nuovo `describe` (dopo `endpointOverride`). Prima estendere il mock di `@tanstack/react-query` per poter pilotare le capability e reintrodurre `useGetFileConfig`. Sostituire il mock esistente di react-query con una versione pilotabile:

```ts
let mockEndpointsData: Record<string, unknown> | undefined;
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    getQueryData: jest.fn((key: unknown[]) => {
      if (Array.isArray(key) && key[0] === 'endpoints') {
        return mockEndpointsData;
      }
      return undefined;
    }),
    refetchQueries: jest.fn(),
  })),
}));
```

(Impostare `mockEndpointsData = undefined` in `beforeEach`.)

Poi il test:

```ts
describe('provider upload fallback', () => {
  const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  it('reroutes unsupported file to context when context capability is enabled', async () => {
    mockConversation = { conversationId: 'c1', endpoint: 'anthropic', endpointType: undefined };
    mockEndpointsData = { agents: { capabilities: ['context'] } };

    const useFileHandling = await loadHook();
    const { result } = renderHook(() => useFileHandling());
    const xlsx = new File(['x'], 'data.xlsx', { type: XLSX });

    await act(async () => {
      await result.current.handleFiles([xlsx]);
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    const formData: FormData = mockMutate.mock.calls[0][0];
    expect(formData.get('tool_resource')).toBe('context');
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'info', message: 'com_ui_upload_auto_text' }),
    );
  });

  it('does not reroute a pdf on anthropic', async () => {
    mockConversation = { conversationId: 'c1', endpoint: 'anthropic', endpointType: undefined };
    mockEndpointsData = { agents: { capabilities: ['context'] } };

    const useFileHandling = await loadHook();
    const { result } = renderHook(() => useFileHandling());
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });

    await act(async () => {
      await result.current.handleFiles([pdf]);
    });

    const formData: FormData = mockMutate.mock.calls[0][0];
    expect(formData.get('tool_resource')).toBeNull();
  });

  it('blocks unsupported file when context capability is disabled', async () => {
    mockConversation = { conversationId: 'c1', endpoint: 'anthropic', endpointType: undefined };
    mockEndpointsData = { agents: { capabilities: [] } };

    const useFileHandling = await loadHook();
    const { result } = renderHook(() => useFileHandling());
    const xlsx = new File(['x'], 'data.xlsx', { type: XLSX });

    await act(async () => {
      await result.current.handleFiles([xlsx]);
    });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'error', message: 'com_ui_upload_provider_unsupported' }),
    );
  });
});
```

- [x] **Step 3: Run test to verify it fails**

Run: `cd client && npx jest useFileHandling.test -t "provider upload fallback"`
Expected: FAIL — `tool_resource` è `null` (nessun reroute) e nessun toast.

- [x] **Step 4: Implement the reroute**

In `client/src/hooks/Files/useFileHandling.ts`:

Estendere gli import da `librechat-data-provider` con `AgentCapabilities`, `defaultAgentCapabilities`, `isProviderUploadSupported` e (se non presente) `QueryKeys`:

```ts
import {
  QueryKeys,
  Constants,
  EToolResources,
  mergeFileConfig,
  AgentCapabilities,
  isAssistantsEndpoint,
  getEndpointFileConfig,
  defaultAgentCapabilities,
  isProviderUploadSupported,
} from 'librechat-data-provider';
import type { Agent, EModelEndpoint, TEndpointsConfig, TError } from 'librechat-data-provider';
```

Aggiungere un resolver (dopo la definizione di `endpoint`, riga ~79):

```ts
const resolveProviderContext = useCallback(() => {
  const endpointsConfig = queryClient.getQueryData<TEndpointsConfig>([QueryKeys.endpoints]);
  const agentId = conversation?.agent_id;
  const agent = agentId
    ? queryClient.getQueryData<Agent>([QueryKeys.agent, agentId])
    : undefined;
  const provider = agent?.provider ?? endpoint;
  const capabilities = endpointsConfig?.[EModelEndpoint.agents]?.capabilities ?? defaultAgentCapabilities;
  const contextEnabled = capabilities.includes(AgentCapabilities.context) === true;
  const useResponsesApi =
    conversation?.useResponsesApi ?? agent?.model_parameters?.useResponsesApi;
  return { provider, contextEnabled, useResponsesApi };
}, [queryClient, conversation, endpoint]);
```

Dentro `handleFiles`, subito prima del ciclo `for (const originalFile of fileList)`, risolvere il contesto una volta:

```ts
const { provider, contextEnabled, useResponsesApi } = resolveProviderContext();
const isProviderPath = _toolResource == null || _toolResource === '';
const skipReroute = isAssistantsEndpoint(endpointType ?? endpoint);
```

All'inizio del ciclo, prima di `const file_id = v4();`, calcolare il tool_resource effettivo e gestire il blocco:

```ts
let effectiveToolResource = _toolResource;
if (isProviderPath && !skipReroute) {
  const supported = isProviderUploadSupported(originalFile.type, {
    provider,
    endpoint,
    endpointType,
    useResponsesApi,
  });
  if (!supported) {
    if (contextEnabled) {
      effectiveToolResource = EToolResources.context;
      showToast({
        message: localize('com_ui_upload_auto_text', { 0: originalFile.name }),
        status: 'info',
        duration: 3000,
      });
    } else {
      showToast({
        message: localize('com_ui_upload_provider_unsupported', { 0: originalFile.name }),
        status: 'error',
        duration: 5000,
      });
      continue;
    }
  }
}
```

Sostituire l'uso di `_toolResource` nel corpo del ciclo (riga ~335) con `effectiveToolResource`:

```ts
if (effectiveToolResource != null && effectiveToolResource !== '') {
  initialExtendedFile.tool_resource = effectiveToolResource;
}
```

- [x] **Step 5: Run tests to verify they pass**

Run: `cd client && npx jest useFileHandling.test`
Expected: PASS (nuovi test + gli 11 esistenti).

- [x] **Step 6: Commit**

```bash
git add client/src/hooks/Files/useFileHandling.ts client/src/locales/en/translation.json client/src/hooks/Files/__tests__/useFileHandling.test.ts
git commit -m "feat(files): auto-fallback a testo per file non supportati dal provider"
```

---

### Task 3: `DragDropModal` usa il predicato condiviso

**Files:**
- Modify: `client/src/components/Chat/Input/Files/DragDropModal.tsx`
- Test: `client/src/components/Chat/Input/Files/__tests__/DragDropModal.spec.tsx`

**Interfaces:**
- Consumes: `isProviderUploadSupported` (Task 1).

- [x] **Step 1: Verify existing tests pass (baseline)**

Run: `cd client && npx jest DragDropModal.spec`
Expected: PASS (baseline verde prima del refactor).

- [x] **Step 2: Replace the private helper**

In `DragDropModal.tsx`, aggiungere `isProviderUploadSupported` all'import da `librechat-data-provider` e rimuovere `isBedrockDocumentType` se non più usato altrove nel file. Sostituire il blocco `isValidProviderFile`/branch (righe ~81-100) con:

```ts
const validFileTypes = files.every((file) =>
  isProviderUploadSupported(inferMimeType(file.name, file.type), {
    provider: currentProvider,
    endpoint,
    endpointType,
    useResponsesApi,
  }),
);

_options.push({
  label: localize('com_ui_upload_provider'),
  value: undefined,
  icon: <FileImageIcon className="icon-md" />,
  condition: validFileTypes,
});
```

Rimuovere le variabili locali ora inutili (`supportsImageDocVideoAudio`, `isBedrock`, `isValidProviderFile`). Mantenere invariato il ramo `else` (solo immagini) che già usa `getFileType(file)?.startsWith('image/')`.

- [x] **Step 3: Run tests to verify they still pass**

Run: `cd client && npx jest DragDropModal.spec`
Expected: PASS — comportamento invariato.

- [x] **Step 4: Commit**

```bash
git add client/src/components/Chat/Input/Files/DragDropModal.tsx
git commit -m "refactor(files): DragDropModal usa isProviderUploadSupported"
```

---

### Task 4: `AttachFileMenu` usa `getProviderUploadAccept`

**Files:**
- Modify: `client/src/components/Chat/Input/Files/AttachFileMenu.tsx`
- Test: `client/src/components/Chat/Input/Files/__tests__/AttachFileMenu.spec.tsx`

**Interfaces:**
- Consumes: `getProviderUploadAccept` (Task 1).

- [x] **Step 1: Verify existing tests pass (baseline)**

Run: `cd client && npx jest AttachFileMenu.spec`
Expected: PASS.

- [x] **Step 2: Use the shared accept builder for the provider path**

In `AttachFileMenu.tsx` aggiungere `getProviderUploadAccept` all'import da `librechat-data-provider`. Nel `handleUploadClick`, il ramo provider imposta oggi `accept` via i fileType `image_document` / `image_document_extended` / `image_document_video_audio`. Sostituire quei tre rami con un unico calcolo basato sul provider corrente, mantenendo il ramo permissivo e il ramo `image`:

```ts
const handleUploadClick = useCallback(
  (fileType?: FileUploadType) => {
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = '';
    if (fileType !== undefined && isPermissiveMimeConfig(endpointFileConfig?.supportedMimeTypes)) {
      inputRef.current.accept = '';
    } else if (fileType === 'image') {
      inputRef.current.accept = 'image/*,.heif,.heic';
    } else if (fileType === 'provider') {
      inputRef.current.accept = getProviderUploadAccept({
        provider: provider ?? endpoint,
        endpoint,
        endpointType,
        useResponsesApi,
      });
    } else {
      inputRef.current.accept = '';
    }
    inputRef.current.click();
    inputRef.current.accept = '';
  },
  [endpointFileConfig?.supportedMimeTypes, provider, endpoint, endpointType, useResponsesApi],
);
```

Aggiornare il tipo `FileUploadType` a `'image' | 'provider'` e, nel `createMenuItems`, il ramo provider chiama `onAction('provider')` (rimuovendo la logica che selezionava `image_document*`). Il ramo non-document continua a chiamare `onAction('image')`.

- [x] **Step 3: Run tests to verify they still pass**

Run: `cd client && npx jest AttachFileMenu.spec`
Expected: PASS. Se un test asseriva i vecchi valori `accept` per-provider, aggiornarlo ai valori prodotti da `getProviderUploadAccept` (identici a quelli precedenti per ciascun provider).

- [x] **Step 4: Commit**

```bash
git add client/src/components/Chat/Input/Files/AttachFileMenu.tsx client/src/components/Chat/Input/Files/__tests__/AttachFileMenu.spec.tsx
git commit -m "refactor(files): AttachFileMenu usa getProviderUploadAccept"
```

---

### Task 5: Verifica finale (lint + build + suite file)

**Files:** nessuno (gate di qualità).

- [x] **Step 1: Lint**

Run: `npm run lint -- client/src/hooks/Files/useFileHandling.ts client/src/components/Chat/Input/Files/AttachFileMenu.tsx client/src/components/Chat/Input/Files/DragDropModal.tsx packages/data-provider/src/file-config.ts`
Expected: nessun errore/warning.

- [x] **Step 2: Build packages**

Run: `npm run build:data-provider`
Expected: build ok.

- [x] **Step 3: Test suite mirata**

Run: `cd packages/data-provider && npx jest file-config.spec` e `cd client && npx jest Files`
Expected: tutto verde.

- [x] **Step 4: Commit (se lint/format ha modificato file)**

```bash
git add -A
git commit -m "chore(files): lint/format fix upload provider fallback"
```

## Self-Review

- **Spec coverage:** §1 predicato → Task 1; §2 reroute per-file + blocco context-off → Task 2; §3 toast/i18n → Task 2 Step 1; §4 refactor duplicazione → Task 3 (DragDropModal) + Task 4 (AttachFileMenu); §5 testing → Task 1/2/3/4 + Task 5. Fuori scope (guardia backend, altri bug upload) non pianificati, come da spec.
- **Placeholder scan:** nessun TBD/TODO; codice completo in ogni step.
- **Type consistency:** `isProviderUploadSupported(mimeType, ProviderUploadOptions)` e `getProviderUploadAccept(ProviderUploadOptions)` usati con la stessa firma in Task 2/3/4; `effectiveToolResource: EToolResources` coerente con l'uso di `EToolResources.context`.
