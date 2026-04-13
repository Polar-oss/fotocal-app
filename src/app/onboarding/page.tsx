import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { GoalForm } from "@/components/goal-form";
import { SetupNotice } from "@/components/setup-notice";
import { getAuthContext } from "@/lib/auth";

export default async function OnboardingPage() {
  const auth = await getAuthContext();

  if (auth.isConfigured && !auth.isAuthenticated) {
    redirect("/sign-in?next=/onboarding");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/sign-up"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Voltar
          </Link>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur lg:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
            Onboarding
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
            Defina a sua meta diaria para deixar o resumo mais util.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/65">
            Esse numero ajuda o FotoCal a mostrar total, media e meta restante
            com mais contexto. Voce pode ajustar depois quando quiser.
          </p>

          {!auth.isConfigured ? (
            <div className="mt-8">
              <SetupNotice description="A experiencia do onboarding ja esta pronta. Assim que o Supabase for configurado, esta meta passa a ser salva na conta do usuario." />
            </div>
          ) : null}

          <GoalForm initialGoal={auth.calorieGoal ?? 2000} />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Pular por enquanto
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
