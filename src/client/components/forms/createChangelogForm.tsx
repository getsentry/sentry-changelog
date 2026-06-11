"use client";

import Link from "next/link";
import { useActionState } from "react";
import ReactSelect from "react-select";
import { FileUpload } from "@/client/components/fileUpload";
import { ForwardRefEditor } from "@/client/components/forwardRefEditor";
import { TitleSlug } from "@/client/components/titleSlug";
import { Button } from "@/client/components/ui/Button";
import { Select } from "@/client/components/ui/Select";
import { PLATFORM_GROUPS } from "@/lib/platforms";
import { createChangelog } from "@/server/actions/changelog";

const BROADCAST_CATEGORY_OPTIONS = [
  { label: "New Feature", value: "feature" },
  { label: "Announcement", value: "announcement" },
  { label: "SDK Update", value: "sdk_update" },
];

import type { CategoryModel as Category } from "@/server/db/schema";

export const CreateChangelogForm = ({
  categories,
}: {
  categories: Category[];
}) => {
  const [_state, formAction] = useActionState(createChangelog, {});
  return (
    <form action={formAction} className="px-2 w-full">
      <TitleSlug />
      <FileUpload />
      <div className="my-6">
        <label
          htmlFor="summary"
          className="block text-xs font-medium text-gray-700"
        >
          Summary &nbsp;<span className="font-bold text-secondary">*</span>
        </label>
        <textarea name="summary" className="w-full" required />
        <span className="text-xs text-gray-500 italic">
          This will be shown in the list
        </span>
      </div>
      <div>
        <Select
          name="categories"
          className="mt-1 mb-6"
          label="Category"
          placeholder="Select Category"
          options={categories.map((category) => ({
            label: category.name,
            value: category.name,
          }))}
          isMulti
        />
      </div>

      <div>
        <Select
          name="platform"
          className="mt-1 mb-6"
          label="Platform"
          placeholder="Select Platform (optional)"
          options={PLATFORM_GROUPS}
          creatable={false}
          isMulti
        />
        <span className="text-xs text-gray-500 italic">
          Scopes auto-generated broadcasts to these Sentry platforms. Leave
          empty to target all platforms.
        </span>
      </div>

      <div className="mb-6">
        <label
          htmlFor="broadcastCategory"
          className="block text-xs font-medium text-gray-700"
        >
          Broadcast Label (shown in &quot;What&apos;s New&quot;)
        </label>
        <ReactSelect
          name="broadcastCategory"
          placeholder="Defaults to New Feature"
          options={BROADCAST_CATEGORY_OPTIONS}
          isClearable
        />
        <span className="text-xs text-gray-500 italic">
          Controls the label pill in Sentry&apos;s &quot;What&apos;s New&quot;
          panel
        </span>
      </div>

      <ForwardRefEditor name="content" className="w-full" />

      <footer className="flex items-center justify-between mt-2">
        <Link href="/changelog/_admin" className="underline text-gray-500">
          Return to Changelogs list
        </Link>
        <div>
          <Button type="submit">Create (not published yet)</Button>
          <br />
          <span className="text-xs text-gray-500 italic">
            You can publish it later
          </span>
        </div>
      </footer>
    </form>
  );
};
