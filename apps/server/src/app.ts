import { serverConfig } from "./config";
import {
  authHandler,
  bootcampRouter,
  checkDatabase,
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
  identityRouter,
  researchContentRouter,
  webinarRouter,
});
