import raw from '../constants/Lexicon.json';

type Lang = 'ru' | 'en';
type Raw = Record<string, Record<string, string>>;

// raw: { hello: { en:"Hello", ru:"Привет" }, ... }
const json = raw as unknown as Raw;

export type LexiconMap = Record<Lang, Record<string, string>>;

export const Lexicon: LexiconMap = { ru: {}, en: {} };

for (const key in json) {
  (['ru', 'en'] as Lang[]).forEach(lang => {
    Lexicon[lang][key] = json[key]?.[lang] ?? '';
  });
}
