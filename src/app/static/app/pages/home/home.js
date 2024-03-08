const LDB = CONTEXT.DB.MASTER;
let userInv = loadUser().Inventory;
const REGION = Object.keys(LDB.ELEMENTS); const D = (new Date()).getDay();

/*HOME*/
window.addEventListener('load',()=>{home()})

function home() {
	if (myStorage.get('calc')) calculate();

	Object.entries(myStorage.get('pivot')).forEach(cData => {
		let [category, items] = cData;

		if (Object.keys(items).length === 0) return;

		const SEC = document.getElementById(category);
		SEC.classList.remove('hide'); SEC.innerHTML = '';

		const TITLE = create(SEC, 'div', { 'class': 'section__title' });
		TITLE.textContent = category;

		let isTotal = SEC.classList.contains('section--total');
		SEC.addEventListener('click', () => window.open('/test','_self'));
		// SEC.addEventListener('click', () => page(cData, isTotal), false);

		const TBL = create(SEC, 'div', { 'class': 'section__table js-table', 'data-total': isTotal })

		Object.entries(items).sort(sortOrder(category)).forEach((iData, ii) => {
			makeRow(TBL, category, iData, ii, false);
		});
	});

	resize()
}

function makeRow(TBL, category, iData, ii, isPage) {
	let [item, materials] = iData;

	let ROW = document.getElementById('r_' + item)
	if (ROW && isPage) ROW.innerHTML = '';
	else ROW = create(TBL, 'div', { 'class': 'row' })

	const NAME = create(ROW, 'div', { 'class': 'row__name' }); NAME.textContent = item;

	if (isPage && TBL.dataset.total === 'true') {
		ROW.style = 'grid-row: ' + (2 * ii + 1); NAME.style = 'grid-row: ' + (2 * ii + 1) + '/span 2'
	}
	else ROW.style = 'grid-row: ' + (ii + 1);

	if (isPage) ROW.id = 'r_' + item;
	if (category === 'RESOURCES') ROW.classList.add('row--long');

	if (category === 'BOOKS' || category === 'TROPHIES' || category === 'WEEKLYS')
		setData(category, item, NAME, isPage);

	let tc = translate(category), ti = item//decode(category, item);
	let calc = getInventory(tc, ti, materials);
	Object.entries(materials).reverse().forEach(([rank, value], mi) => {
		let index = mi + 3;
		if (!value) return

		const CARD = create(ROW, 'div', { 'class': 'row__card js-card r_' + rank })

		if (isPage) CARD.style = 'grid-column: ' + index;

		const IMG = create(CARD, 'img', { 'class': 'row__card--img', 'src': getImage(tc, ti, rank) })
		setError(IMG)

		const INV = create(CARD, 'div', { 'class': 'p row__card--inv' })
		INV.textContent = calc[rank].toLocaleString('en-us');
		const NEED = create(CARD, 'div', { 'class': 'p row__card--need' })
		NEED.textContent = '/' + value.toLocaleString('en-us');

		if (calc[rank] >= value) CARD.classList.add('completed');
		else CARD.classList.remove('completed');
	});

	if (isPage && calc['runs']) {
		const SPAN = create(NAME, 'span'); SPAN.textContent = calc['runs'];
	}
	let complete = ROW.querySelectorAll('.js-card').length <= ROW.querySelectorAll('.completed').length;
	if (complete) { NAME.classList.add('completed'); ROW.classList.add('completed') }
	else { NAME.classList.remove('completed'); ROW.classList.remove('completed'); }

	if (TBL.dataset.total === 'true') {
		const TOTAL = create(ROW, 'div', { 'class': 'row__total' })
		if (isPage) TOTAL.style = 'grid-row: ' + (2 * ii + 1) + '/span 2'

		const INV = create(TOTAL, 'div', { 'class': 'p row__card--inv' })
		INV.textContent = (Math.floor(calc[0] * 100) / 100).toLocaleString('en-us');;
		const NEED = create(TOTAL, 'div', { 'class': 'p row__card--need' })
		NEED.textContent = (Math.floor(calc['total'] * 100) / 100).toLocaleString('en-us');;

		if (category == 'BOOKS' || category == 'TROPHIES')
			setData(category, item, TOTAL, isPage);

		if (complete) TOTAL.classList.add('completed');
		else TOTAL.classList.remove('completed');
	}
	return complete;
}

function translate(category) {
	return category == 'ELITE' || category == 'COMMON' ? 'ENEMIES' : category;
}

function decode(category, item) {
	return category === 'WEEKLYS' ? item.split(' ')[1] : item;
}

