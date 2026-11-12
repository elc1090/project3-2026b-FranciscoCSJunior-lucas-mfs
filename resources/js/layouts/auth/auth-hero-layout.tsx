import AppLogoIcon from '@/components/app-logo-icon';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/i18n';
import { Link } from '@inertiajs/react';
import { Check } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

/**
 * Telas de entrada no estilo pedido pela equipe do Chile (referência: Tazki):
 * fundo escuro com a apresentação da plataforma à esquerda e o formulário num cartão à direita.
 */
export default function AuthHeroLayout({ children, title, description }: AuthLayoutProps) {
    const { t } = useTranslation();
    const benefits = [t('auth.hero.benefit1'), t('auth.hero.benefit2'), t('auth.hero.benefit3'), t('auth.hero.benefit4')];

    return (
        <div className="min-h-svh bg-[#16302b] text-[#f3f6f2]">
            <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 py-6 md:px-8">
                <header className="flex items-center justify-between gap-4">
                    <Link href={route('home')} className="flex items-center gap-2.5 font-semibold">
                        <AppLogoIcon className="size-9" />
                        <span className="font-display text-lg tracking-wide">SOSTENPYME</span>
                    </Link>
                    <LanguageSwitcher className="text-foreground" />
                </header>

                <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                    <section className="max-w-xl">
                        <h1 className="font-display text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">{t('auth.hero.title')}</h1>
                        <p className="mt-5 max-w-[52ch] text-base text-[#f3f6f2]/75 sm:text-lg">{t('auth.hero.description')}</p>
                        <ul className="mt-8 hidden flex-col gap-3 sm:flex">
                            {benefits.map((benefit) => (
                                <li key={benefit} className="flex items-start gap-3 text-[#f3f6f2]/85">
                                    <Check className="mt-0.5 size-5 shrink-0 text-[#86b86a]" aria-hidden />
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-card text-card-foreground w-full rounded-xl border border-transparent p-6 shadow-xl sm:p-8 lg:max-w-md lg:justify-self-end dark:border-white/15">
                        <div className="mb-6 space-y-1.5">
                            <h2 className="text-2xl font-semibold">{title}</h2>
                            {description && <p className="text-muted-foreground text-sm">{description}</p>}
                        </div>
                        {children}
                    </section>
                </main>
            </div>
        </div>
    );
}
