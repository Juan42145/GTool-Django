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
		let drops
		Object.entries(mItems).forEach(([mItem, mMaterials], indexItem) => {
			let Row
			if(mCategory == "WEEKLY_DROPS"){
				if (indexItem % 3 == 0){
					Row = create(Table, 'div', {'class':'row', 'id':'WD-R_'+mMaterials.data})
					Row.style = 'grid-row: '+(indexItem/3 + 1);
					drops = ''
					let total = getTotals()["WEEKLY_BOSSES"][mMaterials.data]
					if (total !== undefined)
						/*Total*/createTxt(Row, 'div', 'row__total',
							total, {'id':'WD-I_'+mMaterials.data})
				}
				else{
					Row = document.getElementById('WD-R_'+mMaterials.data)
				}
				/*Name*/
				drops += '<p>- '+mItem+'</p>'
				if (indexItem % 3 == 2){
					const Text = create(Row, 'div', {'class':'row__name'})
					Text.innerHTML = mMaterials.data + drops
				}
			} else{
				Row = create(Table, 'div', {'class':'row'})
				Row.style = 'grid-row: '+(indexItem + 1);
				/*Name*/ createTxt(Row, 'div', 'row__name', mItem)
			}


			
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
			const TRow = create(Table, 'div', {'class':'row row--total'})
			/*Name*/createTxt(TRow, 'div', 'row__name', 'Total')
			createTxt(TRow, 'div','row__total', getGemTotals(mItems), {'id':'gemC'})
		}

	});
}

function getGemTotals(mItems){
	const total = Object.keys(mItems).reduce((acc, mItem) => {
		return acc + getTotals()["GEMS"][mItem]
	}, 0)
	return Math.floor(total*100)/100
}
