const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");
const pageTitle = document.getElementById("page-title");
const modal = document.getElementById("transaction-modal");
const form = document.getElementById("transaction-form");

const transactions = JSON.parse(localStorage.getItem("room_transactions") || "[]");

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function showPage(pageId) {
  pages.forEach((page) => page.classList.toggle("active", page.id === pageId));
  navItems.forEach((item) => item.classList.toggle("active", item.dataset.page === pageId));
  pageTitle.textContent =
    pageId === "nikiroom" ? "NikiRoom" :
    pageId === "vinzzroom" ? "VinzzRoom" :
    pageId.charAt(0).toUpperCase() + pageId.slice(1);
}

function saveTransactions() {
  localStorage.setItem("room_transactions", JSON.stringify(transactions));
}

function render() {
  const nikiTable = document.getElementById("niki-table");
  const vinzzTable = document.getElementById("vinzz-table");

  nikiTable.innerHTML = "";
  vinzzTable.innerHTML = "";

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((item) => {
    totalIncome += Number(item.income || 0);
    totalExpense += Number(item.expense || 0);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.date || "-"}</td>
      <td>${item.checkin || "-"}</td>
      <td>${item.unit || "-"}</td>
      <td>${item.duration || "-"}</td>
      <td>${currency.format(item.income || 0)}</td>
      <td>${currency.format(item.expense || 0)}</td>
      <td>${item.description || "-"}</td>
    `;

    if (item.agent === "nikiroom") {
      nikiTable.appendChild(row);
    } else {
      vinzzTable.appendChild(row);
    }
  });

  document.getElementById("total-income").textContent = currency.format(totalIncome);
  document.getElementById("total-expense").textContent = currency.format(totalExpense);
  document.getElementById("net-balance").textContent = currency.format(totalIncome - totalExpense);
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showPage(item.dataset.page));
});

document.getElementById("add-btn").addEventListener("click", () => {
  document.getElementById("date").valueAsDate = new Date();
  modal.showModal();
});

document.getElementById("close-modal").addEventListener("click", () => modal.close());

form.addEventListener("submit", (event) => {
  event.preventDefault();

  transactions.push({
    id: crypto.randomUUID(),
    agent: document.getElementById("agent").value,
    date: document.getElementById("date").value,
    checkin: document.getElementById("checkin").value,
    unit: document.getElementById("unit").value.trim(),
    duration: document.getElementById("duration").value,
    income: Number(document.getElementById("income").value || 0),
    expense: Number(document.getElementById("expense").value || 0),
    description: document.getElementById("description").value.trim(),
  });

  saveTransactions();
  render();
  form.reset();
  modal.close();
});

render();
