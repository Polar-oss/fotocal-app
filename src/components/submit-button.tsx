"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel: string;
};

export function SubmitButton({
  children,
  className,
  pendingLabel,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      aria-disabled={pending}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
