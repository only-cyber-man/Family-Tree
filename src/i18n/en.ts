import type { Gender, Locale, ThemePref } from "./config";
import { en as n } from "./plural";

// English strings. This object is the source of truth: `Dict = typeof en`, and
// pl.ts is typed as Dict, so a missing (or extra) Polish key is a TS error.

/** Texts for a relationship type the app knows by its database name. */
export interface KnownRelationship {
	/** Chip / filter / picker label: "Ojciec". */
	type: string;
	/** Short label drawn on the edge, by the source person's gender. */
	edge: (fromGender?: Gender) => string;
	/** Full sentence: "Jan jest ojcem osoby Anna". */
	sentence: (from: string, to: string, fromGender?: Gender) => string;
	/** How the other person relates to the selected one, by the other's gender. */
	role: (otherIsSource: boolean, otherGender: Gender) => string;
}

const people = (count: number) => n(count, "person", "people");
const relationships = (count: number) => n(count, "relationship", "relationships");
const themes: Record<ThemePref, string> = { light: "Light", dark: "Dark", system: "System" };

export const en = {
	locale: "en" as Locale,
	/** For toLocaleDateString / Intl. */
	dateLocale: "en-GB",

	common: {
		appName: "Family Tree",
		createdBy: "Created by tomek7667",
		cancel: "Cancel",
		save: "Save",
		done: "Done",
		close: "Close",
		dismiss: "Dismiss",
		undo: "Undo",
		edit: "Edit",
		remove: "Remove",
		optional: "optional",
		loading: "Loading…",
		owner: "Owner",
		sharedWithYou: "Shared with you",
		viewerReadOnly: "Viewer · read-only",
		creator: "Creator",
		someone: "Someone",
		someoneLower: "someone",
		unknownAccount: "unknown account",
		/** Fallback display name for the signed-in user. */
		you: "you",
		withYou: (name: string) => `${name} (you)`,
		male: "Male",
		female: "Female",
		justNow: "just now",
		people,
		relationships,
		mainNav: "Main",
		clearAll: "Clear all",
		addRelationship: "Add relationship",
		removeRelationship: "Remove relationship",
		manageInvited: "Manage invited",
		emailInvalid: "That doesn't look like a full email address.",
	},

	prefs: {
		group: "Display preferences",
		language: "Language",
		theme: "Theme",
		themes,
		themeCycle: (current: ThemePref, next: ThemePref) =>
			`Theme: ${themes[current].toLowerCase()}. Switch to ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"A private family tree, drawn as a graph. Add the people you know, link how they are related, and see the generations line up by birth year.",
		signIn: "Sign in",
		signUp: "Sign up",
		account: "Account",
		trees: "Your trees",
		tree: "Tree",
		privacy: "Privacy policy",
		privacyDescription: "What Family Tree stores, why, and how to delete it.",
		deleteAccount: "Delete your account",
		deleteAccountDescription: "How to delete your Family Tree account and data.",
	},

	legal: {
		privacy: "Privacy",
		deleteAccount: "Delete account",
		signIn: "Sign in",
		privacyTitle: "Privacy policy",
		privacyEffective: "Effective 25 September 2026",
		deleteTitle: "Delete your account",
		deleteAppliesTo:
			"Applies to the Family Tree web site and the Family Tree app for Android and iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Delete my Family Tree account",
		deleteMailBody: (email?: string) =>
			`Please delete my Family Tree account${email ? ` (${email})` : ""} and all trees I created.`,
	},

	errorPage: {
		title: "Something went wrong",
		home: "Go to the main page",
	},

	landing: {
		nav: {
			features: "Features",
			calendar: "Calendar",
			mobile: "Mobile app",
			how: "How it works",
			logIn: "Log in",
			signUp: "Sign up",
			openMenu: "Open menu",
			closeMenu: "Close menu",
		},
		deleted: "Your account and your trees have been deleted.",
		eyebrow: "A private family tree, drawn as a graph",
		title: "Every family is a graph. Draw yours.",
		lead:
			"Add the people you know, link how they are related, and watch the generations line up by birth year. Private by default, shared only with the relatives you invite.",
		cta: "Start your tree, free",
		logIn: "Log in",
		fine: "No ads, no public profiles.",
		treeEyebrow: "The tree",
		treeTitle: "Boxes and lines, not forms and tables.",
		treeBody:
			"You build the tree the way you would sketch it on the back of an envelope: a card for each person, a line for each relationship. Drag, zoom, and click anyone to see who they are.",
		decades: ["1920s", "1940s", "1970s", "2000s"],
		timelineTitle: "A timeline of generations",
		timelineBody:
			"People sit on a vertical axis by birth year. Grandparents at the top, grandchildren at the bottom, and every twenty years a new band. You never wonder who came first.",
		lines: {
			biological: "Biological",
			married: "Married",
			livesWith: "Lives with",
			church: "Church",
			other: "Other",
		},
		kindsTitle: "Four kinds of family",
		kindsBody:
			"Blood, marriage, godparents, and the neighbour everyone calls uncle. Each group has its own line, and a marriage is the heaviest stroke on the page while “lives with” is the faintest, so the tree reads at a glance and still tells the whole story.",
		chips: ["Age 40–90", "Hide: In-law", "Women only", "Not: Nowak"],
		filtersTitle: "Filters that cut the noise",
		filtersBody:
			"Hide a relationship type, narrow to an age range, show one side of the family. Whatever is left on screen is what gets exported.",
		calendarEyebrow: "Calendar export",
		calendarTitle: "Every birthday. Every remembrance day. In the calendar you already use.",
		calendarBody:
			"One click turns the visible part of your tree into an .ics file: a yearly birthday for everyone living, and a yearly anniversary for everyone who has passed. Import it into Google Calendar, Apple Calendar or Outlook once, and it repeats forever.",
		pills: ["Birthdays, yearly", "Remembrance anniversaries", "Follows your filters"],
		calendarMonth: "October",
		calendarFile: "kowalski-family.ics",
		calendarRows: [
			{ dow: "Sat", title: "Maria Kowalska's birthday", meta: "Birthday · repeats yearly" },
			{ dow: "Thu", title: "† Stanisław Kowalski, remembrance", meta: "Remembrance · repeats yearly" },
			{ dow: "Wed", title: "Zofia Nowak's birthday", meta: "Birthday · repeats yearly" },
		],
		privateEyebrow: "Private by default",
		privateTitle: "Yours, and whoever you invite.",
		privateBody:
			"There are no public trees and no search across families. You create a tree, you invite relatives by email, they can look but not touch. Change your mind and revoke access with one click.",
		privateYou: "tomek (you)",
		privateCreator: "Creator · can edit everything",
		privateOwner: "Owner",
		privateInvited: "Invited · read-only",
		privateRevoke: "Revoke",
		privateInvite: "Invite by email…",
		mobileEyebrow: "iPhone and Android",
		mobileTitle: "The tree in your pocket, for the moments you need it.",
		mobileBody:
			"At a wedding and can’t place a face? Search a name and see how you are related. The app also keeps an upcoming list of birthdays and remembrance days, with a reminder the day before, and lets you add a new relative with a photo in a few taps.",
		appStoreSmall: "Coming soon to the",
		playStoreSmall: "COMING SOON TO",
		phoneUpcoming: "Upcoming",
		phoneRows: [
			{ t: "Maria turns 75", m: "Sat 3 Oct · in 8 days" },
			{ t: "† Stanisław, 28 yrs", m: "Thu 15 Oct" },
			{ t: "Zofia turns 21", m: "Wed 28 Oct" },
		],
		phoneRelation: "1976 · 50 · your mother’s cousin",
		howTitle: "How it works",
		steps: [
			{
				title: "Start with yourself",
				body: "Create a tree, add the first person: a name, a birth date, and a photo if you have one.",
			},
			{
				title: "Link the people you know",
				body: "Parents, partners, godparents. Pick two people and a relationship, and the line draws itself into the right generation.",
			},
			{
				title: "Invite the family",
				body: "Share read-only access by email, export the dates to your calendar, and keep the tree on your phone.",
			},
		],
		minute: "Takes about a minute.",
		hero: {
			label: "Example family tree with four generations",
			married: "married",
			godparent: "godparent",
		},
	},

	auth: {
		signInPrompt: "New here?",
		signInLink: "Create an account",
		signUpPrompt: "Already have an account?",
		signUpLink: "Sign in",
		missingCredentials: "Enter your username or email and your password.",
		unreachable: "Could not reach the server. Try again.",
		wrongCredentials: "Wrong username or password. Check both and try again.",
		resetEmailMissing: "Enter the email address of your account.",
		resetSent: (email: string) =>
			`If ${email} has an account, a reset link is on its way. Check your inbox.`,
		resetFailed: "Could not send the reset email. Try again.",
		resetTitle: "Reset password",
		resetSubtitle: "We'll email you a link to choose a new one.",
		welcomeTitle: "Welcome back",
		welcomeSubtitle: "Sign in to open your trees.",
		email: "Email",
		usernameOrEmail: "Username or email",
		password: "Password",
		forgot: "Forgot?",
		sending: "Sending…",
		sendReset: "Send reset link",
		signingIn: "Signing in…",
		signIn: "Sign in",
		backToSignIn: "Back to sign in",
		noAccount: "Don't have an account?",
		signUp: "Sign up",
		showPassword: "Show password",
		hidePassword: "Hide password",
		pickUsername: "Pick a username.",
		minPassword: (min: number) => `At least ${n(min, "character", "characters")}.`,
		passwordsDiffer: "Passwords don't match.",
		createFailed: "Could not create the account.",
		signInAfterCreateFailed: (message: string) =>
			`Your account was created, but signing in failed: ${message}. Try signing in.`,
		unknownError: "unknown error",
		registerTitle: "Start your tree",
		registerSubtitle: "Free, private, no ads.",
		username: "Username",
		displayName: "Display name",
		confirmPassword: "Confirm password",
		creating: "Creating account…",
		create: "Create account",
		registerNote:
			"We'll send a verification email. Your tree is visible only to you and the people you invite.",
	},

	nav: {
		trees: "Trees",
		account: "Your account",
		logOut: "Log out",
	},

	account: {
		title: "Your account",
		username: "Username:",
		displayName: "Display name:",
		email: "Email:",
		deleteHeading: "Delete account",
		deleteBodyBefore:
			"Deletes your account and every tree you created, with all the people, photos and relationships in them. Trees other people shared with you are not affected. See the ",
		deleteBodyLink: "privacy policy",
		deleteBodyAfter: ".",
		failedBefore: (error: string) => `Your account could not be deleted here (${error}). `,
		failedLink: "Email a deletion request",
		failedAfter: " instead and it will be done within 30 days.",
		deleteButton: "Delete account…",
		confirmTitle: "Delete your account?",
		confirmBody:
			"This deletes your account and every tree you created, with all the people, photos and relationships in them. People you invited lose access. There is no undo.",
		confirmLabel: "Delete everything",
		keep: "Keep my account",
		typeToConfirm: "Type DELETE to confirm",
		/** Accepted (case-insensitive) confirmation words. */
		confirmWords: ["delete"],
	},

	dashboard: {
		onlyYou: "Only you",
		viewers: (count: number) => n(count, "viewer", "viewers"),
		byCreator: (name: string) => `by ${name}`,
		stats: (count: number | null, ago: string) =>
			`${count === null ? "" : `${people(count)} · `}updated ${ago}`,
		moreActions: (name: string) => `More actions for ${name}`,
		rename: "Rename",
		deleteTree: "Delete tree…",
		open: "Open",
		emptyTitle: "No trees yet",
		emptyBody:
			"Start with the people you know best: yourself, your parents, your grandparents. You can invite the rest of the family once there is something to look at.",
		createFirst: "Create your first tree",
		emptyNote: "Waiting on an invitation? Trees shared with you appear here automatically.",
		title: "Your trees",
		count: (total: number, owned: number, shared: number) =>
			`${n(total, "tree", "trees")}${shared > 0 ? ` · ${owned} yours, ${shared} shared with you` : ""}`,
		newTree: "New tree",
	},

	treeDialogs: {
		nameRequired: "Give the tree a name.",
		created: "Tree created",
		newTitle: "New tree",
		newSubtitle: "Give it a name you'd say out loud.",
		treeName: "Tree name",
		namePlaceholder: "My family tree",
		nameHint: "For example “Kowalski family” or “Mum's side”.",
		createAndOpen: "Create and open",
		nameEmpty: "The name can't be empty.",
		renamed: "Tree renamed",
		renameTitle: "Rename tree",
		alreadyHasAccess: "That person already has access.",
		noAccount: "That email has no Family Tree account yet.",
		thatsYou: "That's you. You already own this tree.",
		invited: (email: string, tree: string) => `${email} can now view ${tree}`,
		revoked: "Access revoked",
		whoCanSee: (tree: string) => `Who can see ${tree}`,
		whoCanSeeSubtitle:
			"Invited people can look, not edit. They need a Family Tree account with this email.",
		emailPlaceholder: "name@example.com",
		emailToInvite: "Email to invite",
		invite: "Invite",
		revoke: "Revoke",
		deleteTitle: (tree: string) => `Delete “${tree}”?`,
		deleteBody: (count: number | null, viewers: number) =>
			`This removes ${count === null ? "everyone in it" : people(count)} and all their relationships${
				viewers > 0 ? ` for you and ${n(viewers, "invited viewer", "invited viewers")}` : ""
			}. There is no undo.`,
		deleted: (tree: string) => `${tree} deleted`,
		deleteConfirm: "Delete tree",
		keep: "Keep it",
		typeName: "Type the tree name to confirm",
	},

	tree: {
		legend: "Legend",
		deceased: "† deceased",
		filtersCleared: "Filters cleared to show them",
		unknownType: "Unknown",
		chipHide: (type: string) => `Hide: ${type}`,
		chipAge: (min: number, max: number, plus: boolean) => `Age ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Men only",
		chipWomen: "Women only",
		chipNot: (names: string) => `Not: ${names}`,
		chipOnly: (names: string) => `Only: ${names}`,
		removeFilter: (text: string) => `Remove filter ${text}`,
		exported: (filename: string, count: number) => `${filename} downloaded · ${people(count)}`,
		calendarFailed: "Could not build the calendar",
		back: "Back to trees",
		openFailed: "This tree could not be opened",
		backToTrees: "Back to your trees",
		loadingTree: "Loading the tree…",
		counts: (peopleCount: number, relationshipCount: number) =>
			`${people(peopleCount)} · ${relationships(relationshipCount)}`,
		emptyTitle: "No one here yet",
		emptyOwner:
			"Add the first person, yourself is a good start. Everyone you add lines up by birth year.",
		emptyViewer: "The creator hasn't added anyone to this tree yet.",
		addFirst: "Add the first person",
		editToolbar: "Edit tree",
		viewToolbar: "View",
		addPerson: "Add person",
		findPerson: "Find person",
		filters: "Filters",
		exportCalendar: "Export to calendar",
		zoomIn: "Zoom in",
		zoomOut: "Zoom out",
		fit: "Fit to screen",
		visible: (shown: number, total: number) => `${shown} of ${people(total)} visible`,
		saved: "Changes saved",
		added: (name: string) => `${name} added to the tree`,
		relationshipAdded: "Relationship added",
		removePersonTitle: (name: string) => `Remove ${name}?`,
		removePersonBody: (count: number) =>
			`This also removes ${relationships(count)} connected to them. There is no undo.`,
		removePerson: "Remove person",
		personRemoved: (name: string) => `${name} removed`,
		removeEdgeTitle: "Remove this relationship?",
		removeEdgeBody: (sentence: string) => `${sentence}. The two people stay in the tree.`,
		relationshipRemoved: "Relationship removed",
		canvas: "Family tree canvas. Drag to pan, scroll to zoom.",
		nodeLabel: (name: string, years: string, deceased: boolean, link: "you" | "linked" | null) =>
			`${name}, ${years}${deceased ? ", deceased" : ""}${
				link === "you" ? ", this is you" : link === "linked" ? ", linked to an account" : ""
			}`,
		youPill: "You",
		legendYou: "You",
		legendLinked: "Linked account",
		band: (year: number, _span: number) => `${year}s`,
	},

	panel: {
		details: (name: string) => `${name} details`,
		removeWith: (name: string) => `Remove relationship with ${name}`,
		noRelationships: "No relationships yet.",
		showFamily: "Show extended family",
		hideFamily: "Hide extended family",
		noFamily: "No parent or marriage links to work out the wider family from.",
		removeNamed: (name: string) => `Remove ${name}`,
		readOnly: "Read-only. Only the tree's creator can edit.",
		thisIsYou: "This is you",
		linkedTo: (email: string) => `Linked to ${email}`,
		note: "Note",
		relationship: "Relationship",
		bidirectional: "bidirectional",
		directional: "directional →",
	},

	filters: {
		hideTypes: "Hide relationship types",
		hideTypesHint: "Struck-through types are hidden from the canvas and the export.",
		age: "Age",
		minimum: "Minimum",
		maximum: "Maximum",
		ageHint: "Age at death for people who have passed away.",
		gender: "Gender",
		everyone: "Everyone",
		men: "Men",
		women: "Women",
		includeByName: "Show only names containing",
		includeHint: "Comma-separated. Keeps people whose name contains any of them.",
		excludeByName: "Exclude by name",
		excludeHint: "Comma-separated. Matches any part of a name, ignoring case and accents.",
	},

	dialogs: {
		findTitle: "Find person",
		findPlaceholder: "Type a name…",
		searchPeople: "Search people",
		noResults: "No one by that name.",
		nameRequired: "Enter a name.",
		birthRequired: "Enter a birth date.",
		deathBeforeBirth: "Death date is before the birth date.",
		editPerson: "Edit person",
		addPerson: "Add person",
		personSubtitle: "Name and birth date are required. Everything else can wait.",
		changePhoto: "Change photo",
		uploadPhoto: "Upload photo",
		photoHint: "JPG or PNG, up to 5 MB. Square works best.",
		photoTooLarge: "That photo is larger than 5 MB.",
		fullName: "Full name",
		namePlaceholder: "e.g. Maria Kowalska",
		birthDate: "Birth date",
		deathDate: "Death date",
		note: "Note",
		noteHint: "Anything worth remembering: a maiden name, where they lived, a story.",
		noteCount: (length: number, max: number) => `${length} / ${max}`,
		noteTooLong: (max: number) => `Keep the note under ${max} characters.`,
		linkedAccount: "Linked account",
		linkedHint: "The Family Tree account of this person, if they have access to the tree.",
		linkedNone: "None",
		linkedMe: (name: string) => `Me (${name})`,
		linkedConflict: (account: string, person: string) =>
			`${account} is already linked to ${person}. An account can be linked to one person only, so unlink it there first.`,
		saveChanges: "Save changes",
		addToTree: "Add to tree",
		search: "Search…",
		readAsSentence: "Read it as a sentence:",
		duplicate: "That relationship is already in the tree.",
		fromPerson: "From person",
		toPerson: "To person",
		relationType: "Relation type",
		bothWays: "both ways",
		oneWay: "one way",
		exportTitle: "Export to calendar",
		exportHeading: (count: number) => `Export ${people(count)} to your calendar`,
		exportBody:
			"A single .ics file with a yearly birthday for each living person and a yearly remembrance day for each person who has passed. Hidden people are not included.",
		birthdays: "Birthdays",
		remembrances: "Remembrance anniversaries",
		download: "Download .ics",
	},

	person: {
		age: (age: number, _gender: Gender, deceased: boolean) =>
			deceased ? `${age} at death` : `${age} years old`,
	},

	family: {
		/** 0 → grandparents, 1 → great-grandparents, … */
		ancestors: (level: number) => `${level === 0 ? "G" : `Great-${"great-".repeat(level - 1)}g`}randparents`,
		descendants: (level: number) =>
			`${level === 0 ? "G" : `Great-${"great-".repeat(level - 1)}g`}randchildren`,
		parents: "Parents",
		auntsAndUncles: "Aunts and uncles",
		siblings: "Siblings",
		children: "Children",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biological",
			"IN-LAW": "In-law",
			CHURCH: "Church",
			IRRELEVANT: "Other",
		},
		legend: {
			married: "Married",
			livesWith: "Lives with",
		},
		/** English reads well from the humanised database names, so none are listed. */
		known: {} as Record<string, KnownRelationship>,
		fallbackSentence: (from: string, phrase: string, isVerb: boolean, to: string) =>
			`${from} ${isVerb ? "is " : ""}${phrase} ${to}`,
		fallbackRole: (phrase: string, isVerb: boolean, firstName: string, selectedIsSource: boolean) =>
			selectedIsSource
				? `${firstName} ${isVerb ? "is " : ""}${phrase}`
				: `${isVerb ? "is " : ""}${phrase} ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name: string) => `† ${name}, remembrance`,
		remembranceDescription: (name: string, born: number) =>
			`Anniversary of ${name}'s passing (born ${born}).`,
		birthdayTitle: (name: string) => `${name}'s birthday`,
		birthdayDescription: (name: string, born: number, _gender: Gender) => `${name} was born in ${born}.`,
		fileFallback: "family-tree",
	},
};

export type Dict = typeof en;
