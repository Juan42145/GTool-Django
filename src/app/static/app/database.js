/**--GLOBAL VARIABLES */
const myStorage = localStorage;
const mainDownload = Promise.all([loadMaster(),loadImages(),loadStatic()])

/**--STORAGE-- */
function set(key, obj){myStorage.setItem(key, JSON.stringify(obj))}
function get(key){return JSON.parse(myStorage.getItem(key))}
function has(key){return get(key) !== null}
function reset(){myStorage.clear()}

/**--STORAGE VARIABLES-- */
function setTotals(totals){set('totals', totals)}
function getTotals(){return get('totals')}

function setPivot(pivot){set('pivot', pivot)}
function getPivot(){return get('pivot')}

function setCalculator(calculator){set('calculator', calculator)}
function getCalculator(){return get('calculator')}

function setCalc(calc){set('calc', calc)}
function getCalc(){return get('calc')}
function hasCalc(){return has('calc')}

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

		'ELEMENT': 'ELEMENTS',
		'WEAPON_TYPE': 'WEAPON_TYPES',
		'MODEL': 'MODELS',
		'REGION': 'REGIONS',
		'WEEKLY_BOSS': 'WEEKLY_BOSSES',
		'STAT': 'STATS',
	}
	return category in dict? dict[category]: category;
}

function converge(category){
	return category == 'ELITE' || category == 'COMMON'? 'ENEMIES': category
}

function translate(category){return converge(toPlural(category))}

//**DATA PROCESSING */
function generateTotals(user) {
	//Calculate totals using DBM and values from user inventory
	let DBM = loadMaster()
	let totals = {}
	invCategories.forEach((iCategory) => {
		Object.entries(DBM[iCategory]).forEach(([mItem, mMaterials]) => {
			let iMaterials = userGet(user.INVENTORY, [iCategory,mItem], {})
			let [counter, total] = calcTotals(mMaterials, iMaterials)
			if (counter > 1) userSet(totals, [iCategory, mItem], total);
		});
	});	
	setTotals(totals)
}

function calcTotals(mMaterials, iMaterials){
	//Iterate over DBM materials and fill with user values
	let counter = 0, total = 0;
	Object.keys(mMaterials).reverse().forEach((rank) => {
		value = userGet(iMaterials, rank, 0)
		total += value / (3 ** counter); counter++;
	});
	return [counter, total]
}

/**--USER CLIENT STORAGE */
function storeUser(user) {set('user', user)}

function loadUser() {
	if (has('user')) return get('user')
	else {
		const USER_DATA = JSON.parse(document.getElementById('json_user_data').textContent)
		getOrCreate(USER_DATA, 'INVENTORY')
		getOrCreate(USER_DATA, 'CHARACTERS')
		getOrCreate(USER_DATA, 'WEAPONS')
		set('user', USER_DATA)
		generateTotals(USER_DATA)
		return USER_DATA
	}
}

function getOrCreate(object, property, defaultValue={}){
	if (!object[property]) object[property] = defaultValue
	return object[property]
}

function userSet(userObject, path, value){
	let cur = userObject
	lastProp = path.pop()
	path.forEach(property => cur = getOrCreate(cur, property))
	cur[lastProp] = value
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
	const USER_DATA = JSON.parse(document.getElementById('json_user_data').textContent)
	user = get('user')
	if (JSON.stringify(user) === JSON.stringify(USER_DATA)){
		toasty('Nothing to Save')
		return
	}
	console.log('Saving')
	request('/api/profile/'+USER_ID,{
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: JSON.stringify({
			data: user
		})
	}).then(() => toast('Saved'))
}

/**--LOAD-- */
function loader(url, key){
	return has(key)? get(key): 
	request(url).then(data => {
		console.log('Loaded', key)
		set(key, data)
		return data
	})
}

function loadStatic(){return loader('/api/constant','DB_Static')}
function loadMaster(){return loader('/api/master','DB_Master')}
function loadCharacters(){return loader('/api/character','DB_Characters')}
function loadWeapons(){return loader('/api/weapon','DB_Weapons')}
function loadImages(){return loader('/api/image','DB_Images')}
