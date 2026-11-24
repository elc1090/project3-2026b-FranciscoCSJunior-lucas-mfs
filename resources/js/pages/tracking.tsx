import { CarbonSourcePie, useCarbonFormat } from '@/components/carbon-charts';
import { IsoAdherence } from '@/components/iso-adherence';
import { DimensionBars, DimensionTag, dimStyle, Page, PageHeader, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { areaDimension, areas } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export default function Tracking() {
    const { t, tl, formatDate } = useTranslation();
    const {
        history,
        plan,
        completedGoals,
        pathGoals,
        totalScore: total,
        priorities,
        complete,
        carbonRecords,
        isoRequirements,
        completedIsoRequirements,
    } = useSustainability();
    const carbonFormat = useCarbonFormat();
    const latestCarbon = carbonRecords.at(-1);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('tracking.title'), href: '/tracking' }];
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const current = sorted.at(-1);
    const previous = sorted.at(-2);
    const done = plan.filter((a) => a.status === 'done').length;
    const topPriorities = priorities.slice(0, 3);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('tracking.title')} />
            <Page>
                <PageHeader
                    title={t('tracking.title')}
                    description={t('tracking.description')}
                    actions={
                        <Button asChild>
                            <Link href="/diagnosis">{t('tracking.repeat')}</Link>
                        </Button>
                    }
                />

                <div className="grid items-start gap-5 lg:grid-cols-2">
                    <div className="flex flex-col gap-5">
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

                        <Section title={t('iso.title')}>
                            <IsoAdherence done={completedIsoRequirements.length} total={isoRequirements.length} />
                            <Button asChild variant="outline" className="mt-6">
                                <Link href="/iso">{t('iso.seeMore')}</Link>
                            </Button>
                        </Section>
                    </div>

                    <div className="flex flex-col gap-5">
                        <Section title={t('carbon.title')} description={latestCarbon ? carbonFormat.month(latestCarbon.period, 'long') : undefined}>
                            {latestCarbon ? (
                                <>
                                    <CarbonSourcePie record={latestCarbon} />
                                    <Button asChild variant="outline" className="mt-6">
                                        <Link href="/carbon">{t('carbon.seeMore')}</Link>
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <p>{t('carbon.empty')}</p>
                                    <Button asChild className="mt-4">
                                        <Link href="/carbon">{t('carbon.goTo')}</Link>
                                    </Button>
                                </>
                            )}
                        </Section>

                        {topPriorities.length > 0 && (
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
                        )}

                        <Section title={t('home.planTitle')}>
                            <p className="font-medium">{t('home.planSummary', { done, total: plan.length })}</p>
                            <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                                <div
                                    className="bg-primary h-full rounded-full"
                                    style={{ width: `${plan.length ? (done / plan.length) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="text-muted-foreground mt-3 text-sm">
                                {t('home.goalsSummary', { done: completedGoals.length, total: pathGoals.length })}
                            </p>
                            <Button asChild variant="outline" className="mt-4">
                                <Link href="/plan">{t('home.seePlan')}</Link>
                            </Button>
                        </Section>
                    </div>
                </div>

                <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.6fr_1fr]">
                    <Section title={t('tracking.comparison')}>
                        {current && previous ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[28rem] text-left">
                                    <thead className="text-muted-foreground text-sm">
                                        <tr className="border-b">
                                            <th className="py-2 pr-4 font-normal" />
                                            <th className="py-2 pr-4 text-right font-normal">
                                                {t('tracking.previous', { date: formatDate(previous.date) })}
                                            </th>
                                            <th className="py-2 pr-4 text-right font-normal">
                                                {t('tracking.current', { date: formatDate(current.date) })}
                                            </th>
                                            <th className="py-2 text-right font-normal" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {areas.map((area) => {
                                            const before = previous.scores[area];
                                            const now = current.scores[area];
                                            const diff = now - before;
                                            const Icon = diff > 0 ? ArrowUp : diff < 0 ? ArrowDown : Minus;
                                            return (
                                                <tr key={area} className="border-b last:border-0" style={dimStyle(areaDimension(area))}>
                                                    <th scope="row" className="py-3 pr-4 font-medium">
                                                        <span className="flex items-center gap-2">
                                                            <span className="size-2.5 rounded-full bg-[var(--dim)]" aria-hidden />
                                                            {t(`dimension.${area}`)}
                                                        </span>
                                                    </th>
                                                    <td className="text-muted-foreground py-3 pr-4 text-right tabular-nums">{before}</td>
                                                    <td className="font-display py-3 pr-4 text-right text-lg font-semibold tabular-nums">{now}</td>
                                                    <td className="py-3 text-right">
                                                        <span
                                                            className={cn(
                                                                'inline-flex items-center gap-1 text-sm font-medium tabular-nums',
                                                                diff > 0 && 'text-[var(--dim-environmental)]',
                                                                diff < 0 && 'text-destructive',
                                                                diff === 0 && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            <Icon className="size-4" aria-hidden />
                                                            {diff > 0 ? `+${diff}` : diff}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{t('tracking.noPrevious')}</p>
                        )}
                    </Section>

                    <Section title={t('tracking.history')}>
                        {sorted.length ? (
                            <ul className="flex flex-col gap-2">
                                {[...sorted].reverse().map((snapshot) => (
                                    <li key={snapshot.id} className="flex justify-between border-b pb-2 last:border-0">
                                        <span>{formatDate(snapshot.date)}</span>
                                        <span className="font-display font-semibold tabular-nums">{snapshot.total}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">{t('tracking.noPrevious')}</p>
                        )}
                    </Section>
                </div>
            </Page>
        </AppLayout>
    );
}
