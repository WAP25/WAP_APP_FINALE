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

      if(!v || !valutato || !c){ alert('Compila Valutatore, Dipendente e Cantiere!'); return; }

      btn.disabled = true;
      btn.innerText = "Invio...";

      const record = {
        form_type: 'muratore',
        timestamp: new Date().toLocaleString('it-IT'),
        valutatore: v,
        valutato: valutato,
        cantiere: c,
        ore: q('#ore').value,
        incident: q('#incident').value,
        rilavorazioni: getRatingValue('rilavorazioni'),
        tempi: getRatingValue('tempi'),
        produttivita: getRatingValue('produttivita'),
        sicurezza: getRatingValue('sicurezza'),
        qualita: getRatingValue('qualita'),
        competenze: getRatingValue('competenze'),
        collaborazione: getRatingValue('collaborazione'),
        total_score: "Calcolato",
        note: q('#note').value.trim()
      };

      const queryString = Object.keys(record).map(k => encodeURIComponent(k)+'='+encodeURIComponent(record[k])).join('&');
      
      try {
        await fetch(GOOGLE_SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: queryString });
        alert('Valutazione Muratore Inviata!');
        q('#valForm').reset();
        makeRatings();
      } catch(e) { alert('Errore invio'); }
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    };
  }
});