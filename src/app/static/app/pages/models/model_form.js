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
	} else if(opt === 'weapon'){
		exclude = ['img-wpn']
		addEvent(document.getElementById('id_name'), (e) => {
			document.getElementById('img-wpn').src = getWeapon(e.target.value)
		})
	} else if(opt === 'book'){
		exclude = ['img-2','img-3','img-4']
		addEvent(document.getElementById('id_name'), (e) => {
			Object.entries({
				'2': 'Teachings of ',
				'3': 'Guide to ',
				'4': 'Philosophies of ',
			}).forEach(([rank, code]) => {
				document.getElementById('img-'+rank).src = getImageLink('BOOKS', 
					code+e.target.value)
			})
		})
	} else if(opt === 'trophy'){
		exclude = ['img-n2','img-n3','img-n4','img-n5']
		let range = ['2','3','4','5']
		range.forEach(rank => {
			addEvent(document.getElementById('id_n'+rank), (e) => {
				trophyImage(rank)
			})
		})
		addEvent(document.getElementById('id_code'), (e) => {
			range.forEach(rank => trophyImage(rank))
		})
		addEvent(document.getElementById('id_insert_code'), (e) => {
			range.forEach(rank => trophyImage(rank))
		})
	}

	if(exclude.length){
		document.querySelectorAll('.js-img').forEach(element => {
			if(exclude.includes(element.id)) return
			linkImage(element.id.replace('img-',''))
		});
	} else{
		document.querySelectorAll('.js-img').forEach(element => {
			tryImage(opt, element.id.replace('img-',''))
		});
	}
}

function trophyImage(rank){
	let code = document.getElementById('id_code').value
	let value = document.getElementById('id_n'+rank).value
	let text = document.getElementById('id_insert_code').checked ?
		value.replace('*', code) : code.replace('*', value)
	document.getElementById('img-n'+rank).src = getImageLink('TROPHIES', text)
}

function tryImage(opt, code){
	addEvent(document.getElementById('id_'+code), (e) => {
		document.getElementById('img-'+code).src = getImageLink(
			translate(opt.toUpperCase().replace(' ','_')), e.target.value)
	})
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
