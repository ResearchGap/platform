import { auth } from "@platform/auth";
import prisma from "@platform/db";
import { toNodeHandler } from "better-auth/node";

export const authHandler = toNodeHandler(auth);

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
