import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ZodError } from "zod";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import client from "@/lib/db";
import { sendVerificationRequest } from "@/lib/send-verification-request";
import { getUserFromDb } from "@/lib/users";
import { signInSchema } from "@/lib/zod";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    Google,
    {
      id: "email",
      name: "Email",
      type: "email",
      from: process.env.AUTH_EMAIL_FROM,
      maxAge: 24 * 60 * 60,
      sendVerificationRequest,
    },
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "you@example.com",
        },
        password: {
          label: "Password",
          type: "password",
          placeholder: "********",
        },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } =
            await signInSchema.parseAsync(credentials);
          const user = await getUserFromDb(email, password);

          if (!user) {
            return null;
          }

          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            return null;
          }

          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const protectedPrefixes = ["/account", "/bookings", "/admin"];
      const isProtected = protectedPrefixes.some((prefix) =>
        nextUrl.pathname.startsWith(prefix),
      );

      if (isProtected) {
        return !!auth?.user;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
