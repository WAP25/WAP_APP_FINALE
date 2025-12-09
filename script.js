// IL TUO URL DI ESECUZIONE CORRETTO! (Ultimo URL fornito)
const GOOGLE_SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbxK7ziP7zskpjj6VAoYjBuROihg0leyswkHrzrrnzsdOPByPStVQnhUfcrffOT_doAs/exec";
const ADMIN_PIN = "44232";

function q(s){return document.querySelector(s)}
function qa(s){return Array.from(document.querySelectorAll(s))}

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
    // Imposta il rating 2 come predefinito per default
    r.querySelector('.rate-cell[data-val="2"]').classList.add('sel'); 
  });
}

function getRatingValue(name){
  const r = document.querySelector(`.rating[data-name="${name}"]`);
  if(!r) return 2;
  const sel = r.querySelector('.rate-cell.sel');
  return sel ? Number(sel.dataset.val) : 2;
}

function calcTotal(){
  const names = ['rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione'];
  let totalScore = 0;
  
  const scores = names.map(k=>{
    let ratingValue = getRatingValue(k);
    let score;
    
    // Logica ribaltata per Rilavorazioni (metrica negativa: 4=0%, 1=100%)
    if(k === 'rilavorazioni'){
      score = ((4 - ratingValue) / 3) * 100; 
    } else {
      score = ((ratingValue - 1) / 3) * 100; // 1=0%, 4=100%
    }
    totalScore += score;
    return score;
  });
  
  const finalTotal = totalScore / names.length;
  return Math.round(finalTotal * 100) / 100;
}

function saveLocal(record){
  const all = JSON.parse(localStorage.getItem('valutazioni_v3')||'[]');
  all.push(record);
  localStorage.setItem('valutazioni_v3', JSON.stringify(all));
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
    const total = calcTotal();
    alert('Anteprima - Punteggio totale: ' + total);
  });

  q('#btnSend').addEventListener('click', async ()=>{
    const valutatore = q('#valutatore').value.trim();
    const valutato = q('#valutato').value.trim();
    const cantiere = q('#cantiere').value.trim();
    if(!valutatore || !valutato || !cantiere){ alert('Inserire valutatore, valutato e cantiere.'); return; }

    const record = {
      id: 'ev_'+Math.random().toString(36).slice(2,9),
      timestamp: new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' }), 
      valutatore, valutato, cantiere,
      ore: q('#ore').value || '',
      incident: q('#incident').value,
      rilavorazioni: getRatingValue('rilavorazioni'),
      tempi: getRatingValue('tempi'),
      produttivita: getRatingValue('produttivita'),
      sicurezza: getRatingValue('sicurezza'),
      qualita: getRatingValue('qualita'),
      competenze: getRatingValue('competenze'),
      collaborazione: getRatingValue('collaborazione'),
      total_score: calcTotal(),
      note: q('#note').value.trim()
    };

    saveLocal(record);
    const ok = await sendToGoogleSheets(record);
    
    if(ok) {
        alert('Valutazione salvata nello storico locale. Invio a Google Sheets riuscito! (Verifica la scheda "Foglio1").');
    } else {
        alert('Attenzione: si è verificato un errore nell\'invio a Google Sheets. Verifica le autorizzazioni dello script e l\'URL!');
    }

    q('#valutato').value=''; q('#note').value=''; q('#cantiere').value='';
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
    const all = JSON.parse(localStorage.getItem('valutazioni_v3')||'[]').slice().reverse();
    if(!all.length){ alert('Nessuna valutazione da esportare.'); return; }
    const header = ['id','timestamp','valutato','valutatore','cantiere','ore','incident','rilavorazioni','tempi','produttivita','sicurezza','qualita','competenze','collaborazione','total_score','note'];
    const rows = all.map(r => header.map(h=>JSON.stringify(r[h]||'')).join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'valutazioni_export.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  q('#clearLocal').addEventListener('click', ()=>{
    if(confirm('Eliminare tutte le valutazioni salvate localmente?')){ localStorage.removeItem('valutazioni_v3'); renderList(); alert('Eliminate.'); }
  });

  function renderList(filter=''){
    const area = q('#list'); area.innerHTML='';
    const all = JSON.parse(localStorage.getItem('valutazioni_v3')||'[]').slice().reverse();
    const filtered = all.filter(it=>{
      if(!filter) return true;
      const s = filter.toLowerCase();
      return (it.valutato && it.valutato.toLowerCase().includes(s)) || (it.cantiere && it.cantiere.toLowerCase().includes(s)) || (it.valutatore && it.valutatore.toLowerCase().includes(s));
    });
    if(!filtered.length){ area.innerHTML='<div class="muted">Nessuna valutazione.</div>'; return; }
    filtered.forEach(it=>{
      const div = document.createElement('div');
      div.className='list-item';
      div.innerHTML = `<div><strong>${escapeHtml(it.valutato)}</strong><div class=\"muted\">${escapeHtml(it.cantiere)} — ${escapeHtml(it.timestamp)}</div></div><div>${it.total_score}</div>`;
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
      'ID: '+it.id,
      'Valutato: '+it.valutato,
      'Valutatore: '+it.valutatore,
      'Cantiere: '+it.cantiere,
      'Ore: '+it.ore,
      'Incidenti: '+it.incident,
      'Punteggio totale: '+it.total_score,
      'Note: '+(it.note||'')
    ].join('\n');
    alert(s);
  }

  function escapeHtml(s){ if(!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  
  renderList();
});