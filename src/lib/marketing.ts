export type PricingPlan = {
  badge?: string;
  billingLabel: string;
  compareAt?: string;
  cta: string;
  description: string;
  discountLabel?: string;
  featured?: boolean;
  monthlyPrice: string;
  name: string;
  note?: string;
  perks: string[];
  slug: "mensal" | "trimestral" | "semestral" | "anual";
};

export const pricingPlans: PricingPlan[] = [
  {
    billingLabel: "R$ 12 cobrados mes a mes",
    cta: "Assinar mensal",
    description: "Ideal para comecar agora e sentir o app na sua rotina.",
    monthlyPrice: "R$ 12",
    name: "Plano Mensal",
    perks: [
      "analises por foto ilimitadas",
      "calorias e macros em segundos",
      "resumo diario com total e media",
      "meta calorica personalizada",
      "historico completo e circulo opcional",
    ],
    slug: "mensal",
  },
  {
    badge: "10% OFF",
    billingLabel: "R$ 32,40 cobrados a cada 3 meses",
    compareAt: "R$ 12",
    cta: "Escolher trimestral",
    description:
      "Bom para ganhar consistencia sem precisar ir direto para um ciclo longo.",
    discountLabel: "economize 10%",
    monthlyPrice: "R$ 10,80",
    name: "Plano Trimestral",
    note: "Economia de R$ 3,60 no periodo",
    perks: [
      "analises por foto ilimitadas",
      "calorias e macros em segundos",
      "resumo diario com total e media",
      "meta calorica personalizada",
      "historico completo e circulo opcional",
    ],
    slug: "trimestral",
  },
  {
    badge: "20% OFF",
    billingLabel: "R$ 57,60 cobrados a cada 6 meses",
    compareAt: "R$ 12",
    cta: "Escolher semestral",
    description:
      "Perfeito para transformar repeticao em habito sem pagar todo mes.",
    discountLabel: "economize 20%",
    monthlyPrice: "R$ 9,60",
    name: "Plano Semestral",
    note: "Economia de R$ 14,40 no periodo",
    perks: [
      "analises por foto ilimitadas",
      "calorias e macros em segundos",
      "resumo diario com total e media",
      "meta calorica personalizada",
      "historico completo e circulo opcional",
    ],
    slug: "semestral",
  },
  {
    badge: "MAIS POPULAR",
    billingLabel: "R$ 100,80 cobrados uma vez por ano",
    compareAt: "R$ 12",
    cta: "Quero economizar 30%",
    description:
      "Melhor custo mensal para quem quer acompanhar a alimentacao o ano inteiro.",
    discountLabel: "economize 30%",
    featured: true,
    monthlyPrice: "R$ 8,40",
    name: "Plano Anual",
    note: "Economia de R$ 43,20 no periodo",
    perks: [
      "analises por foto ilimitadas",
      "calorias e macros em segundos",
      "resumo diario com total e media",
      "meta calorica personalizada",
      "historico completo e circulo opcional",
      "acesso prioritario a novidades do FotoCal",
    ],
    slug: "anual",
  },
];

export const comparisonLists = {
  fotoCal: [
    "tirar uma foto e receber calorias e macros em segundos",
    "acompanhar total do dia sem planilha nem conta manual",
    "editar calorias e nome do prato quando quiser",
    "ver meta, historico, progresso e orientacao em poucos toques",
  ],
  manual: [
    "pesar alimentos e chutar porcao o tempo todo",
    "abrir varios apps para registrar uma unica refeicao",
    "anotar calorias manualmente e perder tempo",
    "desistir porque o processo ficou cansativo demais",
  ],
};

export const featureSteps = [
  {
    text:
      "Use a camera ou a galeria. Com boa luz e o prato inteiro na imagem, a leitura costuma ficar muito melhor.",
    title: "Tire a foto",
  },
  {
    text:
      "A IA sugere nome da refeicao, calorias e macros em segundos, sem obrigar voce a preencher tudo do zero.",
    title: "Receba a analise",
  },
  {
    text:
      "Veja total do dia, media por refeicao, meta restante e sugestoes simples sem transformar alimentacao em uma tarefa pesada.",
    title: "Acompanhe o dia",
  },
];

export const faqItems = [
  {
    answer:
      "Sim. A conta gratuita deixa voce testar 3 analises por foto por dia. Quando esse limite acaba, voce ainda pode registrar manualmente ou assinar um plano premium para liberar uso ilimitado.",
    question: "Quantas analises gratis eu tenho por dia?",
  },
  {
    answer:
      "A leitura por foto e uma estimativa inteligente, nao um laudo. O FotoCal acelera o processo e voce continua no controle para ajustar calorias, nome do prato e observacoes antes de salvar.",
    question: "A analise por foto e 100% precisa?",
  },
  {
    answer:
      "Nao. Todos os planos podem ser usados normalmente sem adicionar amigos. O circulo existe apenas para quem gosta de compartilhar algumas refeicoes.",
    question: "Preciso usar a parte social do app?",
  },
  {
    answer:
      "Apps gratis costumam transferir o trabalho para voce: buscar alimento, estimar porcao e digitar tudo manualmente. O FotoCal existe para reduzir essa friccao com foto, estimativa, macros, resumo e historico no mesmo lugar.",
    question: "Por que pagar se existem apps gratis?",
  },
  {
    answer:
      "O mensal deixa voce livre para interromper quando quiser. Nos ciclos trimestral, semestral e anual, o valor por mes fica menor porque o compromisso no periodo escolhido e maior.",
    question: "Como funcionam os ciclos e descontos?",
  },
  {
    answer:
      "Sim. Para que a IA analise a foto e devolva a estimativa com rapidez, o app precisa de conexao com a internet no momento da leitura.",
    question: "Preciso de internet para analisar a refeicao?",
  },
];
