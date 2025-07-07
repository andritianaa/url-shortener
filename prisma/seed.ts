import bcrypt from 'bcryptjs';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Vérifier s'il y a déjà des utilisateurs
  const userCount = await prisma.user.count()

  if (userCount > 0) {
    console.log("✅ Database already has users, skipping seed")
    return
  }

  // Créer le premier utilisateur admin
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Administrateur",
      password: adminPassword,
      role: "ADMIN",
    },
  })

  console.log("✅ Database seeded successfully!")
  console.log("👤 First admin user created: admin@example.com / admin123")
  console.log("🔒 Public signup is now disabled. Use the admin panel to create new users.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
