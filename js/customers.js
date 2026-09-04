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
// API
// ========================================
// IMPORTANT:
// Do NOT use localhost here.
// This automatically uses Render in production
// and localhost when running the frontend locally.

const API_URL = `${window.location.origin}/api/customers`;


// ========================================
// GLOBAL DATA
// ========================================

let allCustomers = [];


// ========================================
// GET TOKEN
// ========================================

function getToken() {
    return localStorage.getItem("crmToken") || "";
}


// ========================================
// AUTH HEADERS
// ========================================

function getAuthHeaders(includeContentType = false) {

    const headers = {};

    const token = getToken();

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (includeContentType) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}


// ========================================
// LOGOUT
// ========================================

function logoutUser(redirect = true) {

    localStorage.removeItem("crmLoggedIn");
    localStorage.removeItem("crmToken");
    localStorage.removeItem("currentUser");

    sessionStorage.clear();

    if (redirect) {
        window.location.href = "login.html";
    }
}


// ========================================
// READ RESPONSE SAFELY
// ========================================

async function readResponse(response) {

    const contentType =
        response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
        return await response.json();
    }

    const text = await response.text();

    return {
        message:
            text ||
            `Request failed with status ${response.status}`
    };
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
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    return String(status || "Lead")
        .toLowerCase()
        .replace(/\s+/g, "-");
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
// DISPLAY CUSTOMERS
// ========================================

function displayCustomers(customers) {

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    if (
        !Array.isArray(customers) ||
        customers.length === 0
    ) {

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


    customers.forEach(function (customer) {

        const row =
            document.createElement("tr");

        const id =
            customer.id ??
            customer._id ??
            "";

        const name =
            customer.name ??
            customer.fullName ??
            "";

        const email =
            customer.email ??
            "";

        const phone =
            customer.phone ??
            "";

        const status =
            customer.status ??
            "Lead";


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
                    class="status ${escapeHTML(
                        getStatusClass(status)
                    )}"
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
// LOAD CUSTOMERS
// ========================================

async function loadCustomers() {

    if (!tableBody) {
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

        const token =
            getToken();

        if (!token) {

            logoutUser();

            return;
        }


        console.log(
            "Loading customers from:",
            API_URL
        );


        const response =
            await fetch(API_URL, {

                method: "GET",

                headers:
                    getAuthHeaders()

            });


        if (response.status === 401) {

            logoutUser();

            return;
        }


        const result =
            await readResponse(response);


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
                    : Array.isArray(result.data)
                        ? result.data
                        : [];


        allCustomers =
            customers;


        displayCustomers(
            allCustomers
        );


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
                statusElement.value ||
                "Lead";


            if (
                !name ||
                !email ||
                !phone
            ) {

                alert(
                    "Please complete all customer fields."
                );

                return;
            }


            const token =
                getToken();


            if (!token) {

                alert(
                    "Your login session has expired. Please log in again."
                );

                logoutUser();

                return;
            }


            try {

                console.log(
                    "Adding customer to:",
                    API_URL
                );


                const response =
                    await fetch(
                        API_URL,
                        {

                            method: "POST",

                            headers:
                                getAuthHeaders(true),

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    phone:
                                        phone,

                                    status:
                                        status

                                })

                        }
                    );


                if (
                    response.status === 401
                ) {

                    logoutUser();

                    return;
                }


                const result =
                    await readResponse(
                        response
                    );


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


                await loadCustomers();


            } catch (error) {

                console.error(
                    "Error adding customer:",
                    error
                );


                alert(
                    "Could not connect to the CRM backend.\n\n" +
                    "API: " +
                    API_URL
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
            function (item) {

                return String(
                    item.id ??
                    item._id
                ) === String(id);

            }
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
            customer.name ||
            customer.fullName ||
            ""
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
            customer.status ||
            "Lead"
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

                    body:
                        JSON.stringify({

                            name:
                                name.trim(),

                            email:
                                email.trim(),

                            phone:
                                phone.trim(),

                            status:
                                status.trim()

                        })

                }
            );


        if (
            response.status === 401
        ) {

            logoutUser();

            return;
        }


        const result =
            await readResponse(
                response
            );


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
            "Could not connect to the CRM backend.\n\n" +
            "API: " +
            API_URL
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


        if (
            response.status === 401
        ) {

            logoutUser();

            return;
        }


        const result =
            await readResponse(
                response
            );


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
            "Could not connect to the CRM backend.\n\n" +
            "API: " +
            API_URL
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
                event.target.closest(
                    "button"
                );


            if (!button) {
                return;
            }


            const id =
                button.getAttribute(
                    "data-id"
                );


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

                        return [

                            customer.name,

                            customer.fullName,

                            customer.email,

                            customer.phone,

                            customer.status

                        ]
                            .filter(Boolean)
                            .some(
                                function (value) {

                                    return String(
                                        value
                                    )
                                        .toLowerCase()
                                        .includes(
                                            search
                                        );

                                }
                            );

                    }
                );


            displayCustomers(
                filtered
            );

        }
    );

}


// ========================================
// LOGOUT BUTTON
// ========================================

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            logoutUser();

        }
    );

}


// ========================================
// INITIALIZE
// ========================================

async function initializeCustomersPage() {

    loadUser();


    if (!getToken()) {

        logoutUser();

        return;
    }


    await loadCustomers();

}


// ========================================
// START
// ========================================

initializeCustomersPage();