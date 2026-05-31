import type {
  Agent,
  PipelineStage,
  ActivityEntry,
  Prospect,
  CostEntry,
  CompletedBuild,
  ActiveBuild,
  ClientPortal,
  AssetEntry,
} from "@/types/models";

export const AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Pipeline Commander",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [];

export const ACTIVE_BUILD: ActiveBuild | null = null;

export const INITIAL_ACTIVITY: ActivityEntry[] = [];

export const PROSPECTS: Prospect[] = [];

export const COST_ENTRIES: CostEntry[] = [];

export const COMPLETED_BUILDS: CompletedBuild[] = [];

export const ASSET_LOG: AssetEntry[] = [];

export const SESSION_START_COST = 0;

export const CLIENTS: ClientPortal[] = [];
