import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useTranslation } from '@/i18n';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], title }: { items: NavItem[]; title?: string }) {
    const { t } = useTranslation();
    const path = usePage().url.split('?')[0];
    // Subpáginas (ex.: /admin/companies/5) mantêm o item do menu ativo; /admin só fica ativo na própria página.
    const isActive = (url: string) => path === url || (url !== '/admin' && path.startsWith(`${url}/`));

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{title ?? t('nav.platform')}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive(item.url)}>
                            <Link href={item.url} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
