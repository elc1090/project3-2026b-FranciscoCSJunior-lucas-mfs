// TEMPORÁRIO: guarda os dados da empresa no navegador (localStorage) para o frontend
// funcionar enquanto o backend não está pronto. Quando o Lucas criar os controllers,
// cada página passa a receber estes dados como props do Inertia e a enviar as alterações
// com router.post/patch — este arquivo pode então ser removido.

import type { Answers } from '@/lib/scoring';
import { areaScores } from '@/lib/scoring';
import type { Company, DiagnosisSnapshot, PlanAction } from '@/types/sostenpyme';
import { useSyncExternalStore } from 'react';

export interface DemoState {
    company: Company;
    answers: Answers;
    plan: PlanAction[];
    completedGoals: string[];
    history: DiagnosisSnapshot[];
}

// Respostas de demonstração coerentes com os exemplos do documento do Chile:
// Comunidad é a área mais baixa e Gobernanza fica abaixo de 50 (→ "Crear un código de conducta básico").
const demoAnswers: Answers = {
    'env-1': 2,
    'env-2': 1,
    'env-3': 2,
    'env-4': 2,
    'env-5': 2,
    'soc-1': 3,
    'soc-2': 2,
    'soc-3': 2,
    'soc-4': 1,
    'soc-5': 1,
    'eco-1': 2,
    'eco-2': 2,
    'eco-3': 3,
    'eco-4': 2,
    'eco-5': 1,
    'gov-1': 2,
    'gov-2': 0,
    'gov-3': 1,
    'gov-4': 2,
    'gov-5': 2,
    'food-1': 1,
    'food-2': 3,
};

const previousAnswers: Answers = {
    ...demoAnswers,
    'env-2': 0,
    'env-5': 1,
    'soc-3': 1,
    'soc-5': 0,
    'eco-4': 1,
    'gov-1': 1,
    'gov-4': 1,
};

function initialState(): DemoState {
    return {
        company: { name: 'Panadería La Espiga', sector: 'food', size: 'small', workers: 12, region: 'Valparaíso' },
        answers: demoAnswers,
        plan: [
            {
                id: 'a1',
                recommendationId: 'r-env-2',
                owner: 'Camila',
                dueDate: '2026-11-30',
                indicator: 'kWh consumidos por mes',
                status: 'in_progress',
            },
        ],
        completedGoals: ['g1-env', 'g1-soc', 'g1-eco'],
        history: [
            { date: '2026-04-15', scores: areaScores(previousAnswers) },
            { date: '2026-10-01', scores: areaScores(demoAnswers) },
        ],
    };
}

const storageKey = 'sostenpyme-demo';
const listeners = new Set<() => void>();
let state: DemoState = load();

function load(): DemoState {
    if (typeof window === 'undefined') return initialState();
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) return { ...initialState(), ...JSON.parse(raw) };
    } catch {
        // dados inválidos ou localStorage indisponível
    }
    return initialState();
}

export function updateDemo(change: (current: DemoState) => DemoState) {
    state = change(state);
    try {
        localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
        // ignora
    }
    listeners.forEach((listener) => listener());
}

export function resetDemo() {
    updateDemo(() => initialState());
}

export function useDemo(): DemoState {
    return useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        () => state,
        () => state,
    );
}
