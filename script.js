const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

// ... (makeRatings e getRatingValue identiche) ...

document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();
  q('#btnSend').addEventListener('click', async ()=>{
    const btn = q('#btnSend');
    const v = q('#valutatore').value.trim();
    const valutato = q('#valutato').value.trim();
    if(!v || !valutato){ alert('Mancano Valutatore o Dipendente!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    const record = {
      form_type: 'muratore',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      valutato: valutato,
      cantiere: q('#cantiere').value,
      ore: q('#ore').value,
      incident: q('#incident').value,
      rilavorazioni: getRatingValue('rilavorazioni'),
      tempi: getRatingValue('tempi'),
      produttivita: getRatingValue('produttivita'),
      sicurezza: getRatingValue('sicurezza'),
      qualita: getRatingValue('qualita'),
      competenze: getRatingValue('competenze'),
      collaborazione: getRatingValue('collaborazione'),
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
  });
});