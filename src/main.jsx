import React,{useEffect,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './style.css';
const API='https://script.google.com/macros/s/AKfycbwzp5snajx04rcSom7kBt8eiCs_vAy159rClRkpdchS0ZbVb6_F_p1v8NNQmgHhyLuw/exec';
const GEO='https://script.google.com/macros/s/AKfycbwQ86rcpL10HNz1Z3QhI2emWulCx-ECiJmO9zut3rvQXY8Kh_FkvskG_j0SsRD0UAEArw/exec';
const META='https://server.streamcasthd.com/cp/get_info.php?p=8682';
const BOT=/Applebot|hisbot|ClaudeBot|meta-externalagent|shoutcast|relay|curl|wget|TuneIn-DirMon|Scanning|ffmpeg/i;
// Cache en memoria compartida entre ciclos de actualización.
const cache=new Map();
const pendingGeo=new Map();
const GEO_TTL_MS=24*60*60*1000;
const GEO_FAILURE_TTL_MS=60*1000;
const GEO_TIMEOUT_MS=8000;
const GEO_CACHE_LIMIT=500;
function storeGeo(ip,value,ttl){
  cache.delete(ip);
  cache.set(ip,{expires:Date.now()+ttl,value});
  while(cache.size>GEO_CACHE_LIMIT)cache.delete(cache.keys().next().value);
}
const ipOf=o=>String(o.ip||o.hostname||o.HOSTNAME||'0.0.0.0').trim();
const botOf=o=>BOT.test(String(o.useragent||''))||Number(o.time||0)<=5;
// Humanos primero, por ciudad y luego por IP; bots en su orden original.
const cityCollator=new Intl.Collator('es',{sensitivity:'base'});
const ipCollator=new Intl.Collator('en',{numeric:true});
function compareListeners(a,b){
  if(a.bot!==b.bot)return Number(a.bot)-Number(b.bot);
  if(a.bot)return 0;
  const city=x=>{const c=String(x.geo?.city||'').trim();return c==='-'?'':c};
  const ac=city(a),bc=city(b);
  if(Boolean(ac)!==Boolean(bc))return ac?-1:1;
  return cityCollator.compare(ac,bc)||ipCollator.compare(a.ip,b.ip);
}
const duration=s=>{const m=Math.floor(Math.max(0,Number(s)||0)/60);return m<60?`${m} min`:m<1440?`${Math.floor(m/60)} h ${m%60} min`:`${Math.floor(m/1440)} d ${Math.floor(m%1440/60)} h`};
function normalizeHistory(raw){return Array.isArray(raw)?raw.flatMap(v=>typeof v==='string'?v.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<\/p\s*>/gi,'\n').replace(/<[^>]*>/g,'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean):[]).slice(0,10):[]}
async function geo(ip){
  if(!ip||ip==='0.0.0.0'||ip==='127.0.0.1')return null;
  const cached=cache.get(ip);
  if(cached&&cached.expires>Date.now())return cached.value;
  if(cached)cache.delete(ip);
  // Una misma IP nunca dispara dos consultas simultáneas.
  if(pendingGeo.has(ip))return pendingGeo.get(ip);
  const request=(async()=>{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),GEO_TIMEOUT_MS);
    try{
      const response=await fetch(`${GEO}?ip=${encodeURIComponent(ip)}`,{signal:controller.signal});
      if(!response.ok)throw new Error(`Geolocalización HTTP ${response.status}`);
      const data=await response.json();
      const value=data.success?{
        lat:Number(data.latitude),lon:Number(data.longitude),
        city:data.city||'-',country:data.country||'Desconocido',code:data.country_code||''
      }:null;
      // Los errores se reintentan después de un minuto, no en cada actualización.
      storeGeo(ip,value,value?GEO_TTL_MS:GEO_FAILURE_TTL_MS);
      return value;
    }catch{
      storeGeo(ip,null,GEO_FAILURE_TTL_MS);
      return null;
    }finally{
      clearTimeout(timeout);
      pendingGeo.delete(ip);
    }
  })();
  pendingGeo.set(ip,request);
  return request;
}
function usePolling(url,period,transform=x=>x){const [state,setState]=useState({data:null,error:false});useEffect(()=>{let active=true,busy=false;const ctrl=new AbortController();async function load(){if(busy)return;busy=true;try{const r=await fetch(url,{cache:'no-store',signal:ctrl.signal});if(!r.ok)throw Error(`HTTP ${r.status}`);const d=transform(await r.json());if(active)setState({data:d,error:false})}catch(e){if(active&&e.name!=='AbortError')setState(s=>({...s,error:true}))}finally{busy=false}}load();const id=setInterval(load,period);return()=>{active=false;clearInterval(id);ctrl.abort()}},[url,period]);return state}
function MapPanel({listeners}){const node=useRef(null),map=useRef(null),layer=useRef(null),lastLocations=useRef('');useEffect(()=>{const m=L.map(node.current).setView([0,10],2);map.current=m;L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors',className:'dark-map-tiles'}).addTo(m);layer.current=L.layerGroup().addTo(m);const observer=new ResizeObserver(()=>m.invalidateSize());observer.observe(node.current);return()=>{observer.disconnect();m.remove()}},[]);useEffect(()=>{if(!layer.current)return;layer.current.clearLayers();const pts=[];listeners.filter(x=>!x.bot&&x.geo&&Number.isFinite(x.geo.lat)&&Number.isFinite(x.geo.lon)).forEach(x=>{const ll=[x.geo.lat,x.geo.lon];L.circleMarker(ll,{radius:7,color:'#12d5e6',fillOpacity:.8}).bindPopup(document.createTextNode(`${x.ip} — ${x.geo.city}, ${x.geo.country}`)).addTo(layer.current);pts.push(ll)});const locationKey=[...new Set(pts.map(p=>p.join(',')))].sort().join('|');if(locationKey!==lastLocations.current){lastLocations.current=locationKey;if(pts.length){map.current.invalidateSize();if(pts.length===1){map.current.setView(pts[0],5)}else{map.current.fitBounds(L.latLngBounds(pts).pad(.25),{maxZoom:7,animate:false})}}else{map.current.setView([0,10],2)}}},[listeners]);return <div className="map" ref={node}/>}
function App(){const {data:raw,error:err}=usePolling(API,20000,x=>{if(!Array.isArray(x))throw Error('Respuesta inválida');return x});const {data:tracks,error:tracksError}=usePolling(META,15000,x=>{if(!Array.isArray(x.history))throw Error('Historial inválido');return normalizeHistory(x.history)});const [items,setItems]=useState([]),[filter,setFilter]=useState('todos');useEffect(()=>{if(!raw)return;let active=true;(async()=>{const unique=[...new Set(raw.map(ipOf))];const results=new Map();for(let i=0;i<unique.length;i+=5){const chunk=unique.slice(i,i+5);await Promise.all(chunk.map(async ip=>results.set(ip,await geo(ip))))}if(active)setItems(raw.map((o,i)=>({...o,id:i,ip:ipOf(o),bot:botOf(o),geo:results.get(ipOf(o))})).sort(compareListeners) )})();return()=>{active=false}},[raw]);const humans=items.filter(x=>!x.bot),bots=items.length-humans.length,unique=new Set(humans.map(x=>x.ip)).size;const ipCounts=new Map();humans.forEach(x=>ipCounts.set(x.ip,(ipCounts.get(x.ip)||0)+1));const visible=items.filter(x=>filter==='todos'||(filter==='humanos'?!x.bot:x.bot));return <main><header><div><h1>Monitor</h1></div></header><section className="stats"><article><small>Conexiones totales</small><strong>{items.length}</strong></article><article><small>Humanos</small><strong>{humans.length}</strong></article><article className="unique-stat"><small>IP únicas humanas</small><strong>{unique}</strong></article><article><small>Bots</small><strong>{bots}</strong></article></section>{err&&<p className="warning">No se pudo actualizar el listado de oyentes. Se muestran los últimos datos disponibles.</p>}<section className="dashboard"><article className="panel listeners"><div className="heading"><h2>Oyentes activos</h2><select aria-label="Filtrar conexiones" value={filter} onChange={e=>setFilter(e.target.value)}><option value="todos">Todos</option><option value="humanos">Humanos</option><option value="bots">Bots</option></select></div><div className="scroll">{!raw?<p>Cargando oyentes…</p>:!visible.length?<p>No hay conexiones en esta categoría.</p>:visible.map(x=><div className={'listener '+(x.bot?'bot':'human')} key={x.id}><div className="line"><b className={x.bot?'red':'green'}>{x.bot?'Bot':'Humano'}</b><strong className="ip">{x.ip}</strong><span className="location">— {x.geo?<><span className={x.bot?undefined:"city"}>{x.geo.city}</span>, {x.geo.country}</>:'Ubicación no disponible'}</span>{!x.bot&&ipCounts.get(x.ip)>1&&<span className="duplicate-count">({ipCounts.get(x.ip)} conexiones)</span>}</div><div className="muted detail"><span title="Reproductor" aria-label="Reproductor" className="detail-icon">🎧</span> {x.useragent||'-'}</div><div className="muted detail"><span title="Duración" aria-label="Duración" className="detail-icon">◷</span> {duration(x.time)} <span className="ref-label">· {x.referer||'-'}</span></div></div>)}</div></article><article className="panel map-panel"><h2>Mapa de oyentes humanos</h2><MapPanel listeners={humans}/></article><section className="panel history"><h2>Últimas canciones</h2>{tracksError&&<p className="warning">No se pudo actualizar el historial; se conservan los últimos datos.</p>}{!tracks?<p>Cargando historial…</p>:tracks.length===0?<p>Sin canciones disponibles.</p>:<ol>{tracks.map((t,i)=><li className={/De las Sierras\s*-\s*Sweeper/i.test(t)?'sweeper':i===0?'latest':''} key={i}>{/^\d{1,2}\.?\)/.test(t)?t.replace(/^(\d{1,2})\.\)/,'$1)'):`${i+1}) ${t}`}</li>)}</ol>}</section></section><footer>De las Sierras - Playing Good Music · Monitor de radio</footer></main>}
createRoot(document.getElementById('root')).render(<App/>);
