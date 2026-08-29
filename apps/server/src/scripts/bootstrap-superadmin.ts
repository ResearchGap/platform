import { env } from "@platform/env/server";

import { PrismaIdentityRepository } from "../infrastructure/database/prisma-identity.repository.js";

if (!env.SUPERADMIN_EMAIL) {
  throw new Error("SUPERADMIN_EMAIL must be set explicitly before running this command");
}

const repository = new PrismaIdentityRepository();
const result = await repository.bootstrapSuperadmin(env.SUPERADMIN_EMAIL);

console.log(`Superadmin access configured for Better Auth user ${result.userId}`);
