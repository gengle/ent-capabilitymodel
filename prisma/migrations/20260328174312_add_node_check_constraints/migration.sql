-- SQLite does not support ALTER TABLE ADD CONSTRAINT.
-- Recreate the nodes table with CHECK constraints.

PRAGMA foreign_keys = OFF;

CREATE TABLE "nodes_new" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "owner"       TEXT,
    "level"       INTEGER NOT NULL CHECK ("level" BETWEEN 1 AND 4),
    "parentId"    TEXT,
    "modelId"     TEXT NOT NULL,
    "kindId"      TEXT,
    "properties"  TEXT NOT NULL DEFAULT '{}',
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL,
    CHECK ("level" != 1 OR "parentId" IS NULL),
    CONSTRAINT "nodes_new_parentId_fkey"  FOREIGN KEY ("parentId")  REFERENCES "nodes_new" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "nodes_new_modelId_fkey"   FOREIGN KEY ("modelId")   REFERENCES "models" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "nodes_new_kindId_fkey"    FOREIGN KEY ("kindId")    REFERENCES "node_kinds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "nodes_new" SELECT * FROM "nodes";
DROP TABLE "nodes";
ALTER TABLE "nodes_new" RENAME TO "nodes";

CREATE INDEX "nodes_modelId_idx"  ON "nodes"("modelId");
CREATE INDEX "nodes_parentId_idx" ON "nodes"("parentId");
CREATE INDEX "nodes_kindId_idx"   ON "nodes"("kindId");

PRAGMA foreign_keys = ON;