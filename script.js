// add classes for mobile navigation toggling
var CSbody = document.querySelector("body");
const CSnavbarMenu = document.querySelector("#cs-navigation");
const CShamburgerMenu = document.querySelector("#cs-navigation .cs-toggle");

// FIXED: Add null check and better event handling
if (CShamburgerMenu && CSnavbarMenu && CSbody) {
  CShamburgerMenu.addEventListener("click", function (e) {
    // FIXED: Prevent default and stop propagation
    e.preventDefault();
    e.stopPropagation();

    CShamburgerMenu.classList.toggle("cs-active");
    CSnavbarMenu.classList.toggle("cs-active");
    CSbody.classList.toggle("cs-open");
    // run the function to check the aria-expanded value
    ariaExpanded();
  });

  // FIXED: Add touch event for mobile devices
  CShamburgerMenu.addEventListener("touchstart", function (e) {
    e.preventDefault();
    e.stopPropagation();

    CShamburgerMenu.classList.toggle("cs-active");
    CSnavbarMenu.classList.toggle("cs-active");
    CSbody.classList.toggle("cs-open");
    ariaExpanded();
  });
}

// checks the value of aria expanded on the cs-ul and changes it accordingly whether it is expanded or not
function ariaExpanded() {
  const csUL = document.querySelector("#cs-expanded");

  // FIXED: Add null check
  if (csUL) {
    const csExpanded = csUL.getAttribute("aria-expanded");

    if (csExpanded === "false") {
      csUL.setAttribute("aria-expanded", "true");
    } else {
      csUL.setAttribute("aria-expanded", "false");
    }
  }
}

// mobile nav toggle code
const dropDowns = Array.from(
  document.querySelectorAll("#cs-navigation .cs-dropdown")
);
for (const item of dropDowns) {
  const onClick = () => {
    item.classList.toggle("cs-active");
  };
  item.addEventListener("click", onClick);
}

// FIXED: Close mobile menu when clicking on navigation links
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll("#cs-navigation .cs-li-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      // Close mobile menu when a link is clicked
      if (CShamburgerMenu && CSnavbarMenu && CSbody) {
        CShamburgerMenu.classList.remove("cs-active");
        CSnavbarMenu.classList.remove("cs-active");
        CSbody.classList.remove("cs-open");
        ariaExpanded();
      }
    });
  });
});

// FIXED: Close mobile menu when clicking outside
document.addEventListener("click", function (e) {
  if (CSnavbarMenu && CSnavbarMenu.classList.contains("cs-active")) {
    // If click is outside navigation and not on the hamburger menu
    if (
      !CSnavbarMenu.contains(e.target) &&
      !CShamburgerMenu.contains(e.target)
    ) {
      CShamburgerMenu.classList.remove("cs-active");
      CSnavbarMenu.classList.remove("cs-active");
      CSbody.classList.remove("cs-open");
      ariaExpanded();
    }
  }
});

