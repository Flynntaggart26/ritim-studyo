import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { Card } from "@/components/ui/card";

function FeatureIcon({ icon }: { icon: string }) {
  const cls = "h-6 w-6";
  switch (icon) {
    case "sound":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
      );
    case "drum":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="14" r="7" />
          <circle cx="12" cy="14" r="3" />
          <path d="M4 3l5 5M20 3l-5 5" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M3 3v18h18" />
          <path d="M7 15v3M12 10v8M17 6v12" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M8 2v4M16 2v4M3 9h18" />
        </svg>
      );
  }
}

export function Features() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <Reveal>
        <p className="eyebrow">Ders yaklaşımımız</p>
        <h2 className="font-display mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
          Müzik öğrenmenin keyifli ve kişisel hali
        </h2>
      </Reveal>

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {site.features.map((f, i) => (
          <Reveal key={f.title} delay={i * 90}>
            <Card className="group h-full rounded-[1.2rem] border-[#e5dac8] bg-[#faf4e8] p-5 transition-all duration-500 hover:-translate-y-1 hover:border-[#cbb899] hover:shadow-[0_18px_42px_-32px_rgba(92,70,44,0.35)] sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e8d9] text-[#64755d] transition-colors duration-300 group-hover:bg-[#e1e2d1]">
                <FeatureIcon icon={f.icon} />
              </div>
              <h3 className="font-display mt-5 text-lg font-semibold leading-snug text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{f.description}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
