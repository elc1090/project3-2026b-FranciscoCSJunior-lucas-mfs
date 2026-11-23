import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { KeyRound } from 'lucide-react';

/** Aviso para quem entrou com a senha provisória definida por um administrador. */
export function PasswordBanner() {
    const { t } = useTranslation();
    const page = usePage<SharedData>();
    if (!page.props.auth.user.must_change_password || page.url.startsWith('/settings/password')) return null;

    return (
        <div role="status" className="bg-muted mx-4 mt-4 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center md:mx-8">
            <KeyRound className="text-primary size-5 shrink-0" aria-hidden />
            <p className="flex-1 text-sm">{t('admin.passwordBanner')}</p>
            <Button asChild size="sm">
                <Link href="/settings/password">{t('admin.passwordBannerAction')}</Link>
            </Button>
        </div>
    );
}
