const fs = require('fs');
require = require('esm')(module, {
  // mode: 'all',
});
const { XMLParser } = require('fast-xml-parser');
const { OLD_TESTAMENT_EN } = require('../assets/maps/old_testament_map.mjs');
const { NEW_TESTAMENT_EN } = require('../assets/maps/new_testament_map.mjs');
const RU_TO_EN = require('../assets/maps/RU_TO_EN.mjs');

// ---------------------- utils ----------------------
const ensureArray = x => (x == null ? [] : Array.isArray(x) ? x : [x]);
function clearOnlyNewlines(s) {
  if (typeof s !== 'string') return s;
  const cleared = s.replace(/\n/g, '').trim();
  return cleared.length > 0 ? s : cleared;
}

function splitBySupNumbers(html) {
  // Ловим только стихи: <sup>1</sup>, <sup>2</sup> ... (игнорируем <sup>a</sup>)
  const re = /<sup>(\d+)<\/sup>/g;

  const parts = [];
  let match;
  let lastIndex = 0;
  let lastVerseNum = null;

  while ((match = re.exec(html)) !== null) {
    const idx = match.index;

    // если это не первый стих — закрываем предыдущий кусок
    if (lastVerseNum !== null) {
      parts.push(html.slice(lastIndex, idx));
    }

    // начинаем новый стих с текущего <sup>число</sup>
    lastIndex = idx;
    lastVerseNum = match[1];
  }

  // хвост
  if (lastVerseNum !== null) {
    parts.push(html.slice(lastIndex));
  }

  return parts;
}

function textOf(node) {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (node['#text']) return node['#text'];
  if (Array.isArray(node)) return node.map(textOf).join(' ');
  if (typeof node === 'object') {
    // typical FB2 title/p shapes
    if (node.p) return textOf(node.p);
    // try common text-like props
    const keys = Object.keys(node);
    for (const k of keys) {
      const v = node[k];
      if (typeof v === 'string' || typeof v === 'number') return String(v);
      if (Array.isArray(v)) return v.map(textOf).join(' ');
    }
  }
  return '';
}

function normalizeRuTitle(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[«»"']/g, '');
}

function extractTitleText(section) {
  if (!section || !section.title) return '';
  const t = section.title.p ?? section.title;
  if (Array.isArray(t)) return textOf(t[0]);
  return textOf(t);
}

function isNotesSection(section) {
  const t = normalizeRuTitle(extractTitleText(section));
  return /\b(примечан|сноск|комментар|notes?)\b/i.test(t);
}

function isChapterTitle(title) {
  if (!title) return false;
  const t = normalizeRuTitle(title);
  // "Глава 1", "1", "Псалом 1", "Psalm 1", "Chapter 1"
  return (
    /^\d{1,3}$/.test(t) ||
    /^глава\s*\d{1,3}$/.test(t) ||
    /^псалом\s*\d{1,3}$/.test(t) ||
    /^psalm\s*\d{1,3}$/.test(t) ||
    /^chapter\s*\d{1,3}$/.test(t)
  );
}

function plainizeGroupsToBooks(section) {
  if (!(section instanceof Array)) return section;

  const output = [];
  for (const value of section) {
    if (/пятикнижие|книги|евангелия|история\s*церкви|послания/i.test(value.title?.p)) {
      const processedSections = plainizeGroupsToBooks(value.section);
      if (Array.isArray(processedSections)) {
        output.push(...processedSections);
      }
    } else {
      output.push({
        title: value.title?.p,
        ab: getAbbreviationFromTitle(value.title?.p),
        section: value.section,
      });
    }
  }
  return output;
}

function findFirst(obj, keyName) {
  if (!obj || typeof obj !== 'object') return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, keyName)) return obj[keyName];
  for (const k of Object.keys(obj)) {
    const res = findFirst(obj[k], keyName);
    if (res !== undefined) return res;
  }
  return undefined;
}

