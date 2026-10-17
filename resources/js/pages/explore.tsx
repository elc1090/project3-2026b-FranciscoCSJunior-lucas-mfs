import { DimensionTag, Page, PageHeader } from '@/components/sostenpyme';
import { questions, sdgs } from '@/data/catalog';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

export default function Explore() {
    const { t, tl } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('explore.title'), href: '/explore' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('explore.title')} />
            <Page>
                <PageHeader title={t('explore.title')} description={t('explore.description')} />

                <ul className="grid gap-4 md:grid-cols-2">
                    {sdgs.map((sdg) => {
                        const related = questions.filter((q) => q.sdgs.includes(sdg.number));
                        const dims = [...new Set(related.map((q) => q.dimension))];
                        return (
                            <li key={sdg.number} className="bg-card flex gap-4 rounded-lg border p-5">
                                <span className="font-display text-muted-foreground/60 w-10 shrink-0 text-4xl leading-none font-semibold tabular-nums">
                                    {sdg.number}
                                </span>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-lg leading-tight font-semibold">{tl(sdg.title)}</h2>
                                    <p className="text-muted-foreground">{tl(sdg.description)}</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                                        <span className="text-muted-foreground">
                                            {related.length === 0
                                                ? t('explore.noRelated')
                                                : related.length === 1
                                                  ? t('explore.relatedOne')
                                                  : t('explore.related', { count: related.length })}
                                        </span>
                                        {dims.map((d) => (
                                            <DimensionTag key={d} dimension={d} />
                                        ))}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </Page>
        </AppLayout>
    );
}
