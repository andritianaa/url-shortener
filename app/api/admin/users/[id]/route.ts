import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import { requireAdmin } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdmin()
    const { action, role, password } = await request.json()

    // Ne pas permettre de se modifier soi-même (sauf le mot de passe)
    if (params.id === currentUser.id && action !== "changePassword") {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre statut" }, { status: 400 })
    }

    if (action === "ban") {
      await prisma.user.update({
        where: { id: params.id },
        data: { isActive: false },
      })

      // Supprimer toutes les sessions de l'utilisateur
      await prisma.session.deleteMany({
        where: { userId: params.id },
      })

      return NextResponse.json({ success: true })
    }

    if (action === "activate") {
      await prisma.user.update({
        where: { id: params.id },
        data: { isActive: true },
      })

      return NextResponse.json({ success: true })
    }

    if (action === "changeRole") {
      if (!["USER", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
      }

      await prisma.user.update({
        where: { id: params.id },
        data: { role },
      })

      return NextResponse.json({ success: true })
    }

    if (action === "changePassword") {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Le mot de passe doit contenir au moins 6 caractères" }, { status: 400 })
      }

      const hashedPassword = await bcrypt.hash(password, 12)
      await prisma.user.update({
        where: { id: params.id },
        data: { password: hashedPassword },
      })

      // Supprimer toutes les sessions de l'utilisateur pour forcer une reconnexion
      await prisma.session.deleteMany({
        where: { userId: params.id },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Action non reconnue" }, { status: 400 })
  } catch (error: any) {
    console.error("Error updating user:", error)
    if (error.message === "Non autorisé") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (error.message === "Accès interdit - droits administrateur requis") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUser = await requireAdmin()

    // Ne pas permettre de se supprimer soi-même
    if (params.id === currentUser.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 })
    }

    // Vérifier qu'il reste au moins un admin
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true, id: { not: params.id } },
    })

    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { role: true },
    })

    if (userToDelete?.role === "ADMIN" && adminCount === 0) {
      return NextResponse.json(
        {
          error: "Impossible de supprimer le dernier administrateur",
        },
        { status: 400 },
      )
    }

    // Supprimer l'utilisateur (cascade supprimera les sessions et liens)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting user:", error)
    if (error.message === "Non autorisé") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    if (error.message === "Accès interdit - droits administrateur requis") {
      return NextResponse.json({ error: "Accès interdit" }, { status: 403 })
    }
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
