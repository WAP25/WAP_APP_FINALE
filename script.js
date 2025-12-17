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
    const vt = q('#valutato').value.trim();
    const c = q('#cantiere').value.trim();

    if(!v || !vt || !c){ alert('Valutatore, Dipendente e Cantiere obbligatori!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    // Creazione URLSearchParams per invio sicuro di TUTTI i campi
    const params = new URLSearchParams();
    params.append('form_type', 'muratore');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', v);
    params.append('valutato', vt);
    params.append('cantiere', c);
    params.append('ore', q('#ore').value);
    params.append('incident', q('#incident').value);
    params.append('rilavorazioni', getRatingValue('rilavorazioni'));
    params.append('tempi', getRatingValue('tempi'));
    params.append('produttivita', getRatingValue('produttivita'));
    params.append('sicurezza', getRatingValue('sicurezza'));
    params.append('qualita', getRatingValue('qualita'));
    params.append('competenze', getRatingValue('competenze'));
    params.append('collaborazione', getRatingValue('collaborazione'));
    params.append('total_score', "Inviato");
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      alert('Valutazione inviata correttamente!');
      q('#valForm').reset();
      makeRatings();
    } catch(e) { alert('Errore di rete.'); }
    
    btn.disabled = false;
    btn.innerText = "Salva & Invia a HR";
  };
});