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
	makePlanner(true)
	makePlanner(false)
}

function makePlanner(isChar){
	let sectionID, kind, panelClass, farm
	if (isChar){
		sectionID = 'Characters'; kind = 'CHARACTERS'; farm = 'AFARM'
		panelClass = 'planner__panel'
	} else{
		sectionID = 'Weapons'; kind = 'WEAPONS'; farm = 'WFARM'
		panelClass = 'planner__panel planner__panel--side'
	}

	const Section = document.getElementById(sectionID);
	Section.innerHTML = '';
	Object.keys(getCalculator()[kind]).forEach((name) => {
		let color, rarity, image, state
		if (isChar){
			rarity = DBC[name].RARITY; color = DBC[name].ELEMENT
			image = getCharacter(name); state = uGet(userChar[name], '')
		} else{
			rarity = DBW[name].RARITY; color = rarity; image = getWeapon(name)
			state = uGet(userWpn[name], '')
		}

		let cls = panelClass
		if (state.PAUSE) cls += ' planner__panel--paused'
		
		const Article = create(Section, 'article', {'class':cls, 'data-color':color})

		const Bar = create(Article, 'div', {'class':'panel__bar'})
		const Content = create(Article, 'div', {'class':'panel__content'})
		const Image = create(Content, 'div', {'class':'panel__image-container'})
		const Summary = create(Content, 'div', {'class':'panel__summary'})
		const Farm = create(Content, 'div', {'class':'panel__farming'})
		
		Image.addEventListener('click', () =>
			window.open(Section.dataset.url.replace('*', name), '_self'));

		const Pause = create(Bar, 'button', {'class':'btn panel__btn icon-box'})
		createIcon(Pause, '#Check')
		Pause.addEventListener('click', () => pauseObject(isChar, name, Article))
		/*Name*/createTxt(Bar, 'div', {'class':'panel__name'}, name);
		const Remove = create(Bar, 'button', {'class':'btn panel__btn icon-box'})
		createIcon(Remove, '#X')
		Remove.addEventListener('click', () => removeObject(isChar, name))

		/*cImg*/createImg(Image, 'panel__image r_'+rarity, image)

		makeInputs(Summary, 'Levels', name, kind, farm, {
			PHASE: state.PHASE, TARGET: state.TARGET});
		makeFarm(Farm, name, kind, farm);
		
		if (isChar){
			makeInputs(Summary, 'Talents', name, kind, 'TFARM', {
				NORMAL: state.NORMAL, TNORMAL: state.TNORMAL,
				SKILL: state.SKILL, TSKILL: state.TSKILL,
				BURST: state.BURST, TBURST: state.TBURST});
			
			create(Farm, 'div', {'class':'panel__farm--divider'})
			makeFarm(Farm, name, kind, 'TFARM');
		}
	});
}

function makeInputs(Root, label, name, kind, farm, uValues){
	const Div = create(Root, 'div', {'class':'panel__inputs'})
	createTxt(Div, 'div', {'class':'panel__label'}, label)
	Object.entries(uValues).forEach(([uAttribute, uValue]) => {
		const Input = createNumInput(Div, {'class':'panel__input'}, uValue)
		Input.addEventListener('blur',() => {
			const updater = kind === 'CHARACTERS' ? updateC : updateW
			updater(name, uAttribute, Input.value);
			makeFarm(Root, name, kind, farm);
		}, false);
	});
}

function makeFarm(Root, name, kind, farm){
	if (getCalc()) calculate();

	const farmID = 'f_'+farm+name.replaceAll(' ', '_')
	let FARM = document.getElementById(farmID)
	if (FARM) FARM.innerHTML = '';
	else FARM = create(Root, 'div', {'class':'panel__farm', 'id':farmID})
	
	let calcCosts = getCalculator()[kind][name][farm];
	Object.entries(calcCosts).forEach(([cCategory, [cItem, cMaterials]]) => {
		if (!cMaterials) return
		let category = translate(cCategory), item = decode(cCategory, cItem);
		
		const Category = create(FARM, 'div', {'class':'panel__category'})
		Object.entries(cMaterials).reverse().forEach(([rank, value]) => {
			if (value === 0) return;
			makeTooltip(Category, cItem)
	
			const Card = create(Category, 'div', {'class':'material'})

			createImg(Card, 'material__image r_'+rank, getImage(category, item, rank))
			createTxt(Card, 'p', {'class':'material__need'}, value)
		});
	});
}

/**--BAR BUTTONS EVENTS-- */
function pauseObject(isChar, name, panel){
	const state = isChar ? userChar[name] : userWpn[name]
	const isPaused = !(state?.PAUSE ?? false)
	if (isPaused) panel.classList.add('planner__panel--paused')
	else panel.classList.remove('planner__panel--paused')
	const updater = isChar ? updateC : updateW
	updater(name, 'PAUSE', isPaused)
}

function removeObject(isChar, name){
	const updater = isChar ? updateC : updateW
	updater(name, 'FARM', false)
	renderPlanner()
}

/**--CHANGE HANDLERS-- */
function updateC(name, attr, value){
	uSet(userChar, [name,attr], value)
	setCalc(true); storeUserC(user, userChar);
}

function updateW(name, attr, value){
	uSet(userWpn, [name,attr], value)
	setCalc(true); storeUserW(user, userWpn);
}
