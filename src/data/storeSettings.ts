export interface StoreSettings {
  welcomeBarText: string;
  storeName: string;
  storeLogo: string;
  storeIntro: string;
  gridColumns: number;
  templateId: "modern" | "minimal" | "bold" | "dark";
  primaryColor: string;
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
