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

interface UpdateTransaction {
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
  category_id?: number | undefined;
  sort_by: Sort_by;
  sort_dir: sort_dir;
}
type Sort_by = "transaction_date" | "amount";
type sort_dir = "asc" | "desc";
export type { CreateTransaction, Query,UpdateTransaction };
