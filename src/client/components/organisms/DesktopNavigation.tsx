"use client";

import React, { useCallback, useEffect, useState } from "react";
import type { MenuItem } from "@/lib/contentful/types";
import Dropdown from "../molecules/Dropdown";
import NavigationMenuItem from "../molecules/NavigationMenuItem";

interface DesktopNavigationProps {
  menuItems: MenuItem[];
  isDarkMode?: boolean;
}

export default function DesktopNavigation({
  menuItems = [],
  isDarkMode = false,
}: DesktopNavigationProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownToggle = useCallback(
    (menuKey: string, isOpen: boolean) => {
      setOpenDropdown(isOpen ? menuKey : null);
    },
    [],
  );

  // Handle click outside and Escape key to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        openDropdown &&
        !target.closest("[data-menu-trigger]") &&
        !target.closest("[data-menu-dropdown]")
      ) {
        setOpenDropdown(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      // Add slight delay to prevent immediate closure on the same click that opened it
      setTimeout(() => {
        document.addEventListener("click", handleClickOutside);
      }, 0);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  return (
    <ul
      id="desktopNavBar"
      className="hidden xl:flex xl:flex-row xl:items-center xl:flex-1 xl:justify-center xl:relative"
    >
      {menuItems.map((item, idx) => {
        const isNavigationMenuItem =
          item.__typename === "ContentfulNavigationMenuItem";
        const hasMenuItems =
          item.menuItemsCollection?.items &&
          item.menuItemsCollection.items.length > 0;
        const hasColumns =
          item.columnsCollection?.items &&
          item.columnsCollection.items.length > 0;
        const hasChildren = hasMenuItems || hasColumns;
        const isDropdown = isNavigationMenuItem && hasChildren;
        const menuKey = item.sys.id;
        return (
          <React.Fragment key={`${item.sys.id}-${idx}`}>
            <NavigationMenuItem
              item={item}
              isDarkMode={isDarkMode}
              idx={idx}
              isOpen={openDropdown === menuKey}
              onDropdownToggle={handleDropdownToggle}
            />
            {isDropdown && (
              <Dropdown
                item={item}
                isDarkMode={isDarkMode}
                menuKey={menuKey}
                isOpen={openDropdown === menuKey}
              />
            )}
          </React.Fragment>
        );
      })}
    </ul>
  );
}
