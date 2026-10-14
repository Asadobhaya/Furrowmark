import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "../database";
import {
  products,
  variants,
  brands,
  categories,
  searchQueries,
  priceHistory,
  batches,
} from "./schema";

export interface CatalogFilter {
  categoryId?: string;
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
}

export interface CatalogProductSummary {
  id: string;
  name: string;
  slug: string;
  className: string;
  brandName: string;
  categoryName: string;
  startingPriceMinor: number;
}

export async function searchCatalog(
  filter: CatalogFilter,
): Promise<CatalogProductSummary[]> {
  const db = getDb();
  const conditions = [eq(products.status, "published")];

  if (filter.categoryId) {
    conditions.push(eq(products.categoryId, filter.categoryId));
  }
  if (filter.brandId) {
    conditions.push(eq(products.brandId, filter.brandId));
  }

  // Typo-tolerant trigram search using pg_trgm similarity or substring ILIKE
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const q = filter.searchQuery.trim();
    conditions.push(
      sql`(${products.name} % ${q} OR ${brands.name} % ${q} OR ${products.name} ILIKE ${"%" + q + "%"})`,
    );
  }

  const results = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      className: products.class,
      brandName: brands.name,
      categoryName: categories.name,
      startingPriceMinor: sql<number>`MIN(${variants.priceMinor})`,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .innerJoin(variants, eq(products.id, variants.productId))
    .where(and(...conditions))
    .groupBy(products.id, brands.name, categories.name);

  // If a user performed a query, log zero-result searches without personal data
  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const normalized = filter.searchQuery.trim().toLowerCase();
    await db.insert(searchQueries).values({
      normalizedQuery: normalized,
      resultsCount: results.length,
    });
  }

  return results.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    className: r.className,
    brandName: r.brandName,
    categoryName: r.categoryName,
    startingPriceMinor: Number(r.startingPriceMinor ?? 0),
  }));
}

export interface ProductVariantDetail {
  id: string;
  sku: string;
  packSize: string;
  priceMinor: number;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  brandName: string;
  categoryName: string;
  variants: ProductVariantDetail[];
}

/** Convenience wrapper used by the product list page. */
export async function searchProducts(
  query: string,
): Promise<CatalogProductSummary[]> {
  return searchCatalog({ searchQuery: query });
}

/** Returns a published product with its active variants, or null. */
export async function getProductById(
  id: string,
): Promise<ProductDetail | null> {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  ) {
    return null;
  }
  const db = getDb();
  const [row] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      brandName: brands.name,
      categoryName: categories.name,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(eq(products.id, id), eq(products.status, "published")));
  if (!row) return null;

  const variantRows = await db
    .select({
      id: variants.id,
      sku: variants.sku,
      packSize: variants.packSize,
      priceMinor: variants.priceMinor,
    })
    .from(variants)
    .where(and(eq(variants.productId, id), eq(variants.isActive, true)));

  return {
    ...row,
    variants: variantRows.map((v) => ({
      ...v,
      priceMinor: Number(v.priceMinor),
    })),
  };
}

export interface StaffProductRow {
  id: string;
  name: string;
  slug: string;
  className: string;
  status: "draft" | "in_review" | "published" | "archived";
  brandName: string;
  categoryName: string;
  description: string;
  createdAt: Date;
  variants: {
    id: string;
    sku: string;
    packSize: string;
    priceMinor: number;
    isActive: boolean;
  }[];
}

export async function listAllStaffProducts(): Promise<StaffProductRow[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      className: products.class,
      status: products.status,
      brandName: brands.name,
      categoryName: categories.name,
      description: products.description,
      createdAt: products.createdAt,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));

  const allVariants = await db
    .select({
      id: variants.id,
      productId: variants.productId,
      sku: variants.sku,
      packSize: variants.packSize,
      priceMinor: variants.priceMinor,
      isActive: variants.isActive,
    })
    .from(variants);

  const variantsByProduct = new Map<string, typeof allVariants>();
  for (const v of allVariants) {
    const list = variantsByProduct.get(v.productId) ?? [];
    list.push(v);
    variantsByProduct.set(v.productId, list);
  }

  return rows.map((r) => ({
    ...r,
    variants: (variantsByProduct.get(r.id) ?? []).map((v) => ({
      ...v,
      priceMinor: Number(v.priceMinor),
    })),
  }));
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CreateProductInput {
  name: string;
  className: "seed" | "fertiliser" | "nutrient" | "pesticide" | "tool";
  categoryName: string;
  brandName: string;
  packSize: string;
  priceMinor: number;
  description: string;
  status?: "draft" | "published";
}

