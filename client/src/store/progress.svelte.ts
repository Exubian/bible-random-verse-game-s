import { settings } from "./settings.svelte";
import { methods } from "../utils/mixin.js";
import { cleanVerseText } from "../utils/bible_utils";

/**
 * Game progress state using Svelte 5 runes and Proxy pattern
 */
type BookMapping = {
  [key: string]: string;
};

function createProgressStore() {
  const state = $state({
    partMapping: {} as BookMapping,
    bookMapping: {} as BookMapping,
    levels: [
      { id: 0, name: 'Part', value: '', score: 0.5, completed: false },
      { id: 1, name: 'Book', value: '', score: 1, completed: false },
      { id: 2, name: 'Chapter', value: '', score: 3, completed: false },
      { id: 3, name: 'Verse', value: '', score: 5.5, completed: false },
    ],
    score: 0,
    highScore: 0,
    step: 0 as number | null, // Current step/level in the game
    currentVerse: null as any,
    isLoading: false,
    /* attempt: 1, // Number of attempts/lives made
    maxAttempts: 3, // Maximum attempts/lives allowed */
  });

  const currentLevel = $derived(() => {
    if (state.step === null || state.step >= state.levels.length) return null;
    return state.levels[state.step]?.name?.toLowerCase();
  });

  const actions = {
    get currentLevel() {
      return currentLevel;
    },

    getBookName(bookName: string, isDirect: boolean = true) {
      if (settings.language === 'en') return bookName;

      let enBookName = null;
      if (isDirect) {
        return state.bookMapping[bookName];
      } else {
        for (const key in state.bookMapping) {
          if (state.bookMapping[key] === bookName) {
            enBookName = key;
            break;
          }
        }
      }
      return enBookName;
    },

    getPartName(partName: string, isDirect: boolean = true) {
      if (settings.language === 'en') return partName;

      let enPartName = null;
      if (isDirect) {
        return state.partMapping[partName];
      } else {
        for (const key in state.partMapping) {
          if (state.partMapping[key] === partName) {
            enPartName = key;
            break;
          }
        }
      }
      return enPartName;
    },

    resetProgress() {
      state.score = 0;
      state.step = 0;
    },

    setParts(parts: { part: string, book: string, chapter: string, verseNum: string } | null) {
      if (!parts) return null;
      state.levels[0].value = parts.part;
      state.levels[1].value = parts.book;
      state.levels[2].value = parts.chapter;
      state.levels[3].value = parts.verseNum;
      return parts;
    },

    checkAnswer(answer: string) {
      if (state.step === null) return;
      if (state.step === 0) {
        answer = actions.getPartName(answer) || '';
      }

      if (
        answer ===
        state.levels[state.step].value
      ) {
        state.score += state.levels[state.step].score;
        if (state.score > state.highScore) {
          state.highScore = state.score;
        }
        state.levels[state.step].completed = true;
        state.step++;
      } else {
        state.step = null;
      }
    },

    async fetchRandomVerse(removeIdentical = true) {
      try {
        state.isLoading = true;
        const response = await (methods.fetch as any)(
          '/verse?bibleName=' + (settings.language === 'en' ? 'en' : 'RUS_SYNODAL')
        ).get();
        if (response?.verse) {
          if (removeIdentical) {
            response.verse = cleanVerseText(response.verse);
          }
          state.currentVerse = actions.setParts(response);
        }
      } catch (error) {
        console.error('Error fetching random verse:', error);
      } finally {
        state.isLoading = false;
      }
    },

    async fetchBookMapping() {
      try {
        if (settings.language === 'en') return;
        state.isLoading = true;
        const response = await (methods.fetch as any)('/book-mapping?bibleName=RUS_SYNODAL').get();
        if (Object.keys(response).length > 0) {
          state.bookMapping = response.bookMapping;
          state.partMapping = response.partMapping;
        }
      } catch (error) {
        console.error('Error fetching book mapping:', error);
      } finally {
        state.isLoading = false;
      }
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

  (store as any).state = state;

  return store as typeof actions & typeof state & { state: typeof state };
}

export const progress = createProgressStore();
