/* =====================================================================
   Yuet Wan London — shared helpers (used by all pages + the editor)
   ===================================================================== */
window.YW = (function(){
  const API = "https://script.google.com/macros/s/AKfycbyUoOwvu32QbKPaLIueyJFFSqft0b7qoASYEImHE3Mj-kRBxphaLbm1yyuXigFfiDKDrw/exec";
  const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const CAT_ZH = {Performance:"演出",Workshop:"工作坊",Talk:"講座",Music:"音樂"};
  const TINT = {Performance:"#C8402E",Workshop:"#2E7E72",Talk:"#B8893C",Music:"#3E6E84"};
  const ICON = {
    Performance:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v7a8 8 0 0 1-16 0z"/><path d="M8.5 10c.7-.6 1.8-.6 2.5 0"/><path d="M13 10c.7-.6 1.8-.6 2.5 0"/><path d="M9 14c1.2 1.1 4.8 1.1 6 0"/></svg>',
    Workshop:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 12V6.6a1.5 1.5 0 0 1 3 0V11M10 11V5.6a1.5 1.5 0 0 1 3 0V11M13 11.5V7a1.5 1.5 0 0 1 3 0v6a6 6 0 0 1-6 6 6 6 0 0 1-4.5-2L4 14.6a1.6 1.6 0 0 1 2.3-2.1L8 14"/></svg>',
    Talk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 3v-3H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    Music:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V6l11-2v11"/><circle cx="6" cy="18" r="2.6"/><circle cx="17" cy="15" r="2.6"/></svg>'
  };
  const USER_ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>';

  function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
  function isTrue(v){return v===true||String(v).toUpperCase()==="TRUE";}
  function lines(s){return String(s||"").split(/\n+/).map(x=>x.trim()).filter(Boolean);}
  function lat(){const id="l"+Math.random().toString(36).slice(2,7);return '<svg class="lat" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><defs><pattern id="'+id+'" width="40" height="70" patternUnits="userSpaceOnUse"><path d="M20 0 L40 11 L40 35 L20 46 L0 35 L0 11Z M20 46 L40 57 L40 81 M20 46 L0 57 L0 81" fill="none" stroke="#F4ECDD" stroke-width="1.3"/></pattern></defs><rect width="200" height="200" fill="url(#'+id+')"/></svg>';}
  function fmtDate(ev,lang){
    if(ev.date_label) return ev.date_label;
    const s=ev.date_start; if(!s) return "";
    const d=new Date(s); if(isNaN(d)) return s;
    return lang==="zh" ? `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日` : `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  }
  function isPast(ev){
    const s=String(ev.status||"").toLowerCase();
    if(s==="past") return true; if(s==="upcoming") return false;
    const e=ev.date_end||ev.date_start;
    return e ? new Date(e) < new Date(new Date().toDateString()) : false;
  }
  async function fetchData(){
    const r=await fetch(API,{cache:"no-store"}); return r.json();
  }
  async function post(payload){
    const r=await fetch(API,{method:"POST",body:JSON.stringify(payload)}); return r.json();
  }
  function settingsMap(arr){ const m={}; (arr||[]).forEach(s=>{ if(s.key) m[s.key]=s.value; }); return m; }

  /* language: swaps every [data-en]/[data-zh] node, sets <html lang>, toggles button label */
  function applyStaticLang(lang){
    document.documentElement.lang = lang==="zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-en]").forEach(el=>{const v=el.getAttribute("data-"+lang); if(v!=null) el.textContent=v;});
    document.querySelectorAll("[data-en-ph]").forEach(el=>{const v=el.getAttribute("data-"+lang+"-ph"); if(v!=null) el.placeholder=v;});
    const t=document.getElementById("langtog"); if(t) t.textContent = lang==="en" ? "中文" : "EN";
  }
  /* wire the mobile burger menu */
  function setupNav(){
    const b=document.getElementById("burger"), n=document.getElementById("navlinks");
    if(b&&n){ b.onclick=()=>n.classList.toggle("open"); n.querySelectorAll("a").forEach(a=>a.onclick=()=>n.classList.remove("open")); }
  }

  /* language persistence: survives across pages via localStorage, shareable via ?lang=zh-hant */
  function loadLang(){
    var u=new URLSearchParams(location.search).get("lang");
    if(u) return u.toLowerCase().indexOf("zh")===0 ? "zh" : "en";
    try{ return localStorage.getItem("yw_lang")==="zh" ? "zh" : "en"; }catch(e){ return "en"; }
  }
  function saveLang(l){
    try{ localStorage.setItem("yw_lang", l); }catch(e){}
    try{ var url=new URL(location.href); url.searchParams.set("lang", l==="zh"?"zh-hant":"en"); history.replaceState(null,"",url); }catch(e){}
  }

  return {API,MON,CAT_ZH,TINT,ICON,USER_ICON,esc,isTrue,lines,lat,fmtDate,isPast,fetchData,post,settingsMap,applyStaticLang,setupNav,loadLang,saveLang};
})();
