# DipNot

Gezinirken web sayfalarından kaynak toplayan ve bunlardan tek bir kaynaklı rapor PDF'i üreten Chrome uzantısı. Rapordaki her bilginin hangi sayfanın hangi cümlesinden geldiği gösterilir, kaynaklar arasındaki çelişkiler ayrıca işaretlenir.

> Proje geliştirme aşamasındadır.

## Özellikler

- Sağ tıkla tüm sayfayı ya da yalnızca seçili metni rapora ekleme
- Kaynaklı özet: her madde tıklanabilir kaynak numarası taşır ve ilgili cümleye götürür
- Kaynaklar arası olası çelişkilerin işaretlenmesi
- APA biçiminde kaynakça
- İngilizce sayfalardan Türkçe çıktı
- Dört şablon: ders notu, yönetici özeti, karşılaştırma tablosu, artı-eksi listesi
- Tek format: PDF
- Hesap yok; koleksiyon tarayıcıda durur, sunucuda içerik saklanmaz

## Mimari

| Parça | Teknoloji |
| --- | --- |
| `client/` | Chrome uzantısı: WXT, React, TypeScript, Tailwind CSS, pdfmake |
| `api/` | ASP.NET Core 9 Minimal API (LLM çağrıları, doğrulama, kullanım limiti) |
| Çalıştırma | Docker, Docker Compose |

## Klasör yapısı

```text
dipnot/
├── api/        .NET API, Dockerfile ve testler
├── client/     Chrome uzantısı
└── docker-compose.yml
```

## Çalıştırma

Gereksinimler: Docker, Node.js, Chrome.

Sunucu:

```bash
docker compose up --build
```

Uzantı (ayrı terminalde):

```bash
cd client
npm install
npm run dev
```

## Güvenlik

- API anahtarı ve diğer gizli değerler yalnızca ortam değişkenlerinden okunur; repoya, Docker imajına ya da uzantı paketine girmez.
- `.env` repoya girmez; yalnızca değişken adlarını içeren `.env.example` bulunur.
- Eklenen sayfaların metni sunucuya, oradan LLM sağlayıcıya gönderilir. Sunucu içerik saklamaz ve loglamaz.
