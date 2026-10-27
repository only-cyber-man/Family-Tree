import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// Français (France). Typed as Dict, so TypeScript fails when a key is missing.
// Register: "vous" throughout. French typography: a no-break space before
// « : », « ? », « ; », inside guillemets.

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

/** CLDR French keeps 0 singular: "0 personne", "1 personne", "2 personnes". */
const people = (count: number) => simple("fr", count, "personne", "personnes");
const relationships = (count: number) => simple("fr", count, "relation", "relations");
const themes: Record<ThemePref, string> = { light: "Clair", dark: "Sombre", system: "Système" };
/** "de Maria" / "d’Anna": the preposition elides before a vowel (not before H, which may be aspirated in a name). */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöùûü]/i.test(name) ? `d’${name}` : `de ${name}`);
const arriere = (level: number) => "arrière-".repeat(level);

/** Relationship types from ft_relationships_names that have a French phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Père",
		edge: () => "père",
		sentence: (from, to) => `${from} est le père ${de(to)}`,
		role: (otherIsSource, other) => (otherIsSource ? "père" : g(other, "fils", "fille")),
	},
	IS_MOTHER_OF: {
		type: "Mère",
		edge: () => "mère",
		sentence: (from, to) => `${from} est la mère ${de(to)}`,
		role: (otherIsSource, other) => (otherIsSource ? "mère" : g(other, "fils", "fille")),
	},
	IS_MARRIED_TO: {
		type: "Mariage",
		edge: () => "mariage",
		sentence: (from, to) => `${from} et ${to} sont mariés`,
		role: (_, other) => g(other, "mari", "femme"),
	},
	LIVES_WITH: {
		type: "Vit avec",
		edge: () => "vit avec",
		sentence: (from, to) => `${from} et ${to} vivent ensemble`,
		role: () => "vit avec",
	},
	IS_PARTNER_OF: {
		type: "Partenaire",
		edge: () => "partenaires",
		sentence: (from, to) => `${from} et ${to} sont partenaires`,
		role: (_, other) => g(other, "compagnon", "compagne"),
	},
	IS_ENGAGED_TO: {
		type: "Fiancés",
		edge: () => "fiancés",
		sentence: (from, to) => `${from} et ${to} sont fiancés`,
		role: (_, other) => g(other, "fiancé", "fiancée"),
	},
	IS_GODPARENT_OF: {
		type: "Parrain / marraine",
		edge: (from) => (from ? g(from, "parrain", "marraine") : "parrainage"),
		sentence: (from, to, gender) =>
			`${from} est ${gender ? g(gender, "le parrain", "la marraine") : "parrain ou marraine"} ${de(to)}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "parrain", "marraine") : g(other, "filleul", "filleule"),
	},
	IS_FRIEND_OF: {
		type: "Amitié",
		edge: () => "amis",
		sentence: (from, to) => `${from} et ${to} sont amis`,
		role: (_, other) => g(other, "ami", "amie"),
	},
	IS_STEPPARENT_OF: {
		type: "Beau-parent",
		edge: (from) => (from ? g(from, "beau-père", "belle-mère") : "beau-parent"),
		sentence: (from, to, gender) =>
			`${from} est ${gender ? g(gender, "le beau-père", "la belle-mère") : "le beau-parent"} ${de(to)}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "beau-père", "belle-mère") : g(other, "beau-fils", "belle-fille"),
	},
};

export const fr: Dict = {
	locale: "fr" as Locale,
	dateLocale: "fr-FR",

	common: {
		appName: "Family Tree",
		createdBy: "Créé par tomek7667",
		cancel: "Annuler",
		save: "Enregistrer",
		done: "Terminé",
		close: "Fermer",
		dismiss: "Fermer la notification",
		undo: "Annuler",
		edit: "Modifier",
		remove: "Supprimer",
		optional: "facultatif",
		loading: "Chargement…",
		owner: "Propriétaire",
		sharedWithYou: "Partagé avec vous",
		viewerReadOnly: "Lecteur · lecture seule",
		creator: "Créateur",
		someone: "Quelqu’un",
		someoneLower: "quelqu’un",
		unknownAccount: "compte inconnu",
		you: "vous",
		withYou: (name) => `${name} (vous)`,
		male: "Homme",
		female: "Femme",
		justNow: "à l’instant",
		people,
		relationships,
		mainNav: "Navigation principale",
		clearAll: "Tout effacer",
		addRelationship: "Ajouter une relation",
		removeRelationship: "Supprimer la relation",
		manageInvited: "Gérer les invités",
		emailInvalid: "Cela ne ressemble pas à une adresse e-mail complète.",
	},

	prefs: {
		group: "Préférences d’affichage",
		language: "Langue",
		theme: "Thème",
		themes,
		themeCycle: (current, next) =>
			`Thème : ${themes[current].toLowerCase()}. Passer à ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"Un arbre généalogique privé, dessiné comme un graphe. Ajoutez les personnes que vous connaissez, reliez-les selon leurs liens de parenté et regardez les générations s’aligner par année de naissance.",
		signIn: "Connexion",
		signUp: "Inscription",
		account: "Compte",
		trees: "Vos arbres",
		tree: "Arbre",
		privacy: "Politique de confidentialité",
		privacyDescription: "Ce que Family Tree conserve, pourquoi, et comment le supprimer.",
		deleteAccount: "Supprimer votre compte",
		deleteAccountDescription: "Comment supprimer votre compte Family Tree et vos données.",
	},

	legal: {
		privacy: "Confidentialité",
		deleteAccount: "Supprimer le compte",
		signIn: "Se connecter",
		privacyTitle: "Politique de confidentialité",
		privacyEffective: "En vigueur à compter du 25 septembre 2026",
		deleteTitle: "Supprimer votre compte",
		deleteAppliesTo:
			"S’applique au site web Family Tree et à l’application Family Tree pour Android et iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Supprimer mon compte Family Tree",
		deleteMailBody: (email) =>
			`Merci de supprimer mon compte Family Tree${email ? ` (${email})` : ""} ainsi que tous les arbres que j’ai créés.`,
	},

	errorPage: {
		title: "Une erreur s’est produite",
		home: "Aller à la page d’accueil",
	},

	landing: {
		nav: {
			features: "Fonctionnalités",
			calendar: "Calendrier",
			mobile: "Application mobile",
			how: "Comment ça marche",
			logIn: "Se connecter",
			signUp: "S’inscrire",
			openMenu: "Ouvrir le menu",
			closeMenu: "Fermer le menu",
		},
		deleted: "Votre compte et vos arbres ont été supprimés.",
		eyebrow: "Un arbre généalogique privé, dessiné comme un graphe",
		title: "Chaque famille est un graphe. Dessinez le vôtre.",
		lead:
			"Ajoutez les personnes que vous connaissez, reliez-les selon leurs liens de parenté et regardez les générations s’aligner par année de naissance. Privé par défaut, partagé uniquement avec les proches que vous invitez.",
		cta: "Commencez votre arbre, gratuitement",
		logIn: "Se connecter",
		fine: "Sans publicité, sans profils publics.",
		treeEyebrow: "L’arbre",
		treeTitle: "Des cases et des lignes, pas des formulaires et des tableaux.",
		treeBody:
			"Vous construisez l’arbre comme vous le dessineriez au dos d’une enveloppe : une carte par personne, une ligne par relation. Déplacez, zoomez, et cliquez sur n’importe qui pour voir de qui il s’agit.",
		decades: ["1920", "1940", "1970", "2000"],
		timelineTitle: "Une frise des générations",
		timelineBody:
			"Les personnes se placent sur un axe vertical selon leur année de naissance. Les grands-parents en haut, les petits-enfants en bas, et une nouvelle bande tous les vingt ans. Vous ne vous demandez plus jamais qui est venu en premier.",
		lines: {
			biological: "Biologique",
			married: "Mariage",
			livesWith: "Vit avec",
			church: "Religieux",
			other: "Autres",
		},
		kindsTitle: "Quatre sortes de famille",
		kindsBody:
			"Le sang, le mariage, les parrains et marraines, et le voisin que tout le monde appelle tonton. Chaque groupe a sa propre ligne : un mariage est le trait le plus épais de la page et « vit avec » le plus léger, pour que l’arbre se lise d’un coup d’œil tout en racontant toute l’histoire.",
		chips: ["Âge 40–90", "Masqué : Alliance", "Femmes uniquement", "Sauf : Nowak"],
		filtersTitle: "Des filtres qui font le tri",
		filtersBody:
			"Masquez un type de relation, limitez à une tranche d’âge, n’affichez qu’un côté de la famille. Ce qui reste à l’écran est ce qui est exporté.",
		calendarEyebrow: "Export vers le calendrier",
		calendarTitle: "Chaque anniversaire. Chaque commémoration. Dans le calendrier que vous utilisez déjà.",
		calendarBody:
			"Un clic transforme la partie visible de votre arbre en fichier .ics : un anniversaire annuel pour chaque personne vivante, et une commémoration annuelle pour chaque personne disparue. Importez-le une fois dans Google Agenda, Calendrier Apple ou Outlook, et il se répète pour toujours.",
		pills: ["Anniversaires, chaque année", "Commémorations", "Suit vos filtres"],
		calendarMonth: "Octobre",
		calendarFile: "famille-kowalski.ics",
		calendarRows: [
			{ dow: "sam.", title: "Anniversaire de Maria Kowalska", meta: "Anniversaire · chaque année" },
			{ dow: "jeu.", title: "† Stanisław Kowalski, commémoration", meta: "Commémoration · chaque année" },
			{ dow: "mer.", title: "Anniversaire de Zofia Nowak", meta: "Anniversaire · chaque année" },
		],
		privateEyebrow: "Privé par défaut",
		privateTitle: "À vous, et à ceux que vous invitez.",
		privateBody:
			"Il n’y a ni arbres publics ni recherche entre familles. Vous créez un arbre, vous invitez vos proches par e-mail, ils peuvent regarder mais pas toucher. Vous changez d’avis ? Révoquez l’accès en un clic.",
		privateYou: "tomek (vous)",
		privateCreator: "Créateur · peut tout modifier",
		privateOwner: "Propriétaire",
		privateInvited: "Invité · lecture seule",
		privateRevoke: "Révoquer",
		privateInvite: "Inviter par e-mail…",
		mobileEyebrow: "iPhone et Android",
		mobileTitle: "L’arbre dans votre poche, pour les moments où vous en avez besoin.",
		mobileBody:
			"À un mariage, un visage vous échappe ? Cherchez un nom et voyez quel est votre lien. L’application garde aussi la liste des anniversaires et commémorations à venir, avec un rappel la veille, et vous permet d’ajouter un nouveau proche avec sa photo en quelques gestes.",
		appStoreSmall: "Bientôt disponible sur",
		playStoreSmall: "BIENTÔT SUR",
		phoneUpcoming: "À venir",
		phoneRows: [
			{ t: "Maria fête ses 75 ans", m: "sam. 3 oct. · dans 8 jours" },
			{ t: "† Stanisław, il y a 28 ans", m: "jeu. 15 oct." },
			{ t: "Zofia fête ses 21 ans", m: "mer. 28 oct." },
		],
		phoneRelation: "1976 · 50 · la cousine de votre mère",
		howTitle: "Comment ça marche",
		steps: [
			{
				title: "Commencez par vous",
				body: "Créez un arbre, ajoutez la première personne : un nom, une date de naissance, et une photo si vous en avez une.",
			},
			{
				title: "Reliez les personnes que vous connaissez",
				body: "Parents, partenaires, parrains et marraines. Choisissez deux personnes et une relation, et la ligne se dessine d’elle-même dans la bonne génération.",
			},
			{
				title: "Invitez la famille",
				body: "Partagez un accès en lecture seule par e-mail, exportez les dates vers votre calendrier et gardez l’arbre sur votre téléphone.",
			},
		],
		minute: "Cela prend environ une minute.",
		hero: {
			label: "Exemple d’arbre généalogique sur quatre générations",
			married: "mariage",
			godparent: "parrain",
		},
	},

	auth: {
		signInPrompt: "Première visite ?",
		signInLink: "Créer un compte",
		signUpPrompt: "Vous avez déjà un compte ?",
		signUpLink: "Se connecter",
		missingCredentials: "Saisissez votre nom d’utilisateur ou votre e-mail, ainsi que votre mot de passe.",
		unreachable: "Impossible de joindre le serveur. Réessayez.",
		wrongCredentials: "Nom d’utilisateur ou mot de passe incorrect. Vérifiez les deux et réessayez.",
		resetEmailMissing: "Saisissez l’adresse e-mail de votre compte.",
		resetSent: (email) =>
			`Si un compte existe pour ${email}, un lien de réinitialisation est en route. Consultez votre boîte de réception.`,
		resetFailed: "Impossible d’envoyer l’e-mail de réinitialisation. Réessayez.",
		resetTitle: "Réinitialiser le mot de passe",
		resetSubtitle: "Nous vous enverrons par e-mail un lien pour en choisir un nouveau.",
		welcomeTitle: "Ravi de vous revoir",
		welcomeSubtitle: "Connectez-vous pour ouvrir vos arbres.",
		email: "E-mail",
		usernameOrEmail: "Nom d’utilisateur ou e-mail",
		password: "Mot de passe",
		forgot: "Oublié ?",
		sending: "Envoi…",
		sendReset: "Envoyer le lien",
		signingIn: "Connexion…",
		signIn: "Se connecter",
		backToSignIn: "Retour à la connexion",
		noAccount: "Pas encore de compte ?",
		signUp: "S’inscrire",
		showPassword: "Afficher le mot de passe",
		hidePassword: "Masquer le mot de passe",
		pickUsername: "Choisissez un nom d’utilisateur.",
		minPassword: (min) => `Au moins ${simple("fr", min, "caractère", "caractères")}.`,
		passwordsDiffer: "Les mots de passe ne correspondent pas.",
		createFailed: "Impossible de créer le compte.",
		signInAfterCreateFailed: (message) =>
			`Votre compte a été créé, mais la connexion a échoué : ${message}. Essayez de vous connecter.`,
		unknownError: "erreur inconnue",
		registerTitle: "Commencez votre arbre",
		registerSubtitle: "Gratuit, privé, sans publicité.",
		username: "Nom d’utilisateur",
		displayName: "Nom affiché",
		confirmPassword: "Confirmer le mot de passe",
		creating: "Création du compte…",
		create: "Créer le compte",
		registerNote:
			"Nous vous enverrons un e-mail de vérification. Votre arbre n’est visible que par vous et par les personnes que vous invitez.",
	},

	nav: {
		trees: "Arbres",
		account: "Votre compte",
		logOut: "Se déconnecter",
	},

	account: {
		title: "Votre compte",
		username: "Nom d’utilisateur :",
		displayName: "Nom affiché :",
		email: "E-mail :",
		deleteHeading: "Supprimer le compte",
		deleteBodyBefore:
			"Supprime votre compte et chaque arbre que vous avez créé, avec toutes les personnes, photos et relations qu’ils contiennent. Les arbres que d’autres ont partagés avec vous ne sont pas concernés. Voir la ",
		deleteBodyLink: "politique de confidentialité",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Votre compte n’a pas pu être supprimé ici (${error}). `,
		failedLink: "Envoyez une demande de suppression par e-mail",
		failedAfter: " et elle sera traitée sous 30 jours.",
		deleteButton: "Supprimer le compte…",
		confirmTitle: "Supprimer votre compte ?",
		confirmBody:
			"Cela supprime votre compte et chaque arbre que vous avez créé, avec toutes les personnes, photos et relations qu’ils contiennent. Les personnes que vous avez invitées perdent l’accès. Cette action est irréversible.",
		confirmLabel: "Tout supprimer",
		keep: "Garder mon compte",
		typeToConfirm: "Saisissez SUPPRIMER pour confirmer",
		confirmWords: ["supprimer", "delete"],
	},

	dashboard: {
		onlyYou: "Seulement vous",
		viewers: (count) => simple("fr", count, "invité", "invités"),
		byCreator: (name) => `par ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}mis à jour ${ago}`,
		moreActions: (name) => `Plus d’actions pour ${name}`,
		rename: "Renommer",
		deleteTree: "Supprimer l’arbre…",
		open: "Ouvrir",
		emptyTitle: "Aucun arbre pour l’instant",
		emptyBody:
			"Commencez par les personnes que vous connaissez le mieux : vous, vos parents, vos grands-parents. Vous pourrez inviter le reste de la famille quand il y aura quelque chose à voir.",
		createFirst: "Créer votre premier arbre",
		emptyNote: "Vous attendez une invitation ? Les arbres partagés avec vous apparaissent ici automatiquement.",
		title: "Vos arbres",
		count: (total, owned, shared) =>
			`${simple("fr", total, "arbre", "arbres")}${
				shared > 0 ? ` · ${owned} à vous, ${simple("fr", shared, "partagé avec vous", "partagés avec vous")}` : ""
			}`,
		newTree: "Nouvel arbre",
	},

	treeDialogs: {
		nameRequired: "Donnez un nom à l’arbre.",
		created: "Arbre créé",
		newTitle: "Nouvel arbre",
		newSubtitle: "Donnez-lui un nom que vous diriez à voix haute.",
		treeName: "Nom de l’arbre",
		namePlaceholder: "Mon arbre généalogique",
		nameHint: "Par exemple « Famille Kowalski » ou « Côté maman ».",
		createAndOpen: "Créer et ouvrir",
		nameEmpty: "Le nom ne peut pas être vide.",
		renamed: "Arbre renommé",
		renameTitle: "Renommer l’arbre",
		alreadyHasAccess: "Cette personne a déjà accès.",
		noAccount: "Cet e-mail n’a pas encore de compte Family Tree.",
		thatsYou: "C’est vous. Vous êtes déjà propriétaire de cet arbre.",
		invited: (email, tree) => `${email} peut maintenant voir « ${tree} »`,
		revoked: "Accès révoqué",
		whoCanSee: (tree) => `Qui peut voir « ${tree} »`,
		whoCanSeeSubtitle:
			"Les personnes invitées peuvent regarder, pas modifier. Il leur faut un compte Family Tree avec cet e-mail.",
		emailPlaceholder: "nom@exemple.fr",
		emailToInvite: "E-mail à inviter",
		invite: "Inviter",
		revoke: "Révoquer",
		deleteTitle: (tree) => `Supprimer « ${tree} » ?`,
		deleteBody: (count, viewers) =>
			`Cela supprime ${count === null ? "toutes les personnes de l’arbre" : people(count)} ainsi que toutes leurs relations${
				viewers > 0 ? `, pour vous et ${simple("fr", viewers, "invité", "invités")}` : ""
			}. Cette action est irréversible.`,
		deleted: (tree) => `« ${tree} » supprimé`,
		deleteConfirm: "Supprimer l’arbre",
		keep: "Le garder",
		typeName: "Saisissez le nom de l’arbre pour confirmer",
	},

	tree: {
		legend: "Légende",
		deceased: "† décédé(e)",
		filtersCleared: "Filtres effacés pour afficher cette personne",
		unknownType: "Inconnu",
		chipHide: (type) => `Masqué : ${type}`,
		chipAge: (min, max, plus) => `Âge ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Hommes uniquement",
		chipWomen: "Femmes uniquement",
		chipNot: (names) => `Sauf : ${names}`,
		chipOnly: (names) => `Seulement : ${names}`,
		removeFilter: (text) => `Supprimer le filtre ${text}`,
		exported: (filename, count) => `${filename} téléchargé · ${people(count)}`,
		calendarFailed: "Impossible de créer le calendrier",
		back: "Retour aux arbres",
		openFailed: "Cet arbre n’a pas pu être ouvert",
		backToTrees: "Retour à vos arbres",
		loadingTree: "Chargement de l’arbre…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Personne ici pour l’instant",
		emptyOwner:
			"Ajoutez la première personne ; vous-même, c’est un bon début. Chaque personne ajoutée s’aligne par année de naissance.",
		emptyViewer: "Le créateur n’a encore ajouté personne à cet arbre.",
		addFirst: "Ajouter la première personne",
		editToolbar: "Modifier l’arbre",
		viewToolbar: "Affichage",
		addPerson: "Ajouter une personne",
		findPerson: "Rechercher une personne",
		filters: "Filtres",
		exportCalendar: "Exporter vers le calendrier",
		zoomIn: "Zoom avant",
		zoomOut: "Zoom arrière",
		fit: "Ajuster à l’écran",
		visible: (shown, total) => `${shown} sur ${people(total)} visibles`,
		saved: "Modifications enregistrées",
		added: (name) => `${name} a rejoint l’arbre`,
		relationshipAdded: "Relation ajoutée",
		removePersonTitle: (name) => `Supprimer ${name} ?`,
		removePersonBody: (count) =>
			`Cela supprime aussi ${simple("fr", count, "relation liée", "relations liées")} à cette personne. Cette action est irréversible.`,
		removePerson: "Supprimer la personne",
		personRemoved: (name) => `${name} n’est plus dans l’arbre`,
		removeEdgeTitle: "Supprimer cette relation ?",
		removeEdgeBody: (sentence) => `${sentence}. Les deux personnes restent dans l’arbre.`,
		relationshipRemoved: "Relation supprimée",
		canvas: "Zone de l’arbre généalogique. Faites glisser pour déplacer, faites défiler pour zoomer.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", décédé(e)" : ""}${
				link === "you" ? ", c’est vous" : link === "linked" ? ", lié à un compte" : ""
			}`,
		youPill: "Vous",
		legendYou: "Vous",
		legendLinked: "Compte lié",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `Détails ${de(name)}`,
		removeWith: (name) => `Supprimer la relation avec ${name}`,
		noRelationships: "Aucune relation pour l’instant.",
		showFamily: "Afficher la famille élargie",
		hideFamily: "Masquer la famille élargie",
		noFamily: "Aucun lien de parenté ni de mariage pour déterminer la famille élargie.",
		removeNamed: (name) => `Supprimer ${name}`,
		readOnly: "Lecture seule. Seul le créateur de l’arbre peut modifier.",
		thisIsYou: "C’est vous",
		linkedTo: (email) => `Lié au compte ${email}`,
		note: "Note",
		relationship: "Relation",
		bidirectional: "réciproque",
		directional: "orientée →",
	},

	filters: {
		hideTypes: "Masquer des types de relation",
		hideTypesHint: "Les types barrés sont masqués dans l’arbre et dans l’export.",
		age: "Âge",
		minimum: "Minimum",
		maximum: "Maximum",
		ageHint: "Âge au décès pour les personnes décédées.",
		gender: "Sexe",
		everyone: "Tout le monde",
		men: "Hommes",
		women: "Femmes",
		includeByName: "Afficher seulement les noms contenant",
		includeHint: "Séparés par des virgules. Garde les personnes dont le nom contient l’un d’eux.",
		excludeByName: "Exclure par nom",
		excludeHint:
			"Séparés par des virgules. Correspond à n’importe quelle partie du nom, sans tenir compte de la casse ni des accents.",
	},

	dialogs: {
		findTitle: "Rechercher une personne",
		findPlaceholder: "Saisissez un nom…",
		searchPeople: "Rechercher des personnes",
		noResults: "Personne de ce nom.",
		nameRequired: "Saisissez un nom.",
		birthRequired: "Saisissez une date de naissance.",
		deathBeforeBirth: "La date de décès précède la date de naissance.",
		editPerson: "Modifier la personne",
		addPerson: "Ajouter une personne",
		personSubtitle: "Le nom et la date de naissance sont obligatoires. Le reste peut attendre.",
		changePhoto: "Changer la photo",
		uploadPhoto: "Importer une photo",
		photoHint: "JPG ou PNG, jusqu’à 5 Mo. Le format carré convient le mieux.",
		photoTooLarge: "Cette photo dépasse 5 Mo.",
		fullName: "Nom complet",
		namePlaceholder: "par ex. Maria Kowalska",
		birthDate: "Date de naissance",
		deathDate: "Date de décès",
		note: "Note",
		noteHint: "Tout ce qui mérite d’être retenu : un nom de jeune fille, un lieu de vie, une anecdote.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `La note doit faire moins de ${max} caractères.`,
		linkedAccount: "Compte lié",
		linkedHint: "Le compte Family Tree de cette personne, si elle a accès à l’arbre.",
		linkedNone: "Aucun",
		linkedMe: (name) => `Moi (${name})`,
		linkedConflict: (account, person) =>
			`${account} est déjà lié à ${person}. Un compte ne peut être lié qu’à une seule personne ; retirez d’abord ce lien.`,
		saveChanges: "Enregistrer les modifications",
		addToTree: "Ajouter à l’arbre",
		search: "Rechercher…",
		readAsSentence: "Lu comme une phrase :",
		duplicate: "Cette relation est déjà dans l’arbre.",
		fromPerson: "Personne de départ",
		toPerson: "Personne d’arrivée",
		relationType: "Type de relation",
		bothWays: "dans les deux sens",
		oneWay: "dans un sens",
		exportTitle: "Exporter vers le calendrier",
		exportHeading: (count) => `Exporter ${people(count)} vers votre calendrier`,
		exportBody:
			"Un seul fichier .ics avec un anniversaire annuel pour chaque personne vivante et une commémoration annuelle pour chaque personne disparue. Les personnes masquées ne sont pas incluses.",
		birthdays: "Anniversaires",
		remembrances: "Commémorations",
		download: "Télécharger le .ics",
	},

	person: {
		age: (age, _gender, deceased) =>
			deceased ? `${simple("fr", age, "an", "ans")} au décès` : simple("fr", age, "an", "ans"),
	},

	family: {
		/** 0 → Grands-parents, 1 → Arrière-grands-parents, … */
		ancestors: (level) => (level === 0 ? "Grands-parents" : `Arrière-${arriere(level - 1)}grands-parents`),
		descendants: (level) => (level === 0 ? "Petits-enfants" : `Arrière-${arriere(level - 1)}petits-enfants`),
		parents: "Parents",
		auntsAndUncles: "Oncles et tantes",
		siblings: "Frères et sœurs",
		children: "Enfants",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biologique",
			"IN-LAW": "Par alliance",
			CHURCH: "Religieux",
			IRRELEVANT: "Autres",
		},
		legend: {
			married: "Mariage",
			livesWith: "Vit avec",
		},
		known,
		// Unknown types keep their English database name, so arrows read better than a French verb around it.
		fallbackSentence: (from, phrase, _isVerb, to) => `${from} → ${phrase} → ${to}`,
		fallbackRole: (phrase, _isVerb, firstName, selectedIsSource) =>
			selectedIsSource ? `${firstName} → ${phrase}` : `${phrase} → ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name}, commémoration`,
		remembranceDescription: (name, born) => `Anniversaire du décès ${de(name)} (naissance en ${born}).`,
		birthdayTitle: (name) => `Anniversaire ${de(name)}`,
		birthdayDescription: (name, born, gender) => `${name} est ${g(gender, "né", "née")} en ${born}.`,
		fileFallback: "arbre-genealogique",
	},
};
