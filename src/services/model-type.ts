import { prisma } from "../db/client";
import type { ModelType } from "../../generated/prisma";

export type CreateModelTypeInput = {
  name: string;
  description?: string;
};

/** 2.1 Create a ModelType. Rejects if name already exists. */
export async function createModelType(input: CreateModelTypeInput): Promise<ModelType> {
  const existing = await prisma.modelType.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new Error(`ModelType with name '${input.name}' already exists`);
  }
  return prisma.modelType.create({ data: input });
}

/** 2.2 List all ModelTypes. */
export async function listModelTypes(): Promise<ModelType[]> {
  return prisma.modelType.findMany({ orderBy: { name: "asc" } });
}

/** 2.3 Get a ModelType by ID. */
export async function getModelType(id: string): Promise<ModelType> {
  const modelType = await prisma.modelType.findUnique({ where: { id } });
  if (!modelType) {
    throw new Error(`ModelType '${id}' not found`);
  }
  return modelType;
}

/** 2.4 Delete a ModelType. Rejects if any Models reference it. */
export async function deleteModelType(id: string): Promise<void> {
  const referenced = await prisma.model.count({ where: { modelTypeId: id } });
  if (referenced > 0) {
    throw new Error(
      `Cannot delete ModelType '${id}': ${referenced} Model(s) reference it`
    );
  }
  await prisma.modelType.delete({ where: { id } });
}
