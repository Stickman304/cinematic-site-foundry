export type AgentStatus = "active" | "idle" | "blocked" | "complete";

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  currentAction: string;
  progress: number;
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

export type ProspectStatus =
  | "found"
  | "queued"
  | "auditing"
  | "demo_built"
  | "demo_ready"
  | "pitch_sent"
  | "outreach_sent"
  | "opened"
  | "replied"
  | "converted"
  | "won"
  | "lost";

export interface Prospect {
  id: string;
  name: string;
  url: string;
  score: number;
  industry: string;
  status: ProspectStatus;
  estimatedRevenue: string;
  recommendedTier: string;
  notes: string;
  demoUrl?: string;
  outreachSentAt?: string;
  emailOpenedAt?: string;
  revenuePotential?: string;
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
  type: "renovation" | "new_build" | "outreach_demo" | "premium" | "ugc_campaign";
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
  beforeScreenshot?: string;
  afterScreenshot?: string;
  deployPlatform?: "vercel" | "netlify";
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

export interface ClientPortal {
  id: string;
  name: string;
  businessType: string;
  liveUrl: string;
  pendingRequests: number;
  lastUpdated: string;
  retainerActive: boolean;
  nextBillingDate: string;
  monthlyRetainerAmount: number;
  requestHistory: { date: string; request: string; status: "pending" | "done" }[];
}

export interface AssetEntry {
  id: string;
  projectId: string;
  projectName: string;
  type: "image" | "video" | "edit";
  tool: "nano-banana" | "seedance" | "gpt-image-2" | "higgsfield";
  description: string;
  cost: number;
  duration?: string;
  size?: string;
}
