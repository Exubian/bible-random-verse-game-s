<script>
  import { settings, languages, setLanguage } from '../../store/settings.svelte';

  let isOpen = $state(false);

  let selected = $derived(
    languages.find(l => l.value === settings.language) || languages[1]
  );

  function handleMouseEnter() {
    isOpen = true;
  }

  function handleMouseLeave() {
    isOpen = false;
  }

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  /**
   * @param {string} value - The language option to select.
   */
  function selectOption(value) {
    setLanguage(value);
    isOpen = false;
  }
</script>

<div
  class="custom-dropdown"
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  role="none"
>
  <button
    class="dropdown-trigger"
    onclick={toggleDropdown}
    type="button"
    aria-expanded={isOpen}
  >
    <i class="material-icons">language</i>
    <span class="current-label">{selected.label}</span>
    <i class="material-icons chevron {isOpen ? 'rotated' : ''}">expand_more</i>
  </button>

  {#if isOpen}
    <div class="dropdown-menu">
      {#each languages as option}
        <button
          class="dropdown-item"
          class:selected={option.value === selected.value}
          onclick={() => selectOption(option.value)}
          type="button"
        >
          {option.label}
          {#if option.value === selected.value}
            <i class="material-icons check">check</i>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .custom-dropdown {
    position: relative;
    display: inline-block;

    .dropdown-trigger {
      background: #f0f4ff;
      border: none;
      padding: 8px 16px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s;
      color: #1e1b4b;
      font-weight: 700;
      font-size: 14px;

      i {
        font-size: 18px;
        color: #6366f1;
      }

      .chevron {
        font-size: 20px;
        transition: transform 0.2s;
        &.rotated { transform: rotate(180deg); }
      }

      &:hover {
        background: #e0e7ff;
      }

      @media (prefers-color-scheme: dark) {
        background: #3730a3;
        color: #fff;
        i { color: #c7d2fe; }
        &:hover { background: #4338ca; }
      }
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      background: #ffffff;
      min-width: 120px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      padding: 8px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 1100;
      animation: slideDown 0.2s ease-out;

      &::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 0;
        right: 0;
        height: 10px;
      }

      @media (prefers-color-scheme: dark) {
        background: #2a2a2a;
        border-color: #444;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      }
    }

    .dropdown-item {
      background: transparent;
      border: none;
      padding: 10px 12px;
      border-radius: 8px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      color: #4b5563;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        color: #6366f1;
      }

      &.selected {
        background: #f0f4ff;
        color: #6366f1;
      }

      i.check {
        font-size: 16px;
      }

      @media (prefers-color-scheme: dark) {
        color: #bbb;
        &:hover { background: #3f3f3f; color: #fff; }
        &.selected { background: #3730a3; color: #fff; }
      }
    }
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>