export interface LandingSettings {
  navbar: {
    links: { name: string; href: string }[];
    loginBtn: string;
    registerBtn: string;
  };
  hero: {
    badge: string;
    titlePart1: string;
    titleGradient: string;
    titlePart2: string;
    description: string;
    primaryBtn: string;
    secondaryBtn: string;
    loginAlt: string;
  };
  features: {
    item1: string;
    item2: string;
    item3: string;
  };
}

export const defaultLandingSettings: LandingSettings = {
  navbar: {
    links: [
      { name: "الرئيسية", href: "#" },
      { name: "كيف يعمل", href: "#how-it-works" },
      { name: "لماذا نحن", href: "#why-us" },
      { name: "المستويات", href: "#levels" },
      { name: "تواصل معنا", href: "#contact" },
    ],
    loginBtn: "تسجيل الدخول",
    registerBtn: "سجّل كمسوّق",
  },
  hero: {
    badge: "منصة التسويق بالعمولة الأولى في الجزائر",
    titlePart1: "ابدأ رحلتك في ",
    titleGradient: "التجارة الإلكترونية",
    titlePart2: "بدون رأس مال",
    description: "سجّل مجانًا، اختر المنتجات، شارك رابط الإحالة، وتابع أرباحك — كل ذلك من هاتفك فقط.",
    primaryBtn: "ابدأ الربح الآن",
    secondaryBtn: "كيف يعمل؟",
    loginAlt: "لديك حساب بالفعل؟ تسجيل الدخول",
  },
  features: {
    item1: "واجهة بسيطة من الجوال",
    item2: "منتجات جاهزة للترويج",
    item3: "عمولة تصل إلى 50%",
  },
};
