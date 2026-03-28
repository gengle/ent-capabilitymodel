# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **OpenSpec-based project** for the "Enterprise Capability Model" domain. It uses a spec-driven change management workflow to structure how features and changes are proposed, designed, specified, and implemented.

## OpenSpec Workflow

Development follows four phases, each with a corresponding slash command:

| Phase | Command | Purpose |
|-------|---------|---------|
| Explore | `/opsx:explore` | Thinking partner — investigate ideas, ask questions, produce diagrams. No code. |
| Propose | `/opsx:propose` | Create a formal change with `proposal.md`, `design.md`, and `tasks.md` artifacts. |
| Apply | `/opsx:apply` | Implement tasks from an active change, marking them complete as you go. |
| Archive | `/opsx:archive` | Finalize a completed change and move it to `openspec/changes/archive/`. |

Active changes live in `openspec/changes/<change-name>/`. Completed changes are moved to `openspec/changes/archive/YYYY-MM-DD-<name>/`.

## Key Files

- `openspec/config.yaml` — Project context (tech stack, conventions) and artifact-specific rules. Populate this to give Claude better context when generating proposals and specs.
- `openspec/specs/` — Specification definitions (currently empty; populated as features are specified).
- `openspec/changes/` — Active and archived changes.

## Archive Checklist

Before archiving a change, the `/opsx:archive` command verifies:
1. All artifacts (proposal, design, tasks) are marked complete
2. All tasks are checked off
3. Delta specs are in sync with implementation
