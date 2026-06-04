import { auth } from "@clerk/nextjs/server";
import { Types } from "mongoose";
import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";

import { validateCategoryTarget } from "@/lib/categoryAccess";
import { ensureCurrentUser } from "@/lib/users";
import { DocumentModel } from "@/models/Document";
import { updateDocumentSchema } from "@/schemas/document";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    documentId: string;
  }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = await context.params;

  if (!Types.ObjectId.isValid(documentId)) {
    return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
  }

  try {
    const body = updateDocumentSchema.parse(await request.json());

    await ensureCurrentUser();

    const update: {
      title?: string;
      content?: unknown;
      categoryId?: Types.ObjectId | null;
      subcategoryId?: Types.ObjectId | null;
    } = {};

    if ("title" in body) {
      update.title = body.title;
    }

    if ("content" in body) {
      update.content = body.content ?? null;
    }

    if ("categoryId" in body || "subcategoryId" in body) {
      const { categoryObjectId, subcategoryObjectId } =
        await validateCategoryTarget(userId, body);

      update.categoryId = categoryObjectId;
      update.subcategoryId = subcategoryObjectId;
    }

    const document = await DocumentModel.findOneAndUpdate(
      { _id: documentId, userId },
      update,
      { returnDocument: "after", runValidators: true },
    );

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      document: {
        id: document._id.toString(),
        updatedAt: document.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid document data.", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Could not update document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { documentId } = await context.params;

  if (!Types.ObjectId.isValid(documentId)) {
    return NextResponse.json({ error: "Invalid document id." }, { status: 400 });
  }

  try {
    await ensureCurrentUser();

    const document = await DocumentModel.findOneAndDelete({
      _id: documentId,
      userId,
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not delete document.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
