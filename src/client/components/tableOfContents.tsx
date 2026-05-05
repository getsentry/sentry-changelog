"use client";

import { useEffect, useRef, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

function getHeadings(contentSelector: string): Heading[] {
  const container = document.querySelector(contentSelector);
  if (!container) return [];
  const nodes = container.querySelectorAll("h2, h3");
  return Array.from(nodes).map((node) => ({
    id: node.id,
    text: node.textContent ?? "",
    level: Number(node.tagName.slice(1)),
  }));
}

export function TableOfContents({
  contentSelector = ".blog-content",
}: {
  contentSelector?: string;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const h = getHeadings(contentSelector);
    setHeadings(h);
    if (h.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "0px 0px -60% 0px", threshold: 0.1 },
    );

    for (const heading of h) {
      const el = document.getElementById(heading.id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [contentSelector]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-semibold uppercase tracking-widest text-blog-muted mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? "0.75rem" : "0" }}
          >
            <a
              href={`#${heading.id}`}
              className={`text-sm leading-snug transition-colors duration-150 hover:text-blog-accent ${
                activeId === heading.id
                  ? "toc-link-active"
                  : "text-blog-muted"
              }`}
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById(heading.id)
                  ?.scrollIntoView({ behavior: "smooth" });
                setActiveId(heading.id);
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
