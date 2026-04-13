import Link from "next/link";
import { startCheckoutAction } from "@/app/pricing/actions";
import { pricingPlans } from "@/lib/marketing";

type PricingGridProps = {
  ctaHref: string;
  enableCheckout?: boolean;
  id?: string;
};

export function PricingGrid({
  ctaHref,
  enableCheckout = false,
  id,
}: PricingGridProps) {
  return (
    <section id={id} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {pricingPlans.map((plan) => (
        <article
          key={plan.slug}
          className={`relative flex h-full flex-col rounded-[2rem] border p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur ${
            plan.featured
              ? "border-emerald-400/45 bg-emerald-500/10 text-white shadow-[0_28px_90px_rgba(16,185,129,0.16)]"
              : "border-white/10 bg-white/[0.03] text-white"
          }`}
        >
          <div className="flex min-h-7 items-start justify-between gap-3">
            {plan.badge ? (
              <span
                className={`inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.18em] ${
                  plan.featured
                    ? "bg-emerald-300 text-slate-950"
                    : "bg-white/10 text-white/82"
                }`}
              >
                {plan.badge}
              </span>
            ) : (
              <span />
            )}
            {plan.discountLabel ? (
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200/85">
                {plan.discountLabel}
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <p className="text-sm font-semibold text-white/68">
              {plan.slug === "mensal" ? "entrada simples" : "melhor custo por mes"}
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
              {plan.name}
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/62">{plan.description}</p>
          </div>

          <div className="mt-6 flex items-end gap-3">
            {plan.compareAt ? (
              <span className="pb-2 text-sm text-white/28 line-through">
                {plan.compareAt}
              </span>
            ) : null}
            <strong className="text-5xl tracking-[-0.06em] text-white">
              {plan.monthlyPrice}
            </strong>
            <span className="pb-2 text-white/65">/mes</span>
          </div>

          <p className="mt-3 text-sm leading-7 text-white/58">{plan.billingLabel}</p>
          {plan.note ? (
            <p className="mt-2 text-sm leading-7 text-emerald-200/90">{plan.note}</p>
          ) : null}

          <ul className="mt-6 flex-1 space-y-3 text-sm leading-7 text-white/78">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span>{perk}</span>
              </li>
            ))}
          </ul>

          {enableCheckout ? (
            <form action={startCheckoutAction.bind(null, plan.slug)} className="mt-8">
              <button
                type="submit"
                className={`inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  plan.featured
                    ? "bg-white text-slate-950 hover:bg-emerald-50"
                    : "border border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                {plan.cta}
              </button>
            </form>
          ) : (
            <Link
              href={ctaHref}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                plan.featured
                  ? "bg-white text-slate-950 hover:bg-emerald-50"
                  : "border border-white/12 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08]"
              }`}
            >
              {plan.cta}
            </Link>
          )}
        </article>
      ))}
    </section>
  );
}
