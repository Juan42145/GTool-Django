/**--GLOBAL FUNCTIONS-- */
window.addEventListener('load',()=>{
	makeResinDialog()
})

//Create HTML Element
function create(parent, element, attr) {
	const E = document.createElement(element); parent.append(E);
	if (!attr) return E;
	Object.entries(attr).forEach(([attribute, value]) => {
		E.setAttribute(attribute, value);
	})
	return E;
}

//Insert for creation of new pages (potential remove)
function insert(url) {
	const INSERT = document.getElementById('insert')
	fetch(url).then(res => res.text()).then(data => { INSERT.innerHTML = data })
}

//Focus Input
function focusText(e) {
	e.target.setSelectionRange(e.target.value.length, e.target.value.length);
}

/**--IMAGES-- */
function getImageLink(name, text = ''){
	let imageObj = CONTEXT.IMAGE[name]
	// if (imageObj.format && typeof imageObj.format[0] === 'string'){

	// }
	if (text && imageObj.format) {
		imageObj.format.forEach((format)=>{
			if(Array.isArray(format)){
				[pattern,replacement] = format
				text = text.replaceAll(pattern, replacement)
			} else{
				console.log(format)
			}
		})
	}
	return 'https://' + imageObj.url.replace('*', text);
}

function getImage(category, item, rank) {
	if (item === '') return getError();
	return getImageLink(category, CONTEXT.DB.MASTER[category][item][rank]);
}

function getCharacter(name, full = false) {
	let id = 'CHARACTER'
	id += full? '_BANNERS': 'S';
	return getImageLink(id, name)
}

function getWeapon(name) {
	return getImageLink('WEAPONS', name)
}

function setError(element) {
	element.onerror = () => element.src = getError();
}

function getError() {
	return getImageLink('ERROR');
}

/**--NAVBAR-- */
function openNav() {
	const NAV = document.getElementById('nav');
	NAV.style.width = '100%'; NAV.style.left = '0';
}

function closeNav() {
	const NAV = document.getElementById('nav');
	NAV.style.width = '0'; NAV.style.left = '-1rem';
}

function makeResinDialog() {
	const results = document.getElementById('resin-results')
	const input = document.getElementById('resin-input')
	input.addEventListener('input', () => {
		results.innerHTML = '';
		let v = +input.value;
		resinCalc(results, v, 'init')
		while (v >= 40) {
			resinCalc(results, v - 20, 'end')
			v -= 40;
			resinCalc(results, v, 'loop')
		}
		if (v >= 20) {
			v -= 20;
			resinCalc(results, v, 'end')
		}
	}, false);
}

function resinCalc(CONT, value, type) {
	let d = new Date();
	if (value < 160) d.setMinutes(d.getMinutes() + 8 * (159 - value))
	let day = (new Date()).getDay() == d.getDay() ? 'Today' : 'Tomorrow';
	let time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

	const resin = create(CONT, 'div', { 'class': 'resc resc--' + type })
	resin.innerHTML = value
	const full = create(CONT, 'div', { 'class': 'resc resc--' + type })
	full.innerHTML = day + ' ' + time
}

/**--TOOLTIP-- */
var tooltip = function () {
	var id = 'tt'; var dy = 3; var dx = 3; var maxw = 300; var tt, c, h, w;
	return {
		show: function (v) {
			if (tt == null) {
				tt = document.createElement('div'); tt.setAttribute('id', id);
				c = document.createElement('div'); c.setAttribute('id', id + 'cont');
				tt.appendChild(c); document.body.appendChild(tt);
			}
			tt.style.display = 'block'; tt.style.width = 'auto'; tt.style.opacity = 1;
			c.innerHTML = v; document.onmousemove = this.pos;
			if (tt.offsetWidth > maxw) tt.style.width = maxw + 'px'
			h = parseInt(tt.offsetHeight) + dy;
			w = parseInt(tt.offsetWidth) + dx;
		},
		pos: function (e) {
			var u = e.pageY; var l = e.pageX;
			tt.style.top = e.pageY < h ? (u + dy) + 'px' : (u - h) + 'px';
			tt.style.left = e.pageX > window.innerWidth - w ? (l - w) + 'px' : (l + dx) + 'px';
		},
		hide: function () {
			tt.style.opacity = 0; document.onmousemove = null;
		}
	};
}();

//UNDER GOES ON DATA

/**--INVENTORY-- */
//CHECK
function recalculate(category, item) {
	let counter = 0, total = 0;
	Object.entries(userInv[category][item]).reverse().forEach(([rank, value]) => {
		if (value === '*' || rank === 'ROW' || rank === '0') return
		total += value / (3 ** counter); counter++;
	});
	if (counter > 1) {
		let totalInv = document.getElementById('I_' + item)
		if (totalInv) totalInv.textContent = Math.floor(total).toLocaleString('en-us')
		userInv[category][item][0] = total;
	}
}

/**--DICTIONARIES-- */
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

/**--CALC DATA-- */
let calcPivot
const DB = CONTEXT.DB;
const CALCDATA = CONTEXT.STATIC.calculation_data

