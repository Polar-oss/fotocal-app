type SetupNoticeProps = {
  title?: string;
  description: string;
};

export function SetupNotice({
  title = "Configuracao pendente",
  description,
}: SetupNoticeProps) {
  return (
    <article className="rounded-[1.5rem] border border-amber-500/25 bg-amber-500/10 p-5 text-amber-50">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-amber-300">
        {title}
      </p>
      <p className="mt-3 text-sm leading-7">{description}</p>
      <p className="mt-3 text-sm leading-7 text-amber-100/80">
        Para ativar cadastro, login e sincronizacao, copie{" "}
        <code>.env.example</code> para <code>.env.local</code> e preencha as
        chaves do Supabase.
      </p>
    </article>
  );
}
