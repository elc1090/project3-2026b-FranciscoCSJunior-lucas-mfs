import ServerErrors from '@/components/server-errors';
import { DimensionBars, DimensionTag, Page, PageHeader, SdgTags, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { areaDimension, PRIORITY_THRESHOLD } from '@/lib/scoring';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';

export default function Results() {
    const { t, tl } = useTranslation();
    const { plan, totalScore: total, priorities, questionOf, complete } = useSustainability();
    const [adding, setAdding] = useState<string | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('results.title'), href: '/results' }];
    const inPlan = new Set(plan.map((a) => a.recommendationId));

    function addToPlan(recommendationId: string) {
        setAdding(recommendationId);
        router.post('/plan', { recommendationId }, { preserveScroll: true, onFinish: () => setAdding(null) });
    }

    if (!complete) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title={t('results.title')} />
                <Page>
                    <PageHeader title={t('results.title')} />
                    <ServerErrors />
                    <Section>
                        <p>{t('results.incomplete')}</p>
                        <Button asChild className="mt-4">
                            <Link href="/diagnosis">{t('results.goToDiagnosis')}</Link>
                        </Button>
                    </Section>
                </Page>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('results.title')} />
            <Page>
                <PageHeader title={t('results.title')} description={t('results.description', { threshold: PRIORITY_THRESHOLD })} />
                <ServerErrors />

                <div className="grid gap-5 lg:grid-cols-[14rem_1fr]">
                    <Section className="flex flex-col justify-center">
                        <p className="text-muted-foreground text-sm">{t('results.total')}</p>
                        <p className="font-display mt-1 text-7xl leading-none font-semibold tabular-nums">{total.percent}</p>
                        <p className="text-muted-foreground mt-2 text-sm">{t('results.points', { points: total.points, max: total.max })}</p>
                    </Section>
                    <Section>
                        <DimensionBars />
                        <p className="text-muted-foreground mt-6 text-sm">{t('results.socialNote')}</p>
                    </Section>
                </div>

                <section className="mt-10">
                    <h2 className="text-2xl font-semibold">{t('results.prioritiesTitle')}</h2>
                    <p className="text-muted-foreground mt-1">{t('results.prioritiesDescription')}</p>

                    <div className="mt-6 flex flex-col gap-8">
                        {priorities.map((priority) => (
                            <div key={priority.area}>
                                <div className="mb-3 flex items-baseline gap-3">
                                    <DimensionTag dimension={areaDimension(priority.area)} label={t(`dimension.${priority.area}`)} />
                                    <span className="font-display text-muted-foreground tabular-nums">{priority.score}</span>
                                </div>
                                <ul className="flex flex-col gap-3">
                                    {priority.recommendations.map((rec) => {
                                        const added = inPlan.has(rec.id);
                                        return (
                                            <li
                                                key={rec.id}
                                                className="bg-card flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-start sm:justify-between"
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <h3 className="text-lg font-semibold">{tl(rec.title)}</h3>
                                                    <p className="text-muted-foreground max-w-[62ch]">{tl(rec.description)}</p>
                                                    <SdgTags sdgs={questionOf(rec)?.sdgs ?? []} />
                                                </div>
                                                <Button
                                                    variant={added ? 'secondary' : 'default'}
                                                    disabled={added || adding !== null}
                                                    onClick={() => addToPlan(rec.id)}
                                                    className="shrink-0"
                                                >
                                                    {added ? <Check aria-hidden /> : <Plus aria-hidden />}
                                                    {added ? t('results.inPlan') : t('results.addToPlan')}
                                                </Button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            </Page>
        </AppLayout>
    );
}
