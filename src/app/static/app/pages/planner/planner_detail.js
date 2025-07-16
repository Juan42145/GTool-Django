"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBM = loadMaster()
	window.DBC = loadCharacters();
	window.DBW = loadWeapons();
	window.user = loadUser()
	window.userInv = user.INVENTORY
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;
	
	renderPage()
}
let objName, isChar

/**--RENDER-- */
function renderPage(){
	const data = document.getElementById('page').dataset
	objName = data.name; isChar = data.kind === 'character'

	const info = isChar ? DBC[objName] : DBW[objName]
	data.color = isChar ? info.ELEMENT : info.RARITY;
	const image = isChar ? getCharacter(objName) : getWeapon(objName)
	const Image = document.getElementById('page-image')
	Image.src = image; Image.classList.add('r_'+info.RARITY)

	makePage()
}

function makePage(){
	renderEdit()
	makeContent()
}

function makeContent(){
	renderInventory();
	renderUpgrade();
}

/**--EDIT PANEL-- */
function renderEdit(){
	const Edit = document.getElementById('page-edit')
	Edit.innerHTML = ''
	let state = isChar ?
		uGet(userChar[objName], '') : uGet(userWpn[objName], '')
	makeInputs(Edit, 'Levels', [{PHASE: state.PHASE, TARGET: state.TARGET}]);
	if (isChar){
		makeInputs(Edit, 'Talents', [
			{NORMAL: state.NORMAL, TNORMAL: state.TNORMAL},
			{SKILL: state.SKILL, TSKILL: state.TSKILL},
			{BURST: state.BURST, TBURST: state.TBURST}]);
	}
}

function makeInputs(Root, label, pairs){
	const Div = createDiv(Root, 'edit__inputs')
	createTxt(Div, 'div', 'edit__label', label)
	pairs.forEach((pair) => {
		const uValues = Object.entries(pair)
		makeInput(Div, uValues[0])
		const Arrow = createDiv(Div, 'edit__arrow')
		createIcon(Arrow, '#Arrow')
		makeInput(Div, uValues[1])
	});
}

function makeInput(Div, [uAttribute, uValue]){
	const Input = createNumInput(Div, {'class':'edit__input'}, uValue)
	Input.addEventListener('blur',() => {
		const updater = isChar ? updateC : updateW
		updater(objName, uAttribute, Input.value);
		makeContent()
	}, false);
}

/**--INVENTORY REQUIREMENTS-- */
function renderInventory(){
	if (getCalc()) calculate(); let calculator = getCalculator();

	const Page = document.getElementById('page-inventory'); Page.innerHTML = '';
	
	const farming = isChar ?
		calculator.CHARACTERS[objName] : calculator.WEAPONS[objName]

	const costs = mergeCosts(Object.values(farming))
	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		if (!cMaterials) return;
		const cMaterialsArray = Object.values(cMaterials)
		const nonEmpty = cMaterialsArray.some(v => v !== 0);
		if (!nonEmpty) return
		
		let category = translate(cCategory), item = decode(cCategory, cItem)

		const Group = createDiv(Page, 'inventory__item-group')
		const Actions = createDiv(Group, 'inventory__actions')
		if (cMaterialsArray.length > 1){
			const Craft = createDiv(Actions,
				'btn btn--ii icon-box inventory__btn inventory__btn--craft')
			createIcon(Craft, '#Craft')
			Craft.addEventListener('click', () =>
				makeCraft(category, item, cMaterials))
		}
		if (['GEMS','WEEKLY_DROPS'].includes(category)){
			const Convert = create(Actions, 'button',
				{'class':'btn btn--ii icon-box inventory__btn'})
			createIcon(Convert, '#Convert')
			Convert.addEventListener('click', () =>
				makeConvert(category, item, cMaterials))
		}
		
		const Requirements = createDiv(Group, 'inventory__requirements')
		makeRequirements(Requirements, category, item, cMaterials)
		const Materials = createDiv(Group, 'inventory__materials')

		Object.keys(DBM[category][item]).reverse().forEach((rank) => {
			if (isNaN(rank)) return
			
			const Card = createDiv(Materials, 'card material')
			const Img = createImg(Card, 'material__image r_'+rank,
				getImage(category, item, rank))
			makeTooltip(Img, cItem)

			let value = userInv[category]?.[item]?.[rank] ?? 0
			const Input = createNumInput(Card, {'class':'material__input'}, value)
			Input.addEventListener('blur',() => {
				Input.value = +Input.value;
				uSet(userInv, [category,item,rank], +Input.value)
				storeUserI(user, userInv)
				processTotals(category, item);
				makeRequirements(Requirements, category, item, cMaterials)
				renderUpgrade()
			}, false);
		});
	})
}

