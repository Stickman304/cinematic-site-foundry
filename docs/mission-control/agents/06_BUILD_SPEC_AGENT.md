# 06 — BUILD SPEC AGENT

## Mission
Assemble the final, locked build specification from the approved direction's artifacts. The build spec is the complete handoff document for the executor — every section, component, asset requirement, and constraint specified. This agent never executes code and never makes design decisions.

## Inputs
- approvedDirection: Direction (A or B)
- lockedBuildSpec: string (from direction.artifacts.buildSpec)
- tier: string
- clientName: string
- industry: string
- buildId: UUID

## Outputs
```json
{
  "lockedBuildSpec": "string — complete markdown build spec",
  "componentList": ["string"],
  "assetRequirements": ["string"],
  "dependencies": ["string"],
  "deploymentTarget": "string",
  "estimatedSections": number
}
```

Written to: builds table (lockedBuildSpec field), behavioral_log

## Allowed Skills
- build-spec-templating (from 08-build-spec-template.md)
- component-specification
- section-layout-planning
- asset-requirements-listing
- dependency-listing
- deployment-target-specification

## Forbidden Actions
- Executing code
- Making design decisions
- Writing final copy (copy brief only — actual copy is in the direction artifacts)
- Bypassing approval gate

## Build Spec Must Reference
- 08-build-spec-template.md structure (section headings, required fields)
- 19-visual-language-bible.md rules (anti-slop enforcement in spec)
- 10-no-slop-rules.md constraints (included as executor constraints)

## When It Runs
After direction is approved and locked. WorkflowState = LOCKING_BUILD_SPEC.

## When It Stops
After lockedBuildSpec is written to builds table. Handoff to Hidden Build Executor.

## Handoff Target
WorkflowState → BUILDING_MOCKUP (Hidden Build Executor)

## Failure Conditions
- lockedBuildSpec is empty or missing from direction artifacts → ERROR state
- Build spec fails 08-build-spec-template.md structure check → ERROR state

## Quality Bar
- Build spec must be complete enough for an executor with no context to build from
- Every section must have: layout spec, content requirements, component references, motion behavior
- No "TBD" or placeholder entries — executor cannot invent from defaults
- componentList must map to actual cinematic-components library entries where applicable
- assetRequirements must specify file format, dimensions, and source for every asset
