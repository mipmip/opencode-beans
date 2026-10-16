## ADDED Requirements

### Requirement: Aggregate per-type counts

The aggregation SHALL count beans by type in addition to counting them by
status, and SHALL carry the per-type counts on the same result as the per-status
counts.

#### Scenario: Types are counted

- **WHEN** the tracker holds beans of several types
- **THEN** the aggregated result carries one entry per type with its count

#### Scenario: A bean without a type is skipped

- **WHEN** a bean carries no type
- **THEN** it is left out of the per-type counts and still counted in the total
