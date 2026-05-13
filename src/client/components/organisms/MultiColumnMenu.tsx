import type React from "react";
import type { MenuItem } from "@/lib/navigation/types";
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
      className="multi-column-menu flex flex-col xl:flex-row flex-1"
      style={{ "--column-count": columns.length } as React.CSSProperties}
    >
      {columns.map((column: MenuItem) => {
        const columnMenuItems = column.menuItemsCollection?.items || [];
        const classes = (column.className || "").split(/\s+/).filter(Boolean);
        const isBackgroundColumn = classes.some((c) => c.startsWith("bg-"));
        const isWideColumn = classes.includes("wide-column");

        const bgClass = classes.includes("bg-gray")
          ? "bg-featured-light"
          : classes.find((c) => c.startsWith("bg-")) || "";

        const hasSubmenus = columnMenuItems.some(
          (sub: MenuItem) =>
            sub.__typename === "ContentfulNavigationMenuItem" &&
            sub.layout === "Submenu",
        );

        const columnClasses = [
          "flex flex-col self-stretch xl:flex-1",
          bgClass,
          isBackgroundColumn && "relative",
          isWideColumn && "wide-column",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div key={column.sys.id} className={columnClasses}>
            <div className="flex-1 flex flex-col">
              {hasSubmenus ? (
                columnMenuItems
                  .filter(
                    (subItem: MenuItem) =>
                      subItem.__typename === "ContentfulNavigationMenuItem" &&
                      subItem.layout === "Submenu",
                  )
                  .map((subItem: MenuItem) => (
                    <div key={subItem.sys.id} className="xl:mb-2">
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
