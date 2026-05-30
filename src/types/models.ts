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

// ── Workflow States ─────────────────────────────────────────────────────────

export type WorkflowState =
  | "URL_RECEIVED"
  | "AUDITING_WEBSITE"
  | "SCORING_OPPORTUNITY"
  | "GENERATING_DIRECTIONS"
  | "WAITING_FOR_APPROVAL"
  | "LOCKING_BUILD_SPEC"
  | "READY_FOR_EXECUTOR"
  | "EXECUTOR_QUEUED"
  | "EXECUTOR_RUNNING"
  | "BUILDING_MOCKUP"
  | "EXECUTOR_COMPLETE"
  | "EXECUTOR_FAILED"
  | "QA_IN_PROGRESS"
  | "PREVIEW_READY"
  | "OUTREACH_DRAFTED"
  | "WAITING_FOR_SEND_APPROVAL"
  | "COMPLETE"
  | "ERROR";

export const WORKFLOW_STEPS: { state: WorkflowState; label: string }[] = [
  { state: "URL_RECEIVED",          label: "URL Received" },
  { state: "AUDITING_WEBSITE",      label: "Auditing Website" },
  { state: "SCORING_OPPORTUNITY",   label: "Scoring Opportunity" },
  { state: "GENERATING_DIRECTIONS", label: "Generating Directions" },
  { state: "WAITING_FOR_APPROVAL",  label: "Awaiting Approval" },
  { state: "LOCKING_BUILD_SPEC",    label: "Locking Spec" },
  { state: "BUILDING_MOCKUP",       label: "Building" },
  { state: "QA_IN_PROGRESS",        label: "QA Scoring" },
  { state: "PREVIEW_READY",         label: "Preview Ready" },
  { state: "OUTREACH_DRAFTED",      label: "Outreach Drafted" },
  { state: "COMPLETE",              label: "Complete" },
];

export type ExecutorType = "supervised" | "codex" | "mock";

// ── Audit Object ────────────────────────────────────────────────────────────

export interface AuditObject {
  websiteScore: number;
  opportunityScore: number;
  sellabilityScore: number;
  topProblems: string[];
  recommendedTier: "tier1" | "tier2" | "tier3" | "tier4";
  upgradeAngle: string;
  clientNameExtracted?: string;
  industryExtracted?: string;
  locationExtracted?: string;
}

// ── Creative Directions ─────────────────────────────────────────────────────

export interface DirectionArtifacts {
  designSystem: string;
  creativeDirection: string;
  antiSlopRules: string;
  copyBrief: string;
  motionPlan: string;
  buildSpec: string;
}

export interface Direction {
  id: "A" | "B";
  name: string;
  concept: string;
  heroHeadline: string;
  heroSubheadline: string;
  visualFeel: string;
  keyDifferentiator: string;
  gradientType: string;
  heroLayout: string;
  artifacts: DirectionArtifacts;
}

// ── QA Scorecard ────────────────────────────────────────────────────────────

export interface QAScorecardDimension {
  score: number;
  pass: boolean;
  notes: string;
}

export interface QAScorecard {
  dimensions: {
    visualTaste: QAScorecardDimension;
    mobileExperience: QAScorecardDimension;
    ctaStrength: QAScorecardDimension;
    copyQuality: QAScorecardDimension;
    trustArchitecture: QAScorecardDimension;
    performanceRisk: QAScorecardDimension;
    brandPerception: QAScorecardDimension;
    motionQuality: QAScorecardDimension;
    seoFoundation: QAScorecardDimension;
    codeMaintainability: QAScorecardDimension;
  };
  finalScore: number;
  pass: boolean;
  failingDimensions: string[];
  recommendations: string[];
}

// ── Sales Package ───────────────────────────────────────────────────────────

export interface SalesPackage {
  pitchEmail: string;
  sms: string;
  callScript: string;
  proposalSummary: string;
  beforeAfterFraming: string;
  approved: {
    email: boolean;
    sms: boolean;
    callScript: boolean;
    proposal: boolean;
  };
}

// ── Executor ────────────────────────────────────────────────────────────────

export interface ExecutorResult {
  status: "complete" | "error" | "partial";
  files: { path: string; operation: "created" | "updated" | "deleted" }[];
  errors: { file?: string; line?: number; message: string }[];
  warnings: { message: string }[];
  previewUrl?: string;
  buildTimeMs: number;
}

// ── Build Record (full pipeline state) ─────────────────────────────────────

export interface BuildRecord {
  buildId: string;
  url: string;
  clientName?: string;
  tier?: string;
  notes?: string;
  photoUrls: string[];
  workflowState: WorkflowState;
  auditObject?: AuditObject;
  directionA?: Direction;
  directionB?: Direction;
  approvedDirection?: "A" | "B";
  lockedBuildSpec?: string;
  executorType?: string;
  executorResult?: ExecutorResult;
  qaScorecard?: QAScorecard;
  salesPackage?: SalesPackage;
  totalCost: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Legacy types (unchanged) ────────────────────────────────────────────────

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
