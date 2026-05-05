"use client";

import { useState } from "react";
import { CopyDropdown } from "./copyDropdown";

export function CopyChangelogButton() {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const markdownUrl = "/api/changelog/markdown";
  const aiPrompt = encodeURIComponent(
    "Ask questions about Sentry's changelog: https://sentry.io/changelog/",
  );

  async function handleCopy() {
    setLoading(true);
    try {
      const res = await fetch(markdownUrl);
      if (!res.ok) return;
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard or fetch error — fail silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <CopyDropdown
      onCopy={handleCopy}
      markdownUrl={markdownUrl}
      aiPrompt={aiPrompt}
      copied={copied}
      loading={loading}
      theme="dark"
      wrapperClass="relative z-40"
    />
  );
}
