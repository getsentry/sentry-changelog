import { Fragment } from "react";

import { LoadingArticle } from "@/client/components/article";
import Header from "./header";

export default function Loading() {
  return (
    <Fragment>
      <Header loading />
      <main className="w-full bg-surface min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Filter bar skeleton */}
          <div className="py-5 flex items-center gap-2 border-b border-blog-border">
            <div className="h-7 bg-gray-100 animate-pulse rounded-full w-10" />
            <div className="h-7 bg-gray-100 animate-pulse rounded-full w-20" />
            <div className="h-7 bg-gray-100 animate-pulse rounded-full w-16" />
            <div className="h-7 bg-gray-100 animate-pulse rounded-full w-24" />
            <div className="ml-auto h-7 bg-gray-100 animate-pulse rounded-full w-36" />
          </div>

          {/* Jump-to skeleton */}
          <div className="py-3 flex items-center gap-4 border-b border-blog-border">
            <div className="h-3 bg-gray-100 animate-pulse rounded w-14" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
            <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
          </div>

          {/* Feed skeleton */}
          <div className="pt-6 pb-10 space-y-5">
            {/* Month divider skeleton */}
            <div className="flex items-center gap-3 mt-2 mb-4">
              <div className="h-3 bg-gray-100 animate-pulse rounded w-24" />
              <div className="flex-1 h-px bg-gray-100" />
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
