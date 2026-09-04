// ========================================
// TASKS PAGE
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
// Frontend and backend are served together.
const API_URL = "/api";


// ========================================
// AUTHENTICATION
// ========================================

function getToken() {
    return localStorage.getItem("crmToken");
}

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
// DATA
// ========================================

let customers = [];
let tasks = [];


// ========================================
// ELEMENTS
// ========================================

const taskForm =
    document.getElementById("taskForm");

const taskModal =
    document.getElementById("taskModal");

const addTaskButton =
    document.getElementById("addTaskButton");

const closeModal =
    document.getElementById("closeModal");

const cancelTask =
    document.getElementById("cancelTask");

const taskTableBody =
    document.getElementById("taskTableBody");

const searchTask =
    document.getElementById("searchTask");

const filterStatus =
    document.getElementById("filterStatus");

const filterPriority =
    document.getElementById("filterPriority");

const taskCustomer =
    document.getElementById("taskCustomer");

const logoutButton =
    document.getElementById("logoutButton");


// ========================================
// USER INFORMATION
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
            "Unable to load user information:",
            error
        );

    }
}


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

        if (response.status === 401) {

            alert(
                "Your login session has expired. Please login again."
            );

            logoutUser();
            return false;
        }

        let result = {};

        try {
            result = await response.json();
        } catch (error) {
            result = {};
        }

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not load customers."
            );

        }

        customers =
            Array.isArray(result)
                ? result
                : result.customers || [];

        populateCustomerDropdown();

        return true;

    } catch (error) {

        console.error(
            "LOAD CUSTOMERS ERROR:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );

        return false;
    }
}


// ========================================
// CUSTOMER DROPDOWN
// ========================================

function populateCustomerDropdown() {

    if (!taskCustomer) {
        return;
    }

    taskCustomer.innerHTML = `
        <option value="">
            Select customer
        </option>
    `;

    if (customers.length === 0) {

        const option =
            document.createElement("option");

        option.value = "";
        option.textContent =
            "No customers available";

        taskCustomer.appendChild(option);

        return;
    }

    customers.forEach(function (customer) {

        const option =
            document.createElement("option");

        option.value = customer.id;

        option.textContent =
            customer.name || "Unnamed Customer";

        taskCustomer.appendChild(option);

    });
}


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    if (!taskTableBody) {
        return;
    }

    taskTableBody.innerHTML = `
        <tr>
            <td colspan="6"
                style="text-align:center; padding:30px;">
                Loading tasks...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(
                `${API_URL}/tasks`,
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

        let result = {};

        try {
            result = await response.json();
        } catch (error) {
            result = {};
        }

        if (!response.ok) {

            throw new Error(
                result.message ||
                "Could not load tasks."
            );

        }

        tasks =
            Array.isArray(result)
                ? result
                : result.tasks || [];

        displayTasks();

    } catch (error) {

        console.error(
            "LOAD TASKS ERROR:",
            error
        );

        taskTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    Could not load tasks.
                </td>
            </tr>
        `;
    }
}


// ========================================
// DISPLAY TASKS
// ========================================

