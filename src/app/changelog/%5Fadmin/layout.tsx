import type { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { AdminHeader } from "@/client/components/admin/adminHeader";
import { SignInCard } from "@/client/components/admin/signInCard";
import { NextAuthSessionProvider } from "@/client/components/nextAuthSessionProvider";
import { authOptions } from "@/server/authOptions";

export const metadata: Metadata = {
  title: "Admin",
  robots: "noindex, nofollow",
};

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <NextAuthSessionProvider>
      <div className="min-h-[calc(100vh-8rem)] bg-[var(--gray-2)] text-[var(--gray-12)]">
        {session ? (
          <>
            <AdminHeader user={session.user ?? {}} />
            <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
              {children}
            </main>
          </>
        ) : (
          <SignInCard />
        )}
      </div>
      <Toaster
        position="bottom-right"
        // Sit above the editor's sticky save bar.
        offset={{ bottom: 96, right: 24 }}
        richColors
        closeButton
      />
    </NextAuthSessionProvider>
  );
}
