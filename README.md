# Ritim Stüdyo

Ritim Stüdyo, bateri derslerini keşfetmek ve randevu oluşturmak için geliştirilmiş Türkçe bir web uygulamasıdır. Öğrenciler ders ve saat seçebilir; eğitmenler programlarını yönetebilir; yöneticiler eğitmenleri ve randevuları takip edebilir.

**Yayın adresi:** [Ritim Stüdyo — Vercel](https://ritim-studyo-3qpft5ma8-egehanstudio.vercel.app)

**Erişim:** Vercel dağıtım koruması açık olduğu için siteyi görüntülemek için Vercel hesabıyla giriş gerekebilir.

## Özellikler

- Eğitmenleri, uzmanlık alanlarını ve ders türlerini görüntüleme
- Misafir veya öğrenci hesabıyla randevu oluşturma
- Tek oda kapasitesine göre çakışmasız saat seçimi
- Öğrenci, eğitmen ve yönetici panelleri
- Eğitmen müsaitliği, kapalı gün ve ders türü yönetimi
- Randevu bilgilendirmeleri için e-posta desteği

## Teknoloji

- Next.js 16 ve React 19
- TypeScript
- PostgreSQL ve Prisma
- Better Auth
- Tailwind CSS 4

## Geliştirme ortamını hazırlama

Gereksinimler: Node.js 20 veya üzeri ve erişilebilir bir PostgreSQL veritabanı.

1. Bağımlılıkları yükleyin:

   ```bash
   npm install
   ```

2. `.env.example` dosyasını `.env` adıyla kopyalayın. `DATABASE_URL` değerini PostgreSQL bağlantınızla değiştirin ve `BETTER_AUTH_SECRET` için en az 32 karakterlik rastgele bir değer belirleyin.

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS veya Linux:

   ```bash
   cp .env.example .env
   ```

3. Yeni ve boş veritabanında şemayı oluşturup yerel örnek verileri ekleyin:

   ```bash
   npm run db:push
   npm run db:seed
   ```

4. Geliştirme sunucusunu başlatın:

   ```bash
   npm run dev
   ```

`db:seed` örnek yönetici, eğitmen ve öğrenci hesapları oluşturur. Yalnızca geliştirme için kullanın; üretim ortamında çalıştırılmaz.

## SQLite verisini PostgreSQL'e taşıma

Mevcut `prisma/dev.db` dosyasındaki kayıtları korumak için aktarım sırasında `SQLITE_DATABASE_URL` değerini SQLite dosyasına, `DATABASE_URL` değerini ise **boş** PostgreSQL veritabanına ayarlayın. Aktarımdan önce `db:seed` çalıştırmayın.

```bash
npm run db:push
npm run db:migrate-sqlite
npm run dev
```

Aktarım kullanıcıları, oturumları, hesapları, doğrulamaları, eğitmen profillerini, dersleri, müsaitlikleri, kapalı günleri ve randevuları ilişkileriyle kopyalar. Kaynak SQLite dosyası değiştirilmez. Hedef veritabanındaki tablolardan herhangi biri doluysa aktarım başlamaz. Yeni PostgreSQL kurulumlarında bu adımı atlayın.

## Ortam değişkenleri

| Değişken | Açıklama |
| --- | --- |
| `DATABASE_URL` | PostgreSQL bağlantı adresi |
| `BETTER_AUTH_SECRET` | Oturum ve kimlik doğrulama için gizli anahtar |
| `BETTER_AUTH_URL` | Uygulamanın temel adresi; yerel geliştirme veya yayın adresi |
| `APP_URL` | E-posta bildirimlerindeki bağlantıların temel adresi |
| `SQLITE_DATABASE_URL` | İsteğe bağlı; SQLite aktarımı için kaynak dosyanın adresi |
| `RESEND_API_KEY` | İsteğe bağlı; e-posta gönderimi için Resend anahtarı |
| `EMAIL_FROM` | İsteğe bağlı; doğrulanmış gönderici adresi |

E-posta anahtarı tanımlanmadığında geliştirme ortamındaki bildirimler konsola yazılır.

## Kontroller

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Yayınlama

Uygulama PostgreSQL gerektirir ve Vercel gibi Node.js destekli bir platformda çalıştırılabilir. Yayın ortamında `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` ve `APP_URL` değişkenlerini tanımlayın. E-posta bildirimleri için ayrıca `RESEND_API_KEY` ve doğrulanmış `EMAIL_FROM` gerekir. Örnek seed hesaplarını ve parolalarını üretimde kullanmayın.

Stüdyo adı, iletişim bilgileri, adres ve çalışma saatleri `src/lib/site.ts` dosyasından; stok görselleri ve kaynak bilgileri `public/images/stock/` klasöründen düzenlenebilir.
