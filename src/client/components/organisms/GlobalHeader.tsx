"use client";

import { useEffect, useState } from "react";
import type { MenuItem } from "@/lib/contentful/types";
import Button from "../atoms/Button";
import Container from "../atoms/Container";
import Logo from "../atoms/Logo";
import DesktopNavigation from "./DesktopNavigation";
import MobileMenu from "./MobileMenu";
import NavigationAuth from "./NavigationAuth";

interface GlobalHeaderProps {
  menuItems: MenuItem[];
  mode?: "dark" | "light";
}

export default function GlobalHeader({
  menuItems = [],
  mode = "dark",
}: GlobalHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDarkMode = mode === "dark";

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest("[data-menu-trigger]") &&
        !target.closest("[data-menu-dropdown]") &&
        !target.closest("#menu-toggle-button") &&
        !target.closest("#mobileMenu")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isDarkMode ? "bg-rich-black" : "bg-white"
      } ${
        isMobileMenuOpen ? "xl:max-h-none max-h-screen overflow-y-auto" : ""
      }`}
    >
      <Container disablePaddingTop disablePaddingBottom>
        <div className="flex flex-row flex-wrap items-center justify-center w-full py-4 xl:flex-nowrap">
          <a
            href="https://sentry.io/welcome/"
            aria-label="Welcome Page"
            className={`flex items-center flex-shrink-0 mr-auto ${
              isDarkMode ? "text-white" : "text-gray-800"
            } focus:outline-none focus:fill-pink-500`}
          >
            <Logo geometryArgs={{ style: "wordmark" }} className="h-8" />
          </a>

          <Button
            variant="silent"
            redesign={true}
            chevron="right"
            className="xl:hidden inline-flex"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobileMenu"
            darkMode={isDarkMode}
            id="menu-toggle-button"
            type="button"
            onClick={handleMobileMenuToggle}
          >
            Menu
          </Button>

          <MobileMenu
            menuItems={menuItems}
            isDarkMode={isDarkMode}
            isOpen={isMobileMenuOpen}
          />

          <DesktopNavigation menuItems={menuItems} isDarkMode={isDarkMode} />

          <NavigationAuth isDarkMode={isDarkMode} isMobile={false} />
        </div>
      </Container>
    </header>
  );
}
