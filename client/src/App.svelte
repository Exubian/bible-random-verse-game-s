<script lang="ts">
  import Game from './components/game/Game.svelte';
  import Header from './components/ui/Header.svelte';
  import { setContext } from 'svelte';
  import { lx } from './store/lx.svelte';
  import { settings } from './store/settings.svelte';

  function initLang(): void {
    if (['ru', 'en'].includes(localStorage.language)) {
      settings.setLanguage(localStorage.language);
    }
  }

  setContext('lx', lx);

  $effect(() => {
    initLang();
  });
</script>

<main>
  <Header />
  <Game />
</main>

<style>
</style>
