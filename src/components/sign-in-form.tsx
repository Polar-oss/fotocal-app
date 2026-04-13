"use client";

import { useActionState } from "react";
import { initialActionState } from "@/app/auth/action-state";
import {
  signInAction,
} from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

type SignInFormProps = {
  nextPath: string;
};

export function SignInForm({ nextPath }: SignInFormProps) {
  const [state, formAction] = useActionState(signInAction, initialActionState);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <input type="hidden" name="next" value={nextPath} />

      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
        Login
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
        Entre na sua conta
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-white/65">
        Entre para acompanhar sua meta, revisar as refeicoes do dia e seguir a
        rotina com menos atrito.
      </p>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-white/88">
          Email
          <input
            required
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-white/88">
          Senha
          <input
            required
            minLength={6}
            name="password"
            type="password"
            placeholder="********"
            className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
          />
        </label>
      </div>

      <div className="mt-6">
        <FormMessage state={state} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SubmitButton
          pendingLabel="Entrando..."
          className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Entrar
        </SubmitButton>
      </div>
    </form>
  );
}
