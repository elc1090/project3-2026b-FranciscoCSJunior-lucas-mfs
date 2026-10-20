import type { AnswerValue, AreaKey, DimensionKey } from '@/types/sostenpyme';

export type Answers = Record<string, AnswerValue>;
export const PRIORITY_THRESHOLD = 50;
export const dimensions: DimensionKey[] = ['environmental', 'social', 'economic', 'governance'];
export const areas: AreaKey[] = ['environmental', 'workers', 'community', 'economic', 'governance'];
export function areaDimension(area: AreaKey): DimensionKey {
    return area === 'workers' || area === 'community' ? 'social' : area;
}
