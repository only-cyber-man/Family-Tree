import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// Afrikaans (South Africa). Typed as Dict: a missing or mistyped key does not compile.
// Informal address ("jy/jou") and the everyday family register ("ma", "pa", "ouma",
// "skoonma"), as in friendly consumer apps.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
/** Afrikaans keeps "jaar" and "uur" singular after a numeral: "2 jaar", "3 uur". */
const jaar = (n: number) => `${n} jaar`;
const persone = (n: number) => `${n} ${form("af", n, "persoon", "persone")}`;
const oor = (n: number) => (n > 0 ? "oor-".repeat(n) : "");
const agter = (n: number) => (n > 0 ? "agter-".repeat(n) : "");

/** Nouns used in relationship chains; Afrikaans has no case, so gen = nom. */
function noun(w: KinWord): { nom: string; gen: string } {
	const f = w.gender === "female";
	const same = (s: string) => ({ nom: s, gen: s });
	switch (w.rel) {
		case "parent":
			return same(f ? "ma" : "pa");
		case "child":
			return same(f ? "dogter" : "seun");
		case "sibling":
			return same(f ? "suster" : "broer");
		case "spouse":
			return same(f ? "vrou" : "man");
		case "partner":
			return same("lewensmaat");
		default:
			return w.noun ?? same("familielid");
	}
}

