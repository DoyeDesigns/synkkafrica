import banks from "./banks.json";

export type BankListItem = {
  name: string;
  code: string;
};

export const NIGERIAN_BANKS: BankListItem[] = banks
  .filter((bank) => bank.name && bank.code)
  .map((bank) => ({ name: bank.name, code: bank.code }))
  .sort((a, b) => a.name.localeCompare(b.name));
