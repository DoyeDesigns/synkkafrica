"use server";

import { NIGERIAN_BANKS } from "@/lib/bank-list/banks";

type SuccessReturn = {
  status: true;
  message: string;
  data: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
};

type ErrorReturn = {
  status?: false;
  message: string;
  ok: boolean;
};
type ReturnType = SuccessReturn | ErrorReturn;

export async function verifyBankDetails(
  accountNumber: string,
  bankName: string
): Promise<ReturnType> {
  try {
    const bank = NIGERIAN_BANKS.find((item) => item.name === bankName);
    if (!bank) {
      return { ok: false, message: "Select a bank from the list." };
    }

    const url = `https://api.paystack.co/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bank.code)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();

    return { ok: true, ...data };
  } catch (error) {
    return {
      ok: false,
      message: "An error occurred while verifying bank details",
    };
  }
}
