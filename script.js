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
  if(!btn) return;

  btn.onclick = async function() {
    const v = q('#valutatore').value.trim();
    const vt = q('#valutato').value.trim();
    const c = q('#cantiere').value.trim();

    if(!v || !vt || !c){ alert('Compila Valutatore, Dipendente e Cantiere!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    // Calcolo punteggio complessivo (7 categorie, max 4pt l'una = 28pt)
    const categorie = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    categorie.forEach(cat => somma += getRatingValue(cat));
    const finalScore = Math.round((somma / 28) * 100) + "%";

    // Costruzione sicura dei dati
    const params = new URLSearchParams();
    params.append('form_type', 'muratore');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', v);
    params.append('valutato', vt);
    params.append('cantiere', c);
    params.append('ore', q('#ore').value);
    params.append('incident', q('#incident').value);
    
    // Aggiunta dinamica dei punteggi
    categorie.forEach(cat => params.append(cat, getRatingValue(cat)));
    
    params.append('total_score', finalScore);
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString() 
      });
      alert('Valutazione Muratore Inviata! Punteggio: ' + finalScore);
      q('#valForm').reset();
      makeRatings();
    } catch(e) { 
      alert('Errore nell\'invio dati'); 
    } finally {
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    }
  };
});