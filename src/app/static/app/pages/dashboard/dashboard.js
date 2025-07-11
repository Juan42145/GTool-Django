"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBM = loadMaster()
	window.user = loadUser()
	window.userInv = user.INVENTORY;

	window.REGION = {
		"Mondstadt": "Anemo",
		"Liyue": "Geo",
		"Inazuma": "Electro",
		"Sumeru": "Dendro",
		"Fontaine": "Hydro",
		"Natlan": "Pyro",
		"Snezhnaya": "Cryo",
	}
	renderDashboard()
}
const DAYS = ['Mo/Th', 'Tu/Fr', 'We/Sa']
const today = (new Date()).getDay();

/**--RENDER-- */
function renderDashboard(){
	if(getCalc()) calculate();

	Object.entries(getPivot()).forEach(pCategories => {
		let [pCategory, pItems] = pCategories;

		let pItemArray = Object.entries(pItems)
		if(pItemArray.length === 0) return;

		const Sec = document.getElementById(pCategory);
		Sec.classList.remove('hide'); Sec.innerHTML = '';

		const Title = createTxt(Sec, 'div', 'section__title active',
			pCategory.replace('_',' '));

		const isTotal = Sec.classList.contains('section--total')
		const Table = create(Sec, 'div',
			{'class':'section__table js-table', 'data-total':isTotal})

		if(pCategory === 'GEMS'){
			Title.classList.remove('active')
			Table.classList.add('hide')
		}
		makeAccordion(Title, Table)

		pItemArray.sort(sortOrder(pCategory)).forEach((pItemData, indexItem) => {
			makeRow(Table, pCategory, pItemData, indexItem, false);
		});
	});
}

function makeAccordion(accordion, panel){
	accordion.addEventListener('click', () => {
		accordion.classList.toggle('active')
		panel.classList.toggle('hide')
	})
}
let debug = true
function makeRow(Table, pCategory, pItemData, indexItem, isPage){
	let [pItem, pMaterials] = pItemData;

	let Row = document.getElementById('r_'+pItem)
	if(Row && isPage) Row.innerHTML = '';
	else Row = create(Table, 'div', {'class':'row'})

	let detailData = [pCategory, pItemData, indexItem]
	if(!isPage) Row.addEventListener('click', () => 
		makePopup(detailData, Table.dataset.total));

	const Name = createTxt(Row, 'div', 'row__name', pItem)

	if(isPage) Row.id = 'r_'+pItem;
	if(pCategory === 'RESOURCES') Row.classList.add('row--long');

	if(['BOOKS', 'TROPHIES', 'WEEKLY_DROPS'].includes(pCategory))
		setDatasetStyle(pCategory, pItem, Name, isPage);

	let category = translate(pCategory), item = decode(pCategory, pItem);
	const [crafted, calc] = getInventory(category, item, pMaterials);
	Object.entries(pMaterials).reverse().forEach(([rank, value]) => {
		if(!value) return

		const Card = create(Row, 'div', {'class':'row__card js-card r_'+rank})

		/*Img*/createImg(Card, 'row__card--img', getImage(category, item, rank))

		/*Inv*/createTxt(Card, 'div', 'p row__card--inv',
			crafted[rank].toLocaleString('en-us'))
		/*Need*/createTxt(Card, 'div', 'p row__card--need',
				'/'+value.toLocaleString('en-us'))

		if (crafted[rank] >= value) Card.classList.add('completed');
		else Card.classList.remove('completed');
	});

	if (calc['runs']) /*Runs*/createTxt(Name, 'span', '', calc['runs'])

	const numCards = Row.querySelectorAll('.js-card').length
	let complete = numCards <= Row.querySelectorAll('.completed').length;
	if (complete) Row.classList.add('completed')
	else Row.classList.remove('completed')

	if (Table.dataset.total === 'true'){
		const Total = create(Row, 'div', {'class':'row__total'})

		/*Inv*/createTxt(Total, 'div', 'p row__card--inv',
			(Math.floor(calc['total'] * 100) / 100).toLocaleString('en-us'))
		/*Need*/createTxt(Total, 'div', 'p row__card--need',
				(Math.floor(calc['neededTotal'] * 100) / 100).toLocaleString('en-us'))

		if (['BOOKS', 'TROPHIES'].includes(pCategory))
			setDatasetStyle(pCategory, pItem, Total, isPage);
	}
}

function setDatasetStyle(pCategory, pItem, Element, isPage){
	let item = decode(pCategory, pItem)
	let index = Object.keys(DBM[pCategory]).indexOf(item);
	Element.classList.add('cell-color');
	if (pCategory === 'WEEKLY_DROPS'){
		Element.dataset.color = Object.values(REGION)[Math.floor(index / 6)];
	} else{
		Element.dataset.color = REGION[DBM[pCategory][pItem].data];
		if (!isPage && (today === 0 || (today - 1) % 3 === index % 3))
			Element.parentElement.classList.add('domain');
	}
}

