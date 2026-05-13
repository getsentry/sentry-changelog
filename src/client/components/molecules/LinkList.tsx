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
  const h3Classes = [
    "text-base mb-4 font-[500]",
    isDarkMode ? "text-white" : "text-gray-800",
    noWrapHeading ? "whitespace-nowrap" : "",
    hideHeadingOnMobile ? "hidden xl:block" : "",
    "xl:pl-0 pl-5",
  ];

  return (
    <div className={isDarkMode ? "linklist-dark" : ""}>
      {heading && <h3 className={h3Classes.join(" ")}>{heading}</h3>}
      <ul className="list-none p-0 m-0 grid gap-y-5 mt-4 xl:mt-0">
        {links.map(({ text, href, args, icon, class: linkClass }) => {
          const iconSrc = typeof icon === "string" ? icon : icon?.url;
          const isNested = linkClass?.includes("nested");
          return (
            <li
              key={`${href}-${text}`}
              className={`pb-1 ${isNested ? "xl:pl-0" : `pl-6 xl:pl-0 ${iconSrc ? "pl-0" : ""}`}`}
            >
              <Link
                href={href}
                {...args}
                className={`no-underline font-medium leading-[18px] uppercase whitespace-nowrap flex items-center gap-x-1.5 w-full min-h-[18px] py-0.5 hover:underline xl:w-max transition-colors duration-200 ${
                  isDarkMode
                    ? "text-white hover:text-white"
                    : "text-[#4E2A9A] hover:text-[#4E2A9A]"
                }`}
              >
                {isNested && (
                  <span
                    className={`inline-block w-3 h-px mr-0.5 flex-shrink-0 ${isDarkMode ? "bg-white/70" : "bg-[#4E2A9A]/50"}`}
                  />
                )}
                {iconSrc && (
                  // biome-ignore lint/performance/noImgElement: nav icons are small decorative images
                  <img
                    src={iconSrc}
                    alt=""
                    aria-hidden="true"
                    className="w-4 h-4"
                  />
                )}
                {text}
                {linkClass?.includes("new") && <NewPill />}
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
