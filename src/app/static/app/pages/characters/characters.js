setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	buildCharacters()
}
let showOwned = false, isReverse = false; sorting = ()=>{}
let isGrid

/**--RENDER-- */
function buildCharacters(){
	let array = Object.entries(DBC).sort(sorting); if(isReverse) array.reverse();
	isGrid = document.getElementById('switch').checked
	
	document.getElementById('characters').innerHTML = '';
	document.getElementById('table__body').innerHTML = '';
	array.forEach(character => {
		if(showOwned && !userChar[character[0]]?.OWNED) return
		isGrid? makeCard(character): makeRow(character);
	});
}

function makeCard(character){
	const [cName, cInfo] = character; const state = userChar[cName];

	const Container = document.getElementById('characters')
	const Card = create(Container, 'div', {'class':'card c_'+cInfo.RARITY});
	Card.addEventListener('click', () => window.open(cName,'_self'));

	if(state?.OWNED){
		const Tag = create(Card, 'p', {'class':'tag'});
		Tag.textContent = 'C'+ +state?.CONSTELLATION;
		if(state?.CONSTELLATION >= 6) Tag.classList.add('max')
	}
	else{
		Card.classList.add('missing');
	}

	const Icon = createImg(Card, 'c_icon', getImage('ELEMENTS', cInfo.ELEMENT, 0))
	const Img = createImg(Card, 'image', getCharacter(cName))
	const Name = createTxt(Card, 'p', {'class':'name'}, cName)
}

function makeRow(character){
	const [cName, cInfo] = character; const state = userChar[cName];
	
	const Container = document.getElementById('table__body')
	const Row = create(Container, 'tr', {'class':'c_'+cInfo.RARITY})
	Row.addEventListener('click', (e)=>{
		if(e.target.classList == 'farm') return;
		window.open(cName,'_self');
	}, false);

	let Cell;

	Cell = create(Row, 'td', {'class':'farm'})
	
	const Farm = create(Cell, 'input', {'class': 'farm', 'type':'checkbox'});
	Farm.checked = state?.FARM;
	Farm.addEventListener('change', ()=>{
		userSet(userChar, [cName,'FARM'], Farm.checked)
		setCalc(true); storeUserC(user, userChar);
	}, false);

	Cell = create(Row, 'td', {'class':'img'})
	
	const Img = createImg(Cell, 'image', getCharacter(cName))

	const Icon = createImg(Cell, 'c_icon', getImage('ELEMENTS', cInfo.ELEMENT, 0))

	if(state?.OWNED){
		const Tag = create(Cell, 'p', {'class':'tag'});
		Tag.textContent = 'C'+ +state?.CONSTELLATION;
		if(state?.CONSTELLATION >= 6) Tag.classList.add('max')
	}
	else{
		Row.classList.add('missing')
	}

	const Name = createTxt(Row, 'td', {}, cName);

	const Phase = createTxt(Row, 'td', {'class':'sf'}, state?.PHASE);
	const TPhase = createTxt(Row, 'td', {'class':'goal'}, state?.TARGET);

	const Normal = createTxt(Row, 'td', {}, state?.NORMAL);
	const TNormal = createTxt(Row, 'td', {'class':'goal'}, state?.TNORMAL);

	const Skill = createTxt(Row, 'td', {}, state?.SKILL);
	const TSkill = createTxt(Row, 'td', {'class':'goal'}, state?.TSKILL);

	const Burst = createTxt(Row, 'td', {}, state?.BURST);
	const TBurst = createTxt(Row, 'td', {'class':'sl goal'}, state?.TBURST);
	
	const HP = createTxt(Row, 'td', {}, cInfo.STAT_HP);
	const ATK = createTxt(Row, 'td', {}, cInfo.STAT_ATK);
	const DEF = createTxt(Row, 'td', {}, cInfo.STAT_DEF);
	const STAT = createTxt(Row, 'td', {}, cInfo.STAT + ' ' + cInfo.STAT_VALUE);
}

/**--REVERSE */
function setReverse(btn){
	isReverse = !isReverse; btn.classList.toggle('isReverse')
	buildCharacters();
}

/**--FILTERS-- */
function filterOwned(Element){
	showOwned = !showOwned; Element.classList.toggle('selected')
	buildCharacters()
}

/**--SORTS-- */
function getSort(value){
	let sorts = [()=>{}, sortName, sortAscension, sortRarity, sortConstellation]
	sorting = sorts[value]; isReverse = false
	buildCharacters();
	//Remove table header if using sort on table view
	let prev = document.getElementsByClassName('sort-header')[0]
	if(prev) prev.classList.remove('sort-header')
}

function sortTable(head, value){
	let sorts = [()=>{}, sortF, sortHP, sortATK, sortDEF, sortStat]
	let prev = document.getElementsByClassName('sort-header')[0]
	if(prev) prev.classList.remove('sort-header')
	sorting = sorts[value]; head.classList.add('sort-header'); buildCharacters();
}

/**--SORT FUNCTIONS-- */
function sortName(a,b){
	return a[0].localeCompare(b[0]);
}

function sortAscension(a,b){
	return (userChar[b[0]]?.PHASE ?? 0) - (userChar[a[0]]?.PHASE ?? 0)
			|| (userChar[b[0]]?.OWNED ?? false) - (userChar[a[0]]?.OWNED ?? false);
}

function sortRarity(a,b){
	return b[1].RARITY - a[1].RARITY;
}

function sortConstellation(a,b){
	return (userChar[b[0]]?.CONSTELLATION ?? '') - (userChar[a[0]]?.CONSTELLATION ?? '')
			|| (userChar[b[0]]?.OWNED ?? false) - (userChar[a[0]]?.OWNED ?? false);
}

function sortF(a,b){
	return userChar[b[0]]?.FARM - userChar[a[0]]?.FARM
			|| userChar[b[0]]?.OWNED - userChar[a[0]]?.OWNED
			|| b[1].RARITY - a[1].RARITY
			|| userChar[b[0]]?.PHASE - userChar[a[0]]?.PHASE
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

/**--SWITCH: CHANGE DISPLAY MODE */
function toggleSwitch(Element){
	isGrid = Element.checked;
	const Table = document.getElementById('table').classList
	if (isGrid) Table.add('hide')
	else Table.remove('hide')
	buildCharacters();
}