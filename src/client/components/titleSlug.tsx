"use client";

import { UpdateIcon } from "@radix-ui/react-icons";
import { IconButton, TextField, Tooltip } from "@radix-ui/themes";
import { useState } from "react";
import { Field } from "./admin/field";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function TitleSlug({
  defaultTitle = "",
  defaultSlug = "",
  isPublished = false,
  errors = {},
}: {
  defaultTitle?: string;
  defaultSlug?: string;
  isPublished?: boolean;
  errors?: Record<string, string>;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  // New posts follow the title until the slug is edited by hand. Existing posts
  // start locked so retitling never silently changes a live URL.
  const [linked, setLinked] = useState(defaultSlug === "");

  const slugChanged = defaultSlug !== "" && slug !== defaultSlug;

  return (
    <>
      <Field label="Title" htmlFor="title" required error={errors.title}>
        <TextField.Root
          id="title"
          name="title"
          size="3"
          required
          value={title}
          placeholder="What shipped?"
          color={errors.title ? "red" : undefined}
          onChange={(e) => {
            setTitle(e.target.value);
            if (linked) setSlug(slugify(e.target.value));
          }}
        />
      </Field>
      <Field
        label="Slug"
        htmlFor="slug"
        required
        error={errors.slug}
        hint={
          slugChanged && isPublished
            ? "Heads up: this post is live. Changing the slug breaks existing links."
            : linked
              ? "Generated from the title. Edit it to set your own."
              : undefined
        }
      >
        <TextField.Root
          id="slug"
          name="slug"
          required
          value={slug}
          className="font-mono"
          color={errors.slug ? "red" : undefined}
          onChange={(e) => {
            setSlug(e.target.value);
            setLinked(false);
          }}
        >
          <TextField.Slot>
            <span className="font-mono text-[var(--gray-10)]">/changelog/</span>
          </TextField.Slot>
          <TextField.Slot>
            <Tooltip content="Regenerate from title">
              <IconButton
                type="button"
                size="1"
                variant="ghost"
                color="gray"
                aria-label="Regenerate slug from title"
                disabled={!title.trim()}
                onClick={() => {
                  setSlug(slugify(title));
                  // New posts go back to following the title.
                  setLinked(defaultSlug === "");
                }}
              >
                <UpdateIcon />
              </IconButton>
            </Tooltip>
          </TextField.Slot>
        </TextField.Root>
      </Field>
    </>
  );
}
