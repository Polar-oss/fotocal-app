"use server";

import { redirect } from "next/navigation";
import { pricingPlans } from "@/lib/marketing";
import { createCheckoutUrl, hasStripeEnv } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

type PlanSlug = (typeof pricingPlans)[number]["slug"];

export async function startCheckoutAction(planSlug: PlanSlug) {
  if (!hasStripeEnv()) {
    redirect("/pricing?checkout=unavailable");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/pricing");
  }

  try {
    const checkoutUrl = await createCheckoutUrl({
      email: user.email,
      planSlug,
      userId: user.id,
    });

    redirect(checkoutUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Nao foi possivel abrir o checkout.";

    console.error("stripe_checkout_error", {
      message,
      planSlug,
      userEmail: user.email ?? null,
      userId: user.id,
    });

    if (message.includes("Nao encontrei o preco")) {
      redirect("/pricing?checkout=missing-price");
    }

    if (/invalid api key/i.test(message)) {
      redirect("/pricing?checkout=invalid-key");
    }

    if (/permission|restricted api key/i.test(message)) {
      redirect("/pricing?checkout=invalid-permission");
    }

    if (/checkout/i.test(message) && /not enabled|not activated/i.test(message)) {
      redirect("/pricing?checkout=checkout-disabled");
    }

    redirect("/pricing?checkout=error");
  }
}
