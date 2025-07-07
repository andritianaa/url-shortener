"use client";

import { ModeToggle } from '@/components/mode-toggle';
import { UserNav } from '@/components/user-nav';
import { useAuth } from '@/hooks/use-auth';

export function DashboardHeader() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-end px-6 gap-4">
        <ModeToggle />
        <UserNav user={user} />
      </div>
    </header>
  );
}
