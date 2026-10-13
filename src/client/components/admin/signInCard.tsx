"use client";

import { LockClosedIcon } from "@radix-ui/react-icons";
import { Button, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { signIn } from "next-auth/react";

export function SignInCard() {
  return (
    <Flex align="center" justify="center" className="min-h-[60vh] px-4">
      <Card size="4" className="w-full max-w-sm">
        <Flex direction="column" gap="4">
          <Flex
            align="center"
            justify="center"
            className="size-10 rounded-full bg-[var(--accent-a3)] text-[var(--accent-11)]"
          >
            <LockClosedIcon width="18" height="18" />
          </Flex>
          <div>
            <Heading size="5" mb="1">
              Changelog admin
            </Heading>
            <Text size="2" color="gray">
              Sign in with your Sentry Google account to write and publish
              changelog posts.
            </Text>
          </div>
          <Button size="3" onClick={() => signIn("google")}>
            Continue with Google
          </Button>
          {process.env.NODE_ENV === "development" && (
            <Button
              size="2"
              variant="soft"
              color="gray"
              onClick={() => signIn("credentials")}
            >
              Dev sign in (local only)
            </Button>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
