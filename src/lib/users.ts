import getClient from "@/lib/db";
import { hasMongoUri } from "@/lib/env";
import { verifyPassword } from "@/lib/password";

export async function getUserFromDb(email: string, password: string) {
  if (!hasMongoUri()) {
    return null;
  }

  const db = getClient().db();
  const user = await db.collection("users").findOne({ email });

  if (!user || typeof user.passwordHash !== "string") {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);

  if (!isValid) {
    return null;
  }

  return {
    id: user._id.toString(),
    email: user.email,
    name: typeof user.name === "string" ? user.name : null,
  };
}
