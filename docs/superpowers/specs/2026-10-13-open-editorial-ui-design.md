# Ritim Stüdyo — Sakin Premium UI Tasarım Notu

## Amaç

Mevcut siyah/amber ağırlıklı, çizim ve SVG yer tutucu odaklı görünümü; daha profesyonel, ferah, sakin ve fotoğraf odaklı bir stüdyo kimliğine dönüştürmek. Randevu, hesap ve yönetim işlevlerinin davranışı değişmeyecek.

## Görsel yön

- Daha belirgin sıcak krem/keten zeminler ve fildişi kartlar; grafit metin, yumuşak adaçayı/orman yeşili ve az miktarda mat bronz/şeftali vurgu. Doygun turuncu ve saf siyah geniş yüzeyler kullanılmayacak.
- Daha fazla boşluk, daha okunaklı metin hiyerarşisi ve kontrollü editorial düzen. Tamamı büyük harf başlıklar sınırlandırılacak.
- Hero alanında geniş gerçek davul/stüdyo stok fotoğrafı; kısa başlık ve tek belirgin randevu çağrısı.
- Galeride gerçek stüdyo, bateri seti ve ders ortamı fotoğraflarından oluşan sade, düzenli ve farklı oranlı grid.
- Hoca kartlarında gerçek portre verilene kadar baş harf avatarları korunacak; stok fotoğraflar gerçek hoca portresi gibi kullanılmayacak.
- Header ve logoda emojiler kullanılmayacak; basit bir tipografik wordmark tercih edilecek.
- Randevu adımları ve paneller aynı sakin temaya uyarlanacak; okunabilirlik ve mevcut işlem akışları korunacak.
- Kayan şerit, nabız halkaları ve sürekli süzülen animasyonlar kaldırılacak. Yerlerine kısa opacity/translate geçişleri, fotoğraflarda hafif hover yakınlaşması ve yumuşak ışık vurguları kullanılacak. `prefers-reduced-motion` tercihi desteklenecek.
- Doğrulanmamış "12+ yıl" ve "500+ öğrenci" istatistikleri kaldırılacak; gerçek stüdyo özellikleri öne çıkarılacak.

## Görsel varlıklar

Stok fotoğraflar projede yerel dosya olarak tutulacak; böylece çalışma anında üçüncü taraf görsel sunucusuna bağımlı kalınmayacak. Kullanım kaynağı/lisans bilgisi görsellerle birlikte belgelenecek. Görsellere anlamlı Türkçe alt metin eklenecek.

## Uygulama kapsamı

- Genel renk/typografi, logo/wordmark ve ortak site bileşenlerinin güncellenmesi.
- Ana sayfa hero, galeri, hoca kartları, konum ve CTA alanlarının yeni yöne göre düzenlenmesi.
- Randevu, giriş/kayıt, öğrenci hesabı, hoca ve admin ekranlarının tema tutarlılığı için elden geçirilmesi.
- Mevcut randevu, kimlik doğrulama, tek oda çakışma kontrolü ve rol yetkilerinin korunması.

## Kabul ölçütleri

1. Ana sayfada stok müzik/stüdyo fotoğrafları görünür ve eski SVG galeri yer tutucuları kullanılmıyor.
2. Doygun turuncu, emoji ve sürekli animasyon yoğunluğu azaltılmış; arayüz sakin ve profesyonel görünür.
3. Masaüstü ve mobil görünümler dengeli; mobilde yatay taşma yok.
4. Hareket azaltma tercihi etkinse animasyonlar kapatılır veya minimize edilir.
5. Randevu sihirbazı ile öğrenci/hoca/admin işlevleri çalışmaya devam ediyor.
6. ESLint, TypeScript ve production build kontrolleri başarılı.
