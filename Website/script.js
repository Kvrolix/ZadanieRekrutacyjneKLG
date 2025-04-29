import featuredProducts from './data/featuredProducts.js';
console.log(featuredProducts);
// -------------  SMOOTH SCROLL

document.querySelectorAll('a[data-target]').forEach((link) => {
	link.addEventListener('click', function (e) {
		e.preventDefault();
		const targetId = this.dataset.target;
		const target = document.getElementById(targetId);

		if (target) {
			const yOffset = -100;
			const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;

			window.scrollTo({ top: y, behavior: 'smooth' });
		}
	});
});

// ------------- MOBILE MENU

const menuToggle = document.getElementById('menuToggle');
const menuClose = document.getElementById('menuClose');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const navLinks = document.querySelectorAll('.mobile-menu__nav a');

function closeMenu() {
	mobileMenu.classList.add('hidden');
	menuOverlay.classList.add('hidden');
	menuToggle.style.display = 'block';
}

function openMenu() {
	mobileMenu.classList.remove('hidden');
	menuOverlay.classList.remove('hidden');
	menuToggle.style.display = 'none';
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

navLinks.forEach((link) => {
	link.addEventListener('click', closeMenu);
});

// ------------- LOADING THE PRODUCTS

const grid = document.querySelector('.products__grid');
const selectedCount = document.getElementById('selected-count');
const chevronIcon = document.getElementById('chevron-icon');
const dropdownToggle = document.getElementById('dropdown-toggle');
const optionsList = document.getElementById('page-options');

let currentPage = 1;
let pageSize = 14;
let isLoading = false;

function createProductCard(product) {
	const card = document.createElement('div');
	card.classList.add('products__grid-item');
	card.innerHTML = `
		<span>ID: ${product.id}</span>
		<img src="${product.image}" alt="${product.text}" />
	`;
	return card;
}

async function loadProducts() {
	if (isLoading) return;
	isLoading = true;

	try {
		const res = await fetch(
			`https://brandstestowy.smallhost.pl/api/random?pageNumber=${currentPage}&pageSize=${pageSize}`
		);
		const data = await res.json();

		data.data.forEach((product) => {
			const card = createProductCard(product);
			grid.insertBefore(card, document.querySelector('.products__grid-banner'));
		});

		attachCardListeners();
		currentPage++;
	} catch (err) {
		console.error('Error fetching products:', err);
	}

	isLoading = false;
}

// INITIAL LOAD
loadProducts();

// ------------- LAZY LOADING
window.addEventListener('scroll', () => {
	if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
		loadProducts();
	}
});

// ------------- DROPDOWN MENU
dropdownToggle.addEventListener('click', () => {
	optionsList.classList.toggle('hidden');
	chevronIcon.classList.toggle('rotated');
});

// SELECT NEW PAGE SIZE

optionsList.addEventListener('click', (e) => {
	if (e.target.tagName === 'LI') {
		pageSize = parseInt(e.target.dataset.size);
		selectedCount.textContent = pageSize;
		optionsList.classList.add('hidden');
		chevronIcon.classList.remove('rotated');

		// Reset list
		currentPage = 1;
		grid.querySelectorAll('.products__grid-item').forEach((el) => el.remove());

		loadProducts();
	}
});

// ------------- DROPDOWN MENU

function addHeartListeners() {
	const hearts = document.querySelectorAll('.featured__product--heart img');

	hearts.forEach((heart) => {
		heart.addEventListener('click', (e) => {
			e.stopPropagation(); // zapobiega klikaniu w całego slajda

			const isEmpty = heart.dataset.state === 'empty';

			heart.src = isEmpty ? 'src/icons/heart_fill.svg' : 'src/icons/heart_empty.svg';

			heart.dataset.state = isEmpty ? 'filled' : 'empty';
		});
	});
}

// ------------- GENERATE SINGLE SLIDE

function createFeaturedProduct(product) {
	const slide = document.createElement('div');
	slide.classList.add('swiper-slide', 'featured__product');

	slide.innerHTML = `
		<div class="featured__product--img">
			<div class="featured__product--img--text">
				${
					product.tag
						? `<div style="background-color: ${product.tagColor};">${product.tag}</div>`
						: `<div style="visibility: hidden">tag</div>`
				}
				<span class="featured__product--heart"><img src="src/icons/heart_empty.svg" data-state="empty" /></span>
			</div>
			<img src="${product.img}" alt="${product.title}" />
		</div>
		<div class="featured__product--text">
			<h3>${product.title}</h3>
			<h4>${product.price}</h4>
		</div>
	`;

	return slide;
}

function renderFeaturedProducts() {
	const wrapper = document.querySelector('.swiper-wrapper');
	if (!wrapper) return;

	featuredProducts.forEach((product) => {
		const slide = createFeaturedProduct(product);
		wrapper.appendChild(slide);
	});
	addHeartListeners();
}

renderFeaturedProducts();

// ------------- MODAL PRODUKTU

const modal = document.getElementById('productModal');
const modalImg = document.getElementById('modal-img');
const modalId = document.getElementById('modal-id');
const modalClose = document.getElementById('modal-close');

function showModal(product) {
	modal.classList.remove('hidden');
	modalImg.src = product.image;
	modalId.textContent = `ID: ${product.id}`;
}

modalClose.addEventListener('click', () => {
	modal.classList.add('hidden');
});

modal.querySelector('.modal__overlay').addEventListener('click', () => {
	modal.classList.add('hidden');
});

function attachCardListeners() {
	document.querySelectorAll('.products__grid-item').forEach((card) => {
		card.addEventListener('click', () => {
			const id = card.querySelector('span')?.textContent?.replace('ID:', '').trim();
			const img = card.querySelector('img')?.src;

			showModal({ id, image: img });
		});
	});
}

// ------------- SWIPER

const swiper = new Swiper('.featured__swiper', {
	loop: true,
	grabCursor: true,
	speed: 600,
	slidesPerView: 2,
	spaceBetween: 10,

	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	scrollbar: {
		el: '.swiper-scrollbar',
		draggable: true,
		dragSize: 'auto',
		hide: true,
	},

	breakpoints: {
		0: {
			slidesPerView: 1,
		},
		640: {
			slidesPerView: 2,
		},
		1024: {
			slidesPerView: 3,
		},
		1400: {
			slidesPerView: 4,
		},
	},
});

loadProducts();
