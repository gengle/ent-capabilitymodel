## Context

The service layer (`src/services/model.ts`, `src/services/node.ts`) already fully implements CRUD for Models and Nodes, including hierarchy validation, kind enforcement, and property validation. The only gap is that `src/api/routes/models.ts` exposes only two GET handlers — the write operations have no HTTP surface.

## Goals / Non-Goals

**Goals:**
- Expose `createModel`, `updateModel`, `deleteModel` via POST/PUT/DELETE on `/api/models`
- Expose `createNode`, `updateNode`, `deleteNode` via POST/PUT/DELETE on `/api/models/:modelId/nodes` and `/api/nodes/:id`
- Return consistent JSON error responses matching the existing `{ error: string }` shape

**Non-Goals:**
- Bulk/batch operations
- Authentication or authorization (out of scope for this change)
- Changing the existing GET endpoint contracts

## Decisions

### Route placement: extend `models.ts` vs new `nodes.ts` file

The existing `modelsRouter` in `src/api/routes/models.ts` handles model-scoped concerns. Node write endpoints are accessed both as `/api/models/:modelId/nodes` (create, scoped to a model) and `/api/nodes/:id` (update/delete by ID). A separate `nodesRouter` mounted at `/api/nodes` is cleaner and avoids mixing concerns in the models file.

**Decision**: Add model write routes to `models.ts`; create a new `nodes.ts` for node write routes. Register `nodesRouter` in `src/api/index.ts`.

### Error handling: service throws, route catches

Service functions throw `Error` with descriptive messages for not-found and validation failures. Routes translate these into HTTP status codes:
- Not found errors (`'... not found'`) → 404
- Validation / constraint errors → 400
- Unexpected errors → 500 (existing middleware)

**Decision**: Each write handler wraps the service call in try/catch and inspects the error message to determine 404 vs 400. This keeps routes thin and avoids leaking service internals.

### Node deletion: leaf-only vs cascade

`deleteNode` currently rejects if the node has children. This is intentional per the node spec — callers must delete leaf nodes bottom-up. The API will surface this as a 400 with the service's message.

**Decision**: No change to deletion semantics. Document the leaf-only constraint in the API spec.

## Risks / Trade-offs

- **Error classification by message string**: Inspecting error messages to distinguish 404 from 400 is fragile if messages change. → Mitigation: introduce typed errors (e.g., `NotFoundError`) in a follow-up; for now, message inspection is scoped to a single small utility.
- **No auth**: Write endpoints are unauthenticated. → Mitigation: acceptable while the app is internal; auth can be layered in front without touching these routes.
- **Performance**: Each write goes through the existing Prisma client with no caching concerns. Single-row writes are not a performance risk.

## Migration Plan

1. Add write routes to `models.ts` and new `nodes.ts`
2. Register `nodesRouter` in `src/api/index.ts`
3. No schema migrations required — data model is unchanged
4. **Rollback**: Remove the new route handlers and `nodesRouter` registration; no data changes to reverse