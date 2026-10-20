import type { SharedData } from '@/types';
import type {
    AnswerValue,
    AreaKey,
    Company,
    DiagnosisSnapshot,
    DimensionKey,
    PathGoal,
    PlanAction,
    Question,
    Recommendation,
    SdgInfo,
} from '@/types/sostenpyme';
import { usePage } from '@inertiajs/react';

export interface SustainabilityData extends SharedData {
    company: Company;
    answers: Record<string, AnswerValue>;
    plan: PlanAction[];
    completedGoals: string[];
    history: DiagnosisSnapshot[];
    questions: Question[];
    recommendations: Recommendation[];
    pathGoals: PathGoal[];
    sdgs: SdgInfo[];
    scores: Record<AreaKey, number>;
    dimensionScores: Record<DimensionKey, number>;
    totalScore: { points: number; max: number; percent: number };
    priorities: { area: AreaKey; score: number; recommendationIds: string[] }[];
}

export function useSustainability() {
    const data = usePage<SustainabilityData>().props;
    const applicable = data.questions.filter((q) => !q.sector || q.sector === data.company.sector);
    const complete = data.history.length > 0 && applicable.length > 0 && applicable.every((q) => data.answers[q.id] !== undefined);
    return {
        ...data,
        complete,
        applicable,
        questionOf: (rec: Recommendation) => data.questions.find((q) => q.id === rec.questionId),
        priorities: complete
            ? data.priorities.map((priority) => ({
                  ...priority,
                  recommendations: priority.recommendationIds.flatMap((id) => data.recommendations.filter((r) => r.id === id)),
              }))
            : [],
    };
}
