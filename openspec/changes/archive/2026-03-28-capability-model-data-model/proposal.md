## Why

Enterprise capability models require a structured, flexible data model that supports hierarchical taxonomies, reusable kind-based schemas, and future cross-model relationships (e.g., CMDB-style CI dependencies). No such model currently exists — this change establishes the foundational data layer.

## What Changes

- Introduce `ModelType` as a catalog of model categories (CapabilityModel, ApplicationModel, CMDBModel, etc.)
- Introduce `Model` as the root container for a node tree, typed by `ModelType`
- Introduce `NodeKind` as a reusable taxonomy of node types, each with a JSON Schema defining custom properties
- Introduce `Node` as the unified entity for all levels of the hierarchy (Domain → Group → Capability → Sub-capability), referencing a `NodeKind` at levels 3–4
- Introduce `NodeRelationship` to represent typed edges between nodes across models, enabling future CMDB-style dependency tracking

## Capabilities

### New Capabilities

- `model-type`: Catalog of model type definitions that classify what a Model represents
- `node-kind`: Reusable taxonomy entries with JSON Schema-bound custom property definitions
- `capability-model`: Root container for a hierarchical node tree, typed by ModelType
- `node`: Unified hierarchical node with 4 fixed levels, kind-binding at levels 3–4, and schema-validated properties
- `node-relationship`: Typed directional edge between two nodes with optional metadata, designed for CI dependency mapping

### Modified Capabilities

<!-- None — this is a greenfield data model -->

## Impact

- New database schema (tables: `model_types`, `node_kinds`, `models`, `nodes`, `node_relationships`)
- New API surface for CRUD operations on all five entities
- `NodeKind.schema` drives runtime property validation on `Node.properties`
- `NodeRelationship` is intentionally minimal now; `RelationshipKind` schema binding is deferred to a future phase
