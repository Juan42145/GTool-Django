"use strict";
setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	window.ELEMENT_ORDER = Object.fromEntries([
		'Geo', 'Anemo', 'Cryo', 'Electro', 'Dendro', 'Hydro', 'Pyro']
		.map((v, i) => [v, i]))
	window.STAT_ORDER = Object.fromEntries(Object.keys(loadMaster().STATS)
		.map((v, i) => [v, i]))

	showAll = showSwitch(loadSetting('chr-switch', true))
	isAsc = loadSetting('chr-asc', false)
	sorting = loadSetting('chr-sort', 0)
	isTable = loadSetting('chr-tbl', false)
	displaySettings()
	renderCharacters()
}
let showAll, isAsc, sorting, isTable
function displaySettings(){
	//sorting
	if(sorting < 0){
		sortTable(-sorting, document.getElementsByTagName('th')[-sorting-1])
	} else{
		document.getElementById('select-sort').selectedIndex = +sorting + 1
		sortSelect(sorting)
	}
	//isTable
	renderSwitcher(document.getElementsByClassName('js-mode')[+isTable], isTable)
}

/**--RENDER-- */
function renderCharacters(){
	setDirection();
	const characters = Object.entries(DBC).sort(sorting)
	if(!isAsc) characters.reverse();
	
	document.getElementById('char-grid').innerHTML = '';
	document.getElementById('table__body').innerHTML = '';
	characters.forEach(character => {
		if(!showAll && !userChar[character[0]]?.OWNED) return
		isTable ? makeRow(character) : makeCard(character);
	});
}

function makeCard(character){
	const [cName, cInfo] = character; const state = userChar[cName];

	const Container = document.getElementById('char-grid')
	const Card = createDiv(Container, 'card clr-'+cInfo.RARITY);
	Card.addEventListener('click', () => redirect(cName));

	if(state?.OWNED){
		let value = consValue(state)
		const Tag = createTxt(Card, 'div', 'char__tag', 'C'+value);
		if(state.REWARD) createTxt(Tag, 'div', '', '['+ +state.REWARD+']');
		if(value >= 6) Tag.classList.add('max')
	} else{
		Card.classList.add('missing');
	}

	/*Icon*/createImg(Card, 'char__icon', getImage('ELEMENTS', cInfo.ELEMENT))

	/*cImg*/createImg(Card, 'card__image', getCharacter(cName))
	/*Name*/createTxt(Card, 'div', 'card__name', cName)
}

function makeRow(character){
	const [cName, cInfo] = character; const state = userChar[cName];
	
	const Container = document.getElementById('table__body')
	const Row = create(Container, 'tr', {'class':'clr-'+cInfo.RARITY})

	let Cell;

	Cell = create(Row, 'td')
	
	const Farm = create(Cell, 'input', {'class': 'row__farm', 'type':'checkbox'});
	Farm.checked = state?.FARM;
	Farm.addEventListener('change', () => {
		uSet(userChar, [cName,'FARM'], Farm.checked)
		setCalc(true); storeUserC(user, userChar);
	}, false);

	Cell = create(Row, 'td', {'class': 'row__r-border'})
	Cell.addEventListener('click', () => redirect(cName));
	
	const Info = createDiv(Cell, 'row__info')
	/*Icon*/createImg(Info, 'char__icon', getImage('ELEMENTS', cInfo.ELEMENT, 0))
	if (state?.OWNED){
		let value = consValue(state)
		const Tag = createTxt(Info, 'div', 'char__tag', 'C'+value);
		if(state.REWARD) createTxt(Tag, 'div', '', '['+state.REWARD+']');
		if(value >= 6) Tag.classList.add('max')
	} else{
		Row.classList.add('missing')
	}
	
	const Char = createDiv(Cell, 'row__char')
	/*cImg*/createImg(Char, 'row__image', getCharacter(cName))
	/*Name*/createTxt(Char, 'p', '', cName);

	Cell = create(Row, 'td')
	const PCont = createDiv(Cell, 'row__user')
	/*Phase*/createTxt(PCont, 'p', '', state?.PHASE);
	/*TPhase*/ if(state?.TARGET) createTxt(PCont, 'p', 'goal', '/'+state?.TARGET);

	Cell = create(Row, 'td')
	const NCont = createDiv(Cell, 'row__user')
	/*Normal*/createTxt(NCont, 'p', '', state?.NORMAL);
	/*TNormal*/ if(state?.TNORMAL)createTxt(NCont, 'p', 'goal', '/'+state?.TNORMAL);

	Cell = create(Row, 'td')
	const SCont = createDiv(Cell, 'row__user')
	/*Skill*/createTxt(SCont, 'p', '', state?.SKILL);
	/*TSkill*/ if(state?.TSKILL) createTxt(SCont, 'p', 'goal', '/'+state?.TSKILL);

	Cell = create(Row, 'td', {'class': 'row__r-border'})
	const BCont = createDiv(Cell, 'row__user')
	/*Burst*/createTxt(BCont, 'p', '', state?.BURST);
	/*TBurst*/ if(state?.TBURST) createTxt(BCont, 'p', 'goal', '/'+state?.TBURST);
	
	/*HP*/createTxt(Row, 'td', '', cInfo.STAT_HP);
	/*ATK*/createTxt(Row, 'td', '', cInfo.STAT_ATK);
	/*DEF*/createTxt(Row, 'td', '', cInfo.STAT_DEF);
	/*STAT*/createTxt(Row, 'td', '', cInfo.STAT+' '+cInfo.STAT_VALUE);
}

