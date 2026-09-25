/**
 * app.json is the real config. This file only exists so a screenshot build
 * can reach a local demo backend over plain HTTP:
 *
 *   FT_SCREENSHOT_BUILD=1 EXPO_PUBLIC_POCKETBASE_URL=http://10.0.2.2:8091 npx expo prebuild ...
 *
 * Store builds never set FT_SCREENSHOT_BUILD, so they stay HTTPS-only.
 */
module.exports = ({ config }) => {
	if (process.env.FT_SCREENSHOT_BUILD !== "1") {
		return config;
	}
	const plugins = (config.plugins ?? []).map((plugin) =>
		Array.isArray(plugin) && plugin[0] === "expo-build-properties"
			? [
					plugin[0],
					{
						...plugin[1],
						android: { ...(plugin[1]?.android ?? {}), usesCleartextTraffic: true },
					},
			  ]
			: plugin
	);
	return { ...config, plugins };
};
