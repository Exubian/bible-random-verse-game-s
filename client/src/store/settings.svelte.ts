/**
 * Available languages for the application
 */
export const languages = [
  // { value: 'ua', label: 'UA' },
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

/**
 * Settings state containing language, theme, and game hints state
 */
export const settings = $state({
  language: 'ru',
  theme: 'light',
  isHintVisible: true,
});

/**
 * Updates the application language in the settings state
 * @param {string} langCode - The value from the languages array (e.g., 'rus')
 */
export const setLanguage = (langCode: string) => {
  settings.language = langCode;
  localStorage.setItem('language', langCode);
};
