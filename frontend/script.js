const API_URL = "http://localhost:5000";

function goToLogin() {
window.location.href = "login.html";
}

function goHome() {
window.location.href = "index.html";
}

function showRegister() {
document.getElementById("login-form").style.display = "none";
document.getElementById("register-form").style.display = "block";

```
document.getElementById("form-title").textContent = "Create Your Account";
document.getElementById("form-subtitle").textContent =
    "Join BankSphere and experience simple banking";
```

}

function showLogin() {
document.getElementById("register-form").style.display = "none";
document.getElementById("login-form").style.display = "block";

```
document.getElementById("form-title").textContent = "Welcome Back";
document.getElementById("form-subtitle").textContent =
    "Login to securely access your account";
```

}

/* Register User */
const registerForm = document.getElementById("register-form");

if (registerForm) {
registerForm.addEventListener("submit", async (event) => {
event.preventDefault();


    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const phone = document.getElementById("register-phone").value;
    const password = document.getElementById("register-password").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
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
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        alert("Account created successfully! Please login.");
        showLogin();

    } catch (error) {
        alert("Unable to connect to the server");
        console.error(error);
    }
});


}

/* Login User */
const loginForm = document.getElementById("login-form");

if (loginForm) {
loginForm.addEventListener("submit", async (event) => {
event.preventDefault();


    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";

    } catch (error) {
        alert("Unable to connect to the server");
        console.error(error);
    }
});


}

function logout() {
localStorage.removeItem("token");
window.location.href = "index.html";
}
/* Load Dashboard Data */
async function loadDashboard() {
const token = localStorage.getItem("token");


// Prevent access without login
if (!token) {
    window.location.href = "login.html";
    return;
}

try {
    const response = await fetch(`${API_URL}/api/account/dashboard`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // Token is invalid or expired
    if (!response.ok) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    const data = await response.json();

    // Update account information
    document.getElementById("user-name").textContent = data.name;
    document.querySelector(".account-number").textContent =
        `Account No: XXXX XXXX ${data.accountNumber.slice(-4)}`;
    document.getElementById("balance").textContent =
        Number(data.balance).toFixed(2);

    // Update transactions
    const transactionList = document.getElementById("transaction-list");

    if (data.transactions.length === 0) {
        transactionList.innerHTML =
            '<p class="no-transactions">No transactions available</p>';
    } else {
        transactionList.innerHTML = data.transactions.map(transaction => `
            <div class="transaction-item">
                <span>${transaction.description}</span>
                <span>${transaction.type === "credit" ? "+" : "-"}₹${transaction.amount}</span>
            </div>
        `).join("");
    }

} catch (error) {
    console.error("Failed to load dashboard:", error);
}


}

// Load data only when dashboard.html is open
if (window.location.pathname.includes("dashboard.html")) {
loadDashboard();
}
