const ITEMS = [
  { title: "Birebir ders", note: "Sana özel ilerleme" },
  { title: "Her seviye", note: "İlk dersten ileri tekniğe" },
  { title: "Esnek saatler", note: "Takvimden kolayca seç" },
];

export function StudioHighlights() {
  return (
    <section className="border-y border-[#e3d6c3] bg-[#f9f2e6]">
      <div className="mx-auto grid max-w-7xl divide-y divide-[#e3d6c3] px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
        {ITEMS.map((item, i) => (
          <div key={item.title} className="flex items-center gap-4 py-4 sm:px-6 sm:py-5 first:sm:pl-0 last:sm:pr-0">
            <span className="font-display text-xs font-semibold tracking-[0.14em] text-[#9c9b8f]">0{i + 1}</span>
            <div>
              <div className="text-sm font-semibold text-zinc-200">{item.title}</div>
              <div className="mt-0.5 text-xs text-zinc-500">{item.note}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
