-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_links" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "customAlias" TEXT,
    "description" TEXT,
    "password" TEXT,
    "expirationDate" DATETIME,
    "maxClicks" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canViewStats" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_links" ("createdAt", "customAlias", "description", "expirationDate", "id", "isActive", "maxClicks", "ogDescription", "ogImage", "ogTitle", "originalUrl", "password", "shortCode", "updatedAt", "userId") SELECT "createdAt", "customAlias", "description", "expirationDate", "id", "isActive", "maxClicks", "ogDescription", "ogImage", "ogTitle", "originalUrl", "password", "shortCode", "updatedAt", "userId" FROM "links";
DROP TABLE "links";
ALTER TABLE "new_links" RENAME TO "links";
CREATE UNIQUE INDEX "links_shortCode_key" ON "links"("shortCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
