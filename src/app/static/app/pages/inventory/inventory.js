setup()
function pageLoad(){
	window.DBM = loadMaster()
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	inv()
}

/*INVENTORY*/
function inv(){
	Object.entries(DBM).forEach(([category, items]) => {
		const SEC = document.getElementById(category);
		if (!SEC) return

		const TITLE = create(SEC, 'div', {'class': 'section__title'});
		TITLE.textContent = category;

		const TBL = create(SEC, 'div', {'class':'section__table'});
	
		Object.entries(items).forEach(([item, materials], ii) => {
			const ROW = create(TBL, 'div', {'class':'row'})
			ROW.style = 'grid-row: '+(ii+1);

			const NAME = create(ROW, 'div', {'class':'row__name'}); NAME.textContent = item;
			
			let total = userGet(getTotals(),[category,item])
			if (total !== undefined){
				const TOTAL = create(ROW, 'div', {'class':'row__total','id':'I_'+item})
				TOTAL.textContent = Math.floor(total).toLocaleString('en-us');
			}
			Object.entries(materials).reverse().forEach(([rank, name], mi) => {
				const CARD = create(ROW, 'div', {'class':'row__card r_'+rank})

				const IMG = create(CARD, 'img', {'class':'row__card--img','src':getImage(category, item, rank)})
				setError(IMG)
				
				value = userGet(userInv, [category, item, rank], 0)
				const INP = create(CARD, 'input', {
					'type':'text','pattern':'\\d*','value': value, 'data-column':rank})
				INP.addEventListener('blur',()=>{
					INP.value = +INP.value;
					userSet(userInv, [category, item, rank], +INP.value)
					storeUserI(user, userInv)
					processTotals(category, item);
				}, false);
				INP.addEventListener('focus', (e)=>{focusInput(e)})
			});
		});
	});
}

function save(){
	store('Inventory', userInv); setInv();
}
