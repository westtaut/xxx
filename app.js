const form = document.getElementById('analyzer-form');
const inputScreen = document.getElementById('input-screen');
const resultScreen = document.getElementById('result-screen');
const expenseSlider = document.getElementById('expenses');
const expenseOutput = document.getElementById('expense-output');
const formError = document.getElementById('form-error');

const lossHeadline = document.getElementById('loss-headline');
const yearlyLoss = document.getElementById('yearly-loss');
const leakSeverity = document.getElementById('leak-severity');
const leakList = document.getElementById('leak-list');
const emotionalInsight = document.getElementById('emotional-insight');
const overspendingPattern = document.getElementById('overspending-pattern');
const resetBtn = document.getElementById('reset-btn');

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const parseCategories = (raw) =>
  raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

const chooseSeverity = (ratio, monthlyLeak) => {
  if (ratio >= 0.3 || monthlyLeak > 1000) return 'Critical';
  if (ratio >= 0.2 || monthlyLeak > 600) return 'High';
  if (ratio >= 0.1 || monthlyLeak > 250) return 'Medium';
  return 'Low';
};

const makeDefaultLeaks = (monthlyLeak, severity) => {
  const profiles = {
    Critical: ['Impulse shopping spikes', 'Delivery convenience tax', 'Subscription pile-up', 'Lifestyle inflation'],
    High: ['Convenience spending', 'Unplanned social spending', 'Recurring auto-pay creep', 'Discount traps'],
    Medium: ['Takeaway frequency', 'Micro-spends accumulation', 'Weekend overspend', 'Unused memberships'],
    Low: ['Minor convenience fees', 'Forgotten subscriptions', 'Price drift on essentials', 'Mood-based treats'],
  };

  return profiles[severity].slice(0, 4).map((name, index) => {
    const weight = 0.35 - index * 0.07;
    const amount = Math.max(monthlyLeak * weight, 20);
    return { name, amount };
  });
};

const blendCategoryLeaks = (categories, monthlyLeak) => {
  const normalized = categories.slice(0, 5);
  if (!normalized.length) return [];

  const weights = [0.3, 0.24, 0.18, 0.16, 0.12];
  return normalized.map((name, i) => ({
    name,
    amount: Math.max(monthlyLeak * (weights[i] || 0.1), 15),
  }));
};

const getPatternCopy = (ratio) => {
  if (ratio >= 0.35) {
    return 'Your spending is running on urgency and emotion. Income arrives, pressure rises, and money escapes before your priorities are funded.';
  }

  if (ratio >= 0.2) {
    return 'You are not broke — your system is leaking. Frequent convenience choices are quietly outpacing intentional decisions.';
  }

  if (ratio >= 0.1) {
    return 'The leak is moderate but persistent: small “it’s fine” purchases are building into a real monthly drain.';
  }

  return 'Your leak is currently controlled, but untracked habits are still shaving off money you could redirect to goals.';
};

const getEmotionalInsight = (ratio, leak) => {
  if (ratio >= 0.3) {
    return `You are likely using spending to buy relief, speed, or dopamine. That costs about ${formatter.format(leak)} every month.`;
  }

  if (ratio >= 0.18) {
    return 'You may be rewarding stress with convenience. It feels small in the moment, but your future self pays the bill.';
  }

  return 'You have decent control, but autopilot spending still steals momentum. Tightening awareness now prevents a larger leak later.';
};

const renderLeaks = (items) => {
  leakList.innerHTML = '';
  items.slice(0, 5).forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.name}: ${formatter.format(item.amount)}/month`;
    leakList.append(li);
  });
};

expenseSlider.addEventListener('input', () => {
  expenseOutput.value = Number(expenseSlider.value).toLocaleString();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  formError.textContent = '';

  const formData = new FormData(form);
  const income = Number(formData.get('income'));
  const sliderExpenses = Number(formData.get('expenses'));
  const customExpensesValue = formData.get('customExpenses');
  const customExpenses = customExpensesValue ? Number(customExpensesValue) : NaN;
  const expenses = Number.isFinite(customExpenses) ? customExpenses : sliderExpenses;
  const categories = parseCategories(String(formData.get('categories') || ''));

  if (!Number.isFinite(income) || income <= 0) {
    formError.textContent = 'Enter a valid monthly income above €0.';
    return;
  }

  if (!Number.isFinite(expenses) || expenses < 0) {
    formError.textContent = 'Expenses must be a valid number of €0 or more.';
    return;
  }

  const monthlyLeak = Math.max(expenses - income * 0.55, 0);
  const ratio = monthlyLeak / income;
  const yearly = monthlyLeak * 12;
  const severity = chooseSeverity(ratio, monthlyLeak);

  const categoryLeaks = blendCategoryLeaks(categories, monthlyLeak);
  const fallbackLeaks = makeDefaultLeaks(monthlyLeak, severity);
  const leakItems = categoryLeaks.length ? categoryLeaks : fallbackLeaks;

  lossHeadline.textContent = `You are losing ${formatter.format(monthlyLeak)} per month.`;
  yearlyLoss.textContent = formatter.format(yearly);
  leakSeverity.textContent = severity;
  overspendingPattern.textContent = getPatternCopy(ratio);
  emotionalInsight.textContent = getEmotionalInsight(ratio, monthlyLeak);
  renderLeaks(leakItems);

  inputScreen.classList.remove('active');
  resultScreen.hidden = false;
  resultScreen.classList.add('active');
  resultScreen.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

resetBtn.addEventListener('click', () => {
  resultScreen.classList.remove('active');
  resultScreen.hidden = true;
  inputScreen.classList.add('active');
  form.reset();
  expenseSlider.value = '1600';
  expenseOutput.value = '1,600';
  formError.textContent = '';
});
