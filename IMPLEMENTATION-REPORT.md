# Uygulama raporu — 5 Kasım 2026

Bu raporda “yerelde hazır”, canlıya yayınlandığı anlamına gelmez.

| Başlık | Tamamlanan | Bekleyen / koşullu |
| --- | --- | --- |
| 1. Yayın | Gerçek baseURL, ortam ayrımı, Extended 0.166.0 kontrolü, submodule hazırlama betiği; taslak/gelecek tarih testleri | Hosting sağlayıcısı, deployment entegrasyonu, HTTPS/yönlendirme/404 |
| 2. SEO | Sayfa açıklaması, SEO başlığı, canonical, OG/X, paylaşım görseli; çeviriye bağlı hreflang | Gerçek çeviriler ve nihai yazı başlıkları |
| 3. İndeksleme | Robots, noindex, filtreli sitemap, boş arşivlerin dışlanması, preview noindex | Search Console; özel preview için hosting erişim kontrolü |
| 4. JSON-LD | Person/ProfilePage/Article/BlogPosting ve yazar/tarih bilgileri; JSON doğrulaması | Google Rich Results Test; breadcrumb gezinmesi eklenmediği için BreadcrumbList eklenmedi |
| 5. İçerik | Placeholder yazılar taslak; konu/etiket kuralları ve araştırma şablonu | Özgün araştırma, kanıt, CVE/CWE eşleşmeleri, kaynaklar, disclosure ve gerçek iç bağlantılar |
| 6. Hugo içerik | Archetype, yazar/tarih, isteğe bağlı TOC, etiketler, ilgili yazılar, sayfalama, arşiv girişleri, RSS bağlantısı | İçerik arttığında arama; uzun gerçek yazılarla görsel kontrol |
| 7. İletişim | Amaç seçenekleri, açık kopyalama davranışı, doğru hata mesajı, genel profil linklerinin kaldırılması | Gerçek form servisi/CV ancak ihtiyaç ve bilgi olduğunda |
| 8. Performans | 168/336px WebP profil görselleri, CSS/JS minify ve fingerprint/SRI | Canlı Lighthouse, cache/sıkıştırma; fontların yerelleştirilmesi isteğe bağlı |
| 9. Erişilebilirlik | JS olmadan görünür içerik, skip link, odak stilleri, azaltılmış hareket, klavye seçici | Mobil/kontrast/ekran okuyucu denetimi tam kapsamlı yapılmadı |
| 10. Bakım | Proje seviyesinde template ve asset override, gitignore, README, bağımsız kontrol betiği | Commit/CI/deployment; hosting güvenlik başlıkları; security.txt için gerçek iletişim adresi |
| 11. Temizlik | Favicon; geçersiz Apple touch SVG bildiriminin kaldırılması; placeholder yayınlarının önlenmesi | Opsiyonel kullanılmayan tema bileşenleri korunuyor; ek sayaç/yorum scripti eklenmedi |

## Doğrulama kanıtı

- Production ve preview derlemeleri başarıyla çalıştı.
- İzole test içerikleriyle draft/future dışlama, sayfa açıklaması, canonical, Article JSON-LD, noindex ve sitemap filtreleme geçti.
- Tarayıcıda boş e-posta doğrulaması, ok tuşuyla amaç listesini açma, Enter ile seçim ve başarılı panoya kopyalama kontrol edildi.
- Profil görseli 1.761.134 bayt kaynak PNG yerine 5.898 / 16.160 bayt WebP seçenekleriyle sunuluyor.
- Canlı alan adı web aracıyla doğrulanamadı; bu sonuç sitenin kesinlikle kapalı olduğu anlamına gelmez.

## Sonraki gerekli bilgiler

Hosting GitHub Pages olarak belirlendi. Repository bağlantısı/yayın erişimi, Search Console mülkiyet doğrulaması ve yayınlanacak gerçek içerikler bekliyor. Bu bilgiler olmadan canlı kontrol ve içerik gerektiren maddeler tamamlandı sayılmaz.

## Ek ilerleme

### Canlı denetim ve Search Console

