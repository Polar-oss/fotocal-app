import Link from "next/link";
import { Brand } from "@/components/brand";
import { SignOutButton } from "@/components/sign-out-button";
import { getAuthContext } from "@/lib/auth";

export async function SiteHeader() {
  const auth = await getAuthContext();

  return (
    <header className="mx-auto mt-4 flex w-full max-w-7xl flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] px-4 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <Brand />

      <nav className="flex flex-wrap items-center gap-3 text-sm text-white/70">
        <Link href="/#recursos" className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white">
          Recursos
        </Link>
        <Link
          href="/#como-funciona"
          className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white"
        >
          Como funciona
        </Link>
        <Link
          href="/#planos"
          className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white"
        >
          Planos
        </Link>
        <Link
          href="/#faq"
          className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white"
        >
          FAQ
        </Link>
        {auth.isAuthenticated ? (
          <>
            <Link
              href="/onboarding"
              className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white"
            >
              Meta
            </Link>
            <Link
              href="/app"
              className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Meu app
            </Link>
            <SignOutButton className="rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]" />
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-full px-4 py-2 transition hover:bg-white/6 hover:text-white"
            >
              Entrar
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-emerald-600 px-4 py-2 font-medium text-white transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              Criar conta
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