function calculate() {
	let calculator = {
		'CHARACTERS': {},
		'WEAPONS': {},
	};

	calcPivot = {
		'BOOKS': {},
		'TROPHIES': {},
		'RESOURCES': {},
		'GEMS': {},
		'WEEKLY_DROPS': {},
		'ELITE': {},
		'BOSSES': {},
		'COMMON': {},
		'LOCAL_SPECIALTIES': {}
	};

	Object.entries(user.Characters).forEach(([character, state]) => {
		if (!state.FARM) return;
		const info = DB.CHARACTERS[character];
		const ascension = [+state.PHASE, +state.TARGET];
		const talent = [
			[+state.NORMAL, +state.TNORMAL],
			[+state.SKILL, +state.TSKILL],
			[+state.BURST, +state.TBURST]
		];
		calculator.CHARACTERS[character] = {
			ELEMENT: info.ELEMENT,
			AFARM: calcCharA(info, ascension, true),
			TFARM: calcCharT(info, talent, true)
		}
	})

	Object.entries(user.Weapons).forEach(([weapon, state]) => {
		if (!state.FARM) return;
		const info = DB.WEAPONS[weapon];
		const phase = [+state.PHASE, +state.TARGET];
		calculator.WEAPONS[weapon] = {
			RARITY: info.RARITY,
			FARM: calcWpn(info, phase, true)
		}
	})

	myStorage.set('pivot', calcPivot);
	myStorage.set('calculator', calculator);
	myStorage.set('calc', false);
}

function calcCharA(info, ascension, rollToPivot) {
	return {
		GEM: [info.ELEMENT, calcA('GEM', ascension, info.ELEMENT, rollToPivot)],
		BOSS: [info.BOSS, calcA('BOSS', ascension, info.BOSS, rollToPivot)],
		LOCAL_SPECIALTY: [info.LOCAL, calcA('LOCAL_SPECIALTY', ascension, info.LOCAL_SPECIALTY, rollToPivot)],
		COMMON: [info.COMMON, calcA('COMMON', ascension, info.COMMON, rollToPivot)],
		EXP: ['EXP', calcA('EXP', ascension, 'EXP', rollToPivot)],
		MORA: ['Mora', calcA('MORA', ascension, 'Mora', rollToPivot)],
	}
}
function calcCharT(info, talent, rollToPivot) {
	let wb = info['WEEKLY BOSS'] + ' ' + info.WEEKLY;
	return {
		BOOK: [info.BOOK, calcT('BOOK', talent, info.BOOK, rollToPivot)],
		COMMON: [info.COMMON, calcT('COMMON', talent, info.COMMON, rollToPivot)],
		WEEKLY: [wb, calcT('WEEKLY', talent, wb, rollToPivot)],
		MORA: ['Mora', calcT('MORA', talent, 'Mora', rollToPivot)],
	}
}
function calcWpn(info, phase, rollToPivot) {
	return {
		TROPHY: [info.TROPHY, calcW('TROPHY', phase, info.TROPHY, info.RARITY, rollToPivot)],
		ELITE: [info.ELITE, calcW('ELITE', phase, info.ELITE, info.RARITY, rollToPivot)],
		COMMON: [info.COMMON, calcW('COMMON', phase, info.COMMON, info.RARITY, rollToPivot)],
		ORE: ['Ore', calcW('ORE', phase, 'Ore', info.RARITY, rollToPivot)],
		MORA: ['Mora', calcW('MORA', phase, 'Mora', info.RARITY, rollToPivot)],
	}
}

function calcA(category, [phase, target], item, rollToPivot) {
	let error = [phase, target].some(i => { return i < 0 || i > 7 });
	if (error || phase >= target) return;
	let p = phase ? CALCDATA.ASCENSION[category][phase] : 0;
	let t = CALCDATA.ASCENSION[category][target];
	const value = vsub(t, p);
	if (rollToPivot) rollup(category, item, value);
	return value;
}

function calcT(category, talent, item, rollToPivot) {
	let error = talent.some(t => { return t.some(i => { return i < 0 || i > 10; }) });
	if (error || (!talent[0][1] && !talent[1][1] && !talent[2][1])) return;
	let v = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		if (talent[i][0] < talent[i][1]) {
			let c = talent[i][0] > 1 ? CALCDATA.TALENT[category][talent[i][0]] : 0;
			let t = talent[i][1] > 1 ? CALCDATA.TALENT[category][talent[i][1]] : 0;
			v[i] = vsub(t, c);
		}
	}
	const value = vadd(v[0], v[1], v[2]);
	if (rollToPivot) rollup(category, item, value);
	return value;
}

function calcW(category, [phase, target], item, rarity, rollToPivot) {
	let error = [phase, target].some(i => { return i < 0 || i > 7 });
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[rarity + 'WEAPON'][category][phase] : 0;
	let t = CALCDATA[rarity + 'WEAPON'][category][target];
	const value = vsub(t, p);
	if (rollToPivot) rollup(category, item, value);
	return value;
}

function rollup(category, item, value) {
	let flag = Object.values(value).some(v => {
		return v !== 0;
	});
	let name = toPlural(category);
	if (flag) calcPivot[name][item] = item in calcPivot[name] ?
		vadd(calcPivot[name][item], value) : value;
}

function vadd(...objs) {
	return objs.reduce((a, b) => {
		for (let k in b) {
			if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k];
		}
		return a;
	}, {});
}

function vsub(a, b) {
	return Object.keys(a).reduce((r, i) => {
		r[i] = a[i] - (b[i] || 0);
		return r;
	}, {});
}
