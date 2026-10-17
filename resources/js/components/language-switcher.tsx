import { locales, useTranslation } from '@/i18n';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
    const { locale, setLocale, t } = useTranslation();

    return (
        <div
            role="group"
            aria-label={t('language.label')}
            className={cn('inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800', className)}
        >
            {locales.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => setLocale(option)}
                    aria-pressed={locale === option}
                    title={t(`language.${option}`)}
                    className={cn(
                        'rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors',
                        locale === option
                            ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                            : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                    )}
                >
                    {option}
                </button>
            ))}
        </div>
    );
}
