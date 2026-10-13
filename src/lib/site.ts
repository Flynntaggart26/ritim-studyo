/**
 * Stüdyo genel bilgileri — buradan tek noktadan güncelleyebilirsiniz.
 * (İsim, adres, telefon, harita konumu, galeri görselleri vb.)
 */
export const site = {
  name: "Ritim Stüdyo",
  tagline: "Bateriyi kendi ritminizde öğrenin.",
  description:
    "İstanbul'un kalbinde, profesyonel ekipman ve deneyimli eğitmen kadrosuyla bateri eğitimi. Her seviyeye uygun birebir dersler, online randevu imkânı.",
  phone: "+90 532 000 00 00",
  email: "info@ritimstudyo.com",
  address: "Rasimpaşa Mah. Ritim Cad. No:7, Kadıköy / İstanbul",
  workingHours: "Hafta içi 10:00 – 22:00 • Hafta sonu 10:00 – 20:00",
  // Google Haritalar'da stüdyonuzu bulun → Paylaş → Harita yerleştir → src içindeki linki buraya yapıştırın
  mapEmbedUrl:
    "https://www.google.com/maps?q=Kad%C4%B1k%C3%B6y%20%C4%B0stanbul&z=15&output=embed",
  instagram: "https://instagram.com/ritimstudyo",
  youtube: "https://youtube.com/@ritimstudyo",
  heroImage: {
    src: "/images/stock/hero-practice.jpg",
    alt: "Müzik stüdyosunda bateri çalışan bir müzisyen",
  },
  // Yerel stok görseller. Kaynak ve kullanım notları public/images/stock/CREDITS.md içinde.
  gallery: [
    { src: "/images/stock/rehearsal-room.jpg", alt: "Müzik grubunun prova yaptığı aydınlık stüdyo", title: "Prova atmosferi" },
    { src: "/images/stock/studio-room.jpg", alt: "Davul ve müzik ekipmanlarının bulunduğu çalışma odası", title: "Çalışma odası" },
    { src: "/images/stock/cymbal-detail.jpg", alt: "Yakın planda bateri zili ve davul seti", title: "Ekipman detayı" },
  ],
  features: [
    {
      title: "Ses Yalıtımlı Profesyonel Oda",
      description:
        "Akustik panellerle donatılmış, yüksek kalitede davul seti ve zil ekipmanına sahip derslik.",
      icon: "sound",
    },
    {
      title: "Deneyimli Eğitmen Kadrosu",
      description:
        "Sahne ve stüdyo tecrübesi yüksek, her biri kendi tarzında uzman eğitmenler.",
      icon: "drum",
    },
    {
      title: "Her Seviyeye Uygun Program",
      description:
        "İlk kez baget tutanlardan sahneye hazırlananlara kadar kişiye özel müfredat.",
      icon: "chart",
    },
    {
      title: "Online Randevu Kolaylığı",
      description:
        "Müsait saatleri görün, size uyan ders saatini saniyeler içinde ayırtın.",
      icon: "calendar",
    },
  ],
} as const;
