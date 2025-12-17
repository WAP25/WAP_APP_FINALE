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
  if(!container) return "2";
  const selected = container.querySelector('.rate-cell.sel');
  return selected ? selected.dataset.val : "2";
}

window.addEventListener('load', () => {
  makeRatings();
  const btn = q('#btnSend');
  if(!btn) return;

  btn.onclick = async () => {
    btn.disabled = true;
    btn.innerText = "Invio...";

    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let sum = 0; 
    cats.forEach(c => sum += Number(getRating(c)));
    const percent = Math.round((sum / 28) * 100) + "%";

    // COSTRUZIONE MANUALE DELLA STRINGA PER MASSIMA COMPATIBILITÀ
    let body = "form_type=muratore";
    body += "&timestamp=" + encodeURIComponent(new Date().toLocaleString('it-IT'));
    body += "&valutatore=" + encodeURIComponent(q('#valutatore').value);
    body += "&valutato=" + encodeURIComponent(q('#valutato').value);
    body += "&cantiere=" + encodeURIComponent(q('#cantiere').value);
    body += "&ore=" + encodeURIComponent(q('#ore').value);
    body += "&incident=" + encodeURIComponent(q('#incident').value);
    cats.forEach(c => body += "&" + c + "=" + getRating(c));
    body += "&total_score=" + encodeURIComponent(percent);
    body += "&note=" + encodeURIComponent(q('#note').value);

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body 
      });
      alert('Valutazione Muratore Inviata con Successo!');
      location.reload();
    } catch(e) { 
      alert('Errore di connessione'); 
      btn.disabled = false; 
    }
  };
});