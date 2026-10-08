"use client";

import {
  CodeIcon,
  FontBoldIcon,
  FontItalicIcon,
  ImageIcon,
  Link1Icon,
  ListBulletIcon,
  QuoteIcon,
  StrikethroughIcon,
} from "@radix-ui/react-icons";
import * as Toolbar from "@radix-ui/react-toolbar";
import type {
  ChangeEvent,
  ClipboardEvent,
  DragEvent,
  ForwardedRef,
} from "react";
import { Fragment, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import type { TextareaMarkdownRef } from "textarea-markdown-editor";
import TextareaMarkdown, { Cursor } from "textarea-markdown-editor";
import { uploadImage } from "../uploadImage";

function replaceText(cursor: Cursor, text: string, replaceWith: string) {
  cursor.setValue(cursor.value.replace(text, replaceWith));
}

function handleUploadImages(textareaEl: HTMLTextAreaElement, fileList: File[]) {
  const cursor = new Cursor(textareaEl);

  fileList.forEach(async (file, _idx) => {
    const loadingText = `![Uploading ${file.name}...]()`;

    cursor.insert(`${loadingText}${Cursor.MARKER}`);

    try {
      const uploadedImage = await uploadImage(file);
      replaceText(
        cursor,
        loadingText,
        `![${uploadedImage.originalFilename}](${uploadedImage.url})`,
      );
    } catch (err: any) {
      console.error(err);
      replaceText(cursor, loadingText, "");
      toast.error(`Could not upload ${file.name}`, {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  });
}

const onUploadFiles = (
  textareaEl: HTMLTextAreaElement,
  event:
    | DragEvent<HTMLTextAreaElement>
    | ClipboardEvent<HTMLTextAreaElement>
    | ChangeEvent<HTMLInputElement>,
  fileList: FileList | null,
) => {
  if (!fileList) {
    return;
  }

  const filesArray = Array.from(fileList);

  if (filesArray.length === 0) {
    return;
  }

  const imageFiles = filesArray.filter((file) => /image/i.test(file.type));
  if (imageFiles.length === 0) {
    return;
  }

  event.preventDefault();

  handleUploadImages(textareaEl, imageFiles);
};

export type EditorProps = {
  name: string;
  className?: string;
  defaultValue?: string;
  minRows?: number;
  noPreview?: boolean;
  invalid?: boolean;
};

const TOOLBAR_BUTTON_CLASS =
  "inline-flex size-7 items-center justify-center rounded-[var(--radius-2)] text-[var(--gray-11)] hover:bg-[var(--gray-a4)] hover:text-[var(--gray-12)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-8)] transition-colors";

const TOOLBAR_SEPARATOR_CLASS = "mx-1 h-4 w-px bg-[var(--gray-a6)]";

function Editor({ name, defaultValue, minRows = 18, invalid }: EditorProps) {
  const [value, setValue] = useState(defaultValue || "");

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue]);

  const ref = useRef<TextareaMarkdownRef>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const editorBlock = (
    <Fragment>
      <Toolbar.Toolbar
        className="flex flex-wrap items-center gap-0.5 border-b border-[var(--gray-a5)] bg-[var(--gray-a2)] px-2 py-1.5"
        aria-label="Formatting options"
      >
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="bold"
          aria-label="Bold"
          title="Bold"
          onClick={() => ref.current?.trigger("bold")}
        >
          <FontBoldIcon />
        </Toolbar.Button>
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="italic"
          aria-label="Italic"
          title="Italic"
          onClick={() => ref.current?.trigger("italic")}
        >
          <FontItalicIcon />
        </Toolbar.Button>
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="strikethrough"
          aria-label="Strike through"
          title="Strike through"
          onClick={() => ref.current?.trigger("strike-through")}
        >
          <StrikethroughIcon />
        </Toolbar.Button>
        <Toolbar.Separator className={TOOLBAR_SEPARATOR_CLASS} />
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="unordered-list"
          aria-label="Bulleted list"
          title="Bulleted list"
          onClick={() => ref.current?.trigger("unordered-list")}
        >
          <ListBulletIcon />
        </Toolbar.Button>
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="code-block"
          aria-label="Code block"
          title="Code block"
          onClick={() => ref.current?.trigger("code-block")}
        >
          <CodeIcon />
        </Toolbar.Button>
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="block-quotes"
          aria-label="Quote"
          title="Quote"
          onClick={() => ref.current?.trigger("block-quotes")}
        >
          <QuoteIcon />
        </Toolbar.Button>
        <Toolbar.Separator className={TOOLBAR_SEPARATOR_CLASS} />
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="link"
          aria-label="Link"
          title="Link"
          onClick={() => ref.current?.trigger("link")}
        >
          <Link1Icon />
        </Toolbar.Button>
        <Toolbar.Button
          className={TOOLBAR_BUTTON_CLASS}
          value="image"
          aria-label="Upload image"
          title="Upload image"
          onClick={() => {
            fileRef.current?.click();
          }}
        >
          <ImageIcon />
        </Toolbar.Button>
        <span className="ml-auto hidden sm:inline text-xs text-[var(--gray-10)] pr-1">
          Markdown · paste or drop images to upload
        </span>
      </Toolbar.Toolbar>

      <TextareaMarkdown.Wrapper
        ref={ref}
        options={{
          codeBlockPlaceholder: "```\nfunction helloWorld() { }\n```",
          blockQuotesPlaceholder: "> quote",
        }}
      >
        <TextareaAutosize
          name={name}
          minRows={minRows}
          required
          value={value}
          id={name}
          placeholder="Write the post in Markdown. Explain what changed, why, and how to use it."
          className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-6 text-[var(--gray-12)] placeholder:text-[var(--gray-a9)] outline-none border-0 focus:ring-0"
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={invalid || undefined}
          onPaste={(event) => {
            onUploadFiles(ref.current!, event, event.clipboardData.files);
          }}
          onDrop={(event) => {
            onUploadFiles(ref.current!, event, event.dataTransfer.files);
          }}
        />
      </TextareaMarkdown.Wrapper>
    </Fragment>
  );

  return (
    <div
      className={`editor overflow-hidden rounded-[var(--radius-3)] border bg-[var(--color-surface)] transition-colors focus-within:border-[var(--accent-8)] focus-within:shadow-[0_0_0_1px_var(--accent-8)] ${
        invalid ? "border-[var(--red-8)]" : "border-[var(--gray-a7)]"
      }`}
    >
      {editorBlock}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          onUploadFiles(ref.current!, event, event.target.files);
          fileRef.current!.value = "";
        }}
        style={{ display: "none", position: "absolute", left: -100000 }}
      />
    </div>
  );
}

// Only import this to the next file
export default function ForwardEditor({
  ...props
}: { editorRef: ForwardedRef<null> | null } & EditorProps) {
  return <Editor {...props} />;
}
