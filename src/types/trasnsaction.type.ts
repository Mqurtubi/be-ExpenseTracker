interface CreateTransaction {
  category_id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  transaction_date: string;
  payment_method?:
    | "CASH"
    | "BANK_TRANSFER"
    | "DEBIT_CARD"
    | "CREDIT_CARD"
    | "EWALLET"
    | "OTHER";
  note?: string;
}

interface Query {
  month: number;
  year: number;
  search?: string | undefined;
  type?: "INCOME" | "EXPENSE" | undefined;
  category_id?: string | undefined;
  sort?: "asc" | "desc" | undefined;
}
export type { CreateTransaction, Query };
