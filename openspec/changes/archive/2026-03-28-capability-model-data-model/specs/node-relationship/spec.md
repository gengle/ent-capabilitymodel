## ADDED Requirements

### Requirement: NodeRelationship represents a typed directed edge between two nodes
The system SHALL support creating NodeRelationship records that connect a `from_node` to a `to_node` with a `relation_type` string (e.g., "depends_on", "supports", "runs_on"). Nodes in different Models MAY be connected.

#### Scenario: Create a relationship between two nodes
- **WHEN** a user creates a NodeRelationship with valid from_node_id, to_node_id, and relation_type
- **THEN** the system SHALL persist the relationship and return its generated ID

#### Scenario: Create a cross-model relationship
- **WHEN** a user creates a NodeRelationship where from_node and to_node belong to different Models
- **THEN** the system SHALL persist the relationship successfully

#### Scenario: Reject self-referential relationship
- **WHEN** a user creates a NodeRelationship where from_node_id equals to_node_id
- **THEN** the system SHALL reject the request with a validation error

#### Scenario: Reject relationship with invalid node reference
- **WHEN** a user creates a NodeRelationship referencing a non-existent Node ID
- **THEN** the system SHALL reject the request with a referential integrity error

### Requirement: Relationships can carry optional metadata
The system SHALL allow a NodeRelationship to store optional structured metadata in a `properties` field.

#### Scenario: Create a relationship with properties
- **WHEN** a user creates a NodeRelationship with a properties object
- **THEN** the system SHALL persist the properties alongside the relationship

#### Scenario: Create a relationship without properties
- **WHEN** a user creates a NodeRelationship without providing properties
- **THEN** the system SHALL persist the relationship with an empty properties object

### Requirement: Relationships are queryable by node and type
The system SHALL support querying all relationships for a given node (as source or target) and optionally filtered by relation_type.

#### Scenario: Get all relationships from a node
- **WHEN** a user requests all outbound relationships from a Node
- **THEN** the system SHALL return all NodeRelationship records where from_node_id matches, including to_node and relation_type

#### Scenario: Get relationships by type
- **WHEN** a user requests relationships from a Node filtered by relation_type
- **THEN** the system SHALL return only relationships matching that relation_type
