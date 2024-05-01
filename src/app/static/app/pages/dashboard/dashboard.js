"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBM = loadMaster()
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	window.REGION = Object.keys(DBM.ELEMENTS)
	renderDashboard()
}
const DAYS = ['Mo/Th', 'Tu/Fr', 'We/Sa']
const today = (new Date()).getDay();

/**--RENDER-- */
function renderDashboard(){
	if (getCalc()) calculate();

	Object.entries(getPivot()).forEach(pCategories => {
		let [pCategory, pItems] = pCategories;

		let pItemArray = Object.entries(pItems)
		if (pItemArray.length === 0) return;

		const Sec = document.getElementById(pCategory);
		Sec.classList.remove('hide'); Sec.innerHTML = '';

		/*Title*/createTxt(Sec, 'div', 'section__title', pCategory);

		Sec.addEventListener('click', () =>
			redirect(Sec.dataset.url.replace('*', Sec.id)));
		
		const isTotal = Sec.classList.contains('section--total')
		const Table = create(Sec, 'div',
			{'class':'section__table js-table', 'data-total':isTotal})

		pItemArray.sort(sortOrder(pCategory)).forEach((pItemData, indexItem) => {
			makeRow(Table, pCategory, pItemData, indexItem, false);
		});
	});

	resize()
}

function makeRow(Table, pCategory, pItemData, indexItem, isPage){
	let [pItem, pMaterials] = pItemData;

	let Row = document.getElementById('r_'+pItem)
	if (Row && isPage) Row.innerHTML = '';
	else Row = create(Table, 'div', {'class':'row'})

	const Name = createTxt(Row, 'div', 'row__name', pItem)

	if (isPage && Table.dataset.total === 'true'){
		Row.style = 'grid-row: '+(2*indexItem + 1)
		Name.style = 'grid-row: '+(2*indexItem + 1)+'/span 2'
	}
	else Row.style = 'grid-row: '+(indexItem + 1);

	if (isPage) Row.id = 'r_'+pItem;
	if (pCategory === 'RESOURCES') Row.classList.add('row--long');

	if (['BOOKS', 'TROPHIES', 'WEEKLY_DROPS'].includes(pCategory))
		setDatasetStyle(pCategory, pItem, Name, isPage);

	let category = translate(pCategory), item = decode(pCategory, pItem);
	const [crafted, calc] = getInventory(category, item, pMaterials);
	Object.entries(pMaterials).reverse().forEach(([rank, value], indexMat) => {
		let index = indexMat + 3;
		if (!value) return

		const Card = create(Row, 'div', {'class':'row__card js-card r_'+rank})
		if (isPage) Card.style = 'grid-column: '+index;

		/*Img*/createImg(Card, 'row__card--img', getImage(category, item, rank))

		/*Inv*/createTxt(Card, 'div', 'p row__card--inv',
			crafted[rank].toLocaleString('en-us'))
		/*Need*/createTxt(Card, 'div', 'p row__card--need',
			'/'+value.toLocaleString('en-us'))

		if (crafted[rank] >= value) Card.classList.add('completed');
		else Card.classList.remove('completed');
	});

	if (isPage && calc['runs']) /*Runs*/createTxt(Name, 'span', '', calc['runs'])
	
	const numCards = Row.querySelectorAll('.js-card').length
	let complete = numCards <= Row.querySelectorAll('.completed').length;
	if (complete){
		Row.classList.add('completed')
		Name.classList.add('completed')
	} else{
		Row.classList.remove('completed')
		Name.classList.remove('completed')
	}

	if (Table.dataset.total === 'true'){
		const Total = create(Row, 'div', {'class':'row__total'})
		if (isPage) Total.style = 'grid-row: '+(2*indexItem + 1)+'/span 2'

		/*Inv*/createTxt(Total, 'div', 'p row__card--inv',
			(Math.floor(calc['total']*100)/100).toLocaleString('en-us'))
		/*Need*/createTxt(Total, 'div', 'p row__card--need',
			(Math.floor(calc['neededTotal']*100)/100).toLocaleString('en-us'))

		if (['BOOKS', 'TROPHIES'].includes(pCategory))
			setDatasetStyle(pCategory, pItem, Total, isPage);

		if (complete) Total.classList.add('completed');
		else Total.classList.remove('completed');
	}
	return complete;
}

function setDatasetStyle(pCategory, pItem, Element, isPage){
	let item = decode(pCategory, pItem)
	let index = Object.keys(DBM[pCategory]).indexOf(item);
	Element.classList.add('cell-color');
	if (pCategory === 'WEEKLY_DROPS'){
		Element.dataset.color = REGION[Math.floor(index/6) + 1];
	} else{
		Element.dataset.color = REGION[Math.floor(index/3) + 1];
		if (!isPage && today !== 0 && (today - 1) % 3 !== index % 3)
			Element.parentElement.classList.add('hide');
	}
}