function ruToEnOrSame(ruTitle) {
  const orig = String(ruTitle || '').trim();
  if (!orig) return orig;
  let s = normalizeRuTitle(orig);

  // strip common noise/prefixes
  s = s
    .replace(/\b(книга|книги|кн|кн\.)\b/gi, '')
    .replace(/рассказывает о(б)?\s+иисусе(\s+христе)?/gi, '')
    .replace(/евангелие\s+от\s+/gi, '')
    .replace(/\s+/gi, ' ').trim();

  // numbers (1-4)
  const numMatch = s.match(/\b([1234])\b/);
  const n = numMatch ? parseInt(numMatch[1], 10) : null;

  // explicit numbered OT books
  if (s.includes('царств') && n) {
    if (n === 1) return '1 Samuel';
    if (n === 2) return '2 Samuel';
    if (n === 3) return '1 Kings';
    if (n === 4) return '2 Kings';
  }
  if ((s.includes('паралипоменон') || s.includes('хроник')) && n) {
    return n === 1 ? '1 Chronicles' : '2 Chronicles';
  }

  // numbered epistles
  if (s.includes('иоанна') && n) return `${n} John`;
  if (s.includes('петра') && n) return `${n} Peter`;
  if (s.includes('фессалоникийцам') && n) return `${n} Thessalonians`;
  if (s.includes('коринфянам') && (s.includes('1') || s.includes('2'))) {
    return s.includes('1') ? '1 Corinthians' : '2 Corinthians';
  }
  if (s.includes('тимофею') && (s.includes('1') || s.includes('2'))) {
    return s.includes('1') ? '1 Timothy' : '2 Timothy';
  }

  // direct contains rules (RU variants, genitives)
  const rules = [
    [/^быт/i, 'Genesis'],
    [/^исх/i, 'Exodus'],
    [/^левит/i, 'Leviticus'],
    [/^числ/i, 'Numbers'],
    [/^второзакон/i, 'Deuteronomy'],
    [/иисус(?:а)?(?:\s*навин)?/i, 'Joshua'],
    [/суд/i, 'Judges'],
    [/руф/i, 'Ruth'],
    [/ездр/i, 'Ezra'],
    [/нееми/i, 'Nehemiah'],
    [/есфир|эсфир/i, 'Esther'],
    [/иов/i, 'Job'],
    [/псалм|псалтир/i, 'Psalms'],
    [/притч/i, 'Proverbs'],
    [/екклесиаст|экклезиаст|проповедник/i, 'Ecclesiastes'],
    [/(песня|песнь)\s+песн/i, 'Song of Solomon'],
    [/песня\s+соломон/i, 'Song of Solomon'],
    [/исаи|исай/i, 'Isaiah'],
    [/иереми/i, 'Jeremiah'],
    [/плач\s+иерем/i, 'Lamentations'],
    [/иезек|иезекиил/i, 'Ezekiel'],
    [/даниил/i, 'Daniel'],
    [/осии|осия/i, 'Hosea'],
    [/иоил/i, 'Joel'],
    [/амос/i, 'Amos'],
    [/авди/i, 'Obadiah'],
    [/ион(?!н)/i, 'Jonah'],
    [/михе/i, 'Micah'],
    [/наум/i, 'Nahum'],
    [/аввакум/i, 'Habakkuk'],
    [/софони/i, 'Zephaniah'],
    [/агге/i, 'Haggai'],
    [/захари/i, 'Zechariah'],
    [/малах/i, 'Malachi'],
    // Gospels
    [/матф/i, 'Matthew'],
    [/марк/i, 'Mark'],
    [/лук/i, 'Luke'],
    [/(?<![а-я])иоанн(?![а-я])|\bиоан$/i, 'John'],
    // Acts and Epistles
    [/деяния/i, 'Acts'],
    [/римля/i, 'Romans'],
    [/галат/i, 'Galatians'],
    [/ефес|эфес/i, 'Ephesians'],
    [/филип/i, 'Philippians'],
    [/колосс/i, 'Colossians'],
    [/евреям/i, 'Hebrews'],
    [/иаков|иакова/i, 'James'],
    [/титу/i, 'Titus'],
    [/филимон/i, 'Philemon'],
    [/иуда|иуды/i, 'Jude'],
    [/откровен/i, 'Revelation'],
  ];
  for (const [re, name] of rules) {
    if (re.test(s)) return name;
  }

  // exact fallback via dictionary
  if (RU_TO_EN.has(s)) return RU_TO_EN.get(s);

  // as last resort — original
  return orig;
}

