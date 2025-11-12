"use client";

import type React from "react";
import Link from "./Link";

const ChevronDown = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <title>Chevron Down</title>
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <title>Chevron Right</title>
    <path
      d="M6 4L10 8L6 12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface ButtonProps {
  icon?: string | { url: string };
  portrait?: string;
  chevron?: "down" | "right";
  variant?: string;
  compensate?: "left" | "right";
  active?: boolean;
  "aria-expanded"?: boolean;
  "aria-label"?: string;
  "aria-controls"?: string;
  redesign?: boolean;
  darkMode?: boolean;
  inheritColor?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  [key: string]: any;
}

export default function Button({
  icon,
  portrait,
  chevron,
  variant = "silent",
  compensate,
  active,
  redesign,
  darkMode,
  inheritColor,
  className,
  id,
  href,
  type = "button",
  disabled,
  children,
  ...rest
}: ButtonProps) {
  const ariaExpanded = rest["aria-expanded"];
  const ariaControls = rest["aria-controls"];
  const ariaLabel = rest["aria-label"];
  const onClick = rest.onClick;
  const onKeyDown = rest.onKeyDown;

  const dataAttributes = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith("data-")),
  );

  const baseClasses = [
    redesign ? "btn-new" : "btn",
    variant,
    darkMode && "dark-mode",
    inheritColor && "inherit-color",
    disabled && "disabled",
    compensate && `compensate-${compensate}`,
  ];

  const responsiveClasses = [];
  if (chevron && redesign) {
    responsiveClasses.push("flex justify-between");
    responsiveClasses.push("md:justify-center");
  }

  const classList = [...baseClasses, ...responsiveClasses, className]
    .filter(Boolean)
    .join(" ");

  const buttonContent = (
    <>
      {icon &&
        (typeof icon === "string" ? (
          <div
            className="icon"
            aria-hidden="true"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Icon HTML comes from controlled Contentful source
            dangerouslySetInnerHTML={{ __html: icon }}
          />
        ) : (
          <img src={icon.url} alt="" className="icon" aria-hidden="true" />
        ))}
      {portrait && (
        <img src={portrait} alt="" className="portrait" aria-hidden="true" />
      )}
      <span className="label">{children}</span>
      {chevron && (
        <div
          className="chevron transition-transform duration-200"
          aria-hidden="true"
        >
          {chevron === "down" ? <ChevronDown /> : <ChevronRight />}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classList}
        id={id}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-label={ariaLabel}
        onClick={onClick}
        onKeyDown={onKeyDown}
        {...dataAttributes}
      >
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      className={classList}
      id={id}
      type={type}
      disabled={disabled}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-label={ariaLabel}
      onClick={onClick}
      onKeyDown={onKeyDown}
      {...dataAttributes}
    >
      {buttonContent}
    </button>
  );
}
