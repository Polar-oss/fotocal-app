import Link from "next/link";
import { Brand } from "@/components/brand";
import { FaqGrid } from "@/components/faq-grid";
import { PricingGrid } from "@/components/pricing-grid";
import { SectionHeading } from "@/components/section-heading";
import { getAuthContext } from "@/lib/auth";
import { hasStripeEnv } from "@/lib/stripe";

type PricingPageProps = {
  searchParams: Promise<{
    checkout?: string;
    detail?: string;
  }>;
};

function getCheckoutNotice(checkout?: string, detail?: string) {
  const normalizedDetail = detail?.trim();

  switch (checkout) {
    case "cancelled":
      return "O checkout foi cancelado. Seus planos continuam disponiveis para voce tentar novamente.";
    case "checkout-disabled":
      return "O Stripe ainda nao liberou o checkout dessa conta. Revise as configuracoes de checkout no painel e tente novamente.";
    case "invalid-key":
      return "A chave secreta do Stripe publicada na Vercel parece invalida. Assim que ela for atualizada, os botoes voltam a abrir o pagamento.";
    case "invalid-permission":
      return "A chave do Stripe nao tem permissao suficiente para criar o checkout. Revise as chaves publicadas na Vercel e tente novamente.";
    case "missing-price":
      return "O Stripe ainda nao encontrou todos os precos do FotoCal Premium. Revise o catalogo e tente novamente.";
    case "unavailable":
      return "As chaves do Stripe ainda nao foram adicionadas ao app. Assim que isso entrar, o checkout fica liberado.";
    case "error":
      return normalizedDetail
        ? `Nao foi possivel abrir o checkout agora. Detalhe tecnico: ${normalizedDetail}`
        : "Nao foi possivel abrir o checkout agora. Tente novamente em alguns segundos.";
    default:
      return null;
  }
}

export default async function PricingPage({ searchParams }: PricingPageProps) {
  const auth = await getAuthContext();
  const params = await searchParams;
  const checkoutNotice = getCheckoutNotice(params.checkout, params.detail);
  const signUpHref = "/sign-up?next=/pricing";
  const primaryHref = auth.isAuthenticated ? "/app" : signUpHref;
  const primaryLabel = auth.isAuthenticated ? "Abrir meu app" : "Comecar por R$ 12";
  const checkoutEnabled = auth.isAuthenticated && hasStripeEnv();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_24%),linear-gradient(180deg,_#020202_0%,_#060606_60%,_#0b0b0b_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <Brand />
          <Link
            href="/"
            className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
          >
            Voltar
          </Link>
        </div>

        {checkoutNotice ? (
          <section className="rounded-[1.5rem] border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-sm leading-7 text-amber-50">
            {checkoutNotice}
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
          <div className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200">
            planos flexiveis
          </div>
          <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.06em]">
            Escolha entre mensal, trimestral, semestral ou anual e pague menos
            conforme a constancia cresce.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">
            O FotoCal foi pensado para caber em momentos diferentes da rotina.
            Voce pode entrar com o mensal ou travar um valor menor por mes
            escolhendo os ciclos com desconto.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              {primaryLabel}
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
            >
              Ver o app por dentro
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur sm:px-8">
          <SectionHeading
            eyebrow="Escolha seu plano"
            title="Planos para comecar agora e economizar mais com constancia."
            description="Todos os ciclos incluem analise por foto, resumo diario, meta calorica personalizada e historico completo. O que muda e o valor por mes."
          />

          <div className="mt-8">
            <PricingGrid ctaHref={signUpHref} enableCheckout={checkoutEnabled} />
          </div>

          <p className="mt-5 text-center text-sm leading-7 text-white/48">
            Quanto maior o periodo, maior o desconto. O anual entrega o menor
            valor por mes para quem quer cuidar da rotina por mais tempo.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-300">
              Mensal
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              Entre sem pesar no bolso.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              O plano mensal e o jeito mais simples de conhecer o FotoCal e ver
              se a experiencia encaixa no seu dia a dia.
            </p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-300">
              Semestral
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              Ganhe ritmo sem pensar todo mes.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              O semestral ajuda quem quer criar habito e ainda reduzir bem o
              valor mensal comparado ao plano de entrada.
            </p>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-emerald-300">
              Anual
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
              Economize mais e mantenha a consistencia.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/62">
              Para quem ja sabe que quer acompanhar a alimentacao com mais
              clareza, o anual entrega o melhor custo mensal.
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 py-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)] sm:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Respostas para quem esta comparando antes de decidir."
            description="Tire as duvidas mais comuns antes de escolher o seu ciclo."
          />

          <div className="mt-8">
            <FaqGrid />
          </div>
        </section>
      </div>
    </main>
  );
}
