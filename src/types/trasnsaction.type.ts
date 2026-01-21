interface CreateTransaction{
    category_id:string,
    type : "INCOME" | "EXPENSE",
    amount : number,
    transaction_date : string,
    payment_method? : "CASH" | "BANK_TRANSFER" | "DEBIT_CARD" | "CREDIT_CARD" | "EWALLET" | "OTHER",
    note?:string
}

export type {CreateTransaction}