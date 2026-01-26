/**
 * Game progress state using Svelte 5 runes
 */
export const progress = $state({
  levels: [
    { id: 0, name: 'Part', completed: false },
    { id: 1, name: 'Book', completed: false },
    { id: 2, name: 'Chapter', completed: false },
    { id: 3, name: 'Verse', completed: false },
  ],
  score: 0,
  highScore: 0,
  step: 0, // Current step/level in the game
  part: 0, // Current part of the game
  book: 0, // Current book of the game
  chapter: 0, // Current chapter of the game
  verse: 0, // Current verse of the game
  attempt: 1, // Number of attempts/lives made
  maxAttempts: 3, // Maximum attempts/lives allowed
});

/**
 * Methods for managing game progress
 */
export const resetProgress = () => {
  progress.score = 0;
  progress.step = 0;
  progress.attempt = 1;
};

export const incrementScore = (points: number = 10) => {
  progress.score += points;
  if (progress.score > progress.highScore) {
    progress.highScore = progress.score;
  }
};
