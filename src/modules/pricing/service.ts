export interface PricingLineItem {
  variantId: string;
  name: string;
  sku: string;
  unitPriceMinor: number;
  quantity: number;
}

export interface CouponRule {
  code: string;
  discountType: "fixed_minor" | "percentage_bp";
  discountValue: number;
  minSubtotalMinor: number;
  active: boolean;
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number | null;
  timesUsed: number;
}

export interface TaxRule {
  code: string;
  rateBp: number; // e.g., 1800 for 18%
  inclusive: boolean;
}

export interface ShippingRule {
  baseFeeMinor: number;
  freeThresholdMinor?: number | null;
}

export interface LinePricingQuote {
  variantId: string;
  name: string;
  sku: string;
  unitPriceMinor: number;
  quantity: number;
  lineSubtotalMinor: number;
  taxMinor: number;
  lineTotalMinor: number;
}

export interface OrderPricingQuote {
  currency: string;
  lines: LinePricingQuote[];
  subtotalMinor: number;
  discountMinor: number;
  couponCodeApplied?: string;
  taxMinor: number;
  taxInclusive: boolean;
  taxRateBp: number;
  shippingMinor: number;
  totalMinor: number;
  calculatedAt: string;
}

export class PricingService {
  /**
   * Computes money strictly with integer minor units (paisas/cents).
   * Eliminates floating point rounding errors.
   */

