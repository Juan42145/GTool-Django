/**--STORAGE-- */
Storage.prototype.set = function (key, obj) {
	return this.setItem(key, JSON.stringify(obj));
}

Storage.prototype.get = function (key) {
	return JSON.parse(this.getItem(key));
}

/**--DJANGO CONTEXT-- */
const CONTEXT = JSON.parse(document.getElementById('json_context').textContent)
const USER_CONTEXT = JSON.parse(document.getElementById('json_user_data').textContent)

/**--GLOBAL VARIABLES */
myStorage = localStorage;
user = loadUser()

// Initialize calc
if (!myStorage.get('calc')) {
	console.log('not calc in cache')
	myStorage.set('calc', true);
}

/**--USER STORAGE */
function storeUser() {
	myStorage.set('user', user);
}

function loadUser() {
	return myStorage.get('user') ? myStorage.get('user') : processInventory(USER_CONTEXT)
}

function userSet(userObject, path, value){
	function getOrCreate(object, property, defaultValue={}){
		if (!object[property]) object[property] = defaultValue
		return object[property]
	}
	let cur = userObject
	lastProp = path.pop()
	path.forEach(property => cur = getOrCreate(cur, property))
	getOrCreate(cur, lastProp, value)
}

function userGet(userObject, path, defaultValue = ''){
	let cur = userObject
	for (property of path){
		cur = cur[property]
		if (!cur) return defaultValue 
	}
	return cur
}

// Calculate inventory totals
function processInventory(user) {
	let inv = user.INVENTORY;
	Object.entries(inv).forEach(([category, items]) => {
		Object.entries(items).forEach(([item, materials]) => {
			let counter = 0, total = 0;
			Object.entries(materials).reverse().forEach(([rank, value]) => {
				total += value / (3 ** counter); counter++;
			});
			if (counter > 1) inv[category][item]['0'] = total;
		});
	});
	user.Inventory = inv; return user;
}

/**--IMAGES-- */
function preloadImages() {
	Object.entries(myStorage.get('DB').DB_Master).forEach(([category, items]) => {
		Object.entries(items).forEach(([item, materials]) => {
			Object.entries(materials).forEach(([rank, link]) => {
				if (link.includes('/') && !link.includes('*')) {
					(new Image()).src = 'https://' + link;
				}
			})
		})
	})
}

/**
function preloadImages(array) {
		if (!preloadImages.list) {
				preloadImages.list = [];
		}
		var list = preloadImages.list;
		for (var i = 0; i < array.length; i++) {
				var img = new Image();
				img.onload = function() {
						var index = list.indexOf(this);
						if (index !== -1) {
								// remove image from the array once it's loaded
								// for memory consumption reasons
								list.splice(index, 1);
						}
				}
				list.push(img);
				img.src = array[i];
		}
}

preloadImages(["url1.jpg", "url2.jpg", "url3.jpg"]);
 */

/**--SETTERS-- */
// form.addEventListener('submit', saveUser)
function saveUser(e) {
	e.preventDefault()
	let form = document.getElementById('header__form')
	fetch(document.URL, {
		method: "POST",
		body: JSON.stringify({
			data: form.querySelector('#id_data').value,
			csrfmiddlewaretoken: form.querySelector('input[name=csrfmiddlewaretoken]').value
		}),
		headers: {
			"Content-type": "application/json; charset=UTF-8"
		}
	})
  .then(function(response) {
		console.log("GOOD", response)
  })
  .catch(function(response) {
    console.log("BAD", response)
  })
	//Idea compare with user context for difference
	//check if django has success return or smtg
	//Posibly using form
}

/**--ALERT-- */
function toast(message) {
	let TOAST = document.getElementById('dialog');
	if (!TOAST.open) TOAST.showModal()
	const MSG = create(TOAST, 'div', { 'class': 'alert__msg' });
	MSG.textContent = message;
}

let timer;
function toasty(message) {
	let TOAST = document.getElementById('alerty');
	if (!TOAST) TOAST = create(document.body, 'div', { 'id': 'alerty', 'class': 'alert alerty' });
	const MSG = create(TOAST, 'div', { 'class': 'alert__msg' });
	MSG.textContent = message;
	clearTimeout(timer);
	timer = setTimeout(() => TOAST.remove(), 1000)
	setTimeout(() => MSG.remove(), 1000)
}


/**--OLD-- */
function setter(string, query) {
	let store = JSON.stringify(myStorage.get('cache' + string[0]));
	console.log(string, store);
	if (store == 'null') {
		toasty(`No ${string} to Save`); return;
	}
	toast('Saving ' + string); server(query + '&cord=' + store);
}

function setInv() {
	setter('Inventory', 'setInv=handleInv&user=' + myStorage.get('code'));
}

function setChar() {
	setter('Characters', 'setChar=handleChar&user=' + myStorage.get('code'));
}

function setWpn() {
	setter('Weapons', 'setWpn=handleWpn&user=' + myStorage.get('code'));
}

//handlers
function handleInv() {
	toast('Saved Inventory'); myStorage.set('cacheI', null);
}

function handleChar() {
	toast('Saved Characters'); myStorage.set('cacheC', null);
}

function handleWpn() {
	toast('Saved Weapons'); myStorage.set('cacheW', null);
}
