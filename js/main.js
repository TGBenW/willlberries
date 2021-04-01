const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

// cart

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');
const longGoodsList = document.querySelector('.long-goods-list');
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const showAccessories = document.querySelectorAll('.show-accessories');
const showClothing = document.querySelectorAll('.show-clothes');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const cartCount = document.querySelector('.cart-count');
const btnDanger = document.querySelector('.btn-danger');

const checkGoods = () => {

	const data = [];

	return async () => {
		if (data.length) return data;

		const result = await fetch('db/db.json');
		if (!result.ok) {
			throw 'error: ' + result.status
		}
		data.push(...(await result.json()));

		return data;
	};
}

const getGoods = checkGoods();

const cart = {
	cartGoods: JSON.parse(localStorage.getItem('cartWilb')) || [],
	updateLocalStorage() {
		localStorage.setItem('cartWilb', JSON.stringify(this.cartGoods));
	},
	getCountCartGoods() {
		return this.cartGoods.length
	},
	countQuantity() {
		const count = this.cartGoods.reduce((sum, item) => {
			return sum + item.count
		}, 0)
		cartCount.textContent = count ? count : '';
	},
	clearCart() {
		this.cartGoods.length = 0;
		this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({ id, name, price, count }) => {
			const trGood = document.createElement('tr');
			trGood.className = 'cart-item';
			trGood.dataset.id = id;

			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});

		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count;
		}, 0);

		cardTableTotal.textContent = totalPrice + '$';
	},
	deleteGood(id) {
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		this.renderCart();
		this.updateLocalStorage();
		this.countQuantity();
	},
	minusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count--;
				if (!item.count) this.deleteGood(id)
				break;
			}
		}
		this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	plusGood(id) {
		for (const item of this.cartGoods) {
			if (item.id === id) {
				item.count++;
				break;
			}
		}
		this.countQuantity();
		this.updateLocalStorage();
		this.renderCart();
	},
	addCartGoods(id) {
		const goodItem = this.cartGoods.find(item => item.id === id);
		if (goodItem) {
			this.plusGood(id);
		} else {
			getGoods()
				.then(data => data.find(item => item.id === id))
				.then(({ id, name, price }) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1
					});
					this.updateLocalStorage();
					this.countQuantity();
				});
		}
	},
}

btnDanger.addEventListener('click', () => {
	cart.clearCart();
	closeModal();
			modalForm.reset();
			
			cart.clearCart();
});

document.body.addEventListener('click', event => {
	const addToCart = event.target.closest('.add-to-cart')

	if (addToCart) {
		cart.addCartGoods(addToCart.dataset.id);
	}
})

cartTableGoods.addEventListener('click', event => {
	const target = event.target;

	if (target.tagName === "BUTTON") {
		if (target.classList.contains('cart-btn-delete')) {
			const id = target.closest('.cart-item').dataset.id;
			cart.deleteGood(id);
		};
		if (target.classList.contains('cart-btn-minus')) {
			const id = target.closest('.cart-item').dataset.id;
			cart.minusGood(id);
		}
		if (target.classList.contains('cart-btn-plus')) {
			const id = target.closest('.cart-item').dataset.id;
			cart.plusGood(id);
		}
	}
})

const openModal = () => {
	cart.renderCart();
	modalCart.classList.toggle('show');
}

const closeModal = () => {
	modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);

// scroll smooth

(function () {
	const scrollLinks = document.querySelectorAll('a.scroll-link');

	for (const scrollLink of scrollLinks) {
		scrollLink.addEventListener('click', event => {
			event.preventDefault();
			const id = scrollLink.getAttribute('href');
			document.querySelector(id).scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			})
		});
	};
})();

//additional task day 1

modalCart.addEventListener('click', (event) => {
  const target = event.target;
  if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
    closeModal();
  };
});
				
const escapeHandler = event => {
  if (event.code === "Escape") {
    closeModal();
  }
};

document.addEventListener('keydown', escapeHandler);

// goods

const createCard = function ({ label, name, img, description, id, price }) {
	const card = document.createElement('div');
	card.className = 'col-lg-3 col-sm-6';

	card.innerHTML = `
		<div class="goods-card">
			${label ? `<span class="label">${label}</span>` : ''}
			
			<img src="db/${img}" alt="${name}" class="goods-image">
			<h3 class="goods-title">${name}</h3>
			<p class="goods-description">${description}</p>
			<button class="button goods-card-btn add-to-cart" data-id=${id}>
				<span class="button-price">$${price}</span>
			</button>
		</div>
	`;

	return card;
}

const renderCards = function(data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard)
	longGoodsList.append(...cards)
	document.body.classList.add('show-goods');
}

const ShowAll = function (event) {
	event.preventDefault();
	getGoods().then(renderCards);
}

viewAll.forEach(function (elem) {
	elem.addEventListener('click', event => {
		event.preventDefault();
		getGoods().then(renderCards);
	});
})

const filterCards = function (field, value) {
	getGoods()
		.then(data => data.filter(good => good[field] === value))
		.then(renderCards);
}

navigationLink.forEach(function (link) {
	link.addEventListener('click', event => {
		event.preventDefault();
		const field = link.dataset.field;
		const value = link.textContent;
		filterCards(field, value);
		//if (value === 'All') getGoods().then(renderCards);; --------ALL BUTTON MY SOLUTION
	})
});

showAccessories.forEach(item => {
	item.addEventListener('click', event => {
		event.preventDefault();
		filterCards('category', 'Accessories');
	})
});

showClothing.forEach(item => {
	item.addEventListener('click', event => {
		event.preventDefault();
		filterCards('category', 'Clothing');
	})
});

// day 4 - server

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('./server.php', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json'
	},
	body: dataUser,
})

const validForm = (formData) => {
	let valid = false;

	for (const [, value] of formData) {
		if (value.trim()) {
			valid = true;
		} else {
			valid = false;
			break;
		}
	}
	return valid;
}

modalForm.addEventListener('submit', event => {
	event.preventDefault();
	const formData = new FormData(modalForm);

	if (validForm(formData) && cart.getCountCartGoods()) {
		const data = {};

		for (const [name, value] of formData) {
			data[name] = value;
		}

		data.cart = cart.cartGoods;

		postData(JSON.stringify(data))
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status);
				}
				alert('Ваш заказ успешно отправлен, с Вами свяжутся в ближайшее время');
			})
			.catch(error => {
				alert('К сожалению произошла ошибка, повторите попытку позже');
				console.error(err);
			})
			.finally(() => {
				closeModal();
				modalForm.reset();
				cart.clearCart();
			});
	} else {
		if (!cart.getCountCartGoods()) {
			alert('Добавьте товары в корзину');
		}
		if (!validForm(formData)) {
			alert('Заполните форму правильно');
		}
	}

	
})