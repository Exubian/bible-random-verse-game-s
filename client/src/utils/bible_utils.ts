/**
 * Utility functions for Bible text processing
 */

/**
 * Cleans the verse text from extra metadata like headers and coordinate references.
 * Particularly useful for the Russian Synodal translation.
 * 
 * @param text The raw verse text
 * @returns Cleaned verse text
 */
export function cleanVerseText(text: string): string {
  if (!text) return text;
  
  // Remove headers enclosed in ^^...^^
  let cleaned = text.replace(/\^\^.*?\^\^/g, '');
  
  // Remove verse coordinates like (7-2) or (7:2)
  cleaned = cleaned.replace(/\(\d+[-\\\/:]\d+\)/g, '');
  
  // Remove any numbers at the very beginning of the verse if they are followed by a space
  // Some datasets might have verse numbers prefixed
  // cleaned = cleaned.replace(/^\d+\s+/, ''); 

  // Trim and remove extra spaces
  return cleaned.trim().replace(/\s{2,}/g, ' ');
}
