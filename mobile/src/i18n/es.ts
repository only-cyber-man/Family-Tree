import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// Español. Typed as Dict: a missing or mistyped key does not compile.
// Neutral international Spanish, informal address ("tú").

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
const cnt = (n: number, one: string, other: string) => `${n} ${form("es", n, one, other)}`;
const anos = (n: number) => cnt(n, "año", "años");
const personas = (n: number) => cnt(n, "persona", "personas");
const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
/** Cousin degree, agreeing with the cousin's gender: primo segundo / prima segunda. */
const GRADO_M = ["", "", "segundo", "tercero", "cuarto", "quinto", "sexto", "séptimo", "octavo"];
const GRADO_F = ["", "", "segunda", "tercera", "cuarta", "quinta", "sexta", "séptima", "octava"];

/** The noun for one link of a chain, with its grammatical gender (for "el" / "la", "del" / "de la"). */
function noun(w: KinWord): { word: string; fem: boolean } {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? { word: "madre", fem: true } : { word: "padre", fem: false };
		case "child":
			return f ? { word: "hija", fem: true } : { word: "hijo", fem: false };
		case "sibling":
			return f ? { word: "hermana", fem: true } : { word: "hermano", fem: false };
		case "spouse":
			return f ? { word: "esposa", fem: true } : { word: "esposo", fem: false };
		case "partner":
			// "pareja" is a feminine noun whoever the partner is.
			return { word: "pareja", fem: true };
		default:
			return { word: w.noun?.nom ?? "pariente", fem: f };
	}
}

