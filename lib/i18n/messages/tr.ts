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
  legal: {
    privacy: "Gizlilik Politikası",
    terms: "Hizmet Şartları",
    lastUpdated: "Son güncelleme",
    authoritativeNote:
      "Bu belge İngilizce olarak sunulmaktadır. İngilizce sürüm bağlayıcı metindir; arayüz çevirileri bu metni değiştirmez.",
    consentPrefix: "Hesap oluşturarak şunları kabul etmiş olursunuz:",
    and: "ve",
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
  pricing: {
    badge: "Fiyatlandırma",
    title: "Ücretsiz başlayın, API hacmine ölçekleyin.",
    subtitle:
      "Her plan aynı sevkiyat planlarını, belge kontrol listelerini ve gümrük müşavirine hazır raporları üretir — hacim, ekip üyeleri ve API için yükseltin.",
    mostPopular: "En popüler",
    perMonth: "/ay",
    starting: "başlangıç",
    meteringBadge: "API ölçümü",
    meteringTitle: "Kullanıma dayalı API fiyatlandırması.",
    meteringBody:
      "Hacme ve zenginleştirme düzeyine bağlı olarak sınıflandırma başına 0,20–2,00 USD. Forwarder ve Enterprise planlarında hacim ve zenginleştirme indirimleri mevcuttur.",
    howItWorks: "Ölçüm nasıl çalışır",
    notePre: "Her",
    notePost:
      "çağrısı planınızda bir sınıflandırma olarak sayılır ve ölçüm için bir kullanım kaydı oluşturur.",
    tiles: [
      "1 API çağrısı = 1 sınıflandırma",
      "Ölçekte hacim indirimleri",
      "Zenginleştirme düzeyine göre fiyat",
    ],
    plans: {
      free: {
        desc: "TariffOS'u manuel sınıflandırmalarla deneyin.",
        cta: "Ücretsiz başla",
        features: [
          "Ayda 10 sınıflandırma",
          "Yalnızca manuel giriş",
          "Temel dışa aktarma (Markdown / JSON)",
          "Tek kullanıcı",
        ],
      },
      starter: {
        desc: "Tekrarlayan SKU gönderen küçük ithalatçılar için.",
        cta: "Starter'ı seç",
        features: [
          "Ayda 100 sınıflandırma",
          "Sınıflandırma geçmişi",
          "Rapor dışa aktarma",
          "Temel e-posta desteği",
        ],
      },
      growth: {
        desc: "API'ye ihtiyaç duyan büyüyen markalar ve ekipler için.",
        cta: "Growth'u seç",
        features: [
          "Ayda 1.000 sınıflandırma",
          "API erişimi",
          "Belge yükleme",
          "Ekip çalışma alanı",
          "Geri bildirim ve öğrenme döngüsü",
        ],
      },
      forwarder: {
        desc: "Yüksek hacimli nakliye komisyoncuları ve müşavirler için.",
        cta: "Satışla görüş",
        features: [
          "Ayda 5.000+ sınıflandırma",
          "API erişimi",
          "Özel iş akışları",
          "Öncelikli inceleme kuyruğu",
          "Kurulum desteği",
        ],
      },
      enterprise: {
        desc: "Özel veri ve uyum ihtiyaçları olan kurumlar için.",
        cta: "Bize ulaşın",
        features: [
          "Özel tarife verisi adaptörleri",
          "SSO ve denetim kayıtları",
          "SLA ve özel destek",
          "Özel hacim",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Sevkiyat operasyon ajanı",
      newPlan: "Yeni sevkiyat planı",
      nav: {
        dashboard: "Panel",
        plans: "Sevkiyat planları",
        apiKeys: "API anahtarları",
        billing: "Planlar",
      },
    },
    topbar: {
      plan: "planı",
      upgrade: "Yükselt",
      signOut: "Çıkış yap",
    },
    plansTitle: "Sevkiyat planları",
    plansSubtitle: "Çalışma alanınızın yürüttüğü tüm sınıflandırmalar.",
    wizard: {
      newTitle: "Yeni sınıflandırma",
      newSubtitle:
        "Kanıtlı, güven puanlı ve gümrük müşavirine hazır raporlu bir tarife kodu önerisi almak için ürün bilgilerini girin.",
      steps: ["Ürün", "Ticaret hattı", "Belgeler", "İnceleme"],
      prefill: "Örnek doldur:",
      demoTshirt: "Pamuklu tişört",
      demoBattery: "E-bisiklet bataryası",
      quickFind: "Hızlı Bul",
      quickFindPlaceholder: "örn. S-Works Tarmac SL9",
      quickFindHelp:
        "Marka + model yazın; açıklamayı, malzemeyi, kullanımı, kategoriyi, markayı, modeli ve birim ağırlığı biz dolduralım.",
      quickFindConfirm:
        "Aşağıdaki alanlar artık düzenlenebilir (bir sonraki adımdaki birim ağırlık da önceden dolduruldu) — kontrol edin, hatalı olanları düzeltin ve devam etmeden önce onaylayın.",
      quickFindNudge: "Devam etmeden önce bilgilerin doğru olduğunu onaylayın.",
      optional: "(isteğe bağlı)",
      select: "Seçin…",
      fields: {
        productName: "Ürün adı",
        productDescription: "Ürün açıklaması",
        material: "Malzeme / bileşim",
        intendedUse: "Kullanım amacı",
        category: "Kategori",
        brand: "Marka",
        sku: "Model / SKU",
        originCountry: "Menşe ülkesi",
        destinationCountry: "Varış ülkesi",
        supplierCountry: "Tedarikçi ülkesi",
        shippingMethod: "Taşıma yöntemi",
        declaredValue: "Beyan edilen değer",
        currency: "Para birimi",
        quantity: "Adet",
        unitWeight: "Birim ağırlık (kg)",
      },
      supplierHint:
        "Satın aldığınız veya sevkiyatın yapıldığı ülke — yalnızca menşe (üretim) ülkesinden farklıysa seçin. Uyumsuzluk, planınıza bir menşe kanıtı kontrol noktası ekler.",
      roadUnavailable:
        "Bu hat için karayolu kullanılamaz — bu ülkeler arasında kara bağlantısı yok.",
      methods: {
        sea: "Deniz yolu",
        air: "Hava yolu",
        road: "Karayolu",
        roadNoRoute: "Karayolu (kara bağlantısı yok)",
        courier: "Kurye / koli",
      },
      documentsIntro:
        "İsteğe bağlı olarak destekleyici belgeler ekleyin (ticari fatura, çeki listesi, tedarikçi teknik föyü, ürün kataloğu). Şimdilik yalnızca dosya bilgilerini kaydediyoruz — tam içerik çıkarma henüz sınıflandırmayı etkilemez.",
      clickToSelect: "Dosya seçmek için tıklayın",
      fileTypes: "PDF, metin, görseller",
      reviewTitle: "İncele ve sınıflandır",
      reviewProduct: "Ürün",
      reviewTradeLane: "Ticaret hattı",
      reviewDocuments: "Eklenen belgeler",
      reviewNote:
        "Açıklamayı normalleştirecek, aday kodları getirecek, üzerlerinde akıl yürütecek ve güven puanlı, gümrük müşavirine hazır bir rapor üreteceğiz. Yüksek riskli veya düşük güvenli kalemler incelemeye işaretlenir.",
      back: "Geri",
      continue: "Devam",
      classify: "Ürünü sınıflandır",
    },
  },
};
