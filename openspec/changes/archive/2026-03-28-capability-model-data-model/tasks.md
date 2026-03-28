## 1. Database Schema

- [x] 1.1 Create `model_types` table (id, name, description, created_at, updated_at)
- [x] 1.2 Create `node_kinds` table (id, name, description, schema jsonb, created_at, updated_at)
- [x] 1.3 Create `models` table (id, name, description, model_type_id FK, created_at, updated_at)
- [x] 1.4 Create `nodes` table (id, name, description, owner, level, parent_id FK self-ref, model_id FK, kind_id FK nullable, properties jsonb, created_at, updated_at)
- [x] 1.5 Create `node_relationships` table (id, from_node_id FK, to_node_id FK, relation_type string, properties jsonb, created_at, updated_at)
- [x] 1.6 Add DB check constraints: level 1 nodes must have null parent_id; level range 1–4
- [x] 1.7 Add indexes: nodes(model_id), nodes(parent_id), nodes(kind_id), node_relationships(from_node_id), node_relationships(to_node_id)

## 2. ModelType

- [x] 2.1 Implement create ModelType (unique name enforcement)
- [x] 2.2 Implement list all ModelTypes
- [x] 2.3 Implement get ModelType by ID
- [x] 2.4 Implement delete ModelType with referential integrity check (reject if Models reference it)

## 3. NodeKind

- [x] 3.1 Implement create NodeKind (unique name enforcement, schema field validation)
- [x] 3.2 Implement list all NodeKinds
- [x] 3.3 Implement get NodeKind by ID
- [x] 3.4 Implement update NodeKind schema with pre-flight validation (check all existing Nodes for violations before applying)
- [x] 3.5 Implement delete NodeKind with referential integrity check (reject if Nodes reference it)

## 4. Model (CapabilityModel)

- [x] 4.1 Implement create Model (requires valid ModelType reference)
- [x] 4.2 Implement list Models (with optional filter by ModelType)
- [x] 4.3 Implement get Model by ID
- [x] 4.4 Implement update Model (name, description)
- [x] 4.5 Implement delete Model with cascade to Nodes

## 5. Node

- [x] 5.1 Implement create Node with hierarchy validation (parent level = node level - 1)
- [x] 5.2 Implement kind constraint enforcement (required at L3–L4, forbidden at L1–L2)
- [x] 5.3 Implement properties validation against NodeKind schema at write time
- [x] 5.4 Implement get Node by ID
- [x] 5.5 Implement list Nodes by Model (flat list)
- [x] 5.6 Implement get subtree (node + all descendants) in hierarchical order
- [x] 5.7 Implement get ancestors (root path) for a given Node
- [x] 5.8 Implement update Node (name, description, owner, properties — re-validate schema on property change)
- [x] 5.9 Implement delete Node (reject if node has children)

## 6. NodeRelationship

- [x] 6.1 Implement create NodeRelationship (validate from/to node existence, reject self-referential)
- [x] 6.2 Implement list relationships by node (outbound and inbound, with optional relation_type filter)
- [x] 6.3 Implement get NodeRelationship by ID
- [x] 6.4 Implement delete NodeRelationship

## 7. Validation Layer

- [x] 7.1 Implement NodeKind schema validator (field types: string, number, boolean, enum, date; required; enum options)
- [x] 7.2 Write unit tests for schema validation (missing required, wrong type, invalid enum value)
- [x] 7.3 Write unit tests for hierarchy constraint enforcement (level/parent rules, kind constraints)
- [x] 7.4 Write integration tests covering full node tree creation across all 4 levels
