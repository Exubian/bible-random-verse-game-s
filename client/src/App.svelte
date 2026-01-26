<script lang="ts">
  import Game from './components/game/Game.svelte';
  import Header from './components/ui/Header.svelte';
  import { setContext } from 'svelte';
  import { lx } from './store/lx.svelte';
  import { setLanguage } from './store/settings.svelte';

  function initLang() {
    if (['ru', 'en'].includes(localStorage.language)) setLanguage(localStorage.language);
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
