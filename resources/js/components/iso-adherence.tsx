import { useTranslation } from '@/i18n';

/** Percentual de requisitos da ISO 14001 marcados como cumpridos. */
export function IsoAdherence({ done, total }: { done: number; total: number }) {
    const { t } = useTranslation();
    const percent = total ? Math.round((done / total) * 100) : 0;
    return (
        <div>
            <div className="flex items-baseline gap-3">
                <span className="font-display text-5xl leading-none font-semibold tabular-nums">{percent}%</span>
                <span className="text-muted-foreground">{t('iso.adherence')}</span>
            </div>
            <div
                role="meter"
                aria-label={t('iso.adherence')}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-muted mt-4 h-3 overflow-hidden rounded-full"
            >
                <div className="h-full rounded-full bg-[var(--dim-environmental)]" style={{ width: `${percent}%` }} />
            </div>
            <p className="text-muted-foreground mt-2 text-sm">{t('iso.progress', { done, total })}</p>
        </div>
    );
}
