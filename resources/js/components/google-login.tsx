import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function GoogleLogin() {
    const { t } = useTranslation();
    const { googleLoginEnabled, errors } = usePage<SharedData>().props;
    return (
        <div className="mt-6 grid gap-3">
            {googleLoginEnabled ? (
                <Button variant="outline" asChild className="w-full">
                    <a href={route('google.redirect')}>{t('google.continue')}</a>
                </Button>
            ) : (
                <Button variant="outline" disabled className="w-full">
                    {t('google.continue')}
                </Button>
            )}
            <p className="text-muted-foreground text-center text-xs">{t(googleLoginEnabled ? 'google.separateAccounts' : 'google.unavailable')}</p>
            {errors.google && (
                <p role="alert" className="text-destructive text-center text-sm">
                    {errors.google}
                </p>
            )}
        </div>
    );
}
