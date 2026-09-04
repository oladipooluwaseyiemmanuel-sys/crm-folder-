// ========================================
// SETTINGS PAGE
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
// Do NOT use localhost.
// Render serves the frontend and backend together.
const API_URL = "/api";


// ========================================
// TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders(includeContentType = false) {

    const token = getToken();

    const headers = {
        "Authorization": `Bearer ${token}`
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ========================================
// ELEMENTS
// ========================================

const settingsForm =
    document.getElementById("settingsForm");

const nameInput =
    document.getElementById("settingsName");

const emailInput =
    document.getElementById("settingsEmail");

const languageInput =
    document.getElementById("settingsLanguage");

const timezoneInput =
    document.getElementById("settingsTimezone");

const emailNotifications =
    document.getElementById("emailNotifications");

const customerNotifications =
    document.getElementById("customerNotifications");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// LOGOUT USER
// ========================================

function logoutUser() {

    localStorage.removeItem("crmLoggedIn");
    localStorage.removeItem("crmToken");
    localStorage.removeItem("currentUser");

    sessionStorage.clear();

    window.location.href = "login.html";
}


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

        const userName =
            document.getElementById("userName");

        const userAvatar =
            document.getElementById("userAvatar");

        if (userName) {
            userName.textContent = name;
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
// LOAD SETTINGS
// ========================================

async function loadSettings() {

    try {

        const response =
            await fetch(
                `${API_URL}/settings`,
                {
                    method: "GET",
                    headers: getAuthHeaders()
                }
            );


        // ========================================
        // SESSION EXPIRED
        // ========================================

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
                "Could not load settings."
            );
        }


        const result =
            await response.json();


        const settings =
            result.settings || result;


        // ========================================
        // NAME
        // ========================================

        if (nameInput) {

            nameInput.value =
                settings.name || "";

        }


        // ========================================
        // EMAIL
        // ========================================

        if (emailInput) {

            emailInput.value =
                settings.email || "";

        }


        // ========================================
        // LANGUAGE
        // ========================================

        if (languageInput) {

            languageInput.value =
                settings.language ||
                "English";

        }


        // ========================================
        // TIMEZONE
        // ========================================

        if (timezoneInput) {

            timezoneInput.value =
                settings.timezone ||
                "West Africa Time (WAT)";

        }


        // ========================================
        // EMAIL NOTIFICATIONS
        // ========================================

        if (emailNotifications) {

            emailNotifications.checked =
                Boolean(
                    settings.emailNotifications
                );

        }


        // ========================================
        // CUSTOMER NOTIFICATIONS
        // ========================================

        if (customerNotifications) {

            customerNotifications.checked =
                Boolean(
                    settings.customerNotifications
                );

        }


    } catch (error) {

        console.error(
            "LOAD SETTINGS ERROR:",
            error
        );

        alert(
            "Could not load your settings."
        );

    }
}


// ========================================
// SAVE SETTINGS
// ========================================

if (settingsForm) {

    settingsForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ========================================
            // GET VALUES
            // ========================================

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const language =
                languageInput
                    ? languageInput.value
                    : "English";

            const timezone =
                timezoneInput
                    ? timezoneInput.value
                    : "West Africa Time (WAT)";

            const emailNotify =
                emailNotifications
                    ? emailNotifications.checked
                    : false;

            const customerNotify =
                customerNotifications
                    ? customerNotifications.checked
                    : false;


            // ========================================
            // VALIDATION
            // ========================================

            if (!name || !email) {

                alert(
                    "Name and email are required."
                );

                return;
            }


            // ========================================
            // SAVE
            // ========================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/settings`,
                        {
                            method: "PUT",

                            headers:
                                getAuthHeaders(true),

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    language:
                                        language,

                                    timezone:
                                        timezone,

                                    emailNotifications:
                                        emailNotify,

                                    customerNotifications:
                                        customerNotify

                                })
                        }
                    );


                // ========================================
                // SESSION EXPIRED
                // ========================================

                if (response.status === 401) {

                    alert(
                        "Your login session has expired. Please login again."
                    );

                    logoutUser();

                    return;
                }


                let result = {};

                try {

                    result =
                        await response.json();

                } catch (error) {

                    // Ignore invalid JSON

                }


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to save settings."
                    );

                    return;
                }


                // ========================================
                // SUCCESS
                // ========================================

                alert(
                    "Settings saved successfully!"
                );


                // Update local user information
                const currentUser =
                    localStorage.getItem(
                        "currentUser"
                    );

                if (currentUser) {

                    try {

                        const user =
                            JSON.parse(currentUser);

                        user.fullName =
                            name;

                        user.name =
                            name;

                        user.email =
                            email;

                        localStorage.setItem(
                            "currentUser",
                            JSON.stringify(user)
                        );

                    } catch (error) {

                        console.error(
                            "Could not update local user:",
                            error
                        );

                    }
                }


                loadUser();

            } catch (error) {

                console.error(
                    "SAVE SETTINGS ERROR:",
                    error
                );

                alert(
                    "Could not connect to the CRM backend."
                );

            }

        }
    );

}


// ========================================
// LOGOUT
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

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
                    "Logout error:",
                    error
                );

            }

            logoutUser();

        }
    );

}


// ========================================
// INITIALIZE
// ========================================

async function startSettingsPage() {

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

    await loadSettings();

}


// ========================================
// START
// ========================================

startSettingsPage();