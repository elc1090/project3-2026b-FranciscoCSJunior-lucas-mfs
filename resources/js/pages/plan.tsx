import ServerErrors from '@/components/server-errors';
import { DimensionTag, Page, PageHeader, SdgTags, Section, StatusBadge } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { ActionStatus, PlanAction, Question, Recommendation } from '@/types/sostenpyme';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';

const statuses: ActionStatus[] = ['pending', 'in_progress', 'done'];

function ActionEditor({ action, rec, question }: { action: PlanAction; rec: Recommendation; question: Question }) {
    const { t, tl } = useTranslation();
    const {
        data,
        setData,
        patch,
        delete: destroy,
        processing,
        recentlySuccessful,
        errors,
    } = useForm({
        owner: action.owner,
        dueDate: action.dueDate,
        indicator: action.indicator,
        status: action.status,
    });
    return (
        <li className="bg-card rounded-lg border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-3">
                        <DimensionTag dimension={question.dimension} />
                        <StatusBadge status={action.status} />
                    </div>
                    <h2 className="text-lg font-semibold">{tl(rec.title)}</h2>
                    <SdgTags sdgs={question.sdgs} />
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={processing}
                    onClick={() => destroy(`/plan/${action.id}`, { preserveScroll: true })}
                    className="text-muted-foreground"
                >
                    <Trash2 aria-hidden />
                    {t('plan.remove')}
                </Button>
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    patch(`/plan/${action.id}`, { preserveScroll: true });
                }}
            >
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor={`status-${action.id}`}>{t('plan.status')}</Label>
                        <Select value={data.status} onValueChange={(value) => setData('status', value as ActionStatus)}>
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
                        <Input id={`owner-${action.id}`} maxLength={255} value={data.owner} onChange={(e) => setData('owner', e.target.value)} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor={`due-${action.id}`}>{t('plan.dueDate')}</Label>
                        <Input id={`due-${action.id}`} type="date" value={data.dueDate} onChange={(e) => setData('dueDate', e.target.value)} />
                    </div>
                    <div className="grid gap-1.5">
                        <Label htmlFor={`indicator-${action.id}`}>{t('plan.indicator')}</Label>
                        <Input
                            id={`indicator-${action.id}`}
                            maxLength={255}
                            value={data.indicator}
                            onChange={(e) => setData('indicator', e.target.value)}
                        />
                    </div>
                </div>
                {Object.values(errors).length > 0 && (
                    <p role="alert" className="text-destructive mt-3 text-sm">
                        {Object.values(errors).join(' ')}
                    </p>
                )}
                <div className="mt-4 flex items-center gap-3">
                    <Button type="submit" disabled={processing}>
                        {t('company.save')}
                    </Button>
                    {recentlySuccessful && (
                        <span role="status" className="text-muted-foreground flex items-center gap-1.5 text-sm">
                            <Check className="size-4" />
                            {t('company.saved')}
                        </span>
                    )}
                </div>
            </form>
        </li>
    );
}

export default function Plan() {
    const { t } = useTranslation();
    const { plan, recommendations, questionOf } = useSustainability();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('plan.title'), href: '/plan' }];
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('plan.title')} />
            <Page>
                <PageHeader title={t('plan.title')} description={t('plan.description')} />
                <ServerErrors />
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
                            return rec && question ? <ActionEditor key={action.id} action={action} rec={rec} question={question} /> : null;
                        })}
                    </ul>
                )}
            </Page>
        </AppLayout>
    );
}
