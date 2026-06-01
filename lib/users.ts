import { currentUser } from "@clerk/nextjs/server";

import { connectToDatabase } from "@/lib/db";
import { UserModel } from "@/models/User";

export async function ensureCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    "";

  if (!primaryEmail) {
    throw new Error("Signed-in Clerk user does not have an email address.");
  }

  await connectToDatabase();

  return UserModel.findOneAndUpdate(
    { clerkId: clerkUser.id },
    {
      $set: {
        email: primaryEmail,
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        imageUrl: clerkUser.imageUrl ?? "",
        lastSeenAt: new Date(),
      },
      $setOnInsert: {
        clerkId: clerkUser.id,
      },
    },
    {
      returnDocument: "after",
      upsert: true,
      runValidators: true,
    },
  );
}
