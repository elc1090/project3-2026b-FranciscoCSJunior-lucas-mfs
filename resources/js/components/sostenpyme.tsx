// Componentes visuais compartilhados pelas páginas do SOSTENPYME.
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import { dimensions, PRIORITY_THRESHOLD } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import type { ActionStatus, AnswerValue, DimensionKey } from '@/types/sostenpyme';
import { TriangleAlert } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

/** Define a variável CSS --dim com a cor da dimensão; os filhos usam var(--dim). */
export function dimStyle(dimension: DimensionKey): CSSProperties {
    return { '--dim': `var(--dim-${dimension})` } as CSSProperties;
}

export function Page({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-10', className)}>{children}</div>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
    return (
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
                <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
                {description && <p className="text-muted-foreground mt-2 max-w-[62ch]">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
    );
}

export function Section({
    title,
    description,
    children,
    className,
}: {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section className={cn('bg-card rounded-lg border p-5 md:p-6', className)}>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
            <div className={cn(title && 'mt-5')}>{children}</div>
        </section>
    );
}

/** Barra de pontuação 0–100 na cor da dimensão, com marca no limite de lacuna. */
export function ScoreBar({ label, score, dimension, sub = false }: { label: string; score: number; dimension: DimensionKey; sub?: boolean }) {
    const { t } = useTranslation();
    const isGap = score < PRIORITY_THRESHOLD;

    return (
        <div style={dimStyle(dimension)} className={cn('grid grid-cols-[minmax(6.5rem,9rem)_1fr_2.5rem] items-center gap-3', sub && 'pl-4')}>
            <span className={cn('truncate', sub ? 'text-muted-foreground text-sm' : 'font-medium')}>{label}</span>
            <div className="relative">
                <div
                    role="meter"
                    aria-label={label}
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className={cn('bg-muted overflow-hidden rounded-full', sub ? 'h-2' : 'h-3')}
                >
                    <div className="h-full rounded-full bg-[var(--dim)] transition-[width] duration-500" style={{ width: `${score}%` }} />
                </div>
                <span aria-hidden className="bg-foreground/30 absolute -top-1 -bottom-1 w-px" style={{ left: `${PRIORITY_THRESHOLD}%` }} />
            </div>
            <span className={cn('font-display text-right tabular-nums', sub ? 'text-sm' : 'text-lg font-semibold')}>{score}</span>
            {isGap && (
                <span className="text-warning col-start-2 -mt-1 flex items-center gap-1 text-xs font-medium">
                    <TriangleAlert className="size-3.5" aria-hidden />
                    {t('results.gap')}
                </span>
            )}
        </div>
    );
}

/** As 4 dimensões, com Social seguida dos sub-resultados Trabajadores e Comunidad. */
export function DimensionBars() {
    const { t } = useTranslation();
    const { scores, dimensionScores } = useSustainability();

    return (
        <div className="flex flex-col gap-4">
            {dimensions.map((dimension) => (
                <div key={dimension} className="flex flex-col gap-2">
                    <ScoreBar label={t(`dimension.${dimension}`)} score={dimensionScores[dimension]} dimension={dimension} />
                    {dimension === 'social' && (
                        <>
                            <ScoreBar sub label={t('dimension.workers')} score={scores.workers} dimension="social" />
                            <ScoreBar sub label={t('dimension.community')} score={scores.community} dimension="social" />
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

const answerKeys = ['never', 'sometimes', 'often', 'always'] as const;

/** Glifo de 3 barras crescentes: quantas estão preenchidas = valor da resposta. */
function GrowthGlyph({ value }: { value: number }) {
    return (
        <svg viewBox="0 0 22 16" className="h-4 w-6 shrink-0" aria-hidden>
            {[1, 2, 3].map((level) => (
                <rect
                    key={level}
                    x={(level - 1) * 8}
                    y={16 - level * 5}
                    width="6"
                    height={level * 5}
                    rx="1.5"
                    className={level <= value ? 'fill-[var(--dim)]' : 'fill-foreground/15'}
                />
            ))}
        </svg>
    );
}

/** Escala de resposta 0–3 do diagnóstico. */
export function AnswerScale({
    value,
    onChange,
    dimension,
    labelledBy,
}: {
    value: AnswerValue | undefined;
    onChange: (value: AnswerValue) => void;
    dimension: DimensionKey;
    labelledBy: string;
}) {
    const { t } = useTranslation();

    return (
        <div role="radiogroup" aria-labelledby={labelledBy} style={dimStyle(dimension)} className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            {answerKeys.map((key, index) => {
                const selected = value === index;
                return (
                    <button
                        key={key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(index as AnswerValue)}
                        className={cn(
                            'flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                            'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                            selected
                                ? 'border-[var(--dim)] bg-[color-mix(in_oklab,var(--dim)_12%,transparent)] font-medium'
                                : 'hover:border-foreground/30 bg-background',
                        )}
                    >
                        <GrowthGlyph value={index} />
                        {t(`answer.${key}`)}
                    </button>
                );
            })}
        </div>
    );
}

export function DimensionTag({ dimension, label }: { dimension: DimensionKey; label?: string }) {
    const { t } = useTranslation();
    return (
        <span style={dimStyle(dimension)} className="inline-flex items-center gap-1.5 text-sm font-medium">
            <span className="size-2.5 rounded-full bg-[var(--dim)]" aria-hidden />
            {label ?? t(`dimension.${dimension}`)}
        </span>
    );
}

export function SdgTags({ sdgs }: { sdgs: number[] }) {
    const { t } = useTranslation();
    return (
        <span className="flex flex-wrap gap-1">
            {sdgs.map((n) => (
                <span key={n} className="border-foreground/20 text-muted-foreground rounded border px-1.5 py-0.5 text-xs">
                    {t('explore.sdg', { number: n })}
                </span>
            ))}
        </span>
    );
}

const statusStyles: Record<ActionStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    in_progress: 'bg-[color-mix(in_oklab,var(--dim-governance)_15%,transparent)] text-[var(--dim-governance)]',
    done: 'bg-[color-mix(in_oklab,var(--dim-environmental)_15%,transparent)] text-[var(--dim-environmental)]',
};

export function StatusBadge({ status }: { status: ActionStatus }) {
    const { t } = useTranslation();
    return <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status])}>{t(`status.${status}`)}</span>;
}
