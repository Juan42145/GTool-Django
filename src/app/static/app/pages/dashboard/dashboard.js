setup(loadStatic(), loadCharacters(),loadWeapons())
function pageLoad(){
	window.DBM = loadMaster()
	window.REGION = Object.keys(DBM.ELEMENTS)
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	home()
}
D = (new Date()).getDay();

/**--RENDER-- */
function home() {
	if (getCalc()) calculate();

	Object.entries(getPivot()).forEach(pCategories => {
		let [pCategory, pItems] = pCategories;

		if (Object.keys(pItems).length === 0) return;

		const Sec = document.getElementById(pCategory);
		Sec.classList.remove('hide'); Sec.innerHTML = '';

		const Title = createTxt(Sec, 'div', { 'class': 'section__title'}, pCategory);

		Sec.addEventListener('click', () =>
		window.open(Sec.dataset.url.replace('*',Sec.id),'_self'));
		
		let isTotal = Sec.classList.contains('section--total')
		const Table = create(Sec, 'div',
			{ 'class': 'section__table js-table', 'data-total': isTotal })

		Object.entries(pItems).sort(sortOrder(pCategory)).forEach((pItemData, indexItem) => {
			makeRow(Table, pCategory, pItemData, indexItem, false);
		});
	});

	resize()
}

function makeRow(Table, pCategory, pItemData, indexItem, isPage) {
	let [pItem, pMaterials] = pItemData;

	let Row = document.getElementById('r_' + pItem)
	if (Row && isPage) Row.innerHTML = '';
	else Row = create(Table, 'div', { 'class': 'row' })

	const Name = createTxt(Row, 'div', { 'class': 'row__name' }, pItem)

	if (isPage && Table.dataset.total === 'true') {
		Row.style = 'grid-row: ' + (2 * indexItem + 1)
		Name.style = 'grid-row: ' + (2 * indexItem + 1) + '/span 2'
	}
	else Row.style = 'grid-row: ' + (indexItem + 1);

	if (isPage) Row.id = 'r_' + pItem;
	if (pCategory === 'RESOURCES') Row.classList.add('row--long');

	if (pCategory === 'BOOKS' || pCategory === 'TROPHIES' || pCategory === 'WEEKLY_DROPS')
		setData(pCategory, pItem, Name, isPage);

	let category = translate(pCategory), item = decode(pCategory, pItem);
	let [crafted, calc] = getInventory(category, item, pMaterials);
	Object.entries(pMaterials).reverse().forEach(([rank, value], indexMat) => {
		let index = indexMat + 3;
		if (!value) return

		const Card = create(Row, 'div', { 'class': 'row__card js-card r_' + rank })

		if (isPage) Card.style = 'grid-column: ' + index;

		const IMG = createImg(Card, 'row__card--img', getImage(category, item, rank))

		const INV = createTxt(Card, 'div', { 'class': 'p row__card--inv' },
			crafted[rank].toLocaleString('en-us'))
		const NEED = createTxt(Card, 'div', { 'class': 'p row__card--need' },
			'/' + value.toLocaleString('en-us'))

		if (crafted[rank] >= value) Card.classList.add('completed');
		else Card.classList.remove('completed');
	});

	if (isPage && calc['runs']) {
		const Span = createTxt(Name, 'span', {}, calc['runs'])
	}
	let complete = Row.querySelectorAll('.js-card').length <= Row.querySelectorAll('.completed').length;
	if (complete) { Name.classList.add('completed'); Row.classList.add('completed') }
	else { Name.classList.remove('completed'); Row.classList.remove('completed'); }

	if (Table.dataset.total === 'true') {
		const Total = create(Row, 'div', { 'class': 'row__total' })
		if (isPage) Total.style = 'grid-row: ' + (2 * indexItem + 1) + '/span 2'

		const INV = createTxt(Total, 'div', { 'class': 'p row__card--inv' },
			(Math.floor(calc['total'] * 100) / 100).toLocaleString('en-us'))
		const NEED = createTxt(Total, 'div', { 'class': 'p row__card--need' },
			(Math.floor(calc['neededTotal'] * 100) / 100).toLocaleString('en-us'))

		if (pCategory == 'BOOKS' || pCategory == 'TROPHIES')
			setData(pCategory, pItem, Total, isPage);

		if (complete) Total.classList.add('completed');
		else Total.classList.remove('completed');
	}
	return complete;
}

function setData(pCategory, pItem, Element, isPage) {
	let item = decode(pCategory, pItem)
	let index = Object.keys(DBM[pCategory]).indexOf(item);
	Element.classList.add('cell-color');
	if (pCategory === 'WEEKLY_DROPS') {
		Element.dataset.color = REGION[Math.floor(index / 6) + 1];
	} else {
		Element.dataset.color = REGION[Math.floor(index / 3) + 1];
		if (!isPage && D !== 0 && (D - 1) % 3 !== index % 3)
			Element.parentElement.classList.add('hide');
	}
}

