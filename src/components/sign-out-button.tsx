import { signOutAction } from "@/app/auth/actions";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        Sair
      </button>
    </form>
  );
}
