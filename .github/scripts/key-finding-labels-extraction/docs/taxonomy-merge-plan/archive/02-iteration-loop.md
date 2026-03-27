# Iteration Loop for Coding Agents

## Purpose
Provide a repeatable operating model so agents can implement one isolated objective at a time, validate it, and hand off cleanly.

## Single-Iteration Workflow
1. Pick one objective from `01-agent-workstreams.md`.
2. Write a short implementation brief:
   - scope in
   - scope out
   - touched files
   - acceptance checks
3. Implement only that objective.
4. Run required tests/checks for the touched area.
5. Produce a handoff note with:
   - what changed
   - what was validated
   - known risks
   - next recommended objective

## Definition of Done (per objective)
- Code changes are limited to stated scope.
- Tests for changed behavior are added or updated.
- Existing contract tests still pass.
- Output schema checks pass.
- No undocumented behavior changes.

## Required Validation Matrix
- Unit tests for each new/changed module.
- Integration test for full extraction flow.
- Snapshot/golden checks for legacy adapter outputs when touched.
- Determinism check for stable ordering and counts.

## Suggested Agent Prompt Template
Use this when assigning work to an agent:

```text
Objective: <workstream + subtask>
Goal: <single measurable outcome>
In scope: <files/modules>
Out of scope: <explicit exclusions>
Constraints:
- preserve output contract
- no unrelated refactors
- add/update tests for changed behavior
Acceptance criteria:
1) ...
2) ...
3) ...
Deliverables:
- code changes
- test results
- short risk note
```

## PR Structure Standard
- Title: `[taxonomy-merge][WSx] <short action>`
- Body sections:
  - Summary
  - Scope
  - Tests run
  - Contract impact
  - Follow-up tasks

## Sequencing Rules
- Complete WS1 baseline before any compatibility rewrite.
- Require green parity checks before removing legacy implementation logic.
- Introduce Phase 2 and 3 capabilities behind feature flags.
- Keep default execution path deterministic and non-LLM unless explicitly enabled.

## Risk Register (Track Every Iteration)
- Contract drift risk
- Classification regression risk
- Performance regression risk
- CI flakiness risk
- Prompt/model variability risk (Phase 3+)
