"use client";

import type { MenuItem } from "@/lib/contentful/types";
import MultiColumnMenu from "../organisms/MultiColumnMenu";
import FeaturedContent from "./FeaturedContent";
import SingleColumnMenu from "./SingleColumnMenu";

interface DropdownProps {
  item: MenuItem;
  isDarkMode?: boolean;
  menuKey: string;
  isOpen: boolean;
}

export default function Dropdown({ item, menuKey, isOpen }: DropdownProps) {
  const hasFeaturedContent = !!item.featuredContent;
  const featuredContentWidth = hasFeaturedContent ? "xl:min-w-[48rem]" : "";

  const dropdownClasses = [
    isOpen ? "block" : "hidden",
    "xl:absolute xl:top-12 xl:left-0",
    "bg-rich-black xl:bg-white xl:shadow-lg",
    "xl:border xl:border-gray-200",
    "rounded-xl overflow-hidden xl:rounded-xl xl:overflow-visible",
    "z-[9999] xl:z-[9999]",
    "transition-all duration-200 ease-in-out",
    "w-full xl:w-auto",
    "xl:mt-0",
    featuredContentWidth,
  ]
    .filter(Boolean)
    .join(" ");

  const isMultiColumn =
    item.__typename === "ContentfulNavigationMenuItem" &&
    item.layout === "Multi-Column";
  const containerPaddingClass = isMultiColumn ? "xl:p-0" : "p-6 lg:p-0";

  const featuredContentClass = item.featuredContent?.className
    ? `xl:${item.featuredContent.className}`
    : "";

  return (
    <div
      className={dropdownClasses}
      data-menu-dropdown={menuKey}
      id={`dropdown-${menuKey}`}
    >
      <div className={containerPaddingClass}>
        <div className="flex flex-col xl:flex-row flex-1">
          <div
            className={`flex flex-col self-stretch ${
              hasFeaturedContent ? "xl:w-6/12" : "xl:w-full"
            }`}
          >
            {isMultiColumn ? (
              <MultiColumnMenu
                item={item}
                isDarkMode={true}
                menuKey={menuKey}
              />
            ) : (
              <SingleColumnMenu
                item={item}
                isDarkMode={true}
                menuKey={menuKey}
              />
            )}
          </div>
          {item.featuredContent && (
            <div
              className={`hidden xl:block xl:w-6/12 ${featuredContentClass} p-6 bg-featured-light rounded-tr-xl rounded-br-xl`}
            >
              <FeaturedContent
                content={item.featuredContent}
                isDarkMode={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
