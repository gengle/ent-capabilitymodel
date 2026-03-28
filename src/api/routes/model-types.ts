import { Router, Request, Response, NextFunction } from "express";
import { listModelTypes } from "../../services/model-type";

export const modelTypesRouter = Router();

modelTypesRouter.get("/model-types", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await listModelTypes();
    res.json(types.map((t) => ({ id: t.id, name: t.name })));
  } catch (err) {
    next(err);
  }
});
