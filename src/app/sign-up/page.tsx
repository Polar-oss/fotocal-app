import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SetupNotice } from "@/components/setup-notice";
import { SignUpForm } from "@/components/sign-up-form";
import { getAuthContext } from "@/lib/auth";
import { normalizeAppPath } from "@/lib/routing";

type SignUpPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const auth = await getAuthContext();

  if (auth.isAuthenticated) {
    redirect("/app");
  }

  const params = await searchParams;
  const nextPath = normalizeAppPath(params.next, "/onboarding");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Voltar
          </Link>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="grid gap-4">
            {!auth.isConfigured ? (
              <SetupNotice description="O fluxo de cadastro real ja foi ligado ao app, mas ainda falta colocar as chaves do Supabase. Assim que isso entrar no .env.local, esta tela passa a criar conta de verdade." />
            ) : null}
            <SignUpForm nextPath={nextPath} />
            <div className="flex justify-start">
              <Link
                href={`/sign-in?next=${encodeURIComponent(nextPath)}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-400"
              >
                Ja tenho conta
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
              Como comeca
            </p>
            <div className="mt-6 grid gap-4">
              <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <strong className="block text-lg">1. Definir meta</strong>
                <span className="mt-2 block text-sm leading-7 text-white/75">
                  O onboarding ajusta o app para o seu ritmo logo no primeiro acesso.
                </span>
              </article>
              <article className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
                <strong className="block text-lg">2. Entrar no dashboard</strong>
                <span className="mt-2 block text-sm leading-7 text-white/75">
                  Voce entra num app limpo, com resumo diario e espaco para novas refeicoes.
                </span>
              </article>
              <article className="rounded-[1.5rem] border border-emerald-400/30 bg-emerald-400/10 p-5">
                <strong className="block text-lg">3. Registrar a primeira refeicao</strong>
                <span className="mt-2 block text-sm leading-7 text-white/75">
                  Envie uma foto ou preencha manualmente para comecar o seu historico.
                </span>
              </article>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
