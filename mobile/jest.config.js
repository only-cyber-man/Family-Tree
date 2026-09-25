module.exports = {
	preset: "jest-expo",
	testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
	testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/", "/.expo/"],
	moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
};
