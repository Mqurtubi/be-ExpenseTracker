interface CreateCategory {
  name: string;
  type: "EXPENSE" | "INCOME" | "BOTH";
  icon?: string;
  color?: string;
  is_default: boolean;
}

interface UpdateCategory {
  name?: string;
  type?: "EXPENSE" | "INCOME" | "BOTH";
  icon?: string;
  color?: string;
  is_default?: boolean;
}

interface ListCategoryQuery {
  type?: "EXPENSE" | "INCOME" | "BOTH" | undefined;
}
export type { CreateCategory, UpdateCategory, ListCategoryQuery };
