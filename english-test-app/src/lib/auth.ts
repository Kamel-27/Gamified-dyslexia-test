import { db } from "@/lib/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

const adminEmailSet = new Set(
  (process.env.BETTER_AUTH_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0),
);

const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

export const auth = betterAuth({
  appName: "Lexora",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    modelName: "authUser",
    additionalFields: {
      role: {
        type: ["person", "admin"] as const,
        required: false,
        defaultValue: "person",
        input: false,
      },
    },
  },
  session: {
    modelName: "authSession",
  },
  account: {
    modelName: "authAccount",
  },
  verification: {
    modelName: "authVerification",
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const normalizedEmail = user.email.toLowerCase();
          const role = adminEmailSet.has(normalizedEmail)
            ? "admin"
            : (user.role ?? "person");

          return {
            data: {
              ...user,
              role,
            },
          };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
