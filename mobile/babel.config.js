// babel-preset-expo detects react-native-reanimated and react-native-worklets
// and inserts their plugins itself, so adding them here would apply them twice.
module.exports = function (api) {
	api.cache(true);
	return { presets: ["babel-preset-expo"] };
};
