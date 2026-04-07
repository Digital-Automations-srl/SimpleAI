# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibreChat is a self-hosted AI chat platform (monorepo). Express.js backend + React SPA frontend, backed by MongoDB.

## Monorepo Structure

| Workspace | Language | Purpose |
|---|---|---|
| `/api` | JS (legacy) | Express server — **minimize changes here**, thin wrappers only |
| `/packages/api` | TypeScript | **All new backend code goes here** |
| `/packages/data-schemas` | TypeScript | Mongoose models/schemas, shared across backend |
| `/packages/data-provider` | TypeScript | Shared API types, endpoints, data-service — used by both frontend and backend |
| `/client` | TypeScript/React | Frontend SPA (React 18 + Vite + Recoil + React Query) |
| `/packages/client` | TypeScript | Shared React component library (Radix UI based) |

**Dependency flow:** `client` → `data-provider` ← `api` → `data-schemas` → `data-provider`; `api` → `packages/api` → `data-schemas` + `data-provider`.

## Development Commands

```bash
npm run smart-reinstall     # Install deps (if lockfile changed) + build via Turborepo
npm run reinstall           # Clean install — wipe node_modules and reinstall
npm run build               # Build all packages via Turborepo (parallel, cached)
npm run build:data-provider # Rebuild packages/data-provider after changes
npm run backend             # Start backend (production, port 3080)
npm run backend:dev         # Start backend with nodemon (development)
npm run frontend:dev        # Start frontend dev server with HMR (port 3090, proxies to 3080)
```

Node.js: v20.19.0+ or ^22.12.0 or >= 23.0.0. Database: MongoDB.

## Testing

Framework: **Jest** (per-workspace). Run from workspace directory:

```bash
cd api && npx jest <pattern>                # API tests
cd packages/api && npx jest <pattern>       # Backend package tests
cd client && npx jest <pattern>             # Client tests
cd packages/data-provider && npx jest <pattern>
cd packages/data-schemas && npx jest <pattern>
```

Run all: `npm run test:all`. E2E: `npm run e2e` (Playwright).

**Testing philosophy:** Real logic over mocks. Use spies over mocks. Use `mongodb-memory-server` for DB tests. Only mock what you cannot control (external HTTP APIs, rate-limited services). Heavy mocking is a code smell.

## Linting & Formatting

```bash
npm run lint         # ESLint (flat config, eslint.config.mjs)
npm run lint:fix     # Auto-fix
npm run format       # Prettier with Tailwind plugin
```

All TypeScript/ESLint warnings and errors **must** be resolved.

## Workspace Boundaries

- **All new backend code must be TypeScript** in `/packages/api`.
- Keep `/api` changes to the absolute minimum (thin JS wrappers calling into `/packages/api`).
- Database schemas/models go in `/packages/data-schemas`.
- Frontend/backend shared API logic (endpoints, types, data-service) goes in `/packages/data-provider`.

## Code Style

### Structure
- **Never-nesting**: early returns, flat code, minimal indentation. Break complex operations into well-named helpers.
- **Functional first**: pure functions, immutable data, `map`/`filter`/`reduce` over imperative loops. OOP only when it clearly improves domain modeling.
- **No dynamic imports** unless absolutely necessary.

### Type Safety
- **Never use `any`**. Explicit types for all parameters, return values, and variables.
- **Limit `unknown`** — avoid `Record<string, unknown>` and `as unknown as T`.
- **Don't duplicate types** — check `packages/data-provider` for existing types before defining new ones.

### Performance
- **Minimize looping** — consolidate sequential O(n) operations into a single pass. Never loop over the same collection twice.
- Prefer `Map`/`Set` for lookups instead of `Array.find`/`Array.includes`.
- Prevent memory leaks: dispose resources/event listeners, no circular references.

### Comments
- Self-documenting code; no inline comments narrating what code does.
- JSDoc only for complex/non-obvious logic or intellisense on public APIs.

### Import Order
1. **Package imports** — sorted shortest to longest (`react` always first).
2. **`import type` imports** — sorted longest to shortest (package types first, then local).
3. **Local/project imports** — sorted longest to shortest.

Always use standalone `import type { ... }` — never inline `type` inside value imports.

## Frontend Patterns (`client/src/`)

- **Localization**: All user-facing text must use `useLocalize()`. Only update English keys in `client/src/locales/en/translation.json`. Key prefixes: `com_ui_`, `com_assistants_`, etc.
- **State**: Recoil atoms (`client/src/store/`) for global state, React Query for server state, contexts for UI-scoped state.
- **Data hooks**: `client/src/data-provider/[Feature]/queries.ts` → `[Feature]/index.ts` → `client/src/data-provider/index.ts`.
- **Query/Mutation keys**: `packages/data-provider/src/keys.ts`.
- **API endpoints**: `packages/data-provider/src/api-endpoints.ts`.
- **Data service**: `packages/data-provider/src/data-service.ts`.
- **Components**: Semantic HTML with ARIA labels for accessibility. Group in feature directories with index files.

## Backend Architecture

- **Entry point**: `/api/server/index.js` (Express 5, port 3080).
- **Routes**: `/api/server/routes/` — REST endpoints under `/api/*`.
- **Controllers**: `/api/server/controllers/` — request handling logic.
- **Auth**: Passport.js with JWT, local, LDAP, OAuth2 (Google/GitHub/Discord/Facebook/Apple), OpenID Connect, SAML.
- **Sessions**: express-session with Redis/Memstore/File backends.
- **DB**: MongoDB via Mongoose. Models in `packages/data-schemas/src/models/`.
- **Search**: Meilisearch for full-text indexing (`/api/db/indexSync.js`).
- **MCP**: Model Context Protocol managed by `packages/api/src/mcp/MCPManager`.
- **Caching**: Keyv (Redis, File, Memory backends).

## Key File Locations

| Purpose | Path |
|---|---|
| API entry point | `api/server/index.js` |
| API routes | `api/server/routes/` |
| Auth strategies | `api/strategies/` |
| Client entry | `client/src/main.jsx` |
| Client app | `client/src/App.jsx` |
| Client routing | `client/src/routes/` |
| Recoil atoms | `client/src/store/` |
| i18n config | `client/src/locales/i18n.ts` |
| English translations | `client/src/locales/en/translation.json` |
| API data service | `packages/data-provider/src/data-service.ts` |
| API request handler | `packages/data-provider/src/request.ts` |
| Mongoose models | `packages/data-schemas/src/models/` |
| Backend utilities | `packages/api/src/` |
| Env template | `.env.example` |
| Docker setup | `docker-compose.yml` |
| Turbo config | `turbo.json` |
| ESLint config | `eslint.config.mjs` |
