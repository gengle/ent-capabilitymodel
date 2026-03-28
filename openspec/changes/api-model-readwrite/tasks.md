## 1. Model Write Routes

- [x] 1.1 Add `POST /api/models` handler to `src/api/routes/models.ts` — validate `name` and `modelTypeId` present, call `createModel`, return 201
- [x] 1.2 Add `PUT /api/models/:id` handler — call `updateModel`, return 200; map not-found to 404, validation errors to 400
- [x] 1.3 Add `DELETE /api/models/:id` handler — call `deleteModel`, return 204; map not-found to 404

## 2. Node Write Routes

- [x] 2.1 Create `src/api/routes/nodes.ts` with a `nodesRouter` (Express Router)
- [x] 2.2 Add `PUT /nodes/:id` handler — validate body, call `updateNode`, return 200; map errors to 404/400
- [x] 2.3 Add `DELETE /nodes/:id` handler — call `deleteNode`, return 204; map errors to 404/400
- [x] 2.4 Add `POST /api/models/:modelId/nodes` handler in `models.ts` — validate required fields, call `createNode`, return 201; map errors to 400

## 3. Router Registration

- [x] 3.1 Import and mount `nodesRouter` at `/api` in `src/api/index.ts`

## 4. Error Handling Utility

- [x] 4.1 Add a small `handleServiceError(err, res)` helper (in routes or a shared util) that maps "not found" messages → 404 and other errors → 400, keeping route handlers thin

## 5. Verification

- [x] 5.1 Manually test `POST /api/models` with valid and invalid payloads (missing field, bad modelTypeId)
- [x] 5.2 Manually test `PUT` and `DELETE` on `/api/models/:id` including not-found cases
- [x] 5.3 Manually test `POST /api/models/:modelId/nodes` for level 1–4, kind constraints, hierarchy violations
- [x] 5.4 Manually test `PUT /api/nodes/:id` and `DELETE /api/nodes/:id` including child-node rejection