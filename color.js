const redSlider = document.getElementById('red');
const greenSlider = document.getElementById('green');
const blueSlider = document.getElementById('blue');
const colorPreview = document.getElementById('color-preview');
const colorValue = document.getElementById('color-value');
const addButton = document.querySelector('button[name="add-button"]');
const removeButton = document.querySelector('button[name="remove-button"]');
const colorHolder = document.getElementById('color-holder');
const customContextMenu = document.getElementById('custom-context-menu');
let selectedPreview = null;

// Changes color to match slider values and updates colorValue text
function updateColor() {
  const red = redSlider.value;
  const green = greenSlider.value;
  const blue = blueSlider.value;
  const color = `rgb(${red}, ${green}, ${blue})`;
  colorPreview.style.backgroundColor = color;
  colorValue.textContent = color;
}

// Add color preview
function addColorPreview() {
  const colorPreviews = colorHolder.querySelectorAll('#color-preview');
  if (colorPreviews.length >= 5) {
    alert('Maximum of 5 color previews reached!');
    return;
  }
  const newColorPreview = colorPreview.cloneNode(true);
  colorHolder.appendChild(newColorPreview);
}

// Removes the most recent color preview
// Will prevent the removal of first color preview
function removeColorPreview() {
  const colorPreviews = colorHolder.querySelectorAll('#color-preview');
  if (colorPreviews.length > 1) {
    colorHolder.removeChild(colorPreviews[colorPreviews.length - 1]);
  } else {
    alert("Can't delete the last color!");
  }
}

// Context menu functionality
colorHolder.addEventListener('contextmenu', (event) => {
  if (event.target.closest('#color-preview')) {
    // preventDefault used to stop browser's default context menu
    event.preventDefault();
    
    selectedPreview = event.target;
    customContextMenu.classList.add('visible');
    customContextMenu.style.left = `${event.clientX}px`;
    customContextMenu.style.top = `${event.clientY}px`;
  }
});

// Hide context menu when clicking outside a color preview
document.addEventListener('click', () => {
  customContextMenu.classList.remove('visible');
});

// Delete selected color preview
document.getElementById('delete-preview').addEventListener('click', (event) => {
  if (selectedPreview) {
    selectedPreview.remove();
    selectedPreview = null;
    customContextMenu.classList.remove('visible');
    event.stopPropagation();
  }
});

// Copies selected color's rgb value to clipboard
document.getElementById('copy-color').addEventListener('click', (event) => {
  if (selectedPreview) {
    const color = selectedPreview.style.backgroundColor;
    navigator.clipboard.writeText(color);
    event.stopPropagation();
  }
});

// Event listeners
redSlider.addEventListener('input', updateColor);
greenSlider.addEventListener('input', updateColor);
blueSlider.addEventListener('input', updateColor);
addButton.addEventListener('click', addColorPreview);
removeButton.addEventListener('click', removeColorPreview);

// Initialize color
updateColor();
