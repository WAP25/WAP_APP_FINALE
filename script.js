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

window.addEventListener('DOMContentLoaded', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Invio...";

    // Calcolo Punteggio Totale (Media 1-4 trasformata in %)
    const skills = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let sum = 0;
    skills.forEach(s => sum += getVal(s));
    const finalScore = Math.round(((sum / (skills.length * 4)) * 100)) + "%";

    const data = {
      form_type: 'muratore',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: q('#valutatore').value,
      valutato: q('#valutato').value,
      cantiere: q('#cantiere').value,
      ore: q('#ore').value,
      incident: q('#incident').value,
      rilavorazioni: getVal('rilavorazioni'),
      tempi: getVal('tempi'),
      produttivita: getVal('produttivita'),
      sicurezza: getVal('sicurezza'),
      qualita: getVal('qualita'),
      competenze: getVal('competenze'),
      collaborazione: getVal('collaborazione'),
      total_score: finalScore,
      note: q('#note').value
    };

    const body = Object.keys(data).map(k => encodeURIComponent(k)+'='+encodeURIComponent(data[k])).join('&');

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: body, headers: {'Content-Type': 'application/x-www-form-urlencoded'} });
      alert('Inviato con successo! Punteggio: ' + finalScore);
      location.reload(); 
    } catch(e) { alert('Errore invio'); btn.disabled = false; }
  };
});