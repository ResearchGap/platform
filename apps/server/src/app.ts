import { serverConfig } from "./config";
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
} from "./infrastructure";
import { createHttpApp } from "./transport/http/app";
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
