import { useStore, $ } from "@builder.io/qwik";

interface HoveredOptionStore<Option> {
  hoveredOptionIndex: number;
  hoveredOption?: Option;
}

export function useHoveredOptionStore<Option>(filteredOptionsStore: {
  options: Option[];
}) {
  const state = useStore<HoveredOptionStore<Option>>({
    hoveredOptionIndex: -1,
  });

  // prettier-ignore
  const hoverSelectedOrFirstOption = $((selectedVal: Option | Option[] | undefined) => {
    // empty list, no option to hover
    if (filteredOptionsStore.options.length === 0) {
      return;
    }

    // single selected option, hover if found in the list
    if (selectedVal !== undefined && !Array.isArray(selectedVal)) {
      const optIndex = filteredOptionsStore.options.indexOf(selectedVal);
      if (optIndex > 0) {
        state.hoveredOptionIndex = optIndex;
        state.hoveredOption = selectedVal;
        return;
      }
    }

    // otherwise, hover the first option
    state.hoveredOptionIndex = 0;
    state.hoveredOption = filteredOptionsStore.options[0];
  });

  const hoverNextOption = $(() => {
    if (state.hoveredOptionIndex >= 0) {
      let index = state.hoveredOptionIndex + 1;
      if (index > filteredOptionsStore.options.length - 1) {
        index = 0;
      }
      state.hoveredOptionIndex = index;
      state.hoveredOption = filteredOptionsStore.options[index];
    }
  });

  const hoverPrevOption = $(() => {
    if (state.hoveredOptionIndex >= 0) {
      let index = state.hoveredOptionIndex - 1;
      if (index < 0) {
        index = filteredOptionsStore.options.length - 1;
      }
      state.hoveredOptionIndex = index;
      state.hoveredOption = filteredOptionsStore.options[index];
    }
  });

  const clearHoveredOption = $(() => {
    state.hoveredOptionIndex = -1;
    state.hoveredOption = undefined;
  });

  const actions = {
    hoverSelectedOrFirstOption,
    hoverNextOption,
    hoverPrevOption,
    clearHoveredOption,
  };
  return { hoveredOptionStore: state, actions };
}
