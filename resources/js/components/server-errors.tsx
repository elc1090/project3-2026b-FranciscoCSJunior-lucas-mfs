import { usePage } from '@inertiajs/react';

export default function ServerErrors() {
    const { errors } = usePage().props;
    const messages = [...new Set(Object.values(errors))];
    if (!messages.length) return null;
    return (
        <ul role="alert" className="text-destructive border-destructive/30 mb-6 list-inside list-disc rounded-md border p-4 text-sm">
            {messages.map((message) => (
                <li key={message}>{message}</li>
            ))}
        </ul>
    );
}