/**--POP UP-- */
function makePopup(detailData, isTotal){
	const Popup = document.getElementById('pop-up')
	Popup.innerHTML = ''
	Popup.showModal()

	const Container = createDiv(Popup, 'popup')

	const Close = create(Container, 'button', {'class':'btn btn--clear icon-box'})
	createIcon(Close, '#X')
	Close.addEventListener('click', () => closePopup())

	const Content = createDiv(Container, 'popup__content')
	makeDetail(Content, detailData, isTotal)

	Popup.addEventListener("click", (e) => {
		if(e.target === Popup) closePopup();
	});
}

function closePopup(){
	const Popup = document.getElementById('pop-up')
	renderDashboard()
	Popup.close()
	Popup.innerHTML = ''
}

/**--DETAILS-- */
function makeDetail(Page, [pCategory, pItemData, indexItem], isTotal){
	console.log('makeDetail')
	if(pCategory === 'RESOURCES') isTotal = 'true'
	const Table = create(Page, 'div',
		{'class':'section__table details', 'data-total':isTotal})
	if(isTotal === 'false') Table.classList.add('details--single')
	if(pCategory === 'RESOURCES') Table.classList.add('details--long')
	
	makeRow(Table, pCategory, pItemData, indexItem, true);
	makeInv(Table, pCategory, pItemData, indexItem);
}

function makeInv(Table, pCategory, pItemData, indexItem){
	let pItem = pItemData[0]
	let category = translate(pCategory), item = decode(pCategory, pItem)
	let mMaterials = DBM[category][item];

	const Row = create(Table, 'div', {'class':'row row--inv'})

	Object.keys(mMaterials).reverse().forEach((rank) => {
		if (isNaN(rank)) return
		const Card = create(Row, 'div', {'class':'row__card r_'+rank})

		/*Img*/createImg(Card, 'row__card--img', getImage(category, item, rank))
		
		let value = userInv[category]?.[item]?.[rank] ?? 0
		const Input = createNumInput(Card, {}, value)
		Input.addEventListener('blur',() => {
			if (Input.value === '') Input.value = 0;
			
			uSet(userInv, [category,item,rank], +Input.value)
			storeUserI(user, userInv)
			processTotals(category, item);
			makeRow(Table, pCategory, pItemData, indexItem, true);
		}, false);
	});
}

/**--INVENTORY CRAFTING PROCESSING-- */
function getInventory(category, item, pMaterials){
	/*
	crafted: copy that holds inventory after possible crafting
	maxInv: copy that holds maximum inventory obtained through crafting
	*/
	let iMaterials = userInv[category]?.[item]
	const crafted = {...iMaterials};
	const maxInv = uGet({...iMaterials }, 0) //defaultdict
	const lastIndex = Object.keys(pMaterials).length - 1
	let highestRank, highestIndex
	const invTotals = {} //Holds calculated total at each rank
	const calc = {
		total: 0, //Total needs to be calculated for when not all ranks are present
		neededTotal: 0,
		runs: ''
	}

	Object.entries(pMaterials).forEach(([rank, value], indexMat) => {
		if(value !== 0) [highestRank, highestIndex] = [rank, indexMat]
		if(indexMat < lastIndex && maxInv[rank] > value){
			//Next rank exists & inv > need value
			crafted[rank] = +value
			maxInv[+rank + 1] += Math.floor((maxInv[rank] - value) / 3);
		} else{
			crafted[rank] = Math.floor(maxInv[rank]);
		}

		let uValue = iMaterials?.[rank] ?? 0
		let divisor = 3 ** (lastIndex - indexMat)
		calc['total'] += uValue / divisor; invTotals[rank] = calc['total'];
		calc['neededTotal'] += value / divisor;
	});
	crafted[highestRank] = Math.floor(maxInv[highestRank])
	calc['total'] = invTotals[highestRank];
	if(['EXP', 'Ore'].includes(item)){//Pivot only has one rank for these
		const total = Math.floor(getTotals()[category][item])
		crafted[highestRank] = calc['total'] = total
	}

	let isDayGated = ['BOOKS', 'TROPHIES'].includes(category);
	let costResin = ['WEEKLY_DROPS', 'BOSSES', 'GEMS'].includes(category);
	let diff = calc['neededTotal'] - calc['total'];
	if(diff > 0 && (isDayGated || costResin)){
		const DROP_RATE = loadStatic().drop_rates[category][highestRank]
		diff *= 3 ** (lastIndex - highestIndex); //convert diff to highest rank
		let runs = Math.ceil(diff / DROP_RATE), time;
		switch (category){
			case 'WEEKLY_DROPS':
			case 'GEMS':
				// time = pluralize(runs, 'week');
				break;
			case 'BOSSES':
				time = pluralize(Math.ceil(runs / 4.5), 'day');//180/40 resin
				break;
			default:
				time = pluralize(Math.ceil(runs / 9), 'day');//180/20 resin
		}
		if(time) calc['runs'] = runs+' ~ '+time;
	}
	if(isDayGated){
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
		'inherit' : 'none')
}
