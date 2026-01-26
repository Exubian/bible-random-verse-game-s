import { settings } from './settings.svelte';
import { Lexicon } from '../lib/Lexicon';

export const lx = {
  get current() {
    const lang = (settings.language as 'ru' | 'en') || 'en';
    return Lexicon[lang] || Lexicon.en;
  }
};
