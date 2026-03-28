## MODIFIED Requirements

### Requirement: Capability map renders as a card grid
The system SHALL render the selected model as a horizontal grid of Domain cards. Each Domain card SHALL contain its Group cards. Each Group card SHALL list its Capability cards. Each card SHALL display edit and delete affordances (visible on hover) when the capability-map-editor feature is present.

#### Scenario: Full 4-level model displayed
- **WHEN** a model with Domains, Groups, Capabilities, and Sub-capabilities is selected
- **THEN** the UI SHALL render one Domain card per Level 1 node, each containing Group sections, each Group section containing Capability entries

#### Scenario: Capability card shows kind and properties
- **WHEN** a Capability node has a NodeKind with custom properties
- **THEN** the Capability card SHALL display the kind name and all non-empty property values

#### Scenario: Sub-capabilities displayed within a Capability
- **WHEN** a Capability node has Level 4 Sub-capability children
- **THEN** the Sub-capabilities SHALL be listed within or below the parent Capability card

#### Scenario: Edit and delete affordances visible on hover
- **WHEN** the user hovers over any node card
- **THEN** the card SHALL reveal edit (pencil) and delete (×) icon buttons
