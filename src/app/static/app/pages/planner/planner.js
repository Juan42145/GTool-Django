"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBC = loadCharacters()
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;
	
	renderPlanner()
}

/**--RENDER-- */
function renderPlanner(){
	if (getCalc()) calculate();
	makeChar(); makeWpn();
}

function makeChar(){
	const Characters = document.getElementById('Characters');
	Characters.innerHTML = '';
	Object.keys(getCalculator().CHARACTERS).forEach((name) => {
		const Row = create(Characters, 'div', 
			{'class':'row', 'data-color':DBC[name].ELEMENT})

		const Char = create(Row, 'div', {'class':'row__id--chr'})
		const Ascn = create(Row, 'div', {'class':'row__asc'})
		const Tlnt = create(Row, 'div', {'class':'row__tln'})
		
		Char.addEventListener('click', () =>
			window.open(Characters.dataset.url.replace('*', name), '_self'));

		/*cImg*/createImg(Char, 'chr-image', getCharacter(name))
		/*Name*/createTxt(Char, 'div', {'class':'name'}, name);

		let state = uGet(userChar[name], '')
		makeInputs(Ascn, name, 'CHARACTERS', 'AFARM', {
			PHASE: state.PHASE, TARGET: state.TARGET});
		makeInputs(Tlnt, name, 'CHARACTERS', 'TFARM', {
			NORMAL: state.NORMAL, TNORMAL: state.TNORMAL,
			SKILL: state.SKILL, TSKILL: state.TSKILL,
			BURST: state.BURST, TBURST: state.TBURST});
		makeFarm(Ascn, name, 'CHARACTERS', 'AFARM');
		makeFarm(Tlnt, name, 'CHARACTERS', 'TFARM');
	});  
}

function makeWpn(){
	const Weapons = document.getElementById('Weapons')
	Weapons.innerHTML = '';
	Object.keys(getCalculator().WEAPONS).forEach((name) => {
		const Row = create(Weapons, 'div',
			{'class':'row', 'data-color':DBW[name].RARITY})

		const Wpn = create(Row, 'div', {'class':'row__id--state'})
		const Wd = create(Row, 'div', {'class':'row__wpn'})

		Wpn.addEventListener('click', () =>
			window.open(Weapons.dataset.url.replace('*', name), '_self'));

		/*wImg*/createImg(Wpn, 'wpn-image', getWeapon(name))
		/*Name*/createTxt(Wpn, 'div', {'class':'name'}, name)

		let state = uGet(userWpn[name], '')
		makeInputs(Wd, name, 'WEAPONS', 'WFARM', {
			PHASE: state.PHASE, TARGET: state.TARGET});
		makeFarm(Wd, name, 'WEAPONS', 'WFARM');
	});
}

function makeInputs(Root, name, kind, farm, uValues){
	const Div = create(Root, 'div', {'class':'inp'})
	Object.entries(uValues).forEach(([uAttribute, uValue]) => {
		const Input = createNumInput(Div, {}, uValue)
		Input.addEventListener('blur',() => {
			if (kind === 'CHARACTERS') updateC(name, uAttribute, Input.value);
			if (kind === 'WEAPONS') updateW(name, uAttribute, Input.value);
			makeFarm(Root, name, kind, farm);
		}, false);
	});
}

function makeFarm(Root, name, kind, farm){
	if (getCalc()) calculate();
	
	let FARM = document.getElementById('f_'+farm+name.replaceAll(' ', '_'))
	if (FARM) FARM.innerHTML = '';
	else FARM = create(Root, 'div',
		{'class':'farming', 'id':'f_'+farm+name.replaceAll(' ', '_')})
	
	let calcCosts = getCalculator()[kind][name][farm];
	Object.entries(calcCosts).forEach(([cCategory, [cItem, cMaterials]]) => {
		let category = translate(cCategory), item = decode(cCategory, cItem);
		
		const Div = create(FARM, 'div', {'class':'farming__cont'})
		
		if (!cMaterials) return
		let counter = 0, total = 0;
		Object.entries(cMaterials).reverse().forEach(([rank, value]) => {
			total += value/(3**counter); counter++;
			if (value === 0) return;
			makeTooltip(Div, cItem)
	
			const Card = create(Div, 'div', {'class':'item r_'+rank})

			/*Img*/createImg(Card, 'item__image', getImage(category, item, rank))
			/*Need*/createTxt(Card, 'p', {'class':'item__need'}, value)
		});
		if (counter > 1){
			Div.classList.add('farming__cont--total')
			const Total = create(Div, 'div', {'class':'total'})
			createTxt(Total, 'p', {}, Math.ceil(total*100)/100);
		}
	});
}

/**--INPUT CHANGES HANDLERS-- */
function updateC(name, attr, value){
	uSet(userChar, [name,attr], value)
	setCalc(true); storeUserC(user, userChar);
}

function updateW(name, attr, value){
	uSet(userWpn, [name,attr], value)
	setCalc(true); storeUserW(user, userWpn);
}
