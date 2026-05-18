export type Stage =
  | "novo"
  | "qualificado"
  | "proposta"
  | "negociacao"
  | "fechamento"
  | "ganho"
  | "perdido";

export type Priority = "baixa" | "media" | "alta" | "critica";

export interface Tag {
  label: string;
  tone: "blue" | "cyan" | "violet" | "emerald" | "amber" | "rose" | "slate";
}

export interface InteractionEvent {
  id: string;
  type: "call" | "email" | "whatsapp" | "note" | "meeting" | "task" | "file" | "stage" | "ai";
  title: string;
  description?: string;
  at: string; // ISO
  author: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  segment: string;
  contact: {
    email: string;
    phone: string;
    whatsapp: string;
  };
  value: number;
  probability: number; // 0-100
  stage: Stage;
  owner: { name: string; avatarTone: string };
  origin: string;
  tags: Tag[];
  priority: Priority;
  score: number; // 0-100
  slaHours: number; // remaining
  inStageHours: number;
  nextAction: { label: string; date: string };
  lastInteraction: string;
  products: { name: string; price: number }[];
  timeline: InteractionEvent[];
  createdAt: string;
}

export const STAGES: { id: Stage; label: string; accent: string; hint: string }[] = [
  { id: "novo", label: "Novos leads", accent: "from-royal-500 to-royal-700", hint: "Captação inicial" },
  { id: "qualificado", label: "Qualificados", accent: "from-cyan-400 to-royal-500", hint: "SDR validou ICP" },
  { id: "proposta", label: "Proposta enviada", accent: "from-cyan-300 to-cyan-600", hint: "Aguardando retorno" },
  { id: "negociacao", label: "Negociação", accent: "from-amber-300 to-amber-600", hint: "Ajustes finais" },
  { id: "fechamento", label: "Fechamento", accent: "from-emerald-300 to-emerald-600", hint: "Contrato em assinatura" },
  { id: "ganho", label: "Ganho", accent: "from-emerald-400 to-emerald-700", hint: "Onboarding" },
];

const owners = [
  { name: "Mariana Alves", avatarTone: "from-cyan-400 to-royal-600" },
  { name: "Rafael Souza", avatarTone: "from-violet-400 to-royal-600" },
  { name: "Carla Mendes", avatarTone: "from-emerald-400 to-cyan-600" },
  { name: "Diego Lima", avatarTone: "from-amber-400 to-rose-600" },
  { name: "Bruna Castro", avatarTone: "from-rose-400 to-violet-600" },
];

const tagBank: Tag[] = [
  { label: "Inbound", tone: "cyan" },
  { label: "Enterprise", tone: "violet" },
  { label: "Indicação", tone: "emerald" },
  { label: "Hot lead", tone: "rose" },
  { label: "Renovação", tone: "amber" },
  { label: "Upsell", tone: "blue" },
  { label: "PME", tone: "slate" },
];

function makeTimeline(name: string): InteractionEvent[] {
  const today = Date.now();
  return [
    {
      id: "t1",
      type: "stage",
      title: "Lead criado pelo formulário do site",
      at: new Date(today - 1000 * 60 * 60 * 96).toISOString(),
      author: "Sistema",
    },
    {
      id: "t2",
      type: "whatsapp",
      title: `WhatsApp para ${name.split(" ")[0]}`,
      description: "Mensagem de boas-vindas + agendamento de call.",
      at: new Date(today - 1000 * 60 * 60 * 72).toISOString(),
      author: "Mariana Alves",
    },
    {
      id: "t3",
      type: "call",
      title: "Ligação de descoberta (32min)",
      description: "Dor: gestão de cobrança manual. Decisor confirmado.",
      at: new Date(today - 1000 * 60 * 60 * 48).toISOString(),
      author: "Rafael Souza",
    },
    {
      id: "t4",
      type: "email",
      title: "Envio da proposta comercial v2",
      description: "Plano Growth + módulo Recorrência. Vencimento em 7 dias.",
      at: new Date(today - 1000 * 60 * 60 * 24).toISOString(),
      author: "Mariana Alves",
    },
    {
      id: "t5",
      type: "ai",
      title: "Resumo IA da negociação",
      description:
        "Cliente avalia 2 concorrentes. Sensibilidade a preço alta, mas valoriza suporte humanizado. Sugestão: oferecer trial de 14 dias.",
      at: new Date(today - 1000 * 60 * 60 * 6).toISOString(),
      author: "Copiloto IA",
    },
    {
      id: "t6",
      type: "task",
      title: "Follow-up agendado para amanhã 10h",
      at: new Date(today - 1000 * 60 * 60 * 2).toISOString(),
      author: "Mariana Alves",
    },
  ];
}

