import cors from "cors";
import express, { type Express, type RequestHandler, type Router } from "express";

interface HttpAppDependencies {
  authHandler: RequestHandler;
  checkDatabase: () => Promise<void>;
  corsOrigin: string;
  identityRouter?: Router;
  researchContentRouter?: Router;
  webinarRouter?: Router;
}

export function createHttpApp({
  authHandler,
  checkDatabase,
  corsOrigin,
  identityRouter,
  researchContentRouter,
  webinarRouter,
}: HttpAppDependencies): Express {
  const app = express();

  app.use(
    cors({
      origin: corsOrigin,
      methods: ["GET", "POST", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );

  app.all("/api/auth{/*path}", authHandler);

  app.use(express.json());

  if (identityRouter) {
    app.use("/api", identityRouter);
  }
  if (researchContentRouter) {
    app.use("/api", researchContentRouter);
  }
  if (webinarRouter) {
    app.use("/api", webinarRouter);
  }

  app.get("/", (_request, response) => {
    response.status(200).send("OK");
  });

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  app.get("/ready", async (_request, response) => {
    try {
      await checkDatabase();
      response.status(200).json({ status: "ready" });
    } catch {
      response.status(503).json({ status: "not_ready" });
    }
  });

  return app;
}
