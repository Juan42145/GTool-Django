
setup(loadCharacters())
function pageLoad(){
	window.CALCDATA = loadStatic().calculation_data
	
	data()
}


function data(){
  let cont = document.getElementById('content')
  cont.innerHTML = ''
  Object.entries(CALCDATA).forEach(([name, table])=>{
    makeTable(name,table)
  })
}

function makeTable(name, data){
  let isCum = document.getElementById('cum').checked;
  let cont = document.getElementById('content')
  let table = create(cont, 'table')
  let head = create(table, 'thead')
  let bod = create(table, 'tbody')
  let hCatg = create(head,'tr')
  let hRank = create(head, 'tr')

  let rowArray = [];
  let f;

  let title = create(hCatg, 'th', {'rowspan': 2, 'class':'title'})
  title.textContent = name

  Object.entries(data).forEach(([category, rows], ci)=>{
    let colH = Object.keys(Object.values(rows)[0])
    let cClass = ci%2?'odd':'even';
    let total = colH.length > 1;

    let cat = create(hCatg, 'th', {'colspan':colH.length + total, 'class':cClass})
    cat.textContent = category

    colH.forEach(r => {
      let rank = create(hRank, 'th', {'class':cClass})
      rank.textContent = r
    })
    if(total){
      let rank = create(hRank, 'th', {'class':cClass})
      rank.textContent = 'Total'
    }

    Object.entries(rows).forEach(([row, cols], ri)=>{
      if(!rowArray[row]){
        rowArray[row] = create(bod,'tr')
        let rowHead = create(rowArray[row],'th')
        rowHead.textContent = row
      }
      if(ri === 0) f = row;
      let prev = (rows[row-1] && !isCum)? Object.values(rows[row-1]): []
      let tvalue = 0
      let max = Object.values(cols).length-1
      Object.values(cols).forEach((cumm, i)=>{
        let cell = create(rowArray[row],'td',{'class':cClass})
        let value = (row === f || isCum)? cumm: cumm - +prev[i]
        if(value === 0) value = '';
        cell.textContent = value
        tvalue += +value / (3**(max-i))
      })
      let tcell = total? create(rowArray[row],'td',{'class':cClass+' total'}): ''
      tcell.textContent = (Math.floor(tvalue*100)/100).toLocaleString('en-us')
    })
  })
}
