"use strict";
setup(loadWeapons())
function pageLoad(){
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userWpn = user.WEAPONS;
	
	renderDetail()
}
let wName, wMax

/**--RENDER-- */
function renderDetail(){
	document.querySelectorAll('[data-img]').forEach((Element) => {
		let [group, value] = Element.dataset.img.split(',')
		if(group === "WEAPON"){
			Element.src = getWeapon(value)
			setError(Element)
		} else{
			Element.src = getImage(group, value)
			setError(Element)
			makeTooltip(Element, value)
		}
	})

	wName = document.getElementById('name').textContent
	wMax = DBW[wName].MAX || 5;
	let state = uGet(userWpn[wName], '');
	
	const RefGroup = document.getElementById('refinements')
	const Refinement = document.getElementById('refinement')
	const Details = document.getElementById('details')
	if(state.OWNED){
		RefGroup.classList.remove('hide')
		let value = state.REFINEMENT + state.WISH
		Refinement.textContent = 'R'+value+(state.WISH ? '*' : '');
		if(state.WISH && state.REFINEMENT)
			Details.textContent = `${state.WISH}+[${state.REFINEMENT}]`;
		if(value >= wMax) RefGroup.classList.add('max')
	} else{
		RefGroup.classList.add('hide')
		Refinement.textContent = ''; Details.textContent = '';
	}

	document.getElementById('FARM').checked = state.FARM

	document.getElementById('PHASE').value = state.PHASE
	document.getElementById('TARGET').value = state.TARGET
}

/**--INPUT UPDATE-- */
function update(Element){ 
	if(Element.id === 'FARM') uSet(userWpn, [wName,Element.id], Element.checked)
	else uSet(userWpn, [wName,Element.id], Element.value);
	
	setCalc(true); storeUserW(user, userWpn)
}

/**--EDIT MODE-- */
function editIn(){
	document.getElementById('edit').setAttribute('onClick', 'editOut()');

	document.getElementById('pencil').classList.add('hide')
	document.getElementById('disk').classList.remove('hide')
	document.getElementById('modify').classList.remove('hide')
	document.getElementById('refinements').classList.remove('hide')
}

function editOut(){
	document.getElementById('edit').setAttribute('onClick', 'editIn()');

	document.getElementById('pencil').classList.remove('hide')
	document.getElementById('disk').classList.add('hide')
	document.getElementById('modify').classList.add('hide')

	if (userWpn[wName]?.OWNED){
		document.getElementById('refinements').classList.remove('hide')
	} else{
		document.getElementById('refinements').classList.add('hide')
	}
}

/**--REFINEMENT UPDATE-- */
function plus(isWish){
	const state = uGet(userWpn[wName], '')
	let target = isWish ? state.WISH : state.REFINEMENT
	let other = isWish ? state.REFINEMENT : state.WISH

	let value;
	if(target === ''){
		uSet(userWpn, [wName,'OWNED'], true); value = 1;
	} else{
		value = target + 1;
	}

	let ref = isWish ? other : value; let wish = isWish ? value : other
	let rValue = ref + wish

	const Container = document.getElementById('refinements')
	if(rValue >= wMax) Container.classList.add('max')

	const Refinement = document.getElementById('refinement')
	Refinement.textContent = 'R'+rValue+(wish ? '*' : '');

	const Details = document.getElementById('details')
	if(ref && wish) Details.textContent = `${wish}+[${ref}]`;

	uSet(userWpn, [wName, isWish ? 'WISH' : 'REFINEMENT'], value)
	storeUserW(user, userWpn)
}

function minus(isWish){
	const state = uGet(userWpn[wName], '')
	let target = isWish ? state.WISH : state.REFINEMENT
	let other = isWish ? state.REFINEMENT : state.WISH

	let value, refString = true;
	if(target === '') return;
	else if(target === 1){
		if(other === ''){
			uSet(userWpn, [wName,'OWNED'], false); refString = false
		}
		value = ''
	} else{
		value = target - 1;
	}

	let ref = isWish ? other : value; let wish = isWish ? value : other
	let rValue = ref + wish

	const Container = document.getElementById('refinements')
	if(rValue < wMax) Container.classList.remove('max')

	const Refinement = document.getElementById('refinement')
	Refinement.textContent = refString ? 'R'+rValue+(wish ? '*' : '') : '';

	const Details = document.getElementById('details')
	if(ref && wish) Details.textContent = `${wish}+[${ref}]`;
	else Details.textContent = '';

	uSet(userWpn, [wName, isWish ? 'WISH' : 'REFINEMENT'], value)
	storeUserW(user, userWpn)
}
