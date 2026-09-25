import type { Locale } from "./config";
import { en, type Dict } from "./en";
import { pl } from "./pl";

export type { Dict } from "./en";
export * from "./config";

export const dictionaries: Record<Locale, Dict> = { en, pl };

export const getDict = (locale: Locale): Dict => dictionaries[locale] ?? en;