const seed: Omit<Deal, "timeline" | "createdAt">[] = [
  {
    id: "d1",
    name: "Lucas Andrade",
    company: "Padaria Boulangerie",
    segment: "Alimentação",
    contact: { email: "lucas@boulangerie.com.br", phone: "+55 11 99812-3344", whatsapp: "+55 11 99812-3344" },
    value: 4800,
    probability: 35,
    stage: "novo",
    owner: owners[0],
    origin: "Formulário site",
    tags: [tagBank[0], tagBank[6]],
    priority: "media",
    score: 62,
    slaHours: 22,
    inStageHours: 6,
    nextAction: { label: "Ligar para qualificar", date: "Hoje 16:30" },
    lastInteraction: "WhatsApp · 2h",
    products: [{ name: "Plano Starter", price: 199 }],
  },
  {
    id: "d2",
    name: "Patricia Nogueira",
    company: "Clínica Vitalis",
    segment: "Saúde",
    contact: { email: "patricia@vitalis.com", phone: "+55 21 98877-1122", whatsapp: "+55 21 98877-1122" },
    value: 18900,
    probability: 60,
    stage: "qualificado",
    owner: owners[1],
    origin: "Indicação",
    tags: [tagBank[2], tagBank[5]],
    priority: "alta",
    score: 81,
    slaHours: 9,
    inStageHours: 30,
    nextAction: { label: "Enviar proposta", date: "Amanhã 09:00" },
    lastInteraction: "Call · ontem",
    products: [{ name: "Plano Growth", price: 499 }, { name: "Recorrência", price: 199 }],
  },
  {
    id: "d3",
    name: "Eduardo Prates",
    company: "Logística Norte SA",
    segment: "Transporte",
    contact: { email: "eduardo@lognorte.com", phone: "+55 41 99445-7788", whatsapp: "+55 41 99445-7788" },
    value: 67500,
    probability: 70,
    stage: "proposta",
    owner: owners[1],
    origin: "Outbound",
    tags: [tagBank[1], tagBank[3]],
    priority: "critica",
    score: 92,
    slaHours: 2,
    inStageHours: 48,
    nextAction: { label: "Reunião com decisor", date: "Hoje 18:00" },
    lastInteraction: "E-mail · 6h",
    products: [{ name: "Plano Enterprise", price: 1499 }, { name: "Onboarding Premium", price: 4900 }],
  },
  {
    id: "d4",
    name: "Sofia Tavares",
    company: "Studio Pilates Move",
    segment: "Bem-estar",
    contact: { email: "sofia@studiomove.com", phone: "+55 11 98123-9090", whatsapp: "+55 11 98123-9090" },
    value: 9600,
    probability: 45,
    stage: "qualificado",
    owner: owners[2],
    origin: "Instagram",
    tags: [tagBank[0], tagBank[6]],
    priority: "media",
    score: 68,
    slaHours: 18,
    inStageHours: 14,
    nextAction: { label: "Apresentar demo", date: "Sex 14:00" },
    lastInteraction: "WhatsApp · 1d",
    products: [{ name: "Plano Pro", price: 349 }],
  },
  {
    id: "d5",
    name: "Henrique Vidal",
    company: "Vidal Advogados",
    segment: "Jurídico",
    contact: { email: "henrique@vidaladv.com", phone: "+55 31 99987-3322", whatsapp: "+55 31 99987-3322" },
    value: 24500,
    probability: 80,
    stage: "negociacao",
    owner: owners[3],
    origin: "Google Ads",
    tags: [tagBank[1], tagBank[4]],
    priority: "alta",
    score: 87,
    slaHours: 5,
    inStageHours: 72,
    nextAction: { label: "Revisar contrato", date: "Hoje 11:00" },
    lastInteraction: "E-mail · 3h",
    products: [{ name: "Plano Growth", price: 499 }],
  },
  {
    id: "d6",
    name: "Marcela Reis",
    company: "EcoVerde Cosméticos",
    segment: "Beleza",
    contact: { email: "marcela@ecoverde.com", phone: "+55 19 99332-4455", whatsapp: "+55 19 99332-4455" },
    value: 32100,
    probability: 85,
    stage: "fechamento",
    owner: owners[0],
    origin: "Evento",
    tags: [tagBank[3], tagBank[5]],
    priority: "critica",
    score: 95,
    slaHours: 3,
    inStageHours: 18,
    nextAction: { label: "Coletar assinatura", date: "Hoje 17:00" },
    lastInteraction: "Reunião · 1h",
    products: [{ name: "Plano Pro", price: 349 }, { name: "Add-on API", price: 299 }],
  },
  {
    id: "d7",
    name: "Tiago Bernardes",
    company: "BernardesTech",
    segment: "Tecnologia",
    contact: { email: "tiago@bernardestech.com", phone: "+55 51 98876-1212", whatsapp: "+55 51 98876-1212" },
    value: 12400,
    probability: 50,
    stage: "proposta",
    owner: owners[4],
    origin: "LinkedIn",
    tags: [tagBank[0], tagBank[1]],
    priority: "media",
    score: 74,
    slaHours: 12,
    inStageHours: 26,
    nextAction: { label: "Follow-up proposta", date: "Amanhã 15:00" },
    lastInteraction: "WhatsApp · 5h",
    products: [{ name: "Plano Growth", price: 499 }],
  },
  {
    id: "d8",
    name: "Renata Pacheco",
    company: "Pacheco Imóveis",
    segment: "Imobiliário",
    contact: { email: "renata@pachecoim.com", phone: "+55 11 99221-3344", whatsapp: "+55 11 99221-3344" },
    value: 8900,
    probability: 30,
    stage: "novo",
    owner: owners[2],
    origin: "Indicação",
    tags: [tagBank[2]],
    priority: "baixa",
    score: 51,
    slaHours: 36,
    inStageHours: 4,
    nextAction: { label: "Primeiro contato", date: "Hoje 19:00" },
    lastInteraction: "—",
    products: [{ name: "Plano Starter", price: 199 }],
  },
  {
    id: "d9",
    name: "Felipe Antunes",
    company: "Antunes & Filhos",
    segment: "Construção",
    contact: { email: "felipe@antunes.com", phone: "+55 47 99883-1199", whatsapp: "+55 47 99883-1199" },
    value: 41200,
    probability: 65,
    stage: "negociacao",
    owner: owners[3],
    origin: "Outbound",
    tags: [tagBank[1], tagBank[5]],
    priority: "alta",
    score: 83,
    slaHours: 7,
    inStageHours: 40,
    nextAction: { label: "Ajustar desconto", date: "Hoje 20:00" },
    lastInteraction: "Call · 4h",
    products: [{ name: "Plano Enterprise", price: 1499 }],
  },
  {
    id: "d10",
    name: "Juliana Freitas",
    company: "Freitas Contabilidade",
    segment: "Contábil",
    contact: { email: "juliana@freitascont.com", phone: "+55 11 99000-7788", whatsapp: "+55 11 99000-7788" },
    value: 6700,
    probability: 90,
    stage: "ganho",
    owner: owners[0],
    origin: "Inbound",
    tags: [tagBank[2], tagBank[5]],
    priority: "media",
    score: 90,
    slaHours: 0,
    inStageHours: 2,
    nextAction: { label: "Iniciar onboarding", date: "Hoje 14:00" },
    lastInteraction: "Contrato · 30min",
    products: [{ name: "Plano Pro", price: 349 }],
  },
  {
    id: "d11",
    name: "André Vasconcelos",
    company: "Vasco Distribuidora",
    segment: "Distribuição",
    contact: { email: "andre@vascod.com", phone: "+55 71 99776-3322", whatsapp: "+55 71 99776-3322" },
    value: 53800,
    probability: 75,
    stage: "fechamento",
    owner: owners[1],
    origin: "Indicação",
    tags: [tagBank[1], tagBank[3]],
    priority: "critica",
    score: 94,
    slaHours: 4,
    inStageHours: 20,
    nextAction: { label: "Aprovação financeira", date: "Hoje 16:00" },
    lastInteraction: "E-mail · 2h",
    products: [{ name: "Plano Enterprise", price: 1499 }, { name: "Recorrência", price: 199 }],
  },
  {
    id: "d12",
    name: "Beatriz Camargo",
    company: "Camargo Eventos",
    segment: "Eventos",
    contact: { email: "bia@camargoeventos.com", phone: "+55 11 99554-2233", whatsapp: "+55 11 99554-2233" },
    value: 15200,
    probability: 40,
    stage: "qualificado",
    owner: owners[4],
    origin: "Indicação",
    tags: [tagBank[2], tagBank[6]],
    priority: "media",
    score: 70,
    slaHours: 14,
    inStageHours: 22,
    nextAction: { label: "Reagendar demo", date: "Sex 10:00" },
    lastInteraction: "WhatsApp · 1d",
    products: [{ name: "Plano Pro", price: 349 }],
  },
];

