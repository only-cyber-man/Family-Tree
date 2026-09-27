const { withAppDelegate, withInfoPlist } = require("expo/config-plugins");

/**
 * Adopt the UIKit scene life cycle on iOS.
 *
 * Apps built with the iOS 27 SDK that still use the app-delegate life cycle
 * fail to launch on iOS 27 ("UIScene life cycle is required for apps built
 * with this SDK"). App Review rejected build 1.0.0 (1) for exactly that: it
 * crashed on launch on their iPad.
 *
 * Expo 57 ships the scene delegate (`EXExpoAppSceneDelegate`), which creates
 * the window from the connecting scene and starts React Native in it, but the
 * prebuild template does not wire it up yet. This plugin does:
 *  - Info.plist gets a UIApplicationSceneManifest naming that delegate.
 *  - AppDelegate conforms to ExpoReactNativeFactoryProvider so the scene
 *    delegate can reach the factory, and stops creating its own window.
 *
 * ios/ is generated, so this has to live here rather than as a hand edit.
 * Each AppDelegate edit throws if the template changes shape, so a future
 * Expo upgrade fails the prebuild instead of silently shipping the crash.
 */
const SCENE_DELEGATE_CLASS = "EXExpoAppSceneDelegate";

const CLASS_DECLARATION = "class AppDelegate: ExpoAppDelegate {";
const WINDOW_STARTUP =
	/#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\n\n?/;

function replaceOrThrow(source, pattern, replacement, what) {
	const next = source.replace(pattern, replacement);
	if (next === source) {
		throw new Error(`with-scene-lifecycle: could not find ${what} in AppDelegate.swift; update the plugin for the new Expo template.`);
	}
	return next;
}

function adoptSceneDelegate(contents) {
	if (contents.includes("ExpoReactNativeFactoryProvider")) return contents;
	const withProvider = replaceOrThrow(
		contents,
		CLASS_DECLARATION,
		"class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {",
		"the AppDelegate class declaration"
	);
	// The scene delegate creates the window and starts React Native in it.
	return replaceOrThrow(withProvider, WINDOW_STARTUP, "", "the window start-up block");
}

module.exports = function withSceneLifecycle(config) {
	const withPlist = withInfoPlist(config, (cfg) => ({
		...cfg,
		modResults: {
			...cfg.modResults,
			UIApplicationSceneManifest: {
				UIApplicationSupportsMultipleScenes: false,
				UISceneConfigurations: {
					UIWindowSceneSessionRoleApplication: [
						{
							UISceneConfigurationName: "Default Configuration",
							UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
						},
					],
				},
			},
		},
	}));

	return withAppDelegate(withPlist, (cfg) => {
		if (cfg.modResults.language !== "swift") {
			throw new Error("with-scene-lifecycle: expected a Swift AppDelegate.");
		}
		return {
			...cfg,
			modResults: { ...cfg.modResults, contents: adoptSceneDelegate(cfg.modResults.contents) },
		};
	});
};
