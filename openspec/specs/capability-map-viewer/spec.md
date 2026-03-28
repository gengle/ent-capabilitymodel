# Capability Map Viewer Specification

### Requirement: Model selector allows the user to choose which model to view
The system SHALL display a dropdown selector populated with all available Models. Selecting a model SHALL load and display that model's capability map.

#### Scenario: Models available
- **WHEN** the page loads
- **THEN** the selector SHALL be populated with all model names from GET /api/models

#### Scenario: User selects a model
- **WHEN** the user selects a model from the dropdown
- **THEN** the capability map SHALL load and display that model's full node tree

#### Scenario: No models exist
- **WHEN** GET /api/models returns an empty array
- **THEN** the UI SHALL display a message indicating no models are available

### Requirement: Capability map renders as a card grid
The system SHALL render the selected model as a horizontal grid of Domain cards. Each Domain card SHALL contain its Group cards. Each Group card SHALL list its Capability cards.

#### Scenario: Full 4-level model displayed
- **WHEN** a model with Domains, Groups, Capabilities, and Sub-capabilities is selected
- **THEN** the UI SHALL render one Domain card per Level 1 node, each containing Group sections, each Group section containing Capability entries

#### Scenario: Capability card shows kind and properties
- **WHEN** a Capability node has a NodeKind with custom properties
- **THEN** the Capability card SHALL display the kind name and all non-empty property values

#### Scenario: Sub-capabilities displayed within a Capability
- **WHEN** a Capability node has Level 4 Sub-capability children
- **THEN** the Sub-capabilities SHALL be listed within or below the parent Capability card

### Requirement: Loading and error states are communicated to the user
The system SHALL display a loading indicator while fetching data and an error message if the request fails.

#### Scenario: Data loading
- **WHEN** the frontend is waiting for the API response
- **THEN** a loading indicator SHALL be visible

#### Scenario: API error
- **WHEN** the API returns an error or the network request fails
- **THEN** the UI SHALL display a human-readable error message
