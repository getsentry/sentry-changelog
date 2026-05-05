"use client";

import { useRef, useState } from "react";

interface CopyPageButtonProps {
  title: string;
  slug: string;
  content: string;
}

export function CopyPageButton({ title, slug, content }: CopyPageButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pageUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/changelog/${slug}`
      : `https://sentry.io/changelog/${slug}`;

  const markdownUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/changelog/${slug}/markdown`
      : `https://sentry.io/api/changelog/${slug}/markdown`;

  const aiPrompt = encodeURIComponent(
    `Ask questions about this Sentry changelog entry: ${pageUrl}`,
  );

  function handleCopyMarkdown() {
    const header = `# ${title}\n\nSource: ${pageUrl}\n\n`;
    navigator.clipboard.writeText(header + content).then(() => {
      setCopied(true);
      setOpen(false);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative z-50" ref={containerRef}>
      {/* Split button */}
      <div className="flex items-center rounded-lg border border-blog-border overflow-hidden text-sm text-blog-muted">
        <button
          type="button"
          onClick={handleCopyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-surface-overlay transition-colors duration-150"
        >
          {copied ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5 text-green-500"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
              aria-hidden="true"
            >
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
          )}
          <span>{copied ? "Copied!" : "Copy page"}</span>
        </button>

        <div className="w-px self-stretch bg-blog-border" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="More options"
          aria-expanded={open}
          className="px-2 py-1.5 hover:bg-surface-overlay transition-colors duration-150"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-1.5 w-64 z-20 bg-white border border-blog-border rounded-xl shadow-lg py-1 overflow-hidden">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-surface-overlay transition-colors duration-150 text-left"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mt-0.5 text-blog-muted shrink-0"
                aria-hidden="true"
              >
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-blog-text">
                  Copy page
                </div>
                <div className="text-xs text-blog-muted">
                  Copy page as Markdown for LLMs
                </div>
              </div>
            </button>

            <a
              href={markdownUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-surface-overlay transition-colors duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 mt-0.5 text-blog-muted shrink-0"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <div className="text-sm font-medium text-blog-text">
                  View as Markdown
                </div>
                <div className="text-xs text-blog-muted">
                  View this page as plain text
                </div>
              </div>
            </a>

            <div className="my-1 border-t border-blog-border" />

            <a
              href={`https://chatgpt.com/?q=${aiPrompt}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-surface-overlay transition-colors duration-150"
            >
              {/* ChatGPT icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 mt-0.5 text-blog-muted shrink-0"
                aria-hidden="true"
              >
                <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-blog-text flex items-center gap-1">
                  Open in ChatGPT
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    className="w-3 h-3 text-blog-muted"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.884 2.25a.75.75 0 000 1.5h2.566L2.22 7.97a.75.75 0 101.06 1.06l4.22-4.22v2.56a.75.75 0 001.5 0V2.25H3.884z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs text-blog-muted">
                  Ask ChatGPT questions about this page
                </div>
              </div>
            </a>

            <a
              href={`https://claude.ai/new?q=${aiPrompt}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-start gap-3 w-full px-4 py-2.5 hover:bg-surface-overlay transition-colors duration-150"
            >
              {/* Claude icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 mt-0.5 text-blog-muted shrink-0"
                aria-hidden="true"
              >
                <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-1.778-.097-.614-.028C.88 12.6.272 12.003 0 11.498c0-.317.068-.61.054-.977l.714-.287 1.11.155 1.944.347 2.378.575 1.944.468 1.067.28-.895-.949-1.614-1.677-1.572-1.664-1.261-1.35-.431-.528C2.851 6.606 2.636 5.77 2.8 5.033c.137-.635.48-1.118 1.034-1.44.218-.076.43-.113.64-.113.427 0 .85.158 1.24.46l.018.01.44.42 1.106 1.166 1.836 1.942 1.344 1.44.874.939-.026-.616-.12-1.564-.173-2.496-.087-1.634-.063-1.159.016-.507C11.002 2.637 11.43 2 12.186 2c.574 0 1.163.398 1.38.967l.076.337-.03.856-.25 2.853-.26 2.13-.19 1.49.018.031.26-.468.942-1.644 1.175-2.004 1.167-1.942.677-1.121.185-.28c.336-.408.72-.644 1.155-.703.08-.01.162-.014.24-.014.387 0 .764.126 1.066.38.433.356.72.901.69 1.48-.022.432-.198.86-.52 1.272l-.098.13-.783 1.15-1.806 2.515-.773 1.124-.365.53.561-.17 2.069-.618 1.943-.538 1.69-.424.801-.176.564-.11c.633-.047 1.157.15 1.523.511.295.29.461.68.461 1.088 0 .36-.12.726-.4 1.01-.43.435-1.016.61-1.66.61h-.026l-.84-.06-2.017-.29-2.44-.5-.738-.155.476.386 1.237 1.015 1.82 1.512 1.052.893.766.688.34.356c.347.42.507.878.468 1.337-.045.532-.348 1.01-.795 1.282a1.674 1.674 0 01-.88.254c-.463 0-.932-.18-1.32-.53l-.602-.58-1.328-1.4-1.455-1.616-1.28-1.436-.523-.59-.038.054.04.852.104 2.19.068 1.958.024 1.646-.045.695c-.103.635-.397 1.13-.855 1.393a1.748 1.748 0 01-.88.236c-.418 0-.843-.136-1.175-.405-.42-.34-.67-.862-.67-1.425 0-.116.013-.237.038-.36l.13-.695.442-1.89.746-2.772.526-1.83.15-.52-.472.322-1.776 1.257-1.64 1.128-1.404.927-.655.407-.397.22c-.4.178-.786.267-1.151.267-.661 0-1.218-.296-1.57-.842-.285-.44-.37-.985-.229-1.534.105-.403.335-.78.64-1.071l.43-.365 1.248-.855z" />
              </svg>
              <div>
                <div className="text-sm font-medium text-blog-text flex items-center gap-1">
                  Open in Claude
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                    className="w-3 h-3 text-blog-muted"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.884 2.25a.75.75 0 000 1.5h2.566L2.22 7.97a.75.75 0 101.06 1.06l4.22-4.22v2.56a.75.75 0 001.5 0V2.25H3.884z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="text-xs text-blog-muted">
                  Ask Claude questions about this page
                </div>
              </div>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
