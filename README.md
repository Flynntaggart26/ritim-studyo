<div align="center">

# 🥁 Ritim Stüdyo

**Bateri derslerini keşfetmek ve kolayca randevu almak için Türkçe web uygulaması.**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL + Prisma](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?logo=postgresql&logoColor=white)

</div>

Ritim Stüdyo; öğrencilerin dersleri ve eğitmenleri inceleyip randevu oluşturabildiği, eğitmenlerin programlarını yönetebildiği ve yöneticilerin stüdyo operasyonlarını takip edebildiği bir rezervasyon uygulamasıdır.

## Özellikler

- Eğitmen profilleri, uzmanlık alanları ve ders seçenekleri
- Misafir veya öğrenci hesabıyla randevu oluşturma
- Tek oda kapasitesine göre çakışma kontrolü
- Öğrenci, eğitmen ve yönetici panelleri
- Haftalık müsaitlik, kapalı gün ve ders yönetimi
- Randevu durumu ve değişiklikleri için e-posta bildirimleri

## Teknoloji

| Alan | Kullanılan teknoloji |
| --- | --- |
| Web uygulaması | Next.js 16, React 19, TypeScript |
| Tasarım | Tailwind CSS 4 |
| Veritabanı | PostgreSQL, Prisma |
| Kimlik doğrulama | Better Auth |
| E-posta | Resend (isteğe bağlı) |

## Yerel geliştirme

### Gereksinimler

- Node.js 20 veya üzeri
- Erişilebilir bir PostgreSQL veritabanı

### Kurulum

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. `.env.example` dosyasını `.env` adıyla kopyalayın ve `DATABASE_URL` değerini PostgreSQL bağlantınızla değiştirin. `BETTER_AUTH_SECRET` için en az 32 karakterlik rastgele bir değer kullanın.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS veya Linux:

   ```bash
   cp .env.example .env
   ```

3. Veritabanı tablolarını oluşturup yerel örnek verileri ekleyin:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

`db:seed` yalnızca geliştirme ortamında kullanılabilir. Komut örnek yönetici, eğitmen ve öğrenci hesapları oluşturur; üretimde çalıştırılmaz.

## SQLite verisini PostgreSQL'e aktarma

Mevcut `prisma/dev.db` verisini korumak için `.env` içindeki `SQLITE_DATABASE_URL` değerini SQLite dosyasına, `DATABASE_URL` değerini ise boş PostgreSQL veritabanına ayarlayın. Aktarım öncesinde `db:seed` çalıştırmayın.

```bash
npm run db:push
npm run db:migrate-sqlite
```

Aktarım kullanıcı, oturum, hesap, doğrulama, eğitmen, ders, müsaitlik, kapalı gün ve randevu kayıtlarını ilişkileriyle kopyalar. Kaynak SQLite dosyası değiştirilmez. Hedef veritabanındaki tablolardan biri doluysa işlem başlamaz. Yeni veritabanı kurulumlarında bu adımı atlayın.

## Yapılandırma

| Değişken | Gerekli | Açıklama |
| --- | --- | --- |
| `DATABASE_URL` | Evet | PostgreSQL bağlantı adresi |
| `BETTER_AUTH_SECRET` | Evet | Oturum ve kimlik doğrulama gizli anahtarı |
| `BETTER_AUTH_URL` | Evet | Uygulamanın temel adresi |
| `APP_URL` | Evet | E-posta bağlantılarında kullanılan temel adres |
| `SQLITE_DATABASE_URL` | Hayır | SQLite aktarımı için kaynak veritabanı adresi |
| `RESEND_API_KEY` | Hayır | Resend e-posta servisi anahtarı |
| `EMAIL_FROM` | Hayır | Doğrulanmış gönderici adresi |

Resend yapılandırılmadığında e-posta bildirimleri geliştirme ortamında konsola yazılır.

## Proje kontrolleri

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## Yayına hazırlık

Yayın ortamında PostgreSQL bağlantısı, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` ve `APP_URL` tanımlanmalıdır. E-posta bildirimleri kullanılacaksa Resend anahtarı ve doğrulanmış gönderici adresi de eklenmelidir. Örnek hesapları ve parolaları gerçek ortamda kullanmayın.

Stüdyo adı, iletişim bilgileri, adres ve çalışma saatleri `src/lib/site.ts` dosyasından; görseller ve kaynak notları `public/images/stock/` klasöründen düzenlenebilir.
