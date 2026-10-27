import type { Gender, Locale, ThemePref } from "./config";
import type { Dict, KnownRelationship } from "./en";
import { simple } from "./plural";

// Brazilian Portuguese strings. Typed as Dict, so TypeScript fails when a key is missing.

const g = (gender: Gender | undefined, male: string, female: string) =>
	gender === "female" ? female : male;

/** "1 pessoa", "3 pessoas"; CLDR pt-BR keeps 0 singular. */
const n = (count: number, one: string, other: string) => simple("pt", count, one, other);
const people = (count: number) => n(count, "pessoa", "pessoas");
const relationships = (count: number) => n(count, "relação", "relações");
const themes: Record<ThemePref, string> = { light: "Claro", dark: "Escuro", system: "Do sistema" };

/** Relationship types from ft_relationships_names that have a Portuguese phrasing. */
const known: Record<string, KnownRelationship> = {
	IS_FATHER_OF: {
		type: "Pai",
		edge: () => "pai",
		sentence: (from, to) => `${from} é pai de ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "pai" : g(other, "filho", "filha")),
	},
	IS_MOTHER_OF: {
		type: "Mãe",
		edge: () => "mãe",
		sentence: (from, to) => `${from} é mãe de ${to}`,
		role: (otherIsSource, other) => (otherIsSource ? "mãe" : g(other, "filho", "filha")),
	},
	IS_MARRIED_TO: {
		type: "Cônjuge",
		edge: () => "casados",
		sentence: (from, to, gender) => `${from} é ${g(gender, "casado", "casada")} com ${to}`,
		role: (_, other) => g(other, "marido", "esposa"),
	},
	LIVES_WITH: {
		type: "Moram juntos",
		edge: () => "moram juntos",
		sentence: (from, to) => `${from} mora com ${to}`,
		role: () => "moram juntos",
	},
	IS_PARTNER_OF: {
		type: "Companheiro(a)",
		edge: () => "companheiros",
		sentence: (from, to, gender) => `${from} é ${g(gender, "companheiro", "companheira")} de ${to}`,
		role: (_, other) => g(other, "companheiro", "companheira"),
	},
	IS_ENGAGED_TO: {
		type: "Noivo(a)",
		edge: () => "noivos",
		sentence: (from, to, gender) => `${from} é ${g(gender, "noivo", "noiva")} de ${to}`,
		role: (_, other) => g(other, "noivo", "noiva"),
	},
	IS_GODPARENT_OF: {
		type: "Padrinho / madrinha",
		edge: (from) => g(from, "padrinho", "madrinha"),
		sentence: (from, to, gender) => `${from} é ${g(gender, "padrinho", "madrinha")} de ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "padrinho", "madrinha") : g(other, "afilhado", "afilhada"),
	},
	IS_FRIEND_OF: {
		type: "Amigo(a)",
		edge: () => "amigos",
		sentence: (from, to, gender) => `${from} é ${g(gender, "amigo", "amiga")} de ${to}`,
		role: (_, other) => g(other, "amigo", "amiga"),
	},
	IS_STEPPARENT_OF: {
		type: "Padrasto / madrasta",
		edge: (from) => g(from, "padrasto", "madrasta"),
		sentence: (from, to, gender) => `${from} é ${g(gender, "padrasto", "madrasta")} de ${to}`,
		role: (otherIsSource, other) =>
			otherIsSource ? g(other, "padrasto", "madrasta") : g(other, "enteado", "enteada"),
	},
};

const ANCESTORS = ["Avós", "Bisavós", "Trisavós", "Tataravós"];
const DESCENDANTS = ["Netos", "Bisnetos", "Trinetos", "Tataranetos"];

