"use strict";
setup(loadWeapons())
function pageLoad(){
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userWpn = user.WEAPONS;
	
	window.WPN_TYPES = Object.keys(loadMaster().WEAPON_TYPES)
	window.STAT_ORDER = Object.fromEntries(Object.keys(loadMaster().STATS)
		.map((v, i) => [v, i]))
	window.TROPHY_ORDER = Object.fromEntries(Object.keys(loadMaster().TROPHIES)
		.map((v, i) => [v, i]))
	window.ENEMY_ORDER = Object.fromEntries(Object.keys(loadMaster().ENEMIES)
		.map((v, i) => [v, i]))
	
	showWish = showSwitch(loadSetting('wpn-switch', false))
	initWeapons()
}
let filter = 0, showAll = true, isAsc = false, sorting = ()=>{};
let showWish

/**--INITIALIZE-- */
function initWeapons(){
	let elements = document.getElementsByClassName('js-wtype');
	WPN_TYPES.forEach((mItem, i) => {
		elements[i].src = getImage('WEAPON_TYPES', mItem, 0);
	});
	renderWeapons();
}

/**--RENDER-- */
function renderWeapons(){
	const weapons = Object.entries(DBW).sort(sorting);
	setDirection()
	if(!isAsc) weapons.reverse();

	document.getElementById('weapons').innerHTML = '';
	weapons.forEach(weapon => {
		if(!showWish && weapon[1].IS_WISH_ONLY) return
		else if(!showAll && !userWpn[weapon[0]]?.OWNED) return
		else if(filter !== 0 && weapon[1].WEAPON_TYPE !== WPN_TYPES[filter - 1])
			return
		makeRow(weapon);
	});
}

function makeRow(weapon){
	const [wName, wInfo] = weapon; const state = userWpn[wName];
	
	const Container = document.getElementById('weapons')
	const Row = create(Container, 'tr', {'class':'clr-'+wInfo.RARITY})

	let Cell;

	Cell = create(Row, 'td')
	
	const Farm = create(Cell, 'input', {'class':'wpn__farm', 'type':'checkbox'});
	Farm.checked = state?.FARM;
	Farm.addEventListener('change', () => {
		uSet(userWpn, [wName,'FARM'], Farm.checked)
		setCalc(true); storeUserW(user, userWpn);
	}, false);

	Cell = create(Row, 'td', {'class':'wpn__cell'})
	Cell.addEventListener('click', () => redirect(wName));
	
	/*Img*/createImg(Cell, 'wpn__img', getWeapon(wName))
	/*Type*/createTxt(Cell, 'div', 'wpn__type', wInfo.WEAPON_TYPE);
	if(state?.OWNED){
		let value = (state.REFINEMENT || 0) + (state.WISH || 0)
		const Tag = createTxt(Cell, 'div', 'wpn__tag',
			'R'+value+(state.WISH ? '*' : ''));
		if(state.WISH && state.REFINEMENT)
			createTxt(Tag, 'div', '', '['+state.REFINEMENT+']')
		if(value >= (wInfo.MAX || 5)) Tag.classList.add('max')
	} else{
		Row.classList.add('missing')
	}

	/*Name*/createTxt(Row, 'td', '', wName);

	Cell = create(Row, 'td')
	const PCont = createDiv(Cell, 'wpn__user')
	/*Phase*/createTxt(PCont, 'p', '', state?.PHASE);
	/*TPhase*/ if(state?.TARGET) createTxt(PCont, 'p', 'goal', '/'+state?.TARGET);
	
	/*Atk*/createTxt(Row, 'td', '', wInfo.STAT_ATK);
	/*Stat*/createTxt(Row, 'td', '', wInfo.STAT+' '+wInfo.STAT_VALUE);

	makeInfoCard(Row, wInfo, 'TROPHIES', 'TROPHY')
	makeInfoCard(Row, wInfo, 'ENEMIES', 'ELITE')
	makeInfoCard(Row, wInfo, 'ENEMIES', 'COMMON')
}

