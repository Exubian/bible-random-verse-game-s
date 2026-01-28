import { settings } from "./settings.svelte";

/**
 * Game progress state using Svelte 5 runes
 */
type BookMapping = {
  [key: string]: string;
};
export const progress = $state({
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
  step: 0, // Current step/level in the game
  /* attempt: 1, // Number of attempts/lives made
  maxAttempts: 3, // Maximum attempts/lives allowed */
});

export const currentLevel = () => {
  if (progress.step === null || progress.step >= progress.levels.length) return null;
  return progress.levels[progress.step]?.name?.toLowerCase();
};

export const getBookName = (bookName: string, isDirect: boolean = true) => {
  if (settings.language === 'en') return bookName;

  let enBookName = null;
  if (isDirect) {
    return progress.bookMapping[bookName];
  } else {
    for (const key in progress.bookMapping) {
      if (progress.bookMapping[key] === bookName) {
        enBookName = key;
        break;
      }
    }
  }
  return enBookName;
};

export const getPartName = (partName: string, isDirect: boolean = true) => {
  if (settings.language === 'en') return partName;

  let enPartName = null;
  if (isDirect) {
    return progress.partMapping[partName];
  } else {
    for (const key in progress.partMapping) {
      if (progress.partMapping[key] === partName) {
        enPartName = key;
        break;
      }
    }
  }
  return enPartName;
};

/**
 * Methods for managing game progress
 */
export const resetProgress = () => {
  progress.score = 0;
  progress.step = 0;
  // progress.attempt = 1;
};

export const setParts = (
  parts: { part: string, book: string, chapter: string, verseNum: string }|null
) => {
  if (!parts) return null;
  progress.levels[0].value = parts.part;
  progress.levels[1].value = parts.book;
  progress.levels[2].value = parts.chapter;
  progress.levels[3].value = parts.verseNum;
  return parts;
}

export const checkAnswer = (answer: string) => {
  if (progress.step === 0) {
    answer = getPartName(answer) || '';
  }
  
  if (
    answer ===
    progress.levels[progress.step].value
  ) {
    progress.score += progress.levels[progress.step].score;
    if (progress.score > progress.highScore) {
      progress.highScore = progress.score;
    }
    progress.levels[progress.step].completed = true;
    progress.step++;
  } else {
    progress.step = null;
  }
};
