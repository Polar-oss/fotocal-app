import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { FREE_AI_ANALYSES_PER_DAY } from "@/lib/ai/limits";
import { InstallAppCard } from "@/components/install-app-card";
import { MealTracker } from "@/components/meal-tracker";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SetupNotice } from "@/components/setup-notice";
import { SignOutButton } from "@/components/sign-out-button";
import { hasAiEnv } from "@/lib/ai/env";
import { getAuthContext } from "@/lib/auth";
import { getTrackerBootstrap } from "@/lib/fotocal/server";
import {
  getObjectiveDescription,
  getObjectiveLabel,
} from "@/lib/profile";
import { getSubscriptionStatusLabel } from "@/lib/subscriptions";

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

function getCurrentStreak(dates: string[]) {
  const uniqueDates = Array.from(new Set(dates)).sort((left, right) =>
    right.localeCompare(left),
  );

  if (!uniqueDates.length) {
    return 0;
  }

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const current = cursor.toISOString().slice(0, 10);

    if (!uniqueDates.includes(current)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
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
  const streak = getCurrentStreak(tracker.meals.map((meal) => meal.loggedDate));
  const objectiveLabel = getObjectiveLabel(auth.profile.objective) ?? "Definir objetivo";
  const objectiveNote = getObjectiveDescription(auth.profile.objective);
  const subscriptionLabel = auth.subscription?.isActive
    ? auth.subscription.planLabel ?? "Premium ativo"
    : "Sem premium";
  const subscriptionNote = auth.subscription?.isActive
    ? auth.subscription.currentPeriodEnd
      ? `status ${getSubscriptionStatusLabel(auth.subscription.status)} ate ${new Date(
          auth.subscription.currentPeriodEnd,
        ).toLocaleDateString("pt-BR")}`
      : `status ${getSubscriptionStatusLabel(auth.subscription.status)}`
    : "ative um plano para acompanhar a assinatura dentro do app";
  const aiUsageLabel = auth.aiUsage.isPremium
    ? "Ilimitadas"
    : `${auth.aiUsage.remainingToday ?? 0} restantes`;
  const aiUsageNote = auth.aiUsage.isPremium
      ? "sua assinatura premium libera analises por foto sem limite diario"
      : auth.aiUsage.reachedLimit
        ? "voce usou as 3 analises gratis de hoje; o premium libera uso ilimitado"
        : `${auth.aiUsage.usedToday} de ${FREE_AI_ANALYSES_PER_DAY} analises gratis usadas hoje`;
  const upgradeHref = auth.aiUsage.reachedLimit
    ? "/pricing?source=ai-limit"
    : "/pricing?source=free";
  const showUpgradeCallout = !auth.subscription?.isActive;

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
      title: "Objetivo",
      value: objectiveLabel,
      note: objectiveNote,
    },
    {
      title: "Streak",
      value: streak ? `${streak} dias` : "Comece hoje",
      note: streak
        ? "dias seguidos registrando a rotina no app"
        : "sua primeira refeicao de hoje ja liga a sequencia",
    },
    {
      title: "IA por foto",
      value: hasAiEnv ? "Ativa" : "Manual",
      note: hasAiEnv
        ? "a foto sugere calorias, macros e um proximo passo"
        : "o app continua funcionando no preenchimento manual",
    },
    {
      title: "Analises IA",
      value: aiUsageLabel,
      note: aiUsageNote,
    },
    {
      title: "Circulo",
      value: tracker.friends.length ? `${tracker.friends.length} amigos` : "So voce",
      note: tracker.friends.length
        ? "compartilhe apenas o que fizer sentido para voce"
        : "o social e opcional, o app funciona muito bem sozinho",
    },
    {
      title: "Assinatura",
      value: subscriptionLabel,
      note: subscriptionNote,
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.15),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 pt-6 pb-32 sm:px-6 sm:pb-6 lg:px-8">
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

        <section
          id="inicio-app"
          className="grid scroll-mt-28 gap-6 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="rounded-[2rem] border border-white/60 bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(27,46,40,0.14)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
              Seu dia no FotoCal
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              Bom te ver, {auth.displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              Registre refeicoes, revise a estimativa da foto e acompanhe o dia
              com mais contexto. O foco aqui e clareza para decidir melhor, nao
              perfeicao matematica.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {calorieGoal ? `Meta ${goalLabel}` : "Defina sua meta"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {objectiveLabel}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {hasAiEnv ? "IA ativa" : "Registro manual ativo"}
              </span>
              <span className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white/85">
                {tracker.persistenceMode === "supabase"
                  ? "Historico sincronizado"
                  : "Salvando neste navegador"}
              </span>
              {auth.subscription?.isActive ? (
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-100">
                  {auth.subscription.planLabel ?? "Premium ativo"}
                </span>
              ) : null}
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

        {showUpgradeCallout ? (
          <section className="rounded-[2rem] border border-amber-400/18 bg-[linear-gradient(135deg,rgba(245,158,11,0.14),rgba(16,185,129,0.12))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-amber-200">
                  Upgrade inteligente
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                  {auth.aiUsage.reachedLimit
                    ? "Seu limite gratis de hoje acabou. O premium libera a IA sem travar no meio da rotina."
                    : "Voce ja esta usando o melhor do FotoCal. O premium entra para deixar a experiencia sem limite."}
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/72">
                  {auth.aiUsage.reachedLimit
                    ? "Com a conta premium, a foto continua fluindo mesmo quando voce registra varias refeicoes no mesmo dia."
                    : "Enquanto o gratis deixa voce testar 3 analises por dia, os planos premium liberam uso ilimitado e deixam a rotina mais leve para quem quer consistencia."}
                </p>
              </div>

              <div className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 sm:min-w-[280px]">
                <div className="flex items-center justify-between gap-3 text-sm text-white/68">
                  <span>Analises de hoje</span>
                  <strong className="text-white">
                    {auth.aiUsage.isPremium
                      ? "ilimitadas"
                      : `${auth.aiUsage.usedToday}/${FREE_AI_ANALYSES_PER_DAY}`}
                  </strong>
                </div>
                {!auth.aiUsage.isPremium ? (
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        auth.aiUsage.reachedLimit ? "bg-amber-300" : "bg-emerald-400"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            8,
                            (auth.aiUsage.usedToday / FREE_AI_ANALYSES_PER_DAY) * 100,
                          ),
                        )}%`,
                      }}
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={upgradeHref}
                    className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-amber-50"
                  >
                    Ver premium
                  </Link>
                  <Link
                    href="/pricing?source=annual"
                    className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.08]"
                  >
                    Melhor oferta
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <InstallAppCard />

        <MealTracker
          aiUsage={auth.aiUsage}
          calorieGoal={calorieGoal}
          isAiEnabled={hasAiEnv}
          initialFriends={tracker.friends}
          initialMeals={tracker.meals}
          persistenceMode={tracker.persistenceMode}
          statusMessage={tracker.notice}
          storageNamespace={auth.user?.id ?? "guest"}
          userObjective={auth.profile.objective}
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
      <MobileBottomNav />
    </main>
  );
}
