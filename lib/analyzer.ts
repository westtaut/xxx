export type ExpenseItem = {
  id: string;
  label: string;
  amount: number;
};

export type AnalysisResult = {
  totalMonthlyExpenses: number;
  savingsRate: number;
  leakScore: number;
  topLeaks: Array<{
    label: string;
    amount: number;
    annualImpact: number;
    recommendation: string;
  }>;
  unlockedInsights: string[];
  premiumInsights: string[];
};

const categoryBenchmarks: Record<string, number> = {
  Rent: 0.3,
  Groceries: 0.12,
  Dining: 0.06,
  Subscriptions: 0.03,
  Transport: 0.1,
  Shopping: 0.05,
};

const recommendations: Record<string, string> = {
  Rent: "Negotiate lease renewal or evaluate a lower-cost zip code within commuting range.",
  Groceries: "Switch to one bulk grocery run per week and cap impulse top-up trips.",
  Dining: "Limit paid dining to 2 planned meals per week and pre-plan alternatives.",
  Subscriptions: "Cancel duplicate streaming/tools and move annual plans to one billing date.",
  Transport: "Bundle trips and compare insurance/fuel plans each quarter.",
  Shopping: "Apply a 48-hour rule for non-essential purchases to reduce impulse buys.",
};

export function analyzeSpending(income: number, expenses: ExpenseItem[]): AnalysisResult {
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const savingsRate = income > 0 ? Math.max(0, ((income - totalMonthlyExpenses) / income) * 100) : 0;

  const leakCandidates = expenses
    .map((expense) => {
      const benchmark = categoryBenchmarks[expense.label] ?? 0.04;
      const benchmarkAmount = income * benchmark;
      const overage = Math.max(0, expense.amount - benchmarkAmount);

      return {
        label: expense.label,
        amount: expense.amount,
        overage,
        annualImpact: overage * 12,
        recommendation:
          recommendations[expense.label] ??
          "Set a weekly cap and automate an alert when spending crosses 80% of your target.",
      };
    })
    .sort((a, b) => b.overage - a.overage)
    .slice(0, 3);

  const totalOverage = leakCandidates.reduce((sum, item) => sum + item.overage, 0);
  const leakScore = Math.min(100, Math.round((totalOverage / Math.max(income, 1)) * 200));

  return {
    totalMonthlyExpenses,
    savingsRate: Number(savingsRate.toFixed(1)),
    leakScore,
    topLeaks: leakCandidates.map(({ label, amount, annualImpact, recommendation }) => ({
      label,
      amount,
      annualImpact,
      recommendation,
    })),
    unlockedInsights: [
      `You are spending $${totalMonthlyExpenses.toFixed(0)} monthly across ${expenses.length} categories.`,
      `Your current savings rate is ${savingsRate.toFixed(1)}%. Increasing it to 20% could add meaningful buffer.`,
      `Focusing on the top 2 leak categories may free up $${(totalOverage * 0.75).toFixed(0)} monthly.`,
    ],
    premiumInsights: [
      "12-month cash-flow forecast with scenario modeling.",
      "Weekly spending guardrails synced to your pay cycle.",
      "Automated cancellation + negotiation scripts tailored to your top leaks.",
    ],
  };
}
