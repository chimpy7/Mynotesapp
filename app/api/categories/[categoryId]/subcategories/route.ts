import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { serializeCategory } from "@/lib/categoryAccess";
import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
import { createSubcategorySchema } from "@/schemas/category";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId } = await context.params;

  if (!Types.ObjectId.isValid(categoryId)) {
    return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
  }

  try {
    const body = createSubcategorySchema.parse(await request.json());

    await ensureCurrentUser();

    const category = await CategoryModel.findOneAndUpdate(
      { _id: categoryId, userId },
      {
        $push: {
          subcategories: {
            name: body.name,
          },
        },
      },
      { returnDocument: "after", runValidators: true },
    );

    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { category: serializeCategory(category) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid subcategory data.", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Could not create subcategory.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
