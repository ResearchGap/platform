import { afterEach, describe, expect, test } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { RequestHandler } from "express";

import { createHttpApp } from "./app.js";

const servers: Server[] = [];
const authHandler: RequestHandler = (_request, response) => {
  response.sendStatus(404);
};

async function startServer(checkDatabase: () => Promise<void>) {
  const app = createHttpApp({
    authHandler,
    checkDatabase,
    corsOrigin: "http://localhost:3001",
  });

  const server = await new Promise<Server>((resolve) => {
    const listeningServer = app.listen(0, "127.0.0.1", () => resolve(listeningServer));
  });
  servers.push(server);

  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("operational endpoints", () => {
  test("health reports a live process", async () => {
    const origin = await startServer(async () => undefined);

    const response = await fetch(`${origin}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  test("ready reports successful database readiness", async () => {
    const origin = await startServer(async () => undefined);

    const response = await fetch(`${origin}/ready`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ready" });
  });

  test("ready does not expose database errors", async () => {
    const origin = await startServer(async () => {
      throw new Error("sensitive database details");
    });

    const response = await fetch(`${origin}/ready`);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "not_ready" });
  });
});
