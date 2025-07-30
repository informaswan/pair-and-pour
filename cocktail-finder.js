// cocktail-finder.js

// Global variables
let currentTab = "cocktails";
let selectedIngredients = [];
let cocktailDrinks = [];
let mocktailDrinks = [];
let cocktailIngredients = [];
let mocktailIngredients = [];

// Load JSON data
async function loadData() {
  try {
    // Load cocktail data
    const cocktailResponse = await fetch("cocktail-drinks.json");
    cocktailDrinks = await cocktailResponse.json();

    // Load mocktail data
    const mocktailResponse = await fetch("mocktail-drinks.json");
    mocktailDrinks = await mocktailResponse.json();

    // Load ingredient lists
    const cocktailIngredientsResponse = await fetch(
      "cocktail-ingredients.json"
    );
    cocktailIngredients = await cocktailIngredientsResponse.json();

    const mocktailIngredientsResponse = await fetch(
      "mocktail-ingredients.json"
    );
    mocktailIngredients = await mocktailIngredientsResponse.json();

    // Initialize the page
    populateIngredientSelect();
    displayDrinks();
  } catch (error) {
    console.error("Error loading data:", error);
    // Fallback data in case JSON files are not available
    initializeFallbackData();
  }
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", loadData);

// Fallback data initialization
function initializeFallbackData() {
  // This would contain the full data objects as backup
  // For brevity, I'll just show the structure
  cocktailDrinks = [
    {
      drinkName: "Americano",
      ingredients: ["Campari", "Sweet Vermouth", "Club Soda", "Orange Slice"],
      videos: {
        instructionalVideo: "https://www.youtube.com/embed/Rr96B2UkXfY",
        variationVideo: "https://www.youtube.com/embed/HFTLcG3Y9J8",
      },
      instructions: [
        "Fill a highball glass with ice.",
        "Add 1 oz Campari.",
        "Add 1 oz Sweet Vermouth.",
        "Top with club soda.",
        "Stir gently.",
        "Garnish with an orange slice.",
      ],
    },
    // ... more drinks would be here
  ];

  mocktailDrinks = [
    {
      drinkName: "Virgin Mojito",
      ingredients: [
        "Mint Leaves",
        "Lime Juice",
        "Sugar Syrup",
        "Soda Water",
        "Lime Wedge",
      ],
      videos: {
        instructionalVideo: "https://www.youtube.com/embed/ABcL3PiVqgo",
        variationVideo: "https://www.youtube.com/embed/sy4aH4Nk7A8",
      },
      instructions: [
        "Muddle fresh mint leaves with 1 oz lime juice and 0.5 oz sugar syrup in a glass.",
        "Fill glass with ice.",
        "Top with soda water.",
        "Stir gently.",
        "Garnish with a lime wedge and mint sprig.",
      ],
    },
    // ... more drinks would be here
  ];

  cocktailIngredients = ["Gin", "Vodka", "Rum", "Whiskey", "Tequila"];
  mocktailIngredients = ["Soda Water", "Fruit Juice", "Sugar Syrup", "Mint"];

  populateIngredientSelect();
  displayDrinks();
}

// Switch between cocktails and mocktails tabs
function switchTab(tab) {
  currentTab = tab;
  selectedIngredients = [];

  // Update tab styling
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  
  // Find the correct tab button and make it active
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(tabButton => {
    if (tabButton.textContent.toLowerCase().includes(tab)) {
      tabButton.classList.add("active");
    }
  });

  // Update ingredient select and display
  populateIngredientSelect();
  updateSelectedIngredients();
  displayDrinks();
}

// Populate ingredient dropdown based on current tab
function populateIngredientSelect() {
  const select = document.getElementById("ingredientSelect");
  const ingredients =
    currentTab === "cocktails" ? cocktailIngredients : mocktailIngredients;

  // Clear current options
  select.innerHTML = '<option value="">Choose an ingredient...</option>';

  // Add ingredient options, excluding already selected ones
  ingredients
    .filter((ingredient) => !selectedIngredients.includes(ingredient))
    .sort()
    .forEach((ingredient) => {
      const option = document.createElement("option");
      option.value = ingredient;
      option.textContent = ingredient;
      select.appendChild(option);
    });
}

// Handle ingredient selection
document.addEventListener("change", function (e) {
  if (e.target.id === "ingredientSelect" && e.target.value) {
    addIngredient(e.target.value);
    e.target.value = "";
  }
});

// Handle filter mode change
document.addEventListener("change", function (e) {
  if (e.target.name === "filterMode") {
    displayDrinks();
  }
});

// Add ingredient to selected list
function addIngredient(ingredient) {
  if (!selectedIngredients.includes(ingredient)) {
    selectedIngredients.push(ingredient);
    populateIngredientSelect();
    updateSelectedIngredients();
    displayDrinks();
  }
}

// Remove ingredient from selected list
function removeIngredient(ingredient) {
  selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
  populateIngredientSelect();
  updateSelectedIngredients();
  displayDrinks();
}

// Update selected ingredients display
function updateSelectedIngredients() {
  const container = document.getElementById("selectedIngredients");
  container.innerHTML = "";

  selectedIngredients.forEach(ingredient => {
    const tag = document.createElement("div");
    tag.className = "ingredient-tag";
    tag.innerHTML = `
      ${ingredient}
      <button class="remove-ingredient" onclick="removeIngredient('${ingredient}')" aria-label="Remove ${ingredient}">×</button>
    `;
    container.appendChild(tag);
  });
}

// Clear all filters
function clearFilters() {
  selectedIngredients = [];
  
  // Reset radio buttons to "any" as default
  const anyRadio = document.querySelector('input[name="filterMode"][value="any"]');
  if (anyRadio) {
    anyRadio.checked = true;
  }
  
  populateIngredientSelect();
  updateSelectedIngredients();
  displayDrinks();
}

// Display drinks based on current filters
function displayDrinks() {
  const grid = document.getElementById("drinksGrid");
  const noResults = document.getElementById("noResults");
  const drinks = currentTab === "cocktails" ? cocktailDrinks : mocktailDrinks;

  let filteredDrinks = drinks;

  // Apply ingredient filters
  if (selectedIngredients.length > 0) {
    const filterMode = document.querySelector('input[name="filterMode"]:checked').value;

    filteredDrinks = drinks.filter(drink => {
      const match = ingredient =>
        drink.ingredients.some(ing => ing.toLowerCase().includes(ingredient.toLowerCase()));
      return filterMode === "all"
        ? selectedIngredients.every(match)
        : selectedIngredients.some(match);
    });
  }

  // Display results
  if (filteredDrinks.length === 0) {
    grid.style.display = "none";
    noResults.style.display = "block";
  } else {
    grid.style.display = "grid";
    noResults.style.display = "none";

    grid.innerHTML = filteredDrinks.map(drink => `
      <div class="drink-card" data-drink="${drink.drinkName}">
        <div class="drink-name">${drink.drinkName}</div>
        <div class="drink-ingredients">
          <strong>Ingredients:</strong> ${drink.ingredients.join(", ")}
        </div>
      </div>
    `).join("");

    bindDrinkCardClicks(); // Attach click events after rendering
  }
}

// Bind click events to drink cards using dataset
function bindDrinkCardClicks() {
  document.querySelectorAll(".drink-card").forEach(card => {
    card.addEventListener("click", () => {
      const drinkName = card.dataset.drink;
      openModal(drinkName);
    });
  });
}

// Normalize drink name for reliable matching
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

// Open drink detail modal
function openModal(clickedName) {
  const normalizedClickedName = normalizeName(clickedName);
  const drinks = currentTab === "cocktails" ? cocktailDrinks : mocktailDrinks;

  const drink = drinks.find(d => normalizeName(d.drinkName) === normalizedClickedName);
  if (!drink) return;

  const modalContent = document.getElementById("modalContent");
  modalContent.innerHTML = `
    <div class="modal-scroll-content">
      <div class="modal-drink-name">${drink.drinkName}</div>
      <div class="modal-section">
        <h3>Ingredients</h3>
        <div class="ingredients-list">
          ${drink.ingredients.map(ing => `<span class="ingredient-item">${ing}</span>`).join("")}
        </div>
      </div>
      <div class="modal-section">
        <h3>Instructions</h3>
        <ol class="instructions-list">
          ${drink.instructions.map(inst => `<li>${inst}</li>`).join("")}
        </ol>
      </div>
      <div class="modal-section">
        <h3>Videos</h3>
        <div class="video-section">
          <div class="video-container">
            <h4>How to Make</h4>
            <iframe src="${drink.videos.instructionalVideo}" title="How to make ${drink.drinkName}" allowfullscreen></iframe>
          </div>
          <div class="video-container">
            <h4>Variations</h4>
            <iframe src="${drink.videos.variationVideo}" title="${drink.drinkName} variations" allowfullscreen></iframe>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById("drinkModal").style.display = "block";
}

// Close modal
function closeModal() {
  document.getElementById("drinkModal").style.display = "none";
}

// Close modal when clicking outside
document.addEventListener("click", function (e) {
  if (e.target === document.getElementById("drinkModal")) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeModal();
  }
});

// Initialize default radio button to "any" when page loads
document.addEventListener("DOMContentLoaded", function() {
  // Set default filter mode to "any"
  const anyRadio = document.querySelector('input[name="filterMode"][value="any"]');
  if (anyRadio) {
    anyRadio.checked = true;
  }
});