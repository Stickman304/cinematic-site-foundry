import { CodexExecutor } from "./codexExecutor";
import { MockExecutor } from "./mockExecutor";
import { SupervisedExecutor } from "./supervisedExecutor";
import type { ExecutorType } from "@/types/models";
import type { BaseExecutor } from "./base";

export { CodexExecutor, MockExecutor, SupervisedExecutor };
export type { ExecutorInput, ExecutorOutput, ExecutorArtifacts, ExecutorChangedFile } from "./types";

export function getExecutor(type: ExecutorType): BaseExecutor {
  switch (type) {
    case "codex":
      return new CodexExecutor();
    case "mock":
      return new MockExecutor();
    case "supervised":
    default:
      return new SupervisedExecutor();
  }
}

export function detectExecutorType(): ExecutorType {
  const envType = process.env.EXECUTOR_TYPE as ExecutorType | undefined;
  if (envType === "codex" || envType === "mock" || envType === "supervised") {
    return envType;
  }
  if (process.env.OPENAI_API_KEY) return "codex";
  return "supervised";
}
