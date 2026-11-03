// Gráficos da pegada de carbono.
// Rosca por fonte: uma cor por fonte, sempre acompanhada de legenda com nome e valor.
// Colunas mensais: uma única cor (a da dimensão Ambiental), já que cada coluna tem o mês escrito embaixo.
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import type { CarbonRecord, CarbonSource } from '@/types/sostenpyme';
import { useState } from 'react';

export const carbonSources: CarbonSource[] = ['electricity', 'naturalGas', 'lpg', 'transport'];

/** Formata kg CO2e: abaixo de 1 tonelada em kg, acima em toneladas. */
export function useCarbonFormat() {
    const { locale } = useTranslation();
    const intl = locale === 'es' ? 'es-CL' : 'pt-BR';
    const number = (value: number, digits = 1) => new Intl.NumberFormat(intl, { maximumFractionDigits: digits }).format(value);

    return {
        emissions: (kg: number) => (kg >= 1000 ? `${number(kg / 1000, 2)} t CO₂e` : `${number(kg, 0)} kg CO₂e`),
        number,
        month: (period: string, style: 'short' | 'long' = 'short') =>
            new Intl.DateTimeFormat(intl, { month: style, year: style === 'short' ? '2-digit' : 'numeric' }).format(
                new Date(`${period}-15T12:00:00`),
            ),
    };
}

/** Cor de cada fonte (definida em app.css, com versão para o modo escuro). A cor segue a fonte, nunca a posição. */
const sourceColor: Record<CarbonSource, string> = {
    electricity: 'var(--carbon-electricity)',
    naturalGas: 'var(--carbon-natural-gas)',
    lpg: 'var(--carbon-lpg)',
    transport: 'var(--carbon-transport)',
};

/** Gráfico de rosca: participação de cada fonte nas emissões de um mês, com o total no centro e legenda com valores. */
export function CarbonSourcePie({ record }: { record: CarbonRecord }) {
    const { t } = useTranslation();
    const format = useCarbonFormat();
    const [active, setActive] = useState<CarbonSource | null>(null);

    const size = 180;
    const stroke = 30;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const gap = 2; // espaço de 2px entre as fatias
    const slices = carbonSources.filter((source) => record.emissions[source] > 0);

    let offset = 0;
    const arcs = slices.map((source) => {
        const length = (record.emissions[source] / record.total) * circumference;
        const arc = { source, start: offset, length: slices.length > 1 ? Math.max(length - gap, 0.5) : length };
        offset += length;
        return arc;
    });

    const share = (source: CarbonSource) => (record.total > 0 ? Math.round((record.emissions[source] / record.total) * 100) : 0);
    const label = (source: CarbonSource) => `${t(`carbon.sources.${source}`)}: ${format.emissions(record.emissions[source])} (${share(source)}%)`;

    return (
        <div className="@container">
            <div className="flex flex-col items-center gap-6 @md:flex-row">
                <div className="relative shrink-0" onMouseLeave={() => setActive(null)}>
                    <svg
                        width={size}
                        height={size}
                        viewBox={`0 0 ${size} ${size}`}
                        role="img"
                        aria-label={`${t('carbon.latestTitle')}. ${carbonSources.map(label).join('; ')}`}
                        className="-rotate-90"
                    >
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
                        {arcs.map((arc) => (
                            <circle
                                key={arc.source}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={sourceColor[arc.source]}
                                strokeWidth={active === arc.source ? stroke + 6 : stroke}
                                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                                strokeDashoffset={-arc.start}
                                className={cn('cursor-pointer transition-[opacity,stroke-width]', active && active !== arc.source && 'opacity-35')}
                                onMouseEnter={() => setActive(arc.source)}
                            >
                                <title>{label(arc.source)}</title>
                            </circle>
                        ))}
                    </svg>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-muted-foreground max-w-24 text-xs leading-tight">
                            {active ? t(`carbon.sources.${active}`) : t('carbon.total')}
                        </span>
                        <span className="font-display text-lg font-semibold tabular-nums">
                            {format.emissions(active ? record.emissions[active] : record.total)}
                        </span>
                        {active && <span className="text-muted-foreground text-xs tabular-nums">{share(active)}%</span>}
                    </div>
                </div>

                <ul className="flex w-full flex-col gap-1" aria-label={t('carbon.latestTitle')}>
                    {carbonSources.map((source) => (
                        <li key={source}>
                            <button
                                type="button"
                                onMouseEnter={() => setActive(source)}
                                onMouseLeave={() => setActive(null)}
                                onFocus={() => setActive(source)}
                                onBlur={() => setActive(null)}
                                className={cn(
                                    'flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                                    active === source && 'bg-muted',
                                )}
                            >
                                <span className="size-3 shrink-0 rounded-full" style={{ background: sourceColor[source] }} aria-hidden />
                                <span className="min-w-0 flex-1 truncate">{t(`carbon.sources.${source}`)}</span>
                                <span className="shrink-0 tabular-nums">{format.emissions(record.emissions[source])}</span>
                                <span className="text-muted-foreground w-10 shrink-0 text-right tabular-nums">{share(source)}%</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

/** Colunas com o total de cada mês (últimos 12). Valor escrito só no mês mais recente; os demais aparecem ao passar o mouse. */
export function CarbonMonthlyColumns({ records }: { records: CarbonRecord[] }) {
    const format = useCarbonFormat();
    const { t } = useTranslation();
    const months = records.slice(-12);
    const max = Math.max(...months.map((r) => r.total), 1);
    const summary = months.map((r) => `${format.month(r.period, 'long')}: ${format.emissions(r.total)}`).join('; ');

    return (
        <div role="img" aria-label={`${t('carbon.monthlyTitle')}. ${summary}`}>
            <div className="flex h-48 items-end gap-1.5 border-b sm:gap-3">
                {months.map((record, index) => {
                    const latest = index === months.length - 1;
                    return (
                        <div key={record.id} className="group relative flex h-full min-w-0 flex-1 flex-col justify-end">
                            {latest && (
                                <span className="mb-1 text-center text-xs font-semibold whitespace-nowrap tabular-nums">
                                    {format.emissions(record.total)}
                                </span>
                            )}
                            <div
                                className={cn(
                                    'mx-auto w-full max-w-12 rounded-t-[4px] bg-[var(--dim-environmental)] transition-opacity',
                                    !latest && 'opacity-60 group-hover:opacity-100',
                                )}
                                style={{ height: `${Math.max((record.total / max) * 100, 1)}%` }}
                            />
                            <div
                                role="tooltip"
                                className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 rounded-md border px-3 py-2 text-xs whitespace-nowrap shadow-sm group-hover:block"
                            >
                                <p className="font-semibold">{format.month(record.period, 'long')}</p>
                                <p className="tabular-nums">{format.emissions(record.total)}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-2 flex gap-1.5 sm:gap-3">
                {months.map((record) => (
                    <span key={record.id} className="text-muted-foreground min-w-0 flex-1 truncate text-center text-xs">
                        {format.month(record.period)}
                    </span>
                ))}
            </div>
        </div>
    );
}
