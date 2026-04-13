import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { SetupNotice } from "@/components/setup-notice";
import { SignInForm } from "@/components/sign-in-form";
import { getAuthContext } from "@/lib/auth";
import { normalizeAppPath } from "@/lib/routing";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

function getQueryFeedback(error?: string) {
  if (error === "confirmacao") {
    return "Nao foi possivel confirmar o email automaticamente. Tente entrar de novo ou solicite um novo link no Supabase.";
  }

  if (error === "configuracao") {
    return "O link de confirmacao chegou antes da configuracao do Supabase estar pronta no ambiente.";
  }

  return "";
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const auth = await getAuthContext();

  if (auth.isAuthenticated) {
    redirect("/app");
  }

  const params = await searchParams;
  const nextPath = normalizeAppPath(params.next, "/app");
  const queryFeedback = getQueryFeedback(params.error);

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

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <aside className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
              Entrar no app
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
              Volte para o seu resumo diario em segundos.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
              Entre para revisar sua meta, registrar novas refeicoes e consultar
              o historico do dia sem perder o ritmo.
            </p>
            <ul className="mt-8 space-y-3 text-sm leading-7 text-white/75">
              <li>meta calorica salva por usuario</li>
              <li>dashboard pessoal</li>
              <li>registro com foto ou preenchimento manual</li>
            </ul>
          </aside>

          <div className="grid gap-4">
            {queryFeedback ? (
              <div className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-50">
                {queryFeedback}
              </div>
            ) : null}
            {!auth.isConfigured ? (
              <SetupNotice description="A tela de login ja esta conectada ao fluxo real do app. Falta apenas adicionar as chaves do Supabase no arquivo .env.local para ativar a sessao." />
            ) : null}
            <SignInForm nextPath={nextPath} />
            <div className="flex justify-start">
              <Link
                href={`/sign-up?next=${encodeURIComponent(nextPath)}`}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:border-slate-400"
              >
                Criar conta
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
