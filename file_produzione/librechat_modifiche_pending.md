# Modifiche pending per librechat.yaml di produzione

## 1. ModelSpecs — Modelli con reasoning preconfigurato (task #10370/#10372)

Aggiungere in fondo al file `librechat.yaml`:

```yaml
modelSpecs:
  list:
    - name: "gpt-5.2-reasoning"
      label: "GPT-5.2 Reasoning"
      description: "GPT-5.2 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5.2"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"

    - name: "gpt-5.1-reasoning"
      label: "GPT-5.1 Reasoning"
      description: "GPT-5.1 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5.1"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"

    - name: "gpt-5-reasoning"
      label: "GPT-5 Reasoning"
      description: "GPT-5 con ragionamento avanzato attivo"
      group: "azureOpenAI"
      preset:
        endpoint: "azureOpenAI"
        model: "gpt-5"
        useResponsesApi: true
        reasoning_effort: "high"
        reasoning_summary: "concise"
```

## 2. Agents share — Tasto condivisione (task #10418)

GIA' APPLICATO nel file. La riga `agents: true` e' stata espansa in:

```yaml
  agents:
    use: true
    create: true
    share: true
```

## Note

- Dopo aver applicato le modifiche, serve restart del container LibreChat
- I modelSpecs appaiono nel selettore modelli raggruppati sotto Azure OpenAI
- L'utente seleziona "GPT-5.2 Reasoning" e il reasoning funziona senza configurare nulla
- I modelli standard (senza reasoning) restano disponibili come prima
