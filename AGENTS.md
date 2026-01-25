
### Naming and API Response Conventions

- Do not use cryptic or shortened variable names like `resp`, `cfg`, `arr`, `str`. Prefer `response`, `config`, `items`, `text`.
- Avoid ambiguous keys in API responses. Use explicit, self-descriptive names.
  - Bad: `{ ack: '...' }`
  - Good: `{ acknowledgeMessage: '...' }`
- For booleans, use positive, descriptive names: `isActive`, `hasError`, `canEdit`.
- For IDs, use `...Id` suffix: `threadId`, `reservationId`.
- For enums/labels, prefer `value` (machine) and `label` (human) structure on the frontend.
