"use client";

import { LOCALES, THEMES, type Locale, type ThemePref } from "@/i18n/config";
import { usePreferences } from "@/i18n/client";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icons";

/** Language names are written in their own language. */
const LANGUAGE_NAMES: Record<Locale, string> = { en: "English", pl: "Polski" };

const ThemeIcon = ({ theme }: { theme: ThemePref }) =>
	theme === "light" ? <SunIcon /> : theme === "dark" ? <MoonIcon /> : <MonitorIcon />;

/**
 * Language (EN / PL) and theme (light / dark / system) switches.
 * - "auto": segmented theme control, collapsing to one cycling button on phones.
 * - "full": always the segmented control (menus with room to spare).
 */
export const PreferenceControls = ({
	variant = "auto",
	className = "",
}: {
	variant?: "auto" | "full";
	className?: string;
}) => {
	const { locale, theme, setLocale, setTheme, t } = usePreferences();
	const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
	const cycleLabel = t.prefs.themeCycle(theme, next);

	return (
		<div className={`prefs ${className}`} role="group" aria-label={t.prefs.group}>
			<div className="seg" role="group" aria-label={t.prefs.language}>
				{LOCALES.map((code) => (
					<button
						key={code}
						type="button"
						className="seg-btn"
						lang={code}
						aria-pressed={locale === code}
						aria-label={`${LANGUAGE_NAMES[code]} (${code.toUpperCase()})`}
						title={LANGUAGE_NAMES[code]}
						onClick={() => locale !== code && setLocale(code)}
					>
						{code.toUpperCase()}
					</button>
				))}
			</div>
			<div
				className={`seg ${variant === "auto" ? "prefs-wide" : ""}`}
				role="group"
				aria-label={t.prefs.theme}
			>
				{THEMES.map((option) => (
					<button
						key={option}
						type="button"
						className="seg-btn"
						aria-pressed={theme === option}
						aria-label={t.prefs.themes[option]}
						title={t.prefs.themes[option]}
						onClick={() => setTheme(option)}
					>
						<ThemeIcon theme={option} />
					</button>
				))}
			</div>
			{variant === "auto" ? (
				<button
					type="button"
					className="seg seg-cycle prefs-narrow"
					aria-label={cycleLabel}
					title={cycleLabel}
					onClick={() => setTheme(next)}
				>
					<ThemeIcon theme={theme} />
				</button>
			) : null}
		</div>
	);
};
