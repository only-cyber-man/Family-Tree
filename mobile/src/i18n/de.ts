import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// Deutsch. Typed as Dict: a missing or mistyped key does not compile.
// Register: the informal, lower-case "du" of consumer apps.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
const pick = (n: number, one: string, other: string) => form("de", n, one, other);
const jahre = (n: number) => `${n} ${pick(n, "Jahr", "Jahre")}`;
/** Dative after "mit" / "vor": "mit 1 Jahr", "vor 5 Jahren". */
const jahren = (n: number) => `${n} ${pick(n, "Jahr", "Jahren")}`;
const personen = (n: number) => `${n} ${pick(n, "Person", "Personen")}`;
const cap = (s: string) => (s.length ? s[0].toUpperCase() + s.slice(1) : s);
/** Lower-case "ur" prefixes; the caller capitalises the whole word: cap(ur(2) + "großvater") → "Ururgroßvater". */
const ur = (n: number) => "ur".repeat(Math.max(0, n));
const GRADES = ["", "", "zweiten", "dritten", "vierten", "fünften", "sechsten", "siebten", "achten"];

/**
 * Bare nominative / genitive of the nouns used in relationship chains. The
 * article is added by the person's gender, which is also the grammatical
 * gender of every noun here. The neuter fallback carries its own article,
 * and an untranslated lower-case word (an unknown relationship type) gets none.
 */
function noun(w: KinWord): { nom: string; gen: string } {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? { nom: "Mutter", gen: "Mutter" } : { nom: "Vater", gen: "Vaters" };
		case "child":
			return f ? { nom: "Tochter", gen: "Tochter" } : { nom: "Sohn", gen: "Sohnes" };
		case "sibling":
			return f ? { nom: "Schwester", gen: "Schwester" } : { nom: "Bruder", gen: "Bruders" };
		case "spouse":
			return f ? { nom: "Ehefrau", gen: "Ehefrau" } : { nom: "Ehemann", gen: "Ehemanns" };
		case "partner":
			return f ? { nom: "Partnerin", gen: "Partnerin" } : { nom: "Partner", gen: "Partners" };
		default:
			return w.noun ?? { nom: "das Familienmitglied", gen: "des Familienmitglieds" };
	}
}

const hasArticle = (s: string) => /^(der|die|das|des) /.test(s);
const untranslated = (s: string) => /^[a-z]/.test(s);

/** "die Tochter", "der Freund": nominative with the definite article. */
function nomArt(w: KinWord): string {
	const { nom } = noun(w);
	if (hasArticle(nom) || untranslated(nom)) return nom;
	return `${w.gender === "female" ? "die" : "der"} ${nom}`;
}

/** "des Bruders", "der Mutter": genitive with the definite article. */
function genArt(w: KinWord): string {
	const { gen } = noun(w);
	if (hasArticle(gen) || untranslated(gen)) return gen;
	return `${w.gender === "female" ? "der" : "des"} ${gen}`;
}

/** "dein Bruder", "deine Mutter", "dein Familienmitglied". */
function possNom(w: KinWord): string {
	const { nom } = noun(w);
	const m = /^(der|die|das) (.+)$/.exec(nom);
	const feminine = m ? m[1] === "die" : w.gender === "female";
	return `${feminine ? "deine" : "dein"} ${m ? m[2] : nom}`;
}

/** "deines Bruders", "deiner Mutter", "deines Familienmitglieds". */
function possGen(w: KinWord): string {
	const { gen } = noun(w);
	const m = /^(des|der) (.+)$/.exec(gen);
	const feminine = m ? m[1] === "der" : w.gender === "female";
	return `${feminine ? "deiner" : "deines"} ${m ? m[2] : gen}`;
}

