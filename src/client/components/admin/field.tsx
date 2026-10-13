import { Text } from "@radix-ui/themes";
import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  aside,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Text as="label" htmlFor={htmlFor} size="2" weight="medium">
          {label}
          {required && (
            <Text color="red" aria-hidden>
              {" "}
              *
            </Text>
          )}
        </Text>
        {aside}
      </div>
      {children}
      {error ? (
        <Text size="1" color="red" role="alert">
          {error}
        </Text>
      ) : (
        hint && (
          <Text size="1" color="gray">
            {hint}
          </Text>
        )
      )}
    </div>
  );
}
