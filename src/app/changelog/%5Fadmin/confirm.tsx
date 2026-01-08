"use client";

import { type PropsWithChildren, useActionState } from "react";
import type { ServerActionPayloadInterface } from "@/server/actions/serverActionPayload.interface";

export default function Confirm({
  action,
  changelog,
  children,
}: PropsWithChildren<{
  action: (
    currentFormState: ServerActionPayloadInterface,
    formData: FormData,
  ) => Promise<ServerActionPayloadInterface>;
  changelog: { id: string };
}>) {
  const [_state, formAction] = useActionState(action, {});
  return (
    <form
      action={formAction}
      className="inline-block"
      onSubmit={(e) => {
        e.preventDefault();
        if (confirm("Are you sure?")) {
          formAction(new FormData(e.currentTarget));
        }
      }}
    >
      <input type="hidden" name="id" value={changelog.id} />
      <button
        type="submit"
        className="text-indigo-600 hover:bg-indigo-100 rounded-md px-1 py-2 text-xs whitespace-nowrap"
      >
        {children}
      </button>
    </form>
  );
}
