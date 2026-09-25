import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { plural, pl as n } from "./plural";

// Polish strings. Typed as Dict, so TypeScript fails when a key is missing.

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

const people = (count: number) => n(count, "osoba", "osoby", "osób");
const relationships = (count: number) => n(count, "relacja", "relacje", "relacji");
/** Genitive after "usunięcie", "dla": 1 osoby, 2 osób, 5 osób. */
const genitive = (count: number, one: string, other: string) =>
	`${count} ${plural("pl", count, { one, other })}`;
const themes: Record<ThemePref, string> = { light: "Jasny", dark: "Ciemny", system: "Systemowy" };

/** Relationship types from ft_relationships_names that have a Polish phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Ojciec",
		edge: () => "ojciec",
		sentence: (from, to) => `${from} jest ojcem osoby ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "ojciec" : g(other, "syn", "córka")),
	},
	IS_MOTHER_OF: {
		type: "Matka",
		edge: () => "matka",
		sentence: (from, to) => `${from} jest matką osoby ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "matka" : g(other, "syn", "córka")),
	},
	IS_MARRIED_TO: {
		type: "Małżeństwo",
		edge: () => "małżeństwo",
		sentence: (from, to) => `${from} i ${to} są małżeństwem`,
		role: (_, other) => g(other, "mąż", "żona"),
	},
	LIVES_WITH: {
		type: "Mieszkają razem",
		edge: () => "mieszkają razem",
		sentence: (from, to) => `${from} i ${to} mieszkają razem`,
		role: () => "mieszkają razem",
	},
	IS_PARTNER_OF: {
		type: "Partnerstwo",
		edge: () => "partnerzy",
		sentence: (from, to) => `${from} i ${to} są partnerami`,
		role: (_, other) => g(other, "partner", "partnerka"),
	},
	IS_ENGAGED_TO: {
		type: "Zaręczeni",
		edge: () => "zaręczeni",
		sentence: (from, to) => `${from} i ${to} są zaręczeni`,
		role: (_, other) => g(other, "narzeczony", "narzeczona"),
	},
	IS_GODPARENT_OF: {
		type: "Rodzic chrzestny",
		edge: (from) => (from ? g(from, "chrzestny", "chrzestna") : "chrzestni"),
		sentence: (from, to, gender) =>
			`${from} jest ${
				gender ? g(gender, "ojcem chrzestnym", "matką chrzestną") : "rodzicem chrzestnym"
			} osoby ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource
				? g(other, "ojciec chrzestny", "matka chrzestna")
				: g(other, "chrześniak", "chrześniaczka"),
	},
	IS_FRIEND_OF: {
		type: "Przyjaźń",
		edge: () => "przyjaciele",
		sentence: (from, to) => `${from} i ${to} przyjaźnią się`,
		role: (_, other) => g(other, "przyjaciel", "przyjaciółka"),
	},
	IS_STEPPARENT_OF: {
		type: "Ojczym / macocha",
		edge: (from) => (from ? g(from, "ojczym", "macocha") : "ojczym / macocha"),
		sentence: (from, to, gender) =>
			`${from} jest ${gender ? g(gender, "ojczymem", "macochą") : "przybranym rodzicem"} osoby ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "ojczym", "macocha") : g(other, "pasierb", "pasierbica"),
	},
};

export const pl: Dict = {
	locale: "pl" as Locale,
	dateLocale: "pl-PL",

	common: {
		appName: "Family Tree",
		createdBy: "Autor: tomek7667",
		cancel: "Anuluj",
		save: "Zapisz",
		done: "Gotowe",
		close: "Zamknij",
		dismiss: "Zamknij powiadomienie",
		undo: "Cofnij",
		edit: "Edytuj",
		remove: "Usuń",
		optional: "opcjonalnie",
		loading: "Wczytywanie…",
		owner: "Właściciel",
		sharedWithYou: "Udostępnione Tobie",
		viewerReadOnly: "Tylko do wglądu",
		creator: "Twórca",
		someone: "Ktoś",
		someoneLower: "ktoś",
		unknownAccount: "nieznane konto",
		you: "Ty",
		withYou: (name) => `${name} (Ty)`,
		male: "Mężczyzna",
		female: "Kobieta",
		justNow: "przed chwilą",
		people,
		relationships,
		mainNav: "Menu główne",
		clearAll: "Wyczyść wszystko",
		addRelationship: "Dodaj relację",
		removeRelationship: "Usuń relację",
		manageInvited: "Zarządzaj dostępem",
		emailInvalid: "To nie wygląda na pełny adres e-mail.",
	},

	prefs: {
		group: "Ustawienia wyświetlania",
		language: "Język",
		theme: "Motyw",
		themes,
		themeCycle: (current, next) =>
			`Motyw: ${themes[current].toLowerCase()}. Przełącz na ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"Prywatne drzewo genealogiczne w formie grafu. Dodaj osoby, które znasz, połącz je więzami rodzinnymi i zobacz, jak pokolenia układają się według roku urodzenia.",
		signIn: "Logowanie",
		signUp: "Rejestracja",
		account: "Konto",
		trees: "Twoje drzewa",
		tree: "Drzewo",
		privacy: "Polityka prywatności",
		privacyDescription: "Jakie dane przechowuje Family Tree, w jakim celu i jak je usunąć.",
		deleteAccount: "Usuwanie konta",
		deleteAccountDescription: "Jak usunąć konto Family Tree i wszystkie jego dane.",
	},

	legal: {
		privacy: "Prywatność",
		deleteAccount: "Usuń konto",
		signIn: "Zaloguj się",
		privacyTitle: "Polityka prywatności",
		privacyEffective: "Obowiązuje od 25 września 2026 r.",
		deleteTitle: "Usuwanie konta",
		deleteAppliesTo:
			"Dotyczy strony internetowej Family Tree oraz aplikacji Family Tree na Androida i iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Usunięcie konta Family Tree",
		deleteMailBody: (email) =>
			`Proszę o usunięcie mojego konta Family Tree${
				email ? ` (${email})` : ""
			} oraz wszystkich drzew, które utworzyłem/utworzyłam.`,
	},

	errorPage: {
		title: "Coś poszło nie tak",
		home: "Przejdź na stronę główną",
	},

	landing: {
		nav: {
			features: "Funkcje",
			calendar: "Kalendarz",
			mobile: "Aplikacja",
			how: "Jak to działa",
			logIn: "Zaloguj się",
			signUp: "Załóż konto",
			openMenu: "Otwórz menu",
			closeMenu: "Zamknij menu",
		},
		deleted: "Twoje konto i Twoje drzewa zostały usunięte.",
		eyebrow: "Prywatne drzewo genealogiczne w formie grafu",
		title: "Każda rodzina to graf. Narysuj swoją.",
		lead:
			"Dodaj osoby, które znasz, połącz je więzami rodzinnymi i zobacz, jak pokolenia układają się według roku urodzenia. Domyślnie prywatne, widoczne tylko dla krewnych, których zaprosisz.",
		cta: "Załóż drzewo za darmo",
		logIn: "Zaloguj się",
		fine: "Bez reklam i publicznych profili.",
		treeEyebrow: "Drzewo",
		treeTitle: "Prostokąty i linie zamiast formularzy i tabel.",
		treeBody:
			"Drzewo powstaje tak, jak szkic na odwrocie koperty: karta dla każdej osoby, linia dla każdej relacji. Przeciągaj, przybliżaj i kliknij dowolną osobę, aby zobaczyć, kim jest.",
		decades: ["1920", "1940", "1970", "2000"],
		timelineTitle: "Pokolenia na osi czasu",
		timelineBody:
			"Osoby układają się na pionowej osi według roku urodzenia. Dziadkowie na górze, wnuki na dole, a co dwadzieścia lat zaczyna się nowy pas. Zawsze wiadomo, kto był pierwszy.",
		lines: {
			biological: "Pokrewieństwo",
			married: "Małżeństwo",
			livesWith: "Mieszkają razem",
			church: "Kościelne",
			other: "Inne",
		},
		kindsTitle: "Cztery rodzaje więzi",
		kindsBody:
			"Krew, małżeństwo, chrzestni i sąsiad, którego wszyscy nazywają wujkiem. Każda grupa ma własny rodzaj linii: małżeństwo to najgrubsza kreska w całym drzewie, a „mieszkają razem” najcieńsza, więc drzewo czyta się na pierwszy rzut oka, a mimo to opowiada całą historię.",
		chips: ["Wiek 40–90", "Ukryj: Powinowactwo", "Tylko kobiety", "Bez: Nowak"],
		filtersTitle: "Filtry, które porządkują widok",
		filtersBody:
			"Ukryj wybrany rodzaj relacji, zawęź przedział wieku, pokaż jedną stronę rodziny. Eksportujesz dokładnie to, co zostaje na ekranie.",
		calendarEyebrow: "Eksport do kalendarza",
		calendarTitle: "Wszystkie urodziny. Wszystkie rocznice śmierci. W kalendarzu, którego już używasz.",
		calendarBody:
			"Jedno kliknięcie zamienia widoczną część drzewa w plik .ics: coroczne urodziny każdej żyjącej osoby i coroczną rocznicę śmierci każdej osoby, która odeszła. Wystarczy raz zaimportować go do Kalendarza Google, Kalendarza Apple lub Outlooka, a wydarzenia będą się powtarzać co roku.",
		pills: ["Urodziny co roku", "Rocznice śmierci", "Zgodnie z filtrami"],
		calendarMonth: "Październik",
		calendarFile: "rodzina-kowalskich.ics",
		calendarRows: [
			{ dow: "Sob", title: "Urodziny: Maria Kowalska", meta: "Urodziny · co roku" },
			{ dow: "Czw", title: "† Stanisław Kowalski – rocznica śmierci", meta: "Rocznica śmierci · co roku" },
			{ dow: "Śr", title: "Urodziny: Zofia Nowak", meta: "Urodziny · co roku" },
		],
		privateEyebrow: "Domyślnie prywatne",
		privateTitle: "Twoje i tych, których zaprosisz.",
		privateBody:
			"Nie ma publicznych drzew ani wyszukiwania między rodzinami. Tworzysz drzewo i zapraszasz krewnych przez e-mail, a oni mogą je oglądać, ale nie zmieniać. Jeśli zmienisz zdanie, odbierzesz dostęp jednym kliknięciem.",
		privateYou: "tomek (Ty)",
		privateCreator: "Twórca · może edytować wszystko",
		privateOwner: "Właściciel",
		privateInvited: "Zaproszona · tylko do wglądu",
		privateRevoke: "Odbierz dostęp",
		privateInvite: "Zaproś przez e-mail…",
		mobileEyebrow: "iPhone i Android",
		mobileTitle: "Drzewo w kieszeni, zawsze pod ręką.",
		mobileBody:
			"Jesteś na weselu i nie możesz skojarzyć twarzy? Wyszukaj imię i sprawdź, jak jesteście spokrewnieni. Aplikacja pokazuje też listę nadchodzących urodzin i rocznic śmierci z przypomnieniem dzień wcześniej, a nowego krewnego ze zdjęciem dodasz w kilku dotknięciach.",
		appStoreSmall: "Już wkrótce w",
		playStoreSmall: "JUŻ WKRÓTCE W",
		phoneUpcoming: "Nadchodzące",
		phoneRows: [
			{ t: "Maria kończy 75 lat", m: "sob. 3 paź · za 8 dni" },
			{ t: "† Stanisław, 28 lat", m: "czw. 15 paź" },
			{ t: "Zofia kończy 21 lat", m: "śr. 28 paź" },
		],
		phoneRelation: "1976 · 50 · kuzynka Twojej mamy",
		howTitle: "Jak to działa",
		steps: [
			{
				title: "Zacznij od siebie",
				body: "Utwórz drzewo i dodaj pierwszą osobę: imię i nazwisko, datę urodzenia i zdjęcie, jeśli je masz.",
			},
			{
				title: "Połącz osoby, które znasz",
				body: "Rodzice, partnerzy, chrzestni. Wybierz dwie osoby i rodzaj relacji, a linia sama ułoży się we właściwym pokoleniu.",
			},
			{
				title: "Zaproś rodzinę",
				body: "Udostępnij drzewo do wglądu przez e-mail, wyeksportuj daty do kalendarza i miej drzewo zawsze przy sobie w telefonie.",
			},
		],
		minute: "Zajmie to około minuty.",
		hero: {
			label: "Przykładowe drzewo genealogiczne z czterema pokoleniami",
			married: "ślub",
			godparent: "chrzestny",
		},
	},

	auth: {
		signInPrompt: "Pierwszy raz tutaj?",
		signInLink: "Załóż konto",
		signUpPrompt: "Masz już konto?",
		signUpLink: "Zaloguj się",
		missingCredentials: "Podaj nazwę użytkownika lub e-mail oraz hasło.",
		unreachable: "Nie udało się połączyć z serwerem. Spróbuj ponownie.",
		wrongCredentials: "Nieprawidłowa nazwa użytkownika lub hasło. Sprawdź oba pola i spróbuj ponownie.",
		resetEmailMissing: "Podaj adres e-mail swojego konta.",
		resetSent: (email) =>
			`Jeśli do adresu ${email} jest przypisane konto, wysłaliśmy na nie link do zmiany hasła. Sprawdź skrzynkę odbiorczą.`,
		resetFailed: "Nie udało się wysłać wiadomości z linkiem. Spróbuj ponownie.",
		resetTitle: "Resetowanie hasła",
		resetSubtitle: "Wyślemy Ci e-mailem link do ustawienia nowego hasła.",
		welcomeTitle: "Witaj ponownie",
		welcomeSubtitle: "Zaloguj się, aby otworzyć swoje drzewa.",
		email: "E-mail",
		usernameOrEmail: "Nazwa użytkownika lub e-mail",
		password: "Hasło",
		forgot: "Nie pamiętasz?",
		sending: "Wysyłanie…",
		sendReset: "Wyślij link",
		signingIn: "Logowanie…",
		signIn: "Zaloguj się",
		backToSignIn: "Wróć do logowania",
		noAccount: "Nie masz konta?",
		signUp: "Załóż konto",
		showPassword: "Pokaż hasło",
		hidePassword: "Ukryj hasło",
		pickUsername: "Wybierz nazwę użytkownika.",
		minPassword: (min) => `Co najmniej ${n(min, "znak", "znaki", "znaków")}.`,
		passwordsDiffer: "Hasła nie są takie same.",
		createFailed: "Nie udało się utworzyć konta.",
		signInAfterCreateFailed: (message) =>
			`Konto zostało utworzone, ale logowanie się nie powiodło: ${message}. Spróbuj zalogować się ponownie.`,
		unknownError: "nieznany błąd",
		registerTitle: "Załóż swoje drzewo",
		registerSubtitle: "Za darmo, prywatnie, bez reklam.",
		username: "Nazwa użytkownika",
		displayName: "Wyświetlana nazwa",
		confirmPassword: "Powtórz hasło",
		creating: "Tworzenie konta…",
		create: "Utwórz konto",
		registerNote:
			"Wyślemy Ci e-mail weryfikacyjny. Twoje drzewo widzisz tylko Ty i osoby, które zaprosisz.",
	},

	nav: {
		trees: "Drzewa",
		account: "Twoje konto",
		logOut: "Wyloguj",
	},

	account: {
		title: "Twoje konto",
		username: "Nazwa użytkownika:",
		displayName: "Wyświetlana nazwa:",
		email: "E-mail:",
		deleteHeading: "Usuwanie konta",
		deleteBodyBefore:
			"Usuwa Twoje konto i wszystkie utworzone przez Ciebie drzewa wraz ze wszystkimi osobami, zdjęciami i relacjami. Drzewa udostępnione Ci przez inne osoby pozostają bez zmian. Szczegóły znajdziesz w ",
		deleteBodyLink: "polityce prywatności",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Nie udało się tutaj usunąć konta (${error}). `,
		failedLink: "Wyślij e-mailem prośbę o usunięcie",
		failedAfter: ", a usuniemy je w ciągu 30 dni.",
		deleteButton: "Usuń konto…",
		confirmTitle: "Usunąć konto?",
		confirmBody:
			"Spowoduje to usunięcie Twojego konta i wszystkich utworzonych przez Ciebie drzew wraz ze wszystkimi osobami, zdjęciami i relacjami. Zaproszone osoby stracą dostęp. Tej operacji nie można cofnąć.",
		confirmLabel: "Usuń wszystko",
		keep: "Zachowaj konto",
		typeToConfirm: "Wpisz USUŃ, aby potwierdzić",
		confirmWords: ["usuń", "usun", "delete"],
	},

	dashboard: {
		onlyYou: "Tylko Ty",
		viewers: (count) => n(count, "zaproszona osoba", "zaproszone osoby", "zaproszonych osób"),
		byCreator: (name) => `właściciel: ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}zaktualizowano ${ago}`,
		moreActions: (name) => `Więcej działań: ${name}`,
		rename: "Zmień nazwę",
		deleteTree: "Usuń drzewo…",
		open: "Otwórz",
		emptyTitle: "Nie masz jeszcze drzew",
		emptyBody:
			"Zacznij od osób, które znasz najlepiej: od siebie, rodziców i dziadków. Resztę rodziny zaprosisz, gdy będzie już co oglądać.",
		createFirst: "Utwórz pierwsze drzewo",
		emptyNote: "Czekasz na zaproszenie? Udostępnione Ci drzewa pojawią się tutaj automatycznie.",
		title: "Twoje drzewa",
		count: (total, owned, shared) =>
			`${n(total, "drzewo", "drzewa", "drzew")}${
				shared > 0 ? ` · Twoje: ${owned}, udostępnione Tobie: ${shared}` : ""
			}`,
		newTree: "Nowe drzewo",
	},

	treeDialogs: {
		nameRequired: "Nadaj drzewu nazwę.",
		created: "Utworzono drzewo",
		newTitle: "Nowe drzewo",
		newSubtitle: "Wybierz nazwę, którą łatwo wypowiedzieć na głos.",
		treeName: "Nazwa drzewa",
		namePlaceholder: "Moje drzewo genealogiczne",
		nameHint: "Na przykład „Rodzina Kowalskich” albo „Strona mamy”.",
		createAndOpen: "Utwórz i otwórz",
		nameEmpty: "Nazwa nie może być pusta.",
		renamed: "Zmieniono nazwę drzewa",
		renameTitle: "Zmień nazwę drzewa",
		alreadyHasAccess: "Ta osoba ma już dostęp.",
		noAccount: "Ten adres e-mail nie ma jeszcze konta w Family Tree.",
		thatsYou: "To Ty – to drzewo już należy do Ciebie.",
		invited: (email, tree) => `${email} może teraz oglądać drzewo „${tree}”`,
		revoked: "Odebrano dostęp",
		whoCanSee: (tree) => `Kto widzi drzewo „${tree}”`,
		whoCanSeeSubtitle:
			"Zaproszone osoby mogą oglądać drzewo, ale nie mogą go edytować. Potrzebują konta Family Tree założonego na ten adres e-mail.",
		emailPlaceholder: "imie@example.com",
		emailToInvite: "Adres e-mail osoby do zaproszenia",
		invite: "Zaproś",
		revoke: "Odbierz dostęp",
		deleteTitle: (tree) => `Usunąć drzewo „${tree}”?`,
		deleteBody: (count, viewers) =>
			`Spowoduje to usunięcie ${
				count === null ? "wszystkich osób w drzewie" : genitive(count, "osoby", "osób")
			} i wszystkich ich relacji${
				viewers > 0
					? ` – dla Ciebie i ${genitive(viewers, "zaproszonej osoby", "zaproszonych osób")}`
					: ""
			}. Tej operacji nie można cofnąć.`,
		deleted: (tree) => `Usunięto drzewo „${tree}”`,
		deleteConfirm: "Usuń drzewo",
		keep: "Zachowaj",
		typeName: "Wpisz nazwę drzewa, aby potwierdzić",
	},

	tree: {
		legend: "Legenda",
		deceased: "† zmarli",
		filtersCleared: "Wyczyszczono filtry, aby pokazać tę osobę",
		unknownType: "Nieznany",
		chipHide: (type) => `Ukryj: ${type}`,
		chipAge: (min, max, plus) => `Wiek ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Tylko mężczyźni",
		chipWomen: "Tylko kobiety",
		chipNot: (names) => `Bez: ${names}`,
		chipOnly: (names) => `Tylko: ${names}`,
		removeFilter: (text) => `Usuń filtr ${text}`,
		exported: (filename, count) => `Pobrano ${filename} · ${people(count)}`,
		calendarFailed: "Nie udało się utworzyć kalendarza",
		back: "Wróć do listy drzew",
		openFailed: "Nie udało się otworzyć tego drzewa",
		backToTrees: "Wróć do swoich drzew",
		loadingTree: "Wczytywanie drzewa…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Nikogo tu jeszcze nie ma",
		emptyOwner:
			"Dodaj pierwszą osobę – najlepiej zacznij od siebie. Każda dodana osoba ustawi się według roku urodzenia.",
		emptyViewer: "Do tego drzewa nie dodano jeszcze nikogo.",
		addFirst: "Dodaj pierwszą osobę",
		editToolbar: "Edycja drzewa",
		viewToolbar: "Widok",
		addPerson: "Dodaj osobę",
		findPerson: "Znajdź osobę",
		filters: "Filtry",
		exportCalendar: "Eksport do kalendarza",
		zoomIn: "Przybliż",
		zoomOut: "Oddal",
		fit: "Dopasuj do ekranu",
		visible: (shown, total) => `Widoczne: ${shown} z ${genitive(total, "osoby", "osób")}`,
		saved: "Zapisano zmiany",
		added: (name) => `Dodano do drzewa: ${name}`,
		relationshipAdded: "Dodano relację",
		removePersonTitle: (name) => `Usunąć osobę ${name}?`,
		removePersonBody: (count) =>
			`Spowoduje to również usunięcie ${genitive(
				count,
				"powiązanej z nią relacji",
				"powiązanych z nią relacji"
			)}. Tej operacji nie można cofnąć.`,
		removePerson: "Usuń osobę",
		personRemoved: (name) => `Usunięto: ${name}`,
		removeEdgeTitle: "Usunąć tę relację?",
		removeEdgeBody: (sentence) => `${sentence}. Obie osoby pozostaną w drzewie.`,
		relationshipRemoved: "Usunięto relację",
		canvas: "Obszar drzewa genealogicznego. Przeciągnij, aby przesunąć, przewiń, aby przybliżyć.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", nie żyje" : ""}${
				link === "you" ? ", to Ty" : link === "linked" ? ", powiązana z kontem" : ""
			}`,
		youPill: "Ty",
		legendYou: "Ty",
		legendLinked: "Powiązane konto",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `Szczegóły: ${name}`,
		removeWith: (name) => `Usuń relację z osobą ${name}`,
		noRelationships: "Brak relacji.",
		showFamily: "Pokaż dalszą rodzinę",
		hideFamily: "Ukryj dalszą rodzinę",
		noFamily:
			"Brak powiązań rodzic–dziecko ani małżeńskich, na podstawie których można ustalić dalszą rodzinę.",
		removeNamed: (name) => `Usuń osobę ${name}`,
		readOnly: "Tylko do odczytu. Edytować może wyłącznie twórca drzewa.",
		thisIsYou: "To Ty",
		linkedTo: (email) => `Powiązane z kontem ${email}`,
		note: "Notatka",
		relationship: "Relacja",
		bidirectional: "dwukierunkowa",
		directional: "jednokierunkowa →",
	},

	filters: {
		hideTypes: "Ukryj rodzaje relacji",
		hideTypesHint: "Przekreślone rodzaje są ukryte w drzewie i w eksporcie.",
		age: "Wiek",
		minimum: "Od",
		maximum: "Do",
		ageHint: "U osób zmarłych liczy się wiek w chwili śmierci.",
		gender: "Płeć",
		everyone: "Wszyscy",
		men: "Mężczyźni",
		women: "Kobiety",
		includeByName: "Pokaż tylko osoby, których imię lub nazwisko zawiera",
		includeHint: "Oddziel przecinkami. Zostają osoby pasujące do dowolnego fragmentu.",
		excludeByName: "Wyklucz po imieniu lub nazwisku",
		excludeHint:
			"Oddziel przecinkami. Pasuje do dowolnej części imienia i nazwiska, bez względu na wielkość liter i polskie znaki.",
	},

	dialogs: {
		findTitle: "Znajdź osobę",
		findPlaceholder: "Wpisz imię lub nazwisko…",
		searchPeople: "Szukaj osób",
		noResults: "Nie znaleziono nikogo o takim imieniu.",
		nameRequired: "Podaj imię i nazwisko.",
		birthRequired: "Podaj datę urodzenia.",
		deathBeforeBirth: "Data śmierci jest wcześniejsza niż data urodzenia.",
		editPerson: "Edytuj osobę",
		addPerson: "Dodaj osobę",
		personSubtitle: "Imię i nazwisko oraz data urodzenia są wymagane. Resztę możesz uzupełnić później.",
		changePhoto: "Zmień zdjęcie",
		uploadPhoto: "Dodaj zdjęcie",
		photoHint: "JPG lub PNG, do 5 MB. Najlepiej kwadratowe.",
		photoTooLarge: "To zdjęcie jest większe niż 5 MB.",
		fullName: "Imię i nazwisko",
		namePlaceholder: "np. Maria Kowalska",
		birthDate: "Data urodzenia",
		deathDate: "Data śmierci",
		note: "Notatka",
		noteHint: "Wszystko, co warto zapamiętać: nazwisko panieńskie, miejsce zamieszkania, rodzinna historia.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `Notatka może mieć najwyżej ${n(max, "znak", "znaki", "znaków")}.`,
		linkedAccount: "Powiązane konto",
		linkedHint: "Konto Family Tree tej osoby, jeśli ma ona dostęp do drzewa.",
		linkedNone: "Brak",
		linkedMe: (name) => `Ja (${name})`,
		linkedConflict: (account, person) =>
			`Konto ${account} jest już powiązane z osobą ${person}. Konto można powiązać tylko z jedną osobą, więc najpierw usuń tamto powiązanie.`,
		saveChanges: "Zapisz zmiany",
		addToTree: "Dodaj do drzewa",
		search: "Szukaj…",
		readAsSentence: "Czytaj jak zdanie:",
		duplicate: "Ta relacja już jest w drzewie.",
		fromPerson: "Od osoby",
		toPerson: "Do osoby",
		relationType: "Rodzaj relacji",
		bothWays: "w obie strony",
		oneWay: "w jedną stronę",
		exportTitle: "Eksport do kalendarza",
		exportHeading: (count) =>
			`Eksportuj ${n(count, "osobę", "osoby", "osób")} do kalendarza`,
		exportBody:
			"Jeden plik .ics z corocznymi urodzinami każdej żyjącej osoby i coroczną rocznicą śmierci każdej osoby, która odeszła. Ukryte osoby nie zostaną uwzględnione.",
		birthdays: "Urodziny",
		remembrances: "Rocznice śmierci",
		download: "Pobierz .ics",
	},

	person: {
		age: (age, gender, deceased) =>
			deceased
				? `${g(gender, "zmarł", "zmarła")} w wieku ${age} ${age === 1 ? "roku" : "lat"}`
				: n(age, "rok", "lata", "lat"),
	},

	family: {
		ancestors: (level) => `${level === 0 ? "D" : `Pra${"pra".repeat(level - 1)}d`}ziadkowie`,
		descendants: (level) => (level === 0 ? "Wnuki" : `Pra${"pra".repeat(level - 1)}wnuki`),
		parents: "Rodzice",
		auntsAndUncles: "Ciocie i wujkowie",
		siblings: "Rodzeństwo",
		children: "Dzieci",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Pokrewieństwo",
			"IN-LAW": "Powinowactwo",
			CHURCH: "Kościelne",
			IRRELEVANT: "Inne",
		},
		legend: {
			married: "Małżeństwo",
			livesWith: "Mieszkają razem",
		},
		known,
		fallbackSentence: (from, phrase, _isVerb, to) => `${from} → ${phrase} → ${to}`,
		fallbackRole: (phrase, _isVerb, firstName, selectedIsSource) =>
			selectedIsSource ? `${firstName} → ${phrase}` : `${phrase} → ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name} – rocznica śmierci`,
		remembranceDescription: (name, born) => `Rocznica śmierci: ${name} (ur. ${born} r.).`,
		birthdayTitle: (name) => `Urodziny: ${name}`,
		birthdayDescription: (name, born, gender) =>
			`${name} ${g(gender, "urodził", "urodziła")} się w ${born} r.`,
		fileFallback: "drzewo-genealogiczne",
	},
};
