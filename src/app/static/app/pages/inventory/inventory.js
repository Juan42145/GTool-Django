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
		if (!Sec) return

		/*Title*/createTxt(Sec, 'div', 'section__title', mCategory);

		const Table = create(Sec, 'div', {'class':'section__table'});
		Object.entries(mItems).forEach(([mItem, mMaterials], indexItem) => {
			const Row = create(Table, 'div', {'class':'row'})
			Row.style = 'grid-row: '+(indexItem + 1);

			/*Name*/createTxt(Row, 'div', 'row__name', mItem)
			
			let total = getTotals()[mCategory]?.[mItem]
			if (total !== undefined)
				/*Total*/createTxt(Row, 'div', 'row__total',
					Math.floor(total).toLocaleString('en-us'), {'id':'I_'+mItem})
			Object.keys(mMaterials).reverse().forEach((rank) => {
				if (isNaN(rank)) return
				const Card = create(Row, 'div', {'class':'row__card r_'+rank})
				/*Img*/createImg(Card, 'row__card--img', getImage(mCategory, mItem, rank))
				
				let value = userInv[mCategory]?.[mItem]?.[rank] ?? 0
				const Input = createNumInput(Card, {'data-column':rank}, value)
				Input.addEventListener('blur',() => {
					Input.value = +Input.value;
					uSet(userInv, [mCategory,mItem,rank], +Input.value)
					storeUserI(user, userInv)
					processTotals(mCategory, mItem);
				}, false);
			});
		});
	});
}
