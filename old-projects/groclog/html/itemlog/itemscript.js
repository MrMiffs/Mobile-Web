const itemList = document.getElementById('item-list');
const totalSpend = document.getElementById('total-spend');
const filteredSpend = document.getElementById('filtered-spend');
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

function addListItem(list, entry) {
    const li = document.createElement("li");
    const formattedDate = formatDate(entry.purchase_date, true);

    // Create item display text
    const itemText = document.createElement("div");
    itemText.classList.add("item-display");

    // Bold the item name
    const itemName = document.createElement("strong");
    itemName.textContent = entry.item;
    itemText.appendChild(itemName);

    // Add price and date (not bold)
    itemText.append(` - ${USDollar.format(entry.price)} on ${formattedDate} `);

    // Add Location if available
    if (entry.location) {
        const locationSpan = document.createElement("span");
        locationSpan.innerHTML = `<strong>Location:</strong> ${entry.location} `;
        itemText.appendChild(locationSpan);
    }

    // Add Brand if available
    if (entry.brand) {
        const brandSpan = document.createElement("span");
        brandSpan.innerHTML = `<strong>Brand:</strong> ${entry.brand} `;
        itemText.appendChild(brandSpan);
    }

    // Add Type if available
    if (entry.type) {
        const typeSpan = document.createElement("span");
        typeSpan.innerHTML = `<strong>Type:</strong> ${entry.type} `;
        itemText.appendChild(typeSpan);
    }

    li.appendChild(itemText);
    addButtons(li, entry);
    list.appendChild(li);
}

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
        addListItem(itemList, entry);
    });

    totalSpend.textContent = `${USDollar.format(totalSpendValue)}`;
}

// Function to handle adding an item
async function addItem(event) {
    event.preventDefault();

    const item = document.getElementById("nameAdd").value;
    const price = document.getElementById("priceAdd").value;
    const purchaseDate = document.getElementById("dateAdd").value;
    const location = document.getElementById("locationAdd").value.trim();
    const brand = document.getElementById("brandAdd").value.trim();
    const type = document.getElementById("typeAdd").value.trim();

    await fetch("/api/additem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: userId,
            item,
            price,
            purchase_date: purchaseDate,
            location,
            brand,
            type
        })
    });

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
    // Create edit form HTML
    const editForm = `
        <div class="edit-form">
            <label>Item Name: <input type="text" id="editItemName" value="${entry.item}"></label>
            <label>Price: <input type="number" step="0.01" id="editItemPrice" value="${entry.price}"></label>
            <label>Date: <input type="date" id="editItemDate" value="${formatDate(entry.purchase_date)}"></label>
            <label>Location: <input type="text" id="editItemLocation" list="locationOptions" value="${entry.location || ''}"></label>
            <label>Brand: <input type="text" id="editItemBrand" list="brandOptions" value="${entry.brand || ''}"></label>
            <label>Type: <input type="text" id="editItemType" list="typeOptions" value="${entry.type || ''}"></label>
        </div>
    `;

    // Show edit dialog
    const confirmed = await Swal.fire({
        title: 'Edit Item',
        html: editForm,
        showCancelButton: true,
        confirmButtonText: 'Save',
        cancelButtonText: 'Cancel',
        focusConfirm: false,
        preConfirm: () => {
            return {
                item: document.getElementById('editItemName').value,
                price: document.getElementById('editItemPrice').value,
                date: document.getElementById('editItemDate').value,
                location: document.getElementById('editItemLocation').value,
                brand: document.getElementById('editItemBrand').value,
                type: document.getElementById('editItemType').value
            };
        }
    });

    if (confirmed.isConfirmed) {
        const { item, price, date, location, brand, type } = confirmed.value;

        if (item && price && date) {
            await fetch("/api/edititem", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: entry.user_id,
                    item: entry.item,
                    price: entry.price,
                    purchase_date: formatDate(entry.purchase_date),
                    newItem: item,
                    newPrice: price,
                    newDate: date,
                    newLocation: location || null,
                    newBrand: brand || null,
                    newType: type || null
                }),
            });

            loadItems(); // Refresh the list after editing
        }
    }
}

// Function to handle searching for items
async function searchItems(event) {
    event.preventDefault();

    const item = document.getElementById("nameSearch").value;
    const price = document.getElementById("priceSearch").value;
    const dateSearchValue = document.getElementById("dateSearch").value;
    const dateRangeValue = document.getElementById("dateRange").value;
    const location = document.getElementById("locationSearch").value.trim();
    const brand = document.getElementById("brandSearch").value.trim();
    const type = document.getElementById("typeSearch").value.trim();

    const searchParams = {
        user_id: userId,
        item,
        price,
        location,
        brand,
        type
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
    let filteredSpendValue = 0;

    results.forEach(entry => {
        filteredSpendValue += parseFloat(entry.price);
        addListItem(itemList, entry);
    });

    filteredSpend.textContent = `${USDollar.format(filteredSpendValue)}`;
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
document.getElementById("Search").addEventListener("reset", function() {
    loadItems();
    filteredSpend.textContent = "$0";
});

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