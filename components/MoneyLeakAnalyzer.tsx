"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnalysisResult, analyzeSpending, ExpenseItem } from "@/lib/analyzer";

type AppStage = "input" | "loading" | "result";

const seedExpenses: ExpenseItem[] = [
  { id: "rent", label: "Rent", amount: 2100 },
  { id: "groceries", label: "Groceries", amount: 650 },
  { id: "dining", label: "Dining", amount: 480 },
  { id: "subscriptions", label: "Subscriptions", amount: 145 },
  { id: "transport", label: "Transport", amount: 320 },
  { id: "shopping", label: "Shopping", amount: 420 },
];

function currency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function MoneyLeakAnalyzer() {
  const [stage, setStage] = useState<AppStage>("input");
  const [income, setIncome] = useState<number>(6200);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(seedExpenses);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const totalInputExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + item.amount, 0),
    [expenses],
  );

  const canSubmit = income > 0 && expenses.every((item) => item.amount >= 0);

  const updateExpenseAmount = (id: string, amount: number) => {
    setExpenses((prev) => prev.map((item) => (item.id === id ? { ...item, amount } : item)));
  };

  const onAnalyze = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setStage("loading");
    setShowPaywall(false);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const nextResult = analyzeSpending(income, expenses);
    setResult(nextResult);
    setStage("result");
  };

  const resetFlow = () => {
    setStage("input");
    setResult(null);
    setShowPaywall(false);
  };

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Money Leak Analyzer</p>
        <h1>Stop invisible spending from draining your monthly cash flow</h1>
        <p className="subtitle">
          Diagnose where money is slipping away, see your top leak categories, and unlock an action plan you can
          execute this week.
        </p>
      </section>

      {stage === "input" && (
        <section className="card" aria-labelledby="input-title">
          <h2 id="input-title">1) Enter your monthly numbers</h2>
          <form onSubmit={onAnalyze} className="analyzer-form">
            <label>
              Monthly take-home income
              <input
                type="number"
                min={0}
                value={income}
                onChange={(event) => setIncome(Number(event.target.value))}
                required
              />
            </label>

            <div className="expense-grid" role="group" aria-label="Expense categories">
              {expenses.map((expense) => (
                <label key={expense.id}>
                  {expense.label}
                  <input
                    type="number"
                    min={0}
                    value={expense.amount}
                    onChange={(event) => updateExpenseAmount(expense.id, Number(event.target.value))}
                    required
                  />
                </label>
              ))}
            </div>

            <div className="inline-stats" aria-live="polite">
              <span>Total expenses: {currency(totalInputExpenses)}</span>
              <span>Estimated leftover: {currency(income - totalInputExpenses)}</span>
            </div>

            <button type="submit" disabled={!canSubmit}>
              Analyze leaks
            </button>
          </form>
        </section>
      )}

      {stage === "loading" && (
        <section className="card loading" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <h2>Analyzing spending patterns…</h2>
          <p>
            Benchmarking your categories, estimating overages, and calculating leak score based on your current cash
            flow.
          </p>
        </section>
      )}

      {stage === "result" && result && (
        <section className="card" aria-labelledby="result-title">
          <div className="result-head">
            <h2 id="result-title">2) Your leak report</h2>
            <button className="secondary" onClick={resetFlow}>
              Start over
            </button>
          </div>

          <div className="kpi-grid">
            <article>
              <p>Leak score</p>
              <strong>{result.leakScore}/100</strong>
            </article>
            <article>
              <p>Monthly expenses</p>
              <strong>{currency(result.totalMonthlyExpenses)}</strong>
            </article>
            <article>
              <p>Savings rate</p>
              <strong>{result.savingsRate}%</strong>
            </article>
          </div>

          <div className="leak-list">
            {result.topLeaks.map((leak) => (
              <article key={leak.label}>
                <header>
                  <h3>{leak.label}</h3>
                  <p>{currency(leak.amount)} / month</p>
                </header>
                <p className="impact">Potential annual reclaim: {currency(leak.annualImpact)}</p>
                <p>{leak.recommendation}</p>
              </article>
            ))}
          </div>

          <div className="insights">
            <h3>Unlocked now</h3>
            <ul>
              {result.unlockedInsights.map((insight) => (
                <li key={insight}>{insight}</li>
              ))}
            </ul>
          </div>

          <div className="paywall">
            <div>
              <h3>3) Unlock your personalized 90-day savings plan</h3>
              <p>Get weekly guardrails, cancellation scripts, and scenario forecasts tailored to your leak profile.</p>
            </div>
            <button onClick={() => setShowPaywall((prev) => !prev)}>
              {showPaywall ? "Hide premium preview" : "Preview premium insights"}
            </button>
          </div>

          {showPaywall && (
            <div className="paywall-modal" role="dialog" aria-modal="true" aria-label="Premium paywall preview">
              <h4>Premium Insights</h4>
              <ul>
                {result.premiumInsights.map((insight) => (
                  <li key={insight}>{insight}</li>
                ))}
              </ul>
              <p className="price">$19/month — cancel anytime</p>
              <button className="cta">Upgrade to Pro</button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
