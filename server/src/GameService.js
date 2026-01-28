const { plainStructure, maxChapters } = require('../../client/src/constants/bible_structure_expected.mjs');
const bible_rus = require('../assets/bible_data/RUSSIAN-KOI8R.json');
const bible_eng = require('../assets/bible_data/kjv.json');
const bookNameMap = require('../assets/maps/book_name_alphabet_mapping.json');
const { default:partNameMap } = require('../assets/maps/part_name_mapping.mjs');

class GameService {
  constructor() {
  }

  getRandomVerse({ max, min, bibleName='RUS_SYNODAL' }={}) {
    try {
      if (max > maxChapters) max = maxChapters;
      if (min < 1) min = 1;
      if (!max) max = maxChapters;
      if (!min) min = 1;
      if (max < min) [max, min] = [min, max];

      const randomChapterNum = Math.floor(
        (Math.random() * (max+1 - min)) + min
      );
      const { part, book, chapter } = this.findBookAndChapter(
        randomChapterNum,
        bibleName
      );
      let bible;
      if (bibleName == 'en') bible = bible_eng;
      else bible = bible_rus;
      const randomChapter = bible[book][chapter];
      const versesCount = Object.keys(randomChapter).length;
      const randomVerseNum = Math.floor(
        (Math.random() * (versesCount+1 - 1)) + 1
      );
      const verse = bible[book][chapter][randomVerseNum];
      return {
        part,
        book,
        chapter,
        verse,
        verseNum: randomVerseNum,
        versesCount
      }
    } catch (err) {
      console.error('Error getting random verse:', err);
      throw err;
    }
  }

  getBookMapping(bibleName = 'RUS_SYNODAL') {
    try {
      return {
        bookMapping: bookNameMap[bibleName],
        partMapping: partNameMap
      };
    } catch (err) {
      console.error('Error getting book mapping:', err);
      throw err;
    }
  }
  
  findBookAndChapter(chapter, bibleName = 'en') {
    let count = 0;
    let part = chapter > 929 ? 'christian greek' : 'hebrew-aramic';
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
        return {
          part,
          book: bookName,
          chapter: chapterNum
        };
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