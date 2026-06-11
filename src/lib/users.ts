import client from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function getUserFromDb(email: string, password: string) {
  const db = client.db();
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
