import type { MouseEventHandler } from "react";

type CategoryTagProps = {
  text: string;
  active?: boolean;
  pointer?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function CategoryTag({
  text,
  active,
  pointer,
  onClick,
}: CategoryTagProps) {
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide transition-colors duration-150";
  const activeStyle = "bg-blog-accent text-white";
  const inactiveStyle =
    "bg-surface-overlay text-blog-accent border border-blog-border hover:bg-blog-accent hover:text-white";

  if (pointer && onClick) {
    return (
      <button
        type="button"
        className={`${base} ${active ? activeStyle : inactiveStyle} cursor-pointer`}
        onClick={onClick}
      >
        {text.split(" ").join("-")}
      </button>
    );
  }

  return (
    <span className={`${base} ${active ? activeStyle : inactiveStyle}`}>
      {text.split(" ").join("-")}
    </span>
  );
}
