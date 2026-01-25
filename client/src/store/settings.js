import { writable } from "svelte/store";

/**
 * Available languages for the application
 */
export const languages = [
  { value: 'ukr', label: 'UA' },
  { value: 'rus', label: 'RU' },
  { value: 'eng', label: 'EN' }
];

/**
 * Settings store containing language, theme, and game hints state
 */
export const settings = writable({
  language: "rus",
  theme: "light",
  isHintVisible: true,
});

/**
 * Updates the application language in the settings store
 * @param {string} langCode - The value from the languages array (e.g., 'rus')
 */
export const setLanguage = (langCode) => {
  settings.update(state => ({
    ...state,
    language: langCode
  }));
};