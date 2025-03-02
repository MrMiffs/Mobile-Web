// Handle Add Item form submission
document.getElementById('Add').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const formData = new FormData(event.target);
  const data = {
    name: formData.get('name'),
    x: formData.get('x'),
    y: formData.get('y'),
  };

  try {
    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(data).toString(),
    });
    if (!response.ok) {
      throw new Error('Failed to add item');
    }
    fetchItems(); //Refresh the list after insertion
  } catch (error) {
    console.error('Error adding item:', error);
  }
});

// Handle Search Item form submission
document.getElementById('Search').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const formData = new FormData(event.target);
  const searchParams = new URLSearchParams(formData).toString();

  try {
    const response = await fetch(`/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: searchParams,
    });
    if (!response.ok) {
      throw new Error('Failed to search items');
    }
    const results = await response.json();
    displaySearchResults(results);
  } catch (error) {
    console.error('Error searching items:', error);
  }
});

// Display search results
function displaySearchResults(results) {
  const itemList = document.getElementById('item-list');
  itemList.innerHTML = results.map(item => `
    <li>
      ${item.name} (${item.x}, ${item.y})
      <button onclick="deleteItem('${item.id}')">Delete</button>
    </li>
  `).join('');
}

// Delete an item
async function deleteItem(id) {
  try {
    const response = await fetch(`/api?id=${id}`, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error('Failed to delete item');
    }
    fetchItems(); // Refresh the list after deletion
  } catch (error) {
    console.error('Error deleting item:', error);
  }
}

// Fetch and display all items
async function fetchItems() {
  try {
    const response = await fetch('/api');
    if (!response.ok) {
      throw new Error('Failed to fetch items');
    }
    const items = await response.json();
    displaySearchResults(items);
  } catch (error) {
    console.error('Error fetching items:', error);
  }
}

// Initial fetch of items
fetchItems();
