import { describe, it, expect } from "vitest";
import {
  PricingService,
  PricingLineItem,
  CouponRule,
  TaxRule,
  ShippingRule,
} from "./service";

describe("Server-Side Pricing Engine", () => {
  const sampleItems: PricingLineItem[] = [
    {
      variantId: "var-1",
      name: "Wheat Seed Super-9",
      sku: "SEED-WHT-01",
      unitPriceMinor: 250000, // 2,500.00 PKR
      quantity: 2,
    },
    {
      variantId: "var-2",
      name: "Bio-Fertiliser 50kg",
      sku: "FERT-BIO-02",
      unitPriceMinor: 400000, // 4,000.00 PKR
      quantity: 1,
    },
  ];

  it("calculates exact line subtotals with integer minor units", () => {
    const subtotal1 = PricingService.calculateLineSubtotal(250000, 2);
    const subtotal2 = PricingService.calculateLineSubtotal(400000, 1);

    expect(subtotal1).toBe(500000);
    expect(subtotal2).toBe(400000);
  });

  it("throws on negative price or invalid quantity", () => {
    expect(() => PricingService.calculateLineSubtotal(-100, 1)).toThrow(
      "Invalid unit price: must be a non-negative integer",
    );
    expect(() => PricingService.calculateLineSubtotal(100, 0)).toThrow(
      "Invalid quantity: must be a positive integer",
    );
    expect(() => PricingService.calculateLineSubtotal(100.5, 1)).toThrow(
      "Invalid unit price: must be a non-negative integer",
    );
  });

  it("applies fixed minor discount coupon correctly", () => {
    const coupon: CouponRule = {
      code: "FARM500",
      discountType: "fixed_minor",
      discountValue: 50000, // 500 PKR
      minSubtotalMinor: 200000, // 2,000 PKR
      active: true,
      validFrom: new Date(Date.now() - 100000),
      validUntil: new Date(Date.now() + 100000),
      timesUsed: 0,
    };

    const res = PricingService.applyCouponDiscount(900000, coupon);
    expect(res.discountMinor).toBe(50000);
    expect(res.couponCodeApplied).toBe("FARM500");
  });

  it("applies percentage discount coupon in basis points with rounding", () => {
    const coupon: CouponRule = {
      code: "AGRI10",
      discountType: "percentage_bp",
      discountValue: 1000, // 10% = 1000 bp
      minSubtotalMinor: 100000,
      active: true,
      validFrom: new Date(Date.now() - 100000),
      validUntil: new Date(Date.now() + 100000),
      timesUsed: 0,
    };

    const res = PricingService.applyCouponDiscount(900000, coupon);
    expect(res.discountMinor).toBe(90000); // 10% of 900,000 = 90,000
  });

  it("rejects expired, inactive, or limit-exceeded coupons", () => {
    const expiredCoupon: CouponRule = {
      code: "OLD",
      discountType: "fixed_minor",
      discountValue: 10000,
      minSubtotalMinor: 0,
      active: true,
      validFrom: new Date(Date.now() - 200000),
      validUntil: new Date(Date.now() - 100000),
      timesUsed: 0,
    };

    expect(() =>
      PricingService.applyCouponDiscount(500000, expiredCoupon),
    ).toThrow("Coupon has expired or is not yet valid");

    const limitCoupon: CouponRule = {
      ...expiredCoupon,
      validUntil: new Date(Date.now() + 100000),
      usageLimit: 5,
      timesUsed: 5,
    };

    expect(() =>
      PricingService.applyCouponDiscount(500000, limitCoupon),
    ).toThrow("Coupon usage limit has been reached");
  });

  it("calculates tax-exclusive and tax-inclusive correctly", () => {
    const exclusiveTax: TaxRule = {
      code: "GST18",
      rateBp: 1800, // 18%
      inclusive: false,
    };

    const resExclusive = PricingService.calculateTax(1000000, exclusiveTax);
    expect(resExclusive.taxMinor).toBe(180000);
    expect(resExclusive.inclusive).toBe(false);

    const inclusiveTax: TaxRule = {
      code: "GST18_INC",
      rateBp: 1800, // 18% inclusive
      inclusive: true,
    };

    // Amount = 1,180,000 PKR paisas. Tax inside is 180,000
    const resInclusive = PricingService.calculateTax(1180000, inclusiveTax);
    expect(resInclusive.taxMinor).toBe(180000);
    expect(resInclusive.inclusive).toBe(true);
  });

  it("calculates shipping fee and waives on free threshold", () => {
    const shipping: ShippingRule = {
      baseFeeMinor: 25000, // 250 PKR
      freeThresholdMinor: 1000000, // 10,000 PKR
    };

    const fee1 = PricingService.calculateShipping(500000, shipping);
    expect(fee1).toBe(25000);

    const fee2 = PricingService.calculateShipping(1200000, shipping);
    expect(fee2).toBe(0);
  });

  it("quotes full order totals without floating point errors", () => {
    const coupon: CouponRule = {
      code: "FARM10",
      discountType: "percentage_bp",
      discountValue: 1000, // 10%
      minSubtotalMinor: 500000,
      active: true,
      validFrom: new Date(Date.now() - 100000),
      validUntil: new Date(Date.now() + 100000),
      timesUsed: 0,
    };

    const taxRule: TaxRule = {
      code: "GST18",
      rateBp: 1800,
      inclusive: false,
    };

    const shippingRule: ShippingRule = {
      baseFeeMinor: 35000, // 350 PKR
      freeThresholdMinor: 2000000,
    };

    const quote = PricingService.quoteOrderTotals({
      items: sampleItems,
      coupon,
      taxRule,
      shippingRule,
    });

    // Subtotal: 500,000 + 400,000 = 900,000
    expect(quote.subtotalMinor).toBe(900000);
    // Discount: 10% of 900,000 = 90,000
    expect(quote.discountMinor).toBe(90000);
    // Taxable: 810,000 * 18% = 145,800
    expect(quote.taxMinor).toBe(145800);
    // Shipping: 35,000
    expect(quote.shippingMinor).toBe(35000);
    // Total: 810,000 + 145,800 + 35,000 = 990,800
    expect(quote.totalMinor).toBe(990800);

    // Sum of lines tax must equal total tax
    const sumLineTax = quote.lines.reduce((acc, l) => acc + l.taxMinor, 0);
    expect(sumLineTax).toBe(quote.taxMinor);
  });

  it("validates refund limits and prevents over-refunding", () => {
    const paid = 500000;
    const prevRefunded = 200000;

    expect(
      PricingService.validateRefundAmount(paid, prevRefunded, 300000),
    ).toBe(true);

    expect(() =>
      PricingService.validateRefundAmount(paid, prevRefunded, 300001),
    ).toThrow("exceeds max refundable amount");
  });
});
