import { serverConfig } from "./config.js";
import {
  authHandler,
  bootcampRouter,
  checkDatabase,
  enrollmentRouter,
  executiveRouter,
  identityRouter,
  mediaRouter,
  researchContentRouter,
  webinarRouter,
} from "./infrastructure.js";
import { createHttpApp } from "./transport/http/app.js";
import type { Express } from "express";

export const app: Express = createHttpApp({
  authHandler,
  bootcampRouter,
  checkDatabase,
  corsOrigin: serverConfig.corsOrigin,
  enrollmentRouter,
  executiveRouter,
  identityRouter,
  mediaRouter,
  researchContentRouter,
  webinarRouter,
});

export default app;
