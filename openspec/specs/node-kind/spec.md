## Requirements

### Requirement: NodeKind defines a reusable typed taxonomy entry
The system SHALL maintain a catalog of NodeKind records, each with a name, description, and a schema that defines custom property fields. NodeKind records are shared across all Models.

#### Scenario: Create a node kind with a schema
- **WHEN** a user creates a NodeKind with a name and a valid schema (fields array)
- **THEN** the system SHALL persist the NodeKind and return its generated ID

#### Scenario: Schema defines typed fields
- **WHEN** a NodeKind schema is created with fields of type string, number, boolean, enum, or date
- **THEN** the system SHALL store and return the full field definitions including required flag, options (for enum), and default value

#### Scenario: Prevent duplicate node kind names
- **WHEN** a user creates a NodeKind with a name that already exists
- **THEN** the system SHALL reject the request with a conflict error

### Requirement: NodeKind schema changes are validated against existing nodes
The system SHALL validate that any update to a NodeKind schema does not invalidate existing Node properties records before applying the change.

#### Scenario: Schema update with no existing violations
- **WHEN** a user updates a NodeKind schema and no existing Node properties violate the new schema
- **THEN** the system SHALL apply the schema update successfully

#### Scenario: Schema update with existing violations
- **WHEN** a user updates a NodeKind schema and one or more existing Node properties would violate the new schema
- **THEN** the system SHALL reject the schema update and return a list of violating node IDs

### Requirement: NodeKind cannot be deleted while in use
The system SHALL prevent deletion of a NodeKind that is referenced by any Node.

#### Scenario: Delete a node kind in use
- **WHEN** a user attempts to delete a NodeKind referenced by one or more Nodes
- **THEN** the system SHALL reject the deletion with a referential integrity error

#### Scenario: Delete an unused node kind
- **WHEN** a user deletes a NodeKind that is not referenced by any Node
- **THEN** the system SHALL remove the NodeKind successfully
