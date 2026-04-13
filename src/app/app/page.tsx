import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { InstallAppCard } from "@/components/install-app-card";
import { MealTracker } from "@/components/meal-tracker";
import { SetupNotice } from "@/components/setup-notice";
import { SignOutButton } from "@/components/sign-out-button";
import { hasAiEnv } from "@/lib/ai/env";
import { getAuthContext } from "@/lib/auth";
import { getTrackerBootstrap } from "@/lib/fotocal/server";

type AppPageProps = {
  searchParams: Promise<{
    goal?: string;
  }>;
};

function getGoalOverride(rawValue?: string) {
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed;
}

export default async function AppPage({ searchParams }: AppPageProps) {
  const auth = await getAuthContext();
  const params = await searchParams;

  if (auth.isConfigured && !auth.isAuthenticated) {
    redirect("/sign-in?next=/app");
  }

  const calorieGoal = getGoalOverride(params.goal) ?? auth.calorieGoal;
  const goalLabel = calorieGoal
    ? `${calorieGoal.toLocaleString("pt-BR")} kcal`
    : "Ainda nao definida";
  const tracker = await getTrackerBootstrap(auth.user?.id ?? null);
  const today = new Date().toISOString().slice(0, 10);
  const todayMealsCount = tracker.meals.filter((meal) => meal.loggedDate === today).length;

  const cards = [
    {
      title: "Meta do dia",
      value: goalLabel,
      note: auth.calorieGoal
        ? "use esse numero como guia, nao como pressao"
        : "defina uma meta para deixar o resumo mais util",
    },
    {
      title: "Hoje",
      value: `${todayMealsCount} refeicoes`,
      note:
        todayMealsCount > 0
          ? "seu diario ja esta sendo montado refeicao por refeicao"
          : "sua primeira refeicao do dia ja libera o resumo automaticamente",
    },
    {
      title: "IA por foto",
      value: hasAiEnv ? "Ativa" : "Manual",
      note: hasAiEnv
        ? "a foto sugere nome e calorias antes de voce salvar"
        : "o app continua funcionando no preenchimento manual",
    },
    {
      title: "Circulo",
      value: tracker.friends.length ? `${tracker.friends.length} amigos` : "So voce",
      note: tracker.friends.length
        ? "compartilhe apenas o que fizer sentido para voce"
        : "o social e opcional, o app funciona muito bem sozinho",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/onboarding"
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Meta
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              Assinatura
            </Link>
            <SignOutButton className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-500" />
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/60 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(27,46,40,0.14)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
              Seu dia no FotoCal
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              Bom te ver, {auth.displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              Registre refeicoes, revise a estimativa da foto e acompanhe o dia
              sem perder tempo com telas demais. O foco aqui e clareza, nao
              perfeicao matematica.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {calorieGoal ? `Meta ${goalLabel}` : "Defina sua meta"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {hasAiEnv ? "IA ativa" : "Registro manual ativo"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {tracker.persistenceMode === "supabase"
                  ? "Historico sincronizado"
                  : "Salvando neste navegador"}
              </span>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/10 p-5">
              <p className="text-sm leading-7 text-white/80">
                Dica pratica: fotos com boa luz, prato inteiro e pouco zoom
                costumam gerar estimativas mais uteis.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card) => (
              <article
                key={card.title}
                className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur"
              >
                <p className="text-sm font-medium text-white/55">{card.title}</p>
                <strong className="mt-3 block text-3xl tracking-tight text-white">
                  {card.value}
                </strong>
                <span className="mt-3 block text-sm leading-7 text-white/62">
                  {card.note}
                </span>
              </article>
            ))}
          </div>
        </section>

        {!auth.isConfigured ? (
          <SetupNotice description="O dashboard ja esta preparado para usuario logado, mas ainda falta adicionar as chaves do Supabase em .env.local para ativar a sessao real." />
        ) : null}

        {tracker.notice ? <SetupNotice description={tracker.notice} /> : null}

        <InstallAppCard />

        <MealTracker
          calorieGoal={calorieGoal}
          isAiEnabled={hasAiEnv}
          initialFriends={tracker.friends}
          initialMeals={tracker.meals}
          persistenceMode={tracker.persistenceMode}
          statusMessage={tracker.notice}
          storageNamespace={auth.user?.id ?? "guest"}
        />

        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-700">
              Fotos melhores
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              Como ajudar a IA a ler sua refeicao com mais confianca
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <strong className="block text-white">Boa luz</strong>
                <span className="mt-2 block text-sm leading-7 text-white/62">
                  evite sombra pesada e foto escura para a imagem ficar legivel
                </span>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <strong className="block text-white">Prato inteiro</strong>
                <span className="mt-2 block text-sm leading-7 text-white/62">
                  mostrar todos os itens ajuda a IA a nao esquecer acompanhamentos
                </span>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <strong className="block text-white">Revise sempre</strong>
                <span className="mt-2 block text-sm leading-7 text-white/62">
                  a estimativa e um ponto de partida, nao um diagnostico final
                </span>
              </article>
            </div>
          </article>

          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-700">
              Rotina inteligente
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
              O app fica melhor quando voce usa pouco, mas usa sempre.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Use a foto quando ela ajudar, edite o que for necessario e olhe o
              resumo do dia como bussola. O valor do FotoCal vem dessa repeticao
              leve.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/onboarding"
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Ajustar onboarding
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
              >
                Voltar para a landing
              </Link>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
