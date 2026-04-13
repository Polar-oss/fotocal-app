import Link from "next/link";
import { Brand } from "@/components/brand";
import { getAuthContext } from "@/lib/auth";
import {
  getPlanLabel,
  getSubscriptionStatusLabel,
} from "@/lib/subscriptions";
import { syncSubscriptionFromCheckoutSession } from "@/lib/subscriptions/server";
import { getCheckoutSession } from "@/lib/stripe";

type PricingSuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PricingSuccessPage({
  searchParams,
}: PricingSuccessPageProps) {
  const auth = await getAuthContext();
  const params = await searchParams;
  const sessionId = params.session_id;
  const session = sessionId
    ? await getCheckoutSession(sessionId).catch(() => null)
    : null;
  const syncedSubscription =
    session && auth.user
      ? await syncSubscriptionFromCheckoutSession({
          session,
          userId: auth.user.id,
        }).catch(() => null)
      : null;
  const subscription =
    session?.subscription && typeof session.subscription === "object"
      ? session.subscription
      : null;
  const subscriptionStatus = getSubscriptionStatusLabel(
    syncedSubscription?.status ?? subscription?.status,
  );
  const planLabel =
    syncedSubscription?.planLabel ??
    getPlanLabel(session?.metadata?.plan_slug ?? subscription?.metadata?.plan_slug);
  const syncedPeriodLabel = syncedSubscription?.currentPeriodEnd
    ? new Date(syncedSubscription.currentPeriodEnd).toLocaleDateString("pt-BR")
    : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/app"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Ir para o app
          </Link>
        </div>

        <section className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-200">
            Assinatura confirmada
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
            Seu checkout foi concluido com sucesso.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
            O FotoCal ja reconheceu a sua assinatura e o seu acesso premium foi
            vinculado a esta conta.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-sm font-medium text-white/60">Email usado</p>
            <strong className="mt-3 block text-2xl tracking-tight text-white">
              {session?.customer_email ?? "Email confirmado no checkout"}
            </strong>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-sm font-medium text-white/60">Status atual</p>
            <strong className="mt-3 block text-2xl tracking-tight text-white">
              {subscriptionStatus}
            </strong>
          </article>

          <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-sm font-medium text-white/60">Plano atual</p>
            <strong className="mt-3 block text-2xl tracking-tight text-white">
              {planLabel ?? "Plano confirmado"}
            </strong>
            {syncedPeriodLabel ? (
              <span className="mt-3 block text-sm leading-7 text-white/62">
                Ciclo atual ate {syncedPeriodLabel}
              </span>
            ) : null}
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
          <h2 className="text-2xl font-semibold tracking-[-0.04em]">
            Proximo passo
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
            Volte para o app, registre sua proxima refeicao e acompanhe seu dia
            com a conta premium ja ativa.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Abrir FotoCal
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Ver planos novamente
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
