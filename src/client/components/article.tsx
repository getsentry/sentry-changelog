import type { ReactNode } from "react";
import { DateComponent } from "./date";
import { CategoryTag } from "./tag";

type ArticleProps = {
  children?: ReactNode;
  className?: string;
  date?: string | Date | null;
  image?: string | null;
  loading?: boolean;
  slug?: string;
  tags?: string[];
  title?: string;
};

export function Article({
  title = "",
  image,
  tags = [],
  date = null,
  children,
}: ArticleProps) {
  return (
    <article className="bg-white rounded-xl border border-blog-border mb-5 overflow-hidden transition-shadow duration-200 group-hover:shadow-md">
      {image && (
        // biome-ignore lint/performance/noImgElement: <Image> does not resolve here for some reason
        <img
          className="w-full aspect-video object-cover"
          src={image}
          alt={title}
        />
      )}
      <div className="p-6">
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag) => (
              <CategoryTag key={tag} text={tag} />
            ))}
          </div>
        )}
        <h3 className="text-xl font-semibold text-blog-text mb-2 group-hover:text-blog-accent transition-colors duration-150">
          {title}
        </h3>
        <div className="prose prose-sm max-w-none text-blog-muted line-clamp-3 blog-prose">
          {children}
        </div>
        <div className="mt-4 flex items-center justify-between">
          {date && (
            <span className="text-xs text-blog-muted">
              <DateComponent date={date} />
            </span>
          )}
          <span className="text-xs font-medium text-blog-accent group-hover:underline underline-offset-2 ml-auto">
            Read more →
          </span>
        </div>
      </div>
    </article>
  );
}

export function LoadingArticle() {
  return (
    <article className="bg-white rounded-xl border border-blog-border mb-5 overflow-hidden">
      <div className="w-full aspect-video bg-gray-100 animate-pulse" />
      <div className="p-6">
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 bg-gray-100 w-20 animate-pulse rounded-full" />
          <div className="h-5 bg-gray-100 w-16 animate-pulse rounded-full" />
        </div>
        <div className="h-6 bg-gray-100 w-3/4 animate-pulse rounded mb-2" />
        <div className="space-y-1.5 mb-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded" />
          <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
          <div className="h-4 bg-gray-100 animate-pulse rounded w-4/6" />
        </div>
        <div className="h-3 bg-gray-100 w-24 animate-pulse rounded" />
      </div>
    </article>
  );
}
