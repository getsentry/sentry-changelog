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
    <article className="fancy-border bg-transparent rounded-md mb-5 overflow-hidden">
      {image && (
        // biome-ignore lint/performance/noImgElement: <Image> does not resolve here for some reason
        <img
          className="w-full object-cover"
          style={{ aspectRatio: "2/1" }}
          src={image}
          alt={title}
        />
      )}
      <div className="py-5">
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <CategoryTag key={tag} text={tag} />
            ))}
          </div>
        )}
        <h3 className="text-base font-medium text-white mb-2 leading-snug line-clamp-2 group-hover:text-white/80 transition-colors duration-150">
          {title}
        </h3>
        <div className="prose prose-sm max-w-none text-white/70 line-clamp-3 blog-prose-dark">
          {children}
        </div>
        <div className="mt-4 flex items-center justify-between">
          {date && (
            <span className="text-xs text-white/50">
              <DateComponent date={date} />
            </span>
          )}
          <span className="text-[14px] font-semibold text-[#fd44b0] uppercase ml-auto">
            Read On →
          </span>
        </div>
      </div>
    </article>
  );
}

export function LoadingArticle() {
  return (
    <article className="bg-transparent rounded-md mb-5 overflow-hidden">
      <div
        className="w-full bg-white/10 animate-pulse"
        style={{ aspectRatio: "2/1" }}
      />
      <div className="py-5">
        <div className="flex gap-2 mb-2">
          <div className="h-3 bg-white/10 w-16 animate-pulse rounded" />
          <div className="h-3 bg-white/10 w-12 animate-pulse rounded" />
        </div>
        <div className="h-5 bg-white/10 w-3/4 animate-pulse rounded mb-2" />
        <div className="space-y-1.5 mb-4">
          <div className="h-4 bg-white/10 animate-pulse rounded" />
          <div className="h-4 bg-white/10 animate-pulse rounded w-5/6" />
          <div className="h-4 bg-white/10 animate-pulse rounded w-4/6" />
        </div>
        <div className="h-3 bg-white/10 w-24 animate-pulse rounded" />
      </div>
    </article>
  );
}
