import { budgetService } from "./budget.service.js";
import { transactionService } from "./transaction.service.js";

export const dashboardService = {
  async get(userId: bigint, month: number, year: number) {
    const [summary, budgets, expenses, recent] = await Promise.all([
      transactionService.summary(userId, month, year),
      budgetService.budgetVsActual(userId, month, year),
      transactionService.expenseByCategory(userId, month, year),
      transactionService.recent(userId, month, year),
    ]);

    const totalBudget = budgets.reduce((a, b) => a + b.budget, 0);
    const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);

    return {
      summary,
      budget: {
        used_percentage: totalBudget
          ? Math.round((totalSpent / totalBudget) * 100)
          : 0,
      },
      expense_by_category: expenses,
      recent_transactions: recent,
    };
  },
};
