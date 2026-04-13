import Link from "next/link";

type BrandProps = {
  compact?: boolean;
};

export function Brand({ compact = false }: BrandProps) {
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-white">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 font-semibold text-white shadow-[0_18px_40px_rgba(16,185,129,0.22)]">
        F
      </span>
      <span className="flex flex-col leading-none">
        <strong className="text-base font-semibold tracking-tight text-white">FotoCal</strong>
        {!compact ? (
          <small className="mt-1 text-sm text-white/55">
            calorias por foto, com clareza no dia a dia
          </small>
        ) : null}
      </span>
    </Link>
  );
}
