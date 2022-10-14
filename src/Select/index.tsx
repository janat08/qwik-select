import { component$, $, useClientEffect$ } from "@builder.io/qwik";

import type { OptionLabelKey, UseSelectProps } from "../useSelect";
import { useSelect } from "../useSelect";
import Container from "./Container";
import SingleSelectControl from "./Control/SingleSelectControl";
import MultiSelectControl from "./Control/MultiSelectControl";
import MenuItem from "./MenuItem";

type SelectProps<Option> = UseSelectProps<Option> & {
  placeholder?: string;
  autofocus?: boolean;
  disabled?: boolean;
  optionLabelKey?: OptionLabelKey<Option>;
  inputDebounceTime?: number;
  shouldFilterSelectedOptions?: boolean;
  // noOptionsMessage?: string;
};

// NOTE: the weird <Option, > syntax is to avoid error as JSX and TypeScript syntaxes clash.
// We could use a normal function instead of an arrow function, but that would cause
// "props is undefined" error in MenuItem's click event.
const Select = component$(<Option,>(props: SelectProps<Option>) => {
  const placeholder = props.placeholder ?? "Select...";
  const optionLabelKey =
    props.optionLabelKey ?? ("label" as OptionLabelKey<Option>);
  // prettier-ignore
  const getOptionLabel = (opt: Option) => typeof opt === "string" ? opt : opt[optionLabelKey] as string;
  const inputDebounceTime = props.inputDebounceTime ?? 200;
  const shouldFilterSelectedOptions = props.shouldFilterSelectedOptions ?? true;

  // TODO: define a Slot for "No options"
  // 12-Oct-2022: slot fallback content doesn't work - seems like a bug in Qwik
  const noOptionsMessage = "No options";

  const { refs, stores, actions } = useSelect<Option>(props, {
    optionLabelKey,
    inputDebounceTime,
    shouldFilterSelectedOptions,
  });
  // prettier-ignore
  const { isOpenStore, inputValueStore, filteredOptionsStore, hoveredOptionStore } = stores;

  useClientEffect$(function scrollToHoveredOption({ track }) {
    const hoveredOption = track(() => hoveredOptionStore.hoveredOption);
    if (hoveredOption) {
      const itemEl = refs.menuRef.current?.querySelector(
        '.qs-item[data-hovered="true"]'
      );
      itemEl?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  });

  const handleOptionUnselect = $((opt: Option) => {
    if (props.onUnselect$) {
      props.onUnselect$(opt);
    }
    actions.blur();
  });

  const handleClear = $(() => {
    if (props.onClear$) {
      props.onClear$();
    }
    actions.blur();
  });

  const Control = Array.isArray(props.value)
    ? MultiSelectControl
    : SingleSelectControl;

  return (
    <Container ref={refs.containerRef} disabled={props.disabled}>
      <div>
        <Control
          placeholder={placeholder}
          ref={refs.inputRef}
          value={props.value as any}
          disabled={props.disabled}
          autofocus={props.autofocus}
          inputValue={inputValueStore.value}
          loading={filteredOptionsStore.loading}
          clearable={!!props.onClear$}
          onUnselect$={handleOptionUnselect}
          onClear$={handleClear}
          optionLabelKey={optionLabelKey as any}
        />
        {isOpenStore.value === true && (
          <div class="qs-menu" ref={refs.menuRef}>
            {filteredOptionsStore.options.map((opt) => {
              const isSelected = opt === props.value;
              const isHovered = opt === hoveredOptionStore.hoveredOption;
              return (
                <MenuItem
                  option={opt}
                  getOptionLabel={getOptionLabel}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  onClick$={async () => {
                    if (props.onSelect$ && opt !== props.value) {
                      props.onSelect$(opt);
                    }
                    actions.blur();
                  }}
                />
              );
            })}
            {filteredOptionsStore.options.length === 0 && (
              <div class="qs-empty">{noOptionsMessage}</div>
            )}
          </div>
        )}
      </div>
    </Container>
  );
});

export type { SelectProps };
export default Select;
