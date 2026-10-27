import type { Dict, KinGender, KinTerm, KinWord, StepMove, TypeText } from "./en";
import { form } from "./plural";

// Português do Brasil. Typed as Dict: a missing or mistyped key does not compile.

const gw = (g: KinGender, m: string, f: string) => (g === "male" ? m : f);
/** "1 ano", "2 anos"; CLDR pt-BR keeps 0 singular ("0 ano"). */
const count = (n: number, one: string, other: string) => `${n} ${form("pt", n, one, other)}`;
const anos = (n: number) => count(n, "ano", "anos");
const pessoas = (n: number) => count(n, "pessoa", "pessoas");
const GRAU = ["", "", "segundo", "terceiro", "quarto", "quinto", "sexto", "sétimo", "oitavo"];
/** avô, bisavô, trisavô, tataravô; neto, bisneto, trineto, tataraneto. Beyond that the chain is used. */
/** "tatar" + "avô" = "tataravô": the prefix drops its final vowel before avô/avó. */
const AVO = ["", "bis", "tris", "tatar"];
const NETO = ["", "bis", "tri", "tatara"];

/** Noun of one chain step ("pai", "filha"); the article carries the gender, the noun itself does not inflect. */
function noun(w: KinWord): string {
	const f = w.gender === "female";
	switch (w.rel) {
		case "parent":
			return f ? "mãe" : "pai";
		case "child":
			return f ? "filha" : "filho";
		case "sibling":
			return f ? "irmã" : "irmão";
		case "spouse":
			return f ? "esposa" : "marido";
		case "partner":
			return f ? "companheira" : "companheiro";
		default:
			return w.noun?.nom ?? "parente";
	}
}
/** "o"/"a" */
const art = (w: KinWord) => (w.gender === "female" ? "a" : "o");
/** "do"/"da": the "de" + article contraction that links the chain. */
const de = (w: KinWord) => (w.gender === "female" ? "da" : "do");
/** "seu"/"sua" */
const seu = (w: KinWord) => (w.gender === "female" ? "sua" : "seu");

