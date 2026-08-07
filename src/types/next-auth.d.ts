import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      // Opaque user id (JWT subject), populated in the session callback so it
      // can be passed to Sentry.setUser without exposing the user's email.
      id?: string;
    } & DefaultSession["user"];
  }
}
