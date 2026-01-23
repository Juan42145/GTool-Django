"use strict";
setup(loadStatic(), loadCharacters(), loadWeapons())
function pageLoad(){
	window.DBC = loadCharacters()
	window.DBW = loadWeapons()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;

	defaults = loadSetting('wsh-set', loadStatic().wish_defaults)
	defaults['4C'] = []
	renderWishing()
}
let defaults, wishes = {}

function toggleSettings(btn){
	const Settings = document.getElementById('wishing-settings')
	Settings.classList.toggle('hide')
	btn.classList.toggle('options__btn--active')
}

function showChecks(key){
	const Popup = makePopup()
	const Cards = createDiv(Popup, 'cards')
	
	let dict = defaults[key]
	let [rarity, type] = key
	let isChar = type == 'C'
	const array = Object.entries(isChar? DBC : DBW)
	array.forEach(object => {
		if(object[1].RARITY != rarity) return
		
		const [name, info] = object;
		let color = isChar? info.ELEMENT : info.RARITY
		
		const Card = createDiv(Cards, 'card', {'data-color':color});
		if(dict.includes(name)) Card.classList.remove('card--unchecked')
		else Card.classList.add('card--unchecked')
		Card.addEventListener('click', () => {
			if(dict.includes(name)){
				Card.classList.add('card--unchecked')
				dict.splice(dict.indexOf(name), 1)
			} else{
				Card.classList.remove('card--unchecked')
				dict.push(name)
			}
			storeSetting('wsh-set', defaults)
		});

		createImg(Card, 'card__image', isChar? getCharacter(name) : getWeapon(name))
		createTxt(Card, 'div', 'card__name '+(isChar?'':'name--wpn'), name)
	});
}

function showWish(isChar, rarity){
	const Popup = makePopup()
	const Featured = createDiv(Popup, 'cards cards--featured')
	const Cards = createDiv(Popup, 'cards')

	const array = Object.entries(isChar? DBC : DBW)
	array.reverse();

	let key = defaults[rarity+(isChar? 'C' : 'W')]
	array.forEach(object => {
		if(object[1].RARITY != rarity) return
		let container = key.includes(object[0])? Featured : Cards
		makeCard(container, object, isChar)
	});
}

function makeCard(Cont, object, isChar){
	const [name, info] = object;
	const state = isChar? userChar[name] : userWpn[name];

	let codename = isChar? name : '-'+name
	let color = isChar? info.ELEMENT : info.RARITY
	const Card = createDiv(Cont, 'card', {'data-color':color});
	Card.addEventListener('click', () => {
		wishes[codename] = (wishes[codename] || 0) + 1
		renderWishing()
		closePopup()
	});

	if(state?.OWNED) isChar? tagChar(Card, state) : tagWpn(Card, state)

	createImg(Card, 'card__image', isChar? getCharacter(name) : getWeapon(name))
	createTxt(Card, 'div', 'card__name '+(isChar?'':'name--wpn'), name)
}

/**--WISHING DISPLAY-- */
function renderWishing(){
	const Preview = document.getElementById('preview')
	Preview.innerHTML = ''
	const Char = createDiv(Preview, 'preview__content')
	const Wpn = createDiv(Preview, 'preview__content')

	Object.entries(wishes).forEach(([code, number]) => {
		let isChar = code[0] !== '-'
		const name = isChar? code : code.slice(1)
		const Wish = createDiv(isChar? Char: Wpn, 'wish')

		const Card = createDiv(Wish, 'wish__card');
		createImg(Card, 'card__image', isChar? getCharacter(name) : getWeapon(name))
		createTxt(Card, 'div', 'card__name ', name)
		
		let [curr, next] = getValues(number, name, isChar)
		const Values = createDiv(Wish, 'wish__values');
		createTxt(Values, 'div', 'wish__value', number, {'id': name+'_wish_num'})
		createTxt(Values, 'div', 'wish__curr', curr, {'id': name+'_wish_curr'})
		createIcon(Values, '#Arrow')
		createTxt(Values, 'div', 'wish__next', next, {'id': name+'_wish_next'})

		const Actions = createDiv(Wish, 'wish__actions');
		const Remove = create(Actions, 'button', {'class':'btn action__btn'})
		Remove.textContent = '-'
		Remove.addEventListener('click', () => {
			wishes[code] -= 1
			if(wishes[code] > 0){
				let [curr, next] = getValues(wishes[code], name, isChar)
				document.getElementById(name+'_wish_num').textContent = wishes[code]
				document.getElementById(name+'_wish_curr').textContent = curr
				document.getElementById(name+'_wish_next').textContent = next
			} else{
				delete wishes[code]
				renderWishing()
			}
		})
		const Add = create(Actions, 'button', {'class':'btn action__btn'})
		Add.textContent = '+'
		Add.addEventListener('click', () => {
			wishes[code] += 1
			let [curr, next] = getValues(wishes[code], name, isChar)
			document.getElementById(name+'_wish_num').textContent = wishes[code]
			document.getElementById(name+'_wish_curr').textContent = curr
			document.getElementById(name+'_wish_next').textContent = next
		})
	})
	
	const Confirm = document.getElementById('confirm')
	if(Object.keys(wishes).length === 0){
		Confirm.classList.add('hide')
	} else{
		Confirm.classList.remove('hide')
	}
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

function	getValues(number, name, isChar){
	const state = isChar? uGet(userChar[name], '') : uGet(userWpn[name], '');
	const init = isChar? -1 : 0 //Initial values when not owned

	let current = init
	if(state.OWNED){
		current = isChar?
			(state.CONSTELLATION === 0 ? 0 : state.CONSTELLATION || -1) + +state.REWARD :
			(state.REFINEMENT || 0) + (state.WISH || 0)
	}
	
	return [current === init? '-' : current, current + number]
}
