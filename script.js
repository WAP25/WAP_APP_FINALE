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
  if(btn) {
    btn.onclick = async function() {
      const v = q('#valutatore').value.trim();
      const valutato = q('#valutato').value.trim();
      const c = q('#cantiere').value.trim();

      if(!v || !valutato || !c){ alert('Compila i campi obbligatori!'); return; }

      btn.disabled = true;
      btn.innerText = "Invio in corso...";

      const data = new URLSearchParams();
      data.append('form_type', 'muratore');
      data.append('timestamp', new Date().toLocaleString('it-IT'));
      data.append('valutatore', v);
      data.append('valutato', valutato);
      data.append('cantiere', c);
      data.append('ore', q('#ore').value);
      data.append('incident', q('#incident').value);
      data.append('rilavorazioni', getRatingValue('rilavorazioni'));
      data.append('tempi', getRatingValue('tempi'));
      data.append('produttivita', getRatingValue('produttivita'));
      data.append('sicurezza', getRatingValue('sicurezza'));
      data.append('qualita', getRatingValue('qualita'));
      data.append('competenze', getRatingValue('competenze'));
      data.append('collaborazione', getRatingValue('collaborazione'));
      data.append('total_score', "Calcolato");
      data.append('note', q('#note').value.trim());

      try {
        await fetch(GOOGLE_SHEET_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          body: data
        });
        alert('Dati inviati con successo!');
        q('#valForm').reset();
        makeRatings();
      } catch(e) {
        alert('Errore tecnico durante l\'invio.');
      } finally {
        btn.disabled = false;
        btn.innerText = "Salva & Invia a HR";
      }
    };
  }
});