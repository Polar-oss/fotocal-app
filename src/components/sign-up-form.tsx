"use client";

import { useActionState } from "react";
import { initialActionState } from "@/app/auth/action-state";
import {
  signUpAction,
} from "@/app/auth/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";

type SignUpFormProps = {
  nextPath: string;
};

export function SignUpForm({ nextPath }: SignUpFormProps) {
  const [state, formAction] = useActionState(signUpAction, initialActionState);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <input type="hidden" name="next" value={nextPath} />

      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-emerald-300">
        Cadastro
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white">
        Comece agora a base da sua rotina no FotoCal.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-white/65">
        Crie a conta, defina sua meta e comece a registrar refeicoes em um app
        que foi desenhado para ser leve.
      </p>

      <div className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm font-medium text-white/88">
          Nome
          <input
            required
            name="fullName"
            type="text"
            placeholder="Seu nome"
            className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
          />
        </label>
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
            placeholder="Crie uma senha"
            className="rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition placeholder:text-white/25 focus:border-emerald-500"
          />
        </label>
      </div>

      <div className="mt-6">
        <FormMessage state={state} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <SubmitButton
          pendingLabel="Criando conta..."
          className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Criar conta e continuar
        </SubmitButton>
      </div>
    </form>
  );
}