function makeRequirements(Requirements, category, item, cMaterials, extra){
	Requirements.innerHTML = ''
	let inv = uGet({...userInv[category]?.[item]}, 0)
	if (extra){
		Object.entries(extra.usedMaterials).forEach(([rank, value]) => {
			inv[rank] -= value
			if (inv[rank] < 0){
				inv[+rank - 1] += 3*inv[rank]
				inv[rank] = 0
			}
		})
	}
	const [crafted, calc] = getCrafted(category, item, cMaterials, inv);
	Object.entries(cMaterials).reverse().forEach(([rank, value]) => {
		if (extra && !value) return
		const Required = createDiv(Requirements, 'card')
		if (!value) return

		Required.classList.add('required')
		if (item === 'Mora') Required.classList.add('required--long');

		/*Inv*/createTxt(Required, 'div', 'required__inventory',
			crafted[rank].toLocaleString('en-us'))
		/*Slash*/createTxt(Required, 'div', 'required__slash', '/')
		/*Need*/createTxt(Required, 'div', 'required__value',
			value.toLocaleString('en-us'))

		if (crafted[rank] >= value)
			Required.classList.add('required--completed')
		if (inv[rank] >= value)
			Required.classList.add('required--obtained')

		if (extra){
			const Card = createDiv(Requirements, 'card material')
			const Img = createImg(Card, 'material__image r_'+rank,
				getImage(category, item, rank))
			makeTooltip(Img, item)
		}
	});

	if (extra) return calc
	if (calc['isObtained']){
		Requirements.parentElement.classList.add('item-group--obtained')
		Requirements.parentElement.classList.remove('item-group--completed')
	}
	else if (calc['isCompleted']){
		Requirements.parentElement.classList.add('item-group--completed')
		Requirements.parentElement.classList.remove('item-group--obtained')
	} else{
		Requirements.parentElement.classList.remove('item-group--obtained')
		Requirements.parentElement.classList.remove('item-group--completed')
	}
}

