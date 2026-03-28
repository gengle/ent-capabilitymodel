## ADDED Requirements

### Requirement: Write endpoints return consistent error shape
The system SHALL return all error responses from write endpoints as JSON with the same `{ error: string }` shape used by existing read endpoints, with HTTP 400 for validation/constraint errors and HTTP 404 for not-found errors.

#### Scenario: Validation error on write
- **WHEN** a write request fails due to invalid input (missing field, hierarchy violation, kind constraint, property validation)
- **THEN** the server SHALL respond with HTTP 400 and `{ "error": "<descriptive message>" }`

#### Scenario: Not-found error on write
- **WHEN** a write request targets a resource ID that does not exist
- **THEN** the server SHALL respond with HTTP 404 and `{ "error": "<resource> '<id>' not found" }`