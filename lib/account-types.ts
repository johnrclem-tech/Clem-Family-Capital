// Account type definitions and utilities

export type AccountType = "Cash" | "Credit" | "Investment" | "Loan" | "Property";

export const ACCOUNT_TYPES: AccountType[] = ["Cash", "Credit", "Investment", "Loan", "Property"];

export interface AccountGroup {
  type: AccountType;
  label: string;
  icon: string;
  color: string;
}

export const ACCOUNT_GROUPS: AccountGroup[] = [
  {
    type: "Cash",
    label: "Cash Accounts",
    icon: "💰",
    color: "text-green-600",
  },
  {
    type: "Credit",
    label: "Credit Cards",
    icon: "💳",
    color: "text-blue-600",
  },
  {
    type: "Investment",
    label: "Investments",
    icon: "📈",
    color: "text-purple-600",
  },
  {
    type: "Loan",
    label: "Loans",
    icon: "🏦",
    color: "text-orange-600",
  },
  {
    type: "Property",
    label: "Properties",
    icon: "🏠",
    color: "text-indigo-600",
  },
];

export function getAccountGroup(type: AccountType): AccountGroup | undefined {
  return ACCOUNT_GROUPS.find((group) => group.type === type);
}
