import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import { db } from "@/server/db";
import { Account, Session, User, VerificationToken } from "@/server/db/schema";

const providers: Provider[] = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
];

if (process.env.NODE_ENV === "development") {
  providers.push(
    CredentialsProvider({
      name: "DevProvider",
      credentials: {},
      authorize() {
        return {
          id: "test-user",
          name: "Dev User",
          email: "test.user@sentry.io",
        };
      },
    }),
  );
}

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: User,
    accountsTable: Account,
    sessionsTable: Session as unknown as any,
    verificationTokensTable: VerificationToken,
  } as const) as Adapter,
  providers: providers,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Surface the opaque user id (the JWT subject) on the session so server
    // code can attach it to Sentry via setUser without logging the email (PII).
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
