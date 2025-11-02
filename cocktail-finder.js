// cocktail-finder.js

// Global variables
let currentTab = "cocktails";
let selectedIngredients = [];
let cocktailDrinks = [];
let mocktailDrinks = [];
let cocktailIngredients = [];
let mocktailIngredients = [];

// Load JSON data with improved loading state to prevent CLS
async function loadData() {
  // Add loading state immediately to prevent layout shift
  const grid = document.getElementById("drinksGrid");
  grid.classList.add("loading");

  // Show initial loading skeleton with proper dimensions
  grid.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; color: white; padding: 40px;">
      <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-radius: 50%; border-top-color: white; animation: spin 1s ease-in-out infinite;"></div>
      <p style="margin-top: 20px; font-size: 18px;">Loading cocktail database...</p>
    </div>
  `;

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
  } finally {
    // Remove loading state after a brief delay to ensure smooth transition
    setTimeout(() => {
      grid.classList.remove("loading");
    }, 300);
  }
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Set default filter mode to "any" immediately to prevent CLS
  const anyRadio = document.querySelector(
    'input[name="filterMode"][value="any"]'
  );
  if (anyRadio) {
    anyRadio.checked = true;
  }

  // Load data
  loadData();
});

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

// Switch between cocktails and mocktails tabs with improved state management
function switchTab(tab) {
  currentTab = tab;
  selectedIngredients = [];

  // Update tab styling with animation prevention during transition
  document.querySelectorAll(".tab").forEach((t) => {
    t.classList.remove("active");
    t.style.transform = "scale(1)"; // Reset any scaling
  });

  // Find the correct tab button and make it active
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tabButton) => {
    if (tabButton.textContent.toLowerCase().includes(tab)) {
      tabButton.classList.add("active");
    }
  });

  // Update ingredient select and display with batch updates to prevent multiple reflows
  requestAnimationFrame(() => {
    populateIngredientSelect();
    updateSelectedIngredients();
    displayDrinks();
  });
}

// Populate ingredient dropdown based on current tab
function populateIngredientSelect() {
  const select = document.getElementById("ingredientSelect");
  const ingredients =
    currentTab === "cocktails" ? cocktailIngredients : mocktailIngredients;

  // Use document fragment to prevent multiple DOM updates
  const fragment = document.createDocumentFragment();

  // Clear current options
  select.innerHTML = "";

  // Add default option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Choose an ingredient...";
  fragment.appendChild(defaultOption);

  // Add ingredient options, excluding already selected ones
  ingredients
    .filter((ingredient) => !selectedIngredients.includes(ingredient))
    .sort()
    .forEach((ingredient) => {
      const option = document.createElement("option");
      option.value = ingredient;
      option.textContent = ingredient;
      fragment.appendChild(option);
    });

  // Single DOM update
  select.appendChild(fragment);
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
document.addEventListener("change", function (e) {
  if (e.target.id === "haveAllCheckbox") {
    displayDrinks();
  }
});

// Add ingredient to selected list with batch DOM updates
function addIngredient(ingredient) {
  if (!selectedIngredients.includes(ingredient)) {
    selectedIngredients.push(ingredient);

    // Batch DOM updates to prevent layout shifts
    requestAnimationFrame(() => {
      populateIngredientSelect();
      updateSelectedIngredients();
      displayDrinks();
    });
  }
}

// Remove ingredient from selected list with batch DOM updates
function removeIngredient(ingredient) {
  selectedIngredients = selectedIngredients.filter((i) => i !== ingredient);

  // Batch DOM updates to prevent layout shifts
  requestAnimationFrame(() => {
    populateIngredientSelect();
    updateSelectedIngredients();
    displayDrinks();
  });
}

// Update selected ingredients display with document fragment
function updateSelectedIngredients() {
  const container = document.getElementById("selectedIngredients");
  const fragment = document.createDocumentFragment();

  selectedIngredients.forEach((ingredient) => {
    const tag = document.createElement("div");
    tag.className = "ingredient-tag";
    tag.innerHTML = `
      ${ingredient}
      <button class="remove-ingredient" onclick="removeIngredient('${ingredient}')" aria-label="Remove ${ingredient}">×</button>
    `;
    fragment.appendChild(tag);
  });

  // Single DOM update
  container.innerHTML = "";
  container.appendChild(fragment);
}

// Clear all filters with batch updates
function clearFilters() {
  selectedIngredients = [];

  // Reset radio buttons to "any" as default
  const anyRadio = document.querySelector(
    'input[name="filterMode"][value="any"]'
  );
  if (anyRadio) {
    anyRadio.checked = true;
  }

  // Batch DOM updates
  requestAnimationFrame(() => {
    populateIngredientSelect();
    updateSelectedIngredients();
    displayDrinks();
  });
}

// Display drinks based on current filters with improved performance
function displayDrinks() {
  const grid = document.getElementById("drinksGrid");
  const noResults = document.getElementById("noResults");
  const drinks = currentTab === "cocktails" ? cocktailDrinks : mocktailDrinks;

  let filteredDrinks = drinks;

  if (selectedIngredients.length > 0) {
    const filterMode = document.querySelector(
      'input[name="filterMode"]:checked'
    ).value;
    const haveAll = document.getElementById("haveAllCheckbox")?.checked;

    filteredDrinks = drinks.filter((drink) => {
      const match = (ingredient) =>
        drink.ingredients.some((ing) =>
          ing.toLowerCase().includes(ingredient.toLowerCase())
        );

      if (haveAll) {
        // Only show drinks where *every ingredient* is available
        return drink.ingredients.every((ing) =>
          selectedIngredients.some((sel) =>
            ing.toLowerCase().includes(sel.toLowerCase())
          )
        );
      }

      // Normal filter mode (ANY selected ingredient)
      return selectedIngredients.some(match);
    });
  }

  // Display results with minimal DOM manipulation
  if (filteredDrinks.length === 0) {
    grid.style.display = "none";
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
    grid.style.display = "grid";

    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    filteredDrinks.forEach((drink) => {
      const card = document.createElement("div");
      card.className = "drink-card";
      card.dataset.drink = drink.drinkName;
      card.innerHTML = `
        <div class="drink-name">${drink.drinkName}</div>
        <div class="drink-ingredients">
          <strong>Ingredients:</strong> ${drink.ingredients.join(", ")}
        </div>
      `;

      // Add click event directly to avoid separate binding step
      card.addEventListener("click", () => openModal(drink.drinkName));

      fragment.appendChild(card);
    });

    // Single DOM update
    grid.innerHTML = "";
    grid.appendChild(fragment);
  }
}

// Normalize drink name for reliable matching
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, "");
}

// Open drink detail modal with improved content loading
function openModal(clickedName) {
  const normalizedClickedName = normalizeName(clickedName);
  const drinks = currentTab === "cocktails" ? cocktailDrinks : mocktailDrinks;

  const drink = drinks.find(
    (d) => normalizeName(d.drinkName) === normalizedClickedName
  );
  if (!drink) return;

  const modalContent = document.getElementById("modalContent");

  // Show modal immediately with loading state
  document.getElementById("drinkModal").style.display = "block";
  modalContent.innerHTML = `
    <div class="modal-scroll-content">
      <div style="text-align: center; padding: 40px; color: #666;">
        <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-radius: 50%; border-top-color: #667eea; animation: spin 1s ease-in-out infinite;"></div>
        <p style="margin-top: 15px;">Loading recipe...</p>
      </div>
    </div>
  `;

  // Load content asynchronously to prevent blocking
  requestAnimationFrame(() => {
    modalContent.innerHTML = `
      <div class="modal-scroll-content">
        <div class="modal-drink-name">${drink.drinkName}</div>
        <div class="modal-section">
          <h3>Ingredients</h3>
          <div class="ingredients-list">
            ${drink.ingredients
              .map((ing) => `<span class="ingredient-item">${ing}</span>`)
              .join("")}
          </div>
        </div>
        <div class="modal-section">
          <h3>Instructions</h3>
          <ol class="instructions-list">
            ${drink.instructions.map((inst) => `<li>${inst}</li>`).join("")}
          </ol>
        </div>
        <div class="modal-section">
          <h3>Videos</h3>
          <div class="video-section">
            <div class="video-container">
              <h4>How to Make</h4>
              <iframe src="${
                drink.videos.instructionalVideo
              }" title="How to make ${
      drink.drinkName
    }" allowfullscreen loading="lazy"></iframe>
            </div>
            <div class="video-container">
              <h4>Variations</h4>
              <iframe src="${drink.videos.variationVideo}" title="${
      drink.drinkName
    } variations" allowfullscreen loading="lazy"></iframe>
            </div>
          </div>
        </div>
      </div>
    `;
  });
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

// Add CSS for loading spinner animation
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
