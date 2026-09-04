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
// Render serves the frontend and backend together.

const API_URL = "/api";


// ========================================
// AUTH
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
let tasks = [];


// ========================================
// ELEMENTS
// ========================================

const taskForm = document.getElementById("taskForm");
const taskModal = document.getElementById("taskModal");
const addTaskButton = document.getElementById("addTaskButton");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");

const taskTableBody = document.getElementById("taskTableBody");

const searchTask = document.getElementById("searchTask");
const filterStatus = document.getElementById("filterStatus");
const filterPriority = document.getElementById("filterPriority");

const taskCustomer = document.getElementById("taskCustomer");

const logoutButton = document.getElementById("logoutButton");


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
            "Unable to load user:",
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
                // Ignore JSON error
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

        populateCustomerSelect();

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
// POPULATE CUSTOMER SELECT
// ========================================

function populateCustomerSelect() {

    if (!taskCustomer) {
        return;
    }

    taskCustomer.innerHTML = `
        <option value="">
            Select customer
        </option>
    `;

    customers.forEach(function (customer) {

        const option =
            document.createElement("option");

        option.value =
            customer.id;

        option.textContent =
            customer.name ||
            "Unnamed Customer";

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

        if (!response.ok) {

            let result = {};

            try {
                result =
                    await response.json();
            } catch (error) {
                // Ignore JSON error
            }

            throw new Error(
                result.message ||
                "Could not load tasks."
            );
        }

        const result =
            await response.json();

        tasks =
            Array.isArray(result)
                ? result
                : result.tasks || [];

        displayTasks(tasks);

    } catch (error) {

        console.error(
            "Error loading tasks:",
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

                ${
                    task.status !== "Completed"
                    ?
                    `
                    <button
                        type="button"
                        class="edit-button complete-button"
                        data-id="${escapeHTML(task.id)}">
                        Complete
                    </button>
                    `
                    :
                    ""
                }

                <button
                    type="button"
                    class="delete-button"
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
// OPEN MODAL
// ========================================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        async function () {

            if (taskForm) {
                taskForm.reset();
            }

            const loaded =
                await loadCustomers();

            if (!loaded) {
                return;
            }

            const dateInput =
                document.getElementById(
                    "taskDueDate"
                );

            if (dateInput) {

                dateInput.value =
                    new Date()
                        .toISOString()
                        .split("T")[0];

            }

            if (taskModal) {
                taskModal.classList.add("show");
            }

        }
    );
}


// ========================================
// CLOSE MODAL
// ========================================

function closeTaskModal() {

    if (taskModal) {
        taskModal.classList.remove("show");
    }

    if (taskForm) {
        taskForm.reset();
    }
}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeTaskModal
    );
}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModal
    );
}


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
                document.getElementById(
                    "taskDescription"
                );

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
                                    title,
                                    customerId,
                                    dueDate,
                                    priority,
                                    status,
                                    description
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
                    // Ignore JSON error
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
            // Ignore JSON error
        }

        if (!response.ok) {

            alert(
                result.message ||
                "Could not complete task."
            );

            return;
        }

        alert(
            "Task completed successfully!"
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "Error completing task:",
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
            // Ignore JSON error
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
            "Error deleting task:",
            error
        );

        alert(
            "Could not connect to the CRM backend."
        );
    }
}


// ========================================
// TABLE BUTTONS
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

            if (!id) {
                return;
            }

            if (
                button.classList.contains(
                    "complete-button"
                )
            ) {

                completeTask(id);

                return;
            }

            if (
                button.classList.contains(
                    "delete-button"
                )
            ) {

                deleteTask(id);

            }

        }
    );
}


// ========================================
// SEARCH + FILTER
// ========================================

function filterTasks() {

    if (!searchTask ||
        !filterStatus ||
        !filterPriority) {

        return;
    }

    const search =
        searchTask.value
            .toLowerCase()
            .trim();

    const status =
        filterStatus.value;

    const priority =
        filterPriority.value;

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

            const matchesSearch =

                String(task.title || "")
                    .toLowerCase()
                    .includes(search)

                ||

                customerName.includes(search)

                ||

                String(task.description || "")
                    .toLowerCase()
                    .includes(search)

                ||

                String(task.dueDate || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                status === "All" ||
                status === "" ||
                task.status === status;

            const matchesPriority =
                priority === "All" ||
                priority === "" ||
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