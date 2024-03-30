"use strict";
/**--GLOBAL VARIABLES-- */
const myStorage = localStorage;
const mainDownload = Promise.all([loadMaster(), loadImages()])

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
const INV_CATEGORIES = [
	'RESOURCES',
	'ENEMIES',
	'WEEKLY_DROPS',
	'BOSSES',
	'GEMS',
	'BOOKS',
	'TROPHIES',
	'LOCAL_SPECIALTIES',
]

function toPlural(category){
	const DICT = {
		'BOOK': 'BOOKS',
		'TROPHY': 'TROPHIES',
		'EXP': 'RESOURCES',
		'MORA': 'RESOURCES',
		'ORE': 'RESOURCES',
		'GEM': 'GEMS',
		'WEEKLY_DROP': 'WEEKLY_DROPS',
		'BOSS': 'BOSSES',
		'LOCAL_SPECIALTY': 'LOCAL_SPECIALTIES',

		'ELEMENT': 'ELEMENTS',
		'WEAPON_TYPE': 'WEAPON_TYPES',
		'MODEL': 'MODELS',
		'REGION': 'REGIONS',
		'WEEKLY_BOSS': 'WEEKLY_BOSSES',
		'STAT': 'STATS',
	}
	return category in DICT ? DICT[category] : category;
}

function converge(category){
	return category == 'ELITE' || category == 'COMMON' ? 'ENEMIES' : category
}

function decode(category, item){
  return ['WEEKLY_DROP', 'WEEKLY_DROPS'].includes(category) ?
		item.split(' ')[1] : item;
}

function translate(category){return converge(toPlural(category))}

//**--DATA PROCESSING-- */
function generateTotals(user){
	//Calculate totals using DBM and values from user inventory
	const DBM = loadMaster()
	let totals = {}
	let weeklyTotals = uGet({}, 0)
	INV_CATEGORIES.forEach((iCategory) => {
		Object.entries(DBM[iCategory]).forEach(([mItem, mMaterials]) => {
			let iMaterials = user.INVENTORY?.[iCategory]?.[mItem]
			let [counter, total] = calcTotals(mMaterials, iMaterials)
			if (iCategory === 'WEEKLY_DROPS'){
				weeklyTotals[mMaterials.data] += total
			}
			else if (counter > 1) uSet(totals, [iCategory,mItem], total);
		});
	});	
	totals.WEEKLY_BOSSES = weeklyTotals
	setTotals(totals)
}

function calcTotals(mMaterials, iMaterials){
	//Iterate over DBM materials and fill with user values
	let counter = 0, total = 0;
	Object.keys(mMaterials).reverse().forEach((rank) => {
		if (isNaN(rank)) return
		const uValue = iMaterials?.[rank] ?? 0
		total += uValue/(3**counter); counter++;
	});
	return [counter, total]
}

/**--USER CLIENT STORAGE-- */
function storeUserC(user, userC){user.CHARACTERS = userC; set('user', user)}
function storeUserW(user, userW){user.WEAPONS = userW; set('user', user)}
function storeUserI(user, userI){user.INVENTORY = userI; set('user', user)}

function loadUser(){
	if (has('user')) return get('user')
	else{
		const USER_DATA =
			JSON.parse(document.getElementById('json_user_data').textContent)
		set('savedUser', USER_DATA)
		getOrCreate(USER_DATA, 'INVENTORY')
		getOrCreate(USER_DATA, 'CHARACTERS')
		getOrCreate(USER_DATA, 'WEAPONS')
		set('user', USER_DATA)
		generateTotals(USER_DATA)
		return USER_DATA
	}
}

function getOrCreate(object, property, defaultValue = {}){
	if (!object[property]) object[property] = defaultValue
	return object[property]
}

function uSet(userObject, path, value){
	let cur = userObject
	const lastProp = path.pop()
	path.forEach(property => cur = getOrCreate(cur, property))
	cur[lastProp] = value
}

function uGet(obj, defaultValue){
	//Return default dict object
	if (obj === undefined) obj = {}
	return new Proxy(obj, {
		get(target, key){
			return key in target ? target[key] : defaultValue
		}
	})
}

/**--ALERT-- */
function toast(message){
	const Toast = document.getElementById('dialog');
	if (!Toast.open) Toast.showModal()
	/*Message*/createTxt(Toast, 'div', {'class':'alert__msg'}, message);
}

let toastTimer;
function toasty(message){
	let Toast = document.getElementById('alerty');
	if (!Toast)
		Toast = create(document.body, 'div', {'id':'alerty', 'class':'alert'})
	const Message = createTxt(Toast, 'div', {'class':'alert__msg'}, message);
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => Toast.remove(), 1000)
	setTimeout(() => Message.remove(), 1000)
}

/**--DATABASE-- */
async function request(url, context = undefined){
	console.log('request ', url)
	return await fetch(url+'/', context)
	.then(res => res.json())
	.catch(e => {
		console.log('error', e)
	})
}

/**--SAVE-- */
function getCookie(name){
	let cookieValue = null;
	if (document.cookie && document.cookie !== ''){
		const cookies = document.cookie.split(';');
		for (let i = 0; i < cookies.length; i++){
			const cookie = cookies[i].trim();
			// Does this cookie string begin with the name we want?
			if (cookie.substring(0, name.length + 1) === (name+'=')){
				cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
				break;
			}
		}
	}
	return cookieValue;
}

function saveUser(){
	const user = get('user')
	if (JSON.stringify(user) === myStorage.getItem('savedUser')){
		//Use default getter to get stringify data
		toasty('Nothing to Save')
		return
	}
	const USER_ID = JSON.parse(document.getElementById('json_user_id').textContent)
	console.log('Saving')
	request('/api/profile/'+USER_ID, {
		method: "PATCH",
		headers: {
			"Content-Type": "application/json",
			'X-CSRFToken': getCookie('csrftoken')
		},
		body: JSON.stringify({data:user})
	}).then((profile) => {
		toast('Saved')
		set('savedUser', profile.data)
	})
}

/**--LOAD-- */
function loader(url, key){
	return has(key) ? get(key) :
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