/**--UPGRADE PANELS-- */
function renderUpgrade(){
	let [nonEmpty, upgradable, attributeData, upgradeCosts] = getMaxUpgrades()

	const Upgrade = document.getElementById('upgrade')
	if (!nonEmpty){
		Upgrade.classList.add('hide')
		return
	} else Upgrade.classList.remove('hide')

	const Area = Upgrade.querySelector('#upgrade-area')
	Area.innerHTML = ''
	createTxt(Area, 'div', 'upgrade__title', upgradable ?
		'Upgrade' : 'Cannot Upgrade')
	const Msg = createTxt(Area, 'div', 'upgrade__msg', upgradable ?
		'' : 'Insufficient Materials')
	if (upgradable){
		Area.classList.remove('upgrade--insufficient')
		attributeData.forEach(([label, [from, to]]) => {
			if (!isNaN(label)) label = ['Normal', 'Skill', 'Burst'][label]
			if (to === from) return
			const Attribute = createDiv(Msg, 'upgrade__attribute')
			createTxt(Attribute, 'div', '', label+': '+from)
			const Arrow = createDiv(Attribute, 'edit__arrow')
			createIcon(Arrow, '#Arrow')
			createTxt(Attribute, 'div', '', to)
		})
		const Btn = create(Area, 'button', {'class':'btn icon-box'})
		createIcon(Btn, '#X')
		Btn.addEventListener('click', () =>
			makeUpgradePanel(attributeData, upgradeCosts))
	} else{
		Area.classList.add('upgrade--insufficient')
	}

	// Next
	const Next = Upgrade.querySelector('#upgrade-next'); Next.innerHTML = ''
	let isNext = false
	const state = uGet(isChar ? userChar[objName] : userWpn[objName], '')
	const info = isChar ? DBC[objName] : DBW[objName]
	
	let [labelAscension, [_, lastAscension]] = attributeData[0]
	let labelTalent, lastTalent = 10, nextCosts = upgradeCosts
	if (isChar){
		let talentTargets = [+state.TNORMAL, +state.TSKILL, +state.TBURST]
		let talentLasts = [
			defaultTalent(state.NORMAL),
			defaultTalent(state.SKILL),
			defaultTalent(state.BURST)
		]
		attributeData.forEach(([label,[_,to]]) => {
			if (label === 'Phase') return
			talentLasts[label] = to
		})
		talentLasts.forEach((goal, i) => {
			if (goal < talentTargets[i] && goal < lastTalent){
				lastTalent = goal
				labelTalent = i
			}
		})
	}

	if (lastAscension < state.TARGET){
		Next.classList.remove('hide'); isNext = true
		
		let from = lastAscension, to = lastAscension+1
		let uData = [from, to]
		if (!isChar) uData.push(info.RARITY)
		
		const costCalc = isChar ? calcCharA : calcWpn
		const costs = costCalc(info, uData, false)

		makeNext(Next, labelAscension, from, to, costs, upgradeCosts)

		nextCosts = mergeCosts([upgradeCosts, costs])
	}

	if (lastTalent < 10){
		Next.classList.remove('hide'); isNext = true
		
		let from = lastTalent, to = lastTalent+1
		let uData = [[0, 0], [0, 0], [0, 0]]
		uData[labelTalent] = [from, to]
		const costs = calcCharT(info, uData, false)

		makeNext(Next, labelTalent, from, to, costs, nextCosts)
	}

	if(!isNext) Next.classList.add('hide')
}

function makeNext(Next, label, from, to, costs, usedCosts){
	if (!isNaN(label)) label = ['Normal', 'Skill', 'Burst'][label]
	createTxt(Next, 'div', 'upgrade__title', 'Next Upgrade')
	const Label = createDiv(Next, 'upgrade__attribute')
	createTxt(Label, 'div', '', label+': '+from)
	const Arrow = createDiv(Label, 'edit__arrow')
	createIcon(Arrow, '#Arrow')
	createTxt(Label, 'div', '', to)
	
	const Div = createDiv(Next, 'next__content')

	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		if (!cMaterials) return;
		const nonEmpty = Object.values(cMaterials).some(v => v !== 0);
		if (!nonEmpty) return
		
		let category = translate(cCategory), item = decode(cCategory, cItem);
		const Requirements = createDiv(Div, 'upgrade__requirements')
		makeRequirements(Requirements, category, item, cMaterials,
			{usedMaterials: usedCosts?.[cCategory]?.[1] ?? {}})
	})
}

/**--POP UP PANEL-- */
function makePopup(){
	const Popup = document.getElementById('pop-up')
	Popup.innerHTML = ''
	Popup.showModal()

	const Container = createDiv(Popup, 'popup')
	const Header = createDiv(Container, 'popup__header')
	const Content = createDiv(Container, 'popup__content')
	const Footer = createDiv(Container, 'popup__footer')

	const Close = create(Footer, 'button', {'class':'btn icon-box'})
	createIcon(Close, '#X')
	Close.addEventListener('click', () => closePopup())

	return [Header, Content, Footer]
}

function closePopup(){
	const Popup = document.getElementById('pop-up')
	Popup.close()
	Popup.innerHTML = ''
}