/**--INVENTORY CRAFTING PROCESSING-- */
function getInventory(category, item, pMaterials){
	/*
	crafted: copy that holds inventory after possible crafting
	maxInv: copy that holds maximum inventory obtained through crafting
	*/
	let iMaterials = userInv[category]?.[item]
	const crafted = {...iMaterials};
	const maxInv = uGet({...iMaterials}, 0) //defaultdict
	const lastIndex = Object.keys(pMaterials).length - 1
	let highestRank, highestIndex
	const invTotals = {} //Holds calculated total at each rank
	const calc = {
		total: 0, //Total needs to be calculated for when not all ranks are present
		neededTotal: 0,
		runs: ''
	}
	
	Object.entries(pMaterials).forEach(([rank, value], indexMat) => {
		if (value !== 0) [highestRank, highestIndex] = [rank, indexMat]
		if (indexMat < lastIndex && maxInv[rank] > value){
			//Next rank exists & inv > need value
			crafted[rank] = +value
			maxInv[+rank + 1] += Math.floor((maxInv[rank] - value)/3);
		} else{
			crafted[rank] = Math.floor(maxInv[rank]);
		}

		let uValue = iMaterials?.[rank] ?? 0
		let divisor = 3**(lastIndex - indexMat)
		calc['total'] += uValue/divisor; invTotals[rank] = calc['total'];
		calc['neededTotal'] += value/divisor;
	});
	crafted[highestRank] = Math.floor(maxInv[highestRank])
	calc['total'] = invTotals[highestRank];
	if (['EXP', 'Ore'].includes(item)){ //Pivot only has one rank for these
		const total = Math.floor(getTotals()[category][item])
		crafted[highestRank] = calc['total'] = total
	}

	let isDayGated = ['BOOKS', 'TROPHIES'].includes(category);
	let costResin = ['WEEKLY_DROPS', 'BOSSES', 'GEMS'].includes(category);
	let diff = calc['neededTotal'] - calc['total'];
	if (diff > 0 && (isDayGated || costResin)){
		const DROP_RATE = loadStatic().drop_rates[category][highestRank]
		diff *= 3**(lastIndex - highestIndex); //convert diff to highest rank
		let runs = Math.ceil(diff/DROP_RATE), time;
		switch (category){
			case 'WEEKLY_DROPS':
				time = pluralize(runs, 'week');
				break;
			case 'BOSSES':
			case 'GEMS':
				time = pluralize(Math.ceil(runs/4.5), 'day');//180/40 resin
				break;
			default:
				time = pluralize(Math.ceil(runs/9), 'day');//180/90 resin
		}
		calc['runs'] = `(${pluralize(runs, 'run')} ~ ${time})`;
	}
	if (isDayGated){
		let index = Object.keys(DBM[category]).indexOf(item);
		calc['runs'] += ` [${DAYS[index % 3]}]`;
	}
	return [crafted, calc];
}

function pluralize(num, string){
	return num > 1 ? num+' '+string+'s' : num+' '+string;
}

/**--SORT PIVOT-- */
function sortOrder(pCategory){
	return function (a, b){
		let category = translate(pCategory)
		a = decode(pCategory, a[0]), b = decode(pCategory, b[0]);
		let items = Object.keys(DBM[category]);
		return items.indexOf(a) - items.indexOf(b)
	}
}

/**--SWITCH: CHANGE FILTER OBTAINED */
function toggleSwitch(Element){
	document.body.style.setProperty('--filter', Element.checked ?
		'contents' : 'none')
	resize();
}

/**--RESIZE-- */
function resize(){
	const HomeStyle = getComputedStyle(document.getElementById('home'))
	let r = parseFloat(HomeStyle.getPropertyValue('grid-auto-rows'))
	let g = parseFloat(HomeStyle.getPropertyValue('grid-column-gap'))

	const VarStyle = getComputedStyle(document.getElementById('var'))
	let p = parseFloat(VarStyle.getPropertyValue('padding'))
	let t = parseFloat(VarStyle.getPropertyValue('height'))

	let m = [], o = t + p;

	const Containers = document.querySelectorAll('.js-section:not(.hide)');
	for (let x = 0; x < Containers.length; x++){
		const Section = Containers[x]
		const Table = Section.querySelector('.js-table')
		let h = Table.getBoundingClientRect().height;
		let calc = Math.ceil((o + h + g)/r)
		Section.style.gridRow = `span ${calc}`;
		let i = getComputedStyle(Section).getPropertyValue('grid-column-start')
		m[i] = 1
	}

	let c = HomeStyle.getPropertyValue('--temp');

	let template = c.split('minmax')
	for (let i = 1; i < template.length; i++){
		if (m[i]) template[i] = 'minmax'+template[i];
		else template[i] = '0 ';
	}
	const prop = template.join('')

	document.getElementById('home').style.gridTemplateColumns = prop;
}

const QUERIES = [767, 1024, 1200]
QUERIES.forEach(q =>
	window.matchMedia(`(min-width: ${q}px)`).addEventListener('change', resized))
function resized(){
	resize();
}
