"use client";

import type { MenuItem } from "@/lib/navigation/types";
import Button from "../atoms/Button";
import Container from "../atoms/Container";
import CollapsibleSection from "../molecules/CollapsibleSection";
import LinkList from "../molecules/LinkList";
import NavigationAuth from "./NavigationAuth";

interface MobileMenuProps {
  menuItems: MenuItem[];
  isDarkMode?: boolean;
  isOpen: boolean;
}

export default function MobileMenu({
  menuItems = [],
  isDarkMode = false,
  isOpen,
}: MobileMenuProps) {
  const wrapperClasses = [
    "xl:hidden",
    "w-full",
    isOpen ? "block" : "hidden",
  ].join(" ");

  return (
    <div id="mobileMenu" className={wrapperClasses}>
      <Container
        disablePaddingTop={true}
        disablePaddingBottom={true}
        disablePaddingLeft={true}
        disablePaddingRight={true}
      >
        <div className="mt-4">
          {menuItems.map((item) => {
            const isNavigationMenuItem =
              item.__typename === "NavigationMenuItem";
            const itemId = item.id;

            return (
              <div key={itemId} className="mb-4">
                {isNavigationMenuItem ? (
                  <CollapsibleSection
                    title={item.cta || item.label || ""}
                    isDarkMode={isDarkMode}
                    id={item.id || `mobile-${itemId}`}
                    hideOnDesktop={true}
                  >
                    {item.layout === "Multi-Column" ? (
                      <div>
                        {(item.columnsCollection?.items || []).map(
                          (column: MenuItem) => {
                            const flattenedItems: any[] = [];
                            const menuItems =
                              column.menuItemsCollection?.items || [];
                            const hasSubmenus = menuItems.some(
                              (item: MenuItem) =>
                                item.__typename === "NavigationMenuItem" &&
                                item.layout === "Submenu",
                            );

                            if (hasSubmenus) {
                              for (const item of menuItems) {
                                if (
                                  item.__typename === "NavigationMenuItem" &&
                                  item.layout === "Submenu"
                                ) {
                                  flattenedItems.push({
                                    type: "submenu",
                                    title: item.label,
                                    items: item.menuItemsCollection?.items,
                                  });
                                }
                              }
                            } else {
                              flattenedItems.push({
                                type: "group",
                                title: column.label,
                                items: menuItems,
                              });
                            }

                            return (
                              <div key={column.id}>
                                {flattenedItems.map((item: any) => {
                                  if (item.type === "submenu") {
                                    return (
                                      <CollapsibleSection
                                        key={`submenu-${itemId}-${column.id}-${item.title}`}
                                        title={item.title}
                                        isDarkMode={isDarkMode}
                                        id={`mobile-${itemId}-col-${column.id}-${item.title}`}
                                        buttonVariant="silent"
                                      >
                                        <LinkList
                                          links={item.items.map(
                                            (link: MenuItem) => ({
                                              text:
                                                link.cta || link.label || "",
                                              href:
                                                link.url ||
                                                link.destination ||
                                                "",
                                              icon: link.icon,
                                            }),
                                          )}
                                          mode={isDarkMode ? "dark" : "light"}
                                          buttonStyle="navigation"
                                          hideHeadingOnMobile={true}
                                        />
                                      </CollapsibleSection>
                                    );
                                  }
                                  if (item.type === "group") {
                                    return (
                                      <CollapsibleSection
                                        key={`group-${itemId}-${column.id}-${item.title}`}
                                        title={item.title}
                                        isDarkMode={isDarkMode}
                                        id={`mobile-${itemId}-col-${column.id}-group`}
                                        buttonVariant="silent"
                                      >
                                        <LinkList
                                          links={item.items.map(
                                            (link: MenuItem) => ({
                                              text:
                                                link.cta || link.label || "",
                                              href:
                                                link.url ||
                                                link.destination ||
                                                "",
                                              icon: link.icon,
                                            }),
                                          )}
                                          mode={isDarkMode ? "dark" : "light"}
                                          buttonStyle="navigation"
                                          hideHeadingOnMobile={true}
                                        />
                                      </CollapsibleSection>
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            );
                          },
                        )}
                      </div>
                    ) : (
                      (() => {
                        const menuItems = item.menuItemsCollection?.items || [];
                        const hasSubmenus = menuItems.some(
                          (menuItem: MenuItem) => menuItem.layout === "Submenu",
                        );

                        if (hasSubmenus) {
                          return (
                            <div>
                              {menuItems.map((menuItem: MenuItem) => (
                                <div key={menuItem.id} className="mb-4">
                                  {menuItem.layout === "Submenu" ? (
                                    <LinkList
                                      heading={menuItem.label}
                                      links={(
                                        menuItem.menuItemsCollection?.items ||
                                        []
                                      ).map((link: MenuItem) => ({
                                        text: link.cta || link.label || "",
                                        href:
                                          link.url || link.destination || "",
                                        icon: link.icon,
                                      }))}
                                      mode={isDarkMode ? "dark" : "light"}
                                      buttonStyle="navigation"
                                      hideHeadingOnMobile={true}
                                    />
                                  ) : (
                                    <LinkList
                                      links={[
                                        {
                                          text:
                                            menuItem.cta ||
                                            menuItem.label ||
                                            "",
                                          href:
                                            menuItem.url ||
                                            menuItem.destination ||
                                            "",
                                          icon: menuItem.icon,
                                        },
                                      ]}
                                      mode={isDarkMode ? "dark" : "light"}
                                      buttonStyle="navigation"
                                      hideHeadingOnMobile={true}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <LinkList
                            heading={item.label}
                            links={menuItems.map((link: MenuItem) => ({
                              text: link.cta || link.label || "",
                              href: link.url || link.destination || "",
                              icon: link.icon,
                            }))}
                            mode={isDarkMode ? "dark" : "light"}
                            buttonStyle="navigation"
                            hideHeadingOnMobile={true}
                          />
                        );
                      })()
                    )}
                  </CollapsibleSection>
                ) : (
                  <Button
                    href={item.destination}
                    variant="silent"
                    redesign={true}
                    darkMode={true}
                    className="w-full !justify-start"
                  >
                    {item.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <NavigationAuth isDarkMode={isDarkMode} isMobile={true} />
      </Container>
    </div>
  );
}
