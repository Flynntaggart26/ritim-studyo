import Image from "next/image";
import { site } from "@/lib/site";
import { LinkButton } from "@/components/ui/button";

const PROMISES = ["Birebir çalışma", "Her seviyeye uygun", "Online randevu"];

export function Hero() {
  return (
    <section className="bg-stage relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
        <div className="hero-enter relative z-10">
          <p className="eyebrow">Ritim Stüdyo <span className="mx-2 text-[#b4a88e]">/</span> Kadıköy, İstanbul</p>

          <h1 className="font-display mt-6 max-w-xl text-[3.3rem] font-semibold leading-[0.99] tracking-[-0.055em] text-zinc-100 sm:text-6xl lg:text-[4.7rem]">
            Ritmini{" "}
            <span className="editorial-accent ml-3">bul.</span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            Bateriyle tanışmak ya da tekniğini geliştirmek için sana uygun hocayı ve ders saatini bul.
            İlk adımını stüdyoda at.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href="/randevu" size="lg" className="shadow-[0_12px_28px_-16px_rgba(54,78,64,0.65)]">
              Randevu saatlerini gör
              <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </LinkButton>
            <LinkButton href="/hocalar" variant="outline" size="lg">
              Hocaları tanı
            </LinkButton>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#e2d5c0] pt-5 text-xs font-medium text-zinc-500 sm:text-sm">
            {PROMISES.map((promise, i) => (
              <span key={promise} className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500/75" aria-hidden="true" />
                {promise}
                {i < PROMISES.length - 1 && <span className="ml-3 hidden text-[#c2b49c] sm:inline">/</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-enter hero-enter-delay relative mx-auto w-full max-w-[650px] lg:ml-auto">
          <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[radial-gradient(ellipse_at_center,rgba(163,177,155,0.32),transparent_68%)] blur-2xl" />
          <figure className="group relative aspect-[1.08] overflow-hidden rounded-[1.6rem] bg-[#e7ddc9] sm:aspect-[1.12] lg:rounded-[2rem]">
            <Image
              src={site.heroImage.src}
              alt={site.heroImage.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover object-center saturate-[0.86] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1d2821]/55 via-transparent to-transparent" />
            <figcaption className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 sm:bottom-6 sm:left-6 sm:right-6">
              <div className="rounded-xl border border-[#f8efdf]/70 bg-[#faf2e4]/90 px-4 py-3 shadow-sm backdrop-blur-md">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#89765c]">İlk derse hoş geldin</p>
                <p className="mt-1 text-sm font-semibold text-[#382f27]">Kendi ritmini keşfet</p>
              </div>
              <span className="hidden rounded-full border border-white/45 bg-white/20 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-zinc-50 backdrop-blur-sm sm:inline">
                Bateri dersleri · Kadıköy
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
