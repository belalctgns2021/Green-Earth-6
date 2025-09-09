let allPlants = [];
let cart = [];

// DOM elements
const categoryList = document.getElementById("category-list");
const treeCardsContainer = document.getElementById("tree-cards-container");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const plantModal = document.getElementById("plant-modal");
const closeModalButton = document.querySelector(".close-button");
const modalDetails = document.getElementById("modal-details");
const loadingSpinner = document.getElementById("loading-spinner");

// Truncate long description
function truncateDescription(text, wordLimit) {
  if (!text) return "No description available.";
  const words = text.split(" ");
  return words.length <= wordLimit ? text : words.slice(0, wordLimit).join(" ") + "...";
}

// Load categories
function loadCategories(categories) {
  categoryList.innerHTML = "";

  const allLi = document.createElement("li");
  allLi.textContent = "All Trees";
  allLi.classList.add("category-item", "active");
  allLi.addEventListener("click", () => {
    setActiveCategory(allLi);
    loadPlants(allPlants);
  });
  categoryList.appendChild(allLi);

  categories.forEach(cat => {
    const li = document.createElement("li");
    li.textContent = cat.category_name;
    li.classList.add("category-item");
    li.addEventListener("click", () => {
      setActiveCategory(li);
      filterPlants(cat.category_name);
    });
    categoryList.appendChild(li);
  });
}

// Load plant cards
function loadPlants(plants) {
  treeCardsContainer.innerHTML = "";

  if (!plants.length) {
    treeCardsContainer.innerHTML = "<p>No trees available.</p>";
    return;
  }

  plants.forEach(plant => {
    const card = document.createElement("div");
    card.classList.add("tree-card");
    card.setAttribute("data-plant-id", plant.id);

    card.innerHTML = `
      <img src="${plant.image}" alt="${plant.name}">
      <h4 class="tree-card-name">${plant.name}</h4>
      <p class="tree-card-description">${truncateDescription(plant.description, 10)}</p>
      <div class="card-details-wrapper">
        <div class="card-info-top">
          <span class="card-category-tag">${plant.category || "Tree"}</span>
          <span class="card-price">৳${plant.price}</span>
        </div>
        <button class="add-to-cart-button">Add to Cart</button>
      </div>
    `;

    // Event listeners
    card.querySelector(".tree-card-name").addEventListener("click", () => showPlantDetails(plant.id));
    card.querySelector(".add-to-cart-button").addEventListener("click", () => addToCart(plant.id));

    treeCardsContainer.appendChild(card);
  });
}

// Filter plants by category
function filterPlants(categoryName) {
  const filtered = allPlants.filter(p => p.category === categoryName);
  loadPlants(filtered);
}

// Highlight active category
function setActiveCategory(selected) {
  document.querySelectorAll(".category-item").forEach(item => item.classList.remove("active"));
  selected.classList.add("active");
}

// Add plant to cart
function addToCart(plantId) {
  const plant = allPlants.find(p => p.id === plantId);
  if (plant) {
    cart.push(plant);
    renderCart();
  }
}

// Remove plant from cart
function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

// Render cart items and total
function renderCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price-quantity">৳${item.price} × 1</span>
      </div>
      <button class="remove-button">✕</button>
    `;
    div.querySelector(".remove-button").addEventListener("click", () => removeFromCart(i));
    cartItems.appendChild(div);
  });

  cartTotal.textContent = `Total: ৳${total}`;
}

// Show modal with details
function showPlantDetails(plantId) {
  const plant = allPlants.find(p => p.id === plantId);
  if (!plant) return;

  modalDetails.innerHTML = `
    <div class="modal-content-inner">
      <img src="${plant.image}" alt="${plant.name}" class="modal-image">
      <div class="modal-info">
        <h3 class="modal-name">${plant.name}</h3>
        <p class="modal-category">Category: ${plant.category}</p>
        <p class="modal-description">${plant.description}</p>
        <p class="modal-price">Price: ৳${plant.price}</p>
        ${plant.details ? `<p class="modal-details-full">${plant.details}</p>` : ""}
      </div>
    </div>
  `;
  plantModal.style.display = "block";
}

// Close modal
closeModalButton.addEventListener("click", () => {
  plantModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === plantModal) {
    plantModal.style.display = "none";
  }
});

// Spinner visibility
function showSpinner() {
  loadingSpinner.style.display = "flex";
}
function hideSpinner() {
  loadingSpinner.style.display = "none";
}

// Init app
async function init() {
  showSpinner();
  try {
    const catRes = await fetch("https://openapi.programming-hero.com/api/categories");
    const catData = await catRes.json();
    loadCategories(catData.categories || []);

    const plantRes = await fetch("https://openapi.programming-hero.com/api/plants");
    const plantData = await plantRes.json();
    allPlants = plantData.plants || [];
    loadPlants(allPlants);
  } catch (err) {
    console.error("API failed:", err.message);
    treeCardsContainer.innerHTML = "<p>Failed to load plants. Please try again later.</p>";
  } finally {
    hideSpinner();
  }
}

// Start app
init();
