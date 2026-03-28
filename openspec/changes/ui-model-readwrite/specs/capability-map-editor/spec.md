## ADDED Requirements

### Requirement: User can create a new Model
The system SHALL provide a "New Model" action in the header that opens a form allowing the user to enter a model name and select a model type. On submission the model SHALL be created via POST /api/models and appear in the model selector.

#### Scenario: Create model with valid input
- **WHEN** the user fills in a name and selects a model type and submits the form
- **THEN** the system SHALL call POST /api/models, close the form, refresh the model list, and auto-select the new model

#### Scenario: Create model with missing name
- **WHEN** the user submits the form without entering a name
- **THEN** the system SHALL display a validation error and SHALL NOT submit the request

#### Scenario: Create model API error
- **WHEN** the POST /api/models call returns an error
- **THEN** the system SHALL display an error message and leave the form open

### Requirement: User can edit an existing Model
The system SHALL allow the user to rename a model or update its description from the model selector. On submission the model SHALL be updated via PUT /api/models/:id.

#### Scenario: Edit model name
- **WHEN** the user edits the model name and saves
- **THEN** the system SHALL call PUT /api/models/:id and update the displayed model name in the selector

#### Scenario: Edit model API error
- **WHEN** the PUT /api/models/:id call returns an error
- **THEN** the system SHALL display an error message and retain the original model name in the UI

### Requirement: User can delete a Model
The system SHALL allow the user to delete a model via a delete action in the model selector. The system SHALL ask for confirmation before deleting.

#### Scenario: Confirm and delete model
- **WHEN** the user confirms deletion
- **THEN** the system SHALL call DELETE /api/models/:id, remove the model from the selector, and clear the capability map

#### Scenario: Cancel model deletion
- **WHEN** the user cancels the confirmation dialog
- **THEN** the system SHALL take no action

#### Scenario: Delete model API error
- **WHEN** the DELETE /api/models/:id call returns an error
- **THEN** the system SHALL display an error message and leave the model in the selector

### Requirement: User can add a Node at any level
The system SHALL provide an "Add" control at each level of the capability map (Domain, Group, Capability, Sub-capability). Activating the control SHALL open a form pre-filled with the appropriate level and parent context.

#### Scenario: Add a Domain node
- **WHEN** the user activates the "Add Domain" control and submits a valid name
- **THEN** the system SHALL call POST /api/models/:modelId/nodes with level 1, add the new domain to the map, and display it immediately

#### Scenario: Add a child node
- **WHEN** the user activates the "Add" control on an existing node and submits a valid form
- **THEN** the system SHALL call POST /api/models/:modelId/nodes with the correct level and parentId, and display the new node within its parent

#### Scenario: Add node with missing required field
- **WHEN** the user submits the add-node form without a required field (e.g., name)
- **THEN** the system SHALL display a validation error and SHALL NOT submit the request

#### Scenario: Add node API error
- **WHEN** the POST /api/models/:modelId/nodes call returns an error
- **THEN** the system SHALL display the API error message and leave the form open

### Requirement: User can edit a Node
The system SHALL provide an edit affordance (visible on hover) on each node card that opens a form to update the node's name, description, owner, or properties.

#### Scenario: Edit node name
- **WHEN** the user edits a node name and saves
- **THEN** the system SHALL call PUT /api/nodes/:id and update the node name in the capability map immediately

#### Scenario: Edit node API error
- **WHEN** the PUT /api/nodes/:id call returns an error
- **THEN** the system SHALL display an error message and revert the local node state to its prior values

### Requirement: User can delete a leaf Node
The system SHALL provide a delete affordance on each node card. The system SHALL disable the delete affordance for non-leaf nodes (nodes with children) and SHALL confirm before deleting.

#### Scenario: Delete leaf node
- **WHEN** the user confirms deletion of a node with no children
- **THEN** the system SHALL call DELETE /api/nodes/:id and remove the node from the capability map

#### Scenario: Delete affordance disabled for non-leaf
- **WHEN** a node has one or more children
- **THEN** the delete affordance SHALL be visually disabled and unclickable

#### Scenario: Delete node API error
- **WHEN** the DELETE /api/nodes/:id call returns an error
- **THEN** the system SHALL display an error message and leave the node in the map
