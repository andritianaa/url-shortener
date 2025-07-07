"use client";

import { BarChart3, Home, LinkIcon, List, Plus, Settings, Shield, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: "Accueil",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Créer un lien",
    href: "/dashboard/create",
    icon: Plus,
  },
  {
    name: "Mes liens",
    href: "/dashboard/links",
    icon: List,
  },
  {
    name: "Statistiques",
    href: "/dashboard/stats",
    icon: BarChart3,
  },
  {
    name: "Profil",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "Paramètres",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-background border-r">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <LinkIcon className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">URL Pro</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start", isActive && "bg-secondary")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Link>
            </Button>
          );
        })}

        {user?.role === "ADMIN" && (
          <div className="pt-4 mt-4 border-t">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Administration
            </p>
            <Button
              variant={pathname.startsWith("/admin") ? "secondary" : "ghost"}
              className="w-full justify-start"
              asChild
            >
              <Link href="/admin">
                <Shield className="mr-3 h-4 w-4" />
                Panel Admin
              </Link>
            </Button>
          </div>
        )}
      </nav>
    </div>
  );
}
