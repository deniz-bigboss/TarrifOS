import type { Messages } from "./en";

export const tr: Messages = {
  nav: {
    workflow: "Nasıl çalışır",
    customers: "Kimler için",
    pricing: "Fiyatlandırma",
    login: "Giriş yap",
    signup: "Ücretsiz kaydol",
  },
  hero: {
    badge: "Self servis gümrük hazırlığı çalışma alanı",
    headline: "Ürünlerinizi sevkiyattan önce gümrük için sınıflandırın.",
    description:
      "GTİP/HS kodu adaylarını, eksik bilgi sorularını, belge kontrol listelerini, risk işaretlerini ve gümrük hazırlık raporlarını doğrudan tarayıcınızda oluşturun.",
    ctaPrimary: "Ücretsiz sınıflandırmaya başla",
    ctaSecondary: "SKU listesi yükle",
    trust:
      "Tekrarlayan SKU'larla çalışan ithalatçılar, ihracatçılar, e-ticaret markaları ve lojistik ekipleri için tasarlandı.",
  },
  compare: {
    badge: "Neden Kustaro",
    heading: "Sadece bir HS kodu tahmini değil.",
    genericTitle: "Sıradan yapay zekâ tarife araçları",
    kustaroTitle: "Kustaro",
    genericRows: [
      "Tek bir metin kutusu",
      "Yalnızca bir kod döndürür",
      "Güven artırma imkânı yok",
      "Kayıtlı SKU kütüphanesi yok",
      "Hazırlık iş akışı yok",
      "Zayıf dışa aktarma/raporlama",
      "Tekrarlayan ürünlerde yeniden kullanımı zor",
    ],
    kustaroRows: [
      "Rehberli sınıflandırma sihirbazı",
      "Gerekçeli HS kodu adayları",
      "Güveni artıran eksik bilgi soruları",
      "Gümrük hazırlık puanı",
      "Kayıtlı ürün/SKU kütüphanesi",
      "Dışa aktarılabilir sınıflandırma raporu",
      "Tekrarlayan SKU iş akışları için tasarlandı",
    ],
  },
  problem: {
    badge: "Sorun",
    heading:
      "Ürün bazlı gümrük işleri hâlâ e-posta, elektronik tablo ve kırılgan aramalara sıkışmış durumda.",
    cards: [
      {
        title: "Sınıflandırma belirsizliği",
        body: "Ürün adları nadiren doğrudan bir HS koduna oturur. Kustaro her adayı kanıta, güven puanına ve inceleme işaretlerine dayandırır.",
      },
      {
        title: "Eksik belgeler",
        body: "Sertifikalar ve menşe kanıtları genellikle sınırda ortaya çıkar. Kustaro belge listesini sevkiyattan önce oluşturur, sonra değil.",
      },
      {
        title: "Belirsiz hazırlık",
        body: "Vergi, risk ve eksik bilgiler genellikle fiyat verildikten sonra ortaya çıkar. Kustaro gümrük hazırlığını baştan puanlar; neyi düzelteceğinizi bilirsiniz.",
      },
    ],
  },
  workflow: {
    badge: "Nasıl çalışır",
    steps: [
      "Ürünü rehberli sihirbazda tanımlayın",
      "Gerekçeli ve güven puanlı HS kodu adaylarını alın",
      "Eksik bilgi sorularını yanıtlayıp güveni artırın",
      "İnceleme için gümrük hazırlık raporunu dışa aktarın",
    ],
  },
  customers: {
    badge: "Kimler için",
    heading: "Dünyanın her yerinde, her hatta tekrarlayan SKU ticareti için tasarlandı.",
    rows: [
      "Shopify ve e-ticaret ithalatçıları",
      "Küçük ithalatçı/ihracatçılar",
      "Tekrarlayan SKU'larla çalışan lojistik ekipleri",
      "Ön sınıflandırma yapan gümrük müşavirleri",
    ],
  },
  example: {
    badge: "Örnek çıktı",
    heading: "Sohbet dökümü değil, gümrük hazırlık raporları.",
    body: "Her sonuç HS kodu adaylarını, güven puanını, eksik bilgi sorularını, gerekli belge listesini, risk işaretlerini ve 100 üzerinden gümrük hazırlık puanını içerir.",
    readiness: "Gümrük hazırlığı",
    ready: "incelemeye hazır",
    actions: ["HS kodu adayını doğrula", "Menşe kanıtını topla", "3 açık soruyu yanıtla"],
    planText:
      "Pamuklu tişört örneği: %84 güvenle 6109.10 önerilen aday; menşe şahadetnamesi doğrulanmamış ve bir alternatif kod hâlâ olası — hazırlık 78/100, açık sorular inceleme için listelenir.",
  },
  pricingPreview: {
    badge: "Fiyat önizlemesi",
    heading: "Ücretsiz başlayın, SKU'lar arttıkça yükseltin.",
    plans: {
      free: "Ayda 3 ücretsiz sınıflandırma — kart gerekmez.",
      starter: "Kayıtlı SKU kütüphanesi ve dışa aktarmayla 50 sınıflandırma.",
      pro: "250 sınıflandırma, toplu yükleme betası ve tam geçmiş.",
    },
  },
  disclaimer:
    "Uyum notu: Kustaro çıktıları, mevcut ürün bilgileri ve tarife referans verilerinden üretilen gümrük hazırlık önerileridir. Hukuki tavsiye değildir ve gümrük idarelerince kabul garantisi vermez. Nihai sınıflandırma ve gümrük beyanları resmî kullanım öncesinde doğrulanmalıdır.",
  footer: {
    tagline:
      "Kustaro, ürün bilgileri ve tarife referans verilerinden üretilen gümrük hazırlık önerileri sunar. Hukuki tavsiye değildir ve gümrük idarelerince kabul garantisi vermez. Nihai sınıflandırma ve beyanlar resmî kullanım öncesinde doğrulanmalıdır.",
    pricing: "Fiyatlandırma",
    login: "Giriş yap",
    signup: "Kaydol",
  },
  legal: {
    privacy: "Gizlilik Politikası",
    terms: "Hizmet Şartları",
    lastUpdated: "Son güncelleme",
    authoritativeNote:
      "Bu belge İngilizce olarak sunulmaktadır. Bağlayıcı metin İngilizce sürümdür; arayüz çevirileri bu metni değiştirmez.",
    consentPrefix: "Hesap oluşturarak şunları kabul etmiş olursunuz:",
    and: "ve",
  },
  auth: {
    loginTitle: "Tekrar hoş geldiniz",
    loginSubtitle: "Kustaro çalışma alanınıza giriş yapın.",
    signupTitle: "Çalışma alanınızı oluşturun",
    signupSubtitle:
      "İlk ürününüzü dakikalar içinde sınıflandırın. Çalışma alanı otomatik oluşturulur — kredi kartı gerekmez.",
    fullName: "Ad soyad",
    email: "İş e-postası",
    password: "Şifre",
    createAccount: "Hesap oluştur",
    login: "Giriş yap",
    haveAccount: "Zaten hesabınız var mı?",
    noAccount: "Kustaro'da yeni misiniz?",
    checkEmail: "Hesabınızı doğrulamak için e-postanızı kontrol edin, sonra giriş yapın.",
  },
  language: "Dil",
  pricing: {
    badge: "Fiyatlandırma",
    title: "SKU'larınızla birlikte ölçeklenen self servis planlar.",
    subtitle:
      "Her plan aynı HS kodu adaylarını, hazırlık puanlarını ve dışa aktarılabilir raporları üretir — hacim, SKU kütüphanesi, toplu yükleme ve ekip özellikleri için yükseltin.",
    mostPopular: "En popüler",
    perMonth: "/ay",
    starting: "başlangıç",
    meteringBadge: "API",
    meteringTitle: "Kustaro API — bekleme listesi.",
    meteringBody:
      "Kustaro API, ekiplerin ürünleri sınıflandırmasına, gümrük hazırlık raporlarını almasına ve HS kodu adayı iş akışlarını iç sistemlere entegre etmesine olanak tanıyacak. Erken erişim için bize ulaşın.",
    howItWorks: "Limitler nasıl işler",
    notePre: "Her",
    notePost:
      "sınıflandırma, aylık plan limitinize bir kredi olarak sayılır ve kullanım kaydı olarak tutulur.",
    tiles: [
      "1 ürün = 1 sınıflandırma kredisi",
      "Limitler her ay sıfırlanır",
      "Eski sınıflandırmalar görüntülenebilir kalır",
    ],
    plans: {
      free: {
        desc: "Kustaro'yu ilk ürünlerinizde deneyin.",
        cta: "Ücretsiz başla",
        features: [
          "Ayda 3 sınıflandırma",
          "Rehberli sınıflandırma sihirbazı",
          "Gümrük hazırlık puanı",
          "Temel dışa aktarma (Markdown / JSON)",
        ],
      },
      starter: {
        desc: "Tekrarlayan SKU'ları olan küçük ithalatçılar için.",
        cta: "Starter'ı seç",
        features: [
          "Ayda 50 sınıflandırma",
          "Kayıtlı SKU kütüphanesi",
          "Sınıflandırma geçmişi",
          "Rapor dışa aktarma",
        ],
      },
      pro: {
        desc: "Hacimli sınıflandırma yapan büyüyen markalar için.",
        cta: "Pro'yu seç",
        features: [
          "Ayda 250 sınıflandırma",
          "Toplu yükleme (beta)",
          "PDF / CSV dışa aktarma",
          "Sınıflandırma geçmişi",
          "Kayıtlı SKU kütüphanesi",
        ],
      },
      business: {
        desc: "Her sevkiyatı sınıflandıran ekipler için.",
        cta: "Business'ı seç",
        features: [
          "Ayda 1.000 sınıflandırma",
          "Ekip çalışma alanı (erken erişim)",
          "API erişimi",
          "Öncelikli limitler",
          "Toplu yükleme (beta)",
        ],
      },
      forwarder: {
        desc: "Özel hacimli forwarder ve müşavirler için.",
        cta: "Bizimle görüşün",
        features: [
          "Özel hacim",
          "Ekip çalışma alanı (erken erişim)",
          "API erişimi",
          "Özel iş akışları",
          "Kurulum desteği",
        ],
      },
    },
  },
  app: {
    sidebar: {
      tagline: "Gümrük hazırlığı çalışma alanı",
      newPlan: "Yeni sınıflandırma",
      nav: {
        dashboard: "Panel",
        plans: "Sınıflandırmalar",
        products: "Ürünler",
        bulkUpload: "Toplu yükleme",
        apiKeys: "API anahtarları",
        billing: "Planlar",
      },
    },
    topbar: {
      plan: "planı",
      upgrade: "Yükselt",
      signOut: "Çıkış yap",
    },
    plansTitle: "Sınıflandırmalar",
    plansSubtitle: "Çalışma alanınızın yürüttüğü tüm sınıflandırmalar.",
    wizard: {
      newTitle: "Ürün sınıflandır",
      newSubtitle:
        "Rehberli bilgiler girin, gümrük hazırlığı alın: gerekçeli HS kodu adayları, güven puanı, açık sorular, belge listesi, risk işaretleri ve dışa aktarılabilir rapor.",
      steps: ["Ürün", "Özellikler", "Ticaret hattı", "Belgeler", "Oluştur"] as [
        string,
        string,
        string,
        string,
        string,
      ],
      prefill: "Demo doldur:",
      demoTshirt: "Pamuklu tişört",
      demoBattery: "E-bisiklet bataryası",
      quickFind: "Hızlı Bul",
      quickFindPlaceholder: "örn. S-Works Tarmac SL9",
      quickFindHelp:
        "Marka + model yazın; açıklama, malzeme, kullanım, kategori, marka, model ve birim ağırlığı biz dolduralım.",
      quickFindConfirm:
        "Aşağıdaki alanlar artık düzenlenebilir (ticaret hattı adımındaki birim ağırlık da önceden dolduruldu) — kontrol edin, hatalıysa düzeltin, sonra devam etmeden önce onaylayın.",
      quickFindNudge: "Devam etmeden önce bilgilerin doğruluğunu onaylayın.",
      optional: "(isteğe bağlı)",
      select: "Seçin…",
      fields: {
        productName: "Ürün adı",
        productDescription: "Ürün açıklaması",
        material: "Malzeme / bileşim",
        intendedUse: "Kullanım amacı",
        category: "Kategori",
        brand: "Marka",
        model: "Model",
        sku: "SKU",
        originCountry: "Menşe ülkesi",
        destinationCountry: "Varış ülkesi",
        supplierCountry: "Tedarikçi ülkesi",
        shippingMethod: "Taşıma yöntemi",
        declaredValue: "Beyan değeri",
        currency: "Para birimi",
        quantity: "Miktar",
        unitWeight: "Birim ağırlık (kg)",
        invoiceText: "Fatura metni (yapıştırın)",
        specText: "Ürün teknik metni (yapıştırın)",
        certificate: "Bu ürün için menşe şahadetnamesi mevcut",
      },
      factsIntro: "Bunlardan hangileri ürünü tanımlıyor?",
      factsHint:
        "Bu işaretler yüksek riskli kategorileri (batarya, gıda, kozmetik, kimyasal, medikal, çift kullanımlı…) doğru kontrol ve belgelere yönlendirir.",
      flags: {
        is_textile: "Tekstil ürünü",
        is_electronics: "Elektronik",
        contains_battery: "Batarya içeriyor",
        is_food: "Gıda ürünü",
        is_cosmetic: "Kozmetik ürün",
        is_medical_or_health_related: "Medikal / sağlıkla ilgili",
        is_chemical: "Kimyasal ürün",
        is_dual_use_or_restricted: "Çift kullanımlı veya kısıtlı",
      },
      invoicePlaceholder: "Ticari fatura kalemlerini buraya yapıştırın (isteğe bağlı)…",
      specPlaceholder: "Ürün teknik dökümanı metnini buraya yapıştırın (isteğe bağlı)…",
      supplierHint:
        "Satın aldığınız veya sevkiyat yaptığınız yer — yalnızca menşe (üretim) ülkesinden farklıysa seçin. Uyuşmazlık, menşe kanıtı kontrol noktası ekler.",
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
        "İsteğe bağlı olarak fatura veya teknik metin yapıştırın ve mevcut sertifikaları belirtin — hazırlık değerlendirmesini iyileştirir. Dosya yükleme şimdilik yalnızca meta veriyi kaydeder (tam çıkarım yakında).",
      clickToSelect: "Dosya seçmek için tıklayın",
      fileTypes: "PDF, metin, görseller",
      reviewTitle: "Gözden geçir ve oluştur",
      reviewProduct: "Ürün",
      reviewTradeLane: "Ticaret hattı",
      reviewDocuments: "Eklenen belgeler",
      reviewFlags: "Ürün özellikleri",
      reviewNote:
        "Açıklamayı normalize edecek, aday kodları getirecek, üzerinde akıl yürütecek ve güven puanlı bir gümrük hazırlık raporu üreteceğiz. Yüksek riskli veya düşük güvenli kalemler inceleme için işaretlenir.",
      confirmRecommendation:
        "Bu sonucun inceleme amaçlı bir gümrük hazırlık önerisi olduğunu — nihai gümrük sınıflandırması veya hukuki tavsiye olmadığını — anlıyorum.",
      confirmNudge: "Oluşturmadan önce yalnızca-öneri notunu onaylayın.",
      back: "Geri",
      continue: "Devam",
      classify: "Sınıflandırmayı oluştur",
    },
  },
};
