#!/usr/bin/env bash
# Regenerates the PNG app assets in mobile/assets/ from the SVG sources in
# mobile/assets/svg/ (copied from docs/design/handoff/.../assets/app/ with the
# C2PA metadata stripped). Uses rsvg-convert when present, otherwise Inkscape.
set -euo pipefail
cd "$(dirname "$0")/.."
render() { # <svg> <png> <size>
	if command -v rsvg-convert >/dev/null 2>&1; then
		rsvg-convert -w "$3" -h "$3" "$1" -o "$2"
	else
		inkscape "$1" --export-type=png --export-filename="$2" -w "$3" -h "$3" >/dev/null 2>&1
	fi
}
render assets/svg/ios-icon-1024.svg assets/icon.png 1024
render assets/svg/android-adaptive-foreground.svg assets/android-icon-foreground.png 1024
render assets/svg/android-adaptive-background.svg assets/android-icon-background.png 1024
render assets/svg/android-adaptive-monochrome.svg assets/android-icon-monochrome.png 1024
render assets/svg/splash-icon.svg assets/splash-icon.png 600
render assets/svg/notification-icon.svg assets/notification-icon.png 96
render assets/svg/ios-icon-1024.svg assets/favicon.png 48
# The App Store rejects icons with an alpha channel.
if command -v magick >/dev/null 2>&1; then
	magick assets/icon.png -background "#2F5D46" -alpha remove -alpha off assets/icon.png
fi
echo "icons written to assets/"