export const DEALS: Deal[] = seed.map((d) => ({
  ...d,
  timeline: makeTimeline(d.name),
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
}));

export const REVENUE_SERIES = [
  { m: "Jan", revenue: 142, meta: 160 },
  { m: "Fev", revenue: 158, meta: 170 },
  { m: "Mar", revenue: 181, meta: 175 },
  { m: "Abr", revenue: 196, meta: 185 },
  { m: "Mai", revenue: 224, meta: 200 },
  { m: "Jun", revenue: 248, meta: 220 },
  { m: "Jul", revenue: 278, meta: 240 },
  { m: "Ago", revenue: 312, meta: 260 },
  { m: "Set", revenue: 341, meta: 290 },
  { m: "Out", revenue: 368, meta: 320 },
  { m: "Nov", revenue: 402, meta: 350 },
  { m: "Dez", revenue: 446, meta: 400 },
];

export const ORIGIN_DATA = [
  { name: "Inbound", value: 38, fill: "#22d3ee" },
  { name: "Outbound", value: 24, fill: "#3b5cff" },
  { name: "Indicação", value: 19, fill: "#8eadff" },
  { name: "Eventos", value: 11, fill: "#67e8f9" },
  { name: "Paid Ads", value: 8, fill: "#1d2da3" },
];

