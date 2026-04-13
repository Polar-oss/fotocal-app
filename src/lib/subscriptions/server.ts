import { createClient } from "@/lib/supabase/server";
import {
  getPlanLabel,
  isSubscriptionActive,
  normalizePlanSlug,
  type AppSubscription,
} from "@/lib/subscriptions";
import type { StripeCheckoutSession } from "@/lib/stripe";

type SubscriptionRow = {
  cancel_at_period_end: boolean | null;
  current_period_end: string | null;
  plan_slug: string | null;
  status: string | null;
};

export async function getUserSubscription(userId: string): Promise<AppSubscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("cancel_at_period_end, current_period_end, plan_slug, status")
    .eq("user_id", userId)
    .maybeSingle();

  const row = data as SubscriptionRow | null;

  if (error || !row) {
    return null;
  }

  return {
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    currentPeriodEnd: row.current_period_end,
    isActive: isSubscriptionActive(row.status),
    planLabel: getPlanLabel(row.plan_slug),
    planSlug: normalizePlanSlug(row.plan_slug),
    status: row.status,
  };
}

export async function syncSubscriptionFromCheckoutSession(input: {
  session: StripeCheckoutSession;
  userId: string;
}) {
  const subscription =
    input.session.subscription && typeof input.session.subscription === "object"
      ? input.session.subscription
      : null;

  if (!subscription?.id || input.session.client_reference_id !== input.userId) {
    return null;
  }

  const planSlug = normalizePlanSlug(
    input.session.metadata?.plan_slug ?? subscription.metadata?.plan_slug ?? null,
  );

  if (!planSlug) {
    return null;
  }

  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000).toISOString()
    : null;

  const supabase = await createClient();
  const { error } = await supabase.from("subscriptions").upsert(
    {
      cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
      current_period_end: currentPeriodEnd,
      plan_slug: planSlug,
      status: subscription.status ?? "incomplete",
      stripe_checkout_session_id: input.session.id,
      stripe_customer_id:
        typeof input.session.customer === "string" ? input.session.customer : null,
      stripe_subscription_id: subscription.id,
      user_id: input.userId,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return null;
  }

  return {
    cancelAtPeriodEnd: Boolean(subscription.cancel_at_period_end),
    currentPeriodEnd,
    isActive: isSubscriptionActive(subscription.status),
    planLabel: getPlanLabel(planSlug),
    planSlug,
    status: subscription.status ?? "incomplete",
  } satisfies AppSubscription;
}
