## ADDED Requirements

### Requirement: POST /api/models creates a new Model
The system SHALL expose a POST endpoint at `/api/models` that accepts a JSON body with `name`, `description` (optional), and `modelTypeId`, creates a Model, and returns the created record.

#### Scenario: Successful model creation
- **WHEN** a client sends POST /api/models with a valid `name` and a valid `modelTypeId`
- **THEN** the server SHALL respond with HTTP 201 and the created Model object including its generated `id`

#### Scenario: Missing required field
- **WHEN** a client sends POST /api/models without `name` or without `modelTypeId`
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "<field> is required" }`

#### Scenario: Unknown modelTypeId
- **WHEN** a client sends POST /api/models with a `modelTypeId` that does not exist
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "ModelType '<id>' not found" }`

### Requirement: PUT /api/models/:id updates an existing Model
The system SHALL expose a PUT endpoint at `/api/models/:id` that accepts a JSON body with optional `name` and `description` fields and updates the Model.

#### Scenario: Successful model update
- **WHEN** a client sends PUT /api/models/:id with a valid `name`
- **THEN** the server SHALL respond with HTTP 200 and the updated Model object

#### Scenario: Model not found
- **WHEN** a client sends PUT /api/models/:id for a non-existent model ID
- **THEN** the server SHALL respond with HTTP 404 and `{ "error": "Model '<id>' not found" }`

### Requirement: DELETE /api/models/:id deletes a Model and its nodes
The system SHALL expose a DELETE endpoint at `/api/models/:id` that deletes the Model and cascades deletion to all its Nodes.

#### Scenario: Successful model deletion
- **WHEN** a client sends DELETE /api/models/:id for an existing Model
- **THEN** the server SHALL respond with HTTP 204 and an empty body

#### Scenario: Model not found
- **WHEN** a client sends DELETE /api/models/:id for a non-existent model ID
- **THEN** the server SHALL respond with HTTP 404 and `{ "error": "Model '<id>' not found" }`
