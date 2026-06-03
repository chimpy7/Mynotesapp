import { auth } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { validateCategoryTarget } from "@/lib/categoryAccess";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";
import { createDocumentSchema } from "@/schemas/document";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createDocumentSchema.parse(await request.json());

    await ensureCurrentUser();

    const { categoryObjectId, subcategoryObjectId } =
      await validateCategoryTarget(userId, body);

    const document = await DocumentModel.create({
      title: body.title,
      content: body.content ?? null,
      userId,
      categoryId: categoryObjectId,
      subcategoryId: subcategoryObjectId,
    });

    return NextResponse.json(
      {
        document: {
          id: document._id.toString(),
          title: document.title,
          content: document.content,
          categoryId: document.categoryId?.toString() ?? null,
          subcategoryId: document.subcategoryId?.toString() ?? null,
          createdAt: document.createdAt,
          updatedAt: document.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid document data.", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Could not create document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
