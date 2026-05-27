export type AgentStatus = "active" | "idle" | "blocked" | "complete";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentAction: string;
  progress: number; // 0-100
  sessionCost: number;
}

export type PipelineStatus = "pending" | "active" | "complete" | "blocked";

export interface PipelineStage {
  n: number;
  label: string;
  sub: string;
  status: PipelineStatus;
  elapsedMs?: number;
  model?: string;
  tokensUsed?: number;
  agents: string[];
}

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  detail: string;
  cost?: number;
}

export type ProspectStatus = "queued" | "auditing" | "demo_ready" | "outreach_sent" | "won" | "lost";

export interface Prospect {
  id: string;
  name: string;
  url: string;
  score: number; // 1-10
  industry: string;
  status: ProspectStatus;
  estimatedRevenue: string;
  recommendedTier: string;
  notes: string;
}

export interface CostEntry {
  tool: string;
  model: string;
  runs: number;
  cost: number;
}

export interface CompletedBuild {
  id: string;
  name: string;
  client: string;
  type: "renovation" | "new_build" | "outreach_demo";
  industry: string;
  priceCharged: number;
  aiCost: number;
  marginPct: number;
  modulesUsed: string[];
  buildTimeMin: number;
  liveUrl: string;
  githubUrl: string;
  deployedAt: string;
  qaScore: number;
}

export interface ActiveBuild {
  id: string;
  clientSlug: string;
  clientName: string;
  currentStage: number;
  startedAt: Date;
  estimatedCompletion: string;
  sessionCost: number;
}
