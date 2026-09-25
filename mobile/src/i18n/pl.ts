import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { plForm } from "./plural";

// Polski. Typed as Dict: a missing or mistyped key does not compile.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
const lat = (n: number) => `${n} ${plForm(n, "rok", "lata", "lat")}`;
const osob = (n: number) => `${n} ${plForm(n, "osoba", "osoby", "osób")}`;
const pra = (n: number) => (n > 0 ? "pra".repeat(n) : "");
const STOPIEN = ["", "", "drugiego", "trzeciego", "czwartego", "piątego", "szóstego", "siódmego", "ósmego"];

/** Nominative / genitive of the nouns used in relationship chains. */
function noun(w: KinWord): { nom: string; gen: string } {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? { nom: "matka", gen: "matki" } : { nom: "ojciec", gen: "ojca" };
		case "child":
			return f ? { nom: "córka", gen: "córki" } : { nom: "syn", gen: "syna" };
		case "sibling":
			return f ? { nom: "siostra", gen: "siostry" } : { nom: "brat", gen: "brata" };
		case "spouse":
			return f ? { nom: "żona", gen: "żony" } : { nom: "mąż", gen: "męża" };
		case "partner":
			return f ? { nom: "partnerka", gen: "partnerki" } : { nom: "partner", gen: "partnera" };
		default:
			return w.noun ?? { nom: "krewny", gen: "krewnego" };
	}
}

