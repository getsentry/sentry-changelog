import { CopyChangelogButton } from "@/client/components/copyChangelogButton";

export default function Header({ loading }: { loading?: boolean }) {
  return (
    <div className={`w-full bg-darkPurple ${loading ? "animate-pulse" : ""}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-4xl font-medium text-white tracking-tight">
          Changelog
        </h1>
        <div className="mt-2 flex items-start justify-between gap-4">
          <p className="text-white/60 text-base">
            Stay up to date on everything big and small, from product updates to
            SDK changes.
          </p>
          <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
            {!loading && <CopyChangelogButton />}
            <a
              href="/changelog/feed.xml"
              aria-label="Subscribe to RSS feed"
              className="inline-flex items-center gap-1.5 text-[#fd44b0] text-sm font-semibold uppercase hover:opacity-80 transition-opacity duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M3.75 3a.75.75 0 00-.75.75v.5c0 .414.336.75.75.75H4c6.075 0 11 4.925 11 11v.25c0 .414.336.75.75.75h.5a.75.75 0 00.75-.75V16C17 8.82 11.18 3 4 3h-.25z" />
                <path d="M3 8.75A.75.75 0 013.75 8H4a8 8 0 018 8v.25a.75.75 0 01-.75.75h-.5a.75.75 0 01-.75-.75V16a6 6 0 00-6-6h-.25A.75.75 0 013 9.25v-.5zM7 15a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              RSS
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
