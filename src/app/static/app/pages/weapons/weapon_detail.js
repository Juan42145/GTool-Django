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
	document.querySelectorAll('[data-img]').forEach((Element)=>{
		let [group, value] = Element.dataset.img.split(',')
		if (group === "WEAPON"){
			Element.src = getWeapon(value, true)
			setError(Element)
		} else{
			Element.src = getImage(group, value)
			setError(Element)
			makeTooltip(Element, value)
		}
	})

	wName = document.getElementById('name').textContent
	wMax = DBW[wName].MAX? DBW[wName].MAX: 5;
	let state = uGet(userWpn[wName],'');
	
	let REF = document.getElementById('refinement')
	if(state.OWNED){
		REF.classList.remove('hide')
		REF.textContent = 'R'+state.REFINEMENT;
		if(state.REFINEMENT >= wMax) REF.classList.add('max')
	} else{
		REF.classList.add('hide')
		REF.textContent = '';
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
	document.getElementById('refinement').classList.remove('hide')
}

function editOut(){
	document.getElementById('edit').setAttribute('onClick', 'editIn()');

	document.getElementById('pencil').classList.remove('hide')
	document.getElementById('disk').classList.add('hide')
	document.getElementById('modify').classList.add('hide')

	if(userWpn[wName]?.OWNED){
		document.getElementById('refinement').classList.remove('hide')
	} else{
		document.getElementById('refinement').classList.add('hide')
	}
}

/**--REFINEMENT UPDATE-- */
function plus(){
	let REF = document.getElementById('refinement');
	let reftx = REF.textContent, value;
	if(reftx === ''){
		uSet(userWpn, [wName,'OWNED'], true); value = 1;
	} else{
		value = +reftx.substring(1) + 1;
	}

	if(value >= wMax) REF.classList.add('max')

	REF.textContent = 'R' + value;
	uSet(userWpn, [wName,'REFINEMENT'], value)
	storeUserW(user, userWpn)
}

function minus(){
	let REF = document.getElementById('refinement');
	let reftx = REF.textContent, value, string;
	if(reftx === '') return;
	else if(reftx === 'R1'){
		value = ''; string = ''; uSet(userWpn, [wName,'OWNED'], false);
	} else {
		value = +reftx.substring(1) - 1; string = 'R' + value;
	}

	if(value < wMax) REF.classList.remove('max')

	REF.textContent = string;
	uSet(userWpn, [wName,'REFINEMENT'], value)
	storeUserW(user, userWpn)
}
