"use strict";
setup()
function pageLoad(){
	window.DBM = loadMaster()
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	renderInventory()
}

/**--RENDER-- */
function renderInventory(){
	Object.entries(DBM).forEach(([mCategory, mItems]) => {
		const Sec = document.getElementById(mCategory);
		if(!Sec) return

		const Btn = createTxt(Sec, 'div', 'section__btn accordion', mCategory.replace('_',' '));

		const Cont = createDiv(Sec, 'section__content hide');
		if(['BOSSES','LOCAL_SPECIALTIES'].includes(mCategory))
			Cont.classList.add('section__content--s')
		makeAccordion(Btn, Cont)
		let drops, itemArray
		Object.entries(mItems).forEach(([mItem, mMaterials], indexItem) => {
			let Row
			if(mCategory !== "WEEKLY_DROPS"){
				Row = createDiv(Cont, 'item')
				/*Name*/ createTxt(Row, 'div', 'item__name', mItem)
			} else {
				if (indexItem % 3 == 0){
					Row = createDiv(Cont, 'item', {'id':'WD-R_'+mMaterials.data})
					drops = createDiv(Row, 'item__name--drops')
					itemArray = []
				}
				else Row = document.getElementById('WD-R_'+mMaterials.data)
				/*Name*/
				createTxt(drops, 'p', '', '- '+mItem)
				itemArray.push(mItem)
				if (indexItem % 3 == 2){
					const Text = createTxt(Row, 'div', 'item__name', mMaterials.data)
					Text.appendChild(drops)
					const WDbtn = create(Text, 'button', {'class':'btn btn--clear item__btn icon-box'})
					WDbtn.textContent = '+'
					let itemsData = itemArray
					WDbtn.addEventListener('click', () => makePopup(itemsData, mMaterials.data))
				}
			}

			let ItemCont
			if (mCategory !== "WEEKLY_DROPS"){
				ItemCont = createDiv(Row, 'item__cont')
			} else {
				if (indexItem % 3 == 0){
					ItemCont = createDiv(Row, 'item__cont',{'id':'IC_'+mMaterials.data})
					let total = getTotals()["WEEKLY_BOSSES"][mMaterials.data]
					if (total !== undefined)
						createTxt(ItemCont, 'div', 'item__total', total,
							{'id':'WD-I_'+mMaterials.data})
				}
				else ItemCont = document.getElementById('IC_'+mMaterials.data)
			}

			let total = getTotals()[mCategory]?.[mItem]
			if (total !== undefined)
				/*Total*/createTxt(ItemCont, 'div', 'item__total',
					Math.floor(total).toLocaleString('en-us'), {'id':'I_'+mItem})
			
			Object.keys(mMaterials).reverse().forEach((rank) => {
				if (isNaN(rank)) return
				const Card = createDiv(ItemCont, 'item__card r_'+rank)
				/*Img*/createImg(Card, 'item__card--img', getImage(mCategory, mItem, rank))
				
				let value = userInv[mCategory]?.[mItem]?.[rank] ?? 0
				const Input = createNumInput(Card, {'class':'item__input'}, value)
				if(mCategory == "WEEKLY_DROPS") Input.id = 'INP_'+mItem
				Input.addEventListener('blur',() => {
					Input.value = +Input.value;
					uSet(userInv, [mCategory,mItem,rank], +Input.value)
					storeUserI(user, userInv)
					processTotals(mCategory, mItem);
					if(mCategory == "GEMS"){
						document.getElementById('gemC').textContent = getGemTotals(mItems)
					}
					if(mCategory == "WEEKLY_DROPS"){
						document.getElementById('WD-I_'+mMaterials.data).textContent = getTotals()["WEEKLY_BOSSES"][mMaterials.data]
					}
				}, false);
			});
		});
		if(mCategory == "GEMS"){
			const TRow = createDiv(Cont, 'item item--total')
			/*Name*/createTxt(TRow, 'div', 'item__name', 'Total')
			createTxt(TRow, 'div','item__total', getGemTotals(mItems), {'id':'gemC'})
		}

	});
}

function makeAccordion(accordion, panel){
	accordion.addEventListener('click',() => {
		accordion.classList.toggle('active')
		panel.classList.toggle('hide')
	})
}

/**--POP UP-- */
function makePopup(mItems, boss){
	const Popup = document.getElementById('pop-up')
	Popup.innerHTML = ''; Popup.showModal()

	const Container = createDiv(Popup, 'popup')

	const Close = create(Container, 'button', {'class':'btn btn--clear icon-box'})
	createIcon(Close, '#X')
	Close.addEventListener('click', () => closePopup(mItems, boss))

	const Content = createDiv(Container, 'popup__content')
	makeAdder(Content, mItems, boss)

	Popup.addEventListener("click", (e) => {
		if(e.target === Popup) closePopup(mItems, boss);
	});
}

function closePopup(mItems, boss){
	//Update value and total
	mItems.forEach((mItem) => {
		document.getElementById('INP_'+mItem).value = userInv["WEEKLY_DROPS"]?.[mItem]?.[5] ?? 0
	})
	document.getElementById('WD-I_'+boss).textContent = getTotals()["WEEKLY_BOSSES"][boss]
	
	const Popup = document.getElementById('pop-up')
	Popup.close(); Popup.innerHTML = ''
}

function makeAdder(Container, mItems, boss){
	const Content = createDiv(Container, 'adder__content')
	let adder = {}

	mItems.forEach((mItem) => {
		const Card = createDiv(Content, 'adder__card', {'data-color':5})
		createImg(Card, 'adder__card--img r_5', getImage("WEEKLY_DROPS", mItem, 5))
		
		const InputContainer = createDiv(Card, 'adder__input')
		const Input = createNumInput(InputContainer, {}, 0)
		Input.addEventListener('blur',() => {
			if (Input.value === '') Input.value = 0;
			adder[mItem] = Input.value
		}, false);
	})

	//Button
	const Submit = create(Container, 'button', {'class':'btn icon-box'})
	createIcon(Submit, '#Check')
	Submit.addEventListener('click', () => {
		Object.entries(adder).forEach(([item, value]) => {
			let category = "WEEKLY_DROPS", rank = 5
			let userValue = userInv[category]?.[item]?.[rank] ?? 0
			uSet(userInv, [category,item,rank], userValue + +value)
			storeUserI(user, userInv)
			processTotals(category, item);
		})
		closePopup(mItems, boss)
	})
}

function getGemTotals(mItems){
	const total = Object.keys(mItems).reduce((acc, mItem) => {
		return acc + getTotals()["GEMS"][mItem]
	}, 0)
	return Math.floor(total*100)/100
}