export async function createStaffProduct(
  input: CreateProductInput,
  authoredById: string,
) {
  const db = getDb();

  // 1. Find or create category
  let catSlug = slugify(input.categoryName);
  if (!catSlug) catSlug = "category-" + Date.now();
  let [cat] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, catSlug));
  if (!cat) {
    const [newCat] = await db
      .insert(categories)
      .values({
        name: input.categoryName.trim(),
        slug: catSlug,
      })
      .returning({ id: categories.id });
    cat = newCat!;
  }

  // 2. Find or create brand
  let [br] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(eq(brands.name, input.brandName.trim()));
  if (!br) {
    const [newBr] = await db
      .insert(brands)
      .values({
        name: input.brandName.trim(),
        country: "Pakistan",
      })
      .returning({ id: brands.id });
    br = newBr!;
  }

  // 3. Generate unique slug
  let baseSlug = slugify(input.name);
  if (!baseSlug) baseSlug = "product-" + Date.now();
  let finalSlug = baseSlug;
  const [existingSlug] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, finalSlug));
  if (existingSlug) {
    finalSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
  }

  // 4. Insert product
  const [newProd] = await db
    .insert(products)
    .values({
      categoryId: cat.id,
      brandId: br.id,
      name: input.name.trim(),
      slug: finalSlug,
      class: input.className,
      status: input.status ?? "published",
      description: input.description.trim(),
      countryOfOrigin: "Pakistan",
      authoredBy: authoredById,
      publishedBy: input.status === "draft" ? null : authoredById,
      publishedAt: input.status === "draft" ? null : new Date(),
    })
    .returning({ id: products.id });

  // 5. Generate SKU
  const skuPrefix = input.className.substring(0, 3).toUpperCase();
  const skuRand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const sku = `${skuPrefix}-${skuRand}`;

  // Parse pack size value & unit
  const match = input.packSize.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?/);
  const packVal = match ? Math.round(parseFloat(match[1])) : 1;
  const packUnit = match && match[2] ? match[2].toLowerCase() : "unit";

  const [newVar] = await db
    .insert(variants)
    .values({
      productId: newProd!.id,
      sku,
      packSize: input.packSize.trim(),
      packSizeValue: packVal,
      packSizeUnit: packUnit,
      priceMinor: input.priceMinor,
      currency: "PKR",
      isActive: true,
    })
    .returning({ id: variants.id });

  // 6. Record price history
  await db.insert(priceHistory).values({
    variantId: newVar!.id,
    priceMinor: input.priceMinor,
    currency: "PKR",
    changedBy: authoredById,
  });

  // 7. Initialize inventory batch so item has immediate stock in cart
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

  await db.insert(batches).values({
    variantId: newVar!.id,
    lotNumber: `LOT-${sku}`,
    manufacturedOn: new Date(),
    expiresOn: twoYearsFromNow,
    receivedQuantity: 100,
    onHand: 100,
    reserved: 0,
    quarantined: 0,
    status: "available",
  });

  return newProd!;
}

export async function updateProductStatus(
  productId: string,
  status: "draft" | "in_review" | "published" | "archived",
) {
  const db = getDb();
  await db
    .update(products)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}

export async function deleteStaffProduct(productId: string) {
  const db = getDb();
  try {
    await db.delete(products).where(eq(products.id, productId));
    return { success: true, archived: false };
  } catch {
    await db
      .update(products)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(products.id, productId));
    return { success: true, archived: true };
  }
}

