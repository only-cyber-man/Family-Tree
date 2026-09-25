import { enForm } from "./plural";

// English strings. This object is the source of truth: `Dict = typeof en`, and
// pl.ts is typed as Dict, so a missing or mistyped Polish key is a TS error.

export type KinGender = "male" | "female";

/** One step of a relationship chain, as a noun ("mother", "friend"). */
export interface KinWord {
	rel: "parent" | "child" | "sibling" | "spouse" | "partner" | "other";
	gender: KinGender;
	/** For rel "other": the type's noun in nominative / genitive. */
	noun?: { nom: string; gen: string };
}

export type KinTerm =
	| { kind: "blood"; up: number; down: number; gender: KinGender; siblingGender?: KinGender }
	| { kind: "affinal"; which: "spouse" | "partner" | "parentInLaw" | "siblingInLaw" | "childInLaw" | "stepParent" | "stepChild"; gender: KinGender };

export type StepMove = "up" | "down" | "sibling" | "spouse" | "partner" | "other";

/** Per-relationship-type texts; unknown types fall back to the humanised name. */
export interface TypeText {
	/** Chip / filter / legend label: "Mother of". */
	label: string;
	/** Sentence verb for "<A> <verb> <B>." by A's gender. */
	sentence: (g: KinGender) => string;
	/** Role of the far person when they are the source (e.g. godparent), by their gender. */
	role?: (g: KinGender) => string;
	/** Role of the far person when they are the target (e.g. godchild), by their gender. */
	inverseRole?: (g: KinGender) => string;
}

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
const greats = (n: number) => (n > 0 ? "great-".repeat(n) : "");
const ORD = ["", "", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth"];
const TIMES = ["", "once", "twice", "three times", "four times", "five times"];
const years = (n: number) => `${n} ${enForm(n, "year", "years")}`;

export const en = {
	lang: "en" as "en" | "pl",
	locale: "en-GB",

	common: {
		cancel: "Cancel",
		done: "Done",
		save: "Save",
		saving: "Saving…",
		close: "Close",
		back: "Back",
		change: "Change",
		tryAgain: "Try again",
		add: "Add",
		create: "Create",
		creating: "Creating…",
		edit: "Edit",
		remove: "Remove",
		keep: "Keep",
		continue: "Continue",
		undo: "Undo",
		openSettings: "Open Settings",
		settings: "Settings",
		signIn: "Sign in",
		you: "You",
		loading: "Loading",
		familyTree: "Family Tree",
		owner: "Owner",
		sharedWithYou: "Shared with you",
		male: "Male",
		female: "Female",
		show: "Show",
		hide: "Hide",
		showPassword: "Show password",
		hidePassword: "Hide password",
		chooseDate: "Choose a date",
		dateA11y: (label: string, value: string) => `${label}: ${value}. Change`,
		closeDatePicker: "Close date picker",
		removeFilter: (label: string) => `Remove filter ${label}`,
		searchByName: "Search by name",
		noOneCalled: (q: string) => `No one called “${q}”.`,
		noOneToChoose: "No one to choose yet.",
		selected: "selected",
		reminderScheduled: "Reminder scheduled",
		noReminder: "No reminder",
		range: (lo: number, hi: string) => `${lo} to ${hi}`,
	},

	offline: {
		banner: "You're offline. Showing the last copy of this tree.",
		short: "You're offline.",
		write: "You're offline — changes can't be saved.",
	},

	save: {
		failedOffline: (what: string) => `Couldn't save ${what}: you're offline or the server can't be reached. Nothing was lost; try again.`,
		failed: (what: string, reason: string) => `Couldn't save ${what}. ${reason}`,
		noTree: "No tree is open, so nothing was saved. Choose a tree and try again.",
		theChanges: "the changes",
		thisPerson: "this person",
		theRelationship: "the relationship",
		theTree: "the tree",
	},

	errors: {
		network: "No connection. Check your internet and try again.",
		generic: "Something went wrong.",
		notSignedIn: "You are not signed in.",
		passwordsDontMatch: "Passwords do not match.",
		sessionExpired: "Your session has expired. Please sign in again.",
		shareUnavailable: "Sharing is not available on this device.",
	},

	tabs: { home: "Home", tree: "Tree", add: "Add", find: "Find", dates: "Dates", settings: "Settings", addPerson: "Add person", findPerson: "Find a person" },

	prefs: {
		language: "Language",
		languageSystem: "System",
		appearance: "Appearance",
		theme: "Theme",
		system: "System",
		light: "Light",
		dark: "Dark",
	},

	onboarding: {
		title1: "Your family, drawn as a graph.",
		body1: "People are cards, relationships are lines, generations line up by birth year. Private, shared only by invitation.",
		title2: "Never miss a birthday or a remembrance day.",
		body2: "A quiet reminder the day before. Everything stays on your phone; nothing is sent to us.",
		page: (n: number, total: number) => `Page ${n} of ${total}`,
		haveAccount: "I already have an account",
		turnOnReminders: "Turn on reminders",
		notNow: "Not now",
		previewTitle1: "Grandma Maria turns 75 tomorrow",
		previewWhen1: "Tomorrow",
		previewBody1: "A round birthday. Give Maria a call?",
		previewTitle2: "† Stanisław Kowalski, 28 years",
		previewWhen2: "15 Oct",
	},

	auth: {
		welcomeBack: "Welcome back",
		signInSubtitle: "Sign in with your Family Tree account.",
		usernameOrEmail: "Username or email",
		password: "Password",
		forgot: "Forgot password?",
		newHere: "New here?",
		createAccount: "Create an account",
		enterBoth: "Enter your username or email and your password.",
		wrongCredentials: "That username or password is not right.",
		forgotHowTo: "Type your email address in the first field, then tap “Forgot password?” again.",
		resetTitle: "Reset password",
		resetConfirm: (email: string) => `Send a reset link to ${email}?`,
		send: "Send",
		checkInbox: "Check your inbox",
		checkInboxBody: "If that email has an account, a reset link is on its way.",
		couldntSend: "Couldn't send",
		signInAgain: "Please sign in again",
		sessionEnded: "Your session ended. Nothing was lost; the tree is still here.",
		passwordFor: (who: string) => `Password for ${who}`,
		differentAccount: "Use a different account",
		startTree: "Start your tree",
		freePrivate: "Free, private, no ads.",
		username: "Username",
		displayName: "Display name (optional)",
		yourName: "Your name",
		email: "Email",
		confirmPassword: "Confirm password",
		step1: "Password and confirmation come next. Step 1 of 2.",
		step2: (email: string) => `We send a verification email to ${email}. Step 2 of 2.`,
		usernameRule: "At least 3 letters or digits, no spaces.",
		emailInvalid: "That doesn't look like an email address.",
		passwordRule: "Use at least 8 characters.",
		createAccountButton: "Create account",
		agreePrefix: "By creating an account you agree to the ",
		privacyPolicy: "privacy policy",
		agreeSuffix: ".",
	},

	home: {
		offline: "You're offline",
		couldntLoadTrees: "Couldn't load your trees",
		connectFirstTime: "Connect to the internet to see your trees for the first time.",
		noTrees: "No trees yet",
		noTreesBody: "Start with yourself and your parents. Invitations from relatives show up here on their own.",
		createFirst: "Create your first tree",
		treeUnavailable: "This tree is not available",
		couldntOpen: "Couldn't open this tree",
		treeUnavailableBody: "It may have been deleted, or its owner stopped sharing it with you.",
		noCopy: "There is no copy of this tree on this phone yet. Connect and try again.",
		chooseTree: "Choose a tree",
		switchTree: "Switch tree",
		lookingFor: "Who are you looking for?",
		upcoming: "Upcoming",
		seeAll: "See all",
		noUpcoming: "No upcoming dates",
		noUpcomingEmpty: "Birthdays and remembrance days appear here once there are people in the tree.",
		noUpcomingYear: "Nothing in the next twelve months.",
		noOne: "No one here yet",
		addYourself: "Add yourself first. Everyone else connects to someone already in the tree.",
		ownerAddedNoOne: "The owner has not added anyone yet.",
		addFirst: "Add the first person",
		quick: "Quick",
		addPerson: "Add person",
		linkTwo: "Link two people",
		aboutTree: "This tree",
		detailHint: "Tap a date on the left to see the person here.",
	},

	tree: {
		loading: "Loading the tree…",
		removeTitle: (name: string) => `Remove ${name}?`,
		removeBody: "Their relationships are removed too. This cannot be undone.",
		removed: (name: string) => `${name} removed`,
		addRelationship: "Add relationship",
		focusedOn: (name: string) => `Focused on ${name}`,
		parents: "parents",
		partner: "partner",
		partners: "partners",
		children: "children",
		exitFocus: "Exit focus",
		search: "Search",
		filters: "Filters",
		filtersActive: (n: number) => `Filters, ${n} active`,
		goUpTo: (name: string) => `Go up to ${name}`,
		resetView: "Reset view",
		fitAll: "Fit the whole tree",
		allFiltered: "Everyone is filtered out",
		clearFilters: "Clear filters",
		canvasA11y: (n: number) => `Family tree with ${n} ${enForm(n, "person", "people")}. Use search to find someone.`,
		bandLabel: (start: number, _end: number) => `${start}s`,
		bandLabelShort: (start: number, _end: number) => `’${String(start).slice(2)}s`,
		legend: "Legend",
		legendBio: "Bio",
		legendMarried: "Married",
		legendLivesWith: "Lives with",
		legendInLaw: "In-law",
		legendChurch: "Church",
		legendOther: "Other",
		youPill: "You",
		legendYou: "You",
		panelHint: "Tap a person to see their details here.",
		panelTitle: "Details",
	},

	person: {
		gone: "This person is no longer in the tree.",
		ageAlive: (g: string, age: number) => `${g} · ${years(age)} old`,
		ageDeceased: (g: string, age: number, wouldBe?: number) => `${g} · ${age} at death${wouldBe ? ` · would be ${wouldBe}` : ""}`,
		you: "you",
		focus: "Focus",
		focusOnTree: "Focus on tree",
		howRelated: "How are we related?",
		turns: (n: number) => `Turns ${n}`,
		remembranceDay: "Remembrance day",
		remindMe: "Remind me",
		noRelationshipsOwner: "No relationships yet. Add one to connect them to the tree.",
		noRelationships: "No relationships yet.",
		dragUp: "Drag up for all relationships",
		removedFromTree: (name: string) => `${name} removed from the tree`,
		couldntRemove: (name: string, reason: string) => `Couldn't remove ${name}. ${reason}`,
		open: "Open",
		removeRelationship: "Remove relationship",
		relationshipRemoved: "Relationship removed",
		sharedBy: (email?: string) => `Shared with you${email ? ` by ${email}` : ""}. Only the owner can edit.`,
		removeA11y: (name: string) => `Remove ${name}`,
		thisIsYou: "This is you",
		linkedTo: (email: string) => `Linked to ${email}`,
		linkedToAccount: "Linked to an account",
		note: "Note",
	},

	path: {
		whichIsYou: "Which one is you?",
		needMe: (first: string) =>
			`To say how ${first} is related to you, the app needs to know which person in this tree is you. You choose once; it is kept on this phone.`,
		chooseWho: "Choose who you are",
		notConnected: "Not connected to you yet",
		notConnectedBody: (name: string) => `There is no chain of relationships between you and ${name} in this tree. Adding a relationship would connect you.`,
		open: (first: string) => `Open ${first}`,
		stepsThrough: (steps: number, people: number) => `${steps} ${enForm(steps, "step", "steps")} through ${people} ${enForm(people, "person", "people")}.`,
		familyOnly: "Shortest path using biological and marriage links only.",
		anyLinks: "Family links do not connect you, so other recorded links are used.",
		youName: (name: string) => `You · ${name}`,
		showOnTree: "Show on tree",
		meNote: (name: string) => `“This is me” (${name}) is stored on this phone only, because the shared tree has no field for it yet. Change it in Settings.`,
		notConnectedShort: "not connected to you yet",
	},

	search: {
		placeholder: "Who are you looking for?",
		a11y: "Search people",
		chooseWho: "Choose who you are",
		chooseWhoBody: "Tell the app which person is you to see how everyone is related to you. The choice stays on this phone.",
		noOne: (q: string) => `No one called “${q}” in this tree.`,
	},

	addPerson: {
		add: "Add person",
		edit: "Edit person",
		viewerOnly: "This tree is shared with you to look at. Only its owner can add people.",
		chooseTreeFirst: "Choose or create a tree first.",
		gone: "This person is no longer in the tree.",
		nameRequired: "Name is required.",
		chooseGender: "Choose a gender.",
		birthRequired: "Birth date is required.",
		deathRequired: "Add the date they passed away, or switch this off.",
		deathBeforeBirth: "Death date is before the birth date.",
		linkIncomplete: "Choose both the relation and the person, or clear the link.",
		saved: (first: string) => `${first} saved`,
		linkFailed: (first: string, reason: string) => `${first} was added, but the link couldn't be saved. ${reason}`,
		added: (first: string) => `${first} added to the tree`,
		changePhoto: "Change photo",
		addPhoto: "Add a photo",
		cameraOff: "Camera access is off",
		cameraOffBody: "You can still pick a photo from your gallery, or allow the camera in Settings.",
		useGallery: "Use gallery",
		takePhoto: "Take photo",
		fromGallery: "Choose from gallery",
		fullName: "Full name",
		namePlaceholder: "e.g. Maria Kowalska",
		gender: "Gender",
		birthDate: "Birth date",
		passedAway: "Has passed away",
		passedAwayHint: "Adds a death date and a remembrance day",
		deathDate: "Date of death",
		linkTo: "Link to someone",
		linkOptional: "optional, saves a step",
		linkExample: (name: string) => `e.g. mother of ${name}`,
		newPerson: "New person",
		parentNote: (child: string) => `The new person is the parent; ${child} is the child.`,
		theChosen: "the chosen person",
		dontLink: "Don't link now",
		note: "Note",
		notePlaceholder: "Anything worth remembering",
		noteCount: (n: number, max: number) => `${n}/${max}`,
		linkedAccount: "Linked account",
		linkedHint: "Which Family Tree account is this person? Only accounts that can see this tree are listed.",
		linkedNone: "None",
		linkedMe: (email?: string) => (email ? `Me (${email})` : "Me"),
		linkedConflict: (name: string) => `${name} is already linked to this account.`,
		loadingAccounts: "Loading accounts…",
	},

	addRel: {
		title: "Add relationship",
		viewerOnly: "Only the owner of this tree can add relationships.",
		chooseBoth: "Choose both people and how they are related.",
		different: "Choose two different people.",
		duplicate: "This relationship is already in the tree.",
		added: "Relationship added",
		isRelatedTo: "is related to",
		from: "From",
		to: "To",
		relation: "Relation",
		changeFrom: "Change who the relationship is from",
		more: "More…",
		fewer: "Fewer",
		/** "<A> <verb> <B>." */
		sentence: (a: string, verb: string, b: string) => `${a} ${verb} ${b}.`,
	},

	filters: {
		title: "Filters",
		clearAll: "Clear all",
		show: (shown: number, total: number) => `Show ${shown} of ${total} ${enForm(total, "person", "people")}`,
		hideTypes: "Hide relationship types",
		hidden: "hidden",
		shown: "shown",
		age: "Age",
		ageRange: "Age range",
		gender: "Gender",
		everyone: "Everyone",
		men: "Men",
		women: "Women",
		excludeByName: "Exclude by name",
		excludeHint: "Separate several names with commas.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label: string) => `Hide: ${label}`,
		chipAge: (lo: number, hi: string) => `Age ${lo}–${hi}`,
		chipMen: "Men only",
		chipWomen: "Women only",
		chipNot: (names: string) => `Not: ${names}`,
		chipOnly: (names: string) => `Only: ${names}`,
		includeByName: "Show only names containing",
		includeHint: "Any of several names, separated by commas.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Your trees",
		giveName: "Give the tree a name first.",
		created: (name: string) => `“${name}” created`,
		nameLabel: "Name of the new tree",
		namePlaceholder: "My family tree",
		newTree: "New tree",
		people: (n: number) => `${n} ${enForm(n, "person", "people")}`,
		updated: (rel: string) => `updated ${rel}`,
		viewers: (n: number) => `${n} ${enForm(n, "viewer", "viewers")}`,
		onlyYou: "Only you",
		by: (email: string) => `by ${email}`,
		active: "Active ✓",
	},

	invited: {
		title: "Who can see this tree",
		subtitle: "Invited people can look, not edit.",
		thatsYou: "That's you; you already own this tree.",
		already: "They can already see this tree.",
		canSee: (email: string) => `${email} can now see this tree`,
		noAccount: "No Family Tree account uses that email. Ask them to sign up first, then invite them.",
		thisPerson: "this person",
		stopTitle: (who: string) => `Stop sharing with ${who}?`,
		stopBody: "They will no longer see this tree.",
		revoke: "Revoke",
		revoked: (who: string) => `${who} can no longer see this tree`,
		emailPlaceholder: "name@example.com",
		emailA11y: "Email of the person to invite",
		invite: "Invite",
		note: "They need a Family Tree account with this email already. Nothing is emailed; the tree simply appears in their list.",
		youSuffix: (name: string) => `${name} (you)`,
		creator: "Creator",
		viewer: "Viewer",
		viewerYou: "Viewer · you",
		unknown: "Unknown account",
		revokeA11y: (email: string) => `Revoke ${email}`,
		onlyYou: "Only you can see this tree.",
	},

	dates: {
		title: "Dates",
		exportIcs: "Export .ics",
		all: "All",
		birthdays: "Birthdays",
		remembrance: "Remembrance",
		quietReminder: "Get a quiet reminder the day before",
		turnOn: "Turn on reminders",
		localOnly: "Reminders are scheduled on this phone from the dates in the tree. Nothing is sent to a server.",
		detailHint: "Tap a date to see the person here.",
		none: "No upcoming dates",
		noneBody: "Birthdays and remembrance days appear here once there are people in the tree.",
		footnote:
			"Bell = local reminder scheduled for 9:00 the day before (remembrance days: on the day). Round ages (18, 50, 55, 60…) can get a second reminder a week ahead. The export includes the people currently visible on the tree.",
	},

	settings: {
		title: "Settings",
		signOutTitle: "Sign out?",
		signOutBody: "Reminders are removed and the copies of your trees are deleted from this phone.",
		signOut: "Sign out",
		account: "Account",
		accountBody: "Password changes are done on the website.",
		openWebsite: "Open website",
		reminders: "Reminders",
		birthdays: "Birthdays",
		dayBefore: "Day before, 9:00",
		remembranceDays: "Remembrance days",
		onTheDay: "On the day, 9:00",
		roundEarly: "Round birthdays a week early",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Scheduled on this phone for the active tree. Nothing is sent to a server.",
		whoCanSee: "Who can see this tree",
		viewers: (n: number) => `${n} ${enForm(n, "viewer", "viewers")}`,
		onlyYou: "Only you",
		preparing: "Preparing…",
		exportIcs: "Export to calendar (.ics)",
		thisIsMe: "This is me",
		notSet: "Not set",
		switchTree: "Switch tree",
		about: "About",
		privacy: "Privacy policy",
		deleteAccount: "Delete account",
		deleteTitle: "Delete your account?",
		deleteBody:
			"This deletes your account and every tree you created, with all its people, photos and relationships. People you invited lose access. There is no undo.",
		footer: (version: string) => `Family Tree ${version} · Created by tomek7667 · family-tree@cyber-man.pl`,
	},

	deleteAccount: {
		title: "Delete account",
		typeToConfirm: (word: string) => `Type ${word} to confirm`,
		typeToConfirmError: (word: string) => `Type ${word} to confirm.`,
		offline: "You're offline — your account can't be deleted right now.",
		permanently: "This permanently deletes:",
		yourAccount: (email?: string) => `• your account${email ? ` (${email})` : ""}`,
		everyTree: "• every tree you created, with all its people, photos and relationships",
		consequences: "People you invited lose access to those trees. Trees others shared with you are not affected. There is no undo.",
		notFully: (reason: string) => `Your account was not fully deleted. ${reason}`,
		askUs: (email: string) => `You can try again, or ask us to delete it for you at ${email}.`,
		emailRequest: "Email a deletion request",
		deleteMine: "Delete my account",
		deleting: "Deleting…",
		keep: "Keep my account",
		mailSubject: "Delete my Family Tree account",
		mailBody: (email?: string) => `Please delete my Family Tree account${email ? ` (${email})` : ""} and all trees I created.`,
	},

	pickMe: {
		title: "Which one is you?",
		note: "Used for “How are we related”. It is stored on this phone only and nobody else sees it.",
		forget: "Forget my choice",
		serverLinked: (name: string) => `${name} is linked to your account in this tree, so “This is me” comes from the tree on every device.`,
		saveTitle: "Save on the tree?",
		saveBody: (name: string) => `Link ${name} to your account in this tree? Then “This is me” works on every device and on the website.`,
		saveLink: "Save link",
		phoneOnly: "Only on this phone",
		linkSaved: (name: string) => `${name} is now linked to your account`,
	},

	notFound: {
		title: "Nothing here",
		body: "That link points to a page the app does not have.",
		home: "Go home",
	},

	toastsReminders: {
		on: "Reminders are on. They stay on this phone.",
		off: "Notifications are off for Family Tree.",
		settings: "Settings",
		channel: "Birthdays and remembrance days",
	},

	// ---- lib-level texts (pure functions take the dictionary as a parameter) ----

	dateNames: {
		monthsNom: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		/** Month as used inside a full date ("4 February 1950"). */
		monthsInDate: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
	},

	time: {
		justNow: "just now",
		minutesAgo: (n: number) => `${n} ${enForm(n, "minute", "minutes")} ago`,
		hoursAgo: (n: number) => `${n} ${enForm(n, "hour", "hours")} ago`,
		yesterday: "yesterday",
		daysAgo: (n: number) => `${n} days ago`,
		weeksAgo: (n: number) => `${n} ${enForm(n, "week", "weeks")} ago`,
		monthsAgo: (n: number) => `${n} ${enForm(n, "month", "months")} ago`,
		yearsAgo: (n: number) => `${n} ${enForm(n, "year", "years")} ago`,
		today: "today",
		tomorrow: "tomorrow",
		inDays: (n: number) => `in ${n} days`,
	},

	events: {
		birthdayTitle: (first: string, age: number) => `${first} turns ${age}`,
		remembranceTitle: (first: string, n: number) => `† ${first}, ${years(n)}`,
		birthday: "Birthday",
		remembrance: "Remembrance",
		roundAge: "round age",
		reminderEve: (first: string, age: number) => `${first} turns ${age} tomorrow`,
		reminderEveRoundBody: (first: string) => `A round birthday. Give ${first} a call?`,
		reminderWeek: (first: string, age: number) => `${first} turns ${age} in a week`,
		reminderWeekBody: (dayMonth: string) => `A round birthday on ${dayMonth}.`,
		reminderRemembrance: (name: string, n: number) => `† ${name}, ${years(n)}`,
		reminderRemembranceBody: (dayMonth: string) => `Remembrance day · ${dayMonth}`,
	},

	ics: {
		calName: "Birthdays",
		birthdayTitle: (name: string) => `${name} birthday`,
		birthdayDesc: (name: string) => `Birthday of ${name} occurs on this day`,
		deathTitle: (name: string) => `${name} Passing Away Anniversary`,
		deathDesc: (name: string) => `Anniversary of ${name}'s passing away occurs on this day`,
		fileSuffix: "dates",
		shareTitle: (tree: string) => `${tree} dates`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biological", "IN-LAW": "In-law", CHURCH: "Church", IRRELEVANT: "Other" } as Record<string, string>,
		types: {
			IS_FATHER_OF: { label: "Father of", sentence: () => "is father of" },
			IS_MOTHER_OF: { label: "Mother of", sentence: () => "is mother of" },
			IS_MARRIED_TO: { label: "Married to", sentence: () => "is married to" },
			LIVES_WITH: { label: "Lives with", sentence: () => "lives with" },
			IS_PARTNER_OF: { label: "Partner of", sentence: () => "is partner of" },
			IS_ENGAGED_TO: { label: "Engaged to", sentence: () => "is engaged to" },
			IS_GODPARENT_OF: { label: "Godparent of", sentence: () => "is godparent of", role: () => "Godparent", inverseRole: () => "Godchild" },
			IS_FRIEND_OF: { label: "Friend of", sentence: () => "is friend of", role: () => "Friend", inverseRole: () => "Friend" },
			IS_STEPPARENT_OF: {
				label: "Stepparent of",
				sentence: () => "is stepparent of",
				role: (g: KinGender) => gw(g, "Stepfather", "Stepmother"),
				inverseRole: (g: KinGender) => gw(g, "Stepson", "Stepdaughter"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Mother",
			father: "Father",
			child: "Child",
			sibling: (g: KinGender) => gw(g, "Brother", "Sister"),
			/** Viewed person is the source of an unknown directional type. */
			isSourceOf: (first: string, labelLower: string) => `${first} is ${labelLower}`,
		},
	},

	kin: {
		you: "you",
		youTitle: "You",
		term: (t: KinTerm): string | null => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "husband", "wife");
					case "partner":
						return "partner";
					case "parentInLaw":
						return gw(g, "father-in-law", "mother-in-law");
					case "siblingInLaw":
						return gw(g, "brother-in-law", "sister-in-law");
					case "childInLaw":
						return gw(g, "son-in-law", "daughter-in-law");
					case "stepParent":
						return gw(g, "stepfather", "stepmother");
					case "stepChild":
						return gw(g, "stepson", "stepdaughter");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) return u === 1 ? gw(g, "father", "mother") : greats(u - 2) + gw(g, "grandfather", "grandmother");
			if (u === 0) return d === 1 ? gw(g, "son", "daughter") : greats(d - 2) + gw(g, "grandson", "granddaughter");
			if (u === 1 && d === 1) return gw(g, "brother", "sister");
			if (d === 1) return greats(u - 2) + gw(g, "uncle", "aunt");
			if (u === 1) return (d === 2 ? "" : greats(d - 3) + "grand") + gw(g, "nephew", "niece");
			const degree = Math.min(u, d) - 1;
			const removed = Math.abs(u - d);
			const base = degree === 1 ? "cousin" : `${ORD[degree] ?? `${degree}th`} cousin`;
			return removed === 0 ? base : `${base} ${TIMES[removed] ?? `${removed} times`} removed`;
		},
		word: (w: KinWord): string => {
			switch (w.rel) {
				case "parent":
					return gw(w.gender, "father", "mother");
				case "child":
					return gw(w.gender, "son", "daughter");
				case "sibling":
					return gw(w.gender, "brother", "sister");
				case "spouse":
					return gw(w.gender, "husband", "wife");
				case "partner":
					return "partner";
				default:
					return w.noun?.nom ?? "relative";
			}
		},
		/** "your mother's brother's daughter" */
		chain: (words: KinWord[]): string => (words.length ? "your " + words.map((w) => en.kin.word(w)).join("'s ") : "you"),
		/** "your cousin" */
		phrase: (term: string, _g: KinGender) => `your ${term}`,
		/** How the person at a step relates to the next one: "child of", "mother of". */
		step: (move: StepMove, g: KinGender, typeSentence?: string): string => {
			switch (move) {
				case "up":
					return "child of";
				case "down":
					return gw(g, "father of", "mother of");
				case "sibling":
					return gw(g, "brother of", "sister of");
				case "spouse":
					return gw(g, "husband of", "wife of");
				default:
					return typeSentence ?? "related to";
			}
		},
		/** Noun for the far end of an "other" edge. */
		otherNoun: (typeName: string, farIsSource: boolean, bidirectional: boolean, g: KinGender, fallbackLabel: string): { nom: string; gen: string } => {
			const word = fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase();
			if (farIsSource || bidirectional) return { nom: word, gen: word };
			if (typeName === "IS_GODPARENT_OF" || /god(parent|mother|father)/.test(word)) return { nom: "godchild", gen: "godchild" };
			if (/god(child|son|daughter)/.test(word)) return { nom: "godparent", gen: "godparent" };
			if (typeName === "IS_STEPPARENT_OF") return { nom: gw(g, "stepson", "stepdaughter"), gen: "" };
			return { nom: word, gen: word };
		},
	},
};

export type Dict = typeof en;
