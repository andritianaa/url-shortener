-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "links" (
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
    CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clicks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "clicks_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "linkId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "files_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "links_shortCode_key" ON "links"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "files_linkId_key" ON "files"("linkId");
