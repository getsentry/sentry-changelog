"use client";

import { ImageIcon, TrashIcon, UploadIcon } from "@radix-ui/react-icons";
import { Button, Flex, Spinner, Text } from "@radix-ui/themes";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadImage } from "../uploadImage";

export function FileUpload({
  defaultFile = "",
  onChange,
}: {
  defaultFile?: string;
  onChange?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(defaultFile);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (picked: File | undefined) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error("Hero image must be an image file");
      return;
    }
    setLoading(true);
    try {
      const result = await uploadImage(picked);
      setFile(result.url);
      onChange?.();
    } catch (error) {
      console.error(error);
      toast.error("Image upload failed", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      {/* No name: the file itself is uploaded to blob storage, only the URL is submitted. */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => upload(e.target.files?.[0])}
      />
      {file && <input type="hidden" name="image" value={file} />}

      {file ? (
        <Flex direction="column" gap="2">
          <div className="relative overflow-hidden rounded-[var(--radius-3)] border border-[var(--gray-a5)] bg-[var(--gray-a2)]">
            <Image
              src={file}
              alt="Hero image preview"
              width={1200}
              height={630}
              unoptimized
              className="block w-full h-auto"
            />
            {loading && (
              <Flex
                align="center"
                justify="center"
                className="absolute inset-0 bg-[var(--color-panel-translucent)]"
              >
                <Spinner size="3" />
              </Flex>
            )}
          </div>
          <Flex gap="2">
            <Button
              type="button"
              size="1"
              variant="soft"
              color="gray"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
            >
              <UploadIcon /> Replace
            </Button>
            <Button
              type="button"
              size="1"
              variant="soft"
              color="red"
              disabled={loading}
              onClick={() => {
                setFile("");
                onChange?.();
              }}
            >
              <TrashIcon /> Remove
            </Button>
          </Flex>
        </Flex>
      ) : (
        <button
          type="button"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            upload(e.dataTransfer.files?.[0]);
          }}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-3)] border border-dashed px-4 py-8 text-center transition-colors ${
            dragging
              ? "border-[var(--accent-8)] bg-[var(--accent-a2)]"
              : "border-[var(--gray-a7)] hover:border-[var(--gray-a8)] hover:bg-[var(--gray-a2)]"
          }`}
        >
          {loading ? (
            <Spinner size="3" />
          ) : (
            <ImageIcon
              width="20"
              height="20"
              className="text-[var(--gray-10)]"
            />
          )}
          <Text size="2" weight="medium">
            {loading ? "Uploading…" : "Click or drop an image"}
          </Text>
          <Text size="1" color="gray">
            Optional · PNG, JPG, GIF, WebP, SVG · max 10 MB
          </Text>
        </button>
      )}
    </div>
  );
}
