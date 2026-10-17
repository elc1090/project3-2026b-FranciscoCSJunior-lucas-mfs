import { AnswerScale, dimStyle, Page, PageHeader, SdgTags } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { dimensions } from '@/data/catalog';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { updateDemo, useDemo } from '@/lib/demo-store';
import { areaScores, questionsForSector, type Answers } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import type { DimensionKey, Question } from '@/types/sostenpyme';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Step {
    key: string;
    label: string;
    dimension: DimensionKey;
    questions: Question[];
    note?: string;
}

export default function Diagnosis() {
    const { t, tl } = useTranslation();
    const { company, answers: savedAnswers } = useDemo();
    const [answers, setAnswers] = useState<Answers>(savedAnswers);
    const [stepIndex, setStepIndex] = useState(0);
    const [showMissing, setShowMissing] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('diagnosis.title'), href: '/diagnosis' }];
    const all = questionsForSector(company.sector);

    const steps: Step[] = dimensions.map((dimension) => ({
        key: dimension,
        label: t(`dimension.${dimension}`),
        dimension,
        questions: all.filter((q) => q.dimension === dimension && !q.sector),
    }));
    const sectorQuestions = all.filter((q) => q.sector);
    if (sectorQuestions.length) {
        steps.push({
            key: 'sector',
            label: t('diagnosis.sectorStep'),
            dimension: 'environmental',
            questions: sectorQuestions,
            note: t('diagnosis.sectorNote'),
        });
    }

    const step = steps[stepIndex];
    const answeredCount = all.filter((q) => answers[q.id] !== undefined).length;
    const missing = all.length - answeredCount;
    const isLast = stepIndex === steps.length - 1;

    function goTo(index: number) {
        setStepIndex(index);
        window.scrollTo({ top: 0 });
    }

    // Com o backend: router.post(route('diagnosis.store'), { answers }) — o servidor calcula e salva a pontuação.
    function finish() {
        if (missing > 0) {
            setShowMissing(true);
            return;
        }
        const today = new Date().toISOString().slice(0, 10);
        updateDemo((state) => ({
            ...state,
            answers,
            history: [...state.history.filter((h) => h.date !== today), { date: today, scores: areaScores(answers) }],
        }));
        router.visit('/results');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('diagnosis.title')} />
            <Page className="max-w-4xl">
                <PageHeader title={t('diagnosis.title')} description={t('diagnosis.description')} />

                <nav aria-label={t('diagnosis.title')} className="mb-8">
                    <ol className="flex flex-wrap gap-2">
                        {steps.map((s, index) => {
                            const done = s.questions.every((q) => answers[q.id] !== undefined);
                            const current = index === stepIndex;
                            return (
                                <li key={s.key} style={s.key === 'sector' ? undefined : dimStyle(s.dimension)}>
                                    <button
                                        type="button"
                                        onClick={() => goTo(index)}
                                        aria-current={current ? 'step' : undefined}
                                        className={cn(
                                            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors',
                                            current
                                                ? 'border-[var(--dim,var(--foreground))] font-semibold'
                                                : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex size-5 items-center justify-center rounded-full text-xs',
                                                done ? 'bg-[var(--dim,var(--foreground))] text-white dark:text-black' : 'bg-muted',
                                            )}
                                        >
                                            {index + 1}
                                        </span>
                                        {s.label}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                    <p className="text-muted-foreground mt-3 text-sm" aria-live="polite">
                        {t('diagnosis.progress', { answered: answeredCount, total: all.length })}
                    </p>
                </nav>

                {step.note && <p className="bg-muted mb-6 rounded-md px-4 py-3 text-sm">{step.note}</p>}

                <ol className="flex flex-col gap-4">
                    {step.questions.map((question, index) => (
                        <li
                            key={question.id}
                            style={dimStyle(question.dimension)}
                            className={cn(
                                'bg-card rounded-lg border border-l-4 border-l-[var(--dim)] p-5',
                                showMissing && answers[question.id] === undefined && 'ring-warning ring-2',
                            )}
                        >
                            <div className="mb-4 flex gap-3">
                                <span className="font-display text-muted-foreground text-lg font-semibold tabular-nums">{index + 1}</span>
                                <div className="flex flex-col gap-2">
                                    <h3 id={`q-${question.id}`} className="font-sans text-base leading-snug font-medium">
                                        {tl(question.text)}
                                    </h3>
                                    <SdgTags sdgs={question.sdgs} />
                                </div>
                            </div>
                            <AnswerScale
                                value={answers[question.id]}
                                onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
                                dimension={question.dimension}
                                labelledBy={`q-${question.id}`}
                            />
                        </li>
                    ))}
                </ol>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    {stepIndex > 0 && (
                        <Button variant="outline" onClick={() => goTo(stepIndex - 1)}>
                            {t('diagnosis.previous')}
                        </Button>
                    )}
                    {isLast ? (
                        <Button onClick={finish}>{t('diagnosis.finish')}</Button>
                    ) : (
                        <Button onClick={() => goTo(stepIndex + 1)}>{t('diagnosis.next')}</Button>
                    )}
                    {showMissing && missing > 0 && (
                        <span role="alert" className="text-warning text-sm font-medium">
                            {t('diagnosis.missing', { count: missing })}
                        </span>
                    )}
                </div>
            </Page>
        </AppLayout>
    );
}
