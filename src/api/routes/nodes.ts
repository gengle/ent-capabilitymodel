import { Router, Request, Response } from "express";
import { updateNode, deleteNode } from "../../services/node";
import { handleServiceError } from "./models";

export const nodesRouter = Router();

// ─── PUT /api/nodes/:id ───────────────────────────────────────────────────────

nodesRouter.put("/nodes/:id", async (req: Request, res: Response) => {
  const { name, description, owner, properties } = req.body ?? {};
  try {
    const node = await updateNode(req.params.id as string, { name, description, owner, properties });
    res.json(node);
  } catch (err) {
    handleServiceError(err, res);
  }
});

// ─── DELETE /api/nodes/:id ────────────────────────────────────────────────────

nodesRouter.delete("/nodes/:id", async (req: Request, res: Response) => {
  try {
    await deleteNode(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    handleServiceError(err, res);
  }
});
