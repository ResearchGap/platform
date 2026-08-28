import { z } from "zod";

export const mediaIdSchema = z.string().trim().min(1).max(100);