export const pt: Dict = {
	lang: "pt",
	locale: "pt-BR",

	common: {
		cancel: "Cancelar",
		done: "Concluído",
		save: "Salvar",
		saving: "Salvando…",
		close: "Fechar",
		back: "Voltar",
		change: "Alterar",
		tryAgain: "Tentar novamente",
		add: "Adicionar",
		create: "Criar",
		creating: "Criando…",
		edit: "Editar",
		remove: "Remover",
		keep: "Manter",
		continue: "Continuar",
		undo: "Desfazer",
		openSettings: "Abrir Ajustes",
		settings: "Ajustes",
		signIn: "Entrar",
		you: "Você",
		loading: "Carregando",
		familyTree: "Family Tree",
		owner: "Proprietário",
		sharedWithYou: "Compartilhada com você",
		male: "Masculino",
		female: "Feminino",
		show: "Mostrar",
		hide: "Ocultar",
		showPassword: "Mostrar senha",
		hidePassword: "Ocultar senha",
		chooseDate: "Escolher uma data",
		dateA11y: (label, value) => `${label}: ${value}. Alterar`,
		closeDatePicker: "Fechar o seletor de data",
		year: "Ano",
		yearHint: "Digite um ano para ir direto a ele no seletor",
		yearExample: "ex.: 1742",
		removeFilter: (label) => `Remover filtro ${label}`,
		searchByName: "Buscar por nome",
		noOneCalled: (q) => `Não há ninguém chamado “${q}”.`,
		noOneToChoose: "Ainda não há ninguém para escolher.",
		selected: "selecionado",
		reminderScheduled: "Lembrete agendado",
		noReminder: "Sem lembrete",
		range: (lo, hi) => `de ${lo} a ${hi}`,
	},

	offline: {
		banner: "Você está offline. Mostrando a última cópia desta árvore.",
		short: "Você está offline.",
		write: "Você está offline — as alterações não podem ser salvas.",
	},

	save: {
		failedOffline: (what) => `Não foi possível salvar ${what}: você está offline ou o servidor não responde. Nada foi perdido; tente novamente.`,
		failed: (what, reason) => `Não foi possível salvar ${what}. ${reason}`,
		noTree: "Nenhuma árvore está aberta, então nada foi salvo. Escolha uma árvore e tente novamente.",
		theChanges: "as alterações",
		thisPerson: "esta pessoa",
		theRelationship: "a relação",
		theTree: "a árvore",
	},

	errors: {
		network: "Sem conexão. Verifique sua internet e tente novamente.",
		generic: "Algo deu errado.",
		notSignedIn: "Você não fez login.",
		passwordsDontMatch: "As senhas não coincidem.",
		sessionExpired: "Sua sessão expirou. Faça login novamente.",
		shareUnavailable: "O compartilhamento não está disponível neste aparelho.",
	},

	tabs: {
		home: "Início",
		tree: "Árvore",
		add: "Adicionar",
		find: "Buscar",
		dates: "Datas",
		settings: "Ajustes",
		addPerson: "Adicionar pessoa",
		findPerson: "Buscar pessoa",
	},

	prefs: {
		language: "Idioma",
		languageSystem: "Do sistema",
		chooseLanguage: "Escolha um idioma",
		appearance: "Aparência",
		theme: "Tema",
		system: "Do sistema",
		light: "Claro",
		dark: "Escuro",
	},

	onboarding: {
		title1: "Sua família, desenhada como um grafo.",
		body1: "As pessoas são cartões, as relações são linhas e as gerações se alinham pelo ano de nascimento. Privado, compartilhado só por convite.",
		title2: "Nunca perca um aniversário nem uma data de falecimento.",
		body2: "Um lembrete discreto no dia anterior. Tudo fica no seu celular; nada é enviado para nós.",
		page: (n, total) => `Página ${n} de ${total}`,
		haveAccount: "Já tenho uma conta",
		turnOnReminders: "Ativar lembretes",
		notNow: "Agora não",
		previewTitle1: "Vovó Maria faz 75 anos amanhã",
		previewWhen1: "Amanhã",
		previewBody1: "Aniversário redondo. Que tal ligar para Maria?",
		previewTitle2: "† Stanisław Kowalski, há 28 anos",
		previewWhen2: "15 de out",
	},

	auth: {
		welcomeBack: "Olá de novo",
		signInSubtitle: "Entre com sua conta do Family Tree.",
		usernameOrEmail: "Nome de usuário ou e-mail",
		password: "Senha",
		forgot: "Esqueceu a senha?",
		newHere: "Primeira vez aqui?",
		createAccount: "Criar uma conta",
		enterBoth: "Informe seu nome de usuário ou e-mail e sua senha.",
		wrongCredentials: "Nome de usuário ou senha incorretos.",
		forgotHowTo: "Digite seu e-mail no primeiro campo e toque em “Esqueceu a senha?” de novo.",
		resetTitle: "Redefinir senha",
		resetConfirm: (email) => `Enviar um link de redefinição para ${email}?`,
		send: "Enviar",
		checkInbox: "Verifique sua caixa de entrada",
		checkInboxBody: "Se esse e-mail tiver uma conta, um link de redefinição está a caminho.",
		couldntSend: "Não foi possível enviar",
		signInAgain: "Faça login novamente",
		sessionEnded: "Sua sessão terminou. Nada foi perdido; a árvore continua aqui.",
		passwordFor: (who) => `Senha de ${who}`,
		differentAccount: "Usar outra conta",
		startTree: "Comece sua árvore",
		freePrivate: "Grátis, privado, sem anúncios.",
		username: "Nome de usuário",
		displayName: "Nome de exibição (opcional)",
		yourName: "Seu nome",
		email: "E-mail",
		confirmPassword: "Confirmar senha",
		step1: "A senha e a confirmação vêm a seguir. Etapa 1 de 2.",
		step2: (email) => `Enviaremos um e-mail de verificação para ${email}. Etapa 2 de 2.`,
		usernameRule: "Pelo menos 3 letras ou números, sem espaços.",
		emailInvalid: "Isso não parece um endereço de e-mail.",
		passwordRule: "Use pelo menos 8 caracteres.",
		createAccountButton: "Criar conta",
		agreePrefix: "Ao criar uma conta, você concorda com a ",
		privacyPolicy: "política de privacidade",
		agreeSuffix: ".",
	},

	home: {
		offline: "Você está offline",
		couldntLoadTrees: "Não foi possível carregar suas árvores",
		connectFirstTime: "Conecte-se à internet para ver suas árvores pela primeira vez.",
		noTrees: "Nenhuma árvore ainda",
		noTreesBody: "Comece por você e seus pais. Convites de parentes aparecem aqui sozinhos.",
		createFirst: "Crie sua primeira árvore",
		treeUnavailable: "Esta árvore não está disponível",
		couldntOpen: "Não foi possível abrir esta árvore",
		treeUnavailableBody: "Ela pode ter sido excluída, ou o proprietário parou de compartilhá-la com você.",
		noCopy: "Ainda não há uma cópia desta árvore neste celular. Conecte-se e tente novamente.",
		chooseTree: "Escolha uma árvore",
		switchTree: "Trocar de árvore",
		lookingFor: "Quem você está procurando?",
		upcoming: "Próximas datas",
		seeAll: "Ver todas",
		noUpcoming: "Nenhuma data próxima",
		noUpcomingEmpty: "Aniversários e datas de falecimento aparecem aqui quando houver pessoas na árvore.",
		noUpcomingYear: "Nada nos próximos doze meses.",
		noOne: "Ainda não há ninguém aqui",
		addYourself: "Adicione você primeiro. Todas as outras pessoas se conectam a alguém que já está na árvore.",
		ownerAddedNoOne: "O proprietário ainda não adicionou ninguém.",
		addFirst: "Adicionar a primeira pessoa",
		quick: "Atalhos",
		addPerson: "Adicionar pessoa",
		linkTwo: "Conectar duas pessoas",
		aboutTree: "Esta árvore",
		detailHint: "Toque em uma data à esquerda para ver a pessoa aqui.",
	},

	tree: {
		loading: "Carregando a árvore…",
		removeTitle: (name) => `Remover ${name}?`,
		removeBody: "As relações dessa pessoa também serão removidas. Isso não pode ser desfeito.",
		removed: (name) => `Removemos ${name}`,
		addRelationship: "Adicionar relação",
		focusedOn: (name) => `Foco em ${name}`,
		parents: "pais",
		partner: "parceiro",
		partners: "parceiros",
		children: "filhos",
		exitFocus: "Sair do foco",
		search: "Buscar",
		filters: "Filtros",
		filtersActive: (n) => `Filtros, ${count(n, "ativo", "ativos")}`,
		goUpTo: (name) => `Subir para ${name}`,
		resetView: "Redefinir visualização",
		fitAll: "Ajustar a árvore inteira",
		allFiltered: "Os filtros ocultaram todo mundo",
		clearFilters: "Limpar filtros",
		canvasA11y: (n) => `Árvore genealógica com ${pessoas(n)}. Use a busca para encontrar alguém.`,
		bandLabel: (start, end) => `${start}–${end}`,
		bandLabelShort: (start, end) => `${start}–${String(end).slice(2)}`,
		legend: "Legenda",
		legendBio: "Biol.",
		legendMarried: "Casamento",
		legendLivesWith: "Moram juntos",
		legendInLaw: "Afinidade",
		legendChurch: "Religiosa",
		legendOther: "Outra",
		youPill: "Você",
		legendYou: "Você",
		panelHint: "Toque em uma pessoa para ver os detalhes aqui.",
		panelTitle: "Detalhes",
	},

	person: {
		gone: "Esta pessoa não está mais na árvore.",
		ageAlive: (g, age) => `${g} · ${anos(age)}`,
		ageDeceased: (g, age, wouldBe) => `${g} · faleceu aos ${anos(age)}${wouldBe ? ` · teria ${anos(wouldBe)}` : ""}`,
		you: "você",
		focus: "Focar",
		focusOnTree: "Focar na árvore",
		howRelated: "Qual é o nosso parentesco?",
		turns: (n) => `Faz ${anos(n)}`,
		remembranceDay: "Aniversário de falecimento",
		remindMe: "Me lembre",
		noRelationshipsOwner: "Nenhuma relação ainda. Adicione uma para conectar esta pessoa à árvore.",
		noRelationships: "Nenhuma relação ainda.",
		dragUp: "Arraste para cima para ver todas as relações",
		removedFromTree: (name) => `Removemos ${name} da árvore`,
		couldntRemove: (name, reason) => `Não foi possível remover ${name}. ${reason}`,
		open: "Abrir",
		removeRelationship: "Remover relação",
		relationshipRemoved: "Relação removida",
		sharedBy: (email) => `Compartilhada com você${email ? ` por ${email}` : ""}. Só o proprietário pode editar.`,
		removeA11y: (name) => `Remover ${name}`,
		thisIsYou: "É você",
		linkedTo: (email) => `Conta vinculada: ${email}`,
		linkedToAccount: "Conta vinculada",
		note: "Observação",
	},

	path: {
		whichIsYou: "Quem é você nesta árvore?",
		needMe: (first) =>
			`Para dizer qual é o parentesco de ${first} com você, o app precisa saber qual pessoa desta árvore é você. Você escolhe uma vez; a escolha fica neste celular.`,
		chooseWho: "Indicar quem é você",
		notConnected: "Ainda sem conexão com você",
		notConnectedBody: (name) => `Nesta árvore não há uma cadeia de relações entre você e ${name}. Adicionar uma relação conectaria vocês.`,
		open: (first) => `Abrir ${first}`,
		stepsThrough: (steps, people) => `${count(steps, "passo", "passos")} por ${pessoas(people)}.`,
		familyOnly: "Caminho mais curto usando só vínculos biológicos e de casamento.",
		anyLinks: "Os vínculos familiares não conectam vocês, então outros vínculos registrados foram usados.",
		youName: (name) => `Você · ${name}`,
		showOnTree: "Mostrar na árvore",
		meNote: (name) => `“Sou eu” (${name}) fica salvo só neste celular, porque a árvore compartilhada ainda não tem um campo para isso. Altere em Ajustes.`,
		notConnectedShort: "ainda sem conexão com você",
	},

	search: {
		placeholder: "Quem você está procurando?",
		a11y: "Buscar pessoas",
		chooseWho: "Indicar quem é você",
		chooseWhoBody: "Diga ao app qual pessoa é você para ver o parentesco de todo mundo com você. A escolha fica neste celular.",
		noOne: (q) => `Não há ninguém chamado “${q}” nesta árvore.`,
	},

	addPerson: {
		add: "Adicionar pessoa",
		edit: "Editar pessoa",
		viewerOnly: "Esta árvore foi compartilhada com você só para visualização. Apenas o proprietário pode adicionar pessoas.",
		chooseTreeFirst: "Escolha ou crie uma árvore primeiro.",
		gone: "Esta pessoa não está mais na árvore.",
		nameRequired: "O nome é obrigatório.",
		chooseGender: "Escolha um gênero.",
		birthRequired: "A data de nascimento é obrigatória.",
		deathRequired: "Adicione a data de falecimento ou desative esta opção.",
		deathBeforeBirth: "A data de falecimento é anterior à data de nascimento.",
		linkIncomplete: "Escolha a relação e a pessoa, ou limpe o vínculo.",
		saved: (first) => `Dados de ${first} salvos`,
		linkFailed: (first, reason) => `Adicionamos ${first}, mas não foi possível salvar o vínculo. ${reason}`,
		added: (first) => `Adicionamos ${first} à árvore`,
		changePhoto: "Trocar foto",
		addPhoto: "Adicionar uma foto",
		cameraOff: "O acesso à câmera está desativado",
		cameraOffBody: "Você ainda pode escolher uma foto da galeria, ou permitir a câmera em Ajustes.",
		useGallery: "Usar a galeria",
		takePhoto: "Tirar foto",
		fromGallery: "Escolher da galeria",
		fullName: "Nome completo",
		namePlaceholder: "ex.: Maria Kowalska",
		gender: "Gênero",
		birthDate: "Data de nascimento",
		passedAway: "Já faleceu",
		passedAwayHint: "Adiciona a data e o aniversário de falecimento",
		deathDate: "Data de falecimento",
		linkTo: "Vincular a alguém",
		linkOptional: "opcional, poupa um passo",
		linkExample: (name) => `ex.: mãe de ${name}`,
		newPerson: "Nova pessoa",
		parentNote: (child) => `A nova pessoa é o pai ou a mãe; ${child} é o filho ou a filha.`,
		theChosen: "a pessoa escolhida",
		dontLink: "Não vincular agora",
		note: "Observação",
		notePlaceholder: "Algo que vale a pena lembrar",
		noteCount: (n, max) => `${n}/${max}`,
		linkedAccount: "Conta vinculada",
		linkedHint: "Qual conta do Family Tree é desta pessoa? Só aparecem contas que podem ver esta árvore.",
		linkedNone: "Nenhuma",
		linkedMe: (email) => (email ? `Eu (${email})` : "Eu"),
		linkedConflict: (name) => `Esta conta já está vinculada a ${name}.`,
		loadingAccounts: "Carregando contas…",
	},

	addRel: {
		title: "Adicionar relação",
		viewerOnly: "Só o proprietário desta árvore pode adicionar relações.",
		chooseBoth: "Escolha as duas pessoas e a relação entre elas.",
		different: "Escolha duas pessoas diferentes.",
		duplicate: "Esta relação já está na árvore.",
		added: "Relação adicionada",
		isRelatedTo: "tem relação com",
		from: "De",
		to: "Para",
		relation: "Relação",
		changeFrom: "Alterar de quem parte a relação",
		more: "Mais…",
		fewer: "Menos",
		sentence: (a, verb, b) => `${a} ${verb} ${b}.`,
		sentenceJoin: " ",
	},

	filters: {
		title: "Filtros",
		clearAll: "Limpar tudo",
		show: (shown, total) => `Mostrar ${shown} de ${pessoas(total)}`,
		hideTypes: "Ocultar tipos de relação",
		hidden: "oculto",
		shown: "visível",
		age: "Idade",
		ageRange: "Faixa etária",
		gender: "Gênero",
		everyone: "Todos",
		men: "Homens",
		women: "Mulheres",
		excludeByName: "Excluir por nome",
		excludeHint: "Separe vários nomes com vírgulas.",
		excludePlaceholder: "Nowak, Roman",
		chipHide: (label) => `Ocultar: ${label}`,
		chipAge: (lo, hi) => `Idade ${lo}–${hi}`,
		chipMen: "Só homens",
		chipWomen: "Só mulheres",
		chipNot: (names) => `Sem: ${names}`,
		chipOnly: (names) => `Só: ${names}`,
		includeByName: "Mostrar só nomes que contenham",
		includeHint: "Qualquer um de vários nomes, separados por vírgulas.",
		includePlaceholder: "Kowalsk, Anna",
	},

	trees: {
		title: "Suas árvores",
		giveName: "Dê um nome à árvore primeiro.",
		created: (name) => `“${name}” criada`,
		nameLabel: "Nome da nova árvore",
		namePlaceholder: "Minha árvore genealógica",
		newTree: "Nova árvore",
		people: (n) => pessoas(n),
		updated: (rel) => `atualizada ${rel}`,
		viewers: (n) => count(n, "convidado", "convidados"),
		onlyYou: "Só você",
		by: (email) => `de ${email}`,
		active: "Ativa ✓",
	},

	invited: {
		title: "Quem pode ver esta árvore",
		subtitle: "Convidados podem ver, mas não editar.",
		thatsYou: "É você; esta árvore já é sua.",
		already: "Essa pessoa já pode ver esta árvore.",
		canSee: (email) => `${email} agora pode ver esta árvore`,
		noAccount: "Nenhuma conta do Family Tree usa esse e-mail. Peça para a pessoa criar uma conta primeiro e depois faça o convite.",
		thisPerson: "esta pessoa",
		stopTitle: (who) => `Parar de compartilhar com ${who}?`,
		stopBody: "Essa pessoa não verá mais esta árvore.",
		revoke: "Revogar",
		revoked: (who) => `${who} não pode mais ver esta árvore`,
		emailPlaceholder: "nome@exemplo.com",
		emailA11y: "E-mail da pessoa a convidar",
		invite: "Convidar",
		note: "A pessoa já precisa ter uma conta do Family Tree com este e-mail. Nada é enviado por e-mail; a árvore simplesmente aparece na lista dela.",
		youSuffix: (name) => `${name} (você)`,
		creator: "Criador",
		viewer: "Convidado",
		viewerYou: "Convidado · você",
		unknown: "Conta desconhecida",
		revokeA11y: (email) => `Revogar ${email}`,
		onlyYou: "Só você pode ver esta árvore.",
	},

	dates: {
		title: "Datas",
		exportIcs: "Exportar .ics",
		all: "Todas",
		birthdays: "Aniversários",
		remembrance: "Falecimentos",
		quietReminder: "Receba um lembrete discreto no dia anterior",
		turnOn: "Ativar lembretes",
		localOnly: "Os lembretes são agendados neste celular a partir das datas da árvore. Nada é enviado a um servidor.",
		detailHint: "Toque em uma data para ver a pessoa aqui.",
		none: "Nenhuma data próxima",
		noneBody: "Aniversários e datas de falecimento aparecem aqui quando houver pessoas na árvore.",
		footnote:
			"Sino = lembrete local agendado para as 9:00 do dia anterior (datas de falecimento: no próprio dia). Idades redondas (18, 50, 55, 60…) podem ter um segundo lembrete uma semana antes. A exportação inclui as pessoas visíveis na árvore no momento.",
	},

	settings: {
		title: "Ajustes",
		signOutTitle: "Sair da conta?",
		signOutBody: "Os lembretes serão removidos e as cópias das suas árvores serão apagadas deste celular.",
		signOut: "Sair",
		account: "Conta",
		accountBody: "A senha é alterada no site.",
		openWebsite: "Abrir o site",
		reminders: "Lembretes",
		birthdays: "Aniversários",
		dayBefore: "No dia anterior, às 9:00",
		remembranceDays: "Datas de falecimento",
		onTheDay: "No próprio dia, às 9:00",
		roundEarly: "Aniversários redondos uma semana antes",
		roundAges: "18, 50, 55, 60, 65, 70…",
		remindersNote: "Agendados neste celular para a árvore ativa. Nada é enviado a um servidor.",
		whoCanSee: "Quem pode ver esta árvore",
		viewers: (n) => pessoas(n),
		onlyYou: "Só você",
		preparing: "Preparando…",
		exportIcs: "Exportar para o calendário (.ics)",
		thisIsMe: "Sou eu",
		notSet: "Não definido",
		switchTree: "Trocar de árvore",
		about: "Sobre",
		privacy: "Política de privacidade",
		deleteAccount: "Excluir conta",
		deleteTitle: "Excluir sua conta?",
		deleteBody:
			"Isso exclui sua conta e todas as árvores que você criou, com todas as pessoas, fotos e relações. As pessoas que você convidou perdem o acesso. Não há como desfazer.",
		footer: (version) => `Family Tree ${version} · Criado por tomek7667 · family-tree@cyber-man.pl`,
	},

	/** House ads (ads.cyber-man.pl) shown on Home and in Settings. */
	ads: {
		sponsored: "Patrocinado",
		tag: "Anúncio",
		open: (title) => `Abrir ${title}`,
	},

	deleteAccount: {
		title: "Excluir conta",
		typeToConfirm: (word) => `Digite ${word} para confirmar`,
		typeToConfirmError: (word) => `Digite ${word} para confirmar.`,
		offline: "Você está offline — sua conta não pode ser excluída agora.",
		permanently: "Isso exclui permanentemente:",
		yourAccount: (email) => `• sua conta${email ? ` (${email})` : ""}`,
		everyTree: "• todas as árvores que você criou, com todas as pessoas, fotos e relações",
		consequences: "As pessoas que você convidou perdem o acesso a essas árvores. Árvores que outras pessoas compartilharam com você não são afetadas. Não há como desfazer.",
		notFully: (reason) => `Sua conta não foi totalmente excluída. ${reason}`,
		askUs: (email) => `Você pode tentar novamente ou nos pedir para excluí-la pelo e-mail ${email}.`,
		emailRequest: "Enviar pedido de exclusão por e-mail",
		deleteMine: "Excluir minha conta",
		deleting: "Excluindo…",
		keep: "Manter minha conta",
		mailSubject: "Excluir minha conta do Family Tree",
		mailBody: (email) => `Por favor, excluam minha conta do Family Tree${email ? ` (${email})` : ""} e todas as árvores que eu criei.`,
	},

	pickMe: {
		title: "Quem é você nesta árvore?",
		note: "Usado em “Qual é o nosso parentesco?”. Fica salvo só neste celular e ninguém mais vê.",
		forget: "Esquecer minha escolha",
		serverLinked: (name) => `Nesta árvore, sua conta está vinculada a ${name}, então “Sou eu” vem da árvore em todos os aparelhos.`,
		saveTitle: "Salvar na árvore?",
		saveBody: (name) => `Vincular ${name} à sua conta nesta árvore? Assim, “Sou eu” funciona em todos os aparelhos e no site.`,
		saveLink: "Salvar vínculo",
		phoneOnly: "Só neste celular",
		linkSaved: (name) => `Vinculamos ${name} à sua conta`,
	},

	notFound: {
		title: "Nada por aqui",
		body: "Esse link aponta para uma página que o app não tem.",
		home: "Ir para o início",
	},

	toastsReminders: {
		on: "Lembretes ativados. Eles ficam neste celular.",
		off: "As notificações do Family Tree estão desativadas.",
		settings: "Ajustes",
		channel: "Aniversários e datas de falecimento",
	},

	dateNames: {
		monthsNom: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
		monthsInDate: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"],
		monthsShort: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
		weekdaysShort: ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"],
		/** "4 de fevereiro de 1950" */
		dayMonthYear: (day, month, year) => `${day} de ${month} de ${year}`,
		/** "15 de out" */
		dayMonth: (day, month) => `${day} de ${month}`,
	},

	time: {
		justNow: "agora mesmo",
		minutesAgo: (n) => `há ${count(n, "minuto", "minutos")}`,
		hoursAgo: (n) => `há ${count(n, "hora", "horas")}`,
		yesterday: "ontem",
		daysAgo: (n) => `há ${n} dias`,
		weeksAgo: (n) => `há ${count(n, "semana", "semanas")}`,
		monthsAgo: (n) => `há ${count(n, "mês", "meses")}`,
		yearsAgo: (n) => `há ${anos(n)}`,
		today: "hoje",
		tomorrow: "amanhã",
		inDays: (n) => `em ${n} dias`,
	},

	events: {
		birthdayTitle: (first, age) => `${first} faz ${anos(age)}`,
		// "28 years since": "há 28 anos" cannot be misread as an age.
		remembranceTitle: (first, n) => `† ${first}, há ${anos(n)}`,
		birthday: "Aniversário",
		remembrance: "Aniversário de falecimento",
		roundAge: "número redondo",
		reminderEve: (first, age) => `${first} faz ${anos(age)} amanhã`,
		reminderEveRoundBody: (first) => `Aniversário redondo. Que tal ligar para ${first}?`,
		reminderWeek: (first, age) => `${first} faz ${anos(age)} daqui a uma semana`,
		reminderWeekBody: (dayMonth) => `Aniversário redondo em ${dayMonth}.`,
		reminderRemembrance: (name, n) => `† ${name}, há ${anos(n)}`,
		reminderRemembranceBody: (dayMonth) => `Aniversário de falecimento · ${dayMonth}`,
	},

	ics: {
		calName: "Aniversários",
		birthdayTitle: (name) => `Aniversário de ${name}`,
		birthdayDesc: (name) => `Neste dia é o aniversário de ${name}`,
		deathTitle: (name) => `Aniversário de falecimento de ${name}`,
		deathDesc: (name) => `Neste dia é o aniversário de falecimento de ${name}`,
		fileSuffix: "datas",
		shareTitle: (tree) => `${tree} – datas`,
	},

	rel: {
		groups: { BIOLOGICAL: "Biológicas", "IN-LAW": "Afinidade", CHURCH: "Religiosas", IRRELEVANT: "Outras" },
		types: {
			IS_FATHER_OF: { label: "Pai", sentence: () => "é pai de" },
			IS_MOTHER_OF: { label: "Mãe", sentence: () => "é mãe de" },
			IS_MARRIED_TO: { label: "Cônjuge", sentence: (g) => gw(g, "é casado com", "é casada com") },
			LIVES_WITH: { label: "Moram juntos", sentence: () => "mora com" },
			IS_PARTNER_OF: { label: "Companheiro(a)", sentence: (g) => gw(g, "é companheiro de", "é companheira de") },
			IS_ENGAGED_TO: { label: "Noivo(a)", sentence: (g) => gw(g, "é noivo de", "é noiva de") },
			IS_GODPARENT_OF: {
				label: "Padrinho / madrinha",
				sentence: (g) => gw(g, "é padrinho de", "é madrinha de"),
				role: (g) => gw(g, "Padrinho", "Madrinha"),
				inverseRole: (g) => gw(g, "Afilhado", "Afilhada"),
			},
			IS_FRIEND_OF: {
				label: "Amigo(a)",
				sentence: (g) => gw(g, "é amigo de", "é amiga de"),
				role: (g) => gw(g, "Amigo", "Amiga"),
				inverseRole: (g) => gw(g, "Amigo", "Amiga"),
			},
			IS_STEPPARENT_OF: {
				label: "Padrasto / madrasta",
				sentence: (g) => gw(g, "é padrasto de", "é madrasta de"),
				role: (g) => gw(g, "Padrasto", "Madrasta"),
				inverseRole: (g) => gw(g, "Enteado", "Enteada"),
			},
		} as Record<string, TypeText>,
		roles: {
			mother: "Mãe",
			father: "Pai",
			child: "Filho(a)",
			sibling: (g) => gw(g, "Irmão", "Irmã"),
			isSourceOf: (first, labelLower) => `${first} é ${labelLower}`,
		},
	},

	kin: {
		you: "você",
		youTitle: "Você",
		term: (t: KinTerm) => {
			const g = t.gender;
			if (t.kind === "affinal") {
				switch (t.which) {
					case "spouse":
						return gw(g, "marido", "esposa");
					case "partner":
						return gw(g, "companheiro", "companheira");
					case "parentInLaw":
						return gw(g, "sogro", "sogra");
					case "siblingInLaw":
						return gw(g, "cunhado", "cunhada");
					case "childInLaw":
						return gw(g, "genro", "nora");
					case "stepParent":
						return gw(g, "padrasto", "madrasta");
					case "stepChild":
						return gw(g, "enteado", "enteada");
				}
			}
			const { up: u, down: d } = t;
			if (u === 0 && d === 0) return null;
			if (d === 0) {
				if (u === 1) return gw(g, "pai", "mãe");
				const p = AVO[u - 2];
				return p === undefined ? null : p + gw(g, "avô", "avó");
			}
			if (u === 0) {
				if (d === 1) return gw(g, "filho", "filha");
				const p = NETO[d - 2];
				return p === undefined ? null : p + gw(g, "neto", "neta");
			}
			if (u === 1 && d === 1) return gw(g, "irmão", "irmã");
			if (d === 1) {
				// tio, tio-avô, tio-bisavô, tio-trisavô…
				if (u === 2) return gw(g, "tio", "tia");
				const p = AVO[u - 3];
				return p === undefined ? null : gw(g, `tio-${p}avô`, `tia-${p}avó`);
			}
			if (u === 1) {
				// sobrinho, sobrinho-neto, sobrinho-bisneto, sobrinho-trineto…
				if (d === 2) return gw(g, "sobrinho", "sobrinha");
				const p = NETO[d - 3];
				return p === undefined ? null : gw(g, `sobrinho-${p}neto`, `sobrinha-${p}neta`);
			}
			if (u === d) {
				const degree = u - 1;
				const base = gw(g, "primo", "prima");
				return degree === 1 ? base : `${base} de ${GRAU[degree] ?? `${degree}º`} grau`;
			}
			// Cousins "removed" (your mother's cousin, your cousin's daughter): Portuguese says it with the chain.
			return null;
		},
		word: (w: KinWord) => noun(w),
		/** Possessive chain runs from the far person back to you: "a filha do irmão da sua mãe". */
		chain: (words: KinWord[]) => {
			if (!words.length) return "você";
			const first = words[0];
			if (words.length === 1) return `${seu(first)} ${noun(first)}`;
			const last = words[words.length - 1];
			const middle = words
				.slice(1, -1)
				.reverse()
				.map((w) => `${de(w)} ${noun(w)}`);
			return [`${art(last)} ${noun(last)}`, ...middle, `${de(first)} ${seu(first)} ${noun(first)}`].join(" ");
		},
		phrase: (term, g) => `${g === "female" ? "sua" : "seu"} ${term}`,
		step: (move: StepMove, g, typeSentence) => {
			switch (move) {
				case "up":
					return gw(g, "filho de", "filha de");
				case "down":
					return gw(g, "pai de", "mãe de");
				case "sibling":
					return gw(g, "irmão de", "irmã de");
				case "spouse":
					return gw(g, "marido de", "esposa de");
				default:
					return typeSentence ?? "parente de";
			}
		},
		otherNoun: (typeName, farIsSource, bidirectional, g, fallbackLabel) => {
			const f = g === "female";
			const same = (s: string) => ({ nom: s, gen: s });
			if (typeName === "IS_GODPARENT_OF") return same(farIsSource ? (f ? "madrinha" : "padrinho") : f ? "afilhada" : "afilhado");
			if (typeName === "IS_FRIEND_OF") return same(f ? "amiga" : "amigo");
			if (typeName === "IS_STEPPARENT_OF") return same(farIsSource ? (f ? "madrasta" : "padrasto") : f ? "enteada" : "enteado");
			void bidirectional;
			// Unknown type: its (English) name, as is.
			return same(fallbackLabel.replace(/ (of|to|with)$/, "").toLowerCase());
		},
	},
};
