"use client";
import { Fragment } from "react";
import ReactSelect, { type GroupBase, type Props } from "react-select";
import CreatableSelect from "react-select/creatable";

export function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(
  props: Props<Option, IsMulti, Group> & {
    label: string;
    // When false, restricts selection to the provided options (no free-text
    // entry). Defaults to true to preserve the original Creatable behavior.
    creatable?: boolean;
  },
) {
  const { creatable = true, ...selectProps } = props;
  const SelectComponent = creatable ? CreatableSelect : ReactSelect;
  return (
    <Fragment>
      <label
        htmlFor={props.id ?? props.name}
        className="block text-xs font-medium text-gray-700"
      >
        {props.label}
        {props.required && (
          <Fragment>
            &nbsp;<span className="font-bold text-secondary">*</span>
          </Fragment>
        )}
      </label>
      <SelectComponent id={props.id ?? props.name} {...selectProps} />
    </Fragment>
  );
}
