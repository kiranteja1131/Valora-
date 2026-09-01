const API_URL = "http://localhost:5000";

/* =========================
   Navigation
   ========================= */

function goToLogin() {
    window.location.href = "login.html";
}

function goHome() {
    window.location.href = "index.html";
}

function goToTransfer() {
    window.location.href = "transfer.html";
}

function goBackToDashboard() {
    window.location.href = "dashboard.html";
}

function goToDepositRequest() {
    window.location.href = "deposit-request.html";
}

function goToAdminLogin() {
    window.location.href = "admin-login.html";
}


/* =========================
   Admin Login
   ========================= */

const adminLoginForm =
    document.getElementById("admin-login-form");

if (adminLoginForm) {

    adminLoginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("admin-email").value.trim();

        const password =
            document.getElementById("admin-password").value;

        const message =
            document.getElementById("admin-login-message");

        try {

            const response = await fetch(
                `${API_URL}/api/auth/admin-login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                message.textContent = data.message;
                return;
            }

            localStorage.setItem(
                "adminToken",
                data.token
            );

            window.location.href = "admin.html";

        } catch (error) {

            console.error(
                "Admin login error:",
                error
            );

            message.textContent =
                "Unable to connect to the server.";
        }
    });
}


/* =========================
   Login / Register Switching
   ========================= */

function showRegister() {

    document.getElementById("login-form").style.display =
        "none";

    document.getElementById("register-form").style.display =
        "block";

    document.getElementById("form-title").textContent =
        "Create Your Account";

    document.getElementById("form-subtitle").textContent =
        "Join Valora and experience simple banking";
}


function showLogin() {

    document.getElementById("register-form").style.display =
        "none";

    document.getElementById("login-form").style.display =
        "block";

    document.getElementById("form-title").textContent =
        "Welcome Back";

    document.getElementById("form-subtitle").textContent =
        "Login to securely access your account";
}


/* =========================
   Register User
   ========================= */

const registerForm =
    document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("register-name").value.trim();

        const email =
            document.getElementById("register-email").value.trim();

        const phone =
            document.getElementById("register-phone").value.trim();

        const password =
            document.getElementById("register-password").value;

        try {

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Registration failed"
                );

                return;
            }

            alert(
                "Account created successfully! Please login."
            );

            registerForm.reset();

            showLogin();

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            alert(
                "Unable to connect to the server"
            );
        }
    });
}


/* =========================
   Customer Login
   ========================= */

const loginForm =
    document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const email =
            document.getElementById("login-email").value.trim();

        const password =
            document.getElementById("login-password").value;

        try {

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                alert(
                    data.message ||
                    "Invalid email or password"
                );

                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "Unable to connect to the server"
            );
        }
    });
}


/* =========================
   Customer Logout
   ========================= */

function logout() {

    localStorage.removeItem("token");

    window.location.href =
        "index.html";
}


/* =========================
   Admin Logout
   ========================= */

function adminLogout() {

    localStorage.removeItem("adminToken");

    window.location.href =
        "index.html";
}


/* =========================
   Load Dashboard
   ========================= */

async function loadDashboard() {

    const token =
        localStorage.getItem("token");

    if (!token) {

        window.location.href =
            "login.html";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/account/dashboard`,
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            localStorage.removeItem("token");

            window.location.href =
                "login.html";

            return;
        }

        const data =
            await response.json();


        /* User name */

        const userName =
            document.getElementById("user-name");

        if (userName) {

            userName.textContent =
                data.name;
        }


        /* Account number */

        const accountNumber =
            document.getElementById("account-number");

        if (accountNumber) {

            accountNumber.textContent =
                data.accountNumber;
        }


        /* Balance */

        const balance =
            document.getElementById("balance");

        if (balance) {

            balance.textContent =
                Number(data.balance).toFixed(2);
        }


        /* Last transaction */

        const lastTransaction =
            document.getElementById(
                "last-transaction"
            );

        const lastTransactionDate =
            document.getElementById(
                "last-transaction-date"
            );

        if (
            data.transactions &&
            data.transactions.length > 0
        ) {

            const last =
                data.transactions[
                    data.transactions.length - 1
                ];

            if (lastTransaction) {

                lastTransaction.textContent =
                    `${last.type === "credit" ? "+" : "-"}₹${Number(last.amount).toFixed(2)} - ${last.description}`;
            }

            if (lastTransactionDate) {

                lastTransactionDate.textContent =
                    last.date
                        ? new Date(last.date).toLocaleString()
                        : "--";
            }

        } else {

            if (lastTransaction) {
                lastTransaction.textContent =
                    "No recent transactions";
            }

            if (lastTransactionDate) {
                lastTransactionDate.textContent =
                    "--";
            }
        }


        /* Transactions */

        const transactionList =
            document.getElementById(
                "transaction-list"
            );

        if (!transactionList) {
            return;
        }

        if (
            !data.transactions ||
            data.transactions.length === 0
        ) {

            transactionList.innerHTML =
                `<p class="no-transactions">
                    No transactions available
                </p>`;

            return;
        }

        transactionList.innerHTML =
            data.transactions
                .slice(-5)
                .reverse()
                .map(transaction => `

                    <div class="transaction-item">

                        <span>
                            ${transaction.description}
                        </span>

                        <span>
                            ${
                                transaction.type === "credit"
                                    ? "+"
                                    : "-"
                            }₹${Number(
                                transaction.amount
                            ).toFixed(2)}
                        </span>

                    </div>

                `)
                .join("");

    } catch (error) {

        console.error(
            "Failed to load dashboard:",
            error
        );
    }
}


