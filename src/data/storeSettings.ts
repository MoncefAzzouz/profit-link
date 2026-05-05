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
  pixels?: {
    facebook: string;
    tiktok: string;
    snapchat: string;
  };
}

export const defaultStoreSettings: StoreSettings = {
  welcomeBarText: "",
  storeName: "",
  storeLogo: "",
  storeIntro: "",
  gridColumns: 6,
  templateId: "modern",
  primaryColor: "#10b981",
  fontFamily: "Cairo",
  hero: {
    enabled: true,
    bannerUrl: "",
    title: "",
    subtitle: "",
  },
  usp: {
    enabled: true,
    items: [
      { icon: "Truck", text: "" },
      { icon: "ShieldCheck", text: "" },
      { icon: "CreditCard", text: "" },
    ],
  },
  support: {
    whatsappFloating: true,
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    phone: "",
    whatsapp: "",
  },
  footerInfo: {
    privacyPolicyLink: "#",
    termsLink: "#",
  },
  pixels: {
    facebook: "",
    tiktok: "",
    snapchat: "",
  }
};
