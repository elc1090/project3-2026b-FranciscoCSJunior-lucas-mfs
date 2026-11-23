// Tipos do painel de administração (equipe do Chile).
// Contrato entre frontend e backend: os controllers de /admin devem enviar os props neste formato.
// Descrição completa para o backend: docs/admin-backend.md
import type { AreaKey, CompanySize, DimensionKey, SectorKey } from '@/types/sostenpyme';

export type UserRole = 'company' | 'admin';

/** Uma linha da lista de empresas (e dos "cadastros recentes" da visão geral). */
export interface AdminCompanyRow {
    id: number;
    name: string;
    sector: SectorKey;
    size: CompanySize;
    workers: number;
    region: string;
    owner: { name: string; email: string };
    createdAt: string; // AAAA-MM-DD
    /** null quando a empresa ainda não fez diagnóstico. */
    lastDiagnosisAt: string | null; // AAAA-MM-DD
    totalScore: number | null; // 0–100
    scores: Record<AreaKey, number> | null;
    /** Total do mês mais recente registrado, em kg CO2e; null sem registros. */
    carbonLastMonth: { period: string; total: number } | null; // period AAAA-MM
    isoDone: number;
    isoTotal: number;
    planDone: number;
    planTotal: number;
}

/** Props da página admin/dashboard. */
export interface AdminDashboardProps {
    stats: {
        companies: number;
        diagnosedCompanies: number;
        companyUsers: number;
        admins: number;
        /** Média da nota total das empresas com diagnóstico; null se nenhuma tem. */
        averageScore: number | null;
    };
    /** Média por dimensão (e por subgrupo social) das empresas com diagnóstico; null se nenhuma tem. */
    averageScores: (Record<DimensionKey, number> & Record<'workers' | 'community', number>) | null;
    companiesBySector: Partial<Record<SectorKey, number>>;
    recentCompanies: AdminCompanyRow[]; // as 5 mais recentes
}

/** Props da página admin/companies. */
export interface AdminCompaniesProps {
    companies: AdminCompanyRow[];
}

/** Uma linha da lista de usuários. */
export interface AdminUserRow {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    authProvider: 'local' | 'google';
    companyId: number | null;
    companyName: string | null;
    createdAt: string; // AAAA-MM-DD
    lastLoginAt: string | null; // AAAA-MM-DD
    mustChangePassword: boolean;
}

/** Props da página admin/users. */
export interface AdminUsersProps {
    users: AdminUserRow[];
}

/**
 * Props da página admin/company: as MESMAS chaves que as páginas da empresa recebem
 * (SustainabilityData), mais o dono e o id. Assim a página reaproveita os mesmos gráficos.
 */
export interface AdminCompanyExtraProps {
    companyId: number;
    owner: { name: string; email: string; lastLoginAt: string | null };
}
