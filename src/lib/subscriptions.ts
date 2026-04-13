import type { PricingPlan } from "@/lib/marketing";

type PlanSlug = PricingPlan["slug"];

export type AppSubscription = {
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  isActive: boolean;
  planLabel: string | null;
  planSlug: PlanSlug | null;
  status: string | null;
};

const ACTIVE_STATUSES = new Set(["active", "trialing"]);
const PLAN_LABELS: Record<PlanSlug, string> = {
  anual: "Plano Anual",
  mensal: "Plano Mensal",
  semestral: "Plano Semestral",
  trimestral: "Plano Trimestral",
};

export function normalizePlanSlug(value?: string | null): PlanSlug | null {
  if (
    value === "mensal" ||
    value === "trimestral" ||
    value === "semestral" ||
    value === "anual"
  ) {
    return value;
  }

  return null;
}

export function getPlanLabel(planSlug?: string | null) {
  const normalized = normalizePlanSlug(planSlug);

  return normalized ? PLAN_LABELS[normalized] : null;
}

export function isSubscriptionActive(status?: string | null) {
  return status ? ACTIVE_STATUSES.has(status) : false;
}

export function getSubscriptionStatusLabel(rawStatus?: string | null) {
  switch (rawStatus) {
    case "active":
      return "ativa";
    case "trialing":
      return "em teste";
    case "past_due":
      return "pendente";
    case "canceled":
      return "cancelada";
    case "unpaid":
      return "nao paga";
    default:
      return "em processamento";
  }
}
