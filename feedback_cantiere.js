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

function getRating(name){
  const r = q(`.rating[data-name="${name}"]`);
  const sel = r ? r.querySelector('.rate-cell.sel') : null;
  return sel ? sel.dataset.val : "2";
}

function calcPct(arr){
  let s = 0; arr.forEach(n => s += Number(getRating(n)));
  return Math.round((s / (arr.length * 4)) * 100) + "%";
}

window.addEventListener('load', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Invio...";

    const sUff = calcPct(['chiarezza_doc','gestione_logistica','tempestivita_uff']);
    const sResp = calcPct(['supporto_resp','sicurezza_gest','equita_dec']);
    const sSquad = calcPct(['collaborazione_mutua','accessibilita_lav','armonia_team']);
    const total = Math.round((parseInt(sUff)+parseInt(sResp)+parseInt(sSquad))/3) + "%";

    const params = new URLSearchParams();
    params.append('form_type', 'cantiere');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', q('#valutatore').value);
    params.append('cantiere', q('#cantiere').value);
    
    ['chiarezza_doc','gestione_logistica','tempestivita_uff','supporto_resp','sicurezza_gest','equita_dec','collaborazione_mutua','accessibilita_lav','armonia_team'].forEach(f => {
      params.append(f, getRating(f));
    });

    params.append('score_ufficio', sUff);
    params.append('score_resp', sResp);
    params.append('score_squadra', sSquad);
    params.append('total_score', total);
    params.append('note', q('#note').value);

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString() 
      });
      alert('Feedback Cantiere Inviato!');
      location.reload();
    } catch(e) { alert('Errore'); btn.disabled = false; }
  };
});