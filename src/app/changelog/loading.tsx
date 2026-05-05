import { Fragment } from "react";

import { LoadingArticle } from "@/client/components/article";
import Header from "./header";

export default function Loading() {
  return (
    <Fragment>
      <Header loading />
      <main className="w-full bg-darkPurple min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Category nav skeleton */}
          <div className="py-4 flex items-center gap-2 border-b border-white/10">
            <div className="h-8 bg-white/10 animate-pulse rounded-lg w-10" />
            <div className="h-8 bg-white/10 animate-pulse rounded-lg w-20" />
            <div className="h-8 bg-white/10 animate-pulse rounded-lg w-16" />
            <div className="h-8 bg-white/10 animate-pulse rounded-lg w-24" />
            <div className="ml-auto h-8 bg-white/10 animate-pulse rounded-lg w-36" />
          </div>

          {/* Jump-to skeleton */}
          <div className="py-3 flex items-center gap-4 border-b border-white/10">
            <div className="h-3 bg-white/10 animate-pulse rounded w-14" />
            <div className="h-3 bg-white/10 animate-pulse rounded w-20" />
            <div className="h-3 bg-white/10 animate-pulse rounded w-20" />
            <div className="h-3 bg-white/10 animate-pulse rounded w-20" />
          </div>

          {/* Feed skeleton */}
          <div className="pt-6 pb-10 space-y-5">
            {/* Month divider skeleton */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="h-3 bg-white/10 animate-pulse rounded w-24" />
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <LoadingArticle />
            <LoadingArticle />
            <LoadingArticle />
          </div>
        </div>
      </main>
    </Fragment>
  );
}
