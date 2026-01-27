<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { register } from 'swiper/element/bundle';
  import { clickOutside } from '../../actions/clickOutside';
  import Icon from './Icon.svelte';

  // Register Swiper web components
  register();

  type Props = {
    value: any | any[];
    array: any[];
    title: string;
    display?: string;
    disabled?: boolean;
    minLength?: number;
    heightLimit?: string | null;
    titleBackground?: string;
    titleBorderColor?: string;
    valuesBorderColor?: string;
    valuesGap?: string;
    activeColor?: string;
    itemBackground?: string;
    itemHoverBackground?: string;
    itemBorderColor?: string;
    itemBorderRadius?: string;
    itemTextColor?: string;
    itemHoverTextColor?: string;
    selectedBackground?: string;
    selectedTextColor?: string;
    isMultiple?: boolean;
    closeOnSelect?: boolean;
    hoverMode?: boolean;
    iconSelected?: string;
    iconUnselected?: string;
    iconColorSelected?: string;
    iconColorUnselected?: string;
    onpush?: (val: any) => void;
    onsplice?: (val: any) => void;
    onsearch?: (val: string) => void;
    setValue?: (val: any) => void;
  };

  let {
    value = $bindable(),
    array,
    title,
    display = 'title',
    disabled = false,
    minLength = 1,
    heightLimit = null,
    titleBackground = 'transparent',
    titleBorderColor = 'gainsboro',
    valuesBorderColor = 'gainsboro',
    valuesGap = '0',
    activeColor = 'steelblue',
    itemBackground = 'whitesmoke',
    itemHoverBackground = 'whitesmoke',
    itemBorderColor = 'gainsboro',
    itemBorderRadius = 'none',
    itemTextColor = 'darkslategray',
    itemHoverTextColor = 'steelblue',
    selectedBackground = 'steelblue',
    selectedTextColor = 'white',
    isMultiple = true,
    closeOnSelect = false,
    hoverMode = false,
    iconSelected = 'check_circle',
    iconUnselected = 'add_circle',
    iconColorSelected = 'steelblue',
    iconColorUnselected = 'gainsboro',
    onpush,
    onsplice,
    onsearch,
    setValue,
  }: Props = $props();

  let isOpen = $state(false);
  let search = $state('');
  let isClickLocked = $state(false);
  let searchInput: HTMLInputElement | undefined = $state();
  let swiperEl: any = $state();

  $effect(() => {
    if (!isOpen && selectedIds.length && swiperEl) {
      // Use tick to ensure the swiper component has initialized its internal 'swiper' instance
      tick().then(() => {
        if (swiperEl.swiper) {
          swiperEl.swiper.update();
        }
      });
    }
  });

  let selectedIds = $derived.by(() => {
    if (isMultiple) {
      return Array.isArray(value) ? value : (value != null ? [value] : []);
    }
    return (value != null && value !== '') ? [value] : [];
  });

  const updateValue = (newVal: any) => {
    value = newVal;
    setValue?.(newVal);
  };

  function getItemKey(item: any): any {
    if (item && typeof item === 'object' && 'id' in item) {
      return item.id;
    }
    return item;
  }

  function getItemDisplay(item: any): string {
    if (item && typeof item === 'object') {
      return item[display] || '';
    }
    return String(item);
  }

  let filteredArray = $derived.by(() => {
    if (search.length < minLength && minLength < 2) {
      return array;
    } else if (search.length < minLength) {
      return [];
    }
    return array.filter((v) =>
      getItemDisplay(v)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
    );
  });

  function focusSearch() {
    tick().then(() => {
      searchInput?.focus();
    });
  }

  function close() {
    isOpen = false;
    isClickLocked = false;
    // Do not clear search as per typical UX, or clear it if that matches Vue behavior?
    // Vue checks: this.search = "" on close()
    search = '';
  }

  function onOutside() {
    close();
  }

  function onMouseEnter() {
    if (!hoverMode || disabled) return;
    if (isClickLocked) return;
    isOpen = true;
  }

  function onMouseLeave() {
    if (!hoverMode || disabled) return;
    if (isClickLocked) return;
    close();
  }

  function onTitleClick() {
    if (disabled) return;

    if (!hoverMode) {
      isOpen = !isOpen;
      if (isOpen) focusSearch();
      return;
    }

    // hoverMode logic
    if (!isOpen) {
      isClickLocked = true;
      isOpen = true;
      focusSearch();
      return;
    }

    if (isClickLocked) {
      close();
      return;
    }

    isClickLocked = true;
    focusSearch();
  }

  function onSearchInput() {
    onsearch?.(search);
  }

  function toggleValue(val: any) {
    const key = getItemKey(val);
    
    if (isMultiple) {
      const currentValues = selectedIds as any[];
      // We need to compare keys to find if selected
      const index = currentValues.findIndex(v => getItemKey(v) === key);
      
      if (index === -1) {
        onpush?.(val);
        updateValue([...currentValues, val]);
      } else {
        onsplice?.(val);
        const next = [...currentValues];
        next.splice(index, 1);
        updateValue(next);
      }
      return;
    }
    
    // Single select
    const isCurrent = isMultiple ? false : selectedIds.some(v => getItemKey(v) === key);
    if (isCurrent) {
      updateValue(null);
    } else {
      updateValue(val);
    }
    if (closeOnSelect || hoverMode) close();
  }

