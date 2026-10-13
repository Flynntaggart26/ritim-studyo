import Image from "next/image";
import { site } from "@/lib/site";
import { Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

export function GallerySection() {
  return (
    <section id="galeri" className="scroll-mt-24 border-y border-[#e2d5c1] bg-[#eee4d5] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Stüdyodan kareler</p>
            <h2 className="font-display mt-3 text-3xl font-semibold tracking-[-0.035em] text-zinc-100 sm:text-4xl">
              Ritmin yaşadığı yer
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-zinc-500 sm:text-base">
            Ekipmanları, prova atmosferini ve müziğe ayrılmış alanımızı yakından keşfedin.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:auto-rows-[220px] md:grid-cols-12">
          {site.gallery.map((img, i) => (
            <Reveal
              key={img.src}
              delay={i * 65}
              className={cn(
                "group relative min-h-36 overflow-hidden rounded-[1.25rem] bg-[#e6d8c2] sm:min-h-44 md:min-h-0",
                i === 0
                  ? "col-span-2 aspect-[1.45] md:col-span-7 md:row-span-2 md:aspect-auto"
                  : "col-span-1 aspect-square md:col-span-5 md:row-span-1 md:aspect-auto"
              )}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={i === 0 ? "(max-width: 768px) 100vw, 65vw" : "(max-width: 768px) 50vw, 34vw"}
                className="object-cover saturate-[0.82] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18231d]/62 via-transparent to-transparent opacity-85 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 sm:bottom-4 sm:left-4 sm:right-4">
                <span className="text-sm font-medium text-zinc-50 sm:text-base">{img.title}</span>
                <span className="hidden text-[10px] font-semibold tracking-[0.16em] text-zinc-50/75 sm:block">0{i + 1}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-right text-[11px] text-zinc-500">Fotoğraflar: Pexels stok görselleri</p>
      </div>
    </section>
  );
}
