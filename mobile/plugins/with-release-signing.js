const { withAppBuildGradle } = require("expo/config-plugins");

/**
 * Point the release build at the upload keystore described by
 * ./keystore.properties (gitignored, and absent on a fresh clone).
 *
 * Without this the Expo template signs release builds with the debug
 * keystore, which Play rejects. Doing it as a config plugin rather than by
 * editing android/app/build.gradle is the whole point: android/ is generated
 * and gitignored here, so a hand edit is erased by the next
 * `expo prebuild --clean` and the next person rediscovers the problem.
 *
 * Adapted from yacht-journal's plugin, with one difference: `storeFile` is
 * used as an absolute path rather than resolved against the project root,
 * because the keystore deliberately lives outside this repository. One upload
 * key is shared across these apps, and copying it in would multiply the
 * number of places it can leak from.
 *
 * With no keystore.properties present the build falls back to debug signing,
 * so a clone without the key still builds and runs - it just produces
 * something Play will not accept, which is the correct failure.
 */
module.exports = function withReleaseSigning(config) {
	return withAppBuildGradle(config, (cfg) => {
		let gradle = cfg.modResults.contents;
		if (gradle.includes("signingConfigs.release")) return cfg;

		gradle = gradle.replace(
			/(signingConfigs \{)/,
			`def keystorePropertiesFile = rootProject.file("../keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

$1
        release {
            if (keystorePropertiesFile.exists()) {
                // Absolute: the keystore is outside this repository.
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }`
		);

		gradle = gradle.replace(
			/(release \{\n\s+\/\/ Caution![\s\S]*?\n\s+)signingConfig signingConfigs\.debug/,
			"$1signingConfig keystorePropertiesFile.exists() ? signingConfigs.release : signingConfigs.debug"
		);

		cfg.modResults.contents = gradle;
		return cfg;
	});
};
