import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "arcsale_session";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface SessionCookie {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
}

function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  const sessionId = match[1];
  return isValidUUID(sessionId) ? sessionId : null;
}

function createSessionCookie(sessionId: string): SessionCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 31536000, // 1 year
    path: "/",
  };
}

export function getOrCreateSessionId(request: NextRequest): [string, SessionCookie | null] {
  const cookieHeader = request.headers.get("cookie");
  const existingSessionId = parseSessionCookie(cookieHeader);

  if (existingSessionId) {
    return [existingSessionId, null];
  }

  const newSessionId = crypto.randomUUID();
  const cookie = createSessionCookie(newSessionId);

  return [newSessionId, cookie];
}
