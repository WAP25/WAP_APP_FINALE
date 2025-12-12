// IL TUO URL DI ESECUZIONE CORRETTO! (Ultimo URL fornito)
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxK7ziP7zskpjj6VAoYjBuROihg0leyswkHrzrrnzsdOPByPStVQnhUfcrffOT_doAs/exec";function q(s){return document.querySelector(s)}
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
    // RESPONSABILE: Corretto 'rispetto_resp' in 'equita_dec'
    const respNames = ['supporto_resp', 'sicurezza_gest', 'equita_dec']; 
    // SQUADRA: Corretti i nomi e aggiunto 'accessibilita_lav' (il terzo voto mancante)
    const squadraNames = ['collaborazione_mutua', 'accessibilita_lav', 'armonia_team']; 
    
    const scoreUfficio = calcAverage(ufficioNames);
    // ...
}

function saveLocal(record){
  const all = JSON.parse(localStorage.getItem('feedback_cantiere_v1')||'[]');
  all.push(record);
  localStorage.setItem('feedback_cantiere_v1', JSON.stringify(all));
}

async function sendToGoogleSheets(record){
  let sheetSuccess = false;
  
  try{
    const sheetResp = await fetch(GOOGLE_SHEET_ENDPOINT, {
      method: 'POST',
      mode: 'cors', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(record).toString()
    });
    sheetSuccess = sheetResp.ok;
  } catch(e) {
    console.error("Errore invio a Sheets:", e);
  }
  return sheetSuccess; 
}


// Quando il documento è pronto, esegui il codice
document.addEventListener('DOMContentLoaded', ()=>{
  makeRatings();

  q('#btnPreview').addEventListener('click', ()=>{
    const scores = calcTotal();
    alert(`Anteprima Punteggi:\nUfficio/Commessa: ${scores.score_ufficio}%\nResponsabile: ${scores.score_resp}%\nSquadra: ${scores.score_squadra}%\nTotale: ${scores.total_score}%`);
  });

  q('#btnSend').addEventListener('click', async ()=>{
    const valutatore = q('#valutatore').value.trim();
    const cantiere = q('#cantiere').value.trim();
    if(!valutatore || !cantiere){ alert('Inserire valutatore e cantiere.'); return; }

    const scores = calcTotal();

    const record = {
      id: 'fbk_'+Math.random().toString(36).slice(2,9),
      timestamp: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }), 
      valutatore, cantiere,
      chiarezza_doc: getRatingValue('chiarezza_doc'),
      gestione_logistica: getRatingValue('gestione_logistica'),
      tempestivita_uff: getRatingValue('tempestivita_uff'),
      supporto_resp: getRatingValue('supporto_resp'),
      sicurezza_gest: getRatingValue('sicurezza_gest'),
      rispetto_resp: getRatingValue('rispetto_resp'),
      collaborazione_team: getRatingValue('collaborazione_team'),
      armonia_team: getRatingValue('armonia_team'),
      score_ufficio: scores.score_ufficio,
      score_resp: scores.score_resp,
      score_squadra: scores.score_squadra,
      total_score: scores.total_score,
      note: q('#note').value.trim()
    };

    saveLocal(record);
    const ok = await sendToGoogleSheets(record);
    
    if(ok) {
        alert('Feedback salvato nello storico locale. Invio a Google Sheets riuscito! (Verifica la scheda "Feedback_Cantiere").');
    } else {
        alert('Attenzione: si è verificato un errore nell\'invio a Google Sheets. Verifica le autorizzazioni dello script e l\'URL!');
    }

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
    const header = ['id','timestamp','valutatore','cantiere','chiarezza_doc','gestione_logistica','tempestivita_uff','supporto_resp','sicurezza_gest','rispetto_resp','collaborazione_team','armonia_team','score_ufficio','score_resp','score_squadra','total_score','note'];
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
      'Supporto Ufficio Veloce: ' + it.tempestivita_uff,
      'Guida e Supporto: ' + it.supporto_resp,
      'Sicurezza al Primo Posto: ' + it.sicurezza_gest,
      'Ascolto e Rispetto: ' + it.rispetto_resp,
      'Collaborazione Team: ' + it.collaborazione_team,
      'Ritmi Giusti: ' + it.armonia_team,
      'Note: '+(it.note||'')
    ].join('\n');
    alert(s);
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  
  renderList();
});