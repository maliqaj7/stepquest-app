import { useState, useRef, useEffect, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jngxlfabrccnpmzudvwf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpuZ3hsZmFicmNjbnBtenVkdndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODk1MzMsImV4cCI6MjA4MDI2NTUzM30.p_nQaeC2Ffp8zddLC9rEAv1QWPwic7LhamXEEKc44Ew";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Auth Context ─────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// ─── Theme ────────────────────────────────────────────────────────────────────
const GOLD = "#fbbf24";
const BG   = "#09090b";

// ─── Static Data ──────────────────────────────────────────────────────────────
const FEATURES = [
  { icon:"🥾", title:"Steps → XP",    desc:"Every footfall earns experience. Walk more, level up faster, unlock new hero powers.", color:"#4ade80" },
  { icon:"📜", title:"Epic Quests",   desc:"Daily bounties and epic quest chains on the Tavern Bounty Board that scale to you.",   color:"#fbbf24" },
  { icon:"⚔️", title:"Boss Battles",  desc:"Unlock zone guardians and fight turn-based RPG battles powered by your step stats.",   color:"#ef4444" },
  { icon:"🎒", title:"Loot & Gear",   desc:"Earn rare item drops after quests. Equip gear to boost ATK, DEF, SPD and more.",       color:"#a855f7" },
  { icon:"🏆", title:"Leaderboards",  desc:"Real-time global and friends rankings reset seasonally to keep competition fierce.",    color:"#3b82f6" },
  { icon:"📊", title:"Step Insights", desc:"Beautiful analytics across day, week, month and year. Watch your hero's growth.",      color:"#f59e0b" },
];

const FAQ = [
  { q:"How does StepQuest track my steps?",       a:"StepQuest syncs with Apple Health on iOS and Google Fit on Android, pulling step data automatically throughout the day." },
  { q:"Is the app available on iOS and Android?", a:"Yes! StepQuest is on the App Store (iOS 15+) and Google Play (Android 8+). Progress syncs across all devices." },
  { q:"How do I create an account?",              a:"Download the app, tap Sign Up, and enter your email and password. Use those same credentials here on the web portal." },
  { q:"How are XP and levels calculated?",        a:"You earn 1 XP per 10 steps. Quest and boss completions grant bonus XP. Every level-up gives 2 skill points to allocate." },
  { q:"Can I compete with friends?",              a:"Yes. Add friends by email in the app's Friends section. You'll share leaderboard space and can join guild events." },
  { q:"What are zone boss battles?",              a:"Step milestones unlock GPS map zones. Each zone has a guardian boss. Your ATK, DEF, SPD, LUCK, END stats decide the fight." },
  { q:"How does loot rarity work?",               a:"Quests drop loot across six tiers: Common to Mythic. Higher difficulty quests improve your odds for rarer drops." },
  { q:"Is my health data private?",               a:"Raw health data never leaves your device. Only aggregate step counts sync for quests and leaderboards. We never sell data." },
  { q:"How do I reset my password?",              a:"Use the Forgot Password link on the login page. A reset link arrives within 2 minutes." },
  { q:"What are seasonal events?",                a:"Every 3 months a new season launches with themed bosses, exclusive cosmetics, fresh rankings, and prizes for top heroes." },
];

const SYSTEM_PROMPT = `You are the StepQuest Quest Master — a wise, encouraging AI assistant for StepQuest, a gamified fitness app that turns daily steps into RPG progression.

Key facts:
- Steps earn XP (1 XP per 10 steps), levelling up the hero. Each level grants 2 skill points.
- Stats: ATK (battle damage), DEF (damage reduction), SPD (dodge + first strike), LUCK (loot rarity), END (max HP).
- Daily quests: Easy (1,500 steps, 50 XP) to Epic (12,000 steps, 600 XP).
- Zone boss battles use hero stats in turn-based combat. 10 zones on a GPS map.
- Loot: 6 tiers Common to Mythic. Higher difficulty = better drop chances.
- Leaderboards: global top 20, seasonal resets every 3 months.
- Platform: iOS (Apple Health) and Android (Google Fit).

Speak with a slightly heroic, medieval flair but stay clear and practical. Keep answers concise.`;

const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i, x: ((i * 137.508) % 100).toFixed(1), y: ((i * 97.341) % 100).toFixed(1),
  size: 1 + (i % 3) * 0.6, delay: ((i * 0.17) % 5).toFixed(2), dur: (2.2 + (i % 4) * 0.6).toFixed(1),
}));

