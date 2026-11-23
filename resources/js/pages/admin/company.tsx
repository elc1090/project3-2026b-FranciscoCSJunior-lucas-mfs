import { ScoreValue } from '@/components/admin';
import { CarbonMonthlyColumns, CarbonSourcePie } from '@/components/carbon-charts';
import { IsoAdherence } from '@/components/iso-adherence';
import { DimensionBars, Page, PageHeader, Section, StatusBadge } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { AdminCompanyExtraProps } from '@/types/admin';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Eye } from 'lucide-react';

/** Detalhe de uma empresa, somente leitura. Recebe os mesmos props das páginas da empresa (+ dono). */
export default function AdminCompany() {
    const { t, tl, formatDate } = useTranslation();
    const { company, complete, totalScore, history, carbonRecords, isoRequirements, completedIsoRequirements, plan, recommendations } =
        useSustainability();
    const { companyId, owner } = usePage<AdminCompanyExtraProps & Record<string, unknown>>().props;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: t('admin.companies.title'), href: '/admin/companies' },
        { title: company.name, href: `/admin/companies/${companyId}` },
    ];

    const latestCarbon = carbonRecords.at(-1);
    const doneIso = isoRequirements.filter((r) => completedIsoRequirements.includes(r.id));
    const donePlan = plan.filter((a) => a.status === 'done').length;
    const details = [
        t(`sector.${company.sector}`),
        t(`size.${company.size}`),
        t('admin.company.workers', { count: company.workers }),
        company.region,
    ].filter(Boolean);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={company.name} />
            <Page className="max-w-6xl">
                <Button asChild variant="ghost" size="sm" className="mb-4 -ml-3">
                    <Link href="/admin/companies">
                        <ArrowLeft aria-hidden />
                        {t('admin.company.back')}
                    </Link>
                </Button>

                <PageHeader title={company.name} description={details.join(' · ')} />

                <p className="bg-muted text-muted-foreground mb-5 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                    <Eye className="size-4 shrink-0" aria-hidden />
                    {t('admin.company.readOnly')}
                </p>

                <Section className="mb-5">
                    <dl className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <dt className="text-muted-foreground text-sm">{t('admin.company.owner')}</dt>
                            <dd className="font-medium">{owner.name}</dd>
                        </div>
                        <div className="min-w-0">
                            <dt className="text-muted-foreground text-sm">{t('admin.users.email')}</dt>
                            <dd className="truncate font-medium">{owner.email}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground text-sm">{t('admin.company.lastLogin')}</dt>
                            <dd className="font-medium">{owner.lastLoginAt ? formatDate(owner.lastLoginAt) : t('admin.never')}</dd>
                        </div>
                    </dl>
                </Section>

                <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                    <Section title={t('admin.company.scores')}>
                        {complete ? (
                            <div className="grid gap-6 xl:grid-cols-[7rem_1fr]">
                                <div>
                                    <p className="text-muted-foreground text-sm">{t('admin.company.total')}</p>
                                    <p className="font-display mt-1 text-6xl leading-none font-semibold tabular-nums">{totalScore.percent}</p>
                                </div>
                                <DimensionBars />
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{t('admin.company.noDiagnosis')}</p>
                        )}
                    </Section>

                    <Section title={t('admin.company.history')}>
                        {history.length ? (
                            <ol className="divide-y">
                                {[...history].reverse().map((snapshot) => (
                                    <li key={snapshot.id} className="flex items-center justify-between py-2.5">
                                        <span>{formatDate(snapshot.date)}</span>
                                        <ScoreValue score={snapshot.total} empty="—" />
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="text-muted-foreground">{t('admin.company.noDiagnosis')}</p>
                        )}
                    </Section>
                </div>

                <Section title={t('admin.company.carbon')} className="mt-5">
                    {latestCarbon ? (
                        <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
                            <CarbonSourcePie record={latestCarbon} />
                            <CarbonMonthlyColumns records={carbonRecords} />
                        </div>
                    ) : (
                        <p className="text-muted-foreground">{t('admin.company.noCarbon')}</p>
                    )}
                </Section>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                    <Section title={t('admin.company.iso')}>
                        <IsoAdherence done={doneIso.length} total={isoRequirements.length} />
                        {doneIso.length > 0 && (
                            <>
                                <h3 className="text-muted-foreground mt-5 mb-2 text-sm font-medium">{t('admin.company.isoDone')}</h3>
                                <ul className="flex flex-col gap-1.5 text-sm">
                                    {doneIso.map((requirement) => (
                                        <li key={requirement.id} className="flex gap-2">
                                            <span className="text-muted-foreground w-10 shrink-0 tabular-nums">{requirement.clause}</span>
                                            <span>{tl(requirement.title)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Section>

                    <Section
                        title={t('admin.company.plan')}
                        description={plan.length ? t('admin.company.planDone', { done: donePlan, total: plan.length }) : undefined}
                    >
                        {plan.length ? (
                            <ul className="flex flex-col gap-3">
                                {plan.map((action) => {
                                    const recommendation = recommendations.find((r) => r.id === action.recommendationId);
                                    return (
                                        <li key={action.id} className="rounded-md border p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="font-medium">{recommendation ? tl(recommendation.title) : action.recommendationId}</p>
                                                <StatusBadge status={action.status} />
                                            </div>
                                            {(action.owner || action.dueDate) && (
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {[
                                                        action.owner && t('admin.company.responsible', { owner: action.owner }),
                                                        action.dueDate && t('admin.company.due', { date: formatDate(action.dueDate) }),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">{t('admin.company.noPlan')}</p>
                        )}
                    </Section>
                </div>
            </Page>
        </AppLayout>
    );
}
