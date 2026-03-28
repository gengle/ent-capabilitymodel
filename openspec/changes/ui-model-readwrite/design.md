## Context

The frontend is a Vue 3 + Vite app (`client/`) with a flat component structure: `App.vue` coordinates model selection, `CapabilityMap.vue` renders the tree, and `DomainCard`/`GroupCard`/`CapabilityCard` render the nodes. All API calls live in `client/src/api.ts`. The backend write endpoints (POST/PUT/DELETE for models and nodes) were introduced in `api-model-readwrite` and are ready to consume.

## Goals / Non-Goals

**Goals:**
- Add model CRUD (create, rename/describe, delete) accessible from the header
- Add node CRUD at every level of the tree (domain → group → capability → sub-capability)
- Provide inline edit/delete affordances on existing cards with modal forms
- Keep the read-only path intact — no regressions for viewers

**Non-Goals:**
- Drag-and-drop reordering of nodes
- Bulk / multi-select operations
- Undo/redo beyond the browser's own history
- Authentication or permission gating

## Decisions

### Component decomposition: shared `NodeForm` modal vs per-level forms

All four node levels share the same editable fields (`name`, `description`, `owner`, `level`, `parentId`, `kindId`, `properties`). A single `NodeForm.vue` parameterised by `level` and `mode` (`create` | `edit`) avoids duplication. Similarly, `ModelForm.vue` covers both create and edit for models.

**Decision:** Two form components (`ModelForm.vue`, `NodeForm.vue`) used from multiple call sites.

### State management: local tree mutation vs full re-fetch

After a write succeeds, we could re-fetch `GET /api/models/:id/tree`. This is simple but causes a visible flicker. Instead, mutate the local `tree` ref in `App.vue` directly and only re-fetch on error to recover.

**Decision:** Optimistic local mutation; re-fetch only for error recovery. The tree shape is simple enough that local mutation is safe and predictable.

### Edit/delete affordance visibility: always-visible vs hover

Always-visible buttons clutter the read experience. Hover-reveal keeps the map clean but hides affordances from touch users.

**Decision:** Show a subtle edit icon (pencil) and delete icon (×) on hover via CSS `:hover` on each card. This is acceptable for a desktop-first internal tool.

### NodeKind / ModelType selection in forms

`NodeForm` for level 3–4 nodes must offer a `kindId` selector. ModelTypes are needed for `ModelForm`. Both require a secondary API call. The `listModelTypes()` and `listNodeKinds()` service functions already exist but have no HTTP surface. Extracting model types from the `/api/models` summary list is fragile — it breaks on a fresh install with no models yet and only surfaces types already in use rather than all available types.

**Decision:** Add `GET /api/model-types` and `GET /api/node-kinds` routes to the backend (trivial — services are already implemented). Fetch both once at app startup in `App.vue` and pass as props. This is the correct scope for this change, not a follow-up.

### Error feedback

Errors from write operations should be displayed without destroying the current view. Use a transient toast/banner at the top of the page rather than replacing the map.

**Decision:** A single `errorToast` ref in `App.vue`, auto-dismissed after 4 seconds, shown above the map.

## Risks / Trade-offs

- **Stale tree after concurrent edits**: If two users edit simultaneously, local mutations diverge from server state. → Acceptable for a small internal team; add a "Refresh" button as an escape hatch.
- **Reference data stale after page load**: If new NodeKinds or ModelTypes are added while the page is open, the form selectors won't reflect them. → A page refresh resolves this; acceptable for now.
- **Deleting non-leaf nodes**: The API rejects deletion of nodes with children (400). The UI should check and warn before attempting. → Disable the delete button on non-leaf nodes by checking `groups.length`, `capabilities.length`, `subCapabilities.length`.

## Migration Plan

1. Add `GET /api/model-types` and `GET /api/node-kinds` backend routes
2. Add write + reference-data fetch functions to `client/src/api.ts`
3. Add `ModelForm.vue` and `NodeForm.vue` components
4. Wire create/edit/delete into `App.vue` and card components
5. Pre-fetch model types and node kinds at app startup, pass to forms
6. **Rollback**: Remove the new route handlers and frontend components; no schema or data changes to reverse
