const fs = require("fs");
const execSync = require("child_process").execSync;
if (!fs.existsSync("./node_modules")) {
	execSync("yarn");
}

const prompts = require("prompts");
const path = require("path");

const validateString = (value) => {
	if (value.length === 0) {
		return "Please enter a value that is longer than 0 characters.";
	}
	return true;
};

const questions = [
	{
		type: "text",
		name: "packageJsonName",
		message: "Enter the package.json name",
		initial: "example-app-name",
		validate: validateString,
	},
	{
		type: "text",
		name: "projectName",
		message: "Enter the project name",
		initial: "Example App Name",
		validate: validateString,
	},
	{
		type: "text",
		name: "projectDescription",
		message: "Enter the project description",
		initial: "This is an example project description.",
		validate: validateString,
	},
];

const finalize = () => {
	const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
	packageJson.scripts.templatize = undefined;
	fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, "\t"));
	execSync("yarn lint", { stdio: "inherit", cwd: process.cwd() });
	execSync("yarn remove prompts", {
		stdio: "inherit",
		cwd: process.cwd(),
	});
	fs.rmSync("./templatize.js");
	execSync("git add .", { stdio: "inherit", cwd: process.cwd() });
	execSync('git commit -m "Templatize project"', {
		stdio: "inherit",
		cwd: process.cwd(),
	});
	execSync("git push", { stdio: "inherit", cwd: process.cwd() });
};

const prepareReadme = (project) => {
	const content = `# ${project.projectName}

${project.projectDescription}`;

	fs.writeFileSync("./README.md", content);
};

const prepareSh = ({ projectName, packageJsonName, projectDescription }) => {
	const content = `#!/bin/bash
echo "Preparing ${projectName}..."
PROJECT_PATH="/home/ubuntu/services/${packageJsonName}"
echo "Creating $PROJECT_PATH"
mkdir -p $PROJECT_PATH
echo "console.log('init ${projectName}');" > $PROJECT_PATH/server.js
pm2 start $PROJECT_PATH/server.js --name "${projectName}"
`;
	fs.writeFileSync(`cyber-man-${packageJsonName}.sh`, content);
	fs.chmodSync(`cyber-man-${packageJsonName}.sh`, 0o755);
};

const replaceFileContent = (filePath, project) => {
	let content = fs.readFileSync(filePath, "utf8");
	content = content
		.replace(/Example App Name/g, project.projectName)
		.replace(/example\-app\-name/g, project.packageJsonName)
		.replace(
			/This is an example project description/g,
			project.projectDescription
		);
	fs.writeFileSync(filePath, content);
};

const walk = (project, dir = "./src/") => {
	const files = fs.readdirSync(dir);
	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);
		if (stat.isDirectory()) {
			return walk(project, filePath);
		} else {
			return replaceFileContent(filePath, project);
		}
	});
};

const main = async () => {
	const project = await prompts(questions, {
		onCancel: (message) => {
			console.log(`Exiting at step "${message.message}"`);
			process.exit(1);
		},
	});
	console.log(`Prepping readme`);
	prepareReadme(project);
	console.log(`Walking through src/ files`);
	walk(project);
	walk(project, ".github/");
	console.log(`Preparing cyber-man-${project.packageJsonName}.sh`);
	prepareSh(project);
	console.log(`Templating package.json`);
	replaceFileContent("./package.json", project);
	console.log(
		`REMEMBER to update ".github/workflows/build_and_deploy.yml" after running "./cyber-man-${project.packageJsonName}.sh"`
	);

	finalize();
};

main();
