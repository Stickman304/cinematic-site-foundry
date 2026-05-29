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
  {
    id: "scout",
    name: "Scout",
    role: "Audit + Outreach",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "image-prompt-engineer",
    name: "Image Prompt Eng.",
    role: "Asset Generation",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "builder",
    name: "Builder",
    role: "Frontend + Modules",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "reality-checker",
    name: "Reality Checker",
    role: "QA — defaults to NEEDS WORK",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "deployer",
    name: "Deployer",
    role: "GitHub + Vercel",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "brand-guardian",
    name: "Brand Guardian",
    role: "Brand Consistency",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "visual-storyteller",
    name: "Visual Storyteller",
    role: "Creative Direction",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "content-creator",
    name: "Content Creator",
    role: "Copy + Social",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "seo-specialist",
    name: "SEO Specialist",
    role: "Search Optimization",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "devops-automator",
    name: "DevOps Automator",
    role: "CI/CD + Infrastructure",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "senior-developer",
    name: "Senior Developer",
    role: "Architecture + Code Review",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "agents-orchestrator",
    name: "Agents Orchestrator",
    role: "Multi-Agent Coordinator",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "studio-producer",
    name: "Studio Producer",
    role: "Asset Pipeline",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "chief-of-staff",
    name: "Chief of Staff",
    role: "Project Management",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "ux-architect",
    name: "UX Architect",
    role: "User Experience Design",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "whimsy-injector",
    name: "Whimsy Injector",
    role: "Motion + Delight",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "cms-developer",
    name: "CMS Developer",
    role: "Content Management",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "performance-benchmarker",
    name: "Performance Benchmarker",
    role: "Speed + Core Web Vitals",
    status: "idle",
    currentAction: "Standing by",
    progress: 0,
    sessionCost: 0,
  },
  {
    id: "accessibility-auditor",
    name: "Accessibility Auditor",
    role: "WCAG Compliance",
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
