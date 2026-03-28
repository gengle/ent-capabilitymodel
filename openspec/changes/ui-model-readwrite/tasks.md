## 0. Backend Read Endpoints

- [x] 0.1 Create `src/api/routes/model-types.ts` with `modelTypesRouter` — add `GET /model-types` handler calling `listModelTypes`, return 200 JSON array
- [x] 0.2 Create `src/api/routes/node-kinds.ts` with `nodeKindsRouter` — add `GET /node-kinds` handler calling `listNodeKinds`, return 200 JSON array
- [x] 0.3 Import and mount `modelTypesRouter` and `nodeKindsRouter` at `/api` in `src/api/index.ts`

## 1. API Client Functions

- [x] 1.1 Add `fetchModelTypes()` to `client/src/api.ts` — GET /api/model-types, return `{ id, name }[]`
- [x] 1.2 Add `fetchNodeKinds()` to `client/src/api.ts` — GET /api/node-kinds, return `{ id, name }[]`
- [x] 1.3 Add `createModel(name, description, modelTypeId)` — POST /api/models, return created model
- [x] 1.4 Add `updateModel(id, patch)` — PUT /api/models/:id, return updated model
- [x] 1.5 Add `deleteModel(id)` — DELETE /api/models/:id
- [x] 1.6 Add `createNode(modelId, input)` — POST /api/models/:modelId/nodes, return created node
- [x] 1.7 Add `updateNode(id, patch)` — PUT /api/nodes/:id, return updated node
- [x] 1.8 Add `deleteNode(id)` — DELETE /api/nodes/:id

## 2. Error Toast Infrastructure

- [x] 2.1 Add `errorToast` ref in `App.vue` — display as dismissible banner above the map; auto-dismiss after 4 seconds; expose a `showError(message)` helper used by all write handlers

## 3. Model Form Component

- [x] 3.1 Create `client/src/components/ModelForm.vue` — modal with name (required) and description fields; emits `submit({ name, description, modelTypeId })` and `cancel`
- [x] 3.2 Add `modelTypeId` selector to `ModelForm.vue` — populated from a `modelTypes: { id, name }[]` prop

## 4. Node Form Component

- [x] 4.1 Create `client/src/components/NodeForm.vue` — modal accepting `mode` (`create` | `edit`), `level`, and initial values; fields: name (required), description, owner; emits `submit(patch)` and `cancel`
- [x] 4.2 Add `kindId` selector in `NodeForm.vue` for level 3–4 nodes — populated from a `nodeKinds: { id, name }[]` prop

## 5. Model CRUD in App.vue

- [x] 5.1 Fetch model types and node kinds at app startup in `App.vue`; store in refs; pass as props to forms
- [x] 5.2 Add "New Model" button to header — open `ModelForm` in create mode; on submit call `createModel`, refresh model list, auto-select new model
- [x] 5.3 Add edit action on `ModelSelector.vue` per model — open `ModelForm` in edit mode; on submit call `updateModel`, update local list
- [x] 5.4 Add delete action on `ModelSelector.vue` per model with confirmation — on confirm call `deleteModel`, remove from list, clear selection if deleted model was active

## 6. Node CRUD in Card Components

- [x] 6.1 Add hover-reveal edit (pencil) and delete (×) icon buttons to `DomainCard.vue`; emit `edit` and `delete` events
- [x] 6.2 Add hover-reveal edit and delete buttons to `GroupCard.vue`; emit events
- [x] 6.3 Add hover-reveal edit and delete buttons to `CapabilityCard.vue`; disable delete when capability has subCapabilities
- [x] 6.4 Handle edit/delete node events in `CapabilityMap.vue` or `App.vue` — open `NodeForm` on edit (call `updateNode` on submit); call `deleteNode` and remove from local tree on delete
- [x] 6.5 Add "Add child" (＋) button at each card level — open `NodeForm` in create mode with pre-set level and parentId; on submit call `createNode` and insert node into local tree

## 7. Verification

- [x] 7.1 Manually test create, edit, and delete a Model end-to-end
- [x] 7.2 Manually test adding Domain, Group, Capability, and Sub-capability nodes
- [x] 7.3 Manually test editing a node name and description
- [x] 7.4 Manually test that delete is disabled on non-leaf nodes and succeeds on leaf nodes
- [x] 7.5 Manually test error states: API failure shows toast and map is not corrupted
