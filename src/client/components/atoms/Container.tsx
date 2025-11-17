import type React from "react";

interface ContainerProps {
  disablePaddingLeft?: boolean;
  disablePaddingRight?: boolean;
  disablePaddingTop?: boolean;
  disablePaddingBottom?: boolean;
  constrained?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Container({
  disablePaddingLeft,
  disablePaddingRight,
  disablePaddingTop,
  disablePaddingBottom,
  constrained = true,
  className,
  children,
}: ContainerProps) {
  const baseClasses = ["w-full", "mx-auto"];

  const paddingClasses = [
    !disablePaddingLeft && "pl-8",
    !disablePaddingRight && "pr-8",
    !disablePaddingTop && "pt-8",
    !disablePaddingBottom && "pb-8",
  ];

  const responsivePaddingClasses = [
    !disablePaddingTop && "md:pt-16",
    !disablePaddingBottom && "md:pb-16",
  ];

  const maxWidthClasses = constrained
    ? [
        "max-w-[576px]",
        "md:max-w-[768px]",
        "lg:max-w-[992px]",
        "xl:max-w-[1152px]",
      ]
    : [];

  const classes = [
    ...baseClasses,
    ...paddingClasses,
    ...responsivePaddingClasses,
    ...maxWidthClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes}>{children}</div>;
}
