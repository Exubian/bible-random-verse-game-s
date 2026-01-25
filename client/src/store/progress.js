import { writable, derived } from 'svelte/store';

export const levels = writable([
  { id: 0, name: 'Part', completed: false },
  { id: 1, name: 'Book', completed: false },
  { id: 2, name: 'Chapter', completed: false },
  { id: 3, name: 'Verse', completed: false },
]);

export const score = writable(0);
export const highScore = writable(0);

export const step = writable(0); // Current step/level in the game
export const part = writable(0); // Current part of the game
export const book = writable(0); // Current book of the game
export const chapter = writable(0); // Current chapter of the game
export const verse = writable(0); // Current verse of the game

export const attempt = writable(1); // Number of attempts/lives made
export const maxAttempts = writable(3); // Maximum attempts/lives allowed

