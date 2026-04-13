import { faqItems } from "@/lib/marketing";

export function FaqGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {faqItems.map((item) => (
        <article
          key={item.question}
          className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur"
        >
          <p className="text-lg font-semibold tracking-tight text-white">
            {item.question}
          </p>
          <p className="mt-3 text-sm leading-7 text-white/64">{item.answer}</p>
        </article>
      ))}
    </div>
  );
}
