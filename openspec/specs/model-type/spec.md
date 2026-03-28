## Requirements

### Requirement: ModelType defines a category of model
The system SHALL maintain a catalog of ModelType records that classify what kind of model a `Model` instance represents (e.g., CapabilityModel, ApplicationModel, CMDBModel).

#### Scenario: Create a model type
- **WHEN** a user creates a ModelType with a unique name and description
- **THEN** the system SHALL persist the ModelType and return its generated ID

#### Scenario: Retrieve all model types
- **WHEN** a user requests the list of all ModelTypes
- **THEN** the system SHALL return all ModelType records with id, name, and description

#### Scenario: Prevent duplicate model type names
- **WHEN** a user creates a ModelType with a name that already exists
- **THEN** the system SHALL reject the request with a conflict error

#### Scenario: Delete a model type in use
- **WHEN** a user attempts to delete a ModelType that is referenced by one or more Models
- **THEN** the system SHALL reject the deletion with a referential integrity error
