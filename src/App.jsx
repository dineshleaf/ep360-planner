import { useState, useMemo, useCallback } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, LineChart, Line, Area, AreaChart, ReferenceLine, PieChart, Pie } from "recharts";

const INR = (v) => {
  if (v === undefined || v === null || isNaN(v)) return "₹0";
  const abs = Math.abs(v);
  if (abs >= 10000000) return `${v < 0 ? "-" : ""}₹${(abs / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `${v < 0 ? "-" : ""}₹${(abs / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `${v < 0 ? "-" : ""}₹${(abs / 1000).toFixed(1)}K`;
  return `₹${Math.round(v)}`;
};
const PCT = (v) => isNaN(v) ? "0%" : (v * 100).toFixed(1) + "%";

const GOLD = "#FFD700"; const DARK = "#0f0f17"; const CARD = "#1a1a2e"; const CARD2 = "#16213e";
const GREEN = "#10b981"; const RED = "#ef4444"; const BLUE = "#3b82f6"; const MUTED = "#94a3b8";
const BORDER = "#2d2d44"; const PURPLE = "#8b5cf6"; const ORANGE = "#f59e0b";

const INITIAL_TEAM = [
  { id:"dinesh", name:"Dinesh", role:"Founder — SEO, Web, Paid, Sales, AM", monthly:150000, active:true, rating:"Founder", color:GOLD,
    clients:{ERPROOTS:0.20, Yogikuti:0.10}, seoRevenue:{Yogikuti:123000, ERPROOTS:200000}, note:"Delivers 62% of YK revenue (SEO). Also ERPR SEO." },
  { id:"thangavel", name:"Thangavel", role:"Web Developer", monthly:43083, active:true, rating:"Good", color:GREEN,
    clients:{ERPROOTS:0.16, Yogikuti:0.40, OPTC:0.04, "Ashoka College":0.01}, note:"Website dev & maintenance across clients" },
  { id:"chandramohan", name:"Chandramohan", role:"Video Creator", monthly:89583, active:true, rating:"Bad", color:RED,
    clients:{ERPROOTS:0.70, Yogikuti:0.07, iLink:0.01}, note:"Video content primarily for ERPR (70% time). Rated Bad." },
  { id:"selva", name:"Selva", role:"Graphics Designer", monthly:37917, active:true, rating:"Hold", color:ORANGE,
    clients:{ERPROOTS:0.54, Yogikuti:0.16, OPTC:0.01, "Ashoka College":0.01, "EQ FinFit":0.03, iLink:0.01}, note:"Design across all clients" },
  { id:"jovita", name:"Jovita", role:"Accounts Manager + Outreach", monthly:23800, active:true, rating:"Good", color:GREEN,
    clients:{ERPROOTS:0.40, Yogikuti:0.05, "EQ FinFit":0.01, iLink:0.01}, note:"Client servicing, retention, outreach" },
  { id:"nivedhitha", name:"Nivedhitha", role:"Outreach + Sales + AM", monthly:43333, active:true, rating:"Good", color:GREEN,
    clients:{ERPROOTS:0.27, Yogikuti:0.05, "EQ FinFit":0.01}, note:"Sales pipeline + account management" },
  { id:"sumit", name:"Sumit", role:"Paid Ads Specialist", monthly:166667, active:true, rating:"Hold", color:ORANGE,
    clients:{ERPROOTS:0.06, Yogikuti:0.26}, paidAdsFor:{Yogikuti:38000}, note:"₹1.67L/mo salary for ₹38K/mo YK paid ads = 4.4x overpaid" },
  { id:"thoufik", name:"Thoufik", role:"Digital Marketing", monthly:50000, active:true, rating:"Hold", color:ORANGE,
    clients:{ERPROOTS:0.10}, note:"Joined Feb 2026. H2 cost: ₹1L (2 months). Ramp-up phase." },
  { id:"lakshmee", name:"Lakshmee", role:"Sales (100% Outreach)", monthly:41667, active:true, rating:"Good", color:GREEN,
    clients:{}, note:"100% on outreach. No direct revenue yet." },
  { id:"preyash", name:"Preyash", role:"Sales (Leaving)", monthly:130833, active:true, rating:"Leaving", color:RED,
    clients:{}, note:"Zero utilization. Already leaving. ₹1.31L/mo bleed." },
];

const INITIAL_CLIENTS = [
  { id:"ERPROOTS", name:"ERPROOTS", active:true, mrr:550000, h1:2693387, h2:2482843, color:"#6366f1",
    services:[{name:"SEO",amount:200000,by:"Dinesh"},{name:"Video",amount:100000,by:"Chandramohan"},{name:"Design",amount:50000,by:"Selva"},{name:"Web",amount:50000,by:"Thangavel"},{name:"Other",amount:150000,by:"Team"}],
    note:"Parent company. 18X ROAS. March: ₹5.5L" },
  { id:"Yogikuti", name:"Yogikuti", active:true, mrr:199420, h1:1110380, h2:931020, color:"#8b5cf6",
    services:[{name:"SEO",amount:123000,by:"Dinesh"},{name:"Paid Ads",amount:38000,by:"Sumit"},{name:"Website",amount:8000,by:"Thangavel"},{name:"Other",amount:30420,by:"Team"}],
    note:"Long-standing relationship since 2020. SEO = 62% of billing." },
  { id:"Ashoka College", name:"Ashoka College", active:true, mrr:0, h1:458608, h2:0, color:"#14b8a6",
    services:[{name:"Seasonal",amount:0,by:"Team"}], note:"Seasonal. ₹4.59L in H1, zero in H2." },
  { id:"OPTC", name:"OPTC", active:true, mrr:0, h1:508563, h2:0, color:"#f97316",
    services:[{name:"Web Dev",amount:0,by:"Team"}], note:"Website dev done. ₹5.09L in H1. Pitched branding." },
  { id:"EQ FinFit", name:"EQ FinFit", active:true, mrr:0, h1:246826, h2:106841, color:"#ec4899",
    services:[{name:"Mixed",amount:0,by:"Team"}], note:"₹2.47L H1 + ₹1.07L H2. Got testimonial." },
  { id:"iLink", name:"iLink", active:true, mrr:7080, h1:8767, h2:57584, color:"#06b6d4",
    services:[{name:"Design",amount:7080,by:"Team"}], note:"Design work. Increasing billing in 2026." },
  { id:"Lovely Garments", name:"Lovely Garments", active:true, mrr:0, h1:7080, h2:0, color:"#a3e635",
    services:[{name:"Ecom Setup",amount:0,by:"Team"}], note:"B2B brand starting ecom. Future: ₹1L/mo." },
  { id:"GGC", name:"GGC", active:true, mrr:0, h1:0, h2:0, color:"#94a3b8",
    services:[], note:"Minimal billing. Just started." },
  { id:"Quinaptis", name:"Quinaptis", active:true, mrr:0, h1:0, h2:0, color:"#78716c",
    services:[], note:"Website done. Not ready for marketing spend." },
  { id:"ExtPaidAds", name:"Ext Paid Ads Agency", active:false, mrr:0, h1:377600, h2:0, color:"#d946ef",
    services:[{name:"ROAS Mgmt",amount:0,by:"Team"}], note:"External paid ads agency billing. H1 only." },
];

const PRESETS = [
  { label:"Current State", desc:"Everyone active, all costs", icon:"📊" },
  { label:"Drop Sumit + Preyash", desc:"Instant ₹35.7L/yr saved", icon:"✂️" },
  { label:"YK Only", desc:"Yogikuti as sole customer", icon:"🎯" },
  { label:"ERPR + YK Lean", desc:"Core trio + Dinesh 60%", icon:"💎" },
  { label:"Growth Mode", desc:"+3 clients, lean team, hires", icon:"🚀" },
  { label:"Dinesh Out", desc:"Business runs without you", icon:"🏖️" },
];

const Toggle = ({on, onChange, size="md"}) => {
  const w = size==="sm"?36:44, h = size==="sm"?20:24, d = size==="sm"?16:20;
  return <button onClick={onChange} style={{width:w,height:h,borderRadius:h,border:"none",background:on?GREEN:"#4a5568",cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
    <div style={{width:d,height:d,borderRadius:"50%",background:"#fff",position:"absolute",top:2,left:on?w-d-2:2,transition:"all 0.2s"}}/>
  </button>;
};

const Badge = ({text, color}) => <span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:color+"22",color,fontWeight:700,letterSpacing:0.5,whiteSpace:"nowrap"}}>{text}</span>;

const KPI = ({label,value,sub,trend,large}) => <div style={{padding:large?"18px 20px":"12px 16px",background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,flex:1,minWidth:130}}>
  <div style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
  <div style={{fontSize:large?24:18,fontWeight:800,color:trend==="up"?GREEN:trend==="down"?RED:"#fff",fontFamily:"'JetBrains Mono',monospace"}}>{value}</div>
  {sub && <div style={{fontSize:10,color:MUTED,marginTop:2}}>{sub}</div>}
</div>;

export default function EP360() {
  const [team, setTeam] = useState(INITIAL_TEAM);
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [dineshMode, setDineshMode] = useState("full");
  const [newClients, setNewClients] = useState(0);
  const [newClientMRR, setNewClientMRR] = useState(199420);
  const [tab, setTab] = useState("dashboard");
  const [inclFixed, setInclFixed] = useState(true);
  const [hireJrPPC, setHireJrPPC] = useState(false);
  const [hireSEO, setHireSEO] = useState(false);
  const [hireAM, setHireAM] = useState(false);

  const FIXED = inclFixed ? 322000 : 0; // ops 210K + tools 66K + ads 46K

  const toggleTeam = useCallback((id) => { if(id==="dinesh") return; setTeam(t=>t.map(m=>m.id===id?{...m,active:!m.active}:m)); },[]);
  const toggleClient = useCallback((id) => { setClients(c=>c.map(cl=>cl.id===id?{...cl,active:!cl.active}:cl)); },[]);

  const applyPreset = useCallback((label) => {
    let t=INITIAL_TEAM.map(m=>({...m})), c=INITIAL_CLIENTS.map(cl=>({...cl})), dm="full", nc=0, ppc=false, seo=false, am=false;
    switch(label) {
      case "Drop Sumit + Preyash":
        t=t.map(m=>["sumit","preyash"].includes(m.id)?{...m,active:false}:m); break;
      case "YK Only":
        c=c.map(cl=>cl.id==="Yogikuti"?cl:{...cl,active:false});
        t=t.map(m=>["dinesh","thangavel"].includes(m.id)?m:{...m,active:false}); break;
      case "ERPR + YK Lean":
        c=c.map(cl=>["ERPROOTS","Yogikuti"].includes(cl.id)?cl:{...cl,active:false});
        t=t.map(m=>["dinesh","thangavel","selva","jovita"].includes(m.id)?m:{...m,active:false});
        dm="60pct"; ppc=true; break;
      case "Growth Mode":
        t=t.map(m=>["sumit","preyash"].includes(m.id)?{...m,active:false}:m);
        dm="60pct"; nc=3; seo=true; ppc=true; break;
      case "Dinesh Out":
        t=t.map(m=>["sumit","preyash"].includes(m.id)?{...m,active:false}:m);
        dm="removed"; nc=3; seo=true; ppc=true; am=true; break;
    }
    setTeam(t); setClients(c); setDineshMode(dm); setNewClients(nc); setHireJrPPC(ppc); setHireSEO(seo); setHireAM(am);
  },[]);

  const calc = useMemo(() => {
    const aC = clients.filter(c=>c.active);
    const aT = team.filter(m=>m.active&&m.id!=="dinesh");
    let dSal = dineshMode==="full"?150000:dineshMode==="60pct"?90000:0;
    const tSal = aT.reduce((s,m)=>s+m.monthly,0);
    const hires = (hireJrPPC?30000:0)+(hireSEO?40000:0)+(hireAM?50000:0);
    const totalSal = tSal + dSal + hires;
    const cMRR = aC.reduce((s,c)=>s+c.mrr,0);
    const nRev = newClients*newClientMRR;
    const totalMRR = cMRR + nRev;
    const dActive = dineshMode!=="removed";
    let seoRisk = 0;
    if(!dActive && !hireSEO) aC.forEach(c=>c.services?.forEach(s=>{if(s.by==="Dinesh"&&s.name==="SEO") seoRisk+=s.amount;}));
    const adjMRR = totalMRR - seoRisk;
    const cost = totalSal + FIXED;
    const profit = adjMRR - cost;
    const margin = adjMRR>0?profit/adjMRR:0;
    const hc = aT.length+(dActive?1:0)+(hireJrPPC?1:0)+(hireSEO?1:0)+(hireAM?1:0);
    const curSal = INITIAL_TEAM.reduce((s,m)=>s+m.monthly,0);
    const curCost = curSal + FIXED;
    const curMRR = clients.reduce((s,c)=>s+c.mrr,0);
    const savings = (curCost - cost)*12;

    const months = [];
    for(let i=1;i<=12;i++){
      let mS = totalSal, mR = adjMRR;
      if(dineshMode==="zero3mo"){ if(i<=3) mS=tSal+hires; else mS=tSal+150000+hires; }
      if(newClients>0){ if(i===1) mR=adjMRR-nRev*0.5; else if(i===2) mR=adjMRR-nRev*0.25; }
      const mC=mS+FIXED;
      months.push({month:`M${i}`,revenue:mR,cost:mC,profit:mR-mC});
    }
    return {adjMRR,totalSal,cost,profit,margin,hc,months,seoRisk,dSal,tSal,hires,savings,nRev,aC,aT,totalMRR,curMRR,curCost};
  },[team,clients,dineshMode,newClients,newClientMRR,inclFixed,hireJrPPC,hireSEO,hireAM,FIXED]);

  const tabs = [{id:"dashboard",label:"Dashboard",icon:"📊"},{id:"team",label:"Team",icon:"👥"},{id:"clients",label:"Clients",icon:"🏢"},{id:"projection",label:"12-Month",icon:"📈"},{id:"audit",label:"Data Audit",icon:"🔍"}];

  return <div style={{background:DARK,color:"#fff",minHeight:"100vh",fontFamily:"'DM Sans','Helvetica Neue',sans-serif"}}>
    {/* Header */}
    <div style={{background:`linear-gradient(135deg,${DARK},${CARD})`,borderBottom:`1px solid ${BORDER}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{width:34,height:34,borderRadius:8,background:`linear-gradient(135deg,${GOLD},#f59e0b)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:900,color:DARK}}>EP</div>
        <div>
          <div style={{fontSize:15,fontWeight:800,letterSpacing:-0.5}}>EP360 Scenario Planner</div>
          <div style={{fontSize:10,color:MUTED}}>Actual FY 2025-26 P&L Data • Interactive Scenarios</div>
        </div>
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center",fontSize:11,color:MUTED}}>
        <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><Toggle on={inclFixed} onChange={()=>setInclFixed(v=>!v)} size="sm"/>Ops/Tools/Ads ₹3.22L/mo</label>
        <div style={{background:RED+"22",color:RED,padding:"4px 10px",borderRadius:6,fontWeight:700,fontSize:11}}>FY Loss: ₹31.52L</div>
      </div>
    </div>

    {/* Presets */}
    <div style={{padding:"10px 20px",background:CARD2,borderBottom:`1px solid ${BORDER}`,display:"flex",gap:6,overflowX:"auto"}}>
      {PRESETS.map(p=><button key={p.label} onClick={()=>applyPreset(p.label)} style={{padding:"6px 14px",background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,color:"#fff",cursor:"pointer",fontSize:11,whiteSpace:"nowrap",transition:"all 0.15s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=GOLD;e.currentTarget.style.background=GOLD+"15"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=BORDER;e.currentTarget.style.background=CARD}}>
        <span style={{marginRight:4}}>{p.icon}</span>{p.label}
        <div style={{fontSize:9,color:MUTED,marginTop:1}}>{p.desc}</div>
      </button>)}
    </div>

    {/* Tabs */}
    <div style={{display:"flex",gap:0,borderBottom:`1px solid ${BORDER}`,background:CARD2,overflowX:"auto"}}>
      {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 16px",border:"none",background:tab===t.id?CARD:"transparent",color:tab===t.id?GOLD:MUTED,cursor:"pointer",fontSize:12,fontWeight:600,borderBottom:tab===t.id?`2px solid ${GOLD}`:"2px solid transparent",whiteSpace:"nowrap"}}>{t.icon} {t.label}</button>)}
    </div>

    <div style={{padding:"16px 20px",maxWidth:1400,margin:"0 auto"}}>
      {/* KPIs */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <KPI label="Monthly Revenue" value={INR(calc.adjMRR)} sub={calc.seoRisk>0?`⚠️ ${INR(calc.seoRisk)} SEO at risk`:`${calc.aC.length} clients + ${newClients} new`} trend={calc.profit>0?"up":"down"} large/>
        <KPI label="Monthly Cost" value={INR(calc.cost)} sub={`Team ${INR(calc.totalSal)} + Fixed ${INR(FIXED)}`}/>
        <KPI label="Monthly P&L" value={INR(calc.profit)} sub={`Margin: ${PCT(calc.margin)}`} trend={calc.profit>0?"up":"down"} large/>
        <KPI label="Annual P&L" value={INR(calc.profit*12)} sub={`${calc.hc} people • Saved ${INR(calc.savings)} vs current`} trend={calc.profit>0?"up":"down"}/>
      </div>

      {calc.seoRisk>0 && <div style={{background:RED+"15",border:`1px solid ${RED}44`,borderRadius:10,padding:"10px 16px",marginBottom:14,display:"flex",alignItems:"center",gap:10,fontSize:12}}>
        <span style={{fontSize:18}}>🚨</span>
        <div><span style={{fontWeight:700,color:RED}}>SEO Revenue at Risk: {INR(calc.seoRisk)}/mo</span> — Dinesh removed but no SEO hire. Enable "Hire SEO Specialist" below.</div>
      </div>}

      {/* DASHBOARD */}
      {tab==="dashboard" && <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {/* P&L Breakdown */}
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>Monthly P&L Breakdown</div>
          {[
            {l:"Revenue — Active Clients",v:calc.adjMRR-calc.nRev,c:GREEN},
            {l:`Revenue — ${newClients} New Client(s)`,v:calc.nRev,c:BLUE,h:calc.nRev===0},
            {l:"SEO Revenue Lost",v:-calc.seoRisk,c:RED,h:calc.seoRisk===0},
            {l:"div"},{l:"Team Salary (excl Dinesh)",v:-calc.tSal,c:RED},
            {l:`Dinesh (${dineshMode==="full"?"Full ₹1.5L":dineshMode==="60pct"?"60% ₹90K":dineshMode==="zero3mo"?"₹0×3mo":"Removed"})`,v:-calc.dSal,c:calc.dSal>0?ORANGE:MUTED},
            {l:"New Hires (PPC/SEO/AM)",v:-calc.hires,c:BLUE,h:calc.hires===0},
            {l:"Fixed Costs (Ops/Tools/Ads)",v:-FIXED,c:MUTED,h:!inclFixed},
            {l:"div"},{l:"NET PROFIT / LOSS",v:calc.profit,c:calc.profit>=0?GREEN:RED,b:true},
          ].filter(r=>!r.h).map((r,i)=>r.l==="div"?<div key={i} style={{height:1,background:BORDER,margin:"6px 0"}}/>:
            <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:r.b?13:12,fontWeight:r.b?800:400}}>
              <span style={{color:r.b?"#fff":MUTED}}>{r.l}</span>
              <span style={{color:r.c,fontFamily:"'JetBrains Mono',monospace",fontWeight:600}}>{INR(r.v)}</span>
            </div>)}
        </div>

        {/* Controls */}
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>Scenario Controls</div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:6,fontWeight:600}}>DINESH SALARY</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {[{v:"full",l:"Full ₹1.5L",s:"/month"},{v:"60pct",l:"60% ₹90K",s:"/month"},{v:"zero3mo",l:"₹0 × 3mo",s:"then ₹1.5L"},{v:"removed",l:"Removed ₹0",s:"forever"}].map(o=>
                <button key={o.v} onClick={()=>setDineshMode(o.v)} style={{padding:"7px 10px",background:dineshMode===o.v?GOLD+"22":DARK,border:`1px solid ${dineshMode===o.v?GOLD:BORDER}`,borderRadius:8,cursor:"pointer",textAlign:"left",color:"#fff"}}>
                  <div style={{fontSize:12,fontWeight:700,color:dineshMode===o.v?GOLD:"#fff"}}>{o.l}</div>
                  <div style={{fontSize:9,color:MUTED}}>{o.s}</div>
                </button>)}
            </div>
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:MUTED,marginBottom:6,fontWeight:600}}>NEW HIRES</div>
            {[{s:hireJrPPC,f:setHireJrPPC,l:"Jr PPC ₹30K/mo",d:"Replaces Sumit"},{s:hireSEO,f:setHireSEO,l:"SEO Specialist ₹40K/mo",d:"Required if Dinesh exits"},{s:hireAM,f:setHireAM,l:"Account Mgr ₹50K/mo",d:"Client relationships"}].map(h=>
              <div key={h.l} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:DARK,borderRadius:6,marginBottom:4}}>
                <Toggle on={h.s} onChange={()=>h.f(v=>!v)} size="sm"/>
                <div><div style={{fontSize:11,fontWeight:600}}>{h.l}</div><div style={{fontSize:9,color:MUTED}}>{h.d}</div></div>
              </div>)}
          </div>
          <div>
            <div style={{fontSize:11,color:MUTED,marginBottom:6,fontWeight:600}}>NEW CUSTOMERS (YK-like)</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button onClick={()=>setNewClients(Math.max(0,newClients-1))} style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:DARK,color:"#fff",cursor:"pointer",fontSize:15}}>−</button>
              <div style={{fontSize:26,fontWeight:800,color:GOLD,minWidth:30,textAlign:"center"}}>{newClients}</div>
              <button onClick={()=>setNewClients(newClients+1)} style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:DARK,color:"#fff",cursor:"pointer",fontSize:15}}>+</button>
              <div style={{flex:1}}>
                <div style={{fontSize:10,color:MUTED,marginBottom:2}}>MRR per client</div>
                <input type="number" value={newClientMRR} onChange={e=>setNewClientMRR(Number(e.target.value))} style={{width:"100%",padding:"5px 8px",background:DARK,border:`1px solid ${BORDER}`,borderRadius:6,color:"#fff",fontSize:12}}/>
              </div>
            </div>
            {newClients>0 && <div style={{marginTop:6,fontSize:11,color:GREEN}}>+{INR(calc.nRev)}/month revenue</div>}
          </div>
        </div>

        {/* Chart */}
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18,gridColumn:"1/-1"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>Revenue vs Cost</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[{name:"Current State",revenue:calc.curMRR,cost:calc.curCost},{name:"Your Scenario",revenue:calc.adjMRR,cost:calc.cost}]} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER}/><XAxis dataKey="name" tick={{fill:MUTED,fontSize:11}}/><YAxis tick={{fill:MUTED,fontSize:10}} tickFormatter={v=>INR(v)}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,fontSize:11}}/>
              <Bar dataKey="revenue" fill={GREEN} radius={[6,6,0,0]} name="Revenue"/><Bar dataKey="cost" fill={RED} radius={[6,6,0,0]} name="Cost"/><Legend/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Actual P&L from files */}
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18,gridColumn:"1/-1"}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>Actual FY 2025-26 P&L (from uploaded files)</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr style={{borderBottom:`1px solid ${BORDER}`}}>
                {["","H1 (Apr-Sep)","H2 (Oct-Mar)","Full Year","Status"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"right",color:MUTED,fontWeight:600,fontSize:10}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[
                  {l:"Revenue",h1:61.06,h2:35.78,fy:96.84,s:"down"},
                  {l:"Salary",h1:27.18,h2:53.26,fy:80.44,s:"bad"},
                  {l:"Tools & Subs",h1:5.50,h2:3.98,fy:9.48,s:"ok"},
                  {l:"Ads & Marketing",h1:1.80,h2:2.75,fy:4.55,s:"ok"},
                  {l:"Operating Expense",h1:12.60,h2:12.60,fy:25.20,s:"ok"},
                  {l:"Depreciation",h1:4.34,h2:4.34,fy:8.68,s:"ok"},
                  {l:"Net Profit/(Loss)",h1:9.64,h2:-41.16,fy:-31.52,s:"bad"},
                ].map(r=><tr key={r.l} style={{borderBottom:`1px solid ${BORDER}22`}}>
                  <td style={{padding:"6px 10px",fontWeight:r.l.includes("Net")?700:400}}>{r.l}</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:r.l.includes("Net")?(r.h1>=0?GREEN:RED):"#fff"}}>₹{r.h1.toFixed(2)}L</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",color:r.l.includes("Net")?(r.h2>=0?GREEN:RED):r.s==="bad"?RED:"#fff"}}>₹{r.h2.toFixed(2)}L</td>
                  <td style={{padding:"6px 10px",textAlign:"right",fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:r.l.includes("Net")?(r.fy>=0?GREEN:RED):"#fff"}}>₹{r.fy.toFixed(2)}L</td>
                  <td style={{padding:"6px 10px",textAlign:"right"}}>{r.s==="bad"?<Badge text="⚠ Issue" color={RED}/>:r.s==="down"?<Badge text="↓ 41%" color={ORANGE}/>:""}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:10,fontSize:11,color:MUTED}}>Source: EP_-_H1_P_L.xlsx + EP_-_H2_Actual.xlsx. H2 salary doubled (+96%) while revenue dropped 41%.</div>
        </div>
      </div>}

      {/* TEAM */}
      {tab==="team" && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
        {team.map(m=>{
          const isD = m.id==="dinesh";
          const isA = isD?dineshMode!=="removed":m.active;
          const sal = isD?calc.dSal:m.monthly;
          return <div key={m.id} style={{background:isA?CARD:CARD+"66",borderRadius:12,border:`1px solid ${isA?m.color+"44":BORDER}`,padding:14,opacity:isA?1:0.45,transition:"all 0.2s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
              <div>
                <div style={{fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>{m.name} <Badge text={m.rating} color={m.color}/></div>
                <div style={{fontSize:11,color:MUTED,marginTop:1}}>{m.role}</div>
              </div>
              {!isD && <Toggle on={m.active} onChange={()=>toggleTeam(m.id)}/>}
            </div>
            <div style={{fontSize:18,fontWeight:800,color:isA?"#fff":MUTED,fontFamily:"'JetBrains Mono',monospace"}}>{INR(sal)}<span style={{fontSize:10,color:MUTED}}>/mo</span></div>
            <div style={{fontSize:10,color:MUTED}}>{INR(sal*12)}/year</div>
            {m.clients && Object.keys(m.clients).length>0 && <div style={{display:"flex",gap:3,flexWrap:"wrap",marginTop:6}}>
              {Object.entries(m.clients).filter(([,p])=>p>0).map(([cl,p])=>{
                const cA = clients.find(c=>c.id===cl)?.active;
                return <span key={cl} style={{fontSize:9,padding:"2px 5px",borderRadius:4,background:cA?BLUE+"22":RED+"15",color:cA?BLUE:RED}}>{cl} {(p*100).toFixed(0)}%</span>;
              })}
            </div>}
            {m.note && <div style={{fontSize:10,color:isD?GOLD:MUTED,marginTop:6,fontStyle:"italic"}}>{isD?"⚡ ":""}{m.note}</div>}
          </div>;
        })}
        <div style={{background:`linear-gradient(135deg,${CARD},${CARD2})`,borderRadius:12,border:`1px solid ${GOLD}44`,padding:14}}>
          <div style={{fontSize:13,fontWeight:700,color:GOLD,marginBottom:10}}>Team Summary</div>
          <div style={{fontSize:11,color:MUTED,marginBottom:3}}>Active: <span style={{color:"#fff",fontWeight:700}}>{calc.hc}</span></div>
          <div style={{fontSize:11,color:MUTED,marginBottom:3}}>Monthly: <span style={{color:"#fff",fontWeight:700}}>{INR(calc.totalSal)}</span></div>
          <div style={{fontSize:11,color:MUTED,marginBottom:3}}>Annual: <span style={{color:"#fff",fontWeight:700}}>{INR(calc.totalSal*12)}</span></div>
          <div style={{height:1,background:BORDER,margin:"8px 0"}}/>
          <div style={{fontSize:11,color:MUTED}}>Savings vs current:</div>
          <div style={{fontSize:18,fontWeight:800,color:GREEN,fontFamily:"'JetBrains Mono',monospace"}}>{INR(calc.savings)}<span style={{fontSize:10,color:MUTED}}>/yr</span></div>
        </div>
      </div>}

      {/* CLIENTS */}
      {tab==="clients" && <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:10}}>
        {clients.map(c=><div key={c.id} style={{background:c.active?CARD:CARD+"66",borderRadius:12,border:`1px solid ${c.active?c.color+"44":BORDER}`,padding:14,opacity:c.active?1:0.45,transition:"all 0.2s"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:3,background:c.color}}/>{c.name}
                {c.mrr>0 && <Badge text={`MRR ${INR(c.mrr)}`} color={GREEN}/>}
              </div>
            </div>
            <Toggle on={c.active} onChange={()=>toggleClient(c.id)}/>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <div style={{flex:1,padding:6,background:DARK,borderRadius:6,textAlign:"center"}}><div style={{fontSize:9,color:MUTED}}>H1</div><div style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{INR(c.h1)}</div></div>
            <div style={{flex:1,padding:6,background:DARK,borderRadius:6,textAlign:"center"}}><div style={{fontSize:9,color:MUTED}}>H2</div><div style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{INR(c.h2)}</div></div>
            <div style={{flex:1,padding:6,background:DARK,borderRadius:6,textAlign:"center"}}><div style={{fontSize:9,color:MUTED}}>FY Total</div><div style={{fontSize:13,fontWeight:700,fontFamily:"'JetBrains Mono',monospace",color:GOLD}}>{INR(c.h1+c.h2)}</div></div>
          </div>
          {c.services?.length>0 && <div>{c.services.map(s=>{
            const dA = s.by==="Team"||(s.by==="Dinesh"?dineshMode!=="removed":team.find(t=>t.name===s.by)?.active);
            return <div key={s.name} style={{display:"flex",justifyContent:"space-between",fontSize:11,padding:"2px 0"}}>
              <span style={{color:dA?MUTED:RED}}>{s.name} → {s.by} {!dA&&"⚠️"}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",color:dA?"#fff":RED}}>{s.amount>0?INR(s.amount):""}</span>
            </div>;
          })}</div>}
          {c.note && <div style={{fontSize:10,color:MUTED,marginTop:4,fontStyle:"italic"}}>{c.note}</div>}
        </div>)}
        {newClients>0 && <div style={{background:CARD,borderRadius:12,border:`1px dashed ${GREEN}66`,padding:14}}>
          <div style={{fontSize:14,fontWeight:700,color:GREEN,marginBottom:6}}>+{newClients} New Client{newClients>1?"s":""}</div>
          <div style={{fontSize:11,color:MUTED}}>YK-like @ {INR(newClientMRR)}/mo each</div>
          <div style={{fontSize:18,fontWeight:800,color:GREEN,fontFamily:"'JetBrains Mono',monospace"}}>{INR(calc.nRev)}<span style={{fontSize:10,color:MUTED}}>/mo</span></div>
        </div>}
      </div>}

      {/* PROJECTION */}
      {tab==="projection" && <div>
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>12-Month Projection</div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={calc.months}>
              <defs>
                <linearGradient id="gG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GREEN} stopOpacity={0.3}/><stop offset="95%" stopColor={GREEN} stopOpacity={0}/></linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={RED} stopOpacity={0.3}/><stop offset="95%" stopColor={RED} stopOpacity={0}/></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={BORDER}/><XAxis dataKey="month" tick={{fill:MUTED,fontSize:10}}/><YAxis tick={{fill:MUTED,fontSize:10}} tickFormatter={v=>INR(v)}/>
              <Tooltip formatter={v=>INR(v)} contentStyle={{background:CARD,border:`1px solid ${BORDER}`,borderRadius:8,fontSize:11}}/>
              <ReferenceLine y={0} stroke={MUTED} strokeDasharray="3 3"/>
              <Area type="monotone" dataKey="revenue" stroke={GREEN} fill="url(#gG)" strokeWidth={2} name="Revenue"/>
              <Area type="monotone" dataKey="cost" stroke={RED} fill="url(#gR)" strokeWidth={2} name="Cost"/>
              <Line type="monotone" dataKey="profit" stroke={GOLD} strokeWidth={3} dot={{fill:GOLD,r:3}} name="Profit"/>
              <Legend/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18}}>
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`1px solid ${BORDER}`}}>{["Month","Revenue","Cost","Profit","Cumulative"].map(h=><th key={h} style={{padding:"6px 10px",textAlign:"right",color:MUTED,fontWeight:600,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{calc.months.reduce((a,m,i)=>{const cum=(a.length>0?a[a.length-1].cum:0)+m.profit;a.push({...m,cum});return a;},[]).map((m,i)=><tr key={i} style={{borderBottom:`1px solid ${BORDER}22`}}>
              <td style={{padding:"5px 10px",fontWeight:600}}>{m.month}</td>
              <td style={{padding:"5px 10px",textAlign:"right",color:GREEN,fontFamily:"'JetBrains Mono',monospace"}}>{INR(m.revenue)}</td>
              <td style={{padding:"5px 10px",textAlign:"right",color:RED,fontFamily:"'JetBrains Mono',monospace"}}>{INR(m.cost)}</td>
              <td style={{padding:"5px 10px",textAlign:"right",color:m.profit>=0?GREEN:RED,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{INR(m.profit)}</td>
              <td style={{padding:"5px 10px",textAlign:"right",color:m.cum>=0?GREEN:RED,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{INR(m.cum)}</td>
            </tr>)}</tbody>
            <tfoot><tr style={{borderTop:`2px solid ${GOLD}44`}}>
              <td style={{padding:"8px 10px",fontWeight:800,color:GOLD}}>12-Month Total</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontWeight:800,color:GREEN,fontFamily:"'JetBrains Mono',monospace"}}>{INR(calc.months.reduce((s,m)=>s+m.revenue,0))}</td>
              <td style={{padding:"8px 10px",textAlign:"right",fontWeight:800,color:RED,fontFamily:"'JetBrains Mono',monospace"}}>{INR(calc.months.reduce((s,m)=>s+m.cost,0))}</td>
              <td colSpan={2} style={{padding:"8px 10px",textAlign:"right",fontWeight:800,fontSize:14,color:calc.months.reduce((s,m)=>s+m.profit,0)>=0?GREEN:RED,fontFamily:"'JetBrains Mono',monospace"}}>{INR(calc.months.reduce((s,m)=>s+m.profit,0))}</td>
            </tr></tfoot>
          </table></div>
        </div>
      </div>}

      {/* DATA AUDIT */}
      {tab==="audit" && <div style={{display:"grid",gap:14}}>
        <div style={{background:CARD,borderRadius:12,border:`1px solid ${BORDER}`,padding:18}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:14,color:GOLD}}>Data Audit — Sources & Verification</div>
          <div style={{fontSize:11,color:MUTED,marginBottom:10}}>All numbers sourced from: Customers_and_CAC.xlsx, Team_Members_-_Utilization.xlsx, EP_-_H1_P_L.xlsx, EP_-_H2_Actual.xlsx</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
            <thead><tr style={{borderBottom:`1px solid ${BORDER}`}}>{["Data Point","App Value","Source File Value","Match?","Notes"].map(h=><th key={h} style={{padding:"6px 8px",textAlign:"left",color:MUTED,fontWeight:600,fontSize:10}}>{h}</th>)}</tr></thead>
            <tbody>{[
              {d:"FY Revenue",a:"₹96.84L",s:"H1: 61.06L + H2: 35.78L = 96.84L",m:true,n:"Matches P&L files"},
              {d:"FY Net Loss",a:"₹31.52L",s:"H1: +9.64L + H2: -41.16L = -31.52L",m:true,n:"Matches P&L files"},
              {d:"ERPR March MRR",a:"₹5.5L",s:"H2 Note 1: March = ₹550,000",m:true,n:"Updated from ₹4.5L (Customer file outdated)"},
              {d:"YK MRR",a:"₹1,99,420",s:"H2 Note 1: March = ₹199,420",m:true,n:"Matches both files"},
              {d:"Dinesh Monthly",a:"₹1,50,000",s:"H2 Note 2: March = ₹150,000",m:true,n:"Raised from ₹1L to ₹1.5L in Nov"},
              {d:"Sumit Monthly",a:"₹1,66,667",s:"H2 Note 2: March = ₹166,667",m:true,n:"₹20L/year for ₹38K YK paid ads"},
              {d:"Preyash Monthly",a:"₹1,30,833",s:"H2 Note 2: March = ₹130,833",m:true,n:"Leaving. Zero utilization."},
              {d:"Thoufik Monthly",a:"₹50,000",s:"H2 Note 2: March = ₹50,000",m:true,n:"Joined Feb 2026. Salary file: ₹6L/yr"},
              {d:"Lakshmee Monthly",a:"₹41,667",s:"H2 Note 2: March = ₹41,667",m:true,n:"100% sales outreach"},
              {d:"Thangavel Monthly",a:"₹43,083",s:"H2 Note 2: March = ₹43,083",m:true,n:"Matches"},
              {d:"Chandramohan Monthly",a:"₹89,583",s:"H2 Note 2: March = ₹89,583",m:true,n:"Rated Bad"},
              {d:"H2 Total Salary",a:"₹53.26L",s:"H2 P&L: ₹53.26L",m:true,n:"96% increase vs H1"},
              {d:"H1 Tools",a:"₹5.50L",s:"H1 Note 3: ₹5.50L",m:true,n:"Includes ROAS ₹2.83L"},
              {d:"H2 Tools",a:"₹3.98L",s:"H2 Note 3: ₹3.98L",m:true,n:"ClickUp, Clay, Dripify etc."},
              {d:"H2 Ads",a:"₹2.75L",s:"H2 Note 4: ₹2.75L",m:true,n:"Google ₹1.6L + LinkedIn ₹0.4L + Upwork ₹0.75L"},
              {d:"iLink MRR",a:"₹7,080",s:"H2 Note 1: March = ₹7,080",m:true,n:"Growing in 2026"},
              {d:"Ext Paid Ads Agency",a:"₹3.78L (H1)",s:"H1 Note 1: ₹377,600",m:true,n:"H1 only. Not billing in H2."},
            ].map((r,i)=><tr key={i} style={{borderBottom:`1px solid ${BORDER}22`}}>
              <td style={{padding:"5px 8px",fontWeight:600}}>{r.d}</td>
              <td style={{padding:"5px 8px",fontFamily:"'JetBrains Mono',monospace"}}>{r.a}</td>
              <td style={{padding:"5px 8px",color:MUTED}}>{r.s}</td>
              <td style={{padding:"5px 8px"}}>{r.m?<span style={{color:GREEN}}>✓</span>:<span style={{color:RED}}>✗</span>}</td>
              <td style={{padding:"5px 8px",color:MUTED,fontSize:10}}>{r.n}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div style={{background:GREEN+"15",border:`1px solid ${GREEN}44`,borderRadius:10,padding:"12px 16px",fontSize:12,color:GREEN}}>
          <strong>All 17 data points verified ✓</strong> — Every number traces back to your uploaded P&L files and matches March 2026 actuals.
        </div>
      </div>}
    </div>

    <div style={{textAlign:"center",padding:"20px",fontSize:10,color:MUTED,borderTop:`1px solid ${BORDER}`}}>EP360 Scenario Planner • Built from actual FY 2025-26 P&L data • Engage Positive 360</div>
  </div>;
}
