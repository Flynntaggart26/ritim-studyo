import { authInternal } from "../src/lib/auth-internal";
import { prisma } from "../src/lib/prisma";

async function ensureUser(
  email: string,
  name: string,
  password: string,
  role: "ADMIN" | "TEACHER" | "STUDENT",
  phone?: string
): Promise<string> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== role) {
      await prisma.user.update({ where: { id: existing.id }, data: { role } });
    }
    return existing.id;
  }
  const res = (await authInternal.api.signUpEmail({
    body: { name, email, password },
  })) as { user: { id: string } };
  await prisma.user.update({
    where: { id: res.user.id },
    data: { role, phone: phone ?? null },
  });
  return res.user.id;
}

async function ensureTeacher(
  email: string,
  name: string,
  data: {
    title: string;
    specialties: string;
    bio: string;
    phone: string;
    lessons: { title: string; description: string; durationMin: number; materials: string; price: number }[];
    availability: { dayOfWeek: number; startMin: number; endMin: number }[];
  }
) {
  const userId = await ensureUser(email, name, "Hoca123!", "TEACHER", data.phone);

  let profile = await prisma.teacherProfile.findUnique({ where: { userId } });
  if (!profile) {
    profile = await prisma.teacherProfile.create({
      data: { userId, title: data.title, specialties: data.specialties, bio: data.bio },
    });
  }

  const lessonCount = await prisma.lessonType.count({ where: { teacherId: profile.id } });
  if (lessonCount === 0) {
    await prisma.lessonType.createMany({
      data: data.lessons.map((l) => ({ ...l, teacherId: profile.id })),
    });
  }

  const availCount = await prisma.availability.count({ where: { teacherId: profile.id } });
  if (availCount === 0) {
    await prisma.availability.createMany({
      data: data.availability.map((a) => ({ ...a, teacherId: profile.id })),
    });
  }
}

const min = (h: number, m = 0) => h * 60 + m;

async function main() {
  console.log("🌱 Seed başlıyor...");

  // Admin
  await ensureUser("admin@ritimstudyo.com", "Stüdyo Yönetimi", "Admin123!", "ADMIN");
  console.log("✔ Admin hazır");

  // Hocalar
  await ensureTeacher("deniz@ritimstudyo.com", "Deniz Aksoy", {
    title: "Kurucu Eğitmen • Rock & Metal",
    specialties: "Rock, Metal, Funk",
    phone: "0532 111 22 33",
    bio: "20 yılı aşkın sahne ve stüdyo deneyimi. Türkiye'nin önde gelen rock gruplarıyla çalıştı. Teknik, dayanıklılık ve sahne performansı odaklı eğitim verir.",
    lessons: [
      {
        title: "Deneme Dersi",
        description: "Stüdyoyu tanıyın, hocayla tanışın ve seviyenizi birlikte belirleyin.",
        durationMin: 30,
        materials: "Hiçbir şey getirmenize gerek yok; bagetler stüdyodan.",
        price: 400,
      },
      {
        title: "Birebir Ders",
        description: "Seviyenize özel hazırlanan müfredatla birebir eğitim.",
        durationMin: 60,
        materials: "Kendi bagetinizi ve ders defterinizi getirin.",
        price: 900,
      },
      {
        title: "İleri Seviye Atölye",
        description: "Double pedal, odd-meter ve sahne repertuvarı üzerine yoğun çalışma.",
        durationMin: 90,
        materials: "Baget, pratik pad'i ve üzerinde çalıştığınız parçalar.",
        price: 1300,
      },
    ],
    availability: [
      { dayOfWeek: 1, startMin: min(14), endMin: min(21) },
      { dayOfWeek: 3, startMin: min(14), endMin: min(21) },
      { dayOfWeek: 5, startMin: min(14), endMin: min(21) },
      { dayOfWeek: 6, startMin: min(11), endMin: min(17) },
    ],
  });

  await ensureTeacher("mert@ritimstudyo.com", "Mert Kaya", {
    title: "Eğitmen • Jazz & Latin",
    specialties: "Jazz, Latin, Fusion",
    phone: "0533 222 33 44",
    bio: "Caz kökenli, latin ve fusion tarzlarda uzman. Berklee online sertifikalı. Brush tekniği, independence ve doğaçlama üzerine çalışır.",
    lessons: [
      {
        title: "Deneme Dersi",
        description: "Tanışma ve seviye tespiti için kısa bir ders.",
        durationMin: 30,
        materials: "Hiçbir şey getirmenize gerek yok; bagetler stüdyodan.",
        price: 400,
      },
      {
        title: "Birebir Ders",
        description: "Ritim duygusu, okuma ve teknik üzerine birebir eğitim.",
        durationMin: 60,
        materials: "Kendi bagetinizi getirmeniz yeterli.",
        price: 850,
      },
    ],
    availability: [
      { dayOfWeek: 2, startMin: min(10), endMin: min(18) },
      { dayOfWeek: 4, startMin: min(10), endMin: min(18) },
      { dayOfWeek: 6, startMin: min(10), endMin: min(15) },
    ],
  });

  await ensureTeacher("elif@ritimstudyo.com", "Elif Yılmaz", {
    title: "Eğitmen • Başlangıç & Pop",
    specialties: "Pop, Rock, Başlangıç Seviyesi",
    phone: "0534 333 44 55",
    bio: "Çocuklar ve yeni başlayanlarla çalışmada deneyimli. Sabırlı, eğlenceli ve oyunlaştırılmış yöntemlerle temel ritim eğitimi verir.",
    lessons: [
      {
        title: "Deneme Dersi",
        description: "Bateriyle ilk tanışma! Eğlenceli bir başlangıç dersi.",
        durationMin: 30,
        materials: "Hiçbir şey getirmenize gerek yok.",
        price: 350,
      },
      {
        title: "Birebir Ders",
        description: "Temel teknik, ritim ve koordinasyon çalışmaları.",
        durationMin: 60,
        materials: "Baget ve ders defteri (ilk derste stüdyodan temin edilebilir).",
        price: 750,
      },
    ],
    availability: [
      { dayOfWeek: 1, startMin: min(16), endMin: min(21) },
      { dayOfWeek: 3, startMin: min(16), endMin: min(21) },
      { dayOfWeek: 0, startMin: min(12), endMin: min(18) },
    ],
  });
  console.log("✔ 3 hoca hazır");

  // Demo öğrenci
  await ensureUser("ogrenci@ritimstudyo.com", "Deneme Öğrenci", "Ogrenci123!", "STUDENT", "0555 000 00 00");
  console.log("✔ Demo öğrenci hazır");

  console.log(`
✅ Seed tamamlandı!

Giriş bilgileri:
  Admin   → admin@ritimstudyo.com    / Admin123!
  Hoca    → deniz@ritimstudyo.com    / Hoca123!
            mert@ritimstudyo.com     / Hoca123!
            elif@ritimstudyo.com     / Hoca123!
  Öğrenci → ogrenci@ritimstudyo.com  / Ogrenci123!
`);
}

main()
  .catch((e) => {
    console.error("Seed hatası:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
