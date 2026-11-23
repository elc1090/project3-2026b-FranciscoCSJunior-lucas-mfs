import { TableScroll, Td, Th } from '@/components/admin';
import InputError from '@/components/input-error';
import { Page, PageHeader } from '@/components/sostenpyme';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import type { AdminUserRow, AdminUsersProps, UserRole } from '@/types/admin';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Check, Dices, Ellipsis, KeyRound, Search, ShieldCheck, Store, UserPlus } from 'lucide-react';
import { useState, type FormEventHandler } from 'react';

/** Senha provisória aleatória, sem caracteres fáceis de confundir (0/O, 1/l/I). */
function generatePassword(length = 12) {
    const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const values = crypto.getRandomValues(new Uint32Array(length));
    return Array.from(values, (v) => alphabet[v % alphabet.length]).join('');
}

export default function AdminUsers() {
    const { t, formatDate } = useTranslation();
    const { users, auth } = usePage<SharedData & AdminUsersProps>().props;
    const [query, setQuery] = useState('');
    const [creating, setCreating] = useState(false);
    const [roleTarget, setRoleTarget] = useState<AdminUserRow | null>(null);
    const [passwordTarget, setPasswordTarget] = useState<AdminUserRow | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('admin.users.title'), href: '/admin/users' }];

    const term = query.trim().toLowerCase();
    const visible = users.filter((u) => !term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));

    function changeRole() {
        if (!roleTarget) return;
        const role: UserRole = roleTarget.role === 'admin' ? 'company' : 'admin';
        router.patch(
            `/admin/users/${roleTarget.id}`,
            { role },
            {
                preserveScroll: true,
                onSuccess: () => setStatus(t('admin.users.roleChange.done')),
                onFinish: () => setRoleTarget(null),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('admin.users.title')} />
            <Page className="max-w-6xl">
                <PageHeader
                    title={t('admin.users.title')}
                    description={t('admin.users.description')}
                    actions={
                        <Button onClick={() => setCreating(true)}>
                            <UserPlus aria-hidden />
                            {t('admin.users.create')}
                        </Button>
                    }
                />

                {status && (
                    <p role="status" className="bg-muted mb-4 flex items-center gap-2 rounded-md px-3 py-2 text-sm">
                        <Check className="size-4" aria-hidden />
                        {status}
                    </p>
                )}

                <div className="relative mb-4 max-w-md">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" aria-hidden />
                    <Input
                        type="search"
                        aria-label={t('admin.users.search')}
                        placeholder={t('admin.users.search')}
                        className="pl-9"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                {visible.length ? (
                    <TableScroll>
                        <thead>
                            <tr>
                                <Th>{t('admin.users.name')}</Th>
                                <Th>{t('admin.users.role')}</Th>
                                <Th>{t('admin.users.method')}</Th>
                                <Th>{t('admin.users.company')}</Th>
                                <Th>{t('admin.users.createdAt')}</Th>
                                <Th>{t('admin.users.lastLogin')}</Th>
                                <Th className="w-12">
                                    <span className="sr-only">{t('admin.users.actions')}</span>
                                </Th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((user) => {
                                const isSelf = user.id === auth.user.id;
                                return (
                                    <tr key={user.id} className="hover:bg-muted/40">
                                        <Td className="min-w-52">
                                            <p className="font-medium">
                                                {user.name}
                                                {isSelf && <span className="text-muted-foreground font-normal"> ({t('admin.users.you')})</span>}
                                            </p>
                                            <p className="text-muted-foreground text-xs">{user.email}</p>
                                        </Td>
                                        <Td className="whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </Td>
                                        <Td className="whitespace-nowrap">
                                            {t(`admin.users.methods.${user.authProvider}`)}
                                            {user.mustChangePassword && (
                                                <p className="text-xs text-[var(--dim-governance)]">{t('admin.users.provisional')}</p>
                                            )}
                                        </Td>
                                        <Td>
                                            {user.companyId ? (
                                                <Link href={`/admin/companies/${user.companyId}`} className="underline-offset-4 hover:underline">
                                                    {user.companyName}
                                                </Link>
                                            ) : (
                                                '—'
                                            )}
                                        </Td>
                                        <Td className="whitespace-nowrap">{formatDate(user.createdAt)}</Td>
                                        <Td className="whitespace-nowrap">{user.lastLoginAt ? formatDate(user.lastLoginAt) : t('admin.never')}</Td>
                                        <Td>
                                            {!isSelf && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" aria-label={`${t('admin.users.actions')}: ${user.name}`}>
                                                            <Ellipsis aria-hidden />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => setRoleTarget(user)}>
                                                            {user.role === 'admin' ? <Store aria-hidden /> : <ShieldCheck aria-hidden />}
                                                            {user.role === 'admin' ? t('admin.users.makeCompany') : t('admin.users.makeAdmin')}
                                                        </DropdownMenuItem>
                                                        {user.authProvider === 'local' && (
                                                            <DropdownMenuItem onSelect={() => setPasswordTarget(user)}>
                                                                <KeyRound aria-hidden />
                                                                {t('admin.users.resetPassword')}
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </Td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </TableScroll>
                ) : (
                    <p className="text-muted-foreground rounded-lg border p-6 text-center">{t('admin.users.empty')}</p>
                )}
            </Page>

            <CreateUserDialog open={creating} onOpenChange={setCreating} onCreated={() => setStatus(t('admin.users.form.created'))} />

            <Dialog open={roleTarget !== null} onOpenChange={(open) => !open && setRoleTarget(null)}>
                <DialogContent>
                    {roleTarget && (
                        <>
                            <DialogTitle>
                                {roleTarget.role === 'admin'
                                    ? t('admin.users.roleChange.toCompany', { name: roleTarget.name })
                                    : t('admin.users.roleChange.toAdmin', { name: roleTarget.name })}
                            </DialogTitle>
                            <DialogDescription>
                                {roleTarget.role === 'admin'
                                    ? t('admin.users.roleChange.toCompanyDescription')
                                    : t('admin.users.roleChange.toAdminDescription')}
                            </DialogDescription>
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary">{t('common.cancel')}</Button>
                                </DialogClose>
                                <Button onClick={changeRole}>{t('admin.users.roleChange.confirm')}</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <ResetPasswordDialog
                user={passwordTarget}
                onClose={() => setPasswordTarget(null)}
                onDone={() => setStatus(t('admin.users.reset.done'))}
            />
        </AppLayout>
    );
}

function RoleBadge({ role }: { role: UserRole }) {
    const { t } = useTranslation();
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                role === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
        >
            {role === 'admin' && <ShieldCheck className="size-3.5" aria-hidden />}
            {t(`admin.users.roles.${role}`)}
        </span>
    );
}

function PasswordField({ value, onChange, error }: { value: string; onChange: (value: string) => void; error?: string }) {
    const { t } = useTranslation();
    return (
        <div className="grid gap-2">
            <Label htmlFor="password">{t('admin.users.form.password')}</Label>
            <div className="flex gap-2">
                <Input id="password" required minLength={8} autoComplete="new-password" value={value} onChange={(e) => onChange(e.target.value)} />
                <Button type="button" variant="outline" onClick={() => onChange(generatePassword())}>
                    <Dices aria-hidden />
                    {t('admin.users.form.generate')}
                </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t('admin.users.form.passwordHint')}</p>
            <InputError message={error} />
        </div>
    );
}

function CreateUserDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        role: 'company' as UserRole,
        companyName: '',
        password: '',
    });

    function close(next: boolean) {
        if (!next) {
            reset();
            clearErrors();
        }
        onOpenChange(next);
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => {
                close(false);
                onCreated();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-lg">
                <DialogTitle>{t('admin.users.form.title')}</DialogTitle>
                <DialogDescription>{t('admin.users.form.description')}</DialogDescription>
                <form onSubmit={submit} className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t('admin.users.name')}</Label>
                        <Input id="name" required autoComplete="off" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">{t('admin.users.email')}</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoComplete="off"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">{t('admin.users.form.role')}</Label>
                        <Select value={data.role} onValueChange={(value) => setData('role', value as UserRole)}>
                            <SelectTrigger id="role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="company">{t('admin.users.roles.company')}</SelectItem>
                                <SelectItem value="admin">{t('admin.users.roles.admin')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role} />
                    </div>
                    {data.role === 'company' && (
                        <div className="grid gap-2">
                            <Label htmlFor="companyName">{t('admin.users.form.companyName')}</Label>
                            <Input id="companyName" required value={data.companyName} onChange={(e) => setData('companyName', e.target.value)} />
                            <p className="text-muted-foreground text-xs">{t('admin.users.form.companyHint')}</p>
                            <InputError message={errors.companyName} />
                        </div>
                    )}
                    <PasswordField value={data.password} onChange={(value) => setData('password', value)} error={errors.password} />
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                {t('common.cancel')}
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={processing}>
                            {t('admin.users.form.submit')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ResetPasswordDialog({ user, onClose, onDone }: { user: AdminUserRow | null; onClose: () => void; onDone: () => void }) {
    const { t } = useTranslation();
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({ password: '' });

    function close() {
        reset();
        clearErrors();
        onClose();
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!user) return;
        put(`/admin/users/${user.id}/password`, {
            preserveScroll: true,
            onSuccess: () => {
                close();
                onDone();
            },
        });
    };

    return (
        <Dialog open={user !== null} onOpenChange={(open) => !open && close()}>
            <DialogContent>
                {user && (
                    <>
                        <DialogTitle>{t('admin.users.reset.title')}</DialogTitle>
                        <DialogDescription>{t('admin.users.reset.description', { name: user.name })}</DialogDescription>
                        <form onSubmit={submit} className="grid gap-5">
                            <PasswordField value={data.password} onChange={(value) => setData('password', value)} error={errors.password} />
                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">
                                        {t('common.cancel')}
                                    </Button>
                                </DialogClose>
                                <Button type="submit" disabled={processing}>
                                    {t('admin.users.reset.submit')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
