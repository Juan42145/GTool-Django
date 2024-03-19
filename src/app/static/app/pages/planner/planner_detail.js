setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBC = loadCharacters();
	window.DBW = loadWeapons();
	window.user = loadUser()
	window.userInv = user.INVENTORY
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;
	
	page()
}
let objName, isChar

/**--RENDER-- */
function page(){
	const data = document.getElementById('page').dataset
	objName = data.name; isChar = data.kind === 'character'
	makePage();
}

function makePage(){
	if(getCalc()) calculate(); let calculator = getCalculator();
	
	document.getElementById('page').dataset.color =
		isChar? DBC[objName].ELEMENT: DBW[objName].RARITY;
	const Page = document.getElementById('page-container'); Page.innerHTML = '';

	const Data = create(Page, 'div', {'class':'page__data'})
	const Name = createTxt(Data, 'div', {'class':'page__data--objName'}, objName)
	const Img = createImg(Data, 'page__data--image',
		isChar? getCharacter(objName): getWeapon(objName))
	
	farming = isChar? calculator.CHARACTERS[objName]: calculator.WEAPONS[objName]
	// Object.values(farming).forEach((costs)=>{
	// 	makeTBL(Page, costs, true)
	// })
	if(isChar){
		makeTBL(Page, farming.AFARM, true)
		levelChar(Page)
		makeTBL(Page, farming.TFARM, true)
		levelTln(Page)
	} else{
		makeTBL(Page, farming.FARM, true)
		levelWpn(Page)
	}
}

function makeTBL(Page, costs, isInv){
	const Table = create(Page, 'div', {'class':'tbl'})
	if(!isInv) Table.classList.add('tbl--level')
	let complete = true, content = false;
	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		if(!cMaterials) return;
		let nonEmpty = Object.values(cMaterials).some(v => v !== 0);
		if(!nonEmpty) return

		content = true;
		const TCont = create(Table, 'div', {'class':'tbl__cont',})

		let c = makeData(TCont, cCategory, cItem, cMaterials, isInv);
		complete &&= c;
		if(isInv) makeInv(TCont, cCategory, cItem, cMaterials);
	})
	return complete && content
}

function makeData(TCont, cCategory, cItem, cMaterials, isInv){
	let category = translate(cCategory), item = decode(cCategory, cItem);
	let iMaterials = uGet(userInv[category]?.[item], 0)
	let calc = 
		isInv? getInventory(category, item, cMaterials): iMaterials;
	let convert = []
	Object.entries(cMaterials).reverse().forEach(([rank, value], mi) => {
		let prevConv = convert[+rank+1]? convert[+rank+1] : 0;
		convert[rank] = prevConv*3 + value - iMaterials[rank];
		convert[rank] = convert[rank] < 0? 0: convert[rank]

		if(!value) { //Add converter to empty cards
			if(convert[rank] && isInv){
				const Card = create(TCont, 'div', {'class':'card converter'})
				Card.style = 'grid-row: 1; grid-column: '+ (+mi+1);
				Card.addEventListener('mouseover', ()=>tooltip.show(cItem + ' ' + convert[rank]))
				Card.addEventListener('mouseout', ()=>tooltip.hide())
			}
			return
		};
		const Card = create(TCont, 'div', {'class':'card js-card r_'+rank})
		Card.style = 'grid-row: 1; grid-column: '+ (+mi+1);
		if(cCategory === 'MORA') Card.classList.add('card--long');

		let tt = cItem
		Card.addEventListener('mouseover', ()=>tooltip.show(tt))
		Card.addEventListener('mouseout', ()=>tooltip.hide())

		const Img = createImg(Card, 'card__image', getImage(category,item,rank))

		const Inv = createTxt(Card, 'div', {'class':'card__inv p'},
			calc[rank].toLocaleString('en-us'))
		const Need = createTxt(Card, 'div', {'class':'card__need p'},
			'/' + value.toLocaleString('en-us'))

		if(calc[rank] >= value){
			Card.classList.add('completed');
			if(isInv) tt += ' ' + convert[rank]
		}

		if(iMaterials[rank] >= value) Card.classList.add('obtained');
		
	});

	let complete = TCont.querySelectorAll('.js-card').length <= TCont.querySelectorAll('.completed').length;
	return complete;
}

function makeInv(TCont, cCategory, cItem, cMaterials){
	let category = translate(cCategory), item = decode(cCategory, cItem)
	let iMaterials = userInv[category]?.[item];
	let index = 1;
	Object.keys(cMaterials).reverse().forEach((rank) => {
		const Card = create(TCont, 'div', {'class':'card r_'+rank})
		Card.style = 'grid-row: 2; grid-column: ' +index;
		index++;

		const Img = createImg(Card, 'card__image', getImage(category, item, rank))
		
		let uValue = iMaterials?.[rank] ?? 0
		const Input = createNumInput(Card, {'data-column':rank}, uValue)
		Input.addEventListener('blur',()=>{
			Input.value = +Input.value
			
			uSet(userInv, [category,item,rank], +Input.value)
			storeUserI(user, userInv)

			processTotals(category, item); makePage();
		}, false);
	});
}

