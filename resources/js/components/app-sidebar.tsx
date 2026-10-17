import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useTranslation } from '@/i18n';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, ChartNoAxesColumn, ClipboardList, House, ListChecks, Route, Store, TrendingUp } from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t } = useTranslation();

    const mainNavItems: NavItem[] = [
        { title: t('nav.home'), url: '/dashboard', icon: House },
        { title: t('nav.company'), url: '/company', icon: Store },
        { title: t('nav.diagnosis'), url: '/diagnosis', icon: ClipboardList },
        { title: t('nav.results'), url: '/results', icon: ChartNoAxesColumn },
        { title: t('nav.path'), url: '/path', icon: Route },
        { title: t('nav.plan'), url: '/plan', icon: ListChecks },
        { title: t('nav.tracking'), url: '/tracking', icon: TrendingUp },
        { title: t('nav.explore'), url: '/explore', icon: BookOpen },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
