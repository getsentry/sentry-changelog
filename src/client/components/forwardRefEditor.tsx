"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";

import type { EditorProps } from "./editor";

const Editor = dynamic(() => import("./editor"), {
  // Make sure we turn SSR off
  ssr: false,
  loading: () => (
    <div className="h-[30rem] animate-pulse rounded-[var(--radius-3)] border border-[var(--gray-a6)] bg-[var(--gray-a2)]" />
  ),
});

export const ForwardRefEditor = forwardRef<null, EditorProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
));

// TS complains without the following line
ForwardRefEditor.displayName = "ForwardRefEditor";
