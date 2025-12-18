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
      alert("Compila Valutatore, Dipendente e Cantiere!");
      return;
    }

    btn.disabled = true;
    btn.innerText = "Invio...";

    const cats = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
    let somma = 0;
    cats.forEach(cat => somma += Number(getRating(cat)));
    const percent = Math.round((somma / 28) * 100) + "%";

    const params = new URLSearchParams();
    params.append('form_type', 'muratore');
    params.append('timestamp', new Date().toLocaleString('it-IT'));
    params.append('valutatore', v);
    params.append('valutato', vt);
    params.append('cantiere', c);
    params.append('ore', q('#ore').value);
    params.append('incident', q('#incident').value);
    
    cats.forEach(cat => params.append(cat, getRating(cat)));

    params.append('total_score', percent);
    params.append('note', q('#note').value.trim());

    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: params.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      alert('Valutazione Muratore Inviata!');
      location.reload();
    } catch(e) {
      alert('Errore invio');
      btn.disabled = false;
    }
  };
});