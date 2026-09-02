// =====================================================
// VALORA - FINAL FRONTEND SCRIPT
// =====================================================

const API_URL = "http://localhost:5000";

// =====================================================
// NAVIGATION
// =====================================================

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

function goToProfileUpdate() {
    window.location.href = "profile-update.html";
}

function goToAdminLogin() {
    window.location.href = "admin-login.html";
}


// =====================================================
// CUSTOMER LOGOUT
// =====================================================

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}


// =====================================================
// ADMIN LOGOUT
// =====================================================

function adminLogout() {
    localStorage.removeItem("adminToken");
    window.location.href = "index.html";
}


// =====================================================
// ADMIN LOGIN
// =====================================================

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

                if (message) {
                    message.textContent =
                        data.message ||
                        "Invalid admin credentials";
                }

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

            if (message) {
                message.textContent =
                    "Unable to connect to the server.";
            }
        }
    });
}


// =====================================================
// LOGIN / REGISTER SWITCHING
// =====================================================

function showRegister() {

    const loginForm =
        document.getElementById("login-form");

    const registerForm =
        document.getElementById("register-form");

    const formTitle =
        document.getElementById("form-title");

    const formSubtitle =
        document.getElementById("form-subtitle");

    if (loginForm)
        loginForm.style.display = "none";

    if (registerForm)
        registerForm.style.display = "block";

    if (formTitle)
        formTitle.textContent = "Create Your Account";

    if (formSubtitle)
        formSubtitle.textContent =
            "Join Valora and experience simple banking";
}


function showLogin() {

    const loginForm =
        document.getElementById("login-form");

    const registerForm =
        document.getElementById("register-form");

    const formTitle =
        document.getElementById("form-title");

    const formSubtitle =
        document.getElementById("form-subtitle");

    if (registerForm)
        registerForm.style.display = "none";

    if (loginForm)
        loginForm.style.display = "block";

    if (formTitle)
        formTitle.textContent = "Welcome Back";

    if (formSubtitle)
        formSubtitle.textContent =
            "Login to securely access your account";
}


// =====================================================
// REGISTER USER
// =====================================================

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

            const data =
                await response.json();

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
                "Unable to connect to the server."
            );
        }
    });
}


// =====================================================
// CUSTOMER LOGIN
// =====================================================

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

            const data =
                await response.json();

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
                "Unable to connect to the server."
            );
        }
    });
}


