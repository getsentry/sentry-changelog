import "../prism-sentry.css";

import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Fragment, type ReactNode } from "react";
import GlobalHeader from "@/client/components/organisms/GlobalHeader";
import { getBlogGeneralSettingsByEntryTitle } from "@/lib/contentful/navigation";

export const metadata: Metadata = {
  title: { template: "%s | Sentry Changelog", default: "Changelog" },
  openGraph: {
    images: "/img/hero.png",
  },
};

export default async function ChangelogLayout({
  children,
}: {
  children: ReactNode;
}) {
  let menuItems: any[] = [];

  try {
    const headerData =
      await getBlogGeneralSettingsByEntryTitle("Global Header");
    menuItems = headerData?.menuItems || [];
  } catch (error) {
    console.error("Failed to fetch navigation data:", error);
  }

  return (
    <Fragment>
      <NextTopLoader color="#8d5494" />
      <div className="font-sans">
        <GlobalHeader menuItems={menuItems} mode="dark" />
        <div className="bg-gray-100">{children}</div>
        <div className="w-full mx-auto h-16 relative bg-darkPurple">
          <div className="footer-top-right-down-slope absolute w-full -top-1 h-10 bg-gray-200" />
        </div>
      </div>
    </Fragment>
  );
}
