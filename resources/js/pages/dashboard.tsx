import { DimensionBars, DimensionTag, Page, PageHeader, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { areaDimension } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function Dashboard() {
    const { t, tl } = useTranslation();
    const { company, plan, completedGoals, history, pathGoals, totalScore: total, priorities, complete } = useSustainability();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('home.title'), href: '/dashboard' }];
    const topPriorities = priorities.slice(0, 3);
    const done = plan.filter((a) => a.status === 'done').length;

    const steps = [
        { label: t('home.stepCompany'), href: '/company', complete: Boolean(company.name && company.region) },
        { label: t('home.stepDiagnosis'), href: '/diagnosis', complete: complete },
        { label: t('home.stepResults'), href: '/results', complete: complete },
        { label: t('home.stepPlan'), href: '/plan', complete: plan.length > 0 },
        { label: t('home.stepTracking'), href: '/tracking', complete: history.length > 1 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('home.title')} />
            <Page>
                <PageHeader
                    title={company.name}
                    description={[t(`sector.${company.sector}`), company.workers > 0 && t('home.workers', { count: company.workers }), company.region]
                        .filter(Boolean)
                        .join(', ')}
                />

                <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <Section title={t('home.scoresTitle')}>
                        {!complete ? (
                            <>
                                <p>{t('results.incomplete')}</p>
                                <Button asChild className="mt-4">
                                    <Link href="/diagnosis">{t('results.goToDiagnosis')}</Link>
                                </Button>
                            </>
                        ) : (
                            <>
                                <div className="mb-6 flex items-baseline gap-3">
                                    <span className="font-display text-6xl leading-none font-semibold tabular-nums">{total.percent}</span>
                                    <span className="text-muted-foreground">
                                        {t('results.total')}, {t('results.points', { points: total.points, max: total.max })}
                                    </span>
                                </div>
                                <DimensionBars />
                                <Button asChild variant="outline" className="mt-6">
                                    <Link href="/results">{t('home.seeResults')}</Link>
                                </Button>
                            </>
                        )}
                    </Section>

                    <div className="flex flex-col gap-5">
                        <Section title={t('home.prioritiesTitle')}>
                            <ul className="flex flex-col gap-4">
                                {topPriorities.map((priority) => (
                                    <li key={priority.area} className="flex flex-col gap-1">
                                        <DimensionTag
                                            dimension={areaDimension(priority.area)}
                                            label={`${t(`dimension.${priority.area}`)} ${priority.score}`}
                                        />
                                        {priority.recommendations[0] && <span>{tl(priority.recommendations[0].title)}</span>}
                                    </li>
                                ))}
                            </ul>
                        </Section>

                        <Section title={t('home.planTitle')}>
                            <p className="font-medium">{t('home.planSummary', { done, total: plan.length })}</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {t('home.goalsSummary', { done: completedGoals.length, total: pathGoals.length })}
                            </p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href="/plan">{t('home.seePlan')}</Link>
                            </Button>
                        </Section>
                    </div>
                </div>

                <section className="mt-10">
                    <h2 className="text-xl font-semibold">{t('home.steps')}</h2>
                    <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {steps.map((step, index) => (
                            <li key={step.href}>
                                <Link
                                    href={step.href}
                                    className="hover:border-foreground/30 flex h-full items-start gap-3 rounded-lg border p-4 transition-colors"
                                >
                                    <span
                                        className={cn(
                                            'font-display flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                                            step.complete && 'bg-primary text-primary-foreground border-primary',
                                        )}
                                    >
                                        {step.complete ? <Check className="size-4" aria-hidden /> : index + 1}
                                    </span>
                                    <span className="text-sm">{step.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </section>
            </Page>
        </AppLayout>
    );
}
