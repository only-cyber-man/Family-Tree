import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// Spanish strings. Typed as Dict, so TypeScript fails when a key is missing.
// Neutral international Spanish, informal address ("tú").

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

const people = (count: number) => simple("es", count, "persona", "personas");
const relationships = (count: number) => simple("es", count, "relación", "relaciones");
const years = (count: number) => simple("es", count, "año", "años");
const themes: Record<ThemePref, string> = { light: "Claro", dark: "Oscuro", system: "Sistema" };

/** Relationship types from ft_relationships_names that have a Spanish phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Padre",
		edge: () => "padre",
		sentence: (from, to) => `${from} es padre de ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "padre" : g(other, "hijo", "hija")),
	},
	IS_MOTHER_OF: {
		type: "Madre",
		edge: () => "madre",
		sentence: (from, to) => `${from} es madre de ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "madre" : g(other, "hijo", "hija")),
	},
	IS_MARRIED_TO: {
		type: "Matrimonio",
		edge: () => "matrimonio",
		sentence: (from, to) => `${from} y ${to} están casados`,
		role: (_, other) => g(other, "esposo", "esposa"),
	},
	LIVES_WITH: {
		type: "Viven juntos",
		edge: () => "viven juntos",
		sentence: (from, to) => `${from} y ${to} viven juntos`,
		role: () => "viven juntos",
	},
	IS_PARTNER_OF: {
		type: "Pareja",
		edge: () => "pareja",
		sentence: (from, to) => `${from} y ${to} son pareja`,
		role: () => "pareja",
	},
	IS_ENGAGED_TO: {
		type: "Comprometidos",
		edge: () => "comprometidos",
		sentence: (from, to) => `${from} y ${to} están comprometidos`,
		role: (_, other) => g(other, "prometido", "prometida"),
	},
	IS_GODPARENT_OF: {
		type: "Padrino / madrina",
		edge: (from) => (from ? g(from, "padrino", "madrina") : "padrinos"),
		sentence: (from, to, gender) =>
			`${from} es ${gender ? g(gender, "padrino", "madrina") : "padrino o madrina"} de ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "padrino", "madrina") : g(other, "ahijado", "ahijada"),
	},
	IS_FRIEND_OF: {
		type: "Amistad",
		edge: () => "amigos",
		sentence: (from, to) => `${from} y ${to} son amigos`,
		role: (_, other) => g(other, "amigo", "amiga"),
	},
	IS_STEPPARENT_OF: {
		type: "Padrastro / madrastra",
		edge: (from) => (from ? g(from, "padrastro", "madrastra") : "padrastro / madrastra"),
		sentence: (from, to, gender) =>
			`${from} es ${gender ? g(gender, "padrastro", "madrastra") : "padrastro o madrastra"} de ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "padrastro", "madrastra") : g(other, "hijastro", "hijastra"),
	},
};

export const es: Dict = {
	locale: "es" as Locale,
	dateLocale: "es-ES",

	common: {
		appName: "Family Tree",
		createdBy: "Creado por tomek7667",
		cancel: "Cancelar",
		save: "Guardar",
		done: "Listo",
		close: "Cerrar",
		dismiss: "Descartar",
		undo: "Deshacer",
		edit: "Editar",
		remove: "Eliminar",
		optional: "opcional",
		loading: "Cargando…",
		owner: "Propietario",
		sharedWithYou: "Compartido contigo",
		viewerReadOnly: "Solo lectura",
		creator: "Creador",
		someone: "Alguien",
		someoneLower: "alguien",
		unknownAccount: "cuenta desconocida",
		you: "tú",
		withYou: (name) => `${name} (tú)`,
		male: "Hombre",
		female: "Mujer",
		justNow: "ahora mismo",
		people,
		relationships,
		mainNav: "Principal",
		clearAll: "Borrar todo",
		addRelationship: "Añadir relación",
		removeRelationship: "Eliminar relación",
		manageInvited: "Gestionar invitados",
		emailInvalid: "Eso no parece una dirección de correo completa.",
	},

	prefs: {
		group: "Preferencias de visualización",
		language: "Idioma",
		theme: "Tema",
		themes,
		themeCycle: (current, next) =>
			`Tema: ${themes[current].toLowerCase()}. Cambiar a ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"Un árbol genealógico privado, dibujado como un grafo. Añade a las personas que conoces, indica cómo se relacionan y mira cómo las generaciones se alinean por año de nacimiento.",
		signIn: "Iniciar sesión",
		signUp: "Registrarse",
		account: "Cuenta",
		trees: "Tus árboles",
		tree: "Árbol",
		privacy: "Política de privacidad",
		privacyDescription: "Qué guarda Family Tree, por qué y cómo eliminarlo.",
		deleteAccount: "Eliminar tu cuenta",
		deleteAccountDescription: "Cómo eliminar tu cuenta de Family Tree y tus datos.",
	},

	legal: {
		privacy: "Privacidad",
		deleteAccount: "Eliminar cuenta",
		signIn: "Iniciar sesión",
		privacyTitle: "Política de privacidad",
		privacyEffective: "En vigor desde el 25 de septiembre de 2026",
		deleteTitle: "Eliminar tu cuenta",
		deleteAppliesTo:
			"Se aplica al sitio web de Family Tree y a la app de Family Tree para Android e iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Eliminar mi cuenta de Family Tree",
		deleteMailBody: (email) =>
			`Por favor, eliminen mi cuenta de Family Tree${email ? ` (${email})` : ""} y todos los árboles que creé.`,
	},

	errorPage: {
		title: "Algo salió mal",
		home: "Ir a la página principal",
	},

	landing: {
		nav: {
			features: "Funciones",
			calendar: "Calendario",
			mobile: "App móvil",
			how: "Cómo funciona",
			logIn: "Iniciar sesión",
			signUp: "Registrarse",
			openMenu: "Abrir menú",
			closeMenu: "Cerrar menú",
		},
		deleted: "Tu cuenta y tus árboles se han eliminado.",
		eyebrow: "Un árbol genealógico privado, dibujado como un grafo",
		title: "Cada familia es un grafo. Dibuja el tuyo.",
		lead:
			"Añade a las personas que conoces, indica cómo se relacionan y mira cómo las generaciones se alinean por año de nacimiento. Privado por defecto, compartido solo con los familiares que invites.",
		cta: "Empieza tu árbol, gratis",
		logIn: "Iniciar sesión",
		fine: "Sin anuncios ni perfiles públicos.",
		treeEyebrow: "El árbol",
		treeTitle: "Tarjetas y líneas, no formularios ni tablas.",
		treeBody:
			"Construyes el árbol como lo dibujarías en el dorso de un sobre: una tarjeta por persona, una línea por relación. Arrastra, haz zoom y haz clic en cualquiera para ver quién es.",
		decades: ["1920", "1940", "1970", "2000"],
		timelineTitle: "Una línea de tiempo de generaciones",
		timelineBody:
			"Las personas se sitúan en un eje vertical según su año de nacimiento. Los abuelos arriba, los nietos abajo y, cada veinte años, una nueva franja. Nunca dudarás de quién vino primero.",
		lines: {
			biological: "Biológica",
			married: "Matrimonio",
			livesWith: "Viven juntos",
			church: "Religiosa",
			other: "Otra",
		},
		kindsTitle: "Cuatro tipos de familia",
		kindsBody:
			"Sangre, matrimonio, padrinos y el vecino al que todos llaman tío. Cada grupo tiene su propia línea: el matrimonio es el trazo más grueso de la página y “viven juntos” el más fino, así que el árbol se lee de un vistazo y aun así cuenta toda la historia.",
		chips: ["Edad 40–90", "Ocultar: Afinidad", "Solo mujeres", "Sin: Nowak"],
		filtersTitle: "Filtros que quitan el ruido",
		filtersBody:
			"Oculta un tipo de relación, acota un rango de edad, muestra un solo lado de la familia. Lo que quede en pantalla es lo que se exporta.",
		calendarEyebrow: "Exportar al calendario",
		calendarTitle: "Cada cumpleaños. Cada aniversario. En el calendario que ya usas.",
		calendarBody:
			"Un clic convierte la parte visible de tu árbol en un archivo .ics: un cumpleaños anual por cada persona viva y un aniversario anual por cada persona que ha fallecido. Impórtalo una vez en Google Calendar, Calendario de Apple u Outlook y se repetirá para siempre.",
		pills: ["Cumpleaños, cada año", "Aniversarios de fallecimiento", "Sigue tus filtros"],
		calendarMonth: "Octubre",
		calendarFile: "familia-kowalski.ics",
		calendarRows: [
			{ dow: "sáb", title: "Cumpleaños de Maria Kowalska", meta: "Cumpleaños · cada año" },
			{ dow: "jue", title: "† Stanisław Kowalski – aniversario de fallecimiento", meta: "Aniversario · cada año" },
			{ dow: "mié", title: "Cumpleaños de Zofia Nowak", meta: "Cumpleaños · cada año" },
		],
		privateEyebrow: "Privado por defecto",
		privateTitle: "Tuyo, y de quien tú invites.",
		privateBody:
			"No hay árboles públicos ni búsqueda entre familias. Creas un árbol, invitas a tus familiares por correo y ellos pueden mirar, pero no tocar. Si cambias de idea, revocas el acceso con un clic.",
		privateYou: "tomek (tú)",
		privateCreator: "Creador · puede editarlo todo",
		privateOwner: "Propietario",
		privateInvited: "Con invitación · solo lectura",
		privateRevoke: "Revocar",
		privateInvite: "Invitar por correo…",
		mobileEyebrow: "iPhone y Android",
		mobileTitle: "El árbol en tu bolsillo, para los momentos en que lo necesitas.",
		mobileBody:
			"¿Estás en una boda y no ubicas una cara? Busca un nombre y mira qué parentesco tiene contigo. La app también lleva una lista de próximos cumpleaños y aniversarios, con un recordatorio el día anterior, y te deja añadir a un nuevo familiar con foto en unos pocos toques.",
		appStoreSmall: "Próximamente en el",
		playStoreSmall: "PRÓXIMAMENTE EN",
		phoneUpcoming: "Próximas fechas",
		phoneRows: [
			{ t: "Maria cumple 75 años", m: "sáb 3 oct · en 8 días" },
			{ t: "† Stanisław, 28.º aniversario", m: "jue 15 oct" },
			{ t: "Zofia cumple 21 años", m: "mié 28 oct" },
		],
		phoneRelation: "1976 · 50 · la prima de tu madre",
		howTitle: "Cómo funciona",
		steps: [
			{
				title: "Empieza contigo",
				body: "Crea un árbol y añade a la primera persona: un nombre, una fecha de nacimiento y una foto si la tienes.",
			},
			{
				title: "Vincula a las personas que conoces",
				body: "Padres, parejas, padrinos. Elige a dos personas y una relación, y la línea se dibuja sola en la generación correcta.",
			},
			{
				title: "Invita a la familia",
				body: "Comparte acceso de solo lectura por correo, exporta las fechas a tu calendario y lleva el árbol en tu teléfono.",
			},
		],
		minute: "Lleva más o menos un minuto.",
		hero: {
			label: "Árbol genealógico de ejemplo con cuatro generaciones",
			married: "matrimonio",
			godparent: "padrino",
		},
	},

	auth: {
		signInPrompt: "¿Primera vez aquí?",
		signInLink: "Crear una cuenta",
		signUpPrompt: "¿Ya tienes una cuenta?",
		signUpLink: "Iniciar sesión",
		missingCredentials: "Escribe tu usuario o correo y tu contraseña.",
		unreachable: "No se pudo contactar con el servidor. Inténtalo de nuevo.",
		wrongCredentials: "Usuario o contraseña incorrectos. Revisa ambos e inténtalo de nuevo.",
		resetEmailMissing: "Escribe el correo de tu cuenta.",
		resetSent: (email) =>
			`Si ${email} tiene una cuenta, el enlace de restablecimiento ya está en camino. Revisa tu bandeja de entrada.`,
		resetFailed: "No se pudo enviar el correo de restablecimiento. Inténtalo de nuevo.",
		resetTitle: "Restablecer contraseña",
		resetSubtitle: "Te enviaremos por correo un enlace para elegir una nueva.",
		welcomeTitle: "Hola de nuevo",
		welcomeSubtitle: "Inicia sesión para abrir tus árboles.",
		email: "Correo electrónico",
		usernameOrEmail: "Usuario o correo",
		password: "Contraseña",
		forgot: "¿La olvidaste?",
		sending: "Enviando…",
		sendReset: "Enviar enlace",
		signingIn: "Iniciando sesión…",
		signIn: "Iniciar sesión",
		backToSignIn: "Volver a iniciar sesión",
		noAccount: "¿No tienes una cuenta?",
		signUp: "Registrarse",
		showPassword: "Mostrar contraseña",
		hidePassword: "Ocultar contraseña",
		pickUsername: "Elige un nombre de usuario.",
		minPassword: (min) => `Al menos ${simple("es", min, "carácter", "caracteres")}.`,
		passwordsDiffer: "Las contraseñas no coinciden.",
		createFailed: "No se pudo crear la cuenta.",
		signInAfterCreateFailed: (message) =>
			`Tu cuenta se creó, pero no se pudo iniciar sesión: ${message}. Prueba a iniciar sesión.`,
		unknownError: "error desconocido",
		registerTitle: "Empieza tu árbol",
		registerSubtitle: "Gratis, privado y sin anuncios.",
		username: "Nombre de usuario",
		displayName: "Nombre visible",
		confirmPassword: "Confirmar contraseña",
		creating: "Creando la cuenta…",
		create: "Crear cuenta",
		registerNote:
			"Te enviaremos un correo de verificación. Tu árbol solo lo ven tú y las personas que invites.",
	},

	nav: {
		trees: "Árboles",
		account: "Tu cuenta",
		logOut: "Cerrar sesión",
	},

	account: {
		title: "Tu cuenta",
		username: "Nombre de usuario:",
		displayName: "Nombre visible:",
		email: "Correo:",
		deleteHeading: "Eliminar cuenta",
		deleteBodyBefore:
			"Elimina tu cuenta y todos los árboles que creaste, con todas las personas, fotos y relaciones que contienen. Los árboles que otras personas compartieron contigo no se ven afectados. Consulta la ",
		deleteBodyLink: "política de privacidad",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Tu cuenta no se pudo eliminar aquí (${error}). `,
		failedLink: "Envía una solicitud de eliminación por correo",
		failedAfter: " y se hará en un plazo de 30 días.",
		deleteButton: "Eliminar cuenta…",
		confirmTitle: "¿Eliminar tu cuenta?",
		confirmBody:
			"Esto elimina tu cuenta y todos los árboles que creaste, con todas las personas, fotos y relaciones que contienen. Las personas que invitaste pierden el acceso. No se puede deshacer.",
		confirmLabel: "Eliminar todo",
		keep: "Conservar mi cuenta",
		typeToConfirm: "Escribe ELIMINAR para confirmar",
		confirmWords: ["eliminar", "delete"],
	},

	dashboard: {
		onlyYou: "Solo tú",
		viewers: (count) => simple("es", count, "persona invitada", "personas invitadas"),
		byCreator: (name) => `de ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}actualizado ${ago}`,
		moreActions: (name) => `Más acciones para ${name}`,
		rename: "Cambiar nombre",
		deleteTree: "Eliminar árbol…",
		open: "Abrir",
		emptyTitle: "Aún no hay árboles",
		emptyBody:
			"Empieza por las personas que mejor conoces: tú, tus padres, tus abuelos. Podrás invitar al resto de la familia cuando haya algo que ver.",
		createFirst: "Crea tu primer árbol",
		emptyNote: "¿Esperas una invitación? Los árboles compartidos contigo aparecen aquí automáticamente.",
		title: "Tus árboles",
		count: (total, owned, shared) =>
			`${simple("es", total, "árbol", "árboles")}${
				shared > 0 ? ` · ${owned} tuyos, ${shared} compartidos contigo` : ""
			}`,
		newTree: "Nuevo árbol",
	},

	treeDialogs: {
		nameRequired: "Ponle un nombre al árbol.",
		created: "Árbol creado",
		newTitle: "Nuevo árbol",
		newSubtitle: "Ponle un nombre que dirías en voz alta.",
		treeName: "Nombre del árbol",
		namePlaceholder: "Mi árbol genealógico",
		nameHint: "Por ejemplo, “Familia García” o “La familia de mamá”.",
		createAndOpen: "Crear y abrir",
		nameEmpty: "El nombre no puede estar vacío.",
		renamed: "Nombre del árbol cambiado",
		renameTitle: "Cambiar el nombre del árbol",
		alreadyHasAccess: "Esa persona ya tiene acceso.",
		noAccount: "Ese correo aún no tiene una cuenta de Family Tree.",
		thatsYou: "Eres tú. Este árbol ya es tuyo.",
		invited: (email, tree) => `${email} ya puede ver ${tree}`,
		revoked: "Acceso revocado",
		whoCanSee: (tree) => `Quién puede ver ${tree}`,
		whoCanSeeSubtitle:
			"Las personas invitadas pueden ver, no editar. Necesitan una cuenta de Family Tree con este correo.",
		emailPlaceholder: "nombre@ejemplo.com",
		emailToInvite: "Correo de la persona a invitar",
		invite: "Invitar",
		revoke: "Revocar",
		deleteTitle: (tree) => `¿Eliminar “${tree}”?`,
		deleteBody: (count, viewers) =>
			`Esto elimina ${count === null ? "a todas las personas que contiene" : `a ${people(count)}`} y todas sus relaciones${
				viewers > 0 ? ` para ti y ${simple("es", viewers, "persona invitada", "personas invitadas")}` : ""
			}. No se puede deshacer.`,
		deleted: (tree) => `${tree} eliminado`,
		deleteConfirm: "Eliminar árbol",
		keep: "Conservarlo",
		typeName: "Escribe el nombre del árbol para confirmar",
	},

	tree: {
		legend: "Leyenda",
		deceased: "† fallecidos",
		filtersCleared: "Filtros borrados para mostrar a esta persona",
		unknownType: "Desconocido",
		chipHide: (type) => `Ocultar: ${type}`,
		chipAge: (min, max, plus) => `Edad ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Solo hombres",
		chipWomen: "Solo mujeres",
		chipNot: (names) => `Sin: ${names}`,
		chipOnly: (names) => `Solo: ${names}`,
		removeFilter: (text) => `Quitar filtro ${text}`,
		exported: (filename, count) => `${filename} descargado · ${people(count)}`,
		calendarFailed: "No se pudo crear el calendario",
		back: "Volver a los árboles",
		openFailed: "No se pudo abrir este árbol",
		backToTrees: "Volver a tus árboles",
		loadingTree: "Cargando el árbol…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Aún no hay nadie aquí",
		emptyOwner:
			"Añade a la primera persona; empezar por ti es una buena idea. Todas las personas que añadas se alinean por año de nacimiento.",
		emptyViewer: "Aún no se ha añadido a nadie a este árbol.",
		addFirst: "Añadir a la primera persona",
		editToolbar: "Editar árbol",
		viewToolbar: "Vista",
		addPerson: "Añadir persona",
		findPerson: "Buscar persona",
		filters: "Filtros",
		exportCalendar: "Exportar al calendario",
		zoomIn: "Acercar",
		zoomOut: "Alejar",
		fit: "Ajustar a la pantalla",
		visible: (shown, total) => `Visibles: ${shown} de ${people(total)}`,
		saved: "Cambios guardados",
		added: (name) => `Se añadió a ${name} al árbol`,
		relationshipAdded: "Relación añadida",
		removePersonTitle: (name) => `¿Eliminar a ${name}?`,
		removePersonBody: (count) =>
			`Esto también elimina ${relationships(count)} de esta persona. No se puede deshacer.`,
		removePerson: "Eliminar persona",
		personRemoved: (name) => `Se eliminó a ${name}`,
		removeEdgeTitle: "¿Eliminar esta relación?",
		removeEdgeBody: (sentence) => `${sentence}. Las dos personas se quedan en el árbol.`,
		relationshipRemoved: "Relación eliminada",
		canvas: "Lienzo del árbol genealógico. Arrastra para desplazarte y usa la rueda para hacer zoom.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", falleció" : ""}${
				link === "you" ? ", eres tú" : link === "linked" ? ", con cuenta vinculada" : ""
			}`,
		youPill: "Tú",
		legendYou: "Tú",
		legendLinked: "Cuenta vinculada",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `Detalles de ${name}`,
		removeWith: (name) => `Eliminar la relación con ${name}`,
		noRelationships: "Aún no hay relaciones.",
		showFamily: "Mostrar la familia extensa",
		hideFamily: "Ocultar la familia extensa",
		noFamily: "No hay vínculos de padres ni de matrimonio con los que deducir la familia extensa.",
		removeNamed: (name) => `Eliminar a ${name}`,
		readOnly: "Solo lectura. Solo el creador del árbol puede editar.",
		thisIsYou: "Eres tú",
		linkedTo: (email) => `Cuenta vinculada: ${email}`,
		note: "Nota",
		relationship: "Relación",
		bidirectional: "bidireccional",
		directional: "direccional →",
	},

	filters: {
		hideTypes: "Ocultar tipos de relación",
		hideTypesHint: "Los tipos tachados se ocultan del lienzo y de la exportación.",
		age: "Edad",
		minimum: "Mínima",
		maximum: "Máxima",
		ageHint: "Para las personas fallecidas cuenta la edad al morir.",
		gender: "Género",
		everyone: "Todos",
		men: "Hombres",
		women: "Mujeres",
		includeByName: "Mostrar solo nombres que contengan",
		includeHint: "Separados por comas. Conserva a las personas cuyo nombre contenga alguno de ellos.",
		excludeByName: "Excluir por nombre",
		excludeHint: "Separados por comas. Coincide con cualquier parte del nombre, sin distinguir mayúsculas ni acentos.",
	},

	dialogs: {
		findTitle: "Buscar persona",
		findPlaceholder: "Escribe un nombre…",
		searchPeople: "Buscar personas",
		noResults: "No hay nadie con ese nombre.",
		nameRequired: "Escribe un nombre.",
		birthRequired: "Escribe una fecha de nacimiento.",
		deathBeforeBirth: "La fecha de fallecimiento es anterior a la de nacimiento.",
		editPerson: "Editar persona",
		addPerson: "Añadir persona",
		personSubtitle: "El nombre y la fecha de nacimiento son obligatorios. Lo demás puede esperar.",
		changePhoto: "Cambiar foto",
		uploadPhoto: "Subir foto",
		photoHint: "JPG o PNG, hasta 5 MB. Mejor si es cuadrada.",
		photoTooLarge: "Esa foto pesa más de 5 MB.",
		fullName: "Nombre completo",
		namePlaceholder: "p. ej., María García",
		birthDate: "Fecha de nacimiento",
		deathDate: "Fecha de fallecimiento",
		note: "Nota",
		noteHint: "Cualquier cosa que valga la pena recordar: un apellido de soltera, dónde vivió, una historia.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `La nota debe tener menos de ${simple("es", max, "carácter", "caracteres")}.`,
		linkedAccount: "Cuenta vinculada",
		linkedHint: "La cuenta de Family Tree de esta persona, si tiene acceso al árbol.",
		linkedNone: "Ninguna",
		linkedMe: (name) => `Yo (${name})`,
		linkedConflict: (account, person) =>
			`${account} ya está vinculada a ${person}. Una cuenta solo puede vincularse a una persona, así que primero desvincúlala allí.`,
		saveChanges: "Guardar cambios",
		addToTree: "Añadir al árbol",
		search: "Buscar…",
		readAsSentence: "Léelo como una frase:",
		duplicate: "Esa relación ya está en el árbol.",
		fromPerson: "Desde la persona",
		toPerson: "Hacia la persona",
		relationType: "Tipo de relación",
		bothWays: "en ambos sentidos",
		oneWay: "en un sentido",
		exportTitle: "Exportar al calendario",
		exportHeading: (count) => `Exportar ${people(count)} a tu calendario`,
		exportBody:
			"Un único archivo .ics con un cumpleaños anual por cada persona viva y un aniversario anual por cada persona fallecida. Las personas ocultas no se incluyen.",
		birthdays: "Cumpleaños",
		remembrances: "Aniversarios de fallecimiento",
		download: "Descargar .ics",
	},

	person: {
		/** "78 años" / "falleció a los 77 años" (the verb is the same for both genders). */
		age: (age, _gender, deceased) => (deceased ? `falleció a los ${years(age)}` : years(age)),
	},

	family: {
		/** 0 → Abuelos, 1 → Bisabuelos, 2 → Tatarabuelos, then a generic heading. */
		ancestors: (level) =>
			level === 0 ? "Abuelos" : level === 1 ? "Bisabuelos" : level === 2 ? "Tatarabuelos" : `Antepasados (${level + 2} generaciones)`,
		descendants: (level) =>
			level === 0 ? "Nietos" : level === 1 ? "Bisnietos" : level === 2 ? "Tataranietos" : `Descendientes (${level + 2} generaciones)`,
		parents: "Padres",
		auntsAndUncles: "Tíos",
		siblings: "Hermanos",
		children: "Hijos",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biológicas",
			"IN-LAW": "Afinidad",
			CHURCH: "Religiosas",
			IRRELEVANT: "Otras",
		},
		legend: {
			married: "Matrimonio",
			livesWith: "Viven juntos",
		},
		known,
		/** Unknown types keep their (English) database name, so arrows read better than a half-translated sentence. */
		fallbackSentence: (from, phrase, _isVerb, to) => `${from} → ${phrase} → ${to}`,
		fallbackRole: (phrase, _isVerb, firstName, selectedIsSource) =>
			selectedIsSource ? `${firstName} → ${phrase}` : `${phrase} → ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name} – aniversario de fallecimiento`,
		remembranceDescription: (name, born) => `Aniversario del fallecimiento de ${name} (n. ${born}).`,
		birthdayTitle: (name) => `Cumpleaños de ${name}`,
		birthdayDescription: (name, born) => `${name} nació en ${born}.`,
		fileFallback: "arbol-genealogico",
	},
};
