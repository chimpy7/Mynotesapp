import { Types } from "mongoose";

import { CategoryModel, type Category } from "@/models/Category";

type CategoryTarget = {
  categoryId?: string | null;
  subcategoryId?: string | null;
};

export async function validateCategoryTarget(
  userId: string,
  target: CategoryTarget,
) {
  const categoryId = target.categoryId ?? null;
  const subcategoryId = target.subcategoryId ?? null;

  if (!categoryId && subcategoryId) {
    throw new Error("A subcategory requires a category.");
  }

  if (!categoryId) {
    return {
      categoryObjectId: null,
      subcategoryObjectId: null,
    };
  }

  const category = await CategoryModel.findOne({
    _id: categoryId,
    userId,
  }).exec();

  if (!category) {
    throw new Error("Category not found.");
  }

  if (subcategoryId) {
    const hasSubcategory = category.subcategories.some((subcategory) =>
      subcategory._id.equals(subcategoryId),
    );

    if (!hasSubcategory) {
      throw new Error("Subcategory not found in this category.");
    }
  }

  return {
    categoryObjectId: new Types.ObjectId(categoryId),
    subcategoryObjectId: subcategoryId
      ? new Types.ObjectId(subcategoryId)
      : null,
  };
}

export function serializeCategory(category: Category) {
  return {
    id: category._id.toString(),
    name: category.name,
    subcategories: category.subcategories.map((subcategory) => ({
      id: subcategory._id.toString(),
      name: subcategory.name,
    })),
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}
