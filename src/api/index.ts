import express, { NextFunction, Request, Response } from "express";
import { modelsRouter } from "./routes/models";

const app = express();
const PORT = process.env.API_PORT ?? 3001;

app.use(express.json());

app.use("/api", modelsRouter);

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
