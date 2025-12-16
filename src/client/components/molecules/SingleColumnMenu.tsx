import type { MenuItem } from "@/lib/contentful/types";
import React from "react";
import LinkList from "./LinkList";

interface SingleColumnMenuProps {
  item: MenuItem;
  isDarkMode?: boolean;
  menuKey: string;
}

export default function SingleColumnMenu({
  item,
  isDarkMode,
  menuKey,
}: SingleColumnMenuProps) {
  const menuItems = item.menuItemsCollection?.items || [];

  const hasSubmenus = menuItems.some(
    (menuItem: MenuItem) =>
      menuItem.__typename === "NavigationMenuItem" &&
      menuItem.layout === "Submenu",
  );

  return (
    <div className="flex flex-col lg:flex-row flex-1">
      <div className="flex flex-col self-stretch p-4 lg:p-[1.5rem]">
        <div className="pl-4 lg:pl-0 mb-6 lg:mb-0 flex-1 flex flex-col">
          {hasSubmenus ? (
            <div className="flex flex-col gap-y-4 lg:gap-y-1">
              {menuItems.map((menuItem: MenuItem, idx) => (
                <div key={`${menuItem.sys.id}-${idx}`} className="mb-4 lg:mb-2">
                  {menuItem.__typename === "NavigationMenuItem" &&
                  menuItem.layout === "Submenu" ? (
                    <LinkList
                      heading={menuItem.label}
                      links={(menuItem.menuItemsCollection?.items || []).map(
                        (link: MenuItem) => ({
                          text: link?.cta || link?.label || "",
                          href: link.url || link.destination || "",
                          icon: link.icon,
                        }),
                      )}
                      mode="light"
                      buttonStyle="navigation"
                    />
                  ) : (
                    <LinkList
                      links={[
                        {
                          text: menuItem?.cta || menuItem?.label || "",
                          href: menuItem.url || menuItem.destination || "",
                          icon: menuItem.icon,
                        },
                      ]}
                      mode="light"
                      buttonStyle="navigation"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-4 lg:mb-2">
              <LinkList
                heading={
                  ["solutions", "resources"].includes(menuKey)
                    ? undefined
                    : item?.cta || item?.label
                }
                links={menuItems.map((link: MenuItem) => ({
                  text: link?.cta || link?.label || "",
                  href: link.url || link.destination || "",
                  icon: link.icon,
                }))}
                mode="light"
                buttonStyle="navigation"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
