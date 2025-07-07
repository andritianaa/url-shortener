#!/bin/bash

echo "🚀 Configuration de l'application Teratany tool"

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Générer le client Prisma
echo "🔧 Génération du client Prisma..."
npx prisma generate

# Pousser le schéma vers la base de données
echo "🗄️ Configuration de la base de données..."
npx prisma db push

# Seeder la base de données
echo "🌱 Seeding de la base de données..."
npm run db:seed

echo "✅ Configuration terminée!"
echo ""
echo "🔑 Comptes de test créés:"
echo "   Admin: admin@example.com / admin123"
echo "   User:  user@example.com / user123"
echo ""
echo "🚀 Démarrer l'application avec: npm run dev"
echo "🎨 Ouvrir Prisma Studio avec: npm run db:studio"
