import React from "react";
import Button from "../atoms/Button";

interface FeaturedContentProps {
  content: {
    coverImage?: {
      url: string;
      srcset?: string;
      sizes?: string;
      description?: string;
      width?: number;
      height?: number;
    };
    title: string;
    description?: string;
    link?: string;
    cta?: string;
  };
  isDarkMode?: boolean;
  className?: string;
}

export default function FeaturedContent({
  content,
  isDarkMode,
  className,
}: FeaturedContentProps) {
  const { coverImage, title, description, link, cta } = content;

  return (
    <div
      className={`flex flex-col h-full rounded-lg ${
        isDarkMode ? "bg-gray-800" : "bg-featured-light"
      } ${className || ""}`}
    >
      <div className="flex flex-col gap-4 flex-1">
        {coverImage && (
          <div className="w-full h-[142px] rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={
                coverImage.url.startsWith("//")
                  ? `https:${coverImage.url}`
                  : coverImage.url
              }
              alt={title}
              width={400}
              height={142}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex flex-col gap-3 flex-1">
          <h3
            className={`text-xl font-sans leading-tight font-semibold ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          {description && (
            <p
              className={`text-sm font-sans flex-1 whitespace-pre-line ${
                isDarkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              {description}
            </p>
          )}
          {link && (
            <div className="mt-auto pt-4">
              <Button
                href={link}
                variant="secondary-light"
                redesign={true}
                darkMode={isDarkMode}
              >
                {cta || `Read full article: ${title}`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
