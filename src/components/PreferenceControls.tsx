"use client";

import { isLocale, LOCALE_NAMES, LOCALES, THEMES, type ThemePref } from "@/i18n/config";
import { usePreferences } from "@/i18n/client";
import { MonitorIcon, MoonIcon, SunIcon } from "./Icons";

const ThemeIcon = ({ theme }: { theme: ThemePref }) =>
	theme === "light" ? <SunIcon /> : theme === "dark" ? <MoonIcon /> : <MonitorIcon />;

/**
 * Language (a menu, each language named in itself) and theme (light / dark / system) switches.
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
			<div className="seg seg-select" title={t.prefs.language}>
				<select
					value={locale}
					aria-label={t.prefs.language}
					onChange={(event) => {
						const next = event.target.value;
						if (isLocale(next) && next !== locale) {
							setLocale(next);
						}
					}}
				>
					{LOCALES.map((code) => (
						<option key={code} value={code} lang={code}>
							{LOCALE_NAMES[code]}
						</option>
					))}
				</select>
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