export const RANKING = [
  { name: "Mariana Alves", deals: 38, revenue: 412000, win: 42, tone: "from-cyan-400 to-royal-600" },
  { name: "Rafael Souza", deals: 31, revenue: 358000, win: 38, tone: "from-violet-400 to-royal-600" },
  { name: "Diego Lima", deals: 27, revenue: 296000, win: 33, tone: "from-amber-400 to-rose-600" },
  { name: "Carla Mendes", deals: 24, revenue: 248000, win: 30, tone: "from-emerald-400 to-cyan-600" },
  { name: "Bruna Castro", deals: 21, revenue: 211000, win: 27, tone: "from-rose-400 to-violet-600" },
];

export const TASKS = [
  { id: "tk1", title: "Ligar para Eduardo Prates", priority: "critica", due: "Hoje 18:00", deal: "Logística Norte SA", done: false },
  { id: "tk2", title: "Enviar proposta para Sofia Tavares", priority: "alta", due: "Hoje 16:30", deal: "Studio Pilates Move", done: false },
  { id: "tk3", title: "Follow-up de proposta — Tiago", priority: "media", due: "Amanhã 10:00", deal: "BernardesTech", done: false },
  { id: "tk4", title: "Revisar contrato Vidal", priority: "alta", due: "Hoje 11:00", deal: "Vidal Advogados", done: true },
  { id: "tk5", title: "Reunião kickoff — EcoVerde", priority: "media", due: "Sex 14:00", deal: "EcoVerde Cosméticos", done: false },
  { id: "tk6", title: "Onboarding Freitas", priority: "baixa", due: "Seg 09:00", deal: "Freitas Contabilidade", done: false },
];

