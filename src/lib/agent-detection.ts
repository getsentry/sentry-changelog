// User agents of AI crawlers and AI fetchers, matched case-insensitively
// anywhere in the User-Agent header.
//
// Copied from the sentry.io marketing site, getsentry/static-sites
// packages/www-astro/src/lib/agent-detection.ts. Keep the two lists in step.
// The entries after "Added here" are AI agents that Profound reports and that
// list does not have yet.
const AI_AGENT_PATTERNS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "anthropic-ai",
  "Claude-Web",
  "ClaudeBot",
  "Bytespider",
  "CCBot",
  "PerplexityBot",
  "cohere-ai",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "FacebookBot",
  "YouBot",
  "Diffbot",
  "AI2Bot",
  "Amazonbot",
  "OAI-SearchBot",
  // Live, user-initiated fetchers (a person is waiting on the answer)
  "Claude-User",
  "Claude-Code",
  "Claude-SearchBot",
  "Perplexity-User",
  "meta-externalfetcher",
  "OAI-Operator",
  // Added here
  "MistralAI-User",
  "Google-NotebookLM",
  "DeepSeek",
  "Gemini-Fetch",
  "Google-Agent",
  "Gemini-Deep-Research",
  "Amazon-User",
];

const AI_AGENT_REGEX = new RegExp(
  AI_AGENT_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(
    "|",
  ),
  "i",
);

export function isAiAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return AI_AGENT_REGEX.test(userAgent);
}
