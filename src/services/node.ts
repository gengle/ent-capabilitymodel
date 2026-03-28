import { prisma } from "../db/client";
import { validateProperties, parseSchema } from "../validators/node-kind-schema";

export type CreateNodeInput = {
  name: string;
  description?: string;
  owner?: string;
  level: 1 | 2 | 3 | 4;
  parentId?: string;
  modelId: string;
  kindId?: string;
  properties?: Record<string, unknown>;
};

export type UpdateNodeInput = {
  name?: string;
  description?: string;
  owner?: string;
  properties?: Record<string, unknown>;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function enforceHierarchy(
  level: number,
  parentId: string | undefined,
  modelId: string
): Promise<void> {
  if (level === 1) {
    if (parentId != null) {
      throw new Error("Level 1 (Domain) nodes must not have a parent");
    }
    return;
  }
  if (!parentId) {
    throw new Error(`Level ${level} nodes must have a parent`);
  }
  const parent = await prisma.node.findUnique({ where: { id: parentId } });
  if (!parent) throw new Error(`Parent node '${parentId}' not found`);
  if (parent.level !== level - 1) {
    throw new Error(
      `Parent node is level ${parent.level} but expected level ${level - 1} for a level-${level} child`
    );
  }
  if (parent.modelId !== modelId) {
    throw new Error("Parent node must belong to the same Model");
  }
}

function enforceKindConstraint(level: number, kindId: string | undefined): void {
  if ((level === 1 || level === 2) && kindId != null) {
    throw new Error(`Level ${level} nodes (container nodes) must not have a kind`);
  }
  if ((level === 3 || level === 4) && !kindId) {
    throw new Error(`Level ${level} nodes (capability nodes) must have a kind`);
  }
}

async function validateNodeProperties(
  kindId: string,
  properties: Record<string, unknown>
): Promise<void> {
  const kind = await prisma.nodeKind.findUnique({ where: { id: kindId } });
  if (!kind) throw new Error(`NodeKind '${kindId}' not found`);
  const schema = parseSchema(kind.schema);
  const errors = validateProperties(properties, schema);
  if (errors.length > 0) {
    throw new Error(
      `Property validation failed: ${errors.map((e) => e.message).join("; ")}`
    );
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** 5.1 + 5.2 + 5.3 Create a Node with hierarchy, kind, and property validation. */
export async function createNode(input: CreateNodeInput) {
  if (input.level < 1 || input.level > 4) {
    throw new Error("Node level must be between 1 and 4");
  }

  await enforceHierarchy(input.level, input.parentId, input.modelId);
  enforceKindConstraint(input.level, input.kindId);

  const properties = input.properties ?? {};
  if (input.kindId) {
    await validateNodeProperties(input.kindId, properties);
  }

  return prisma.node.create({
    data: {
      name: input.name,
      description: input.description,
      owner: input.owner,
      level: input.level,
      parentId: input.parentId ?? null,
      modelId: input.modelId,
      kindId: input.kindId ?? null,
      properties: JSON.stringify(properties),
    },
  });
}

/** 5.4 Get a Node by ID. */
export async function getNode(id: string) {
  const node = await prisma.node.findUnique({
    where: { id },
    include: { kind: true, parent: true },
  });
  if (!node) throw new Error(`Node '${id}' not found`);
  return node;
}

/** 5.5 List all Nodes in a Model (flat). */
export async function listNodesByModel(modelId: string) {
  return prisma.node.findMany({
    where: { modelId },
    orderBy: [{ level: "asc" }, { name: "asc" }],
    include: { kind: true },
  });
}

/**
 * 5.6 Get the subtree rooted at a Node (node + all descendants).
 * Uses a recursive CTE for efficient traversal.
 */
export async function getSubtree(nodeId: string) {
  const rows = await prisma.$queryRaw<Node[]>`
    WITH RECURSIVE subtree AS (
      SELECT * FROM nodes WHERE id = ${nodeId}
      UNION ALL
      SELECT n.* FROM nodes n
      INNER JOIN subtree s ON n.parentId = s.id
    )
    SELECT * FROM subtree ORDER BY level ASC, name ASC
  `;
  if (rows.length === 0) throw new Error(`Node '${nodeId}' not found`);
  return rows;
}

/**
 * 5.7 Get the ancestor path from root to the immediate parent of a Node.
 * Returns ordered list: [root, ..., parent].
 */
export async function getAncestors(nodeId: string) {
  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node) throw new Error(`Node '${nodeId}' not found`);
  if (!node.parentId) return [];

  const rows = await prisma.$queryRaw<Node[]>`
    WITH RECURSIVE ancestors AS (
      SELECT * FROM nodes WHERE id = ${node.parentId}
      UNION ALL
      SELECT n.* FROM nodes n
      INNER JOIN ancestors a ON n.id = a.parentId
    )
    SELECT * FROM ancestors ORDER BY level ASC
  `;
  return rows;
}

/** 5.8 Update a Node. Re-validates properties against kind schema if properties changed. */
export async function updateNode(id: string, input: UpdateNodeInput) {
  const existing = await prisma.node.findUnique({ where: { id } });
  if (!existing) throw new Error(`Node '${id}' not found`);

  let propertiesJson = existing.properties;
  if (input.properties !== undefined) {
    if (existing.kindId) {
      await validateNodeProperties(existing.kindId, input.properties);
    }
    propertiesJson = JSON.stringify(input.properties);
  }

  return prisma.node.update({
    where: { id },
    data: {
      name: input.name,
      description: input.description,
      owner: input.owner,
      properties: propertiesJson,
    },
  });
}

/** 5.9 Delete a Node. Rejects if it has children. */
export async function deleteNode(id: string): Promise<void> {
  const childCount = await prisma.node.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new Error(`Cannot delete Node '${id}': it has ${childCount} child node(s)`);
  }
  await prisma.node.delete({ where: { id } });
}
