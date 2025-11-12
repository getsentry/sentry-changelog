"use client";

import type { MenuItem } from "@/lib/contentful/types";
import React from "react";
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
      <Container disablePaddingTop={true} disablePaddingBottom={true}>
        <div className="mt-4">
          {menuItems.map((item, idx) => {
            const isNavigationMenuItem =
              item.__typename === "ContentfulNavigationMenuItem";

            return (
              <div key={`${item.sys.id}-${idx}`} className="mb-4">
                {isNavigationMenuItem ? (
                  <CollapsibleSection
                    title={item.cta || item.label || ""}
                    isDarkMode={isDarkMode}
                    id={item.contentful_id || `mobile-${idx}`}
                    hideOnDesktop={true}
                  >
                    {item.layout === "Multi-Column" ? (
                      <div>
                        {(item.columnsCollection?.items || []).map(
                          (column: MenuItem, colIdx: number) => {
                            const flattenedItems: any[] = [];
                            const menuItems =
                              column.menuItemsCollection?.items || [];
                            const hasSubmenus = menuItems.some(
                              (item: MenuItem) =>
                                item.__typename ===
                                  "ContentfulNavigationMenuItem" &&
                                item.layout === "Submenu",
                            );

                            if (hasSubmenus) {
                              for (const item of menuItems) {
                                if (
                                  item.__typename ===
                                    "ContentfulNavigationMenuItem" &&
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
                              <div key={`${column.sys.id}-${colIdx}`}>
                                {flattenedItems.map((item: any) => {
                                  if (item.type === "submenu") {
                                    return (
                                      <CollapsibleSection
                                        key={`submenu-${idx}-${colIdx}-${item.title}`}
                                        title={item.title}
                                        isDarkMode={isDarkMode}
                                        id={`mobile-${idx}-col-${colIdx}-${item.title}`}
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
                                        key={`group-${idx}-${colIdx}-${item.title}`}
                                        title={item.title}
                                        isDarkMode={isDarkMode}
                                        id={`mobile-${idx}-col-${colIdx}-group`}
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
                              {menuItems.map((menuItem: MenuItem, mIdx) => (
                                <div
                                  key={`${menuItem.sys.id}-${mIdx}`}
                                  className="mb-4"
                                >
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
