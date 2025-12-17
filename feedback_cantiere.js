const ADMIN_PIN = "44232"; 
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwhR5X1UViuDefzbZFzjoAgLAbkp3flArkLRiOnJnQmXGZAEm94gBz5Zjp_6BzbPwwe/exec"; 

function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

// ... (makeRatings, getRatingValue, calcAverage rimangono quelle del tuo file) ...

document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();
  q('#btnSend').addEventListener('click', async ()=>{
    const btn = q('#btnSend');
    const v = q('#valutatore').value.trim();
    const c = q('#cantiere').value.trim();
    if(!v || !c){ alert('Mancano dati!'); return; }

    btn.disabled = true;
    btn.innerText = "Invio...";

    const sUff = calcAverage(['chiarezza_doc', 'gestione_logistica', 'tempestivita_uff']);
    const sResp = calcAverage(['supporto_resp', 'sicurezza_gest', 'equita_dec']);
    const sSquad = calcAverage(['collaborazione_mutua', 'accessibilita_lav', 'armonia_team']);
    
    const record = {
      form_type: 'cantiere',
      timestamp: new Date().toLocaleString('it-IT'),
      valutatore: v,
      cantiere: c,
      chiarezza_doc: getRatingValue('chiarezza_doc'),
      gestione_logistica: getRatingValue('gestione_logistica'),
      tempestivita_uff: getRatingValue('tempestivita_uff'),
      score_ufficio: sUff + "%",
      supporto_resp: getRatingValue('supporto_resp'),
      sicurezza_gest: getRatingValue('sicurezza_gest'),
      equita_dec: getRatingValue('equita_dec'),
      score_resp: sResp + "%",
      collaborazione_mutua: getRatingValue('collaborazione_mutua'),
      accessibilita_lav: getRatingValue('accessibilita_lav'),
      armonia_team: getRatingValue('armonia_team'),
      score_squadra: sSquad + "%",
      total_score: Math.round(((sUff+sResp+sSquad)/3)*100)/100 + "%",
      note: q('#note').value.trim()
    };

    const queryString = Object.keys(record).map(k => encodeURIComponent(k)+'='+encodeURIComponent(record[k])).join('&');
    
    try {
      await fetch(GOOGLE_SHEET_ENDPOINT, { method: 'POST', mode: 'no-cors', body: queryString });
      alert('Inviato con successo!');
      q('#valForm').reset();
      makeRatings();
    } catch(e) { alert('Errore invio'); }
    btn.disabled = false;
    btn.innerText = "Invia Feedback Organizzativo";
  });
});