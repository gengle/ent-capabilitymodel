## Why

The capability model data layer exists but has no way to visualize it. This change adds a read-only web UI so stakeholders can browse capability models as a card grid — the standard enterprise capability map format.

## What Changes

- Add an Express REST API (`src/api/`) exposing two endpoints over the existing service layer
- Add a Vue 3 frontend (`client/`) that fetches and renders a selected capability model as a hierarchical card grid
- Add Vite for frontend dev/build tooling
- Wire both into `package.json` scripts for local development

## Capabilities

### New Capabilities

- `rest-api`: Express HTTP layer exposing model list and full model tree endpoints
- `capability-map-viewer`: Vue 3 frontend — model selector and card grid display (Domains → Groups → Capabilities → Sub-capabilities)

### Modified Capabilities

<!-- None — no existing spec requirements are changing -->

## Impact

- New dev dependency: Vite
- New runtime dependency: Express
- New frontend dependency: Vue 3
- `src/api/` and `client/` directories added to the repo
- Existing `src/services/` and `src/db/` are consumed by the API with no modifications
- No database schema changes
