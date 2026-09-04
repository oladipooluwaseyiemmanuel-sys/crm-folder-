// ========================================
// CUSTOMERS PAGE
// ========================================

// ========================================
// LOGIN CHECK
// ========================================

if (localStorage.getItem("crmLoggedIn") !== "true") {
    window.location.href = "login.html";
}


// ========================================
// API URL
// ========================================
//
// IMPORTANT:
// Do NOT use localhost here.
// The frontend and backend are running
// from the same Render service.
//

const API_URL = "/api/customers";


// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders(includeContentType = false) {

    const token = getToken();

    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ========================================
// ELEMENTS
// ========================================

const modal =
    document.getElementById("customerModal");

const addButton =
    document.getElementById("addCustomerButton");

const closeButton =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelCustomer");

const form =
    document.getElementById("customerForm");

const tableBody =
    document.getElementById("customerTableBody");

const searchInput =
    document.getElementById("searchCustomer");

const logoutButton =
    document.getElementById("logoutButton");

const userName =
    document.getElementById("userName");

const userAvatar =
    document.getElementById("userAvatar");


// ========================================
// CUSTOMER DATA
// ========================================

let allCustomers = [];


// ========================================
// LOAD USER
// ========================================

function loadUser() {

    try {

        const savedUser =
            localStorage.getItem("currentUser");

        if (!savedUser) {
            return;
        }

        const user =
            JSON.parse(savedUser);

        const name =
            user.fullName ||
            user.name ||
            user.username ||
            "User";

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
// HANDLE API RESPONSE
// ========================================

async function getResponseData(response) {

    const text =
        await response.text();

    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch (error) {
        return {
            message: text
        };
    }
}


// ========================================
// HANDLE UNAUTHORIZED
// ========================================

function handleUnauthorized(response) {

    if (response.status === 401) {

        alert(
            "Your login session has expired. Please login again."
        );

        logoutUser();

        return true;
    }

    return false;
}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5"
                style="text-align:center; padding:30px;">
                Loading customers...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders(),
                cache: "no-store"
            });

        if (handleUnauthorized(response)) {
            return;
        }

        const result =
            await getResponseData(response);

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load customers."
            );
        }

        const customers =
            Array.isArray(result)
                ? result
                : Array.isArray(result.customers)
                    ? result.customers
                    : [];

        allCustomers = customers;

        displayCustomers(customers);

    } catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center; padding:30px;">
                    Unable to load customers.
                    <br>
                    <small>
                        ${escapeHTML(error.message)}
                    </small>
                </td>
            </tr>
        `;
    }
}


// ========================================
// DISPLAY CUSTOMERS
// ========================================

function displayCustomers(customers) {

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (!Array.isArray(customers) || customers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center; padding:30px;">
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }

    customers.forEach(function (customer) {

        const row =
            document.createElement("tr");

        const id =
            customer.id || "";

        const name =
            customer.name || "";

        const email =
            customer.email || "";

        const phone =
            customer.phone || "";

        const status =
            customer.status || "Lead";

        row.innerHTML = `
            <td>
                <strong>
                    ${escapeHTML(name)}
                </strong>
            </td>

            <td>
                ${escapeHTML(email)}
            </td>

            <td>
                ${escapeHTML(phone)}
            </td>

            <td>
                <span class="status ${escapeHTML(
                    getStatusClass(status)
                )}">
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="table-action edit-btn"
                    data-id="${escapeHTML(id)}">
                    Edit
                </button>

                <button
                    type="button"
                    class="table-action delete-btn"
                    data-id="${escapeHTML(id)}">
                    Delete
                </button>

            </td>
        `;

        tableBody.appendChild(row);
    });
}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    return String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/g, "");
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

function openCustomerModal() {

    if (!modal) {
        return;
    }

    if (form) {
        form.reset();
    }

    modal.classList.add("show");
}


// ========================================
// CLOSE MODAL
// ========================================

function closeCustomerModal() {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    if (form) {
        form.reset();
    }
}


// ========================================
// ADD CUSTOMER BUTTON
// ========================================

if (addButton) {

    addButton.addEventListener(
        "click",
        openCustomerModal
    );
}


// ========================================
// CLOSE BUTTON
// ========================================

if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeCustomerModal
    );
}


// ========================================
// CANCEL BUTTON
// ========================================

if (cancelButton) {

    cancelButton.addEventListener(
        "click",
        closeCustomerModal
    );
}


// ========================================
// CLOSE MODAL OUTSIDE
// ========================================

if (modal) {

    modal.addEventListener(
        "click",
        function (event) {

            if (event.target === modal) {
                closeCustomerModal();
            }

        }
    );
}


// ========================================
// ADD CUSTOMER
// ========================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const nameElement =
                document.getElementById(
                    "customerName"
                );

            const emailElement =
                document.getElementById(
                    "customerEmail"
                );

            const phoneElement =
                document.getElementById(
                    "customerPhone"
                );

            const statusElement =
                document.getElementById(
                    "customerStatus"
                );

            if (
                !nameElement ||
                !emailElement ||
                !phoneElement ||
                !statusElement
            ) {

                alert(
                    "Customer form fields are missing."
                );

                return;
            }

            const name =
                nameElement.value.trim();

            const email =
                emailElement.value.trim();

            const phone =
                phoneElement.value.trim();

            const status =
                statusElement.value || "Lead";

            if (!name) {

                alert(
                    "Please enter the customer's name."
                );

                return;
            }

            if (!email) {

                alert(
                    "Please enter the customer's email."
                );

                return;
            }

            if (!phone) {

                alert(
                    "Please enter the customer's phone number."
                );

                return;
            }

            const token =
                getToken();

            if (!token) {

                alert(
                    "You are not logged in. Please login again."
                );

                logoutUser();

                return;
            }


            // ========================================
            // SEND CUSTOMER TO BACKEND
            // ========================================

            try {

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers:
                            getAuthHeaders(true),

                        body: JSON.stringify({
                            name: name,
                            email: email,
                            phone: phone,
                            status: status
                        })

                    });


                if (handleUnauthorized(response)) {
                    return;
                }


                const result =
                    await getResponseData(response);


                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to add customer."
                    );

                    return;
                }


                alert(
                    "Customer added successfully!"
                );


                closeCustomerModal();


                // Reload customer list
                await loadCustomers();

            } catch (error) {

                console.error(
                    "CUSTOMER POST ERROR:",
                    error
                );

                alert(
                    "Could not connect to the CRM backend.\n\n" +
                    "Please make sure the latest backend is deployed on Render."
                );
            }

        }
    );
}


// ========================================
// EDIT CUSTOMER
// ========================================

async function editCustomer(id) {

    if (!id) {
        return;
    }

    const customer =
        allCustomers.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!customer) {

        alert(
            "Customer not found."
        );

        return;
    }


    const name =
        prompt(
            "Customer Name:",
            customer.name || ""
        );

    if (name === null) {
        return;
    }


    const email =
        prompt(
            "Customer Email:",
            customer.email || ""
        );

    if (email === null) {
        return;
    }


    const phone =
        prompt(
            "Customer Phone:",
            customer.phone || ""
        );

    if (phone === null) {
        return;
    }


    const status =
        prompt(
            "Status (Lead, Active, Inactive):",
            customer.status || "Lead"
        );

    if (status === null) {
        return;
    }


    if (
        !name.trim() ||
        !email.trim() ||
        !phone.trim()
    ) {

        alert(
            "Please complete all customer fields."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {

                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body: JSON.stringify({

                        name:
                            name.trim(),

                        email:
                            email.trim(),

                        phone:
                            phone.trim(),

                        status:
                            status.trim() || "Lead"

                    })

                }
            );


        if (handleUnauthorized(response)) {
            return;
        }


        const result =
            await getResponseData(response);


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to update customer."
            );

            return;
        }


        alert(
            "Customer updated successfully!"
        );


        await loadCustomers();

    } catch (error) {

        console.error(
            "Error updating customer:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );
    }
}


// ========================================
// DELETE CUSTOMER
// ========================================

async function deleteCustomer(id) {

    if (!id) {
        return;
    }


    const confirmed =
        confirm(
            "Are you sure you want to delete this customer?"
        );

    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/${encodeURIComponent(id)}`,
                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }
            );


        if (handleUnauthorized(response)) {
            return;
        }


        const result =
            await getResponseData(response);


        if (!response.ok) {

            alert(
                result.message ||
                "Unable to delete customer."
            );

            return;
        }


        alert(
            "Customer deleted successfully."
        );


        await loadCustomers();

    } catch (error) {

        console.error(
            "Error deleting customer:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );
    }
}