function consValue(state){
	let s = uGet(state, '')
	return (s.CONSTELLATION === 0 ? 0 : s.CONSTELLATION || -1) + s.REWARD
}

/**--SWITCH MODE-- */
function switcher(Element, mode){
	renderSwitcher(Element, mode); renderCharacters()
}

function renderSwitcher(Element, mode){
	isTable = mode; storeSetting('chr-tbl', isTable)
	let grdClass = document.getElementById('char-grid').classList
	let tblClass = document.getElementById('char-table').classList
	if (isTable){
		tblClass.remove('hide')
		grdClass.add('hide')
	} else{
		grdClass.remove('hide')
		tblClass.add('hide')
	}

	document.getElementsByClassName('selected')[0].classList.remove('selected')
	Element.classList.add('selected')
}

/**--DIRECTION-- */
function toggleDirection(btn){
	if(isAsc) btn.classList.add('asc')
	else btn.classList.remove('asc')
	isAsc = !isAsc; storeSetting('chr-asc', isAsc)
	renderCharacters();
}

function setDirection(){
	const BtnClass = document.getElementById('direction').classList
	const HdrClass = document.getElementsByClassName('hdr--sort')[0]?.classList
	if(isAsc){
		BtnClass.add('asc')
		HdrClass?.add('asc')
	} else{
		BtnClass.remove('asc')
		HdrClass?.remove('asc')
	}
}

/**--SORTS-- */
function setSort(value, header){
	isAsc = header ? sortTable(value, header) : sortSelect(value)
	storeSetting('chr-asc', isAsc)
	renderCharacters()
}

function sortSelect(value){
	const sorts = [[()=>{}, false],
		[sortName, true], [sortAscension, false],
		[sortRarity, false], [sortConstellation, false]
	]
	sorting = sorts[value][0]; storeSetting('chr-sort', value)

	//Set table header according to select value
	if(value == 1) setTableHeader(document.getElementById('hdr-name'))
	else setTableHeader()

	return sorts[value][1]
}

function sortTable(value, header){
	const sorts = [[()=>{}, false], [sortFarm, false], [sortName, true],
		[sortP, false], [sortN, false], [sortS, false], [sortB, false], 
		[sortHP, false], [sortATK, false], [sortDEF, false], [sortStat, false]]
	sorting = sorts[value][0]; storeSetting('chr-sort', -value)
	let asc = header.classList.contains('hdr--sort') ? !isAsc : sorts[value][1]

	//Set select value and table header according to table sort
	document.getElementById('select-sort').selectedIndex = 0
	setTableHeader(header)

	return asc
}

function setTableHeader(header){
	document.getElementsByClassName('hdr--sort')[0]?.classList.remove('hdr--sort')
	header?.classList.add('hdr--sort')
}

/**--SORT FUNCTIONS-- */
function sortName(a,b){
	return a[0].localeCompare(b[0]);
}

function sortAscension(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return aUsr.PHASE - bUsr.PHASE
			|| aUsr.OWNED - bUsr.OWNED
			|| a[1].RARITY - b[1].RARITY
			|| ELEMENT_ORDER[b[1].ELEMENT] - ELEMENT_ORDER[a[1].ELEMENT] //desc
}

function sortRarity(a,b){
	return a[1].RARITY - b[1].RARITY;
}

function sortConstellation(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return consValue(aUsr) - consValue(bUsr)
			|| b[0].localeCompare(a[0]) //desc
}

//Table sorts
function sortFarm(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return aUsr.FARM - bUsr.FARM
			|| a[1].RARITY - b[1].RARITY
}

function sortUserData(stat, goal){
	return function (a,b) {
		let aUsr = uGet(userChar[a[0]], '')
		let bUsr = uGet(userChar[b[0]], '')
		return aUsr[goal] - bUsr[goal]
				|| aUsr[stat] - bUsr[stat]
	}
}

const sortP = sortUserData('PHASE', 'TARGET')
const sortN = sortUserData('NORMAL', 'TNORMAL')
const sortS = sortUserData('SKILL', 'TSKILL')
const sortB = sortUserData('BURST', 'TBURST')

function sortHP(a,b){
	return a[1].STAT_HP - b[1].STAT_HP
}

function sortATK(a,b){
	return a[1].STAT_ATK - b[1].STAT_ATK
}

function sortDEF(a,b){
	return a[1].STAT_DEF - b[1].STAT_DEF
}

function sortStat(a,b){
	return STAT_ORDER[b[1].STAT] - STAT_ORDER[a[1].STAT] //desc
			|| a[1].RARITY - b[1].RARITY;
}

/**--SWITCH: SHOW OWNED-- */
function toggleSwitch(Element){
	showAll = Element.checked; storeSetting('chr-switch', showAll)
	renderCharacters();
}
