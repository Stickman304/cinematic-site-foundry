import { BaseExecutor } from "./base";
import type { ExecutorInput, ExecutorOutput } from "./types";

/**
 * Supervised executor — operator manually provides previewUrl via POST /api/build.
 * This executor always returns a "queued" state. The actual completion signal
 * comes from the operator hitting /api/build with { buildId, previewUrl }.
 *
 * Workflow:
 * 1. Mission Control locks build spec and sets state BUILDING_MOCKUP
 * 2. Operator receives build spec and sends it to their executor of choice
 * 3. Operator POSTs /api/build { buildId, previewUrl, filesChanged, errors }
 * 4. Mission Control transitions to QA_IN_PROGRESS
 */
export class SupervisedExecutor extends BaseExecutor {
  readonly executorType = "supervised" as const;

  async run(input: ExecutorInput): Promise<ExecutorOutput> {
    const specPreview = input.artifacts.buildSpec.slice(0, 500);

    return {
      status: "partial",
      executorType: "supervised",
      changedFiles: [],
      logs: [
        `[supervised] Build spec locked for ${input.buildId}`,
        `[supervised] Direction ${input.approvedDirection} | Tier ${input.tier}`,
        "[supervised] Waiting for operator to mark build complete via POST /api/build",
        `[supervised] Spec preview: ${specPreview}...`,
      ],
      errors: [],
      qaReady: false,
    };
  }
}
