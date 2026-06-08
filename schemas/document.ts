import { z } from "zod";

import {
  documentLengthErrorMessage,
  isDocumentContentWithinLimits,
} from "@/lib/documentLimits";
import { nullableObjectIdSchema } from "@/schemas/common";

export const createDocumentSchema = z.object({
  title: z.string().trim().min(1).max(120),
  content: z
    .unknown()
    .optional()
    .refine(isDocumentContentWithinLimits, documentLengthErrorMessage),
  categoryId: nullableObjectIdSchema,
  subcategoryId: nullableObjectIdSchema,
});

export const updateDocumentSchema = createDocumentSchema.partial();

export const moveDocumentSchema = z.object({
  categoryId: nullableObjectIdSchema,
  subcategoryId: nullableObjectIdSchema,
});
