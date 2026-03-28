## ADDED Requirements

### Requirement: POST /api/models/:modelId/nodes creates a Node
The system SHALL expose a POST endpoint at `/api/models/:modelId/nodes` that accepts a JSON body with `name`, `level`, `kindId` (required for levels 3–4), `parentId` (required for levels 2–4), optional `description`, `owner`, and `properties`, and creates a Node in the specified Model.

#### Scenario: Successful node creation
- **WHEN** a client sends POST /api/models/:modelId/nodes with valid fields matching the node hierarchy rules
- **THEN** the server SHALL respond with HTTP 201 and the created Node object including its generated `id`

#### Scenario: Missing required field
- **WHEN** a client sends POST /api/models/:modelId/nodes without `name` or `level`
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "<field> is required" }`

#### Scenario: Hierarchy violation
- **WHEN** a client sends POST with a `parentId` whose level is not exactly one less than the new node's `level`
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "Parent node is level <n> but expected level <n-1>..." }`

#### Scenario: Kind constraint violation
- **WHEN** a client sends POST with a level 3 or 4 node that omits `kindId`, or a level 1 or 2 node that includes `kindId`
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "..." }`

#### Scenario: Property validation failure
- **WHEN** a client sends POST with `properties` that do not satisfy the NodeKind's schema
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "Property validation failed: ..." }`

### Requirement: PUT /api/nodes/:id updates an existing Node
The system SHALL expose a PUT endpoint at `/api/nodes/:id` that accepts a JSON body with optional `name`, `description`, `owner`, and `properties` fields and updates the Node.

#### Scenario: Successful node update
- **WHEN** a client sends PUT /api/nodes/:id with valid fields
- **THEN** the server SHALL respond with HTTP 200 and the updated Node object

#### Scenario: Node not found
- **WHEN** a client sends PUT /api/nodes/:id for a non-existent node ID
- **THEN** the server SHALL respond with HTTP 404 and `{ "error": "Node '<id>' not found" }`

#### Scenario: Property validation failure on update
- **WHEN** a client sends PUT /api/nodes/:id with `properties` that violate the NodeKind's schema
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "Property validation failed: ..." }`

### Requirement: DELETE /api/nodes/:id deletes a leaf Node
The system SHALL expose a DELETE endpoint at `/api/nodes/:id` that deletes the Node. If the Node has children, the request SHALL be rejected.

#### Scenario: Successful node deletion
- **WHEN** a client sends DELETE /api/nodes/:id for an existing Node with no children
- **THEN** the server SHALL respond with HTTP 204 and an empty body

#### Scenario: Node not found
- **WHEN** a client sends DELETE /api/nodes/:id for a non-existent node ID
- **THEN** the server SHALL respond with HTTP 404 and `{ "error": "Node '<id>' not found" }`

#### Scenario: Node has children
- **WHEN** a client sends DELETE /api/nodes/:id for a Node that has one or more child Nodes
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "Cannot delete Node '<id>': it has <n> child node(s)" }`