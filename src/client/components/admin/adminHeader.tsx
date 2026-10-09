"use client";

import {
  ChevronDownIcon,
  ExitIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import { Avatar, Badge, Box, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { initials } from "./status";

type AdminUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function AdminHeader({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const onList = /^\/changelog\/_admin\/?$/.test(pathname ?? "");

  return (
    <div className="border-b border-[var(--gray-a5)] bg-[var(--color-panel-solid)]">
      <Flex
        align="center"
        justify="between"
        gap="4"
        className="mx-auto max-w-6xl px-4 sm:px-6 h-14"
      >
        <Flex align="center" gap="6">
          <Link
            href="/changelog/_admin"
            className="flex items-center gap-2 text-[var(--gray-12)] no-underline"
          >
            <Text weight="bold" size="3">
              Changelog
            </Text>
            <Badge variant="soft" color="iris" radius="full">
              Admin
            </Badge>
          </Link>
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            <Link
              href="/changelog/_admin"
              className={
                onList
                  ? "font-medium text-[var(--gray-12)]"
                  : "text-[var(--gray-11)] hover:text-[var(--gray-12)]"
              }
            >
              Posts
            </Link>
            <a
              href="/changelog"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[var(--gray-11)] hover:text-[var(--gray-12)]"
            >
              Public changelog <ExternalLinkIcon />
            </a>
          </nav>
        </Flex>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[var(--gray-a3)] transition-colors"
            >
              <Avatar
                size="1"
                radius="full"
                src={user.image ?? undefined}
                fallback={initials(user.name)}
              />
              <Text size="2" weight="medium" className="hidden sm:inline">
                {user.name ?? user.email}
              </Text>
              <ChevronDownIcon className="text-[var(--gray-10)]" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end" variant="soft">
            <Box px="3" py="2">
              <Text as="div" size="2" weight="medium">
                {user.name}
              </Text>
              <Text as="div" size="1" color="gray">
                {user.email}
              </Text>
            </Box>
            <DropdownMenu.Separator />
            <DropdownMenu.Item asChild>
              <a href="/changelog" target="_blank" rel="noreferrer">
                Public changelog <ExternalLinkIcon />
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Item color="red" onSelect={() => signOut()}>
              Sign out <ExitIcon />
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Flex>
    </div>
  );
}
