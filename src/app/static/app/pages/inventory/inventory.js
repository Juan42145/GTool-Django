setup()
function pageLoad(){
	window.DBM = loadMaster()
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	buildInventory()
}

/**--RENDER-- */
function buildInventory(){
	Object.entries(DBM).forEach(([mCategory, mItems]) => {
		const Sec = document.getElementById(mCategory);
		if (!Sec) return

		const Title = createTxt(Sec, 'div', {'class': 'section__title'}, mCategory);

		const Table = create(Sec, 'div', {'class':'section__table'});
	
		Object.entries(mItems).forEach(([mItem, mMaterials], indexItem) => {
			const Row = create(Table, 'div', {'class':'row'})
			Row.style = 'grid-row: '+(indexItem+1);

			const Name = createTxt(Row, 'div', {'class':'row__name'}, mItem)
			
			let total = getTotals()[mCategory]?.[mItem]
			if (total !== undefined){
				const Total = createTxt(Row, 'div', {'class':'row__total','id':'I_'+mItem},
					Math.floor(total).toLocaleString('en-us'))
			}
			Object.keys(mMaterials).reverse().forEach((rank) => {
				if(isNaN(rank)) return
				const Card = create(Row, 'div', {'class':'row__card r_'+rank})

				const Img = createImg(Card, 'row__card--img', getImage(mCategory, mItem, rank))
				
				value = userInv[mCategory]?.[mItem]?.[rank] ?? 0
				const Input = createNumInput(Card, {'data-column':rank}, value)
				Input.addEventListener('blur',()=>{
					Input.value = +Input.value;
					uSet(userInv, [mCategory, mItem, rank], +Input.value)
					storeUserI(user, userInv)
					processTotals(mCategory, mItem);
				}, false);
			});
		});
	});
}
