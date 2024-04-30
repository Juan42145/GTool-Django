"use strict";
setup(loadCharacters())
function pageLoad(){
	window.CALCDATA = loadStatic().calculation_data
	
	renderData()
}

/**--RENDER-- */
function renderData(){
	const Cont = document.getElementById('content')
	Cont.innerHTML = ''
	Object.entries(CALCDATA).forEach(([type, categories]) => {
		makeTable(Cont, type, categories)
	})
}

function makeTable(Cont, type, categories){
	let isCum = document.getElementById('switch').checked;
	
	const Table = create(Cont, 'table')
	const Head = create(Table, 'thead')
	const Bod = create(Table, 'tbody')

	const HCatg = create(Head,'tr')
	const HRank = create(Head, 'tr')

	/*Title*/createTxt(HCatg, 'th', 'title', type, {'rowspan':2})

	Object.entries(categories).forEach(([category, levels], indexCat) => {
		let headerRanks = Object.keys(Object.values(levels)[0])
		let cClass = indexCat % 2 ? 'odd' : 'even';
		let isTotal = headerRanks.length > 1;

		/*CHeader*/createTxt(HCatg, 'th', cClass, category, {'colspan':headerRanks.length + isTotal})

		headerRanks.forEach(rank => createTxt(HRank, 'th', cClass, rank))
		if (isTotal) createTxt(HRank, 'th', cClass, 'Total')

		Object.entries(levels).forEach(([level, materials], indexLevel) => {
			let LevelRow = document.getElementById(type+level)
			if(!LevelRow){
				LevelRow = create(Bod, 'tr', {'id':type+level})
				/*RHeader*/createTxt(LevelRow, 'th', '', level)
			}

			const prev = (levels[level - 1] && !isCum) ?
				Object.values(levels[level - 1]) : undefined
			const values = Object.values(materials)
			const max = values.length - 1
			let total = 0
			values.forEach((value, indexVal) => {
				if (prev) value -= +prev[indexVal]
				if (value === 0) value = '';
				/*cell*/createTxt(LevelRow, 'td', cClass, value)
				total += +value/(3**(max - indexVal))
			})
			if (isTotal) createTxt(LevelRow, 'td', cClass+' total',
										(Math.floor(total*100)/100).toLocaleString('en-us'))
		})
	})
}

/**--SWITCH: CHANGE CUMMULATIVE-- */
function toggleSwitch(){
	renderData()
}
