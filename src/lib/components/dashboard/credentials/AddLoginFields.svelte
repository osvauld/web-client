<script lang="ts">
  import { BinIcon } from "../icons";
  import { AddCredentialField } from "../dtos";

  export let field: AddCredentialField;
  export let index: Number;
  export let hoveredIndex: Number | null;

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  const sensitiveLabelMaker = (index: Number, identifier: Boolean) => {
    dispatch("select", { index: index, identifier: identifier });
  };

  const removeEventDispatcher = (index: Number) => {
    dispatch("remove", index);
  };
  /* eslint-disable*/
</script>

<div class="field-container rounded-sm transition relative">
  <div class="flex items-center justify-between p-4">
    <input
      class="py-1 pr-10 rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[16rem] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
      id={`key-${index}`}
      type="text"
      placeholder="Enter field name"
      autofocus
      bind:value={field.fieldName}
    />
    <input
      class="py-1 pr-10 rounded-lg items-center text-base bg-osvauld-frameblack border-osvauld-iconblack w-[16rem] h-10 mx-2 focus:border-osvauld-iconblack focus:ring-0"
      id={`value-${index}`}
      type="text"
      placeholder="Enter value"
      bind:value={field.fieldValue}
    />
    <div
      class="flex items-center justify-center {index === hoveredIndex
        ? 'relative'
        : ''}"
      on:mouseenter={() => sensitiveLabelMaker(index, true)}
      on:mouseleave={() => sensitiveLabelMaker(index, false)}
    >
      <label
        for={`toggle-${index}`}
        class="inline-flex items-center cursor-pointer"
      >
        <span class="relative">
          <span
            class="block w-10 h-6 {field.sensitive
              ? 'bg-osvauld-carolinablue'
              : 'bg-osvauld-placeholderblack'} rounded-full shadow-inner"
          ></span>
          <span
            class="absolute block w-4 h-4 mt-1 ml-1 rounded-full shadow inset-y-0 left-0 focus-within:shadow-outline transform transition-transform duration-300 ease-in-out {field.sensitive
              ? 'bg-osvauld-plainwhite translate-x-full'
              : 'bg-osvauld-chalkwhite'}"
          >
            <input
              type="checkbox"
              id={`toggle-${index}`}
              class="absolute opacity-0 w-0 h-0"
              bind:checked={field.sensitive}
            />
          </span>
        </span>
      </label>
      {#if index === hoveredIndex}
        <span
          class=" absolute top-[-3.75rem] left-[-1.5625rem] bg-osvauld-iconblack rounded-lg p-3 text-sm text-osvauld-dusklabel triangle"
          >Sensitive</span
        >
      {/if}
    </div>
    <div class="flex items-center justify-center">
      <button
        class="rounded-md pr-2 pl-2 bg-osvauld-frameblack text-osvauld-quarzowhite flex justify-center items-center ml-5"
        on:click={() => removeEventDispatcher(index)}
      >
        <BinIcon />
      </button>
    </div>
  </div>
</div>

<style>
  .triangle::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    border-width: 10px;
    border-style: solid;
    border-color: transparent transparent #21262d transparent;
    transform: translateX(-50%) rotate(180deg);
  }
</style>
