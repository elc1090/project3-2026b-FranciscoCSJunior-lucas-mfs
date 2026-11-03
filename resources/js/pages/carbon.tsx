import { CarbonMonthlyColumns, CarbonSourceBars, useCarbonFormat } from '@/components/carbon-charts';
import ServerErrors from '@/components/server-errors';
import { Page, PageHeader, Section } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSustainability } from '@/hooks/use-sustainability';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import type { CarbonInputs } from '@/types/sostenpyme';
import { Head, router, useForm } from '@inertiajs/react';
import { Check, Trash2 } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

const fields: (keyof CarbonInputs)[] = ['electricityKwh', 'naturalGasM3', 'lpgKg', 'dieselL', 'gasolineL'];

function currentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function Carbon() {
    const { t } = useTranslation();
    const format = useCarbonFormat();
    const { carbonRecords } = useSustainability();
    const [saved, setSaved] = useState(false);
    const { data, setData, post, processing } = useForm<Record<'period' | keyof CarbonInputs, string>>({
        period: currentMonth(),
        electricityKwh: '',
        naturalGasM3: '',
        lpgKg: '',
        dieselL: '',
        gasolineL: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [{ title: t('carbon.title'), href: '/carbon' }];
    const latest = carbonRecords.at(-1);

    // Ao escolher um mês já registrado, o formulário mostra os valores salvos para editar.
    function selectPeriod(period: string) {
        const existing = carbonRecords.find((r) => r.period === period);
        setData({
            period,
            ...Object.fromEntries(fields.map((f) => [f, existing && existing.inputs[f] ? String(existing.inputs[f]) : ''])),
        } as typeof data);
        setSaved(false);
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/carbon', { preserveScroll: true, onSuccess: () => setSaved(true) });
    };

    function remove(id: string) {
        router.delete(`/carbon/${id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('carbon.title')} />
            <Page>
                <PageHeader title={t('carbon.title')} description={t('carbon.description')} />
                <ServerErrors />

                <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                    <Section title={t('carbon.formTitle')} description={t('carbon.formHint')}>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="period">{t('carbon.period')}</Label>
                                <Input
                                    id="period"
                                    type="month"
                                    required
                                    max={currentMonth()}
                                    value={data.period}
                                    onChange={(e) => selectPeriod(e.target.value)}
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {fields.map((field) => (
                                    <div key={field} className="grid gap-2">
                                        <Label htmlFor={field}>{t(`carbon.${field}`)}</Label>
                                        <Input
                                            id={field}
                                            type="number"
                                            min={0}
                                            step="any"
                                            inputMode="decimal"
                                            placeholder="0"
                                            value={data[field]}
                                            onChange={(e) => {
                                                setData(field, e.target.value);
                                                setSaved(false);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {t('carbon.save')}
                                </Button>
                                {saved && (
                                    <span role="status" className="text-muted-foreground flex items-center gap-1.5 text-sm">
                                        <Check className="size-4" aria-hidden />
                                        {t('carbon.saved')}
                                    </span>
                                )}
                            </div>
                        </form>
                    </Section>

                    <Section title={t('carbon.latestTitle')} description={latest ? format.month(latest.period, 'long') : undefined}>
                        {latest ? (
                            <>
                                <p className="font-display text-5xl leading-none font-semibold tabular-nums">{format.emissions(latest.total)}</p>
                                <div className="mt-6">
                                    <CarbonSourceBars record={latest} />
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">{t('carbon.empty')}</p>
                        )}
                    </Section>
                </div>

                {carbonRecords.length > 0 && (
                    <>
                        <Section title={t('carbon.monthlyTitle')} description={t('carbon.monthlySubtitle')} className="mt-5">
                            <CarbonMonthlyColumns records={carbonRecords} />
                        </Section>

                        <Section title={t('carbon.historyTitle')} className="mt-5">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[40rem] text-left text-sm">
                                    <thead className="text-muted-foreground">
                                        <tr className="border-b">
                                            <th className="py-2 pr-4 font-normal">{t('carbon.period')}</th>
                                            <th className="py-2 pr-4 text-right font-normal">{t('carbon.sources.electricity')}</th>
                                            <th className="py-2 pr-4 text-right font-normal">{t('carbon.sources.naturalGas')}</th>
                                            <th className="py-2 pr-4 text-right font-normal">{t('carbon.sources.lpg')}</th>
                                            <th className="py-2 pr-4 text-right font-normal">{t('carbon.sources.transport')}</th>
                                            <th className="py-2 pr-4 text-right font-normal">{t('carbon.total')}</th>
                                            <th className="py-2" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...carbonRecords].reverse().map((record) => (
                                            <tr key={record.id} className="border-b last:border-0">
                                                <td className="py-2.5 pr-4">{format.month(record.period, 'long')}</td>
                                                {(['electricity', 'naturalGas', 'lpg', 'transport'] as const).map((source) => (
                                                    <td key={source} className="py-2.5 pr-4 text-right tabular-nums">
                                                        {format.emissions(record.emissions[source])}
                                                    </td>
                                                ))}
                                                <td className="py-2.5 pr-4 text-right font-semibold tabular-nums">
                                                    {format.emissions(record.total)}
                                                </td>
                                                <td className="py-2.5 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remove(record.id)}
                                                        className="text-muted-foreground"
                                                    >
                                                        <Trash2 aria-hidden />
                                                        <span className="sr-only">{t('carbon.remove')}</span>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Section>
                    </>
                )}

                <p className="text-muted-foreground mt-6 max-w-[70ch] text-xs">{t('carbon.factorsNote')}</p>
            </Page>
        </AppLayout>
    );
}
