"use strict";
setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	renderCharacters()
}
let showOwned = false, isReverse = false, sorting = ()=>{}
let isTable

/**--RENDER-- */
function renderCharacters(){
	const characters = Object.entries(DBC).sort(sorting)
	if (isReverse) characters.reverse();
	isTable = document.getElementById('switch').checked
	
	document.getElementById('characters').innerHTML = '';
	document.getElementById('table__body').innerHTML = '';
	characters.forEach(character => {
		if (showOwned && !userChar[character[0]]?.OWNED) return
		isTable ? makeRow(character) : makeCard(character);
	});
}

function makeCard(character){
	const [cName, cInfo] = character; const state = userChar[cName];

	const Container = document.getElementById('characters')
	const Card = create(Container, 'div', {'class':'card c_'+cInfo.RARITY});
	Card.addEventListener('click', () => redirect(cName));

	if (state?.OWNED){
		const Tag = createTxt(Card, 'p', 'tag', 'C'+ +state.CONSTELLATION);
		if (state.CONSTELLATION >= 6) Tag.classList.add('max')
	} else{
		Card.classList.add('missing');
	}

	/*Icon*/createImg(Card, 'c_icon', getImage('ELEMENTS', cInfo.ELEMENT))
	/*cImg*/createImg(Card, 'image', getCharacter(cName))
	/*Name*/createTxt(Card, 'p', 'name', cName)
}

function makeRow(character){
	const [cName, cInfo] = character; const state = userChar[cName];
	
	const Container = document.getElementById('table__body')
	const Row = create(Container, 'tr', {'class':'c_'+cInfo.RARITY})
	Row.addEventListener('click', (e) => {
		if (e.target.classList == 'farm') return;
		redirect(cName);
	}, false);

	let Cell;

	Cell = create(Row, 'td', {'class':'farm'})
	
	const Farm = create(Cell, 'input', {'class':'farm', 'type':'checkbox'});
	Farm.checked = state?.FARM;
	Farm.addEventListener('change', () => {
		uSet(userChar, [cName,'FARM'], Farm.checked)
		setCalc(true); storeUserC(user, userChar);
	}, false);

	Cell = create(Row, 'td', {'class':'img'})
	
	/*cImg*/createImg(Cell, 'image', getCharacter(cName))
	/*Icon*/createImg(Cell, 'c_icon', getImage('ELEMENTS', cInfo.ELEMENT, 0))

	if (state?.OWNED){
		const Tag = createTxt(Cell, 'p', 'tag', 'C'+ +state.CONSTELLATION);
		if (state.CONSTELLATION >= 6) Tag.classList.add('max')
	} else{
		Row.classList.add('missing')
	}

	/*Name*/createTxt(Row, 'td', '', cName);

	/*Phase*/createTxt(Row, 'td', 'sf', state?.PHASE);
	/*TPhase*/createTxt(Row, 'td', 'goal', state?.TARGET);

	/*Normal*/createTxt(Row, 'td', '', state?.NORMAL);
	/*TNormal*/createTxt(Row, 'td', 'goal', state?.TNORMAL);

	/*Skill*/createTxt(Row, 'td', '', state?.SKILL);
	/*TSkill*/createTxt(Row, 'td', 'goal', state?.TSKILL);

	/*Burst*/createTxt(Row, 'td', '', state?.BURST);
	/*TBurst*/createTxt(Row, 'td', 'sl goal', state?.TBURST);
	
	/*HP*/createTxt(Row, 'td', '', cInfo.STAT_HP);
	/*ATK*/createTxt(Row, 'td', '', cInfo.STAT_ATK);
	/*DEF*/createTxt(Row, 'td', '', cInfo.STAT_DEF);
	/*STAT*/createTxt(Row, 'td', '', cInfo.STAT+' '+cInfo.STAT_VALUE);
}

/**--REVERSE-- */
function setReverse(btn){
	isReverse = !isReverse; btn.classList.toggle('isReverse')
	renderCharacters();
}

/**--FILTERS-- */
function filterOwned(Element){
	showOwned = !showOwned; Element.classList.toggle('selected')
	renderCharacters()
}

/**--SORTS-- */
function getSort(value){
	const sorts = [()=>{}, sortName, sortAscension, sortRarity, sortConstellation]
	sorting = sorts[value]; isReverse = false
	renderCharacters();
	//Remove table header if using sort on table view
	const Prev = document.getElementsByClassName('sort-header')[0]
	if (Prev) Prev.classList.remove('sort-header')
}

function sortTable(head, value){
	const sorts = [()=>{}, sortFarm, sortHP, sortATK, sortDEF, sortStat]
	sorting = sorts[value];
	const Prev = document.getElementsByClassName('sort-header')[0]
	if (Prev) Prev.classList.remove('sort-header')
	head.classList.add('sort-header')
	renderCharacters();
}

/**--SORT FUNCTIONS-- */
function sortName(a,b){
	return a[0].localeCompare(b[0]);
}

function sortAscension(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return bUsr.PHASE - aUsr.PHASE
			|| bUsr.OWNED - aUsr.OWNED
}

function sortRarity(a,b){
	return b[1].RARITY - a[1].RARITY;
}

function sortConstellation(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return bUsr.CONSTELLATION - aUsr.CONSTELLATION
			|| bUsr.OWNED - aUsr.OWNED;
}

function sortFarm(a,b){
	let aUsr = uGet(userChar[a[0]], '')
	let bUsr = uGet(userChar[b[0]], '')
	return bUsr.FARM - aUsr.FARM
			|| bUsr.OWNED - aUsr.OWNED
			|| b[1].RARITY - a[1].RARITY
			|| bUsr.PHASE - aUsr.PHASE
}

function sortHP(a,b){
	return b[1].STAT_HP - a[1].STAT_HP
}

function sortATK(a,b){
	return b[1].STAT_ATK - a[1].STAT_ATK
}

function sortDEF(a,b){
	return b[1].STAT_DEF - a[1].STAT_DEF
}

function sortStat(a,b){
	return a[1].STAT.localeCompare(b[1].STAT)
			|| b[1].STAT_VALUE.localeCompare(a[1].STAT_VALUE);
}

/**--SWITCH: CHANGE DISPLAY MODE-- */
function toggleSwitch(Element){
	isTable = Element.checked;
	const Table = document.getElementById('table').classList
	if (isTable) Table.remove('hide')
	else Table.add('hide')
	renderCharacters();
}
