const itemList = document.getElementById('item-list');

async function getUserId(){
    let data = JSON.stringify({user: sessionStorage.getItem('user'), pw: sessionStorage.getItem('pw')})
    //console.log("data to fetch: ",data)
    return fetch("/api/getID", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    })
        .then(response => response.json())
        .then(data => {
            console.log("return data: ",data)
            return id = data.id;
        })
        .catch(error => {
            console.error("Error:", error);
            return -1;
        });
}

function addButtons(li, entry) {
    //Create Buttons
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-container");
    // Edit Button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => editUser(entry);

    // Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteUser(entry);

    //Add Buttons to list item
    buttonDiv.appendChild(editButton);
    buttonDiv.appendChild(deleteButton);
    li.appendChild(buttonDiv);
}

// Function to load users from database
async function loadUsers() {
    const response = await fetch("/api/getusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    const results = await response.json();
    itemList.innerHTML = "";
    results.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.user_id}: Username: ${entry.username} Password: ${entry.password} Perm: ${entry.perm}`;

        addButtons(li, entry);
        itemList.appendChild(li);
    });
}

// Function to handle adding a user
async function addUser(event) {
    event.preventDefault();

    const username = document.getElementById("usernameAdd").value;
    const password = document.getElementById("passwordAdd").value;
    const perm = document.getElementById("permAdd").value;

    await fetch("/api/adduser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, perm })
    });

    // Reload users after adding
    loadUsers();
}

// Function to handle deleting a user
async function deleteUser(entry) {
    await fetch('/api/deleteuser', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({user_id : entry.user_id}),
    });
    loadUsers();
}

// Function to handle editing a user
async function editUser(entry) {
    const newUsername = prompt("Edit usernamename:", entry.username);
    const newPassword = prompt("Edit password:", entry.password);
    const newPerm = prompt("Edit perm:", entry.perm);

    if (newUsername && newPassword && newPerm) {
        await fetch("/api/edituser", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: entry.user_id,
                username: newUsername,
                password: newPassword,
                perm: newPerm,
            }),
        });

        loadUsers(); // Refresh the list after editing
    }
}

// Function to handle searching for users
async function searchUsers(event) {
    event.preventDefault();

    const username = document.getElementById("usernameSearch").value;
    const password = document.getElementById("passwordSearch").value;
    const perm = document.getElementById("permSearch").value;

    const response = await fetch("/api/searchusers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, password: password, perm: perm })
    });

    const results = await response.json();
    itemList.innerHTML = "";

    results.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.user_id}: Username: ${entry.username} Password: ${entry.password} Perm: ${entry.perm}`;

        addButtons(li, entry);
        itemList.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    userId = await getUserId();
    console.log("id returned:", userId);

    if (userId === 0) {
        loadUsers();
    }
    else {
        console.error("Invalid user ID, skipping item loading.");
        window.location.href = '/';
    }
});


document.getElementById("Add").addEventListener("submit", addUser);
document.getElementById("Search").addEventListener("submit", searchUsers);
document.getElementById("Search").addEventListener("reset", loadUsers);