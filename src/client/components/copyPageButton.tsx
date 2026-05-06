"use client";

import { useEffect, useState } from "react";
import { CopyDropdown } from "./copyDropdown";

interface CopyPageButtonProps {
  title: string;
  slug: string;
  content: string;
}

export function CopyPageButton({ title, slug, content }: CopyPageButtonProps) {
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState(`https://sentry.io/changelog/${slug}`);

  useEffect(() => {
    setPageUrl(`${window.location.origin}/changelog/${slug}`);
  }, [slug]);

  const markdownUrl = `/api/changelog/${slug}/markdown`;
  const aiPrompt = encodeURIComponent(
    `Ask questions about this Sentry changelog entry: ${pageUrl}`,
  );

  async function handleCopy() {
    const header = `# ${title}\n\nSource: ${pageUrl}\n\n`;
    try {
      await navigator.clipboard.writeText(header + content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_e) {}
  }

  return (
    <CopyDropdown
      onCopy={handleCopy}
      markdownUrl={markdownUrl}
      aiPrompt={aiPrompt}
      copied={copied}
      theme="light"
      wrapperClass="relative z-10"
    />
  );
}
