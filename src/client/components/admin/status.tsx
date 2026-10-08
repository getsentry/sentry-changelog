import { Badge } from "@radix-ui/themes";

export type ChangelogStatus = "published" | "draft" | "deleted";

export function getChangelogStatus(changelog: {
  published: boolean;
  deleted: boolean;
}): ChangelogStatus {
  if (changelog.deleted) return "deleted";
  return changelog.published ? "published" : "draft";
}

const STATUS_BADGE = {
  published: { label: "Published", color: "green" },
  draft: { label: "Draft", color: "amber" },
  deleted: { label: "Deleted", color: "red" },
} as const;

export function StatusBadge({ status }: { status: ChangelogStatus }) {
  const { label, color } = STATUS_BADGE[status];
  return (
    <Badge color={color} variant="soft" radius="full">
      <span
        aria-hidden
        className="inline-block size-1.5 rounded-full bg-current opacity-80"
      />
      {label}
    </Badge>
  );
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : ""))
    .toUpperCase()
    .slice(0, 2);
}
