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
  const container = q(`.rating[data-name="${name}"]`);
  const selected = container ? container.querySelector('.rate-cell.sel') : null;
  return selected ? selected.dataset.val : "2";
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

    const data = new URLSearchParams();
    data.append('form_type', 'cantiere');
    data.append('timestamp', new Date().toLocaleString('it-IT'));
    data.append('valutatore', q('#valutatore').value);
    data.append('cantiere', q('#cantiere').value);
    data.append('chiarezza_doc', getRating('chiarezza_doc'));
    data.append('gestione_logistica', getRating('gestione_logistica'));
    data.append('tempestivita_uff', getRating('tempestivita_uff'));
    data.append('score_ufficio', sUff);
    data.append('supporto_resp', getRating('supporto_resp'));
    data.append('sicurezza_gest', getRating('sicurezza_gest'));
    data.append('equita_dec', getRating('equita_dec'));
    data.append('score_resp', sResp);
    data.append('collaborazione_mutua', getRating('collaborazione_mutua'));
    data.append('accessibilita_lav', getRating('accessibilita_lav'));
    data.append('armonia_team', getRating('armonia_team'));
    data.append('score_squadra', sSquad);
    data.append('total_score', total);
    data.append('note', q('#note').value);

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
      alert('Feedback Cantiere Inviato!');
      location.reload();
    } catch(e) { alert('Errore'); btn.disabled = false; }
  };
});