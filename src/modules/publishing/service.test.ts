import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, closePools } from "../database";
import { users } from "../database/schema";
import {
  products,
  categories,
  brands,
  productImages,
  safetyVersions,
  productDocuments,
  productIngredients,
  productTargets,
  productCrops,
  activeIngredients,
  targets,
  crops,
  seedDetails,
  fertiliserDetails,
} from "../catalog/schema";
import { validateProductForPublishing, publishProduct } from "./service";
import { hashPassword } from "../auth/crypto";
import { eq } from "drizzle-orm";

describe("Product Publishing Gate & Four-Eyes Rule Verification", () => {
  let authorUserId: string;
  let approverUserId: string;
  let categoryId: string;
  let brandId: string;

  beforeAll(async () => {
    const db = getDb();
    const pw = await hashPassword("StrongPassword1234!");

    const [u1] = await db
      .insert(users)
      .values({
        email: `p2_author_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "staff",
      })
      .returning();
    authorUserId = u1!.id;

    const [u2] = await db
      .insert(users)
      .values({
        email: `p2_approver_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "owner",
      })
      .returning();
    approverUserId = u2!.id;

    const [cat] = await db
      .insert(categories)
      .values({
        name: "Crop Protection",
        slug: "crop-protection-" + Date.now(),
      })
      .returning();
    categoryId = cat!.id;

    const [br] = await db
      .insert(brands)
      .values({ name: "AgriTech Brands " + Date.now(), country: "Pakistan" })
      .returning();
    brandId = br!.id;
  });

  afterAll(async () => {
    const db = getDb();
    if (authorUserId) {
      await db.delete(products).where(eq(products.authoredBy, authorUserId));
      await db.delete(users).where(eq(users.id, authorUserId));
    }
    if (approverUserId) {
      await db.delete(products).where(eq(products.authoredBy, approverUserId));
      await db.delete(users).where(eq(users.id, approverUserId));
    }
    await closePools();
  });

  it("Rejects publishing when product does not exist", async () => {
    const res = await validateProductForPublishing(
      "00000000-0000-0000-0000-000000000000",
      approverUserId,
    );
    expect(res.canPublish).toBe(false);
    expect(res.errors).toContain("Product does not exist.");
  });

  it("Rejects publishing when author attempts to approve their own product (Four-Eyes Violation)", async () => {
    const db = getDb();
    const [prod] = await db
      .insert(products)
      .values({
        categoryId,
        brandId,
        name: "Herbicide Alpha",
        slug: "herbicide-alpha-" + Date.now(),
        class: "pesticide",
        description: "Broad spectrum systemic weed killer.",
        countryOfOrigin: "Pakistan",
        authoredBy: authorUserId,
      })
      .returning();

    const res = await validateProductForPublishing(prod!.id, authorUserId);
    expect(res.canPublish).toBe(false);
    expect(res.errors).toContain(
      "Four-Eyes Rule Violation: Author cannot approve or publish their own product.",
    );

    await expect(publishProduct(prod!.id, authorUserId)).rejects.toThrowError(
      /Four-Eyes Rule Violation/,
    );
  });

  it("Rejects pesticide publishing if required regulatory and safety documents are missing", async () => {
    const db = getDb();
    const [prod] = await db
      .insert(products)
      .values({
        categoryId,
        brandId,
        name: "Insecticide Incomplete",
        slug: "insecticide-incomplete-" + Date.now(),
        class: "pesticide",
        description: "Cotton bollworm control.",
        countryOfOrigin: "Pakistan",
        authoredBy: authorUserId,
      })
      .returning();

    const res = await validateProductForPublishing(prod!.id, approverUserId);
    expect(res.canPublish).toBe(false);
    expect(res.errors.some((e) => e.includes("image"))).toBe(true);
    expect(res.errors.some((e) => e.includes("safety version"))).toBe(true);
    expect(res.errors.some((e) => e.includes("Label PDF"))).toBe(true);
    expect(res.errors.some((e) => e.includes("Safety Data Sheet"))).toBe(true);
  });

  it("Rejects seed publishing if germination or treatment warning is invalid", async () => {
    const db = getDb();
    const [prod] = await db
      .insert(products)
      .values({
        categoryId,
        brandId,
        name: "Wheat Seed 2026",
        slug: "wheat-seed-" + Date.now(),
        class: "seed",
        description: "Wheat seed with high germination.",
        countryOfOrigin: "Pakistan",
        authoredBy: authorUserId,
      })
      .returning();

    await db.insert(productImages).values({
      productId: prod!.id,
      storageKey: "uploads/products/seed.webp",
      source: "Direct packshot",
      permissionNote: "Owner owned",
      altText: "Bag front",
      width: 800,
      height: 800,
      isPrimary: true,
    });

    // Invalid germination percent (0)
    await db.insert(seedDetails).values({
      productId: prod!.id,
      variety: "Akbar 2019",
      germinationRatePercent: 0,
      purityPercent: 98,
      isTreated: true,
      treatmentWarning: "", // missing treatment warning
      recommendedSeason: "Rabi",
      recommendedRegion: "Punjab",
    });

    const res = await validateProductForPublishing(prod!.id, approverUserId);
    expect(res.canPublish).toBe(false);
    expect(res.errors.some((e) => e.includes("germination percentage"))).toBe(
      true,
    );
    expect(res.errors.some((e) => e.includes("treatment warning"))).toBe(true);
  });

  it("Rejects fertiliser publishing if details or registration number are missing", async () => {
    const db = getDb();
    const [prod] = await db
      .insert(products)
      .values({
        categoryId,
        brandId,
        name: "Nitrogen Boost 46",
        slug: "nitrogen-boost-" + Date.now(),
        class: "fertiliser",
        description: "High nitrogen urea granulate.",
        countryOfOrigin: "Pakistan",
        authoredBy: authorUserId,
      })
      .returning();

    await db.insert(productImages).values({
      productId: prod!.id,
      storageKey: "uploads/products/urea.webp",
      source: "Direct packshot",
      permissionNote: "Owner owned",
      altText: "Bag front",
      width: 800,
      height: 800,
      isPrimary: true,
    });

    await db.insert(fertiliserDetails).values({
      productId: prod!.id,
      nutrientAnalysis: "46% N",
      netWeightKg: 50,
      registrationNumber: "", // missing
      storageHandling: "Store in dry warehouse",
    });

    const res = await validateProductForPublishing(prod!.id, approverUserId);
    expect(res.canPublish).toBe(false);
    expect(res.errors.some((e) => e.includes("registration number"))).toBe(
      true,
    );
  });

  it("Successfully publishes pesticide when all strict regulatory fields, documents, and real images exist with independent approval", async () => {
    const db = getDb();
    const [prod] = await db
      .insert(products)
      .values({
        categoryId,
        brandId,
        name: "Fungicide Verified Clean",
        slug: "fungicide-verified-" + Date.now(),
        class: "pesticide",
        description: "Wheat rust prevention.",
        countryOfOrigin: "Pakistan",
        authoredBy: authorUserId,
      })
      .returning();

    await db.insert(productImages).values({
      productId: prod!.id,
      storageKey: "uploads/products/fungicide-front.webp",
      source: "Official Manufacturer Asset Pack",
      permissionNote: "Manufacturer written distributor consent on file",
      altText: "Front label view of 1 litre bottle",
      width: 1200,
      height: 1200,
      isPrimary: true,
    });

    const [safety] = await db
      .insert(safetyVersions)
      .values({
        productId: prod!.id,
        versionNumber: 1,
        labelText:
          "Apply at 500ml per acre in 100L water. Pre-harvest interval: 21 days.",
        applicationRate: "500 mL / acre",
        applicationMethod: "Foliar spray with flat fan nozzles",
        preHarvestIntervalDays: 21,
        reentryIntervalHours: 24,
        hazardClass: "WHO Class III (Slightly Hazardous)",
        signalWord: "CAUTION",
        registrationNumber: "MF-PK-2026-9988",
        firstAid:
          "If in eyes, rinse with clean water for 15 minutes. Call poison control.",
        storageAndHandling:
          "Store in cool dry locked pesticide shed away from food and feed.",
        isRestrictedUse: false,
        authoredBy: authorUserId,
        approvedBy: approverUserId,
        approvedAt: new Date(),
        isApproved: true,
      })
      .returning();

    await db
      .update(products)
      .set({ currentSafetyVersionId: safety!.id })
      .where(eq(products.id, prod!.id));

    await db.insert(productDocuments).values([
      {
        productId: prod!.id,
        safetyVersionId: safety!.id,
        kind: "label_pdf",
        title: "Official Certified Label PDF",
        storageKey: "docs/labels/mf-pk-label.pdf",
        fileSizeBytes: 240000,
        sha256:
          "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
      },
      {
        productId: prod!.id,
        safetyVersionId: safety!.id,
        kind: "safety_data_sheet",
        title: "Safety Data Sheet (SDS)",
        storageKey: "docs/sds/mf-pk-sds.pdf",
        fileSizeBytes: 350000,
        sha256:
          "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
      },
    ]);

    const [ing] = await db
      .insert(activeIngredients)
      .values({ name: "Azoxystrobin " + Date.now() })
      .returning();
    await db.insert(productIngredients).values({
      productId: prod!.id,
      ingredientId: ing!.id,
      concentration: "250 g/L",
    });

    const [cr] = await db
      .insert(crops)
      .values({ name: "Wheat " + Date.now() })
      .returning();
    await db
      .insert(productCrops)
      .values({ productId: prod!.id, cropId: cr!.id });

    const [tg] = await db
      .insert(targets)
      .values({ name: "Yellow Rust " + Date.now(), kind: "fungal_disease" })
      .returning();
    await db
      .insert(productTargets)
      .values({ productId: prod!.id, targetId: tg!.id });

    const res = await validateProductForPublishing(prod!.id, approverUserId);
    expect(res.canPublish).toBe(true);
    expect(res.errors.length).toBe(0);

    await publishProduct(prod!.id, approverUserId);

    const [updatedProd] = await db
      .select()
      .from(products)
      .where(eq(products.id, prod!.id));
    expect(updatedProd!.status).toBe("published");
    expect(updatedProd!.publishedBy).toBe(approverUserId);
  });
});
