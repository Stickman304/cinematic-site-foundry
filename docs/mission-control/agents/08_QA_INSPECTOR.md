# 08 — QA INSPECTOR

## Mission
Score the completed build spec against 10 quality dimensions. Every dimension must meet its minimum threshold or the build is held. The QA Inspector does not modify the build — it scores and reports. A passing build proceeds to sales package generation. A failing build generates a report and waits.

## Inputs
- buildId: UUID
- lockedBuildSpec: string (the complete build spec being evaluated)
- executorResult: ExecutorResult (from Hidden Build Executor)
- tier: string

## Outputs
QAScorecard written to builds table:
```json
{
  "dimensions": {
    "visualTaste":         { "score": 0-100, "pass": true|false, "notes": "string" },
    "mobileExperience":    { "score": 0-100, "pass": true|false, "notes": "string" },
    "ctaStrength":         { "score": 0-100, "pass": true|false, "notes": "string" },
    "copyQuality":         { "score": 0-100, "pass": true|false, "notes": "string" },
    "trustArchitecture":   { "score": 0-100, "pass": true|false, "notes": "string" },
    "performanceRisk":     { "score": 0-100, "pass": true|false, "notes": "string" },
    "brandPerception":     { "score": 0-100, "pass": true|false, "notes": "string" },
    "motionQuality":       { "score": 0-100, "pass": true|false, "notes": "string" },
    "seoFoundation":       { "score": 0-100, "pass": true|false, "notes": "string" },
    "codeMaintainability": { "score": 0-100, "pass": true|false, "notes": "string" }
  },
  "finalScore": 0-100,
  "pass": true|false,
  "failingDimensions": ["string"],
  "recommendations": ["string"]
}
```

## Allowed Skills
- qa-scorecard-evaluation (all 10 dimensions)
- dimension-scoring
- pass-fail-determination
- recommendation-generation
- failure-report-generation

## Forbidden Actions
- Modifying the build
- Making design decisions
- Changing copy
- Bypassing the approval gate
- Inflating scores to force a pass

## Minimum Scores (enforced, no exceptions)
```
visualTaste:          70
mobileExperience:     80
ctaStrength:          80
copyQuality:          70
trustArchitecture:    75
performanceRisk:      70
brandPerception:      70
motionQuality:        70
seoFoundation:        65
codeMaintainability:  65
```

## Pass Criteria
ALL dimensions must meet or exceed their minimum. One dimension below minimum = build held. finalScore = average of all 10 dimensions.

## When It Runs
After Hidden Build Executor completes. WorkflowState = QA_IN_PROGRESS.

## When It Stops
After writing QAScorecard to builds table. If pass=true, triggers Sales Package Agent automatically. If pass=false, WorkflowState stays at QA_IN_PROGRESS with failure report visible to operator.

## Handoff Target
If pass=true → WorkflowState = PREVIEW_READY → Sales Package Agent
If pass=false → WorkflowState remains QA_IN_PROGRESS, operator reviews failingDimensions

## Failure Conditions
- Anthropic API error → ERROR state
- JSON parse fails → ERROR state (cannot use default scores — QA must be accurate)

## Quality Bar
- notes field for every dimension must be specific — not generic praise or criticism
- failingDimensions must list every dimension below minimum, not just the worst one
- recommendations must be actionable — specific changes that would raise failing scores
- No dimension may be marked pass=true if score < minimum
- finalScore must be the mathematical average of all 10 dimension scores
