import { prisma } from "../db/client";
import type { Model } from "../../generated/prisma";

export type CreateModelInput = {
  name: string;
  description?: string;
  modelTypeId: string;
};

export type UpdateModelInput = {
  name?: string;
  description?: string;
};

/** 4.1 Create a Model. Requires a valid ModelType reference. */
export async function createModel(input: CreateModelInput): Promise<Model> {
  const modelType = await prisma.modelType.findUnique({ where: { id: input.modelTypeId } });
  if (!modelType) {
    throw new Error(`ModelType '${input.modelTypeId}' not found`);
  }
  return prisma.model.create({ data: input });
}

/** 4.2 List all Models, optionally filtered by ModelType. */
export async function listModels(modelTypeId?: string): Promise<Model[]> {
  return prisma.model.findMany({
    where: modelTypeId ? { modelTypeId } : undefined,
    orderBy: { name: "asc" },
    include: { modelType: true },
  });
}

/** 4.3 Get a Model by ID. */
export async function getModel(id: string): Promise<Model> {
  const model = await prisma.model.findUnique({ where: { id }, include: { modelType: true } });
  if (!model) throw new Error(`Model '${id}' not found`);
  return model;
}

/** 4.4 Update a Model's name or description. */
export async function updateModel(id: string, input: UpdateModelInput): Promise<Model> {
  const model = await prisma.model.findUnique({ where: { id } });
  if (!model) throw new Error(`Model '${id}' not found`);
  return prisma.model.update({ where: { id }, data: input });
}

/** 4.5 Delete a Model. Cascades to all Nodes (enforced by DB foreign key). */
export async function deleteModel(id: string): Promise<void> {
  const model = await prisma.model.findUnique({ where: { id } });
  if (!model) throw new Error(`Model '${id}' not found`);
  await prisma.model.delete({ where: { id } });
}
