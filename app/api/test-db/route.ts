import { auth } from "@clerk/nextjs/server";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/db";
import { ensureCurrentUser } from "@/lib/users";
import { CategoryModel } from "@/models/Category";
import { DocumentModel } from "@/models/Document";
import { UserModel } from "@/models/User";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await ensureCurrentUser();
    const connection = await connectToDatabase();

    await connection.connection.db?.admin().ping();

    const [documentCount, categoryCount, userCount] = await Promise.all([
      DocumentModel.countDocuments({ userId }),
      CategoryModel.countDocuments({ userId }),
      UserModel.countDocuments(),
    ]);

    return NextResponse.json({
      ok: true,
      database: connection.connection.name,
      readyState: mongoose.connection.readyState,
      userId,
      localUserId: user?._id.toString() ?? null,
      counts: {
        users: userCount,
        documents: documentCount,
        categories: categoryCount,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed.";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
