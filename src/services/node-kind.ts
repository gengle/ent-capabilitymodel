import { prisma } from "../db/client";
import {
  validateNodeKindSchema,
  validateProperties,
  parseSchema,
  serializeSchema,
  type NodeKindSchema,
} from "../validators/node-kind-schema";

export type CreateNodeKindInput = {
  name: string;
  description?: string;
  schema: NodeKindSchema;
};

/** 3.1 Create a NodeKind. Validates schema structure and enforces unique name. */
export async function createNodeKind(input: CreateNodeKindInput) {
  const schemaErrors = validateNodeKindSchema(input.schema);
  if (schemaErrors.length > 0) {
    throw new Error(`Invalid schema: ${schemaErrors.map((e) => e.message).join("; ")}`);
  }

  const existing = await prisma.nodeKind.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new Error(`NodeKind with name '${input.name}' already exists`);
  }

  return prisma.nodeKind.create({
    data: { name: input.name, description: input.description, schema: serializeSchema(input.schema) },
  });
}

/** 3.2 List all NodeKinds. */
export async function listNodeKinds() {
  return prisma.nodeKind.findMany({ orderBy: { name: "asc" } });
}

/** 3.3 Get a NodeKind by ID. */
export async function getNodeKind(id: string) {
  const kind = await prisma.nodeKind.findUnique({ where: { id } });
  if (!kind) throw new Error(`NodeKind '${id}' not found`);
  return kind;
}

/**
 * 3.4 Update a NodeKind's schema. Pre-flight validates all existing Nodes
 * using this kind before applying the change.
 */
export async function updateNodeKindSchema(
  id: string,
  newSchema: NodeKindSchema
) {
  const schemaErrors = validateNodeKindSchema(newSchema);
  if (schemaErrors.length > 0) {
    throw new Error(`Invalid schema: ${schemaErrors.map((e) => e.message).join("; ")}`);
  }

  const nodes = await prisma.node.findMany({ where: { kindId: id } });

  const violations: Array<{ nodeId: string; errors: string[] }> = [];
  for (const node of nodes) {
    const props = JSON.parse(node.properties) as Record<string, unknown>;
    const errors = validateProperties(props, newSchema);
    if (errors.length > 0) {
      violations.push({ nodeId: node.id, errors: errors.map((e) => e.message) });
    }
  }

  if (violations.length > 0) {
    const detail = violations.map((v) => `  Node ${v.nodeId}: ${v.errors.join(", ")}`).join("\n");
    throw new Error(`Schema update rejected — ${violations.length} node(s) would violate the new schema:\n${detail}`);
  }

  return prisma.nodeKind.update({ where: { id }, data: { schema: serializeSchema(newSchema) } });
}

/** 3.5 Delete a NodeKind. Rejects if any Nodes reference it. */
export async function deleteNodeKind(id: string): Promise<void> {
  const referenced = await prisma.node.count({ where: { kindId: id } });
  if (referenced > 0) {
    throw new Error(`Cannot delete NodeKind '${id}': ${referenced} Node(s) reference it`);
  }
  await prisma.nodeKind.delete({ where: { id } });
}

export { parseSchema };