function getAbbreviationFromTitle(book) {
  const testaments = [...OLD_TESTAMENT_EN, ...NEW_TESTAMENT_EN];
  for (const item of testaments) {
    const entry = Object.entries(item)[0];
    if (entry[1][0].toLowerCase() === ruToEnOrSame(book).toLowerCase()) {
      return entry[0];
    }
  }
  return null;
}

// ---------------------- description ----------------------
function extractDescription(desc) {
  if (!desc || !desc['title-info']) return {};
  const ti = desc['title-info'];
  const title = ti['book-title'] ? textOf(ti['book-title']) : '';
  const annotation = ti.annotation ? textOf(ti.annotation) : '';
  const date = ti.date
    ? typeof ti.date === 'object'
      ? ti.date['#text'] || ti.date['@_value'] || ''
      : ti.date
    : '';
  const lang = ti.lang || '';
  const authors = ensureArray(ti.author)
    .map(a => {
      const fn = a['first-name'] || a.first || '';
      const ln = a['last-name'] || a.last || '';
      return `${fn} ${ln}`.trim();
    })
    .filter(Boolean);
  return { title, annotation, date, lang, authors };
}

// ---------------------- structure books ----------------------
function structureBooks(books) {
  // console.log('books:', books);
  const output = [];
  for (const book of books) {
    console.log('book.title:', book.title);

    const isPsalms = /псалм|псалтир/i.test(book.title);
    if (isPsalms) {
      const fullChapters = [];
      const nestedTableOfContents = [];

      for (const obj of book.section) {
        const partTitle = obj.title?.p;
        const partMatch = partTitle?.match(/(\d+)-я книга \((\d+)[–-](\d+)\)/);
        const [, partNum, startChapter, endChapter] = partMatch;

        nestedTableOfContents.push({
          part: partTitle,
          table: []
        });

        // Обрабатываем главы этой части
        for (const item of obj.section) {
          let combinedChaptersP = [];
          const footnotesOutput = [];
          if (item.title?.p && /примечан/i.test(item.title.p)) {
            console.log('item:', item)
            footnotesOutput.push(item.p);
            continue;
          } else {
            let chapterNum
            let plainChapterValue = typeof item.title?.p === 'string'
              ? item.title.p
              : item.title?.p?.['#text'];
            try {
              chapterNum = +plainChapterValue?.match(/\d+/)?.[0] ?? null;
            } catch (error) {
              console.error('Error parsing chapter number:', error);
              chapterNum = null;
            }
            if (item.title?.p) {
              nestedTableOfContents[nestedTableOfContents.length - 1].table.push({
                title: item.title.p,
                chapter: chapterNum,
              });
            }

            let isFirstInPart = chapterNum === parseInt(startChapter)
            let isLastInPart = chapterNum === parseInt(endChapter)
            let topTitle = `Книга ${partNum}-я (${startChapter}-${endChapter})`
            let bottomTitle = `Конец книги ${partNum}-я (${startChapter}-${endChapter})`

            if (item.p) {
              combinedChaptersP = splitBySupNumbers(combinedChaptersP
                .concat(item.p)
                .join('\n')
              );
            } else if (item.section) {
              for (const subItem of item.section) {
                if (subItem.title?.p) {
                  footnotesOutput.push(subItem.p)
                } else if (subItem.p) {
                  combinedChaptersP = splitBySupNumbers(combinedChaptersP
                    .concat(subItem.p)
                    .join('\n')
                  );
                }
              }
            }
            fullChapters.push({
              title: plainChapterValue,
              ...(isFirstInPart && { topTitle }),
              chapter: chapterNum,
              p: combinedChaptersP,
              partNum: parseInt(partNum),
              ...(isFirstInPart && { isFirstInPart }),
              ...(isLastInPart && { isLastInPart }),
              ...(isLastInPart && { bottomTitle }),
              footnotes: footnotesOutput.flat(),
            });
          }
        }
      }

      output.push({
        title: book.title,
        ab: book.ab,
        tableOfContents: nestedTableOfContents,
        chapters: fullChapters,
      });
    } else {
      const bookOutput = [];
      for (const obj of book.section) {
        const tableOfContentsOutput = [];
        const footnotesOutput = [];
        let combinedChapterP = [];

        for (const item of obj.section) {
          if (item.title?.p && /примечан/i.test(item.title.p)) {
            footnotesOutput.push(item.p);
          } else {
            if (item.title?.p) {
              tableOfContentsOutput.push({
                title: item.title.p,
                chapter: +obj.title?.p?.match(/\d+/)?.[0] ?? null,
              })
            }
            // Объединяем массивы p в один
            if (item.p) {
              combinedChapterP = splitBySupNumbers(combinedChapterP
                .concat(item.p)
                .join('\n')
              );
            }
          }
        }
        
        bookOutput.push({
          title: obj.title?.p,
          tableOfContents: tableOfContentsOutput,
          p: combinedChapterP,
          footnotes: footnotesOutput.flat(),
        });
      }
      output.push({
        title: book.title,
        ab: book.ab,
        chapters: bookOutput,
      });
    }
  }
  return output;
}

