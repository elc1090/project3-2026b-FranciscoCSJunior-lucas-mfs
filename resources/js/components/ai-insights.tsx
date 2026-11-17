import { DimensionTag } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import { areaDimension } from '@/lib/scoring';
import { router, usePage } from '@inertiajs/react';
import { LoaderCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

type AiError = 'unavailable' | 'noDiagnosis' | 'tooMany' | 'quota' | 'failed';

/** Bloco "Recomendações com IA": gera no servidor (Gemini) e mostra a última análise salva no idioma atual. */
export function AiInsights() {
    const { t, locale, formatDate } = useTranslation();
    const { aiEnabled, aiInsights } = useSustainability();
    const error = usePage().props.errors.ai as AiError | undefined;
    const [generating, setGenerating] = useState(false);
    const insight = aiInsights[locale];

    function generate() {
        router.post('/results/ai', { locale }, { preserveScroll: true, onStart: () => setGenerating(true), onFinish: () => setGenerating(false) });
    }

    return (
        <section className="bg-card mt-5 rounded-lg border p-5 md:p-6" aria-busy={generating}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 className="flex items-center gap-2 text-xl font-semibold">
                        <Sparkles className="text-primary size-5" aria-hidden />
                        {t('ai.title')}
                    </h2>
                    <p className="text-muted-foreground mt-1 max-w-[62ch]">{t('ai.description')}</p>
                </div>
                {aiEnabled && (
                    <Button onClick={generate} disabled={generating} variant={insight ? 'outline' : 'default'} className="shrink-0">
                        {generating ? (
                            <LoaderCircle className="animate-spin" aria-hidden />
                        ) : insight ? (
                            <RefreshCw aria-hidden />
                        ) : (
                            <Sparkles aria-hidden />
                        )}
                        {insight ? t('ai.regenerate') : t('ai.generate')}
                    </Button>
                )}
            </div>

            {!aiEnabled && <p className="text-muted-foreground mt-4 text-sm">{t('ai.errors.unavailable')}</p>}
            {generating && (
                <p className="text-muted-foreground mt-4 text-sm" role="status">
                    {t('ai.generating')}
                </p>
            )}
            {error && !generating && (
                <p role="alert" className="text-destructive border-destructive/30 mt-4 rounded-md border p-3 text-sm">
                    {t(`ai.errors.${error}`)}
                </p>
            )}

            {insight && (
                <div className="mt-6">
                    {insight.outdated && <p className="bg-muted mb-4 rounded-md p-3 text-sm">{t('ai.outdated')}</p>}
                    <p className="max-w-[70ch] text-base leading-relaxed">{insight.summary}</p>
                    <ol className="mt-5 grid gap-3 md:grid-cols-2">
                        {insight.actions.map((action, index) => (
                            <li key={index} className="flex flex-col gap-2 rounded-lg border p-4">
                                <DimensionTag dimension={areaDimension(action.area)} label={t(`dimension.${action.area}`)} />
                                <h3 className="font-semibold">{action.title}</h3>
                                <p className="text-muted-foreground text-sm">{action.description}</p>
                                {action.firstStep && (
                                    <p className="mt-auto pt-1 text-sm">
                                        <span className="font-medium">{t('ai.firstStep')}:</span> {action.firstStep}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ol>
                    <p className="text-muted-foreground mt-4 text-xs">
                        {t('ai.generatedAt', { date: formatDate(insight.generatedAt) })} · {t('ai.disclaimer')}
                    </p>
                </div>
            )}
            {aiEnabled && <p className="text-muted-foreground mt-3 text-xs">{t('ai.privacy')}</p>}
        </section>
    );
}