// =====================================================
// CUSTOMER DASHBOARD
// =====================================================

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


        const userName =
            document.getElementById("user-name");

        if (userName) {
            userName.textContent =
                data.name || "--";
        }


        const accountNumber =
            document.getElementById("account-number");

        if (accountNumber) {
            accountNumber.textContent =
                data.accountNumber || "--";
        }


        const balance =
            document.getElementById("balance");

        if (balance) {
            balance.textContent =
                Number(data.balance || 0).toFixed(2);
        }


        const transactions =
            data.transactions || [];


        const transactionList =
            document.getElementById(
                "transaction-list"
            );


        const lastTransaction =
            document.getElementById(
                "last-transaction"
            );


        const lastTransactionDate =
            document.getElementById(
                "last-transaction-date"
            );


        if (transactions.length > 0) {

            const last =
                transactions[0];

            if (lastTransaction) {

                lastTransaction.textContent =
                    `${last.type === "credit" ? "+" : "-"}₹${Number(
                        last.amount || 0
                    ).toFixed(2)} - ${last.description}`;
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


        if (!transactionList) {
            return;
        }


        if (transactions.length === 0) {

            transactionList.innerHTML = `
                <p class="no-transactions">
                    No transactions available
                </p>
            `;

            return;
        }


        transactionList.innerHTML =
            transactions
                .slice(0, 5)
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
                                transaction.amount || 0
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


if (
    window.location.pathname.includes(
        "dashboard.html"
    )
) {
    loadDashboard();
}


// =====================================================
// MONEY TRANSFER
// =====================================================

const transferForm =
    document.getElementById("transfer-form");

if (transferForm) {

    transferForm.addEventListener("submit", async (event) => {

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
            transferForm.querySelector(
                "button[type='submit']"
            );


        if (!token) {

            window.location.href =
                "login.html";

            return;
        }


        if (!recipient) {

            message.textContent =
                "Please enter account number or phone number.";

            return;
        }


        if (!amount || amount <= 0) {

            message.textContent =
                "Please enter a valid amount.";

            return;
        }


        try {

            button.disabled = true;

            button.textContent =
                "Processing...";


            const response =
                await fetch(
                    `${API_URL}/api/account/transfer`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",

                            Authorization:
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            recipientAccountNumber:
                                recipient,

                            amount:
                                amount
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Transfer failed.";

                button.disabled = false;

                button.textContent =
                    "Transfer Money";

                return;
            }


            message.textContent =
                "✓ " + data.message;


            transferForm.reset();


            button.disabled = false;

            button.textContent =
                "Transfer Money";

        } catch (error) {

            console.error(
                "Transfer error:",
                error
            );

            message.textContent =
                "Unable to connect to server.";

            button.disabled = false;

            button.textContent =
                "Transfer Money";
        }
    });
}


// =====================================================
// DEPOSIT REQUEST
// =====================================================

const depositRequestForm =
    document.getElementById(
        "deposit-request-form"
    );

if (depositRequestForm) {

    depositRequestForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const token =
                localStorage.getItem("token");

            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }


            const amount =
                Number(
                    document.getElementById(
                        "request-amount"
                    ).value
                );


            const reason =
                document.getElementById(
                    "request-reason"
                ).value.trim();


            const message =
                document.getElementById(
                    "deposit-request-message"
                );


            const button =
                depositRequestForm.querySelector(
                    "button[type='submit']"
                );


            if (!amount || amount <= 0) {

                message.textContent =
                    "Please enter a valid amount.";

                return;
            }


            try {

                button.disabled = true;

                button.textContent =
                    "Submitting...";


                const response =
                    await fetch(
                        `${API_URL}/api/account/deposit-request`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                amount,
                                reason
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Deposit request failed.";

                    button.disabled = false;

                    button.textContent =
                        "💰 Request Deposit";

                    return;
                }


                depositRequestForm.reset();


                message.textContent =
                    "✓ Deposit request submitted successfully.";


                button.disabled = false;

                button.textContent =
                    "💰 Request Deposit";

            } catch (error) {

                console.error(
                    "Deposit request error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server.";

                button.disabled = false;

                button.textContent =
                    "💰 Request Deposit";
            }
        }
    );
}


// =====================================================
// CUSTOMER - PROFILE UPDATE REQUEST
// =====================================================

const profileUpdateForm =
    document.getElementById(
        "profile-update-form"
    );

