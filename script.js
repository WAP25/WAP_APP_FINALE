const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

// Crea le celle cliccabili (1-4) per ogni rating
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
    const def = r.querySelector('.rate-cell[data-val="2"]'); // Default a 2
    if(def) def.classList.add('sel'); 
  });
}

// Funzione CRITICA: recupera il valore selezionato
function getRatingValue(name){
  const container = q(`.rating[data-name="${name}"]`);
  if(!container) return 2;
  const selected = container.querySelector('.rate-cell.sel');
  return selected ? Number(selected.dataset.val) : 2;
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
      alert('Valutatore, Dipendente e Cantiere sono obbligatori!'); 
      return; 
    }

    btn.disabled = true;
    btn.innerText = "Invio in corso...";

    // Calcolo punteggio totale in percentuale
    const categorie = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    categorie.forEach(cat => somma += getRatingValue(cat));
    const percent = Math.round((somma / (categorie.length * 4)) * 100) + "%";

    const params = new URLSearchParams();
    params.append('form_type', 'muratore');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', val_valutatore);
    params.append('valutato', val_valutato);
    params.append('cantiere', val_cantiere);
    params.append('ore', q('#ore').value);
    params.append('incident', q('#incident').value);
    
    // Inserimento punteggi
    categorie.forEach(cat => {
      params.append(cat, getRatingValue(cat));
    });

    params.append('total_score', percent);
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      alert('Valutazione Muratore Inviata! Score: ' + percent);
      location.reload(); 
    } catch(e) {
      alert('Errore di rete. Riprova.');
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    }
  };
});