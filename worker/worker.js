const dotenv = require("dotenv");
dotenv.config();

const main = async () => {
	console.log(`${new Date().toLocaleString()} | worker loaded`);
};

module.exports = { main };

if (process.argv.some((a) => a.includes("worker.js"))) {
	main();
}
