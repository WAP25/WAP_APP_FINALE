const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 
const ADMIN_PIN = "44232"; 

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

function calcAverage(names){
    if (names.length === 0) return 0;
    let total = 0;
    names.forEach(k => { total += ((getRatingValue(k) - 1) / 3) * 100; });
    return Math.round((total / names.length) * 100) / 100;
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
    const c = q('#cantiere').value.trim();
    if(!v || !c){ alert('Inserisci Valutatore e Cantiere!'); return; }
    
    btn.disabled = true;
    btn.innerText = "Invio...";

    // Calcolo punteggi per le 3 aree
    const sUff = calcAverage(['chiarezza_doc', 'gestione_logistica', 'tempestivita_uff']);
    const sResp = calcAverage(['supporto_resp', 'sicurezza_gest', 'equita_dec']);
    const sSquad = calcAverage(['collaborazione_mutua', 'accessibilita_lav', 'armonia_team']);
    const sTot = Math.round(((sUff + sResp + sSquad) / 3) * 100) / 100;

    const record = {
      form_type: 'cantiere',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      cantiere: c,
      chiarezza_doc: getRatingValue('chiarezza_doc'),
      gestione_logistica: getRatingValue('gestione_logistica'),
      tempestivita_uff: getRatingValue('tempestivita_uff'),
      score_ufficio: sUff + "%",
      supporto_resp: getRatingValue('supporto_resp'),
      sicurezza_gest: getRatingValue('sicurezza_gest'),
      equita_dec: getRatingValue('equita_dec'),
      score_resp: sResp + "%",
      collaborazione_mutua: getRatingValue('collaborazione_mutua'),
      accessibilita_lav: getRatingValue('accessibilita_lav'),
      armonia_team: getRatingValue('armonia_team'),
      score_squadra: sSquad + "%",
      total_score: sTot + "%",
      note: q('#note').value.trim()
    };

    if(await sendData(record)){ 
      alert('Feedback Cantiere inviato!'); 
      q('#valForm').reset(); 
      makeRatings(); 
    } else { 
      alert('Errore nell\'invio!'); 
    }
    btn.disabled = false;
    btn.innerText = "Invia Feedback Organizzativo";
  });
});