export const pl: Dict = {
	lang: "pl",
	locale: "pl-PL",

	common: {
		cancel: "Anuluj",
		done: "Gotowe",
		save: "Zapisz",
		saving: "Zapisywanie…",
		close: "Zamknij",
		back: "Wstecz",
		change: "Zmień",
		tryAgain: "Spróbuj ponownie",
		add: "Dodaj",
		create: "Utwórz",
		creating: "Tworzenie…",
		edit: "Edytuj",
		remove: "Usuń",
		keep: "Zostaw",
		continue: "Dalej",
		undo: "Cofnij",
		openSettings: "Otwórz Ustawienia",
		settings: "Ustawienia",
		signIn: "Zaloguj się",
		you: "Ty",
		loading: "Wczytywanie",
		familyTree: "Family Tree",
		owner: "Właściciel",
		sharedWithYou: "Udostępnione Tobie",
		male: "Mężczyzna",
		female: "Kobieta",
		show: "Pokaż",
		hide: "Ukryj",
		showPassword: "Pokaż hasło",
		hidePassword: "Ukryj hasło",
		chooseDate: "Wybierz datę",
		dateA11y: (label, value) => `${label}: ${value}. Zmień`,
		closeDatePicker: "Zamknij wybór daty",
		removeFilter: (label) => `Usuń filtr ${label}`,
		searchByName: "Szukaj po imieniu",
		noOneCalled: (q) => `Nie ma nikogo o imieniu „${q}”.`,
		noOneToChoose: "Nie ma jeszcze kogo wybrać.",
		selected: "wybrano",
		reminderScheduled: "Przypomnienie zaplanowane",
		noReminder: "Bez przypomnienia",
		range: (lo, hi) => `od ${lo} do ${hi}`,
	},

	offline: {
		banner: "Jesteś offline. Widzisz ostatnią zapisaną kopię drzewa.",
		short: "Jesteś offline.",
		write: "Jesteś offline — zmian nie można zapisać.",
	},

	save: {
		failedOffline: (what) => `Nie udało się zapisać: ${what}. Jesteś offline lub serwer jest niedostępny. Nic nie przepadło — spróbuj ponownie.`,
		failed: (what, reason) => `Nie udało się zapisać: ${what}. ${reason}`,
		noTree: "Żadne drzewo nie jest otwarte, więc nic nie zapisano. Wybierz drzewo i spróbuj ponownie.",
		theChanges: "zmiany",
		thisPerson: "ta osoba",
		theRelationship: "relacja",
		theTree: "drzewo",
	},

	errors: {
		network: "Brak połączenia. Sprawdź internet i spróbuj ponownie.",
		generic: "Coś poszło nie tak.",
		notSignedIn: "Nie jesteś zalogowany.",
		passwordsDontMatch: "Hasła się różnią.",
		sessionExpired: "Sesja wygasła. Zaloguj się ponownie.",
		shareUnavailable: "Udostępnianie nie jest dostępne na tym urządzeniu.",
	},

	tabs: {
		home: "Start",
		tree: "Drzewo",
		add: "Dodaj",
		find: "Szukaj",
		dates: "Daty",
		settings: "Ustawienia",
		addPerson: "Dodaj osobę",
		findPerson: "Znajdź osobę",
	},

	prefs: {
		language: "Język",
		languageSystem: "Systemowy",
		appearance: "Wygląd",
		theme: "Motyw",
		system: "Systemowy",
		light: "Jasny",
		dark: "Ciemny",
	},

	onboarding: {
		title1: "Twoja rodzina jako graf.",
		body1: "Osoby to karty, relacje to linie, a pokolenia układają się według roku urodzenia. Prywatnie — widzą je tylko zaproszeni.",
		title2: "Nie przegap urodzin ani rocznicy śmierci.",
		body2: "Dyskretne przypomnienie dzień wcześniej. Wszystko zostaje na Twoim telefonie; nic do nas nie wysyłamy.",
		page: (n, total) => `Strona ${n} z ${total}`,
		haveAccount: "Mam już konto",
		turnOnReminders: "Włącz przypomnienia",
		notNow: "Nie teraz",
		previewTitle1: "Babcia Maria jutro kończy 75 lat",
		previewWhen1: "Jutro",
		previewBody1: "Okrągłe urodziny. Może zadzwonisz do Marii?",
		previewTitle2: "† Stanisław Kowalski, 28. rocznica śmierci",
		previewWhen2: "15 paź",
	},

	auth: {
		welcomeBack: "Witaj ponownie",
		signInSubtitle: "Zaloguj się kontem Family Tree.",
		usernameOrEmail: "Nazwa użytkownika lub e-mail",
		password: "Hasło",
		forgot: "Nie pamiętasz hasła?",
		newHere: "Pierwszy raz tutaj?",
		createAccount: "Załóż konto",
		enterBoth: "Podaj nazwę użytkownika lub e-mail oraz hasło.",
		wrongCredentials: "Nieprawidłowa nazwa użytkownika lub hasło.",
		forgotHowTo: "Wpisz swój adres e-mail w pierwszym polu i ponownie stuknij „Nie pamiętasz hasła?”.",
		resetTitle: "Resetowanie hasła",
		resetConfirm: (email) => `Wysłać link do zresetowania hasła na ${email}?`,
		send: "Wyślij",
		checkInbox: "Sprawdź skrzynkę",
		checkInboxBody: "Jeśli ten adres ma konto, link do zresetowania hasła jest już w drodze.",
		couldntSend: "Nie udało się wysłać",
		signInAgain: "Zaloguj się ponownie",
		sessionEnded: "Sesja wygasła. Nic nie przepadło — drzewo nadal tu jest.",
		passwordFor: (who) => `Hasło dla ${who}`,
		differentAccount: "Użyj innego konta",
		startTree: "Załóż swoje drzewo",
		freePrivate: "Za darmo, prywatnie, bez reklam.",
		username: "Nazwa użytkownika",
		displayName: "Wyświetlana nazwa (opcjonalnie)",
		yourName: "Twoje imię",
		email: "E-mail",
		confirmPassword: "Powtórz hasło",
		step1: "Hasło i jego potwierdzenie w następnym kroku. Krok 1 z 2.",
		step2: (email) => `Wyślemy e-mail weryfikacyjny na ${email}. Krok 2 z 2.`,
		usernameRule: "Co najmniej 3 litery lub cyfry, bez spacji.",
		emailInvalid: "To nie wygląda na adres e-mail.",
		passwordRule: "Użyj co najmniej 8 znaków.",
		createAccountButton: "Załóż konto",
		agreePrefix: "Zakładając konto, akceptujesz ",
		privacyPolicy: "politykę prywatności",
		agreeSuffix: ".",
	},

	home: {
		offline: "Jesteś offline",
		couldntLoadTrees: "Nie udało się wczytać drzew",
		connectFirstTime: "Połącz się z internetem, aby po raz pierwszy zobaczyć swoje drzewa.",
		noTrees: "Nie masz jeszcze drzew",
		noTreesBody: "Zacznij od siebie i swoich rodziców. Zaproszenia od krewnych pojawią się tutaj same.",
		createFirst: "Utwórz pierwsze drzewo",
		treeUnavailable: "To drzewo jest niedostępne",
		couldntOpen: "Nie udało się otworzyć drzewa",
		treeUnavailableBody: "Mogło zostać usunięte albo właściciel przestał Ci je udostępniać.",
		noCopy: "Na tym telefonie nie ma jeszcze kopii tego drzewa. Połącz się i spróbuj ponownie.",
		chooseTree: "Wybierz drzewo",
		switchTree: "Zmień drzewo",
		lookingFor: "Kogo szukasz?",
		upcoming: "Wkrótce",
		seeAll: "Wszystkie",
		noUpcoming: "Brak nadchodzących dat",
		noUpcomingEmpty: "Urodziny i rocznice śmierci pojawią się tutaj, gdy w drzewie będą osoby.",
		noUpcomingYear: "Nic w ciągu najbliższych dwunastu miesięcy.",
		noOne: "Jeszcze nikogo tu nie ma",
		addYourself: "Najpierw dodaj siebie. Każda kolejna osoba łączy się z kimś, kto już jest w drzewie.",
		ownerAddedNoOne: "Właściciel nie dodał jeszcze nikogo.",
		addFirst: "Dodaj pierwszą osobę",
		quick: "Na skróty",
		addPerson: "Dodaj osobę",
		linkTwo: "Połącz dwie osoby",
		aboutTree: "To drzewo",
		detailHint: "Stuknij datę po lewej, aby zobaczyć tutaj tę osobę.",
	},

	tree: {
		loading: "Wczytywanie drzewa…",
		removeTitle: (name) => `Usunąć: ${name}?`,
		removeBody: "Relacje tej osoby też zostaną usunięte. Tego nie można cofnąć.",
		removed: (name) => `Usunięto: ${name}`,
		addRelationship: "Dodaj relację",
		focusedOn: (name) => `Skupiono na: ${name}`,
		parents: "rodzice",
		partner: "partner",
		partners: "partnerzy",
		children: "dzieci",
		exitFocus: "Zakończ skupienie",
		search: "Szukaj",
		filters: "Filtry",
		filtersActive: (n) => `Filtry, aktywne: ${n}`,
		goUpTo: (name) => `Wyżej: ${name}`,
		resetView: "Pokaż całość",
		fitAll: "Dopasuj całe drzewo",
		allFiltered: "Filtry ukryły wszystkich",
		clearFilters: "Wyczyść filtry",
		canvasA11y: (n) => `Drzewo rodzinne, ${osob(n)}. Użyj wyszukiwania, aby kogoś znaleźć.`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "Legenda",
		legendBio: "Biol.",
		legendMarried: "Małżeństwo",
		legendLivesWith: "Mieszkają razem",
		legendInLaw: "Powinow.",
		legendChurch: "Kościelne",
		legendOther: "Inne",
		youPill: "Ty",
		legendYou: "Ty",
		panelHint: "Stuknij osobę, aby zobaczyć tutaj szczegóły.",
		panelTitle: "Szczegóły",
	},

	person: {
		gone: "Tej osoby nie ma już w drzewie.",
		ageAlive: (g, age) => `${g} · ${lat(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · zm. w wieku ${lat(age)}${wouldBe ? ` · miał(a)by ${lat(wouldBe)}` : ""}`,
		you: "Ty",
		focus: "Skup",
		focusOnTree: "Pokaż w drzewie",
		howRelated: "Jak jesteśmy spokrewnieni?",
		turns: (n) => `Skończy ${lat(n)}`,
		remembranceDay: "Rocznica śmierci",
		remindMe: "Przypomnij",
		noRelationshipsOwner: "Brak relacji. Dodaj relację, aby połączyć tę osobę z drzewem.",
		noRelationships: "Brak relacji.",
		dragUp: "Przeciągnij w górę, aby zobaczyć wszystkie relacje",
		removedFromTree: (name) => `Usunięto z drzewa: ${name}`,
		couldntRemove: (name, reason) => `Nie udało się usunąć: ${name}. ${reason}`,
		open: "Otwórz",
		removeRelationship: "Usuń relację",
		relationshipRemoved: "Relacja usunięta",
		sharedBy: (email) => `Udostępnione Tobie${email ? ` przez ${email}` : ""}. Edytować może tylko właściciel.`,
		removeA11y: (name) => `Usuń: ${name}`,
		thisIsYou: "To Ty",
		linkedTo: (email) => `Powiązano z ${email}`,
		linkedToAccount: "Powiązano z kontem",
		note: "Notatka",
	},

	path: {
		whichIsYou: "Kim jesteś w tym drzewie?",
		needMe: (first) =>
			`Aby pokazać, jak ${first} jest z Tobą spokrewniona(-y), aplikacja musi wiedzieć, która osoba w drzewie to Ty. Wybierasz raz; wybór zostaje na tym telefonie.`,
		chooseWho: "Wskaż siebie",
		notConnected: "Brak powiązania z Tobą",
		notConnectedBody: (name) => `W tym drzewie nie ma łańcucha relacji między Tobą a osobą ${name}. Dodanie relacji połączy was.`,
		open: (first) => `Otwórz: ${first}`,
		stepsThrough: (steps, people) =>
			`${steps} ${plForm(steps, "krok", "kroki", "kroków")} przez ${people} ${plForm(people, "osobę", "osoby", "osób")}.`,
		familyOnly: "Najkrótsza ścieżka tylko przez więzy krwi i małżeństwa.",
		anyLinks: "Więzy rodzinne was nie łączą, więc użyto innych zapisanych relacji.",
		youName: (name) => `Ty · ${name}`,
		showOnTree: "Pokaż w drzewie",
		meNote: (name) => `„To ja” (${name}) jest zapisane tylko na tym telefonie, bo wspólne drzewo nie ma jeszcze takiego pola. Zmienisz to w Ustawieniach.`,
		notConnectedShort: "jeszcze niepowiązana(-y) z Tobą",
	},

	search: {
		placeholder: "Kogo szukasz?",
		a11y: "Szukaj osób",
		chooseWho: "Wskaż siebie",
		chooseWhoBody: "Wskaż, która osoba to Ty, a zobaczysz, jak wszyscy są z Tobą spokrewnieni. Wybór zostaje na tym telefonie.",
		noOne: (q) => `W tym drzewie nie ma nikogo o imieniu „${q}”.`,
	},

	addPerson: {
		add: "Dodaj osobę",
		edit: "Edytuj osobę",
		viewerOnly: "To drzewo jest Ci udostępnione do przeglądania. Osoby może dodawać tylko właściciel.",
		chooseTreeFirst: "Najpierw wybierz lub utwórz drzewo.",
		gone: "Tej osoby nie ma już w drzewie.",
		nameRequired: "Imię i nazwisko są wymagane.",
		chooseGender: "Wybierz płeć.",
		birthRequired: "Data urodzenia jest wymagana.",
		deathRequired: "Dodaj datę śmierci albo wyłącz tę opcję.",
		deathBeforeBirth: "Data śmierci jest wcześniejsza niż data urodzenia.",
		linkIncomplete: "Wybierz zarówno relację, jak i osobę, albo usuń powiązanie.",
		saved: (first) => `Zapisano: ${first}`,
		linkFailed: (first, reason) => `Dodano: ${first}, ale nie udało się zapisać powiązania. ${reason}`,
		added: (first) => `Dodano do drzewa: ${first}`,
		changePhoto: "Zmień zdjęcie",
		addPhoto: "Dodaj zdjęcie",
		cameraOff: "Dostęp do aparatu jest wyłączony",
		cameraOffBody: "Nadal możesz wybrać zdjęcie z galerii albo zezwolić na aparat w Ustawieniach.",
		useGallery: "Użyj galerii",
		takePhoto: "Zrób zdjęcie",
		fromGallery: "Wybierz z galerii",
		fullName: "Imię i nazwisko",
		namePlaceholder: "np. Maria Kowalska",
		gender: "Płeć",
		birthDate: "Data urodzenia",
		passedAway: "Nie żyje",
		passedAwayHint: "Dodaje datę śmierci i rocznicę",
		deathDate: "Data śmierci",
		linkTo: "Połącz z kimś",
		linkOptional: "opcjonalnie, oszczędza krok",
		linkExample: (name) => `np. matka: ${name}`,
		newPerson: "Nowa osoba",
		parentNote: (child) => `Nowa osoba jest rodzicem; ${child} to dziecko.`,
		theChosen: "wybrana osoba",
		dontLink: "Nie łącz teraz",
		note: "Notatka",
		notePlaceholder: "Coś, co warto zapamiętać",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Powiązane konto",
		linkedHint: "Które konto Family Tree należy do tej osoby? Widać tylko konta z dostępem do tego drzewa.",
		linkedNone: "Brak",
		linkedMe: (email) => (email ? `Ja (${email})` : "Ja"),
		linkedConflict: (name) => `To konto jest już powiązane z osobą: ${name}.`,
		loadingAccounts: "Wczytywanie kont…",
	},

	addRel: {
		title: "Dodaj relację",
		viewerOnly: "Relacje może dodawać tylko właściciel tego drzewa.",
		chooseBoth: "Wybierz obie osoby i łączącą je relację.",
		different: "Wybierz dwie różne osoby.",
		duplicate: "Ta relacja jest już w drzewie.",
		added: "Relacja dodana",
		isRelatedTo: "jest spokrewniona(-y) z",
		from: "Od",
		to: "Do",
		relation: "Relacja",
		changeFrom: "Zmień osobę, od której biegnie relacja",
		more: "Więcej…",
		fewer: "Mniej",
		// Names stay in the nominative after a colon, which reads naturally without declension.
		sentence: (a, verb, b) => `${a} ${verb}: ${b}.`,
	},

	filters: {
		title: "Filtry",
		clearAll: "Wyczyść",
		show: (shown, total) => `Pokaż ${shown} z ${osob(total)}`,
		hideTypes: "Ukryj rodzaje relacji",
		hidden: "ukryte",
		shown: "widoczne",
		age: "Wiek",
		ageRange: "Przedział wieku",
		gender: "Płeć",
		everyone: "Wszyscy",
		men: "Mężczyźni",
		women: "Kobiety",
		excludeByName: "Wyklucz po imieniu",
		excludeHint: "Kilka imion oddziel przecinkami.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label) => `Ukryte: ${label}`,
		chipAge: (lo, hi) => `Wiek ${lo}–${hi}`,
		chipMen: "Tylko mężczyźni",
		chipWomen: "Tylko kobiety",
		chipNot: (names) => `Bez: ${names}`,
		chipOnly: (names) => `Tylko: ${names}`,
		includeByName: "Pokaż tylko imiona zawierające",
		includeHint: "Dowolne z kilku imion, oddzielone przecinkami.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Twoje drzewa",
		giveName: "Najpierw nadaj drzewu nazwę.",
		created: (name) => `Utworzono „${name}”`,
		nameLabel: "Nazwa nowego drzewa",
		namePlaceholder: "Moje drzewo rodzinne",
		newTree: "Nowe drzewo",
		people: (n) => osob(n),
		updated: (rel) => `zmiana ${rel}`,
		viewers: (n) => `${n} ${plForm(n, "osoba widzi", "osoby widzą", "osób widzi")}`,
		onlyYou: "Tylko Ty",
		by: (email) => `od ${email}`,
		active: "Aktywne ✓",
	},

	invited: {
		title: "Kto widzi to drzewo",
		subtitle: "Zaproszone osoby mogą przeglądać, ale nie edytować.",
		thatsYou: "To Ty — jesteś już właścicielem tego drzewa.",
		already: "Ta osoba już widzi to drzewo.",
		canSee: (email) => `${email} widzi teraz to drzewo`,
		noAccount: "Żadne konto Family Tree nie używa tego adresu. Poproś tę osobę o założenie konta, a potem ją zaproś.",
		thisPerson: "tą osobą",
		stopTitle: (who) => `Przestać udostępniać: ${who}?`,
		stopBody: "Ta osoba nie będzie już widzieć tego drzewa.",
		revoke: "Odbierz dostęp",
		revoked: (who) => `${who} nie widzi już tego drzewa`,
		emailPlaceholder: "imie@przyklad.pl",
		emailA11y: "E-mail osoby, którą zapraszasz",
		invite: "Zaproś",
		note: "Ta osoba musi już mieć konto Family Tree z tym adresem. Nic nie wysyłamy e-mailem — drzewo po prostu pojawi się na jej liście.",
		youSuffix: (name) => `${name} (Ty)`,
		creator: "Twórca",
		viewer: "Przeglądający",
		viewerYou: "Przeglądający · Ty",
		unknown: "Nieznane konto",
		revokeA11y: (email) => `Odbierz dostęp: ${email}`,
		onlyYou: "Tylko Ty widzisz to drzewo.",
	},

	dates: {
		title: "Daty",
		exportIcs: "Eksport .ics",
		all: "Wszystkie",
		birthdays: "Urodziny",
		remembrance: "Rocznice śmierci",
		quietReminder: "Dyskretne przypomnienie dzień wcześniej",
		turnOn: "Włącz przypomnienia",
		localOnly: "Przypomnienia są planowane na tym telefonie na podstawie dat z drzewa. Nic nie trafia na serwer.",
		detailHint: "Stuknij datę, aby zobaczyć tutaj tę osobę.",
		none: "Brak nadchodzących dat",
		noneBody: "Urodziny i rocznice śmierci pojawią się tutaj, gdy w drzewie będą osoby.",
		footnote:
			"Dzwonek = lokalne przypomnienie o 9:00 dzień wcześniej (rocznice śmierci: w dniu rocznicy). Okrągłe urodziny (18, 50, 55, 60…) mogą mieć drugie przypomnienie tydzień wcześniej. Eksport obejmuje osoby widoczne teraz w drzewie.",
	},

	settings: {
		title: "Ustawienia",
		signOutTitle: "Wylogować się?",
		signOutBody: "Przypomnienia zostaną usunięte, a kopie Twoich drzew skasowane z tego telefonu.",
		signOut: "Wyloguj się",
		account: "Konto",
		accountBody: "Hasło zmienisz na stronie internetowej.",
		openWebsite: "Otwórz stronę",
		reminders: "Przypomnienia",
		birthdays: "Urodziny",
		dayBefore: "Dzień wcześniej, 9:00",
		remembranceDays: "Rocznice śmierci",
		onTheDay: "W dniu rocznicy, 9:00",
		roundEarly: "Okrągłe urodziny tydzień wcześniej",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Planowane na tym telefonie dla aktywnego drzewa. Nic nie trafia na serwer.",
		whoCanSee: "Kto widzi to drzewo",
		viewers: (n) => `${n} ${plForm(n, "osoba", "osoby", "osób")}`,
		onlyYou: "Tylko Ty",
		preparing: "Przygotowywanie…",
		exportIcs: "Eksport do kalendarza (.ics)",
		thisIsMe: "To ja",
		notSet: "Nie ustawiono",
		switchTree: "Zmień drzewo",
		about: "Informacje",
		privacy: "Polityka prywatności",
		deleteAccount: "Usuń konto",
		deleteTitle: "Usunąć konto?",
		deleteBody:
			"Usuniemy Twoje konto i każde utworzone przez Ciebie drzewo razem ze wszystkimi osobami, zdjęciami i relacjami. Zaproszone osoby stracą dostęp. Tego nie można cofnąć.",
		footer: (version) => `Family Tree ${version} · Autor: tomek7667 · family-tree@cyber-man.pl`,
	},

	deleteAccount: {
		title: "Usuń konto",
		typeToConfirm: (word) => `Wpisz ${word}, aby potwierdzić`,
		typeToConfirmError: (word) => `Wpisz ${word}, aby potwierdzić.`,
		offline: "Jesteś offline — nie można teraz usunąć konta.",
		permanently: "Trwale usuniemy:",
		yourAccount: (email) => `• Twoje konto${email ? ` (${email})` : ""}`,
		everyTree: "• każde utworzone przez Ciebie drzewo ze wszystkimi osobami, zdjęciami i relacjami",
		consequences: "Zaproszone osoby stracą dostęp do tych drzew. Drzewa udostępnione Tobie przez innych pozostaną bez zmian. Tego nie można cofnąć.",
		notFully: (reason) => `Konto nie zostało całkowicie usunięte. ${reason}`,
		askUs: (email) => `Możesz spróbować ponownie albo poprosić nas o usunięcie konta: ${email}.`,
		emailRequest: "Wyślij prośbę o usunięcie",
		deleteMine: "Usuń moje konto",
		deleting: "Usuwanie…",
		keep: "Zachowaj konto",
		mailSubject: "Usuń moje konto Family Tree",
		mailBody: (email) => `Proszę o usunięcie mojego konta Family Tree${email ? ` (${email})` : ""} i wszystkich utworzonych przeze mnie drzew.`,
	},

	pickMe: {
		title: "Kim jesteś w tym drzewie?",
		note: "Potrzebne do „Jak jesteśmy spokrewnieni”. Zapisujemy to tylko na tym telefonie i nikt inny tego nie widzi.",
		forget: "Zapomnij mój wybór",
		serverLinked: (name) => `W tym drzewie z Twoim kontem powiązana jest osoba: ${name}, więc „To ja” działa na każdym urządzeniu.`,
		saveTitle: "Zapisać w drzewie?",
		saveBody: (name) => `Powiązać osobę ${name} z Twoim kontem w tym drzewie? Wtedy „To ja” zadziała na każdym urządzeniu i na stronie.`,
		saveLink: "Zapisz powiązanie",
		phoneOnly: "Tylko na tym telefonie",
		linkSaved: (name) => `${name} — powiązano z Twoim kontem`,
	},

	notFound: {
		title: "Nic tu nie ma",
		body: "Ten link prowadzi do strony, której aplikacja nie ma.",
		home: "Na start",
	},

	toastsReminders: {
		on: "Przypomnienia włączone. Zostają na tym telefonie.",
		off: "Powiadomienia dla Family Tree są wyłączone.",
		settings: "Ustawienia",
		channel: "Urodziny i rocznice śmierci",
	},

	dateNames: {
		monthsNom: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
		monthsInDate: ["stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca", "lipca", "sierpnia", "września", "października", "listopada", "grudnia"],
		monthsShort: ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"],
		weekdaysShort: ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"],
	},

	time: {
		justNow: "przed chwilą",
		minutesAgo: (n) => (n === 1 ? "minutę temu" : `${n} ${plForm(n, "minutę", "minuty", "minut")} temu`),
		hoursAgo: (n) => (n === 1 ? "godzinę temu" : `${n} ${plForm(n, "godzinę", "godziny", "godzin")} temu`),
		yesterday: "wczoraj",
		daysAgo: (n) => `${n} dni temu`,
		weeksAgo: (n) => (n === 1 ? "tydzień temu" : `${n} ${plForm(n, "tydzień", "tygodnie", "tygodni")} temu`),
		monthsAgo: (n) => (n === 1 ? "miesiąc temu" : `${n} ${plForm(n, "miesiąc", "miesiące", "miesięcy")} temu`),
		yearsAgo: (n) => (n === 1 ? "rok temu" : `${lat(n)} temu`),
		today: "dzisiaj",
		tomorrow: "jutro",
		inDays: (n) => `za ${n} dni`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} kończy ${lat(age)}`,
		remembranceTitle: (first, n) => `† ${first}, ${n}. rocznica`,
		birthday: "Urodziny",
		remembrance: "Rocznica śmierci",
		roundAge: "okrągłe urodziny",
		reminderEve: (first, age) => `Jutro ${first} kończy ${lat(age)}`,
		reminderEveRoundBody: () => "Okrągłe urodziny. Może warto zadzwonić?",
		reminderWeek: (first, age) => `Za tydzień ${first} kończy ${lat(age)}`,
		reminderWeekBody: (dayMonth) => `Okrągłe urodziny: ${dayMonth}.`,
		reminderRemembrance: (name, n) => `† ${name}, ${n}. rocznica śmierci`,
		reminderRemembranceBody: (dayMonth) => `Rocznica śmierci · ${dayMonth}`,
	},

	ics: {
		calName: "Urodziny",
		birthdayTitle: (name) => `Urodziny: ${name}`,
		birthdayDesc: (name) => `Tego dnia przypadają urodziny: ${name}`,
		deathTitle: (name) => `Rocznica śmierci: ${name}`,
		deathDesc: (name) => `Tego dnia przypada rocznica śmierci: ${name}`,
		fileSuffix: "daty",
		shareTitle: (tree) => `${tree} – daty`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biologiczne", "IN-LAW": "Powinowactwo", CHURCH: "Kościelne", IRRELEVANT: "Inne" },
		types: {
			IS_FATHER_OF: { label: "Ojciec", sentence: () => "jest ojcem dla" },
			IS_MOTHER_OF: { label: "Matka", sentence: () => "jest matką dla" },
			IS_MARRIED_TO: { label: "Małżeństwo", sentence: () => "jest w związku małżeńskim z" },
			LIVES_WITH: { label: "Mieszkają razem", sentence: () => "mieszka razem z" },
			IS_PARTNER_OF: { label: "Partnerzy", sentence: () => "jest w związku z" },
			IS_ENGAGED_TO: { label: "Zaręczeni", sentence: (g) => gw(g, "jest zaręczony z", "jest zaręczona z") },
			IS_GODPARENT_OF: {
				label: "Chrzestni",
				sentence: (g) => gw(g, "jest chrzestnym dla", "jest chrzestną dla"),
				role: (g) => gw(g, "Chrzestny", "Chrzestna"),
				inverseRole: (g) => gw(g, "Chrześniak", "Chrześniaczka"),
			},
			IS_FRIEND_OF: {
				label: "Przyjaźń",
				sentence: () => "przyjaźni się z",
				role: (g) => gw(g, "Przyjaciel", "Przyjaciółka"),
				inverseRole: (g) => gw(g, "Przyjaciel", "Przyjaciółka"),
			},
			IS_STEPPARENT_OF: {
				label: "Ojczym / macocha",
				sentence: (g) => gw(g, "jest ojczymem dla", "jest macochą dla"),
				role: (g) => gw(g, "Ojczym", "Macocha"),
				inverseRole: (g) => gw(g, "Pasierb", "Pasierbica"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Matka",
			father: "Ojciec",
			child: "Dziecko",
			sibling: (g) => gw(g, "Brat", "Siostra"),
			isSourceOf: (first, labelLower) => `${first} → ${labelLower}`,
		},
	},

	kin: {
		you: "ty",
		youTitle: "Ty",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "mąż", "żona");
					case "partner":
						return gw(g, "partner", "partnerka");
					case "parentInLaw":
						return gw(g, "teść", "teściowa");
					case "siblingInLaw":
						return gw(g, "szwagier", "szwagierka");
					case "childInLaw":
						return gw(g, "zięć", "synowa");
					case "stepParent":
						return gw(g, "ojczym", "macocha");
					case "stepChild":
						return gw(g, "pasierb", "pasierbica");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) return u === 1 ? gw(g, "ojciec", "matka") : pra(u - 2) + gw(g, "dziadek", "babcia");
			if (u === 0) return d === 1 ? gw(g, "syn", "córka") : pra(d - 2) + gw(g, "wnuk", "wnuczka");
			if (u === 1 && d === 1) return gw(g, "brat", "siostra");
			if (u === 2 && d === 1) return gw(g, "wujek", "ciocia");
			if (u === 1 && d === 2 && t.siblingGender) {
				return t.siblingGender === "male" ? gw(g, "bratanek", "bratanica") : gw(g, "siostrzeniec", "siostrzenica");
			}
			if (u === d && u >= 2) {
				const degree = u - 1;
				const base = gw(g, "kuzyn", "kuzynka");
				return degree === 1 ? base : `${base} ${STOPIEN[degree] ?? `${degree}.`} stopnia`;
			}
			// Great-uncles, grand-nieces, cousins "removed": Polish says it with the chain instead.
			return null;
		},
		word: (w: KinWord) => noun(w).nom,
		/** Polish possessive chain runs backwards in the genitive: "córka brata twojej matki". */
		chain: (words: KinWord[]) => {
			if (!words.length) return "ty";
			const first = words[0];
			const poss = (w: KinWord, genitive: boolean) =>
				genitive ? (w.gender === "female" ? "twojej" : "twojego") : w.gender === "female" ? "twoja" : "twój";
			if (words.length === 1) return `${poss(first, false)} ${noun(first).nom}`;
			const last = words[words.length - 1];
			const middle = words
				.slice(1, -1)
				.reverse()
				.map((w) => noun(w).gen);
			return [noun(last).nom, ...middle, poss(first, true), noun(first).gen].join(" ");
		},
		phrase: (term, g) => `${g === "female" ? "twoja" : "twój"} ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "syn", "córka");
				case "down":
					return gw(g, "ojciec", "matka");
				case "sibling":
					return gw(g, "brat", "siostra");
				case "spouse":
					return gw(g, "mąż", "żona");
				default:
					return typeSentence ?? "spokrewniona(-y) z";
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			if (typeName === "IS_GODPARENT_OF") {
				if (farIsSource) return f ? { nom: "chrzestna", gen: "chrzestnej" } : { nom: "chrzestny", gen: "chrzestnego" };
				return f ? { nom: "chrześniaczka", gen: "chrześniaczki" } : { nom: "chrześniak", gen: "chrześniaka" };
			}
			if (typeName === "IS_FRIEND_OF") return f ? { nom: "przyjaciółka", gen: "przyjaciółki" } : { nom: "przyjaciel", gen: "przyjaciela" };
			if (typeName === "IS_STEPPARENT_OF") {
				if (farIsSource) return f ? { nom: "macocha", gen: "macochy" } : { nom: "ojczym", gen: "ojczyma" };
				return f ? { nom: "pasierbica", gen: "pasierbicy" } : { nom: "pasierb", gen: "pasierba" };
			}
			void bidirectional;
			// Unknown type: its (English) name, undeclined.
			const word = fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase();
			return { nom: word, gen: word };
		},
	},
};
