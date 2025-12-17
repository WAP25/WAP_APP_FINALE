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

function getRatingValue(name){
  const r = document.querySelector(`.rating[data-name="${name}"]`);
  const sel = r ? r.querySelector('.rate-cell.sel') : null;
  return sel ? Number(sel.dataset.val) : 2;
}

window.addEventListener('load', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    const v = q('#valutatore').value.trim();
    const c = q('#cantiere').value.trim();
    if(!v || !c){ alert('Valutatore e Cantiere obbligatori!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    const params = new URLSearchParams();
    params.append('form_type', 'cantiere');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', v);
    params.append('cantiere', c);
    params.append('chiarezza_doc', getRatingValue('chiarezza_doc'));
    params.append('gestione_logistica', getRatingValue('gestione_logistica'));
    params.append('tempestivita_uff', getRatingValue('tempestivita_uff'));
    params.append('supporto_resp', getRatingValue('supporto_resp'));
    params.append('sicurezza_gest', getRatingValue('sicurezza_gest'));
    params.append('equita_dec', getRatingValue('equita_dec'));
    params.append('collaborazione_mutua', getRatingValue('collaborazione_mutua'));
    params.append('accessibilita_lav', getRatingValue('accessibilita_lav'));
    params.append('armonia_team', getRatingValue('armonia_team'));
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      alert('Feedback Cantiere inviato!');
      q('#valForm').reset();
      makeRatings();
    } catch(e) { alert('Errore di rete.'); }
    
    btn.disabled = false;
    btn.innerText = "Invia Feedback Organizzativo";
  };
});