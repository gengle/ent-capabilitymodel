## 1. Backend Setup

- [x] 1.1 Install Express and @types/express as dependencies
- [x] 1.2 Install concurrently as dev dependency (parallel dev processes)
- [x] 1.3 Create `src/api/index.ts` — Express app entry point with JSON middleware and error handler
- [x] 1.4 Add `npm run dev:api` script to package.json (tsx src/api/index.ts)
- [x] 1.5 Add `npm run dev` script to package.json (concurrently: api + vite)

## 2. REST API — Models List

- [x] 2.1 Create `src/api/routes/models.ts` — register GET /api/models route
- [x] 2.2 Implement GET /api/models handler: call listModels(), return id/name/description/modelType
- [x] 2.3 Mount models router in src/api/index.ts under /api

## 3. REST API — Model Tree

- [x] 3.1 Implement tree-assembly helper: takes flat node list from getSubtree(), builds nested domains → groups → capabilities → subCapabilities structure
- [x] 3.2 Implement GET /api/models/:id/tree handler: fetch model, fetch subtree of all L1 roots, assemble and return nested tree
- [x] 3.3 Return 404 with `{ error }` JSON if model not found
- [x] 3.4 Add global error handler middleware returning 500 `{ error: "Internal server error" }`

## 4. Vue Frontend Setup

- [x] 4.1 Scaffold Vue 3 app with Vite in `client/` directory (`npm create vue@latest client -- --ts --no-router --no-pinia --no-eslint`)
- [x] 4.2 Configure Vite proxy in `client/vite.config.ts`: proxy /api/* to Express server port
- [x] 4.3 Add `npm run dev:client` script to root package.json (vite --config client/vite.config.ts)
- [x] 4.4 Clean up default Vue scaffold (remove HelloWorld, default styles)

## 5. Vue Components

- [x] 5.1 Create `client/src/api.ts` — typed fetch helpers for GET /api/models and GET /api/models/:id/tree
- [x] 5.2 Create `ModelSelector.vue` — dropdown populated from /api/models; emits selected model id
- [x] 5.3 Create `CapabilityCard.vue` — displays a Level 3 node: name, kind, properties, sub-capabilities list
- [x] 5.4 Create `GroupCard.vue` — displays a Level 2 node: name, list of CapabilityCards
- [x] 5.5 Create `DomainCard.vue` — displays a Level 1 node: name, grid of GroupCards
- [x] 5.6 Create `CapabilityMap.vue` — top-level grid of DomainCards; accepts tree prop
- [x] 5.7 Update `App.vue` — compose ModelSelector + CapabilityMap; handle loading and error states

## 6. Styling

- [x] 6.1 Add base CSS: card borders, padding, background colours for each level (Domain/Group/Capability)
- [x] 6.2 CSS Grid layout for Domain cards row in CapabilityMap
- [x] 6.3 Style Capability card properties section (label/value pairs)
- [x] 6.4 Add loading spinner and error message styles

## 7. Verification

- [x] 7.1 Seed test data: create a ModelType, NodeKind, Model, and a 3-domain tree with at least 2 groups and 3 capabilities each
- [x] 7.2 Run `npm run dev` and verify the card grid renders correctly in the browser
- [x] 7.3 Verify model selector switches between models
- [x] 7.4 Verify Capability cards show kind name and properties
- [ ] 7.5 Verify 404 is returned for unknown model id
