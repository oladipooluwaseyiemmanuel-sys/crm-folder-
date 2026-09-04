// ========================================
// CONTACTS PAGE
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
// TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}

function getAuthHeaders(includeContentType = false) {
    const headers = {
        "Authorization": `Bearer ${getToken()}`
    };

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ========================================
// DATA
// ========================================

let customers = [];
let contacts = [];


// ========================================
// USER INFORMATION
// ========================================

function loadUser() {
    const savedUser = localStorage.getItem("currentUser");

    if (!savedUser) {
        return;
    }

    try {
        const user = JSON.parse(savedUser);

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
        console.error("Unable to load user:", error);
    }
}


// ========================================
// ELEMENTS
// ========================================

const contactForm =
    document.getElementById("contactForm");

const contactModal =
    document.getElementById("contactModal");

const addContactButton =
    document.getElementById("addContactButton");

const closeModal =
    document.getElementById("closeModal");

const cancelContact =
    document.getElementById("cancelContact");

const contactTableBody =
    document.getElementById("contactTableBody");

const searchContact =
    document.getElementById("searchContact");

const contactCustomer =
    document.getElementById("contactCustomer");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// LOGOUT / SESSION EXPIRED
// ========================================

function logoutUser() {

    localStorage.removeItem("crmToken");
    localStorage.removeItem("crmLoggedIn");
    localStorage.removeItem("currentUser");

    sessionStorage.clear();

    window.location.href = "login.html";
}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    try {

        const response = await fetch(
            `${API_URL}/customers`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (response.status === 401) {

            alert(
                "Your login session has expired. Please login again."
            );

            logoutUser();
            return false;
        }

        if (!response.ok) {

            let result = {};

            try {
                result = await response.json();
            } catch (error) {
                // Ignore JSON parsing error
            }

            throw new Error(
                result.message ||
                "Could not load customers."
            );
        }

        const result =
            await response.json();

        customers =
            Array.isArray(result)
                ? result
                : result.customers || [];

        if (contactCustomer) {

            contactCustomer.innerHTML = `
                <option value="">
                    Select customer
                </option>
            `;

            customers.forEach(function (customer) {

                const option =
                    document.createElement("option");

                option.value = customer.id;

                option.textContent =
                    customer.name || "Unnamed Customer";

                contactCustomer.appendChild(option);
            });
        }

        return true;

    } catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );

        return false;
    }
}


// ========================================
// LOAD CONTACTS
// ========================================

async function loadContacts() {

    if (!contactTableBody) {
        return;
    }

    contactTableBody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center; padding:30px;">
                Loading contacts...
            </td>
        </tr>
    `;

    try {

        const response = await fetch(
            `${API_URL}/contacts`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

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
                result = await response.json();
            } catch (error) {
                // Ignore JSON parsing error
            }

            throw new Error(
                result.message ||
                "Could not load contacts."
            );
        }

        const result =
            await response.json();

        contacts =
            Array.isArray(result)
                ? result
                : result.contacts || [];

        displayContacts();

    } catch (error) {

        console.error(
            "Error loading contacts:",
            error
        );

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    Could not load contacts.
                </td>
            </tr>
        `;
    }
}


// ========================================
// DISPLAY CONTACTS
// ========================================

function displayContacts(list = contacts) {

    if (!contactTableBody) {
        return;
    }

    contactTableBody.innerHTML = "";

    if (!list || list.length === 0) {

        contactTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    No contacts found.
                </td>
            </tr>
        `;

        return;
    }

    list.forEach(function (contact) {

        const customer =
            customers.find(function (item) {

                return String(item.id) ===
                    String(contact.customerId);

            });

        const customerName =
            customer
                ? customer.name
                : "Unknown Customer";

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>
                ${escapeHTML(customerName)}
            </td>

            <td>
                ${escapeHTML(contact.type)}
            </td>

            <td>
                ${escapeHTML(contact.date)}
            </td>

            <td>
                ${escapeHTML(contact.subject)}
            </td>

            <td>
                ${escapeHTML(contact.notes || "-")}
            </td>

            <td>

                <button
                    type="button"
                    class="delete-button"
                    data-id="${escapeHTML(contact.id)}">
                    Delete
                </button>

            </td>
        `;

        contactTableBody.appendChild(row);
    });
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


