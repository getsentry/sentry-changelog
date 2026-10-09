"use client";

import {
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import {
  Button,
  Callout,
  Card,
  DataList,
  Flex,
  Heading,
  Kbd,
  Select as RadixSelect,
  Separator,
  Spinner,
  Text,
  TextArea,
} from "@radix-ui/themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { Field } from "@/client/components/admin/field";
import { GuidelinesCard } from "@/client/components/admin/guidelines";
import {
  type ChangelogStatus,
  formatDate,
  getChangelogStatus,
  StatusBadge,
} from "@/client/components/admin/status";
import {
  type StatusActionKind,
  useStatusActions,
} from "@/client/components/admin/statusActions";
import { FileUpload } from "@/client/components/fileUpload";
import { ForwardRefEditor } from "@/client/components/forwardRefEditor";
import { TitleSlug } from "@/client/components/titleSlug";
import { Select } from "@/client/components/ui/Select";
import { PLATFORM_GROUPS, platformLabel } from "@/lib/platforms";
import { createChangelog, editChangelog } from "@/server/actions/changelog";
import type { ServerActionPayloadInterface } from "@/server/actions/serverActionPayload.interface";
import type {
  CategoryModel as Category,
  ChangelogModel as Changelog,
} from "@/server/db/schema";

// Radix Select can't hold an empty value, so "default" stands in for "unset";
// the server action stores anything that isn't a known category as null.
const DEFAULT_BROADCAST = "default";
const BROADCAST_CATEGORY_OPTIONS = [
  { label: "Default (New Feature)", value: DEFAULT_BROADCAST },
  { label: "New Feature", value: "feature" },
  { label: "Announcement", value: "announcement" },
  { label: "SDK Update", value: "sdk_update" },
];

const LIST_URL = "/changelog/_admin";

type ChangelogFormProps = {
  categories: Category[];
  changelog?: Changelog & {
    categories: Category[];
    authorName?: string | null;
  };
};

export function ChangelogForm({ categories, changelog }: ChangelogFormProps) {
  const isEdit = Boolean(changelog);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ServerActionPayloadInterface>({});
  const [dirty, setDirty] = useState(false);
  const statusActions = useStatusActions();
  const markDirty = () => setDirty(true);
  const errors = result.fieldErrors ?? {};

  const status: ChangelogStatus = changelog
    ? getChangelogStatus(changelog)
    : "draft";

  // Warn before losing unsaved work on reload/close.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Submit manually instead of via `action` so React doesn't reset the
    // uncontrolled fields when the server returns a validation error.
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const response = await (isEdit ? editChangelog : createChangelog)(
          {},
          formData,
        );
        setResult(response);
        if (!response.success) {
          toast.error(response.message ?? "Could not save the post");
          return;
        }
        setDirty(false);
        if (isEdit) {
          toast.success("Changes saved");
          router.refresh();
        } else {
          toast.success("Draft created", {
            description: "Publish it from here or from the posts list.",
          });
          router.replace(`/changelog/_admin/${response.id}/edit`);
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not save the post");
      }
    });
  };

  const confirmLeave = (e: MouseEvent) => {
    if (dirty && !window.confirm("Discard unsaved changes?")) {
      e.preventDefault();
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} onChange={markDirty}>
      {changelog && <input type="hidden" name="id" value={changelog.id} />}
      {/* Tells the edit action the broadcast field was rendered. */}
      <input type="hidden" name="broadcastCategoryPresent" value="1" />

      <Flex direction="column" gap="2" mb="5">
        <Link
          href={LIST_URL}
          onClick={confirmLeave}
          className="inline-flex w-fit items-center gap-1 text-sm text-[var(--gray-11)] hover:text-[var(--gray-12)]"
        >
          <ArrowLeftIcon /> All posts
        </Link>
        <Flex align="center" justify="between" gap="3" wrap="wrap">
          <Flex align="center" gap="3" className="min-w-0">
            <Heading size="7">{isEdit ? "Edit post" : "New post"}</Heading>
            <StatusBadge status={status} />
          </Flex>
          {changelog && status !== "deleted" && (
            <Button asChild variant="soft" color="gray">
              <a
                href={`/changelog/${changelog.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                {status === "published" ? (
                  <>
                    View live <ExternalLinkIcon />
                  </>
                ) : (
                  <>
                    <EyeOpenIcon /> Preview
                  </>
                )}
              </a>
            </Button>
          )}
        </Flex>
      </Flex>

      {result.success === false && result.message && (
        <Callout.Root color="red" mb="4" role="alert">
          <Callout.Icon>
            <ExclamationTriangleIcon />
          </Callout.Icon>
          <Callout.Text>{result.message}</Callout.Text>
        </Callout.Root>
      )}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card size="3">
          <Flex direction="column" gap="5">
            <TitleSlug
              defaultTitle={changelog?.title}
              defaultSlug={changelog?.slug}
              isPublished={status === "published"}
              errors={errors}
            />
            <SummaryField
              defaultValue={changelog?.summary ?? ""}
              error={errors.summary}
            />
            <Field
              label="Body"
              htmlFor="content"
              required
              error={errors.content}
            >
              <ForwardRefEditor
                name="content"
                defaultValue={changelog?.content ?? ""}
                invalid={Boolean(errors.content)}
              />
            </Field>
          </Flex>
        </Card>

        <Flex direction="column" gap="4">
          {changelog && (
            <Card size="2">
              <Heading as="h3" size="2" mb="3">
                Status
              </Heading>
              <DataList.Root size="1">
                {status === "published" && changelog.publishedAt && (
                  <DataList.Item>
                    <DataList.Label minWidth="80px">Published</DataList.Label>
                    <DataList.Value>
                      {formatDate(changelog.publishedAt)}
                    </DataList.Value>
                  </DataList.Item>
                )}
                <DataList.Item>
                  <DataList.Label minWidth="80px">Created</DataList.Label>
                  <DataList.Value>
                    {formatDate(changelog.createdAt)}
                  </DataList.Value>
                </DataList.Item>
                <DataList.Item>
                  <DataList.Label minWidth="80px">Updated</DataList.Label>
                  <DataList.Value>
                    {formatDate(changelog.updatedAt)}
                  </DataList.Value>
                </DataList.Item>
                {changelog.authorName && (
                  <DataList.Item>
                    <DataList.Label minWidth="80px">Author</DataList.Label>
                    <DataList.Value>{changelog.authorName}</DataList.Value>
                  </DataList.Item>
                )}
              </DataList.Root>
              <Separator size="4" my="3" />
              <StatusButtons
                status={status}
                dirty={dirty}
                pending={statusActions.pending}
                onAction={(kind) =>
                  statusActions.request(kind, {
                    id: changelog.id,
                    title: changelog.title,
                  })
                }
              />
            </Card>
          )}

          <Card size="2">
            <Heading as="h3" size="2" mb="3">
              Hero image
            </Heading>
            <FileUpload
              defaultFile={changelog?.image ?? ""}
              onChange={markDirty}
            />
          </Card>

          <Card size="2">
            <Flex direction="column" gap="4">
              <Field
                label="Categories"
                htmlFor="categories"
                hint="Pick existing ones or type to create a new one."
              >
                <Select
                  name="categories"
                  placeholder="Add categories…"
                  defaultValue={changelog?.categories.map((category) => ({
                    label: category.name,
                    value: category.name,
                  }))}
                  options={categories.map((category) => ({
                    label: category.name,
                    value: category.name,
                  }))}
                  onChange={markDirty}
                  isMulti
                />
              </Field>
              <Field
                label="Platforms"
                htmlFor="platform"
                hint="Scopes auto-generated broadcasts to these Sentry platforms. Leave empty to target all platforms."
              >
                <Select
                  name="platform"
                  placeholder="All platforms"
                  defaultValue={changelog?.platform.map((platform) => ({
                    label: platformLabel(platform),
                    value: platform,
                  }))}
                  options={PLATFORM_GROUPS}
                  creatable={false}
                  onChange={markDirty}
                  isMulti
                />
              </Field>
              <Field
                label="Broadcast label"
                htmlFor="broadcastCategory"
                hint={`The label pill shown in Sentry's "What's New" panel.`}
              >
                <RadixSelect.Root
                  name="broadcastCategory"
                  defaultValue={
                    changelog?.broadcastCategory ?? DEFAULT_BROADCAST
                  }
                  onValueChange={markDirty}
                >
                  <RadixSelect.Trigger id="broadcastCategory" />
                  <RadixSelect.Content position="popper">
                    {BROADCAST_CATEGORY_OPTIONS.map((option) => (
                      <RadixSelect.Item key={option.value} value={option.value}>
                        {option.label}
                      </RadixSelect.Item>
                    ))}
                  </RadixSelect.Content>
                </RadixSelect.Root>
              </Field>
            </Flex>
          </Card>

          <GuidelinesCard />
        </Flex>
      </div>

      {/* Sticky save bar: always reachable, regardless of how long the body gets. */}
      <div className="sticky bottom-4 z-40 mt-6 rounded-[var(--radius-4)] border border-[var(--gray-a5)] bg-[var(--color-panel-translucent)] shadow-[var(--shadow-4)] backdrop-blur">
        <Flex align="center" justify="between" gap="3" className="px-4 py-3">
          <Text size="2" color="gray">
            {pending ? (
              "Saving…"
            ) : dirty ? (
              <Text color="amber" weight="medium">
                Unsaved changes
              </Text>
            ) : isEdit ? (
              <Flex as="span" align="center" gap="1">
                <CheckIcon /> All changes saved
              </Flex>
            ) : (
              "New posts are saved as drafts. Publish when ready."
            )}
          </Text>
          <Flex gap="3" align="center">
            <Text size="1" color="gray" className="hidden md:inline">
              <Kbd>⌘S</Kbd> to save
            </Text>
            <Button asChild variant="soft" color="gray">
              <Link href={LIST_URL} onClick={confirmLeave}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={pending}>
              {pending && <Spinner />}
              {isEdit ? "Save changes" : "Create draft"}
            </Button>
          </Flex>
        </Flex>
      </div>
      {statusActions.dialog}
    </form>
  );
}

function SummaryField({
  defaultValue,
  error,
}: {
  defaultValue: string;
  error?: string;
}) {
  const [length, setLength] = useState(defaultValue.length);
  return (
    <Field
      label="Summary"
      htmlFor="summary"
      required
      error={error}
      hint="One or two sentences. Shown in the changelog list and in What's New."
      aside={
        <Text size="1" color="gray">
          {length} characters
        </Text>
      }
    >
      <TextArea
        id="summary"
        name="summary"
        required
        rows={3}
        defaultValue={defaultValue}
        placeholder="What changed, in plain words."
        color={error ? "red" : undefined}
        onChange={(e) => setLength(e.target.value.length)}
      />
    </Field>
  );
}

function StatusButtons({
  status,
  dirty,
  pending,
  onAction,
}: {
  status: ChangelogStatus;
  dirty: boolean;
  pending: boolean;
  onAction: (kind: StatusActionKind) => void;
}) {
  return (
    <Flex direction="column" gap="2">
      {status === "draft" && (
        <Button
          type="button"
          color="green"
          disabled={dirty || pending}
          onClick={() => onAction("publish")}
        >
          Publish
        </Button>
      )}
      {status === "published" && (
        <Button
          type="button"
          variant="soft"
          color="amber"
          disabled={dirty || pending}
          onClick={() => onAction("unpublish")}
        >
          Unpublish
        </Button>
      )}
      {status === "deleted" ? (
        <Button
          type="button"
          variant="soft"
          disabled={dirty || pending}
          onClick={() => onAction("restore")}
        >
          Restore as draft
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          color="red"
          size="1"
          className="self-center"
          disabled={pending}
          onClick={() => onAction("delete")}
        >
          Delete post
        </Button>
      )}
      {dirty && (
        <Text size="1" color="gray">
          Save your changes before changing the status.
        </Text>
      )}
    </Flex>
  );
}
