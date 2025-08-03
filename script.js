// add classes for mobile navigation toggling
var CSbody = document.querySelector("body");
const CSnavbarMenu = document.querySelector("#cs-navigation");
const CShamburgerMenu = document.querySelector("#cs-navigation .cs-toggle");

// FIXED: Add null check and better event handling
if (CShamburgerMenu && CSnavbarMenu && CSbody) {
  CShamburgerMenu.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // DOM writes
    CShamburgerMenu.classList.toggle("cs-active");
    CSnavbarMenu.classList.toggle("cs-active");
    CSbody.classList.toggle("cs-open");

    // Defer aria-expanded update
    requestAnimationFrame(() => {
      ariaExpanded();
    });
  });

  CShamburgerMenu.addEventListener("touchstart", function (e) {
    e.preventDefault();
    e.stopPropagation();

    // DOM writes
    CShamburgerMenu.classList.toggle("cs-active");
    CSnavbarMenu.classList.toggle("cs-active");
    CSbody.classList.toggle("cs-open");

    requestAnimationFrame(() => {
      ariaExpanded();
    });
  });
}

// checks the value of aria expanded on the cs-ul and changes it accordingly
function ariaExpanded() {
  const csUL = document.querySelector("#cs-expanded");
  if (csUL) {
    const csExpanded = csUL.getAttribute("aria-expanded");
    csUL.setAttribute(
      "aria-expanded",
      csExpanded === "false" ? "true" : "false"
    );
  }
}

// mobile nav dropdown toggles
const dropDowns = Array.from(
  document.querySelectorAll("#cs-navigation .cs-dropdown")
);
for (const item of dropDowns) {
  const onClick = () => {
    item.classList.toggle("cs-active");
  };
  item.addEventListener("click", onClick);
}

// Close mobile menu when clicking nav links
document.addEventListener("DOMContentLoaded", function () {
  const navLinks = document.querySelectorAll("#cs-navigation .cs-li-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (CShamburgerMenu && CSnavbarMenu && CSbody) {
        CShamburgerMenu.classList.remove("cs-active");
        CSnavbarMenu.classList.remove("cs-active");
        CSbody.classList.remove("cs-open");
        requestAnimationFrame(() => {
          ariaExpanded();
        });
      }
    });
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (e) {
  if (CSnavbarMenu && CSnavbarMenu.classList.contains("cs-active")) {
    if (
      !CSnavbarMenu.contains(e.target) &&
      !CShamburgerMenu.contains(e.target)
    ) {
      CShamburgerMenu.classList.remove("cs-active");
      CSnavbarMenu.classList.remove("cs-active");
      CSbody.classList.remove("cs-open");
      requestAnimationFrame(() => {
        ariaExpanded();
      });
    }
  }
});

// Smooth scroll to pairings box
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

// Add recipe search listeners
function addRecipeSearchListeners(container) {
  const pairingItems = container.querySelectorAll(".pairing-category ul li");

  pairingItems.forEach((item) => {
    item.style.cursor = "pointer";
    item.title = `Click to search for ${item.textContent} recipes`;

    item.addEventListener("click", (e) => {
      e.stopPropagation();
      const ingredient = item.textContent.trim();
      const searchQuery = `${ingredient} recipes`;
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
        searchQuery
      )}`;
      window.open(googleSearchUrl, "_blank");
    });

    item.addEventListener("mouseenter", () => {
      item.style.opacity = "0.8";
    });

    item.addEventListener("mouseleave", () => {
      item.style.opacity = "1";
    });
  });
}

// Load beer data
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
      if (lagerList && aleList) {
        createBeerList(data.lagers, lagerList);
        createBeerList(data.ales, aleList);
      }
    })
    .catch((error) => {
      console.error("Error loading beer data:", error);
    });
}

// Create beer list with deferred scroll
function createBeerList(beers, container) {
  if (!beers || !container) return;

  const beerListContainer = document.createElement("div");
  beerListContainer.classList.add("beer-label-list");
  const ul = document.createElement("ul");

  beers.forEach((beer) => {
    const li = document.createElement("li");
    li.textContent = beer.name;
    li.style.cursor = "pointer";

    li.addEventListener("click", () => {
      const pairingsBox = document.getElementById("pairingsBox");
      if (!pairingsBox) return;

      // DOM writes (update classes & innerHTML)
      document.querySelectorAll(".beer-label-list li").forEach((item) => {
        item.classList.remove("active");
      });
      li.classList.add("active");

      let pairingsHTML = `
        <h2>${beer.name}</h2>
        <div class="pairing-category">
          <h4>Classic Pairings:</h4>
          <ul>
            ${beer.pairings.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `;

      if (beer.seasonal_pairings) {
        pairingsHTML += `<div class="pairing-category"><h4>Seasonal Pairings:</h4>`;
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
            </div>`;
        }
        pairingsHTML += `</div>`;
      }

      // Build content in a fragment instead of using innerHTML directly
      const temp = document.createElement("div");
      temp.innerHTML = pairingsHTML;
      const newContent = temp.firstElementChild ? temp : temp; // preserve full fragment

      // Swap in
      pairingsBox.replaceChildren(...Array.from(temp.childNodes));

      // Defer layout-sensitive actions
      requestAnimationFrame(() => {
        addRecipeSearchListeners(pairingsBox);
        scrollToPairings();
      });
    });

    ul.appendChild(li);
  });

  beerListContainer.appendChild(ul);
  const mainContainer = document.createElement("div");
  mainContainer.classList.add("beer-bottle-container");
  mainContainer.appendChild(beerListContainer);
  container.appendChild(mainContainer);
}

// Load wine data (unchanged except scroll deferred)
function loadWineData() {
  fetch("wines.json")
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then((data) => {
      const redWineList = document.getElementById("redWineList");
      const whiteWineList = document.getElementById("whiteWineList");
      const winePairingsBox = document.getElementById("winePairingsBox");

      if (redWineList && whiteWineList && winePairingsBox) {
        function renderPairings(wine) {
          const frag = document.createDocumentFragment();
          const title = document.createElement("h3");
          title.textContent = wine.name;
          frag.appendChild(title);
          // build pairing sections into frag as before...
          winePairingsBox.replaceChildren(frag);

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
              ul.querySelectorAll("li").forEach((el) =>
                el.classList.remove("selected")
              );
              li.classList.add("selected");
              renderPairings(wine);

              if (isMobile()) {
                requestAnimationFrame(() => {
                  scrollToPairings();
                });
              }
            });

            ul.appendChild(li);

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
    });
}

// Initialize data loading
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("lagerList")) loadBeerData();
  if (document.getElementById("redWineList")) loadWineData();
});
