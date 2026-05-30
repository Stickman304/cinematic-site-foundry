export interface ExecutorArtifacts {
  buildSpec: string;
  designSystem: string;
  creativeDirection: string;
  antiSlopRules: string;
  copyBrief: string;
  motionPlan: string;
}

export interface ExecutorInput {
  buildId: string;
  workflowRunId?: string;
  prospectId?: string;
  approvedDirection: "A" | "B";
  tier: string;
  clientName?: string;
  photoUrls?: string[];
  artifacts: ExecutorArtifacts;
  acceptanceCriteria?: string;
  targetFramework?: string;
}

export interface ExecutorChangedFile {
  path: string;
  operation: "created" | "updated" | "deleted";
}

export interface ExecutorOutput {
  status: "complete" | "partial" | "EXECUTOR_FAILED";
  executorType: "supervised" | "codex" | "mock";
  changedFiles: ExecutorChangedFile[];
  previewUrl?: string;
  logs: string[];
  errors: string[];
  qaReady: boolean;
  completedAt?: string;
}
