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
		if(group === "CHARACTER"){
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

	let ConsGroup = document.getElementById('constellations')
	let Constellation = document.getElementById('constellation')
	let Details = document.getElementById('details')
	if(state.OWNED){
		ConsGroup.classList.remove('hide');
		let consValue = state.CONSTELLATION === '' ?
			state.REWARD - 1 : state.CONSTELLATION + state.REWARD
		Constellation.textContent = 'C'+(consValue)
		if(state.REWARD)
			Details.textContent = `[${state.CONSTELLATION}+${state.REWARD}]`;
		if(consValue >= 6) ConsGroup.classList.add('max')
	} else{
		ConsGroup.classList.add('hide');
		Constellation.textContent = ''; Details.textContent = '';
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
	document.getElementById('constellations').classList.remove('hide')
}

function editOut(){
	document.getElementById('edit').setAttribute('onClick', 'editIn()');

	document.getElementById('pencil').classList.remove('hide')
	document.getElementById('disk').classList.add('hide')
	document.getElementById('modify').classList.add('hide')

	if(userChar[cName]?.OWNED)
		document.getElementById('constellations').classList.remove('hide')
	else
		document.getElementById('constellations').classList.add('hide')
}

/**--CONSTELLATION UPDATE-- */
function plus(isReward){
	const state = uGet(userChar[cName], '')
	let target = isReward ? state.REWARD : state.CONSTELLATION
	let other = isReward ? state.CONSTELLATION : state.REWARD
	
	let value;
	if(target === ''){
		uSet(userChar, [cName,'OWNED'], true); value = isReward ? 1 : 0;
	} else{
		value = target + 1;
	}

	let consValue = (isReward && other === '') ? value - 1 : value + other

	const Container = document.getElementById('constellations')
	if(consValue >= 6) Container.classList.add('max')

	document.getElementById('constellation').textContent = 'C'+(consValue);
	
	const Details = document.getElementById('details')
	if(isReward) Details.textContent = `[${other}+${value}]`;
	else if(state.REWARD) Details.textContent = `[${value}+${other}]`;

	uSet(userChar, [cName, isReward ? 'REWARD' : 'CONSTELLATION'], value)
	storeUserC(user, userChar)
}

function minus(isReward){
	const state = uGet(userChar[cName], '')
	let target = isReward ? state.REWARD : state.CONSTELLATION
	let other = isReward ? state.CONSTELLATION : state.REWARD

	let value, consString = true;
	if(target === '') return;
	else if(target === (isReward ? 1 : 0)){
		if(other === ''){
			uSet(userChar, [cName,'OWNED'], false)
			consString = false
		}
		value = ''
	} else{
		value = target - 1;
	}

	let consValue = (isReward && other === '' || !isReward && value === '') ?
		(isReward ? value : other) - 1 : value + other
	
	const Container = document.getElementById('constellations')
	if(consValue < 6) Container.classList.remove('max')

	const Constellation = document.getElementById('constellation')
	Constellation.textContent = consString ? 'C'+(consValue) : '';

	const Details = document.getElementById('details')
	if(isReward && value) Details.textContent = `[${other}+${value}]`;
	else if(!isReward && other) Details.textContent = `[${value}+${other}]`;
	else Details.textContent = '';

	uSet(userChar, [cName, isReward ? 'REWARD' : 'CONSTELLATION'], value)
	storeUserC(user, userChar)
}
