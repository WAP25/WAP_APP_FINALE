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

window.addEventListener('load', () => {
  makeRatings();
  const btn = q('#btnSend');
  
  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Invio...";

    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    cats.forEach(cat => somma += Number(getRating(cat)));
    const percent = Math.round((somma / 28) * 100) + "%";

    // Prepariamo i dati
    const payload = {
      form_type: 'muratore',
      valutatore: q('#valutatore').value,
      valutato: q('#valutato').value,
      cantiere: q('#cantiere').value,
      ore: q('#ore').value,
      incident: q('#incident').value,
      rilavorazioni: getRating('rilavorazioni'),
      tempi: getRating('tempi'),
      produttivita: getRating('produttivita'),
      sicurezza: getRating('sicurezza'),
      qualita: getRating('qualita'),
      competenze: getRating('competenze'),
      collaborazione: getRating('collaborazione'),
      total_score: percent,
      note: q('#note').value
    };

    // Trasformazione manuale in stringa per evitare errori di mappatura
    const encData = Object.keys(payload).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(payload[k])).join('&');

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: encData,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      alert('Inviato!');
      location.reload();
    } catch(e) {
      alert('Errore');
      btn.disabled = false;
    }
  };
});