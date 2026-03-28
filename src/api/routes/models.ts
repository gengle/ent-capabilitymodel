import { Router, Request, Response, NextFunction } from "express";
import { listModels, getModel } from "../../services/model";
import { listNodesByModel } from "../../services/node";
import type { Node } from "../../../generated/prisma/models";

export const modelsRouter = Router();

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubCapability {
  id: string;
  name: string;
  description: string | null;
  owner: string | null;
  level: number;
  properties: Record<string, unknown>;
}

interface Capability {
  id: string;
  name: string;
  description: string | null;
  owner: string | null;
  level: number;
  kind: string | null;
  properties: Record<string, unknown>;
  subCapabilities: SubCapability[];
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  level: number;
  capabilities: Capability[];
}

interface Domain {
  id: string;
  name: string;
  description: string | null;
  level: number;
  groups: Group[];
}

interface ModelTree {
  id: string;
  name: string;
  description: string | null;
  modelType: string;
  domains: Domain[];
}

// ─── Tree assembly ────────────────────────────────────────────────────────────

function assembleTree(nodes: (Node & { kind?: { name: string } | null })[], modelName: string, modelDescription: string | null, modelId: string, modelTypeName: string): ModelTree {
  const byParent = new Map<string | null, typeof nodes>();
  for (const node of nodes) {
    const key = node.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(node);
  }

  const domains: Domain[] = (byParent.get(null) ?? []).map((domNode) => ({
    id: domNode.id,
    name: domNode.name,
    description: domNode.description,
    level: domNode.level,
    groups: (byParent.get(domNode.id) ?? []).map((grpNode) => ({
      id: grpNode.id,
      name: grpNode.name,
      description: grpNode.description,
      level: grpNode.level,
      capabilities: (byParent.get(grpNode.id) ?? []).map((capNode) => ({
        id: capNode.id,
        name: capNode.name,
        description: capNode.description,
        owner: capNode.owner,
        level: capNode.level,
        kind: (capNode as any).kind?.name ?? null,
        properties: JSON.parse(capNode.properties) as Record<string, unknown>,
        subCapabilities: (byParent.get(capNode.id) ?? []).map((subNode) => ({
          id: subNode.id,
          name: subNode.name,
          description: subNode.description,
          owner: subNode.owner,
          level: subNode.level,
          properties: JSON.parse(subNode.properties) as Record<string, unknown>,
        })),
      })),
    })),
  }));

  return { id: modelId, name: modelName, description: modelDescription, modelType: modelTypeName, domains };
}

// ─── GET /api/models ──────────────────────────────────────────────────────────

modelsRouter.get("/models", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const models = await listModels();
    res.json(
      models.map((m: any) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        modelType: m.modelType?.name ?? null,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/models/:id/tree ─────────────────────────────────────────────────

modelsRouter.get("/models/:id/tree", async (req: Request, res: Response, next: NextFunction) => {
  try {
    let model: any;
    try {
      model = await getModel(req.params.id);
    } catch {
      res.status(404).json({ error: `Model '${req.params.id}' not found` });
      return;
    }

    const nodes = await listNodesByModel(model.id) as any[];
    const tree = assembleTree(nodes, model.name, model.description, model.id, model.modelType?.name ?? "");
    res.json(tree);
  } catch (err) {
    next(err);
  }
});