function displayTasks(list = tasks) {

    if (!taskTableBody) {
        return;
    }

    taskTableBody.innerHTML = "";

    if (!list || list.length === 0) {

        taskTableBody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center; padding:30px;">
                    No tasks found.
                </td>
            </tr>
        `;

        return;
    }

    list.forEach(function (task) {

        const customer =
            customers.find(function (item) {

                return String(item.id) ===
                    String(task.customerId);

            });

        const customerName =
            customer
                ? customer.name
                : "Unknown Customer";

        const row =
            document.createElement("tr");

        const completeButton =
            task.status !== "Completed"
                ? `
                    <button
                        type="button"
                        class="edit-button"
                        data-action="complete"
                        data-id="${escapeHTML(task.id)}">
                        Complete
                    </button>
                `
                : "";

        row.innerHTML = `
            <td>
                <strong>
                    ${escapeHTML(task.title)}
                </strong>
            </td>

            <td>
                ${escapeHTML(customerName)}
            </td>

            <td>
                ${escapeHTML(task.dueDate)}
            </td>

            <td>
                ${escapeHTML(task.priority)}
            </td>

            <td>
                ${escapeHTML(task.status)}
            </td>

            <td>

                ${completeButton}

                <button
                    type="button"
                    class="delete-button"
                    data-action="delete"
                    data-id="${escapeHTML(task.id)}">
                    Delete
                </button>

            </td>
        `;

        taskTableBody.appendChild(row);

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
// OPEN TASK MODAL
// ========================================

async function openTaskModal() {

    if (!taskModal) {
        return;
    }

    if (taskForm) {
        taskForm.reset();
    }

    const loaded =
        await loadCustomers();

    if (!loaded) {
        return;
    }

    const dateInput =
        document.getElementById("taskDueDate");

    if (dateInput) {

        dateInput.value =
            new Date()
                .toISOString()
                .split("T")[0];
    }

    taskModal.classList.add("show");
}


// ========================================
// CLOSE TASK MODAL
// ========================================

function closeTaskModal() {

    if (taskModal) {
        taskModal.classList.remove("show");
    }

    if (taskForm) {
        taskForm.reset();
    }
}


// ========================================
// ADD TASK BUTTON
// ========================================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        openTaskModal
    );
}


// ========================================
// CLOSE MODAL
// ========================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeTaskModal
    );
}


// ========================================
// CANCEL TASK
// ========================================

if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModal
    );
}


// ========================================
// CLOSE WHEN CLICKING OUTSIDE
// ========================================

if (taskModal) {

    taskModal.addEventListener(
        "click",
        function (event) {

            if (event.target === taskModal) {
                closeTaskModal();
            }

        }
    );
}


// ========================================
// SAVE TASK
// ========================================

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const titleElement =
                document.getElementById("taskTitle");

            const customerElement =
                document.getElementById("taskCustomer");

            const dueDateElement =
                document.getElementById("taskDueDate");

            const priorityElement =
                document.getElementById("taskPriority");

            const statusElement =
                document.getElementById("taskStatus");

            const descriptionElement =
                document.getElementById("taskDescription");

            if (
                !titleElement ||
                !customerElement ||
                !dueDateElement ||
                !priorityElement ||
                !statusElement ||
                !descriptionElement
            ) {

                alert(
                    "Some task form fields are missing."
                );

                return;
            }

            const title =
                titleElement.value.trim();

            const customerId =
                customerElement.value;

            const dueDate =
                dueDateElement.value;

            const priority =
                priorityElement.value;

            const status =
                statusElement.value;

            const description =
                descriptionElement.value.trim();

            if (
                !title ||
                !customerId ||
                !dueDate
            ) {

                alert(
                    "Please complete the required fields."
                );

                return;
            }

            try {

                const response =
                    await fetch(
                        `${API_URL}/tasks`,
                        {
                            method: "POST",

                            headers:
                                getAuthHeaders(true),

                            body:
                                JSON.stringify({
                                    title: title,
                                    customerId: customerId,
                                    dueDate: dueDate,
                                    priority: priority,
                                    status: status,
                                    description: description
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
                    result = {};
                }

                if (!response.ok) {

                    alert(
                        result.message ||
                        "Unable to save task."
                    );

                    return;
                }

                alert(
                    "Task added successfully!"
                );

                closeTaskModal();

                await loadTasks();

            } catch (error) {

                console.error(
                    "SAVE TASK ERROR:",
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
// COMPLETE TASK
// ========================================

async function completeTask(id) {

    if (!id) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${encodeURIComponent(id)}`,
                {
                    method: "PUT",

                    headers:
                        getAuthHeaders(true),

                    body:
                        JSON.stringify({
                            status: "Completed"
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
            result = {};
        }

        if (!response.ok) {

            alert(
                result.message ||
                "Could not complete task."
            );

            return;
        }

        await loadTasks();

    } catch (error) {

        console.error(
            "COMPLETE TASK ERROR:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );
    }
}


// ========================================
// DELETE TASK
// ========================================

async function deleteTask(id) {

    if (!id) {
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );

    if (!confirmed) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/tasks/${encodeURIComponent(id)}`,
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
            result = {};
        }

        if (!response.ok) {

            alert(
                result.message ||
                "Could not delete task."
            );

            return;
        }

        alert(
            "Task deleted successfully."
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "DELETE TASK ERROR:",
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

if (taskTableBody) {

    taskTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest("button");

            if (!button) {
                return;
            }

            const id =
                button.getAttribute("data-id");

            const action =
                button.getAttribute("data-action");

            if (!id) {
                return;
            }

            if (action === "complete") {

                completeTask(id);
                return;
            }

            if (action === "delete") {

                deleteTask(id);
            }
        }
    );
}


// ========================================
// SEARCH AND FILTER
// ========================================

function filterTasks() {

    const search =
        searchTask
            ? searchTask.value
                .toLowerCase()
                .trim()
            : "";

    const status =
        filterStatus
            ? filterStatus.value
            : "All";

    const priority =
        filterPriority
            ? filterPriority.value
            : "All";

    const filtered =
        tasks.filter(function (task) {

            const customer =
                customers.find(function (item) {

                    return String(item.id) ===
                        String(task.customerId);

                });

            const customerName =
                customer
                    ? String(customer.name || "")
                        .toLowerCase()
                    : "";

            const taskTitle =
                String(task.title || "")
                    .toLowerCase();

            const description =
                String(task.description || "")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                taskTitle.includes(search) ||
                customerName.includes(search) ||
                description.includes(search);

            const matchesStatus =
                status === "All" ||
                !status ||
                task.status === status;

            const matchesPriority =
                priority === "All" ||
                !priority ||
                task.priority === priority;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });

    displayTasks(filtered);
}


if (searchTask) {

    searchTask.addEventListener(
        "input",
        filterTasks
    );
}


if (filterStatus) {

    filterStatus.addEventListener(
        "change",
        filterTasks
    );
}


if (filterPriority) {

    filterPriority.addEventListener(
        "change",
        filterTasks
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

                            headers:
                                getAuthHeaders()
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

async function startTasksPage() {

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

    await loadTasks();
}


// ========================================
// START
// ========================================

startTasksPage();