## Purpose

Keeps the plugin dependable while it runs and approachable while it is built on:
every tracker read is bounded and cancellable, the install, development and test
flow is documented, the packaged output is documented, and deferred work is
recorded in the tracker instead of being lost.

## ADDED Requirements

### Requirement: Bounded tracker reads

Every `beans` invocation the plugin makes MUST be bounded by a timeout so a slow
or wedged process cannot leave a read hanging. When the timeout fires, the read
MUST be treated as unavailable rather than thrown as an unhandled rejection.

#### Scenario: A slow beans process times out

- **WHEN** `beans list --json` does not finish within the configured timeout
- **THEN** the read fails as unavailable
- **AND** no unhandled rejection escapes the plugin

#### Scenario: The timeout is configurable

- **WHEN** a caller supplies a timeout for a read
- **THEN** that timeout is used instead of the default

### Requirement: Cancel superseded and unloaded reads

Tracker reads MUST accept an `AbortSignal`. A new refresh MUST cancel the read
that is still in flight, and disposing the plugin MUST cancel the read that is
still in flight. A read that was cancelled MUST NOT update the stats or the
error state.

#### Scenario: A new refresh cancels the previous read

- **WHEN** a second refresh starts before the first read has finished
- **THEN** the first read is aborted
- **AND** only the second read may set the stats

#### Scenario: Disposing the plugin cancels the in-flight read

- **WHEN** the plugin is disposed while a read is in flight
- **THEN** that read is aborted
- **AND** it does not touch the stats or the error state afterwards

### Requirement: Documented usage

`README.md` MUST document how to install the plugin, how to develop it, and how
to run every test suite. The documented commands MUST match the scripts the
repository actually exposes.

#### Scenario: The documented commands exist

- **WHEN** the README documents a development or test command
- **THEN** the matching script exists in `package.json` or in the nix flake

#### Scenario: The nix build output is documented

- **WHEN** a reader wants the assembled plugin
- **THEN** the README states the `nix build` command and the path of the
  resulting plugin files

### Requirement: Deferred work is recorded

Work that is deliberately left out of the PoC MUST be recorded as a bean so it
survives beyond the session that discovered it. Each follow-up bean MUST state
what is deferred and why.

#### Scenario: Deferred features become beans

- **WHEN** the PoC ships without an optional feature
- **THEN** a bean exists that describes the deferred feature
- **AND** the bean records why it was deferred
