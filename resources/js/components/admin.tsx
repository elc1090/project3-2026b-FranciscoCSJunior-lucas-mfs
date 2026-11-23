// Componentes compartilhados pelas páginas do painel de administração.
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

/** Número de destaque com rótulo e uma linha de contexto opcional. */
export function StatTile({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
    return (
        <div className="bg-card rounded-lg border p-5">
            <p className="text-muted-foreground text-sm">{label}</p>
            <p className="font-display mt-2 text-4xl leading-none font-semibold tabular-nums">{value}</p>
            {hint && <p className="text-muted-foreground mt-2 text-xs">{hint}</p>}
        </div>
    );
}

/**
 * Tabela com rolagem horizontal própria: em telas estreitas só a tabela rola, nunca a página.
 * (w-0 min-w-full impede que a tabela alargue o contêiner.)
 */
export function TableScroll({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('w-0 min-w-full overflow-x-auto rounded-lg border', className)}>
            <table className="w-full text-sm">{children}</table>
        </div>
    );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
    return <th className={cn('text-muted-foreground bg-muted/50 px-4 py-3 text-left font-medium whitespace-nowrap', className)}>{children}</th>;
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
    return <td className={cn('border-t px-4 py-3 align-middle', className)}>{children}</td>;
}

/** Nota 0–100 com cor de alerta abaixo de 50 (lacuna); null = ainda sem diagnóstico. */
export function ScoreValue({ score, empty }: { score: number | null; empty: string }) {
    if (score === null) return <span className="text-muted-foreground">{empty}</span>;
    return <span className={cn('font-display text-base font-semibold tabular-nums', score < 50 && 'text-destructive')}>{score}</span>;
}
