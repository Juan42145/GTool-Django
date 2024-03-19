setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	buildDetail()
}
let cName

/**--RENDER-- */
function buildDetail(){
	document.querySelectorAll('[data-img]').forEach((Element)=>{
		let [group, value] = Element.dataset.img.split(',')
		if (group === "CHARACTER"){
			Element.src = getCharacter(value, true)
		} else{
			Element.src = getImage(group, value)
			makeTooltip(Element, value)
		}
	})

	cName = document.getElementById('name').textContent
	let state = uGet(userChar[cName],'')

	let CONS = document.getElementById('constellation')
	if (state.OWNED){
		CONS.classList.remove('hide');
		CONS.textContent = 'C'+state.CONSTELLATION;
		if (state.CONSTELLATION >= 6) CONS.classList.add('max')
	} else{
		CONS.classList.add('hide');
		CONS.textContent = '';
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
	if(Element.id === 'FARM') uSet(userChar, [cName,Element.id], Element.checked)
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

	if(userChar[cName]?.OWNED){
		document.getElementById('constellation').classList.remove('hide')
	} else{
		document.getElementById('constellation').classList.add('hide')
	}
}

/**--CONSTELLATION UPDATE-- */
function plus(){
	let CONS = document.getElementById('constellation')
	let constx = CONS.textContent, value;
	if(constx === ''){
		uSet(userChar, [cName,'OWNED'], true); value = 0;
	} else{
		value = +constx.substring(1) + 1;
	}

	if(value >= 6) CONS.classList.add('max')

	CONS.textContent = 'C' + value;
	uSet(userChar, [cName,'CONSTELLATION'], value)
	storeUserC(user, userChar)
}

function minus(){
	let CONS = document.getElementById('constellation')
	let constx = CONS.textContent, value, string;
	if(constx === '') return;
	else if(constx === 'C0'){
		value = ''; string = ''; uSet(userChar, [cName,'OWNED'], false)
	} else {
		value = +constx.substring(1) - 1; string = 'C' + value;
	}

	if(value < 6) CONS.classList.remove('max')

	CONS.textContent = string;
	uSet(userChar, [cName,'CONSTELLATION'], value)
	storeUserC(user, userChar)
}
