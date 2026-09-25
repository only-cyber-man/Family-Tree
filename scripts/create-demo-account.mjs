#!/usr/bin/env node
/**
 * Creates the demo account the Google Play / App Store reviewers sign in with,
 * and fills it with a small sample tree.
 *
 *   node scripts/create-demo-account.mjs <email> [username]
 *
 * Prints the username and a freshly generated password. Paste those into
 * Play Console → App content → App access (and App Store Connect → App Review).
 */
import PocketBase from "pocketbase";
import { randomBytes } from "node:crypto";

const PB_URL = process.env.POCKETBASE_URL ?? "https://pocketbase.cyber-man.pl";
const [, , email, username = "familytree-review"] = process.argv;

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
	console.error("Usage: node scripts/create-demo-account.mjs <email> [username]");
	process.exit(1);
}

const password = randomBytes(12).toString("base64url");
const pb = new PocketBase(PB_URL);
pb.autoCancellation(false);

const PEOPLE = [
	["stanislaw", "Stanisław Kowalski", "male", "1921-03-12", "1998-10-15"],
	["helena", "Helena Kowalska", "female", "1924-06-02", "2010-01-20"],
	["jan", "Jan Kowalski", "male", "1948-08-09"],
	["maria", "Maria Kowalska", "female", "1951-10-03"],
	["krystyna", "Krystyna Zielińska", "female", "1946-04-18"],
	["piotr", "Piotr Wiśniewski", "male", "1974-07-14"],
	["anna", "Anna Wiśniewska", "female", "1976-05-22"],
	["tomasz", "Tomasz Kowalski", "male", "1979-12-01"],
	["zofia", "Zofia Wiśniewska", "female", "2005-10-28"],
	["kuba", "Kuba Wiśniewski", "male", "2009-01-17"],
];

const LINKS = [
	["stanislaw", "helena", "IS_MARRIED_TO"],
	["stanislaw", "jan", "IS_FATHER_OF"],
	["helena", "jan", "IS_MOTHER_OF"],
	["stanislaw", "krystyna", "IS_FATHER_OF"],
	["helena", "krystyna", "IS_MOTHER_OF"],
	["jan", "maria", "IS_MARRIED_TO"],
	["jan", "anna", "IS_FATHER_OF"],
	["maria", "anna", "IS_MOTHER_OF"],
	["jan", "tomasz", "IS_FATHER_OF"],
	["maria", "tomasz", "IS_MOTHER_OF"],
	["piotr", "anna", "IS_MARRIED_TO"],
	["piotr", "zofia", "IS_FATHER_OF"],
	["anna", "zofia", "IS_MOTHER_OF"],
	["piotr", "kuba", "IS_FATHER_OF"],
	["anna", "kuba", "IS_MOTHER_OF"],
	["tomasz", "zofia", "IS_GODPARENT_OF"],
];

const main = async () => {
	await pb.collection("ft_users").create({
		username,
		name: "Play Review",
		email,
		password,
		passwordConfirm: password,
	});
	await pb.collection("ft_users").authWithPassword(username, password);
	const me = pb.authStore.record;

	const tree = await pb.collection("ft_trees").create({
		name: "Kowalski family",
		creator: me.id,
		invited: [],
	});

	const ids = {};
	for (const [key, name, gender, birthDate, deathDate] of PEOPLE) {
		const node = await pb.collection("ft_nodes").create({
			name,
			gender,
			birthDate,
			...(deathDate ? { deathDate } : {}),
			tree: tree.id,
		});
		ids[key] = node.id;
	}

	const names = await pb.collection("ft_relationships_names").getFullList();
	const nameId = Object.fromEntries(names.map((n) => [n.name, n.id]));
	const skipped = [];
	for (const [from, to, type] of LINKS) {
		if (!nameId[type]) {
			skipped.push(type);
			continue;
		}
		await pb.collection("ft_relationships").create({
			sourceNode: ids[from],
			targetNode: ids[to],
			relationshipName: nameId[type],
			tree: tree.id,
		});
	}

	console.log("\nDemo account ready\n");
	console.log(`  username: ${username}`);
	console.log(`  email:    ${email}`);
	console.log(`  password: ${password}`);
	console.log(`  tree:     ${tree.name} (${PEOPLE.length} people)`);
	if (skipped.length) {
		console.log(`\n  Skipped unknown relationship types: ${[...new Set(skipped)].join(", ")}`);
	}
	console.log("\nPaste username + password into Play Console → App content → App access.\n");
};

main().catch((error) => {
	console.error("Failed:", error?.response ?? error);
	process.exit(1);
});
