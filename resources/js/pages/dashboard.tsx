import { LearnCarousel } from '@/components/learn-carousel';
import { Page, PageHeader } from '@/components/sostenpyme';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

export default function Dashboard() {
    const { t } = useTranslation();
    const { company, plan, history, complete } = useSustainability();

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('home.title'), href: '/dashboard' }];

    const steps = [
        { label: t('home.stepCompany'), href: '/company', complete: Boolean(company.name && company.region) },
        { label: t('home.stepDiagnosis'), href: '/diagnosis', complete: complete },
        { label: t('home.stepResults'), href: '/results', complete: complete },
        { label: t('home.stepPlan'), href: '/plan', complete: plan.length > 0 },
        { label: t('home.stepTracking'), href: '/tracking', complete: history.length > 1 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('home.title')} />
            <Page>
                <PageHeader
                    title={company.name}
                    description={[t(`sector.${company.sector}`), company.workers > 0 && t('home.workers', { count: company.workers }), company.region]
                        .filter(Boolean)
                        .join(', ')}
                />

                <LearnCarousel />

                <section className="mt-10">
                    <h2 className="text-xl font-semibold">{t('home.steps')}</h2>
                    <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        {steps.map((step, index) => (
                            <li key={step.href}>
                                <Link
                                    href={step.href}
                                    className="hover:border-foreground/30 flex h-full items-start gap-3 rounded-lg border p-4 transition-colors"
                                >
                                    <span
                                        className={cn(
                                            'font-display flex size-7 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                                            step.complete && 'bg-primary text-primary-foreground border-primary',
                                        )}
                                    >
                                        {step.complete ? <Check className="size-4" aria-hidden /> : index + 1}
                                    </span>
                                    <span className="text-sm">{step.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ol>
                </section>
            </Page>
        </AppLayout>
    );
}
