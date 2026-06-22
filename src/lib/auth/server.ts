import { createNeonAuth } from "@neondatabase/auth/next/server";

const secret = process.env.BETTER_AUTH_SECRET || "default-secret-very-long-and-secure-32-chars";
const url = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = createNeonAuth({
  baseUrl: url,
  cookies: {
    secret: secret,
  },
});

export const { handler, middleware, getSession } = auth;