export const pt: Dict = {
	locale: "pt" as Locale,
	dateLocale: "pt-BR",

	common: {
		appName: "Family Tree",
		createdBy: "Criado por tomek7667",
		cancel: "Cancelar",
		save: "Salvar",
		done: "Concluído",
		close: "Fechar",
		dismiss: "Dispensar",
		undo: "Desfazer",
		edit: "Editar",
		remove: "Remover",
		optional: "opcional",
		loading: "Carregando…",
		owner: "Proprietário",
		sharedWithYou: "Compartilhada com você",
		viewerReadOnly: "Convidado · somente leitura",
		creator: "Criador",
		someone: "Alguém",
		someoneLower: "alguém",
		unknownAccount: "conta desconhecida",
		you: "você",
		withYou: (name) => `${name} (você)`,
		male: "Masculino",
		female: "Feminino",
		justNow: "agora mesmo",
		people,
		relationships,
		mainNav: "Principal",
		clearAll: "Limpar tudo",
		addRelationship: "Adicionar relação",
		removeRelationship: "Remover relação",
		manageInvited: "Gerenciar convidados",
		emailInvalid: "Isso não parece um endereço de e-mail completo.",
	},

	prefs: {
		group: "Preferências de exibição",
		language: "Idioma",
		theme: "Tema",
		themes,
		themeCycle: (current, next) =>
			`Tema: ${themes[current].toLowerCase()}. Mudar para ${themes[next].toLowerCase()}.`,
	},

	meta: {
		description:
			"Uma árvore genealógica privada, desenhada como um grafo. Adicione as pessoas que você conhece, vincule o parentesco entre elas e veja as gerações se alinharem pelo ano de nascimento.",
		signIn: "Entrar",
		signUp: "Criar conta",
		account: "Conta",
		trees: "Suas árvores",
		tree: "Árvore",
		privacy: "Política de privacidade",
		privacyDescription: "O que o Family Tree armazena, por quê, e como excluir.",
		deleteAccount: "Excluir sua conta",
		deleteAccountDescription: "Como excluir sua conta e seus dados do Family Tree.",
	},

	legal: {
		privacy: "Privacidade",
		deleteAccount: "Excluir conta",
		signIn: "Entrar",
		privacyTitle: "Política de privacidade",
		privacyEffective: "Em vigor desde 25 de setembro de 2026",
		deleteTitle: "Excluir sua conta",
		deleteAppliesTo:
			"Aplica-se ao site Family Tree e ao app Family Tree para Android e iOS (pl.cyberman.familytree).",
		deleteMailSubject: "Excluir minha conta do Family Tree",
		deleteMailBody: (email) =>
			`Por favor, excluam minha conta do Family Tree${email ? ` (${email})` : ""} e todas as árvores que eu criei.`,
	},

	errorPage: {
		title: "Algo deu errado",
		home: "Ir para a página inicial",
	},

	landing: {
		nav: {
			features: "Recursos",
			calendar: "Calendário",
			mobile: "App para celular",
			how: "Como funciona",
			logIn: "Entrar",
			signUp: "Criar conta",
			openMenu: "Abrir menu",
			closeMenu: "Fechar menu",
		},
		deleted: "Sua conta e suas árvores foram excluídas.",
		eyebrow: "Uma árvore genealógica privada, desenhada como um grafo",
		title: "Toda família é um grafo. Desenhe a sua.",
		lead:
			"Adicione as pessoas que você conhece, vincule o parentesco entre elas e veja as gerações se alinharem pelo ano de nascimento. Privada por padrão, compartilhada só com os parentes que você convidar.",
		cta: "Comece sua árvore, grátis",
		logIn: "Entrar",
		fine: "Sem anúncios, sem perfis públicos.",
		treeEyebrow: "A árvore",
		treeTitle: "Caixas e linhas, não formulários e tabelas.",
		treeBody:
			"Você monta a árvore do jeito que a rabiscaria no verso de um envelope: um cartão para cada pessoa, uma linha para cada relação. Arraste, amplie e clique em qualquer pessoa para ver quem ela é.",
		decades: ["1920", "1940", "1970", "2000"],
		timelineTitle: "Uma linha do tempo de gerações",
		timelineBody:
			"As pessoas ficam em um eixo vertical pelo ano de nascimento. Avós no topo, netos embaixo, e a cada vinte anos uma nova faixa. Você nunca fica em dúvida sobre quem veio primeiro.",
		lines: {
			biological: "Biológica",
			married: "Casamento",
			livesWith: "Moram juntos",
			church: "Religiosa",
			other: "Outra",
		},
		kindsTitle: "Quatro tipos de família",
		kindsBody:
			"Sangue, casamento, padrinhos e o vizinho que todo mundo chama de tio. Cada grupo tem sua própria linha: o casamento é o traço mais forte da página e “moram juntos” é o mais leve, então a árvore se lê de relance e ainda assim conta a história inteira.",
		chips: ["Idade 40–90", "Ocultar: Afinidade", "Só mulheres", "Sem: Nowak"],
		filtersTitle: "Filtros que cortam o ruído",
		filtersBody:
			"Oculte um tipo de relação, limite a uma faixa etária, mostre um lado da família. O que ficar na tela é o que será exportado.",
		calendarEyebrow: "Exportação para o calendário",
		calendarTitle: "Todo aniversário. Toda data de falecimento. No calendário que você já usa.",
		calendarBody:
			"Um clique transforma a parte visível da sua árvore em um arquivo .ics: um aniversário anual para cada pessoa viva e um aniversário de falecimento anual para cada pessoa que já se foi. Importe uma vez no Google Agenda, no Calendário da Apple ou no Outlook, e ele se repete para sempre.",
		pills: ["Aniversários, todo ano", "Aniversários de falecimento", "Segue seus filtros"],
		calendarMonth: "Outubro",
		calendarFile: "familia-kowalski.ics",
		calendarRows: [
			{ dow: "sáb", title: "Aniversário de Maria Kowalska", meta: "Aniversário · repete todo ano" },
			{ dow: "qui", title: "† Stanisław Kowalski, aniversário de falecimento", meta: "Falecimento · repete todo ano" },
			{ dow: "qua", title: "Aniversário de Zofia Nowak", meta: "Aniversário · repete todo ano" },
		],
		privateEyebrow: "Privada por padrão",
		privateTitle: "Sua, e de quem você convidar.",
		privateBody:
			"Não há árvores públicas nem busca entre famílias. Você cria uma árvore, convida parentes por e-mail, e eles podem ver, mas não mexer. Mudou de ideia? Revogue o acesso com um clique.",
		privateYou: "tomek (você)",
		privateCreator: "Criador · pode editar tudo",
		privateOwner: "Proprietário",
		privateInvited: "Convidado · somente leitura",
		privateRevoke: "Revogar",
		privateInvite: "Convidar por e-mail…",
		mobileEyebrow: "iPhone e Android",
		mobileTitle: "A árvore no seu bolso, para as horas em que você precisa dela.",
		mobileBody:
			"Está em um casamento e não consegue lembrar de quem é aquele rosto? Busque um nome e veja qual é o parentesco. O app também mantém uma lista dos próximos aniversários e datas de falecimento, com um lembrete no dia anterior, e permite adicionar um novo parente com foto em poucos toques.",
		appStoreSmall: "Em breve na",
		playStoreSmall: "EM BREVE NO",
		phoneUpcoming: "Próximas datas",
		phoneRows: [
			{ t: "Maria faz 75 anos", m: "sáb 3 de out · em 8 dias" },
			{ t: "† Stanisław, há 28 anos", m: "qui 15 de out" },
			{ t: "Zofia faz 21 anos", m: "qua 28 de out" },
		],
		phoneRelation: "1976 · 50 · prima da sua mãe",
		howTitle: "Como funciona",
		steps: [
			{
				title: "Comece por você",
				body: "Crie uma árvore e adicione a primeira pessoa: um nome, uma data de nascimento e uma foto, se tiver.",
			},
			{
				title: "Vincule as pessoas que você conhece",
				body: "Pais, parceiros, padrinhos. Escolha duas pessoas e uma relação, e a linha se desenha sozinha na geração certa.",
			},
			{
				title: "Convide a família",
				body: "Compartilhe o acesso somente leitura por e-mail, exporte as datas para o seu calendário e leve a árvore no celular.",
			},
		],
		minute: "Leva cerca de um minuto.",
		hero: {
			label: "Exemplo de árvore genealógica com quatro gerações",
			married: "casados",
			godparent: "padrinho",
		},
	},

	auth: {
		signInPrompt: "Primeira vez aqui?",
		signInLink: "Criar uma conta",
		signUpPrompt: "Já tem uma conta?",
		signUpLink: "Entrar",
		missingCredentials: "Informe seu nome de usuário ou e-mail e sua senha.",
		unreachable: "Não foi possível conectar ao servidor. Tente novamente.",
		wrongCredentials: "Nome de usuário ou senha incorretos. Verifique os dois e tente novamente.",
		resetEmailMissing: "Informe o e-mail da sua conta.",
		resetSent: (email) =>
			`Se ${email} tiver uma conta, um link de redefinição está a caminho. Verifique sua caixa de entrada.`,
		resetFailed: "Não foi possível enviar o e-mail de redefinição. Tente novamente.",
		resetTitle: "Redefinir senha",
		resetSubtitle: "Enviaremos por e-mail um link para você escolher uma nova.",
		welcomeTitle: "Olá de novo",
		welcomeSubtitle: "Entre para abrir suas árvores.",
		email: "E-mail",
		usernameOrEmail: "Nome de usuário ou e-mail",
		password: "Senha",
		forgot: "Esqueceu?",
		sending: "Enviando…",
		sendReset: "Enviar link de redefinição",
		signingIn: "Entrando…",
		signIn: "Entrar",
		backToSignIn: "Voltar para o login",
		noAccount: "Não tem uma conta?",
		signUp: "Criar conta",
		showPassword: "Mostrar senha",
		hidePassword: "Ocultar senha",
		pickUsername: "Escolha um nome de usuário.",
		minPassword: (min) => `Pelo menos ${n(min, "caractere", "caracteres")}.`,
		passwordsDiffer: "As senhas não coincidem.",
		createFailed: "Não foi possível criar a conta.",
		signInAfterCreateFailed: (message) =>
			`Sua conta foi criada, mas o login falhou: ${message}. Tente entrar.`,
		unknownError: "erro desconhecido",
		registerTitle: "Comece sua árvore",
		registerSubtitle: "Grátis, privado, sem anúncios.",
		username: "Nome de usuário",
		displayName: "Nome de exibição",
		confirmPassword: "Confirmar senha",
		creating: "Criando conta…",
		create: "Criar conta",
		registerNote:
			"Enviaremos um e-mail de verificação. Sua árvore é visível só para você e para as pessoas que você convidar.",
	},

	nav: {
		trees: "Árvores",
		account: "Sua conta",
		logOut: "Sair",
	},

	account: {
		title: "Sua conta",
		username: "Nome de usuário:",
		displayName: "Nome de exibição:",
		email: "E-mail:",
		deleteHeading: "Excluir conta",
		deleteBodyBefore:
			"Exclui sua conta e todas as árvores que você criou, com todas as pessoas, fotos e relações nelas. Árvores que outras pessoas compartilharam com você não são afetadas. Veja a ",
		deleteBodyLink: "política de privacidade",
		deleteBodyAfter: ".",
		failedBefore: (error) => `Não foi possível excluir sua conta por aqui (${error}). `,
		failedLink: "Envie um pedido de exclusão por e-mail",
		failedAfter: " e isso será feito em até 30 dias.",
		deleteButton: "Excluir conta…",
		confirmTitle: "Excluir sua conta?",
		confirmBody:
			"Isso exclui sua conta e todas as árvores que você criou, com todas as pessoas, fotos e relações nelas. As pessoas que você convidou perdem o acesso. Não há como desfazer.",
		confirmLabel: "Excluir tudo",
		keep: "Manter minha conta",
		typeToConfirm: "Digite EXCLUIR para confirmar",
		confirmWords: ["excluir", "delete"],
	},

	dashboard: {
		onlyYou: "Só você",
		viewers: (count) => n(count, "convidado", "convidados"),
		byCreator: (name) => `de ${name}`,
		stats: (count, ago) => `${count === null ? "" : `${people(count)} · `}atualizada ${ago}`,
		moreActions: (name) => `Mais ações para ${name}`,
		rename: "Renomear",
		deleteTree: "Excluir árvore…",
		open: "Abrir",
		emptyTitle: "Nenhuma árvore ainda",
		emptyBody:
			"Comece pelas pessoas que você conhece melhor: você, seus pais, seus avós. Dá para convidar o resto da família quando houver algo para ver.",
		createFirst: "Crie sua primeira árvore",
		emptyNote: "Esperando um convite? Árvores compartilhadas com você aparecem aqui automaticamente.",
		title: "Suas árvores",
		count: (total, owned, shared) =>
			`${n(total, "árvore", "árvores")}${shared > 0 ? ` · ${owned} suas, ${shared} compartilhadas com você` : ""}`,
		newTree: "Nova árvore",
	},

	treeDialogs: {
		nameRequired: "Dê um nome à árvore.",
		created: "Árvore criada",
		newTitle: "Nova árvore",
		newSubtitle: "Dê a ela um nome que você diria em voz alta.",
		treeName: "Nome da árvore",
		namePlaceholder: "Minha árvore genealógica",
		nameHint: "Por exemplo, “Família Kowalski” ou “Lado da mãe”.",
		createAndOpen: "Criar e abrir",
		nameEmpty: "O nome não pode ficar em branco.",
		renamed: "Árvore renomeada",
		renameTitle: "Renomear árvore",
		alreadyHasAccess: "Essa pessoa já tem acesso.",
		noAccount: "Esse e-mail ainda não tem uma conta do Family Tree.",
		thatsYou: "É você. Esta árvore já é sua.",
		invited: (email, tree) => `${email} agora pode ver ${tree}`,
		revoked: "Acesso revogado",
		whoCanSee: (tree) => `Quem pode ver ${tree}`,
		whoCanSeeSubtitle:
			"Convidados podem ver, mas não editar. Eles precisam de uma conta do Family Tree com este e-mail.",
		emailPlaceholder: "nome@exemplo.com",
		emailToInvite: "E-mail para convidar",
		invite: "Convidar",
		revoke: "Revogar",
		deleteTitle: (tree) => `Excluir “${tree}”?`,
		deleteBody: (count, viewers) =>
			`Isso remove ${count === null ? "todas as pessoas dela" : people(count)} e todas as suas relações${
				viewers > 0 ? `, para você e para ${n(viewers, "convidado", "convidados")}` : ""
			}. Não há como desfazer.`,
		deleted: (tree) => `${tree} excluída`,
		deleteConfirm: "Excluir árvore",
		keep: "Manter",
		typeName: "Digite o nome da árvore para confirmar",
	},

	tree: {
		legend: "Legenda",
		deceased: "† falecidos",
		filtersCleared: "Filtros limpos para mostrar a pessoa",
		unknownType: "Desconhecido",
		chipHide: (type) => `Ocultar: ${type}`,
		chipAge: (min, max, plus) => `Idade ${min}–${max}${plus ? "+" : ""}`,
		chipMen: "Só homens",
		chipWomen: "Só mulheres",
		chipNot: (names) => `Sem: ${names}`,
		chipOnly: (names) => `Só: ${names}`,
		removeFilter: (text) => `Remover filtro ${text}`,
		exported: (filename, count) => `${filename} baixado · ${people(count)}`,
		calendarFailed: "Não foi possível gerar o calendário",
		back: "Voltar para as árvores",
		openFailed: "Não foi possível abrir esta árvore",
		backToTrees: "Voltar para suas árvores",
		loadingTree: "Carregando a árvore…",
		counts: (p, r) => `${people(p)} · ${relationships(r)}`,
		emptyTitle: "Ainda não há ninguém aqui",
		emptyOwner:
			"Adicione a primeira pessoa; você é um bom começo. Todas as pessoas adicionadas se alinham pelo ano de nascimento.",
		emptyViewer: "O criador ainda não adicionou ninguém a esta árvore.",
		addFirst: "Adicionar a primeira pessoa",
		editToolbar: "Editar árvore",
		viewToolbar: "Visualizar",
		addPerson: "Adicionar pessoa",
		findPerson: "Buscar pessoa",
		filters: "Filtros",
		exportCalendar: "Exportar para o calendário",
		zoomIn: "Ampliar",
		zoomOut: "Reduzir",
		fit: "Ajustar à tela",
		visible: (shown, total) => `${shown} de ${people(total)} visíveis`,
		saved: "Alterações salvas",
		added: (name) => `Adicionamos ${name} à árvore`,
		relationshipAdded: "Relação adicionada",
		removePersonTitle: (name) => `Remover ${name}?`,
		removePersonBody: (count) =>
			`Isso também remove ${relationships(count)} dessa pessoa. Não há como desfazer.`,
		removePerson: "Remover pessoa",
		personRemoved: (name) => `Removemos ${name}`,
		removeEdgeTitle: "Remover esta relação?",
		removeEdgeBody: (sentence) => `${sentence}. As duas pessoas continuam na árvore.`,
		relationshipRemoved: "Relação removida",
		canvas: "Tela da árvore genealógica. Arraste para mover, role para ampliar ou reduzir.",
		nodeLabel: (name, years, deceased, link) =>
			`${name}, ${years}${deceased ? ", já faleceu" : ""}${
				link === "you" ? ", é você" : link === "linked" ? ", com conta vinculada" : ""
			}`,
		youPill: "Você",
		legendYou: "Você",
		legendLinked: "Conta vinculada",
		band: (year, span) => `${year}–${year + span - 1}`,
	},

	panel: {
		details: (name) => `Detalhes de ${name}`,
		removeWith: (name) => `Remover relação com ${name}`,
		noRelationships: "Nenhuma relação ainda.",
		showFamily: "Mostrar família estendida",
		hideFamily: "Ocultar família estendida",
		noFamily: "Não há vínculos de pais ou de casamento para montar a família mais ampla.",
		removeNamed: (name) => `Remover ${name}`,
		readOnly: "Somente leitura. Só o criador da árvore pode editar.",
		thisIsYou: "É você",
		linkedTo: (email) => `Conta vinculada: ${email}`,
		note: "Observação",
		relationship: "Relação",
		bidirectional: "bidirecional",
		directional: "direcional →",
	},

	filters: {
		hideTypes: "Ocultar tipos de relação",
		hideTypesHint: "Tipos riscados ficam ocultos na tela e na exportação.",
		age: "Idade",
		minimum: "Mínima",
		maximum: "Máxima",
		ageHint: "Idade ao falecer para quem já se foi.",
		gender: "Gênero",
		everyone: "Todos",
		men: "Homens",
		women: "Mulheres",
		includeByName: "Mostrar só nomes que contenham",
		includeHint: "Separados por vírgulas. Mantém as pessoas cujo nome contém qualquer um deles.",
		excludeByName: "Excluir por nome",
		excludeHint:
			"Separados por vírgulas. Corresponde a qualquer parte do nome, ignorando maiúsculas e acentos.",
	},

	dialogs: {
		findTitle: "Buscar pessoa",
		findPlaceholder: "Digite um nome…",
		searchPeople: "Buscar pessoas",
		noResults: "Ninguém com esse nome.",
		nameRequired: "Informe um nome.",
		birthRequired: "Informe a data de nascimento.",
		deathBeforeBirth: "A data de falecimento é anterior à data de nascimento.",
		editPerson: "Editar pessoa",
		addPerson: "Adicionar pessoa",
		personSubtitle: "Nome e data de nascimento são obrigatórios. O resto pode esperar.",
		changePhoto: "Trocar foto",
		uploadPhoto: "Enviar foto",
		photoHint: "JPG ou PNG, até 5 MB. Quadrada fica melhor.",
		photoTooLarge: "Essa foto tem mais de 5 MB.",
		fullName: "Nome completo",
		namePlaceholder: "ex.: Maria Kowalska",
		birthDate: "Data de nascimento",
		deathDate: "Data de falecimento",
		note: "Observação",
		noteHint: "Qualquer coisa que valha a pena lembrar: nome de solteira, onde morou, uma história.",
		noteCount: (length, max) => `${length} / ${max}`,
		noteTooLong: (max) => `Mantenha a observação com menos de ${max} caracteres.`,
		linkedAccount: "Conta vinculada",
		linkedHint: "A conta do Family Tree desta pessoa, se ela tiver acesso à árvore.",
		linkedNone: "Nenhuma",
		linkedMe: (name) => `Eu (${name})`,
		linkedConflict: (account, person) =>
			`${account} já está vinculada a ${person}. Uma conta só pode ser vinculada a uma pessoa, então desvincule-a lá primeiro.`,
		saveChanges: "Salvar alterações",
		addToTree: "Adicionar à árvore",
		search: "Buscar…",
		readAsSentence: "Leia como uma frase:",
		duplicate: "Essa relação já está na árvore.",
		fromPerson: "De",
		toPerson: "Para",
		relationType: "Tipo de relação",
		bothWays: "nos dois sentidos",
		oneWay: "em um sentido",
		exportTitle: "Exportar para o calendário",
		exportHeading: (count) => `Exportar ${people(count)} para o seu calendário`,
		exportBody:
			"Um único arquivo .ics com um aniversário anual para cada pessoa viva e um aniversário de falecimento anual para cada pessoa que já se foi. Pessoas ocultas não são incluídas.",
		birthdays: "Aniversários",
		remembrances: "Aniversários de falecimento",
		download: "Baixar .ics",
	},

	person: {
		/** "78 anos" / "faleceu aos 77 anos" (the verb form is the same for both genders). */
		age: (age, _gender, deceased) =>
			deceased ? `faleceu aos ${n(age, "ano", "anos")}` : n(age, "ano", "anos"),
	},

	family: {
		ancestors: (level) => ANCESTORS[level] ?? `Antepassados (${level + 2}ª geração)`,
		descendants: (level) => DESCENDANTS[level] ?? `Descendentes (${level + 2}ª geração)`,
		parents: "Pais",
		auntsAndUncles: "Tios e tias",
		siblings: "Irmãos",
		children: "Filhos",
	},

	rel: {
		groups: {
			BIOLOGICAL: "Biológicas",
			"IN-LAW": "Afinidade",
			CHURCH: "Religiosas",
			IRRELEVANT: "Outras",
		},
		legend: {
			married: "Casamento",
			livesWith: "Moram juntos",
		},
		known,
		fallbackSentence: (from, phrase, isVerb, to) => `${from} ${isVerb ? "é " : ""}${phrase} ${to}`,
		fallbackRole: (phrase, isVerb, firstName, selectedIsSource) =>
			selectedIsSource
				? `${firstName} ${isVerb ? "é " : ""}${phrase}`
				: `${isVerb ? "é " : ""}${phrase} ${firstName}`,
	},

	calendar: {
		calName: "Family Tree",
		remembranceTitle: (name) => `† ${name}, aniversário de falecimento`,
		remembranceDescription: (name, born) => `Aniversário de falecimento de ${name} (nasc. ${born}).`,
		birthdayTitle: (name) => `Aniversário de ${name}`,
		birthdayDescription: (name, born, _gender) => `${name} nasceu em ${born}.`,
		fileFallback: "arvore-genealogica",
	},
};
