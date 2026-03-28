## Requirements

### Requirement: Node represents a single entry in a 4-level hierarchy
The system SHALL support creating Node records with a level (1–4), a reference to a parent Node (null for level 1), and a reference to a Model. A Node at level 1 is a Domain, level 2 is a Group, level 3 is a Capability, and level 4 is a Sub-capability.

#### Scenario: Create a root node (level 1)
- **WHEN** a user creates a Node with level 1 and no parent_id
- **THEN** the system SHALL persist the Node as a root node within the specified Model

#### Scenario: Create a child node
- **WHEN** a user creates a Node with level N and a parent_id pointing to a Node of level N-1 in the same Model
- **THEN** the system SHALL persist the Node as a child of the specified parent

#### Scenario: Reject invalid parent level
- **WHEN** a user creates a Node with a parent_id that points to a Node whose level is not exactly one less than the new node's level
- **THEN** the system SHALL reject the request with a hierarchy violation error

#### Scenario: Reject root node with parent
- **WHEN** a user creates a Node with level 1 and a non-null parent_id
- **THEN** the system SHALL reject the request with a validation error

#### Scenario: Reject max depth exceeded
- **WHEN** a user creates a Node with level greater than 4
- **THEN** the system SHALL reject the request with a validation error

### Requirement: Kind is required at levels 3–4 and forbidden at levels 1–2
The system SHALL enforce that Nodes at levels 3 and 4 MUST have a kind_id, and Nodes at levels 1 and 2 MUST NOT have a kind_id.

#### Scenario: Level 3 node requires kind
- **WHEN** a user creates a level 3 Node without a kind_id
- **THEN** the system SHALL reject the request with a validation error

#### Scenario: Level 1 node rejects kind
- **WHEN** a user creates a level 1 Node with a kind_id
- **THEN** the system SHALL reject the request with a validation error

#### Scenario: Level 3 node with valid kind
- **WHEN** a user creates a level 3 Node with a valid kind_id
- **THEN** the system SHALL persist the Node successfully

### Requirement: Node properties are validated against NodeKind schema
The system SHALL validate the `properties` object of a Node against the schema defined in the referenced NodeKind at write time.

#### Scenario: Properties satisfy schema
- **WHEN** a user creates or updates a Node whose properties satisfy all required fields and type constraints of the referenced NodeKind schema
- **THEN** the system SHALL persist the Node successfully

#### Scenario: Properties violate schema (missing required field)
- **WHEN** a user creates or updates a Node whose properties are missing a field marked as required in the NodeKind schema
- **THEN** the system SHALL reject the write with a schema validation error identifying the missing field

#### Scenario: Properties violate schema (wrong type)
- **WHEN** a user provides a property value of the wrong type (e.g., string where number expected)
- **THEN** the system SHALL reject the write with a schema validation error

#### Scenario: Properties violate schema (invalid enum value)
- **WHEN** a user provides an enum field value not in the allowed options list
- **THEN** the system SHALL reject the write with a schema validation error

### Requirement: Tree traversal queries are supported
The system SHALL support retrieving a Node with all its descendants, and retrieving the ancestors (path to root) of a Node.

#### Scenario: Get descendants of a node
- **WHEN** a user requests the subtree rooted at a given Node
- **THEN** the system SHALL return the Node and all descendant Nodes in hierarchical order

#### Scenario: Get ancestors of a node
- **WHEN** a user requests the ancestor path of a given Node
- **THEN** the system SHALL return the ordered list of ancestor Nodes from root to the immediate parent
