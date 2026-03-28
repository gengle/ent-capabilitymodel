## Context

This change establishes the foundational data model for an Enterprise Capability Model platform. There is no existing implementation — this is a greenfield design. The model must support:

- A 4-level fixed hierarchy (Domain > Group > Capability > Sub-capability)
- A reusable taxonomy of node kinds with schema-bound custom properties
- Multiple independent capability models sharing the same kind catalog
- A relationship layer designed to support future CMDB-style CI dependency tracking

## Goals / Non-Goals

**Goals:**
- Define a unified `Node` table that represents all 4 hierarchy levels
- Define `NodeKind` as a reusable, schema-bearing taxonomy decoupled from the node tree
- Define `Model` and `ModelType` as the root container layer
- Define `NodeRelationship` as a simple directed edge between nodes with a typed relation
- Enforce level-parent integrity (L2 parent must be L1, etc.) and kind constraints (kind required at L3–L4, null at L1–L2)
- Validate `Node.properties` against the linked `NodeKind.schema` at write time

**Non-Goals:**
- `RelationshipKind` schema binding and valid from/to node type constraints (deferred)
- UI or API layer design (out of scope for this change)
- Multi-tenancy or access control (future concern)
- Importing or migrating existing capability data

## Decisions

### D1: Unified `Node` table over separate tables per level

**Decision:** Single `nodes` table with a `level` column (1–4) and self-referential `parent_id`.

**Rationale:** Separate tables per level (Domain, Group, Capability, SubCapability) would require level-specific foreign keys, making cross-level queries and tree traversal significantly more complex. A unified table supports arbitrary queries (e.g., "all nodes owned by X", "all descendants of node Y") without joins across tables.

**Alternative considered:** Separate tables per level — rejected due to query complexity and the overhead of maintaining parallel schemas with mostly identical fields.

### D2: `NodeKind` as a shared taxonomy, decoupled from `Model`

**Decision:** `NodeKind` is a standalone catalog, not scoped to a specific `Model` or `ModelType`. Any node in any model can reference any kind.

**Rationale:** Kind definitions represent reusable semantic types (e.g., "BusinessCapability", "TechCapability"). Coupling them to a model would prevent reuse and force duplication. Decoupling allows a single kind to be adopted across multiple models consistently.

**Alternative considered:** Kind scoped per ModelType — rejected as it would fragment the taxonomy and require cross-model kind synchronization.

### D3: Kind applies at levels 3–4 only

**Decision:** `kind_id` is nullable. For L1 (Domain) and L2 (Group), `kind_id` must be null. For L3 (Capability) and L4 (Sub-capability), `kind_id` is required.

**Rationale:** Levels 1–2 are structural containers — they organize the tree but don't carry capability semantics. Applying kinds at these levels would add noise without value. The meaningful classification starts at L3 where actual capabilities are defined.

**Alternative considered:** Kind allowed at any level — rejected as it complicates validation and dilutes the semantic meaning of kinds.

### D4: `NodeRelationship` kept simple (untyped schema)

**Decision:** `NodeRelationship` stores `relation_type` as a plain string with optional `properties` jsonb. No `RelationshipKind` schema or valid from/to constraints enforced yet.

**Rationale:** CMDB-style relationship modeling is a future capability. Introducing `RelationshipKind` now would add complexity before the use cases are well understood. A string `relation_type` is sufficient to record and query relationships in the near term.

**Future path:** When CMDB use cases mature, add a `relationship_kinds` table and a foreign key from `node_relationships.relation_type_id`.

### D5: JSON Schema stored in `NodeKind.schema` (jsonb)

**Decision:** The field definition schema for a kind is stored as a jsonb document in `node_kinds.schema`, following a lightweight field descriptor format (not full JSON Schema spec).

**Schema shape:**
```json
{
  "fields": [
    { "name": "maturity", "type": "enum", "required": true,
      "options": ["Initial", "Developing", "Defined", "Managed", "Optimizing"] },
    { "name": "owner_team", "type": "string", "required": true },
    { "name": "platform", "type": "string", "required": false }
  ]
}
```

**Supported field types:** `string`, `number`, `boolean`, `enum`, `date`

**Rationale:** Full JSON Schema (draft-07+) is more powerful but significantly more complex to implement and validate. A lightweight descriptor covers the primary use cases (required fields, enums, types) without the overhead.

## Risks / Trade-offs

- **Property validation at the application layer** → Mitigation: Validate `Node.properties` against `NodeKind.schema` in the service layer on write. DB stores raw jsonb; application enforces schema.
- **NodeKind schema changes break existing nodes** → Mitigation: Treat kind schema changes as migrations — validate all existing nodes before allowing a schema update; surface violations to the user.
- **Level-parent integrity enforced in application, not DB** → Mitigation: Add check constraints at the DB layer (e.g., `level = 1 AND parent_id IS NULL`) where the DB supports it; back with service-layer validation.
- **Unlimited node depth in `parent_id` chain** → Mitigation: Enforce max depth (4) at write time in the service layer. The DB does not natively cap recursive depth.

## Open Questions

- What is the target persistence layer (PostgreSQL, SQLite, other)? This affects jsonb support and check constraint syntax.
- Should `NodeKind.schema` evolve toward full JSON Schema (`$schema`, `$ref`, etc.) in future? Worth deciding early to avoid a breaking migration later.
