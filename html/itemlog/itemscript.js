const itemList = document.getElementById('item-list');
const totalSpend = document.getElementById('total-spend');
const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});
const dateDropdownBtn = document.getElementById("dateDropdownBtn");
const dateDropdown = document.getElementById("dateDropdown");
const atDateCheckbox = document.getElementById("atDateCheckbox");
const rangeDateCheckbox = document.getElementById("rangeDateCheckbox");
const dateSearch = document.getElementById("dateSearch");
const dateRange = document.getElementById("dateRange");


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
        //console.log("return data: ",data)
        return data.id;
    })
    .catch(error => {
        console.error("Error:", error);
        return -1;
    });
}

// Function to load items from database
async function loadItems() {
    const response = await fetch("/api/searchitem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate })
    });

    // Reload items after adding
    loadItems();
}

// Function to handle deleting an item
async function deleteItem(entry) {
    await fetch("/api/deleteitem", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: userId,
            item: entry.item,
            price: entry.price,
            purchase_date: formatDate(entry.purchase_date), // Original date format
        })
    });
    loadItems();
}

// Function to handle editing an item
async function editItem(entry) {
    const newItem = prompt("Edit item name:", entry.item);
    const newPrice = prompt("Edit item price:", entry.price);
    const newDate = Date.parse(prompt("Edit purchase date:", formatDate(entry.purchase_date, true)));

    if (newItem && newPrice && newDate) {
        await fetch("/api/edititem", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: userId,
                item: entry.item, // Original item name
                price: entry.price, // Original price
                purchase_date: formatDate(entry.purchase_date), // Original date
                newItem, // New item name
                newPrice, // New price
                newDate: formatDate(newDate), // New date
            }),
        });

        loadItems(); // Refresh the list after editing
    }
}

// Function to handle searching for items
async function searchItems(event) {
    event.preventDefault();

    const item = document.getElementById("nameSearch").value;
    const price = document.getElementById("priceSearch").value;
    const dateSearchValue = document.getElementById("dateSearch").value;
    const dateRangeValue = document.getElementById("dateRange").value;

    // Prepare search parameters
    const searchParams = {
        user_id: userId,
        item,
        price
    };

    // Add date filter based on which checkbox is checked
    if (atDateCheckbox.checked) {
        if(!dateSearchValue) {
            alert("Please select a date for 'At Date' filter");
            return;
        }
        else {
            searchParams.purchase_date = dateSearchValue;
        }
    }
    else if (rangeDateCheckbox.checked) {
        if (!dateRangeValue) {
            alert("Please select a date range for 'Between Dates' filter");
            return;
        }
        else {
            const dates = dateRangeValue.split(" to ");
            if (dates.length === 2) {
                searchParams.start_date = dates[0];
                searchParams.end_date = dates[1];
            }
        }
    }

    const response = await fetch("/api/searchitem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchParams)
    });

    const results = await response.json();
    itemList.innerHTML = "";
    let totalSpendValue = 0;

    results.forEach(entry => {
        totalSpendValue += parseFloat(entry.price);
        const li = document.createElement("li");
        li.textContent = `${entry.item} - ${USDollar.format(entry.price)} on ${formatDate(entry.purchase_date, true)}`;
        addButtons(li, entry);
        itemList.appendChild(li);
    });

    totalSpend.textContent = `${USDollar.format(totalSpendValue)}`;
}

function activateAtDate() {
    atDateCheckbox.checked = true;
    rangeDateCheckbox.checked = false;
}

function activateRangeDate() {
    rangeDateCheckbox.checked = true;
    atDateCheckbox.checked = false;
}

document.addEventListener("DOMContentLoaded", async function () {
    userId = await getUserId();
    console.log("id returned:", userId);

    if (userId === undefined || userId === -1 || userId === 0) {
        console.error("Invalid user ID, skipping item loading.");
        window.location.href = '/';
    }
    else {
        loadItems(userId);
    }
});

// Connect form buttons
document.getElementById("Add").addEventListener("submit", addItem);
document.getElementById("Search").addEventListener("submit", searchItems);
document.getElementById("Search").addEventListener("reset", loadItems);

//Formatting for Search Form's Date Button
// Toggle dropdown on button click
dateDropdownBtn.addEventListener("click", function(e) {
    e.stopPropagation(); // Prevent event from bubbling up
    dateDropdown.classList.toggle("show");
});
// Close dropdown when clicking outside
document.addEventListener("click", function(e) {
    if (!e.target.closest('.dropdown')) {
        dateDropdown.classList.remove("show");
    }
});
// Prevent dropdown from closing when interacting with its contents
dateDropdown.addEventListener("click", function(e) {
    e.stopPropagation();
});
// Checkbox click behavior
atDateCheckbox.addEventListener("change", () => {
    if (atDateCheckbox.checked) {
        rangeDateCheckbox.checked = false;
    }
});
rangeDateCheckbox.addEventListener("change", () => {
    if (rangeDateCheckbox.checked) {
        atDateCheckbox.checked = false;
    }
});
// Input focus triggers checkbox
dateSearch.addEventListener("focus", activateAtDate);
dateRange.addEventListener("focus", activateRangeDate);
// Value change also toggles checkbox
dateSearch.addEventListener("input", activateAtDate);
dateRange.addEventListener("input", activateRangeDate);