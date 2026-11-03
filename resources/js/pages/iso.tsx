import { IsoAdherence } from '@/components/iso-adherence';
import ServerErrors from '@/components/server-errors';
import { Page, PageHeader } from '@/components/sostenpyme';
import { Checkbox } from '@/components/ui/checkbox';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const chapters = ['4', '5', '6', '7', '8', '9', '10'] as const;

export default function Iso() {
    const { t, tl } = useTranslation();
    const { isoRequirements, completedIsoRequirements } = useSustainability();
    const [saving, setSaving] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('iso.title'), href: '/iso' }];
    const completed = new Set(completedIsoRequirements);

    function toggle(id: string) {
        setSaving(true);
        router.post(`/iso/${encodeURIComponent(id)}/toggle`, {}, { preserveScroll: true, onFinish: () => setSaving(false) });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('iso.title')} />
            <Page>
                <PageHeader title={t('iso.title')} description={t('iso.description')} />
                <ServerErrors />

                <div className="bg-card mb-8 max-w-xl rounded-lg border p-5">
                    <IsoAdherence done={completed.size} total={isoRequirements.length} />
                </div>

                <div className="flex flex-col gap-8">
                    {chapters.map((chapter) => {
                        const items = isoRequirements.filter((r) => r.clause.split('.')[0] === chapter);
                        if (!items.length) return null;
                        return (
                            <section key={chapter}>
                                <h2 className="text-xl font-semibold">
                                    {chapter}. {t(`iso.chapters.c${chapter}`)}
                                </h2>
                                <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                    {items.map((item) => {
                                        const done = completed.has(item.id);
                                        return (
                                            <li key={item.id}>
                                                <label
                                                    className={cn(
                                                        'bg-card hover:border-foreground/30 flex h-full cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors',
                                                        done && 'bg-muted',
                                                    )}
                                                >
                                                    <Checkbox
                                                        checked={done}
                                                        disabled={saving}
                                                        onCheckedChange={() => toggle(item.id)}
                                                        className="mt-0.5"
                                                    />
                                                    <span className="flex flex-col gap-1">
                                                        <span className="text-muted-foreground text-xs">
                                                            {t('iso.clause', { clause: item.clause })}
                                                        </span>
                                                        <span className="font-medium">{tl(item.title)}</span>
                                                        <span className="text-muted-foreground text-sm">{tl(item.description)}</span>
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </section>
                        );
                    })}
                </div>

                <p className="text-muted-foreground mt-8 text-xs">{t('iso.disclaimer')}</p>
            </Page>
        </AppLayout>
    );
}
