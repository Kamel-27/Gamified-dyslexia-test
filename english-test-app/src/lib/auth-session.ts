type AppSession = {
  user: {
    id: string;
    name: string;
    email: string;
    role: "person" | "admin";
  };
  session: {
    id: string;
    expiresAt: Date;
  };
};

function buildUiOnlySession(): AppSession {
  return {
    user: {
      id: "ui-only-user",
      name: "Guest User",
      email: "guest@lexora.local",
      role: "person",
    },
    session: {
      id: "ui-only-session",
      expiresAt: new Date("2099-01-01T00:00:00.000Z"),
    },
  };
}

export async function getServerSession() {
  return buildUiOnlySession();
}

export async function getRequestSession(_request: Request) {
  return buildUiOnlySession();
}

export function isAdminRole(role: unknown): role is "admin" {
  return role === "admin";
}