- Kullanıcının bildirimiyle sitemap gönderimi, canlı ana sayfa URL denetimi ve dizine ekleme isteği başarıyla tamamlandı. Bu, Google'ın sayfayı kesin olarak indekslediği anlamına gelmez.
- Kontrast düzeltmesi testleri tekrar geçti; yayın için hazırlandı. HTTP → HTTPS zorlaması açık olmasına rağmen bu ortamdan alınan son HTTP yanıtı hâlâ 200: yönlendirme doğrulaması henüz tamamlanmadı.

- HTTPS güncellemesi: Kullanıcının açık onayıyla özel alan adı kaldırılıp yeniden eklendi. Sertifika approved durumuna geçti; hem ana alan adını hem www adresini kapsıyor (son geçerlilik: 2027-02-03). TLS doğrulaması başarılı, HTTPS ana sayfa ve sitemap 200, olmayan URL 404, HTTPS www → ana alan adı 301. Enforce HTTPS etkinleştirildi; HTTP uç önbellek yayılımı ayrıca kontrol ediliyor.

- Kaynaklar GitHub main dalına gönderildi; 42057256376 numaralı Actions çalışmasının ikinci denemesinde build ve deployment başarılı.
- DNS A kayıtları GitHub Pages IP'lerini, www CNAME kaydı baranertemir.github.io adresini gösteriyor.
- HTTP üzerinden ana sayfa, sitemap, robots ve paylaşım görseli 200; olmayan URL 404; www ana alan adına 301 dönüyor.
- Son doğrudan kontrolde HTTPS sertifikası null ve TLS alan adı eşleşmesi başarısızdı. HTTPS zorlaması açılmadı. Daha sonraki web aracı da HTTPS adresine erişemedi; bu son araç sonucu tek başına sertifika teşhisi değildir.
- Google Rich Results Test: ana sayfada 1 geçerli ProfilePage. Sonuç: https://search.google.com/test/rich-results/result?id=HWEy_YWuRYJS2wQxij6A3w
- Mobil PageSpeed ilk ölçüm (HTTP): Performans 95, Erişilebilirlik 96, En İyi Uygulamalar 78, SEO 100; FCP 1,4 sn, LCP 2,4 sn, TBT 0 ms, CLS 0.003. Bunlar laboratuvar ölçümleridir. Sonuç: https://pagespeed.web.dev/analysis/http-baranertemir-com/x2v13e4x9s?form_factor=mobile
- Kontrast düzeltmesi yerelde hazır: vurgu/yüzey 5.84:1, düğme metni/vurgu 6.56:1. Placeholder şeffaflığı ve footer metin saydamlığı kaldırıldı. Testler geçti; bu değişiklik henüz commit/push edilmedi.
- Kullanıcının paylaştığı Search Console ekranı ve TXT doğrulaması açıklamasıyla alan adı mülkiyeti doğrulandı. Sitemap gönderimi ve URL denetimi henüz yapılmadı.
- Kullanıcı içerikleri kendisi sağlayacak; yazılar taslak kalacak. Gerçek iletişim adresi/CV bilgisi henüz verilmedi.
- Yerel font indirme komutu, otomatik onay incelemesi kullanım sınırına takıldığı için çalışmadı. Bu güvenlik reddi değil, onay hizmeti hatasıdır. Harici font kullanımı korunuyor.

- Yerel sunucu `-D` ile aynı 62032 portunda yeniden başlatıldı; Articles ve Blogs tarayıcıda doğrulandı.
- İkinci ve sonraki arşiv sayfaları kendi canonical adresini ve numaralı başlığını alıyor. Çok yazılı test eklendi ve geçti.
- 390px genişlikte ana sayfa ve mevcut makalede yatay sayfa taşması görülmedi. Uzun kod/tablo içeren içeriklerin kapsamlı testi bekliyor.
- GitHub Pages workflow'u hazırlandı: sabit Hugo sürümü, SHA-256 kontrolü, submodule checkout, otomatik test, production build ve varsayılan daldan deployment. GitHub üzerinde henüz çalıştırılmadı.
