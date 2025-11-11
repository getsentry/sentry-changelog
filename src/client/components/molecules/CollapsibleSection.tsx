"use client";

import type React from "react";
import { useEffect } from "react";
import Button from "../atoms/Button";

interface CollapsibleSectionProps {
  title: string;
  id: string;
  isDarkMode?: boolean;
  hideOnDesktop?: boolean;
  buttonVariant?: string;
  children: React.ReactNode;
}

function getNestingLevel(element: Element | null): number {
  if (!element) return 0;

  let level = 0;
  let parent = element.parentElement;

  while (parent) {
    if (parent.hasAttribute("data-collapsible-section")) {
      level++;
    }
    parent = parent.parentElement;
  }

  return level;
}

export default function CollapsibleSection({
  title,
  id,
  isDarkMode,
  hideOnDesktop = false,
  buttonVariant,
  children,
}: CollapsibleSectionProps) {
  const sectionId =
    id || `section-${title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
  const variant = buttonVariant || (isDarkMode ? "subnav" : "silent");

  useEffect(() => {
    const trigger = document.getElementById(`trigger-${sectionId}`);
    if (!trigger) return;

    const handleClick = (e: Event) => {
      e.stopPropagation();

      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      // Only handle accordion behavior on mobile
      if (typeof window !== "undefined" && window.innerWidth < 1152) {
        // Accordion behavior: close sections at same level when opening one
        if (!isExpanded) {
          const currentSection = trigger.closest("[data-collapsible-section]");
          const currentLevel = getNestingLevel(currentSection);

          // Close all sections at the same level
          for (const otherTrigger of document.querySelectorAll(
            '[id^="trigger-"]',
          )) {
            if (otherTrigger !== trigger) {
              const otherSection = otherTrigger.closest(
                "[data-collapsible-section]",
              );
              const otherLevel = getNestingLevel(otherSection);

              if (otherLevel === currentLevel) {
                otherTrigger.setAttribute("aria-expanded", "false");
              }
            }
          }
        }

        // Toggle current section
        trigger.setAttribute("aria-expanded", String(!isExpanded));
      }
    };

    trigger.addEventListener("click", handleClick);

    return () => {
      trigger.removeEventListener("click", handleClick);
    };
  }, [sectionId]);

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
        aria-expanded={false}
        aria-controls={`content-${sectionId}`}
        type="button"
      >
        {title}
      </Button>
      <div id={`content-${sectionId}`}>
        <div className="pl-4">{children}</div>
      </div>
    </div>
  );
}
