import { Router, Request, Response, NextFunction } from "express";
import { listNodeKinds } from "../../services/node-kind";

export const nodeKindsRouter = Router();

nodeKindsRouter.get("/node-kinds", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const kinds = await listNodeKinds();
    res.json(kinds.map((k) => ({ id: k.id, name: k.name })));
  } catch (err) {
    next(err);
  }
});
