const { plainStructure, maxChapters } = require('../../client/src/constants/bible_structure_expected.mjs');
const bible = require('../assets/bible_data/RUSSIAN-KOI8R.json');
const bookNameMap = require('../assets/maps/book_name_alphabet_mapping.json');

class GameService {
  constructor() {
  }

  getRandomVerse({ max, min }={}) {
    try {
      if (max > maxChapters) max = maxChapters;
      if (min < 1) min = 1;
      if (!max) max = maxChapters;
      if (!min) min = 1;
      if (max < min) [max, min] = [min, max];

      const randomChapterNum = Math.floor(
        (Math.random() * (max+1 - min)) + min
      );
      const { book, chapter } = this.findBookAndChapter(
        randomChapterNum,
        'RUS_SYNODAL'
      );
      const randomChapter = bible[book][chapter];
      const randomVerseNum = Math.floor(
        (Math.random() * (Object.keys(randomChapter).length+1 - 1)) + 1
      );
      const verse = bible[book][chapter][randomVerseNum];
      return {book, chapter, verseNum: randomVerseNum, verse}
    } catch (err) {
      console.error('Error getting random verse:', err);
      throw err;
    }
  }
  
  findBookAndChapter(chapter, bibleName = 'en') {
    let count = 0;
    for (let i = 0; i < plainStructure.length; i++) {
      const book = plainStructure[i];
      count += book.chapters;
      if (count > chapter) {
        let chapterNum = chapter - (count - book.chapters);
        let bookName = bibleName == 'en'
          ? book.name
          : bookNameMap[bibleName][book.name];
        if (chapterNum <= 0) {
          chapterNum = plainStructure[i - 1].chapters;
          bookName = bibleName == 'en'
            ? plainStructure[i-1].name
            : bookNameMap[bibleName][plainStructure[i-1].name];
        }
        return { book: bookName, chapter: chapterNum };
      }
    }
    return null;
  }
  
  logBibleChapterAbsoluteNumbers() {
    let structureCount = 0;
    let bibleCount = 0;
    let structureChapters = {};
    let bibleChapters = {}
    
    for (const book of plainStructure) {
      structureCount += book.chapters;
      structureChapters[book.name] = structureCount;
    }
    for (const book in bible) {
      for (const chapter in bible[book]) {
        bibleCount++;
      }
        bibleChapters[book] = bibleCount;
    }
    console.log('Structure Chapters:', structureChapters);
    console.log('Bible Chapters:', bibleChapters);

    return { structureChapters, bibleChapters };
  }
}
module.exports = new GameService();