// ========================================
// TABLE ACTIONS
// ========================================

if (tableBody) {

    tableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest("button");

            if (!button) {
                return;
            }

            const id =
                button.getAttribute("data-id");

            if (!id) {
                return;
            }

            if (
                button.classList.contains(
                    "edit-btn"
                )
            ) {

                editCustomer(id);

                return;
            }

            if (
                button.classList.contains(
                    "delete-btn"
                )
            ) {

                deleteCustomer(id);
            }

        }
    );
}


// ========================================
// SEARCH CUSTOMERS
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                this.value
                    .toLowerCase()
                    .trim();

            if (!search) {

                displayCustomers(
                    allCustomers
                );

                return;
            }


            const filtered =
                allCustomers.filter(
                    function (customer) {

                        return (

                            String(
                                customer.name || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.email || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.phone || ""
                            )
                                .toLowerCase()
                                .includes(search)

                            ||

                            String(
                                customer.status || ""
                            )
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            displayCustomers(filtered);

        }
    );
}


// ========================================
// LOGOUT
// ========================================

function logoutUser() {

    localStorage.removeItem(
        "crmLoggedIn"
    );

    localStorage.removeItem(
        "crmToken"
    );

    localStorage.removeItem(
        "currentUser"
    );

    sessionStorage.clear();

    window.location.href =
        "login.html";
}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutUser
    );
}


// ========================================
// INITIALIZE PAGE
// ========================================

async function initializeCustomersPage() {

    loadUser();

    await loadCustomers();
}


// ========================================
// START
// ========================================

initializeCustomersPage();