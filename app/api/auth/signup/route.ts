import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { createSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email et mot de passe requis" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
    }

    // Vérifier s'il y a déjà des utilisateurs dans la base
    const userCount = await prisma.user.count()

    if (userCount > 0) {
      return NextResponse.json(
        {
          error: "L'inscription publique est fermée. Contactez un administrateur pour créer un compte.",
        },
        { status: 403 },
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un compte avec cet email existe déjà" }, { status: 400 })
    }

    // Créer le premier utilisateur avec le rôle ADMIN
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN", // Premier utilisateur = Admin automatiquement
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    const sessionToken = await createSession(user.id)

    const cookieStore = await cookies()
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Sign up error:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