if (profileUpdateForm) {

    profileUpdateForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const token =
                localStorage.getItem("token");

            if (!token) {

                window.location.href =
                    "login.html";

                return;
            }


            const name =
                document.getElementById(
                    "update-name"
                ).value.trim();


            const email =
                document.getElementById(
                    "update-email"
                ).value.trim();


            const phone =
                document.getElementById(
                    "update-phone"
                ).value.trim();


            const reason =
                document.getElementById(
                    "update-reason"
                ).value.trim();


            const message =
                document.getElementById(
                    "profile-update-message"
                );


            // At least one profile field must be entered.
            // Reason alone is not a profile change.

            if (!name && !email && !phone) {

                message.textContent =
                    "Please enter at least one detail to change.";

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/account/profile-update-request`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                Authorization:
                                    `Bearer ${token}`
                            },

                            // IMPORTANT:
                            // Backend expects name, email, phone, reason
                            // directly in req.body.

                            body: JSON.stringify({
                                name,
                                email,
                                phone,
                                reason
                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    message.textContent =
                        data.message ||
                        "Unable to submit request.";

                    return;
                }


                message.textContent =
                    "✓ Profile update request submitted successfully.";


                // Reset entire form after successful request.

                profileUpdateForm.reset();

            } catch (error) {

                console.error(
                    "Profile update request error:",
                    error
                );

                message.textContent =
                    "Unable to connect to server.";
            }
        }
    );
}


// =====================================================
// ADMIN - LOAD DEPOSIT REQUESTS
// =====================================================

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

            requestList.innerHTML = `
                <p class="no-transactions">
                    ${data.message || "Unable to load requests"}
                </p>
            `;

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

            requestList.innerHTML = `
                <p class="no-transactions">
                    No pending deposit requests
                </p>
            `;

            return;
        }


        requestList.innerHTML =
            data.map(request => `

                <div class="admin-request">

                    <div class="request-info">

                        <h3>
                            ${request.user?.name || "Unknown User"}
                        </h3>

                        <p>
                            Account:
                            ${request.user?.accountNumber || "--"}
                        </p>

                        <p>
                            Phone:
                            ${request.user?.phone || "--"}
                        </p>

                        <p>
                            Reason:
                            ${request.reason || "Not provided"}
                        </p>

                        <strong>
                            ₹${Number(
                                request.amount || 0
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

        requestList.innerHTML = `
            <p class="no-transactions">
                Unable to load requests
            </p>
        `;
    }
}


// =====================================================
// APPROVE DEPOSIT
// =====================================================

async function approveDeposit(requestId) {

    const token =
        localStorage.getItem("adminToken");

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

            alert(
                data.message ||
                "Approval failed"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminRequests();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Approve deposit error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// REJECT DEPOSIT
// =====================================================

async function rejectDeposit(requestId) {

    const token =
        localStorage.getItem("adminToken");

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

            alert(
                data.message ||
                "Rejection failed"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminRequests();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Reject deposit error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - LOAD PROFILE UPDATE REQUESTS
// =====================================================

async function loadAdminProfileRequests() {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    const requestList =
        document.getElementById(
            "admin-profile-request-list"
        );


    if (!requestList) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/profile-update-requests`,
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

            requestList.innerHTML = `
                <p class="no-transactions">
                    ${data.message || "Unable to load profile requests"}
                </p>
            `;

            return;
        }


        const count =
            document.getElementById(
                "profile-request-count"
            );


        if (count) {

            count.textContent =
                `${data.length} pending`;
        }


        if (!data.length) {

            requestList.innerHTML = `
                <p class="no-transactions">
                    No pending profile update requests
                </p>
            `;

            return;
        }


        requestList.innerHTML =
            data.map(request => {

                const changes =
                    request.requestedChanges || {};

                return `

                    <div class="admin-request">

                        <div class="request-info">

                            <h3>
                                ${request.user?.name || "Unknown User"}
                            </h3>

                            <p>
                                Account:
                                ${request.user?.accountNumber || "--"}
                            </p>

                            <p>
                                Current Email:
                                ${request.user?.email || "--"}
                            </p>

                            <p>
                                Current Phone:
                                ${request.user?.phone || "--"}
                            </p>

                            <hr>

                            <p>
                                <strong>Requested Changes:</strong>
                            </p>

                            ${
                                changes.name
                                    ? `<p>New Name: ${changes.name}</p>`
                                    : ""
                            }

                            ${
                                changes.email
                                    ? `<p>New Email: ${changes.email}</p>`
                                    : ""
                            }

                            ${
                                changes.phone
                                    ? `<p>New Phone: ${changes.phone}</p>`
                                    : ""
                            }

                            <p>
                                Reason:
                                ${request.reason || "Not provided"}
                            </p>

                        </div>


                        <div class="request-actions">

                            <button
                                class="approve-btn"
                                onclick="approveProfileUpdate('${request._id}')">

                                ✓ Approve

                            </button>


                            <button
                                class="reject-btn"
                                onclick="rejectProfileUpdate('${request._id}')">

                                ✕ Reject

                            </button>

                        </div>

                    </div>

                `;
            }).join("");

    } catch (error) {

        console.error(
            "Profile request loading error:",
            error
        );

        requestList.innerHTML = `
            <p class="no-transactions">
                Unable to load profile requests.
            </p>
        `;
    }
}


// =====================================================
// ADMIN - APPROVE PROFILE UPDATE
// =====================================================

async function approveProfileUpdate(requestId) {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    if (!confirm(
        "Approve this profile update request?"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/profile-update-requests/${requestId}/approve`,
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

            alert(
                data.message ||
                "Failed to approve profile update"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminProfileRequests();

        loadAdminUsers();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Approve profile update error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - REJECT PROFILE UPDATE
// =====================================================

async function rejectProfileUpdate(requestId) {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    if (!confirm(
        "Reject this profile update request?"
    )) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/profile-update-requests/${requestId}/reject`,
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

            alert(
                data.message ||
                "Failed to reject profile update"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminProfileRequests();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Reject profile update error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - LOAD USERS
// =====================================================

async function loadAdminUsers() {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    const userList =
        document.getElementById(
            "admin-user-list"
        );


    if (!userList) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const users =
            await response.json();


        if (!response.ok) {

            userList.innerHTML = `
                <p class="no-transactions">
                    ${users.message || "Unable to load users"}
                </p>
            `;

            return;
        }


        if (users.length === 0) {

            userList.innerHTML = `
                <p class="no-transactions">
                    No registered users.
                </p>
            `;

            return;
        }


        userList.innerHTML =
            users.map(user => `

                <div class="admin-user">

                    <div class="user-info">

                        <h3>
                            ${user.name}
                        </h3>

                        <p>
                            Email:
                            ${user.email}
                        </p>

                        <p>
                            Phone:
                            ${user.phone}
                        </p>

                        <p>
                            Account:
                            ${user.accountNumber}
                        </p>

                        <p>
                            Balance:
                            ₹${Number(
                                user.balance || 0
                            ).toFixed(2)}
                        </p>

                        <p>
                            Status:
                            <strong>
                                ${user.status}
                            </strong>
                        </p>

                    </div>


                    <div class="user-actions">

                        <button
                            class="primary-btn"
                            onclick="viewUser('${user._id}')">

                            View

                        </button>


                        ${
                            user.status === "active"

                            ? `

                                <button
                                    class="reject-btn"
                                    onclick="suspendUser('${user._id}')">

                                    Suspend

                                </button>

                            `

                            : `

                                <button
                                    class="approve-btn"
                                    onclick="activateUser('${user._id}')">

                                    Activate

                                </button>

                            `
                        }


                        <button
                            class="primary-btn"
                            onclick="updateUser('${user._id}')">

                            Edit

                        </button>


                        <button
                            class="primary-btn"
                            onclick="resetUserPassword('${user._id}')">

                            Reset Password

                        </button>


                        <button
                            class="reject-btn"
                            onclick="deleteUser('${user._id}')">

                            Delete

                        </button>

                    </div>

                </div>

            `).join("");

    } catch (error) {

        console.error(
            "Load users error:",
            error
        );

        userList.innerHTML = `
            <p class="no-transactions">
                Unable to load users.
            </p>
        `;
    }
}


// =====================================================
// ADMIN - LOAD STATISTICS
// =====================================================

async function loadAdminStats() {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/stats`,
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
            return;
        }


        const totalUsers =
            document.getElementById(
                "total-users"
            );

        const activeUsers =
            document.getElementById(
                "active-users"
            );

        const totalDeposits =
            document.getElementById(
                "total-deposits"
            );

        const pendingRequests =
            document.getElementById(
                "pending-requests"
            );


        if (totalUsers) {
            totalUsers.textContent =
                data.totalUsers ?? 0;
        }


        if (activeUsers) {
            activeUsers.textContent =
                data.activeUsers ?? 0;
        }


        if (totalDeposits) {
            totalDeposits.textContent =
                `₹${Number(
                    data.totalBalance || 0
                ).toFixed(2)}`;
        }


        if (pendingRequests) {
            pendingRequests.textContent =
                data.pendingRequests ?? 0;
        }

    } catch (error) {

        console.error(
            "Admin stats error:",
            error
        );
    }
}


// =====================================================
// ADMIN - VIEW SINGLE USER
// =====================================================

async function viewUser(userId) {

    const token =
        localStorage.getItem("adminToken");

    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const user =
            await response.json();


        if (!response.ok) {

            alert(
                user.message ||
                "Unable to fetch user"
            );

            return;
        }


        alert(
            `USER DETAILS\n\n` +
            `Name: ${user.name}\n` +
            `Email: ${user.email}\n` +
            `Phone: ${user.phone}\n` +
            `Account: ${user.accountNumber}\n` +
            `Balance: ₹${Number(
                user.balance || 0
            ).toFixed(2)}\n` +
            `Status: ${user.status}\n` +
            `Transactions: ${
                user.transactions?.length || 0
            }`
        );

    } catch (error) {

        console.error(
            "View user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - SUSPEND USER
// =====================================================

async function suspendUser(userId) {

    if (!confirm(
        "Are you sure you want to suspend this user?"
    )) {
        return;
    }


    const token =
        localStorage.getItem("adminToken");


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}/suspend`,
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

            alert(
                data.message ||
                "Failed to suspend user"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminUsers();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Suspend user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - ACTIVATE USER
// =====================================================

async function activateUser(userId) {

    const token =
        localStorage.getItem("adminToken");


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}/activate`,
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

            alert(
                data.message ||
                "Failed to activate user"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminUsers();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Activate user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - DELETE USER
// =====================================================

async function deleteUser(userId) {

    if (!confirm(
        "Are you sure you want to permanently delete this user?"
    )) {
        return;
    }


    const token =
        localStorage.getItem("adminToken");


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete user"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminUsers();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Delete user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - CREATE USER
// =====================================================

async function createAdminUser() {

    const token =
        localStorage.getItem("adminToken");


    if (!token) {

        window.location.href =
            "admin-login.html";

        return;
    }


    const name =
        prompt("Enter customer name:");

    if (!name) return;


    const email =
        prompt("Enter customer email:");

    if (!email) return;


    const phone =
        prompt("Enter customer phone:");

    if (!phone) return;


    const password =
        prompt("Enter temporary password:");

    if (!password) return;


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        password
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to create user"
            );

            return;
        }


        alert(
            `✓ User created successfully\n\n` +
            `Account Number: ${data.user.accountNumber}`
        );


        loadAdminUsers();

        loadAdminStats();

    } catch (error) {

        console.error(
            "Create user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - UPDATE USER
// =====================================================

async function updateUser(userId) {

    const token =
        localStorage.getItem("adminToken");


    const name =
        prompt("Enter new name:");

    if (name === null) return;


    const email =
        prompt("Enter new email:");

    if (email === null) return;


    const phone =
        prompt("Enter new phone:");

    if (phone === null) return;


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        phone
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to update user"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );


        loadAdminUsers();

    } catch (error) {

        console.error(
            "Update user error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - RESET PASSWORD
// =====================================================

async function resetUserPassword(userId) {

    const newPassword =
        prompt(
            "Enter new password (minimum 6 characters):"
        );


    if (!newPassword) {
        return;
    }


    const token =
        localStorage.getItem("adminToken");


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/users/${userId}/reset-password`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        newPassword
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to reset password"
            );

            return;
        }


        alert(
            "✓ " + data.message
        );

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        alert(
            "Unable to connect to server."
        );
    }
}


// =====================================================
// ADMIN - TRANSACTION MONITORING
// =====================================================

async function loadAdminTransactions() {

    const token =
        localStorage.getItem("adminToken");


    if (!token) {
        return;
    }


    const transactionList =
        document.getElementById(
            "admin-transaction-list"
        );


    if (!transactionList) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/admin/transactions`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


        const transactions =
            await response.json();


        if (!response.ok) {

            transactionList.innerHTML = `
                <p class="no-transactions">
                    ${transactions.message || "Unable to load transactions"}
                </p>
            `;

            return;
        }


        if (
            !transactions ||
            transactions.length === 0
        ) {

            transactionList.innerHTML = `
                <p class="no-transactions">
                    No transactions available.
                </p>
            `;

            return;
        }


        transactionList.innerHTML =
            transactions
                .slice(0, 20)
                .map(transaction => `

                    <div class="transaction-item">

                        <div>

                            <strong>
                                ${transaction.userName}
                            </strong>

                            <p>
                                Account:
                                ${transaction.accountNumber}
                            </p>

                            <p>
                                ${transaction.description}
                            </p>

                            <small>
                                ${
                                    transaction.date
                                        ? new Date(
                                            transaction.date
                                        ).toLocaleString()
                                        : "--"
                                }
                            </small>

                        </div>


                        <div>

                            <strong>
                                ${
                                    transaction.type === "credit"
                                        ? "+"
                                        : "-"
                                }₹${Number(
                                    transaction.amount || 0
                                ).toFixed(2)}
                            </strong>

                            ${
                                transaction.highValue
                                    ? `
                                        <p>
                                            ⚠️ High Value
                                        </p>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `)
                .join("");

    } catch (error) {

        console.error(
            "Admin transactions error:",
            error
        );

        transactionList.innerHTML = `
            <p class="no-transactions">
                Unable to load transactions.
            </p>
        `;
    }
}


// =====================================================
// FEEDBACK
// =====================================================

function openFeedback() {

    const box =
        document.getElementById(
            "feedback-box"
        );

    if (box) {
        box.style.display = "block";
    }
}


function closeFeedback() {

    const box =
        document.getElementById(
            "feedback-box"
        );

    if (box) {
        box.style.display = "none";
    }
}


async function submitFeedback() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        alert(
            "Please login first."
        );

        return;
    }


    const message =
        document.getElementById(
            "feedback-text"
        ).value.trim();


    const feedbackMessage =
        document.getElementById(
            "feedback-message"
        );


    if (!message) {

        feedbackMessage.textContent =
            "Please enter your feedback.";

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/account/feedback`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        message
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            feedbackMessage.textContent =
                data.message ||
                "Failed to submit feedback.";

            return;
        }


        feedbackMessage.textContent =
            "✓ " + data.message;


        document.getElementById(
            "feedback-text"
        ).value = "";

    } catch (error) {

        console.error(
            "Feedback error:",
            error
        );

        feedbackMessage.textContent =
            "Unable to connect to server.";
    }
}


// =====================================================
// SYSTEM OPERATIONS
// =====================================================

function enableMaintenance() {

    const message =
        document.getElementById(
            "admin-system-message"
        );

    if (message) {

        message.textContent =
            "Maintenance mode controls can be connected to a backend system-settings API later.";
    }
}


function sendAnnouncement() {

    const announcement =
        prompt(
            "Enter announcement message:"
        );


    if (!announcement) {
        return;
    }


    const message =
        document.getElementById(
            "admin-system-message"
        );


    if (message) {

        message.textContent =
            `Announcement prepared: ${announcement}`;
    }
}


function loadAuditLogs() {

    const message =
        document.getElementById(
            "admin-system-message"
        );


    if (message) {

        message.textContent =
            "Audit log system is ready for backend audit-log integration.";
    }
}


// =====================================================
// LOAD ADMIN PAGE
// =====================================================

if (
    window.location.pathname.includes(
        "admin.html"
    )
) {

    loadAdminRequests();

    loadAdminProfileRequests();

    loadAdminUsers();

    loadAdminStats();

    loadAdminTransactions();
}