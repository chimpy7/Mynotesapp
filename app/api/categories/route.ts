import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { serializeCategory } from "@/lib/categoryAccess";
import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
import { createCategorySchema } from "@/schemas/category";

export const runtime = "nodejs";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createCategorySchema.parse(await request.json());

    await ensureCurrentUser();

    const duplicateNamePattern = new RegExp(
      `^${escapeRegExp(body.name)}$`,
      "i",
    );

    if (await CategoryModel.exists({ userId, name: duplicateNamePattern })) {
      return NextResponse.json(
        { error: "A category with this name already exists." },
        { status: 409 },
      );
    }

    const category = await CategoryModel.create({
      name: body.name,
      userId,
    });

    return NextResponse.json(
      { category: serializeCategory(category) },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid category data.", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Could not create category.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