export const AUTOMATIONS = [
  {
    id: "a1",
    name: "Boas-vindas para novos leads",
    trigger: "Lead entra em 'Novos leads'",
    actions: ["Enviar WhatsApp template", "Criar tarefa de qualificação", "Atribuir SDR"],
    runs: 1284,
    active: true,
  },
  {
    id: "a2",
    name: "Resgate de leads parados",
    trigger: "Card parado > 5 dias",
    actions: ["Notificar responsável", "Enviar e-mail de retomada", "Alterar prioridade para alta"],
    runs: 412,
    active: true,
  },
  {
    id: "a3",
    name: "Onboarding pós-venda",
    trigger: "Negócio movido para 'Ganho'",
    actions: ["Criar conta", "Agendar reunião kickoff", "Notificar CS"],
    runs: 88,
    active: true,
  },
  {
    id: "a4",
    name: "Resumo IA semanal",
    trigger: "Toda segunda-feira 08:00",
    actions: ["Gerar resumo das negociações", "Sugerir próximas ações", "Enviar e-mail ao gestor"],
    runs: 24,
    active: false,
  },
];

export const CONVERSATIONS = [
  {
    id: "c1",
    name: "Eduardo Prates",
    company: "Logística Norte SA",
    last: "Pode enviar a proposta revisada?",
    time: "2min",
    unread: 2,
    online: true,
  },
  { id: "c2", name: "Patricia Nogueira", company: "Clínica Vitalis", last: "Perfeito, agendamos para 9h.", time: "14min", unread: 0, online: true },
  { id: "c3", name: "Lucas Andrade", company: "Padaria Boulangerie", last: "Vou conversar com meu sócio.", time: "1h", unread: 0, online: false },
  { id: "c4", name: "Sofia Tavares", company: "Studio Pilates Move", last: "Adorei a demo 🙌", time: "3h", unread: 1, online: false },
  { id: "c5", name: "Marcela Reis", company: "EcoVerde Cosméticos", last: "Contrato assinado!", time: "6h", unread: 0, online: false },
];

export const MESSAGES = [
  { from: "them", text: "Oi, boa tarde! Recebi a proposta, obrigado.", at: "14:02" },
  { from: "me", text: "Boa tarde, Eduardo! Conseguiu validar com o time?", at: "14:04" },
  { from: "them", text: "Sim, mas tivemos uma dúvida sobre o módulo de integração com ERP.", at: "14:06" },
  { from: "me", text: "Posso te enviar um overview técnico em 5min, ok?", at: "14:07" },
  { from: "them", text: "Perfeito 👌", at: "14:07" },
  { from: "me", text: "Aqui está o material: integração nativa com Bling, Omie e SAP. Quer marcar uma call com nosso especialista?", at: "14:18" },
  { from: "them", text: "Pode enviar a proposta revisada?", at: "14:42" },
];
