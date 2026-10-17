import { DimensionTag, Page, PageHeader, SdgTags, Section, StatusBadge } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { recommendations } from '@/data/catalog';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { updateDemo, useDemo } from '@/lib/demo-store';
import { questionOf } from '@/lib/scoring';
import { type BreadcrumbItem } from '@/types';
import type { ActionStatus, PlanAction } from '@/types/sostenpyme';
import { Head, Link } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';

const statuses: ActionStatus[] = ['pending', 'in_progress', 'done'];

export default function Plan() {
    const { t, tl } = useTranslation();
    const { plan } = useDemo();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('plan.title'), href: '/plan' }];

    // Com o backend: router.patch(route('plan.update', action.id), changes)
    function update(id: string, changes: Partial<PlanAction>) {
        updateDemo((state) => ({ ...state, plan: state.plan.map((a) => (a.id === id ? { ...a, ...changes } : a)) }));
    }

    // Com o backend: router.delete(route('plan.destroy', action.id))
    function remove(id: string) {
        updateDemo((state) => ({ ...state, plan: state.plan.filter((a) => a.id !== id) }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('plan.title')} />
            <Page>
                <PageHeader title={t('plan.title')} description={t('plan.description')} />

                {plan.length === 0 ? (
                    <Section>
                        <p>{t('plan.empty')}</p>
                        <Button asChild className="mt-4">
                            <Link href="/results">{t('plan.goToResults')}</Link>
                        </Button>
                    </Section>
                ) : (
                    <ul className="flex flex-col gap-4">
                        {plan.map((action) => {
                            const rec = recommendations.find((r) => r.id === action.recommendationId);
                            const question = rec && questionOf(rec);
                            if (!rec || !question) return null;
                            return (
                                <li key={action.id} className="bg-card rounded-lg border p-5">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <DimensionTag dimension={question.dimension} />
                                                <StatusBadge status={action.status} />
                                            </div>
                                            <h2 className="text-lg font-semibold">{tl(rec.title)}</h2>
                                            <SdgTags sdgs={question.sdgs} />
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => remove(action.id)} className="text-muted-foreground">
                                            <Trash2 aria-hidden />
                                            {t('plan.remove')}
                                        </Button>
                                    </div>

                                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`status-${action.id}`}>{t('plan.status')}</Label>
                                            <Select
                                                value={action.status}
                                                onValueChange={(value) => update(action.id, { status: value as ActionStatus })}
                                            >
                                                <SelectTrigger id={`status-${action.id}`}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {t(`status.${status}`)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`owner-${action.id}`}>{t('plan.owner')}</Label>
                                            <Input
                                                id={`owner-${action.id}`}
                                                value={action.owner}
                                                onChange={(e) => update(action.id, { owner: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`due-${action.id}`}>{t('plan.dueDate')}</Label>
                                            <Input
                                                id={`due-${action.id}`}
                                                type="date"
                                                value={action.dueDate}
                                                onChange={(e) => update(action.id, { dueDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label htmlFor={`indicator-${action.id}`}>{t('plan.indicator')}</Label>
                                            <Input
                                                id={`indicator-${action.id}`}
                                                value={action.indicator}
                                                onChange={(e) => update(action.id, { indicator: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </Page>
        </AppLayout>
    );
}
