import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    googleLoginEnabled: boolean;
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    auth_provider: 'local' | 'google';
    /** 'admin' = equipe do Chile (painel de administração); 'company' = usuário de empresa. */
    role: 'company' | 'admin';
    /** true quando a senha foi definida por um administrador e ainda não foi trocada. */
    must_change_password: boolean;
    course: string | null;
    city: string | null;
    interests: string | null;
    presentation: string | null;
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
