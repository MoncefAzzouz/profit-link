// Diagnose why a specific product isn't appearing on an affiliate's public store.
// Usage:
//   cd backend && npx tsx scratch/diagnose_product_visibility.ts <user-email> <product-name-fragment>
// Example:
//   npx tsx scratch/diagnose_product_visibility.ts nuni.moncef@yahoo.com "Philips Lumea"

import { prisma } from "../src/db";

async function main() {
  const [, , email, ...nameParts] = process.argv;
  const productQuery = nameParts.join(" ");

  if (!email || !productQuery) {
    console.error("Usage: npx tsx scratch/diagnose_product_visibility.ts <email> <product-name>");
    process.exit(1);
  }

  console.log(`\n=== Diagnosing visibility ===\nUser: ${email}\nProduct (contains): ${productQuery}\n`);

  // 1) User
  const user = await prisma.user.findUnique({
    where: { email },
    include: { storeSettings: true },
  });
  if (!user) {
    console.error(`✗ No user with email ${email}`);
    process.exit(1);
  }
  console.log("USER");
  console.log("  id        :", user.id);
  console.log("  email     :", user.email);
  console.log("  role      :", user.role);
  console.log("  storeName :", user.storeName);
  console.log("  storeSettings.affiliateId:", user.storeSettings?.affiliateId);

  // 2) Product(s)
  const products = await prisma.product.findMany({
    where: { name: { contains: productQuery, mode: "insensitive" } },
    select: {
      id: true,
      name: true,
      status: true,
      isVisible: true,
      hasLandingPage: true,
      createdAt: true,
    },
  });
  if (products.length === 0) {
    console.error(`\n✗ No products matched name containing "${productQuery}"`);
    process.exit(1);
  }
  console.log(`\nMATCHING PRODUCTS (${products.length})`);
  for (const p of products) {
    console.log(`  - ${p.id}  | ${p.name}`);
    console.log(`      status=${p.status}  isVisible=${p.isVisible}  hasLandingPage=${p.hasLandingPage}`);
  }

  // 3) Affiliate's storeProductIds (the IDs the affiliate added to their store)
  const config = (user.storeSettings?.config as any) || {};
  const storeProductIds: string[] = Array.isArray(config.storeProductIds) ? config.storeProductIds : [];
  console.log(`\nAFFILIATE'S storeProductIds (${storeProductIds.length})`);
  for (const id of storeProductIds) console.log(`  - ${id}`);

  // 4) Verdict per matching product
  console.log("\n=== VERDICT ===");
  for (const p of products) {
    const reasons: string[] = [];
    if (p.status !== "active") reasons.push(`status="${p.status}" (must be "active")`);
    if (!p.isVisible) reasons.push("isVisible=false");
    if (!p.hasLandingPage) reasons.push("hasLandingPage=false (admin hasn't published landing page)");
    if (!storeProductIds.includes(p.id)) reasons.push("not in affiliate's storeProductIds (affiliate hasn't added it to store)");

    if (reasons.length === 0) {
      console.log(`  ✓ ${p.name} should appear on /store/${user.storeName ?? user.id}`);
    } else {
      console.log(`  ✗ ${p.name} is hidden because:`);
      for (const r of reasons) console.log(`      • ${r}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
