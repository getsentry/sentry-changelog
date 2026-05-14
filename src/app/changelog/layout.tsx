import "../prism-sentry.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Fragment, type ReactNode } from "react";
import GlobalHeader from "@/client/components/organisms/GlobalHeader";
import { getHeaderMenuItems } from "@/lib/navigation";

export const metadata: Metadata = {
  title: { template: "%s | Sentry Changelog", default: "Changelog" },
  openGraph: {
    images: "/img/hero.png",
  },
};

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  const menuItems = getHeaderMenuItems();

  return (
    <Fragment>
      <NextTopLoader color="#fd44b0" showSpinner={false} />
      <div className="font-sans bg-darkPurple min-h-screen flex flex-col">
        <GlobalHeader menuItems={menuItems} mode="dark" />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-white/10 bg-darkPurple py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-xs text-white/40 text-center">
            © {new Date().getFullYear()} Sentry. All rights reserved.
          </div>
        </footer>
      </div>
    </Fragment>
  );
}
