# REST API Specification

### Requirement: GET /api/models returns all models
The system SHALL expose a GET endpoint at `/api/models` that returns a list of all Models with their id, name, description, and modelType name.

#### Scenario: List models with data
- **WHEN** a client sends GET /api/models
- **THEN** the server SHALL respond with HTTP 200 and a JSON array of model summaries

#### Scenario: List models when none exist
- **WHEN** no Models have been created
- **THEN** the server SHALL respond with HTTP 200 and an empty JSON array

### Requirement: GET /api/models/:id/tree returns the full node hierarchy
The system SHALL expose a GET endpoint at `/api/models/:id/tree` that returns the complete node tree for a Model, structured as nested domains → groups → capabilities → sub-capabilities.

#### Scenario: Valid model with nodes
- **WHEN** a client sends GET /api/models/:id/tree for an existing Model
- **THEN** the server SHALL respond with HTTP 200 and a JSON object containing the model metadata and a `domains` array, each domain containing `groups`, each group containing `capabilities`, each capability containing `subCapabilities` and `properties`

#### Scenario: Model not found
- **WHEN** a client sends GET /api/models/:id/tree for a non-existent model ID
- **THEN** the server SHALL respond with HTTP 404 and a JSON error message

#### Scenario: Model with no nodes
- **WHEN** a Model exists but has no Nodes
- **THEN** the server SHALL respond with HTTP 200 and a `domains` array that is empty

### Requirement: API returns JSON with consistent error shape
The system SHALL return all error responses as JSON with a consistent `{ error: string }` shape and an appropriate HTTP status code.

#### Scenario: Unexpected server error
- **WHEN** an unhandled error occurs during request processing
- **THEN** the server SHALL respond with HTTP 500 and `{ "error": "Internal server error" }`