function makeCraft(category, item, cMaterials){
	const [Header, Content, Footer] = makePopup()
	
	const Craft = createDiv(Content, 'craft')
	const crafting = makeCraftMenu(Craft, category, item, cMaterials)

	createTxt(Header, 'div', '', 'Craft '+capitalize(category))

	const Confirm = create(Footer, 'button', {'class':'btn'})
	const Icon = createDiv(Confirm, 'icon-box')
	createIcon(Icon, '#Check')
	createTxt(Confirm, 'div', '', 'Craft')
	Confirm.addEventListener('click', () => {
		crafting()
		makeContent()
		closePopup()
	})
}

function makeCraftMenu(Menu, category, item, cMaterials){
	const hasBonus = category !== 'GEMS'

	const Values = createDiv(Menu, 'craft__values')
	if (hasBonus)
		createTxt(Menu, 'div', 'craft__title', 'Crafting Bonus')
	const Bonus = createDiv(Menu, 'craft__bonus')

	let iMaterials = uGet(userInv[category]?.[item], 0)
	let convert = {}, bonus = {}
	Object.entries(cMaterials).reverse().forEach(([rank, value]) => {
		let prevConv = convert[+rank + 1] ?? 0
		convert[rank] = prevConv*3 + value - iMaterials[rank]
		convert[rank] = convert[rank] < 0 ? 0 : convert[rank]
		bonus[rank] = 0
		
		if (convert[rank]){
			const Card = createDiv(Values, 'card material')
			createImg(Card, 'material__image r_'+rank, getImage(category, item, rank))
			createTxt(Card, 'div', 'craft__value', convert[rank])
		}

		if (hasBonus){
			const Card = createDiv(Bonus, 'card material')
			createImg(Card, 'material__image r_'+rank, getImage(category, item, rank))
			const Input = createNumInput(Card, {'class':'material__input'}, bonus[rank])
			Input.addEventListener('blur', () => {
				Input.value = +Input.value
				bonus[rank] = +Input.value
			}, false);
		}
	})

	return () => {Object.keys(convert).forEach((rank) => {
		let add = convert[rank] + bonus[rank]
		let remove = convert[+rank + 1] ?? 0
		remove *= 3

		iMaterials[rank] += add
		iMaterials[rank] -= remove
		uSet(userInv, [category,item,rank], iMaterials[rank])
		storeUserI(user, userInv)
		processTotals(category, item);
	})}
}

function makeConvert(category, item, cMaterials){
	const [Header, Content, Footer] = makePopup()

	const Convert = createDiv(Content, 'convert')
	if (category === 'WEEKLY_DROPS') Convert.classList.add('convert--single')
	
	const Inventory = createDiv(Convert, 'convert__inventory')
	const Values = createDiv(Convert, 'convert__values')
	createTxt(Convert, 'div', 'convert__title', 'Conversion Materials')
	const Materials = createDiv(Convert, 'convert__materials convert--subgrid')
	
	createTxt(Header, 'div', '', 'Convert '+capitalize(category))

	const [crafted, calc] = getCrafted(category, item, cMaterials);
	let maxIndex = 0
	let convert = {}
	let iMaterials = uGet(userInv[category]?.[item], 0)
	Object.keys(DBM[category][item]).reverse().forEach((rank, mIndex) => {
		if (isNaN(rank)) return
		
		const Card = createDiv(Inventory, 'card material')
		createImg(Card, 'material__image r_'+rank, getImage(category, item, rank))
		createTxt(Card, 'div', '', iMaterials[rank])

		maxIndex = mIndex
		convert[rank] = {}
	})

	const Confirm = create(Footer, 'button', {'class':'btn'})
	const Icon = createDiv(Confirm, 'icon-box')
	createIcon(Icon, '#Check')
	createTxt(Confirm, 'div', '', 'Convert(')
	createTxt(Confirm, 'div', '', 0, {'id':'convert-dust'})
	const maxDust = Math.ceil(Math.floor(calc.left*(3**maxIndex)*100)/100)
	createTxt(Confirm, 'div', '', '/'+maxDust+')')

	makeConvertValues(Values, category, item, calc.left, convert)

	Object.entries(DBM[category]).forEach(([newItem, newMaterials]) => {
		if (newItem === item || newItem === '-') return
		if (newMaterials.data !== DBM[category][item].data) return

		Object.keys(newMaterials).reverse().forEach((rank) => {
			if (isNaN(rank)) return

			const Material = createDiv(Materials, 'card convert__material')
	
			createImg(Material, 'convert__image r_'+rank,
				getImage(category, newItem, rank))
			const inv = userInv[category]?.[newItem]?.[rank] ?? 0
			createTxt(Material, 'div', '', inv)
			const Input = createNumInput(Material, {'class':'convert__input'}, 0)
			Input.addEventListener('blur',() => {
				if (+Input.value > inv) Input.value = +inv
				Input.value = +Input.value;
				convert[rank][newItem] = +Input.value
				makeConvertValues(Values, category, item, calc.left, convert)
			}, false);
		})
	})

	Confirm.addEventListener('click', () => {
		Object.entries(convert).forEach(([rank, data]) => {
			Object.entries(data).forEach(([newItem, value]) => {
				userInv[category][newItem][rank] -= value;
				userInv[category][item][rank] += value;
				storeUserI(user, userInv)
				processTotals(category, newItem);
			})
		})
		storeUserI(user, userInv)
		processTotals(category, item);
		makeContent()
		closePopup()
	})
}

