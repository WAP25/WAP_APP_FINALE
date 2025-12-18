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
  if(!btn) return;

  btn.onclick = async () => {
    const v = q('#valutatore').value.trim();
    const vt = q('#valutato').value.trim();
    const c = q('#cantiere').value.trim();

    if(!v || !vt || !c){
      alert("Valutatore, Dipendente e Cantiere sono obbligatori!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Invio...";

    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    cats.forEach(cat => somma += Number(getRating(cat)));
    const percent = Math.round((somma / 28) * 100) + "%";

    // Creazione record piatto (Flat Object)
    const record = {
      form_type: 'muratore',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      valutato: vt,
      cantiere: c,
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
      note: q('#note').value.trim()
    };

    // Costruzione stringa di invio (Metodo compatibile al 100%)
    const queryString = Object.keys(record)
      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(record[k]))
      .join('&');

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: queryString
      });
      alert('Valutazione Muratore Inviata con Successo!');
      location.reload();
    } catch(e) {
      alert('Errore di invio. Controlla la connessione.');
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    }
  };
});