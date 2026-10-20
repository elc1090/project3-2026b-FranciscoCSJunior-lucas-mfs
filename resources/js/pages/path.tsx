import ServerErrors from '@/components/server-errors';
import { DimensionTag, Page, PageHeader } from '@/components/sostenpyme';
import { Checkbox } from '@/components/ui/checkbox';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

import { useState } from 'react';

const levels = [1, 2, 3] as const;

export default function Path() {
    const { t, tl } = useTranslation();
    const { completedGoals, pathGoals } = useSustainability();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('path.title'), href: '/path' }];
    const completed = new Set(completedGoals);
    const [saving, setSaving] = useState(false);

    function toggle(goalId: string) {
        setSaving(true);
        router.post(`/goals/${encodeURIComponent(goalId)}/toggle`, {}, { preserveScroll: true, onFinish: () => setSaving(false) });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('path.title')} />
            <Page>
                <PageHeader title={t('path.title')} description={t('path.description')} />
                <ServerErrors />
                <p className="mb-8 font-medium">{t('path.progress', { done: completed.size, total: pathGoals.length })}</p>

                <ol className="relative flex flex-col gap-10 border-l-2 pl-6 md:pl-8">
                    {levels.map((level) => {
                        const goals = pathGoals.filter((g) => g.level === level);
                        const levelDone = goals.every((g) => completed.has(g.id));
                        return (
                            <li key={level} className="relative">
                                <span
                                    aria-hidden
                                    className={cn(
                                        'bg-background absolute top-1.5 -left-[calc(1.5rem+7px)] size-3 rounded-full border-2 md:-left-[calc(2rem+7px)]',
                                        levelDone && 'bg-foreground border-foreground',
                                    )}
                                />
                                <h2 className="text-xl font-semibold">
                                    {t('path.level', { level })}: {t(`path.level${level}`)}
                                </h2>
                                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {goals.map((goal) => {
                                        const done = completed.has(goal.id);
                                        return (
                                            <li key={goal.id}>
                                                <label
                                                    className={cn(
                                                        'bg-card hover:border-foreground/30 flex h-full cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                                                        done && 'bg-muted',
                                                    )}
                                                >
                                                    <Checkbox
                                                        disabled={saving}
                                                        checked={done}
                                                        onCheckedChange={() => toggle(goal.id)}
                                                        className="mt-0.5"
                                                    />
                                                    <span className="flex flex-col gap-1.5">
                                                        <span>{tl(goal.title)}</span>
                                                        <DimensionTag dimension={goal.dimension} />
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </li>
                        );
                    })}
                </ol>
            </Page>
        </AppLayout>
    );
}
