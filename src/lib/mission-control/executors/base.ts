import type { ExecutorInput, ExecutorOutput } from "./types";

export abstract class BaseExecutor {
  abstract readonly executorType: "supervised" | "codex" | "mock";

  abstract run(input: ExecutorInput): Promise<ExecutorOutput>;

  protected failResult(error: string): ExecutorOutput {
    return {
      status: "EXECUTOR_FAILED",
      executorType: this.executorType,
      changedFiles: [],
      logs: [],
      errors: [error],
      qaReady: false,
    };
  }
}
