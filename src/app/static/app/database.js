/**--STORAGE-- */
Storage.prototype.set = function (key, obj) {
	return this.setItem(key, JSON.stringify(obj));
}

Storage.prototype.get = function (key) {
	return JSON.parse(this.getItem(key));
}

Storage.prototype.has = function (key) {
	return this.get(key) !== null;
}

/**--GLOBAL VARIABLES */
const myStorage = localStorage;
const mainDownload = Promise.all([loadMaster(),loadImages(),loadStatic()])

// Initialize calc
if (!myStorage.has('calc')) {
	console.log('not calc in cache')
	myStorage.set('calc', true);
}

/**--DATABASE-- */
async function request(url, context = undefined){
	console.log('request ', url)
	return await fetch(url+'/',context)
	.then(res => res.json())
	.catch(e=>{
		console.log('error', e)
	})
}

/**--SAVE-- */
function getCookie(name) {
	let cookieValue = null;
	if (document.cookie && document.cookie !== '') {
			const cookies = document.cookie.split(';');
			for (let i = 0; i < cookies.length; i++) {
					const cookie = cookies[i].trim();
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) === (name + '=')) {
							cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
							break;
					}
			}
	}
	return cookieValue;
}

function saveUser(){
	const USER_ID = JSON.parse(document.getElementById('json_user_id').textContent)
	user = myStorage.get('user')
	alert('Saving')
	request('/api/profile/'+USER_ID,{
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: JSON.stringify({
			data: user.data
		})
	}).then(data => alert('Saved'))
}

/**--LOAD-- */
function loader(url, key){
	return myStorage.has(key)? myStorage.get(key): 
	request(url).then(data => {
		console.log('Loaded', key)
		myStorage.set(key, data)
		return data
	})
}

function loadStatic(){return loader('/api/constant','DB_Static')}
function loadMaster(){return loader('/api/master','DB_Master')}
function loadCharacters(){return loader('/api/character','DB_Characters')}
function loadWeapons(){return loader('/api/weapon','DB_Weapons')}
function loadImages(){return loader('/api/image','DB_Images')}

/**--USER CLIENT STORAGE */
function storeUser(user) {
	myStorage.set('user', user);
}

function loadUser() {
	if (myStorage.has('user')) return myStorage.get('user')
	else {
		const USER_DATA = JSON.parse(document.getElementById('json_user_data').textContent)
		return processInventory(USER_DATA)
	}
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
	user.INVENTORY = inv; return user;
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