export const de: Dict = {
	lang: "de",
	locale: "de-DE",

	common: {
		cancel: "Abbrechen",
		done: "Fertig",
		save: "Speichern",
		saving: "Wird gespeichert…",
		close: "Schließen",
		back: "Zurück",
		change: "Ändern",
		tryAgain: "Erneut versuchen",
		add: "Hinzufügen",
		create: "Erstellen",
		creating: "Wird erstellt…",
		edit: "Bearbeiten",
		remove: "Entfernen",
		keep: "Behalten",
		continue: "Weiter",
		undo: "Rückgängig",
		openSettings: "Einstellungen öffnen",
		settings: "Einstellungen",
		signIn: "Anmelden",
		you: "Du",
		loading: "Wird geladen",
		familyTree: "Family Tree",
		owner: "Besitzer",
		sharedWithYou: "Mit dir geteilt",
		male: "Männlich",
		female: "Weiblich",
		show: "Anzeigen",
		hide: "Ausblenden",
		showPassword: "Passwort anzeigen",
		hidePassword: "Passwort ausblenden",
		chooseDate: "Datum wählen",
		dateA11y: (label, value) => `${label}: ${value}. Ändern`,
		closeDatePicker: "Datumsauswahl schließen",
		year: "Jahr",
		yearHint: "Gib ein Jahr ein, um in der Auswahl dorthin zu springen",
		yearExample: "z. B. 1742",
		removeFilter: (label) => `Filter ${label} entfernen`,
		searchByName: "Nach Namen suchen",
		noOneCalled: (q) => `Niemand heißt „${q}“.`,
		noOneToChoose: "Noch niemand zum Auswählen da.",
		selected: "ausgewählt",
		reminderScheduled: "Erinnerung geplant",
		noReminder: "Keine Erinnerung",
		range: (lo, hi) => `${lo} bis ${hi}`,
	},

	offline: {
		banner: "Du bist offline. Du siehst die letzte Kopie dieses Stammbaums.",
		short: "Du bist offline.",
		write: "Du bist offline — Änderungen können nicht gespeichert werden.",
	},

	save: {
		// `what` is in the accusative, after "Konnte … nicht speichern".
		failedOffline: (what) => `Konnte ${what} nicht speichern: Du bist offline oder der Server ist nicht erreichbar. Nichts ist verloren; versuch es noch einmal.`,
		failed: (what, reason) => `Konnte ${what} nicht speichern. ${reason}`,
		noTree: "Es ist kein Stammbaum geöffnet, daher wurde nichts gespeichert. Wähle einen Stammbaum und versuch es noch einmal.",
		theChanges: "die Änderungen",
		thisPerson: "diese Person",
		theRelationship: "die Beziehung",
		theTree: "den Stammbaum",
	},

	errors: {
		network: "Keine Verbindung. Prüfe deine Internetverbindung und versuch es noch einmal.",
		generic: "Etwas ist schiefgelaufen.",
		notSignedIn: "Du bist nicht angemeldet.",
		passwordsDontMatch: "Die Passwörter stimmen nicht überein.",
		sessionExpired: "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.",
		shareUnavailable: "Teilen ist auf diesem Gerät nicht verfügbar.",
	},

	tabs: {
		home: "Start",
		tree: "Stammbaum",
		add: "Hinzufügen",
		find: "Suchen",
		dates: "Termine",
		settings: "Einstellungen",
		addPerson: "Person hinzufügen",
		findPerson: "Person finden",
	},

	prefs: {
		language: "Sprache",
		languageSystem: "System",
		chooseLanguage: "Sprache wählen",
		appearance: "Darstellung",
		theme: "Design",
		system: "System",
		light: "Hell",
		dark: "Dunkel",
	},

	onboarding: {
		title1: "Deine Familie, als Graph gezeichnet.",
		body1: "Personen sind Karten, Beziehungen sind Linien, Generationen ordnen sich nach Geburtsjahr. Privat, geteilt nur auf Einladung.",
		title2: "Verpasse keinen Geburtstag und keinen Gedenktag.",
		body2: "Eine dezente Erinnerung am Vortag. Alles bleibt auf deinem Telefon; nichts wird an uns gesendet.",
		page: (n, total) => `Seite ${n} von ${total}`,
		haveAccount: "Ich habe schon ein Konto",
		turnOnReminders: "Erinnerungen einschalten",
		notNow: "Jetzt nicht",
		previewTitle1: "Oma Maria wird morgen 75",
		previewWhen1: "Morgen",
		previewBody1: "Ein runder Geburtstag. Rufst du Maria an?",
		previewTitle2: "† Stanisław Kowalski, 28. Todestag",
		previewWhen2: "15. Okt.",
	},

	auth: {
		welcomeBack: "Willkommen zurück",
		signInSubtitle: "Melde dich mit deinem Konto bei Family Tree an.",
		usernameOrEmail: "Benutzername oder E-Mail",
		password: "Passwort",
		forgot: "Passwort vergessen?",
		newHere: "Neu hier?",
		createAccount: "Konto erstellen",
		enterBoth: "Gib deinen Benutzernamen oder deine E-Mail-Adresse und dein Passwort ein.",
		wrongCredentials: "Benutzername oder Passwort ist falsch.",
		forgotHowTo: "Gib deine E-Mail-Adresse ins erste Feld ein und tippe dann noch einmal auf „Passwort vergessen?“.",
		resetTitle: "Passwort zurücksetzen",
		resetConfirm: (email) => `Link zum Zurücksetzen an ${email} senden?`,
		send: "Senden",
		checkInbox: "Schau in dein Postfach",
		checkInboxBody: "Wenn zu dieser E-Mail-Adresse ein Konto gehört, ist ein Link zum Zurücksetzen unterwegs.",
		couldntSend: "Senden fehlgeschlagen",
		signInAgain: "Bitte melde dich erneut an",
		sessionEnded: "Deine Sitzung ist abgelaufen. Nichts ist verloren; der Stammbaum ist noch da.",
		passwordFor: (who) => `Passwort für ${who}`,
		differentAccount: "Anderes Konto verwenden",
		startTree: "Starte deinen Stammbaum",
		freePrivate: "Kostenlos, privat, ohne Werbung.",
		username: "Benutzername",
		displayName: "Anzeigename (optional)",
		yourName: "Dein Name",
		email: "E-Mail",
		confirmPassword: "Passwort bestätigen",
		step1: "Passwort und Bestätigung kommen als Nächstes. Schritt 1 von 2.",
		step2: (email) => `Wir senden eine Bestätigungs-E-Mail an ${email}. Schritt 2 von 2.`,
		usernameRule: "Mindestens 3 Buchstaben oder Ziffern, keine Leerzeichen.",
		emailInvalid: "Das sieht nicht nach einer E-Mail-Adresse aus.",
		passwordRule: "Verwende mindestens 8 Zeichen.",
		createAccountButton: "Konto erstellen",
		agreePrefix: "Mit dem Erstellen eines Kontos akzeptierst du die ",
		privacyPolicy: "Datenschutzerklärung",
		agreeSuffix: ".",
	},

	home: {
		offline: "Du bist offline",
		couldntLoadTrees: "Deine Stammbäume konnten nicht geladen werden",
		connectFirstTime: "Verbinde dich mit dem Internet, um deine Stammbäume zum ersten Mal zu sehen.",
		noTrees: "Noch keine Stammbäume",
		noTreesBody: "Fang mit dir und deinen Eltern an. Einladungen von Verwandten erscheinen hier von selbst.",
		createFirst: "Erstelle deinen ersten Stammbaum",
		treeUnavailable: "Dieser Stammbaum ist nicht verfügbar",
		couldntOpen: "Dieser Stammbaum konnte nicht geöffnet werden",
		treeUnavailableBody: "Er wurde vielleicht gelöscht, oder der Besitzer teilt ihn nicht mehr mit dir.",
		noCopy: "Auf diesem Telefon gibt es noch keine Kopie dieses Stammbaums. Verbinde dich und versuch es noch einmal.",
		chooseTree: "Stammbaum wählen",
		switchTree: "Stammbaum wechseln",
		lookingFor: "Wen suchst du?",
		upcoming: "Demnächst",
		seeAll: "Alle anzeigen",
		noUpcoming: "Keine anstehenden Termine",
		noUpcomingEmpty: "Geburtstage und Gedenktage erscheinen hier, sobald Personen im Stammbaum sind.",
		noUpcomingYear: "Nichts in den nächsten zwölf Monaten.",
		noOne: "Noch niemand hier",
		addYourself: "Füge zuerst dich selbst hinzu. Alle anderen werden mit jemandem verbunden, der schon im Stammbaum ist.",
		ownerAddedNoOne: "Der Besitzer hat noch niemanden hinzugefügt.",
		addFirst: "Erste Person hinzufügen",
		quick: "Schnellzugriff",
		addPerson: "Person hinzufügen",
		linkTwo: "Zwei Personen verbinden",
		aboutTree: "Dieser Stammbaum",
		detailHint: "Tippe links auf einen Termin, um die Person hier zu sehen.",
	},

	tree: {
		loading: "Stammbaum wird geladen…",
		removeTitle: (name) => `${name} entfernen?`,
		removeBody: "Auch ihre Beziehungen werden entfernt. Das lässt sich nicht rückgängig machen.",
		removed: (name) => `${name} entfernt`,
		addRelationship: "Beziehung hinzufügen",
		focusedOn: (name) => `Fokus auf ${name}`,
		parents: "Eltern",
		partner: "Partner",
		partners: "Partner",
		children: "Kinder",
		exitFocus: "Fokus beenden",
		search: "Suchen",
		filters: "Filter",
		filtersActive: (n) => `Filter, ${n} aktiv`,
		goUpTo: (name) => `Hoch zu ${name}`,
		resetView: "Ansicht zurücksetzen",
		fitAll: "Ganzen Stammbaum einpassen",
		allFiltered: "Alle sind ausgefiltert",
		clearFilters: "Filter zurücksetzen",
		canvasA11y: (n) => `Stammbaum mit ${personen(n)}. Nutze die Suche, um jemanden zu finden.`,
		bandLabel: (start) => `${start}er`,
		bandLabelShort: (start) => `’${String(start).slice(2)}er`,
		legend: "Legende",
		legendBio: "Biologisch",
		legendMarried: "Verheiratet",
		legendLivesWith: "Lebt zusammen",
		legendInLaw: "Angeheiratet",
		legendChurch: "Kirchlich",
		legendOther: "Sonstige",
		youPill: "Du",
		legendYou: "Du",
		panelHint: "Tippe auf eine Person, um hier ihre Details zu sehen.",
		panelTitle: "Details",
	},

	person: {
		gone: "Diese Person ist nicht mehr im Stammbaum.",
		ageAlive: (g, age) => `${g} · ${jahre(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · gestorben mit ${jahren(age)}${wouldBe ? ` · wäre heute ${wouldBe}` : ""}`,
		you: "du",
		focus: "Fokus",
		focusOnTree: "Im Stammbaum zeigen",
		howRelated: "Wie sind wir verwandt?",
		turns: (n) => `Wird ${n}`,
		remembranceDay: "Gedenktag",
		remindMe: "Erinnere mich",
		noRelationshipsOwner: "Noch keine Beziehungen. Füge eine hinzu, um die Person mit dem Stammbaum zu verbinden.",
		noRelationships: "Noch keine Beziehungen.",
		dragUp: "Nach oben ziehen für alle Beziehungen",
		removedFromTree: (name) => `${name} aus dem Stammbaum entfernt`,
		couldntRemove: (name, reason) => `${name} konnte nicht entfernt werden. ${reason}`,
		open: "Öffnen",
		removeRelationship: "Beziehung entfernen",
		relationshipRemoved: "Beziehung entfernt",
		sharedBy: (email) => `Mit dir geteilt${email ? ` von ${email}` : ""}. Nur der Besitzer kann bearbeiten.`,
		removeA11y: (name) => `${name} entfernen`,
		thisIsYou: "Das bist du",
		linkedTo: (email) => `Verknüpft mit ${email}`,
		linkedToAccount: "Mit einem Konto verknüpft",
		note: "Notiz",
	},

	path: {
		whichIsYou: "Welche Person bist du?",
		needMe: (first) =>
			`Um zu sagen, wie ${first} mit dir verwandt ist, muss die App wissen, welche Person in diesem Stammbaum du bist. Du wählst einmal; die Wahl bleibt auf diesem Telefon.`,
		chooseWho: "Wähle, wer du bist",
		notConnected: "Noch nicht mit dir verbunden",
		notConnectedBody: (name) => `In diesem Stammbaum gibt es keine Kette von Beziehungen zwischen dir und ${name}. Eine neue Beziehung würde euch verbinden.`,
		open: (first) => `${first} öffnen`,
		stepsThrough: (steps, people) => `${steps} ${pick(steps, "Schritt", "Schritte")} über ${personen(people)}.`,
		familyOnly: "Kürzester Weg nur über biologische Verbindungen und Ehen.",
		anyLinks: "Familienverbindungen verbinden euch nicht, daher werden andere erfasste Verbindungen genutzt.",
		youName: (name) => `Du · ${name}`,
		showOnTree: "Im Stammbaum zeigen",
		meNote: (name) =>
			`„Das bin ich“ (${name}) wird nur auf diesem Telefon gespeichert, weil der geteilte Stammbaum noch kein Feld dafür hat. Ändern kannst du es in den Einstellungen.`,
		notConnectedShort: "noch nicht mit dir verbunden",
	},

	search: {
		placeholder: "Wen suchst du?",
		a11y: "Personen suchen",
		chooseWho: "Wähle, wer du bist",
		chooseWhoBody: "Sag der App, welche Person du bist, um zu sehen, wie alle mit dir verwandt sind. Die Wahl bleibt auf diesem Telefon.",
		noOne: (q) => `In diesem Stammbaum heißt niemand „${q}“.`,
	},

	addPerson: {
		add: "Person hinzufügen",
		edit: "Person bearbeiten",
		viewerOnly: "Dieser Stammbaum ist nur zum Ansehen mit dir geteilt. Nur der Besitzer kann Personen hinzufügen.",
		chooseTreeFirst: "Wähle oder erstelle zuerst einen Stammbaum.",
		gone: "Diese Person ist nicht mehr im Stammbaum.",
		nameRequired: "Der Name ist erforderlich.",
		chooseGender: "Wähle ein Geschlecht.",
		birthRequired: "Das Geburtsdatum ist erforderlich.",
		deathRequired: "Gib das Sterbedatum an oder schalte das aus.",
		deathBeforeBirth: "Das Sterbedatum liegt vor dem Geburtsdatum.",
		linkIncomplete: "Wähle sowohl die Beziehung als auch die Person, oder entferne die Verknüpfung.",
		saved: (first) => `${first} gespeichert`,
		linkFailed: (first, reason) => `${first} wurde hinzugefügt, aber die Verknüpfung konnte nicht gespeichert werden. ${reason}`,
		added: (first) => `${first} zum Stammbaum hinzugefügt`,
		changePhoto: "Foto ändern",
		addPhoto: "Foto hinzufügen",
		cameraOff: "Kamerazugriff ist aus",
		cameraOffBody: "Du kannst trotzdem ein Foto aus deiner Galerie wählen oder die Kamera in den Einstellungen erlauben.",
		useGallery: "Galerie verwenden",
		takePhoto: "Foto aufnehmen",
		fromGallery: "Aus der Galerie wählen",
		fullName: "Vollständiger Name",
		namePlaceholder: "z. B. Maria Kowalska",
		gender: "Geschlecht",
		birthDate: "Geburtsdatum",
		passedAway: "Ist verstorben",
		passedAwayHint: "Fügt ein Sterbedatum und einen Gedenktag hinzu",
		deathDate: "Sterbedatum",
		linkTo: "Mit jemandem verbinden",
		linkOptional: "optional, spart einen Schritt",
		linkExample: (name) => `z. B. Mutter von ${name}`,
		newPerson: "Neue Person",
		parentNote: (child) => `Die neue Person ist der Elternteil; ${child} ist das Kind.`,
		theChosen: "die gewählte Person",
		dontLink: "Jetzt nicht verbinden",
		note: "Notiz",
		notePlaceholder: "Alles, was man sich merken sollte",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Verknüpftes Konto",
		linkedHint: "Welches Konto bei Family Tree gehört dieser Person? Nur Konten, die diesen Stammbaum sehen können, werden aufgeführt.",
		linkedNone: "Keins",
		linkedMe: (email) => (email ? `Ich (${email})` : "Ich"),
		linkedConflict: (name) => `${name} ist bereits mit diesem Konto verknüpft.`,
		loadingAccounts: "Konten werden geladen…",
	},

	addRel: {
		title: "Beziehung hinzufügen",
		viewerOnly: "Nur der Besitzer dieses Stammbaums kann Beziehungen hinzufügen.",
		chooseBoth: "Wähle beide Personen und wie sie verwandt sind.",
		different: "Wähle zwei verschiedene Personen.",
		duplicate: "Diese Beziehung ist bereits im Stammbaum.",
		added: "Beziehung hinzugefügt",
		isRelatedTo: "ist verwandt mit",
		from: "Von",
		to: "Zu",
		relation: "Beziehung",
		changeFrom: "Ändern, von wem die Beziehung ausgeht",
		more: "Mehr…",
		fewer: "Weniger",
		/** "Jan ist die Mutter von Tomasz." — the verb phrases end in a preposition, so names stay as they are. */
		sentence: (a, verb, b) => `${a} ${verb} ${b}.`,
		sentenceJoin: " ",
	},

	filters: {
		title: "Filter",
		clearAll: "Alle zurücksetzen",
		show: (shown, total) => `${shown} von ${personen(total)} anzeigen`,
		hideTypes: "Beziehungstypen ausblenden",
		hidden: "ausgeblendet",
		shown: "sichtbar",
		age: "Alter",
		ageRange: "Altersspanne",
		gender: "Geschlecht",
		everyone: "Alle",
		men: "Männer",
		women: "Frauen",
		excludeByName: "Nach Namen ausschließen",
		excludeHint: "Mehrere Namen mit Kommas trennen.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label) => `Ausgeblendet: ${label}`,
		chipAge: (lo, hi) => `Alter ${lo}–${hi}`,
		chipMen: "Nur Männer",
		chipWomen: "Nur Frauen",
		chipNot: (names) => `Ohne: ${names}`,
		chipOnly: (names) => `Nur: ${names}`,
		includeByName: "Nur Namen anzeigen, die enthalten",
		includeHint: "Einer von mehreren Namen, mit Kommas getrennt.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Deine Stammbäume",
		giveName: "Gib dem Stammbaum zuerst einen Namen.",
		created: (name) => `„${name}“ erstellt`,
		nameLabel: "Name des neuen Stammbaums",
		namePlaceholder: "Mein Stammbaum",
		newTree: "Neuer Stammbaum",
		people: (n) => personen(n),
		updated: (rel) => `aktualisiert ${rel}`,
		viewers: (n) => `Geteilt mit ${personen(n)}`,
		onlyYou: "Nur du",
		by: (email) => `von ${email}`,
		active: "Aktiv ✓",
	},

	invited: {
		title: "Wer diesen Stammbaum sehen kann",
		subtitle: "Eingeladene können schauen, aber nicht bearbeiten.",
		thatsYou: "Das bist du; dir gehört dieser Stammbaum bereits.",
		already: "Diese Person kann den Stammbaum bereits sehen.",
		canSee: (email) => `${email} kann diesen Stammbaum jetzt sehen`,
		noAccount: "Kein Konto bei Family Tree verwendet diese E-Mail-Adresse. Bitte die Person, sich zuerst zu registrieren, und lade sie dann ein.",
		// Accusative, after "für": fits both stopTitle and revoked.
		thisPerson: "diese Person",
		stopTitle: (who) => `Freigabe für ${who} beenden?`,
		stopBody: "Die Person sieht diesen Stammbaum dann nicht mehr.",
		revoke: "Zugriff entziehen",
		revoked: (who) => `Freigabe für ${who} beendet`,
		emailPlaceholder: "name@beispiel.de",
		emailA11y: "E-Mail-Adresse der Person, die du einlädst",
		invite: "Einladen",
		note: "Die Person braucht bereits ein Konto bei Family Tree mit dieser E-Mail-Adresse. Es wird keine E-Mail verschickt; der Stammbaum erscheint einfach in ihrer Liste.",
		youSuffix: (name) => `${name} (du)`,
		creator: "Ersteller",
		viewer: "Betrachter",
		viewerYou: "Betrachter · du",
		unknown: "Unbekanntes Konto",
		revokeA11y: (email) => `Zugriff von ${email} entziehen`,
		onlyYou: "Nur du kannst diesen Stammbaum sehen.",
	},

	dates: {
		title: "Termine",
		exportIcs: ".ics exportieren",
		all: "Alle",
		birthdays: "Geburtstage",
		remembrance: "Gedenktage",
		quietReminder: "Eine dezente Erinnerung am Vortag",
		turnOn: "Erinnerungen einschalten",
		localOnly: "Erinnerungen werden auf diesem Telefon aus den Daten im Stammbaum geplant. Nichts wird an einen Server gesendet.",
		detailHint: "Tippe auf einen Termin, um die Person hier zu sehen.",
		none: "Keine anstehenden Termine",
		noneBody: "Geburtstage und Gedenktage erscheinen hier, sobald Personen im Stammbaum sind.",
		footnote:
			"Glocke = lokale Erinnerung um 9:00 Uhr am Vortag (Gedenktage: am Tag selbst). Runde Geburtstage (18, 50, 55, 60…) können eine zweite Erinnerung eine Woche vorher bekommen. Der Export umfasst die gerade im Stammbaum sichtbaren Personen.",
	},

	settings: {
		title: "Einstellungen",
		signOutTitle: "Abmelden?",
		signOutBody: "Erinnerungen werden entfernt und die Kopien deiner Stammbäume von diesem Telefon gelöscht.",
		signOut: "Abmelden",
		account: "Konto",
		accountBody: "Das Passwort änderst du auf der Website.",
		openWebsite: "Website öffnen",
		reminders: "Erinnerungen",
		birthdays: "Geburtstage",
		dayBefore: "Am Vortag, 9:00 Uhr",
		remembranceDays: "Gedenktage",
		onTheDay: "Am Tag selbst, 9:00 Uhr",
		roundEarly: "Runde Geburtstage eine Woche früher",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Auf diesem Telefon für den aktiven Stammbaum geplant. Nichts wird an einen Server gesendet.",
		whoCanSee: "Wer diesen Stammbaum sehen kann",
		viewers: (n) => personen(n),
		onlyYou: "Nur du",
		preparing: "Wird vorbereitet…",
		exportIcs: "In den Kalender exportieren (.ics)",
		thisIsMe: "Das bin ich",
		notSet: "Nicht festgelegt",
		switchTree: "Stammbaum wechseln",
		about: "Info",
		privacy: "Datenschutzerklärung",
		deleteAccount: "Konto löschen",
		deleteTitle: "Dein Konto löschen?",
		deleteBody:
			"Das löscht dein Konto und jeden Stammbaum, den du erstellt hast, mit allen Personen, Fotos und Beziehungen. Eingeladene verlieren den Zugriff. Das lässt sich nicht rückgängig machen.",
		footer: (version) => `Family Tree ${version} · Erstellt von tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "Gesponsert",
		tag: "Anzeige",
		open: (title) => `${title} öffnen`,
	},

	deleteAccount: {
		title: "Konto löschen",
		typeToConfirm: (word) => `Gib ${word} ein, um zu bestätigen`,
		typeToConfirmError: (word) => `Gib ${word} ein, um zu bestätigen.`,
		offline: "Du bist offline — dein Konto kann gerade nicht gelöscht werden.",
		permanently: "Das löscht dauerhaft:",
		yourAccount: (email) => `• dein Konto${email ? ` (${email})` : ""}`,
		everyTree: "• jeden Stammbaum, den du erstellt hast, mit allen Personen, Fotos und Beziehungen",
		consequences: "Eingeladene verlieren den Zugriff auf diese Stammbäume. Stammbäume, die andere mit dir geteilt haben, sind nicht betroffen. Das lässt sich nicht rückgängig machen.",
		notFully: (reason) => `Dein Konto wurde nicht vollständig gelöscht. ${reason}`,
		askUs: (email) => `Du kannst es noch einmal versuchen oder uns unter ${email} bitten, es für dich zu löschen.`,
		emailRequest: "Löschantrag per E-Mail senden",
		deleteMine: "Mein Konto löschen",
		deleting: "Wird gelöscht…",
		keep: "Konto behalten",
		mailSubject: "Mein Konto bei Family Tree löschen",
		mailBody: (email) => `Bitte löschen Sie mein Konto bei Family Tree${email ? ` (${email})` : ""} und alle Stammbäume, die ich erstellt habe.`,
	},

	pickMe: {
		title: "Welche Person bist du?",
		note: "Wird für „Wie sind wir verwandt?“ gebraucht. Es wird nur auf diesem Telefon gespeichert, und niemand sonst sieht es.",
		forget: "Meine Wahl vergessen",
		serverLinked: (name) => `${name} ist in diesem Stammbaum mit deinem Konto verknüpft, daher kommt „Das bin ich“ auf jedem Gerät aus dem Stammbaum.`,
		saveTitle: "Im Stammbaum speichern?",
		saveBody: (name) => `${name} in diesem Stammbaum mit deinem Konto verknüpfen? Dann funktioniert „Das bin ich“ auf jedem Gerät und auf der Website.`,
		saveLink: "Verknüpfung speichern",
		phoneOnly: "Nur auf diesem Telefon",
		linkSaved: (name) => `${name} ist jetzt mit deinem Konto verknüpft`,
	},

	notFound: {
		title: "Hier ist nichts",
		body: "Dieser Link führt zu einer Seite, die die App nicht hat.",
		home: "Zur Startseite",
	},

	toastsReminders: {
		on: "Erinnerungen sind an. Sie bleiben auf diesem Telefon.",
		off: "Benachrichtigungen für Family Tree sind aus.",
		settings: "Einstellungen",
		channel: "Geburtstage und Gedenktage",
	},

	dateNames: {
		monthsNom: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		monthsInDate: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
		monthsShort: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
		weekdaysShort: ["So.", "Mo.", "Di.", "Mi.", "Do.", "Fr.", "Sa."],
		/** "4. Februar 1950" */
		dayMonthYear: (day, month, year) => `${day}. ${month} ${year}`,
		/** "15. Okt." */
		dayMonth: (day, month) => `${day}. ${month}`,
	},

	time: {
		justNow: "gerade eben",
		minutesAgo: (n) => (n === 1 ? "vor einer Minute" : `vor ${n} Minuten`),
		hoursAgo: (n) => (n === 1 ? "vor einer Stunde" : `vor ${n} Stunden`),
		yesterday: "gestern",
		daysAgo: (n) => `vor ${n} Tagen`,
		weeksAgo: (n) => (n === 1 ? "vor einer Woche" : `vor ${n} Wochen`),
		monthsAgo: (n) => (n === 1 ? "vor einem Monat" : `vor ${n} Monaten`),
		yearsAgo: (n) => (n === 1 ? "vor einem Jahr" : `vor ${n} Jahren`),
		today: "heute",
		tomorrow: "morgen",
		inDays: (n) => `in ${n} Tagen`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} wird ${age}`,
		remembranceTitle: (first, n) => `† ${first}, ${n}. Todestag`,
		birthday: "Geburtstag",
		remembrance: "Gedenktag",
		roundAge: "runder Geburtstag",
		reminderEve: (first, age) => `${first} wird morgen ${age}`,
		reminderEveRoundBody: (first) => `Ein runder Geburtstag. Rufst du ${first} an?`,
		reminderWeek: (first, age) => `${first} wird in einer Woche ${age}`,
		reminderWeekBody: (dayMonth) => `Ein runder Geburtstag am ${dayMonth}`,
		reminderRemembrance: (name, n) => `† ${name}, ${n}. Todestag`,
		reminderRemembranceBody: (dayMonth) => `Gedenktag · ${dayMonth}`,
	},

	ics: {
		calName: "Geburtstage",
		birthdayTitle: (name) => `Geburtstag von ${name}`,
		birthdayDesc: (name) => `An diesem Tag hat ${name} Geburtstag`,
		deathTitle: (name) => `Todestag von ${name}`,
		deathDesc: (name) => `An diesem Tag jährt sich der Tod von ${name}`,
		fileSuffix: "termine",
		shareTitle: (tree) => `${tree} – Termine`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biologisch", "IN-LAW": "Angeheiratet", CHURCH: "Kirchlich", IRRELEVANT: "Sonstige" },
		// The partner-kind labels (married, lives with, partner, engaged) are adjectives on purpose:
		// the path view lower-cases them, and a lower-case noun would look misspelt.
		types: {
			IS_FATHER_OF: { label: "Vater", sentence: () => "ist der Vater von" },
			IS_MOTHER_OF: { label: "Mutter", sentence: () => "ist die Mutter von" },
			IS_MARRIED_TO: { label: "Verheiratet", sentence: () => "ist verheiratet mit" },
			LIVES_WITH: { label: "Zusammenlebend", sentence: () => "lebt zusammen mit" },
			IS_PARTNER_OF: { label: "Liiert", sentence: () => "ist liiert mit" },
			IS_ENGAGED_TO: { label: "Verlobt", sentence: () => "ist verlobt mit" },
			IS_GODPARENT_OF: {
				label: "Pate/Patin",
				sentence: (g) => gw(g, "ist der Pate von", "ist die Patin von"),
				role: (g) => gw(g, "Pate", "Patin"),
				inverseRole: (g) => gw(g, "Patensohn", "Patentochter"),
			},
			IS_FRIEND_OF: {
				label: "Freundschaft",
				sentence: () => "ist befreundet mit",
				role: (g) => gw(g, "Freund", "Freundin"),
				inverseRole: (g) => gw(g, "Freund", "Freundin"),
			},
			IS_STEPPARENT_OF: {
				label: "Stiefvater/-mutter",
				sentence: (g) => gw(g, "ist der Stiefvater von", "ist die Stiefmutter von"),
				role: (g) => gw(g, "Stiefvater", "Stiefmutter"),
				inverseRole: (g) => gw(g, "Stiefsohn", "Stieftochter"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Mutter",
			father: "Vater",
			child: "Kind",
			sibling: (g) => gw(g, "Bruder", "Schwester"),
			isSourceOf: (first, labelLower) => `${first} ist ${labelLower}`,
		},
	},

	kin: {
		you: "du",
		youTitle: "Du",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "Ehemann", "Ehefrau");
					case "partner":
						return gw(g, "Partner", "Partnerin");
					case "parentInLaw":
						return gw(g, "Schwiegervater", "Schwiegermutter");
					case "siblingInLaw":
						return gw(g, "Schwager", "Schwägerin");
					case "childInLaw":
						return gw(g, "Schwiegersohn", "Schwiegertochter");
					case "stepParent":
						return gw(g, "Stiefvater", "Stiefmutter");
					case "stepChild":
						return gw(g, "Stiefsohn", "Stieftochter");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) return u === 1 ? gw(g, "Vater", "Mutter") : cap(ur(u - 2) + gw(g, "großvater", "großmutter"));
			if (u === 0) return d === 1 ? gw(g, "Sohn", "Tochter") : cap(ur(d - 2) + gw(g, "enkel", "enkelin"));
			if (u === 1 && d === 1) return gw(g, "Bruder", "Schwester");
			if (d === 1) return u === 2 ? gw(g, "Onkel", "Tante") : cap(ur(u - 3) + gw(g, "großonkel", "großtante"));
			if (u === 1) return d === 2 ? gw(g, "Neffe", "Nichte") : cap(ur(d - 3) + gw(g, "großneffe", "großnichte"));
			if (u === d) {
				const degree = u - 1;
				const base = gw(g, "Cousin", "Cousine");
				return degree === 1 ? base : `${base} ${GRADES[degree] ?? `${degree}.`} Grades`;
			}
			// Cousins "removed": German has no single word, so the chain is used.
			return null;
		},
		word: (w: KinWord) => noun(w).nom.replace(/^(der|die|das) /, ""),
		/** Backwards in the genitive: "die Tochter des Bruders deiner Mutter"; one word: "deine Mutter". */
		chain: (words: KinWord[]) => {
			if (!words.length) return "du";
			if (words.length === 1) return possNom(words[0]);
			const last = words[words.length - 1];
			const middle = words.slice(1, -1).reverse().map(genArt);
			return [nomArt(last), ...middle, possGen(words[0])].join(" ");
		},
		/** Every term's grammatical gender is the person's gender: "dein Cousin", "deine Cousine". */
		phrase: (term, g) => `${g === "female" ? "deine" : "dein"} ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "Sohn von", "Tochter von");
				case "down":
					return gw(g, "Vater von", "Mutter von");
				case "sibling":
					return gw(g, "Bruder von", "Schwester von");
				case "spouse":
					return gw(g, "Ehemann von", "Ehefrau von");
				default:
					return typeSentence ?? "verwandt mit";
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			if (/^IS_GOD(PARENT|FATHER|MOTHER)_OF$/.test(typeName)) {
				if (farIsSource) return f ? { nom: "Patin", gen: "Patin" } : { nom: "Pate", gen: "Paten" };
				return f ? { nom: "Patentochter", gen: "Patentochter" } : { nom: "Patensohn", gen: "Patensohns" };
			}
			if (typeName === "IS_FRIEND_OF") return f ? { nom: "Freundin", gen: "Freundin" } : { nom: "Freund", gen: "Freundes" };
			if (/^IS_STEP(PARENT|FATHER|MOTHER)_OF$/.test(typeName)) {
				if (farIsSource) return f ? { nom: "Stiefmutter", gen: "Stiefmutter" } : { nom: "Stiefvater", gen: "Stiefvaters" };
				return f ? { nom: "Stieftochter", gen: "Stieftochter" } : { nom: "Stiefsohn", gen: "Stiefsohns" };
			}
			void bidirectional;
			// Unknown type: its (English) name, lower-case and undeclined, so the chain adds no article.
			const word = fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase();
			return { nom: word, gen: word };
		},
	},
};