// ---------------------- structure body ----------------------
function structureBody(body) {
  const output = body;

  delete output.title;
  for (const key of Object.keys(output)) {
    output[key] = clearOnlyNewlines(output[key]);
    if (output[key].length === 0) delete output[key];
  }
  output.hebrew_aramic = structureBooks(plainizeGroupsToBooks(output.section[0].section));
  output.christian_greek = structureBooks(plainizeGroupsToBooks(output.section[1].section));
  delete output.section;
  fs.writeFileSync('structured_body.json', JSON.stringify(output, null, 2));
  // console.log('output:');
  // console.dir(output, { depth: 5 });

  return output;
}

// ---------------------- main parse ----------------------
async function parseFb2File(filePath) {
  const xml = fs.readFileSync(filePath, 'utf8');

  const stopAfter4Sections = 'FictionBook.body.section.section.section.section';
  const stopAfter5Sections = stopAfter4Sections+'.section';
  const stopAfter6Sections = stopAfter5Sections+'.section';

  const stopAfter4SectionsParagraph = stopAfter4Sections+'.p';
  const stopAfter5SectionsParagraph = stopAfter5Sections+'.p';
  const stopAfter6SectionsParagraph = stopAfter6Sections+'.p';
  const stopNodes = [stopAfter4SectionsParagraph, stopAfter5SectionsParagraph, stopAfter6SectionsParagraph];

  const parser = new XMLParser({
    ignoreDeclaration: true,
    textNodeName: '#text',
    ignoreNameSpace: false,
    stopNodes: stopNodes,
    trimValues: false,
    isArray: (tagName) => {
      if (['section'].some(t => t === tagName)) {
        return true;
      }
      return false;
    },
  });

  const obj = await parser.parse(xml);
  const fb = obj instanceof Object
    ? obj.FictionBook
    : obj instanceof Array
      ? obj[1]?.FictionBook
      : obj;
  delete fb.binary;
  const description = extractDescription(fb.description || fb['description'] || {});
  const body = fb.body || findFirst(fb, 'body') || {};
  
  return structureBody(body);
}

// ---------------------- CLI ----------------------
if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node parserFb2.js path/to/file.fb2');
    process.exit(2);
  }
  parseFb2File(file)
    .then(res => {
      // console.log(JSON.stringify(res, null, 2));
      // console.dir(res, { depth: null });
    })
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { parseFb2File };
