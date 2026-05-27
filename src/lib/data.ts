import type {
  Agent,
  PipelineStage,
  ActivityEntry,
  Prospect,
  CostEntry,
  CompletedBuild,
  ActiveBuild,
} from "@/types/models";

export const AGENTS: Agent[] = [
  {
    id: "orchestrator",
    name: "Orchestrator",
    role: "Pipeline Commander",
    status: "active",
    currentAction: "Coordinating Stage 1 audit for memphis-bbq",
    progress: 65,
    sessionCost: 0.0021,
  },
  {
    id: "scout",
    name: "Scout",
    role: "Audit + Outreach",
    status: "active",
    currentAction: "Firecrawl scrape → brand_profile.json",
    progress: 80,
    sessionCost: 0.0008,
  },
  {
    id: "image-prompt-engineer",
    name: "Image Prompt Eng.",
    role: "Asset Generation",
    status: "idle",
    currentAction: "Waiting for creative brief approval",
    progress: 0,
    sessionCost: 0.0,
  },
  {
    id: "builder",
    name: "Builder",
    role: "Frontend + Modules",
    status: "idle",
    currentAction: "Standby — awaiting approved brief",
    progress: 0,
    sessionCost: 0.0,
  },
  {
    id: "reality-checker",
    name: "Reality Checker",
    role: "QA — defaults to NEEDS WORK",
    status: "idle",
    currentAction: "No build in QA queue",
    progress: 0,
    sessionCost: 0.0,
  },
  {
    id: "deployer",
    name: "Deployer",
    role: "GitHub + Vercel",
    status: "idle",
    currentAction: "Awaiting QA ≥85 sign-off",
    progress: 0,
    sessionCost: 0.0,
  },
];

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    n: 1,
    label: "Audit",
    sub: "Firecrawl + Impeccable",
    status: "active",
    elapsedMs: 41200,
    model: "claude-sonnet-4-6",
    tokensUsed: 3840,
    agents: ["orchestrator", "scout"],
  },
  {
    n: 2,
    label: "Brand Profile",
    sub: "Design system extraction",
    status: "pending",
    agents: ["scout", "brand-guardian"],
  },
  {
    n: 3,
    label: "Creative Brief",
    sub: "⚡ Decision gate",
    status: "pending",
    agents: ["visual-storyteller", "image-prompt-engineer"],
  },
  {
    n: 4,
    label: "Asset Generation",
    sub: "Nano Banana Pro + Seedance",
    status: "pending",
    agents: ["image-prompt-engineer"],
  },
  {
    n: 5,
    label: "Build",
    sub: "Frontend + Modules",
    status: "pending",
    agents: ["builder", "content-creator"],
  },
  {
    n: 6,
    label: "QA",
    sub: "Reality Checker — defaults NEEDS WORK",
    status: "pending",
    agents: ["reality-checker"],
  },
  {
    n: 7,
    label: "Deploy",
    sub: "GitHub + Vercel",
    status: "pending",
    agents: ["deployer"],
  },
];

export const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: "a1",
    timestamp: new Date(Date.now() - 41000),
    agent: "Scout",
    action: "firecrawl_scrape",
    detail: "memphisbbqsupply.com → 14 pages scraped",
    cost: 0.014,
  },
  {
    id: "a2",
    timestamp: new Date(Date.now() - 38000),
    agent: "Scout",
    action: "quality_score",
    detail: "Site quality: 4/10 — Wix template, zero motion, buried social proof",
  },
  {
    id: "a3",
    timestamp: new Date(Date.now() - 32000),
    agent: "Orchestrator",
    action: "opportunity_flag",
    detail: "4.8★ / 310 reviews NOT surfaced on homepage → high opportunity",
  },
  {
    id: "a4",
    timestamp: new Date(Date.now() - 28000),
    agent: "Scout",
    action: "brand_extract",
    detail: "Extracted: pit black #1A0A00, flame orange #C94B0C, tagline 'Flavor Made by Memphis'",
  },
  {
    id: "a5",
    timestamp: new Date(Date.now() - 15000),
    agent: "Orchestrator",
    action: "recommendation",
    detail: "Full rebuild recommended — $7.5K–$12K tier. Wix is the ceiling.",
  },
  {
    id: "a6",
    timestamp: new Date(Date.now() - 8000),
    agent: "Scout",
    action: "brand_profile_write",
    detail: "brand_profile.json written → projects/memphis-bbq/",
  },
];

export const PROSPECTS: Prospect[] = [
  {
    id: "p1",
    name: "Memphis Barbeque Supply",
    url: "memphisbbqsupply.com",
    score: 4,
    industry: "Specialty BBQ Retail",
    status: "auditing",
    estimatedRevenue: "$300K–$800K/yr",
    recommendedTier: "$7.5K–$12K",
    notes: "4.8★ 310 reviews buried. Wix template. Domain split killing SEO.",
  },
];

export const COST_ENTRIES: CostEntry[] = [
  { tool: "Firecrawl", model: "firecrawl-scrape", runs: 14, cost: 0.014 },
  { tool: "Claude Sonnet", model: "claude-sonnet-4-6", runs: 3, cost: 0.0021 },
  { tool: "Claude Haiku", model: "claude-haiku-4-5", runs: 8, cost: 0.0008 },
];

export const COMPLETED_BUILDS: CompletedBuild[] = [];

export const ACTIVE_BUILD: ActiveBuild = {
  id: "memphis-bbq",
  clientSlug: "memphis-bbq",
  clientName: "Memphis Barbeque Supply",
  currentStage: 1,
  startedAt: new Date(Date.now() - 42000),
  estimatedCompletion: "~3 hours",
  sessionCost: 0.0169,
};

export const SESSION_START_COST = 0.0169;
