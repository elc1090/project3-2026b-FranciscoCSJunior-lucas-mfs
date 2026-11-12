import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { t } = useTranslation();
    const breadcrumbs: BreadcrumbItem[] = [{ title: t('settings.profile'), href: '/settings/profile' }];
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
        course: auth.user.course ?? '',
        city: auth.user.city ?? '',
        interests: auth.user.interests ?? '',
        presentation: auth.user.presentation ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t('settings.profile')} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={t('settings.profileTitle')} description={t('settings.profileDescription')} />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('common.name')}</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder={t('common.fullName')}
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('common.email')}</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                readOnly={auth.user.auth_provider === 'google'}
                                placeholder={t('common.email')}
                            />

                            <InputError className="mt-2" message={errors.email} />
                            {auth.user.auth_provider === 'google' && <p className="text-muted-foreground text-sm">{t('google.emailManaged')}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="course">{t('google.course')}</Label>
                            <Input id="course" required maxLength={120} value={data.course} onChange={(e) => setData('course', e.target.value)} />
                            <InputError message={errors.course} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="city">{t('google.city')}</Label>
                            <Input
                                id="city"
                                required
                                autoComplete="address-level2"
                                maxLength={120}
                                value={data.city}
                                onChange={(e) => setData('city', e.target.value)}
                            />
                            <InputError message={errors.city} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="interests">{t('google.interests')}</Label>
                            <Input id="interests" maxLength={1000} value={data.interests} onChange={(e) => setData('interests', e.target.value)} />
                            <InputError message={errors.interests} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="presentation">{t('google.presentation')}</Label>
                            <textarea
                                id="presentation"
                                maxLength={2000}
                                rows={4}
                                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                                value={data.presentation}
                                onChange={(e) => setData('presentation', e.target.value)}
                            />
                            <InputError message={errors.presentation} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    {t('settings.unverified')}{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        {t('settings.resendVerification')}
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">{t('settings.verificationSent')}</div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>{t('settings.save')}</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-muted-foreground text-sm">{t('settings.saved')}</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
