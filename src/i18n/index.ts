import type { Locale } from "./config";
import { af } from "./af";
import { de } from "./de";
import { en, type Dict } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { hi } from "./hi";
import { pl } from "./pl";
import { pt } from "./pt";

export type { Dict } from "./en";
export * from "./config";

export const dictionaries: Record<Locale, Dict> = { en, pl, es, fr, de, pt, af, hi };

export const getDict = (locale: Locale): Dict => dictionaries[locale] ?? en;
