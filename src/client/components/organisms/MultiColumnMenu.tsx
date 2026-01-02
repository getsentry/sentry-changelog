import type React from "react";
import type { MenuItem } from "@/lib/contentful/types";
import CollapsibleSection from "../molecules/CollapsibleSection";
import LinkList from "../molecules/LinkList";

interface MultiColumnMenuProps {
  item: MenuItem;
  isDarkMode?: boolean;
  menuKey: string;
}

export default function MultiColumnMenu({
  item,
  isDarkMode,
}: MultiColumnMenuProps) {
  const columns = item.columnsCollection?.items || [];

  return (
    <div
      className="flex flex-col xl:flex-row flex-1"
      style={{ "--column-count": columns.length } as React.CSSProperties}
    >
      {columns.map((column: MenuItem, index: number) => {
        const columnMenuItems = column.menuItemsCollection?.items || [];
        const isBackgroundColumn = column.className?.includes("bg-");

        let backgroundClass = column.className || "";
        if (backgroundClass === "bg-gray") {
          backgroundClass = "bg-featured-light";
        }

        const hasSubmenus = columnMenuItems.some(
          (sub: MenuItem) =>
            sub.__typename === "ContentfulNavigationMenuItem" &&
            sub.layout === "Submenu",
        );

        const columnClasses = [
          "flex flex-col self-stretch xl:flex-1",
          !isBackgroundColumn ? "xl:px-6 xl:py-6" : "xl:p-[1.5rem]",
          backgroundClass,
          isBackgroundColumn && "relative xl:rounded-2xl",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={`${column.sys.id}-${index}`} className={columnClasses}>
            <div className="flex-1 flex flex-col">
              {hasSubmenus ? (
                columnMenuItems
                  .filter(
                    (subItem: MenuItem) =>
                      subItem.__typename === "ContentfulNavigationMenuItem" &&
                      subItem.layout === "Submenu",
                  )
                  .map((subItem: MenuItem, subIdx: number) => (
                    <div
                      key={`${subItem.sys.id}-${subIdx}`}
                      className="xl:mb-2"
                    >
                      <div className="xl:hidden">
                        <CollapsibleSection
                          title={subItem.label || ""}
                          isDarkMode={isDarkMode}
                          id={subItem.contentful_id}
                          hideOnDesktop={true}
                        >
                          <LinkList
                            heading={subItem.label}
                            links={(
                              subItem.menuItemsCollection?.items || []
                            ).map((link: MenuItem) => ({
                              text: link.cta || link.label || "",
                              href: link.url || link.destination || "",
                              icon: link.icon,
                              class: link.class,
                            }))}
                            mode="dark"
                            buttonStyle="silent"
                            hideHeadingOnMobile={true}
                          />
                        </CollapsibleSection>
                      </div>

                      <div className="hidden xl:block">
                        <LinkList
                          heading={subItem.label}
                          links={(subItem.menuItemsCollection?.items || []).map(
                            (link: MenuItem) => ({
                              text: link.cta || link.label || "",
                              href: link.url || link.destination || "",
                              icon: link.icon,
                              class: link.class,
                            }),
                          )}
                          mode="light"
                          buttonStyle="navigation"
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="xl:mb-2">
                  <div className="xl:hidden">
                    <CollapsibleSection
                      title={column.label || ""}
                      isDarkMode={isDarkMode}
                      id={column.contentful_id}
                      hideOnDesktop={true}
                    >
                      <LinkList
                        heading={column.label}
                        links={columnMenuItems.map((link: MenuItem) => ({
                          text: link.cta || link.label || "",
                          href: link.url || link.destination || "",
                          icon: link.icon,
                          class: link.class,
                        }))}
                        mode="dark"
                        buttonStyle="navigation"
                        hideHeadingOnMobile={true}
                      />
                    </CollapsibleSection>
                  </div>

                  <div className="hidden xl:block">
                    <LinkList
                      heading={column.label}
                      links={columnMenuItems.map((link: MenuItem) => ({
                        text: link.cta || link.label || "",
                        href: link.url || link.destination || "",
                        icon: link.icon,
                        class: link.class,
                      }))}
                      mode="light"
                      buttonStyle="navigation"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
