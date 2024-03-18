setup(loadCharacters(), loadWeapons())
function pageLoad(){
	window.user = loadUser()
	window.userChar = user.CHARACTERS;
	window.userWpn = user.WEAPONS;

	window.calculator;
	
	farm()
}

function farm(){
  if(getCalc()) calculate(); calculator = getCalculator();
  makeChar(); makeWpn();
}

function makeChar(){
  document.getElementById('Characters').innerHTML = '';
  let characters = document.getElementById('Characters');
  Object.entries(calculator.CHARACTERS).forEach(([name, attrs]) => {
    const ROW = create(characters, 'div', 
      {'class':'row','data-color':attrs.ELEMENT})

    const CHAR = create(ROW, 'div', {'class':'row__id--chr'})
    const ASCN = create(ROW, 'div', {'class':'row__asc'})
    const TLNT = create(ROW, 'div', {'class':'row__tln'})

    const IMG = create(CHAR, 'img', {'class':'chr-image','src':getCharacter(name)})
    setError(IMG)

    const NAME = create(CHAR, 'div', {'class':'name'}); NAME.textContent = name;

    // CHAR.addEventListener('click', (e)=>{makePage(name, true)}, false);
		CHAR.addEventListener('click', () => window.open(characters.dataset.url.replace('*',name),'_self'));

    let char = userChar[name]
    makeInputs(ASCN, name, 'CHARACTERS', 'AFARM', [char.PHASE, char.TARGET]);
    makeInputs(TLNT, name, 'CHARACTERS', 'TFARM',
      [char.NORMAL,char.TNORMAL,char.SKILL,char.TSKILL,char.BURST,char.TBURST,]);

    makeFarm(ASCN, name, 'CHARACTERS', 'AFARM');
    makeFarm(TLNT, name, 'CHARACTERS', 'TFARM');
  });  
}

function makeWpn(){
  document.getElementById('Weapons').innerHTML = '';
  let weapons = document.getElementById('Weapons');
  Object.entries(calculator.WEAPONS).forEach(([name, attrs]) => {
    const ROW = create(weapons, 'div', 
      {'class':'row','data-color':attrs.RARITY})

    const WPN = create(ROW, 'div', {'class':'row__id--wpn'})
    const WD = create(ROW, 'div', {'class':'row__wpn'})

    const IMG = create(WPN, 'img', {'class':'wpn-image','src':getWeapon(name)})
    setError(IMG)

    const NAME = create(WPN, 'div', {'class':'name'}); NAME.textContent = name;

    // WPN.addEventListener('click', (e)=>{makePage(name, false)}, false);
		WPN.addEventListener('click', () => window.open(weapons.dataset.url.replace('*',name),'_self'));

    let wpn = userWpn[name]
    makeInputs(WD, name, 'WEAPONS', 'FARM', [wpn.PHASE, wpn.TARGET]);
    makeFarm(WD, name, 'WEAPONS', 'FARM');
  });
}

function makeInputs(COMP, name, section, id, values){
  const DIV = create(COMP, 'div', {'class':'inp'})
  let attrNames = values.length === 2? ['PHASE','TARGET']:['NORMAL','TNORMAL','SKILL','TSKILL','BURST','TBURST']
  values.forEach((value,i) => {
    const INP = create(DIV, 'input', {'type':'text','pattern':'\\d*','value': value})
    INP.addEventListener('blur',()=>{
      if(section === 'CHARACTERS') updateC(name, attrNames[i], INP.value);
      if(section === 'WEAPONS') updateW(name, attrNames[i], INP.value);
      makeFarm(COMP, name, section, id);
    }, false);
    INP.addEventListener('focus', (e)=>{focusInput(e)})
  });
}

function makeFarm(COMP, name, section, id){
  if(getCalc()) calculate(); calculator = getCalculator();
  
  let FARM = document.getElementById('f_'+id+name.replaceAll(' ','_'))
  if(FARM) FARM.innerHTML = '';
  else FARM = create(COMP, 'div',
    {'class':'farming','id':'f_'+id+name.replaceAll(' ','_')})
  
  Object.entries(calculator[section][name][id]).forEach(([category, [item, materials]]) => {
    addTotal = isTotal(category);
    category = translate(category); item = decode(category, item);
    
    const DIV = create(FARM, 'div', {'class':'farming__cont'})
    if(addTotal) DIV.classList.add('farming__cont--total')
    
    if(!materials) return
    let counter = 0, total = 0;
    Object.entries(materials).reverse().forEach(([rank, value]) => {
      if(addTotal){
        total += value/(3**counter); counter++;
      }
      if(value === 0) return;
      DIV.addEventListener('mouseover', ()=>tooltip.show(item))
      DIV.addEventListener('mouseout', ()=>tooltip.hide())
  
      const CARD = create(DIV, 'div', {'class':'item r_'+rank})
  
      const IMG = create(CARD, 'img', {'class':'item__image','src':getImage(category, item, rank)})
      setError(IMG)
  
      const NEED = create(CARD, 'p', {'class':'item__need'}); NEED.textContent = value;
    });
    if(addTotal){
      const TOTAL = create(DIV, 'div', {'class':'total'})
      
      const TEXT = create(TOTAL, 'p');
      TEXT.textContent = Math.ceil(total*100)/100;
    }
  });
}


function decode(category, item){
  return category === 'WEEKLY_DROPS'? item.split(' ')[1]: item;
}

function isTotal(category){
  let dict = {
    'BOOK': true,
    'TROPHY': true,
    'EXP': false,
    'MORA': false,
    'ORE': false,
    'GEM': true,
    'WEEKLY': false,
    'ELITE': true,
    'BOSS': false,
    'COMMON': true,
    'LOCAL': false,
  }
  return dict[category];
}

function updateC(name, attr, value){
	userSet(userChar,[name,attr], value)
  setCalc(true); storeUserC(user. userChar);
}

function updateW(name, attr, value){
	userSet(userWpn,[name,attr], value)
	setCalc(true); storeUserW(user, userWpn);
}
