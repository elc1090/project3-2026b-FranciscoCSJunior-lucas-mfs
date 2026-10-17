import { Page, PageHeader, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { updateDemo, useDemo } from '@/lib/demo-store';
import { type BreadcrumbItem } from '@/types';
import type { Company, CompanySize, SectorKey } from '@/types/sostenpyme';
import { Head } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const sectors: SectorKey[] = ['food', 'retail', 'services', 'manufacturing', 'tourism', 'construction', 'other'];
const sizes: CompanySize[] = ['micro', 'small', 'medium'];

export default function CompanyPage() {
    const { t } = useTranslation();
    const demo = useDemo();
    const [form, setForm] = useState<Company>(demo.company);
    const [saved, setSaved] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('company.title'), href: '/company' }];

    function set<K extends keyof Company>(key: K, value: Company[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        setSaved(false);
    }

    // Com o backend: router.put(route('company.update'), form)
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        updateDemo((state) => ({ ...state, company: form }));
        setSaved(true);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('company.title')} />
            <Page className="max-w-3xl">
                <PageHeader title={t('company.title')} description={t('company.description')} />

                <Section>
                    <form onSubmit={submit} className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('company.name')}</Label>
                            <Input id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="sector">{t('company.sector')}</Label>
                            <Select value={form.sector} onValueChange={(value) => set('sector', value as SectorKey)}>
                                <SelectTrigger id="sector">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.map((sector) => (
                                        <SelectItem key={sector} value={sector}>
                                            {t(`sector.${sector}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-muted-foreground text-sm">{t('company.sectorHint')}</p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="size">{t('company.size')}</Label>
                                <Select value={form.size} onValueChange={(value) => set('size', value as CompanySize)}>
                                    <SelectTrigger id="size">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                            <SelectItem key={size} value={size}>
                                                {t(`size.${size}`)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="workers">{t('company.workers')}</Label>
                                <Input
                                    id="workers"
                                    type="number"
                                    min={1}
                                    required
                                    value={form.workers}
                                    onChange={(e) => set('workers', Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="region">{t('company.region')}</Label>
                            <Input id="region" value={form.region} onChange={(e) => set('region', e.target.value)} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button type="submit">{t('company.save')}</Button>
                            {saved && (
                                <span role="status" className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                    <Check className="size-4" aria-hidden />
                                    {t('company.saved')}
                                </span>
                            )}
                        </div>
                    </form>
                </Section>
            </Page>
        </AppLayout>
    );
}
