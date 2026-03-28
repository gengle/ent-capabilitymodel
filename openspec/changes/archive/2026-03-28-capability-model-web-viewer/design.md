## Context

The data layer (Prisma + SQLite + TypeScript service layer) is complete. This change adds the minimal stack needed to visualise a capability model in a browser: an Express API to bridge the service layer to HTTP, and a Vue 3 SPA to render the card grid.

Both pieces live in the same repository. The Express server serves the API at `/api/*` and can optionally serve the built Vue app as static files in production.

## Goals / Non-Goals

**Goals:**
- Expose a stable REST API for reading models and their full node tree
- Render a capability model as a hierarchical card grid (Domain → Group → Capability → Sub-capability)
- Support selecting between multiple models via a dropdown
- Show NodeKind custom properties on Capability cards
- Work locally with a single `npm run dev` command

**Non-Goals:**
- Create, edit, or delete any data (read-only; deferred)
- Authentication or access control (internal tool)
- Pagination or lazy loading (full tree loaded in one request)
- Mobile-optimised layout
- Deployment / hosting configuration

## Decisions

### D1: Single `/api/models/:id/tree` endpoint returns full hierarchy

**Decision:** One endpoint returns the entire node tree for a model, structured as a nested object rather than a flat list.

**Rationale:** The card grid needs all four levels simultaneously to render. Separate per-level requests would require waterfall fetching or client-side assembly. A single pre-assembled tree response is simpler and fast enough for the expected data volumes (hundreds of nodes, not millions).

**Response shape:**
```json
{
  "id": "...",
  "name": "Enterprise 2026",
  "modelType": "CapabilityModel",
  "domains": [
    {
      "id": "...", "name": "Customer", "level": 1,
      "groups": [
        {
          "id": "...", "name": "Acquisition", "level": 2,
          "capabilities": [
            {
              "id": "...", "name": "Lead Management", "level": 3,
              "kind": "BusinessCapability",
              "properties": { "maturity": "Initial", "owner_team": "Sales" },
              "subCapabilities": [
                { "id": "...", "name": "Lead Scoring", "level": 4, "properties": {} }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### D2: Express API in `src/api/`, imported directly from service layer

**Decision:** `src/api/index.ts` creates an Express app, imports from `src/services/`, and registers routes. No new data access code; the service layer is the only source of truth.

**Rationale:** Avoids duplicating data access logic. The API is a thin HTTP adapter over the existing services.

### D3: Vue 3 with Composition API + Vite in `client/`

**Decision:** Vue 3 (Composition API, `<script setup>`) with Vite for dev server and build. Scaffolded with `npm create vue@latest`.

**Rationale:** Vue 3 + Vite is fast to set up, familiar, and has excellent component composition for the nested card structure. `<script setup>` keeps components concise.

**Alternative considered:** Nuxt — rejected as overkill for a read-only internal viewer with no SSR requirement.

### D4: Card grid layout using CSS Grid

**Decision:** Domain cards are arranged in a CSS Grid row. Groups are nested inside Domain cards as a sub-grid. Capabilities are listed inside Group cards.

```
┌─────────────────────────────────────────────────────────┐
│  [Model Selector ▾]                                     │
├──────────────────┬──────────────────┬───────────────────┤
│  Domain: Customer│  Domain: Finance │  Domain: Ops      │
│  ┌────────────┐  │  ┌────────────┐  │  ┌────────────┐  │
│  │ Acquisition│  │  │  Billing   │  │  │Supply Chain│  │
│  │ ─ Lead Mgmt│  │  │ ─ Invoicing│  │  │ ─ Logistics│  │
│  │ ─ Lead Score│ │  │ ─ Payments │  │  │ ─ Inventory│  │
│  └────────────┘  │  └────────────┘  │  └────────────┘  │
│  ┌────────────┐  │                  │                   │
│  │ Retention  │  │                  │                   │
│  │ ─ Churn    │  │                  │                   │
│  └────────────┘  │                  │                   │
└──────────────────┴──────────────────┴───────────────────┘
```

**Rationale:** CSS Grid handles variable-width domains cleanly. Nesting is natural — Groups are `display: grid` inside Domain cards.

### D5: Dev workflow — two processes, one command

**Decision:** Use `concurrently` to run the Express server (`ts-node src/api/index.ts`) and Vite dev server (`vite --config client/vite.config.ts`) in parallel from `npm run dev`. Vite proxies `/api/*` to the Express server.

**Rationale:** Avoids CORS configuration and mirrors a production setup where Express serves both API and static files.

## Risks / Trade-offs

- **Large models load slowly** → Mitigation: Acceptable for now given read-only internal use; pagination can be added later if needed.
- **`ts-node` in dev adds startup latency** → Mitigation: Negligible for a local tool; can switch to `tsx` if it becomes annoying.
- **SQLite file-based access from Express** → No risk: same process, same file, same Prisma client instance.

## Open Questions

- Should the Express server also serve the built `client/dist/` as static files in production, or is a separate static host expected?
