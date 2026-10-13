/**
 * Owner receiving accounts for advance payments.
 * Payments are sent directly by the customer and verified manually by staff.
 */
export interface ReceivingAccount {
  id: "meezan" | "easypaisa";
  label: string;
  accountTitle: string;
  accountNumber: string;
}

export const RECEIVING_ACCOUNTS: readonly ReceivingAccount[] = [
  {
    id: "meezan",
    label: "Meezan Bank",
    accountTitle: "Muhammad Asad",
    accountNumber: "03130115156301",
  },
  {
    id: "easypaisa",
    label: "Easypaisa",
    accountTitle: "Muhammad Asad",
    accountNumber: "03004634494",
  },
] as const;
