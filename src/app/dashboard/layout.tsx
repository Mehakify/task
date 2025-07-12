'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { Logo } from '@/components/icons/logo';
import { UserNav } from '@/components/auth/user-nav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="flex h-screen w-full items-center justify-center">Loading session...</div>;
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold font-headline tracking-tight">TaskZen</h1>
                    </div>
                    <UserNav />
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