  static calculateLineSubtotal(
    unitPriceMinor: number,
    quantity: number,
  ): number {
    if (unitPriceMinor < 0 || !Number.isInteger(unitPriceMinor)) {
      throw new Error("Invalid unit price: must be a non-negative integer");
    }
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error("Invalid quantity: must be a positive integer");
    }
    return unitPriceMinor * quantity;
  }

  static applyCouponDiscount(
    subtotalMinor: number,
    coupon?: CouponRule | null,
    now: Date = new Date(),
  ): { discountMinor: number; couponCodeApplied?: string } {
    if (!coupon) {
      return { discountMinor: 0 };
    }

    if (!coupon.active) {
      throw new Error("Coupon is inactive");
    }

    if (now < coupon.validFrom || now > coupon.validUntil) {
      throw new Error("Coupon has expired or is not yet valid");
    }

    if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
      throw new Error("Coupon usage limit has been reached");
    }

    if (subtotalMinor < coupon.minSubtotalMinor) {
      throw new Error(
        `Order subtotal does not meet minimum coupon requirement of ${coupon.minSubtotalMinor}`,
      );
    }

    let discountMinor: number;
    if (coupon.discountType === "fixed_minor") {
      discountMinor = Math.min(coupon.discountValue, subtotalMinor);
    } else if (coupon.discountType === "percentage_bp") {
      if (coupon.discountValue < 0 || coupon.discountValue > 10000) {
        throw new Error(
          "Percentage discount basis points must be between 0 and 10000",
        );
      }
      // Half-away-from-zero rounding for minor units
      discountMinor = Math.min(
        Math.round((subtotalMinor * coupon.discountValue) / 10000),
        subtotalMinor,
      );
    } else {
      throw new Error("Unsupported coupon discount type");
    }

    return {
      discountMinor,
      couponCodeApplied: coupon.code,
    };
  }

  static calculateTax(
    taxableAmountMinor: number,
    taxRule?: TaxRule | null,
  ): { taxMinor: number; taxRateBp: number; inclusive: boolean } {
    if (!taxRule || taxRule.rateBp === 0) {
      return { taxMinor: 0, taxRateBp: 0, inclusive: false };
    }

    if (taxRule.rateBp < 0 || !Number.isInteger(taxRule.rateBp)) {
      throw new Error("Tax rate basis points must be a non-negative integer");
    }

    if (taxRule.inclusive) {
      // Inclusive tax: Tax = Amount - (Amount / (1 + rate))
      // e.g. for 18% (1800 bp): Tax = Amount * 1800 / (10000 + 1800)
      const taxMinor = Math.round(
        (taxableAmountMinor * taxRule.rateBp) / (10000 + taxRule.rateBp),
      );
      return { taxMinor, taxRateBp: taxRule.rateBp, inclusive: true };
    } else {
      // Exclusive tax: Tax = Amount * rate
      const taxMinor = Math.round(
        (taxableAmountMinor * taxRule.rateBp) / 10000,
      );
      return { taxMinor, taxRateBp: taxRule.rateBp, inclusive: false };
    }
  }

  static calculateShipping(
    subtotalAfterDiscountMinor: number,
    shippingRule?: ShippingRule | null,
  ): number {
    if (!shippingRule) {
      return 0;
    }
    if (
      shippingRule.baseFeeMinor < 0 ||
      !Number.isInteger(shippingRule.baseFeeMinor)
    ) {
      throw new Error("Shipping base fee must be a non-negative integer");
    }

    if (
      shippingRule.freeThresholdMinor != null &&
      subtotalAfterDiscountMinor >= shippingRule.freeThresholdMinor
    ) {
      return 0;
    }

    return shippingRule.baseFeeMinor;
  }

  static quoteOrderTotals(params: {
    items: PricingLineItem[];
    coupon?: CouponRule | null;
    taxRule?: TaxRule | null;
    shippingRule?: ShippingRule | null;
    currency?: string;
    now?: Date;
  }): OrderPricingQuote {
    if (!params.items || params.items.length === 0) {
      throw new Error("Cannot quote pricing for empty items list");
    }

    const currency = params.currency ?? "PKR";
    const now = params.now ?? new Date();

    let subtotalMinor = 0;
    const lines: LinePricingQuote[] = [];

    for (const item of params.items) {
      const lineSubtotal = PricingService.calculateLineSubtotal(
        item.unitPriceMinor,
        item.quantity,
      );
      subtotalMinor += lineSubtotal;

      lines.push({
        variantId: item.variantId,
        name: item.name,
        sku: item.sku,
        unitPriceMinor: item.unitPriceMinor,
        quantity: item.quantity,
        lineSubtotalMinor: lineSubtotal,
        taxMinor: 0, // Calculated below proportionally or per line
        lineTotalMinor: lineSubtotal,
      });
    }

    // 1. Discounts
    const { discountMinor, couponCodeApplied } =
      PricingService.applyCouponDiscount(subtotalMinor, params.coupon, now);
    const subtotalAfterDiscount = subtotalMinor - discountMinor;

    // 2. Shipping
    const shippingMinor = PricingService.calculateShipping(
      subtotalAfterDiscount,
      params.shippingRule,
    );

    // 3. Tax
    const { taxMinor, taxRateBp, inclusive } = PricingService.calculateTax(
      subtotalAfterDiscount,
      params.taxRule,
    );

    // Allocate tax proportionally to line items for snapshotting
    let allocatedTaxTotal = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      if (subtotalMinor > 0 && taxMinor > 0) {
        if (i === lines.length - 1) {
          // Remainder adjustment on last item to prevent rounding loss
          line.taxMinor = taxMinor - allocatedTaxTotal;
        } else {
          const proportionalTax = Math.round(
            (taxMinor * line.lineSubtotalMinor) / subtotalMinor,
          );
          line.taxMinor = proportionalTax;
          allocatedTaxTotal += proportionalTax;
        }
      }
      line.lineTotalMinor = inclusive
        ? line.lineSubtotalMinor
        : line.lineSubtotalMinor + line.taxMinor;
    }

    // 4. Grand Total
    const totalMinor = inclusive
      ? subtotalAfterDiscount + shippingMinor
      : subtotalAfterDiscount + taxMinor + shippingMinor;

    return {
      currency,
      lines,
      subtotalMinor,
      discountMinor,
      couponCodeApplied,
      taxMinor,
      taxInclusive: inclusive,
      taxRateBp,
      shippingMinor,
      totalMinor,
      calculatedAt: now.toISOString(),
    };
  }

  static validateRefundAmount(
    paidAmountMinor: number,
    previousRefundsMinor: number,
    requestedRefundMinor: number,
  ): boolean {
    if (requestedRefundMinor <= 0 || !Number.isInteger(requestedRefundMinor)) {
      throw new Error("Requested refund must be a positive integer");
    }
    const maxRefundable = paidAmountMinor - previousRefundsMinor;
    if (requestedRefundMinor > maxRefundable) {
      throw new Error(
        `Requested refund (${requestedRefundMinor}) exceeds max refundable amount (${maxRefundable})`,
      );
    }
    return true;
  }

  static validateRefundUpperBound(params: {
    totalPaidMinor: number;
    priorRefundsTotalMinor: number;
    requestedRefundMinor: number;
  }): { valid: boolean; error?: string } {
    if (
      params.requestedRefundMinor <= 0 ||
      !Number.isInteger(params.requestedRefundMinor)
    ) {
      return {
        valid: false,
        error: "Requested refund must be a positive integer",
      };
    }
    if (params.requestedRefundMinor > params.totalPaidMinor) {
      return {
        valid: false,
        error: `Requested refund of ${params.requestedRefundMinor} minor units exceeds total paid amount of ${params.totalPaidMinor}`,
      };
    }
    const maxRefundable = params.totalPaidMinor - params.priorRefundsTotalMinor;
    if (params.requestedRefundMinor > maxRefundable) {
      return {
        valid: false,
        error: `Requested refund of ${params.requestedRefundMinor} minor units exceeds remaining refundable balance of ${maxRefundable}`,
      };
    }
    return { valid: true };
  }
}
