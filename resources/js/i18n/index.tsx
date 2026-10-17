import type { Localized } from '@/types/sostenpyme';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import es from './es';
import pt from './pt';

export type Messages = typeof es;
export type Locale = 'es' | 'pt';

export const locales: Locale[] = ['es', 'pt'];
const messages: Record<Locale, Messages> = { es, pt };
const defaultLocale: Locale = 'es';
const storageKey = 'locale';

// Gera todas as chaves válidas no formato 'auth.login.title'.
type Paths<T> = { [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}` }[keyof T & string];
export type TranslationKey = Paths<Messages>;

function readStoredLocale(): Locale {
    if (typeof window === 'undefined') return defaultLocale;
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored === 'es' || stored === 'pt') return stored;
    } catch {
        // localStorage indisponível: usa o idioma padrão
    }
    return defaultLocale;
}

function applyLocale(locale: Locale) {
    document.documentElement.lang = locale;
    try {
        localStorage.setItem(storageKey, locale);
    } catch {
        // ignora
    }
    // Cookie para o backend também saber o idioma (ex.: mensagens de validação do Laravel).
    document.cookie = `${storageKey}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

interface I18nContextValue {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: TranslationKey, params?: Record<string, string | number>) => string;
    /** Escolhe o idioma atual de um conteúdo do catálogo: tl({ es: '...', pt: '...' }) */
    tl: (text: Localized) => string;
    /** Formata uma data 'AAAA-MM-DD' no padrão do idioma atual. */
    formatDate: (isoDate: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(readStoredLocale);

    useEffect(() => applyLocale(locale), [locale]);

    const t = useCallback<I18nContextValue['t']>(
        (key, params) => {
            const value = key.split('.').reduce<unknown>((obj, part) => (obj as Record<string, unknown>)?.[part], messages[locale]);
            const text = typeof value === 'string' ? value : key;
            // Substitui {nome} pelos parâmetros: t('chave', { nome: 'Ana' })
            return params ? text.replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match)) : text;
        },
        [locale],
    );

    const tl = useCallback((text: Localized) => text[locale], [locale]);

    const formatDate = useCallback(
        (isoDate: string) =>
            new Intl.DateTimeFormat(locale === 'es' ? 'es-CL' : 'pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).format(
                new Date(`${isoDate}T12:00:00`),
            ),
        [locale],
    );

    return <I18nContext.Provider value={{ locale, setLocale: setLocaleState, t, tl, formatDate }}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useTranslation deve ser usado dentro de <LanguageProvider>');
    return context;
}
