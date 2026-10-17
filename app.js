document.addEventListener('DOMContentLoaded', () => {
  const balanceEl = document.getElementById('total-balance');
  const incomeEl = document.getElementById('total-income');
  const expenseEl = document.getElementById('total-expense');
  const listEl = document.getElementById('transaction-list');
  const form = document.getElementById('transaction-form');
  const descInput = document.getElementById('desc-input');
  const amountInput = document.getElementById('amount-input');
  const typeSelect = document.getElementById('type-select');
  const categorySelect = document.getElementById('category-select');
  const filterSelect = document.getElementById('filter-select');
  const emptyState = document.getElementById('empty-state');

  // Load from LocalStorage safely
  let transactions = [];
  try {
    const stored = localStorage.getItem('spendwise_data');
    transactions = stored ? JSON.parse(stored) : [];
  } catch (err) {
    transactions = [];
  }

  function saveAndRender() {
    localStorage.setItem('spendwise_data', JSON.stringify(transactions));
    updateOverview();
    renderTransactions();
  }

  function formatCurrency(num) {
    return '₹' + Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function updateOverview() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += Number(t.amount);
      } else {
        expense += Number(t.amount);
      }
    });

    const balance = income - expense;

    balanceEl.textContent = (balance < 0 ? '-' : '') + formatCurrency(Math.abs(balance));
    incomeEl.textContent = '+' + formatCurrency(income);
    expenseEl.textContent = '-' + formatCurrency(expense);
  }

  function renderTransactions() {
    listEl.innerHTML = '';
    const selectedCategory = filterSelect.value;

    const filtered = selectedCategory === 'all' 
      ? transactions 
      : transactions.filter(t => t.category === selectedCategory);

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
    }

    filtered.forEach(t => {
      const li = document.createElement('li');
      li.className = `transaction-item ${t.type}`;
      li.dataset.id = t.id;

      const sign = t.type === 'income' ? '+' : '-';

      li.innerHTML = `
        <div class="tx-info">
          <h4>${t.desc}</h4>
          <p class="tx-meta">${t.category} • ${t.date}</p>
        </div>
        <div class="tx-right">
          <span class="tx-amount ${t.type}">${sign}${formatCurrency(t.amount)}</span>
          <button class="btn-delete" title="Delete entry">&times;</button>
        </div>
      `;

      listEl.appendChild(li);
    });
  }

  // Add Transaction
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = descInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!desc || isNaN(amount) || amount <= 0) return;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });

    const newTx = {
      id: Date.now().toString(),
      desc: desc,
      amount: amount,
      type: typeSelect.value,
      category: categorySelect.value,
      date: dateFormatted
    };

    transactions.unshift(newTx);
    saveAndRender();

    // Reset Form
    descInput.value = '';
    amountInput.value = '';
    typeSelect.value = 'expense';
    categorySelect.value = 'General';
  });

  // Delete Action
  listEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
      const item = e.target.closest('.transaction-item');
      if (!item) return;
      const id = item.dataset.id;
      transactions = transactions.filter(t => t.id !== id);
      saveAndRender();
    }
  });

  // Filter Event
  filterSelect.addEventListener('change', renderTransactions);

  // Initial Boot
  updateOverview();
  renderTransactions();
});
