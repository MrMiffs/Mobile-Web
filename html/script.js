const userId = 1; // Example user id, replace with dynamic solution from user accounts
const itemList = document.getElementById('item-list');
const totalSpend = document.getElementById('total-spend');
const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// Defines the required login for author access
const auth = {
    username: 'author',
    password: 'authorpass'
};

// Returns formatted date string:
// Default (forHuman == false): YYYY-MM-DD
// forHuman == true: (Short Month), dd, yyyy
function formatDate(dateString, forHuman = false) {
    const date = new Date(dateString);
    let dateStr = date.toISOString().split('T')[0]; //Extracts simple YYYY-MM-DD string
    if (forHuman) {
        dateStr = date.toLocaleDateString('en-US', {
            timeZone: 'UTC',
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    }

    return dateStr;
}

function addButtons(li, entry) {
    //Create Buttons
    const buttonDiv = document.createElement("div");
    buttonDiv.classList.add("button-container");
    // Edit Button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.onclick = () => editItem(entry);

    // Delete Button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = () => deleteItem(entry);

    //Add Buttons to list item
    buttonDiv.appendChild(editButton);
    buttonDiv.appendChild(deleteButton);
    li.appendChild(buttonDiv);
}

// Function to load items from database
async function loadItems() {
    const response = await fetch("/api/searchitem?user_id=" + userId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(auth.username + ":" + auth.password)
        }
    });
    const results = await response.json();
    itemList.innerHTML = "";
    let totalSpendValue = 0;
    results.forEach(entry => {
        totalSpendValue += parseFloat(entry.price);
        const li = document.createElement("li");
        const formattedDate = formatDate(entry.purchase_date, true);
        li.textContent = `${entry.item} - ${USDollar.format(entry.price)} on ${formattedDate}`;

        addButtons(li, entry);
        itemList.appendChild(li);
    });

    totalSpend.textContent = `${USDollar.format(totalSpendValue)}`;
}

// Function to handle adding an item
async function addItem(event) {
    event.preventDefault();

    const item = document.getElementById("nameAdd").value;
    const price = document.getElementById("priceAdd").value;
    const purchaseDate = document.getElementById("dateAdd").value;

    await fetch("/api/additem", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(auth.username + ":" + auth.password)
        },
        body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate })
    });

    // Reload items after adding
    await loadItems();
}

// Function to handle deleting an item
async function deleteItem(entry) {
    await fetch("/api/deleteitem", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa(auth.username + ":" + auth.password)
        },
        body: JSON.stringify({
            user_id: entry.user_id,
            item: entry.item, // Original item name
            price: entry.price, // Original price
            purchase_date: formatDate(entry.purchase_date),
        }),
    });
    await loadItems();
}

// Function to handle editing an item
async function editItem(entry) {
    const newItem = prompt("Edit item name:", entry.item);
    const newPrice = prompt("Edit item price:", entry.price);
    const newDate = Date.parse(prompt("Edit purchase date:", formatDate(entry.purchase_date, true)));

    if (newItem && newPrice && newDate) {
        await fetch("/api/edititem", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Basic " + btoa(auth.username + ":" + auth.password)
            },
            body: JSON.stringify({
                user_id: entry.user_id,
                item: entry.item, // Original item name
                price: entry.price, // Original price
                purchase_date: formatDate(entry.purchase_date), // Original date
                newItem, // New item name
                newPrice, // New price
                newDate: formatDate(newDate), // New date
            }),
        });

        await loadItems(); // Refresh the list after editing
    }
}

// Function to handle searching for items
async function searchItems(event) {
    event.preventDefault();

    const item = document.getElementById("nameSearch").value;
    const price = document.getElementById("priceSearch").value;
    const purchaseDate = document.getElementById("dateSearch").value;

    const response = await fetch(`/api/searchitem?user_id=${userId}&item=${item}&price=${price}&purchase_date=${purchaseDate}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        console.error("Failed to fetch items:", response.statusText);
        return;
    }

    const results = await response.json();
    itemList.innerHTML = "";
    let totalSpendValue = 0;

    results.forEach(entry => {
        totalSpendValue += parseFloat(entry.price);
        const li = document.createElement("li");
        const formattedDate = formatDate(entry.purchase_date, true);
        li.textContent = `${entry.item} - ${USDollar.format(entry.price)} on ${formattedDate}`;
        addButtons(li, entry);
        itemList.appendChild(li);
    });

    totalSpend.textContent = `${USDollar.format(totalSpendValue)}`;
}

// Load items initially
loadItems();

document.getElementById("Add").addEventListener("submit", addItem);
document.getElementById("Search").addEventListener("submit", searchItems);
document.getElementById("Search").addEventListener("reset", loadItems);