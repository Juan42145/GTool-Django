"use strict";
setup()
function pageLoad(){
	renderList()
}

/**--RENDER-- */
function renderList(){
	let opt = document.getElementById('list').dataset.opt
	if(opt === 'c'){
		document.querySelectorAll('.js-img').forEach(element => {
			element.src = getCharacter(element.dataset.src)
		});
	} else if(opt === 'w'){
		document.querySelectorAll('.js-img').forEach(element => {
			element.src = getWeapon(element.dataset.src)
		});
	} else if(opt === 'b'){
		document.querySelectorAll('.js-img').forEach(element => {
			element.src = getImageLink('BOOKS',
				serializeBook(element.dataset.src, element.dataset.r))
		});
	} else if(opt === 't'){
		document.querySelectorAll('.js-img').forEach(element => {
			let text = element.dataset.ic === 'True' ?
				element.dataset.src.replace('*', element.dataset.code) :
				element.dataset.code.replace('*', element.dataset.src)
			element.src = getImageLink('TROPHIES', text)
		});
	} else{
		document.querySelectorAll('.js-img').forEach(element => {
			element.src = getImageLink(opt, element.dataset.src)
		});
	}
}

function serializeBook(name, rank){
	const dict = {
		'2': 'Teachings of '+name,
		'3': 'Guide to '+name,
		'4': 'Philosophies of '+name,
	}
	return dict[rank]
}
