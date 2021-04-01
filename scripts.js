const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active");
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active");
    }
}

const Storage = {

    get() {

        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []

    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}

const transactions = [
    {
        description: 'Luz',
        amount: -50000,
        date: '23-01-2021'
    },
    {
        description: 'Website',
        amount: 500000,
        date: '23-01-2021'
    },
    {
        description: 'Internet',
        amount: -20000,
        date: '23-01-2021'
    },
    {
        description: 'App',
        amount: 200000,
        date: '23-01-2021'
    },
]

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let incomes = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                incomes += transaction.amount
            };
        });

        return incomes;
    },

    expenses() {
        let expenses = 0;

        Transaction.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expenses += transaction.amount
            };
        });

        return expenses;
    },

    total(transactions) {

        return this.incomes(transactions) + this.expenses(transactions);

    },

    saveTransaction(transaction) {
        transaction.amount = Math.round(transaction.amount);
        Transaction.add(transaction);
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement("tr");
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;
        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {

        const CSSclass = transaction.amount > 0 ? "income" : "expense";
        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
            `;

        return html;
    },

    updateBalance(transactions) {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes(transactions));
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses(transactions));
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total(transactions));
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }


}

const Utils = {
    formatCurrency(value) {

        const signal = Number(value) < 0 ? "-" : "";

        //const amount = Math.abs(value / 100);
        let amount = String(value).replace(/\D/g, "");
        amount = Number(amount).toFixed(2) / 100;

        amount = amount.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + amount;


    },

    formatAmount(value) {

        return Number(value) * 100;

    },

    formatDate(date) {

        let arrayDate = date.split('-');
        date = arrayDate[2] + '-' + arrayDate[1] + '-' + arrayDate[0];
        return date;

    }

}



const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }

    },

    formatData() {

        let { description, amount, date } = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return { description, amount, date }

    },

    clearForm() {

        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";

    },

    submit(event) {

        event.preventDefault();

        try {

            Form.validateFields();

            Transaction.saveTransaction(Form.formatData());

            Form.clearForm();

            Modal.close();

        } catch (error) {
            alert(error.message);
        }

    }
}

const App = {
    init() {

        Transaction.all.forEach(DOM.addTransaction);

        DOM.updateBalance(transactions);

        Storage.set(Transaction.all);

    },
    reload() {

        DOM.clearTransactions();
        this.init();

    },
}

App.init();