</script>

<div
  class="select-multiple-wrapper"
  use:clickOutside={onOutside}
  onmouseenter={onMouseEnter}
  onmouseleave={onMouseLeave}
  role="none"
  style:--title-bg={titleBackground}
  style:--title-border={titleBorderColor}
  style:--values-border={valuesBorderColor}
  style:--values-gap={valuesGap}
  style:--active={activeColor}
  style:--item-bg={itemBackground}
  style:--item-hover-bg={itemHoverBackground}
  style:--item-border-color={itemBorderColor}
  style:--item-border-radius={itemBorderRadius}
  style:--item-text={itemTextColor}
  style:--item-hover-text={itemHoverTextColor}
  style:--selected-bg={selectedBackground}
  style:--selected-text={selectedTextColor}
>
  <div class="select-multiple">
    <div
      class="title"
      onclick={onTitleClick}
      onkeydown={(e) => e.key === 'Enter' && onTitleClick()}
      role="button"
      tabindex="0"
      class:active={selectedIds?.length}
    >
      {#if !isOpen}
        <span id="partInput" class="title-text">{title}</span>
      {:else}
        <input
          id="partInput"
          bind:this={searchInput}
          type="text"
          placeholder="{title}"
          bind:value={search}
          onclick={(e) => e.stopPropagation()}
          oninput={onSearchInput}
          onkeyup={(e) => e.key === 'Escape' && close()}
        />
      {/if}

      <!-- Count or Clear Icon -->
      {#if selectedIds.length || isOpen}
        <span class="count" transition:fade>
          {#if selectedIds.length}
             {selectedIds.length}
          {:else}
             <Icon name="clear" color="white" />
          {/if}
        </span>
      {/if}
    </div>

    <!-- Dropdown Values -->
    {#if isOpen}
      <div
        class="values"
        style:max-height={heightLimit ? `${heightLimit}` : 'none'}
      >
        {#each filteredArray as val (getItemKey(val))}
          <div
            class="value"
            class:active={selectedIds.includes(val)}
            onclick={() => {
              toggleValue(val);
              search = ''; 
            }}
            onkeydown={(e) => e.key === 'Enter' && toggleValue(val)}
            role="option"
            aria-selected={selectedIds.includes(val)}
            tabindex="0"
          >
            <span>{getItemDisplay(val)}</span>
            <div
              class="value-icon-wrapper"
              onclick={(e) => { e.stopPropagation(); toggleValue(val); }}
              onkeydown={(e) => e.key === 'Enter' && toggleValue(val)}
              role="button"
              tabindex="0"
            >
              <Icon
                name={selectedIds.includes(val) ? iconSelected : iconUnselected}
                color={selectedIds.includes(val) ? iconColorSelected : iconColorUnselected}
                height="32"
              />
            </div>
          </div>
        {/each}
      </div>
    {/if}

    <!-- Selected Items Swiper (when closed) -->
    {#if !isOpen && selectedIds.length}
      <swiper-container
        bind:this={swiperEl}
        class="selected"
        space-between="5"
        slides-per-view="auto"
        mousewheel-force-to-axis="true"
        mousewheel-release-on-edges="true"
        free-mode="true"
        observer="true"
        observe-parents="true"
      >
        {#each selectedIds as val (getItemKey(val))}
           <swiper-slide
              class="selected-value"
              onclick={() => !disabled && toggleValue(val)}
              onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && toggleValue(val)}
              role="option"
              aria-selected={selectedIds.includes(val)}
              tabindex="0"
           >
             {getItemDisplay(val
                ? (array.find(v => getItemKey(v) === getItemKey(val)) || val)
                : val
              ).split(' ')[0]
             }
           </swiper-slide>
        {/each}
      </swiper-container>
    {/if}
  </div>
</div>



<!-- Add script for transition import if not added -->
<script module>
  import { fade } from 'svelte/transition';
</script>

<style lang="scss">
.select-multiple-wrapper {
  width: fit-content;

  .select-multiple {
    display: flex;
    flex-direction: column;
    gap: 5px;
    border-radius: 20px;
    height: 60px;
    width: 300px;
    user-select: none;
    position: relative;

    .title {
      padding: 2px 12px;
      background: var(--title-bg);
      border-radius: 4px;
      font-weight: bold;
      border: 1px solid var(--title-border);
      cursor: pointer;
      height: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: 0.4s ease all;

      &.active {
        // $blue variable not defined, using fallback or we assume global SCSS
        border: 1px solid var(--active); 
      }

      .title-text {
        color: dimgray;
        font-size: 18px;
        font-weight: 400;
        padding: 1px 2px;
      }

      input {
        min-width: auto !important;
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        font-size: 18px;
        color: inherit;
      }

      .count {
        display: flex;
        justify-content: center;
        align-items: center;
        // $red variable replacement
        background: #ef4444; 
        color: white;
        font-size: 15px;
        height: 22px;
        width: 36px;
        border-radius: 20px;
        position: relative;
        left: 5px;
      }
    }

    .values {
      display: flex;
      flex-direction: column;
      gap: var(--values-gap);
      overflow-y: scroll;
      overflow-x: hidden;
      position: absolute;
      z-index: 20;
      top: 36px;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--values-border);
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
      max-height: 300px; /* default limit fallback */

      .value {
        width: 100%;
        cursor: pointer;
        transition: 0.4s;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        border-radius: var(--item-border-radius);
        background: var(--item-bg);
        border-bottom: 1px solid var(--item-border-color);
        box-sizing: border-box; /* Ensure padding doesn't overflow */
        color: var(--item-text);

        &:hover {
          background: var(--item-hover-bg);
          span {
            color: var(--item-hover-text);
            letter-spacing: 0.3px;
          }
        }

        &.active {
          span {
            color: var(--active);
          }
        }

        span {
          display: inline-block;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          padding-left: 12px;
          transition: 0.3s ease all;
        }

        .value-icon-wrapper {
          display: flex;
          align-items: center;
        }
      }
    }

    .selected {
      display: flex;
    //   flex-wrap: wrap; 
    //   gap: 6px;
    //   justify-content: center;
      /* Swiper handles layout */
      
      /* Target the slide specifically if needed */
    }
    /* Web component swiper container styling if needed */
    swiper-container {
      border-radius: 15px;
      width: 100%;
    }
  }

  /* Global styles for the web component children if shadow DOM is not issue, 
     but swiper-slide usually slots content so global CSS works or ::part */
  :global(.selected-value) {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    background: var(--selected-bg);
    color: var(--selected-text);
    padding: 0 6px;
    border-radius: 10px;
    height: 20px;
    cursor: pointer;
    width: auto !important; /* Allow auto width for slides */
  }
}
</style>
