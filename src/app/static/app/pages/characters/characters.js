setup(loadCharacters())
function pageLoad(){
	window.DBC = loadCharacters()
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	
	characters()
}
let owned = false, flip = false; sorting = ()=>{}, isGrid = true;

/*--CHARACTERS--*/
function characters(){
  document.getElementById('characters').innerHTML = '';
  document.getElementById('table__body').innerHTML = '';
  let array = Object.entries(DBC).sort(sorting); if(flip) array.reverse();
  array.forEach(char => {
    if(owned){
      if(userChar[char[0]].OWNED) isGrid? makeCard(char): makeRow(char);
    } else{
      isGrid? makeCard(char): makeRow(char);
    }
  });
}

function switcher(btn, value){
  if(btn.classList.contains('selected')) return
  document.getElementById('table').classList.toggle('hide')
  document.getElementsByClassName('selected')[0].classList.remove('selected')
  isGrid = value; btn.classList.add('selected'); characters();
}

function filterOwned(btn){
  owned = !owned; btn.classList.toggle('selected'); characters()
}

function getSort(value){
  let sorts = [()=>{}, sortName, sortAscension, sortRarity, sortConstellation]
  sorting = sorts[value]; characters();
  let prev = document.getElementsByClassName('sort-header')[0]
  if(prev) prev.classList.remove('sort-header')
}

function sortTable(head, value){
  let sorts = [()=>{}, sortF, sortHP, sortATK, sortDEF, sortStat]
  let prev = document.getElementsByClassName('sort-header')[0]
  if(prev) prev.classList.remove('sort-header')
  sorting = sorts[value]; head.classList.add('sort-header'); characters();
}

function sortName(a,b){
  return a[0].localeCompare(b[0]);
}

function sortAscension(a,b){
  return userChar[b[0]].PHASE - userChar[a[0]].PHASE || userChar[b[0]].OWNED - userChar[a[0]].OWNED;
}

function sortRarity(a,b){
  return b[1].RARITY - a[1].RARITY;
}

function sortConstellation(a,b){
  return userChar[b[0]].CONSTELLATION - userChar[a[0]].CONSTELLATION || userChar[b[0]].OWNED - userChar[a[0]].OWNED;
}

function sortF(a,b){
  return userChar[b[0]].FARM - userChar[a[0]].FARM || userChar[b[0]].OWNED - userChar[a[0]].OWNED || b[1].RARITY - a[1].RARITY ||  userChar[b[0]].PHASE - userChar[a[0]].PHASE
}

function sortHP(a,b){
  return b[1].HP - a[1].HP
}

function sortATK(a,b){
  return b[1].ATK - a[1].ATK
}

function sortDEF(a,b){
  return b[1].DEF - a[1].DEF
}

function sortStat(a,b){
  return a[1].STAT.localeCompare(b[1].STAT) || b[1].STAT_VALUE.localeCompare(a[1].STAT_VALUE);
}

function setFlip(btn){
  flip = !flip; btn.classList.toggle('flip'); characters();
}

function makeCard(char){
  let [name, info] = char; const state = userChar[name];

  const CARD = create(document.getElementById('characters'), 'div',
    {'class':'card c_'+info.RARITY});
  CARD.addEventListener('click', ()=>showInfo(char), false);

  if(state.OWNED){
    const TAG = create(CARD, 'p', {'class':'tag'});
    TAG.textContent = 'C'+ +state.CONSTELLATION;
    if(state.CONSTELLATION >= 6) TAG.classList.add('max')
  }
  else{
    CARD.classList.add('missing');
  }

  const ICON = create(CARD, 'img', {'class':'icon','src':getImage('ELEMENTS', info.ELEMENT, 0)})
  setError(ICON)

  const IMG = create(CARD, 'img', {'class':'image','src':getCharacter(name)})
  setError(IMG)

  const NAME = create(CARD, 'p', {'class':'name'}); NAME.textContent = name;
}

function makeRow(char){
  let [name, info] = char; const state = userChar[name];
  
  const ROW = create(document.getElementById('table__body'), 'tr', {'class':'c_'+info.RARITY})
  ROW.addEventListener('click', (e)=>{
    if(e.target.classList == 'farm') return;
    showInfo(char)
  }, false);

  let CELL;

  CELL = create(ROW, 'td', {'class':'farm'})
  
  const FARM = create(CELL, 'input', {'class': 'farm', 'type':'checkbox'});
  FARM.checked = state.FARM;
  FARM.addEventListener('change', ()=>{
    userChar[name].FARM = FARM.checked;
    setCalc(true); storeUser(user);
  }, false);

  CELL = create(ROW, 'td', {'class':'img'})
  
  const IMG = create(CELL, 'img', {'class':'image','src':getCharacter(name)})
  setError(IMG)

  const ICON = create(CELL, 'img', {'class':'icon','src':getImage('ELEMENTS', info.ELEMENT, 0)})
  setError(ICON)

  if(state.OWNED){
    const TAG = create(CELL, 'p', {'class':'tag'});
    TAG.textContent = 'C'+ +state.CONSTELLATION;
    if(state.CONSTELLATION >= 6) TAG.classList.add('max')
  }
  else{
    ROW.classList.add('missing')
  }

  const NAME = create(ROW, 'td'); NAME.textContent = name;

  const PHASE = create(ROW, 'td', {'class':'sf'}); PHASE.textContent = state.PHASE;
  const TPHASE = create(ROW, 'td', {'class':'goal'}); TPHASE.textContent = state.TARGET;

  const NORMAL = create(ROW, 'td'); NORMAL.textContent = state.NORMAL;
  const TNORMAL = create(ROW, 'td', {'class':'goal'}); TNORMAL.textContent = state.TNORMAL;

  const SKILL = create(ROW, 'td'); SKILL.textContent = state.SKILL;
  const TSKILL = create(ROW, 'td', {'class':'goal'}); TSKILL.textContent = state.TSKILL;

  const BURST = create(ROW, 'td'); BURST.textContent = state.BURST;
  const TBURST = create(ROW, 'td', {'class':'sl goal'}); TBURST.textContent = state.TBURST;
  
  const HP = create(ROW, 'td'); HP.textContent = info.STAT_HP;
  const ATK = create(ROW, 'td'); ATK.textContent = info.STAT_ATK;
  const DEF = create(ROW, 'td'); DEF.textContent = info.STAT_DEF;
  const STAT = create(ROW, 'td'); STAT.textContent = info.STAT + ' ' + info.STAT_VALUE;
}
