import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// Afrikaans strings. Typed as Dict, so TypeScript fails when a key is missing.
// Informal address ("jy/jou") and the everyday family register ("pa", "ma", "skoonma").

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

const people = (count: number) => simple("af", count, "persoon", "persone");
const relationships = (count: number) => simple("af", count, "verwantskap", "verwantskappe");
const themes: Record<ThemePref, string> = { light: "Lig", dark: "Donker", system: "Stelsel" };

/** Relationship types from ft_relationships_names that have an Afrikaans phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Pa van",
		edge: () => "pa",
		sentence: (from, to) => `${from} is die pa van ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "pa" : g(other, "seun", "dogter")),
	},
	IS_MOTHER_OF: {
		type: "Ma van",
		edge: () => "ma",
		sentence: (from, to) => `${from} is die ma van ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "ma" : g(other, "seun", "dogter")),
	},
	IS_MARRIED_TO: {
		type: "Getroud met",
		edge: () => "getroud",
		sentence: (from, to) => `${from} is getroud met ${to}`,
		role: (_, other) => g(other, "man", "vrou"),
	},
	LIVES_WITH: {
		type: "Woon saam met",
		edge: () => "woon saam",
		sentence: (from, to) => `${from} woon saam met ${to}`,
		role: () => "woon saam",
	},
	IS_PARTNER_OF: {
		type: "Lewensmaat van",
		edge: () => "lewensmaats",
		sentence: (from, to) => `${from} is die lewensmaat van ${to}`,
		role: () => "lewensmaat",
	},
	IS_ENGAGED_TO: {
		type: "Verloof aan",
		edge: () => "verloof",
		sentence: (from, to) => `${from} is verloof aan ${to}`,
		role: () => "verloofde",
	},
	IS_GODPARENT_OF: {
		type: "Peetouer van",
		edge: (from) => (from ? g(from, "peetpa", "peetma") : "peetouer"),
		sentence: (from, to, gender) =>
			`${from} is die ${gender ? g(gender, "peetpa", "peetma") : "peetouer"} van ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "peetpa", "peetma") : g(other, "peetseun", "peetdogter"),
	},
	IS_FRIEND_OF: {
		type: "Vriend van",
		edge: () => "vriende",
		sentence: (from, to) => `${from} en ${to} is vriende`,
		role: (_, other) => g(other, "vriend", "vriendin"),
	},
	IS_STEPPARENT_OF: {
		type: "Stiefouer van",
		edge: (from) => (from ? g(from, "stiefpa", "stiefma") : "stiefouer"),
		sentence: (from, to, gender) =>
			`${from} is die ${gender ? g(gender, "stiefpa", "stiefma") : "stiefouer"} van ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "stiefpa", "stiefma") : g(other, "stiefseun", "stiefdogter"),
	},
};

export const af: Dict = {
	locale: "af" as Locale,
	dateLocale: "af-ZA",

	common: {
		appName: "Family Tree",
		createdBy: "Geskep deur tomek7667",
		cancel: "Kanselleer",
		save: "Stoor",
		done: "Klaar",
		close: "Maak toe",
		dismiss: "Maak kennisgewing toe",
		undo: "Ontdoen",
		edit: "Wysig",
		remove: "Verwyder",
		optional: "opsioneel",
		loading: "Laai…",
		owner: "Eienaar",
		sharedWithYou: "Met jou gedeel",
		viewerReadOnly: "Kyker · leesalleen",
		creator: "Skepper",
		someone: "Iemand",
		someoneLower: "iemand",
		unknownAccount: "onbekende rekening",
		you: "jy",
		withYou: (name) => `${name} (jy)`,
		male: "Manlik",
		female: "Vroulik",
		justNow: "nou net",
		people,
		relationships,
		mainNav: "Hoof",
		clearAll: "Vee alles uit",
		addRelationship: "Voeg verwantskap by",
		removeRelationship: "Verwyder verwantskap",
		manageInvited: "Bestuur genooides",
		emailInvalid: "Dit lyk nie na 'n volledige e-posadres nie.",
	},

	prefs: {
		group: "Vertoonvoorkeure",
		language: "Taal",
		theme: "Tema",
		themes,
		themeCycle: (current, next) =>
			`Tema: ${themes[current].toLowerCase()}. Skakel oor na ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"'n Privaat stamboom, geteken as 'n grafiek. Voeg die mense by wat jy ken, koppel hoe hulle verwant is, en sien die generasies volgens geboortejaar rangskik.",
		signIn: "Meld aan",
		signUp: "Registreer",
		account: "Rekening",
		trees: "Jou stambome",
		tree: "Stamboom",
		privacy: "Privaatheidsbeleid",
		privacyDescription: "Wat Family Tree stoor, waarom, en hoe om dit uit te vee.",
		deleteAccount: "Vee jou rekening uit",
		deleteAccountDescription: "Hoe om jou Family Tree-rekening en -data uit te vee.",
	},

	legal: {
		privacy: "Privaatheid",
		deleteAccount: "Vee rekening uit",
		signIn: "Meld aan",
		privacyTitle: "Privaatheidsbeleid",
		privacyEffective: "Van krag vanaf 25 September 2026",
		deleteTitle: "Vee jou rekening uit",
		deleteAppliesTo:
			"Geld vir die Family Tree-webwerf en die Family Tree-app vir Android en iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Vee my Family Tree-rekening uit",
		deleteMailBody: (email) =>
			`Vee asseblief my Family Tree-rekening${email ? ` (${email})` : ""} en alle stambome wat ek geskep het uit.`,
	},

	errorPage: {
		title: "Iets het skeefgeloop",
		home: "Gaan na die hoofblad",
	},

	landing: {
		nav: {
			features: "Kenmerke",
			calendar: "Kalender",
			mobile: "Mobiele app",
			how: "Hoe dit werk",
			logIn: "Meld aan",
			signUp: "Registreer",
			openMenu: "Maak kieslys oop",
			closeMenu: "Maak kieslys toe",
		},
		deleted: "Jou rekening en jou stambome is uitgevee.",
		eyebrow: "'n Privaat stamboom, geteken as 'n grafiek",
		title: "Elke familie is 'n grafiek. Teken joune.",
		lead:
			"Voeg die mense by wat jy ken, koppel hoe hulle verwant is, en kyk hoe die generasies volgens geboortejaar rangskik. By verstek privaat, en net gedeel met die familielede wat jy nooi.",
		cta: "Begin jou stamboom, gratis",
		logIn: "Meld aan",
		fine: "Geen advertensies, geen publieke profiele nie.",
		treeEyebrow: "Die stamboom",
		treeTitle: "Blokkies en lyne, nie vorms en tabelle nie.",
		treeBody:
			"Jy bou die stamboom soos jy dit agterop 'n koevert sou skets: 'n kaartjie vir elke persoon, 'n lyn vir elke verwantskap. Sleep, zoem, en klik op enigiemand om te sien wie hulle is.",
		decades: ["1920's", "1940's", "1970's", "2000's"],
		timelineTitle: "'n Tydlyn van generasies",
		timelineBody:
			"Mense sit op 'n vertikale as volgens geboortejaar. Grootouers bo, kleinkinders onder, en elke twintig jaar 'n nuwe band. Jy wonder nooit wie eerste gekom het nie.",
		lines: {
			biological: "Biologies",
			married: "Getroud",
			livesWith: "Woon saam",
			church: "Kerklik",
			other: "Ander",
		},
		kindsTitle: "Vier soorte familie",
		kindsBody:
			"Bloed, huwelik, peetouers, en die buurman wat almal oom noem. Elke groep het sy eie lyn, en 'n huwelik is die swaarste streep op die bladsy terwyl “woon saam” die ligste is, sodat die stamboom met een oogopslag lees en steeds die hele storie vertel.",
		chips: ["Ouderdom 40–90", "Versteek: Aangetroud", "Net vroue", "Nie: Nowak"],
		filtersTitle: "Filters wat die geraas uitsny",
		filtersBody:
			"Versteek 'n verwantskaptipe, beperk tot 'n ouderdomsreeks, wys een kant van die familie. Wat op die skerm oorbly, is wat uitgevoer word.",
		calendarEyebrow: "Kalenderuitvoer",
		calendarTitle: "Elke verjaarsdag. Elke herdenkingsdag. In die kalender wat jy reeds gebruik.",
		calendarBody:
			"Een klik verander die sigbare deel van jou stamboom in 'n .ics-lêer: 'n jaarlikse verjaarsdag vir elkeen wat leef, en 'n jaarlikse herdenking vir elkeen wat oorlede is. Voer dit een keer in Google Kalender, Apple Kalender of Outlook in, en dit herhaal vir altyd.",
		pills: ["Verjaarsdae, jaarliks", "Herdenkingsdae", "Volg jou filters"],
		calendarMonth: "Oktober",
		calendarFile: "kowalski-familie.ics",
		calendarRows: [
			{ dow: "Sa.", title: "Maria Kowalska se verjaarsdag", meta: "Verjaarsdag · herhaal jaarliks" },
			{ dow: "Do.", title: "† Stanisław Kowalski, herdenking", meta: "Herdenking · herhaal jaarliks" },
			{ dow: "Wo.", title: "Zofia Nowak se verjaarsdag", meta: "Verjaarsdag · herhaal jaarliks" },
		],
		privateEyebrow: "By verstek privaat",
		privateTitle: "Joune, en wie jy ook al nooi.",
		privateBody:
			"Daar is geen publieke stambome en geen soektog oor families heen nie. Jy skep 'n stamboom, jy nooi familielede per e-pos, hulle kan kyk maar nie verander nie. Verander van plan en herroep toegang met een klik.",
		privateYou: "tomek (jy)",
		privateCreator: "Skepper · kan alles wysig",
		privateOwner: "Eienaar",
		privateInvited: "Genooi · leesalleen",
		privateRevoke: "Herroep",
		privateInvite: "Nooi per e-pos…",
		mobileEyebrow: "iPhone en Android",
		mobileTitle: "Die stamboom in jou sak, vir die oomblikke wanneer jy dit nodig het.",
		mobileBody:
			"By 'n troue en kan jy nie 'n gesig plaas nie? Soek 'n naam en sien hoe julle verwant is. Die app hou ook 'n lys van komende verjaarsdae en herdenkingsdae, met 'n herinnering die dag vantevore, en laat jou 'n nuwe familielid met 'n foto in 'n paar tikke byvoeg.",
		appStoreSmall: "Binnekort op die",
		playStoreSmall: "BINNEKORT OP",
		phoneUpcoming: "Binnekort",
		phoneRows: [
			{ t: "Maria word 75", m: "Sa. 3 Okt. · oor 8 dae" },
			{ t: "† Stanisław, 28 jaar", m: "Do. 15 Okt." },
			{ t: "Zofia word 21", m: "Wo. 28 Okt." },
		],
		phoneRelation: "1976 · 50 · jou ma se niggie",
		howTitle: "Hoe dit werk",
		steps: [
			{
				title: "Begin met jouself",
				body: "Skep 'n stamboom, voeg die eerste persoon by: 'n naam, 'n geboortedatum, en 'n foto as jy een het.",
			},
			{
				title: "Koppel die mense wat jy ken",
				body: "Ouers, lewensmaats, peetouers. Kies twee mense en 'n verwantskap, en die lyn teken homself in die regte generasie in.",
			},
			{
				title: "Nooi die familie",
				body: "Deel leesalleen-toegang per e-pos, voer die datums na jou kalender uit, en hou die stamboom op jou foon.",
			},
		],
		minute: "Neem omtrent 'n minuut.",
		hero: {
			label: "Voorbeeldstamboom met vier generasies",
			married: "getroud",
			godparent: "peetouer",
		},
	},

	auth: {
		signInPrompt: "Nuut hier?",
		signInLink: "Skep 'n rekening",
		signUpPrompt: "Het jy reeds 'n rekening?",
		signUpLink: "Meld aan",
		missingCredentials: "Voer jou gebruikersnaam of e-pos en jou wagwoord in.",
		unreachable: "Kon nie die bediener bereik nie. Probeer weer.",
		wrongCredentials: "Verkeerde gebruikersnaam of wagwoord. Kontroleer albei en probeer weer.",
		resetEmailMissing: "Voer die e-posadres van jou rekening in.",
		resetSent: (email) => `As ${email} 'n rekening het, is 'n herstelskakel op pad. Kyk in jou inmandjie.`,
		resetFailed: "Kon nie die herstel-e-pos stuur nie. Probeer weer.",
		resetTitle: "Herstel wagwoord",
		resetSubtitle: "Ons e-pos jou 'n skakel om 'n nuwe een te kies.",
		welcomeTitle: "Welkom terug",
		welcomeSubtitle: "Meld aan om jou stambome oop te maak.",
		email: "E-pos",
		usernameOrEmail: "Gebruikersnaam of e-pos",
		password: "Wagwoord",
		forgot: "Vergeet?",
		sending: "Stuur…",
		sendReset: "Stuur herstelskakel",
		signingIn: "Meld aan…",
		signIn: "Meld aan",
		backToSignIn: "Terug na aanmelding",
		noAccount: "Het jy nie 'n rekening nie?",
		signUp: "Registreer",
		showPassword: "Wys wagwoord",
		hidePassword: "Versteek wagwoord",
		pickUsername: "Kies 'n gebruikersnaam.",
		minPassword: (min) => `Minstens ${simple("af", min, "karakter", "karakters")}.`,
		passwordsDiffer: "Wagwoorde stem nie ooreen nie.",
		createFailed: "Kon nie die rekening skep nie.",
		signInAfterCreateFailed: (message) =>
			`Jou rekening is geskep, maar aanmelding het misluk: ${message}. Probeer om aan te meld.`,
		unknownError: "onbekende fout",
		registerTitle: "Begin jou stamboom",
		registerSubtitle: "Gratis, privaat, geen advertensies nie.",
		username: "Gebruikersnaam",
		displayName: "Vertoonnaam",
		confirmPassword: "Bevestig wagwoord",
		creating: "Skep rekening…",
		create: "Skep rekening",
		registerNote:
			"Ons stuur 'n verifikasie-e-pos. Jou stamboom is net sigbaar vir jou en die mense wat jy nooi.",
	},

	nav: {
		trees: "Stambome",
		account: "Jou rekening",
		logOut: "Meld af",
	},

	account: {
		title: "Jou rekening",
		username: "Gebruikersnaam:",
		displayName: "Vertoonnaam:",
		email: "E-pos:",
		deleteHeading: "Vee rekening uit",
		deleteBodyBefore:
			"Vee jou rekening uit en elke stamboom wat jy geskep het, met al die mense, foto's en verwantskappe daarin. Stambome wat ander mense met jou gedeel het, word nie geraak nie. Sien die ",
		deleteBodyLink: "privaatheidsbeleid",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Jou rekening kon nie hier uitgevee word nie (${error}). `,
		failedLink: "E-pos eerder 'n uitveeversoek",
		failedAfter: " en dit sal binne 30 dae gedoen word.",
		deleteButton: "Vee rekening uit…",
		confirmTitle: "Vee jou rekening uit?",
		confirmBody:
			"Dit vee jou rekening uit en elke stamboom wat jy geskep het, met al die mense, foto's en verwantskappe daarin. Mense wat jy genooi het, verloor toegang. Dit kan nie ontdoen word nie.",
		confirmLabel: "Vee alles uit",
		keep: "Hou my rekening",
		typeToConfirm: "Tik VEE UIT om te bevestig",
		confirmWords: ["vee uit", "skrap", "delete"],
	},

	dashboard: {
		onlyYou: "Net jy",
		viewers: (count) => simple("af", count, "kyker", "kykers"),
		byCreator: (name) => `deur ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}bygewerk ${ago}`,
		moreActions: (name) => `Meer aksies vir ${name}`,
		rename: "Hernoem",
		deleteTree: "Vee stamboom uit…",
		open: "Maak oop",
		emptyTitle: "Nog geen stambome nie",
		emptyBody:
			"Begin met die mense wat jy die beste ken: jouself, jou ouers, jou grootouers. Jy kan die res van die familie nooi sodra daar iets is om na te kyk.",
		createFirst: "Skep jou eerste stamboom",
		emptyNote: "Wag jy op 'n uitnodiging? Stambome wat met jou gedeel word, verskyn outomaties hier.",
		title: "Jou stambome",
		count: (total, owned, shared) =>
			`${simple("af", total, "stamboom", "stambome")}${
				shared > 0 ? ` · ${owned} joune, ${shared} met jou gedeel` : ""
			}`,
		newTree: "Nuwe stamboom",
	},

	treeDialogs: {
		nameRequired: "Gee die stamboom 'n naam.",
		created: "Stamboom geskep",
		newTitle: "Nuwe stamboom",
		newSubtitle: "Gee dit 'n naam wat jy hardop sou sê.",
		treeName: "Stamboomnaam",
		namePlaceholder: "My stamboom",
		nameHint: "Byvoorbeeld “Kowalski-familie” of “Ma se kant”.",
		createAndOpen: "Skep en maak oop",
		nameEmpty: "Die naam kan nie leeg wees nie.",
		renamed: "Stamboom hernoem",
		renameTitle: "Hernoem stamboom",
		alreadyHasAccess: "Daardie persoon het reeds toegang.",
		noAccount: "Daardie e-pos het nog nie 'n Family Tree-rekening nie.",
		thatsYou: "Dis jy. Jy besit hierdie stamboom reeds.",
		invited: (email, tree) => `${email} kan nou ${tree} bekyk`,
		revoked: "Toegang herroep",
		whoCanSee: (tree) => `Wie kan ${tree} sien`,
		whoCanSeeSubtitle:
			"Genooide mense kan kyk, nie wysig nie. Hulle het 'n Family Tree-rekening met hierdie e-pos nodig.",
		emailPlaceholder: "naam@voorbeeld.com",
		emailToInvite: "E-pos om te nooi",
		invite: "Nooi",
		revoke: "Herroep",
		deleteTitle: (tree) => `Vee “${tree}” uit?`,
		deleteBody: (count, viewers) =>
			`Dit verwyder ${count === null ? "almal daarin" : people(count)} en al hul verwantskappe${
				viewers > 0 ? ` vir jou en ${simple("af", viewers, "genooide kyker", "genooide kykers")}` : ""
			}. Dit kan nie ontdoen word nie.`,
		deleted: (tree) => `${tree} uitgevee`,
		deleteConfirm: "Vee stamboom uit",
		keep: "Hou dit",
		typeName: "Tik die stamboomnaam om te bevestig",
	},

	tree: {
		legend: "Legende",
		deceased: "† oorlede",
		filtersCleared: "Filters uitgevee om hulle te wys",
		unknownType: "Onbekend",
		chipHide: (type) => `Versteek: ${type}`,
		chipAge: (min, max, plus) => `Ouderdom ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Net mans",
		chipWomen: "Net vroue",
		chipNot: (names) => `Nie: ${names}`,
		chipOnly: (names) => `Net: ${names}`,
		removeFilter: (text) => `Verwyder filter ${text}`,
		exported: (filename, count) => `${filename} afgelaai · ${people(count)}`,
		calendarFailed: "Kon nie die kalender bou nie",
		back: "Terug na stambome",
		openFailed: "Hierdie stamboom kon nie oopgemaak word nie",
		backToTrees: "Terug na jou stambome",
		loadingTree: "Laai die stamboom…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Nog niemand hier nie",
		emptyOwner:
			"Voeg die eerste persoon by; jyself is 'n goeie begin. Almal wat jy byvoeg, rangskik volgens geboortejaar.",
		emptyViewer: "Die skepper het nog niemand by hierdie stamboom gevoeg nie.",
		addFirst: "Voeg die eerste persoon by",
		editToolbar: "Wysig stamboom",
		viewToolbar: "Aansig",
		addPerson: "Voeg persoon by",
		findPerson: "Soek persoon",
		filters: "Filters",
		exportCalendar: "Voer uit na kalender",
		zoomIn: "Zoem in",
		zoomOut: "Zoem uit",
		fit: "Pas by skerm",
		visible: (shown, total) => `${shown} van ${people(total)} sigbaar`,
		saved: "Veranderinge gestoor",
		added: (name) => `${name} by die stamboom gevoeg`,
		relationshipAdded: "Verwantskap bygevoeg",
		removePersonTitle: (name) => `Verwyder ${name}?`,
		removePersonBody: (count) =>
			`Dit verwyder ook ${relationships(count)} wat aan hulle gekoppel is. Dit kan nie ontdoen word nie.`,
		removePerson: "Verwyder persoon",
		personRemoved: (name) => `${name} verwyder`,
		removeEdgeTitle: "Verwyder hierdie verwantskap?",
		removeEdgeBody: (sentence) => `${sentence}. Die twee mense bly in die stamboom.`,
		relationshipRemoved: "Verwantskap verwyder",
		canvas: "Stamboomdoek. Sleep om te skuif, rol om te zoem.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", oorlede" : ""}${
				link === "you" ? ", dit is jy" : link === "linked" ? ", gekoppel aan 'n rekening" : ""
			}`,
		youPill: "Jy",
		legendYou: "Jy",
		legendLinked: "Gekoppelde rekening",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `${name} se besonderhede`,
		removeWith: (name) => `Verwyder verwantskap met ${name}`,
		noRelationships: "Nog geen verwantskappe nie.",
		showFamily: "Wys uitgebreide familie",
		hideFamily: "Versteek uitgebreide familie",
		noFamily: "Geen ouer- of huweliksbande om die wyer familie uit af te lei nie.",
		removeNamed: (name) => `Verwyder ${name}`,
		readOnly: "Leesalleen. Net die skepper van die stamboom kan wysig.",
		thisIsYou: "Dit is jy",
		linkedTo: (email) => `Gekoppel aan ${email}`,
		note: "Nota",
		relationship: "Verwantskap",
		bidirectional: "tweerigting",
		directional: "eenrigting →",
	},

	filters: {
		hideTypes: "Versteek verwantskaptipes",
		hideTypesHint: "Deurgehaalde tipes word van die doek en die uitvoer versteek.",
		age: "Ouderdom",
		minimum: "Minimum",
		maximum: "Maksimum",
		ageHint: "Ouderdom by afsterwe vir mense wat oorlede is.",
		gender: "Geslag",
		everyone: "Almal",
		men: "Mans",
		women: "Vroue",
		includeByName: "Wys net name wat bevat",
		includeHint: "Kommageskei. Hou mense wie se naam enige daarvan bevat.",
		excludeByName: "Sluit uit op naam",
		excludeHint: "Kommageskei. Pas by enige deel van 'n naam, ongeag hoofletters en aksente.",
	},

	dialogs: {
		findTitle: "Soek persoon",
		findPlaceholder: "Tik 'n naam…",
		searchPeople: "Soek mense",
		noResults: "Niemand met daardie naam nie.",
		nameRequired: "Voer 'n naam in.",
		birthRequired: "Voer 'n geboortedatum in.",
		deathBeforeBirth: "Die sterfdatum is voor die geboortedatum.",
		editPerson: "Wysig persoon",
		addPerson: "Voeg persoon by",
		personSubtitle: "Naam en geboortedatum is verpligtend. Al die res kan wag.",
		changePhoto: "Verander foto",
		uploadPhoto: "Laai foto op",
		photoHint: "JPG of PNG, tot 5 MB. Vierkantig werk die beste.",
		photoTooLarge: "Daardie foto is groter as 5 MB.",
		fullName: "Volle naam",
		namePlaceholder: "bv. Maria Kowalska",
		birthDate: "Geboortedatum",
		deathDate: "Sterfdatum",
		note: "Nota",
		noteHint: "Enigiets wat die moeite werd is om te onthou: 'n nooiensvan, waar hulle gewoon het, 'n storie.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `Hou die nota onder ${max} karakters.`,
		linkedAccount: "Gekoppelde rekening",
		linkedHint: "Die Family Tree-rekening van hierdie persoon, as hulle toegang tot die stamboom het.",
		linkedNone: "Geen",
		linkedMe: (name) => `Ek (${name})`,
		linkedConflict: (account, person) =>
			`${account} is reeds aan ${person} gekoppel. 'n Rekening kan aan net een persoon gekoppel word, so ontkoppel dit eers daar.`,
		saveChanges: "Stoor veranderinge",
		addToTree: "Voeg by stamboom",
		search: "Soek…",
		readAsSentence: "Lees dit as 'n sin:",
		duplicate: "Daardie verwantskap is reeds in die stamboom.",
		fromPerson: "Van persoon",
		toPerson: "Na persoon",
		relationType: "Verwantskaptipe",
		bothWays: "in albei rigtings",
		oneWay: "in een rigting",
		exportTitle: "Voer uit na kalender",
		exportHeading: (count) => `Voer ${people(count)} na jou kalender uit`,
		exportBody:
			"'n Enkele .ics-lêer met 'n jaarlikse verjaarsdag vir elke lewende persoon en 'n jaarlikse herdenkingsdag vir elke persoon wat oorlede is. Versteekte mense word nie ingesluit nie.",
		birthdays: "Verjaarsdae",
		remembrances: "Herdenkingsdae",
		download: "Laai .ics af",
	},

	person: {
		/** "78 jaar oud" / "77 by afsterwe"; "jaar" stays singular after a numeral. */
		age: (age, _gender, deceased) => (deceased ? `${age} by afsterwe` : `${age} jaar oud`),
	},

	family: {
		/** Grootouers, Oorgrootouers, Oor-oorgrootouers, … */
		ancestors: (level) => (level === 0 ? "Grootouers" : `${"Oor-".repeat(level - 1)}oorgrootouers`),
		/** Kleinkinders, Agterkleinkinders, Agter-agterkleinkinders, … */
		descendants: (level) =>
			level === 0 ? "Kleinkinders" : `${"Agter-".repeat(level - 1)}agterkleinkinders`,
		parents: "Ouers",
		auntsAndUncles: "Tantes en ooms",
		siblings: "Broers en susters",
		children: "Kinders",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biologies",
			"IN-LAW": "Aangetroud",
			CHURCH: "Kerklik",
			IRRELEVANT: "Ander",
		},
		legend: {
			married: "Getroud",
			livesWith: "Woon saam",
		},
		known,
		// Unknown types keep their (English) database phrasing; Afrikaans "is" reads the same.
		fallbackSentence: (from, phrase, isVerb, to) => `${from} ${isVerb ? "is " : ""}${phrase} ${to}`,
		fallbackRole: (phrase, isVerb, firstName, selectedIsSource) =>
			selectedIsSource
				? `${firstName} ${isVerb ? "is " : ""}${phrase}`
				: `${isVerb ? "is " : ""}${phrase} ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name}, herdenking`,
		remembranceDescription: (name, born) => `Herdenking van ${name} se afsterwe (gebore ${born}).`,
		birthdayTitle: (name) => `${name} se verjaarsdag`,
		birthdayDescription: (name, born) => `${name} is in ${born} gebore.`,
		fileFallback: "stamboom",
	},
};