function levelChar(Page){
	const state = uGet(userChar[objName],''); const info = DBC[objName];
	let start = +state.PHASE, end = (start+1) <= +state.TARGET? start+1: +state.TARGET;
	let costs = calcCharA(info, [start,end], false)
	makeLevel(Page, costs, 'PHASE')
}

function levelTln(Page){
	const GT = create(Page, 'div', {'class':'group--tln'});
	const state = uGet(userChar[objName],''); const info = DBC[objName];
	let start, end, costs;
	start = state.NORMAL? +state.NORMAL: 1;
	end = (start+1) <= +state.TNORMAL? start+1: +state.TNORMAL;
	costs = calcCharT(info, [[start,end],[0,0],[0,0]], false);
	makeLevel(GT, costs, 'NORMAL')
	start = state.SKILL? +state.SKILL: 1;
	end = (start+1) <= +state.TSKILL? start+1: +state.TSKILL;
	costs = calcCharT(info, [[0,0],[start,end],[0,0]], false);
	makeLevel(GT, costs, 'SKILL')
	start = state.BURST? +state.BURST: 1;
	end = (start+1) <= +state.TBURST? start+1: +state.TBURST;
	costs = calcCharT(info, [[0,0],[0,0],[start,end]], false);
	makeLevel(GT, costs, 'BURST')
}

function levelWpn(Page){
	const state = uGet(userWpn[objName],''); const info = DBW[objName];
	let start = +state.PHASE, end = (start+1) <= +state.TARGET? start+1: +state.TARGET;
	let costs = calcWpn(info, [start,end,info.RARITY], false)
	makeLevel(Page, costs, 'PHASE')
}

function makeLevel(Page, costs, attribute){
	const LVL = create(Page, 'div', {'class':'level'});
	let isComplete = makeTBL(LVL, costs, false)
	if(!isComplete) return

	let uAttributes = isChar? uGet(userChar[objName], 0): uGet(userWpn[objName], 0)
	let l = (isChar && attribute !== 'PHASE' && !uAttributes[attribute])?
			1:
			+uAttributes[attribute];
	let inc = ' (' + l + ' ⇒ ' + (l+1) + ')'

	const BTN = create(LVL, 'button', {'class':'lvlbtn'})
	BTN.textContent = 'Level Up '+attribute+inc;
	BTN.addEventListener('click', ()=>{consume(costs, attribute)})
}

/**--INVENTORY CRAFTING PROCESSING-- */
function getInventory(category, item, cMaterials){
	/*
	crafted: copy that holds inventory after possible crafting
	maxInv: copy that holds maximum inventory obtained through crafting (defaultdict)
	*/
	let iMaterials = userInv[category]?.[item]
	let crafted = {...maxInv} = {...iMaterials};
	maxInv = uGet(maxInv, 0)
	let len = Object.keys(cMaterials).length, highestRank = 0;
	Object.entries(cMaterials).forEach(([rank, value], mIndex) => {
		maxInvRank = maxInv[rank]

		if(value !== 0) highestRank = rank;
		if(mIndex+1 < len && maxInvRank > value){//Next rank exists & inv > need value
			crafted[rank] = +value
			maxInv[+rank+1] += Math.floor(maxInvRank - value)/3;
		} else{
			crafted[rank] = Math.floor(maxInvRank);
		}
	});
	crafted[highestRank] = Math.floor(maxInv[highestRank]);
	if(item === 'EXP' || item === 'Ore'){
		// crafted[highestRank] = Math.floor(maxInv[0])//inv 0 is total
	}
	return crafted;
}

/**--LEVELING UPDATE-- */
function consume(costs, attribute){
	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		let category = translate(cCategory), item = decode(cCategory, cItem)
		Object.entries(cMaterials).forEach(([rank, value]) => {
			if(!value) return
			userInv[category][item][rank] -= value;
		})
	})

	storeUserI(user, userInv)

	if(isChar) incrementC(attribute)
	else incrementW(attribute)
	toasty('Leveled Up '+attribute)
	makePage();
}

function incrementC(cAttribute){
	let defaultValue = cAttribute !== 'PHASE' && !userChar[objName][cAttribute]? 1:0
	let cValue = userChar[objName][cAttribute] ?? defaultValue
	cValue++
	uSet(userChar[objName], [cAttribute], cValue);
	setCalc(true); storeUserC(user, userChar);
}

function incrementW(wAttribute){
	let wValue = userChar[objName][wAttribute] ?? 0
	wValue++
	uSet(userWpn[objName], [wAttribute], wValue);
	setCalc(true); storeUserW(user, userWpn)
}
