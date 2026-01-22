"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBC = loadCharacters()
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;

	defaults = loadSetting('wsh-set', loadStatic().wish_defaults)
}
let defaults

function showSettings(){
	const Popup = makePopup()
	createTxt(Popup, 'div', '', 'Settings')
}

function showFeatured(){
	const Popup = makePopup()
	createTxt(Popup, 'div', '', 'Featured')
}

function showWish(isChar, rarity){
	const Popup = makePopup()
	const Featured = createDiv(Popup, 'cards cards--featured')
	const Cards = createDiv(Popup, 'cards')

	const array = Object.entries(isChar? DBC : DBW)
	let isAsc = false
	if(!isAsc) array.reverse();

	let key
	if(isChar && rarity == 4) key = []
	else key = defaults[rarity+(isChar? 'C' : 'W')]
	console.log(key)
	array.forEach(object => {
		if(object[1].RARITY != rarity) return
		let container = key.includes(object[0])? Featured : Cards
		makeCard(container, object, isChar)
	});
}

function makeCard(Cont, object, isChar){
	const [name, info] = object;
	const state = isChar? userChar[name] : userWpn[name];

	let color = isChar? info.ELEMENT : info.RARITY
	const Card = createDiv(Cont, 'card', {'data-color':color});
	// Card.addEventListener('click', () => redirect(name));

	if(state?.OWNED) isChar? tagChar(Card, state) : tagWpn(Card, state)

	createImg(Card, 'card__image', isChar? getCharacter(name) : getWeapon(name))
	createTxt(Card, 'div', 'card__name '+(isChar?'':'name--wpn'), name)
}

/**--POP UP-- */
function makePopup(){
	const Popup = document.getElementById('pop-up')
	Popup.innerHTML = ''; Popup.showModal()

	Popup.addEventListener("click", (e) => {
		if(e.target === Popup) closePopup();
	});

	const Container = createDiv(Popup, 'popup')

	const Close = create(Container, 'button', {'class':'btn btn--clear icon-box'})
	createIcon(Close, '#X')
	Close.addEventListener('click', () => closePopup())

	return createDiv(Container, 'popup__content')
}

function closePopup(){
	const Popup = document.getElementById('pop-up')
	Popup.close(); Popup.innerHTML = ''
}

/**--CUSTOM-- */
function tagChar(Cont, state){
	let s = uGet(state, '')
	let value = (s.CONSTELLATION === 0 ? 0 : s.CONSTELLATION || -1) + s.REWARD

	const Tag = createTxt(Cont, 'div', 'card__tag', 'C'+value);
	if(state.REWARD) createTxt(Tag, 'div', '', '['+ +state.REWARD+']');
	if(value >= 6) Tag.classList.add('max')
}

function tagWpn(Cont, state){
	let value = (state.REFINEMENT || 0) + (state.WISH || 0)

	const Tag = createTxt(Cont, 'div', 'card__tag','R'+value+(state.WISH ? '*' : ''));
	if(state.REWARD) createTxt(Tag, 'div', '', '['+ +state.REWARD+']');
	if(value >= 6) Tag.classList.add('max')
}


function renderWishing(){
}
