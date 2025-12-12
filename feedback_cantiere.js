// IL TUO URL DI ESECUZIONE CORRETTO!
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbysDVldy0096e8JsSx3XshrfDUJskcah3_eW_1HeLWHmjnXJoBsigs1aL_4C_uBfmFe/exec"; 
const ADMIN_PIN = "44232"; 

function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

// --- FUNZIONI DI BASE ---

function makeRatings(){
  qa('.rating').forEach(r=>{
    r.innerHTML = ''; 
    for(let i=1;i<=4;i++){
      const cell = document.createElement('div');
      cell.className='rate-cell';
      cell.innerText = i;
      cell.dataset.val = i;
      cell.addEventListener('click', ()=>{
        r.querySelectorAll('.rate-cell').forEach(x=>x.classList.remove('sel'));
        cell.classList.add('sel');
      });
      r.appendChild(cell);
    }
    // Imposta il rating 2 come predefinito
    r.querySelector('.rate-cell[data-val="2"]').classList.add('sel'); 
  });
}

function getRatingValue(name){
  const r = document.querySelector(`.rating[data-name="${name}"]`);
  if(!r) return 2;
  const sel = r.querySelector('.rate-cell.sel');
  return sel ? Number(sel.dataset.val) : 2;
}

function calcAverage(names){
    if (names.length === 0) return 0;
    let totalScore = 0;
    names.forEach(k => {
      // Calcola lo score in percentuale (1=0%, 4=100%)
      let ratingValue = getRatingValue(k);
      totalScore += ((ratingValue - 1) / 3) * 100;
    });
    return Math.round((totalScore / names.length) * 100) / 100;
}

function calcTotal(){
    const ufficioNames = ['chiarezza_doc', 'gestione_logistica', 'tempestivita_uff'];
    // Nomi dei campi allineati (HTML e Apps Script)
    const respNames = ['supporto_resp', 'sicurezza_gest', 'equita_dec']; 
    // Nomi dei campi allineati (HTML e Apps Script)
    const squadraNames = ['collaborazione_mutua', 'accessibilita_lav', 'armonia_team'];
    
    const scoreUfficio = calcAverage(ufficioNames);
    const scoreResp = calcAverage(respNames);
    const scoreSquadra = calcAverage(squadraNames);
    
    const totalAvg = (scoreUfficio + scoreResp + scoreSquadra) / 3;
    
    return {
      score_ufficio: scoreUfficio,
      score_resp: scoreResp,
      score_squadra: scoreSquadra,
      total_score: Math.round(totalAvg * 100) / 100
    };
}

function saveLocal(record){
  const all = JSON.parse(localStorage.getItem('feedback_cantiere_v1')||'[]');
  all.push(record);
  localStorage.setItem('feedback_cantiere_v1', JSON.stringify(all));
}

// *** CORREZIONE CRITICA PER INVIO MOBILE/AFFIDABILITÀ ***
async function sendToGoogleSheets(record){
  
  // 1. Converti l'oggetto 'record' in una stringa di query URL-encoded
  const queryString = Object.keys(record).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(record[key]);
  }).join('&');
  
  try{
    const sheetResp = await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: 'POST',
      // Usa 'no-cors' per la massima compatibilità con Apps Script
      mode: 'no-cors', 
      // Specifica il Content-Type per la stringa URL-encoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: queryString 
    });
    
    // Con 'no-cors', non possiamo leggere la risposta JSON.
    // Dobbiamo fidarci che la richiesta sia partita.
    return true; 
    
  } catch(e) {
    console.error("Errore invio a Sheets:", e);
    return false;
  }
}
// *** FINE CORREZIONE CRITICA ***


