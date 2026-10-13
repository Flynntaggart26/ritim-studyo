import { Reveal } from "@/components/reveal";
import { Card } from "@/components/ui/card";

const STEPS = [
  { no: "01", title: "Hocanı seç", text: "Eğitmenleri ve ders içeriklerini inceleyin." },
  { no: "02", title: "Saatini belirle", text: "Size uygun boş saati takvimden seçin." },
  { no: "03", title: "Stüdyoda buluşalım", text: "Randevu onayınızı alın ve ilk derse gelin." },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="eyebrow">Kolayca başlayın</p>
          <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
            İlk dersine üç adımda
          </h2>
        </Reveal>

        <div className="mt-9 grid gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.no} delay={i * 70}>
              <Card className="flex h-full gap-4 rounded-[1.2rem] border-[#e5dac8] bg-[#faf4e8] p-5 sm:p-6">
                <span className="font-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9e8d9] text-xs font-semibold tracking-wide text-[#64755d]">
                  {step.no}
                </span>
                <div>
                  <h3 className="font-display text-base font-semibold text-zinc-100">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-zinc-500">{step.text}</p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
