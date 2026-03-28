## Why

The REST API currently exposes only read endpoints (`GET /api/models` and `GET /api/models/:id/tree`), making the capability model read-only over HTTP. Write operations (create, update, delete) can only be performed directly against the database, blocking any UI or external tooling that needs to build or maintain capability models via API.

## What Changes

- Add `POST /api/models` — create a new Model
- Add `PUT /api/models/:id` — update a Model's name, description, or modelType
- Add `DELETE /api/models/:id` — delete a Model and cascade to its nodes
- Add `POST /api/models/:modelId/nodes` — create a Node within a Model
- Add `PUT /api/nodes/:id` — update a Node's name, description, kind, or properties
- Add `DELETE /api/nodes/:id` — delete a Node (and cascade to its children)

## Capabilities

### New Capabilities

- `api-model-write`: HTTP endpoints for creating, updating, and deleting Models via REST API
- `api-node-write`: HTTP endpoints for creating, updating, and deleting Nodes via REST API

### Modified Capabilities

- `rest-api`: New write endpoints added; existing GET endpoints unchanged

## Impact

- **REST API layer**: New route handlers for models and nodes
- **Validation**: Input validation enforcing existing `capability-model` and `node` domain rules (hierarchy levels, kind enforcement, cascade delete)
- **No breaking changes**: All existing GET endpoints remain unchanged
- **Rollback**: New endpoints can be disabled behind a feature flag or removed independently without affecting existing read routes