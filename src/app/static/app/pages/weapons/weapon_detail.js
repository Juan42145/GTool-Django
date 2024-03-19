//setup in dashboard.js
function pageLoad(){
	window.DBM = loadMaster()
	window.REGION = Object.keys(DBM.ELEMENTS)
	window.user = loadUser()
	window.userInv = user.INVENTORY;
	
	page()
}

function page(){
	const SEC = document.querySelector('.section');
	let pivot = getPivot()[SEC.id]
	let cData = [SEC.id, pivot]
	let isTotal = SEC.classList.contains('section--total');
  gc = cData; gt = isTotal;
  pMQ.forEach(mq => {mq.addEventListener('change',handleMedia)})
  makePage(cData, isTotal);
}

function makePage(cData, isTotal){
  let [category, items] = cData;

  document.getElementById('home').classList.add('hide');
  let PAGE = document.getElementById('page'); PAGE.classList.remove('hide');

  if(category ==='RESOURCES') isTotal = true;
  PAGE.classList = 'page p_'+category
  if(!isTotal) PAGE.classList.add('page--nt')
  else PAGE.classList.remove('page--nt')

  PAGE = document.getElementById('page-container'); PAGE.innerHTML = '';
  const TBL = create(PAGE, 'div', {'class':'section__table section__table--inv','data-total':isTotal})
  
  Object.entries(items).sort(sortOrder(category)).forEach((iData, ii) => {
    let complete = makeRow(TBL, category, iData, ii, true);
    makeInv(TBL, category, iData, ii, complete);
  })

  if(category === 'RESOURCES'){
    let cMora = ['Mora',{'3':0}], tMora = ['Mora',{'3':0}], wMora = ['Mora',{'3':0}];
    Object.values(getCalculator().CHARACTERS).forEach(char => {
      cMora[1][3] += char.AFARM.MORA[1]? char.AFARM.MORA[1][3]: 0;
      tMora[1][3] += char.TFARM.MORA[1]? char.TFARM.MORA[1][3]: 0;
    })
    Object.values(getCalculator().WEAPONS).forEach(wpn => {
      wMora[1][3] += wpn.FARM.MORA[1]? wpn.FARM.MORA[1][3]: 0;
    })

    const DIV = create(PAGE, 'div', {'class':'page__dets'})
    const SEC = create(DIV, 'div', {'class':'section'})

    const TITLE = create(SEC, 'div', {'class': 'section__title'})
    TITLE.textContent = 'Mora'

    const DETS = create(SEC, 'div', {'class':'section__table','data-total':isTotal})
    makeDets(DETS, 'RESOURCES', 'Characters', cMora, 0);
    makeDets(DETS, 'RESOURCES', 'Talents', tMora, 1);
    makeDets(DETS, 'RESOURCES', 'Weapons', wMora, 2);
  }

  if(category === 'COMMON'){
    let common = {'Characters': {}, 'Talents': {}, 'Weapons': {}};
    Object.values(getCalculator().CHARACTERS).forEach(char => {
      if(char.AFARM.COMMON[1])
        rolling(common, 'Characters', char.AFARM.COMMON[0], char.AFARM.COMMON[1])
      if(char.TFARM.COMMON[1])
        rolling(common, 'Talents', char.TFARM.COMMON[0], char.TFARM.COMMON[1])
    })
    Object.values(getCalculator().WEAPONS).forEach(wpn => {
      if(wpn.FARM.COMMON[1])
        rolling(common, 'Weapons', wpn.FARM.COMMON[0], wpn.FARM.COMMON[1])
    })

    const DIV = create(PAGE, 'div', {'class':'page__dets'})
    Object.entries(common).forEach(([section, items]) => {
      const SEC = create(DIV, 'div', {'class':'section'})

      const TITLE = create(SEC, 'div', {'class':'section__title'})
      TITLE.textContent = section;

      const DETS = create(SEC, 'div', {'class':'section__table','data-total':isTotal})

      Object.entries(items).forEach(([item, materials], ii) => {
        makeDets(DETS, 'ENEMIES', item, [item, materials], ii);
      })
    });
  }
}