function getInventory(category, item, materials) {
	let inv = {}, len = Object.keys(materials).length - 1;
	Object.entries(userInv[category][item]).forEach(([rank, value]) => {
		inv[rank] = +value;
	})
	let calc = { ...inv }, totals = {}, agg = 0, flag = 0, fagi;
	calc[0] = 0;
	Object.entries(materials).forEach(([rank, value], mi) => {
		calc[0] += +calc[rank] / (3 ** (len - mi)); totals[rank] = calc[0];
		if (value !== 0) { flag = rank; fagi = mi; }
		if (mi < len && value < inv[rank]) {
			calc[rank] = +value; inv[+rank + 1] += Math.floor(inv[rank] - value) / 3;
		} else {
			calc[rank] = Math.floor(inv[rank]);
		}
		agg += value / (3 ** (len - mi));
	});

	calc[flag] = Math.floor(inv[flag]); calc[0] = totals[flag]; calc['total'] = agg;
	if (item === 'EXP' || item === 'Ore') {
		calc[0] = Math.floor(inv[0]); calc[flag] = Math.floor(inv[0])
	}

	let diff = calc['total'] - calc[0]; calc['runs'] = '';
	let gateD = category === 'BOOKS' || category === 'TROPHIES';
	let gateM = category === 'WEEKLYS' || category === 'BOSSES' || category === 'GEMS';
	if (diff > 0 && (gateD || gateM)) {
		divs = CONTEXT.STATIC.drop_rates[category][flag]; diff *= 3 ** (len - fagi);
		let runs = Math.ceil(diff / divs), t;
		switch (category) {
			case 'WEEKLYS':
				t = pluralize(runs, 'week');
				break;
			case 'BOSSES':
			case 'GEMS':
				t = pluralize(Math.ceil(runs / 4.5), 'day');
				break;
			default:
				t = pluralize(Math.ceil(runs / 9), 'day');
		}
		calc['runs'] = `(${pluralize(runs, 'run')} ~ ${t})`;
	}
	if (gateD) {
		index = Object.keys(LDB[category]).indexOf(item);
		let w = ['Mo/Th', 'Tu/Fr', 'We/Sa'];
		calc['runs'] += ` [${w[index % 3]}]`;
	}
	return calc;
}

function pluralize(num, string) {
	return num > 1 ? num + ' ' + string + 's' : num + ' ' + string;
}

function setData(category, item, COMP, isPage) {
	// console.log(category, LDB[category])
	let ti = decode(category, item), index = Object.keys(LDB[category]).indexOf(ti);
	COMP.classList.add('cell-color');
	if (category === 'WEEKLYS') {
		COMP.dataset.color = REGION[Math.floor(index / 6) + 1];
	} else {
		COMP.dataset.color = REGION[Math.floor(index / 3) + 1];
		if (!isPage && D !== 0 && (D - 1) % 3 !== index % 3)
			COMP.parentElement.classList.add('hide');
	}
}

function update(inp) {
	document.body.style.setProperty('--filter', inp.checked ? 'none' : 'contents')
	resize();
}

function resize() {
	let r = parseFloat(getComputedStyle(document.getElementById('home')).getPropertyValue('grid-auto-rows'))
	let g = parseFloat(getComputedStyle(document.getElementById('home')).getPropertyValue('grid-column-gap'))

	let p = parseFloat(getComputedStyle(document.getElementById('var')).getPropertyValue('padding'))
	let t = parseFloat(getComputedStyle(document.getElementById('var')).getPropertyValue('height'))

	let m = []; o = t + p;

	containers = document.querySelectorAll('.js-section:not(.hide)');
	for (x = 0; x < containers.length; x++) {
		let section = containers[x]; let cont = section.querySelector('.js-table')
		let h = cont.getBoundingClientRect().height;
		let calc = Math.ceil((o + h + g) / (r)); section.style.gridRow = `span ${calc}`;
		let i = getComputedStyle(section).getPropertyValue('grid-column-start')
		m[i] = 1
	}

	let c = getComputedStyle(document.getElementById('home')).getPropertyValue('--temp');

	let template = c.split('minmax')
	for (i = 1; i < template.length; i++) {
		if (m[i]) template[i] = 'minmax' + template[i];
		else template[i] = '0 ';
	}
	let prop = template.join('')

	document.getElementById('home').style.gridTemplateColumns = prop;
}

function sortOrder(category) {
	return function (a, b) {
		let tc = translate(category)
		let ta = decode(category, a[0]), tb = decode(category, b[0]);
		let k = Object.keys(userInv[tc]); return k.indexOf(ta) - k.indexOf(tb)
	}
}

function save() {
	store('Inventory', userInv); setInv();
}

hQueries = [767, 1024, 1200]
hQueries.forEach(q => { window.matchMedia(`(min-width: ${q}px)`).addEventListener('change', resized) })
function resized() {
	resize();
}