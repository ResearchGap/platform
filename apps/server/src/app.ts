import { serverConfig } from "./config";
import {
  authHandler,
  bootcampRouter,
  checkDatabase,
  enrollmentRouter,
  identityRouter,
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
  identityRouter,
  researchContentRouter,
  webinarRouter,
});
