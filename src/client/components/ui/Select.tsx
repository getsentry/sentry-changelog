"use client";
import ReactSelect, {
  type GroupBase,
  type Props,
  type StylesConfig,
} from "react-select";
import CreatableSelect from "react-select/creatable";

// Map react-select onto Radix Themes tokens so it matches the rest of the form.
function radixStyles<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>,
>(invalid: boolean): StylesConfig<Option, IsMulti, Group> {
  return {
    control: (base, state) => ({
      ...base,
      minHeight: "var(--space-6)",
      borderRadius: "var(--radius-2)",
      backgroundColor: "var(--color-surface)",
      fontSize: "var(--font-size-2)",
      borderColor: invalid
        ? "var(--red-8)"
        : state.isFocused
          ? "var(--accent-8)"
          : "var(--gray-a7)",
      boxShadow: state.isFocused ? "0 0 0 1px var(--accent-8)" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "var(--accent-8)" : "var(--gray-a8)",
      },
    }),
    valueContainer: (base) => ({ ...base, padding: "2px 6px" }),
    placeholder: (base) => ({ ...base, color: "var(--gray-a10)" }),
    input: (base) => ({ ...base, color: "var(--gray-12)" }),
    singleValue: (base) => ({ ...base, color: "var(--gray-12)" }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "var(--accent-a3)",
      borderRadius: "var(--radius-1)",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "var(--accent-11)",
      fontSize: "var(--font-size-1)",
      fontWeight: 500,
      padding: "2px 6px",
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: "var(--accent-11)",
      borderRadius: "var(--radius-1)",
      ":hover": {
        backgroundColor: "var(--accent-a5)",
        color: "var(--accent-12)",
      },
    }),
    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (base) => ({
      ...base,
      padding: 6,
      color: "var(--gray-a9)",
    }),
    clearIndicator: (base) => ({
      ...base,
      padding: 6,
      color: "var(--gray-a9)",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "var(--radius-3)",
      boxShadow: "var(--shadow-5)",
      backgroundColor: "var(--color-panel-solid)",
      overflow: "hidden",
    }),
    menuPortal: (base) => ({ ...base, zIndex: 60 }),
    groupHeading: (base) => ({
      ...base,
      color: "var(--gray-11)",
      fontWeight: 600,
      textTransform: "none",
      fontSize: "var(--font-size-1)",
    }),
    option: (base, state) => ({
      ...base,
      fontSize: "var(--font-size-2)",
      color: "var(--gray-12)",
      backgroundColor: state.isFocused ? "var(--accent-a3)" : "transparent",
      ":active": { backgroundColor: "var(--accent-a4)" },
    }),
  };
}

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: Props<Option, IsMulti, Group> & {
    // When false, restricts selection to the provided options (no free-text
    // entry). Defaults to true to preserve the original Creatable behavior.
    creatable?: boolean;
    invalid?: boolean;
  },
) {
  const { creatable = true, invalid = false, ...selectProps } = props;
  const SelectComponent = creatable ? CreatableSelect : ReactSelect;
  return (
    <SelectComponent
      // Stable ids avoid SSR/client hydration mismatches.
      instanceId={props.name}
      inputId={props.id ?? props.name}
      styles={radixStyles<Option, IsMulti, Group>(invalid)}
      menuPortalTarget={
        typeof document === "undefined" ? undefined : document.body
      }
      {...selectProps}
    />
  );
}
