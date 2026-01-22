export function parseTransactionType(
  value: unknown,
): "INCOME" | "EXPENSE" | undefined {
  return value === "INCOME" || value === "EXPENSE" ? value : undefined;
}