function makeInv(TBL, category, iData, ii, complete){
  let cName = category;
  let [item, materials] = iData;
  category = translate(category), item = decode(category, item)
  materials = userInv[category][item];
  let rowi = getComputedStyle(document.getElementById('page')).getPropertyValue('--rowi')
  let coli = getComputedStyle(document.getElementById('page')).getPropertyValue('--coli')

  const ROW = create(TBL, 'div', {'class':'row home-inv'})

  if(TBL.dataset.total === 'true') ROW.style = 'grid-row: '+(2*ii + +rowi);
  else ROW.style = 'grid-row: '+(ii+1);

  if(complete) ROW.classList.add('completed');
  else ROW.classList.remove('completed');

  let index = +coli;
  Object.entries(materials).reverse().forEach(([rank, value]) => {
    if(value === '*' || rank === 'ROW' || rank === '0') return;

    const CARD = create(ROW, 'div', {'class':'row__card r_'+rank})

    if(TBL.dataset.total === 'true') CARD.style = 'grid-column: '+index;
    else CARD.style = 'grid-column: 5';
    index++;

    const IMG = create(CARD, 'img', {'class':'row__card--img','src':getImage(category, item, rank)})
    setError(IMG)
    
    const INP = create(CARD, 'input', {
      'type':'text','pattern':'\\d*','value': value, 'data-column':rank})
    INP.addEventListener('blur',()=>{ if(INP.defaultValue === INP.value) return;
      if(INP.value == '') INP.value = 0;
      
      userInv[category][item][rank] = +INP.value; store('Inventory', userInv);
      caching('cacheI', category + '_' + rank + '_' + materials['ROW'], INP.value);

      recalculate(category, item); makeRow(TBL, cName, iData, ii, true);
    }, false);
    INP.addEventListener('click', (e)=>{focusText(e)})
  });
}

function makeDets(TBL, category, itemName, iData, ii){
  let [item, materials] = iData;
  
  const ROW = create(TBL, 'div', {'class':'row row--dets'})
  ROW.style = 'grid-row: '+(ii+1);

  const NAME = create(ROW, 'div', {'class':'row__name'}); NAME.textContent = itemName;

  let counter = total = 0;
  Object.entries(materials).reverse().forEach(([rank, value], mi) => {
    let index = mi+3;
    total += value/(3**counter); counter++;
    if(!value) return;

    const CARD = create(ROW, 'div', {'class':'row__card r_'+rank});
    CARD.style = 'grid-column: '+index;

    const IMG = create(CARD, 'img', {'class':'row__card--img','src':getImage(category, item, rank)})
    setError(IMG)

    const NEED = create(CARD, 'div', {'class':'p'});
    NEED.textContent = value.toLocaleString('en-us');
  });
  if(TBL.dataset.total === 'true'){
    const TOTAL = create(ROW, 'div', {'class':'row__total'})

    const NEED = create(TOTAL, 'div', {'class':'p'});
    NEED.textContent = Math.floor(total*100)/100;
  }
}

function rolling(pivot, category, item, value){
  let flag = Object.values(value).some(v => {
    return v !== 0;
  });
  if(flag) pivot[category][item] = item in pivot[category]? vadd(pivot[category][item], value): value;
}

function closePage(){
  pMQ.forEach(mq => {mq.removeEventListener('change',handleMedia)})
  document.getElementById('home').classList.remove('hide')
  document.getElementById('page').classList.add('hide')
  home();
}

pQueries = [767, 1024]
pMQ = []
pQueries.forEach(q => {pMQ.push(window.matchMedia(`(min-width: ${q}px)`))})
let gc, gt;
function handleMedia(){
  console.log('handle')
  makePage(gc, gt);
}