function makeConvertValues(Values, category, item, left, convert){
	Values.innerHTML = ''
	const Amount = createDiv(Values, 'convert__amount convert--subgrid')
	const Pick = createDiv(Values, 'convert__pick convert--subgrid')
	const total = {}
	let dust = 0
	const array = Object.entries(convert)
	const maxIndex = array.length - 1
	array.reverse().forEach(([rank, data], index) => {
		total[rank] = Object.values(data).reduce((x, y) => x + y, 0)
		left -= total[rank]/(3**index)
		dust += total[rank]*(3**(maxIndex - index))
	})
	document.getElementById('convert-dust').textContent = dust
	Object.keys(DBM[category][item]).reverse().forEach((rank, mIndex) => {
		if (isNaN(rank)) return
		const convert = left*(3**mIndex)
		createTxt(Amount, 'div', '', Math.floor(convert*100)/100)
		createTxt(Pick, 'div', '', total[rank])
	})

}

function makeUpgradePanel(attributeData, upgradeCosts){
	const [Header, Content, Footer] = makePopup()

	const Panel = createDiv(Content, 'upgrade-panel')
	const Levels = createDiv(Panel, 'upgrade-panel__levels')
	const Inventory = createDiv(Panel, 'upgrade-panel__inventory')
	const Crafting = createDiv(Panel, 'upgrade-panel__crafting')
	const Title = createTxt(Crafting, 'div', 'crafting__header', 'Craft')
	const CraftCont = createDiv(Crafting, 'crafting__cont')

	createTxt(Header, 'div', '', 'Upgrade '+objName)

	attributeData.forEach(([label, [from, to]]) => {
		if (!isNaN(label)) label = ['Normal', 'Skill', 'Burst'][label]
		if (to === from) return
		const Attribute = createDiv(Levels, 'upgrade__attribute')
		createTxt(Attribute, 'div', '', label+': '+from)
		const Arrow = createDiv(Attribute, 'edit__arrow')
		createIcon(Arrow, '#Arrow')
		createTxt(Attribute, 'div', '', to)
	})

	Object.entries(upgradeCosts).forEach(([cCategory, [cItem, cMaterials]]) => {
		if (!cMaterials) return;
		const nonEmpty = Object.values(cMaterials).some(v => v !== 0);
		if (!nonEmpty) return
		
		let category = translate(cCategory), item = decode(cCategory, cItem)
		const Requirements = createDiv(Inventory, 'upgrade__requirements')
		const calc = makeRequirements(Requirements, category, item, cMaterials,
			{usedMaterials: {}})
		
		if (!calc['isObtained']){
			const Craft = createDiv(CraftCont, 'craft craft--color')
			const crafting = makeCraftMenu(Craft, category, item, cMaterials)
			const Confirm = create(Craft, 'button', {'class':'btn'})
			const Icon = createDiv(Confirm, 'icon-box')
			createIcon(Icon, '#Check')
			createTxt(Confirm, 'div', '', 'Craft')
			Confirm.addEventListener('click', () => {
				crafting()
				makeContent()
				makeUpgradePanel(attributeData, upgradeCosts)
			})
		}
	})

	let isObtained = checkObtained(upgradeCosts)
	if (isObtained){
		const Confirm = create(Footer, 'button', {'class':'btn'})
			const Icon = createDiv(Confirm, 'icon-box')
			createIcon(Icon, '#Check')
			createTxt(Confirm, 'div', '', 'Upgrade')
			Confirm.addEventListener('click', () => {
				consume(upgradeCosts, attributeData)
				closePopup()
			})
	}
}

