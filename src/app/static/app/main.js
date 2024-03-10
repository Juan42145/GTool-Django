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
	let imageObj = loadImages()[name]
	// if (imageObj.FORMAT && typeof imageObj.FORMAT[0] === 'string'){

	// }
	if (text && imageObj.FORMAT) {
		imageObj.FORMAT.forEach((format)=>{
			if(Array.isArray(format)){
				[pattern,replacement] = format
				text = text.replaceAll(pattern, replacement)
			} else{
				console.log('nonformat: ',format)
			}
		})
	}
	return 'https://' + imageObj.URL.replace('*', text);
}

function getImage(category, item, rank) {
	if (item === '') return getError();
	const DBM = loadMaster()
	return getImageLink(category, DBM[category][item][rank]);
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

/**--CALC DATA-- */
let calcPivot
function calculate() {
	const DBC = loadCharacters()
	const DBW = loadWeapons()
	let user = loadUser()
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

	Object.entries(user.CHARACTERS).forEach(([character, state]) => {
		if (!state.FARM) return;
		const info = DBC[character];
		const ascension = [+state.PHASE, +state.TARGET];
		const talent = [
			[+state.NORMAL, +state.TNORMAL],
			[+state.SKILL, +state.TSKILL],
			[+state.BURST, +state.TBURST]
		];
		calculator.CHARACTERS[character] = {
			ELEMENT: info.ELEMENT,
			AFARM: calcCharA(info, ascension),
			TFARM: calcCharT(info, talent)
		}
	})

	Object.entries(user.WEAPONS).forEach(([weapon, state]) => {
		if (!state.FARM) return;
		const info = DBW[weapon];
		const phase = [+state.PHASE, +state.TARGET, info.RARITY];		
		calculator.WEAPONS[weapon] = {
			RARITY: info.RARITY,
			FARM: calcWpn(info, phase)
		}
	})

	myStorage.set('pivot', calcPivot);
	myStorage.set('calculator', calculator);
	myStorage.set('calc', false);
}

/**--COST CALCULATORS-- */
function calcCharA(info, ascension, rollToPivot) {
	props = {
		GEM: info.ELEMENT,
		BOSS: info.BOSS,
		LOCAL_SPECIALTY: info.LOCAL_SPECIALTY,
		COMMON: info.COMMON,
		EXP: 'EXP',
		MORA: 'Mora',
	}
	return generateCosts(props, calcA, ascension, rollToPivot)
}
function calcCharT(info, talent, rollToPivot) {
	props = {
		BOOK: info.BOOK,
		COMMON: info.COMMON,
		WEEKLY: info['WEEKLY BOSS'] + ' ' + info.WEEKLY,
		MORA: 'Mora',
	}
	return generateCosts(props, calcT, talent, rollToPivot)
}
function calcWpn(info, phase, rollToPivot) {
	props = {
		TROPHY: info.TROPHY,
		ELITE: info.ELITE,
		COMMON: info.COMMON,
		ORE: 'Ore',
		MORA: 'Mora',
	}
	return generateCosts(props, calcW, phase, rollToPivot)
}

function generateCosts(props, calcFunc, data, rollToPivot = true) {
	let costs = {}
	Object.entries(props).forEach(([key,item])=>{
		let value = calcFunc(key, data)
		costs[key] = [item, value]
		if(value && rollToPivot) rollup(key, item, value)
	})
	return costs
}

/**--DATA CALCULATORS-- */
function calcA(category, [phase, target]) {
	const CALCDATA = loadStatic().calculation_data.ASCENSION[category]
	let error = [phase, target].some(i => { return i < 0 || i > 7 });
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[phase] : 0;
	let t = CALCDATA[target];
	const value = vsub(t, p);
	return value;
}

function calcT(category, talent) {
	const CALCDATA = loadStatic().calculation_data.TALENT[category]
	let error = talent.some(t => { return t.some(i => { return i < 0 || i > 10; }) });
	if (error || (!talent[0][1] && !talent[1][1] && !talent[2][1])) return;
	let v = [0, 0, 0];
	for (let i = 0; i < 3; i++) {
		if (talent[i][0] < talent[i][1]) {
			let c = talent[i][0] > 1 ? CALCDATA[talent[i][0]] : 0;
			let t = talent[i][1] > 1 ? CALCDATA[talent[i][1]] : 0;
			v[i] = vsub(t, c);
		}
	}
	const value = vadd(v[0], v[1], v[2]);
	return value;
}

function calcW(category, [phase, target, rarity]) {	
	const CALCDATA = loadStatic().calculation_data[rarity + 'WEAPON'][category]
	let error = [phase, target].some(i => { return i < 0 || i > 7 });
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[phase] : 0;
	let t = CALCDATA[target];
	const value = vsub(t, p);
	return value;
}

/**--PIVOT-- */

function rollup(category, item, value) {
	let flag = Object.values(value).some(v => {
		return v !== 0;
	});
	let name = toPlural(category);
	if (flag) calcPivot[name][item] = item in calcPivot[name] ?
		vadd(calcPivot[name][item], value) : value;
}

/**--VECTOR FUNCTIONS-- */

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
