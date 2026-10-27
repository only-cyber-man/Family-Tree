import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// Français (France). Typed as Dict: a missing or mistyped key does not compile.
// Register: "vous" throughout. French typography: a no-break space (U+00A0)
// before « : », « ? », « ! » and « ; », guillemets around quoted text.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
/** "1 an", "2 ans"; CLDR French keeps 0 singular ("0 an"). */
const count = (n: number, one: string, other: string) => `${n} ${form("fr", n, one, other)}`;
const ans = (n: number) => count(n, "an", "ans");
const personnes = (n: number) => count(n, "personne", "personnes");
const arriere = (n: number) => (n > 0 ? "arrière-".repeat(n) : "");
const DEGRE = ["", "", "second", "troisième", "quatrième", "cinquième", "sixième", "septième", "huitième"];
/** "fête ses 75 ans" / "fête son premier anniversaire" */
const fete = (age: number) => (age === 1 ? "fête son premier anniversaire" : `fête ses ${age} ans`);

/** "de Maria" / "d’Anna": the preposition elides before a vowel (not before H, which may be aspirated in a name). */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöùûü]/i.test(name) ? `d’${name}` : `de ${name}`);

/** Bare noun of a chain word; `art` and `du` add the article. */
function noun(w: KinWord): string {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? "mère" : "père";
		case "child":
			return f ? "fille" : "fils";
		case "sibling":
			return f ? "sœur" : "frère";
		case "spouse":
			return f ? "femme" : "mari";
		case "partner":
			return f ? "compagne" : "compagnon";
		default:
			return w.noun?.nom ?? (f ? "parente" : "parent");
	}
}
const vowel = (word: string) => /^[aeiouyhàâäéèêëîïôöùûü]/i.test(word);
/** "la fille", "le frère", "l’ami" */
const art = (w: KinWord) => {
	const n = noun(w);
	return vowel(n) ? `l’${n}` : `${w.gender === "female" ? "la" : "le"} ${n}`;
};
/** "de la fille", "du frère", "de l’ami" */
const du = (w: KinWord) => {
	const n = noun(w);
	return vowel(n) ? `de l’${n}` : w.gender === "female" ? `de la ${n}` : `du ${n}`;
};

