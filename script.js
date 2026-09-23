"use strict";

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2,
  pin: 1111,

  movementsDates: [
    "2026-11-18",
    "2026-12-23",
    "2026-01-28",
    "2026-04-01",
    "2026-05-08",
    "2026-09-08",
    "2026-09-07",
    "2026-09-06",
  ],

  currency: "EUR",
  locale: "pt-PT",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-18",
    "2019-12-23",
    "2020-01-28",
    "2020-04-01",
    "2020-05-08",
    "2020-07-09",
    "2020-07-10",
    "2020-07-11",
  ],

  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Danniel Purcell",
  movements: [250000, 175000, -15000, -45000, -125000, -50000, 350000, -10000],
  interestRate: 1.5,
  pin: 3333,

  movementsDates: [
    "2026-08-18",
    "2026-08-23",
    "2026-08-28",
    "2026-09-01",
    "2026-09-05",
    "2026-09-08",
    "2026-09-12",
    "2026-09-15",
  ],

  currency: "TZS",
  locale: "en-TZ",
};

const accounts = [account1, account2, account3];

// Selecting elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form--transfer .btn");
const btnLoan = document.querySelector(".form--loan .btn");
const btnClose = document.querySelector(".form--close .btn");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");

const inputTransferTo = document.querySelector(
  ".form--transfer input:nth-of-type(1)",
);
const inputTransferAmount = document.querySelector(
  ".form--transfer input:nth-of-type(2)",
);

const inputLoanAmount = document.querySelector(".form--loan input");

const inputCloseUsername = document.querySelector(
  ".form--close input:nth-of-type(1)",
);
const inputClosePin = document.querySelector(
  ".form--close input:nth-of-type(2)",
);

// Forms
const loginForm = document.querySelector(".login");
const transferForm = document.querySelector(".form--transfer");
const loanForm = document.querySelector(".form--loan");
const closeForm = document.querySelector(".form--close");

// Navigation and hero
const nav = document.querySelector("nav");
const hero = document.querySelector(".hero");

// Other variables
let currentAccount;
let timer;
let sorted = false;

// Formatting movement dates
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

// Formatting currency
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// Display movements
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = "";

  // Create an array containing both movements and their dates
  const movements = acc.movements.map(function (mov, i) {
    return {
      movement: mov,
      date: acc.movementsDates[i],
    };
  });

  // Sort movements
  if (sort) {
    movements.sort((a, b) => a.movement - b.movement);
  }

  movements.forEach(function (mov, i) {
    const type = mov.movement > 0 ? "deposit" : "withdrawal";

    const date = new Date(mov.date);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">
          ${i + 1} ${type}
        </div>

        <div class="movements__date">
          ${formatMovementDate(date, acc.locale)}
        </div>

        <div class="movements__value">
          ${formatCurrency(mov.movement, acc.locale, acc.currency)}
        </div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Creating usernames
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

createUsernames(accounts);

// Calculating and displaying balance
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, movement) => acc + movement, 0);

  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency,
  );
};

// Calculating and displaying summary
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const out = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  labelSumOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale,
    acc.currency,
  );

  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency,
  );
};

// Update UI
const updateUI = function (acc) {
  displayMovements(acc, sorted);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

// Show application
const showApp = function () {
  containerApp.classList.add("active");

  // Keep the navigation bar visible
  nav.style.display = "flex";

  // Hide the hero section
  hero.style.display = "none";
};

// Show landing page
const showLandingPage = function () {
  containerApp.classList.remove("active");

  nav.style.display = "flex";
  hero.style.display = "grid";

  labelWelcome.textContent = "Log in to get started";
  labelTimer.textContent = "05:00";
};

// Logout timer
const startLogOutTimer = function () {
  let time = 300;

  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, "0");
    const sec = String(time % 60).padStart(2, "0");

    labelTimer.textContent = `${min}:${sec}`;

    // When timer reaches 0
    if (time === 0) {
      clearInterval(timer);

      currentAccount = null;

      showLandingPage();

      return;
    }

    time--;
  };

  tick();

  return setInterval(tick, 1000);
};

// Login
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Find account
  const account = accounts.find(
    (acc) => acc.username === inputLoginUsername.value,
  );

  // Check username and PIN
  if (account?.pin === Number(inputLoginPin.value)) {
    currentAccount = account;

    // Change welcome message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;

    // Show application
    showApp();

    // Display current date
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
    ).format(new Date());

    // Clear input fields
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur();

    // Start logout timer
    if (timer) clearInterval(timer);

    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  } else {
    labelWelcome.textContent = "Wrong username or PIN";

    inputLoginPin.value = "";
    inputLoginPin.focus();
  }
});

// Transfer money
transferForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentAccount) return;

  const amount = Number(inputTransferAmount.value);
  const receiverUsername = inputTransferTo.value.toLowerCase();

  // Find receiver account
  const receiverAccount = accounts.find(
    (acc) => acc.username === receiverUsername,
  );

  // Check transfer conditions
  if (
    amount > 0 &&
    amount <= currentAccount.balance &&
    receiverAccount &&
    receiverAccount !== currentAccount
  ) {
    // Add movement to sender
    currentAccount.movements.push(-amount);

    // Add movement to receiver
    receiverAccount.movements.push(amount);

    // Add movement dates
    currentAccount.movementsDates.push(new Date().toISOString().split("T")[0]);

    receiverAccount.movementsDates.push(new Date().toISOString().split("T")[0]);

    // Update UI
    updateUI(currentAccount);

    // Clear input fields
    inputTransferTo.value = "";
    inputTransferAmount.value = "";

    // Reset logout timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

// Request loan
loanForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentAccount) return;

  const amount = Number(inputLoanAmount.value);

  // Save the current account
  const loanAccount = currentAccount;

  // Check if account qualifies for loan
  if (amount > 0 && loanAccount.movements.some((mov) => mov >= amount * 0.1)) {
    // Wait for 3 seconds before approving the loan
    setTimeout(function () {
      // Make sure the same account is still logged in
      if (currentAccount !== loanAccount) return;

      loanAccount.movements.push(amount);

      loanAccount.movementsDates.push(new Date().toISOString().split("T")[0]);

      // Update UI
      updateUI(loanAccount);

      // Reset logout timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 3000);
  }

  inputLoanAmount.value = "";
});

// Close account
closeForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!currentAccount) return;

  const username = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  // Check username and PIN
  if (username === currentAccount.username && pin === currentAccount.pin) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username,
    );

    // Remove account
    accounts.splice(index, 1);

    // Clear timer
    clearInterval(timer);

    currentAccount = null;

    // Clear input fields
    inputCloseUsername.value = "";
    inputClosePin.value = "";

    // Return to landing page
    showLandingPage();
  }
});

// Sort movements
btnSort.addEventListener("click", function (e) {
  e.preventDefault();

  if (!currentAccount) return;

  sorted = !sorted;

  displayMovements(currentAccount, sorted);
});