/**--INVENTORY CRAFTING PROCESSING-- */
function getCrafted(category, item, cMaterials, iMaterials){
	/*
	crafted: copy that holds inventory after possible crafting
	maxInv: copy that holds maximum inventory obtained through crafting
	*/
	if (!iMaterials) iMaterials = uGet(userInv[category]?.[item], 0)
	const crafted = {...iMaterials};
	const maxInv = uGet({...iMaterials}, 0) //defaultdict
	const lastIndex = Object.keys(cMaterials).length - 1
	let highestRank, num = 0, numCompleted = 0, numObtained = 0
	const calc = {isCompleted: false, isObtained: false, left: 0}

	Object.entries(cMaterials).forEach(([rank, value], indexMat) => {
		if (value !== 0) highestRank = rank;
		if (indexMat < lastIndex && maxInv[rank] > value){
			//Next rank exists & inv > need value
			crafted[rank] = +value
			maxInv[+rank + 1] += (maxInv[rank] - value)/3;
		} else{
			if (['EXP', 'Ore'].includes(item)){
				//Calculator only has one rank for these
				let [_,total] = calcTotals(DBM[category][item], iMaterials)
				maxInv[rank] = Math.floor(total)
			}
			crafted[rank] = Math.floor(maxInv[rank]);
		}

		let uValue = iMaterials?.[rank] ?? 0
		let divisor = 3**(lastIndex - indexMat)
		calc['left'] += value/divisor - uValue/divisor //needed total - total

		if(value === 0) return
		num++
		numCompleted += crafted[rank] >= value
		numObtained += iMaterials[rank] >= value
	});
	crafted[highestRank] = Math.floor(maxInv[highestRank]);
	calc['isCompleted'] = num === numCompleted
	calc['isObtained'] = num === numObtained
	return [crafted, calc];
}

