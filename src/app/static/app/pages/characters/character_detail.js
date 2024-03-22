"use strict";
setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	renderdDetail()
}
let cName

/**--RENDER-- */
function renderdDetail(){
	document.querySelectorAll('[data-img]').forEach((Element) => {
		let [group, value] = Element.dataset.img.split(',')
		if (group === "CHARACTER"){
			Element.src = getCharacter(value, true)
			setError(Element)
		} else{
			Element.src = getImage(group, value)
			setError(Element)
			makeTooltip(Element, value)
		}
	})

	cName = document.getElementById('name').textContent
	const state = uGet(userChar[cName], '')

	let Constellation = document.getElementById('constellation')
	if (state.OWNED){
		Constellation.classList.remove('hide');
		Constellation.textContent = 'C'+state.CONSTELLATION;
		if (state.CONSTELLATION >= 6) Constellation.classList.add('max')
	} else{
		Constellation.classList.add('hide');
		Constellation.textContent = '';
	}

	document.getElementById('FARM').checked = state.FARM

	document.getElementById('PHASE').value = state.PHASE
	document.getElementById('TARGET').value = state.TARGET
	document.getElementById('NORMAL').value = state.NORMAL
	document.getElementById('TNORMAL').value = state.TNORMAL
	document.getElementById('SKILL').value = state.SKILL
	document.getElementById('TSKILL').value = state.TSKILL
	document.getElementById('BURST').value = state.BURST
	document.getElementById('TBURST').value = state.TBURST
}

/**--INPUT UPDATE-- */
function update(Element){
	if (Element.id === 'FARM') uSet(userChar, [cName,Element.id], Element.checked)
	else uSet(userChar, [cName,Element.id], Element.value)

	setCalc(true); storeUserC(user, userChar)
}

/**--EDIT MODE-- */
function editIn(){
	document.getElementById('edit').setAttribute('onClick', 'editOut()');

	document.getElementById('pencil').classList.add('hide')
	document.getElementById('disk').classList.remove('hide')
	document.getElementById('modify').classList.remove('hide')
	document.getElementById('constellation').classList.remove('hide')
}

function editOut(){
	document.getElementById('edit').setAttribute('onClick', 'editIn()');

	document.getElementById('pencil').classList.remove('hide')
	document.getElementById('disk').classList.add('hide')
	document.getElementById('modify').classList.add('hide')

	if (userChar[cName]?.OWNED){
		document.getElementById('constellation').classList.remove('hide')
	} else{
		document.getElementById('constellation').classList.add('hide')
	}
}

/**--CONSTELLATION UPDATE-- */
function plus(){
	const Constellation = document.getElementById('constellation')
	let constxt = Constellation.textContent, value;
	if (constxt === ''){
		uSet(userChar, [cName,'OWNED'], true); value = 0;
	} else{
		value = +constxt.substring(1) + 1;
	}

	if (value >= 6) Constellation.classList.add('max')

	Constellation.textContent = 'C'+value;
	uSet(userChar, [cName,'CONSTELLATION'], value)
	storeUserC(user, userChar)
}

function minus(){
	const Constellation = document.getElementById('constellation')
	let constxt = Constellation.textContent, value, string;
	if (constxt === '') return;
	else if (constxt === 'C0'){
		value = ''; string = ''; uSet(userChar, [cName,'OWNED'], false)
	} else{
		value = +constxt.substring(1) - 1; string = 'C'+value;
	}

	if (value < 6) Constellation.classList.remove('max')

	Constellation.textContent = string;
	uSet(userChar, [cName,'CONSTELLATION'], value)
	storeUserC(user, userChar)
}
