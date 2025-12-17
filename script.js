const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

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
    const v = q('#valutatore').value.trim();
    const m = q('#muratore').value.trim();
    const c = q('#cantiere').value.trim();

    if(!v || !m || !c){ alert('Compila i campi Valutatore, Muratore e Cantiere!'); return; }
    
    btn.disabled = true;
    btn.innerText = "Invio...";

    // Calcolo punteggio muratore
    const r1 = getRatingValue('qualita_lavoro');
    const r2 = getRatingValue('velocita');
    const r3 = getRatingValue('pulizia');
    const r4 = getRatingValue('puntualita');
    const sTot = Math.round(((r1+r2+r3+r4 - 4) / 12) * 100);

    const record = {
      form_type: 'muratore',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      muratore: m,
      cantiere: c,
      qualita_lavoro: r1,
      velocita: r2,
      pulizia: r3,
      puntualita: r4,
      score_totale: sTot + "%",
      note: q('#note').value.trim()
    };

    if(await sendData(record)){ 
      alert('Valutazione Muratore inviata!'); 
      q('#valForm').reset(); 
      makeRatings(); 
    } else { 
      alert('Errore nell\'invio!'); 
    }
    btn.disabled = false;
    btn.innerText = "Invia Valutazione Muratore";
  });
});