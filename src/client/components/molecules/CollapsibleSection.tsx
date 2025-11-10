"use client";

import type React from "react";
import { useState } from "react";
import Button from "../atoms/Button";

interface CollapsibleSectionProps {
  title: string;
  id: string;
  isDarkMode?: boolean;
  hideOnDesktop?: boolean;
  buttonVariant?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  id,
  isDarkMode,
  hideOnDesktop = false,
  buttonVariant,
  children,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sectionId =
    id || `section-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  const variant = buttonVariant || (isDarkMode ? "subnav" : "silent");

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className="collapsible-section bg-rich-black xl:bg-transparent"
      data-collapsible-section={sectionId}
    >
      <Button
        variant={variant}
        darkMode={isDarkMode}
        redesign={true}
        chevron="right"
        className={`w-full text-left justify-start flex justify-between items-center collapsible-trigger ${
          hideOnDesktop ? "xl:hidden" : ""
        }`}
        id={`trigger-${sectionId}`}
        aria-expanded={isExpanded}
        aria-controls={`content-${sectionId}`}
        type="button"
        onClick={handleToggle}
      >
        <span className="label font-medium text-sm leading-[18px] uppercase font-sans">
          {title}
        </span>
      </Button>
      <div
        id={`content-${sectionId}`}
        className={`xl:block ${isExpanded ? "block" : "hidden"}`}
      >
        <div className="pl-4">{children}</div>
      </div>
    </div>
  );
}
