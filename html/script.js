const userId = 1; //Example user id, replace with dynamic solution from user accounts

function formatDate(dateString) {
    return new Date(dateString).toISOString().split('T')[0]; //Extracts simple YYYY-MM-DD string
}

// Function to load items from database
async function loadItems() {
    const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
    });
    const results = await response.json();
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = "";
    results.forEach(entry => {
        const li = document.createElement("li");
        const formattedDate = formatDate(entry.purchase_date);
        li.textContent = `${entry.item} - $${entry.price} on ${formattedDate}`;

        // Edit Button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editItem(entry);

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteItem(entry);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        itemList.appendChild(li);
    });
}

// Function to handle adding an item
async function addItem(event) {
    event.preventDefault();

    const item = document.getElementById("nameAdd").value;
    const price = document.getElementById("priceAdd").value;
    const purchaseDate = document.getElementById("dateAdd").value;

    const response = await fetch("/api/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate })
    });

    const result = await response.json();
    // Reload items after adding
    loadItems();
}

// Function to handle deleting an item
async function deleteItem(entry) {
    const response = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    });
    const result = await response.json();
    loadItems();
}

// Function to handle editing an item
async function editItem(entry) {
    const newItem = prompt("Edit item name:", entry.item);
    const newPrice = prompt("Edit item price:", entry.price);
    const newDate = prompt("Edit purchase date:", formatDate(entry.purchase_date));

    if (newItem && newPrice && newDate) {
        const response = await fetch("/api/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: entry.user_id,
                item: entry.item, // Original item name
                price: entry.price, // Original price
                purchase_date: formatDate(entry.purchase_date), // Original date
                newItem, // New item name
                newPrice, // New price
                newDate, // New date
            }),
        });

        const result = await response.json();
        loadItems(); // Refresh the list after editing
    }
}

// Function to handle searching for items
async function searchItems(event) {
    event.preventDefault();

    const item = document.getElementById("nameSearch").value;
    const price = document.getElementById("priceSearch").value;
    const purchaseDate = document.getElementById("dateSearch").value;

    const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate })
    });

    const results = await response.json();
    const itemList = document.getElementById("item-list");
    itemList.innerHTML = "";

    results.forEach(entry => {
        const li = document.createElement("li");
        li.textContent = `${entry.item} - $${entry.price} on ${formatDate(entry.purchase_date)}`;

        // Edit Button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editItem(entry);

        // Delete Button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteItem(entry);

        li.appendChild(editButton);
        li.appendChild(deleteButton);
        itemList.appendChild(li);
    });
}

// Load items initially
loadItems();

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("Add").addEventListener("submit", addItem);
    document.getElementById("Search").addEventListener("submit", searchItems);
})