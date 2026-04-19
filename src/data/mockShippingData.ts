export interface ShippingRate {
  wilaya: string;
  code?: string;
  homePrice: number;
  officePrice: number;
  deliveryTime: string;
}

// Empty defaults — real data comes from the API
export const shippingRates: ShippingRate[] = [];

export const shippingRegions = [
  { name: "الشمال", basePrice: 450 },
  { name: "الشرق", basePrice: 650 },
  { name: "الجنوب", basePrice: 950 },
];
