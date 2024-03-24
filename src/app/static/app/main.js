"use strict";
/**--GLOBAL FUNCTIONS-- */
function setup(){
	let promises = [mainDownload]
	for (let arg of arguments){promises.push(arg)}

	window.addEventListener('load',() => {
		Promise.all(promises).then(() => {
			pageLoad()
		})
	})
}

window.addEventListener('load',() => {
	makeResinDialog()
	if (!hasCalc()){
		console.log('not calc in cache')
		setCalc(true)
	}
})

/**--CUSTOM FUNCTION-- */
function create(parent, element, attributes){
	//Create HTML Element
	const Element = document.createElement(element); parent.append(Element);
	if (!attributes) return Element;
	Object.entries(attributes).forEach(([attribute, value]) => {
		Element.setAttribute(attribute, value);
	})
	return Element;
}

function createImg(parent, cls, src){
	const Element = create(parent, 'img', {'class':cls, 'src':src})
	setError(Element)
	return Element
}

function createTxt(parent, element, attributes, text){
	const Element = create(parent, element, attributes)
	Element.textContent = text;
	return Element
}

function createNumInput(parent, attributes, value){
	Object.assign(attributes, {'type':'text', 'pattern':'\\d*', 'value':value})
	const Element = create(parent, 'input', attributes)
	Element.addEventListener('focus', (e) => {focusInput(e)})
	return Element
}

function focusInput(e){
	//Focus input at end and convert to empty string if 0/fasly
	if (!+e.target.value) e.target.value = '';
	e.target.setSelectionRange(e.target.value.length, e.target.value.length);
}

/**--INVENTORY-- */
function processTotals(category, item){
	let mItems = loadMaster()[category]
	let iItems = loadUser().INVENTORY?.[category]
	let mMaterials = mItems[item]
	let iMaterials = iItems?.[item]
	let [counter, total] = calcTotals(mMaterials,iMaterials)
	if (category === 'WEEKLY_DROPS'){
		let totals = getTotals()
		let weeklyTotal = Object.entries(mItems)
											.filter(([_, wkdMats]) => wkdMats.data === mMaterials.data)
											.reduce((acc, [wkdItem, _]) => {
												return acc + iItems?.[wkdItem]?.[5] ?? 0
											}, 0)
		totals.WEEKLY_BOSSES[mMaterials.data] = weeklyTotal
		setTotals(totals)
	}
	else if (counter > 1){
		const Total = document.getElementById('I_'+item)
		if (Total) Total.textContent = Math.floor(total).toLocaleString('en-us')
		let totals = getTotals()
		totals[category][item] = total;
		setTotals(totals)
	}
}

/**--IMAGES-- */
function getImageLink(group, text = ''){
	//Exceptions
	if (group === "ELEMENTS" && text === "-") group = "TRAVELER_EXCEPTION"

	const image = loadImages()[group]
	if (image.FORMAT && typeof image.FORMAT[0] === 'string'){
		const method = image.FORMAT.shift()
		if (method === "lowercase") text = text.toLowerCase()
	}
	if (text && image.FORMAT){
		image.FORMAT.forEach((format) => {
			if (Array.isArray(format)){
				const [pattern, replacement] = format
				text = text.replaceAll(pattern, replacement)
			} else{
				console.log('nonformat: ', format)
			}
		})
	}
	return 'https://'+image.URL.replace('*', text);
}

function getImage(category, item, rank){
	if (!item) return getError();
	const DBM = loadMaster()
	if (rank === undefined)
		rank = Object.keys(DBM[category][item]).reduce((key, v) => v < key ? v : key)
	return getImageLink(category, DBM[category][item][rank]);
}

function getCharacter(name, full = false){
	let group = 'CHARACTER'
	group += full ? '_BANNERS' : 'S';
	return getImageLink(group, name)
}

function getWeapon(name){
	return getImageLink('WEAPONS', name)
}

function setError(element){
	element.onerror = () => element.src = getError();
}

function getError(){
	return getImageLink('ERROR');
}

/**--NAVBAR-- */
function openNav(){
	const Nav = document.getElementById('nav');
	const Backdrop = Nav.querySelector('#backdrop')
	Nav.style.width = '90%';
	Backdrop.classList.add('backdrop')
}

function closeNav(){
	const Nav = document.getElementById('nav');
	const Backdrop = Nav.querySelector('#backdrop')
	Nav.style.width = null;
	Backdrop.classList.remove('backdrop')
}

function makeResinDialog(){
	const Results = document.getElementById('resin-results')
	const Input = document.getElementById('resin-input')
	Results.innerHTML = '';
	let value = Input.value > 160 ? 160 : +Input.value
	calcResin(Results, value, 'init')
	const baseline = value
	while (value >= 10){
		value -= 10
		let tag = (baseline - value) % 40
		if (tag === 30) tag = 10
		else if (tag === 0) tag = 40
		calcResin(Results, value, tag)
	}
}

function calcResin(Element, value, type){
	const date = new Date();
	if (value < 160) date.setMinutes(date.getMinutes() + 8*(159 - value))
	const day = (new Date()).getDay() == date.getDay() ? 'Today' : 'Tomorrow';
	const time = date.toLocaleTimeString([], {hour:"numeric", minute:"2-digit"})

	const ResinCalc = create(Element, 'div',
		{'class':'resin__calc resin__calc--'+type})
	createTxt(ResinCalc, 'div', {'class':'resin__value'}, value)
	createTxt(ResinCalc, 'div', {}, day+' '+time)
}

/**--TOOLTIP-- */
function makeTooltip(Element, content){
  Element.addEventListener('mouseover', () => tooltip.show(content))
  Element.addEventListener('mouseout', () => tooltip.hide())
}

