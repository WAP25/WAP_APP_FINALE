const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

function makeRatings(){
  qa('.rating').forEach(r => {
    r.innerHTML = ''; 
    for(let i=1; i<=4; i++){
      const cell = document.createElement('div');
      cell.className = 'rate-cell'; 
      cell.innerText = i; 
      cell.dataset.val = i;
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
  if(btn){
    btn.onclick = async function(){
      const v = q('#valutatore').value.trim();
      const c = q('#cantiere').value.trim();
      if(!v || !c){ alert('Dati mancanti!'); return; }

      btn.disabled = true;
      btn.innerText = "Invio in corso...";

      const data = new URLSearchParams();
      data.append('form_type', 'cantiere');
      data.append('timestamp', new Date().toLocaleString('it-IT'));
      data.append('valutatore', v);
      data.append('cantiere', c);
      data.append('chiarezza_doc', getRatingValue('chiarezza_doc'));
      data.append('gestione_logistica', getRatingValue('gestione_logistica'));
      data.append('tempestivita_uff', getRatingValue('tempestivita_uff'));
      data.append('supporto_resp', getRatingValue('supporto_resp'));
      data.append('sicurezza_gest', getRatingValue('sicurezza_gest'));
      data.append('equita_dec', getRatingValue('equita_dec'));
      data.append('collaborazione_mutua', getRatingValue('collaborazione_mutua'));
      data.append('accessibilita_lav', getRatingValue('accessibilita_lav'));
      data.append('armonia_team', getRatingValue('armonia_team'));
      data.append('note', q('#note').value.trim());

      try {
        await fetch(GOOGLE_SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: data
        });
        alert('Feedback inviato con successo!');
        q('#valForm').reset();
        makeRatings();
      } catch(e) {
        alert('Errore di invio.');
      } finally {
        btn.disabled = false;
        btn.innerText = "Invia Feedback Organizzativo";
      }
    };
  }
});