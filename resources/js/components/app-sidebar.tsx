import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useTranslation } from '@/i18n';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpen,
    Building2,
    ChartNoAxesColumn,
    ClipboardList,
    Cloud,
    House,
    LayoutDashboard,
    ListChecks,
    Route,
    Store,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    // Administradores (equipe do Chile) veem só o painel de administração.
    const adminNavItems: NavItem[] = [
        { title: t('admin.nav.overview'), url: '/admin', icon: LayoutDashboard },
        { title: t('admin.nav.companies'), url: '/admin/companies', icon: Building2 },
        { title: t('admin.nav.users'), url: '/admin/users', icon: Users },
    ];

    const mainNavItems: NavItem[] = [
        { title: t('nav.home'), url: '/dashboard', icon: House },
        { title: t('nav.company'), url: '/company', icon: Store },
        { title: t('nav.diagnosis'), url: '/diagnosis', icon: ClipboardList },
        { title: t('nav.results'), url: '/results', icon: ChartNoAxesColumn },
        { title: t('nav.path'), url: '/path', icon: Route },
        { title: t('nav.plan'), url: '/plan', icon: ListChecks },
        { title: t('nav.tracking'), url: '/tracking', icon: TrendingUp },
        { title: t('nav.carbon'), url: '/carbon', icon: Cloud },
        { title: t('nav.iso'), url: '/iso', icon: BadgeCheck },
        { title: t('nav.explore'), url: '/explore', icon: BookOpen },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? '/admin' : '/dashboard'} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={isAdmin ? adminNavItems : mainNavItems} title={isAdmin ? t('admin.badge') : undefined} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
