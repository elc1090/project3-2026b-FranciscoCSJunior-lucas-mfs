import { usePage } from '@inertiajs/react';

/** Lista os erros do servidor. Chaves em `ignore` são mostradas por outro componente (ex.: 'ai'). */
export default function ServerErrors({ ignore = [] }: { ignore?: string[] }) {
    const { errors } = usePage().props;
    const messages = [
        ...new Set(
            Object.entries(errors)
                .filter(([key]) => !ignore.includes(key))
                .map(([, message]) => message),
        ),
    ];
    if (!messages.length) return null;
    return (
        <ul role="alert" className="text-destructive border-destructive/30 mb-6 list-inside list-disc rounded-md border p-4 text-sm">
            {messages.map((message) => (
                <li key={message}>{message}</li>
            ))}
        </ul>
    );
}
