import { ScoreValue, StatTile } from '@/components/admin';
import { Page, PageHeader, ScoreBar, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { dimensions } from '@/lib/scoring';
import { type BreadcrumbItem, type SharedData } from '@/types';
import type { AdminDashboardProps } from '@/types/admin';
import type { SectorKey } from '@/types/sostenpyme';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export default function AdminDashboard() {
    const { t, formatDate } = useTranslation();
    const { stats, averageScores, companiesBySector, recentCompanies } = usePage<SharedData & AdminDashboardProps>().props;
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('admin.overview.title'), href: '/admin' }];

    const sectors = (Object.entries(companiesBySector) as [SectorKey, number][]).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
    const maxSector = Math.max(1, ...sectors.map(([, count]) => count));
    const diagnosedPercent = stats.companies ? Math.round((stats.diagnosedCompanies / stats.companies) * 100) : 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.overview.title')} />
            <Page className="max-w-6xl">
                <PageHeader title={t('admin.overview.title')} description={t('admin.overview.description')} />

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatTile label={t('admin.overview.companies')} value={stats.companies} />
                    <StatTile
                        label={t('admin.overview.diagnosed')}
                        value={stats.diagnosedCompanies}
                        hint={t('admin.overview.diagnosedOf', { percent: diagnosedPercent })}
                    />
                    <StatTile
                        label={t('admin.overview.averageScore')}
                        value={stats.averageScore ?? '—'}
                        hint={t('admin.overview.averageScoreHint')}
                    />
                    <StatTile
                        label={t('admin.overview.users')}
                        value={stats.companyUsers}
                        hint={t('admin.overview.usersHint', { admins: stats.admins })}
                    />
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <Section title={t('admin.overview.averageByDimension')} description={t('admin.overview.averageByDimensionHint')}>
                        {averageScores ? (
                            <div className="flex flex-col gap-4">
                                {dimensions.map((dimension) => (
                                    <div key={dimension} className="flex flex-col gap-2">
                                        <ScoreBar label={t(`dimension.${dimension}`)} score={averageScores[dimension]} dimension={dimension} />
                                        {dimension === 'social' && (
                                            <>
                                                <ScoreBar sub label={t('dimension.workers')} score={averageScores.workers} dimension="social" />
                                                <ScoreBar sub label={t('dimension.community')} score={averageScores.community} dimension="social" />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{t('admin.overview.noData')}</p>
                        )}
                    </Section>

                    <Section title={t('admin.overview.bySector')}>
                        {sectors.length ? (
                            <ul className="flex flex-col gap-3">
                                {sectors.map(([sector, count]) => (
                                    <li key={sector} className="grid grid-cols-[minmax(6.5rem,9rem)_1fr_2rem] items-center gap-3">
                                        <span className="truncate">{t(`sector.${sector}`)}</span>
                                        <div className="bg-muted h-2.5 rounded-full">
                                            <div className="bg-primary h-full rounded-full" style={{ width: `${(count / maxSector) * 100}%` }} />
                                        </div>
                                        <span className="text-right tabular-nums">{count}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">{t('admin.overview.noCompanies')}</p>
                        )}
                    </Section>
                </div>

                <Section className="mt-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-semibold">{t('admin.overview.recent')}</h2>
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/admin/companies">
                                {t('admin.overview.seeAll')}
                                <ChevronRight aria-hidden />
                            </Link>
                        </Button>
                    </div>
                    {recentCompanies.length ? (
                        <ul className="divide-y">
                            {recentCompanies.map((company) => (
                                <li key={company.id}>
                                    <Link
                                        href={`/admin/companies/${company.id}`}
                                        className="hover:bg-muted/60 -mx-2 flex items-center gap-4 rounded-md px-2 py-3"
                                    >
                                        <div className="w-0 min-w-0 flex-1">
                                            <p className="truncate font-medium">{company.name}</p>
                                            <p className="text-muted-foreground truncate text-sm">
                                                {t(`sector.${company.sector}`)} · {company.region} · {formatDate(company.createdAt)}
                                            </p>
                                        </div>
                                        <ScoreValue score={company.totalScore} empty={t('admin.companies.noDiagnosis')} />
                                        <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">{t('admin.overview.noCompanies')}</p>
                    )}
                </Section>
            </Page>
        </AppLayout>
    );
}