/**--INVENTORY CRAFTING PROCESSING-- */
function getInventory(category, item, pMaterials) {
	/*
	crafted: copy that holds inventory after possible crafting
	maxInv: copy that holds maximum inventory obtained through crafting (defaultdict)
	*/
	let iMaterials = userInv[category]?.[item]
	let crafted = {...maxInv} = {...iMaterials};
	maxInv = uGet(maxInv, 0)
	let lastIndex = Object.keys(pMaterials).length - 1, highestRank, highestIndex
	let invTotals = {} //Holds calculated total at each rank
	let calc = {//rename??
		total: 0, //Total needs to be calculated for when not all ranks are present
		neededTotal: 0,
		runs: ''
	}
	
	Object.entries(pMaterials).forEach(([rank, value], indexMat) => {
		if (value !== 0) [highestRank, highestIndex] = [rank, indexMat]
		if (indexMat < lastIndex && maxInv[rank] > value){
			//Next rank exists & inv > need value
			crafted[rank] = +value
			maxInv[+rank+1] += Math.floor((maxInv[rank] - value)/3);
		} else {
			crafted[rank] = Math.floor(maxInv[rank]);
		}

		let uValue = iMaterials?.[rank] ?? 0
		let divisor = 3**(lastIndex - indexMat)
		calc['total'] += uValue/divisor; invTotals[rank] = calc['total'];
		calc['neededTotal'] += value/divisor;
	});
	crafted[highestRank] = Math.floor(maxInv[highestRank])
	calc['total'] = invTotals[highestRank];
	if (item === 'EXP' || item === 'Ore'){ //Pivot only has one rank for these
		crafted[highestRank] = calc['total'] = Math.floor(getTotals()[category][item])
	}

	let gateD = category === 'BOOKS' || category === 'TROPHIES';
	let gateM = category === 'WEEKLY_DROPS' || category === 'BOSSES' || category === 'GEMS';
	let diff = calc['neededTotal'] - calc['total'];
	if (diff > 0 && (gateD || gateM)) {
		dropRate = loadStatic().drop_rates[category][highestRank]
		diff *= 3 ** (lastIndex - highestIndex); //convert diff to highest rank
		let runs = Math.ceil(diff / dropRate), time;
		switch (category) {
			case 'WEEKLY_DROPS':
				time = pluralize(runs, 'week');
				break;
			case 'BOSSES':
			case 'GEMS':
				time = pluralize(Math.ceil(runs / 4.5), 'day');//180 / 40 resin
				break;
			default:
				time = pluralize(Math.ceil(runs / 9), 'day');//180 / 90 resin
		}
		calc['runs'] = `(${pluralize(runs, 'run')} ~ ${time})`;
	}
	if (gateD) {
		let index = Object.keys(DBM[category]).indexOf(item);
		let days = ['Mo/Th', 'Tu/Fr', 'We/Sa'];
		calc['runs'] += ` [${days[index % 3]}]`;
	}
	return [crafted, calc];
}

function pluralize(num, string) {
	return num > 1 ? num + ' ' + string + 's' : num + ' ' + string;
}

/**--SORT PIVOT-- */
function sortOrder(pCategory) {
	return function (a, b) {
		let category = translate(pCategory)
		a = decode(pCategory, a[0]), b = decode(pCategory, b[0]);
		let items = Object.keys(DBM[category]);
		return items.indexOf(a) - items.indexOf(b)
	}
}

/**--SWITCH: CHANGE FILTER OBTAINED */
function toggleSwitch(Element) {
	document.body.style.setProperty('--filter', Element.checked ? 'none' : 'contents')
	resize();
}

/**--RESIZE-- */
function resize() {
	let r = parseFloat(getComputedStyle(document.getElementById('home')).getPropertyValue('grid-auto-rows'))
	let g = parseFloat(getComputedStyle(document.getElementById('home')).getPropertyValue('grid-column-gap'))

	let p = parseFloat(getComputedStyle(document.getElementById('var')).getPropertyValue('padding'))
	let t = parseFloat(getComputedStyle(document.getElementById('var')).getPropertyValue('height'))

	let m = []; o = t + p;

	containers = document.querySelectorAll('.js-section:not(.hide)');
	for (x = 0; x < containers.length; x++) {
		let section = containers[x]; let cont = section.querySelector('.js-table')
		let h = cont.getBoundingClientRect().height;
		let calc = Math.ceil((o + h + g) / (r)); section.style.gridRow = `span ${calc}`;
		let i = getComputedStyle(section).getPropertyValue('grid-column-start')
		m[i] = 1
	}

	let c = getComputedStyle(document.getElementById('home')).getPropertyValue('--temp');

	let template = c.split('minmax')
	for (i = 1; i < template.length; i++) {
		if (m[i]) template[i] = 'minmax' + template[i];
		else template[i] = '0 ';
	}
	let prop = template.join('')

	document.getElementById('home').style.gridTemplateColumns = prop;
}

hQueries = [767, 1024, 1200]
hQueries.forEach(q => { window.matchMedia(`(min-width: ${q}px)`).addEventListener('change', resized) })
function resized() {
	resize();
}