var tooltip = function(){
	var id = 'tt'; var dy = 3; var dx = 3; var maxw = 300; var tt, c, h, w;
	return {
		show: function(v){
			if (tt == null){
				tt = document.createElement('div'); tt.setAttribute('id', id);
				c = document.createElement('div'); c.setAttribute('id', id+'cont');
				tt.appendChild(c); document.body.appendChild(tt);
			}
			tt.style.display = 'block'; tt.style.width = 'auto'; tt.style.opacity = 1;
			c.innerHTML = v; document.onmousemove = this.pos;
			if (tt.offsetWidth > maxw) tt.style.width = maxw+'px'
			h = parseInt(tt.offsetHeight) + dy;
			w = parseInt(tt.offsetWidth) + dx;
		},
		pos: function(e){
			var u = e.pageY; var l = e.pageX;
			tt.style.top = e.pageY < h ? (u + dy)+'px' : (u - h)+'px';
			tt.style.left = e.pageX > window.innerWidth - w ?
				(l - w)+'px' : (l + dx)+'px'
		},
		hide: function(){
			tt.style.opacity = 0; document.onmousemove = null;
		}
	};
}();

/**--CALC DATA-- */
function calculate(){
	const DBC = loadCharacters()
	const DBW = loadWeapons()
	let user = loadUser()

	let calculator = {
		'CHARACTERS': {},
		'WEAPONS': {},
	};

	let calcPivot = {
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
	setPivot(calcPivot);

	Object.entries(user.CHARACTERS).forEach(([character, state]) => {
		if (!state.FARM) return;
		const info = DBC[character];
		state = uGet(state, '')
		const ascension = [+state.PHASE, +state.TARGET];
		const talents = [
			[+state.NORMAL, +state.TNORMAL],
			[+state.SKILL, +state.TSKILL],
			[+state.BURST, +state.TBURST]
		];
		calculator.CHARACTERS[character] = {
			AFARM: calcCharA(info, ascension),
			TFARM: calcCharT(info, talents)
		}
	})

	Object.entries(user.WEAPONS).forEach(([weapon, state]) => {
		if (!state.FARM) return;
		const info = DBW[weapon];
		const phase = [+state.PHASE, +state.TARGET, info.RARITY];
		calculator.WEAPONS[weapon] = {
			WFARM: calcWpn(info, phase)
		}
	})

	setCalculator(calculator);
	setCalc(false);
}

/**--COST CALCULATORS-- */
function calcCharA(info, ascension, isPivot){
	const props = {
		GEM: info.ELEMENT,
		BOSS: info.BOSS,
		LOCAL_SPECIALTY: info.LOCAL_SPECIALTY,
		COMMON: info.COMMON,
		EXP: 'EXP',
		MORA: 'Mora',
	}
	return generateCosts(props, calcA, ascension, isPivot)
}
function calcCharT(info, talents, isPivot){
	const props = {
		BOOK: info.BOOK,
		COMMON: info.COMMON,
		WEEKLY_DROP: info.WEEKLY_BOSS+' '+info.WEEKLY_DROP,
		MORA: 'Mora',
	}
	return generateCosts(props, calcT, talents, isPivot)
}
function calcWpn(info, phase, isPivot){
	const props = {
		TROPHY: info.TROPHY,
		ELITE: info.ELITE,
		COMMON: info.COMMON,
		ORE: 'Ore',
		MORA: 'Mora',
	}
	return generateCosts(props, calcW, phase, isPivot)
}

function generateCosts(props, calcFunc, uData, isPivot = true){
	const costs = {}
	Object.entries(props).forEach(([category, item]) => {
		let materials = calcFunc(category, uData)
		costs[category] = [item, materials]
		if (materials && isPivot) pivot(category, item, materials)
	})
	return costs
}

/**--DATA CALCULATORS-- */
function calcA(category, [phase, target]){
	const CALCDATA = loadStatic().calculation_data.ASCENSION[category]
	const error = [phase, target].some(i => i < 0 || i > 7);
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[phase] : 0;
	let t = CALCDATA[target];
	return vsub(t, p);
}

function calcT(category, talents){
	const CALCDATA = loadStatic().calculation_data.TALENT[category]
	const error = talents.some(talent => talent.some(i => i < 0 || i > 10));
	if (error || (!talents[0][1] && !talents[1][1] && !talents[2][1])) return;
	let v = [0, 0, 0];
	for (let i = 0; i < 3; i++){
		if (talents[i][0] < talents[i][1]){
			let c = talents[i][0] > 1 ? CALCDATA[talents[i][0]] : 0;
			let t = talents[i][1] > 1 ? CALCDATA[talents[i][1]] : 0;
			v[i] = vsub(t, c);
		}
	}
	return vadd(v[0], v[1], v[2]);
}

function calcW(category, [phase, target, rarity]){
	const CALCDATA = loadStatic().calculation_data[rarity+'WEAPON'][category]
	const error = [phase, target].some(i => i < 0 || i > 7);
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[phase] : 0;
	let t = CALCDATA[target];
	return vsub(t, p);
}

/**--PIVOT-- */
function pivot(category, item, materials){
	const nonEmpty = Object.values(materials).some(v => v !== 0);
	if (!nonEmpty) return
	let mCategory = toPlural(category)
	let calcPivot = getPivot()
	let pivotItems = calcPivot[mCategory]
	pivotItems[item] = item in pivotItems?
		vadd(pivotItems[item], materials) : materials;
	setPivot(calcPivot)
}

/**--VECTOR FUNCTIONS-- */
function vadd(...objs){
	return objs.reduce((a, b) => {
		for (let k in b){if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k]}
		return a;
	}, {});
}

function vsub(a, b){
	return Object.keys(a).reduce((r, i) => {
		r[i] = a[i] - (b[i] || 0);
		return r;
	}, {});
}
