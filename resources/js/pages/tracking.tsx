import { dimStyle, Page, PageHeader, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { useDemo } from '@/lib/demo-store';
import { areaDimension, areas } from '@/lib/scoring';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export default function Tracking() {
    const { t, formatDate } = useTranslation();
    const { history, plan } = useDemo();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('tracking.title'), href: '/tracking' }];
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    const current = sorted.at(-1);
    const previous = sorted.at(-2);
    const done = plan.filter((a) => a.status === 'done').length;

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

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                    <Section title={t('tracking.actions')}>
                        <p className="font-display text-4xl font-semibold tabular-nums">{t('tracking.actionsDone', { done, total: plan.length })}</p>
                        <div className="bg-muted mt-4 h-2 overflow-hidden rounded-full">
                            <div className="bg-primary h-full rounded-full" style={{ width: `${plan.length ? (done / plan.length) * 100 : 0}%` }} />
                        </div>
                    </Section>
                    <Section title={t('tracking.history')}>
                        <ul className="flex flex-col gap-2">
                            {[...sorted].reverse().map((snapshot) => {
                                const avg = Math.round(Object.values(snapshot.scores).reduce((s, v) => s + v, 0) / areas.length);
                                return (
                                    <li key={snapshot.date} className="flex justify-between border-b pb-2 last:border-0">
                                        <span>{formatDate(snapshot.date)}</span>
                                        <span className="font-display font-semibold tabular-nums">{avg}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </Section>
                </div>
            </Page>
        </AppLayout>
    );
}
