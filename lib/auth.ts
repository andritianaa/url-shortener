import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

import { prisma } from '@/lib/prisma';

export interface User {
  id: string
  email: string
  name: string | null
  role: "USER" | "ADMIN"
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name?: string): Promise<User> {
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user || !user.isActive) {
      return null
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  } catch (error) {
    console.error("Error in authenticateUser:", error)
    return null
  }
}

export async function createSession(userId: string): Promise<string> {
  try {
    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.session.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    })

    return token
  } catch (error) {
    console.error("Error in createSession:", error)
    throw error
  }
}

export async function getSessionUser(token: string): Promise<User | null> {
  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } })
      }
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    }
  } catch (error) {
    console.error("Error in getSessionUser:", error)
    return null
  }
}

export async function deleteSession(token: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { token },
    })
  } catch (error) {
    console.error("Error in deleteSession:", error)
  }
}