const ZONE_REQUIREMENTS = [
  0, 2000, 10000, 20000, 32000, 45000, 65000, 85000, 105000, 125000, 
  150000, 180000, 210000, 240000, 270000, 300000, 340000, 380000, 
  420000, 460000, 500000, 550000, 600000, 650000, 700000, 750000
];

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{scroll-behavior:smooth;}
body{background:#09090b;color:#f4f4f5;font-family:'Crimson Pro',Georgia,serif;overflow-x:hidden;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:#fbbf24;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes floatAnim{0%,100%{transform:translateY(0);}50%{transform:translateY(-13px);}}
@keyframes twinkle{0%,100%{opacity:.12;}50%{opacity:.65;}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0;}}
@keyframes pulseGlow{0%,100%{box-shadow:0 0 18px rgba(251,191,36,.28);}50%{box-shadow:0 0 44px rgba(251,191,36,.64);}}
@keyframes riseUp{from{opacity:0;transform:translateY(38px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes countUp{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
.gold-text{background:linear-gradient(135deg,#fef08a,#fbbf24,#f59e0b,#d97706);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.gold-btn{background:linear-gradient(135deg,#fbbf24,#d97706);color:#09090b;border:none;padding:.8rem 2.1rem;border-radius:100px;font-family:'Cinzel',serif;font-weight:700;font-size:.88rem;cursor:pointer;transition:all .2s;box-shadow:0 4px 18px rgba(251,191,36,.28);letter-spacing:.06em;white-space:nowrap;}
.gold-btn:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(251,191,36,.5);filter:brightness(1.1);}
.gold-btn:disabled{opacity:.45;cursor:not-allowed;transform:none;box-shadow:none;}
.ghost-btn{background:transparent;color:#fbbf24;border:1.5px solid rgba(251,191,36,.38);padding:.8rem 2.1rem;border-radius:100px;font-family:'Cinzel',serif;font-weight:600;font-size:.88rem;cursor:pointer;transition:all .2s;letter-spacing:.06em;white-space:nowrap;}
.ghost-btn:hover{background:rgba(251,191,36,.09);border-color:#fbbf24;transform:translateY(-2px);}
.danger-btn{background:rgba(239,68,68,.1);color:#fca5a5;border:1px solid rgba(239,68,68,.3);padding:.65rem 1.5rem;border-radius:100px;font-family:'Cinzel',serif;font-weight:600;font-size:.82rem;cursor:pointer;transition:all .2s;letter-spacing:.05em;}
.danger-btn:hover{background:rgba(239,68,68,.2);border-color:rgba(239,68,68,.6);}
.pill-btn{background:rgba(251,191,36,.09);color:#fbbf24;border:1px solid rgba(251,191,36,.28);padding:.5rem 1.1rem;border-radius:100px;font-family:'Cinzel',serif;font-size:.78rem;font-weight:600;cursor:pointer;transition:all .2s;letter-spacing:.05em;}
.pill-btn:hover{background:rgba(251,191,36,.18);border-color:#fbbf24;}
.card{background:rgba(15,23,42,.75);border:1px solid rgba(251,191,36,.11);border-radius:16px;backdrop-filter:blur(20px);}
.card-hover{transition:all .3s;}
.card-hover:hover{border-color:rgba(251,191,36,.35);box-shadow:0 10px 32px rgba(0,0,0,.5);transform:translateY(-4px);}
.nav-link{color:#a1a1aa;font-family:'Cinzel',serif;font-size:.78rem;font-weight:500;letter-spacing:.1em;cursor:pointer;transition:color .2s;background:none;border:none;text-transform:uppercase;padding:.2rem 0;}
.nav-link:hover,.nav-link.active{color:#fbbf24;}
input,textarea{background:rgba(0,0,0,.42);border:1px solid rgba(251,191,36,.18);color:#f4f4f5;padding:.82rem 1.2rem;border-radius:10px;font-family:'Crimson Pro',serif;font-size:1.05rem;width:100%;outline:none;transition:border-color .2s,box-shadow .2s;}
input:focus,textarea:focus{border-color:#fbbf24;box-shadow:0 0 0 3px rgba(251,191,36,.1);}
input::placeholder,textarea::placeholder{color:#3f3f46;}
.faq-q{width:100%;background:rgba(15,23,42,.72);border:none;padding:1.15rem 1.5rem;color:#f4f4f5;font-family:'Cinzel',serif;font-size:.87rem;font-weight:600;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:.75rem;letter-spacing:.03em;transition:background .2s;}
.faq-q:hover{background:rgba(30,41,59,.8);}
.faq-a{padding:0 1.5rem;max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease;font-size:1.05rem;color:#a1a1aa;line-height:1.75;}
.faq-a.open{max-height:220px;padding:.2rem 1.5rem 1.2rem;}
.chat-msg{display:flex;flex-direction:column;margin-bottom:.65rem;animation:fadeUp .25s ease;}
.chat-bubble{max-width:78%;padding:.82rem 1.12rem;border-radius:14px;font-size:1rem;line-height:1.65;font-family:'Crimson Pro',serif;}
.chat-bubble.user{background:linear-gradient(135deg,rgba(251,191,36,.17),rgba(217,119,6,.11));border:1px solid rgba(251,191,36,.28);align-self:flex-end;}
.chat-bubble.ai{background:rgba(30,41,59,.85);border:1px solid rgba(255,255,255,.07);align-self:flex-start;}
.typing-dot{width:7px;height:7px;border-radius:50%;background:#fbbf24;display:inline-block;animation:blink 1s infinite;}
.typing-dot:nth-child(2){animation-delay:.2s;}
.typing-dot:nth-child(3){animation-delay:.4s;}
.lb-row{display:flex;align-items:center;gap:1rem;padding:.85rem 1.2rem;border-radius:12px;border:1px solid rgba(255,255,255,.04);margin-bottom:.52rem;transition:all .2s;background:rgba(30,41,59,.32);}
.lb-row:hover{background:rgba(30,41,59,.62);border-color:rgba(251,191,36,.2);transform:translateX(4px);}
.lb-row.you{background:linear-gradient(90deg,rgba(20,83,45,.28),rgba(30,41,59,.38));border-color:rgba(74,222,128,.32);}
.stat-card{background:rgba(15,23,42,.8);border:1px solid rgba(251,191,36,.12);border-radius:14px;padding:1.4rem 1.6rem;text-align:center;transition:all .3s;}
.stat-card:hover{border-color:rgba(251,191,36,.32);transform:translateY(-3px);}
.stat-val{font-family:'Cinzel',serif;font-size:2rem;font-weight:800;color:#fbbf24;line-height:1;animation:countUp .6s ease;}
.stat-lbl{font-family:'Crimson Pro',serif;font-size:.88rem;color:#71717a;margin-top:.35rem;letter-spacing:.04em;}
.xp-bar-bg{background:rgba(0,0,0,.4);border-radius:100px;height:8px;overflow:hidden;border:1px solid rgba(251,191,36,.15);}
.xp-bar-fill{height:100%;border-radius:100px;background:linear-gradient(90deg,#fbbf24,#f59e0b);transition:width .8s cubic-bezier(.2,.8,.2,1);}
.divider{display:flex;align-items:center;gap:1rem;margin-bottom:1rem;}
.div-l{height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(251,191,36,.3));}
.div-r{height:1px;flex:1;background:linear-gradient(90deg,rgba(251,191,36,.3),transparent);}
.div-t{font-family:'Cinzel',serif;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;color:#fbbf24;white-space:nowrap;}
.msg-box{padding:.8rem 1rem;border-radius:10px;font-family:'Crimson Pro',serif;font-size:1rem;margin-bottom:1.2rem;}
.msg-ok{background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.28);color:#4ade80;}
.msg-err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.28);color:#fca5a5;}
.msg-info{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.28);color:#fbbf24;}
@media(max-width:768px){
  .hero-h1{font-size:2.65rem!important;}
  .sh2{font-size:2rem!important;}
  .feat-grid{grid-template-columns:1fr!important;}
  .feat-det{flex-direction:column!important;}
  .sb{flex-direction:column!important;gap:1.6rem!important;}
  .dash-grid{grid-template-columns:1fr 1fr!important;}
  .nav-d{display:none!important;}
  .mob-t{display:flex!important;}
  .how-grid{grid-template-columns:1fr!important;}
  .hero-btns{flex-direction:column!important;align-items:stretch!important;}
  .ft-grid{grid-template-columns:1fr 1fr!important;}
  .pod-wrap{height:200px!important;gap:.75rem!important;}
}
`;


function Divider({ label }) {
  return (
    <div className="divider" style={{ justifyContent:"center" }}>
      <div className="div-l" />
      <span className="div-t">{label}</span>
      <div className="div-r" />
    </div>
  );
}
function Spinner() {
  return <div style={{ width:"32px", height:"32px", border:"3px solid rgba(251,191,36,.2)", borderTop:`3px solid ${GOLD}`, borderRadius:"50%", animation:"spin .8s linear infinite", margin:"2rem auto" }} />;
}
function MsgBox({ msg }) {
  if (!msg) return null;
  const cls = msg.startsWith("✅") ? "msg-ok" : msg.startsWith("ℹ️") ? "msg-info" : "msg-err";
  return <div className={`msg-box ${cls}`}>{msg}</div>;
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, mob, setMob }) {
  const { session, logout } = useAuth();
  const links = [
    { id:"home",      label:"Home"      },
    { id:"features",  label:"Features"  },
    { id:"community", label:"Community" },
    { id:"support",   label:"Support"   },
    { id:"chat",      label:"AI Chat"   },
    ...(session ? [{ id:"dashboard", label:"Dashboard" }] : []),
  ];
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:1000, background:"rgba(9,9,11,.87)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(251,191,36,.1)", padding:"0 2rem", height:"62px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
      <div onClick={() => { setPage("home"); setMob(false); }} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:".65rem" }}>
        <span style={{ fontSize:"1.4rem" }}>⚔️</span>
        <span style={{ fontFamily:"Cinzel,serif", fontWeight:800, fontSize:"1.05rem", background:"linear-gradient(135deg,#fef08a,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>StepQuest</span>
      </div>
      <div className="nav-d" style={{ display:"flex", alignItems:"center", gap:"2rem" }}>
        {links.map(l => <button key={l.id} className={`nav-link${page===l.id?" active":""}`} onClick={() => setPage(l.id)}>{l.label}</button>)}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:".75rem" }}>
        {session ? (
          <>
            <span className="nav-d" style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", color:"#71717a", letterSpacing:".06em", maxWidth:"180px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{session.user.email}</span>
            <button className="danger-btn nav-d" style={{ padding:".42rem 1rem", fontSize:".76rem" }} onClick={logout}>Log Out</button>
          </>
        ) : (
          <>
            <button className="ghost-btn nav-d" style={{ padding:".45rem 1.15rem", fontSize:".78rem" }} onClick={() => setPage("login")}>Log In</button>
            <button className="gold-btn nav-d"  style={{ padding:".45rem 1.15rem", fontSize:".78rem" }} onClick={() => setPage("login")}>Get Started</button>
          </>
        )}
        <button className="mob-t" style={{ display:"none", flexDirection:"column", gap:"5px", background:"none", border:"none", cursor:"pointer", padding:".25rem" }} onClick={() => setMob(!mob)}>
          {[0,1,2].map(i => <div key={i} style={{ width:"21px", height:"2px", background:mob&&i===1?"transparent":GOLD, transition:"all .2s", transform:mob?(i===0?"rotate(45deg) translate(5px,5px)":i===2?"rotate(-45deg) translate(5px,-5px)":"none"):"none" }} />)}
        </button>
      </div>
      {mob && (
        <div style={{ position:"absolute", top:"62px", left:0, right:0, background:"rgba(9,9,11,.97)", borderBottom:"1px solid rgba(251,191,36,.14)", padding:"1.5rem 2rem 2rem", display:"flex", flexDirection:"column", gap:"1rem" }}>
          {links.map(l => <button key={l.id} className={`nav-link${page===l.id?" active":""}`} style={{ textAlign:"left", fontSize:".95rem" }} onClick={() => { setPage(l.id); setMob(false); }}>{l.label}</button>)}
          <div style={{ display:"flex", gap:".75rem", marginTop:".5rem" }}>
            {session
              ? <button className="danger-btn" style={{ flex:1, padding:".7rem" }} onClick={() => { logout(); setMob(false); }}>Log Out</button>
              : <><button className="ghost-btn" style={{ flex:1, padding:".7rem" }} onClick={() => { setPage("login"); setMob(false); }}>Log In</button>
                  <button className="gold-btn"  style={{ flex:1, padding:".7rem" }} onClick={() => { setPage("login"); setMob(false); }}>Get Started</button></>
            }
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomePage({ setPage }) {
  const { session } = useAuth();
  const [c1,setC1]=useState(0); const [c2,setC2]=useState(0); const [c3,setC3]=useState(0);
  useEffect(() => {
    const go = (setter, target, dur) => {
      const start = Date.now();
      const tick = () => { const p = Math.min((Date.now()-start)/dur,1); setter(Math.round((1-Math.pow(1-p,3))*target)); if(p<1)requestAnimationFrame(tick); };
      setTimeout(() => requestAnimationFrame(tick), 350);
    };
    go(setC1,2400000,2000); go(setC2,18500,1800); go(setC3,94000,2100);
  }, []);

  return (
    <div style={{ paddingTop:"62px" }}>
      <section style={{ minHeight:"91vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"5rem 2rem 4rem", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"650px", height:"650px", borderRadius:"50%", background:"radial-gradient(circle,rgba(251,191,36,.055) 0%,transparent 65%)", pointerEvents:"none" }} />
        {session ? (
          <div style={{ display:"inline-flex", alignItems:"center", gap:".6rem", background:"rgba(74,222,128,.07)", border:"1px solid rgba(74,222,128,.24)", borderRadius:"100px", padding:".42rem 1.35rem", marginBottom:"1.85rem", animation:"fadeUp .5s ease" }}>
            <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"blink 1.6s infinite" }} />
            <span style={{ fontFamily:"Cinzel,serif", fontSize:".75rem", color:"#4ade80", letterSpacing:".1em" }}>WELCOME BACK — <span style={{ opacity:.75 }}>{session.user.email}</span></span>
          </div>
        ) : (
          <div style={{ display:"inline-flex", alignItems:"center", gap:".5rem", background:"rgba(251,191,36,.07)", border:"1px solid rgba(251,191,36,.24)", borderRadius:"100px", padding:".38rem 1.2rem", marginBottom:"1.85rem", animation:"fadeUp .6s ease" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4ade80", display:"inline-block", animation:"blink 1.6s infinite" }} />
            <span style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", color:GOLD, letterSpacing:".13em", textTransform:"uppercase" }}>Season 1 — The Awakening — Now Live</span>
          </div>
        )}
        <h1 className="hero-h1" style={{ fontFamily:"Cinzel,serif", fontSize:"4.6rem", fontWeight:900, lineHeight:1.04, marginBottom:"1.65rem", animation:"fadeUp .7s ease" }}>
          <span className="gold-text">Step into</span><br /><span style={{ color:"#f4f4f5" }}>Legend</span>
        </h1>
        <p style={{ fontSize:"1.28rem", color:"#a1a1aa", lineHeight:1.75, maxWidth:"580px", marginBottom:"2.65rem", fontFamily:"Crimson Pro,serif", animation:"fadeUp .8s ease" }}>
          Turn every footstep into glory. Walk. Level up. Conquer bosses. Build your hero from the ground up — one stride at a time.
        </p>
        <div className="hero-btns" style={{ display:"flex", gap:"1rem", justifyContent:"center", animation:"fadeUp .9s ease" }}>
          {session
            ? <><button className="gold-btn" style={{ fontSize:".98rem", padding:".95rem 2.5rem", animation:"pulseGlow 3s infinite" }} onClick={() => setPage("dashboard")}>⚔️ My Dashboard</button>
                <button className="ghost-btn" style={{ fontSize:".98rem", padding:".95rem 2.5rem" }} onClick={() => setPage("community")}>View Leaderboard →</button></>
            : <><button className="gold-btn" style={{ fontSize:".98rem", padding:".95rem 2.5rem", animation:"pulseGlow 3s infinite" }} onClick={() => setPage("login")}>⚔️ Start Your Quest</button>
                <button className="ghost-btn" style={{ fontSize:".98rem", padding:".95rem 2.5rem" }} onClick={() => setPage("features")}>Explore Features →</button></>
          }
        </div>
        <div style={{ fontSize:"5.5rem", marginTop:"3.5rem", animation:"floatAnim 4s ease-in-out infinite", filter:"drop-shadow(0 0 28px rgba(251,191,36,.38))" }}>🏰</div>
        <div style={{ position:"absolute", bottom:"2rem", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:".35rem", opacity:.45 }}>
          <span style={{ fontFamily:"Cinzel,serif", fontSize:".68rem", letterSpacing:".16em", color:GOLD }}>SCROLL</span>
          <div style={{ width:"1px", height:"38px", background:"linear-gradient(to bottom,#fbbf24,transparent)" }} />
        </div>
      </section>

      <div style={{ borderTop:"1px solid rgba(251,191,36,.08)", borderBottom:"1px solid rgba(251,191,36,.08)", background:"rgba(15,23,42,.38)", padding:"2.4rem 2rem" }}>
        <div className="sb" style={{ display:"flex", justifyContent:"center", gap:"5rem", maxWidth:"860px", margin:"0 auto", alignItems:"center" }}>
          {[[c1.toLocaleString(),"Steps Tracked"],[c2.toLocaleString()+"+","Heroes Active"],[c3.toLocaleString()+"+","Quests Done"]].map(([v,l],i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"2.4rem", fontWeight:800, color:GOLD, lineHeight:1 }}>{v}</div>
              <div style={{ fontFamily:"Crimson Pro,serif", fontSize:".95rem", color:"#71717a", marginTop:".3rem", letterSpacing:".05em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section style={{ padding:"6rem 2rem", maxWidth:"1080px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3.75rem" }}>
          <Divider label="What We Offer" />
          <h2 className="sh2" style={{ fontFamily:"Cinzel,serif", fontSize:"2.65rem", fontWeight:800, marginBottom:".9rem" }}>Fitness. Fantasy. <span className="gold-text">Glory.</span></h2>
          <p style={{ fontSize:"1.12rem", color:"#a1a1aa", fontFamily:"Crimson Pro,serif", lineHeight:1.75 }}>StepQuest wraps your daily movement in layers of RPG progression.</p>
        </div>
        <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.15rem" }}>
          {FEATURES.map((f,i) => (
            <div key={i} className="card card-hover" style={{ padding:"1.85rem" }}>
              <div style={{ fontSize:"2.1rem", marginBottom:".8rem" }}>{f.icon}</div>
              <h3 style={{ fontFamily:"Cinzel,serif", fontSize:"1rem", fontWeight:700, color:f.color, marginBottom:".6rem", letterSpacing:".03em" }}>{f.title}</h3>
              <p style={{ fontFamily:"Crimson Pro,serif", fontSize:"1rem", color:"#a1a1aa", lineHeight:1.72 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"4rem 2rem 6rem", background:"rgba(15,23,42,.28)", borderTop:"1px solid rgba(251,191,36,.06)", borderBottom:"1px solid rgba(251,191,36,.06)" }}>
        <div style={{ maxWidth:"880px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"3.75rem" }}>
            <Divider label="How It Works" />
            <h2 className="sh2" style={{ fontFamily:"Cinzel,serif", fontSize:"2.65rem", fontWeight:800 }}>Three Steps to <span className="gold-text">Greatness</span></h2>
          </div>
          <div className="how-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"2rem" }}>
            {[
              { n:"01", icon:"📱", title:"Download & Sign Up",  desc:"Install StepQuest, create your account, and choose your hero archetype." },
              { n:"02", icon:"🥾", title:"Walk & Earn XP",      desc:"Your phone tracks every step. Steps convert to XP that grows your hero." },
              { n:"03", icon:"🏆", title:"Quest, Battle & Win", desc:"Complete bounties, fight bosses, earn loot, and conquer the leaderboard." },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", textAlign:"center", padding:"1.85rem", position:"relative" }}>
                <div style={{ fontFamily:"Cinzel,serif", fontSize:"3.2rem", fontWeight:900, color:"rgba(251,191,36,.07)", position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", lineHeight:1 }}>{s.n}</div>
                <div style={{ fontSize:"2.25rem", marginBottom:".9rem", position:"relative", zIndex:1 }}>{s.icon}</div>
                <h3 style={{ fontFamily:"Cinzel,serif", fontSize:".95rem", fontWeight:700, color:GOLD, marginBottom:".65rem", letterSpacing:".05em", position:"relative", zIndex:1 }}>{s.title}</h3>
                <p style={{ fontFamily:"Crimson Pro,serif", fontSize:"1rem", color:"#a1a1aa", lineHeight:1.75, position:"relative", zIndex:1 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding:"6rem 2rem", textAlign:"center" }}>
        <div style={{ maxWidth:"660px", margin:"0 auto" }}>
          <div style={{ fontSize:"2.9rem", marginBottom:"1.4rem", animation:"floatAnim 3s ease-in-out infinite" }}>⚔️</div>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:"2.65rem", fontWeight:800, marginBottom:"1.15rem", lineHeight:1.15 }}>Your Legend Awaits, <span className="gold-text">Hero</span></h2>
          <p style={{ fontSize:"1.18rem", color:"#a1a1aa", marginBottom:"2.4rem", lineHeight:1.78, fontFamily:"Crimson Pro,serif" }}>Join thousands of heroes already walking their way to glory.</p>
          <div style={{ display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap" }}>
            <button className="gold-btn" style={{ fontSize:"1rem", padding:".95rem 2.65rem" }} onClick={() => setPage(session?"dashboard":"login")}>
              {session?"Go to Dashboard →":"Begin Your Quest →"}
            </button>
            <button className="ghost-btn" style={{ fontSize:"1rem", padding:".95rem 2.65rem" }} onClick={() => setPage("support")}>Need Help?</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardPage({ setPage }) {
  const { session } = useAuth();
  const [stats,      setStats]      = useState(null);
  const [todaySteps, setTodaySteps] = useState(null);
  const [zones,      setZones]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [username,   setUsername]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [msg,        setMsg]        = useState("");

  useEffect(() => {
    if (!session) { setPage("login"); return; }
    const uid   = session.user.id;
    const today = new Date().toISOString().split("T")[0];
    
    Promise.all([
      supabase.from("player_stats").select("*").eq("user_id", uid).single(),
      supabase.from("daily_steps").select("steps, date").eq("user_id", uid),
    ]).then(([{ data:s }, { data:dailyHist }]) => {
      if (s) { 
        // 1. Calculate aggregate total from all daily records (most durable source)
        const aggregateTotal = (dailyHist || []).reduce((acc, row) => acc + (Number(row.steps) || 0), 0);
        const accurateTotal = Math.max(Number(s.total_steps || 0), aggregateTotal);
        
        // 2. Find today's steps in the history vs player_stats
        const todayRecord = (dailyHist || []).find(r => r.date === today);
        const accurateToday = Math.max(Number(s.steps_today || 0), Number(todayRecord?.steps || 0));

        // 3. Construct a merged source of truth
        const mergedStats = { 
          ...s, 
          total_steps: accurateTotal,
          steps_today: accurateToday 
        };

        setStats(mergedStats); 
        setTodaySteps(accurateToday);
        setUsername(s.username || "");

        // 4. Calculate zones unlocked based on the corrected total
        const unlockedCount = ZONE_REQUIREMENTS.filter(req => accurateTotal >= req).length;
        setZones(unlockedCount);
      }
      setLoading(false);
    });
  }, [session]);


  const saveUsername = async () => {
    if (!username.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("player_stats").update({ username: username.trim() }).eq("user_id", session.user.id);
    setSaving(false);
    setMsg(error ? "❌ " + error.message : "✅ Username updated!");
    setTimeout(() => setMsg(""), 3000);
  };

  if (!session) return null;
  if (loading)  return <div style={{ paddingTop:"62px", minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;

  const xpForNext = (stats?.level || 1) * 500;
  const xpPct     = stats ? Math.min(100, Math.round(((stats.xp || 0) % xpForNext) / xpForNext * 100)) : 0;

  const statCards = [
    { icon:"🥾", val:(stats?.total_steps||0).toLocaleString(),   lbl:"Total Steps"    },
    { icon:"✨", val:(stats?.xp||0).toLocaleString(),            lbl:"Level XP"       },
    { icon:"⚔️", val: stats?.level||1,                           lbl:"Hero Level"     },
    { icon:"🎯", val:(stats?.daily_goal||5000).toLocaleString(), lbl:"Daily Goal"     },
    { icon:"👣", val:(stats?.steps_today||0).toLocaleString(),   lbl:"Steps Today"    },
    { icon:"🗺️", val: zones,                                     lbl:"Zones Unlocked" },
  ];

  return (
    <div style={{ paddingTop:"62px", maxWidth:"900px", margin:"0 auto", padding:"5rem 2rem 6rem" }}>
      <div style={{ marginBottom:"3rem", paddingTop:"2rem" }}>
        <Divider label="Your Dashboard" />
        <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"2.6rem", fontWeight:900, textAlign:"center" }}>Hero <span className="gold-text">Command</span></h1>
        <p style={{ textAlign:"center", fontFamily:"Crimson Pro,serif", color:"#71717a", marginTop:".5rem" }}>{session.user.email}</p>
      </div>

      {stats && (
        <div className="card" style={{ padding:"1.75rem", marginBottom:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:".85rem" }}>
            <div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:".78rem", color:GOLD, letterSpacing:".12em", marginBottom:".3rem" }}>LEVEL PROGRESS</div>
              <div style={{ fontFamily:"Cinzel,serif", fontSize:"1.5rem", fontWeight:800, color:"#f4f4f5" }}>Level {stats.level||1}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontFamily:"Crimson Pro,serif", fontSize:".88rem", color:"#a1a1aa" }}>{(stats.xp||0) % xpForNext} / {xpForNext} XP</div>
              <div style={{ fontFamily:"Crimson Pro,serif", fontSize:".82rem", color:"#52525b", marginTop:".18rem" }}>{xpPct}% to Level {(stats.level||1)+1}</div>
            </div>
          </div>
          <div className="xp-bar-bg"><div className="xp-bar-fill" style={{ width:`${xpPct}%` }} /></div>
        </div>
      )}

      <div className="dash-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {statCards.map((s,i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize:"1.5rem", marginBottom:".5rem" }}>{s.icon}</div>
            <div className="stat-val">{s.val}</div>
            <div className="stat-lbl">{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:"1.75rem", marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.1rem" }}>
          <h2 style={{ fontFamily:"Cinzel,serif", fontSize:"1rem", fontWeight:700, color:GOLD, margin:0, letterSpacing:".05em" }}>⚙️ Username</h2>
          <button className="nav-link" style={{ fontSize:".6rem" }} onClick={() => console.log("Current Stats Object:", stats)}>Debug Stats to Console</button>
        </div>
        <MsgBox msg={msg} />
        <div style={{ display:"flex", gap:".75rem" }}>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose your hero name…" onKeyDown={e=>e.key==="Enter"&&saveUsername()} />
          <button className="gold-btn" style={{ flexShrink:0, padding:".7rem 1.5rem", fontSize:".85rem" }} onClick={saveUsername} disabled={saving}>{saving?"…":"Save"}</button>
        </div>
        <p style={{ fontFamily:"Crimson Pro,serif", fontSize:".88rem", color:"#52525b", marginTop:".6rem" }}>This name appears on the leaderboard.</p>
      </div>

      <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap" }}>
        <button className="gold-btn"  style={{ flex:1, padding:".8rem" }} onClick={() => setPage("community")}>🏆 Leaderboard</button>
        <button className="ghost-btn" style={{ flex:1, padding:".8rem" }} onClick={() => setPage("chat")}>🤖 AI Chat</button>
        <button className="ghost-btn" style={{ flex:1, padding:".8rem" }} onClick={() => setPage("support")}>🛡️ Support</button>
      </div>
    </div>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function FeaturesPage({ setPage }) {
  const { session } = useAuth();
  const details = [
    { icon:"🥾", title:"Step Tracking & XP Engine",  color:"#4ade80", points:["1 XP earned per every 10 steps","Syncs with Apple Health & Google Fit","Real-time updates throughout the day","Bonus XP for streaks and milestones"],         desc:"The foundation of StepQuest is a seamless step engine. Every stride converts to experience that grows your hero, unlocks quests, and powers boss battles." },
    { icon:"📜", title:"Quest & Bounty System",       color:"#fbbf24", points:["Daily rotating tavern bounties","Four difficulty tiers: Easy to Epic","AI Quest Master can forge custom quests","Progress tracked in real time"],                desc:"The Tavern Bounty Board refreshes daily with challenges calibrated to real distances. From 1,500-step strolls to 12,000-step marathons, there's a quest for every hero." },
    { icon:"⚔️", title:"Zone Boss Battles",           color:"#ef4444", points:["10 unique world zones to discover","Turn-based combat system","Boss victories drop rare loot","Rebattle any boss for bonus XP"],                             desc:"Each zone you unlock harbors a powerful guardian boss waiting to test your built stats in strategic turn-based combat." },
    { icon:"🎒", title:"Loot & Inventory System",     color:"#a855f7", points:["Six tiers from Common to Mythic","Items boost ATK, DEF, SPD, LUCK, END","Persistent inventory across all sessions","Sort by rarity or acquisition order"], desc:"Quest completions trigger loot rolls with rarity-based drop tables. Equip your best gear to maximise battle performance." },
    { icon:"🏆", title:"Global Leaderboards",         color:"#3b82f6", points:["Top 20 global hero rankings","Seasonal resets every 3 months","Friends-only filtered view","Live step count updates daily"],                                  desc:"Compete globally or filter to your friend group. Seasons keep it fresh with reset rankings and exclusive cosmetic rewards." },
    { icon:"📊", title:"Step Insights & Analytics",   color:"#f59e0b", points:["Day / Week / Month / Year views","Peak step period identification","Average and trend analysis","Beautiful animated line charts"],                           desc:"The Insights page transforms raw step data into clear charts. Spot patterns, track consistency, and understand long-term trends." },
  ];
  return (
    <div style={{ paddingTop:"62px", maxWidth:"980px", margin:"0 auto", padding:"6rem 2rem" }}>
      <div style={{ textAlign:"center", marginBottom:"4.5rem", paddingTop:"2rem" }}>
        <Divider label="Full Feature Breakdown" />
        <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"2.9rem", fontWeight:900, marginBottom:".9rem" }}>Everything in <span className="gold-text">Your Arsenal</span></h1>
        <p style={{ fontSize:"1.12rem", color:"#a1a1aa", fontFamily:"Crimson Pro,serif", lineHeight:1.78, maxWidth:"520px", margin:"0 auto" }}>StepQuest is engineered feature-by-feature to reward every dimension of your fitness journey.</p>
      </div>
      {details.map((f,i) => (
        <div key={i} className="card" style={{ padding:"2.25rem", marginBottom:"1.35rem" }}>
          <div className="feat-det" style={{ display:"flex", gap:"2.5rem", alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:".9rem", marginBottom:".9rem" }}>
                <span style={{ fontSize:"2.25rem" }}>{f.icon}</span>
                <h2 style={{ fontFamily:"Cinzel,serif", fontSize:"1.12rem", fontWeight:700, color:f.color }}>{f.title}</h2>
              </div>
              <p style={{ fontFamily:"Crimson Pro,serif", fontSize:"1.05rem", color:"#a1a1aa", lineHeight:1.75, marginBottom:"1.4rem" }}>{f.desc}</p>
              <button className="gold-btn" style={{ padding:".6rem 1.45rem", fontSize:".84rem" }} onClick={() => setPage(session?"dashboard":"login")}>
                {session?"Open App →":"Try It Free →"}
              </button>
            </div>
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:".8rem" }}>
              {f.points.map((p,j) => (
                <div key={j} style={{ display:"flex", alignItems:"flex-start", gap:".7rem" }}>
                  <span style={{ color:f.color, fontSize:".95rem", marginTop:".12rem", flexShrink:0 }}>✦</span>
                  <span style={{ fontFamily:"Crimson Pro,serif", fontSize:"1rem", color:"#d4d4d8", lineHeight:1.65 }}>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Community ────────────────────────────────────────────────────────────────
function CommunityPage() {
  const { session } = useAuth();
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("player_stats")
      .select("user_id, username, total_steps")
      .order("total_steps", { ascending:false })
      .limit(20)
      .then(({ data, error }) => {
        if (!error && data) setRows(data);
        setLoading(false);
      });
  }, []);

  const ranked = rows.map((r,i) => ({
    rank:   i + 1,
    name:   r.username || `Hero ${r.user_id?.substring(0,6)}`,
    steps:  r.total_steps || 0,
    isYou:  session?.user?.id === r.user_id,
  }));

  const rc = { 1:"#fbbf24", 2:"#d1d5db", 3:"#b45309" };
  const re = { 1:"👑", 2:"🥈", 3:"🥉" };

  return (
    <div style={{ paddingTop:"62px", maxWidth:"860px", margin:"0 auto", padding:"6rem 2rem" }}>
      <div style={{ textAlign:"center", marginBottom:"3.75rem", paddingTop:"2rem" }}>
        <Divider label="Community" />
        <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"2.9rem", fontWeight:900, marginBottom:".9rem" }}>The <span className="gold-text">Champions Hall</span></h1>
        <p style={{ fontSize:"1.12rem", color:"#a1a1aa", fontFamily:"Crimson Pro,serif", lineHeight:1.75 }}>
          {session ? "Live Season 1 rankings — your position is highlighted in green." : "Live Season 1 rankings — log in to see your real position."}
        </p>
      </div>

      {loading && <Spinner />}

      {!loading && ranked.length === 0 && (
        <div className="card" style={{ padding:"3rem", textAlign:"center" }}>
          <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>🏜️</div>
          <p style={{ fontFamily:"Cinzel,serif", color:"#71717a" }}>The realm is empty. Be the first to step forth!</p>
        </div>
      )}

      {!loading && ranked.length > 0 && (
        <>
          <div className="pod-wrap" style={{ display:"flex", justifyContent:"center", alignItems:"flex-end", gap:"1.2rem", marginBottom:"3.25rem", height:"230px" }}>
            {[{rank:2,h:"145px"},{rank:1,h:"190px"},{rank:3,h:"112px"}].map(({rank,h}) => {
              const row = ranked[rank-1];
              if (!row) return null;
              return (
                <div key={rank} style={{ display:"flex", flexDirection:"column", alignItems:"center", animation:`riseUp .7s ${rank===1?.4:rank===2?.2:0}s both` }}>
                  <div style={{ width:rank===1?"74px":"56px", height:rank===1?"74px":"56px", borderRadius:"50%", background:"rgba(15,23,42,.9)", border:`2.5px solid ${rc[rank]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:rank===1?"1.65rem":"1.2rem", marginBottom:"-12px", zIndex:5, boxShadow:`0 0 18px ${rc[rank]}50` }}>
                    {re[rank]}
                  </div>
                  <div style={{ width:rank===1?"132px":"108px", height:h, background:"linear-gradient(to bottom,rgba(30,41,59,.92),rgba(15,23,42,.97))", border:`1.5px solid ${rc[rank]}`, borderBottom:"none", borderTopLeftRadius:"10px", borderTopRightRadius:"10px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-start", paddingTop:"1.4rem" }}>
                    <div style={{ fontFamily:"Cinzel,serif", fontSize:rank===1?"2.6rem":"2rem", fontWeight:900, background:`linear-gradient(135deg,${rc[rank]},${rc[rank]}80)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{rank}</div>
                    <div style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", fontWeight:700, color:row.isYou?"#4ade80":"#f4f4f5", textAlign:"center", padding:"0 .5rem", marginTop:".2rem" }}>{row.name}</div>
                    <div style={{ fontFamily:"Cinzel,serif", fontSize:".82rem", fontWeight:700, color:"#4ade80", marginTop:".18rem" }}>{row.steps.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding:"1.5rem 1.65rem" }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:"1rem", fontWeight:700, color:GOLD, marginBottom:"1.4rem", textAlign:"center", letterSpacing:".09em" }}>♦ Live Rankings ♦</h2>
            {ranked.map((row,i) => (
              <div key={i} className={`lb-row${row.isYou?" you":""}`}>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:".95rem", fontWeight:700, color:i<3?Object.values(rc)[i]:"#71717a", width:"34px" }}>#{row.rank}</span>
                <span style={{ flex:1, fontFamily:"Crimson Pro,serif", fontSize:"1.08rem", fontWeight:600, color:row.isYou?"#4ade80":"#e4e4e7" }}>
                  {row.name}{row.isYou && <span style={{ fontSize:".8rem", opacity:.75 }}> (You)</span>}
                </span>
                <span style={{ fontFamily:"Cinzel,serif", fontSize:".95rem", fontWeight:700, color:GOLD }}>{row.steps.toLocaleString()}</span>
              </div>
            ))}
            {!session && <p style={{ textAlign:"center", fontFamily:"Crimson Pro,serif", fontSize:".92rem", color:"#52525b", marginTop:"1rem", fontStyle:"italic" }}>Log in to see yourself on the board.</p>}
          </div>
        </>
      )}

      <div className="card" style={{ padding:"1.85rem", marginTop:"1.35rem", background:"linear-gradient(135deg,rgba(251,191,36,.06),rgba(15,23,42,.8))", borderColor:"rgba(251,191,36,.24)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem" }}>
          <div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", letterSpacing:".16em", color:GOLD, marginBottom:".38rem" }}>SEASON 1 — THE AWAKENING</div>
            <div style={{ fontFamily:"Cinzel,serif", fontSize:"1.08rem", fontWeight:700, color:"#f4f4f5" }}>Ends in 47 Days</div>
            <div style={{ fontFamily:"Crimson Pro,serif", fontSize:".93rem", color:"#a1a1aa", marginTop:".28rem" }}>Top 10 earn the exclusive "Trailblazer" cosmetic title</div>
          </div>
          <button className="gold-btn" style={{ padding:".65rem 1.65rem", fontSize:".85rem" }}>View Season Rewards</button>
        </div>
      </div>
    </div>
  );
}

// ─── Support ──────────────────────────────────────────────────────────────────
function SupportPage({ setPage }) {
  const [open,setOpen]=useState(null);
  const [q,setQ]=useState("");
  const filtered = FAQ.filter(f => f.q.toLowerCase().includes(q.toLowerCase()) || f.a.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{ paddingTop:"62px", maxWidth:"760px", margin:"0 auto", padding:"6rem 2rem" }}>
      <div style={{ textAlign:"center", marginBottom:"3.25rem", paddingTop:"2rem" }}>
        <Divider label="Help Center" />
        <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"2.9rem", fontWeight:900, marginBottom:".9rem" }}>How Can We <span className="gold-text">Help You?</span></h1>
        <p style={{ fontSize:"1.1rem", color:"#a1a1aa", fontFamily:"Crimson Pro,serif", lineHeight:1.75, maxWidth:"490px", margin:"0 auto 1.85rem" }}>Browse our knowledge base or open the AI Quest Master for instant heroic guidance.</p>
        <div style={{ display:"flex", gap:".85rem", justifyContent:"center", flexWrap:"wrap" }}>
          <button className="gold-btn" onClick={() => setPage("chat")}>🤖 Chat with Quest Master</button>
          <button className="ghost-btn">📧 Email Support</button>
        </div>
      </div>
      <div style={{ position:"relative", marginBottom:"1.85rem" }}>
        <span style={{ position:"absolute", left:"1.15rem", top:"50%", transform:"translateY(-50%)", color:"#52525b" }}>🔍</span>
        <input placeholder="Search support articles…" value={q} onChange={e=>{setQ(e.target.value);setOpen(null);}} style={{ paddingLeft:"3rem" }} />
      </div>
      <h2 style={{ fontFamily:"Cinzel,serif", fontSize:".9rem", fontWeight:700, color:GOLD, marginBottom:"1.15rem", letterSpacing:".1em", textTransform:"uppercase" }}>Frequently Asked Questions</h2>
      {filtered.length===0 && (
        <div style={{ textAlign:"center", padding:"2.5rem", color:"#52525b", fontFamily:"Crimson Pro,serif", fontSize:"1.05rem" }}>
          No results. <button className="pill-btn" style={{ marginLeft:".85rem" }} onClick={() => setPage("chat")}>Ask the Quest Master →</button>
        </div>
      )}
      {filtered.map((f,i) => (
        <div key={i} style={{ border:"1px solid rgba(251,191,36,.1)", borderRadius:"12px", overflow:"hidden", marginBottom:".65rem" }}>
          <button className="faq-q" onClick={() => setOpen(open===i?null:i)}>
            <span>{f.q}</span>
            <span style={{ color:GOLD, flexShrink:0 }}>{open===i?"▲":"▼"}</span>
          </button>
          <div className={`faq-a${open===i?" open":""}`}>{f.a}</div>
        </div>
      ))}
      <div className="card" style={{ padding:"1.85rem", marginTop:"2.5rem", textAlign:"center" }}>
        <div style={{ fontSize:"1.85rem", marginBottom:".9rem" }}>🛡️</div>
        <h3 style={{ fontFamily:"Cinzel,serif", fontSize:"1.05rem", fontWeight:700, marginBottom:".65rem", color:GOLD }}>Still Need Help?</h3>
        <p style={{ fontFamily:"Crimson Pro,serif", fontSize:"1.05rem", color:"#a1a1aa", lineHeight:1.72, marginBottom:"1.4rem" }}>Our support guild is online Mon–Fri, 9am–6pm UTC. Average response under 4 hours.</p>
        <div style={{ display:"flex", gap:".85rem", justifyContent:"center", flexWrap:"wrap" }}>
          <button className="gold-btn"  style={{ padding:".65rem 1.65rem" }} onClick={() => setPage("chat")}>🤖 Open AI Chat</button>
          <button className="ghost-btn" style={{ padding:".65rem 1.65rem" }}>📧 Email Us</button>
        </div>
      </div>
    </div>
  );
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function ChatPage() {
  const { session } = useAuth();
  const [msgs,setMsgs]=useState([{ role:"ai", text:"Greetings, hero! I am the Quest Master Oracle. Ask me anything about StepQuest — quests, battles, levelling, loot, or your account. ⚔️" }]);
  const [inp,setInp]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const SUGG = ["How do I earn more XP?","How do boss battles work?","How do I get Legendary loot?","How do seasons and resets work?"];

  const send = async () => {
    const text = inp.trim();
    if (!text || loading) return;
    setInp("");
    const next = [...msgs, { role:"user", text }];
    setMsgs(next);
    setLoading(true);
    try {
      const history = next.map(m => ({ role:m.role==="ai"?"assistant":"user", content:m.text }));
      const res = await fetch("https://jngxlfabrccnpmzudvwf.supabase.co/functions/v1/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify({ system:SYSTEM_PROMPT, messages:history }),
      });
      const data = await res.json();
      const reply = data.content?.map(c=>c.text||"").join("") || "The oracle falters… try again.";
      setMsgs(prev => [...prev, { role:"ai", text:reply }]);
    } catch { setMsgs(prev => [...prev, { role:"ai", text:"Connection lost. Please try again!" }]); }
    setLoading(false);
  };

  return (
    <div style={{ paddingTop:"62px", height:"100vh", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"rgba(9,9,11,.9)", borderBottom:"1px solid rgba(251,191,36,.11)", padding:".85rem 2rem", display:"flex", alignItems:"center", gap:".9rem", backdropFilter:"blur(20px)" }}>
        <div style={{ width:"42px", height:"42px", borderRadius:"50%", background:"rgba(251,191,36,.09)", border:"1.5px solid rgba(251,191,36,.38)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem", animation:"pulseGlow 3s infinite" }}>🧙</div>
        <div>
          <div style={{ fontFamily:"Cinzel,serif", fontSize:".95rem", fontWeight:700, color:GOLD }}>Quest Master Oracle</div>
          <div style={{ display:"flex", alignItems:"center", gap:".38rem" }}>
            <span style={{ width:"7px", height:"7px", borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
            <span style={{ fontFamily:"Crimson Pro,serif", fontSize:".83rem", color:"#a1a1aa" }}>
              Always online{session && ` — ${session.user.email}`}
            </span>
          </div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"1.75rem 2rem", display:"flex", flexDirection:"column", gap:".25rem", maxWidth:"820px", width:"100%", margin:"0 auto", alignSelf:"center" }}>
        {msgs.map((m,i) => (
          <div key={i} className="chat-msg" style={{ alignItems:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="ai" && <div style={{ display:"flex", alignItems:"center", gap:".45rem", marginBottom:".3rem" }}>
              <span style={{ fontSize:".88rem" }}>🧙</span>
              <span style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", color:GOLD, letterSpacing:".09em" }}>QUEST MASTER</span>
            </div>}
            <div className={`chat-bubble ${m.role}`} style={{ whiteSpace:"pre-wrap" }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg" style={{ alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:".45rem", marginBottom:".3rem" }}>
              <span>🧙</span><span style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", color:GOLD }}>QUEST MASTER</span>
            </div>
            <div className="chat-bubble ai" style={{ display:"flex", gap:".42rem", alignItems:"center", padding:".72rem 1rem" }}>
              <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {msgs.length <= 2 && (
        <div style={{ padding:"0 2rem .85rem", display:"flex", gap:".5rem", flexWrap:"wrap", justifyContent:"center", maxWidth:"820px", margin:"0 auto", width:"100%", alignSelf:"center" }}>
          {SUGG.map((s,i) => <button key={i} className="pill-btn" style={{ fontSize:".78rem" }} onClick={() => setInp(s)}>{s}</button>)}
        </div>
      )}
      <div style={{ borderTop:"1px solid rgba(251,191,36,.1)", padding:"1.1rem 2rem", background:"rgba(9,9,11,.9)", backdropFilter:"blur(20px)" }}>
        <div style={{ display:"flex", gap:".7rem", maxWidth:"820px", margin:"0 auto", alignItems:"flex-end" }}>
          <textarea rows={1} placeholder="Ask the Quest Master anything…" value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} style={{ flex:1, resize:"none", minHeight:"44px", maxHeight:"110px", lineHeight:"1.5", paddingTop:".62rem", paddingBottom:".62rem" }} />
          <button className="gold-btn" style={{ padding:".68rem 1.45rem", flexShrink:0 }} onClick={send} disabled={loading||!inp.trim()}>⚔️ Send</button>
        </div>
      </div>
    </div>
  );
}

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ setPage }) {
  const [mode,setMode]=useState("login");
  const [email,setEmail]=useState("");
  const [pw,setPw]=useState("");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [forgot,setForgot]=useState(false);

  const submit = async () => {
    if (!email || (!forgot && !pw)) { setMsg("❌ Please fill in all fields."); return; }
    setLoading(true); setMsg("");

    if (forgot) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
      setLoading(false);
      setMsg(error ? "❌ " + error.message : "✅ Reset link sent! Check your inbox.");
      return;
    }
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password:pw });
      setLoading(false);
      if (error) { setMsg("❌ " + error.message); return; }
      setMsg("✅ Logged in! Taking you to your dashboard…");
      setTimeout(() => setPage("dashboard"), 1200);
    } else {
      const { error } = await supabase.auth.signUp({ email, password:pw });
      setLoading(false);
      if (error) { setMsg("❌ " + error.message); return; }
      setMsg("✅ Account created! Check your email to verify, then log in.");
    }
  };

  return (
    <div style={{ paddingTop:"62px", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"5rem 1.5rem" }}>
      <div style={{ width:"100%", maxWidth:"415px" }}>
        <div style={{ textAlign:"center", marginBottom:"2.25rem" }}>
          <div style={{ fontSize:"2.75rem", marginBottom:".85rem", animation:"floatAnim 3s ease-in-out infinite" }}>⚔️</div>
          <h1 style={{ fontFamily:"Cinzel,serif", fontSize:"1.95rem", fontWeight:800 }}><span className="gold-text">StepQuest</span></h1>
          <p style={{ fontFamily:"Crimson Pro,serif", fontSize:".98rem", color:"#71717a", marginTop:".35rem" }}>Your quest continues here</p>
        </div>

        {!forgot && (
          <div style={{ display:"flex", background:"rgba(0,0,0,.32)", borderRadius:"100px", padding:".22rem", marginBottom:"1.85rem", border:"1px solid rgba(251,191,36,.14)" }}>
            {["login","signup"].map(m => (
              <button key={m} onClick={()=>{setMode(m);setMsg("");}} style={{ flex:1, padding:".62rem", border:"none", borderRadius:"100px", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:".83rem", fontWeight:600, letterSpacing:".06em", transition:"all .2s", background:mode===m?"linear-gradient(135deg,#fbbf24,#d97706)":"transparent", color:mode===m?"#09090b":"#a1a1aa" }}>
                {m==="login"?"Log In":"Sign Up"}
              </button>
            ))}
          </div>
        )}

        <div className="card" style={{ padding:"1.85rem" }}>
          {forgot && (
            <div style={{ marginBottom:"1.25rem" }}>
              <button onClick={()=>{setForgot(false);setMsg("");}} style={{ background:"none", border:"none", color:"#71717a", cursor:"pointer", fontFamily:"Cinzel,serif", fontSize:".78rem", letterSpacing:".08em" }}>← Back to login</button>
              <h2 style={{ fontFamily:"Cinzel,serif", fontSize:"1.1rem", fontWeight:700, color:GOLD, marginTop:".85rem" }}>Reset Password</h2>
            </div>
          )}
          <MsgBox msg={msg} />
          <div style={{ display:"flex", flexDirection:"column", gap:".9rem" }}>
            <div>
              <label style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", letterSpacing:".1em", color:GOLD, display:"block", marginBottom:".45rem" }}>EMAIL</label>
              <input type="email" placeholder="hero@stepquest.app" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            {!forgot && (
              <div>
                <label style={{ fontFamily:"Cinzel,serif", fontSize:".72rem", letterSpacing:".1em", color:GOLD, display:"block", marginBottom:".45rem" }}>PASSWORD</label>
                <input type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} />
              </div>
            )}
            {mode==="login" && !forgot && (
              <div style={{ textAlign:"right" }}>
                <button style={{ background:"none", border:"none", color:"#71717a", fontFamily:"Crimson Pro,serif", fontSize:".9rem", cursor:"pointer" }}
                  onMouseOver={e=>e.target.style.color=GOLD} onMouseOut={e=>e.target.style.color="#71717a"}
                  onClick={()=>{setForgot(true);setMsg("");}}>Forgot password?</button>
              </div>
            )}
            <button className="gold-btn" style={{ width:"100%", padding:".95rem", fontSize:".98rem", marginTop:".35rem" }} onClick={submit} disabled={loading}>
              {loading?"⏳ One moment…":forgot?"📧 Send Reset Link":mode==="login"?"⚔️ Enter the Realm":"🌟 Join the Quest"}
            </button>
          </div>
        </div>

        {!forgot && (
          <p style={{ textAlign:"center", fontFamily:"Crimson Pro,serif", fontSize:".93rem", color:"#52525b", marginTop:"1.35rem" }}>
            {mode==="login"?"New hero? ":"Already adventuring? "}
            <button onClick={()=>{setMode(mode==="login"?"signup":"login");setMsg("");}} style={{ background:"none", border:"none", color:GOLD, cursor:"pointer", fontFamily:"Crimson Pro,serif", fontSize:".93rem", fontWeight:600 }}>
              {mode==="login"?"Create your account →":"Log in →"}
            </button>
          </p>
        )}
        <p style={{ textAlign:"center", fontFamily:"Crimson Pro,serif", fontSize:".82rem", color:"#3f3f46", marginTop:".65rem" }}>Same credentials as the mobile app</p>
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  const { session, logout } = useAuth();
  const cols = [
    { title:"Product", links:[{l:"Home",p:"home"},{l:"Features",p:"features"},{l:"Community",p:"community"}] },
    { title:"Support",  links:[{l:"FAQ",p:"support"},{l:"AI Chat",p:"chat"}] },
    { title:"Account",  links: session ? [{l:"Dashboard",p:"dashboard"},{l:"Log Out",p:"__logout"}] : [{l:"Log In",p:"login"},{l:"Sign Up",p:"login"}] },
  ];
  const handle = p => p==="__logout" ? logout() : setPage(p);
  return (
    <footer style={{ borderTop:"1px solid rgba(251,191,36,.07)", padding:"3.75rem 2rem 2.25rem", background:"rgba(9,9,11,.75)" }}>
      <div style={{ maxWidth:"980px", margin:"0 auto" }}>
        <div className="ft-grid" style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:"2.75rem", marginBottom:"2.75rem" }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:".65rem", marginBottom:"1.1rem", cursor:"pointer" }} onClick={() => setPage("home")}>
              <span style={{ fontSize:"1.35rem" }}>⚔️</span>
              <span style={{ fontFamily:"Cinzel,serif", fontWeight:800, fontSize:"1.05rem", background:"linear-gradient(135deg,#fef08a,#fbbf24)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>StepQuest</span>
            </div>
            <p style={{ fontFamily:"Crimson Pro,serif", fontSize:".93rem", color:"#52525b", lineHeight:1.75, maxWidth:"275px" }}>Gamified fitness for those who refuse to merely track steps. Every stride is a legend in the making.</p>
          </div>
          {cols.map((col,i) => (
            <div key={i}>
              <h4 style={{ fontFamily:"Cinzel,serif", fontSize:".76rem", fontWeight:700, color:GOLD, letterSpacing:".13em", textTransform:"uppercase", marginBottom:"1.1rem" }}>{col.title}</h4>
              <div style={{ display:"flex", flexDirection:"column", gap:".65rem" }}>
                {col.links.map((l,j) => (
                  <button key={j} style={{ background:"none", border:"none", color:"#71717a", fontFamily:"Crimson Pro,serif", fontSize:".98rem", textAlign:"left", cursor:"pointer", transition:"color .2s", padding:0 }}
                    onClick={() => handle(l.p)} onMouseOver={e=>e.target.style.color="#f4f4f5"} onMouseOut={e=>e.target.style.color="#71717a"}>{l.l}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:"1.75rem", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:".85rem" }}>
          <p style={{ fontFamily:"Crimson Pro,serif", fontSize:".85rem", color:"#3f3f46" }}>© 2026 StepQuest. All rights reserved.</p>
          <p style={{ fontFamily:"Crimson Pro,serif", fontSize:".85rem", color:"#3f3f46" }}>Built for fitness adventurers everywhere</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,        setPage]        = useState("home");
  const [mob,         setMob]         = useState(false);
  const [session,     setSession]     = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (!s) setPage("home");
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setPage("home");
  };

  const navTo = p => { setPage(p); setMob(false); window.scrollTo({ top:0, behavior:"smooth" }); };

  if (authLoading) {
    return (
      <div style={{ background:BG, minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"1rem" }}>
        <style>{CSS}</style>
        <div style={{ fontSize:"3rem", animation:"floatAnim 2s ease-in-out infinite" }}>⚔️</div>
        <Spinner />
        <p style={{ fontFamily:"Cinzel,serif", color:GOLD, fontSize:".85rem", letterSpacing:".15em" }}>LOADING REALM…</p>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{ session, logout }}>
      <div style={{ fontFamily:"'Crimson Pro',Georgia,serif", background:BG, minHeight:"100vh", color:"#f4f4f5", position:"relative", overflowX:"hidden" }}>
        <style>{CSS}</style>

        {/* Star field */}
        <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
          {STARS.map(s => <div key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:`${s.size}px`, height:`${s.size}px`, borderRadius:"50%", background:GOLD, animation:`twinkle ${s.dur}s ${s.delay}s infinite` }} />)}
        </div>

        <div style={{ position:"relative", zIndex:1 }}>
          <Nav page={page} setPage={navTo} mob={mob} setMob={setMob} />
          {page==="home"      && <HomePage      setPage={navTo} />}
          {page==="features"  && <FeaturesPage  setPage={navTo} />}
          {page==="community" && <CommunityPage />}
          {page==="support"   && <SupportPage   setPage={navTo} />}
          {page==="chat"      && <ChatPage />}
          {page==="dashboard" && <DashboardPage setPage={navTo} />}
          {page==="login"     && <LoginPage     setPage={navTo} />}
          {page !== "chat" && <Footer setPage={navTo} />}
        </div>
      </div>
    </AuthCtx.Provider>
  );
}
