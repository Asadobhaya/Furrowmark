import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, closePools } from "../database";
import { users } from "../database/schema";
import {
  products,
  categories,
  brands,
  variants,
  searchQueries,
} from "./schema";
import { searchCatalog } from "./service";
import { hashPassword } from "../auth/crypto";
import { eq } from "drizzle-orm";

describe("Catalog Search, Filters, and Zero-Result Analytics", () => {
  let userId: string;
  let categorySeedId: string;
  let categoryChemId: string;
  let brandId: string;
  let cornProductId: string;

  beforeAll(async () => {
    const db = getDb();
    const pw = await hashPassword("SamplePassword12345!");

    const [u] = await db
      .insert(users)
      .values({
        email: `catalog_test_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "staff",
      })
      .returning();
    userId = u!.id;

    const [cat1] = await db
      .insert(categories)
      .values({ name: "Hybrid Seeds", slug: "seeds-" + Date.now() })
      .returning();
    categorySeedId = cat1!.id;

    const [cat2] = await db
      .insert(categories)
      .values({ name: "Insecticides", slug: "insecticides-" + Date.now() })
      .returning();
    categoryChemId = cat2!.id;

    const [br] = await db
      .insert(brands)
      .values({ name: "Engro Agritech " + Date.now(), country: "Pakistan" })
      .returning();
    brandId = br!.id;

    // Create published corn product
    const [p1] = await db
      .insert(products)
      .values({
        categoryId: categorySeedId,
        brandId,
        name: "Corn Hybrid Pioneer 30Y87",
        slug: "pioneer-30y87-" + Date.now(),
        class: "seed",
        status: "published",
        description: "Elite maize seed with high heat tolerance.",
        countryOfOrigin: "Pakistan",
        authoredBy: userId,
      })
      .returning();
    cornProductId = p1!.id;

    await db.insert(variants).values({
      productId: cornProductId,
      sku: "PIO-30Y87-5KG-" + Date.now(),
      packSize: "5 kg bag",
      packSizeValue: 5,
      packSizeUnit: "kg",
      priceMinor: 680000, // 6,800.00 PKR
    });

    // Create published pesticide product
    const [p2] = await db
      .insert(products)
      .values({
        categoryId: categoryChemId,
        brandId,
        name: "Emamectin Benzoate 1.9 EC",
        slug: "emamectin-19ec-" + Date.now(),
        class: "pesticide",
        status: "published",
        description: "Targeted lepidoptera pest protection.",
        countryOfOrigin: "Pakistan",
        authoredBy: userId,
      })
      .returning();

    await db.insert(variants).values({
      productId: p2!.id,
      sku: "EMAM-19EC-200ML-" + Date.now(),
      packSize: "200 mL bottle",
      packSizeValue: 200,
      packSizeUnit: "ml",
      priceMinor: 145000, // 1,450.00 PKR
    });
  });

  afterAll(async () => {
    const db = getDb();
    if (cornProductId)
      await db.delete(products).where(eq(products.id, cornProductId));
    if (userId)
      await db.delete(products).where(eq(products.authoredBy, userId));
    if (userId) await db.delete(users).where(eq(users.id, userId));
    await closePools();
  });

  it("Searches catalog by exact and partial name", async () => {
    const results = await searchCatalog({ searchQuery: "Pioneer" });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0]!.name).toContain("Pioneer 30Y87");
    expect(results[0]!.startingPriceMinor).toBe(680000);
  });

  it("Filters catalog by category ID", async () => {
    const results = await searchCatalog({ categoryId: categoryChemId });
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.every((r) => r.categoryName === "Insecticides")).toBe(true);
  });

  it("Records search query analytics without personal data when queries are executed", async () => {
    const queryTerm = "unknown-pest-spray-xyz";
    const results = await searchCatalog({ searchQuery: queryTerm });
    expect(results.length).toBe(0);

    const db = getDb();
    const [recorded] = await db
      .select()
      .from(searchQueries)
      .where(eq(searchQueries.normalizedQuery, queryTerm));

    expect(recorded).toBeDefined();
    expect(recorded!.resultsCount).toBe(0);
  });
});
