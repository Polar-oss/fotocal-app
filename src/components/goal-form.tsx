"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";

const goalOptions = [
  { value: 1600, note: "mais enxuta para quem quer um alvo mais controlado" },
  { value: 2000, note: "equilibrada para a maioria dos primeiros perfis" },
  { value: 2400, note: "mais alta para rotinas com maior gasto ou treino" },
];

const GOAL_MIN = 1200;
const GOAL_MAX = 3200;
const GOAL_STEP = 50;

type GoalFormProps = {
  initialGoal: number;
};

function clampGoal(value: number) {
  return Math.min(GOAL_MAX, Math.max(GOAL_MIN, Math.round(value / GOAL_STEP) * GOAL_STEP));
}

export function GoalForm({ initialGoal }: GoalFormProps) {
  const normalizedInitialGoal = clampGoal(initialGoal);
  const [goal, setGoal] = useState(normalizedInitialGoal);
  const [goalInput, setGoalInput] = useState(String(normalizedInitialGoal));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function applyGoal(nextValue: number) {
    const normalizedGoal = clampGoal(nextValue);
    setGoal(normalizedGoal);
    setGoalInput(String(normalizedGoal));
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedGoal = window.localStorage.getItem("fotocal_goal");

    if (!storedGoal) {
      return;
    }

    const parsedGoal = Number(storedGoal);

    if (!Number.isFinite(parsedGoal)) {
      return;
    }

    const timer = window.setTimeout(() => {
      applyGoal(parsedGoal);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawGoal = formData.get("goal");

    if (typeof rawGoal !== "string") {
      setErrorMessage("Escolha uma meta entre 1.200 e 3.200 kcal.");
      return;
    }

    const parsedGoal = Number(rawGoal);

    if (!Number.isFinite(parsedGoal)) {
      setErrorMessage("Escolha uma meta entre 1.200 e 3.200 kcal.");
      return;
    }

    const normalizedGoal = clampGoal(parsedGoal);
    applyGoal(normalizedGoal);
    setErrorMessage(null);
    setIsSaving(true);

    if (typeof window !== "undefined") {
      window.localStorage.setItem("fotocal_goal", String(normalizedGoal));
      document.cookie = `fotocal_goal_override=${normalizedGoal}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
    }

    try {
      await fetch("/api/profile/goal", {
        body: JSON.stringify({ goal: normalizedGoal }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
    } catch {
      // O app continua navegando com o valor salvo localmente.
    }

    window.location.assign(`/app?goal=${normalizedGoal}`);
  }

  return (
    <form action="/set-goal" method="post" onSubmit={handleSubmit}>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {goalOptions.map((option) => {
          const isActive = goal === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => applyGoal(option.value)}
              className={`block rounded-[1.5rem] border p-5 text-left transition hover:-translate-y-0.5 ${
                isActive
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block text-lg text-white">
                    {option.value.toLocaleString("pt-BR")} kcal
                  </strong>
                  <span className="mt-2 block text-sm leading-6 text-white/60">
                    {option.note}
                  </span>
                </div>
                <span
                  className={`mt-1 h-4 w-4 rounded-full border ${
                    isActive
                      ? "border-emerald-700 bg-emerald-700"
                      : "border-white/20 bg-transparent"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <label className="block text-sm font-medium text-white">
            Ajuste manualmente
            <input
              name="goal"
              type="number"
              inputMode="numeric"
              min={GOAL_MIN}
              max={GOAL_MAX}
              step={GOAL_STEP}
              value={goalInput}
              onChange={(event) => {
                const rawValue = event.target.value;
                setGoalInput(rawValue);

                if (!rawValue.trim()) {
                  return;
                }

                const nextValue = Number(rawValue);

                if (!Number.isFinite(nextValue)) {
                  return;
                }

                setGoal(clampGoal(nextValue));
              }}
              onBlur={() => applyGoal(goal)}
              className="mt-3 w-full rounded-2xl border border-white/12 bg-black/40 px-4 py-3.5 text-white outline-none transition focus:border-emerald-500"
            />
            <span className="mt-2 block text-xs leading-6 text-white/45">
              voce pode digitar direto no celular entre 1.200 e 3.200 kcal
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => applyGoal(goal - 100)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              -100 kcal
            </button>
            <button
              type="button"
              onClick={() => applyGoal(1800)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              1800 kcal
            </button>
            <button
              type="button"
              onClick={() => applyGoal(goal + 100)}
              className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.06]"
            >
              +100 kcal
            </button>
          </div>
        </div>

        <label className="mt-5 block text-sm font-medium text-white">
          Ou arraste o controle
          <input
            type="range"
            min={GOAL_MIN}
            max={GOAL_MAX}
            step={GOAL_STEP}
            value={goal}
            onChange={(event) => applyGoal(Number(event.target.value))}
            className="mt-4 w-full accent-emerald-700"
          />
        </label>

        <div className="mt-4 flex items-center justify-between text-sm text-white/60">
          <span>Meta escolhida</span>
          <strong className="text-base text-white">
            {goal.toLocaleString("pt-BR")} kcal
          </strong>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {errorMessage ? (
          <p className="text-sm text-rose-300" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSaving}
        >
          {isSaving ? "Salvando..." : "Salvar meta e entrar"}
        </button>
      </div>
    </form>
  );
}
