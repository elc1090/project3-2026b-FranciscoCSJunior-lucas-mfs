import { ScoreValue, TableScroll, Td, Th } from '@/components/admin';
import { useCarbonFormat } from '@/components/carbon-charts';
import { Page, PageHeader } from '@/components/sostenpyme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import type { AdminCompaniesProps } from '@/types/admin';
import type { SectorKey } from '@/types/sostenpyme';
import { Head, Link, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

const sectors: SectorKey[] = ['food', 'retail', 'services', 'manufacturing', 'tourism', 'construction', 'other'];

export default function AdminCompanies() {
    const { t, formatDate } = useTranslation();
    const carbon = useCarbonFormat();
    const { companies } = usePage<SharedData & AdminCompaniesProps>().props;
    const [query, setQuery] = useState('');
    const [sector, setSector] = useState<SectorKey | 'all'>('all');
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('admin.companies.title'), href: '/admin/companies' }];

    const term = query.trim().toLowerCase();
    const visible = companies.filter(
        (c) =>
            (sector === 'all' || c.sector === sector) &&
            (!term || [c.name, c.region, c.owner.name, c.owner.email].some((value) => value.toLowerCase().includes(term))),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.companies.title')} />
            <Page className="max-w-6xl">
                <PageHeader title={t('admin.companies.title')} description={t('admin.companies.description')} />

                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="search">{t('admin.companies.search')}</Label>
                        <div className="relative">
                            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
                            <Input
                                id="search"
                                type="search"
                                className="pl-9"
                                placeholder={t('admin.companies.searchPlaceholder')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2 sm:w-56">
                        <Label htmlFor="sector">{t('admin.companies.sector')}</Label>
                        <Select value={sector} onValueChange={(value) => setSector(value as SectorKey | 'all')}>
                            <SelectTrigger id="sector">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('admin.companies.allSectors')}</SelectItem>
                                {sectors.map((s) => (
                                    <SelectItem key={s} value={s}>
                                        {t(`sector.${s}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <p className="text-muted-foreground mb-3 text-sm" role="status">
                    {t('admin.companies.count', { count: visible.length })}
                </p>

                {visible.length ? (
                    <TableScroll>
                        <thead>
                            <tr>
                                <Th>{t('admin.companies.company')}</Th>
                                <Th>{t('admin.companies.sector')}</Th>
                                <Th>{t('admin.companies.region')}</Th>
                                <Th className="text-right">{t('admin.companies.score')}</Th>
                                <Th>{t('admin.companies.lastDiagnosis')}</Th>
                                <Th className="text-right">{t('admin.companies.carbon')}</Th>
                                <Th className="text-right">{t('admin.companies.iso')}</Th>
                                <Th className="text-right">{t('admin.companies.plan')}</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((c) => (
                                <tr key={c.id} className="hover:bg-muted/40">
                                    <Td className="min-w-48">
                                        <Link href={`/admin/companies/${c.id}`} className="font-medium underline-offset-4 hover:underline">
                                            {c.name}
                                        </Link>
                                        <p className="text-muted-foreground text-xs">{c.owner.email}</p>
                                    </Td>
                                    <Td className="whitespace-nowrap">
                                        {t(`sector.${c.sector}`)}
                                        <p className="text-muted-foreground text-xs">{t(`size.${c.size}`)}</p>
                                    </Td>
                                    <Td className="whitespace-nowrap">{c.region || '—'}</Td>
                                    <Td className="text-right whitespace-nowrap">
                                        <ScoreValue score={c.totalScore} empty={t('admin.companies.noDiagnosis')} />
                                    </Td>
                                    <Td className="whitespace-nowrap">{c.lastDiagnosisAt ? formatDate(c.lastDiagnosisAt) : '—'}</Td>
                                    <Td className="text-right whitespace-nowrap tabular-nums">
                                        {c.carbonLastMonth ? (
                                            <>
                                                {carbon.emissions(c.carbonLastMonth.total)}
                                                <p className="text-muted-foreground text-xs">{carbon.month(c.carbonLastMonth.period)}</p>
                                            </>
                                        ) : (
                                            '—'
                                        )}
                                    </Td>
                                    <Td className="text-right tabular-nums">{c.isoTotal ? `${Math.round((c.isoDone / c.isoTotal) * 100)}%` : '—'}</Td>
                                    <Td className="text-right whitespace-nowrap tabular-nums">
                                        {c.planDone}/{c.planTotal}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </TableScroll>
                ) : (
                    <p className="text-muted-foreground rounded-lg border p-6 text-center">{t('admin.companies.empty')}</p>
                )}
            </Page>
        </AppLayout>
    );
}
