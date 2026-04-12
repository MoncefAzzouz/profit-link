export interface StoreSettings {
  welcomeBarText: string;
  storeName: string;
  storeLogo: string;
  storeIntro: string;
  gridColumns: number;
  templateId: "modern" | "minimal" | "bold" | "dark";
  primaryColor: string;
  fontFamily: "Cairo" | "Tajawal" | "IBM Plex Sans Arabic";
  hero: {
    enabled: boolean;
    bannerUrl: string;
    title: string;
    subtitle: string;
  };
  usp: {
    enabled: boolean;
    items: { icon: string; text: string }[];
  };
  support: {
    whatsappFloating: boolean;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    phone: string;
    whatsapp: string;
  };
  footerInfo: {
    privacyPolicyLink: string;
    termsLink: string;
  };
}

export const defaultStoreSettings: StoreSettings = {
  welcomeBarText: "أهلاً بكم في متجرنا الرسمي - تسوق أفضل المنتجات بأفضل الأسعار",
  storeName: "متجري المفضل",
  storeLogo: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=200",
  storeIntro: "نحن نقدم مجموعة مختارة من المنتجات عالية الجودة مع ضمان التوصيل السريع لجميع الولايات.",
  gridColumns: 6,
  templateId: "modern",
  primaryColor: "#10b981",
  fontFamily: "Cairo",
  hero: {
    enabled: true,
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600",
    title: "مجموعة الصيف المميزة",
    subtitle: "اكتشف أحدث التوجهات في عالم الموضة والجمال",
  },
  usp: {
    enabled: true,
    items: [
      { icon: "Truck", text: "توصيل سريع لـ 58 ولاية" },
      { icon: "ShieldCheck", text: "ضمان الجودة 100%" },
      { icon: "CreditCard", text: "الدفع عند الاستلام" },
    ],
  },
  support: {
    whatsappFloating: true,
  },
  socialLinks: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    phone: "0550000000",
    whatsapp: "0550000000",
  },
  footerInfo: {
    privacyPolicyLink: "#",
    termsLink: "#",
  },
};
