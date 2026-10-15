import { RECEIVING_ACCOUNTS } from "../payments/accounts";

export interface TemplateContext {
  orderRef: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  itemsSummary?: string;
  totalPkr?: string;
  paymentMethod?: string;
  transactionRef?: string;
  trackingNumber?: string;
  cancellationReason?: string;
}

export interface RenderedTemplate {
  subject: string;
  body: string;
}

export class TemplateRegistry {
  static render(templateId: string, ctx: TemplateContext): RenderedTemplate {
    switch (templateId) {
      case "owner_order_alert": {
        return {
          subject: `NEW ORDER ALERT: ${ctx.orderRef}`,
          body:
            `NEW ORDER RECEIVED: ${ctx.orderRef}\n` +
            `--------------------------------\n` +
            `BUYER DETAILS:\n` +
            `• Name: ${ctx.customerName ?? "Valued Customer"}\n` +
            `• Phone: ${ctx.customerPhone ?? "N/A"}\n` +
            `• Delivery Address: ${ctx.deliveryAddress ?? "Multan"}\n` +
            `--------------------------------\n` +
            `ORDERED PRODUCTS & QUANTITIES:\n` +
            `${ctx.itemsSummary ?? "See order details"}\n` +
            `--------------------------------\n` +
            `ORDER TOTAL: ${ctx.totalPkr ?? "PKR"}\n` +
            `Payment Method: ${ctx.paymentMethod ?? "COD"}` +
            (ctx.transactionRef ? `\nTransaction Ref: ${ctx.transactionRef}` : "") +
            `\nFurrowmark Multan Depot Dispatch Queue`,
        };
      }

      case "order_created_advance": {
        const accountsText = RECEIVING_ACCOUNTS.map(
          (a) => `${a.label}: ${a.accountTitle} (${a.accountNumber})`,
        ).join("\n");

        return {
          subject: `Order ${ctx.orderRef} Placed - Advance Payment Required`,
          body:
            `Thank you for your order ${ctx.orderRef}.\n\n` +
            `Total Amount: ${ctx.totalPkr ?? "PKR"}\n\n` +
            `Please transfer the exact amount to one of our official receiving accounts:\n${accountsText}\n\n` +
            `After payment, ensure you provide your transaction reference for staff manual verification.`,
        };
      }

      case "order_created_cod": {
        return {
          subject: `Order ${ctx.orderRef} Placed - Cash on Delivery`,
          body:
            `Thank you for your order ${ctx.orderRef}.\n\n` +
            `Total Amount: ${ctx.totalPkr ?? "PKR"}\n` +
            `Payment Method: Cash on Delivery\n\n` +
            `Our team will confirm and process your shipment shortly.`,
        };
      }

      case "payment_confirmed": {
        return {
          subject: `Payment Verified for Order ${ctx.orderRef}`,
          body:
            `Your payment for order ${ctx.orderRef} has been verified.\n\n` +
            `Transaction Reference: ${ctx.transactionRef ?? "Verified"}\n` +
            `Your items are now being prepared for packing.`,
        };
      }

      case "order_dispatched": {
        return {
          subject: `Order ${ctx.orderRef} Dispatched`,
          body:
            `Great news! Your order ${ctx.orderRef} has been dispatched.\n\n` +
            `Tracking details: ${ctx.trackingNumber ?? "Standard Dispatch"}`,
        };
      }

      case "order_cancelled": {
        return {
          subject: `Order ${ctx.orderRef} Cancelled`,
          body:
            `Your order ${ctx.orderRef} has been cancelled.\n` +
            `Reason: ${ctx.cancellationReason ?? "Requested by customer/staff"}`,
        };
      }

      default:
        throw new Error(`Unknown notification template: ${templateId}`);
    }
  }
}
