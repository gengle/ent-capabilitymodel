-- CreateTable
CREATE TABLE "model_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "node_kinds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schema" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelTypeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "models_modelTypeId_fkey" FOREIGN KEY ("modelTypeId") REFERENCES "model_types" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "modelId" TEXT NOT NULL,
    "kindId" TEXT,
    "properties" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "nodes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "nodes" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "nodes_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "models" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nodes_kindId_fkey" FOREIGN KEY ("kindId") REFERENCES "node_kinds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "node_relationships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "properties" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "node_relationships_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "nodes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "node_relationships_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "nodes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "model_types_name_key" ON "model_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "node_kinds_name_key" ON "node_kinds"("name");

-- CreateIndex
CREATE INDEX "nodes_modelId_idx" ON "nodes"("modelId");

-- CreateIndex
CREATE INDEX "nodes_parentId_idx" ON "nodes"("parentId");

-- CreateIndex
CREATE INDEX "nodes_kindId_idx" ON "nodes"("kindId");

-- CreateIndex
CREATE INDEX "node_relationships_fromNodeId_idx" ON "node_relationships"("fromNodeId");

-- CreateIndex
CREATE INDEX "node_relationships_toNodeId_idx" ON "node_relationships"("toNodeId");
