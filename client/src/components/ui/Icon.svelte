<script lang="ts">
  type Props = {
    name: string;
    color?: string;
    height?: string;
    /**
     * Additional classes
     */
    class?: string;
    onclick?: (e: MouseEvent) => void;
  };

  let {
    name,
    color,
    height,
    class: className = '',
    onclick
  }: Props = $props();
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<i
  class="material-icons {className}"
  style:color
  style:font-size={height ? `${height}px` : undefined}
  {onclick}
>
  {name}
</i>

<style>
  .material-icons {
    user-select: none;
    cursor: pointer;
  }
</style>
