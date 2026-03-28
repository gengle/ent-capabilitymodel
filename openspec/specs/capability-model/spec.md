## Requirements

### Requirement: Model is a named root container for a node tree
The system SHALL support creating Model instances that serve as root containers for a node hierarchy. Each Model SHALL be typed by a ModelType and contain a name and description.

#### Scenario: Create a model
- **WHEN** a user creates a Model with a name, description, and a valid ModelType reference
- **THEN** the system SHALL persist the Model and return its generated ID

#### Scenario: Retrieve a model with its metadata
- **WHEN** a user requests a Model by ID
- **THEN** the system SHALL return the Model including its id, name, description, model_type, created_at, and updated_at

#### Scenario: List all models
- **WHEN** a user requests all Models
- **THEN** the system SHALL return all Models with their id, name, and model_type

#### Scenario: Filter models by type
- **WHEN** a user requests Models filtered by a specific ModelType
- **THEN** the system SHALL return only Models of that type

### Requirement: Model deletion cascades to its nodes
The system SHALL cascade deletion of a Model to all Nodes belonging to that Model.

#### Scenario: Delete a model and its nodes
- **WHEN** a user deletes a Model
- **THEN** the system SHALL remove the Model and all Nodes whose model_id references it
