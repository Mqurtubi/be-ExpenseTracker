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

export type { CreateCategory, UpdateCategory };
