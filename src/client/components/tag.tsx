import type { MouseEventHandler } from "react";

type CategoryTagProps = {
  text: string;
  active?: boolean;
  pointer?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

export function CategoryTag({ text, pointer, onClick }: CategoryTagProps) {
  const base =
    "text-[0.6875rem] font-medium uppercase tracking-[.06em] text-[#fd44b0] inline-block transition-opacity duration-150 hover:opacity-70";

  if (pointer && onClick) {
    return (
      <button
        type="button"
        className={`${base} cursor-pointer`}
        onClick={onClick}
      >
        {text.split(" ").join("-")}
      </button>
    );
  }

  return <span className={base}>{text.split(" ").join("-")}</span>;
}
