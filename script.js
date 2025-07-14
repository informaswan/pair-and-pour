// add classes for mobile navigation toggling
var CSbody = document.querySelector('body');
const CSnavbarMenu = document.querySelector('#cs-navigation');
const CShamburgerMenu = document.querySelector('#cs-navigation .cs-toggle');

CShamburgerMenu.addEventListener('click', function () {
	CShamburgerMenu.classList.toggle('cs-active');
	CSnavbarMenu.classList.toggle('cs-active');
	CSbody.classList.toggle('cs-open');
	// run the function to check the aria-expanded value
	ariaExpanded();
});

// checks the value of aria expanded on the cs-ul and changes it accordingly whether it is expanded or not
function ariaExpanded() {
	const csUL = document.querySelector('#cs-expanded');
	const csExpanded = csUL.getAttribute('aria-expanded');

	if (csExpanded === 'false') {
		csUL.setAttribute('aria-expanded', 'true');
	} else {
		csUL.setAttribute('aria-expanded', 'false');
	}
}

// mobile nav toggle code
const dropDowns = Array.from(document.querySelectorAll('#cs-navigation .cs-dropdown'));
for (const item of dropDowns) {
	const onClick = () => {
		item.classList.toggle('cs-active');
	};
	item.addEventListener('click', onClick);
}
fetch('beers.json')
  .then(response => response.json())
  .then(data => {
    const lagerList = document.getElementById('lagerList');
    const aleList = document.getElementById('aleList');
    const pairingsBox = document.getElementById('pairingsBox');

    function createBeerList(beers, container) {
      const ul = document.createElement('ul');

      beers.forEach(beer => {
        const li = document.createElement('li');
        li.textContent = beer.name;
        li.style.cursor = 'pointer';

        li.addEventListener('click', () => {
          pairingsBox.innerHTML = `
            <h2>${beer.name}</h2>
            <h4>Food Pairings:</h4>
            <ul>
              ${beer.pairings.map(item => `<li>${item}</li>`).join('')}
            </ul>
          `;
        });

        ul.appendChild(li);
      });

      container.appendChild(ul);
    }

    createBeerList(data.lagers, lagerList);
    createBeerList(data.ales, aleList);
  })
  .catch(error => console.error('Error loading beer data:', error));
fetch('wines.json')
  .then(response => response.json())
  .then(data => {
    const redWineList = document.getElementById('redWineList');
    const whiteWineList = document.getElementById('whiteWineList');
    const winePairingsBox = document.getElementById('winePairingsBox');

    function createWineList(wines, container) {
      const ul = document.createElement('ul');

      wines.forEach(wine => {
        const li = document.createElement('li');
        li.textContent = wine.name;
        li.style.cursor = 'pointer';

        li.addEventListener('click', () => {
          // Clear previous content
          winePairingsBox.innerHTML = `<h2>${wine.name}</h2>`;

          // For each category in pairings object, create a section with title and list
          for (const category in wine.pairings) {
            if (wine.pairings.hasOwnProperty(category)) {
              const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
              const items = wine.pairings[category];

              const section = document.createElement('div');
              section.classList.add('pairing-category');

              const titleEl = document.createElement('h4');
              titleEl.textContent = categoryTitle;

              const listEl = document.createElement('ul');
              items.forEach(item => {
                const itemEl = document.createElement('li');
                itemEl.textContent = item;
                listEl.appendChild(itemEl);
              });

              section.appendChild(titleEl);
              section.appendChild(listEl);
              winePairingsBox.appendChild(section);
            }
          }
        });

        ul.appendChild(li);
      });

      container.appendChild(ul);
    }

    createWineList(data.redWines, redWineList);
    createWineList(data.whiteWines, whiteWineList);
  })
  .catch(error => console.error('Error loading wine data:', error));

