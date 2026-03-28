## Why

The capability map viewer is read-only — users can browse models but cannot create, rename, or remove models or nodes through the UI. All writes currently require direct API calls, making the tool inaccessible to non-technical users who need to maintain capability models day-to-day.

## What Changes

- Add **Create Model** button in the header — opens a form to name a new model and select its type
- Add **Edit / Delete** controls on each Model in the selector
- Add **Add Node** controls at each level of the capability map (Domain, Group, Capability, Sub-capability)
- Add **Edit** (rename/description) and **Delete** inline controls on each node card
- Optimistic UI: update the local tree immediately, roll back on API error

## Capabilities

### New Capabilities

- `capability-map-editor`: UI controls and forms for creating, updating, and deleting Models and Nodes through the capability map

### Modified Capabilities

- `capability-map-viewer`: Extended to render edit/delete affordances alongside existing read-only card layout

## Impact

- **client/src/api.ts**: New functions for `createModel`, `updateModel`, `deleteModel`, `createNode`, `updateNode`, `deleteNode`
- **client/src/App.vue**: Model CRUD controls in header; refresh model list after mutations
- **client/src/components/**: New `NodeForm.vue` and `ModelForm.vue` modal/form components; edit/delete actions wired into existing card components
- **No backend changes**: Consumes the write endpoints added in `api-model-readwrite`
- **No breaking changes**: Read-only path is unchanged; edit controls are additive
