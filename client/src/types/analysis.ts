export type MindsetState =
  | "focused"
  | "scattered"
  | "relaxed"
  | "stressed"
  | "balanced"
  | "social"
  | "creative"
  | "recovering"
  | "unknown";
export type Mindset = {
  state: MindsetState;
  confidence: number;
  description: string;
  triggers: string[];
  suggestion: string;
};

export type AiAnalysis = {
  score: number;
  categories: {
    name: string;
    percent: number;
  }[];

  insights: string[];
  recommendations: string[];

  mindset?: Mindset;

  routineScore?: number;
  routineFeedback?: string;

  timeOfDaySuggestion?: string;
  personalizedTip?: string;
};