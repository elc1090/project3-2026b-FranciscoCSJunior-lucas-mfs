import type { SharedData } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

// Components...
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import HeadingSmall from '@/components/heading-small';

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslation } from '@/i18n';

export default function DeleteUser() {
    const { t } = useTranslation();
    const isGoogle = usePage<SharedData>().props.auth.user.auth_provider === 'google';
    const passwordInput = useRef<HTMLInputElement>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '', confirmation_email: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title={t('settings.deleteTitle')} description={t('settings.deleteDescription')} />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">{t('settings.warning')}</p>
                    <p className="text-sm">{t('settings.warningText')}</p>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">{t('settings.deleteButton')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>{t('settings.deleteConfirmTitle')}</DialogTitle>
                        <DialogDescription>{t(isGoogle ? 'google.deleteDescription' : 'settings.deleteConfirmDescription')}</DialogDescription>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="sr-only">
                                    {t(isGoogle ? 'common.email' : 'common.password')}
                                </Label>

                                <Input
                                    id="password"
                                    type={isGoogle ? 'email' : 'password'}
                                    name={isGoogle ? 'confirmation_email' : 'password'}
                                    ref={passwordInput}
                                    value={isGoogle ? data.confirmation_email : data.password}
                                    onChange={(e) => setData(isGoogle ? 'confirmation_email' : 'password', e.target.value)}
                                    placeholder={t(isGoogle ? 'common.email' : 'common.password')}
                                    autoComplete={isGoogle ? 'email' : 'current-password'}
                                />

                                <InputError message={isGoogle ? errors.confirmation_email : errors.password} />
                            </div>

                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary" onClick={closeModal}>
                                        {t('settings.cancel')}
                                    </Button>
                                </DialogClose>

                                <Button variant="destructive" disabled={processing} asChild>
                                    <button type="submit">{t('settings.deleteButton')}</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
