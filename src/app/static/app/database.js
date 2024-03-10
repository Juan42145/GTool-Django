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

/**--DICTIONARIES-- */
const invCategories = [
	'RESOURCES',
	'ENEMIES',
	'WEEKLY_DROPS',
	'BOSSES',
	'GEMS',
	'BOOKS',
	'TROPHIES',
	'LOCAL_SPECIALTIES',
]

function toPlural(category) {
	let dict = {
		'BOOK': 'BOOKS',
		'TROPHY': 'TROPHIES',
		'EXP': 'RESOURCES',
		'MORA': 'RESOURCES',
		'ORE': 'RESOURCES',
		'GEM': 'GEMS',
		'WEEKLY_DROP': 'WEEKLY_DROPS',
		'ELITE': 'ELITE',
		'BOSS': 'BOSSES',
		'COMMON': 'COMMON',
		'LOCAL_SPECIALTY': 'LOCAL_SPECIALTIES',
	}
	return category in dict? dict[category]: category;
}

function converge(category){
	return category == 'ELITE' || category == 'COMMON'? 'ENEMIES': category;
}

function translate(category){
	return converge(toPlural(category))
}

//**DATA PROCESSING */
function processTotals(user) {
	//Calculate totals using user inventory is it exist otherwise use DB and fill with 0
	let DBM = loadMaster()
	let totals = {}
	invCategories.forEach((category) => {
		Object.entries(DBM[category]).forEach(([item, materials]) => {
			let counter, total = 0
			let inv = userGet(user, ['INVENTORY',category,item])
			if (inv !== undefined) [counter, total] = getTotals(inv)
			else counter = Object.keys(materials).length			
			if (counter > 1) userSet(totals, [category, item], total);
		});
	});	
	storeTotals(totals)
}

function getTotals(materials){
	let counter = 0, total = 0;
	Object.values(materials).reverse().forEach((value) => {
		total += value / (3 ** counter); counter++;
	});
	return [counter, total]
}

/**--USER CLIENT STORAGE */
function storeUser(user) {
	myStorage.set('user', user);
}

function storeTotals(totals) {
	myStorage.set('totals', totals);
}

function loadUser() {
	if (myStorage.has('user')) return myStorage.get('user')
	else {
		const USER_DATA = JSON.parse(document.getElementById('json_user_data').textContent)
		myStorage.set('user', USER_DATA)
		processTotals(USER_DATA)
		return USER_DATA
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

function userGet(userObject, path, defaultValue){
	let cur = userObject
	for (property of path){
		cur = cur[property]
		if (cur == undefined) return defaultValue 
	}
	return cur
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
