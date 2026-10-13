import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../database";
import {
  products,
  variants,
  brands,
  categories,
  searchQueries,
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
