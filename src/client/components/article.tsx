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
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] mb-5 overflow-hidden transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-[#fd44b0]/30 group-hover:shadow-[0_8px_32px_rgba(253,68,176,0.08),0_2px_8px_rgba(0,0,0,0.3)]">
      {image && (
        // biome-ignore lint/performance/noImgElement: <Image> does not resolve here for some reason
        <img
          className="w-full object-cover"
          style={{ aspectRatio: "2/1" }}
          src={image}
          alt={title}
        />
      )}
      <div className="p-5">
        {Array.isArray(tags) && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <CategoryTag key={tag} text={tag} />
            ))}
          </div>
        )}
        <h3 className="text-base font-medium text-white mb-2 leading-snug line-clamp-2">
          {title}
        </h3>
        <div className="prose prose-sm max-w-none text-white/75 line-clamp-3 blog-prose-dark">
          {children}
        </div>
        <div className="mt-4 flex items-center justify-between">
          {date && (
            <span className="text-xs text-white/60">
              <DateComponent date={date} />
            </span>
          )}
          <span className="text-[13px] font-semibold text-[#fd44b0] uppercase tracking-wide ml-auto transition-colors duration-200">
            Read On →
          </span>
        </div>
      </div>
    </div>
  );
}

export function LoadingArticle({
  variant = "dark",
}: {
  variant?: "dark" | "light";
}) {
  const sk = variant === "light" ? "bg-gray-200" : "bg-white/10";
  const border =
    variant === "light" ? "border-gray-200" : "border-white/[0.07]";
  const bg = variant === "light" ? "bg-white" : "bg-white/[0.03]";

  return (
    <article
      className={`rounded-xl border ${border} ${bg} mb-5 overflow-hidden`}
    >
      <div className="p-5">
        <div className={`h-5 ${sk} w-3/4 animate-pulse rounded mb-2`} />
        <div className="space-y-1.5 mb-4">
          <div className={`h-4 ${sk} animate-pulse rounded`} />
          <div className={`h-4 ${sk} animate-pulse rounded w-5/6`} />
          <div className={`h-4 ${sk} animate-pulse rounded w-4/6`} />
        </div>
        <div className="flex items-center justify-between">
          <div className={`h-3 ${sk} w-24 animate-pulse rounded`} />
          <div className={`h-3 ${sk} w-16 animate-pulse rounded`} />
        </div>
      </div>
    </article>
  );
}
