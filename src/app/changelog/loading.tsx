import { Fragment } from "react";

import { LoadingArticle } from "@/client/components/article";
import Header from "./header";

export default function Loading() {
  return (
    <Fragment>
      <Header loading />
      <main className="w-full bg-darkPurple min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="sm:flex sm:gap-10">
            {/* Feed skeleton */}
            <div className="flex-1 min-w-0 pt-6 pb-10">
              {/* Month divider skeleton */}
              <div className="flex items-center gap-3 mt-2 mb-4">
                <div className="h-3 bg-white/10 animate-pulse rounded w-24" />
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <LoadingArticle />
              <LoadingArticle />
              <LoadingArticle />
            </div>

            {/* Sidebar skeleton — desktop only */}
            <div className="hidden sm:block w-40 flex-shrink-0">
              <div className="pt-6">
                <div className="h-8 bg-white/10 animate-pulse rounded-lg w-full mb-6" />
                <div className="h-3 bg-white/10 animate-pulse rounded w-14 mb-3" />
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-white/10 animate-pulse rounded w-24" />
                  <div className="h-3 bg-white/10 animate-pulse rounded w-20" />
                  <div className="h-3 bg-white/10 animate-pulse rounded w-22" />
                  <div className="h-3 bg-white/10 animate-pulse rounded w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}
