import { cookies, headers } from "next/headers";
import { detectLocale, LANG_COOKIE, parseTheme, THEME_COOKIE, type Locale, type ThemePref } from "./config";
import { getDict } from "./index";

/** Locale for this request: ft_lang cookie, else Accept-Language, else English. */
export const getLocale = (): Locale =>
	detectLocale(cookies().get(LANG_COOKIE)?.value, headers().get("accept-language"));

export const getTheme = (): ThemePref => parseTheme(cookies().get(THEME_COOKIE)?.value);

/** Dictionary for server components, route metadata and layouts. */
export const getT = () => getDict(getLocale());