/**--UPDATE CALCULATIONS */
function getMaxUpgrades(){
	const state = uGet(isChar ? userChar[objName] : userWpn[objName], '')
	const info = isChar ? DBC[objName] : DBW[objName]
	let nonEmpty = false, upgradable = false, attributeData = []
	let upgradeCosts = {}
	
	//Ascension
	let uData = [+state.PHASE, +state.TARGET]
	if (!isChar) uData.push(info.RARITY)
	
	const costCalc = isChar ? calcCharA : calcWpn
	nonEmpty ||= Object.values(costCalc(info, uData, false))
		.some(([_,v]) => v !== undefined)
	if (nonEmpty){
		let [base, target] = uData
		uData[1] = uData[0]
		let tempUData = [...uData]
		for (let end = base + 1; end <= target; end++){
			tempUData[1] = end
			if (checkCompleted(costCalc(info, tempUData, false))) uData[1] = end
			else break
		}
		upgradable = uData[1] !== uData[0]
		attributeData.push(['Phase', uData])
		if (upgradable){
			upgradeCosts = costCalc(info, uData, false)
		}
	}

	//Talents
	if (isChar){
		let uData = [
			[defaultTalent(state.NORMAL), +state.TNORMAL],
			[defaultTalent(state.SKILL), +state.TSKILL],
			[defaultTalent(state.BURST), +state.TBURST]
		]
		let talentNonEmpty = Object.values(calcCharT(info, uData, false))
			.some(([_,v]) => v !== undefined)
		nonEmpty ||= talentNonEmpty
		if (talentNonEmpty){
			let [bases, targets] = uData[0].map((_, ci) => uData.map(r => r[ci]));
			let minBase = Math.min(...bases), maxTarget = Math.max(...targets)
			for (let i = 0; i < 3; i++) uData[i][1] = uData[i][0]
			let tempUData = JSON.parse(JSON.stringify(uData))
			loop:
			for (let end = minBase + 1; end <= maxTarget; end++){
				for (let i = 0; i < 3; i++){
					if (targets[i] < end) continue
					tempUData[i][1] = end
					let cost = mergeCosts([calcCharT(info, tempUData, false), upgradeCosts])
					if (checkCompleted(cost)) uData[i][1] = end
					else break loop
				}
			}
			let talentsUpgradable = false
			for (let i = 0; i < 3; i++){
				let talentUpgradable = uData[i][1] !== uData[i][0]
				upgradable ||= talentUpgradable
				talentsUpgradable ||= talentUpgradable
				attributeData.push([i, uData[i]])
			}
			if (talentsUpgradable){
				upgradeCosts = mergeCosts([upgradeCosts, calcCharT(info, uData, false)])
			}
		}
	}
	return [nonEmpty, upgradable, attributeData, upgradeCosts]
}

function checkCalc(costs, attribute){
	let num = 0, numChecked = 0
	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		if (!cMaterials) return;
		const nonEmpty = Object.entries(cMaterials).some(([_,v]) => v !== 0);
		if (!nonEmpty) return
		
		num++
		let category = translate(cCategory), item = decode(cCategory, cItem);
		const [_, calc] = getCrafted(category, item, cMaterials);
		if (calc[attribute]) numChecked++
	})
	return num === numChecked
}

function checkCompleted(costs){return checkCalc(costs, 'isCompleted')}
function checkObtained(costs){return checkCalc(costs, 'isObtained')}

/**--UTILITIES-- */
function mergeCosts(costs){
	let [base, merger] = JSON.parse(JSON.stringify(costs))
	if (merger){
		Object.entries(merger).forEach(([cCategory, [cItem, cMaterials]]) => {
			if (cCategory in base)
				base[cCategory][1] = vadd(base[cCategory][1], cMaterials)
			else
				base[cCategory] = [cItem, cMaterials]
		})
	}
	return base
}

function defaultTalent(value){
	return +value ? +value : 1
}

/**--LEVELING UPDATE-- */
function consume(costs, attributeData){
	Object.entries(costs).forEach(([cCategory, [cItem, cMaterials]]) => {
		let category = translate(cCategory), item = decode(cCategory, cItem)
		Object.entries(cMaterials).forEach(([rank, value]) => {
			if (!value) return
			userInv[category][item][rank] -= value;
		})
		storeUserI(user, userInv)
		processTotals(category, item);
	})

	let userObj = isChar ? userChar : userWpn
	let storeFunc = isChar ? storeUserC : storeUserW
	attributeData.forEach(([label, [from, to]]) => {
		const attr = {'Phase':'PHASE', 0:'NORMAL', 1:'SKILL', 2:'BURST'}
		uSet(userObj[objName], [attr[label]], to);
	})
	storeFunc(user, userObj)
	setCalc(true);

	toasty('Upgraded')
	makePage();
}

/**--CHANGE HANDLERS-- */
function updateC(name, attr, value){
	uSet(userChar, [name,attr], value)
	setCalc(true); storeUserC(user, userChar);
}

function updateW(name, attr, value){
	uSet(userWpn, [name,attr], value)
	setCalc(true); storeUserW(user, userWpn);
}
