import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createSubcategorySchema = z.object({
  name: z.string().trim().min(1).max(80),
});

export const updateSubcategorySchema = createSubcategorySchema.partial();
