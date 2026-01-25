const { isNumericFast, isPlainObjectFast } = require("./utils.js");

function countAllChapters(books, mode='array') {
  if (hasSectionWithChapterLike(books)) {
    return books.hebrew_aramic.concat(
      books.christian_greek
    ).reduce((acc, book) =>
      acc + book.chapters?.length || 0, 0
    );
  } else if (isFullObjected(books)) {
    return countObjectedChapters(books);
  } else return false
}

function countAllVerses(books) {
  if (hasSectionWithChapterLike(books)) {
    return books.hebrew_aramic.concat(
      books.christian_greek
    ).reduce((acc, book) =>
      acc +
      book.chapters?.reduce((acc, chapter) => acc + chapter.p?.length || 0, 0),
      0,
    );
  } else if (isFullObjected(books)) {
    return countObjectedVerses(books);
  } else return false
}

function countObjectedChapters(books) {
  let count = 0
  for (const book in books) {
    count += Object.keys(books[book]).length || 0;
  }
  return count;
}

function countObjectedVerses(books) {
  let count = 0
  for (const book in books) {
    for (const chapter in books[book]) {
      count += Object.keys(books[book][chapter]).length || 0;
    }
  }
  return count;
}
      
function hasSectionWithChapterLike(books) {
  if (!(books instanceof Object)) return false;

  if (Array.isArray(books)) {
    return books.some(book =>
      book instanceof Object &&
      Array.isArray(book.chapters)
    );
  }
  return Object.values(books).some(section => {
    if (!Array.isArray(section)) return false;
    return section.some(book =>
      book instanceof Object &&
      Array.isArray(book.chapters)
    );
  });
};

function isFullObjected(obj) {
  if (!isPlainObjectFast(obj)) return false;

  for (const bookName in obj) {
    const chapters = obj[bookName];
    if (!isPlainObjectFast(chapters)) continue;

    for (const chapterNo in chapters) {
      if (!isNumericFast(chapterNo)) continue;
      const verses = chapters[chapterNo];
      if (!isPlainObjectFast(verses)) continue;

      for (const verseNo in verses) {
        if (!isNumericFast(verseNo)) continue;

        const text = verses[verseNo];
        if (typeof text === "string" && text.length > 0) return true;
      }
    }
  }

  return false;
}

module.exports = {
  countAllChapters,
  countAllVerses,
  countObjectedVerses,
  countObjectedChapters,
};