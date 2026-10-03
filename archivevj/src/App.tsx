import { FormEvent, PointerEvent as ReactPointerEvent, useRef, useState } from 'react';
import { ArchiveItem, resolveArchiveVideo, searchArchive } from './archive';

type DeckId = 'A' | 'B';
type BrowserProps = { deck: DeckId; onLoad: (deck: DeckId, item: ArchiveItem) => Promise<void>; };

function BrowserPanel({ deck, onLoad }: BrowserProps) {
  const [query,setQuery]=useState(''); const [items,setItems]=useState<ArchiveItem[]>([]); const [busy,setBusy]=useState(false); const [error,setError]=useState(''); const [floating,setFloating]=useState(false);
  const panel=useRef<HTMLDivElement>(null); const drag=useRef({x:0,y:0});
  async function submit(e:FormEvent){e.preventDefault(); if(!query.trim()) return; setBusy(true);setError(''); try{setItems(await searchArchive(query));}catch(err){setError(err instanceof Error?err.message:'Search failed');}finally{setBusy(false);}}
  function pointerDown(e:ReactPointerEvent){if(!floating||!panel.current) return; const r=panel.current.getBoundingClientRect(); drag.current={x:e.clientX-r.left,y:e.clientY-r.top}; panel.current.setPointerCapture(e.pointerId);}
  function pointerMove(e:ReactPointerEvent){if(!floating||!panel.current||!panel.current.hasPointerCapture(e.pointerId)) return; panel.current.style.left=`${Math.max(0,e.clientX-drag.current.x)}px`;panel.current.style.top=`${Math.max(0,e.clientY-drag.current.y)}px`;}
  return <section ref={panel} className={`browser-panel ${floating?'floating':''}`}>
    <header className="panel-title" onPointerDown={pointerDown} onPointerMove={pointerMove}><strong>ARCHIVE {deck}</strong><button onClick={()=>setFloating(v=>!v)}>{floating?'Dock':'Float'}</button></header>
    <form className="search-row" onSubmit={submit}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search video for Deck ${deck}`} aria-label={`Search Archive for Deck ${deck}`}/><button disabled={busy}>{busy?'Searching…':'Search'}</button></form>
    {error&&<p className="error">{error}</p>}
    <div className="results">{items.map(item=><button className="result" key={item.identifier} onClick={()=>onLoad(deck,item)}><span>{item.title||item.identifier}</span><small>{[item.year,Array.isArray(item.creator)?item.creator[0]:item.creator].filter(Boolean).join(' · ')||item.identifier}</small></button>)}</div>
  </section>
}

function App(){
 const a=useRef<HTMLVideoElement>(null), b=useRef<HTMLVideoElement>(null); const [fade,setFade]=useState(0.5); const [status,setStatus]=useState<Record<DeckId,string>>({A:'No clip loaded',B:'No clip loaded'}); const [rate,setRate]=useState<Record<DeckId,number>>({A:1,B:1});
 async function load(deck:DeckId,item:ArchiveItem){setStatus(s=>({...s,[deck]:'Loading…'}));try{const url=await resolveArchiveVideo(item.identifier);const el=deck==='A'?a.current:b.current;if(!el)return;el.src=url;el.load();await el.play();setStatus(s=>({...s,[deck]:item.title||item.identifier}));}catch(err){setStatus(s=>({...s,[deck]:err instanceof Error?err.message:'Load failed'}));}}
 function toggle(deck:DeckId){const el=deck==='A'?a.current:b.current;if(!el)return;el.paused?el.play():el.pause();}
 function speed(deck:DeckId,value:number){setRate(s=>({...s,[deck]:value}));const el=deck==='A'?a.current:b.current;if(el)el.playbackRate=value;}
 async function fullscreen(){const el=document.getElementById('output');if(el?.requestFullscreen)await el.requestFullscreen();}
 return <main className="app"><header className="topbar"><div><h1>ArchiveVJ</h1><p>Internet Archive dual-deck mixer</p></div><button onClick={fullscreen}>Fullscreen Output</button></header>
  <section id="output" className="output"><video ref={a} className="video a" style={{opacity:1-fade}} muted loop playsInline/><video ref={b} className="video b" style={{opacity:fade}} muted loop playsInline/><div className="deck-badge left">A · {status.A}</div><div className="deck-badge right">B · {status.B}</div></section>
  <section className="mixer"><div className="deck-controls"><strong>DECK A</strong><button onClick={()=>toggle('A')}>Play / Pause</button><label>Speed <select value={rate.A} onChange={e=>speed('A',Number(e.target.value))}>{[.5,.75,1,1.25,1.5,2].map(v=><option key={v}>{v}</option>)}</select></label></div><div className="cross"><span>A</span><input aria-label="Crossfader" type="range" min="0" max="1" step="0.001" value={fade} onChange={e=>setFade(Number(e.target.value))}/><span>B</span><small>{Math.round((1-fade)*100)} / {Math.round(fade*100)}</small></div><div className="deck-controls"><strong>DECK B</strong><button onClick={()=>toggle('B')}>Play / Pause</button><label>Speed <select value={rate.B} onChange={e=>speed('B',Number(e.target.value))}>{[.5,.75,1,1.25,1.5,2].map(v=><option key={v}>{v}</option>)}</select></label></div></section>
  <section className="browsers"><BrowserPanel deck="A" onLoad={load}/><BrowserPanel deck="B" onLoad={load}/></section><footer>ArchiveVJ v0.1 alpha · Videos remain hosted by the Internet Archive.</footer></main>
}
export default App;
