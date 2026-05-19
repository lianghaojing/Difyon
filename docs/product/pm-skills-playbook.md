# PM Skills Playbook for Difyon

This project can use the PM Skills Marketplace as a product operating layer. The skills should produce project documents, decisions, and implementation checkpoints. They should not be added to the Next.js runtime or bundled into the app.

## Purpose

Difyon currently has a strong authentication foundation and an account center plan. PM skills should help turn that work into clear product artifacts:

- PRDs for major features.
- Outcome roadmaps instead of only feature lists.
- Metrics dashboards for activation, security, and account management.
- Discovery notes for risky assumptions.
- Release checklists for production readiness.

## Where Outputs Live

| Output | Location | Source skill |
| --- | --- | --- |
| PRDs | `docs/product/*-prd.md` | `create-prd` |
| Outcome roadmaps | `docs/product/*-roadmap.md` | `outcome-roadmap` |
| Metrics plans | `docs/product/*-metrics.md` | `metrics-dashboard`, `north-star-metric` |
| Assumption maps | `docs/product/*-assumptions.md` | `identify-assumptions-existing`, `prioritize-assumptions` |
| Test scenarios | `docs/product/*-test-scenarios.md` or implementation tests | `test-scenarios` |
| Release notes | `docs/product/*-release-notes.md` | `release-notes` |

## Recommended Workflow

Use this loop for each larger product area:

1. Write the PRD with `create-prd`.
2. Convert the feature list into outcomes with `outcome-roadmap`.
3. Identify risky assumptions with `identify-assumptions-existing`.
4. Prioritize assumptions with `prioritize-assumptions`.
5. Define success metrics with `metrics-dashboard`.
6. Generate test scenarios with `test-scenarios`.
7. Keep the engineering checklist in sync with the PRD.

## First Application: Account Center

The first product area to manage through PM skills is Account Center because the repo already has a detailed implementation plan in `docs/account-center-todo.md`.

Recommended artifacts:

| Artifact | Status |
| --- | --- |
| Account Center PRD | Created in `docs/product/account-center-prd.md` |
| Account Center outcome roadmap | Next |
| Account Center metrics dashboard | Next |
| Account Center test scenarios | Next, before implementation |

## Skill Mapping for Current Backlog

| Current work | Best skill | Expected result |
| --- | --- | --- |
| Account overview/profile/security/email | `create-prd` | Product requirements and acceptance criteria |
| Account center implementation order | `outcome-roadmap` | Outcomes and metrics by phase |
| Login, verification, reset, account settings | `metrics-dashboard` | Activation and security metrics |
| Remaining auth hardening | `prioritization-frameworks` | P0/P1/P2 tradeoff review |
| Change password, change email, resend verification | `test-scenarios` | Happy paths, edge cases, error states |
| Public launch readiness | `pre-mortem` | Risk list and mitigation plan |
| User/account emails | `grammar-check` | Copy clarity and consistency |

## Operating Rules

- Keep PRD and engineering plan separate but linked.
- Update PRD first when product behavior changes.
- Update checklist status after implementation.
- Treat `docs/auth-feature-checklist.md` as auth status tracking.
- Treat `docs/account-center-todo.md` as engineering execution tracking.
- Treat `docs/product/account-center-prd.md` as product intent and scope.

## Prompt Examples

Use these prompts in Codex when continuing work:

```text
Use the create-prd skill to update the Account Center PRD based on the latest implementation.
```

```text
Use outcome-roadmap to turn docs/account-center-todo.md into a phased outcome roadmap.
```

```text
Use metrics-dashboard to define Account Center success metrics and alert thresholds.
```

```text
Use test-scenarios to generate tests for change password and resend verification.
```

