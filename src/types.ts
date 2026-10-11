export type Color = 'grey' | 'blue' | 'red' | 'yellow' | 'green' | 'pink' | 'purple' | 'cyan' | 'orange';

export const COLORS: Color[] = ['grey', 'blue', 'red', 'yellow', 'green', 'pink', 'purple', 'cyan', 'orange'];

/** Known secondary-level TLDs for ccTLD base-domain extraction (.co.uk, .com.au, etc.) */
export const SECONDARY_TLDS = new Set(['co', 'com', 'org', 'net', 'gov', 'edu', 'ac', 'me', 'ltd']);

// --- Provider Presets ---

export interface ProviderPreset {
  id: string;
  name: string;
  baseUrl: string;
  needsKey: boolean;
  isBuiltIn?: boolean;
  signupUrl?: string;
  helpText?: string;
}

// Endpoint presets only. Model catalogs belong to providers, not this extension.
export const PROVIDERS: ProviderPreset[] = [
  { id: 'chrome-ai', name: 'Chrome AI', baseUrl: '', needsKey: false, isBuiltIn: true, helpText: 'Runs on this device. Chrome manages the model.' },
  { id: 'openrouter-free', name: 'OpenRouter · free', baseUrl: 'https://openrouter.ai/api/v1', needsKey: true, signupUrl: 'https://openrouter.ai/keys', helpText: 'Only models currently reporting zero input and output prices.' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', needsKey: true, signupUrl: 'https://console.groq.com/keys', helpText: 'Choose from the models available to your account.' },
  { id: 'grok', name: 'xAI', baseUrl: 'https://api.x.ai/v1', needsKey: true, signupUrl: 'https://console.x.ai', helpText: 'Choose from the models available to your account.' },
  { id: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com', needsKey: true, signupUrl: 'https://console.anthropic.com/settings/keys', helpText: 'Choose from your current Claude model catalog.' },
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', needsKey: true, signupUrl: 'https://platform.openai.com/api-keys', helpText: 'Choose a chat-capable model from your account.' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', needsKey: true, signupUrl: 'https://openrouter.ai/keys', helpText: 'Live model catalog and pricing from OpenRouter.' },
  { id: 'custom', name: 'Custom endpoint', baseUrl: '', needsKey: true, helpText: 'Connect an OpenAI-compatible server, including a local workstation. API key is optional.' },
  { id: 'ollama', name: 'Ollama (Local)', baseUrl: 'http://localhost:11434/v1', needsKey: false, signupUrl: 'https://ollama.com/download', helpText: 'Choose from the models installed on your Ollama server.' },
];

// --- Tab & Group ---

export interface TabInfo {
  id: number;
  title: string;
  url: string;
}

export interface RawGroup {
  name: string;
  color: Color;
  tabIds: number[];
}

export interface GroupSuggestion {
  name: string;
  color: Color;
  tabs: TabInfo[];
}

// --- Settings ---

export interface LLMConfig {
  provider?: string;
  /** Per million tokens; unknown unless supplied by a live catalog. */
  modelPricing?: [number, number];
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface Settings extends LLMConfig {
  provider: string;
  autoTrigger: boolean;
  threshold: number;
  maxGroups: number;
  mergeMode: boolean;
  maxTitleLength: number;
  silentAutoAdd: boolean;
  autoPinApps: boolean;
  staleTabThresholdHours: number;
  // Smart learning
  enableCorrectionTracking: boolean;
  enableRejectionMemory: boolean;
  enableGroupDrift: boolean;
  enablePatternMining: boolean;
  groupDriftThreshold: number;
  // Scheduled re-org
  reorgSchedule: 'off' | 'daily' | 'weekly';
  reorgTime: number;
  // Pinned groups
  pinnedGroups: string[];
  // Smart ungrouping
  smartUngroup: boolean;
  // Spending cap (0 = unlimited)
  spendingCapUSD: number;
}

export interface AffinityMap {
  [domain: string]: string;
}

// --- Weighted Affinity (learning system) ---

export interface WeightedAffinityGroup {
  count: number;
  lastUsed: number;
}

export interface WeightedAffinityEntry {
  groups: Record<string, WeightedAffinityGroup>;
}

export interface WeightedAffinityMap {
  [key: string]: WeightedAffinityEntry;
}

// --- Correction Tracking ---

export interface CorrectionEntry {
  timestamp: number;
  corrections: { domain: string; originalGroup: string; correctedGroup: string }[];
}

// --- Rejection Memory ---

export interface RejectionEntry {
  timestamp: number;
  domain: string;
  rejectedGroup: string;
}

// --- Snoozed Tabs ---

export interface SnoozedTab {
  id: string;
  url: string;
  title: string;
  wakeAt: number;
}

// --- Merge/Split Suggestions ---

export interface MergeSplitResult {
  merges: { group1: string; group2: string; overlap: number }[];
  splits: { group: string; tabCount: number; domainCount: number }[];
}

export interface DomainRule {
  domain: string;
  groupName: string;
  color: Color;
}

// --- Workspaces ---

export interface WorkspaceTab {
  url: string;
  title: string;
  pinned: boolean;
  active: boolean;
  groupName?: string;
  groupColor?: Color;
}

export interface Workspace {
  name: string;
  savedAt: number;
  tabs: WorkspaceTab[];
}

export interface WorkspaceMap {
  [name: string]: Workspace;
}

// --- History ---

export interface HistoryEntry {
  timestamp: number;
  groups: { name: string; domains: string[] }[];
}

// --- Costs ---

export interface CostTotals {
  unpricedCalls?: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  sessionCost: number;
  byProvider: Record<string, { inputTokens: number; outputTokens: number; cost: number }>;
}

// --- Undo ---

export interface UndoSnapshot {
  timestamp: number;
  groups: { tabId: number; groupId: number }[];
  ungrouped: number[];
}

// --- Stats ---

export interface Stats {
  totalOrganizations: number;
  totalTabsGrouped: number;
  lastOrganizedAt: number | null;
}

// --- Export ---

export interface ExportData {
  settings: Settings;
  affinity: AffinityMap;
  domainRules: DomainRule[];
  workspaces: WorkspaceMap;
  weightedAffinity?: WeightedAffinityMap;
  corrections?: CorrectionEntry[];
  rejections?: RejectionEntry[];
}

// --- Defaults ---

export const DEFAULT_SETTINGS: Settings = {
  provider: 'chrome-ai',
  baseUrl: '',
  apiKey: '',
  model: '',
  autoTrigger: false,
  threshold: 5,
  maxGroups: 6,
  mergeMode: false,
  maxTitleLength: 80,
  silentAutoAdd: false,
  autoPinApps: false,
  staleTabThresholdHours: 48,
  enableCorrectionTracking: true,
  enableRejectionMemory: true,
  enableGroupDrift: false,
  enablePatternMining: false,
  groupDriftThreshold: 50,
  reorgSchedule: 'off',
  reorgTime: 9,
  pinnedGroups: [],
  smartUngroup: false,
  spendingCapUSD: 0,
};

export const DEFAULT_STATS: Stats = {
  totalOrganizations: 0,
  totalTabsGrouped: 0,
  lastOrganizedAt: null,
};

export const DEFAULT_COSTS: CostTotals = {
  totalInputTokens: 0,
  totalOutputTokens: 0,
  totalCost: 0,
  sessionCost: 0,
  byProvider: {},
};

// --- Messages ---

export type MessageType =
  | { type: 'organize' }
  | { type: 'organize-ungrouped' }
  | { type: 'apply'; suggestions: GroupSuggestion[] }
  | { type: 'undo' }
  | { type: 'find-duplicates' }
  | { type: 'list-workspaces' }
  | { type: 'get-stats' }
  | { type: 'get-costs' }
  | { type: 'export-data' }
  | { type: 'import-data'; data: ExportData }
  | { type: 'test-connection' }
  | { type: 'check-chrome-ai' }
  | { type: 'fetch-ollama-models' }
  | { type: 'consolidate-windows' }
  | { type: 'snooze-tabs'; tabIds: number[]; wakeAt: number }
  | { type: 'purge-stale' }
  | { type: 'focus-group' }
  | { type: 'delete-all-groups' }
  | { type: 'export-markdown' }
  | { type: 'sort-groups' }
  | { type: 'save-workspace'; name: string }
  | { type: 'restore-workspace'; name: string }
  | { type: 'delete-workspace'; name: string }
  | { type: 'record-corrections'; corrections: CorrectionEntry }
  | { type: 'record-rejections'; rejections: RejectionEntry[] }
  | { type: 'check-group-drift' }
  | { type: 'merge-split-suggestions' }
  | { type: 'search-tabs'; query: string }
  | { type: 'get-group-stats' }
  | { type: 'status'; status: string; suggestions?: GroupSuggestion[]; error?: string; duplicates?: TabInfo[][]; stats?: Stats; costs?: CostTotals; data?: ExportData; models?: string[]; chatResponse?: string; markdown?: string; workspaceNames?: string[]; count?: number; drifted?: boolean; driftedGroups?: string[]; mergeSplit?: MergeSplitResult; tabResults?: Array<{ id: number; title: string; url: string; groupName: string; groupId: number }>; groupStats?: Array<{ name: string; color: Color; tabCount: number; domains: string[] }> };

declare global {
  var LanguageModel: {
    create(options?: { systemPrompt?: string }): Promise<{
      prompt(text: string): Promise<string>;
      destroy(): void;
    }>;
  } | undefined;
}
