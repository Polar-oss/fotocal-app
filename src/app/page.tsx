import Link from "next/link";
import { Brand } from "@/components/brand";
import { FaqGrid } from "@/components/faq-grid";
import { InstallAppCard } from "@/components/install-app-card";
import { PricingGrid } from "@/components/pricing-grid";
import { SectionHeading } from "@/components/section-heading";
import { SetupNotice } from "@/components/setup-notice";
import { SiteHeader } from "@/components/site-header";
import { getAuthContext } from "@/lib/auth";
import { hasStripeEnv } from "@/lib/stripe";
import {
  comparisonLists,
  featureSteps,
} from "@/lib/marketing";

export default async function Home() {
  const auth = await getAuthContext();
  const primaryHref = auth.isAuthenticated ? "/app" : "/sign-up";
  const pricingEntryHref = auth.isAuthenticated ? "/pricing" : "/sign-up?next=/pricing";
  const checkoutEnabled = auth.isAuthenticated && hasStripeEnv();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_24%),radial-gradient(circle_at_82%_12%,_rgba(245,158,11,0.12),_transparent_20%),linear-gradient(180deg,_#020202_0%,_#060606_55%,_#0b0b0b_100%)]">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-10">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.48)] backdrop-blur lg:p-10">
            <div className="inline-flex rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-200">
              assistente inteligente de alimentacao
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-white sm:text-5xl lg:text-7xl">
              Tire a foto da refeicao e deixe o FotoCal orientar o proximo passo.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 sm:text-lg">
              Receba calorias, macros e uma leitura simples do seu dia em
              segundos. O FotoCal foi feito para ajudar voce a decidir melhor,
              nao para te prender em conta manual.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-100/82 sm:text-base">
              Comece gratis com 3 analises por dia. Quando quiser uso
              ilimitado e uma rotina sem travas, o premium entra com os ciclos
              pagos.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800"
              >
                Comecar por R$ 12
              </Link>
              <Link
                href="/#planos"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]"
              >
                Ver planos
              </Link>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3" id="recursos">
              <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <strong className="block text-lg text-white">Foto + macros</strong>
                <span className="text-sm leading-6 text-white/58">
                  a IA sugere calorias, proteina, carboidrato e gordura
                </span>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <strong className="block text-lg text-white">Resumo diario</strong>
                <span className="text-sm leading-6 text-white/58">
                  total, progresso e recomendacao aparecem no mesmo lugar
                </span>
              </article>
              <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <strong className="block text-lg text-white">Objetivo real</strong>
                <span className="text-sm leading-6 text-white/58">
                  emagrecer, manter ou ganhar massa com contexto melhor
                </span>
              </article>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)]">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-300" />
                <span className="h-3 w-3 rounded-full bg-amber-200" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <p className="text-sm text-white/70">Preview do app</p>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-white/8 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
                Dentro do app
              </p>
              <div className="mt-5 grid gap-3">
                <article className="rounded-2xl border border-white/10 bg-white/6 p-4">
                  <span className="text-sm text-white/70">Analise da refeicao</span>
                  <strong className="mt-2 block text-3xl">Bowl de frango e arroz</strong>
                  <span className="mt-3 block text-sm text-white/65">
                    540 kcal, 38g de proteina e proximo passo sugerido
                  </span>
                </article>
                <article className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <span className="text-sm text-white/70">Meta restante</span>
                    <strong className="mt-2 block text-2xl">580 kcal</strong>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 p-4">
                    <span className="text-sm text-white/70">Total do dia</span>
                    <strong className="mt-2 block text-2xl">1.420 kcal</strong>
                  </div>
                </article>
                <article className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
                  <p className="text-sm leading-7 text-white/80">
                    A experiencia funciona melhor quando a foto vem com boa luz
                    e o prato aparece inteiro.
                  </p>
                </article>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/6 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
                O que voce ganha
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80">
                {[
                  "um guia mais inteligente do que um contador simples",
                  "estimativa rapida com macros antes de registrar a refeicao",
                  "planos com economia clara para quem quer manter a rotina",
                ].map((step) => (
                  <li key={step} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <InstallAppCard compact />
            </div>
          </aside>
        </section>

        {!auth.isConfigured ? (
          <SetupNotice description="A interface do FotoCal ja esta pronta para autenticacao real. O unico passo pendente para ativar cadastro e login e adicionar as chaves do projeto Supabase ao arquivo .env.local." />
        ) : null}

        <section
          id="como-funciona"
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur sm:px-8"
        >
          <SectionHeading
            eyebrow="Como funciona"
            title="Um fluxo curto para acompanhar sua alimentacao sem cansar."
            description="Quanto menos atrito voce sente na rotina, mais facil fica manter o controle das refeicoes todos os dias."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {featureSteps.map((feature, index) => (
              <article
                key={feature.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/12 text-sm font-bold text-emerald-300">
                  0{index + 1}
                </span>
                <h2 className="mt-4 text-xl font-semibold tracking-tight text-white">
                  {feature.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/62">
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-rose-400/12 bg-rose-500/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <SectionHeading
              eyebrow="Jeito antigo"
              title="O que costuma travar quando voce faz tudo manualmente."
              description="O problema nao e so contar calorias. E transformar toda refeicao em uma pequena burocracia."
            />
            <ul className="mt-6 space-y-3 text-sm leading-7 text-white/78">
              {comparisonLists.manual.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-rose-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[2rem] border border-emerald-400/18 bg-emerald-500/[0.06] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur">
            <SectionHeading
              eyebrow="Jeito FotoCal"
              title="Uma rotina mais leve para quem quer clareza sem exagero."
              description="Voce nao precisa buscar perfeicao matematica. Precisa de um processo rapido o bastante para continuar usando."
            />

            <ul className="mt-6 space-y-3 text-sm leading-7 text-white/82">
              {comparisonLists.fotoCal.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="planos"
          className="rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur sm:px-8"
        >
          <SectionHeading
            eyebrow="Planos"
            title="Escolha o ciclo que encaixa melhor no seu bolso e na sua rotina."
            description="Voce pode testar o FotoCal gratis com 3 analises por dia. Nos planos premium, a IA fica liberada sem limite, junto com historico, meta e a rotina completa."
          />

          <div className="mt-8">
            <PricingGrid
              ctaHref={pricingEntryHref}
              enableCheckout={checkoutEnabled}
            />
          </div>

          <p className="mt-5 text-center text-sm leading-7 text-white/48">
            Quanto maior o ciclo, menor o valor por mes. O anual entrega a
            melhor economia para quem quer acompanhar a alimentacao com constancia.
          </p>
        </section>

        <section
          id="faq"
          className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 py-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)] sm:px-8"
        >
          <SectionHeading
            eyebrow="FAQ"
            title="As respostas que mais ajudam na decisao."
            description="Aqui estao as perguntas mais comuns antes de escolher um plano."
          />

          <div className="mt-8">
            <FaqGrid />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[#0b0b0b] px-6 py-8 text-white shadow-[0_24px_80px_rgba(0,0,0,0.48)] sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
                Comece agora
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.05em]">
                Abra sua conta, registre a primeira refeicao e descubra uma
                forma mais simples de acompanhar o que voce come.
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-50"
              >
                Comecar agora
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/8"
              >
                Comparar todos os planos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 pb-10 pt-2 text-sm text-white/42 sm:px-6 lg:px-8">
        <Brand compact />
        <span>FotoCal | alimentacao com mais clareza, sem planilha</span>
      </footer>
    </div>
  );
}