export const af: Dict = {
	lang: "af",
	locale: "af-ZA",

	common: {
		cancel: "Kanselleer",
		done: "Klaar",
		save: "Stoor",
		saving: "Stoor…",
		close: "Maak toe",
		back: "Terug",
		change: "Verander",
		tryAgain: "Probeer weer",
		add: "Voeg by",
		create: "Skep",
		creating: "Skep…",
		edit: "Wysig",
		remove: "Verwyder",
		keep: "Hou",
		continue: "Gaan voort",
		undo: "Ontdoen",
		openSettings: "Maak Instellings oop",
		settings: "Instellings",
		signIn: "Meld aan",
		you: "Jy",
		loading: "Laai",
		familyTree: "Family Tree",
		owner: "Eienaar",
		sharedWithYou: "Met jou gedeel",
		male: "Manlik",
		female: "Vroulik",
		show: "Wys",
		hide: "Versteek",
		showPassword: "Wys wagwoord",
		hidePassword: "Versteek wagwoord",
		chooseDate: "Kies 'n datum",
		dateA11y: (label, value) => `${label}: ${value}. Verander`,
		closeDatePicker: "Maak datumkieser toe",
		year: "Jaar",
		yearHint: "Tik 'n jaar om die kieser daarheen te laat spring",
		yearExample: "bv. 1742",
		removeFilter: (label) => `Verwyder filter ${label}`,
		searchByName: "Soek op naam",
		noOneCalled: (q) => `Niemand met die naam “${q}” nie.`,
		noOneToChoose: "Nog niemand om te kies nie.",
		selected: "gekies",
		reminderScheduled: "Herinnering geskeduleer",
		noReminder: "Geen herinnering",
		range: (lo, hi) => `${lo} tot ${hi}`,
	},

	offline: {
		banner: "Jy is vanlyn. Jy sien die laaste kopie van hierdie stamboom.",
		short: "Jy is vanlyn.",
		write: "Jy is vanlyn — veranderinge kan nie gestoor word nie.",
	},

	save: {
		failedOffline: (what) => `Kon nie ${what} stoor nie: jy is vanlyn of die bediener is onbereikbaar. Niks is verlore nie; probeer weer.`,
		failed: (what, reason) => `Kon nie ${what} stoor nie. ${reason}`,
		noTree: "Geen stamboom is oop nie, so niks is gestoor nie. Kies 'n stamboom en probeer weer.",
		theChanges: "die veranderinge",
		thisPerson: "hierdie persoon",
		theRelationship: "die verwantskap",
		theTree: "die stamboom",
	},

	errors: {
		network: "Geen verbinding nie. Kontroleer jou internet en probeer weer.",
		generic: "Iets het skeefgeloop.",
		notSignedIn: "Jy is nie aangemeld nie.",
		passwordsDontMatch: "Wagwoorde stem nie ooreen nie.",
		sessionExpired: "Jou sessie het verval. Meld asseblief weer aan.",
		shareUnavailable: "Deel is nie op hierdie toestel beskikbaar nie.",
	},

	tabs: {
		home: "Tuis",
		tree: "Stamboom",
		add: "Voeg by",
		find: "Soek",
		dates: "Datums",
		settings: "Instellings",
		addPerson: "Voeg persoon by",
		findPerson: "Soek 'n persoon",
	},

	prefs: {
		language: "Taal",
		languageSystem: "Stelsel",
		chooseLanguage: "Kies 'n taal",
		appearance: "Voorkoms",
		theme: "Tema",
		system: "Stelsel",
		light: "Lig",
		dark: "Donker",
	},

	onboarding: {
		title1: "Jou familie, geteken as 'n grafiek.",
		body1: "Mense is kaartjies, verwantskappe is lyne, en generasies rangskik volgens geboortejaar. Privaat, en slegs op uitnodiging gedeel.",
		title2: "Mis nooit weer 'n verjaarsdag of herdenkingsdag nie.",
		body2: "'n Stil herinnering die dag vantevore. Alles bly op jou foon; niks word na ons gestuur nie.",
		page: (n, total) => `Bladsy ${n} van ${total}`,
		haveAccount: "Ek het reeds 'n rekening",
		turnOnReminders: "Skakel herinneringe aan",
		notNow: "Nie nou nie",
		previewTitle1: "Ouma Maria word môre 75",
		previewWhen1: "Môre",
		previewBody1: "'n Mylpaalverjaarsdag. Bel Maria?",
		previewTitle2: "† Stanisław Kowalski, 28 jaar",
		previewWhen2: "15 Okt.",
	},

	auth: {
		welcomeBack: "Welkom terug",
		signInSubtitle: "Meld aan met jou Family Tree-rekening.",
		usernameOrEmail: "Gebruikersnaam of e-pos",
		password: "Wagwoord",
		forgot: "Wagwoord vergeet?",
		newHere: "Nuut hier?",
		createAccount: "Skep 'n rekening",
		enterBoth: "Voer jou gebruikersnaam of e-pos en jou wagwoord in.",
		wrongCredentials: "Daardie gebruikersnaam of wagwoord is nie reg nie.",
		forgotHowTo: "Tik jou e-posadres in die eerste veld en tik dan weer op “Wagwoord vergeet?”.",
		resetTitle: "Herstel wagwoord",
		resetConfirm: (email) => `Stuur 'n herstelskakel na ${email}?`,
		send: "Stuur",
		checkInbox: "Kyk in jou inmandjie",
		checkInboxBody: "As daardie e-pos 'n rekening het, is 'n herstelskakel op pad.",
		couldntSend: "Kon nie stuur nie",
		signInAgain: "Meld asseblief weer aan",
		sessionEnded: "Jou sessie het geëindig. Niks is verlore nie; die stamboom is nog hier.",
		passwordFor: (who) => `Wagwoord vir ${who}`,
		differentAccount: "Gebruik 'n ander rekening",
		startTree: "Begin jou stamboom",
		freePrivate: "Gratis, privaat, geen advertensies nie.",
		username: "Gebruikersnaam",
		displayName: "Vertoonnaam (opsioneel)",
		yourName: "Jou naam",
		email: "E-pos",
		confirmPassword: "Bevestig wagwoord",
		step1: "Wagwoord en bevestiging kom volgende. Stap 1 van 2.",
		step2: (email) => `Ons stuur 'n verifikasie-e-pos na ${email}. Stap 2 van 2.`,
		usernameRule: "Minstens 3 letters of syfers, geen spasies nie.",
		emailInvalid: "Dit lyk nie na 'n e-posadres nie.",
		passwordRule: "Gebruik minstens 8 karakters.",
		createAccountButton: "Skep rekening",
		agreePrefix: "Deur 'n rekening te skep, aanvaar jy die ",
		privacyPolicy: "privaatheidsbeleid",
		agreeSuffix: ".",
	},

	home: {
		offline: "Jy is vanlyn",
		couldntLoadTrees: "Kon nie jou stambome laai nie",
		connectFirstTime: "Koppel aan die internet om jou stambome die eerste keer te sien.",
		noTrees: "Nog geen stambome nie",
		noTreesBody: "Begin met jouself en jou ouers. Uitnodigings van familielede verskyn vanself hier.",
		createFirst: "Skep jou eerste stamboom",
		treeUnavailable: "Hierdie stamboom is nie beskikbaar nie",
		couldntOpen: "Kon nie hierdie stamboom oopmaak nie",
		treeUnavailableBody: "Dit is dalk uitgevee, of die eienaar deel dit nie meer met jou nie.",
		noCopy: "Daar is nog geen kopie van hierdie stamboom op hierdie foon nie. Koppel en probeer weer.",
		chooseTree: "Kies 'n stamboom",
		switchTree: "Wissel stamboom",
		lookingFor: "Wie soek jy?",
		upcoming: "Binnekort",
		seeAll: "Sien alles",
		noUpcoming: "Geen komende datums nie",
		noUpcomingEmpty: "Verjaarsdae en herdenkingsdae verskyn hier sodra daar mense in die stamboom is.",
		noUpcomingYear: "Niks in die volgende twaalf maande nie.",
		noOne: "Nog niemand hier nie",
		addYourself: "Voeg eers jouself by. Almal anders word gekoppel aan iemand wat reeds in die stamboom is.",
		ownerAddedNoOne: "Die eienaar het nog niemand bygevoeg nie.",
		addFirst: "Voeg die eerste persoon by",
		quick: "Kortpaaie",
		addPerson: "Voeg persoon by",
		linkTwo: "Koppel twee mense",
		aboutTree: "Hierdie stamboom",
		detailHint: "Tik op 'n datum links om die persoon hier te sien.",
	},

	tree: {
		loading: "Laai die stamboom…",
		removeTitle: (name) => `Verwyder ${name}?`,
		removeBody: "Hul verwantskappe word ook verwyder. Dit kan nie ontdoen word nie.",
		removed: (name) => `${name} verwyder`,
		addRelationship: "Voeg verwantskap by",
		focusedOn: (name) => `Gefokus op ${name}`,
		parents: "ouers",
		partner: "lewensmaat",
		partners: "lewensmaats",
		children: "kinders",
		exitFocus: "Verlaat fokus",
		search: "Soek",
		filters: "Filters",
		filtersActive: (n) => `Filters, ${n} aktief`,
		goUpTo: (name) => `Gaan op na ${name}`,
		resetView: "Herstel aansig",
		fitAll: "Pas die hele stamboom in",
		allFiltered: "Almal is uitgefilter",
		clearFilters: "Vee filters uit",
		canvasA11y: (n) => `Stamboom met ${persone(n)}. Gebruik soek om iemand te vind.`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "Legende",
		legendBio: "Bio",
		legendMarried: "Getroud",
		legendLivesWith: "Woon saam",
		legendInLaw: "Aangetroud",
		legendChurch: "Kerklik",
		legendOther: "Ander",
		youPill: "Jy",
		legendYou: "Jy",
		panelHint: "Tik op 'n persoon om hul besonderhede hier te sien.",
		panelTitle: "Besonderhede",
	},

	person: {
		gone: "Hierdie persoon is nie meer in die stamboom nie.",
		ageAlive: (g, age) => `${g} · ${jaar(age)} oud`,
		ageDeceased: (g, age, wouldBe) => `${g} · ${age} by afsterwe${wouldBe ? ` · sou nou ${wouldBe} wees` : ""}`,
		you: "jy",
		focus: "Fokus",
		focusOnTree: "Fokus op stamboom",
		howRelated: "Hoe is ons verwant?",
		turns: (n) => `Word ${n}`,
		remembranceDay: "Herdenkingsdag",
		remindMe: "Herinner my",
		noRelationshipsOwner: "Nog geen verwantskappe nie. Voeg een by om die persoon aan die stamboom te koppel.",
		noRelationships: "Nog geen verwantskappe nie.",
		dragUp: "Sleep op vir alle verwantskappe",
		removedFromTree: (name) => `${name} uit die stamboom verwyder`,
		couldntRemove: (name, reason) => `Kon nie ${name} verwyder nie. ${reason}`,
		open: "Maak oop",
		removeRelationship: "Verwyder verwantskap",
		relationshipRemoved: "Verwantskap verwyder",
		sharedBy: (email) => `Met jou gedeel${email ? ` deur ${email}` : ""}. Net die eienaar kan wysig.`,
		removeA11y: (name) => `Verwyder ${name}`,
		thisIsYou: "Dit is jy",
		linkedTo: (email) => `Gekoppel aan ${email}`,
		linkedToAccount: "Gekoppel aan 'n rekening",
		note: "Nota",
	},

	path: {
		whichIsYou: "Watter een is jy?",
		needMe: (first) =>
			`Om te sê hoe ${first} aan jou verwant is, moet die app weet watter persoon in hierdie stamboom jy is. Jy kies een keer; dit word op hierdie foon bewaar.`,
		chooseWho: "Kies wie jy is",
		notConnected: "Nog nie aan jou gekoppel nie",
		notConnectedBody: (name) => `Daar is geen ketting van verwantskappe tussen jou en ${name} in hierdie stamboom nie. Om 'n verwantskap by te voeg sal julle koppel.`,
		open: (first) => `Maak ${first} oop`,
		stepsThrough: (steps, people) => `${steps} ${form("af", steps, "stap", "stappe")} deur ${persone(people)}.`,
		familyOnly: "Kortste pad deur slegs biologiese en huweliksbande.",
		anyLinks: "Familiebande koppel julle nie, so ander aangetekende bande word gebruik.",
		youName: (name) => `Jy · ${name}`,
		showOnTree: "Wys op stamboom",
		meNote: (name) => `“Dit is ek” (${name}) word net op hierdie foon gestoor, want die gedeelde stamboom het nog nie 'n veld daarvoor nie. Verander dit in Instellings.`,
		notConnectedShort: "nog nie aan jou gekoppel nie",
	},

	search: {
		placeholder: "Wie soek jy?",
		a11y: "Soek mense",
		chooseWho: "Kies wie jy is",
		chooseWhoBody: "Sê vir die app watter persoon jy is om te sien hoe almal aan jou verwant is. Die keuse bly op hierdie foon.",
		noOne: (q) => `Niemand met die naam “${q}” in hierdie stamboom nie.`,
	},

	addPerson: {
		add: "Voeg persoon by",
		edit: "Wysig persoon",
		viewerOnly: "Hierdie stamboom is met jou gedeel om na te kyk. Net die eienaar kan mense byvoeg.",
		chooseTreeFirst: "Kies of skep eers 'n stamboom.",
		gone: "Hierdie persoon is nie meer in die stamboom nie.",
		nameRequired: "Naam is verpligtend.",
		chooseGender: "Kies 'n geslag.",
		birthRequired: "Geboortedatum is verpligtend.",
		deathRequired: "Voeg die sterfdatum by, of skakel dit af.",
		deathBeforeBirth: "Die sterfdatum is voor die geboortedatum.",
		linkIncomplete: "Kies sowel die verwantskap as die persoon, of vee die koppeling uit.",
		saved: (first) => `${first} gestoor`,
		linkFailed: (first, reason) => `${first} is bygevoeg, maar die koppeling kon nie gestoor word nie. ${reason}`,
		added: (first) => `${first} by die stamboom gevoeg`,
		changePhoto: "Verander foto",
		addPhoto: "Voeg 'n foto by",
		cameraOff: "Kameratoegang is af",
		cameraOffBody: "Jy kan steeds 'n foto uit jou galery kies, of die kamera in Instellings toelaat.",
		useGallery: "Gebruik galery",
		takePhoto: "Neem foto",
		fromGallery: "Kies uit galery",
		fullName: "Volle naam",
		namePlaceholder: "bv. Maria Kowalska",
		gender: "Geslag",
		birthDate: "Geboortedatum",
		passedAway: "Is oorlede",
		passedAwayHint: "Voeg 'n sterfdatum en 'n herdenkingsdag by",
		deathDate: "Sterfdatum",
		linkTo: "Koppel aan iemand",
		linkOptional: "opsioneel, spaar 'n stap",
		linkExample: (name) => `bv. ma van ${name}`,
		newPerson: "Nuwe persoon",
		parentNote: (child) => `Die nuwe persoon is die ouer; ${child} is die kind.`,
		theChosen: "die gekose persoon",
		dontLink: "Moenie nou koppel nie",
		note: "Nota",
		notePlaceholder: "Enigiets wat die moeite werd is om te onthou",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Gekoppelde rekening",
		linkedHint: "Watter Family Tree-rekening is hierdie persoon? Net rekeninge wat hierdie stamboom kan sien, word gelys.",
		linkedNone: "Geen",
		linkedMe: (email) => (email ? `Ek (${email})` : "Ek"),
		linkedConflict: (name) => `${name} is reeds aan hierdie rekening gekoppel.`,
		loadingAccounts: "Laai rekeninge…",
	},

	addRel: {
		title: "Voeg verwantskap by",
		viewerOnly: "Net die eienaar van hierdie stamboom kan verwantskappe byvoeg.",
		chooseBoth: "Kies albei mense en hoe hulle verwant is.",
		different: "Kies twee verskillende mense.",
		duplicate: "Hierdie verwantskap is reeds in die stamboom.",
		added: "Verwantskap bygevoeg",
		isRelatedTo: "is verwant aan",
		from: "Van",
		to: "Na",
		relation: "Verwantskap",
		changeFrom: "Verander van wie die verwantskap uitgaan",
		more: "Meer…",
		fewer: "Minder",
		// "Jan is die pa van Tomasz.": the verb phrase ends in a preposition, so the name follows directly.
		sentence: (a, verb, b) => `${a} ${verb} ${b}.`,
		sentenceJoin: " ",
	},

	filters: {
		title: "Filters",
		clearAll: "Vee alles uit",
		show: (shown, total) => `Wys ${shown} van ${persone(total)}`,
		hideTypes: "Versteek verwantskaptipes",
		hidden: "versteek",
		shown: "gewys",
		age: "Ouderdom",
		ageRange: "Ouderdomsreeks",
		gender: "Geslag",
		everyone: "Almal",
		men: "Mans",
		women: "Vroue",
		excludeByName: "Sluit uit op naam",
		excludeHint: "Skei verskeie name met kommas.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label) => `Versteek: ${label}`,
		chipAge: (lo, hi) => `Ouderdom ${lo}–${hi}`,
		chipMen: "Net mans",
		chipWomen: "Net vroue",
		chipNot: (names) => `Nie: ${names}`,
		chipOnly: (names) => `Net: ${names}`,
		includeByName: "Wys net name wat bevat",
		includeHint: "Enige van verskeie name, geskei met kommas.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Jou stambome",
		giveName: "Gee die stamboom eers 'n naam.",
		created: (name) => `“${name}” geskep`,
		nameLabel: "Naam van die nuwe stamboom",
		namePlaceholder: "My stamboom",
		newTree: "Nuwe stamboom",
		people: (n) => persone(n),
		updated: (rel) => `bygewerk ${rel}`,
		viewers: (n) => `${n} ${form("af", n, "kyker", "kykers")}`,
		onlyYou: "Net jy",
		by: (email) => `deur ${email}`,
		active: "Aktief ✓",
	},

	invited: {
		title: "Wie kan hierdie stamboom sien",
		subtitle: "Genooide mense kan kyk, nie wysig nie.",
		thatsYou: "Dis jy; jy besit hierdie stamboom reeds.",
		already: "Hulle kan hierdie stamboom reeds sien.",
		canSee: (email) => `${email} kan nou hierdie stamboom sien`,
		noAccount: "Geen Family Tree-rekening gebruik daardie e-pos nie. Vra hulle om eers te registreer en nooi hulle dan.",
		thisPerson: "hierdie persoon",
		stopTitle: (who) => `Hou op deel met ${who}?`,
		stopBody: "Hulle sal hierdie stamboom nie meer sien nie.",
		revoke: "Herroep",
		revoked: (who) => `${who} kan hierdie stamboom nie meer sien nie`,
		emailPlaceholder: "naam@voorbeeld.com",
		emailA11y: "E-pos van die persoon om te nooi",
		invite: "Nooi",
		note: "Hulle het reeds 'n Family Tree-rekening met hierdie e-pos nodig. Niks word ge-e-pos nie; die stamboom verskyn eenvoudig in hul lys.",
		youSuffix: (name) => `${name} (jy)`,
		creator: "Skepper",
		viewer: "Kyker",
		viewerYou: "Kyker · jy",
		unknown: "Onbekende rekening",
		revokeA11y: (email) => `Herroep ${email}`,
		onlyYou: "Net jy kan hierdie stamboom sien.",
	},

	dates: {
		title: "Datums",
		exportIcs: "Voer .ics uit",
		all: "Alles",
		birthdays: "Verjaarsdae",
		remembrance: "Herdenkings",
		quietReminder: "Kry 'n stil herinnering die dag vantevore",
		turnOn: "Skakel herinneringe aan",
		localOnly: "Herinneringe word op hierdie foon geskeduleer uit die datums in die stamboom. Niks word na 'n bediener gestuur nie.",
		detailHint: "Tik op 'n datum om die persoon hier te sien.",
		none: "Geen komende datums nie",
		noneBody: "Verjaarsdae en herdenkingsdae verskyn hier sodra daar mense in die stamboom is.",
		footnote:
			"Klokkie = plaaslike herinnering geskeduleer vir 9:00 die dag vantevore (herdenkingsdae: op die dag self). Mylpaalouderdomme (18, 50, 55, 60…) kan 'n tweede herinnering 'n week vooraf kry. Die uitvoer sluit die mense in wat tans op die stamboom sigbaar is.",
	},

	settings: {
		title: "Instellings",
		signOutTitle: "Meld af?",
		signOutBody: "Herinneringe word verwyder en die kopieë van jou stambome word van hierdie foon uitgevee.",
		signOut: "Meld af",
		account: "Rekening",
		accountBody: "Wagwoordveranderinge word op die webwerf gedoen.",
		openWebsite: "Maak webwerf oop",
		reminders: "Herinneringe",
		birthdays: "Verjaarsdae",
		dayBefore: "Dag vantevore, 9:00",
		remembranceDays: "Herdenkingsdae",
		onTheDay: "Op die dag, 9:00",
		roundEarly: "Mylpaalverjaarsdae 'n week vroeër",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Geskeduleer op hierdie foon vir die aktiewe stamboom. Niks word na 'n bediener gestuur nie.",
		whoCanSee: "Wie kan hierdie stamboom sien",
		viewers: (n) => `${n} ${form("af", n, "kyker", "kykers")}`,
		onlyYou: "Net jy",
		preparing: "Berei voor…",
		exportIcs: "Voer uit na kalender (.ics)",
		thisIsMe: "Dit is ek",
		notSet: "Nie gestel nie",
		switchTree: "Wissel stamboom",
		about: "Oor die app",
		privacy: "Privaatheidsbeleid",
		deleteAccount: "Vee rekening uit",
		deleteTitle: "Vee jou rekening uit?",
		deleteBody:
			"Dit vee jou rekening uit en elke stamboom wat jy geskep het, met al sy mense, foto's en verwantskappe. Mense wat jy genooi het, verloor toegang. Dit kan nie ontdoen word nie.",
		footer: (version) => `Family Tree ${version} · Geskep deur tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "Geborg",
		tag: "Advertensie",
		open: (title) => `Maak ${title} oop`,
	},

	deleteAccount: {
		title: "Vee rekening uit",
		typeToConfirm: (word) => `Tik ${word} om te bevestig`,
		typeToConfirmError: (word) => `Tik ${word} om te bevestig.`,
		offline: "Jy is vanlyn — jou rekening kan nie nou uitgevee word nie.",
		permanently: "Dit vee permanent uit:",
		yourAccount: (email) => `• jou rekening${email ? ` (${email})` : ""}`,
		everyTree: "• elke stamboom wat jy geskep het, met al sy mense, foto's en verwantskappe",
		consequences: "Mense wat jy genooi het, verloor toegang tot daardie stambome. Stambome wat ander met jou gedeel het, word nie geraak nie. Dit kan nie ontdoen word nie.",
		notFully: (reason) => `Jou rekening is nie heeltemal uitgevee nie. ${reason}`,
		askUs: (email) => `Jy kan weer probeer, of ons by ${email} vra om dit vir jou uit te vee.`,
		emailRequest: "E-pos 'n uitveeversoek",
		deleteMine: "Vee my rekening uit",
		deleting: "Vee uit…",
		keep: "Hou my rekening",
		mailSubject: "Vee my Family Tree-rekening uit",
		mailBody: (email) => `Vee asseblief my Family Tree-rekening${email ? ` (${email})` : ""} en alle stambome wat ek geskep het uit.`,
	},

	pickMe: {
		title: "Watter een is jy?",
		note: "Gebruik vir “Hoe is ons verwant”. Dit word net op hierdie foon gestoor en niemand anders sien dit nie.",
		forget: "Vergeet my keuse",
		serverLinked: (name) => `${name} is in hierdie stamboom aan jou rekening gekoppel, so “Dit is ek” kom op elke toestel van die stamboom af.`,
		saveTitle: "Stoor op die stamboom?",
		saveBody: (name) => `Koppel ${name} aan jou rekening in hierdie stamboom? Dan werk “Dit is ek” op elke toestel en op die webwerf.`,
		saveLink: "Stoor koppeling",
		phoneOnly: "Net op hierdie foon",
		linkSaved: (name) => `${name} is nou aan jou rekening gekoppel`,
	},

	notFound: {
		title: "Niks hier nie",
		body: "Daardie skakel wys na 'n bladsy wat die app nie het nie.",
		home: "Gaan tuis",
	},

	toastsReminders: {
		on: "Herinneringe is aan. Hulle bly op hierdie foon.",
		off: "Kennisgewings is af vir Family Tree.",
		settings: "Instellings",
		channel: "Verjaarsdae en herdenkingsdae",
	},

	dateNames: {
		monthsNom: ["Januarie", "Februarie", "Maart", "April", "Mei", "Junie", "Julie", "Augustus", "September", "Oktober", "November", "Desember"],
		monthsInDate: ["Januarie", "Februarie", "Maart", "April", "Mei", "Junie", "Julie", "Augustus", "September", "Oktober", "November", "Desember"],
		monthsShort: ["Jan.", "Feb.", "Mrt.", "Apr.", "Mei", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Des."],
		weekdaysShort: ["So.", "Ma.", "Di.", "Wo.", "Do.", "Vr.", "Sa."],
		/** "4 Februarie 1950" */
		dayMonthYear: (day, month, year) => `${day} ${month} ${year}`,
		/** "15 Okt." */
		dayMonth: (day, month) => `${day} ${month}`,
	},

	time: {
		justNow: "nou net",
		minutesAgo: (n) => `${n} ${form("af", n, "minuut", "minute")} gelede`,
		hoursAgo: (n) => `${n} uur gelede`,
		yesterday: "gister",
		daysAgo: (n) => `${n} dae gelede`,
		weeksAgo: (n) => `${n} ${form("af", n, "week", "weke")} gelede`,
		monthsAgo: (n) => `${n} ${form("af", n, "maand", "maande")} gelede`,
		yearsAgo: (n) => `${jaar(n)} gelede`,
		today: "vandag",
		tomorrow: "môre",
		inDays: (n) => `oor ${n} dae`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} word ${age}`,
		remembranceTitle: (first, n) => `† ${first}, ${jaar(n)}`,
		birthday: "Verjaarsdag",
		remembrance: "Herdenking",
		roundAge: "mylpaal",
		reminderEve: (first, age) => `${first} word môre ${age}`,
		reminderEveRoundBody: (first) => `'n Mylpaalverjaarsdag. Bel ${first}?`,
		reminderWeek: (first, age) => `${first} word oor 'n week ${age}`,
		reminderWeekBody: (dayMonth) => `'n Mylpaalverjaarsdag op ${dayMonth}.`,
		reminderRemembrance: (name, n) => `† ${name}, ${jaar(n)}`,
		reminderRemembranceBody: (dayMonth) => `Herdenkingsdag · ${dayMonth}`,
	},

	ics: {
		calName: "Verjaarsdae",
		birthdayTitle: (name) => `${name} se verjaarsdag`,
		birthdayDesc: (name) => `${name} se verjaarsdag val op hierdie dag`,
		deathTitle: (name) => `${name} se sterfdag`,
		deathDesc: (name) => `Die herdenking van ${name} se afsterwe val op hierdie dag`,
		fileSuffix: "datums",
		shareTitle: (tree) => `${tree} – datums`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biologies", "IN-LAW": "Aangetroud", CHURCH: "Kerklik", IRRELEVANT: "Ander" },
		types: {
			IS_FATHER_OF: { label: "Pa van", sentence: () => "is die pa van" },
			IS_MOTHER_OF: { label: "Ma van", sentence: () => "is die ma van" },
			IS_MARRIED_TO: { label: "Getroud met", sentence: () => "is getroud met" },
			LIVES_WITH: { label: "Woon saam met", sentence: () => "woon saam met" },
			IS_PARTNER_OF: { label: "Lewensmaat van", sentence: () => "is die lewensmaat van" },
			IS_ENGAGED_TO: { label: "Verloof aan", sentence: () => "is verloof aan" },
			IS_GODPARENT_OF: {
				label: "Peetouer van",
				sentence: (g) => gw(g, "is die peetpa van", "is die peetma van"),
				role: (g) => gw(g, "Peetpa", "Peetma"),
				inverseRole: (g) => gw(g, "Peetseun", "Peetdogter"),
			},
			IS_FRIEND_OF: {
				label: "Vriend van",
				sentence: (g) => gw(g, "is 'n vriend van", "is 'n vriendin van"),
				role: (g) => gw(g, "Vriend", "Vriendin"),
				inverseRole: (g) => gw(g, "Vriend", "Vriendin"),
			},
			IS_STEPPARENT_OF: {
				label: "Stiefouer van",
				sentence: (g) => gw(g, "is die stiefpa van", "is die stiefma van"),
				role: (g) => gw(g, "Stiefpa", "Stiefma"),
				inverseRole: (g) => gw(g, "Stiefseun", "Stiefdogter"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Ma",
			father: "Pa",
			child: "Kind",
			sibling: (g) => gw(g, "Broer", "Suster"),
			isSourceOf: (first, labelLower) => `${first} is ${labelLower}`,
		},
	},

	kin: {
		you: "jy",
		youTitle: "Jy",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "man", "vrou");
					case "partner":
						return "lewensmaat";
					case "parentInLaw":
						return gw(g, "skoonpa", "skoonma");
					case "siblingInLaw":
						return gw(g, "swaer", "skoonsuster");
					case "childInLaw":
						return gw(g, "skoonseun", "skoondogter");
					case "stepParent":
						return gw(g, "stiefpa", "stiefma");
					case "stepChild":
						return gw(g, "stiefseun", "stiefdogter");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) {
				if (u === 1) return gw(g, "pa", "ma");
				if (u === 2) return gw(g, "oupa", "ouma");
				// oupagrootjie, oor-oupagrootjie, oor-oor-oupagrootjie…
				return oor(u - 3) + gw(g, "oupagrootjie", "oumagrootjie");
			}
			if (u === 0) {
				if (d === 1) return gw(g, "seun", "dogter");
				if (d === 2) return gw(g, "kleinseun", "kleindogter");
				// agterkleinseun, agter-agterkleinseun…
				return agter(d - 3) + gw(g, "agterkleinseun", "agterkleindogter");
			}
			if (u === 1 && d === 1) return gw(g, "broer", "suster");
			if (u === 2 && d === 1) return gw(g, "oom", "tante");
			if (u === 3 && d === 1) return gw(g, "grootoom", "groottante");
			if (u === 2 && d === 2) return gw(g, "neef", "niggie");
			// "Neef"/"niggie" also mean nephew/niece, so those (and grand-nephews, more distant
			// uncles, second cousins and cousins "removed") are said with the "se" chain instead:
			// "jou broer se seun", "jou ma se niggie".
			return null;
		},
		word: (w: KinWord) => noun(w).nom,
		/** Afrikaans possessive chains run forward with "se": "jou ma se broer se dogter". */
		chain: (words: KinWord[]) => (words.length ? "jou " + words.map((w) => noun(w).nom).join(" se ") : "jy"),
		phrase: (term) => `jou ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "seun van", "dogter van");
				case "down":
					return gw(g, "pa van", "ma van");
				case "sibling":
					return gw(g, "broer van", "suster van");
				case "spouse":
					return gw(g, "man van", "vrou van");
				default:
					return typeSentence ?? "verwant aan";
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			const same = (s: string) => ({ nom: s, gen: s });
			if (typeName === "IS_GODPARENT_OF") return same(farIsSource ? (f ? "peetma" : "peetpa") : f ? "peetdogter" : "peetseun");
			if (typeName === "IS_FRIEND_OF") return same(f ? "vriendin" : "vriend");
			if (typeName === "IS_STEPPARENT_OF") return same(farIsSource ? (f ? "stiefma" : "stiefpa") : f ? "stiefdogter" : "stiefseun");
			void bidirectional;
			// Unknown type: its (English) name as it is.
			return same(fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase());
		},
	},
};
