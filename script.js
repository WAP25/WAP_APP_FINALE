const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 


function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

function makeRatings(){
  qa('.rating').forEach(r=>{
    r.innerHTML = ''; 
    for(let i=1;i<=4;i++){
      const cell = document.createElement('div');
      cell.className='rate-cell'; cell.innerText = i; cell.dataset.val = i;
      cell.addEventListener('click', ()=>{
        r.querySelectorAll('.rate-cell').forEach(x=>x.classList.remove('sel'));
        cell.classList.add('sel');
      });
      r.appendChild(cell);
    }
    r.querySelector('.rate-cell[data-val="2"]').classList.add('sel'); 
  });
}

function getRatingValue(name){
  const r = document.querySelector(`.rating[data-name="${name}"]`);
  const sel = r ? r.querySelector('.rate-cell.sel') : null;
  return sel ? Number(sel.dataset.val) : 2;
}

document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();
  
  q('#btnSend').addEventListener('click', async ()=>{
    const btn = q('#btnSend');
    const v = q('#valutatore').value.trim();
    const m = q('#muratore').value.trim(); // Nome muratore
    if(!v || !m){ alert('Mancano Valutatore o Muratore!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    // Mappatura forzata sulle 17 colonne per compatibilità
    const record = {
      form_type: 'muratore',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      cantiere: m, // Scriviamo il nome del muratore nella colonna 'Cantiere'
      chiarezza_doc: getRatingValue('qualita_lavoro'), // Mappato su colonna 4
      gestione_logistica: getRatingValue('velocita'),   // Mappato su colonna 5
      tempestivita_uff: getRatingValue('pulizia'),      // Mappato su colonna 6
      score_ufficio: "", 
      supporto_resp: getRatingValue('puntualita'),      // Mappato su colonna 8
      sicurezza_gest: "", equita_dec: "", score_resp: "",
      collaborazione_mutua: "", accessibilita_lav: "", armonia_team: "",
      score_squadra: "", total_score: "",
      note: q('#note').value.trim()
    };

    const queryString = Object.keys(record).map(k => encodeURIComponent(k)+'='+encodeURIComponent(record[k])).join('&');
    
    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: queryString 
      });
      alert('Valutazione Muratore Inviata!');
      q('#valForm').reset();
      makeRatings();
    } catch(e) {
      alert('Errore invio');
    }
    btn.disabled = false;
    btn.innerText = "Invia Valutazione";
  });
});