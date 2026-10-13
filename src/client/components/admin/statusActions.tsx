"use client";

import { AlertDialog, Button, Flex } from "@radix-ui/themes";
import { useState, useTransition } from "react";
import {
  deleteChangelog,
  publishChangelog,
  restoreChangelog,
  unpublishChangelog,
} from "@/server/actions/changelog";
import { runStatusAction } from "./actionResult";

export type StatusActionKind = "publish" | "unpublish" | "delete" | "restore";

type Target = { id: string; title: string };

const ACTIONS = {
  publish: {
    action: publishChangelog,
    success: "Post published",
    confirm: {
      title: "Publish this post?",
      description:
        "It goes live on the public changelog right away. You can unpublish it later.",
      cta: "Publish",
      color: "green",
    },
  },
  unpublish: {
    action: unpublishChangelog,
    success: "Post unpublished",
    confirm: {
      title: "Unpublish this post?",
      description:
        "It is removed from the public changelog and moved back to drafts.",
      cta: "Unpublish",
      color: "amber",
    },
  },
  delete: {
    action: deleteChangelog,
    success: "Post deleted",
    confirm: {
      title: "Delete this post?",
      description:
        "It is unpublished and moved to Deleted. You can restore it from there.",
      cta: "Delete",
      color: "red",
    },
  },
  restore: {
    action: restoreChangelog,
    success: "Post restored as a draft",
    confirm: null,
  },
} as const;

/**
 * Shared publish/unpublish/delete/restore flow: confirm in a dialog, run the
 * server action, toast the result. Render `dialog` once near the trigger(s).
 */
export function useStatusActions() {
  const [pending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<{
    kind: StatusActionKind;
    target: Target;
  } | null>(null);

  const run = (kind: StatusActionKind, target: Target) => {
    setPendingId(target.id);
    startTransition(async () => {
      await runStatusAction(
        ACTIONS[kind].action,
        target.id,
        ACTIONS[kind].success,
      );
      setPendingId(null);
    });
  };

  const request = (kind: StatusActionKind, target: Target) => {
    if (ACTIONS[kind].confirm) {
      setConfirming({ kind, target });
    } else {
      run(kind, target);
    }
  };

  const confirm = confirming ? ACTIONS[confirming.kind].confirm : null;

  const dialog = (
    <AlertDialog.Root
      open={confirming !== null}
      onOpenChange={(open) => !open && setConfirming(null)}
    >
      <AlertDialog.Content maxWidth="440px">
        <AlertDialog.Title>{confirm?.title}</AlertDialog.Title>
        <AlertDialog.Description size="2">
          <strong>{confirming?.target.title}</strong>
          <br />
          {confirm?.description}
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button
              color={confirm?.color}
              onClick={() => {
                if (confirming) run(confirming.kind, confirming.target);
              }}
            >
              {confirm?.cta}
            </Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );

  return {
    request,
    dialog,
    pending,
    isPending: (id: string) => pending && pendingId === id,
  };
}
