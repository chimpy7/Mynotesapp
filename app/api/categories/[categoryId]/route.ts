import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";

import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
import { DocumentModel } from "@/models/Document";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    categoryId: string;
  }>;
};

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { categoryId } = await context.params;

  if (!Types.ObjectId.isValid(categoryId)) {
    return NextResponse.json({ error: "Invalid category id." }, { status: 400 });
  }

  try {
    await ensureCurrentUser();

    const category = await CategoryModel.findOne({
      _id: categoryId,
      userId,
    })
      .select("_id")
      .exec();

    if (!category) {
      return NextResponse.json(
        { error: "Category not found." },
        { status: 404 },
      );
    }

    await DocumentModel.updateMany(
      { userId, categoryId: category._id },
      { $set: { categoryId: null, subcategoryId: null } },
      { runValidators: true },
    );

    await CategoryModel.deleteOne({ _id: category._id, userId });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete category.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
