/**--GLOBAL FUNCTIONS-- */
function setup(){
	let promises = [mainDownload]
	for (arg of arguments){promises.push(arg)}

	window.addEventListener('load',()=>{
		Promise.all(promises).then(() => {
			pageLoad()
		})
	})
}

window.addEventListener('load',()=>{
	makeResinDialog()
	if (!hasCalc()) {
		console.log('not calc in cache')
		setCalc(true)
	}
})

/**--CUSTOM FUNCTION-- */
function create(parent, element, attr) {
	//Create HTML Element
	const Element = document.createElement(element); parent.append(Element);
	if (!attr) return Element;
	Object.entries(attr).forEach(([attribute, value]) => {
		Element.setAttribute(attribute, value);
	})
	return Element;
}

function createImg(parent, cls, src){
	const Element = create(parent, 'img', {'class':cls,'src':src})
	setError(Element)
	return Element
}

function createTxt(parent, element, attr, text){
	const Element = create(parent, element, attr)
	Element.textContent = text;
	return Element
}

function focusInput(e) {
	//Focus input at end and convert to empty string if 0/fasly
	if(!+e.target.value) e.target.value = '';
	e.target.setSelectionRange(e.target.value.length, e.target.value.length);
}

/**--INVENTORY-- */
function processTotals(category, item) {
	let mMaterials = loadMaster()[category][item]
	let iMaterials = loadUser().INVENTORY?.[category]?.[item] ?? {}
	let [counter, total] = calcTotals(mMaterials,iMaterials)
	if (counter > 1) {
		const Total = document.getElementById('I_' + item)
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

	let imageObj = loadImages()[group]
	if (imageObj.FORMAT && typeof imageObj.FORMAT[0] === 'string'){
		let method = imageObj.FORMAT.shift()
		if (method === "lowercase") text = text.toLowerCase()
	}
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
	if (!item) return getError();
	const DBM = loadMaster()
	if (rank === undefined){
		rank = Object.keys(DBM[category][item]).reduce((key, v) => v < key ? v : key);
	}
	return getImageLink(category, DBM[category][item][rank]);
}

function getCharacter(name, full = false) {
	let group = 'CHARACTER'
	group += full? '_BANNERS': 'S';
	return getImageLink(group, name)
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
	const Nav = document.getElementById('nav');
	const Backdrop = Nav.querySelector('#backdrop')
	Nav.style.width = 'bloc';
	Nav.style.width = '90%';
	Backdrop.classList.add('backdrop')
}

function closeNav() {
	const Nav = document.getElementById('nav');
	const Backdrop = Nav.querySelector('#backdrop')
	Nav.style.width = null;
	Backdrop.classList.remove('backdrop')
}

function makeResinDialog() {
	const Results = document.getElementById('resin-results')
	const Input = document.getElementById('resin-input')
	Results.innerHTML = '';
	let v = +Input.value;
	resinCalc(Results, v, 'init')
	while (v >= 40) {
		resinCalc(Results, v - 20, 'end')
		v -= 40;
		resinCalc(Results, v, 'loop')
	}
	if (v >= 20) {
		v -= 20;
		resinCalc(Results, v, 'end')
	}
}

function resinCalc(Cont, value, type) {
	let d = new Date();
	if (value < 160) d.setMinutes(d.getMinutes() + 8 * (159 - value))
	let day = (new Date()).getDay() == d.getDay() ? 'Today' : 'Tomorrow';
	let time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })

	const Resin = create(Cont, 'div', { 'class': 'resc resc--' + type })
	Resin.innerHTML = value
	const Full = create(Cont, 'div', { 'class': 'resc resc--' + type })
	Full.innerHTML = day + ' ' + time
}

/**--TOOLTIP-- */
function makeTooltip(Element, content){
  Element.addEventListener('mouseover', ()=>tooltip.show(content))
  Element.addEventListener('mouseout', ()=>tooltip.hide())
}

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

/**--CALC DATA-- */
function calculate() {
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

	setCalculator(calculator);
	setCalc(false);
}

/**--COST CALCULATORS-- */
function calcCharA(info, ascension, isPivot) {
	props = {
		GEM: info.ELEMENT,
		BOSS: info.BOSS,
		LOCAL_SPECIALTY: info.LOCAL_SPECIALTY,
		COMMON: info.COMMON,
		EXP: 'EXP',
		MORA: 'Mora',
	}
	return generateCosts(props, calcA, ascension, isPivot)
}
function calcCharT(info, talent, isPivot) {
	props = {
		BOOK: info.BOOK,
		COMMON: info.COMMON,
		WEEKLY_DROP: info.WEEKLY_BOSS + ' ' + info.WEEKLY_DROP,
		MORA: 'Mora',
	}
	return generateCosts(props, calcT, talent, isPivot)
}
function calcWpn(info, phase, isPivot) {
	props = {
		TROPHY: info.TROPHY,
		ELITE: info.ELITE,
		COMMON: info.COMMON,
		ORE: 'Ore',
		MORA: 'Mora',
	}
	return generateCosts(props, calcW, phase, isPivot)
}

function generateCosts(props, calcFunc, uData, isPivot = true) {
	let costs = {}
	Object.entries(props).forEach(([category,item])=>{
		let materials = calcFunc(category, uData)
		costs[category] = [item, materials]
		if(materials && isPivot) pivot(category, item, materials)
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
	return vsub(t, p);
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
	return vadd(v[0], v[1], v[2]);
}

function calcW(category, [phase, target, rarity]) {
	const CALCDATA = loadStatic().calculation_data[rarity + 'WEAPON'][category]
	let error = [phase, target].some(i => { return i < 0 || i > 7 });
	if (error || phase >= target) return;
	let p = phase ? CALCDATA[phase] : 0;
	let t = CALCDATA[target];
	return vsub(t, p);
}

/**--PIVOT-- */
function pivot(category, item, materials) {
	let nonEmpty = Object.values(materials).some(v => {return v !== 0;});
	if (!nonEmpty) return
	let mCategory = toPlural(category)
	let calcPivot = getPivot()
	let pivotItems = calcPivot[mCategory]
	pivotItems[item] = item in pivotItems? vadd(pivotItems[item], materials):
										materials;
	setPivot(calcPivot)
}

/**--VECTOR FUNCTIONS-- */
function vadd(...objs) {
	return objs.reduce((a, b) => {
		for (let k in b) {if (b.hasOwnProperty(k)) a[k] = (a[k] || 0) + b[k]}
		return a;
	}, {});
}

function vsub(a, b) {
	return Object.keys(a).reduce((r, i) => {
		r[i] = a[i] - (b[i] || 0);
		return r;
	}, {});
}
