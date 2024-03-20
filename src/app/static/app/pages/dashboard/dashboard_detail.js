//setup in dashboard.js
function pageLoad(){
	window.DBM = loadMaster()
	window.REGION = Object.keys(DBM.ELEMENTS)
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	page()
}
let pCategory

function page(){
	pCategory = document.getElementById('page').dataset.category
	pMQ.forEach(mq => {mq.addEventListener('change',handleMedia)})
	makePage();
}

/**--RENDER-- */
function makePage(){
	let isTotal = Object.keys(getTotals()).includes(translate(pCategory))
	console.log(isTotal)

	if(!isTotal) document.getElementById('page').classList.add('page--nt')

	const Page = document.getElementById('page-container'); Page.innerHTML = '';
	const Table = create(Page, 'div', {'class':'section__table section__table--inv','data-total':isTotal})
	
	Object.entries(getPivot()[pCategory]).sort(sortOrder(pCategory)).forEach((pItemData, indexItem) => {
		let complete = makeRow(Table, pCategory, pItemData, indexItem, true);
		makeInv(Table, pCategory, pItemData, indexItem, complete);
	})

	if(pCategory === 'RESOURCES'){
		let aMora = ['Mora',{'3':0}], tMora = ['Mora',{'3':0}], wMora = ['Mora',{'3':0}];
		Object.values(getCalculator().CHARACTERS).forEach(character => {
			aMora[1][3] += character.AFARM.MORA[1]? character.AFARM.MORA[1][3]: 0;
			tMora[1][3] += character.TFARM.MORA[1]? character.TFARM.MORA[1][3]: 0;
		})
		Object.values(getCalculator().WEAPONS).forEach(weapon => {
			wMora[1][3] += weapon.WFARM.MORA[1]? weapon.WFARM.MORA[1][3]: 0;
		})

		const Div = create(Page, 'div', {'class':'page__dets'})
		const Sec = create(Div, 'div', {'class':'section'})

		const Title = createTxt(Sec, 'div', {'class': 'section__title'}, 'Mora')

		const Details = create(Sec, 'div', {'class':'section__table','data-total':isTotal})
		makeDets(Details, 'RESOURCES', 'Characters', aMora, 0);
		makeDets(Details, 'RESOURCES', 'Talents', tMora, 1);
		makeDets(Details, 'RESOURCES', 'Weapons', wMora, 2);
	}

	if(pCategory === 'COMMON'){
		let common = {'Characters': {}, 'Talents': {}, 'Weapons': {}};
		Object.values(getCalculator().CHARACTERS).forEach(character => {
			if(character.AFARM.COMMON[1])
				pivot(common, 'Characters', character.AFARM.COMMON[0], character.AFARM.COMMON[1])
			if(character.TFARM.COMMON[1])
				pivot(common, 'Talents', character.TFARM.COMMON[0], character.TFARM.COMMON[1])
		})
		Object.values(getCalculator().WEAPONS).forEach(weapon => {
			if(weapon.WFARM.COMMON[1])
				pivot(common, 'Weapons', weapon.WFARM.COMMON[0], weapon.WFARM.COMMON[1])
		})

		const Div = create(Page, 'div', {'class':'page__dets'})
		Object.entries(common).forEach(([farmName, cItems]) => {
			const Sec = create(Div, 'div', {'class':'section'})

			const Title = createTxt(Sec, 'div', {'class':'section__title'}, farmName)

			const Details = create(Sec, 'div', {'class':'section__table','data-total':isTotal})

			Object.entries(cItems).forEach(([cItem, cMaterials], indexItem) => {
				makeDets(Details, 'ENEMIES', cItem, [cItem, cMaterials], indexItem);
			})
		});
	}
}

function makeInv(Table, pCategory, pItemData, indexItem, complete){
	let pItem = pItemData[0]
	let category = translate(pCategory), item = decode(pCategory, pItem)
	let mMaterials = DBM[category][item];
	let rowi = getComputedStyle(document.getElementById('page')).getPropertyValue('--rowi')
	let coli = getComputedStyle(document.getElementById('page')).getPropertyValue('--coli')

	const Row = create(Table, 'div', {'class':'row home-inv'})

	if(Table.dataset.total === 'true') Row.style = 'grid-row: '+(2*indexItem + +rowi);
	else Row.style = 'grid-row: '+(indexItem+1);

	if(complete) Row.classList.add('completed');
	else Row.classList.remove('completed');

	let index = +coli;
	Object.keys(mMaterials).reverse().forEach((rank) => {
		if(isNaN(rank)) return
		const Card = create(Row, 'div', {'class':'row__card r_'+rank})

		if(Table.dataset.total === 'true') Card.style = 'grid-column: '+index;
		else Card.style = 'grid-column: 5';
		index++;

		const Img = createImg(Card, 'row__card--img', getImage(category, item, rank))
		
		let value = userInv[category]?.[item]?.[rank] ?? 0
		const Input = createNumInput(Card, {'data-column':rank}, value)
		Input.addEventListener('blur',()=>{
			if(Input.value == '') Input.value = 0;
			
			uSet(userInv, [category,item,rank], +Input.value)
			storeUserI(user, userInv)
			processTotals(category, item);
			makeRow(Table, pCategory, pItemData, indexItem, true);
		}, false);
	});
}

function makeDets(Table, category, displayName, cItemData, indexItem){
	let [cItem, cMaterials] = cItemData; //No need to decode cItem no weekly drop
	
	const Row = create(Table, 'div', {'class':'row row--dets'})
	Row.style = 'grid-row: '+(indexItem+1);

	const Name = createTxt(Row, 'div', {'class':'row__name'}, displayName)

	let counter = 0, total = 0;
	Object.entries(cMaterials).reverse().forEach(([rank, value], indexMat) => {
		let index = indexMat+3;
		total += value/(3**counter); counter++;
		if(!value) return;

		const Card = create(Row, 'div', {'class':'row__card r_'+rank});
		Card.style = 'grid-column: '+index;

		const Img = createImg(Card, 'row__card--img', getImage(category, cItem, rank))

		const Need = createTxt(Card, 'div', {'class':'p'}, value.toLocaleString('en-us'));
	});
	if(Table.dataset.total === 'true'){
		const Total = create(Row, 'div', {'class':'row__total'})

		const Need = createTxt(Total, 'div', {'class':'p'}, Math.floor(total*100)/100)
	}
}

/**--PIVOT-- */
function pivot(calcPivot, farmName, cItem, cMaterials){
	let nonEmpty = Object.values(cMaterials).some(v => v !== 0);
	if (!nonEmpty) return
	let pivotItems = calcPivot[farmName]
	pivotItems[cItem] = cItem in pivotItems?
		vadd(pivotItems[cItem], cMaterials): cMaterials;
}

/**--RESIZE-- */
pQueries = [767, 1024]
pMQ = []
pQueries.forEach(q => {pMQ.push(window.matchMedia(`(min-width: ${q}px)`))})
function handleMedia(){
	console.log('handle')
	makePage();
}
