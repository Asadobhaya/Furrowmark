import { describe, it, expect, beforeAll } from "vitest";
import { getMigratorDb } from "../database";
import { users } from "../database/schema";
import {
  categories,
  brands,
  products,
  variants,
  suppliers,
  batches,
} from "../catalog/schema";
import { CartService } from "./service";
import { hashPassword } from "../auth/crypto";

describe("Cart Management Service", () => {
  let testUserId: string;
  let testVariantId: string;

  beforeAll(async () => {
    const { db } = getMigratorDb();

    const pw = await hashPassword("ValidPassword123!");
    const [u] = await db
      .insert(users)
      .values({
        email: `cart_user_${Date.now()}@furrowmark.test`,
        passwordHash: pw,
        role: "customer",
      })
      .returning();
    testUserId = u!.id;

    const [cat] = await db
      .insert(categories)
      .values({
        name: "Cart Seeds",
        slug: `cart-seeds-${Date.now()}`,
      })
      .returning();

    const [brand] = await db
      .insert(brands)
      .values({
        name: `Cart Brand ${Date.now()}`,
      })
      .returning();

    const [prod] = await db
      .insert(products)
      .values({
        name: "Cart Sunflower",
        slug: `cart-sunflower-${Date.now()}`,
        class: "seed",
        status: "published",
        description: "Seed test product",
        countryOfOrigin: "Pakistan",
        authoredBy: testUserId,
        categoryId: cat!.id,
        brandId: brand!.id,
      })
      .returning();

    const [v] = await db
      .insert(variants)
      .values({
        productId: prod!.id,
        sku: `CART-SUN-${Date.now()}`,
        packSize: "5kg",
        packSizeValue: 5,
        packSizeUnit: "kg",
        priceMinor: 150000, // 1,500.00 PKR
        currency: "PKR",
      })
      .returning();
    testVariantId = v!.id;

    const [sup] = await db
      .insert(suppliers)
      .values({
        name: `Cart Seed Supplier ${Date.now()}`,
      })
      .returning();

    // Create an available batch with 10 on-hand units
    await db.insert(batches).values({
      variantId: testVariantId,
      supplierId: sup!.id,
      lotNumber: `LOT-CART-${Date.now()}`,
      manufacturedOn: new Date(Date.now() - 30 * 86400000),
      expiresOn: new Date(Date.now() + 180 * 86400000),
      receivedQuantity: 10,
      onHand: 10,
      reserved: 0,
      quarantined: 0,
      status: "available",
    });
  });

  it("creates a customer cart and adds items with stock checks", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: testUserId,
    });
    expect(cartId).toBeDefined();

    await CartService.addItem({
      cartId,
      variantId: testVariantId,
      quantity: 2,
    });

    const cartView = await CartService.getCartView({ cartId });
    expect(cartView.items.length).toBe(1);
    expect(cartView.items[0]?.quantity).toBe(2);
    expect(cartView.items[0]?.lineSubtotalMinor).toBe(300000);
    expect(cartView.quote.subtotalMinor).toBe(300000);
  });

  it("prevents adding quantities exceeding active unexpired stock", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: testUserId,
    });

    await expect(
      CartService.addItem({
        cartId,
        variantId: testVariantId,
        quantity: 15, // Only 10 available total, 2 already added in previous test
      }),
    ).rejects.toThrow("Insufficient stock");
  });

  it("updates and removes cart items", async () => {
    const { id: cartId } = await CartService.getOrCreateCart({
      userId: testUserId,
    });

    await CartService.updateItemQuantity({
      cartId,
      variantId: testVariantId,
      quantity: 4,
    });

    let cartView = await CartService.getCartView({ cartId });
    expect(cartView.items[0]?.quantity).toBe(4);
    expect(cartView.quote.subtotalMinor).toBe(600000);

    // Remove item
    await CartService.removeItem(cartId, testVariantId);
    cartView = await CartService.getCartView({ cartId });
    expect(cartView.items.length).toBe(0);
    expect(cartView.quote.totalMinor).toBe(0);
  });

  it("merges guest cart into authenticated customer cart", async () => {
    const guestToken = `guest_token_hash_${Date.now()}`;
    const { id: guestCartId } = await CartService.getOrCreateCart({
      guestTokenHash: guestToken,
    });

    await CartService.addItem({
      cartId: guestCartId,
      variantId: testVariantId,
      quantity: 3,
    });

    // Merge into user cart
    const mergedCart = await CartService.mergeGuestCart({
      guestTokenHash: guestToken,
      userId: testUserId,
    });

    const cartView = await CartService.getCartView({ cartId: mergedCart.id });
    expect(cartView.items.length).toBe(1);
    expect(cartView.items[0]?.quantity).toBe(3);
  });
});
