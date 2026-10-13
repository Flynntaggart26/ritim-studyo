import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { Card } from "@/components/ui/card";

const CONTACTS = [
  {
    label: "Adres",
    value: site.address,
    icon: (
      <path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
    ),
  },
  {
    label: "Telefon",
    value: site.phone,
    icon: (
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9Z" />
    ),
  },
  {
    label: "E-posta",
    value: site.email,
    icon: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <path d="m2 7 10 6L22 7" />
      </>
    ),
  },
  {
    label: "Çalışma Saatleri",
    value: site.workingHours,
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
  },
];

export function LocationSection() {
  return (
    <section id="konum" className="scroll-mt-24 mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <Reveal>
        <p className="eyebrow">Konum & İletişim</p>
        <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
          Bize Uğrayın
        </h2>
      </Reveal>

      <div className="mt-9 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          {CONTACTS.map((c, i) => (
            <Reveal key={c.label} delay={i * 80}>
              <Card className="h-full rounded-[1.1rem] border-[#e5dac8] bg-[#faf4e8] p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9e8d9] text-[#64755d]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {c.icon}
                  </svg>
                </div>
                <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  {c.label}
                </div>
                <div className="mt-1 text-sm font-medium leading-relaxed text-zinc-200">{c.value}</div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={150}>
          <div className="soft-shadow h-full min-h-[350px] overflow-hidden rounded-[1.4rem] border border-[#e2d5c1] bg-[#ece2d1]">
            <iframe
              title="Stüdyo Konumu"
              src={site.mapEmbedUrl}
              className="h-full min-h-[380px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
