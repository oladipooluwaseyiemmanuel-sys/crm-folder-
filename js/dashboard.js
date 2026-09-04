// ========================================
// DASHBOARD
// ========================================

// ========================================
// LOGIN CHECK
// ========================================

if (localStorage.getItem("crmLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ========================================
// API
// ========================================

// IMPORTANT:
// Do NOT use localhost here.
// Render serves the frontend and backend together.
const API_URL = "/api";


// ========================================
// AUTHENTICATION
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}


function getAuthHeaders() {

    const token = getToken();

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


// ========================================
// LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem("crmLoggedIn");
    localStorage.removeItem("crmToken");
    localStorage.removeItem("currentUser");

    sessionStorage.clear();

    window.location.href = "login.html";
}


// ========================================
// ELEMENTS
// ========================================

const totalCustomers =
    document.getElementById("totalCustomers");

const newCustomers =
    document.getElementById("newCustomers");

const totalInteractions =
    document.getElementById("totalInteractions");

const pendingTasks =
    document.getElementById("pendingTasks");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// LOAD USER
// ========================================

function loadUser() {

    const savedUser =
        localStorage.getItem("currentUser");

    if (!savedUser) {
        return;
    }

    try {

        const user =
            JSON.parse(savedUser);

        const name =
            user.fullName ||
            user.name ||
            user.username ||
            "User";


        if (userName) {

            userName.textContent =
                name;

        }


        if (userAvatar) {

            userAvatar.textContent =
                name.charAt(0).toUpperCase();

        }

    } catch (error) {

        console.error(
            "Could not load user:",
            error
        );

    }

}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    try {

        const response =
            await fetch(
                `${API_URL}/customers`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        // Session expired

        if (response.status === 401) {

            alert(
                "Your login session has expired. Please login again."
            );

            logoutUser();

            return;

        }


        if (!response.ok) {

            let result = {};

            try {
                result =
                    await response.json();
            } catch (error) {
                // Ignore invalid JSON
            }

            throw new Error(
                result.message ||
                "Could not load customers."
            );

        }


        const result =
            await response.json();


        const customers =
            Array.isArray(result)
                ? result
                : result.customers || [];


        // ========================================
        // TOTAL CUSTOMERS
        // ========================================

        if (totalCustomers) {

            totalCustomers.textContent =
                customers.length;

        }


        // ========================================
        // NEW CUSTOMERS
        // ========================================

        const now =
            new Date();

        const thirtyDaysAgo =
            new Date();

        thirtyDaysAgo.setDate(
            now.getDate() - 30
        );


        const recentCustomers =
            customers.filter(
                function(customer) {

                    const createdValue =
                        customer.createdAt ||
                        customer.created_at ||
                        customer.date;

                    if (!createdValue) {
                        return false;
                    }

                    const createdDate =
                        new Date(createdValue);

                    return (
                        !isNaN(createdDate.getTime()) &&
                        createdDate >= thirtyDaysAgo
                    );

                }
            );


        if (newCustomers) {

            newCustomers.textContent =
                recentCustomers.length;

        }


    } catch (error) {

        console.error(
            "CUSTOMER DASHBOARD ERROR:",
            error
        );


        if (totalCustomers) {
            totalCustomers.textContent = "0";
        }


        if (newCustomers) {
            newCustomers.textContent = "0";
        }

    }

}


// ========================================
// LOAD CONTACTS
// ========================================

async function loadContacts() {

    try {

        const response =
            await fetch(
                `${API_URL}/contacts`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        // Session expired

        if (response.status === 401) {

            alert(
                "Your login session has expired. Please login again."
            );

            logoutUser();

            return;

        }


        if (!response.ok) {

            let result = {};

            try {
                result =
                    await response.json();
            } catch (error) {
                // Ignore invalid JSON
            }

            throw new Error(
                result.message ||
                "Could not load contacts."
            );

        }


        const result =
            await response.json();


        const contacts =
            Array.isArray(result)
                ? result
                : result.contacts || [];


        if (totalInteractions) {

            totalInteractions.textContent =
                contacts.length;

        }


    } catch (error) {

        console.error(
            "CONTACT DASHBOARD ERROR:",
            error
        );


        if (totalInteractions) {

            totalInteractions.textContent =
                "0";

        }

    }

}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    try {

        const response =
            await fetch(
                `${API_URL}/tasks`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        // Session expired

        if (response.status === 401) {

            alert(
                "Your login session has expired. Please login again."
            );

            logoutUser();

            return;

        }


        if (!response.ok) {

            let result = {};

            try {
                result =
                    await response.json();
            } catch (error) {
                // Ignore invalid JSON
            }

            throw new Error(
                result.message ||
                "Could not load tasks."
            );

        }


        const result =
            await response.json();


        const tasks =
            Array.isArray(result)
                ? result
                : result.tasks || [];


        // ========================================
        // PENDING TASKS
        // ========================================

        const pending =
            tasks.filter(
                function(task) {

                    return (
                        String(task.status || "")
                            .toLowerCase() !==
                        "completed"
                    );

                }
            );


        if (pendingTasks) {

            pendingTasks.textContent =
                pending.length;

        }


    } catch (error) {

        console.error(
            "TASK DASHBOARD ERROR:",
            error
        );


        if (pendingTasks) {

            pendingTasks.textContent =
                "0";

        }

    }

}


// ========================================
// LOGOUT BUTTON
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function() {

            const token =
                getToken();


            try {

                if (token) {

                    await fetch(
                        `${API_URL}/logout`,
                        {
                            method: "POST",

                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );

                }

            } catch (error) {

                console.error(
                    "Logout request failed:",
                    error
                );

            }


            logoutUser();

        }
    );

}


// ========================================
// START DASHBOARD
// ========================================

async function startDashboard() {

    loadUser();


    const token =
        getToken();


    if (!token) {

        alert(
            "Please login again."
        );

        logoutUser();

        return;

    }


    await Promise.all([
        loadCustomers(),
        loadContacts(),
        loadTasks()
    ]);

}


// ========================================
// START
// ========================================

startDashboard();