const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycby9Kbln9FXbLidq1lObaNd09vOfLPGhbtu2EURB7ZYGOcBCgX5rH_HjDqlwQ0gWsixB/exec"; // STESSO URL DI SOPRA

function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

function makeRatings(){
  qa('.rating').forEach(r=>{
    r.innerHTML = ''; 
    for(let i=1;i<=4;i++){
      const cell = document.createElement('div');
      cell.className='rate-cell'; cell.innerText = i; cell.dataset.val = i;
      cell.addEventListener('click', ()=>{
        r.querySelectorAll('.rate-cell').forEach(x=>x.classList.remove('sel'));
        cell.classList.add('sel');
      });
      r.appendChild(cell);
    }
    r.querySelector('.rate-cell[data-val="2"]').classList.add('sel'); 
  });
}

function getRatingValue(name){
  const r = document.querySelector(`.rating[data-name="${name}"]`);
  const sel = r ? r.querySelector('.rate-cell.sel') : null;
  return sel ? Number(sel.dataset.val) : 2;
}

async function sendData(record){
  const queryString = Object.keys(record).map(k => encodeURIComponent(k)+'='+encodeURIComponent(record[k])).join('&');
  try {
    await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: 'POST', mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: queryString 
    });
    return true;
  } catch(e) { return false; }
}

document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();
  q('#btnSend').addEventListener('click', async ()=>{
    const btn = q('#btnSend');
    const v = q('#valutatore').value;
    const m = q('#muratore').value;
    if(!v || !m){ alert('Compila i campi!'); return; }
    
    btn.disabled = true;
    const record = {
      form_type: 'muratore', // IDENTIFICATORE PER LO SCRIPT MASTER
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v, muratore: m, cantiere: q('#cantiere').value,
      qualita_lavoro: getRatingValue('qualita_lavoro'),
      velocita: getRatingValue('velocita'),
      pulizia: getRatingValue('pulizia'),
      puntualita: getRatingValue('puntualita'),
      score_totale: '100%',
      note: q('#note').value
    };

    if(await sendData(record)){ alert('Valutazione Muratore Inviata!'); q('#valForm').reset(); makeRatings(); }
    else { alert('Errore!'); }
    btn.disabled = false;
  });
});