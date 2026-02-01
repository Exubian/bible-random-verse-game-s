<script lang="ts">
  import Game from './components/game/Game.svelte';
  import Header from './components/ui/Header.svelte';
  import { setContext } from 'svelte';
  import { lx } from './store/lx.svelte';
  import { settings } from './store/settings.svelte';
  import SpinLoader from './components/ui/SpinLoader.svelte';

  let isReady = $state(false);

  function initLang(): void {
    if (['ru', 'en'].includes(localStorage.language)) {
      settings.setLanguage(localStorage.language);
    }
  }

  setContext('lx', lx);

  $effect(() => {
    initLang();
    isReady = true;
  });
</script>

<main>
  {#if isReady}
    <Header />
    <Game />
  {:else}
    <SpinLoader size="100px" height="100vh" />
  {/if}
</main>

<style lang="scss">
</style>
