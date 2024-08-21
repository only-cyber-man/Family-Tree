const fs = require("fs");

const copyWorkerCode = () => {
	const outputDir = ".next/standalone";
	const workerDir = "worker";
	fs.cpSync(`${workerDir}/`, `${outputDir}/`, {
		recursive: true,
		force: true,
	});
};

const callWorker = () => {
	let serverContent = fs.readFileSync(".next/standalone/server.js", "utf-8");
	serverContent = serverContent.replace(
		"startServer({",
		`
const { main } = require("./worker.js");
main();

startServer({`
	);
	fs.writeFileSync(".next/standalone/server.js", serverContent);
};

const main = () => {
	console.log("Copying worker code...");
	copyWorkerCode();
	console.log("Appending running the worker code...");
	callWorker();
	console.log("Worker code copied and running...");
};

main();
