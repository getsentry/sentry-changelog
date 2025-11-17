"use client";

import type { MenuItem } from "@/lib/contentful/types";
import type React from "react";
import { useEffect, useState } from "react";
import Button from "../atoms/Button";
import NewPill from "../atoms/NewPill";

interface NavigationMenuItemProps {
  item: MenuItem;
  isDarkMode?: boolean;
  idx?: number;
  isOpen?: boolean;
  onDropdownToggle?: (menuKey: string, isOpen: boolean) => void;
}

export default function NavigationMenuItem({
  item,
  isDarkMode,
  idx,
  isOpen = false,
  onDropdownToggle,
}: NavigationMenuItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local state with prop
  useEffect(() => {
    setIsExpanded(isOpen);
  }, [isOpen]);

  const isNavigationMenuItem =
    item.__typename === "ContentfulNavigationMenuItem";
  const hasMenuItems =
    item.menuItemsCollection?.items &&
    item.menuItemsCollection.items.length > 0;
  const hasColumns =
    item.columnsCollection?.items && item.columnsCollection.items.length > 0;
  const hasChildren = hasMenuItems || hasColumns;
  const isDropdown = isNavigationMenuItem && hasChildren;
  const menuKey = item.sys.id;
  const uniqueId = `menu-item-${menuKey}-${idx}`;

  const handleClick = (e: React.MouseEvent) => {
    if (isDropdown) {
      e.preventDefault();
      e.stopPropagation();
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      if (onDropdownToggle) {
        onDropdownToggle(menuKey, newExpandedState);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isDropdown) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        if (onDropdownToggle) {
          onDropdownToggle(menuKey, newExpandedState);
        }
      }
    }
  };

  return (
    <li
      className="list-none flex-shrink-0 w-full xl:w-auto xl:flex xl:items-center pt-4 xl:pt-0 xl:relative"
      data-menu-key={menuKey}
      id={uniqueId}
    >
      <div className="w-full xl:w-auto flex justify-start xl:justify-center">
        <Button
          variant="silent"
          chevron={isDropdown ? "right" : undefined}
          href={!isDropdown ? item.url || item.destination : undefined}
          redesign={true}
          darkMode={isDarkMode}
          aria-expanded={isExpanded}
          aria-controls={isDropdown ? `dropdown-${menuKey}` : undefined}
          data-menu-trigger={menuKey}
          className="w-full xl:w-auto"
          type={isDropdown ? "button" : undefined}
          onClick={isDropdown ? handleClick : undefined}
          onKeyDown={isDropdown ? handleKeyDown : undefined}
        >
          {item.cta || item.label}
          {item.class === "new" && <NewPill />}
        </Button>
      </div>
    </li>
  );
}
