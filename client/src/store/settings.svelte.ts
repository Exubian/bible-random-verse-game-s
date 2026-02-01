/**
 * Available languages for the application
 */
export const languages = [
  // { value: 'ua', label: 'UA' },
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

function createSettingsStore() {
  const state = $state({
    language: localStorage.language || 'ru',
    theme: localStorage.theme || 'light',
    isHintVisible: true,
  });

  const actions = {
    setLanguage(langCode: string) {
      state.language = langCode;
      localStorage.language = langCode;
    },
    setTheme(theme: string) {
      state.theme = theme;
      localStorage.theme = theme;
    },
    toggleHint() {
      state.isHintVisible = !state.isHintVisible;
    }
  };

  const store = new Proxy(actions as any, {
    get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return (state as any)[prop];
    },
    set(_target, prop, value) {
      (state as any)[prop] = value;
      return true;
    },
    has(target, prop) {
      return prop in target || prop in state;
    }
  });

  return store as typeof actions & typeof state;
}

/**
 * Settings state containing language, theme, and game hints state
 */
export const settings = createSettingsStore();
