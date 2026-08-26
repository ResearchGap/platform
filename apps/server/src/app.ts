import { serverConfig } from "./config";
import {
  authHandler,
  checkDatabase,
  identityRouter,
  researchContentRouter,
} from "./infrastructure";
import { createHttpApp } from "./transport/http/app";
import type { Express } from "express";

export const app: Express = createHttpApp({
  authHandler,
  checkDatabase,
  corsOrigin: serverConfig.corsOrigin,
  identityRouter,
  researchContentRouter,
});
