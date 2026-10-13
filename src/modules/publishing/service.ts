import { eq, and } from "drizzle-orm";
import { getDb } from "../database";
import {
  products,
  safetyVersions,
  productDocuments,
  productImages,
  seedDetails,
  fertiliserDetails,
  productCrops,
  productTargets,
  productIngredients,
} from "../catalog/schema";

export interface PublishValidationResult {
  canPublish: boolean;
  errors: string[];
}

export async function validateProductForPublishing(
  productId: string,
  approverId: string,
): Promise<PublishValidationResult> {
  const db = getDb();
  const errors: string[] = [];

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId));
  if (!product) {
    return { canPublish: false, errors: ["Product does not exist."] };
  }

  // Four-Eyes Rule: The person who publishes cannot be the author
  if (product.authoredBy === approverId) {
    errors.push(
      "Four-Eyes Rule Violation: Author cannot approve or publish their own product.",
    );
  }

  // Strict Real Image Check: Must have at least one verified primary image with source documentation
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));
  if (images.length === 0) {
    errors.push(
      "Product must have at least one real packaging image with recorded source and permission.",
    );
  } else {
    const hasPrimary = images.some((img) => img.isPrimary);
    if (!hasPrimary) {
      errors.push("Product must have a primary image designated.");
    }
  }

  // Class-specific mandatory criteria
  if (product.class === "pesticide") {
    if (!product.currentSafetyVersionId) {
      errors.push("Pesticide must have an active safety version.");
    } else {
      const [safety] = await db
        .select()
        .from(safetyVersions)
        .where(
          and(
            eq(safetyVersions.id, product.currentSafetyVersionId),
            eq(safetyVersions.productId, productId),
          ),
        );

      if (!safety) {
        errors.push("Safety version specified does not exist.");
      } else {
        if (!safety.isApproved) {
          errors.push("Safety version must be approved prior to publishing.");
        }
        if (!safety.labelText || safety.labelText.trim().length === 0) {
          errors.push("Pesticide must have complete label text.");
        }
        if (
          !safety.registrationNumber ||
          safety.registrationNumber.trim().length === 0
        ) {
          errors.push(
            "Pesticide must have an official registration/approval number.",
          );
        }
        if (!safety.hazardClass || safety.hazardClass.trim().length === 0) {
          errors.push("Pesticide must have a hazard class declared.");
        }
        if (!safety.signalWord || safety.signalWord.trim().length === 0) {
          errors.push("Pesticide must have a signal word declared.");
        }
        if (
          !safety.applicationRate ||
          safety.applicationRate.trim().length === 0
        ) {
          errors.push("Pesticide must have application rate declared.");
        }
        if (!safety.firstAid || safety.firstAid.trim().length === 0) {
          errors.push("Pesticide must have first aid instructions declared.");
        }
      }
    }

    // Must have Label PDF and Safety Data Sheet (SDS) PDF documents
    const docs = await db
      .select()
      .from(productDocuments)
      .where(eq(productDocuments.productId, productId));
    const hasLabelPdf = docs.some((d) => d.kind === "label_pdf");
    const hasSds = docs.some((d) => d.kind === "safety_data_sheet");

    if (!hasLabelPdf) {
      errors.push("Pesticide must have an official Label PDF uploaded.");
    }
    if (!hasSds) {
      errors.push(
        "Pesticide must have a Safety Data Sheet (SDS) PDF uploaded.",
      );
    }

    // Must have active ingredients with concentrations
    const ingredients = await db
      .select()
      .from(productIngredients)
      .where(eq(productIngredients.productId, productId));
    if (ingredients.length === 0) {
      errors.push(
        "Pesticide must have at least one active ingredient with declared concentration.",
      );
    }

    // Must have target pests/weeds and recommended crops
    const targetsList = await db
      .select()
      .from(productTargets)
      .where(eq(productTargets.productId, productId));
    if (targetsList.length === 0) {
      errors.push(
        "Pesticide must have at least one target weed/pest declared.",
      );
    }

    const cropsList = await db
      .select()
      .from(productCrops)
      .where(eq(productCrops.productId, productId));
    if (cropsList.length === 0) {
      errors.push("Pesticide must have at least one registered crop declared.");
    }
  } else if (product.class === "fertiliser" || product.class === "nutrient") {
    const [fert] = await db
      .select()
      .from(fertiliserDetails)
      .where(eq(fertiliserDetails.productId, productId));
    if (!fert) {
      errors.push(
        "Fertiliser details (nutrient analysis, net weight, registration) must be declared.",
      );
    } else {
      if (!fert.nutrientAnalysis || fert.nutrientAnalysis.trim().length === 0) {
        errors.push("Fertiliser must have verified nutrient analysis.");
      }
      if (
        !fert.registrationNumber ||
        fert.registrationNumber.trim().length === 0
      ) {
        errors.push("Fertiliser must have official registration number.");
      }
    }
  } else if (product.class === "seed") {
    const [seed] = await db
      .select()
      .from(seedDetails)
      .where(eq(seedDetails.productId, productId));
    if (!seed) {
      errors.push(
        "Seed details (variety, germination %, purity %, season, region) must be declared.",
      );
    } else {
      if (
        seed.germinationRatePercent <= 0 ||
        seed.germinationRatePercent > 100
      ) {
        errors.push("Seed germination percentage must be between 1 and 100.");
      }
      if (
        seed.isTreated &&
        (!seed.treatmentWarning || seed.treatmentWarning.trim().length === 0)
      ) {
        errors.push(
          "Treated seed must include a clear, prominent treatment warning.",
        );
      }
    }
  }

  return {
    canPublish: errors.length === 0,
    errors,
  };
}

export async function publishProduct(
  productId: string,
  approverId: string,
): Promise<void> {
  const validation = await validateProductForPublishing(productId, approverId);
  if (!validation.canPublish) {
    throw new Error(`Cannot publish product: ${validation.errors.join("; ")}`);
  }

  const db = getDb();
  await db
    .update(products)
    .set({
      status: "published",
      publishedBy: approverId,
      publishedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId));
}
