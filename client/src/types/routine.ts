import { Mindset } from "./analysis";

export type RoutineRecord = {
  routineScore: number;
  grade: string;

  strengths: string[];
  weaknesses: string[];

  improvement: string;
  consistency: string;

  balanceBreakdown: {
    physical: number;
    mental: number;
    social: number;
    recovery: number;
  };

  mindset?: Mindset;

  suggestions?: {
    immediate: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
    weeklyGoal: string;
  };
};