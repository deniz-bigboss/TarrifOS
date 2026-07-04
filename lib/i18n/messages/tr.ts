import type { Messages } from "./en";

export const tr: Messages = {
  nav: {
    workflow: "İş akışı",
    customers: "Müşteriler",
    pricing: "Fiyatlandırma",
    login: "Giriş yap",
    signup: "Ücretsiz kaydol",
  },
  hero: {
    badge: "Yapay zekâ destekli sevkiyat operasyon ajanı",
    description:
      "İthalatçı ve ihracatçılar için ürün bilgilerini GTİP önerilerine, belge kontrol listelerine, uyum kontrol noktalarına, maliyet düşürücü adımlara ve sevkiyat uygulama planlarına dönüştüren yapay zekâ destekli bir çalışma alanı.",
    ctaPrimary: "Sevkiyat planı oluştur",
    ctaSecondary: "Fiyatları gör",
  },
  problem: {
    badge: "Sorun",
    heading:
      "Ürün bazlı gümrük işlemleri hâlâ e-postalara, tablolara ve kırılgan aramalara sıkışmış durumda.",
    cards: [
      {
        title: "Sınıflandırma belirsizliği",
        body: "Ürün adları nadiren bir GTİP koduna net şekilde oturur. TariffOS her öneriyi kanıta, güven puanına ve inceleme adımlarına dayandırır.",
      },
      {
        title: "Eksik belgeler",
        body: "Sertifikalar ve menşe kanıtları genellikle sınırda ortaya çıkar. TariffOS belge kontrol listesini rezervasyondan sonra değil, önce hazırlar.",
      },
      {
        title: "Geç fark edilen maliyet sürprizleri",
        body: "Gümrük vergisi, KDV ve harçlar genellikle anlaşma fiyatlandıktan sonra belirir. TariffOS bunları önceden tahmin eder ve meşru maliyet düşürme yollarını önerir.",
      },
    ],
  },
  workflow: {
    badge: "Nasıl çalışır",
    steps: [
      "Ürün ve ticaret hattı verilerini normalleştir",
      "Kanıtlarla aday GTİP kodlarını getir",
      "Belge ve uyum kontrol noktalarını oluştur",
      "Maliyet adımları ve bir sevkiyat planı üret",
    ],
  },
  customers: {
    badge: "Kimler için",
    heading:
      "Dünyanın her yerinde, her hatta tekrarlayan SKU ticareti için tasarlandı.",
    rows: [
      "Shopify ve e-ticaret ithalatçıları",
      "Küçük ithalatçılar/ihracatçılar",
      "Tekrarlayan SKU'ları yöneten nakliye komisyoncuları",
      "Ön sınıflandırma yapan gümrük müşavirleri",
    ],
  },
  example: {
    badge: "Örnek çıktı",
    heading: "Sohbet dökümleri değil, sevkiyat uygulama planları.",
    body: "Her sonuç aday kodları, güven düzeyini, eksik bilgileri, gerekli belgeleri, uyarıları, sonraki adımları, uyum kontrol noktalarını ve maliyet düşürme kaldıraçlarını içerir.",
    readiness: "Sevkiyata hazırlık",
    ready: "incelemeyle hazır",
    actions: ["GTİP kodunu onayla", "Menşe kanıtı topla", "Navlun tekliflerini karşılaştır"],
    planText:
      "Pamuklu tişört sevkiyatı için ajan planı: çalışma sınıflandırması olarak 6109.10 kullan, fatura ve menşe kanıtını topla, değer esasını doğrula ve rezervasyondan önce taşıyıcı seçeneklerini kıyasla.",
  },
  pricingPreview: {
    badge: "Fiyatlandırma önizlemesi",
    heading: "Dar başla, API hacmine ölçekle.",
    plans: {
      free: "TariffOS'u manuel sınıflandırmalarla deneyin.",
      starter: "Tekrarlayan SKU gönderen küçük ithalatçılar için.",
      growth: "API'ye ihtiyaç duyan büyüyen markalar ve ekipler için.",
    },
  },
  disclaimer:
    "Uyum feragatnamesi: TariffOS çıktıları mevcut ürün bilgileri ve tarife verilerinden üretilen önerilerdir. Hukuki tavsiye değildir. Nihai sınıflandırma, vergi işlemi ve gümrük beyanları yetkili bir gümrük müşaviri veya gümrük idaresi tarafından teyit edilmelidir.",
  footer: {
    tagline:
      "TariffOS, ürün bilgileri ve tarife verilerinden üretilen sınıflandırma önerileri sunar. Hukuki tavsiye değildir. Nihai sınıflandırma ve vergi işlemi yetkili bir gümrük müşaviri veya gümrük idaresi tarafından teyit edilmelidir.",
    pricing: "Fiyatlandırma",
    login: "Giriş yap",
    signup: "Kaydol",
  },
  auth: {
    loginTitle: "Tekrar hoş geldiniz",
    loginSubtitle: "TariffOS çalışma alanınıza giriş yapın.",
    signupTitle: "Çalışma alanınızı oluşturun",
    signupSubtitle:
      "İlk sevkiyat planınızı dakikalar içinde oluşturun. Çalışma alanı otomatik oluşturulur — kredi kartı gerekmez.",
    fullName: "Ad soyad",
    email: "İş e-postası",
    password: "Parola",
    createAccount: "Hesap oluştur",
    login: "Giriş yap",
    haveAccount: "Zaten hesabınız var mı?",
    noAccount: "TariffOS'ta yeni misiniz?",
    checkEmail: "Hesabınızı onaylamak için e-postanızı kontrol edin, ardından giriş yapın.",
  },
  language: "Dil",
};
