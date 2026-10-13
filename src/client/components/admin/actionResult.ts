"use client";

import { toast } from "sonner";
import type { ServerActionPayloadInterface } from "@/server/actions/serverActionPayload.interface";

type StatusAction = (
  state: ServerActionPayloadInterface,
  formData: FormData,
) => Promise<ServerActionPayloadInterface>;

/** Run a publish/unpublish/delete/restore action for one changelog and toast the outcome. */
export async function runStatusAction(
  action: StatusAction,
  id: string,
  successMessage: string,
): Promise<boolean> {
  const formData = new FormData();
  formData.set("id", id);
  try {
    const result = await action({}, formData);
    if (result.success) {
      toast.success(successMessage);
      return true;
    }
    toast.error(result.message ?? "Something went wrong");
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  }
  return false;
}
