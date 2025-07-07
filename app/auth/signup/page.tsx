"use client";

import type React from "react";
import { AlertTriangle, Crown, Eye, EyeOff, LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signupAllowed, setSignupAllowed] = useState<boolean | null>(null);
  const [isFirstUser, setIsFirstUser] = useState(false);
  const { signUp, user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // Rediriger si déjà connecté
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) {
      checkSignupStatus();
    }
  }, [user]);

  const checkSignupStatus = async () => {
    try {
      const response = await fetch("/api/auth/check-signup");
      const data = await response.json();
      setSignupAllowed(data.signupAllowed);
      setIsFirstUser(data.isFirstUser);
    } catch (error) {
      console.error("Error checking signup status:", error);
      setSignupAllowed(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signUp(email, password, name);
      toast({
        title: "Inscription réussie",
        description: isFirstUser
          ? "Votre compte administrateur a été créé avec succès"
          : "Votre compte a été créé avec succès",
      });
      // La redirection se fera automatiquement grâce au useEffect
    } catch (error: any) {
      toast({
        title: "Erreur d'inscription",
        description:
          error.message ||
          "Une erreur est survenue lors de la création du compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un loader pendant la vérification
  if (loading || signupAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si déjà connecté, ne pas afficher le formulaire
  if (user) {
    return null;
  }

  if (!signupAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Inscription fermée</CardTitle>
            <CardDescription>
              L'inscription publique n'est plus disponible. Contactez un
              administrateur pour créer un compte.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/auth/signin">Se connecter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <LinkIcon className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">URL Pro</span>
          </div>
          <CardTitle className="flex items-center justify-center space-x-2">
            {isFirstUser && <Crown className="h-5 w-5 text-yellow-500" />}
            <span>Inscription{isFirstUser ? " Administrateur" : ""}</span>
          </CardTitle>
          <CardDescription>
            {isFirstUser
              ? "Créez le premier compte administrateur de la plateforme"
              : "Créez votre compte pour commencer à raccourcir vos URLs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFirstUser && (
            <Alert className="mb-6">
              <Crown className="h-4 w-4" />
              <AlertDescription>
                En tant que premier utilisateur, vous obtiendrez automatiquement
                les privilèges d'administrateur.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                type="text"
                placeholder="Votre nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Création du compte..."
                : `Créer ${
                    isFirstUser ? "le compte administrateur" : "mon compte"
                  }`}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Déjà un compte ?{" "}
              <Link
                href="/auth/signin"
                className="text-primary hover:underline"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
