import type { ActionState } from "@/app/auth/action-state";

type FormMessageProps = {
  state: ActionState;
};

export function FormMessage({ state }: FormMessageProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  const toneClasses =
    state.status === "success"
      ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-100"
      : "border-rose-500/30 bg-rose-500/12 text-rose-100";

  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-3 text-sm leading-7 ${toneClasses}`}
    >
      {state.message}
    </div>
  );
}
