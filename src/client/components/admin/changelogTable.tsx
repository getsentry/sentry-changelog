"use client";

import {
  DotsHorizontalIcon,
  ExternalLinkIcon,
  EyeOpenIcon,
  MagnifyingGlassIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";
import {
  Avatar,
  Badge,
  Button,
  Card,
  DropdownMenu,
  Flex,
  IconButton,
  SegmentedControl,
  Spinner,
  Table,
  Text,
  TextField,
  Tooltip,
} from "@radix-ui/themes";
import Link from "next/link";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";
import {
  type ChangelogStatus,
  formatDate,
  initials,
  StatusBadge,
} from "./status";
import { useStatusActions } from "./statusActions";

export type ChangelogRow = {
  id: string;
  title: string;
  slug: string;
  status: ChangelogStatus;
  createdAt: string;
  publishedAt: string | null;
  authorName: string | null;
  authorImage: string | null;
  categories: string[];
};

const FILTERS = ["all", "draft", "published", "deleted"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  draft: "Drafts",
  published: "Published",
  deleted: "Deleted",
};

const MAX_VISIBLE_CATEGORIES = 3;

function matchesFilter(row: ChangelogRow, filter: Filter) {
  // Deleted posts only show up in their own tab so they don't clutter "All".
  if (filter === "all") return row.status !== "deleted";
  return row.status === filter;
}

export function ChangelogTable({ rows }: { rows: ChangelogRow[] }) {
  const [filter, setFilter] = useQueryState(
    "status",
    parseAsStringLiteral(FILTERS).withDefault("all"),
  );
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ throttleMs: 200 }),
  );
  const { request, dialog, isPending } = useStatusActions();

  const counts = useMemo(() => {
    const result = { all: 0, draft: 0, published: 0, deleted: 0 };
    for (const row of rows) {
      for (const f of FILTERS) if (matchesFilter(row, f)) result[f]++;
    }
    return result;
  }, [rows]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (row) =>
        matchesFilter(row, filter) &&
        (!q ||
          row.title.toLowerCase().includes(q) ||
          row.slug.toLowerCase().includes(q) ||
          row.categories.some((c) => c.toLowerCase().includes(q)) ||
          row.authorName?.toLowerCase().includes(q)),
    );
  }, [rows, filter, query]);

  return (
    <Flex direction="column" gap="3">
      <Flex gap="3" align="center" justify="between" wrap="wrap">
        <div className="w-full overflow-x-auto sm:w-auto">
          <SegmentedControl.Root
            value={filter}
            onValueChange={(value) =>
              setFilter(value === "all" ? null : (value as Filter))
            }
          >
            {FILTERS.map((f) => (
              <SegmentedControl.Item key={f} value={f}>
                {FILTER_LABELS[f]}{" "}
                <Text color="gray" size="1">
                  {counts[f]}
                </Text>
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </div>
        <TextField.Root
          placeholder="Search title, slug, category, author…"
          value={query}
          onChange={(e) => setQuery(e.target.value || null)}
          className="w-full sm:w-80"
          aria-label="Search posts"
        >
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Flex>

      {visible.length === 0 ? (
        <Card size="3">
          <Flex direction="column" align="center" gap="2" py="6">
            <Text weight="medium">
              {rows.length === 0 ? "No posts yet" : "No posts match"}
            </Text>
            <Text size="2" color="gray">
              {rows.length === 0
                ? "Create the first changelog post to get started."
                : "Try a different search or status filter."}
            </Text>
            {rows.length > 0 && (
              <Button
                variant="soft"
                color="gray"
                mt="2"
                onClick={() => {
                  setFilter(null);
                  setQuery(null);
                }}
              >
                Clear filters
              </Button>
            )}
          </Flex>
        </Card>
      ) : (
        <Table.Root variant="surface" size="2">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Post</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                width="120px"
                className="hidden sm:table-cell"
              >
                Status
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell className="hidden lg:table-cell">
                Categories
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                width="130px"
                className="hidden md:table-cell"
              >
                Date
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell
                width="170px"
                className="hidden md:table-cell"
              >
                Author
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell width="88px">
                <span className="sr-only">Actions</span>
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((row) => (
              <Table.Row
                key={row.id}
                align="center"
                className={row.status === "deleted" ? "opacity-70" : undefined}
              >
                <Table.Cell>
                  <Link
                    href={`/changelog/_admin/${row.id}/edit`}
                    className="font-medium text-[var(--gray-12)] hover:text-[var(--accent-11)] hover:underline underline-offset-2"
                  >
                    {row.title}
                  </Link>
                  <Text
                    as="div"
                    size="1"
                    color="gray"
                    className="font-mono truncate max-w-[28rem]"
                  >
                    /changelog/{row.slug}
                  </Text>
                  <div className="mt-1 sm:hidden">
                    <StatusBadge status={row.status} />
                  </div>
                </Table.Cell>
                <Table.Cell className="hidden sm:table-cell">
                  <StatusBadge status={row.status} />
                </Table.Cell>
                <Table.Cell className="hidden lg:table-cell">
                  <CategoryList categories={row.categories} />
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell">
                  <DateCell row={row} />
                </Table.Cell>
                <Table.Cell className="hidden md:table-cell">
                  {row.authorName ? (
                    <Flex align="center" gap="2">
                      <Avatar
                        size="1"
                        radius="full"
                        src={row.authorImage ?? undefined}
                        fallback={initials(row.authorName)}
                      />
                      <Text size="2" className="truncate">
                        {row.authorName}
                      </Text>
                    </Flex>
                  ) : (
                    <Text size="2" color="gray">
                      —
                    </Text>
                  )}
                </Table.Cell>
                <Table.Cell>
                  <Flex gap="1" justify="end" align="center">
                    {isPending(row.id) ? (
                      <Flex width="56px" justify="center">
                        <Spinner />
                      </Flex>
                    ) : (
                      <>
                        <Tooltip content="Edit">
                          <IconButton
                            asChild
                            variant="ghost"
                            color="gray"
                            aria-label={`Edit ${row.title}`}
                          >
                            <Link href={`/changelog/_admin/${row.id}/edit`}>
                              <Pencil1Icon />
                            </Link>
                          </IconButton>
                        </Tooltip>
                        <RowMenu row={row} onAction={request} />
                      </>
                    )}
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
      {dialog}
    </Flex>
  );
}

function RowMenu({
  row,
  onAction,
}: {
  row: ChangelogRow;
  onAction: ReturnType<typeof useStatusActions>["request"];
}) {
  const target = { id: row.id, title: row.title };
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          variant="ghost"
          color="gray"
          aria-label={`More actions for ${row.title}`}
        >
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" variant="soft">
        <DropdownMenu.Item asChild>
          <Link href={`/changelog/_admin/${row.id}/edit`}>
            Edit <Pencil1Icon />
          </Link>
        </DropdownMenu.Item>
        {/* Deleted posts 404 on the public site, so there's nothing to preview. */}
        {row.status !== "deleted" && (
          <DropdownMenu.Item asChild>
            <a href={`/changelog/${row.slug}`} target="_blank" rel="noreferrer">
              {row.status === "published" ? "View live" : "Preview"}
              {row.status === "published" ? (
                <ExternalLinkIcon />
              ) : (
                <EyeOpenIcon />
              )}
            </a>
          </DropdownMenu.Item>
        )}
        <DropdownMenu.Separator />
        {row.status === "draft" && (
          <DropdownMenu.Item onSelect={() => onAction("publish", target)}>
            Publish
          </DropdownMenu.Item>
        )}
        {row.status === "published" && (
          <DropdownMenu.Item onSelect={() => onAction("unpublish", target)}>
            Unpublish
          </DropdownMenu.Item>
        )}
        {row.status === "deleted" ? (
          <>
            <DropdownMenu.Item onSelect={() => onAction("restore", target)}>
              Restore as draft
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => onAction("publish", target)}>
              Restore and publish
            </DropdownMenu.Item>
          </>
        ) : (
          <DropdownMenu.Item
            color="red"
            onSelect={() => onAction("delete", target)}
          >
            Delete
          </DropdownMenu.Item>
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function CategoryList({ categories }: { categories: string[] }) {
  if (categories.length === 0) {
    return (
      <Text size="2" color="gray">
        —
      </Text>
    );
  }
  const visible = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hidden = categories.slice(MAX_VISIBLE_CATEGORIES);
  return (
    <Flex gap="1" wrap="wrap">
      {visible.map((category) => (
        <Badge key={category} color="gray" variant="surface">
          {category}
        </Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip content={hidden.join(", ")}>
          <Badge color="gray" variant="soft">
            +{hidden.length}
          </Badge>
        </Tooltip>
      )}
    </Flex>
  );
}

function DateCell({ row }: { row: ChangelogRow }) {
  const published = row.status === "published" && row.publishedAt;
  return (
    <div>
      <Text as="div" size="2">
        {formatDate(published ? row.publishedAt : row.createdAt)}
      </Text>
      <Text as="div" size="1" color="gray">
        {published ? "Published" : "Created"}
      </Text>
    </div>
  );
}
