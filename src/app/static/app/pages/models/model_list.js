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
	}
	else if(opt === 'w'){
		document.querySelectorAll('.js-img').forEach(element => {
			element.src = getWeapon(element.dataset.src)
		});
	}
}
