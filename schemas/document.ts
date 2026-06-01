import { z } from "zod";

import { nullableObjectIdSchema } from "@/schemas/common";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z.unknown().optional(),
  categoryId: nullableObjectIdSchema,
  subcategoryId: nullableObjectIdSchema,
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const moveDocumentSchema = z.object({
  categoryId: nullableObjectIdSchema,
  subcategoryId: nullableObjectIdSchema,
});
