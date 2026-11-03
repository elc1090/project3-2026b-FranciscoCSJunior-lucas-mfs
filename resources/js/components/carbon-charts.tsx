// Gráficos da pegada de carbono. Uma única cor (a da dimensão Ambiental): as barras já têm
// o nome da fonte/mês escrito ao lado, então a cor não precisa identificar categorias.
import { useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';
import type { CarbonRecord, CarbonSource } from '@/types/sostenpyme';

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

/** Barras horizontais: emissões de um mês por fonte, da maior para a menor. */
export function CarbonSourceBars({ record }: { record: CarbonRecord }) {
    const { t } = useTranslation();
    const format = useCarbonFormat();
    const rows = carbonSources.map((source) => ({ source, value: record.emissions[source] })).sort((a, b) => b.value - a.value);
    const max = Math.max(...rows.map((r) => r.value), 1);

    return (
        <ul className="flex flex-col gap-3" style={{ '--bar': 'var(--dim-environmental)' } as React.CSSProperties}>
            {rows.map(({ source, value }) => {
                const share = record.total > 0 ? Math.round((value / record.total) * 100) : 0;
                return (
                    <li key={source} className="flex flex-col gap-1.5" title={`${t(`carbon.sources.${source}`)}: ${format.emissions(value)} (${share}%)`}>
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate">{t(`carbon.sources.${source}`)}</span>
                            <span className="shrink-0 tabular-nums">
                                {format.emissions(value)} <span className="text-muted-foreground">({share}%)</span>
                            </span>
                        </div>
                        <div className="bg-muted h-2.5 overflow-hidden rounded-full">
                            <div className="h-full rounded-full bg-[var(--bar)]" style={{ width: `${(value / max) * 100}%` }} />
                        </div>
                    </li>
                );
            })}
        </ul>
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
                        <div key={record.id} className="group relative flex h-full flex-1 flex-col justify-end">
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
                    <span key={record.id} className="text-muted-foreground flex-1 truncate text-center text-xs">
                        {format.month(record.period)}
                    </span>
                ))}
            </div>
        </div>
    );
}
