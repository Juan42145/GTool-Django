"use strict";
setup(loadCharacters())
function pageLoad(){
	window.DBM = loadMaster()
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	window.userInv = user.INVENTORY;
	
	window.TOTAL_CATEGORIES = Object.keys(getTotals())
	window.REGION_GROUPS = Object.values(DBM['BOOKS']).reduce((acc, item) => {
		if(!acc.includes(item.data)) acc.push(item.data)
		return acc
	},[])

	showAll = showSwitch(loadSetting('cmp-switch', true))
	renderCompare()
}
let isShown = false, isLine = false;
let showAll

function renderCompare(){
	document.getElementById('cols').innerHTML = '';
	document.getElementById('rows').innerHTML = '';
	document.getElementById('table').innerHTML = '';

	const rOption = document.getElementById('row').value
									.toUpperCase().replace(' ', '_')
	const cOption = document.getElementById('col').value
									.toUpperCase().replace(' ', '_')
	const rHeaders = getHeaders(rOption, true);
	const cHeaders = getHeaders(cOption, false);

	if(isShown){
		const Table = document.getElementById('table');
		let nRows = rHeaders.length, nCols = cHeaders.length;
		let cells = new Array(nRows);
		for(let r = 0; r <= nRows; r++){
			cells[r] = new Array(nCols);
			for(let c = 0; c <= nCols; c++){
				const Div = createDiv(Table, 'cmp__cell',
					{'style': `grid-area: ${r+3}/ ${c+3};`})
				if(isLine) Div.classList.add('cmp__cell--line');
				cells[r][c] = Div;
			}
		}
		let totals = [new Array(nRows).fill(0), new Array(nCols).fill(0)]
		getChar(cells, rOption, cOption, rHeaders, cHeaders, totals);
		makeTotals(cells, nRows, nCols, totals);
	}
}

function getHeaders(option, isRow){
	if(option == '...' && isRow) return;
	let isText = false
	let category = translate(option)
	let array = category in DBM ? Object.keys(DBM[category]) : [undefined]

	if(!isRow) isLine = false;

	switch (option){
		case 'RARITY': array = [4,5] // COL ONLY
		case '...': isLine = true // COL ONLY
		case 'MODEL':
		case 'STAT':
			isText = true
			break
	}

	const Header = isRow ?
	document.getElementById('rows') : document.getElementById('cols')
	
	let span = 3, cum, prev
	if(option == 'LOCAL_SPECIALTY') span = {};
	array.forEach(item => {
		const Card = createDiv(Header,
			'cmp__header cmp__header--'+(isRow ? 'row' : 'col'))

		let inv = ''
		switch (category){
			case 'ELEMENTS': inv = getInv('GEMS',item)
				break;
			case 'WEEKLY_BOSSES': inv = getTotals().WEEKLY_BOSSES[item]
				break;
			case 'BOSSES':
			case 'LOCAL_SPECIALTIES':
			case 'ENEMIES':
			case 'BOOKS':
			case 'WEEKLY_DROPS':
				inv = getInv(category,item)
				break;
		}

		if(isText) Card.textContent = item;
		else{
			/*Img*/createImg(Card, 'cmp__header__image', getImage(category, item))
			makeTooltip(Card, item+' '+inv)
		}

		if(category == 'LOCAL_SPECIALTIES'){
			if(prev !== DBM[category][item].data){
			  cum = 1; prev = DBM[category][item].data
			}
			else cum++;
			span[DBM[category][item].data] = cum;
		}
	});

	const Cont = document.getElementById('compare')
	if(['LOCAL_SPECIALTIES', 'BOOKS', 'WEEKLY_DROPS'].includes(category)){
		let group = category === 'WEEKLY_DROPS' ? 'WEEKLY_BOSSES' : 'REGIONS'
		Object.keys(DBM[group]).forEach(item => {
			if(group === 'REGIONS' && !REGION_GROUPS.includes(item)) return

			const Card = createDiv(Header,
				'cmp__header cmp__header--'+(isRow ? 'r' : 'c')+'group')

			let cStyle = isRow ? 'grid-row': 'grid-column'
			if(category == 'LOCAL_SPECIALTIES')
				Card.style = cStyle+': span '+span[item];
			else Card.style = cStyle+': span '+span;

			if(group == 'WEEKLY_BOSSES')
				makeTooltip(Card, item+' '+getTotals()[group][item])

			createImg(Card, 'cmp__header__image', getImage(group, item, 0))
		});
		Header.classList.add('area--group')
		Cont.classList.add('compare--'+(isRow ? 'rowG' : 'colG'))
	}
	else{
		Header.classList.remove('area--group')
		Cont.classList.remove('compare--'+(isRow ? 'rowG' : 'colG'))
	}

	/*Card Total*/createDiv(Header,
		'cmp__header cmp__header--total cmp__header--'+(isRow ? 'row' : 'col'))

	if(isRow) isShown = true;
	return array;
}

function getChar(cells, rOption, cOption, rHeaders, cHeaders, totals){
	Object.entries(DBC).forEach(([cName, cInfo]) => {
		if(!showAll && !userChar[cName]?.OWNED) return;
		
		let indexRow = rHeaders.indexOf(cInfo[rOption])
		let indexCol = cHeaders.indexOf(cInfo[cOption])
		if(indexRow === -1 || indexCol === -1) return;

		const Card = createDiv(cells[indexRow][indexCol], 'card')
		/*Img*/createImg(Card, 'card__image c_'+cInfo.RARITY, getCharacter(cName))
		totals[0][indexRow]++; totals[1][indexCol]++;
	});
}

function makeTotals(cells, nRows, nCols, totals){
	for(let r = 0; r < nRows; r++){
		cells[r][nCols].classList = 'total'
		createTxt(cells[r][nCols], 'div', '', totals[0][r])
	}
	for(let c = 0; c < nCols; c++){
		cells[nRows][c].classList = 'total'
		createTxt(cells[nRows][c], 'div', '', totals[1][c])
	}
	cells[nRows][nCols].classList = 'total total--sum'
	createTxt(cells[nRows][nCols], 'div', '', totals[0].reduce((a,b)=>(a + b),0))
}

/*--READ INVENTORY-- */
function getInv(category, item){
	let value
	if(TOTAL_CATEGORIES.includes(category)) value = getTotals()[category][item]
	else{
		let rank = Object.keys(DBM[category][item])
								.reduce((key, v) => v < key ? v : key)
		value = userInv[category]?.[item]?.[rank]
	}
	value ??= 0
	return Math.floor(value*100)/100
}

/**--SWITCH: TOGGLE OWNED-- */
function toggleSwitch(Element){
	showAll = Element.checked;
	storeSetting('cmp-switch', showAll)
	renderCompare();
}
