# Mission Control — Executor Policy

These are the hard rules governing how Mission Control interacts with executor agents.

---

## The Executor's Job

The executor's only job is to build what the locked build spec says.

The executor:
- Reads the build spec
- Builds the site
- Returns files changed + errors
- Does nothing else

The executor does not:
- Make design decisions
- Choose fonts, colors, or layouts not in the spec
- Add features not in the spec
- Remove features from the spec
- Contact any third party
- Access any API other than what the spec requires

---

## What Mission Control Sends to the Executor

Mission Control sends exactly:
1. The locked build spec (full markdown)
2. Client photo URLs (if any)
3. Build constraints (time, QA minimum, framework)

Mission Control does not send:
- Raw API keys (never in prompts)
- Personal client information beyond business name and URL
- Pricing information

---

## Raw API Keys — Hard Rule

**No raw API keys are ever included in executor prompts.**

If the build requires an API key (e.g., Google Maps, contact form endpoint), Mission Control:
1. Stores the key in the `.env` file
2. Refers to it by env var name in the build spec: `process.env.GOOGLE_MAPS_KEY`
3. The executor writes code that reads from environment variables — never hardcoded

If a build spec requires an API key that is not yet in the operator's env:
- Build spec notes: "MISSING: GOOGLE_MAPS_KEY — must be added to .env before deploy"
- Executor builds the feature using the env var reference
- Mission Control surfaces the missing key to the operator before deploy

---

## Executor Timeout Policy

| Tier | Max Build Time |
|---|---|
| Tier 1 | 3 minutes |
| Tier 2 | 5 minutes |
| Tier 3 | 8 minutes |
| Tier 4 | 15 minutes |

If the executor exceeds the timeout:
1. Log timeout error to Supabase
2. Surface to operator
3. Do not auto-retry
4. Allow operator to retry manually

---

## Error Handling

### Non-Critical Errors

Warnings that do not block the build (e.g., unused CSS variable):
- Logged to executor output warnings array
- Surfaced in the executor panel in Mission Control
- Does not block QA or preview

### Critical Errors

Errors that block the build (e.g., build failure, TypeScript error, missing file):
- Logged to Supabase with `status: "error"`
- Build held at `BUILDING_MOCKUP` state
- Operator must review and resolve
- Mission Control does not auto-fix without operator approval

---

## What the Executor Must Not Do

1. **No file deletion** — The executor creates and updates files. It does not delete project files without explicit approval from the operator.

2. **No git operations** — The executor does not commit, push, or branch without operator approval.

3. **No production deploys** — The executor builds locally or in a sandbox. Mission Control controls all deploys.

4. **No external API calls during build** — Except those explicitly listed in the build spec (e.g., Google Fonts CDN).

5. **No unsolicited file creation** — The executor only creates files that are part of the site build. No config files, no hidden files, no scripts outside the build spec.

---

## Executor Security Review

Before any new executor type is wired into Mission Control:

1. Review what file system access the executor has
2. Confirm executor cannot read files outside the build directory
3. Confirm executor cannot make outbound requests not listed in the build spec
4. Confirm executor returns structured JSON output (not arbitrary shell output)

---

## Operator Overrides

The operator can:
- Change executor type per build (not permanent)
- Increase timeout per build
- Review executor output before QA proceeds
- Reject executor output and send back for revision

The operator cannot:
- Bypass the locked build spec (once locked, the spec is locked)
- Allow executor to send outreach
- Allow executor to deploy to production without approval gate
