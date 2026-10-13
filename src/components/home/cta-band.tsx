import { Reveal } from "@/components/reveal";
import { LinkButton } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24">
      <Reveal>
        <div className="bg-stage relative overflow-hidden rounded-[1.6rem] border border-[#e1d4bf] bg-[#eee5d5] px-6 py-10 sm:px-12 sm:py-14">
          <div className="absolute -right-8 -top-20 h-64 w-64 rounded-full bg-[#e8cfaa]/45 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="eyebrow">İlk adımını at</p>
              <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-4xl">
                Ritim sana iyi gelsin.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500 sm:text-base">
                Sana uygun hocayı ve ders saatini seç; gerisini stüdyoda birlikte keşfedelim.
              </p>
            </div>
            <LinkButton href="/randevu" size="lg" className="shrink-0">
              İlk dersini planla
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </LinkButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
