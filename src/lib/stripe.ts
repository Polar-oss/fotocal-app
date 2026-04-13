import type { PricingPlan } from "@/lib/marketing";
import { getAppUrl } from "@/lib/site";

type PlanSlug = PricingPlan["slug"];

type StripeRecurring = {
  interval: "day" | "month" | "week" | "year";
  interval_count: number;
};

type StripeProduct = {
  id: string;
  name: string;
};

type StripePrice = {
  active: boolean;
  created: number;
  currency: string;
  id: string;
  product: StripeProduct | string;
  recurring: StripeRecurring | null;
  unit_amount: number | null;
};

type StripeListResponse<T> = {
  data: T[];
};

type StripeSubscription = {
  cancel_at_period_end?: boolean | null;
  current_period_end?: number | null;
  id: string;
  metadata?: Record<string, string> | null;
  status: string | null;
};

export type StripeCheckoutSession = {
  client_reference_id?: string | null;
  customer?: string | null;
  customer_email: string | null;
  id: string;
  metadata?: Record<string, string> | null;
  status: string | null;
  subscription:
    | StripeSubscription
    | string
    | null;
  url: string | null;
};

const STRIPE_API_BASE = "https://api.stripe.com";
const DEFAULT_PRODUCT_NAME = "FotoCal Premium";

const PLAN_SPECS: Record<
  PlanSlug,
  {
    interval: "month" | "year";
    intervalCount: number;
    unitAmount: number;
  }
> = {
  anual: {
    interval: "year",
    intervalCount: 1,
    unitAmount: 10080,
  },
  mensal: {
    interval: "month",
    intervalCount: 1,
    unitAmount: 1200,
  },
  semestral: {
    interval: "month",
    intervalCount: 6,
    unitAmount: 5760,
  },
  trimestral: {
    interval: "month",
    intervalCount: 3,
    unitAmount: 3240,
  },
};

function getStripeSecretKey() {
  const value = process.env.STRIPE_SECRET_KEY?.trim();

  return value || null;
}

function getStripeProductName() {
  return process.env.STRIPE_PRODUCT_NAME?.trim() || DEFAULT_PRODUCT_NAME;
}

function getProductName(price: StripePrice) {
  return typeof price.product === "string" ? null : price.product.name;
}

async function stripeFetch<T>(
  path: string,
  init?: RequestInit,
  body?: URLSearchParams,
) {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("As chaves do Stripe ainda nao foram adicionadas.");
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    ...init,
    body: body?.toString(),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init?.headers ?? {}),
    },
  });

  const payload = await response.json();

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string"
        ? payload.error.message
        : "Nao foi possivel falar com o Stripe agora.";

    throw new Error(message);
  }

  return payload as T;
}

async function listProductPrices() {
  const params = new URLSearchParams();
  params.set("active", "true");
  params.set("limit", "100");
  params.append("expand[]", "data.product");

  const payload = await stripeFetch<StripeListResponse<StripePrice>>(
    `/v1/prices?${params.toString()}`,
    {
      method: "GET",
    },
  );

  const productName = getStripeProductName();

  return payload.data
    .filter((price) => getProductName(price) === productName)
    .sort((left, right) => right.created - left.created);
}

async function getPriceIdForPlan(planSlug: PlanSlug) {
  const prices = await listProductPrices();
  const spec = PLAN_SPECS[planSlug];

  const match = prices.find((price) => {
    if (!price.active || !price.recurring || !price.unit_amount) {
      return false;
    }

    return (
      price.unit_amount === spec.unitAmount &&
      price.recurring.interval === spec.interval &&
      price.recurring.interval_count === spec.intervalCount
    );
  });

  if (!match) {
    throw new Error(
      `Nao encontrei o preco do plano ${planSlug} no produto ${getStripeProductName()}.`,
    );
  }

  return match.id;
}

export function hasStripeEnv() {
  return Boolean(getStripeSecretKey());
}

export async function createCheckoutUrl(input: {
  email?: string | null;
  planSlug: PlanSlug;
  userId: string;
}) {
  const priceId = await getPriceIdForPlan(input.planSlug);
  const appUrl = getAppUrl();
  const body = new URLSearchParams();

  body.set("mode", "subscription");
  body.set("success_url", `${appUrl}/pricing/success?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${appUrl}/pricing?checkout=cancelled`);
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("client_reference_id", input.userId);
  body.set("allow_promotion_codes", "true");
  body.set("metadata[user_id]", input.userId);
  body.set("metadata[plan_slug]", input.planSlug);
  body.set("subscription_data[metadata][user_id]", input.userId);
  body.set("subscription_data[metadata][plan_slug]", input.planSlug);

  if (input.email) {
    body.set("customer_email", input.email);
  }

  const session = await stripeFetch<StripeCheckoutSession>(
    "/v1/checkout/sessions",
    {
      method: "POST",
    },
    body,
  );

  if (!session.url) {
    throw new Error("O Stripe nao retornou um link de checkout.");
  }

  return session.url;
}

export async function getCheckoutSession(sessionId: string) {
  const params = new URLSearchParams();
  params.append("expand[]", "subscription");

  return stripeFetch<StripeCheckoutSession>(
    `/v1/checkout/sessions/${sessionId}?${params.toString()}`,
    {
      method: "GET",
    },
  );
}
