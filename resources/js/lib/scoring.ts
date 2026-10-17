// Regras de pontuação do diagnóstico (documento da equipe do Chile):
// cada resposta vale de 0 a 3; 20 perguntas = máximo de 60 pontos, convertido para 0–100.
// A dimensão Social é mostrada também em dois sub-resultados: Trabajadores e Comunidad.
// Obs.: o backend deve repetir este cálculo ao salvar o diagnóstico (não confiar só no frontend).

import { questions, recommendations, scoredQuestions } from '@/data/catalog';
import type { AnswerValue, AreaKey, DimensionKey, Question, Recommendation, SectorKey } from '@/types/sostenpyme';

export type Answers = Record<string, AnswerValue>;

/** Abaixo deste valor a área é considerada uma lacuna e recebe pelo menos uma ação sugerida. */
export const PRIORITY_THRESHOLD = 50;

export const areas: AreaKey[] = ['environmental', 'workers', 'community', 'economic', 'governance'];

export function areaDimension(area: AreaKey): DimensionKey {
    return area === 'workers' || area === 'community' ? 'social' : area;
}

function areaQuestions(area: AreaKey): Question[] {
    if (area === 'workers' || area === 'community') return scoredQuestions.filter((q) => q.group === area);
    return scoredQuestions.filter((q) => q.dimension === area);
}

function percent(list: Question[], answers: Answers): number {
    const max = list.length * 3;
    const sum = list.reduce((total, q) => total + (answers[q.id] ?? 0), 0);
    return max ? Math.round((sum / max) * 100) : 0;
}

export function dimensionScore(dimension: DimensionKey, answers: Answers): number {
    return percent(
        scoredQuestions.filter((q) => q.dimension === dimension),
        answers,
    );
}

export function areaScores(answers: Answers): Record<AreaKey, number> {
    return Object.fromEntries(areas.map((area) => [area, percent(areaQuestions(area), answers)])) as Record<AreaKey, number>;
}

export function totalScore(answers: Answers): { points: number; max: number; percent: number } {
    const points = scoredQuestions.reduce((total, q) => total + (answers[q.id] ?? 0), 0);
    const max = scoredQuestions.length * 3;
    return { points, max, percent: Math.round((points / max) * 100) };
}

export function questionsForSector(sector: SectorKey | undefined): Question[] {
    return questions.filter((q) => !q.sector || q.sector === sector);
}

export function isComplete(answers: Answers, sector?: SectorKey): boolean {
    return questionsForSector(sector).every((q) => answers[q.id] !== undefined);
}

export interface Priority {
    area: AreaKey;
    score: number;
    recommendations: Recommendation[];
}

/**
 * Prioridades ordenadas da área com menor pontuação para a maior.
 * Cada área abaixo do limite recebe pelo menos uma recomendação
 * (as perguntas com resposta mais baixa vêm primeiro).
 */
export function priorities(answers: Answers, sector?: SectorKey): Priority[] {
    const scores = areaScores(answers);
    return areas
        .map((area) => {
            const sectorExtras = questions.filter(
                (q) => q.sector && q.sector === sector && areaDimension(area) === q.dimension && area !== 'workers' && area !== 'community',
            );
            const candidates = [...areaQuestions(area), ...sectorExtras]
                .filter((q) => (answers[q.id] ?? 0) <= 1)
                .sort((a, b) => (answers[a.id] ?? 0) - (answers[b.id] ?? 0));
            const recs = candidates.map((q) => recommendations.find((r) => r.questionId === q.id)).filter((r): r is Recommendation => Boolean(r));
            return { area, score: scores[area], recommendations: recs };
        })
        .filter((p) => p.score < PRIORITY_THRESHOLD || p.recommendations.length > 0)
        .sort((a, b) => a.score - b.score);
}

export function questionOf(recommendation: Recommendation): Question | undefined {
    return questions.find((q) => q.id === recommendation.questionId);
}
