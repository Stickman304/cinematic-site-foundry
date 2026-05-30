# 20 — ECC INTEGRATION STRATEGY

## What ECC Is (And What It Is Not)

ECC (Everything Claude Code) is a reference library — a catalog of agent patterns, skill templates, and workflow primitives.

**ECC is NOT:**
- A dependency to install
- A package to import
- A runtime system
- A framework Mission Control runs on top of

**ECC IS:**
- A pattern library we read before building agents
- A source of battle-tested system prompts
- A vocabulary for describing agent behavior
- A checklist for what not to forget

---

## Selective Import Rule

Only extract what is needed for the current phase. Do not import the full ECC repo.

**Current priority (core pipeline):**
1. Audit agent pattern → referenced for Website Audit Agent (02)
2. QA scorecard pattern → referenced for QA Inspector (08)
3. Sales package pattern → referenced for Sales Package Agent (09)
4. Orchestrator pattern → referenced for Mission Control Orchestrator (00)

**Deferred (Phase 2+):**
- Memory operator pattern → Hermes (10)
- Approval gateway pattern → OpenClaw (11)
- Multi-agent consensus → The Council
- Continuous learning loop → MetaHarness

---

## Agent Rules

- Every agent has exactly the skills listed in `21_SKILL_ROUTING_MATRIX.md`
- No agent system prompt may reference ECC by name at runtime
- Agent behavior is defined in `docs/mission-control/agents/` contract files
- If ECC has a pattern that matches an agent need, extract the relevant system prompt language only — do not copy the surrounding framework

---

## MCP Rules

**Currently wired:**
- Anthropic SDK (claude-sonnet-4-20250514)
- Firecrawl REST API
- Supabase client

**Not wired (do not add without operator approval):**
- Hermes MCP
- OpenClaw MCP
- Any new MCP server
- Any new SDK

---

## Tool Rules

**Allowed:**
- `anthropic.messages.create()` — non-streaming for structured JSON, streaming for SSE
- `supabase.from().select/insert/update` — via lib/supabase.ts
- Firecrawl REST fetch — via lib/firecrawl.ts

**Forbidden without operator approval:**
- New npm packages
- New API integrations
- New tool categories not listed above

---

## Current Phase Priority

The core pipeline ships first:

```
URL → Firecrawl scrape → Audit Object → Two Directions → Approval Gate →
Build Spec Lock → Executor → QA Scorecard → Sales Package → Approval Gate
```

ECC patterns are referenced for system prompt quality only. The pipeline does not depend on ECC being installed.

---

## When to Reference ECC

Before writing any new Anthropic system prompt, check:
1. Does ECC have a pattern for this agent role?
2. If yes — extract the system prompt language, adapt it to Mission Control constraints, discard the rest.
3. If no — write the system prompt from the agent contract file in `docs/mission-control/agents/`.

Never reference ECC at runtime. Never import ECC as a package. Never let ECC patterns override `21_SKILL_ROUTING_MATRIX.md` constraints.
