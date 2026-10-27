import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// Deutsch. Typed as Dict, so TypeScript fails when a key is missing.
// Register: the informal, lower-case "du" of consumer apps.

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

const people = (count: number) => simple("de", count, "Person", "Personen");
const relationships = (count: number) => simple("de", count, "Beziehung", "Beziehungen");
const themes: Record<ThemePref, string> = { light: "Hell", dark: "Dunkel", system: "System" };

/** Relationship types from ft_relationships_names that have a German phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Vater",
		edge: () => "Vater",
		sentence: (from, to) => `${from} ist der Vater von ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "Vater" : g(other, "Sohn", "Tochter")),
	},
	IS_MOTHER_OF: {
		type: "Mutter",
		edge: () => "Mutter",
		sentence: (from, to) => `${from} ist die Mutter von ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "Mutter" : g(other, "Sohn", "Tochter")),
	},
	IS_MARRIED_TO: {
		type: "Verheiratet",
		edge: () => "verheiratet",
		sentence: (from, to) => `${from} und ${to} sind verheiratet`,
		role: (_, other) => g(other, "Ehemann", "Ehefrau"),
	},
	LIVES_WITH: {
		type: "Zusammenlebend",
		edge: () => "leben zusammen",
		sentence: (from, to) => `${from} und ${to} leben zusammen`,
		role: (_, other) => g(other, "Lebensgefährte", "Lebensgefährtin"),
	},
	IS_PARTNER_OF: {
		type: "Liiert",
		edge: () => "liiert",
		sentence: (from, to) => `${from} und ${to} sind ein Paar`,
		role: (_, other) => g(other, "Partner", "Partnerin"),
	},
	IS_ENGAGED_TO: {
		type: "Verlobt",
		edge: () => "verlobt",
		sentence: (from, to) => `${from} und ${to} sind verlobt`,
		role: (_, other) => g(other, "Verlobter", "Verlobte"),
	},
	IS_GODPARENT_OF: {
		type: "Pate/Patin",
		edge: (from) => (from ? g(from, "Pate", "Patin") : "Pate/Patin"),
		sentence: (from, to, gender) =>
			`${from} ist ${gender ? g(gender, "der Pate", "die Patin") : "Pate oder Patin"} von ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "Pate", "Patin") : g(other, "Patensohn", "Patentochter"),
	},
	IS_FRIEND_OF: {
		type: "Freundschaft",
		edge: () => "befreundet",
		sentence: (from, to) => `${from} und ${to} sind befreundet`,
		role: (_, other) => g(other, "Freund", "Freundin"),
	},
	IS_STEPPARENT_OF: {
		type: "Stiefvater/-mutter",
		edge: (from) => (from ? g(from, "Stiefvater", "Stiefmutter") : "Stiefvater/-mutter"),
		sentence: (from, to, gender) =>
			`${from} ist ${gender ? g(gender, "der Stiefvater", "die Stiefmutter") : "Stiefelternteil"} von ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "Stiefvater", "Stiefmutter") : g(other, "Stiefsohn", "Stieftochter"),
	},
};

export const de: Dict = {
	locale: "de" as Locale,
	dateLocale: "de-DE",

	common: {
		appName: "Family Tree",
		createdBy: "Erstellt von tomek7667",
		cancel: "Abbrechen",
		save: "Speichern",
		done: "Fertig",
		close: "Schließen",
		dismiss: "Hinweis schließen",
		undo: "Rückgängig",
		edit: "Bearbeiten",
		remove: "Entfernen",
		optional: "optional",
		loading: "Wird geladen…",
		owner: "Besitzer",
		sharedWithYou: "Mit dir geteilt",
		viewerReadOnly: "Betrachter · nur lesen",
		creator: "Ersteller",
		someone: "Jemand",
		someoneLower: "jemand",
		unknownAccount: "unbekanntes Konto",
		you: "du",
		withYou: (name) => `${name} (du)`,
		male: "Männlich",
		female: "Weiblich",
		justNow: "gerade eben",
		people,
		relationships,
		mainNav: "Hauptnavigation",
		clearAll: "Alle zurücksetzen",
		addRelationship: "Beziehung hinzufügen",
		removeRelationship: "Beziehung entfernen",
		manageInvited: "Eingeladene verwalten",
		emailInvalid: "Das sieht nicht nach einer vollständigen E-Mail-Adresse aus.",
	},

	prefs: {
		group: "Darstellung",
		language: "Sprache",
		theme: "Design",
		themes,
		themeCycle: (current, next) => `Design: ${themes[current]}. Wechseln zu ${themes[next]}.`,
	},

	meta: {
		description:
			"Ein privater Stammbaum, als Graph gezeichnet. Füge die Menschen hinzu, die du kennst, verbinde sie über ihre Beziehungen und sieh, wie sich die Generationen nach Geburtsjahr ordnen.",
		signIn: "Anmelden",
		signUp: "Registrieren",
		account: "Konto",
		trees: "Deine Stammbäume",
		tree: "Stammbaum",
		privacy: "Datenschutzerklärung",
		privacyDescription: "Was Family Tree speichert, warum, und wie du es löschst.",
		deleteAccount: "Konto löschen",
		deleteAccountDescription: "So löschst du dein Konto und deine Daten bei Family Tree.",
	},

	legal: {
		privacy: "Datenschutz",
		deleteAccount: "Konto löschen",
		signIn: "Anmelden",
		privacyTitle: "Datenschutzerklärung",
		privacyEffective: "Gültig ab 25. September 2026",
		deleteTitle: "Dein Konto löschen",
		deleteAppliesTo:
			"Gilt für die Website von Family Tree und die App Family Tree für Android und iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Mein Konto bei Family Tree löschen",
		deleteMailBody: (email) =>
			`Bitte löschen Sie mein Konto bei Family Tree${email ? ` (${email})` : ""} und alle Stammbäume, die ich erstellt habe.`,
	},

	errorPage: {
		title: "Etwas ist schiefgelaufen",
		home: "Zur Startseite",
	},

	landing: {
		nav: {
			features: "Funktionen",
			calendar: "Kalender",
			mobile: "App",
			how: "So funktioniert es",
			logIn: "Anmelden",
			signUp: "Registrieren",
			openMenu: "Menü öffnen",
			closeMenu: "Menü schließen",
		},
		deleted: "Dein Konto und deine Stammbäume wurden gelöscht.",
		eyebrow: "Ein privater Stammbaum, als Graph gezeichnet",
		title: "Jede Familie ist ein Graph. Zeichne deinen.",
		lead:
			"Füge die Menschen hinzu, die du kennst, verbinde sie über ihre Beziehungen und sieh zu, wie sich die Generationen nach Geburtsjahr ordnen. Standardmäßig privat, geteilt nur mit den Verwandten, die du einlädst.",
		cta: "Starte deinen Stammbaum, kostenlos",
		logIn: "Anmelden",
		fine: "Keine Werbung, keine öffentlichen Profile.",
		treeEyebrow: "Der Stammbaum",
		treeTitle: "Kästchen und Linien statt Formulare und Tabellen.",
		treeBody:
			"Du baust den Stammbaum so, wie du ihn auf die Rückseite eines Briefumschlags skizzieren würdest: eine Karte für jede Person, eine Linie für jede Beziehung. Ziehen, zoomen und auf jemanden klicken, um zu sehen, wer das ist.",
		decades: ["1920er", "1940er", "1970er", "2000er"],
		timelineTitle: "Eine Zeitachse der Generationen",
		timelineBody:
			"Personen liegen auf einer senkrechten Achse nach Geburtsjahr. Großeltern oben, Enkel unten, und alle zwanzig Jahre ein neues Band. Du fragst dich nie mehr, wer zuerst da war.",
		lines: {
			biological: "Biologisch",
			married: "Verheiratet",
			livesWith: "Lebt zusammen",
			church: "Kirchlich",
			other: "Sonstige",
		},
		kindsTitle: "Vier Arten von Familie",
		kindsBody:
			"Blut, Ehe, Paten und der Nachbar, den alle Onkel nennen. Jede Gruppe hat ihre eigene Linie: Eine Ehe ist der kräftigste Strich auf der Seite, „lebt zusammen“ der zarteste. So liest sich der Stammbaum auf einen Blick und erzählt trotzdem die ganze Geschichte.",
		chips: ["Alter 40–90", "Ausblenden: Angeheiratet", "Nur Frauen", "Ohne: Nowak"],
		filtersTitle: "Filter, die den Lärm ausblenden",
		filtersBody:
			"Blende einen Beziehungstyp aus, grenze das Alter ein, zeige eine Seite der Familie. Was auf dem Bildschirm bleibt, wird exportiert.",
		calendarEyebrow: "Kalender-Export",
		calendarTitle: "Jeder Geburtstag. Jeder Gedenktag. In dem Kalender, den du schon benutzt.",
		calendarBody:
			"Ein Klick macht aus dem sichtbaren Teil deines Stammbaums eine .ics-Datei: ein jährlicher Geburtstag für jede lebende Person und ein jährlicher Gedenktag für jede verstorbene. Einmal in Google Kalender, Apple Kalender oder Outlook importieren, und es wiederholt sich für immer.",
		pills: ["Geburtstage, jährlich", "Gedenktage", "Folgt deinen Filtern"],
		calendarMonth: "Oktober",
		calendarFile: "familie-kowalski.ics",
		calendarRows: [
			{ dow: "Sa.", title: "Geburtstag von Maria Kowalska", meta: "Geburtstag · jährlich" },
			{ dow: "Do.", title: "† Stanisław Kowalski, Gedenktag", meta: "Gedenktag · jährlich" },
			{ dow: "Mi.", title: "Geburtstag von Zofia Nowak", meta: "Geburtstag · jährlich" },
		],
		privateEyebrow: "Standardmäßig privat",
		privateTitle: "Deiner, und der Menschen, die du einlädst.",
		privateBody:
			"Es gibt keine öffentlichen Stammbäume und keine Suche über Familien hinweg. Du erstellst einen Stammbaum, lädst Verwandte per E-Mail ein, und sie können schauen, aber nichts ändern. Überleg es dir anders und entziehe den Zugriff mit einem Klick.",
		privateYou: "tomek (du)",
		privateCreator: "Ersteller · kann alles bearbeiten",
		privateOwner: "Besitzer",
		privateInvited: "Eingeladen · nur lesen",
		privateRevoke: "Entziehen",
		privateInvite: "Per E-Mail einladen…",
		mobileEyebrow: "iPhone und Android",
		mobileTitle: "Der Stammbaum in der Tasche, für die Momente, in denen du ihn brauchst.",
		mobileBody:
			"Auf einer Hochzeit und du kannst ein Gesicht nicht einordnen? Such den Namen und sieh, wie ihr verwandt seid. Die App führt außerdem eine Liste der nächsten Geburtstage und Gedenktage, erinnert dich am Vortag und lässt dich mit ein paar Tipps einen neuen Verwandten samt Foto hinzufügen.",
		appStoreSmall: "Demnächst im",
		playStoreSmall: "DEMNÄCHST BEI",
		phoneUpcoming: "Demnächst",
		phoneRows: [
			{ t: "Maria wird 75", m: "Sa., 3. Okt. · in 8 Tagen" },
			{ t: "† Stanisław, 28. Todestag", m: "Do., 15. Okt." },
			{ t: "Zofia wird 21", m: "Mi., 28. Okt." },
		],
		phoneRelation: "1976 · 50 · die Cousine deiner Mutter",
		howTitle: "So funktioniert es",
		steps: [
			{
				title: "Fang mit dir selbst an",
				body: "Erstelle einen Stammbaum und füge die erste Person hinzu: ein Name, ein Geburtsdatum und ein Foto, wenn du eins hast.",
			},
			{
				title: "Verbinde die Menschen, die du kennst",
				body: "Eltern, Partner, Paten. Wähle zwei Personen und eine Beziehung, und die Linie zeichnet sich von selbst in die richtige Generation.",
			},
			{
				title: "Lade die Familie ein",
				body: "Teile Lesezugriff per E-Mail, exportiere die Termine in deinen Kalender und hab den Stammbaum auf dem Telefon dabei.",
			},
		],
		minute: "Dauert etwa eine Minute.",
		hero: {
			label: "Beispiel-Stammbaum mit vier Generationen",
			married: "verheiratet",
			godparent: "Pate",
		},
	},

	auth: {
		signInPrompt: "Neu hier?",
		signInLink: "Konto erstellen",
		signUpPrompt: "Du hast schon ein Konto?",
		signUpLink: "Anmelden",
		missingCredentials: "Gib deinen Benutzernamen oder deine E-Mail-Adresse und dein Passwort ein.",
		unreachable: "Der Server war nicht erreichbar. Versuch es noch einmal.",
		wrongCredentials: "Falscher Benutzername oder falsches Passwort. Prüfe beides und versuch es noch einmal.",
		resetEmailMissing: "Gib die E-Mail-Adresse deines Kontos ein.",
		resetSent: (email) =>
			`Wenn zu ${email} ein Konto gehört, ist ein Link zum Zurücksetzen unterwegs. Schau in dein Postfach.`,
		resetFailed: "Die E-Mail zum Zurücksetzen konnte nicht gesendet werden. Versuch es noch einmal.",
		resetTitle: "Passwort zurücksetzen",
		resetSubtitle: "Wir schicken dir per E-Mail einen Link, mit dem du ein neues wählst.",
		welcomeTitle: "Willkommen zurück",
		welcomeSubtitle: "Melde dich an, um deine Stammbäume zu öffnen.",
		email: "E-Mail",
		usernameOrEmail: "Benutzername oder E-Mail",
		password: "Passwort",
		forgot: "Vergessen?",
		sending: "Wird gesendet…",
		sendReset: "Link zum Zurücksetzen senden",
		signingIn: "Anmeldung läuft…",
		signIn: "Anmelden",
		backToSignIn: "Zurück zur Anmeldung",
		noAccount: "Noch kein Konto?",
		signUp: "Registrieren",
		showPassword: "Passwort anzeigen",
		hidePassword: "Passwort ausblenden",
		pickUsername: "Wähle einen Benutzernamen.",
		minPassword: (min) => `Mindestens ${simple("de", min, "Zeichen", "Zeichen")}.`,
		passwordsDiffer: "Die Passwörter stimmen nicht überein.",
		createFailed: "Das Konto konnte nicht erstellt werden.",
		signInAfterCreateFailed: (message) =>
			`Dein Konto wurde erstellt, aber die Anmeldung ist fehlgeschlagen: ${message}. Versuch, dich anzumelden.`,
		unknownError: "unbekannter Fehler",
		registerTitle: "Starte deinen Stammbaum",
		registerSubtitle: "Kostenlos, privat, ohne Werbung.",
		username: "Benutzername",
		displayName: "Anzeigename",
		confirmPassword: "Passwort bestätigen",
		creating: "Konto wird erstellt…",
		create: "Konto erstellen",
		registerNote:
			"Wir senden dir eine Bestätigungs-E-Mail. Deinen Stammbaum sehen nur du und die Menschen, die du einlädst.",
	},

	nav: {
		trees: "Stammbäume",
		account: "Dein Konto",
		logOut: "Abmelden",
	},

	account: {
		title: "Dein Konto",
		username: "Benutzername:",
		displayName: "Anzeigename:",
		email: "E-Mail:",
		deleteHeading: "Konto löschen",
		deleteBodyBefore:
			"Löscht dein Konto und jeden Stammbaum, den du erstellt hast, mit allen Personen, Fotos und Beziehungen darin. Stammbäume, die andere mit dir geteilt haben, sind nicht betroffen. Siehe die ",
		deleteBodyLink: "Datenschutzerklärung",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Dein Konto konnte hier nicht gelöscht werden (${error}). `,
		failedLink: "Schick stattdessen einen Löschantrag per E-Mail",
		failedAfter: ", dann wird es innerhalb von 30 Tagen erledigt.",
		deleteButton: "Konto löschen…",
		confirmTitle: "Dein Konto löschen?",
		confirmBody:
			"Das löscht dein Konto und jeden Stammbaum, den du erstellt hast, mit allen Personen, Fotos und Beziehungen darin. Eingeladene verlieren den Zugriff. Das lässt sich nicht rückgängig machen.",
		confirmLabel: "Alles löschen",
		keep: "Konto behalten",
		typeToConfirm: "Gib LÖSCHEN ein, um zu bestätigen",
		confirmWords: ["löschen", "loeschen", "delete"],
	},

	dashboard: {
		onlyYou: "Nur du",
		viewers: (count) => simple("de", count, "Betrachter", "Betrachter"),
		byCreator: (name) => `von ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}aktualisiert ${ago}`,
		moreActions: (name) => `Weitere Aktionen für ${name}`,
		rename: "Umbenennen",
		deleteTree: "Stammbaum löschen…",
		open: "Öffnen",
		emptyTitle: "Noch keine Stammbäume",
		emptyBody:
			"Fang mit den Menschen an, die du am besten kennst: dir selbst, deinen Eltern, deinen Großeltern. Den Rest der Familie kannst du einladen, sobald es etwas zu sehen gibt.",
		createFirst: "Erstelle deinen ersten Stammbaum",
		emptyNote: "Du wartest auf eine Einladung? Mit dir geteilte Stammbäume erscheinen hier automatisch.",
		title: "Deine Stammbäume",
		count: (total, owned, shared) =>
			`${simple("de", total, "Stammbaum", "Stammbäume")}${shared > 0 ? ` · ${owned} eigene, ${shared} mit dir geteilt` : ""}`,
		newTree: "Neuer Stammbaum",
	},

	treeDialogs: {
		nameRequired: "Gib dem Stammbaum einen Namen.",
		created: "Stammbaum erstellt",
		newTitle: "Neuer Stammbaum",
		newSubtitle: "Gib ihm einen Namen, den du laut aussprechen würdest.",
		treeName: "Name des Stammbaums",
		namePlaceholder: "Mein Stammbaum",
		nameHint: "Zum Beispiel „Familie Kowalski“ oder „Mamas Seite“.",
		createAndOpen: "Erstellen und öffnen",
		nameEmpty: "Der Name darf nicht leer sein.",
		renamed: "Stammbaum umbenannt",
		renameTitle: "Stammbaum umbenennen",
		alreadyHasAccess: "Diese Person hat bereits Zugriff.",
		noAccount: "Zu dieser E-Mail-Adresse gibt es noch kein Konto bei Family Tree.",
		thatsYou: "Das bist du. Dir gehört dieser Stammbaum bereits.",
		invited: (email, tree) => `${email} kann ${tree} jetzt ansehen`,
		revoked: "Zugriff entzogen",
		whoCanSee: (tree) => `Wer ${tree} sehen kann`,
		whoCanSeeSubtitle:
			"Eingeladene können schauen, aber nicht bearbeiten. Sie brauchen ein Konto bei Family Tree mit dieser E-Mail-Adresse.",
		emailPlaceholder: "name@beispiel.de",
		emailToInvite: "E-Mail-Adresse zum Einladen",
		invite: "Einladen",
		revoke: "Entziehen",
		deleteTitle: (tree) => `„${tree}“ löschen?`,
		deleteBody: (count, viewers) =>
			`Das entfernt ${count === null ? "alle Personen darin" : people(count)} und alle ihre Beziehungen${
				viewers > 0 ? ` – für dich und ${simple("de", viewers, "eingeladene Person", "eingeladene Personen")}` : ""
			}. Das lässt sich nicht rückgängig machen.`,
		deleted: (tree) => `${tree} gelöscht`,
		deleteConfirm: "Stammbaum löschen",
		keep: "Behalten",
		typeName: "Gib den Namen des Stammbaums ein, um zu bestätigen",
	},

	tree: {
		legend: "Legende",
		deceased: "† verstorben",
		filtersCleared: "Filter zurückgesetzt, um die Person zu zeigen",
		unknownType: "Unbekannt",
		chipHide: (type) => `Ausblenden: ${type}`,
		chipAge: (min, max, plus) => `Alter ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Nur Männer",
		chipWomen: "Nur Frauen",
		chipNot: (names) => `Ohne: ${names}`,
		chipOnly: (names) => `Nur: ${names}`,
		removeFilter: (text) => `Filter ${text} entfernen`,
		exported: (filename, count) => `${filename} heruntergeladen · ${people(count)}`,
		calendarFailed: "Der Kalender konnte nicht erstellt werden",
		back: "Zurück zu den Stammbäumen",
		openFailed: "Dieser Stammbaum konnte nicht geöffnet werden",
		backToTrees: "Zurück zu deinen Stammbäumen",
		loadingTree: "Stammbaum wird geladen…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Noch niemand hier",
		emptyOwner:
			"Füge die erste Person hinzu – du selbst bist ein guter Anfang. Alle, die du hinzufügst, ordnen sich nach Geburtsjahr.",
		emptyViewer: "Der Ersteller hat diesem Stammbaum noch niemanden hinzugefügt.",
		addFirst: "Erste Person hinzufügen",
		editToolbar: "Stammbaum bearbeiten",
		viewToolbar: "Ansicht",
		addPerson: "Person hinzufügen",
		findPerson: "Person finden",
		filters: "Filter",
		exportCalendar: "In den Kalender exportieren",
		zoomIn: "Vergrößern",
		zoomOut: "Verkleinern",
		fit: "An den Bildschirm anpassen",
		visible: (shown, total) => `${shown} von ${people(total)} sichtbar`,
		saved: "Änderungen gespeichert",
		added: (name) => `${name} zum Stammbaum hinzugefügt`,
		relationshipAdded: "Beziehung hinzugefügt",
		removePersonTitle: (name) => `${name} entfernen?`,
		removePersonBody: (count) =>
			`Dadurch ${count === 1 ? "wird" : "werden"} auch ${relationships(count)} dieser Person entfernt. Das lässt sich nicht rückgängig machen.`,
		removePerson: "Person entfernen",
		personRemoved: (name) => `${name} entfernt`,
		removeEdgeTitle: "Diese Beziehung entfernen?",
		removeEdgeBody: (sentence) => `${sentence}. Beide Personen bleiben im Stammbaum.`,
		relationshipRemoved: "Beziehung entfernt",
		canvas: "Zeichenfläche des Stammbaums. Ziehen zum Verschieben, Scrollen zum Zoomen.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", verstorben" : ""}${
				link === "you" ? ", das bist du" : link === "linked" ? ", mit einem Konto verknüpft" : ""
			}`,
		youPill: "Du",
		legendYou: "Du",
		legendLinked: "Verknüpftes Konto",
		band: (year) => `${year}er`,
	},

	panel: {
		details: (name) => `Details zu ${name}`,
		removeWith: (name) => `Beziehung mit ${name} entfernen`,
		noRelationships: "Noch keine Beziehungen.",
		showFamily: "Weitere Familie anzeigen",
		hideFamily: "Weitere Familie ausblenden",
		noFamily: "Keine Eltern- oder Eheverbindungen, aus denen sich die weitere Familie ableiten ließe.",
		removeNamed: (name) => `${name} entfernen`,
		readOnly: "Nur lesen. Nur der Ersteller des Stammbaums kann bearbeiten.",
		thisIsYou: "Das bist du",
		linkedTo: (email) => `Verknüpft mit ${email}`,
		note: "Notiz",
		relationship: "Beziehung",
		bidirectional: "beidseitig",
		directional: "gerichtet →",
	},

	filters: {
		hideTypes: "Beziehungstypen ausblenden",
		hideTypesHint: "Durchgestrichene Typen sind auf der Zeichenfläche und im Export ausgeblendet.",
		age: "Alter",
		minimum: "Mindestens",
		maximum: "Höchstens",
		ageHint: "Bei Verstorbenen zählt das Alter beim Tod.",
		gender: "Geschlecht",
		everyone: "Alle",
		men: "Männer",
		women: "Frauen",
		includeByName: "Nur Namen anzeigen, die enthalten",
		includeHint: "Mit Kommas getrennt. Behält Personen, deren Name einen der Teile enthält.",
		excludeByName: "Nach Namen ausschließen",
		excludeHint: "Mit Kommas getrennt. Passt auf jeden Teil eines Namens, ohne Rücksicht auf Groß-/Kleinschreibung und Akzente.",
	},

	dialogs: {
		findTitle: "Person finden",
		findPlaceholder: "Namen eingeben…",
		searchPeople: "Personen suchen",
		noResults: "Niemand mit diesem Namen.",
		nameRequired: "Gib einen Namen ein.",
		birthRequired: "Gib ein Geburtsdatum ein.",
		deathBeforeBirth: "Das Sterbedatum liegt vor dem Geburtsdatum.",
		editPerson: "Person bearbeiten",
		addPerson: "Person hinzufügen",
		personSubtitle: "Name und Geburtsdatum sind erforderlich. Alles andere kann warten.",
		changePhoto: "Foto ändern",
		uploadPhoto: "Foto hochladen",
		photoHint: "JPG oder PNG, bis 5 MB. Quadratisch passt am besten.",
		photoTooLarge: "Dieses Foto ist größer als 5 MB.",
		fullName: "Vollständiger Name",
		namePlaceholder: "z. B. Maria Kowalska",
		birthDate: "Geburtsdatum",
		deathDate: "Sterbedatum",
		note: "Notiz",
		noteHint: "Alles, was man sich merken sollte: ein Geburtsname, ein Wohnort, eine Geschichte.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `Die Notiz darf höchstens ${max} Zeichen lang sein.`,
		linkedAccount: "Verknüpftes Konto",
		linkedHint: "Das Konto dieser Person bei Family Tree, falls sie Zugriff auf den Stammbaum hat.",
		linkedNone: "Keins",
		linkedMe: (name) => `Ich (${name})`,
		linkedConflict: (account, person) =>
			`${account} ist bereits mit ${person} verknüpft. Ein Konto kann nur mit einer Person verknüpft sein; hebe die Verknüpfung also zuerst dort auf.`,
		saveChanges: "Änderungen speichern",
		addToTree: "Zum Stammbaum hinzufügen",
		search: "Suchen…",
		readAsSentence: "Als Satz gelesen:",
		duplicate: "Diese Beziehung ist bereits im Stammbaum.",
		fromPerson: "Von Person",
		toPerson: "Zu Person",
		relationType: "Beziehungstyp",
		bothWays: "in beide Richtungen",
		oneWay: "in eine Richtung",
		exportTitle: "In den Kalender exportieren",
		exportHeading: (count) => `${people(count)} in deinen Kalender exportieren`,
		exportBody:
			"Eine einzelne .ics-Datei mit einem jährlichen Geburtstag für jede lebende Person und einem jährlichen Gedenktag für jede verstorbene. Ausgeblendete Personen sind nicht enthalten.",
		birthdays: "Geburtstage",
		remembrances: "Gedenktage",
		download: ".ics herunterladen",
	},

	person: {
		/** "78 Jahre" / "gestorben mit 77 Jahren" (dative after "mit"). */
		age: (age, _gender, deceased) =>
			deceased ? `gestorben mit ${simple("de", age, "Jahr", "Jahren")}` : simple("de", age, "Jahr", "Jahre"),
	},

	family: {
		/** 0 → Großeltern, 1 → Urgroßeltern, 2 → Ururgroßeltern, … */
		ancestors: (level) => `${level === 0 ? "G" : `Ur${"ur".repeat(level - 1)}g`}roßeltern`,
		descendants: (level) => (level === 0 ? "Enkel" : `Ur${"ur".repeat(level - 1)}enkel`),
		parents: "Eltern",
		auntsAndUncles: "Tanten und Onkel",
		siblings: "Geschwister",
		children: "Kinder",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biologisch",
			"IN-LAW": "Angeheiratet",
			CHURCH: "Kirchlich",
			IRRELEVANT: "Sonstige",
		},
		legend: {
			married: "Verheiratet",
			livesWith: "Lebt zusammen",
		},
		known,
		// Unknown types keep their English database name, so arrows avoid a half-German sentence.
		fallbackSentence: (from, phrase, _isVerb, to) => `${from} → ${phrase} → ${to}`,
		fallbackRole: (phrase, _isVerb, firstName, selectedIsSource) =>
			selectedIsSource ? `${firstName} → ${phrase}` : `${phrase} → ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name}, Gedenktag`,
		remembranceDescription: (name, born) => `Todestag von ${name} (geboren ${born}).`,
		birthdayTitle: (name) => `Geburtstag von ${name}`,
		birthdayDescription: (name, born) => `${name} wurde ${born} geboren.`,
		fileFallback: "stammbaum",
	},
};
