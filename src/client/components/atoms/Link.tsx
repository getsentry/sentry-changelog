import NextLink from "next/link";
import type React from "react";

interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  [key: string]: any;
}

export default function Link({
  href,
  className,
  children,
  ...props
}: LinkProps) {
  const isExternal =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//");

  if (isExternal) {
    return (
      <a href={href} className={className} data-link-href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <NextLink
      href={href}
      className={className}
      data-link-href={href}
      {...props}
    >
      {children}
    </NextLink>
  );
}
