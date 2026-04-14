export interface ShippingRate {
  wilaya: string;
  homePrice: number;
  officePrice: number;
  deliveryTime: string;
}

export const shippingRates: ShippingRate[] = [
  { wilaya: "الجزائر العاصمة", homePrice: 300, officePrice: 200, deliveryTime: "24-48 ساعة" },
  { wilaya: "البليدة", homePrice: 500, officePrice: 400, deliveryTime: "48-72 ساعة" },
  { wilaya: "تيبازة", homePrice: 500, officePrice: 400, deliveryTime: "48-72 ساعة" },
  { wilaya: "بومرداس", homePrice: 500, officePrice: 400, deliveryTime: "48-72 ساعة" },
  { wilaya: "وهران", homePrice: 600, officePrice: 500, deliveryTime: "2-4 أيام" },
  { wilaya: "قسنطينة", homePrice: 600, officePrice: 500, deliveryTime: "2-4 أيام" },
  { wilaya: "سطيف", homePrice: 600, officePrice: 500, deliveryTime: "2-4 أيام" },
  { wilaya: "تيزي وزو", homePrice: 550, officePrice: 450, deliveryTime: "2-3 أيام" },
  { wilaya: "بجاية", homePrice: 600, officePrice: 500, deliveryTime: "3-4 أيام" },
  { wilaya: "عنابة", homePrice: 700, officePrice: 600, deliveryTime: "3-5 أيام" },
  { wilaya: "تلمسان", homePrice: 700, officePrice: 600, deliveryTime: "3-5 أيام" },
  { wilaya: "بسكرة", homePrice: 800, officePrice: 700, deliveryTime: "4-6 أيام" },
  { wilaya: "ورقلة", homePrice: 900, officePrice: 800, deliveryTime: "5-7 أيام" },
  { wilaya: "غرداية", homePrice: 850, officePrice: 750, deliveryTime: "4-6 أيام" },
  { wilaya: "بشار", homePrice: 1000, officePrice: 900, deliveryTime: "6-8 أيام" },
  { wilaya: "تمنراست", homePrice: 1200, officePrice: 1000, deliveryTime: "7-10 أيام" },
  { wilaya: "أدرار", homePrice: 1100, officePrice: 950, deliveryTime: "7-10 أيام" },
];

export const shippingRegions = {
  north: { label: "الشمال", wilayas: ["الجزائر", "البليدة", "تيبازة", "بومرداس", "تيزي وزو"], basePrice: 450 },
  east: { label: "الشرق", wilayas: ["قسنطينة", "سطيف", "عنابة", "سكيكدة", "بجاية"], basePrice: 650 },
  west: { label: "الغرب", wilayas: ["وهران", "تلمسان", "مستغانم", "بلعباس"], basePrice: 650 },
  south: { label: "الجنوب", wilayas: ["ورقلة", "بشار", "غرداية", "تمنراست", "أدرار"], basePrice: 950 },
};
