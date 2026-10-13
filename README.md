# Ritim Stüdyo

Türkçe bateri stüdyosu sitesi ve randevu uygulaması. Ziyaretçiler hoca/ders/saat seçerek randevu oluşturabilir; öğrenciler randevularını takip edebilir; hocalar kendi öğrenci bilgilerini ve randevularını görüp ders saatini değiştirebilir. Ortak hoca programında diğer hocaların dolu saatleri görünür, öğrenci iletişim bilgileri gizli kalır. Yönetici tüm hocaları ve randevuları görebilir.

## Yerel geliştirme

Gereksinimler: Node.js 20 veya üzeri.

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

İlk kurulumda önce `.env.example` dosyasını `.env` olarak kopyalayın. Windows PowerShell'de `Copy-Item .env.example .env`, macOS/Linux'ta `cp .env.example .env` kullanabilirsiniz. Sonra `BETTER_AUTH_SECRET` için rastgele bir gizli anahtar belirleyin.

Site: <http://localhost:3000>

### Örnek girişler

| Rol | E-posta | Şifre |
|---|---|---|
| Yönetici | `admin@ritimstudyo.com` | `Admin123!` |
| Hoca | `deniz@ritimstudyo.com` | `Hoca123!` |
| Hoca | `mert@ritimstudyo.com` | `Hoca123!` |
| Hoca | `elif@ritimstudyo.com` | `Hoca123!` |
| Öğrenci | `ogrenci@ritimstudyo.com` | `Ogrenci123!` |

Bu hesaplar örnek veridir. Gerçek kullanıma almadan önce şifreleri değiştirin ve örnek hoca bilgilerini güncelleyin.

## Yapılandırma

- Stüdyo adı, telefon, e-posta, adres, harita ve çalışma saatleri: `src/lib/site.ts`
- Galeri/hero stok fotoğrafları: `public/images/stock/`; kaynak ve lisans kayıtları aynı klasördeki `CREDITS.md` içinde. Bunları gerçek stüdyo fotoğraflarınızla değiştirebilir, yolları `src/lib/site.ts` içinden düzenleyebilirsiniz.
- Veritabanı, auth sırrı ve uygulama adresi: `.env` (git'e dahil edilmez).
- E-posta bildirimleri: `.env` içine Resend API anahtarı ekleyip `EMAIL_FROM` değerini doğrulanmış gönderici adresinizle değiştirin. Anahtar yokken geliştirme ortamında e-posta gönderimi konsola kaydedilir.

Randevu akışında oda kapasitesi tek oda olarak uygulanır: herhangi bir hocanın aktif randevusu aynı saat aralığını tüm hocalar için kapatır. Ödeme randevu sırasında alınmaz; stüdyoda yapılır.

## Yayınlama notu

Yerel geliştirme için SQLite kullanılır. Uygulamayı Vercel gibi sunucusuz bir ortama yayınlamadan önce kalıcı PostgreSQL veritabanına geçin; SQLite dosyası sunucusuz dağıtımlarda kalıcı depolama olarak kullanılamaz. Yayın ortamında `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `APP_URL`, `RESEND_API_KEY` ve `EMAIL_FROM` değerlerini tanımlayın; örnek hesapları/şifreleri üretim ortamında kullanmayın.

## Kontroller

```bash
npm run lint
npx tsc --noEmit
npm run build
```
