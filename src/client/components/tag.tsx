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
  if (pointer && onClick) {
    return (
      <button
        type="button"
        className={`py-1 px-3 uppercase shadow-sm no-underline rounded-full text-red text-xs mr-2 cursor-pointer ${
          active ? "bg-gray-300" : "bg-gray-100"
        }`}
        onClick={onClick}
      >
        {text.split(" ").join("-")}
      </button>
    );
  }

  return (
    <div
      className={`py-1 px-3 uppercase shadow-sm no-underline rounded-full text-red text-xs mr-2 ${
        active ? "bg-gray-300" : "bg-gray-100"
      }`}
    >
      {text.split(" ").join("-")}
    </div>
  );
}
