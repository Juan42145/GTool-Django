"use strict";
setup()
function pageLoad(){
	window.DBM = loadMaster()

	isUpdate = document.getElementById('form-images').dataset.pk !== 'None'
	renderForm()
}
let isUpdate

/**--RENDER-- */
function renderForm(){
	let opt = document.getElementById('form-images').dataset.model
	let exclude = []
	if(opt === 'character'){
		exclude = ['img-char','img-ban','img-weekly_boss']
		addEvent(document.getElementById('id_name'), (e) => {
			document.getElementById('img-char').src = getCharacter(e.target.value)
			document.getElementById('img-ban').src = getCharacter(e.target.value, true)
		})
		addEvent(document.getElementById('id_weekly_drop'), (e) => {
			document.getElementById('img-weekly_boss').src = getImage('WEEKLY_BOSSES',
				DBM['WEEKLY_DROPS'][e.target.selectedOptions[0].text].data)
		})
	}
	else if(opt === 'weapon'){
		exclude = ['img-wpn']
		addEvent(document.getElementById('id_name'), (e) => {
			document.getElementById('img-wpn').src = getWeapon(e.target.value)
		})
	}

	document.querySelectorAll('.js-img').forEach(element => {
			if(exclude.includes(element.id)) return
			linkImage(element.id.replace('img-',''))
		});
}

function linkImage(code){
	addEvent(document.getElementById('id_'+code), (e) => {
		document.getElementById('img-'+code).src = getImage(
			translate(code.toUpperCase()), e.target.selectedOptions[0].text)
	})
}

function addEvent(element, listener){
	element.addEventListener('input', listener)
	if(isUpdate) element.dispatchEvent(new Event('input'));
}