export const fr: Dict = {
	lang: "fr",
	locale: "fr-FR",

	common: {
		cancel: "Annuler",
		done: "Terminé",
		save: "Enregistrer",
		saving: "Enregistrement…",
		close: "Fermer",
		back: "Retour",
		change: "Modifier",
		tryAgain: "Réessayer",
		add: "Ajouter",
		create: "Créer",
		creating: "Création…",
		edit: "Modifier",
		remove: "Supprimer",
		keep: "Conserver",
		continue: "Continuer",
		undo: "Annuler",
		openSettings: "Ouvrir les réglages",
		settings: "Réglages",
		signIn: "Se connecter",
		you: "Vous",
		loading: "Chargement",
		familyTree: "Family Tree",
		owner: "Propriétaire",
		sharedWithYou: "Partagé avec vous",
		male: "Homme",
		female: "Femme",
		show: "Afficher",
		hide: "Masquer",
		showPassword: "Afficher le mot de passe",
		hidePassword: "Masquer le mot de passe",
		chooseDate: "Choisir une date",
		dateA11y: (label, value) => `${label} : ${value}. Modifier`,
		closeDatePicker: "Fermer le sélecteur de date",
		year: "Année",
		yearHint: "Saisissez une année pour y amener le sélecteur",
		yearExample: "par ex. 1742",
		removeFilter: (label) => `Supprimer le filtre ${label}`,
		searchByName: "Rechercher par nom",
		noOneCalled: (q) => `Personne ne s’appelle « ${q} ».`,
		noOneToChoose: "Personne à choisir pour l’instant.",
		selected: "sélectionné",
		reminderScheduled: "Rappel programmé",
		noReminder: "Pas de rappel",
		range: (lo, hi) => `de ${lo} à ${hi}`,
	},

	offline: {
		banner: "Vous êtes hors ligne. Affichage de la dernière copie de cet arbre.",
		short: "Vous êtes hors ligne.",
		write: "Vous êtes hors ligne — les modifications ne peuvent pas être enregistrées.",
	},

	save: {
		failedOffline: (what) => `Impossible d’enregistrer ${what} : vous êtes hors ligne ou le serveur est injoignable. Rien n’a été perdu ; réessayez.`,
		failed: (what, reason) => `Impossible d’enregistrer ${what}. ${reason}`,
		noTree: "Aucun arbre n’est ouvert, donc rien n’a été enregistré. Choisissez un arbre et réessayez.",
		theChanges: "les modifications",
		thisPerson: "cette personne",
		theRelationship: "la relation",
		theTree: "l’arbre",
	},

	errors: {
		network: "Pas de connexion. Vérifiez votre accès à Internet et réessayez.",
		generic: "Une erreur s’est produite.",
		notSignedIn: "Vous n’êtes pas connecté à votre compte.",
		passwordsDontMatch: "Les mots de passe ne correspondent pas.",
		sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
		shareUnavailable: "Le partage n’est pas disponible sur cet appareil.",
	},

	tabs: {
		home: "Accueil",
		tree: "Arbre",
		add: "Ajouter",
		find: "Recherche",
		dates: "Dates",
		settings: "Réglages",
		addPerson: "Ajouter une personne",
		findPerson: "Rechercher une personne",
	},

	prefs: {
		language: "Langue",
		languageSystem: "Système",
		chooseLanguage: "Choisir la langue",
		appearance: "Apparence",
		theme: "Thème",
		system: "Système",
		light: "Clair",
		dark: "Sombre",
	},

	onboarding: {
		title1: "Votre famille, dessinée comme un graphe.",
		body1: "Les personnes sont des cartes, les relations des lignes, et les générations s’alignent par année de naissance. Privé, partagé uniquement sur invitation.",
		title2: "Ne manquez plus un anniversaire ni une commémoration.",
		body2: "Un rappel discret la veille. Tout reste sur votre téléphone ; rien ne nous est envoyé.",
		page: (n, total) => `Page ${n} sur ${total}`,
		haveAccount: "J’ai déjà un compte",
		turnOnReminders: "Activer les rappels",
		notNow: "Pas maintenant",
		previewTitle1: "Mamie Maria fête ses 75 ans demain",
		previewWhen1: "Demain",
		previewBody1: "Un anniversaire rond. Un petit coup de fil à Maria ?",
		previewTitle2: "† Stanisław Kowalski, il y a 28 ans",
		previewWhen2: "15 oct.",
	},

	auth: {
		welcomeBack: "Ravi de vous revoir",
		signInSubtitle: "Connectez-vous avec votre compte Family Tree.",
		usernameOrEmail: "Nom d’utilisateur ou e-mail",
		password: "Mot de passe",
		forgot: "Mot de passe oublié ?",
		newHere: "Première visite ?",
		createAccount: "Créer un compte",
		enterBoth: "Saisissez votre nom d’utilisateur ou votre e-mail, ainsi que votre mot de passe.",
		wrongCredentials: "Nom d’utilisateur ou mot de passe incorrect.",
		forgotHowTo: "Saisissez votre adresse e-mail dans le premier champ, puis touchez à nouveau « Mot de passe oublié ? ».",
		resetTitle: "Réinitialiser le mot de passe",
		resetConfirm: (email) => `Envoyer un lien de réinitialisation à ${email} ?`,
		send: "Envoyer",
		checkInbox: "Consultez votre boîte de réception",
		checkInboxBody: "Si un compte existe pour cet e-mail, un lien de réinitialisation est en route.",
		couldntSend: "Envoi impossible",
		signInAgain: "Veuillez vous reconnecter",
		sessionEnded: "Votre session a expiré. Rien n’a été perdu ; l’arbre est toujours là.",
		passwordFor: (who) => `Mot de passe pour ${who}`,
		differentAccount: "Utiliser un autre compte",
		startTree: "Commencez votre arbre",
		freePrivate: "Gratuit, privé, sans publicité.",
		username: "Nom d’utilisateur",
		displayName: "Nom affiché (facultatif)",
		yourName: "Votre nom",
		email: "E-mail",
		confirmPassword: "Confirmer le mot de passe",
		step1: "Le mot de passe et sa confirmation viennent ensuite. Étape 1 sur 2.",
		step2: (email) => `Nous envoyons un e-mail de vérification à ${email}. Étape 2 sur 2.`,
		usernameRule: "Au moins 3 lettres ou chiffres, sans espaces.",
		emailInvalid: "Cela ne ressemble pas à une adresse e-mail.",
		passwordRule: "Utilisez au moins 8 caractères.",
		createAccountButton: "Créer le compte",
		agreePrefix: "En créant un compte, vous acceptez la ",
		privacyPolicy: "politique de confidentialité",
		agreeSuffix: ".",
	},

	home: {
		offline: "Vous êtes hors ligne",
		couldntLoadTrees: "Impossible de charger vos arbres",
		connectFirstTime: "Connectez-vous à Internet pour voir vos arbres une première fois.",
		noTrees: "Aucun arbre pour l’instant",
		noTreesBody: "Commencez par vous et vos parents. Les invitations de vos proches apparaissent ici d’elles-mêmes.",
		createFirst: "Créer votre premier arbre",
		treeUnavailable: "Cet arbre n’est pas disponible",
		couldntOpen: "Impossible d’ouvrir cet arbre",
		treeUnavailableBody: "Il a peut-être été supprimé, ou son propriétaire a cessé de le partager avec vous.",
		noCopy: "Il n’y a pas encore de copie de cet arbre sur ce téléphone. Connectez-vous et réessayez.",
		chooseTree: "Choisir un arbre",
		switchTree: "Changer d’arbre",
		lookingFor: "Qui cherchez-vous ?",
		upcoming: "À venir",
		seeAll: "Tout voir",
		noUpcoming: "Aucune date à venir",
		noUpcomingEmpty: "Les anniversaires et les commémorations apparaissent ici dès qu’il y a des personnes dans l’arbre.",
		noUpcomingYear: "Rien dans les douze prochains mois.",
		noOne: "Personne ici pour l’instant",
		addYourself: "Ajoutez-vous d’abord. Chaque autre personne se rattache à quelqu’un déjà présent dans l’arbre.",
		ownerAddedNoOne: "Le propriétaire n’a encore ajouté personne.",
		addFirst: "Ajouter la première personne",
		quick: "Accès rapide",
		addPerson: "Ajouter une personne",
		linkTwo: "Relier deux personnes",
		aboutTree: "Cet arbre",
		detailHint: "Touchez une date à gauche pour voir la personne ici.",
	},

	tree: {
		loading: "Chargement de l’arbre…",
		removeTitle: (name) => `Supprimer ${name} ?`,
		removeBody: "Ses relations sont supprimées aussi. Cette action est irréversible.",
		removed: (name) => `${name} n’est plus dans l’arbre`,
		addRelationship: "Ajouter une relation",
		focusedOn: (name) => `Vue centrée sur ${name}`,
		parents: "parents",
		partner: "partenaire",
		partners: "partenaires",
		children: "enfants",
		exitFocus: "Quitter la vue centrée",
		search: "Rechercher",
		filters: "Filtres",
		filtersActive: (n) => `Filtres, ${n} ${form("fr", n, "actif", "actifs")}`,
		goUpTo: (name) => `Remonter à ${name}`,
		resetView: "Réinitialiser la vue",
		fitAll: "Afficher tout l’arbre",
		allFiltered: "Tout le monde est filtré",
		clearFilters: "Effacer les filtres",
		canvasA11y: (n) => `Arbre généalogique de ${personnes(n)}. Utilisez la recherche pour trouver quelqu’un.`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "Légende",
		legendBio: "Biol.",
		legendMarried: "Mariage",
		legendLivesWith: "Vit avec",
		legendInLaw: "Alliance",
		legendChurch: "Religieux",
		legendOther: "Autres",
		youPill: "Vous",
		legendYou: "Vous",
		panelHint: "Touchez une personne pour voir ses détails ici.",
		panelTitle: "Détails",
	},

	person: {
		gone: "Cette personne n’est plus dans l’arbre.",
		ageAlive: (g, age) => `${g} · ${ans(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · ${ans(age)} au décès${wouldBe ? ` · aurait ${ans(wouldBe)}` : ""}`,
		you: "vous",
		focus: "Centrer",
		focusOnTree: "Centrer dans l’arbre",
		howRelated: "Quel est notre lien ?",
		turns: (n) => `Aura ${ans(n)}`,
		remembranceDay: "Anniversaire de décès",
		remindMe: "Me rappeler",
		noRelationshipsOwner: "Aucune relation pour l’instant. Ajoutez-en une pour rattacher cette personne à l’arbre.",
		noRelationships: "Aucune relation pour l’instant.",
		dragUp: "Glissez vers le haut pour voir toutes les relations",
		removedFromTree: (name) => `${name} n’est plus dans l’arbre`,
		couldntRemove: (name, reason) => `Impossible de supprimer ${name}. ${reason}`,
		open: "Ouvrir",
		removeRelationship: "Supprimer la relation",
		relationshipRemoved: "Relation supprimée",
		sharedBy: (email) => `Partagé avec vous${email ? ` par ${email}` : ""}. Seul le propriétaire peut modifier.`,
		removeA11y: (name) => `Supprimer ${name}`,
		thisIsYou: "C’est vous",
		linkedTo: (email) => `Lié au compte ${email}`,
		linkedToAccount: "Lié à un compte",
		note: "Note",
	},

	path: {
		whichIsYou: "Qui êtes-vous ?",
		needMe: (first) =>
			`Pour dire quel est votre lien avec ${first}, l’application doit savoir qui vous êtes dans cet arbre. Vous choisissez une fois ; le choix reste sur ce téléphone.`,
		chooseWho: "Indiquer qui vous êtes",
		notConnected: "Pas encore de lien avec vous",
		notConnectedBody: (name) => `Aucune chaîne de relations ne relie ${name} à vous dans cet arbre. Ajouter une relation vous relierait.`,
		open: (first) => `Ouvrir ${first}`,
		stepsThrough: (steps, people) => `${count(steps, "étape", "étapes")} en passant par ${personnes(people)}.`,
		familyOnly: "Chemin le plus court par les liens biologiques et de mariage uniquement.",
		anyLinks: "Les liens familiaux ne vous relient pas, donc les autres liens enregistrés sont utilisés.",
		youName: (name) => `Vous · ${name}`,
		showOnTree: "Afficher dans l’arbre",
		meNote: (name) =>
			`« C’est moi » (${name}) n’est enregistré que sur ce téléphone, car l’arbre partagé n’a pas encore de champ pour cela. Modifiable dans les Réglages.`,
		notConnectedShort: "pas encore de lien avec vous",
	},

	search: {
		placeholder: "Qui cherchez-vous ?",
		a11y: "Rechercher des personnes",
		chooseWho: "Indiquer qui vous êtes",
		chooseWhoBody: "Indiquez qui vous êtes dans l’arbre pour voir votre lien avec chaque personne. Le choix reste sur ce téléphone.",
		noOne: (q) => `Personne ne s’appelle « ${q} » dans cet arbre.`,
	},

	addPerson: {
		add: "Ajouter une personne",
		edit: "Modifier la personne",
		viewerOnly: "Cet arbre est partagé avec vous en lecture seule. Seul son propriétaire peut ajouter des personnes.",
		chooseTreeFirst: "Choisissez ou créez d’abord un arbre.",
		gone: "Cette personne n’est plus dans l’arbre.",
		nameRequired: "Le nom est obligatoire.",
		chooseGender: "Choisissez le sexe.",
		birthRequired: "La date de naissance est obligatoire.",
		deathRequired: "Ajoutez la date du décès ou désactivez cette option.",
		deathBeforeBirth: "La date de décès précède la date de naissance.",
		linkIncomplete: "Choisissez à la fois la relation et la personne, ou effacez le lien.",
		saved: (first) => `Fiche ${de(first)} enregistrée`,
		linkFailed: (first, reason) => `La fiche ${de(first)} a été créée, mais le lien n’a pas pu être enregistré. ${reason}`,
		added: (first) => `${first} a rejoint l’arbre`,
		changePhoto: "Changer la photo",
		addPhoto: "Ajouter une photo",
		cameraOff: "L’accès à l’appareil photo est désactivé",
		cameraOffBody: "Vous pouvez toujours choisir une photo dans votre galerie, ou autoriser l’appareil photo dans les Réglages.",
		useGallery: "Utiliser la galerie",
		takePhoto: "Prendre une photo",
		fromGallery: "Choisir dans la galerie",
		fullName: "Nom complet",
		namePlaceholder: "par ex. Maria Kowalska",
		gender: "Sexe",
		birthDate: "Date de naissance",
		passedAway: "Personne décédée",
		passedAwayHint: "Ajoute une date de décès et une commémoration",
		deathDate: "Date de décès",
		linkTo: "Relier à quelqu’un",
		linkOptional: "facultatif, fait gagner une étape",
		linkExample: (name) => `par ex. mère de ${name}`,
		newPerson: "Nouvelle personne",
		parentNote: (child) => `La nouvelle personne est le parent ; ${child} est l’enfant.`,
		theChosen: "la personne choisie",
		dontLink: "Ne pas relier maintenant",
		note: "Note",
		notePlaceholder: "Tout ce qui mérite d’être retenu",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Compte lié",
		linkedHint: "Quel compte Family Tree est celui de cette personne ? Seuls les comptes ayant accès à cet arbre sont listés.",
		linkedNone: "Aucun",
		linkedMe: (email) => (email ? `Moi (${email})` : "Moi"),
		linkedConflict: (name) => `Ce compte est déjà lié à ${name}.`,
		loadingAccounts: "Chargement des comptes…",
	},

	addRel: {
		title: "Ajouter une relation",
		viewerOnly: "Seul le propriétaire de cet arbre peut ajouter des relations.",
		chooseBoth: "Choisissez les deux personnes et leur lien.",
		different: "Choisissez deux personnes différentes.",
		duplicate: "Cette relation est déjà dans l’arbre.",
		added: "Relation ajoutée",
		isRelatedTo: "est en relation avec",
		from: "De",
		to: "Vers",
		relation: "Relation",
		changeFrom: "Changer la personne de départ de la relation",
		more: "Plus…",
		fewer: "Moins",
		// The verb phrases end in a preposition ("est la mère de"), so the second name follows directly.
		sentence: (a, verb, b) => `${a} ${verb} ${b}.`,
		sentenceJoin: " ",
	},

	filters: {
		title: "Filtres",
		clearAll: "Tout effacer",
		show: (shown, total) => `Afficher ${shown} sur ${personnes(total)}`,
		hideTypes: "Masquer des types de relation",
		hidden: "masqué",
		shown: "affiché",
		age: "Âge",
		ageRange: "Tranche d’âge",
		gender: "Sexe",
		everyone: "Tout le monde",
		men: "Hommes",
		women: "Femmes",
		excludeByName: "Exclure par nom",
		excludeHint: "Séparez plusieurs noms par des virgules.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label) => `Masqué : ${label}`,
		chipAge: (lo, hi) => `Âge ${lo}–${hi}`,
		chipMen: "Hommes uniquement",
		chipWomen: "Femmes uniquement",
		chipNot: (names) => `Sauf : ${names}`,
		chipOnly: (names) => `Seulement : ${names}`,
		includeByName: "Afficher seulement les noms contenant",
		includeHint: "L’un de plusieurs noms, séparés par des virgules.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Vos arbres",
		giveName: "Donnez d’abord un nom à l’arbre.",
		created: (name) => `« ${name} » créé`,
		nameLabel: "Nom du nouvel arbre",
		namePlaceholder: "Mon arbre généalogique",
		newTree: "Nouvel arbre",
		people: (n) => personnes(n),
		updated: (rel) => `mis à jour ${rel}`,
		viewers: (n) => count(n, "invité", "invités"),
		onlyYou: "Seulement vous",
		by: (email) => `par ${email}`,
		active: "Actif ✓",
	},

	invited: {
		title: "Qui peut voir cet arbre",
		subtitle: "Les personnes invitées peuvent regarder, pas modifier.",
		thatsYou: "C’est vous ; vous êtes déjà propriétaire de cet arbre.",
		already: "Cette personne voit déjà cet arbre.",
		canSee: (email) => `${email} peut maintenant voir cet arbre`,
		noAccount: "Aucun compte Family Tree n’utilise cet e-mail. Demandez à la personne de s’inscrire d’abord, puis invitez-la.",
		thisPerson: "cette personne",
		stopTitle: (who) => `Ne plus partager avec ${who} ?`,
		stopBody: "Cette personne ne verra plus cet arbre.",
		revoke: "Révoquer",
		revoked: (who) => `${who} ne voit plus cet arbre`,
		emailPlaceholder: "nom@exemple.fr",
		emailA11y: "E-mail de la personne à inviter",
		invite: "Inviter",
		note: "La personne doit déjà avoir un compte Family Tree avec cet e-mail. Aucun e-mail n’est envoyé ; l’arbre apparaît simplement dans sa liste.",
		youSuffix: (name) => `${name} (vous)`,
		creator: "Créateur",
		viewer: "Lecteur",
		viewerYou: "Lecteur · vous",
		unknown: "Compte inconnu",
		revokeA11y: (email) => `Révoquer l’accès de ${email}`,
		onlyYou: "Vous êtes la seule personne à voir cet arbre.",
	},

	dates: {
		title: "Dates",
		exportIcs: "Exporter en .ics",
		all: "Toutes",
		birthdays: "Anniversaires",
		remembrance: "Commémorations",
		quietReminder: "Recevez un rappel discret la veille",
		turnOn: "Activer les rappels",
		localOnly: "Les rappels sont programmés sur ce téléphone à partir des dates de l’arbre. Rien n’est envoyé à un serveur.",
		detailHint: "Touchez une date pour voir la personne ici.",
		none: "Aucune date à venir",
		noneBody: "Les anniversaires et les commémorations apparaissent ici dès qu’il y a des personnes dans l’arbre.",
		footnote:
			"Cloche = rappel local programmé à 9 h la veille (commémorations : le jour même). Les âges ronds (18, 50, 55, 60…) peuvent recevoir un second rappel une semaine avant. L’export inclut les personnes actuellement visibles dans l’arbre.",
	},

	settings: {
		title: "Réglages",
		signOutTitle: "Se déconnecter ?",
		signOutBody: "Les rappels sont supprimés et les copies de vos arbres sont effacées de ce téléphone.",
		signOut: "Se déconnecter",
		account: "Compte",
		accountBody: "Le mot de passe se change sur le site web.",
		openWebsite: "Ouvrir le site web",
		reminders: "Rappels",
		birthdays: "Anniversaires",
		dayBefore: "La veille, à 9 h",
		remembranceDays: "Anniversaires de décès",
		onTheDay: "Le jour même, à 9 h",
		roundEarly: "Anniversaires ronds une semaine avant",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Programmés sur ce téléphone pour l’arbre actif. Rien n’est envoyé à un serveur.",
		whoCanSee: "Qui peut voir cet arbre",
		viewers: (n) => count(n, "invité", "invités"),
		onlyYou: "Seulement vous",
		preparing: "Préparation…",
		exportIcs: "Exporter vers le calendrier (.ics)",
		thisIsMe: "C’est moi",
		notSet: "Non défini",
		switchTree: "Changer d’arbre",
		about: "À propos",
		privacy: "Politique de confidentialité",
		deleteAccount: "Supprimer le compte",
		deleteTitle: "Supprimer votre compte ?",
		deleteBody:
			"Cela supprime votre compte et chaque arbre que vous avez créé, avec toutes ses personnes, photos et relations. Les personnes que vous avez invitées perdent l’accès. Cette action est irréversible.",
		footer: (version) => `Family Tree ${version} · Créé par tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "Sponsorisé",
		tag: "Pub",
		open: (title) => `Ouvrir ${title}`,
	},

	deleteAccount: {
		title: "Supprimer le compte",
		typeToConfirm: (word) => `Saisissez ${word} pour confirmer`,
		typeToConfirmError: (word) => `Saisissez ${word} pour confirmer.`,
		offline: "Vous êtes hors ligne — votre compte ne peut pas être supprimé pour le moment.",
		permanently: "Cette action supprime définitivement :",
		yourAccount: (email) => `• votre compte${email ? ` (${email})` : ""}`,
		everyTree: "• chaque arbre que vous avez créé, avec toutes ses personnes, photos et relations",
		consequences:
			"Les personnes que vous avez invitées perdent l’accès à ces arbres. Les arbres que d’autres ont partagés avec vous ne sont pas concernés. Cette action est irréversible.",
		notFully: (reason) => `Votre compte n’a pas été entièrement supprimé. ${reason}`,
		askUs: (email) => `Vous pouvez réessayer, ou nous demander de le supprimer pour vous à l’adresse ${email}.`,
		emailRequest: "Envoyer une demande de suppression par e-mail",
		deleteMine: "Supprimer mon compte",
		deleting: "Suppression…",
		keep: "Garder mon compte",
		mailSubject: "Supprimer mon compte Family Tree",
		mailBody: (email) => `Merci de supprimer mon compte Family Tree${email ? ` (${email})` : ""} ainsi que tous les arbres que j’ai créés.`,
	},

	pickMe: {
		title: "Qui êtes-vous ?",
		note: "Utilisé pour « Quel est notre lien ». Enregistré sur ce téléphone uniquement ; personne d’autre ne le voit.",
		forget: "Oublier mon choix",
		serverLinked: (name) => `Dans cet arbre, votre compte est lié à ${name} : « C’est moi » vient donc de l’arbre sur tous vos appareils.`,
		saveTitle: "Enregistrer dans l’arbre ?",
		saveBody: (name) => `Lier ${name} à votre compte dans cet arbre ? « C’est moi » fonctionnera alors sur tous vos appareils et sur le site web.`,
		saveLink: "Enregistrer le lien",
		phoneOnly: "Sur ce téléphone uniquement",
		linkSaved: (name) => `Votre compte est maintenant lié à ${name}`,
	},

	notFound: {
		title: "Rien ici",
		body: "Ce lien pointe vers une page que l’application n’a pas.",
		home: "Retour à l’accueil",
	},

	toastsReminders: {
		on: "Les rappels sont activés. Ils restent sur ce téléphone.",
		off: "Les notifications sont désactivées pour Family Tree.",
		settings: "Réglages",
		channel: "Anniversaires et commémorations",
	},

	dateNames: {
		monthsNom: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
		monthsInDate: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
		monthsShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
		weekdaysShort: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
		/** "4 février 1950", "1er janvier 2000" */
		dayMonthYear: (day, month, year) => `${day === 1 ? "1er" : day} ${month} ${year}`,
		/** "15 oct." */
		dayMonth: (day, month) => `${day === 1 ? "1er" : day} ${month}`,
	},

	time: {
		justNow: "à l’instant",
		minutesAgo: (n) => `il y a ${count(n, "minute", "minutes")}`,
		hoursAgo: (n) => `il y a ${count(n, "heure", "heures")}`,
		yesterday: "hier",
		daysAgo: (n) => `il y a ${n} jours`,
		weeksAgo: (n) => `il y a ${count(n, "semaine", "semaines")}`,
		monthsAgo: (n) => `il y a ${n} mois`,
		yearsAgo: (n) => `il y a ${ans(n)}`,
		today: "aujourd’hui",
		tomorrow: "demain",
		inDays: (n) => `dans ${n} jours`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} ${fete(age)}`,
		// "28 years" since the death: "il y a 28 ans" cannot be read as an age at death.
		remembranceTitle: (first, n) => `† ${first}, il y a ${ans(n)}`,
		birthday: "Anniversaire",
		remembrance: "Commémoration",
		roundAge: "âge rond",
		reminderEve: (first, age) => `${first} ${fete(age)} demain`,
		reminderEveRoundBody: (first) => `Un anniversaire rond. Un petit coup de fil à ${first} ?`,
		reminderWeek: (first, age) => `${first} ${fete(age)} dans une semaine`,
		reminderWeekBody: (dayMonth) => `Un anniversaire rond le ${dayMonth}.`,
		reminderRemembrance: (name, n) => `† ${name}, il y a ${ans(n)}`,
		reminderRemembranceBody: (dayMonth) => `Commémoration · ${dayMonth}`,
	},

	ics: {
		calName: "Anniversaires",
		birthdayTitle: (name) => `Anniversaire ${de(name)}`,
		birthdayDesc: (name) => `L’anniversaire ${de(name)} tombe ce jour-là`,
		deathTitle: (name) => `Anniversaire du décès ${de(name)}`,
		deathDesc: (name) => `L’anniversaire du décès ${de(name)} tombe ce jour-là`,
		fileSuffix: "dates",
		shareTitle: (tree) => `${tree} – dates`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biologique", "IN-LAW": "Par alliance", CHURCH: "Religieux", IRRELEVANT: "Autres" },
		types: {
			IS_FATHER_OF: { label: "Père", sentence: () => "est le père de" },
			IS_MOTHER_OF: { label: "Mère", sentence: () => "est la mère de" },
			IS_MARRIED_TO: { label: "Mariage", sentence: (g) => gw(g, "est marié avec", "est mariée avec") },
			LIVES_WITH: { label: "Vit avec", sentence: () => "vit avec" },
			IS_PARTNER_OF: { label: "Partenaire", sentence: (g) => gw(g, "est le partenaire de", "est la partenaire de") },
			IS_ENGAGED_TO: { label: "Fiancés", sentence: (g) => gw(g, "est fiancé à", "est fiancée à") },
			IS_GODPARENT_OF: {
				label: "Parrain / marraine",
				sentence: (g) => gw(g, "est le parrain de", "est la marraine de"),
				role: (g) => gw(g, "Parrain", "Marraine"),
				inverseRole: (g) => gw(g, "Filleul", "Filleule"),
			},
			IS_FRIEND_OF: {
				label: "Amitié",
				sentence: (g) => gw(g, "est l’ami de", "est l’amie de"),
				role: (g) => gw(g, "Ami", "Amie"),
				inverseRole: (g) => gw(g, "Ami", "Amie"),
			},
			IS_STEPPARENT_OF: {
				label: "Beau-parent",
				sentence: (g) => gw(g, "est le beau-père de", "est la belle-mère de"),
				role: (g) => gw(g, "Beau-père", "Belle-mère"),
				inverseRole: (g) => gw(g, "Beau-fils", "Belle-fille"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Mère",
			father: "Père",
			child: "Enfant",
			sibling: (g) => gw(g, "Frère", "Sœur"),
			isSourceOf: (first, labelLower) => `${first} est ${labelLower}`,
		},
	},

	kin: {
		you: "vous",
		youTitle: "Vous",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "mari", "femme");
					case "partner":
						return gw(g, "compagnon", "compagne");
					case "parentInLaw":
						return gw(g, "beau-père", "belle-mère");
					case "siblingInLaw":
						return gw(g, "beau-frère", "belle-sœur");
					case "childInLaw":
						return gw(g, "gendre", "belle-fille");
					// French does not distinguish step relatives from in-laws.
					case "stepParent":
						return gw(g, "beau-père", "belle-mère");
					case "stepChild":
						return gw(g, "beau-fils", "belle-fille");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) return u === 1 ? gw(g, "père", "mère") : arriere(u - 2) + gw(g, "grand-père", "grand-mère");
			if (u === 0) return d === 1 ? gw(g, "fils", "fille") : arriere(d - 2) + gw(g, "petit-fils", "petite-fille");
			if (u === 1 && d === 1) return gw(g, "frère", "sœur");
			if (d === 1) return u === 2 ? gw(g, "oncle", "tante") : arriere(u - 3) + gw(g, "grand-oncle", "grand-tante");
			if (u === 1) return d === 2 ? gw(g, "neveu", "nièce") : arriere(d - 3) + gw(g, "petit-neveu", "petite-nièce");
			// Cousins "removed" have no French word: the chain says it instead.
			if (u !== d) return null;
			const degree = u - 1;
			const base = gw(g, "cousin", "cousine");
			return degree === 1 ? base : `${base} au ${DEGRE[degree] ?? `${degree}e`} degré`;
		},
		word: (w: KinWord) => noun(w),
		/** The chain runs from the far person back to you: "la fille du frère de votre mère". */
		chain: (words: KinWord[]) => {
			if (!words.length) return "vous";
			const [first, ...rest] = words;
			if (!rest.length) return `votre ${noun(first)}`;
			const far = [...rest].reverse();
			return [art(far[0]), ...far.slice(1).map(du), `de votre ${noun(first)}`].join(" ");
		},
		phrase: (term, _g) => `votre ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "fils de", "fille de");
				case "down":
					return gw(g, "père de", "mère de");
				case "sibling":
					return gw(g, "frère de", "sœur de");
				case "spouse":
					return gw(g, "mari de", "femme de");
				default:
					return typeSentence ?? gw(g, "lié à", "liée à");
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			const same = (nom: string) => ({ nom, gen: nom });
			if (typeName === "IS_GODPARENT_OF") return same(farIsSource ? (f ? "marraine" : "parrain") : f ? "filleule" : "filleul");
			if (typeName === "IS_FRIEND_OF") return same(f ? "amie" : "ami");
			if (typeName === "IS_STEPPARENT_OF") return same(farIsSource ? (f ? "belle-mère" : "beau-père") : f ? "belle-fille" : "beau-fils");
			void bidirectional;
			// Unknown type: its (English) name, as is.
			return same(fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase());
		},
	},
};
