"use strict";
setup(loadWeapons())
function pageLoad(){
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userWpn = user.WEAPONS;
	
	buildDetail()
}
let wName, wMax

/**--RENDER-- */
function buildDetail(){
	document.querySelectorAll('[data-img]').forEach((Element) => {
		let [group, value] = Element.dataset.img.split(',')
		if (group === "WEAPON"){
			Element.src = getWeapon(value)
			setError(Element)
		} else{
			Element.src = getImage(group, value)
			setError(Element)
			makeTooltip(Element, value)
		}
	})

	wName = document.getElementById('name').textContent
	wMax = DBW[wName].MAX ? DBW[wName].MAX : 5;
	let state = uGet(userWpn[wName], '');
	
	const Refinement = document.getElementById('refinement')
	if (state.OWNED){
		Refinement.classList.remove('hide')
		Refinement.textContent = 'R'+state.REFINEMENT;
		if (state.REFINEMENT >= wMax) Refinement.classList.add('max')
	} else{
		Refinement.classList.add('hide')
		Refinement.textContent = '';
	}

	document.getElementById('FARM').checked = state.FARM

	document.getElementById('PHASE').value = state.PHASE
	document.getElementById('TARGET').value = state.TARGET
}

/**--INPUT UPDATE-- */
function update(Element){ 
	if (Element.id === 'FARM') uSet(userWpn, [wName,Element.id], Element.checked)
	else uSet(userWpn, [wName,Element.id], Element.value);
	
	setCalc(true); storeUserW(user, userWpn)
}

/**--EDIT MODE-- */
function editIn(){
	document.getElementById('edit').setAttribute('onClick', 'editOut()');

	document.getElementById('pencil').classList.add('hide')
	document.getElementById('disk').classList.remove('hide')
	document.getElementById('modify').classList.remove('hide')
	document.getElementById('refinement').classList.remove('hide')
}

function editOut(){
	document.getElementById('edit').setAttribute('onClick', 'editIn()');

	document.getElementById('pencil').classList.remove('hide')
	document.getElementById('disk').classList.add('hide')
	document.getElementById('modify').classList.add('hide')

	if (userWpn[wName]?.OWNED){
		document.getElementById('refinement').classList.remove('hide')
	} else{
		document.getElementById('refinement').classList.add('hide')
	}
}

/**--REFINEMENT UPDATE-- */
function plus(){
	const Refinement = document.getElementById('refinement');
	let reftx = Refinement.textContent, value;
	if (reftx === ''){
		uSet(userWpn, [wName,'OWNED'], true); value = 1;
	} else{
		value = +reftx.substring(1) + 1;
	}

	if (value >= wMax) Refinement.classList.add('max')

	Refinement.textContent = 'R'+value;
	uSet(userWpn, [wName,'REFINEMENT'], value)
	storeUserW(user, userWpn)
}

function minus(){
	const Refinement = document.getElementById('refinement');
	let reftx = Refinement.textContent, value, string;
	if (reftx === '') return;
	else if (reftx === 'R1'){
		value = ''; string = ''; uSet(userWpn, [wName,'OWNED'], false);
	} else{
		value = +reftx.substring(1) - 1; string = 'R'+value;
	}

	if (value < wMax) Refinement.classList.remove('max')

	Refinement.textContent = string;
	uSet(userWpn, [wName,'REFINEMENT'], value)
	storeUserW(user, userWpn)
}
