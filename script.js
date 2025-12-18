/**
 * JAVASCRIPT - script.js
 * Gestione interfaccia e invio dati al database Google Sheets
 */

const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

const q = s => document.querySelector(s);
const qa = s => Array.from(document.querySelectorAll(s));

// 1. Inizializza i selettori di voto (1-4)
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
    // Imposta il valore "2" come predefinito (Sufficiente)
    const def = r.querySelector('.rate-cell[data-val="2"]');
    if(def) def.classList.add('sel'); 
  });
}

// 2. Recupera il valore selezionato per una categoria
function getRating(name){
  const container = q(`.rating[data-name="${name}"]`);
  const selected = container ? container.querySelector('.rate-cell.sel') : null;
  return selected ? selected.dataset.val : "2";
}

// 3. Gestione evento al caricamento e invio
window.addEventListener('load', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    // Campi obbligatori
    const v = q('#valutatore').value.trim();
    const vt = q('#valutato').value.trim();
    const c = q('#cantiere').value.trim();

    if(!v || !vt || !c){
      alert("ERRORE: Valutatore, Dipendente e Cantiere sono campi obbligatori!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Invio in corso...";

    // Calcolo Percentuale (7 categorie x max 4 punti = 28)
    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    cats.forEach(cat => somma += Number(getRating(cat)));
    const percent = Math.round((somma / 28) * 100) + "%";

    // Costruzione corpo della richiesta
    const payload = new URLSearchParams();
    payload.append('form_type', 'muratore');
    payload.append('timestamp', new Date().toLocaleString('it-IT'));
    payload.append('valutatore', v);
    payload.append('valutato', vt);
    payload.append('cantiere', c);
    payload.append('ore', q('#ore').value);
    payload.append('incident', q('#incident').value);
    
    // Aggiunta voti
    cats.forEach(cat => payload.append(cat, getRating(cat)));

    payload.append('total_score', percent);
    payload.append('note', q('#note').value.trim());

    try {
      // Invio effettivo a Google Apps Script
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: payload.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      alert('Valutazione inviata con successo al sistema HR!');
      location.reload(); // Ricarica la pagina per pulire il form
    } catch(e) {
      alert('ERRORE: Impossibile inviare i dati. Controlla la connessione.');
      btn.disabled = false;
      btn.innerText = "Salva & Invia a HR";
    }
  };
});