// Quando il documento è pronto, esegui il codice
document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();

  q('#btnPreview').addEventListener('click', ()=>{
    const scores = calcTotal();
    alert(`Anteprima Punteggi:\nUfficio/Commessa: ${scores.score_ufficio}%\nResponsabile: ${scores.score_resp}%\nSquadra: ${scores.score_squadra}%\nTotale: ${scores.total_score}%`);
  });

  q('#btnSend').addEventListener('click', async ()=>{
    const btn = q('#btnSend');
    
    const valutatore = q('#valutatore').value.trim();
    const cantiere = q('#cantiere').value.trim();
    if(!valutatore || !cantiere){ alert('Inserire valutatore e cantiere.'); return; }

    btn.disabled = true;
    btn.innerText = 'Invio in corso...';
    
    const scores = calcTotal();

    const record = {
      // Nota: Rimosso 'id' che causava slittamento se presente in Apps Script
      timestamp: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }),  
      valutatore, cantiere,
      chiarezza_doc: getRatingValue('chiarezza_doc'),
      gestione_logistica: getRatingValue('gestione_logistica'),
      tempestivita_uff: getRatingValue('tempestivita_uff'),
      supporto_resp: getRatingValue('supporto_resp'),
      sicurezza_gest: getRatingValue('sicurezza_gest'),
      equita_dec: getRatingValue('equita_dec'), 
      collaborazione_mutua: getRatingValue('collaborazione_mutua'), 
      accessibilita_lav: getRatingValue('accessibilita_lav'),
      armonia_team: getRatingValue('armonia_team'),
      
      // I punteggi calcolati DEVONO essere inviati come parametri per Apps Script
      score_ufficio: scores.score_ufficio,
      score_resp: scores.score_resp,
      score_squadra: scores.score_squadra,
      total_score: scores.total_score,
      
      note: q('#note').value.trim()
    };

    saveLocal(record);
    const ok = await sendToGoogleSheets(record);
    
    btn.disabled = false;
    btn.innerText = 'Invia Feedback Organizzativo';
    
    if(ok) {
        alert('Feedback salvato nello storico locale. Invio a Google Sheets riuscito!');
    } else {
        alert('Attenzione: si è verificato un errore nell\'invio a Google Sheets. Verifica l\'URL dello script e le autorizzazioni di accesso!');
    }

    // Pulisce il form
    q('#cantiere').value=''; q('#note').value='';
    qa('.rate-cell').forEach(c=>c.classList.remove('sel'));
    makeRatings();  

    renderList();
  });

  // Funzioni Admin/Storico
  q('#btnAdmin').addEventListener('click', ()=>{
    const pin = q('#adminPin').value.trim();
    if(pin === ADMIN_PIN){
      q('#adminArea').style.display='block';
      renderList();
      q('#adminPin').value='';
    } else {
      alert('PIN errato.');
    }
  });

  q('#search').addEventListener('input', (e)=> renderList(e.target.value));

  q('#exportCsv').addEventListener('click', ()=>{
    const all = JSON.parse(localStorage.getItem('feedback_cantiere_v1')||'[]').slice().reverse();
    if(!all.length){ alert('Nessun feedback da esportare.'); return; }
    // Intestazioni CSV aggiornate
    const header = ['timestamp','valutatore','cantiere','chiarezza_doc','gestione_logistica','tempestivita_uff','score_ufficio','supporto_resp','sicurezza_gest','equita_dec','score_resp','collaborazione_mutua','accessibilita_lav','armonia_team','score_squadra','total_score','note'];
    const rows = all.map(r => header.map(h=>JSON.stringify(r[h]||'')).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'feedback_cantiere_export.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  q('#clearLocal').addEventListener('click', ()=>{
    if(confirm('Eliminare tutti i feedback salvati localmente?')){ localStorage.removeItem('feedback_cantiere_v1'); renderList(); alert('Eliminati.'); }
  });

  function renderList(filter=''){
    const area = q('#list'); area.innerHTML='';
    const all = JSON.parse(localStorage.getItem('feedback_cantiere_v1')||'[]').slice().reverse();
    const filtered = all.filter(it=>{
      if(!filter) return true;
      const s = filter.toLowerCase();
      return (it.cantiere && it.cantiere.toLowerCase().includes(s)) || (it.valutatore && it.valutatore.toLowerCase().includes(s));
    });
    if(!filtered.length){ area.innerHTML='<div class="muted">Nessun feedback.</div>'; return; }
    filtered.forEach(it=>{
      const div = document.createElement('div');
      div.className='list-item';
      div.innerHTML = `<div><strong>${escapeHtml(it.cantiere)}</strong><div class=\"muted\">${escapeHtml(it.valutatore)} — ${escapeHtml(it.timestamp)}</div></div><div>${it.total_score}%</div>`;
      div.addEventListener('click', ()=>{
        qa('.list-item').forEach(x=>x.classList.remove('selected'));
        div.classList.add('selected');
        showDetail(it);
      });
      area.appendChild(div);
    });
  }

  function showDetail(it){
    const s = [
      'Feedback del: '+it.timestamp,
      'Valutatore: '+it.valutatore,
      'Cantiere: '+it.cantiere,
      '--- Punteggi Settoriali (0-100) ---',
      'Punteggio Ufficio/Commessa: '+it.score_ufficio+'%',
      'Punteggio Responsabile: '+it.score_resp+'%',
      'Punteggio Squadra Operativa: '+it.score_squadra+'%',
      'Punteggio Totale Cantiere: '+it.total_score+'%',
      '--- Dettaglio Rating (1-4) ---',
      'Istruzioni Chiare: ' + it.chiarezza_doc,
      'Zero Attese Materiali: ' + it.gestione_logistica,
      'Supporto Ufficio