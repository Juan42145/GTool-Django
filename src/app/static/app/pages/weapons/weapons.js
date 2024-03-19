setup(loadWeapons())
function pageLoad(){
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userWpn = user.WEAPONS;
	
	initWeapons()
}
let filter = 0, second = 0, count = 0; showOwned = false, isReverse = false;
let wpnTypes
let sorting = ()=>{};

/**--INITIALIZE-- */
function initWeapons(){
	let menu = document.getElementsByClassName('options')[0];
	wpnTypes = Object.keys(loadMaster().WEAPON_TYPES)
	wpnTypes.forEach((mItem, i) => {
		menu.getElementsByTagName('img')[i].src = getImage('WEAPON_TYPES', mItem, 0);
	});
	buildWeapons();
}

/**--RENDER-- */
function buildWeapons(){
	let array = Object.entries(DBW).sort(sorting); if(isReverse) array.reverse();
	let isShowAll = document.getElementById('switch').checked;

	document.getElementById('weapons').innerHTML = '';
	array.forEach(weapon => {
		if(!isShowAll && weapon[1].IS_WISH_ONLY) return
		else if(showOwned && !userWpn[weapon[0]]?.OWNED) return
		else if(filter !== 0 && weapon[1].WEAPON_TYPE !== wpnTypes[filter-1]) return
		makeRow(weapon);
	});
}

function makeRow(weapon){
	const [wName, wInfo] = weapon; const state = userWpn[wName];
	
	const Container = document.getElementById('weapons')
	const Row = create(Container, 'tr', {'class':'w_'+wInfo.RARITY})
	Row.addEventListener('click', (e)=>{
		if(e.target.classList == 'farm') return;
		window.open(wName,'_self');
	}, false);

	let Cell;

	Cell = create(Row, 'td', {'class':'farm'})
	
	const Farm = create(Cell, 'input', {'class': 'farm', 'type':'checkbox'});
	Farm.checked = state?.FARM;
	Farm.addEventListener('change', ()=>{
		uSet(userWpn, [wName,'FARM'], Farm.checked)
		setCalc(true); storeUserW(user, userWpn);
	}, false);

	Cell = create(Row, 'td', {'class':'img'})
	
	const Img = createImg(Cell, 'img', getWeapon(wName))

	if(state?.OWNED){
		const Tag = createTxt(Cell, 'p', {'class':'tag'}, 'R'+ +state.REFINEMENT);
		let max = wInfo.MAX? wInfo.MAX: 5;
		if(state.REFINEMENT >= max) Tag.classList.add('max')
	}
	else{
		Row.classList.add('missing')
	}

	const Name = createTxt(Row, 'td', {'class':'name'}, wName);

	const Phase = create(Row, 'td', {'class':'phase'}, state?.PHASE);

	const Type = create(Row, 'td', {'class':'type'}, wInfo.WEAPON_TYPE);
	const Atk = create(Row, 'td', {'class':'atk'}, wInfo.ATK);
	const Stat = create(Row, 'td', {'class':'stat'}, wInfo.STAT);
	const Value = create(Row, 'td', {'class':'value'}, wInfo.STAT_VALUE);
}

/**--FILTERS-- */
function filterOwned(Element){
	showOwned = !showOwned; Element.classList.toggle('selected')
	buildWeapons();
}

function filterWpn(Element, value){
	if(filter === value) filter = 0;
	else{
		if(filter !== 0) document.getElementsByClassName('picked')[0].classList.toggle('picked')
		filter = value;
	}
	Element.classList.toggle('picked'); buildWeapons();
}

/**--SORTS-- */
function sortTable(head, value){
	let sorts = [()=>{}, sortF, sortR , sortName, sortPhase, sortATK, sortStat, sortRR]
	let prev = document.getElementsByClassName('sort-header')[0]
	if(second === value && count === 2){
		second = 0; count = 0; value = 0; isReverse = false;
		if(prev) prev.classList.remove('sort-header')
	}
	else if(second === value){
		count = 2; isReverse = true;
	} 
	else {
		second = value; count = 1; isReverse = false;
		if(prev) prev.classList.remove('sort-header')
		if(head) head.classList.add('sort-header')
	}
	sorting = sorts[value]; buildWeapons();

}

/**--SORT FUNCTIONS-- */
function sortF(a,b){
	aUsr = uGet(userWpn[a[0]],'')
	bUsr = uGet(userWpn[b[0]],'')
	return bUsr.FARM - aUsr.FARM
			|| bUsr.PHASE - aUsr.PHASE
			|| bUsr.OWNED - aUsr.OWNED
			|| b[1].RARITY - a[1].RARITY;
}

function sortR(a,b){
	aUsr = uGet(userWpn[a[0]],'')
	bUsr = uGet(userWpn[b[0]],'')
	return bUsr.REFINEMENT - aUsr.REFINEMENT
			|| b[1].RARITY - a[1].RARITY;
}

function sortName(a,b){
	return a[0].localeCompare(b[0]);
}

function sortPhase(a,b){
	aUsr = uGet(userWpn[a[0]],'')
	bUsr = uGet(userWpn[b[0]],'')
	return bUsr.PHASE - aUsr.PHASE
			|| bUsr.OWNED - aUsr.OWNED
			|| b[1].RARITY - a[1].RARITY;
}

function sortATK(a,b){
	return b[1].ATK - a[1].ATK
}

function sortStat(a,b){
	return a[1].STAT.localeCompare(b[1].STAT)
			|| b[1].STAT_VALUE.localeCompare(a[1].STAT_VALUE);
}

function sortRR(a,b){
	return b[1].RARITY - a[1].RARITY;
}

/**--SWITCH: CHANGE DISPLAY MODE */
function toggleSwitch(Element){
	buildWeapons();
}

