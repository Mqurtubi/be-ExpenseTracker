interface CreateCategory {
  name: string;
  type: "EXPENSE" | "INCOME" | "BOTH";
  icon?: string;
  color?: string;
}

interface UpdateCategory {
  name?: string;
  type?: "EXPENSE" | "INCOME" | "BOTH";
  icon?: string;
  color?: string;
}

interface ListCategoryQuery{
  type?: "EXPENSE" | "INCOME" | "BOTH" | undefined;
}
export type { CreateCategory, UpdateCategory, ListCategoryQuery };
