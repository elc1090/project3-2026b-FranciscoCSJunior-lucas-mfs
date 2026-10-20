// Tipos do domínio SOSTENPYME.
// Este arquivo é o "contrato" entre frontend e backend: os controllers do Laravel
// devem enviar para as páginas dados neste formato.

/** Texto em dois idiomas (conteúdo do catálogo: perguntas, recomendações, metas...). */
export interface Localized {
    es: string;
    pt: string;
}

export type DimensionKey = 'environmental' | 'social' | 'economic' | 'governance';

/** Subgrupos da dimensão Social (pedido da equipe do Chile: mostrar separados). */
export type SocialGroup = 'workers' | 'community';

/** Área avaliada: as 4 dimensões, com Social dividida em 2 para não esconder lacunas. */
export type AreaKey = 'environmental' | 'workers' | 'community' | 'economic' | 'governance';

/** 0 = No, 1 = Ocasionalmente, 2 = Frecuentemente, 3 = Sistemáticamente */
export type AnswerValue = 0 | 1 | 2 | 3;

export interface Question {
    id: string;
    dimension: DimensionKey;
    group?: SocialGroup;
    /** Setor ao qual a pergunta se aplica; sem setor = pergunta geral (pontuada). */
    sector?: SectorKey;
    text: Localized;
    sdgs: number[];
}

export type SectorKey = 'food' | 'retail' | 'services' | 'manufacturing' | 'tourism' | 'construction' | 'other';
export type CompanySize = 'micro' | 'small' | 'medium';

export interface Company {
    name: string;
    sector: SectorKey;
    size: CompanySize;
    workers: number;
    region: string;
}

export interface Recommendation {
    id: string;
    questionId: string;
    title: Localized;
    description: Localized;
}

export type ActionStatus = 'pending' | 'in_progress' | 'done';

export interface PlanAction {
    id: string;
    recommendationId: string;
    owner: string;
    dueDate: string; // AAAA-MM-DD
    indicator: string;
    status: ActionStatus;
}

export interface PathGoal {
    id: string;
    level: 1 | 2 | 3;
    dimension: DimensionKey;
    title: Localized;
}

export interface DiagnosisSnapshot {
    id: string;
    date: string; // AAAA-MM-DD
    total: number;
    scores: Record<AreaKey, number>;
}

export interface SdgInfo {
    number: number;
    title: Localized;
    description: Localized;
}
