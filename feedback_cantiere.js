const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

function makeRatings(){
  qa('.rating').forEach(r => {
    r.innerHTML = ''; 
    for(let i=1; i<=4; i++){
      const cell = document.createElement('div');
      cell.className = 'rate-cell'; cell.innerText = i; cell.dataset.val = i;
      cell.onclick = function(){
        r.querySelectorAll('.rate-cell').forEach(x => x.classList.remove('sel'));
        cell.classList.add('sel');
      };
      r.appendChild(cell);
    }
    const def = r.querySelector('.rate-cell[data-val="2"]');
    if(def) def.classList.add('sel'); 
  });
}

function getVal(name){
  const r = q(`.rating[data-name="${name}"]`);
  const sel = r ? r.querySelector('.rate-cell.sel') : null;
  return sel ? Number(sel.dataset.val) : 2;
}

function calcPct(arr){
  let s = 0; arr.forEach(n => s += getVal(n));
  return Math.round((s / (arr.length * 4)) * 100) + "%";
}

window.addEventListener('DOMContentLoaded', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Invio...";

    const scUff = calcPct(['chiarezza_doc','gestione_logistica','tempestivita_uff']);
    const scResp = calcPct(['supporto_resp','sicurezza_gest','equita_dec']);
    const scSquad = calcPct(['collaborazione_mutua','accessibilita_lav','armonia_team']);
    
    // Media totale
    const total = Math.round((parseInt(scUff)+parseInt(scResp)+parseInt(scSquad))/3) + "%";

    const data = {
      form_type: 'cantiere',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: q('#valutatore').value,
      cantiere: q('#cantiere').value,
      chiarezza_doc: getVal('chiarezza_doc'),
      gestione_logistica: getVal('gestione_logistica'),
      tempestivita_uff: getVal('tempestivita_uff'),
      score_ufficio: scUff,
      supporto_resp: getVal('supporto_resp'),
      sicurezza_gest: getVal('sicurezza_gest'),
      equita_dec: getVal('equita_dec'),
      score_resp: scResp,
      collaborazione_mutua: getVal('collaborazione_mutua'),
      accessibilita_lav: getVal('accessibilita_lav'),
      armonia_team: getVal('armonia_team'),
      score_squadra: scSquad,
      total_score: total,
      note: q('#note').value
    };

    const body = Object.keys(data).map(k => encodeURIComponent(k)+'='+encodeURIComponent(data[k])).join('&');

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body, headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
      alert('Feedback Cantiere Inviato! Media: ' + total);
      location.reload();
    } catch(e) { alert('Errore'); btn.disabled = false; }
  };
});