export const es: Dict = {
	lang: "es",
	locale: "es-ES",

	common: {
		cancel: "Cancelar",
		done: "Listo",
		save: "Guardar",
		saving: "Guardando…",
		close: "Cerrar",
		back: "Atrás",
		change: "Cambiar",
		tryAgain: "Reintentar",
		add: "Añadir",
		create: "Crear",
		creating: "Creando…",
		edit: "Editar",
		remove: "Eliminar",
		keep: "Conservar",
		continue: "Continuar",
		undo: "Deshacer",
		openSettings: "Abrir Ajustes",
		settings: "Ajustes",
		signIn: "Iniciar sesión",
		you: "Tú",
		loading: "Cargando",
		familyTree: "Family Tree",
		owner: "Propietario",
		sharedWithYou: "Compartido contigo",
		male: "Hombre",
		female: "Mujer",
		show: "Mostrar",
		hide: "Ocultar",
		showPassword: "Mostrar contraseña",
		hidePassword: "Ocultar contraseña",
		chooseDate: "Elige una fecha",
		dateA11y: (label, value) => `${label}: ${value}. Cambiar`,
		closeDatePicker: "Cerrar el selector de fecha",
		year: "Año",
		yearHint: "Escribe un año para ir directamente a él en el selector",
		yearExample: "p. ej., 1742",
		removeFilter: (label) => `Quitar filtro ${label}`,
		searchByName: "Buscar por nombre",
		noOneCalled: (q) => `No hay nadie con el nombre “${q}”.`,
		noOneToChoose: "Aún no hay nadie que elegir.",
		selected: "seleccionado",
		reminderScheduled: "Recordatorio programado",
		noReminder: "Sin recordatorio",
		range: (lo, hi) => `de ${lo} a ${hi}`,
	},

	offline: {
		banner: "Estás sin conexión. Se muestra la última copia de este árbol.",
		short: "Estás sin conexión.",
		write: "Estás sin conexión: los cambios no se pueden guardar.",
	},

	save: {
		failedOffline: (what) => `No se pudo guardar ${what}: estás sin conexión o no se puede contactar con el servidor. No se perdió nada; inténtalo de nuevo.`,
		failed: (what, reason) => `No se pudo guardar ${what}. ${reason}`,
		noTree: "No hay ningún árbol abierto, así que no se guardó nada. Elige un árbol e inténtalo de nuevo.",
		theChanges: "los cambios",
		thisPerson: "esta persona",
		theRelationship: "la relación",
		theTree: "el árbol",
	},

	errors: {
		network: "Sin conexión. Revisa tu internet e inténtalo de nuevo.",
		generic: "Algo salió mal.",
		notSignedIn: "No has iniciado sesión.",
		passwordsDontMatch: "Las contraseñas no coinciden.",
		sessionExpired: "Tu sesión ha caducado. Vuelve a iniciar sesión.",
		shareUnavailable: "Compartir no está disponible en este dispositivo.",
	},

	tabs: {
		home: "Inicio",
		tree: "Árbol",
		add: "Añadir",
		find: "Buscar",
		dates: "Fechas",
		settings: "Ajustes",
		addPerson: "Añadir persona",
		findPerson: "Buscar persona",
	},

	prefs: {
		language: "Idioma",
		languageSystem: "Del sistema",
		chooseLanguage: "Elige un idioma",
		appearance: "Apariencia",
		theme: "Tema",
		system: "Sistema",
		light: "Claro",
		dark: "Oscuro",
	},

	onboarding: {
		title1: "Tu familia, dibujada como un grafo.",
		body1: "Las personas son tarjetas, las relaciones son líneas y las generaciones se alinean por año de nacimiento. Privado, compartido solo por invitación.",
		title2: "No te pierdas ningún cumpleaños ni aniversario.",
		body2: "Un aviso discreto el día anterior. Todo se queda en tu teléfono; no se nos envía nada.",
		page: (n, total) => `Página ${n} de ${total}`,
		haveAccount: "Ya tengo una cuenta",
		turnOnReminders: "Activar recordatorios",
		notNow: "Ahora no",
		previewTitle1: "La abuela Maria cumple 75 años mañana",
		previewWhen1: "Mañana",
		previewBody1: "Un cumpleaños redondo. ¿Y si llamas a Maria?",
		previewTitle2: "† Stanisław Kowalski, 28.º aniversario",
		previewWhen2: "15 oct",
	},

	auth: {
		welcomeBack: "Hola de nuevo",
		signInSubtitle: "Inicia sesión con tu cuenta de Family Tree.",
		usernameOrEmail: "Usuario o correo",
		password: "Contraseña",
		forgot: "¿Olvidaste la contraseña?",
		newHere: "¿Primera vez aquí?",
		createAccount: "Crear una cuenta",
		enterBoth: "Escribe tu usuario o correo y tu contraseña.",
		wrongCredentials: "El usuario o la contraseña no son correctos.",
		forgotHowTo: "Escribe tu correo en el primer campo y vuelve a tocar “¿Olvidaste la contraseña?”.",
		resetTitle: "Restablecer contraseña",
		resetConfirm: (email) => `¿Enviar un enlace de restablecimiento a ${email}?`,
		send: "Enviar",
		checkInbox: "Revisa tu bandeja de entrada",
		checkInboxBody: "Si ese correo tiene una cuenta, el enlace ya está en camino.",
		couldntSend: "No se pudo enviar",
		signInAgain: "Vuelve a iniciar sesión",
		sessionEnded: "Tu sesión terminó. No se perdió nada; el árbol sigue aquí.",
		passwordFor: (who) => `Contraseña de ${who}`,
		differentAccount: "Usar otra cuenta",
		startTree: "Empieza tu árbol",
		freePrivate: "Gratis, privado y sin anuncios.",
		username: "Nombre de usuario",
		displayName: "Nombre visible (opcional)",
		yourName: "Tu nombre",
		email: "Correo electrónico",
		confirmPassword: "Confirmar contraseña",
		step1: "La contraseña y su confirmación vienen después. Paso 1 de 2.",
		step2: (email) => `Te enviaremos un correo de verificación a ${email}. Paso 2 de 2.`,
		usernameRule: "Al menos 3 letras o cifras, sin espacios.",
		emailInvalid: "Eso no parece una dirección de correo.",
		passwordRule: "Usa al menos 8 caracteres.",
		createAccountButton: "Crear cuenta",
		agreePrefix: "Al crear una cuenta aceptas la ",
		privacyPolicy: "política de privacidad",
		agreeSuffix: ".",
	},

	home: {
		offline: "Estás sin conexión",
		couldntLoadTrees: "No se pudieron cargar tus árboles",
		connectFirstTime: "Conéctate a internet para ver tus árboles por primera vez.",
		noTrees: "Aún no hay árboles",
		noTreesBody: "Empieza contigo y tus padres. Las invitaciones de tus familiares aparecen aquí solas.",
		createFirst: "Crea tu primer árbol",
		treeUnavailable: "Este árbol no está disponible",
		couldntOpen: "No se pudo abrir este árbol",
		treeUnavailableBody: "Puede que se haya eliminado o que su propietario haya dejado de compartirlo contigo.",
		noCopy: "Aún no hay una copia de este árbol en este teléfono. Conéctate e inténtalo de nuevo.",
		chooseTree: "Elige un árbol",
		switchTree: "Cambiar de árbol",
		lookingFor: "¿A quién buscas?",
		upcoming: "Próximas fechas",
		seeAll: "Ver todas",
		noUpcoming: "No hay fechas próximas",
		noUpcomingEmpty: "Los cumpleaños y aniversarios aparecerán aquí cuando haya personas en el árbol.",
		noUpcomingYear: "Nada en los próximos doce meses.",
		noOne: "Aún no hay nadie aquí",
		addYourself: "Añádete primero a ti. Todos los demás se conectan con alguien que ya está en el árbol.",
		ownerAddedNoOne: "El propietario aún no ha añadido a nadie.",
		addFirst: "Añadir a la primera persona",
		quick: "Acciones rápidas",
		addPerson: "Añadir persona",
		linkTwo: "Vincular a dos personas",
		aboutTree: "Este árbol",
		detailHint: "Toca una fecha a la izquierda para ver aquí a la persona.",
	},

	tree: {
		loading: "Cargando el árbol…",
		removeTitle: (name) => `¿Eliminar a ${name}?`,
		removeBody: "Sus relaciones también se eliminan. No se puede deshacer.",
		removed: (name) => `Se eliminó a ${name}`,
		addRelationship: "Añadir relación",
		focusedOn: (name) => `Enfocado en ${name}`,
		parents: "padres",
		partner: "pareja",
		partners: "parejas",
		children: "hijos",
		exitFocus: "Salir del enfoque",
		search: "Buscar",
		filters: "Filtros",
		filtersActive: (n) => `Filtros, ${n} activos`,
		goUpTo: (name) => `Subir a ${name}`,
		resetView: "Restablecer vista",
		fitAll: "Ajustar todo el árbol",
		allFiltered: "Los filtros ocultan a todos",
		clearFilters: "Borrar filtros",
		canvasA11y: (n) => `Árbol genealógico con ${personas(n)}. Usa la búsqueda para encontrar a alguien.`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "Leyenda",
		legendBio: "Biol.",
		legendMarried: "Matrimonio",
		legendLivesWith: "Viven juntos",
		legendInLaw: "Afinidad",
		legendChurch: "Religiosa",
		legendOther: "Otra",
		youPill: "Tú",
		legendYou: "Tú",
		panelHint: "Toca a una persona para ver aquí sus datos.",
		panelTitle: "Detalles",
	},

	person: {
		gone: "Esta persona ya no está en el árbol.",
		ageAlive: (g, age) => `${g} · ${anos(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · falleció a los ${anos(age)}${wouldBe ? ` · hoy tendría ${wouldBe}` : ""}`,
		you: "tú",
		focus: "Enfocar",
		focusOnTree: "Ver en el árbol",
		howRelated: "¿Qué parentesco tenemos?",
		turns: (n) => `Cumple ${anos(n)}`,
		remembranceDay: "Aniversario de fallecimiento",
		remindMe: "Recordármelo",
		noRelationshipsOwner: "Aún no hay relaciones. Añade una para conectar a esta persona con el árbol.",
		noRelationships: "Aún no hay relaciones.",
		dragUp: "Arrastra hacia arriba para ver todas las relaciones",
		removedFromTree: (name) => `Se eliminó a ${name} del árbol`,
		couldntRemove: (name, reason) => `No se pudo eliminar a ${name}. ${reason}`,
		open: "Abrir",
		removeRelationship: "Eliminar relación",
		relationshipRemoved: "Relación eliminada",
		sharedBy: (email) => `Compartido contigo${email ? ` por ${email}` : ""}. Solo el propietario puede editar.`,
		removeA11y: (name) => `Eliminar a ${name}`,
		thisIsYou: "Eres tú",
		linkedTo: (email) => `Cuenta vinculada: ${email}`,
		linkedToAccount: "Cuenta vinculada",
		note: "Nota",
	},

	path: {
		whichIsYou: "¿Cuál eres tú?",
		needMe: (first) =>
			`Para decir qué parentesco tiene ${first} contigo, la app necesita saber qué persona de este árbol eres tú. Lo eliges una vez y se guarda en este teléfono.`,
		chooseWho: "Elige quién eres",
		notConnected: "Aún sin conexión contigo",
		notConnectedBody: (name) => `En este árbol no hay ninguna cadena de relaciones entre ${name} y tú. Añadir una relación crearía esa conexión.`,
		open: (first) => `Ver a ${first}`,
		stepsThrough: (steps, people) => `${cnt(steps, "paso", "pasos")} a través de ${personas(people)}.`,
		familyOnly: "Camino más corto usando solo vínculos biológicos y de matrimonio.",
		anyLinks: "No hay vínculos familiares que lleguen hasta ti, así que se usan otras relaciones registradas.",
		youName: (name) => `Tú · ${name}`,
		showOnTree: "Ver en el árbol",
		meNote: (name) => `“Soy yo” (${name}) se guarda solo en este teléfono, porque el árbol compartido aún no tiene un campo para ello. Cámbialo en Ajustes.`,
		notConnectedShort: "aún sin conexión contigo",
	},

	search: {
		placeholder: "¿A quién buscas?",
		a11y: "Buscar personas",
		chooseWho: "Elige quién eres",
		chooseWhoBody: "Indica a la app qué persona eres tú para ver qué parentesco tiene cada uno contigo. La elección se queda en este teléfono.",
		noOne: (q) => `No hay nadie con el nombre “${q}” en este árbol.`,
	},

	addPerson: {
		add: "Añadir persona",
		edit: "Editar persona",
		viewerOnly: "Este árbol está compartido contigo solo para verlo. Solo su propietario puede añadir personas.",
		chooseTreeFirst: "Primero elige o crea un árbol.",
		gone: "Esta persona ya no está en el árbol.",
		nameRequired: "El nombre es obligatorio.",
		chooseGender: "Elige un género.",
		birthRequired: "La fecha de nacimiento es obligatoria.",
		deathRequired: "Añade la fecha de fallecimiento o desactiva esta opción.",
		deathBeforeBirth: "La fecha de fallecimiento es anterior a la de nacimiento.",
		linkIncomplete: "Elige tanto la relación como la persona, o quita el vínculo.",
		saved: (first) => `Cambios de ${first} guardados`,
		linkFailed: (first, reason) => `Se añadió a ${first}, pero el vínculo no se pudo guardar. ${reason}`,
		added: (first) => `Se añadió a ${first} al árbol`,
		changePhoto: "Cambiar foto",
		addPhoto: "Añadir una foto",
		cameraOff: "El acceso a la cámara está desactivado",
		cameraOffBody: "Aún puedes elegir una foto de tu galería o permitir la cámara en Ajustes.",
		useGallery: "Usar la galería",
		takePhoto: "Tomar foto",
		fromGallery: "Elegir de la galería",
		fullName: "Nombre completo",
		namePlaceholder: "p. ej., María García",
		gender: "Género",
		birthDate: "Fecha de nacimiento",
		passedAway: "Ha fallecido",
		passedAwayHint: "Añade una fecha de fallecimiento y un aniversario",
		deathDate: "Fecha de fallecimiento",
		linkTo: "Vincular con alguien",
		linkOptional: "opcional, ahorra un paso",
		linkExample: (name) => `p. ej., madre de ${name}`,
		newPerson: "Nueva persona",
		parentNote: (child) => `La nueva persona es el padre o la madre; ${child} es su hijo o hija.`,
		theChosen: "la persona elegida",
		dontLink: "No vincular ahora",
		note: "Nota",
		notePlaceholder: "Algo que valga la pena recordar",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Cuenta vinculada",
		linkedHint: "¿Qué cuenta de Family Tree es esta persona? Solo se muestran las cuentas que pueden ver este árbol.",
		linkedNone: "Ninguna",
		linkedMe: (email) => (email ? `Yo (${email})` : "Yo"),
		linkedConflict: (name) => `Esta cuenta ya está vinculada a ${name}.`,
		loadingAccounts: "Cargando cuentas…",
	},

	addRel: {
		title: "Añadir relación",
		viewerOnly: "Solo el propietario de este árbol puede añadir relaciones.",
		chooseBoth: "Elige a las dos personas y cómo se relacionan.",
		different: "Elige dos personas distintas.",
		duplicate: "Esta relación ya está en el árbol.",
		added: "Relación añadida",
		isRelatedTo: "tiene relación con",
		from: "De",
		to: "A",
		relation: "Relación",
		changeFrom: "Cambiar la persona de la que parte la relación",
		more: "Más…",
		fewer: "Menos",
		sentence: (a, verb, b) => `${a} ${verb} ${b}.`,
		sentenceJoin: " ",
	},

	filters: {
		title: "Filtros",
		clearAll: "Borrar todo",
		show: (shown, total) => `Mostrar ${shown} de ${personas(total)}`,
		hideTypes: "Ocultar tipos de relación",
		hidden: "oculto",
		shown: "visible",
		age: "Edad",
		ageRange: "Rango de edad",
		gender: "Género",
		everyone: "Todos",
		men: "Hombres",
		women: "Mujeres",
		excludeByName: "Excluir por nombre",
		excludeHint: "Separa varios nombres con comas.",
		excludePlaceholder: "García, Ana",
		chipHide: (label) => `Ocultar: ${label}`,
		chipAge: (lo, hi) => `Edad ${lo}–${hi}`,
		chipMen: "Solo hombres",
		chipWomen: "Solo mujeres",
		chipNot: (names) => `Sin: ${names}`,
		chipOnly: (names) => `Solo: ${names}`,
		includeByName: "Mostrar solo nombres que contengan",
		includeHint: "Cualquiera de varios nombres, separados por comas.",
		includePlaceholder: "Garc, Ana",
	},

	trees: {
		title: "Tus árboles",
		giveName: "Primero ponle un nombre al árbol.",
		created: (name) => `“${name}” creado`,
		nameLabel: "Nombre del nuevo árbol",
		namePlaceholder: "Mi árbol genealógico",
		newTree: "Nuevo árbol",
		people: (n) => personas(n),
		updated: (rel) => `actualizado ${rel}`,
		viewers: (n) => cnt(n, "persona invitada", "personas invitadas"),
		onlyYou: "Solo tú",
		by: (email) => `de ${email}`,
		active: "Activo ✓",
	},

	invited: {
		title: "Quién puede ver este árbol",
		subtitle: "Las personas invitadas pueden ver, no editar.",
		thatsYou: "Eres tú; este árbol ya es tuyo.",
		already: "Esa persona ya puede ver este árbol.",
		canSee: (email) => `${email} ya puede ver este árbol`,
		noAccount: "Ninguna cuenta de Family Tree usa ese correo. Pide a esa persona que se registre primero y luego invítala.",
		thisPerson: "esta persona",
		stopTitle: (who) => `¿Dejar de compartir con ${who}?`,
		stopBody: "Dejará de ver este árbol.",
		revoke: "Revocar",
		revoked: (who) => `${who} ya no puede ver este árbol`,
		emailPlaceholder: "nombre@ejemplo.com",
		emailA11y: "Correo de la persona a la que invitas",
		invite: "Invitar",
		note: "Esa persona ya debe tener una cuenta de Family Tree con este correo. No se envía ningún correo; el árbol simplemente aparece en su lista.",
		youSuffix: (name) => `${name} (tú)`,
		creator: "Creador",
		viewer: "Solo lectura",
		viewerYou: "Solo lectura · tú",
		unknown: "Cuenta desconocida",
		revokeA11y: (email) => `Revocar ${email}`,
		onlyYou: "Solo tú puedes ver este árbol.",
	},

	dates: {
		title: "Fechas",
		exportIcs: "Exportar .ics",
		all: "Todas",
		birthdays: "Cumpleaños",
		remembrance: "Aniversarios",
		quietReminder: "Recibe un aviso discreto el día anterior",
		turnOn: "Activar recordatorios",
		localOnly: "Los recordatorios se programan en este teléfono a partir de las fechas del árbol. No se envía nada a ningún servidor.",
		detailHint: "Toca una fecha para ver aquí a la persona.",
		none: "No hay fechas próximas",
		noneBody: "Los cumpleaños y aniversarios aparecerán aquí cuando haya personas en el árbol.",
		footnote:
			"Campana = recordatorio local programado a las 9:00 del día anterior (aniversarios de fallecimiento: el mismo día). Las edades redondas (18, 50, 55, 60…) pueden tener un segundo recordatorio una semana antes. La exportación incluye a las personas visibles ahora en el árbol.",
	},

	settings: {
		title: "Ajustes",
		signOutTitle: "¿Cerrar sesión?",
		signOutBody: "Se quitan los recordatorios y se borran de este teléfono las copias de tus árboles.",
		signOut: "Cerrar sesión",
		account: "Cuenta",
		accountBody: "La contraseña se cambia en el sitio web.",
		openWebsite: "Abrir el sitio web",
		reminders: "Recordatorios",
		birthdays: "Cumpleaños",
		dayBefore: "El día anterior, 9:00",
		remembranceDays: "Aniversarios de fallecimiento",
		onTheDay: "El mismo día, 9:00",
		roundEarly: "Cumpleaños redondos una semana antes",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Programados en este teléfono para el árbol activo. No se envía nada a ningún servidor.",
		whoCanSee: "Quién puede ver este árbol",
		viewers: (n) => cnt(n, "persona invitada", "personas invitadas"),
		onlyYou: "Solo tú",
		preparing: "Preparando…",
		exportIcs: "Exportar al calendario (.ics)",
		thisIsMe: "Soy yo",
		notSet: "Sin elegir",
		switchTree: "Cambiar de árbol",
		about: "Acerca de",
		privacy: "Política de privacidad",
		deleteAccount: "Eliminar cuenta",
		deleteTitle: "¿Eliminar tu cuenta?",
		deleteBody:
			"Esto elimina tu cuenta y todos los árboles que creaste, con todas sus personas, fotos y relaciones. Las personas que invitaste pierden el acceso. No se puede deshacer.",
		footer: (version) => `Family Tree ${version} · Creado por tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "Patrocinado",
		tag: "Anuncio",
		open: (title) => `Abrir ${title}`,
	},

	deleteAccount: {
		title: "Eliminar cuenta",
		typeToConfirm: (word) => `Escribe ${word} para confirmar`,
		typeToConfirmError: (word) => `Escribe ${word} para confirmar.`,
		offline: "Estás sin conexión: ahora mismo no se puede eliminar tu cuenta.",
		permanently: "Esto elimina de forma permanente:",
		yourAccount: (email) => `• tu cuenta${email ? ` (${email})` : ""}`,
		everyTree: "• todos los árboles que creaste, con todas sus personas, fotos y relaciones",
		consequences: "Las personas que invitaste pierden el acceso a esos árboles. Los árboles que otros compartieron contigo no se ven afectados. No se puede deshacer.",
		notFully: (reason) => `Tu cuenta no se eliminó por completo. ${reason}`,
		askUs: (email) => `Puedes intentarlo de nuevo o pedirnos que la eliminemos por ti en ${email}.`,
		emailRequest: "Enviar una solicitud por correo",
		deleteMine: "Eliminar mi cuenta",
		deleting: "Eliminando…",
		keep: "Conservar mi cuenta",
		mailSubject: "Eliminar mi cuenta de Family Tree",
		mailBody: (email) => `Por favor, eliminen mi cuenta de Family Tree${email ? ` (${email})` : ""} y todos los árboles que creé.`,
	},

	pickMe: {
		title: "¿Cuál eres tú?",
		note: "Se usa en “¿Qué parentesco tenemos?”. Se guarda solo en este teléfono y nadie más lo ve.",
		forget: "Olvidar mi elección",
		serverLinked: (name) => `En este árbol, tu cuenta está vinculada a ${name}, así que “Soy yo” viene del árbol en todos los dispositivos.`,
		saveTitle: "¿Guardar en el árbol?",
		saveBody: (name) => `¿Vincular a ${name} con tu cuenta en este árbol? Así “Soy yo” funcionará en todos los dispositivos y en el sitio web.`,
		saveLink: "Guardar vínculo",
		phoneOnly: "Solo en este teléfono",
		linkSaved: (name) => `Tu cuenta ya está vinculada a ${name}`,
	},

	notFound: {
		title: "No hay nada aquí",
		body: "Ese enlace lleva a una página que la app no tiene.",
		home: "Ir al inicio",
	},

	toastsReminders: {
		on: "Recordatorios activados. Se quedan en este teléfono.",
		off: "Las notificaciones de Family Tree están desactivadas.",
		settings: "Ajustes",
		channel: "Cumpleaños y aniversarios de fallecimiento",
	},

	dateNames: {
		monthsNom: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
		monthsInDate: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
		monthsShort: MESES_CORTOS,
		weekdaysShort: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
		/** "4 de febrero de 1950"; with an abbreviated month "12 mar 1921", as Spanish calendars write it. */
		dayMonthYear: (day, month, year) => (MESES_CORTOS.includes(month) ? `${day} ${month} ${year}` : `${day} de ${month} de ${year}`),
		dayMonth: (day, month) => `${day} ${month}`,
	},

	time: {
		justNow: "ahora mismo",
		minutesAgo: (n) => `hace ${cnt(n, "minuto", "minutos")}`,
		hoursAgo: (n) => `hace ${cnt(n, "hora", "horas")}`,
		yesterday: "ayer",
		daysAgo: (n) => `hace ${n} días`,
		weeksAgo: (n) => `hace ${cnt(n, "semana", "semanas")}`,
		monthsAgo: (n) => `hace ${cnt(n, "mes", "meses")}`,
		yearsAgo: (n) => `hace ${anos(n)}`,
		today: "hoy",
		tomorrow: "mañana",
		inDays: (n) => `en ${n} días`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} cumple ${anos(age)}`,
		remembranceTitle: (first, n) => `† ${first}, ${n}.º aniversario`,
		birthday: "Cumpleaños",
		remembrance: "Aniversario de fallecimiento",
		roundAge: "cifra redonda",
		reminderEve: (first, age) => `Mañana ${first} cumple ${anos(age)}`,
		reminderEveRoundBody: (first) => `Un cumpleaños redondo. ¿Y si llamas a ${first}?`,
		reminderWeek: (first, age) => `En una semana ${first} cumple ${anos(age)}`,
		reminderWeekBody: (dayMonth) => `Un cumpleaños redondo el ${dayMonth}.`,
		reminderRemembrance: (name, n) => `† ${name}, ${n}.º aniversario`,
		reminderRemembranceBody: (dayMonth) => `Aniversario de fallecimiento · ${dayMonth}`,
	},

	ics: {
		calName: "Cumpleaños",
		birthdayTitle: (name) => `Cumpleaños de ${name}`,
		birthdayDesc: (name) => `${name} cumple años este día.`,
		deathTitle: (name) => `Aniversario del fallecimiento de ${name}`,
		deathDesc: (name) => `Este día es el aniversario del fallecimiento de ${name}.`,
		fileSuffix: "fechas",
		shareTitle: (tree) => `Fechas de ${tree}`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biológicas", "IN-LAW": "Afinidad", CHURCH: "Religiosas", IRRELEVANT: "Otras" },
		types: {
			IS_FATHER_OF: { label: "Padre", sentence: () => "es padre de" },
			IS_MOTHER_OF: { label: "Madre", sentence: () => "es madre de" },
			IS_MARRIED_TO: { label: "Matrimonio", sentence: (g) => gw(g, "está casado con", "está casada con") },
			LIVES_WITH: { label: "Viven juntos", sentence: () => "vive con" },
			IS_PARTNER_OF: { label: "Pareja", sentence: () => "es pareja de" },
			IS_ENGAGED_TO: { label: "Comprometidos", sentence: (g) => gw(g, "está comprometido con", "está comprometida con") },
			IS_GODPARENT_OF: {
				label: "Padrino / madrina",
				sentence: (g) => gw(g, "es padrino de", "es madrina de"),
				role: (g) => gw(g, "Padrino", "Madrina"),
				inverseRole: (g) => gw(g, "Ahijado", "Ahijada"),
			},
			IS_FRIEND_OF: {
				label: "Amistad",
				sentence: (g) => gw(g, "es amigo de", "es amiga de"),
				role: (g) => gw(g, "Amigo", "Amiga"),
				inverseRole: (g) => gw(g, "Amigo", "Amiga"),
			},
			IS_STEPPARENT_OF: {
				label: "Padrastro / madrastra",
				sentence: (g) => gw(g, "es padrastro de", "es madrastra de"),
				role: (g) => gw(g, "Padrastro", "Madrastra"),
				inverseRole: (g) => gw(g, "Hijastro", "Hijastra"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Madre",
			father: "Padre",
			child: "Hijo/a",
			sibling: (g) => gw(g, "Hermano", "Hermana"),
			isSourceOf: (first, labelLower) => `${first} es ${labelLower}`,
		},
	},

	kin: {
		you: "tú",
		youTitle: "Tú",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "esposo", "esposa");
					case "partner":
						return "pareja";
					case "parentInLaw":
						return gw(g, "suegro", "suegra");
					case "siblingInLaw":
						return gw(g, "cuñado", "cuñada");
					case "childInLaw":
						return gw(g, "yerno", "nuera");
					case "stepParent":
						return gw(g, "padrastro", "madrastra");
					case "stepChild":
						return gw(g, "hijastro", "hijastra");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) {
				if (u === 1) return gw(g, "padre", "madre");
				if (u === 2) return gw(g, "abuelo", "abuela");
				if (u === 3) return gw(g, "bisabuelo", "bisabuela");
				if (u === 4) return gw(g, "tatarabuelo", "tatarabuela");
				return null;
			}
			if (u === 0) {
				if (d === 1) return gw(g, "hijo", "hija");
				if (d === 2) return gw(g, "nieto", "nieta");
				if (d === 3) return gw(g, "bisnieto", "bisnieta");
				if (d === 4) return gw(g, "tataranieto", "tataranieta");
				return null;
			}
			if (u === 1 && d === 1) return gw(g, "hermano", "hermana");
			if (d === 1) {
				if (u === 2) return gw(g, "tío", "tía");
				if (u === 3) return gw(g, "tío abuelo", "tía abuela");
				if (u === 4) return gw(g, "tío bisabuelo", "tía bisabuela");
				return null;
			}
			if (u === 1) {
				if (d === 2) return gw(g, "sobrino", "sobrina");
				if (d === 3) return gw(g, "sobrino nieto", "sobrina nieta");
				if (d === 4) return gw(g, "sobrino bisnieto", "sobrina bisnieta");
				return null;
			}
			if (u === d) {
				const degree = u - 1;
				const base = gw(g, "primo", "prima");
				if (degree === 1) return base;
				const ord = GRADO_M[degree] ? gw(g, GRADO_M[degree], GRADO_F[degree]) : `${degree}.${gw(g, "º", "ª")}`;
				return `${base} ${ord}`;
			}
			// A parent's first cousin and a first cousin's child have names of their own;
			// cousins further "removed", and the fifth generation up or down, are said with the chain.
			if (u === 3 && d === 2) return gw(g, "tío segundo", "tía segunda");
			if (u === 2 && d === 3) return gw(g, "sobrino segundo", "sobrina segunda");
			return null;
		},
		word: (w: KinWord) => noun(w).word,
		/** Runs from the far person back to you, each link with its article: "la hija del hermano de tu madre". */
		chain: (words: KinWord[]) => {
			if (!words.length) return "tú";
			const [nearest, ...rest] = words;
			const far = rest.reverse().map((w, i) => {
				const n = noun(w);
				return i === 0 ? `${n.fem ? "la" : "el"} ${n.word}` : `${n.fem ? "de la" : "del"} ${n.word}`;
			});
			return [...far, `${far.length ? "de " : ""}tu ${noun(nearest).word}`].join(" ");
		},
		phrase: (term) => `tu ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "hijo de", "hija de");
				case "down":
					return gw(g, "padre de", "madre de");
				case "sibling":
					return gw(g, "hermano de", "hermana de");
				case "spouse":
					return gw(g, "esposo de", "esposa de");
				default:
					return typeSentence ?? "pariente de";
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const same = (word: string) => ({ nom: word, gen: word });
			if (typeName === "IS_GODPARENT_OF") return same(farIsSource ? gw(g, "padrino", "madrina") : gw(g, "ahijado", "ahijada"));
			if (typeName === "IS_FRIEND_OF") return same(gw(g, "amigo", "amiga"));
			if (typeName === "IS_STEPPARENT_OF") return same(farIsSource ? gw(g, "padrastro", "madrastra") : gw(g, "hijastro", "hijastra"));
			void bidirectional;
			// Unknown type: its (English) name, as the chip shows it.
			return same(fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase());
		},
	},
};
