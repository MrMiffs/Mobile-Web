document.addEventListener("DOMContentLoaded", () => {
    // Add Item Form Submission
    document.getElementById("Add").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const userId = 1;  // Example user_id, replace with dynamic value if needed
        const item = document.getElementById("nameAdd").value;
        const price = document.getElementById("priceAdd").value;
        const purchaseDate = document.getElementById("dateAdd").value;
        
        const response = await fetch("/api/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate }),
        });

        const result = await response.json();
        alert(result.message || "Item added successfully!");
    });

    // Search Item Form Submission
    document.getElementById("Search").addEventListener("submit", async (event) => {
        event.preventDefault();
        
        const userId = 1;  // Example user_id, replace with dynamic value if needed
        const item = document.getElementById("nameSearch").value;
        const price = document.getElementById("priceSearch").value;
        const purchaseDate = document.getElementById("dateSearch").value;
        
        const response = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, item, price, purchase_date: purchaseDate }),
        });

        const results = await response.json();
        const itemList = document.getElementById("item-list");
        itemList.innerHTML = "";

        results.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = `${entry.item} - $${entry.price} on ${entry.purchase_date}`;
            itemList.appendChild(li);
        });
    });
});