/* =========================
   Load Dashboard Page
   ========================= */

if (
    window.location.pathname.includes(
        "dashboard.html"
    )
) {

    loadDashboard();
}


/* =========================
   Money Transfer
   ========================= */

const transferForm =
    document.getElementById(
        "transfer-form"
    );

if (transferForm) {

    transferForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const token =
                localStorage.getItem("token");

            const recipient =
                document
                    .getElementById("recipient")
                    .value
                    .trim();

            const amount =
                Number(
                    document.getElementById(
                        "transfer-amount"
                    ).value
                );

            const message =
                document.getElementById(
                    "transfer-message"
                );
                const button =
    transferForm.querySelector("button[type='submit']");


            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }


            if (!recipient || amount <= 0) {

                message.textContent =
                    "Please enter valid transfer details.";

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/account/transfer`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({

                                recipientAccountNumber:
                                    recipient,

                                amount
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message;

                    return;
                }


                message.textContent =
                    "✓ " + data.message;


                transferForm.reset();


                loadDashboard();

            } catch (error) {

                console.error(
                    "Transfer error:",
                    error
                );

                message.textContent =
                    "Unable to connect to the server.";
            }
        }
    );
}


/* =========================
   Deposit Request
   ========================= */

const depositRequestForm =
    document.getElementById("deposit-request-form");

if (depositRequestForm) {

    depositRequestForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const amount = Number(
            document.getElementById("request-amount").value
        );

        const reason =
            document.getElementById("request-reason").value.trim();

        const message =
            document.getElementById("deposit-request-message");

        const button =
            depositRequestForm.querySelector("button[type='submit']");

        if (!amount || amount <= 0) {
            message.textContent = "Please enter a valid amount.";
            return;
        }

        try {

            // Prevent double clicking
            button.disabled = true;
            button.textContent = "Submitting...";

            const response = await fetch(
                `${API_URL}/api/account/deposit-request`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        amount,
                        reason
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {

                message.textContent = data.message;

                button.disabled = false;
                button.textContent = "💰 Request Deposit";

                return;
            }

            // Clear everything after successful request
            depositRequestForm.reset();

            message.textContent =
                "✓ Deposit request submitted successfully.";

            // Return button to fresh state
            button.disabled = false;
            button.textContent = "💰 Request Deposit";

        } catch (error) {

            console.error("Deposit request error:", error);

            message.textContent =
                "Unable to connect to the server.";

            button.disabled = false;
            button.textContent = "💰 Request Deposit";
        }
    });
}
/* =========================
   Admin Deposit Requests
   ========================= */

async function loadAdminRequests() {

    const token =
        localStorage.getItem("adminToken");


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    const requestList =
        document.getElementById(
            "admin-request-list"
        );


    if (!requestList) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/deposit-requests`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            requestList.innerHTML =
                `<p class="no-transactions">
                    ${data.message}
                </p>`;

            return;
        }


        const requestCount =
            document.getElementById(
                "request-count"
            );


        if (requestCount) {

            requestCount.textContent =
                `${data.length} pending`;
        }


        if (data.length === 0) {

            requestList.innerHTML =
                `<p class="no-transactions">
                    No pending deposit requests
                </p>`;

            return;
        }


        requestList.innerHTML =
            data.map(request => `

                <div class="admin-request">

                    <div class="request-info">

                        <h3>
                            ${request.user.name}
                        </h3>

                        <p>
                            Account:
                            ${request.user.accountNumber}
                        </p>

                        <p>
                            Phone:
                            ${request.user.phone}
                        </p>

                        <p>
                            Reason:
                            ${request.reason || "Not provided"}
                        </p>

                        <strong>
                            ₹${Number(
                                request.amount
                            ).toFixed(2)}
                        </strong>

                    </div>


                    <div class="request-actions">

                        <button
                            class="approve-btn"
                            onclick="approveDeposit('${request._id}')">

                            ✓ Approve

                        </button>


                        <button
                            class="reject-btn"
                            onclick="rejectDeposit('${request._id}')">

                            ✕ Reject

                        </button>

                    </div>

                </div>

            `).join("");


    } catch (error) {

        console.error(
            "Admin request error:",
            error
        );

        requestList.innerHTML =
            `<p class="no-transactions">
                Unable to load requests
            </p>`;
    }
}


/* =========================
   Load Admin Page
   ========================= */

if (
    window.location.pathname.includes(
        "admin.html"
    )
) {

    loadAdminRequests();
}


/* =========================
   Approve Deposit
   ========================= */

async function approveDeposit(requestId) {

    const token =
        localStorage.getItem(
            "adminToken"
        );


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/deposit-requests/${requestId}/approve`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminRequests();


    } catch (error) {

        console.error(
            "Approve deposit error:",
            error
        );

        alert(
            "Unable to connect to server"
        );
    }
}


/* =========================
   Reject Deposit
   ========================= */

async function rejectDeposit(requestId) {

    const token =
        localStorage.getItem(
            "adminToken"
        );


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/deposit-requests/${requestId}/reject`,
                {
                    method: "PUT",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(data.message);

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminRequests();


    } catch (error) {

        console.error(
            "Reject deposit error:",
            error
        );

        alert(
            "Unable to connect to server"
        );
    }
}