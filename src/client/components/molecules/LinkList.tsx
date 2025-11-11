import React from "react";
import Button from "../atoms/Button";
import Link from "../atoms/Link";
import NewPill from "../atoms/NewPill";

interface LinkItem {
  text: string;
  href: string;
  icon?: string | { url: string };
  args?: any;
  class?: string;
}

interface LinkListProps {
  heading?: string;
  links: LinkItem[];
  moreInfoText?: string;
  moreInfoDestination?: string;
  buttonStyle?: string;
  mode?: string;
  noWrapHeading?: boolean;
  hideHeadingOnMobile?: boolean;
  onLinkClick?: () => void;
}

export default function LinkList({
  heading,
  links,
  moreInfoText,
  moreInfoDestination,
  buttonStyle,
  mode,
  noWrapHeading,
  hideHeadingOnMobile,
}: LinkListProps) {
  const isDarkMode = mode === "dark";

  return (
    <div>
      {heading && (
        <h3
          className={`text-base mb-4 font-[500] ${
            isDarkMode ? "text-white" : "text-gray-800"
          } ${noWrapHeading ? "whitespace-nowrap" : ""} ${
            hideHeadingOnMobile ? "hidden xl:block" : ""
          } xl:pl-0 pl-5`}
        >
          {heading}
        </h3>
      )}
      <ul className="list-none p-0 m-0 grid gap-y-5 mt-4 xl:mt-0">
        {links.map(({ text, href, args, icon, class: linkClass }) => {
          const iconSrc = typeof icon === "string" ? icon : icon?.url;
          return (
            <li
              key={`${href}-${text}`}
              className={`pb-1 pl-6 xl:pl-0 ${iconSrc ? "pl-0" : ""}`}
            >
              <Link
                href={href}
                {...args}
                className={`no-underline font-medium text-sm leading-[18px] uppercase whitespace-nowrap flex items-center gap-x-1.5 w-full min-h-[18px] py-0.5 hover:underline xl:w-max transition-colors duration-200 font-sans ${
                  isDarkMode
                    ? "text-white hover:text-white"
                    : "text-[#4E2A9A] hover:text-[#4E2A9A]"
                }`}
              >
                {iconSrc && (
                  <img
                    src={iconSrc}
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4"
                  />
                )}
                {text}
                {linkClass === "new" && <NewPill />}
              </Link>
            </li>
          );
        })}
        {moreInfoText && moreInfoDestination && (
          <li>
            <Button
              variant={
                buttonStyle === "navigation" ? "silent" : "secondary-light"
              }
              chevron="right"
              href={moreInfoDestination}
              redesign={true}
              darkMode={isDarkMode}
            >
              {moreInfoText}
            </Button>
          </li>
        )}
      </ul>
    </div>
  );
}
