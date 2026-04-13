import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { normalizeAppPath } from "@/lib/routing";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const nextPath = normalizeAppPath(
    requestUrl.searchParams.get("next"),
    "/onboarding",
  );

  if (!hasSupabaseEnv) {
    const redirectUrl = new URL("/sign-in?error=configuracao", requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/sign-in?error=confirmacao", requestUrl.origin),
  );
}
