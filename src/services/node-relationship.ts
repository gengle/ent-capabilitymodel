import { prisma } from "../db/client";
import type { NodeRelationship } from "../../generated/prisma";

export type CreateNodeRelationshipInput = {
  fromNodeId: string;
  toNodeId: string;
  relationType: string;
  properties?: Record<string, unknown>;
};

/** 6.1 Create a NodeRelationship. Validates node existence, rejects self-referential. */
export async function createNodeRelationship(
  input: CreateNodeRelationshipInput
): Promise<NodeRelationship> {
  if (input.fromNodeId === input.toNodeId) {
    throw new Error("A node cannot have a relationship with itself");
  }

  const [fromNode, toNode] = await Promise.all([
    prisma.node.findUnique({ where: { id: input.fromNodeId } }),
    prisma.node.findUnique({ where: { id: input.toNodeId } }),
  ]);

  if (!fromNode) throw new Error(`From-node '${input.fromNodeId}' not found`);
  if (!toNode) throw new Error(`To-node '${input.toNodeId}' not found`);

  return prisma.nodeRelationship.create({
    data: {
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      relationType: input.relationType,
      properties: JSON.stringify(input.properties ?? {}),
    },
  });
}

/** 6.2 List relationships for a node. Direction: "from" | "to" | "both". Optionally filter by relationType. */
export async function listRelationships(
  nodeId: string,
  options: { direction?: "from" | "to" | "both"; relationType?: string } = {}
): Promise<NodeRelationship[]> {
  const { direction = "from", relationType } = options;

  const typeFilter = relationType ? { relationType } : {};

  if (direction === "from") {
    return prisma.nodeRelationship.findMany({
      where: { fromNodeId: nodeId, ...typeFilter },
      include: { toNode: true },
    });
  }
  if (direction === "to") {
    return prisma.nodeRelationship.findMany({
      where: { toNodeId: nodeId, ...typeFilter },
      include: { fromNode: true },
    });
  }
  return prisma.nodeRelationship.findMany({
    where: {
      OR: [{ fromNodeId: nodeId }, { toNodeId: nodeId }],
      ...typeFilter,
    },
    include: { fromNode: true, toNode: true },
  });
}

/** 6.3 Get a NodeRelationship by ID. */
export async function getNodeRelationship(id: string): Promise<NodeRelationship> {
  const rel = await prisma.nodeRelationship.findUnique({
    where: { id },
    include: { fromNode: true, toNode: true },
  });
  if (!rel) throw new Error(`NodeRelationship '${id}' not found`);
  return rel;
}

/** 6.4 Delete a NodeRelationship. */
export async function deleteNodeRelationship(id: string): Promise<void> {
  const rel = await prisma.nodeRelationship.findUnique({ where: { id } });
  if (!rel) throw new Error(`NodeRelationship '${id}' not found`);
  await prisma.nodeRelationship.delete({ where: { id } });
}
