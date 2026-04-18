import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getRequestSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export function isAdminRole(role: unknown): role is "admin" {
  return role === "admin";
}