function makeInfoCard(Cont, wInfo, group, key){
	const Cell = create(Cont, 'td', {'class':'wpn__cell'})
	const CARD = createImg(Cell, 'wpn__img wpn__img--small',
		getImage(group, wInfo[key]))
	makeTooltip(CARD, wInfo[key])
}

/**--FILTERS-- */
function filterNonOwned(Element, value){
	showAll = !value;
	document.querySelector('.selected').classList.remove('selected')
	Element.classList.add('selected')
	renderWeapons();
}

function filterWpn(Element, value){
	document.getElementsByClassName('active')[0]?.classList.remove('active')
	if(filter === value) filter = 0;
	else{
		filter = value; Element.classList.add('active');
	}
	renderWeapons();
}

/**--DIRECTION-- */
function toggleDirection(btn){
	if(isAsc) btn.classList.add('asc')
	else btn.classList.remove('asc')
	isAsc = !isAsc
	renderWeapons();
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
function sortTable(header, value){
	const sorts =[[()=>{}, false], [sortFarm, false], [sortRef, false],
		[sortName, true], [sortP, false], [sortATK, false], [sortStat, false],
		[sortTrp, false], [sortElt, false], [sortCmn, false], [sortR, false]]
	sorting = sorts[value][0];
	if(!header.classList.contains('hdr--sort')) isAsc = sorts[value][1];
	else{
		if(value === 1){
			sorting = sorts[0][0]; isAsc = sorts[0][1]; header = null
		} else if(value === 4){
			sorting = sorts[10][0]; isAsc = sorts[10][1]; header = null
		} else{
			isAsc = !isAsc
		}
	}

	document.getElementsByClassName('hdr--sort')[0]?.classList.remove('hdr--sort')
	header?.classList.add('hdr--sort')

	renderWeapons();
}

/**--SORT FUNCTIONS-- */
function sortFarm(a,b){
	let aUsr = uGet(userWpn[a[0]], '')
	let bUsr = uGet(userWpn[b[0]], '')
	return aUsr.FARM - bUsr.FARM
			|| a[1].RARITY - b[1].RARITY
}

function sortRef(a,b){
	let aUsr = uGet(userWpn[a[0]], '')
	let bUsr = uGet(userWpn[b[0]], '')
	return aUsr.REFINEMENT - bUsr.REFINEMENT
			|| a[1].RARITY - b[1].RARITY;
}

function sortName(a,b){
	return a[0].localeCompare(b[0]);
}

function sortP(a,b){
	let aUsr = uGet(userWpn[a[0]], '')
	let bUsr = uGet(userWpn[b[0]], '')
	return aUsr.TARGET - bUsr.TARGET
			|| aUsr.PHASE - bUsr.PHASE
			|| a[1].RARITY - b[1].RARITY;
}

function sortATK(a,b){
	return a[1].STAT_ATK - b[1].STAT_ATK
}

function sortStat(a,b){
	return STAT_ORDER[b[1].STAT] - STAT_ORDER[a[1].STAT] //desc
			|| +a[1].STAT_VALUE - +b[1].STAT_VALUE;
}

function sortTrp(a,b){
	return TROPHY_ORDER[a[1].TROPHY] - TROPHY_ORDER[b[1].TROPHY]
}

function sortElt(a,b){
	return ENEMY_ORDER[a[1].ELITE] - ENEMY_ORDER[b[1].ELITE]
}

function sortCmn(a,b){
	return ENEMY_ORDER[a[1].COMMON] - ENEMY_ORDER[b[1].COMMON]
}

function sortR(a,b){
	return a[1].RARITY - b[1].RARITY;
}

/**--SWITCH: CHANGE DISPLAY MODE */
function toggleSwitch(Element){
	showWish = Element.checked;
	storeSetting('wpn-switch', showWish)
	renderWeapons();
}
