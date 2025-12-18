const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

// Crea le celle 1-4
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

// Recupera il numero selezionato (1-4)
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
    const val_valutatore = q('#valutatore').value.trim();
    const val_valutato = q('#valutato').value.trim();
    const val_cantiere = q('#cantiere').value.trim();

    if(!val_valutatore || !val_valutato || !val_cantiere){
      alert("Valutatore, Dipendente e Cantiere sono obbligatori!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Invio...";

    // Categorie per il calcolo percentuale (7 categorie)
    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    cats.forEach(c => somma += Number(getRating(c)));
    const percent = Math.round((somma / 28) * 100) + "%";

    // Prepariamo i dati esattamente come li vuole Codice.gs
    const params = new URLSearchParams();
    params.append('form_type', 'muratore');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', val_valutatore);
    params.append('valutato', val_valutato);
    params.append('cantiere', val_cantiere);
    params.append('ore', q('#ore').value);
    params.append('incident', q('#incident').value);
    
    // Aggiungiamo i punteggi uno per uno
    cats.forEach(c => params.append(c, getRating(c)));

    params.append('total_score', percent);
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: params.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      alert('Valutazione Muratore Inviata con Successo!');
      location.reload();
    } catch(e) {
      alert('Errore di invio. Riprova.');
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    }
  };
});