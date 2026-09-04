// ========================================
// CRM CUSTOMERS PAGE
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
// Uses the same Render website that is currently open.
// Never uses localhost in production.

const API_URL = `${window.location.origin}/api/customers`;


// ========================================
// GLOBAL DATA
// ========================================

let allCustomers = [];


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
// CHECK AUTHENTICATION
// ========================================

function checkAuthentication() {

    const token = getToken();

    if (!token) {

        localStorage.removeItem("crmLoggedIn");
        localStorage.removeItem("crmToken");
        localStorage.removeItem("currentUser");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// ========================================
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    if (!tableBody) {
        return;
    }

    if (!checkAuthentication()) {
        return;
    }

    tableBody.innerHTML = `
        <tr>
            <td
                colspan="5"
                style="text-align:center; padding:30px;"
            >
                Loading customers...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL, {
                method: "GET",
                headers: getAuthHeaders()
            });

        // --------------------------------
        // TOKEN EXPIRED / INVALID
        // --------------------------------

        if (response.status === 401) {

            logoutUser(false);

            return;
        }


        // --------------------------------
        // READ RESPONSE
        // --------------------------------

        const result =
            await response.json();


        // --------------------------------
        // SERVER ERROR
        // --------------------------------

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Failed to load customers."
            );
        }


        // --------------------------------
        // GET CUSTOMER ARRAY
        // --------------------------------

        if (Array.isArray(result)) {

            allCustomers = result;

        } else if (Array.isArray(result.customers)) {

            allCustomers = result.customers;

        } else {

            allCustomers = [];
        }


        // --------------------------------
        // DISPLAY
        // --------------------------------

        displayCustomers(allCustomers);

    } catch (error) {

        console.error(
            "Error loading customers:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="text-align:center; padding:30px;"
                >
                    Unable to connect to the CRM backend.
                    <br><br>
                    Please refresh the page and try again.
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


    // --------------------------------
    // NO CUSTOMERS
    // --------------------------------

    if (!Array.isArray(customers) || customers.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    style="text-align:center; padding:30px;"
                >
                    No customers found.
                </td>
            </tr>
        `;

        return;
    }


    // --------------------------------
    // CREATE ROWS
    // --------------------------------

    customers.forEach(function (customer) {

        const row =
            document.createElement("tr");

        const name =
            customer.name || "";

        const email =
            customer.email || "";

        const phone =
            customer.phone || "";

        const status =
            customer.status || "Lead";

        const id =
            customer.id || "";


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
                <span
                    class="status ${getStatusClass(status)}"
                >
                    ${escapeHTML(status)}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="table-action edit-btn"
                    data-id="${escapeHTML(id)}"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="table-action delete-btn"
                    data-id="${escapeHTML(id)}"
                >
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

    return String(status)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
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
// OPEN CUSTOMER MODAL
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
// CLOSE CUSTOMER MODAL
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
// CLOSE MODAL BUTTON
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
// CLOSE MODAL OUTSIDE CLICK
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


            if (!checkAuthentication()) {
                return;
            }


            // --------------------------------
            // FORM ELEMENTS
            // --------------------------------

            const nameElement =
                document.getElementById("customerName");

            const emailElement =
                document.getElementById("customerEmail");

            const phoneElement =
                document.getElementById("customerPhone");

            const statusElement =
                document.getElementById("customerStatus");


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


            // --------------------------------
            // FORM VALUES
            // --------------------------------

            const name =
                nameElement.value.trim();

            const email =
                emailElement.value.trim();

            const phone =
                phoneElement.value.trim();

            const status =
                statusElement.value || "Lead";


            // --------------------------------
            // VALIDATION
            // --------------------------------

            if (!name || !email || !phone) {

                alert(
                    "Please complete all customer fields."
                );

                return;
            }


            // --------------------------------
            // DISABLE BUTTON
            // --------------------------------

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            const originalText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled = true;
                submitButton.textContent =
                    "Saving...";
            }


            try {

                // --------------------------------
                // SEND CUSTOMER TO BACKEND
                // --------------------------------

                const response =
                    await fetch(API_URL, {

                        method: "POST",

                        headers:
                            getAuthHeaders(true),

                        body: JSON.stringify({
                            name,
                            email,
                            phone,
                            status
                        })

                    });


                // --------------------------------
                // AUTH ERROR
                // --------------------------------

                if (response.status === 401) {

                    logoutUser(false);

                    return;
                }


                // --------------------------------
                // RESPONSE
                // --------------------------------

                const result =
                    await response.json();


                // --------------------------------
                // SERVER ERROR
                // --------------------------------

                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to add customer."
                    );

                    return;
                }


                // --------------------------------
                // SUCCESS
                // --------------------------------

                alert(
                    "Customer added successfully!"
                );


                closeCustomerModal();

                await loadCustomers();

            } catch (error) {

                console.error(
                    "Error adding customer:",
                    error
                );

                alert(
                    "Could not connect to the CRM backend."
                );

            } finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalText ||
                        "Save Customer";
                }
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

    if (!checkAuthentication()) {
        return;
    }


    const customer =
        allCustomers.find(
            item =>
                String(item.id) === String(id)
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
                        name: name.trim(),
                        email: email.trim(),
                        phone: phone.trim(),
                        status: status.trim() || "Lead"
                    })

                }
            );


        if (response.status === 401) {

            logoutUser(false);

            return;
        }


        const result =
            await response.json();


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

    if (!checkAuthentication()) {
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


        if (response.status === 401) {

            logoutUser(false);

            return;
        }


        const result =
            await response.json();


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


            // --------------------------------
            // EDIT
            // --------------------------------

            if (
                button.classList.contains(
                    "edit-btn"
                )
            ) {

                editCustomer(id);

                return;
            }


            // --------------------------------
            // DELETE
            // --------------------------------

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


            // --------------------------------
            // SHOW EVERYTHING
            // --------------------------------

            if (!search) {

                displayCustomers(
                    allCustomers
                );

                return;
            }


            // --------------------------------
            // FILTER
            // --------------------------------

            const filtered =
                allCustomers.filter(
                    function (customer) {

                        const name =
                            String(
                                customer.name || ""
                            ).toLowerCase();

                        const email =
                            String(
                                customer.email || ""
                            ).toLowerCase();

                        const phone =
                            String(
                                customer.phone || ""
                            ).toLowerCase();

                        const status =
                            String(
                                customer.status || ""
                            ).toLowerCase();


                        return (
                            name.includes(search) ||
                            email.includes(search) ||
                            phone.includes(search) ||
                            status.includes(search)
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

function logoutUser(callBackend = true) {

    const token = getToken();


    // --------------------------------
    // TRY BACKEND LOGOUT
    // --------------------------------

    if (callBackend && token) {

        fetch(
            `${window.location.origin}/api/logout`,
            {
                method: "POST",
                headers: getAuthHeaders()
            }
        ).catch(function (error) {

            console.error(
                "Logout request failed:",
                error
            );

        });

    }


    // --------------------------------
    // CLEAR LOCAL LOGIN
    // --------------------------------

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


    // --------------------------------
    // GO TO LOGIN
    // --------------------------------

    window.location.href =
        "login.html";
}


// ========================================
// LOGOUT BUTTON
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {
            logoutUser(true);
        }
    );
}


// ========================================
// INITIALIZE PAGE
// ========================================

async function initializeCustomersPage() {

    if (!checkAuthentication()) {
        return;
    }

    loadUser();

    await loadCustomers();
}


// ========================================
// START
// ========================================

initializeCustomersPage();