// ========================================
// OPEN MODAL
// ========================================

if (addContactButton) {

    addContactButton.addEventListener(
        "click",
        async function () {

            if (contactForm) {
                contactForm.reset();
            }

            const loaded =
                await loadCustomers();

            if (!loaded) {
                return;
            }

            const dateInput =
                document.getElementById("contactDate");

            if (dateInput) {

                dateInput.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];
            }

            if (contactModal) {
                contactModal.classList.add("show");
            }
        }
    );
}


// ========================================
// CLOSE MODAL
// ========================================

function closeContactModal() {

    if (contactModal) {
        contactModal.classList.remove("show");
    }

    if (contactForm) {
        contactForm.reset();
    }
}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeContactModal
    );
}


if (cancelContact) {

    cancelContact.addEventListener(
        "click",
        closeContactModal
    );
}


if (contactModal) {

    contactModal.addEventListener(
        "click",
        function (event) {

            if (event.target === contactModal) {
                closeContactModal();
            }
        }
    );
}


// ========================================
// SAVE CONTACT
// ========================================

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const customerElement =
                document.getElementById("contactCustomer");

            const typeElement =
                document.getElementById("contactType");

            const dateElement =
                document.getElementById("contactDate");

            const subjectElement =
                document.getElementById("contactSubject");

            const notesElement =
                document.getElementById("contactNotes");

            if (
                !customerElement ||
                !typeElement ||
                !dateElement ||
                !subjectElement ||
                !notesElement
            ) {

                alert(
                    "Some contact form fields are missing."
                );

                return;
            }

            const customerId =
                customerElement.value;

            const type =
                typeElement.value;

            const date =
                dateElement.value;

            const subject =
                subjectElement.value.trim();

            const notes =
                notesElement.value.trim();

            if (
                !customerId ||
                !type ||
                !date ||
                !subject
            ) {

                alert(
                    "Please complete the required fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/contacts`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(true),

                            body: JSON.stringify({
                                customerId: customerId,
                                type: type,
                                date: date,
                                subject: subject,
                                notes: notes
                            })
                        }
                    );

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
                        "Unable to save contact."
                    );

                    return;
                }

                alert(
                    "Contact added successfully!"
                );

                closeContactModal();

                await loadContacts();

            } catch (error) {

                console.error(
                    "Error saving contact:",
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
// DELETE CONTACT
// ========================================

async function deleteContact(id) {

    if (!id) {
        return;
    }

    const confirmed =
        confirm(
            "Delete this contact record?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/contacts/${encodeURIComponent(id)}`,
                {
                    method: "DELETE",
                    headers: getAuthHeaders()
                }
            );

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
                "Could not delete contact."
            );

            return;
        }

        alert(
            "Contact deleted successfully."
        );

        await loadContacts();

    } catch (error) {

        console.error(
            "Error deleting contact:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );
    }
}


// ========================================
// TABLE DELETE BUTTON
// ========================================

if (contactTableBody) {

    contactTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".delete-button"
                );

            if (!button) {
                return;
            }

            const id =
                button.getAttribute("data-id");

            if (id) {
                deleteContact(id);
            }
        }
    );
}


// ========================================
// SEARCH CONTACTS
// ========================================

if (searchContact) {

    searchContact.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();

            if (!search) {

                displayContacts(contacts);

                return;
            }

            const filtered =
                contacts.filter(
                    function (contact) {

                        const customer =
                            customers.find(
                                function (item) {

                                    return String(item.id) ===
                                        String(contact.customerId);
                                }
                            );

                        const customerName =
                            customer
                                ? String(customer.name || "")
                                    .toLowerCase()
                                : "";

                        return (

                            customerName.includes(search)

                            ||

                            String(contact.type || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(contact.date || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(contact.subject || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(contact.notes || "")
                                .toLowerCase()
                                .includes(search)
                        );
                    }
                );

            displayContacts(filtered);
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
                            headers: getAuthHeaders()
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
// INITIALIZE
// ========================================

async function startContactsPage() {

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

    const customersLoaded =
        await loadCustomers();

    if (!customersLoaded) {
        return;
    }

    await loadContacts();
}


// ========================================
// START
// ========================================

startContactsPage();