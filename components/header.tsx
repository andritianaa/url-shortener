"use client";

import { BarChart3, LinkIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";

export function Header() {
  const { user, loading } = useAuth();
  const [signupAllowed, setSignupAllowed] = useState(false);

  useEffect(() => {
    checkSignupStatus();
  }, []);

  const checkSignupStatus = async () => {
    try {
      const response = await fetch("/api/auth/check-signup");
      const data = await response.json();
      setSignupAllowed(data.signupAllowed);
    } catch (error) {
      console.error("Error checking signup status:", error);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/features"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Fonctionnalités
          </Link>
          <Link
            href="/pricing"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Tarifs
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:text-primary transition-colors flex items-center space-x-1"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {loading ? (
            <div className="h-8 w-8 animate-pulse bg-muted rounded-full" />
          ) : user ? (
            <UserNav user={user} />
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Connexion</Link>
              </Button>
              {signupAllowed && (
                <Button asChild>
                  <Link href="/auth/signup">S'inscrire</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
