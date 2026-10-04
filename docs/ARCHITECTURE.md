# Architecture

```mermaid
flowchart LR
  family[Family browser] --> app[Next.js App Router]
  app --> room[Family Room API]
  room --> guard[Number guard]
  guard --> db[(SQLite or Postgres)]
  room --> scripted[ScriptedBrain]
  room --> llm[LLM adapter optional]
  staff[Staff] --> auth[Auth.js]
  auth --> admin[Admin and counsellor]
  admin --> db
```

Numbers shown to a family are loaded from OutcomeStat rows, passed through slot tokens, and checked again for stray digits. The model is not allowed to invent a figure.

```mermaid
sequenceDiagram
  participant A as Phone A
  participant API as Room API
  participant Bus as RoomBus
  participant B as Phone B
  A->>API: POST /chat/stream
  API->>Bus: message.created and disha.done
  B->>API: GET /rooms/:id/events (SSE)
  Bus-->>B: event
  Note over B: If SSE drops, poll GET /sessions/:id every 2s
```

The bus is in-process. A second instance does not share memory, so the client falls back to polling message rows.

```mermaid
erDiagram
  Family ||--o{ Session : has
  Session ||--o{ Message : has
  Trade ||--o{ OutcomeStat : measured
  Dataset ||--o{ OutcomeStat : versions
  Source ||--o{ OutcomeStat : cites
  EscalationCase ||--o| EscalationOutcome : closes
```