// Function to smooth scroll to pairings box
function scrollToPairings() {
  const pairingsBox =
    document.getElementById("pairingsBox") ||
    document.getElementById("winePairingsBox");
  if (pairingsBox) {
    pairingsBox.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

function isMobile() {
  return window.innerWidth <= 768;
}
// Function to add click listeners to pairing items for recipe search
function addRecipeSearchListeners(container) {
  const pairingItems = container.querySelectorAll(".pairing-category ul li");

  pairingItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.title = `Click to search for ${item.textContent} recipes`;

    item.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent any parent click events

      const ingredient = item.textContent.trim();
      const searchQuery = `${ingredient} recipes`;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        searchQuery
      )}`;

      // Open in new tab
      window.open(googleSearchUrl, "_blank");
    });

    // Add hover effect to indicate clickability
    item.addEventListener("mouseenter", () => {
      item.style.opacity = "0.8";
    });

    item.addEventListener("mouseleave", () => {
      item.style.opacity = "1";
    });
  });
}

// FIXED: Add error handling and better data loading
function loadBeerData() {
  fetch("beers.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const lagerList = document.getElementById("lagerList");
      const aleList = document.getElementById("aleList");
      const pairingsBox = document.getElementById("pairingsBox");

      if (lagerList && aleList && pairingsBox) {
        createBeerList(data.lagers, lagerList);
        createBeerList(data.ales, aleList);
      }
    })
    .catch((error) => {
      console.error("Error loading beer data:", error);
      // Could add fallback UI here
    });
}

// Replace the createBeerList function with this improved version:
function createBeerList(beers, container) {
  if (!beers || !container) return;

  // Create the container div with beer-label-list class
  const beerListContainer = document.createElement("div");
  beerListContainer.classList.add("beer-label-list");

  // Create the ul element
  const ul = document.createElement("ul");

  beers.forEach((beer) => {
    const li = document.createElement("li");
    li.textContent = beer.name;
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      const pairingsBox = document.getElementById("pairingsBox");
      if (!pairingsBox) return;

      // Remove active class from all beer items
      document.querySelectorAll(".beer-label-list li").forEach((item) => {
        item.classList.remove("active");
      });

      // Add active class to clicked item
      li.classList.add("active");

      // Create classic pairings section
      let pairingsHTML = `
        <h2>${beer.name}</h2>
        <div class="pairing-category">
          <h4>Classic Pairings:</h4>
          <ul>
            ${beer.pairings.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `;

      // Add seasonal pairings if they exist
      if (beer.seasonal_pairings) {
        pairingsHTML += `
          <div class="pairing-category">
            <h4>Seasonal Pairings:</h4>
        `;

        // Add each season
        for (const season in beer.seasonal_pairings) {
          const seasonTitle = season.charAt(0).toUpperCase() + season.slice(1);
          pairingsHTML += `
            <div class="pairing-category">
              <h4>${seasonTitle}:</h4>
              <ul>
                ${beer.seasonal_pairings[season]
                  .map((item) => `<li>${item}</li>`)
                  .join("")}
              </ul>
            </div>
          `;
        }

        pairingsHTML += `</div>`;
      }

      pairingsBox.innerHTML = pairingsHTML;

      // Add recipe search functionality to the newly created pairing items
      addRecipeSearchListeners(pairingsBox);

      // ADDED: Smooth scroll to pairings box after selection
      setTimeout(() => {
        scrollToPairings();
      }, 100); // Small delay to ensure content is rendered
    });

    ul.appendChild(li);
  });

  // Add the ul to the beer list container
  beerListContainer.appendChild(ul);

  // Create the main container with beer-bottle-container class
  const mainContainer = document.createElement("div");
  mainContainer.classList.add("beer-bottle-container");
  mainContainer.appendChild(beerListContainer);

  container.appendChild(mainContainer);
}

// FIXED: Add error handling for wine data loading
function loadWineData() {
  fetch("wines.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const redWineList = document.getElementById("redWineList");
      const whiteWineList = document.getElementById("whiteWineList");
      const winePairingsBox = document.getElementById("winePairingsBox");

      if (redWineList && whiteWineList && winePairingsBox) {
        function renderPairings(wine) {
          winePairingsBox.innerHTML = `<h3>${wine.name}</h3>`;

          for (const category in wine.pairings) {
            if (wine.pairings.hasOwnProperty(category)) {
              const categoryTitle =
                category.charAt(0).toUpperCase() + category.slice(1);
              const items = wine.pairings[category];

              const section = document.createElement("div");
              section.classList.add("pairing-category");

              const titleEl = document.createElement("h4");
              titleEl.textContent = categoryTitle;

              const listEl = document.createElement("ul");
              items.forEach((item) => {
                const itemEl = document.createElement("li");
                itemEl.textContent = item;
                listEl.appendChild(itemEl);
              });

              section.appendChild(titleEl);
              section.appendChild(listEl);
              winePairingsBox.appendChild(section);
            }
          }

          // Add recipe search functionality to wine pairings too
        }

        function createWineList(wines, container, type) {
          if (!wines || !container) return;

          const ul = document.createElement("ul");
          ul.style.listStyle = "none";
          ul.style.padding = "0";

          wines.forEach((wine, index) => {
            const li = document.createElement("li");
            li.textContent = wine.name;
            li.style.cursor = "pointer";

            li.addEventListener("click", () => {
              // Remove 'selected' class from all other wines
              ul.querySelectorAll("li").forEach((el) =>
                el.classList.remove("selected")
              );

              li.classList.add("selected");
              renderPairings(wine);

              // Auto-scroll to pairings on mobile
              if (isMobile()) {
                setTimeout(() => {
                  scrollToPairings();
                }, 100);
              }
            });

            ul.appendChild(li);

            // Auto-select first red wine only
            if (type === "red" && index === 0) {
              li.classList.add("selected");
              renderPairings(wine);
            }
          });

          container.appendChild(ul);
        }

        createWineList(data.redWines, redWineList, "red");
        createWineList(data.whiteWines, whiteWineList, "white");
      }
    })
    .catch((error) => {
      console.error("Error loading wine data:", error);
      // Could add fallback UI here
    });
}

// FIXED: Initialize data loading when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Load beer data if elements exist
  if (document.getElementById("lagerList")) {
    loadBeerData();
  }

  // Load wine data if elements exist
  if (document.getElementById("redWineList")) {
    loadWineData();
  }
});
