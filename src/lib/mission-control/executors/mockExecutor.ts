import { BaseExecutor } from "./base";
import type { ExecutorInput, ExecutorOutput } from "./types";

export class MockExecutor extends BaseExecutor {
  readonly executorType = "mock" as const;

  async run(input: ExecutorInput): Promise<ExecutorOutput> {
    await new Promise((r) => setTimeout(r, 500));

    return {
      status: "complete",
      executorType: "mock",
      changedFiles: [
        { path: "src/app/page.tsx", operation: "created" },
        { path: "src/components/Hero.tsx", operation: "created" },
        { path: "public/images/hero-bg.jpg", operation: "created" },
      ],
      previewUrl: undefined,
      logs: [
        `[mock] Build started for ${input.buildId}`,
        `[mock] Direction ${input.approvedDirection} applied`,
        `[mock] Tier ${input.tier} constraints applied`,
        "[mock] Build complete (mock — no real files written)",
      ],
      errors: [],
      qaReady: true,
      completedAt: new Date().toISOString(),
    };
  }
}
