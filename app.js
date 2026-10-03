/* Sổ tay TOEIC 650 — app logic */
(() => {
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const LET = ["A","B","C","D"];
const ICON = {
  home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  parts:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/></svg>',
  book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z"/><path d="M5 18a2 2 0 0 1 2-2h12"/></svg>',
  ear:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.5"/><rect x="17" y="14" width="4" height="7" rx="1.5"/></svg>',
  chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V11M10 20V5M16 20v-6M2 20h20"/></svg>',
  play:'<svg viewBox="0 0 24 24" aria-hidden="true" class="fill"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
  x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  spk:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  flame:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.6 2.2 3C11 8.5 11 6 12 3z"/></svg>'
};

/* ---------------- storage ---------------- */
const KEY = "t650v3";
let S = {};
try { S = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { S = {}; }
S = Object.assign({ ans:{}, log:{}, known:{}, mine:{}, path:{}, goal:30, rate:0.85, voice:null, autoplay:true, level:"b", view:"home", gseg:"tense", kseg:"vocab", vgroup:"*", openTense:null, openTopic:null }, S);
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
const pad = n => String(n).padStart(2, "0");
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const dayLog = k => S.log[k] || { sec:0, q:0, ok:0 };
const today = () => { const k = dkey(); return S.log[k] || (S.log[k] = { sec:0, q:0, ok:0 }); };
const WD = ["CN","T2","T3","T4","T5","T6","T7"];

/* ---------------- registry ---------------- */
const U = {}; const POOL = { p1:[],p2:[],p3:[],p4:[],p5:[],p6:[],p7:[],tense:{},gram:{},dict:[],pair:[],ed:[],se:[],stress:[],vm:[],vs:[],card:[] };
function addU(arr, u) { u.ids = u.qs ? u.qs.map(q => q.id) : [u.id]; U[u.id] = u; arr.push(u); return u; }
const mq = (id, t, lv, extra) => Object.assign({ kind:"mcq", id, stem:t[0], opts:t[1], a:t[2], why:t[3], ns:t[4] === "ns", lv }, extra || {});
const TNAME = {}; TENSE_REF.forEach(t => TNAME[t.id] = t.name); TNAME.tc = "Mệnh đề thời gian"; TNAME.mix = "Tổng hợp";

const T = typeof TR === "object" ? TR : { g:{}, p3:[], p4:[], p7:[] };
const tg = (o, ...ks) => { for (const k of ks) { if (o == null) return undefined; o = o[k]; } return o; };
P1.forEach((t,i) => addU(POOL.p1, { kind:"p1", id:"p1."+i, scene:t[0], opts:t[1], a:t[2], why:t[3], lv:t[4], tr:tg(T,"p1",i), topic:"p1" }));
P2.forEach((t,i) => addU(POOL.p2, { kind:"p2", id:"p2."+i, q:t[0], opts:t[1], a:t[2], why:t[3], lv:t[4], tr:tg(T,"p2",i), topic:"p2" }));
[["p3",P3,3],["p4",P4,4]].forEach(([k,arr,part]) => arr.forEach((s,i) => addU(POOL[k], { kind:"set", part, id:k+"."+i, lv:s.lv, title:s.title, lines:s.lines, graphic:s.graphic, trLines:tg(T,k,i,"l"), qs:s.qs.map((q,j) => mq(k+"."+i+"."+j, q, s.lv, { tr:tg(T,k,i,"q",j), stemEn:true, topic:"p34" })) })));
P6.forEach((s,i) => addU(POOL.p6, { kind:"set", part:6, id:"p6."+i, lv:s.lv, title:s.title, text:s.text, trText:tg(T,"p6",i), qs:s.qs.map((q,j) => mq("p6."+i+"."+j, ["Chỗ trống " + q[0], q[1], q[2], q[3]], s.lv, { blank:j+1, topic:"p6" })) }));
P7.forEach((s,i) => addU(POOL.p7, { kind:"set", part:7, id:"p7."+i, lv:s.lv, title:s.title, docs:s.docs, trDocs:tg(T,"p7",i,"d"), qs:s.qs.map((q,j) => mq("p7."+i+"."+j, q, s.lv, { tr:tg(T,"p7",i,"q",j), stemEn:true, topic:"p7" })) }));
GRAM.forEach(t => { POOL.gram[t.id] = []; t.qs.forEach((q,i) => POOL.p5.push(addU(POOL.gram[t.id], mq("g."+t.id+"."+i, q, "b", { tag:t.name, fill:true, tr:tg(T,"g",t.id,i), topic:t.id })))); });
TENSE_Q.forEach((q,i) => { const tgg = q[4]; (POOL.tense[tgg] = POOL.tense[tgg] || []); POOL.p5.push(addU(POOL.tense[tgg], mq("t."+i, q.slice(0,4), "b", { tag:"Thì · " + TNAME[tgg], fill:true, tr:tg(T,"t",i), topic: tgg === "pv" ? "pass" : "tense" }))); });
P5V.forEach((q,i) => addU(POOL.p5, mq("v5."+i, q, "b", { tag:"Từ vựng", fill:true, tr:tg(T,"v5",i), topic:"v5" })));
P5A.forEach((q,i) => addU(POOL.p5, mq("a5."+i, q, "a", { tag:"700+", fill:true, tr:tg(T,"a5",i), topic:"a5" })));
POOL.found = (typeof FQ === "object" ? FQ : []).map((q,i) => addU([], mq("f."+i, q, "b", { tag:"Nền tảng", topic:"found" })));
DICT.forEach((d,i) => addU(POOL.dict, { kind:"dict", id:"d."+i, text:d[0], note:d[1], tr:tg(T,"d",i) }));
PAIRS.forEach((p,i) => addU(POOL.pair, { kind:"pair", id:"mp."+i, words:p }));
ED.forEach((e,i) => addU(POOL.ed, { kind:"end", id:"ed."+i, word:e[0], ans:e[1], last:e[2], type:"ed" }));
SE.forEach((e,i) => addU(POOL.se, { kind:"end", id:"se."+i, word:e[0], ans:e[1], last:e[2], type:"s" }));
STRESS.forEach((s,i) => addU(POOL.stress, { kind:"stress", id:"st."+i, syl:s[0].split("-"), idx:s[1] }));
const ALLV = Object.entries(V).flatMap(([g,l]) => l.map(w => ({ w:w[0], ipa:w[1], pos:w[2], m:w[3], n:w[4], g })));
const VMAP = {}; ALLV.forEach(x => VMAP[x.w.toLowerCase()] = x);
function lookup(w) {
  w = w.toLowerCase();
  const c = [w, w.replace(/'s$/, ""), w.replace(/ies$/, "y"), w.replace(/ied$/, "y"), w.replace(/es$/, ""), w.replace(/s$/, ""), w.replace(/ed$/, ""), w.replace(/d$/, ""), w.replace(/ing$/, ""), w.replace(/ing$/, "e"), w.replace(/ly$/, "")];
  for (const k of c) if (VMAP[k]) return VMAP[k];
  return null;
}
function mineV(w) { const r = S.mine[w] || {}, k = VMAP[w]; return { w, ipa: k ? k.ipa : "", pos: k ? k.pos : "", m: r.m || (k ? k.m : ""), n: r.ctx || "", g:"Từ của tôi", d:r.d || "" }; }
function mineUnits(kind) {
  return Object.keys(S.mine).map(w => {
    const v = mineV(w); if (!v.m) return null;
    const id = (kind === "vs" ? "mys." : "my.") + w;
    const u = U[id] || { kind: kind === "vs" ? "vspell" : "vmean", id, ids:[id] }; u.v = v; U[id] = u; return u;
  }).filter(Boolean);
}
ALLV.forEach(x => { addU(POOL.vm, { kind:"vmean", id:"vm."+x.w, v:x }); addU(POOL.vs, { kind:"vspell", id:"vs."+x.w, v:x }); });
const tenseAll = () => Object.values(POOL.tense).flat();
const gramAll = () => Object.values(POOL.gram).flat();
const allQIds = units => units.flatMap(u => u.ids);

const SEC = { p1:"Part 1",p2:"Part 2",p3:"Part 3",p4:"Part 4",p5:"Part 5 · từ vựng",p6:"Part 6",p7:"Part 7",tense:"Các thì",gram:"Chủ đề ngữ pháp",pron:"Phát âm",vocab:"Từ vựng",dict:"Chép chính tả" };
const PFX = { f:"gram",my:"vocab",mys:"vocab",d1:"dict",p1:"p1",p2:"p2",p3:"p3",p4:"p4",v5:"p5",a5:"p5",p6:"p6",p7:"p7",t:"tense",g:"gram",mp:"pron",ed:"pron",se:"pron",st:"pron",vm:"vocab",vs:"vocab",d:"dict" };
const secOf = id => PFX[id.split(".")[0]] || "other";
const ALLIDS = Object.values(U).flatMap(u => u.ids);
const SEC_TOTAL = {}; ALLIDS.forEach(id => { const s = secOf(id); SEC_TOTAL[s] = (SEC_TOTAL[s] || 0) + 1; });

function stat(ids) { let n = 0, ok = 0; ids.forEach(id => { const r = S.ans[id]; if (r) { n++; if (r.ok) ok++; } }); return { n, ok, total:ids.length, pct: n ? Math.round(ok / n * 100) : null }; }
function ustatus(u) { let seen = false, wrong = false; u.ids.forEach(id => { const r = S.ans[id]; if (r) { seen = true; if (!r.ok) wrong = true; } }); return !seen ? 0 : wrong ? 1 : 2; }
function pick(pool, n, lv) {
  let p = pool;
  if (lv && lv !== "all") p = pool.filter(u => !u.lv || u.lv === lv);
  return shuffle(p).sort((a,b) => ustatus(a) - ustatus(b)).slice(0, n);
}
function rec(id, ok) { const r = S.ans[id] || { n:0 }; r.ok = ok; r.n++; r.d = dkey(); S.ans[id] = r; const t = today(); t.q++; if (ok) t.ok++; save(); }

/* ---------------- speech ---------------- */
const synth = window.speechSynthesis;
let voices = [];
function loadVoices() {
  if (!synth) return;
  const rank = v => /en[-_]US/i.test(v.lang) ? 0 : /en[-_]GB/i.test(v.lang) ? 1 : /en[-_](AU|CA)/i.test(v.lang) ? 2 : 3;
  voices = synth.getVoices().filter(v => /^en[-_]/i.test(v.lang)).sort((a,b) => rank(a) - rank(b) || (b.localService - a.localService));
  const sel = $("#voiceSel"); if (sel) fillVoiceSel(sel);
}
function fillVoiceSel(sel) {
  if (window.AUDIDX && Object.keys(window.AUDIDX).length) { sel.innerHTML = `<option>Giọng thu sẵn: nữ Mỹ · nam Mỹ · nam Anh</option>`; sel.disabled = true; return; }
  sel.innerHTML = voices.length ? voices.map((v,i) => `<option value="${i}">${esc(v.name)} · ${esc(v.lang)}</option>`).join("") : `<option>Giọng mặc định</option>`;
  if (S.voice != null && S.voice < voices.length) sel.value = S.voice;
}
if (synth) { loadVoices(); synth.onvoiceschanged = loadVoices; }
const vMain = () => voices[S.voice ?? 0] || voices[0] || null;
const vOther = (m, skip) => voices.find(v => v !== m && v !== skip && v.lang === (m && m.lang)) || voices.find(v => v !== m && v !== skip) || m;
function ttsSpeak(items, rate) {
  if (!synth || !voices.length) return false;
  synth.cancel();
  const W = vMain(), M = vOther(W), M2 = vOther(W, M);
  let i = 0;
  const next = () => {
    if (i >= items.length) return;
    const it = items[i++]; const u = new SpeechSynthesisUtterance(it.text);
    const v = it.who === "M" ? M : it.who === "M2" ? M2 : W;
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
    u.rate = rate || S.rate;
    if (it.who === "M" && M === W) u.pitch = 0.7;
    if (it.who === "M2" && (M2 === W || M2 === M)) u.pitch = 1.3;
    u.onend = () => setTimeout(next, it.pause ?? 350);
    synth.speak(u);
  };
  next(); return true;
}
/* --- recorded audio (audio-*.js packs) --- */
const VW = { W:"af_heart", M:"am_michael", M2:"bm_george" };
const AIDX = window.AUDIDX || {}; window.AUDP = window.AUDP || {};
const HAS_REC = Object.keys(AIDX).length > 0;
const packLoads = {};
function loadPack(p) {
  if (window.AUDP[p]) return Promise.resolve();
  if (packLoads[p]) return packLoads[p];
  packLoads[p] = new Promise(res => { const sc = document.createElement("script"); sc.src = "audio-" + p + ".js"; sc.onload = () => res(); sc.onerror = () => { delete packLoads[p]; res(); }; document.head.appendChild(sc); });
  return packLoads[p];
}
function clipFor(text, who) {
  const t = String(text).trim();
  for (const k of [(VW[who] || "af_heart") + "|" + t, "af_heart|" + t, "am_michael|" + t]) if (k in AIDX) return { k, p:AIDX[k] };
  return null;
}
const player = new Audio(); player.preload = "auto";
const SILENT = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//OEwAAAAAAAAAAAAEluZm8AAAAPAAAABwAAA2AAVVVVVVVVVVVVVVVVVVVxcXFxcXFxcXFxcXFxcY6Ojo6Ojo6Ojo6Ojo6Oqqqqqqqqqqqqqqqqqqqqx8fHx8fHx8fHx8fHx8fj4+Pj4+Pj4+Pj4+Pj4///////////////////AAAAAExhdmM2MC4zMQAAAAAAAAAAAAAAACQEIAAAAAAAAANgmVBi7QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//NExAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExFMAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKYAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVTEFNRTMu//NExKwAAANIAAAAADEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//NExKwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";
let seqId = 0, audioBusy = false, unlocked = false;
const unlock = () => { if (unlocked) return; unlocked = true; try { player.src = SILENT; const pr = player.play(); if (pr) pr.catch(() => { unlocked = false; }); } catch (e) { unlocked = false; } };
addEventListener("pointerdown", unlock, true); addEventListener("keydown", unlock, true);
function playClip(src, rate) {
  return new Promise(res => {
    player.onended = player.onerror = () => res(true);
    player.src = src; player.playbackRate = rate; try { player.preservesPitch = true; player.webkitPreservesPitch = true; } catch (e) {}
    const pr = player.play(); if (pr) pr.catch(() => res(false));
  });
}
async function speak(items, rate) {
  stopSpeech();
  const id = ++seqId; rate = rate || S.rate;
  const list = items.map(it => ({ it, c: clipFor(it.text, it.who) }));
  if (list.some(x => !x.c)) {
    if (ttsSpeak(items, rate)) return;
    if (list.every(x => !x.c)) { toast("Chưa có âm thanh cho mục này."); return; }
  }
  await Promise.all([...new Set(list.filter(x => x.c).map(x => x.c.p))].map(loadPack));
  if (id !== seqId) return;
  audioBusy = true;
  for (const x of list) {
    if (id !== seqId) break;
    if (!x.c) continue;
    const b64 = (window.AUDP[x.c.p] || {})[x.c.k];
    if (!b64) continue;
    const ok = await playClip("data:audio/mpeg;base64," + b64, rate);
    if (!ok) { if (id === seqId) toast("Chạm nút ▶ để nghe."); break; }
    if (id !== seqId) break;
    await new Promise(r => setTimeout(r, x.it.pause ?? 300));
  }
  if (id === seqId) audioBusy = false;
}
const say = (t, r) => speak([{ text:t }], r);
const stopSpeech = () => { seqId++; audioBusy = false; try { player.pause(); } catch (e) {} if (synth) synth.cancel(); };

/* ---------------- time tracking ---------------- */
let lastAct = Date.now();
["pointerdown","keydown","touchstart","wheel"].forEach(ev => addEventListener(ev, () => lastAct = Date.now(), { passive:true }));
let tick = 0;
setInterval(() => {
  if (document.hidden || !SES || SES.done) return;
  if (Date.now() - lastAct < 90000 || audioBusy || (synth && synth.speaking)) {
    today().sec += 5; tick++;
    if (tick % 6 === 0) save();
  }
}, 5000);
addEventListener("visibilitychange", () => { if (document.hidden) save(); });
addEventListener("pagehide", save);

function streak() {
  const active = k => { const l = S.log[k]; return l && (l.sec >= 300 || l.q >= 10); };
  const d = new Date(); let n = 0;
  if (!active(dkey(d))) d.setDate(d.getDate() - 1);
  while (active(dkey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function bestStreak() {
  const keys = Object.keys(S.log).filter(k => { const l = S.log[k]; return l.sec >= 300 || l.q >= 10; }).sort();
  let best = 0, cur = 0, prev = null;
  keys.forEach(k => { const d = new Date(k + "T12:00:00"); if (prev && (d - prev) / 864e5 === 1) cur++; else cur = 1; best = Math.max(best, cur); prev = d; });
  return best;
}
const mins = s => Math.round(s / 60);
const fmtDur = s => { const h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60); return h ? `${h} giờ ${m} phút` : `${m} phút`; };

/* ---------------- toast ---------------- */
let toastT;
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }

/* ======================================================================
   SESSION ENGINE
   ====================================================================== */
let SES = null;
const isAudioUnit = u => ["p1","p2","dict","pair","end","stress","vmean","vspell"].includes(u.kind) || (u.kind === "set" && u.lines);
function startSession(title, units, opts = {}) {
  units = units.filter(Boolean);
  if (!units.length) { toast("Mục này chưa có câu để luyện."); return; }
  SES = { title, units, i:0, res:{}, t0:Date.now(), opts };
  const el = $("#session"); el.hidden = false; document.body.classList.add("lock");
  renderUnit();
}
function endSession() { stopSpeech(); closeSheet(); $("#session").hidden = true; document.body.classList.remove("lock"); SES = null; render(); }
function renderUnit() {
  stopSpeech();
  const u = SES.units[SES.i], n = SES.units.length, last = SES.i === n - 1;
  const el = $("#session");
  el.innerHTML = `<div class="ses">
    <header class="ses-top">
      <button class="icon-btn" id="sesX" aria-label="Kết thúc">${ICON.x}</button>
      <div class="ses-mid"><div class="ses-title">${esc(SES.title)}</div><div class="ses-bar"><span style="width:${(SES.i / n) * 100}%"></span></div></div>
      <span class="ses-count">${SES.i + 1}/${n}</span>
      ${isAudioUnit(u) ? `<button class="rate-chip" id="rateChip" aria-label="Tốc độ đọc">${S.rate}×</button>` : ""}
    </header>
    <div class="ses-scroll" id="sesScroll"><div class="ses-body" id="sesBody"></div></div>
    <footer class="ses-foot">
      ${u.kind === "card" || u.kind === "lesson" ? "" : `<button class="btn ghost" id="sesSkip">Bỏ qua</button>`}
      <button class="btn pri big" id="sesNext" ${u.kind === "card" ? "hidden" : u.kind === "lesson" ? "" : "disabled"}>${u.kind === "lesson" ? "Bắt đầu luyện" : last ? "Xem kết quả" : "Tiếp tục"} ${ICON.arrow}</button>
    </footer></div>`;
  $("#sesX").onclick = () => Object.keys(SES.res).length ? finish() : endSession();
  const rc = $("#rateChip"); if (rc) rc.onclick = () => { const r = [0.6, 0.75, 0.85, 1]; S.rate = r[(r.indexOf(S.rate) + 1) % r.length] || 0.85; rc.textContent = S.rate + "×"; save(); };
  const skip = $("#sesSkip"); if (skip) skip.onclick = next;
  $("#sesNext").onclick = next;
  const ans = (id, ok) => {
    if (!(id in SES.res)) { SES.res[id] = ok; rec(id, ok); }
    if (u.ids.every(x => x in SES.res)) { const b = $("#sesNext"); b.disabled = false; if (skip) skip.hidden = true; }
  };
  RENDER[u.kind]($("#sesBody"), u, ans);
  $("#sesScroll").scrollTop = 0;
}
function next() { if (!SES) return; if (SES.i < SES.units.length - 1) { SES.i++; renderUnit(); } else finish(); }
addEventListener("keydown", e => {
  if (!SES || $("#session").hidden) return;
  if (e.key === "Enter" && document.activeElement?.tagName !== "INPUT") { const b = $("#sesNext"); if (b && !b.disabled && !b.hidden) { e.preventDefault(); b.click(); } }
  if (e.key === "Escape") { if (!$("#sheet").hidden) closeSheet(); else $("#sesX")?.click(); }
});
function finish() {
  stopSpeech(); SES.done = true; save(); closeSheet();
  const ids = Object.keys(SES.res), ok = ids.filter(i => SES.res[i]).length, secs = Math.round((Date.now() - SES.t0) / 1000);
  let pathNote = "", nextLesson = null;
  if (SES.opts.path && ids.length) {
    const pid = SES.opts.path, lid = SES.opts.lesson, pr = S.path[pid] || (S.path[pid] = {}), prev = pr[lid] || { best:0, n:0, pass:false };
    const p = Math.round(ok / ids.length * 100), pass = p >= PASS;
    pr[lid] = { best:Math.max(prev.best, p), n:prev.n + 1, d:dkey(), pass:prev.pass || pass }; save();
    const L = PATHS[pid].lessons, idx = L.findIndex(x => x.id === lid);
    nextLesson = pass && idx < L.length - 1 ? L[idx + 1] : null;
    pathNote = pass ? `<div class="card pass-card ok"><b>Đã qua bài “${esc(L[idx].t)}”.</b><span>${nextLesson ? `Bài tiếp theo: ${esc(nextLesson.t)}` : "Bạn đã hoàn thành cả lộ trình!"} · ${pathDone(pid)}/${L.length} bài</span></div>`
      : `<div class="card pass-card no"><b>Chưa qua bài — cần đạt ${PASS}%.</b><span>Tiến độ đã lưu. Xem lại phần lý thuyết rồi làm lại bài này.</span></div>`;
  }
  if (!ids.length) {
    $("#session").innerHTML = `<div class="ses"><div class="ses-scroll"><div class="ses-body done"><h2 class="h2c">Xong ${SES.i + 1} thẻ</h2><p class="muted c">Đã thuộc ${ALLV.filter(x => S.known[x.w]).length}/${ALLV.length} từ. ${mins(today().sec)} phút học hôm nay.</p></div></div><footer class="ses-foot"><button class="btn pri big" id="doneBtn">Hoàn thành</button></footer></div>`;
    $("#doneBtn").onclick = endSession; return;
  }
  const pct = ids.length ? Math.round(ok / ids.length * 100) : 0;
  const wrongUnits = SES.units.filter(u => u.ids.some(id => SES.res[id] === false));
  const title = SES.title;
  const wrongList = wrongUnits.slice(0, 12).map(u => `<li>${esc(unitLabel(u))}</li>`).join("");
  $("#session").innerHTML = `<div class="ses"><div class="ses-scroll"><div class="ses-body done">
    <div class="done-ring">${ringSVG(pct / 100, 132, 11)}<div class="done-pct"><b>${pct}%</b><span>đúng</span></div></div>
    <h2 class="h2c">${pct >= 85 ? "Rất tốt!" : pct >= 65 ? "Khá ổn, tiếp tục nhé" : "Cần ôn lại thêm"}</h2>
    <p class="muted c">${esc(title)}</p>
    <div class="stat3"><div><b>${ok}/${ids.length}</b><span>câu đúng</span></div><div><b>${Math.floor(secs / 60)}:${pad(secs % 60)}</b><span>thời gian</span></div><div><b>${mins(today().sec)}</b><span>phút hôm nay</span></div></div>
    ${pathNote}
    ${wrongUnits.length ? `<div class="card"><div class="card-h">Cần xem lại</div><ul class="wl">${wrongList}</ul></div>` : ""}
    </div></div>
    <footer class="ses-foot">${wrongUnits.length ? `<button class="btn ghost" id="redo">Làm lại câu sai</button>` : ""}${nextLesson ? `<button class="btn ghost" id="doneBtn">Để sau</button><button class="btn pri big" id="nextL">Học bài tiếp ${ICON.arrow}</button>` : `<button class="btn pri big" id="doneBtn">Hoàn thành</button>`}</footer></div>`;
  $("#doneBtn").onclick = endSession;
  const nl = $("#nextL"); if (nl) { const pid = SES.opts.path; nl.onclick = () => startLesson(pid, nextLesson.id); }
  const r = $("#redo"); if (r) r.onclick = () => startSession(title + " · làm lại", wrongUnits);
}
function unitLabel(u) {
  switch (u.kind) {
    case "mcq": return u.stem;
    case "p1": return "Part 1 · " + u.scene;
    case "p2": return "Part 2 · " + u.q;
    case "set": return `Part ${u.part} · ${u.title}`;
    case "dict": return u.text;
    case "pair": return u.words.join(" / ");
    case "end": return u.word;
    case "stress": return u.syl.join("");
    case "vmean": case "vspell": return u.v.w + " — " + u.v.m;
    default: return "";
  }
}

/* ---------- building blocks ---------- */
function mcqBlock(q, onAns, o = {}) {
  const order = q.ns ? q.opts.map((_, i) => i) : shuffle(q.opts.map((_, i) => i));
  const ck = order.indexOf(q.a);
  const d = document.createElement("div"); d.className = "mq";
  d.innerHTML = (o.noStem ? "" : `<p class="stem">${o.num ? `<span class="qn">${o.num}</span>` : ""}${esc(q.stem)}</p>`)
    + `<div class="opts${o.compact ? " compact" : ""}">${order.map((oi, k) => `<button class="opt" data-k="${k}"><span class="bub">${LET[k]}</span><span class="ot">${o.hidden ? `<i class="muted">Đáp án ${LET[k]}</i>` : esc(q.opts[oi])}</span></button>`).join("")}</div><div class="fb"></div>`;
  $$(".opt", d).forEach(b => b.onclick = () => {
    if (d.dataset.done) return; d.dataset.done = "1";
    const k = +b.dataset.k, ok = k === ck;
    $$(".opt", d).forEach((x, j) => { x.disabled = true; if (o.hidden) x.querySelector(".ot").textContent = q.opts[order[j]]; if (j === ck) x.classList.add("right"); else if (j === k) x.classList.add("wrong"); });
    d.querySelector(".fb").innerHTML = `<div class="why ${ok ? "ok" : "no"}"><b>${ok ? "Chính xác." : "Chưa đúng — đáp án " + LET[ck] + "."}</b> ${termify(q.why || "")}</div>` + howBlock(q.topic, !ok)
      + (q.fill ? trBlock(q.stem.replace(/_{3,}/, q.opts[q.a]), q.tr) : q.stemEn && q.tr ? trBlock(q.stem, q.tr, "Câu hỏi") : "");
    onAns(q.id, ok, k);
    o.after && o.after(ok);
  });
  return { el:d, order };
}
const _TL = typeof TERM_LINKS === "object" ? TERM_LINKS.slice().sort((a, b) => b[0].length - a[0].length) : [];
const _TRE = _TL.length ? new RegExp("(" + _TL.map(x => x[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "giu") : null;
function termify(str) {
  if (!_TRE || !str) return str || "";
  const used = new Set();
  return String(str).replace(_TRE, m => { const hit = _TL.find(x => x[0].toLowerCase() === m.toLowerCase()); if (!hit || used.has(hit[1])) return m; used.add(hit[1]); return `<button class="term" data-term="${hit[1]}">${m}</button>`; });
}
function howBlock(topic, open) {
  const st = (typeof STEPS === "object" && STEPS[topic]) || null; if (!st) return "";
  return `<details class="how"${open ? " open" : ""}><summary>Cách xác định từng bước</summary><ol>${st.map(x => `<li>${termify(x)}</li>`).join("")}</ol></details>`;
}
function termBody(key) {
  const t = TERMS[key]; if (!t) return "";
  return `<p class="t-def">${esc(t.def)}</p><div class="t-how"><b>Cách nhận diện</b><ol>${t.how.map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>${t.ex.map(e => `<div class="t-ex"><code>${esc(e[0])}</code><span>${esc(e[1])}</span></div>`).join("")}`;
}
function openTerm(key) {
  const t = TERMS[key]; if (!t) return;
  const el = $("#sheet");
  el.innerHTML = `<div class="sheet-bg" data-close></div><div class="sheet-card term-card" role="dialog" aria-label="${esc(t.name)}"><div class="row between"><b class="sw">${esc(t.name)}</b><button class="icon-btn sm" data-close aria-label="Đóng">${ICON.x}</button></div><div class="term-scroll">${termBody(key)}</div></div>`;
  el.hidden = false; $$("[data-close]", el).forEach(x => x.onclick = closeSheet);
}
document.addEventListener("click", e => { const b = e.target.closest(".term"); if (!b) return; e.preventDefault(); e.stopPropagation(); openTerm(b.dataset.term); }, true);
function tapHTML(text) {
  return String(text).split(/([A-Za-z][A-Za-z’'-]*[A-Za-z]|[A-Za-z])/).map((p, i) => i % 2 ? `<button class="w${isSaved(p) ? " saved" : ""}" data-w="${esc(p)}">${esc(p)}</button>` : esc(p)).join("");
}
const normW = w => w.toLowerCase().replace(/’/g, "'");
function isSaved(w) { w = normW(w); if (S.mine[w]) return true; const k = lookup(w); return !!(k && S.mine[k.w.toLowerCase()]); }
function ctxSentence(text, word) {
  const parts = String(text).replace(/\s+/g, " ").split(/(?<=[.!?])\s+/);
  const re = new RegExp("\\b" + word.replace(/[^A-Za-z'-]/g, "") + "\\b", "i");
  return (parts.find(p => re.test(p)) || parts[0] || "").trim().slice(0, 240);
}
/* ---------- word sheet ---------- */
function closeSheet() { const el = $("#sheet"); if (el) { el.hidden = true; el.innerHTML = ""; } }
function openSheet(raw, ctx) {
  const w = normW(raw), k = lookup(w), key = k ? k.w.toLowerCase() : w, saved = S.mine[key];
  const el = $("#sheet");
  el.innerHTML = `<div class="sheet-bg" data-close></div><div class="sheet-card" role="dialog" aria-label="Lưu từ mới">
    <div class="row between"><div class="row gap"><b class="sw">${esc(key)}</b><button class="icon-btn spk sm" id="shSpk" aria-label="Nghe">${ICON.spk}</button></div><button class="icon-btn sm" data-close aria-label="Đóng">${ICON.x}</button></div>
    ${k ? `<div class="sh-k"><span class="ipa">/${esc(k.ipa)}/</span> <span class="pos">${esc(k.pos)}</span>${key !== w ? ` <span class="muted small">· từ bạn chạm: ${esc(w)}</span>` : ""}</div>` : ""}
    <label class="sh-l" for="shM">Nghĩa tiếng Việt</label>
    <input class="inp" id="shM" value="${esc(saved?.m || k?.m || "")}" placeholder="Ghi nghĩa của từ (có thể để trống, ghi sau)…" autocomplete="off">
    ${ctx ? `<p class="sh-ctx">${esc(ctx)}</p>` : ""}
    <div class="sh-actions"><a class="btn sm" href="https://translate.google.com/?sl=en&tl=vi&text=${encodeURIComponent(key)}&op=translate" target="_blank" rel="noopener">Google Dịch</a><a class="btn sm" href="https://dictionary.cambridge.org/dictionary/english-vietnamese/${encodeURIComponent(key)}" target="_blank" rel="noopener">Cambridge</a>
    <span class="grow"></span>${saved ? `<button class="btn sm bad-o" id="shDel">Bỏ lưu</button>` : ""}<button class="btn pri" id="shSave">${saved ? "Cập nhật" : "Lưu vào Từ của tôi"}</button></div></div>`;
  el.hidden = false;
  $$("[data-close]", el).forEach(x => x.onclick = closeSheet);
  $("#shSpk").onclick = () => say(key, 0.85);
  const mark = on => $$(".w").forEach(b => { if (isSaved(b.dataset.w) !== b.classList.contains("saved")) b.classList.toggle("saved"); });
  $("#shSave").onclick = () => { S.mine[key] = { m: $("#shM").value.trim(), ctx: ctx || saved?.ctx || "", d: saved?.d || dkey() }; save(); mark(); closeSheet(); toast(`Đã lưu “${key}” vào Từ của tôi`); };
  const del = $("#shDel"); if (del) del.onclick = () => { delete S.mine[key]; save(); mark(); closeSheet(); toast("Đã bỏ lưu"); };
  $("#shM").addEventListener("keydown", e => { if (e.key === "Enter") $("#shSave").click(); });
  say(key, 0.85);
}
document.addEventListener("click", e => {
  const b = e.target.closest(".w"); if (!b) return;
  const src = b.closest(".tl-en, .en") || b.closest(".tapline") || b.parentElement;
  openSheet(b.dataset.w, ctxSentence(src.textContent, b.dataset.w));
});
function trBlock(en, vi, label) {
  if (!en && !vi) return "";
  return `<div class="trn">${en ? `<div class="en tapline">${tapHTML(en)}</div>` : ""}${vi ? `<div class="vi"><span class="vk">${label || "Dịch"}</span>${esc(vi)}</div>` : ""}<div class="taphint">Chạm vào từ chưa biết để lưu vào <b>Từ của tôi</b></div></div>`;
}
function makeTappable(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest("button, .w, .vi-line, .trn, .doc-h") || !/[A-Za-z]/.test(n.nodeValue) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(n => { const span = document.createElement("span"); span.innerHTML = tapHTML(n.nodeValue); n.replaceWith(...span.childNodes); });
  $$("p, td, li", root).forEach(x => x.classList.add("tapline"));
  root.classList.add("tappable");
}
function playerEl(items, o = {}) {
  const w = document.createElement("div"); w.className = "player";
  w.innerHTML = `<button class="play-btn" aria-label="Nghe">${ICON.play}</button><div class="pl-txt"><b>${o.label || "Nghe"}</b><span>${o.sub || "Bấm để nghe lại"}</span></div>${o.slow === false ? "" : `<button class="chip" data-slow>Chậm</button>`}`;
  const run = r => speak(typeof items === "function" ? items() : items, r);
  w.querySelector(".play-btn").onclick = () => run();
  const s = w.querySelector("[data-slow]"); if (s) s.onclick = () => run(0.6);
  w.run = run;
  return w;
}
const autoplay = p => { if (S.autoplay) p.run(); };
const tagRow = (...tags) => `<div class="tagrow">${tags.filter(Boolean).map(t => `<span class="tag${t === "700+" ? " adv" : ""}">${esc(t)}</span>`).join("")}</div>`;

/* ---------- unit renderers ---------- */
const RENDER = {
  lesson(b, u) {
    b.innerHTML = tagRow("Bài " + u.num + " · " + u.pathName) + `<h2 class="ls-title">${esc(u.title)}</h2><div class="lz">${u.html}</div><p class="muted small">Đọc kỹ phần trên, sau đó bấm <b>Bắt đầu luyện</b>. Đạt từ ${PASS}% là qua bài; tiến độ được lưu tự động.</p>`;
  },
  mcq(b, u, ans) {
    b.innerHTML = tagRow(u.tag && u.tag !== "700+" ? u.tag : null, u.lv === "a" ? "700+" : null);
    b.appendChild(mcqBlock(u, ans).el);
  },
  p1(b, u, ans) {
    b.innerHTML = tagRow("Part 1", u.lv === "a" ? "700+" : null) + `<div class="scene"><div class="scene-k">Ảnh mô tả</div><p>${esc(u.scene)}</p></div>`;
    const m = mcqBlock({ ...u, stem:"" }, ans, { hidden:true, noStem:true, after:() => { m.el.querySelector(".fb").insertAdjacentHTML("beforeend", trBlock(u.opts[u.a], u.tr)); } });
    const p = playerEl(() => m.order.map((oi, k) => [{ text:LET[k] + ".", pause:120 }, { text:u.opts[oi], pause:700 }]).flat(), { label:"Nghe 4 câu mô tả", sub:"Chọn câu đúng với bức ảnh" });
    b.appendChild(p); b.appendChild(m.el); autoplay(p);
  },
  p2(b, u, ans) {
    b.innerHTML = tagRow("Part 2", u.lv === "a" ? "700+" : null);
    const holder = document.createElement("div");
    const m = mcqBlock({ ...u, stem:"" }, ans, { hidden:true, noStem:true, compact:true, after:() => {
      const tr = u.tr || [];
      holder.innerHTML = `<div class="tr tapline"><p><span class="sp">Q</span><span class="tl-en">${tapHTML(u.q)}</span></p>${tr[0] ? `<p class="vi-line">${esc(tr[0])}</p>` : ""}</div>`;
      m.el.querySelector(".fb").insertAdjacentHTML("beforeend", trBlock(u.opts[u.a], tr[1], "Đáp án đúng"));
    } });
    const p = playerEl(() => [{ text:u.q, who:"W", pause:900 }, ...m.order.map((oi, k) => [{ text:LET[k] + ".", who:"M", pause:120 }, { text:u.opts[oi], who:"M", pause:650 }]).flat()], { label:"Nghe câu hỏi và 3 đáp án", sub:"Không có chữ, giống đề thật" });
    b.appendChild(p); b.appendChild(holder); b.appendChild(m.el); autoplay(p);
  },
  set(b, u, ans) {
    let left = u.qs.length;
    const ans0 = ans; ans = (id, ok) => { ans0(id, ok); if (--left === 0) revealSet(b, u); };
    b.innerHTML = tagRow(`Part ${u.part}`, u.lv === "a" ? "700+" : null) + `<h3 class="set-title">${esc(u.title)}</h3>`;
    if (u.lines) {
      const p = playerEl(u.lines.map(l => ({ text:l[1], who:l[0], pause:450 })), { label: u.part === 3 ? "Nghe hội thoại" : "Nghe bài nói", sub:"Đọc câu hỏi trước rồi bấm nghe" });
      b.appendChild(p);
      const tb = document.createElement("details"); tb.className = "trans";
      tb.innerHTML = `<summary>Transcript & shadowing</summary>` + u.lines.map((l, i) => `<p data-li="${i}"><button class="mini-spk" data-i="${i}" aria-label="Nghe câu">${ICON.spk}</button><span class="sp">${l[0] === "W" ? "Nữ" : l[0] === "M2" ? "Nam 2" : "Nam"}</span>${esc(l[1])}</p>`).join("");
      $$(".mini-spk", tb).forEach(x => x.onclick = () => { const l = u.lines[+x.dataset.i]; speak([{ text:l[1], who:l[0] }]); });
      tb.dataset.trans = "1";
      if (u.graphic) { const g = document.createElement("div"); g.className = "graphic"; g.innerHTML = u.graphic; b.appendChild(g); }
      const qwrap = document.createElement("div"); qwrap.className = "qwrap";
      u.qs.forEach((q, j) => qwrap.appendChild(mcqBlock(q, ans, { num:j + 1 }).el));
      b.appendChild(qwrap); b.appendChild(tb);
      autoplay(p);
      return;
    }
    const doc = document.createElement("div"); doc.className = "passage";
    if (u.text) doc.innerHTML = u.text.replace(/\{(\d)\}/g, (_, n) => `<span class="blank" data-b="${n}">(${n}) ________</span>`);
    else doc.innerHTML = u.docs.map(d => `<div class="doc"><div class="doc-h">${esc(d.h)}</div>${d.html}</div>`).join("");
    b.appendChild(doc); doc.dataset.passage = "1";
    const qwrap = document.createElement("div"); qwrap.className = "qwrap";
    u.qs.forEach((q, j) => qwrap.appendChild(mcqBlock(q, (id, ok) => {
      ans(id, ok);
      if (q.blank) { const s = doc.querySelector(`[data-b="${q.blank}"]`); if (s) { s.textContent = q.opts[q.a]; s.classList.add("filled"); } }
    }, { num: u.text ? null : j + 1 }).el));
    b.appendChild(qwrap);
  },
  dict(b, u, ans) {
    b.innerHTML = tagRow("Chép chính tả") + `<p class="lead">Nghe rồi gõ lại cả câu. Nghe chậm khi cần, sau đó kiểm tra.</p>`;
    const p = playerEl([{ text:u.text }], { label:"Nghe câu", sub:"Có thể nghe nhiều lần" });
    b.appendChild(p);
    const w = document.createElement("div");
    w.innerHTML = `<textarea class="inp" rows="2" id="dictIn" placeholder="Gõ câu bạn nghe được…" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea><div class="row gap"><button class="btn pri" id="dictChk">Kiểm tra</button><button class="btn ghost" id="dictShow">Xem đáp án</button></div><div class="out"></div>`;
    b.appendChild(w);
    const chk = rev => {
      const r = diffWords(u.text, rev ? "" : $("#dictIn").value);
      w.querySelector(".out").innerHTML = `<div class="diff">${rev ? esc(u.text) : r.html}</div><div class="note">${rev ? "" : `<b>${r.hit}/${r.total} từ đúng.</b> `}${esc(u.note)}</div>` + trBlock(u.text, u.tr);
      if (!(u.id in (SES?.res || {}))) ans(u.id, !rev && r.hit === r.total);
    };
    $("#dictChk").onclick = () => chk(false); $("#dictShow").onclick = () => chk(true);
    $("#dictIn").addEventListener("keydown", e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); chk(false); } });
    autoplay(p);
  },
  pair(b, u, ans) {
    const word = u.words[Math.random() < .5 ? 0 : 1], opts = shuffle(u.words);
    b.innerHTML = tagRow("Phân biệt âm") + `<p class="lead">Bạn nghe thấy từ nào?</p>`;
    const p = playerEl([{ text:word }], { label:"Nghe từ", sub:"Có thể nghe lại" }); b.appendChild(p);
    const g = document.createElement("div"); g.className = "big-choices";
    g.innerHTML = opts.map(o => `<button class="big-choice" data-o="${esc(o)}">${esc(o)}</button>`).join("") ;
    b.appendChild(g);
    const fb = document.createElement("div"); b.appendChild(fb);
    $$(".big-choice", g).forEach(x => x.onclick = () => {
      if (g.dataset.done) return; g.dataset.done = 1;
      const ok = x.dataset.o === word;
      $$(".big-choice", g).forEach(y => { y.disabled = true; if (y.dataset.o === word) y.classList.add("right"); else if (y === x) y.classList.add("wrong"); });
      fb.innerHTML = `<div class="why ${ok ? "ok" : "no"}"><b>${ok ? "Chính xác." : "Từ được đọc là “" + esc(word) + "”."}</b> <button class="chip" id="both">Nghe cả hai</button></div>`;
      $("#both").onclick = () => speak([{ text:u.words[0], pause:700 }, { text:u.words[1], pause:700 }, { text:u.words[0], pause:700 }, { text:u.words[1] }]);
      ans(u.id, ok);
    });
    autoplay(p);
  },
  end(b, u, ans) {
    const ch = u.type === "ed" ? ["t","d","ɪd"] : ["s","z","ɪz"];
    b.innerHTML = tagRow(u.type === "ed" ? "Đuôi -ed" : "Đuôi -s/-es") + `<div class="word-hero"><b>${esc(u.word)}</b><button class="icon-btn spk" id="spkW" aria-label="Nghe">${ICON.spk}</button></div><p class="lead c">Đuôi của từ này đọc là?</p>`;
    $("#spkW").onclick = () => say(u.word);
    const m = mcqBlock({ id:u.id, stem:"", opts:ch.map(x => "/" + x + "/"), a:ch.indexOf(u.ans), ns:true, why:`Âm cuối của từ gốc là /${u.last}/ → đọc /${u.ans}/.` }, (id, ok) => { ans(id, ok); say(u.word); }, { noStem:true, compact:true });
    m.el.classList.add("ipa-opts"); b.appendChild(m.el);
  },
  stress(b, u, ans) {
    const word = u.syl.join("");
    b.innerHTML = tagRow("Trọng âm") + `<p class="lead">Chạm vào âm tiết được nhấn mạnh.</p><div class="syl-row">${u.syl.map((s, j) => `<button class="syl" data-j="${j}">${esc(s)}</button>`).join("")}</div><div class="fb"></div>`;
    $$(".syl", b).forEach(x => x.onclick = () => {
      if (b.dataset.done) return; b.dataset.done = 1;
      const j = +x.dataset.j, ok = j === u.idx;
      $$(".syl", b).forEach((y, k) => { y.disabled = true; if (k === u.idx) y.classList.add("right"); else if (k === j) y.classList.add("wrong"); });
      b.querySelector(".fb").innerHTML = `<div class="why ${ok ? "ok" : "no"}"><b>${ok ? "Chính xác." : "Chưa đúng."}</b> ${u.syl.map((s, k) => k === u.idx ? `<u>${s.toUpperCase()}</u>` : s).join("·")} <button class="chip" id="hear">Nghe</button></div>`;
      $("#hear").onclick = () => say(word);
      say(word); ans(u.id, ok);
    });
  },
  vmean(b, u, ans) {
    const x = u.v;
    const seen = new Set([x.m]), pool = [];
    for (const y of shuffle(ALLV.filter(y => y.pos === x.pos)).concat(shuffle(ALLV))) { if (pool.length >= 3) break; if (!seen.has(y.m)) { seen.add(y.m); pool.push(y); } }
    b.innerHTML = tagRow("Nghe chọn nghĩa", x.g);
    const p = playerEl([{ text:x.w }], { label:"Nghe từ", sub:"Chọn nghĩa đúng" }); b.appendChild(p);
    const reveal = document.createElement("div"); b.appendChild(reveal);
    b.appendChild(mcqBlock({ id:u.id, stem:"", opts:[x.m, ...pool.map(y => y.m)], a:0, why:"" }, ans, { noStem:true, after:() => { reveal.innerHTML = `<div class="word-hero sm"><b>${esc(x.w)}</b>${x.ipa ? `<span class="ipa">/${esc(x.ipa)}/</span>` : ""}${x.pos ? `<span class="pos">${esc(x.pos)}</span>` : ""}</div>${x.n ? `<p class="muted c">${esc(x.n)}</p>` : ""}`; } }).el);
    autoplay(p);
  },
  vspell(b, u, ans) {
    const x = u.v;
    b.innerHTML = tagRow("Nghe – viết từ", x.g) + `<p class="lead">Nghĩa: <b>${esc(x.m)}</b>${x.pos ? ` <span class="muted">(${esc(x.pos)})</span>` : ""}</p>`;
    const p = playerEl([{ text:x.w }], { label:"Nghe từ", sub:"Gõ đúng chính tả" }); b.appendChild(p);
    const w = document.createElement("div");
    w.innerHTML = `<input class="inp" id="spIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ từ…"><div class="row gap"><button class="btn pri" id="spChk">Kiểm tra</button></div><div class="fb"></div>`;
    b.appendChild(w);
    const norm = s => s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ");
    const chk = () => {
      if (w.dataset.done) return; w.dataset.done = 1;
      const ok = norm($("#spIn").value) === norm(x.w);
      w.querySelector(".fb").innerHTML = `<div class="why ${ok ? "ok" : "no"}"><b>${ok ? "Chính xác." : "Chưa đúng."}</b> <b>${esc(x.w)}</b> ${x.ipa ? `<span class="ipa">/${esc(x.ipa)}/</span>` : ""}</div>`;
      ans(u.id, ok);
    };
    $("#spChk").onclick = chk; $("#spIn").addEventListener("keydown", e => { if (e.key === "Enter") chk(); });
    autoplay(p);
  },
  card(b, u) {
    const x = u.v; let flipped = false;
    b.innerHTML = tagRow("Thẻ ghi nhớ", x.g) + `<button class="flash" id="flash" aria-label="Lật thẻ"></button><p class="muted c">Chạm thẻ để lật · đoán nghĩa trước khi lật</p>
      <div class="row gap center"><button class="btn bad-o" id="cNo">Chưa thuộc</button><button class="btn ok-o" id="cYes">Đã thuộc</button></div>`;
    const draw = () => { $("#flash").innerHTML = flipped
      ? `<span class="fl-m">${x.m ? esc(x.m) : `<span class="muted">Chưa ghi nghĩa</span>`}</span>${x.ipa ? `<span class="ipa">/${esc(x.ipa)}/${x.pos ? " · " + esc(x.pos) : ""}</span>` : ""}${x.n ? `<span class="muted">${esc(x.n)}</span>` : ""}<span class="fl-small">${esc(x.w)}</span>`
      : `<span class="fl-w">${esc(x.w)}</span>${x.ipa ? `<span class="ipa">/${esc(x.ipa)}/</span>` : ""}<span class="fl-spk">${ICON.spk}</span>`; };
    draw();
    $("#flash").onclick = () => { flipped = !flipped; draw(); if (!flipped) say(x.w); };
    const go = k => { S.known[x.w] = k; save(); next(); };
    $("#cNo").onclick = () => go(false); $("#cYes").onclick = () => go(true);
    if (S.autoplay) say(x.w);
  }
};
function revealSet(b, u) {
  const tb = b.querySelector("[data-trans]");
  if (tb) {
    $$("p[data-li]", tb).forEach(p => { const i = +p.dataset.li, vi = (u.trLines || [])[i]; const txt = p.lastChild; if (txt && txt.nodeType === 3) { const sp = document.createElement("span"); sp.className = "tl-en"; sp.innerHTML = tapHTML(txt.nodeValue); txt.replaceWith(sp); } if (vi) p.insertAdjacentHTML("beforeend", `<span class="vi-line">${esc(vi)}</span>`); p.classList.add("tapline"); });
    tb.open = true; tb.querySelector("summary").textContent = "Transcript · bản dịch · chạm từ để lưu";
  }
  const doc = b.querySelector("[data-passage]");
  if (doc) {
    makeTappable(doc);
    const vi = u.trText || (u.trDocs ? u.trDocs.join("") : "");
    if (vi) { const d = document.createElement("details"); d.className = "trans vi-pass"; d.open = true; d.innerHTML = `<summary>Bản dịch tiếng Việt</summary><div class="vi-body">${vi}</div>`; b.appendChild(d); }
    doc.insertAdjacentHTML("beforebegin", `<div class="taphint top">Chạm vào từ chưa biết trong bài để lưu vào <b>Từ của tôi</b></div>`);
  }
}
function diffWords(target, typed) {
  const norm = s => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'\s-]/g, " ").split(/\s+/).filter(Boolean);
  const raw = target.split(/\s+/), a = norm(target), b = norm(typed), m = a.length, n = b.length;
  const dp = Array.from({ length:m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);
  let i = 0, j = 0; const hits = new Array(m).fill(false);
  while (i < m && j < n) { if (a[i] === b[j]) { hits[i] = true; i++; j++; } else if (dp[i+1][j] >= dp[i][j+1]) i++; else j++; }
  return { html: raw.map((w, k) => `<span class="${hits[k] ? "hit" : "miss"}">${esc(w)}</span>`).join(" "), hit:hits.filter(Boolean).length, total:m };
}

/* ======================================================================
   PRESET SESSIONS
   ====================================================================== */
const PART_INFO = {
  p1:{ n:"Mô tả tranh", s:"Listening", per:6, unit:"câu" },
  p2:{ n:"Hỏi – đáp", s:"Listening", per:10, unit:"câu" },
  p3:{ n:"Hội thoại", s:"Listening", per:3, unit:"bài" },
  p4:{ n:"Bài nói ngắn", s:"Listening", per:3, unit:"bài" },
  p5:{ n:"Hoàn thành câu", s:"Reading", per:15, unit:"câu" },
  p6:{ n:"Hoàn thành đoạn văn", s:"Reading", per:2, unit:"bài" },
  p7:{ n:"Đọc hiểu", s:"Reading", per:3, unit:"bài" }
};
const partNum = k => k.slice(1);
function startPart(k) { const lv = S.level; startSession(`Part ${partNum(k)} · ${PART_INFO[k].n}${lv === "a" ? " · 700+" : ""}`, pick(POOL[k], PART_INFO[k].per, lv)); }
function startDaily() {
  const units = [
    ...pick(POOL.p2, 4, "b"),
    ...pick(POOL.p5, 6, "b"),
    ...pick(POOL.p3.concat(POOL.p4), 1, "b"),
    ...pick(mineUnits("vm"), 3), ...pick(POOL.vm, 5 - Math.min(3, mineUnits("vm").length)),
    ...pick(Math.random() < .5 ? POOL.p6 : POOL.p7, 1, "b"),
    ...pick(POOL.pair, 3),
    ...pick(POOL.dict, 2)
  ];
  startSession("Bài luyện hôm nay", units);
}
function startMini() {
  startSession("Đề rút gọn", [...pick(POOL.p1, 3, "all"), ...pick(POOL.p2, 6, "all"), ...pick(POOL.p3, 2, "all"), ...pick(POOL.p4, 2, "all"), ...pick(POOL.p5, 10, "all"), ...pick(POOL.p6, 1, "all"), ...pick(POOL.p7, 2, "all")]);
}
function startAdv() {
  startSession("Thử thách 700+", [...pick(POOL.p1, 1, "a"), ...pick(POOL.p2, 4, "a"), ...pick(POOL.p3, 1, "a"), ...pick(POOL.p4, 1, "a"), ...pick(POOL.p5, 10, "a"), ...pick(POOL.p6, 1, "a"), ...pick(POOL.p7, 1, "a")]);
}
function wrongUnits() { return Object.values(U).filter(u => u.kind !== "vspell" && u.ids.some(id => S.ans[id] && !S.ans[id].ok)); }
function startWrong() { startSession("Ôn câu đã sai", shuffle(wrongUnits()).slice(0, 20)); }

/* ======================================================================
   LEARNING PATHS (lộ trình, lưu tiến độ trong S.path)
   ====================================================================== */
const PASS = 60;
const tensePool = (...tags) => tags.flatMap(t => POOL.tense[t] || []);
const tenseIntro = ids => ids.map(id => { const t = TENSE_REF.find(x => x.id === id); return `<h3>${t.name} <span class="muted">· ${t.en}</span></h3><div class="forms">${["+","−","?"].map((k, i) => `<div><span class="fk">${k}</span><code>${esc(t.f[i])}</code></div>`).join("")}</div><p><b>Dùng khi:</b> ${t.use}</p><p><b>Dấu hiệu:</b> <span class="sig">${t.sig}</span></p><p class="ex">${t.ex}</p>`; }).join("");
const topicIntro = id => { const t = GRAM.find(x => x.id === id); return `<div class="rules">${t.rules.map(r => `<div class="rule"><b>${r[0]}</b>${r[1] ? `<code>${esc(r[1])}</code>` : ""}${r[2] ? `<span class="ex">${r[2]}</span>` : ""}</div>`).join("")}</div><div class="callout sig"><b>Mẹo</b><span>${t.sig}</span></div><div class="callout trap"><b>Bẫy</b><span>${t.trap}</span></div>${stepsHTML(id)}`; };
const stepsHTML = topic => (typeof STEPS === "object" && STEPS[topic]) ? `<div class="steps-box"><b>Cách làm từng bước</b><ol>${STEPS[topic].map(x => `<li>${termify(x)}</li>`).join("")}</ol></div>` : "";
const foundIntro = () => ["dong_tu","chu_ngu","tan_ngu","noi_dt","chu_dong_bi_dong","menh_de"].map(k => `<h3>${TERMS[k].name}</h3>${termBody(k)}`).join("");
const tipList = arr => `<ul class="tips-l">${arr.map(x => `<li>${x}</li>`).join("")}</ul>`;
const isWh = u => /^(Where|When|Why|Who|Whose|What|Which|How)\b/.test(u.q);
const gTopic = (id, n = 10) => ({ id, t:GRAM.find(x => x.id === id).name, intro:() => topicIntro(id), units:() => pick(POOL.gram[id], n) });
function vocabLessonUnits(g) {
  const words = ALLV.filter(x => x.g === g);
  const cards = words.map(x => ({ kind:"card", id:"card." + x.w, ids:[], v:x }));
  return [...cards, ...pick(words.map(x => U["vm." + x.w]), 8), ...pick(words.map(x => U["vs." + x.w]), 4)];
}
const PATHS = {
  gram: { name:"Ngữ pháp", sub:"22 bài · từ nền tảng đến 700+", tone:"gram", lessons:[
    { id:"found", t:"Nền tảng: động từ, chủ ngữ, tân ngữ, mệnh đề", intro:foundIntro, units:() => pick(POOL.found, 12) },
    gTopic("wf", 12),
    { id:"t1", t:"Hiện tại đơn & hiện tại tiếp diễn", intro:() => tenseIntro(["ps","pc"]), units:() => pick(tensePool("ps","pc"), 10) },
    { id:"t2", t:"Hiện tại hoàn thành", intro:() => tenseIntro(["pp","ppc"]), units:() => pick(tensePool("pp","ppc"), 10) },
    { id:"t3", t:"Quá khứ đơn & quá khứ tiếp diễn", intro:() => tenseIntro(["pas","pac"]), units:() => pick(tensePool("pas","pac"), 10) },
    { id:"t4", t:"Quá khứ hoàn thành", intro:() => tenseIntro(["pap"]), units:() => pick(tensePool("pap","pas"), 8) },
    { id:"t5", t:"Các thì tương lai", intro:() => tenseIntro(["fs","bgt","fc","fp"]), units:() => pick(tensePool("fs","bgt","fc","fp"), 10) },
    { id:"t6", t:"Mệnh đề thời gian & mẹo chọn thì", intro:() => tipList(TENSE_TIPS) + stepsHTML("tense"), units:() => pick(tensePool("tc","mix"), 10) },
    { id:"pass", t:"Câu bị động", intro:() => topicIntro("pass") + tenseIntro(["pv"]), units:() => pick(POOL.gram.pass.concat(tensePool("pv")), 12) },
    gTopic("sva"), gTopic("pron"), gTopic("prep", 12), gTopic("ving"), gTopic("part"), gTopic("rel"), gTopic("comp"), gTopic("conj"), gTopic("cond"), gTopic("conf"),
    { id:"mixT", t:"Ôn tổng hợp các thì", intro:() => tipList(TENSE_TIPS), units:() => pick(tenseAll(), 15) },
    { id:"v5", t:"Từ vựng & cụm cố định Part 5", intro:() => tipList(["Đọc cả câu, tìm từ đi kèm (collocation) quanh chỗ trống: take effect, comply with, in charge of, refrain from…","Loại đáp án sai giới từ đi kèm trước khi xét nghĩa.","Sau bài, chạm vào từ chưa biết trong phần dịch để lưu vào Từ của tôi."]), units:() => pick(POOL.p5.filter(u => /^v5/.test(u.id)), 15) },
    { id:"a5", t:"Thử thách 700+ Part 5", intro:() => tipList(["Đảo ngữ: Only after / Not until / Rarely / Had / Should + trợ động từ + S.","Câu giả định: request / require / essential that + S + V nguyên mẫu.","Từ nối nâng cao: on account of, regardless of, provided that, pending, upon + V-ing."]), units:() => pick(POOL.p5.filter(u => u.lv === "a"), 12) }
  ]},
  listen: { name:"Nghe", sub:"14 bài · âm cuối → Part 1–4 → 700+", tone:"listen", lessons:[
    { id:"l_end", t:"Âm cuối: đuôi -ed và -s", intro:() => tipList(["Đuôi -ed: /ɪd/ sau /t/, /d/ · /t/ sau âm vô thanh /p k f s ʃ tʃ/ · /d/ còn lại.","Đuôi -s: /ɪz/ sau /s z ʃ tʃ dʒ/ · /s/ sau /p t k f θ/ · /z/ còn lại.","Nghe sót âm cuối → nhầm số ít/nhiều và thì quá khứ trong Part 1–2."]), units:() => shuffle(pick(POOL.ed, 6).concat(pick(POOL.se, 6))) },
    { id:"l_pair", t:"Phân biệt âm dễ nhầm", intro:() => tipList(SOUNDS.slice(0, 6).map(x => `<b>${x.ipa}</b> ${x.t}: ${x.how}`)), units:() => pick(POOL.pair, 12) },
    { id:"l_d1", t:"Nối âm & chép chính tả 1", intro:() => tipList(LINKS.map(x => `<b>${x.t}</b>: ${x.ex.slice(0, 3).join(" · ")}`)), units:() => pick(POOL.dict, 6) },
    { id:"l_p1", t:"Part 1: mô tả tranh", intro:() => tipList(["Trước khi nghe: nhìn tranh, đoán danh từ + động từ chính.","Không có người → chọn câu has/have been + V3 hoặc is/are + V3; loại câu is being + V3.","wearing (đang mặc) ≠ putting on (đang mặc vào)."]), units:() => pick(POOL.p1, 6, "b") },
    { id:"l_p2wh", t:"Part 2: câu hỏi Wh-", intro:() => tipList(["Bắt chặt 2–3 từ đầu: Where / When / Who / Why / How long / How much.","Câu Wh- không trả lời Yes/No.","Loại đáp án lặp từ hoặc có âm giống câu hỏi."]), units:() => pick(POOL.p2.filter(isWh), 8, "b") },
    { id:"l_p2yn", t:"Part 2: Yes/No, lựa chọn, đề nghị", intro:() => tipList(["Câu lựa chọn A or B → không trả lời Yes/No; 'Either is fine' rất hay đúng.","Why don't we / Would you like / Can you → lời mời, đề nghị: đáp án là đồng ý / từ chối.","Câu trần thuật → chọn phản ứng hợp lý (giải pháp, câu hỏi lại)."]), units:() => pick(POOL.p2.filter(u => !isWh(u)), 8, "b") },
    { id:"l_d2", t:"Chép chính tả 2", intro:() => tipList(["Nghe 0.85× → gõ cả câu → xem từ đỏ.","Nghe chậm chỗ sai, rồi nghe lại 1.0× và đọc theo 3 lần."]), units:() => pick(POOL.dict, 8) },
    { id:"l_p3", t:"Part 3: hội thoại", intro:() => tipList(["Đọc trước 3 câu hỏi, gạch từ khóa (who, why, what … offer).","Thứ tự câu hỏi theo thứ tự thông tin trong bài.","Đáp án thường diễn đạt lại (paraphrase), không lặp nguyên từ."]), units:() => pick(POOL.p3, 2, "b") },
    { id:"l_p4", t:"Part 4: bài nói ngắn", intro:() => tipList(["Câu đầu cho biết người nói là ai / ở đâu.","Câu 'Please …' là yêu cầu; câu cuối thường nói việc tiếp theo."]), units:() => pick(POOL.p4, 2, "b") },
    { id:"l_st", t:"Trọng âm từ", intro:() => tipList(["Danh/tính từ 2 âm tiết thường nhấn âm 1, động từ 2 âm tiết nhấn âm 2.","-tion, -ic, -ial, -ity → nhấn âm ngay trước đuôi; -ee, -eer → nhấn vào đuôi."]), units:() => pick(POOL.stress, 12) },
    { id:"l_p2a", t:"Part 2: trả lời gián tiếp (700+)", intro:() => tipList(["'Let me check', 'It hasn't been decided', 'Didn't you see the e-mail?' thường là đáp án đúng.","Câu trả lời không chứa từ khóa của câu hỏi vẫn có thể đúng."]), units:() => pick(POOL.p2, 8, "a") },
    { id:"l_p34a", t:"Part 3–4: bảng & câu hàm ý", intro:() => tipList(["Look at the graphic: nghe thông tin KHÔNG có trong đáp án rồi tra bảng.","Why does the man say “…”: hiểu ý định (từ chối, nghi ngờ, xin lỗi), không dịch nghĩa đen."]), units:() => pick(POOL.p3.concat(POOL.p4), 3, "a") },
    { id:"l_p1a", t:"Part 1 nâng cao", intro:() => tipList(["Bẫy hành động gần đúng: exchanging cards vs shaking hands.","Loại mọi câu nhắc vật/người không có trong tranh."]), units:() => pick(POOL.p1, 4, "a") },
    { id:"l_d3", t:"Chép chính tả 3", intro:() => tipList(["Thử nghe ở 1.0× ngay từ đầu.","Mục tiêu: chép đúng hoàn toàn từ 7/10 câu."]), units:() => pick(POOL.dict, 10) }
  ]},
  vocab: { name:"Từ mới", sub:`${Object.keys(V).length} bài · ${ALLV.length} từ theo chủ đề`, tone:"vocab", lessons:Object.keys(V).map(g => ({ id:"v_" + g, t:g,
    intro:() => `<p>Bài này có ${V[g].length} từ: lật từng thẻ để học nghĩa và phát âm, sau đó làm 8 câu Nghe chọn nghĩa và 4 câu Nghe – viết.</p><div class="wchips">${V[g].map(w => `<span class="wchip">${esc(w[0])}</span>`).join("")}</div>`,
    units:() => vocabLessonUnits(g) })) }
};
function pathDone(pid) { const pr = S.path[pid] || {}; return PATHS[pid].lessons.filter(l => pr[l.id] && pr[l.id].pass).length; }
function pathNextIdx(pid) { const pr = S.path[pid] || {}; const i = PATHS[pid].lessons.findIndex(l => !(pr[l.id] && pr[l.id].pass)); return i; }
function startLesson(pid, lid) {
  const P = PATHS[pid], idx = P.lessons.findIndex(l => l.id === lid), L = P.lessons[idx];
  if (SES) { stopSpeech(); SES = null; }
  const intro = { kind:"lesson", id:"lesson." + lid, ids:[], title:L.t, html:L.intro(), num:idx + 1, pathName:"Lộ trình " + P.name };
  startSession(`Lộ trình ${P.name} · Bài ${idx + 1}`, [intro, ...L.units()], { path:pid, lesson:lid });
}
function continuePath(pid) { let i = pathNextIdx(pid); if (i < 0) i = PATHS[pid].lessons.length - 1; startLesson(pid, PATHS[pid].lessons[i].id); }
function pathCard(pid) {
  const P = PATHS[pid], n = P.lessons.length, done = pathDone(pid), ni = pathNextIdx(pid), L = ni >= 0 ? P.lessons[ni] : null;
  return `<div class="pcard ${P.tone}"><div class="pc-top"><span class="pc-name">${P.name}</span><span class="pc-step">${done}/${n}</span></div>
    <div class="pc-next">${L ? `<span class="muted small">Bài ${ni + 1}</span><b>${esc(L.t)}</b>` : `<span class="muted small">Hoàn thành</span><b>Đã xong cả lộ trình</b>`}</div>
    <span class="pbar"><span style="width:${done / n * 100}%"></span></span>
    <div class="pc-act"><button class="btn sm pri" data-cont="${pid}">${done ? "Học tiếp" : "Bắt đầu"}</button><button class="btn sm ghost" data-open="${pid}">Xem lộ trình</button></div></div>`;
}
function viewPath(m) {
  const pid = S.pathId || "gram", P = PATHS[pid], pr = S.path[pid] || {}, ni = pathNextIdx(pid), done = pathDone(pid);
  m.innerHTML = `<button class="link back" id="back">← Hôm nay</button>
    <h1 class="vt">Lộ trình ${P.name}</h1><p class="muted">${P.sub} · qua bài khi đạt từ ${PASS}% · tiến độ lưu tự động</p>
    <div class="pcard wide ${P.tone}"><div class="pc-top"><span class="pc-name">Đã qua ${done}/${P.lessons.length} bài</span></div><span class="pbar"><span style="width:${done / P.lessons.length * 100}%"></span></span></div>
    <div class="lessons ${P.tone}">${P.lessons.map((l, i) => { const r = pr[l.id]; const cls = r && r.pass ? "done" : i === ni ? "cur" : "";
      return `<div class="lrow ${cls}"><span class="lnum">${r && r.pass ? "✓" : i + 1}</span><div class="ltxt"><b>${esc(l.t)}</b><span class="muted small">${r ? `Tốt nhất ${r.best}% · ${r.n} lần` : i === ni ? "Bài tiếp theo" : "Chưa học"}</span></div><button class="btn sm ${i === ni ? "pri" : ""}" data-l="${l.id}">${r && r.pass ? "Ôn lại" : "Học"}</button></div>`; }).join("")}</div>`;
  $("#back").onclick = () => go("home");
  $$("[data-l]", m).forEach(b => b.onclick = () => startLesson(pid, b.dataset.l));
}

/* ======================================================================
   VIEWS
   ====================================================================== */
function ringSVG(frac, size = 120, sw = 10) {
  const r = (size - sw) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac));
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><circle class="ring-bg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}"/><circle class="ring-fg" cx="${size/2}" cy="${size/2}" r="${r}" stroke-width="${sw}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - f)}" transform="rotate(-90 ${size/2} ${size/2})"/></svg>`;
}
function ringHTML() {
  const t = today(), m = mins(t.sec);
  return `<div class="today-ring" id="todayRing">${ringSVG(m / S.goal, 128, 12)}<div class="ring-txt"><b>${m}</b><span>/ ${S.goal} phút</span></div></div>`;
}
const VIEWS = { path:viewPath, home:viewHome, parts:viewParts, grammar:viewGrammar, skills:viewSkills, progress:viewProgress };
function render() {
  $$(".nav-btn").forEach(b => b.classList.toggle("on", b.dataset.v === (S.view === "path" ? "home" : S.view)));
  const m = $("#main"); m.innerHTML = ""; VIEWS[S.view](m);
  const sc = `${ICON.flame}<span>${streak()} ngày</span>`; $("#streakChip").innerHTML = sc; $("#streakChipSide").innerHTML = sc;
}
function go(v) { S.view = v; save(); render(); scrollTo({ top:0 }); }

function viewHome(m) {
  const t = today(), h = new Date().getHours();
  const greet = h < 11 ? "Chào buổi sáng" : h < 14 ? "Chào buổi trưa" : h < 18 ? "Chào buổi chiều" : "Chào buổi tối";
  const d = new Date(); const dateStr = `${["Chủ nhật","Thứ hai","Thứ ba","Thứ tư","Thứ năm","Thứ sáu","Thứ bảy"][d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
  const acc = t.q ? Math.round(t.ok / t.q * 100) + "%" : "—";
  const wu = wrongUnits().length;
  const weak = Object.keys(SEC).map(k => { const ids = ALLIDS.filter(id => secOf(id) === k); return { k, ...stat(ids) }; }).filter(x => x.n >= 5).sort((a, b) => a.pct - b.pct).slice(0, 3);
  m.innerHTML = `
  <section class="hero">
    <div class="hero-l"><p class="eyebrow">${dateStr}</p><h1>${greet}</h1><p class="muted">Mục tiêu 650 · chỉ tính thời gian khi bạn đang làm bài.</p></div>
    <div class="hero-r">${ringHTML()}
      <div class="mini-stats"><div><b>${t.q}</b><span>câu hôm nay</span></div><div><b>${acc}</b><span>đúng</span></div><div><b>${streak()}</b><span>ngày liên tiếp</span></div></div></div>
  </section>
  <button class="cta" id="daily"><div><span class="eyebrow light">Khoảng 15–20 phút</span><b>Bài luyện hôm nay</b><span>Part 2 · Part 5 · Part 3/4 · đọc hiểu · từ vựng · phát âm · chép chính tả</span></div><span class="cta-go">${ICON.arrow}</span></button>
  <h2 class="sh">Lộ trình học · tự lưu để học tiếp lần sau</h2>
  <div class="path-grid">${["gram","listen","vocab"].map(pathCard).join("")}</div>
  <div class="quick">
    <button class="qcard" data-q="mini"><b>Đề rút gọn</b><span>Đủ 7 Part, ~50 câu</span></button>
    <button class="qcard adv" data-q="adv"><b>Thử thách 700+</b><span>Câu khó, bẫy hàm ý</span></button>
    <button class="qcard" data-q="tense"><b>Các thì</b><span>${TENSE_Q.length} câu theo từng thì</span></button>
    <button class="qcard" data-q="wrong"><b>Ôn câu sai</b><span>${wu ? wu + " mục cần làm lại" : "Chưa có câu sai"}</span></button>
  </div>
  <section class="card"><div class="card-h row between"><span>7 ngày gần đây</span><button class="link" data-q="prog">Xem tiến độ</button></div>${barChart(7, "min", true)}</section>
  ${weak.length ? `<section class="card"><div class="card-h">Phần cần cải thiện</div>${weak.map(w => `<div class="weak"><div><b>${SEC[w.k]}</b><span class="muted">${w.pct}% đúng · ${w.n} câu</span></div><button class="btn sm" data-weak="${w.k}">Luyện</button></div>`).join("")}</section>` : ""}`;
  $("#daily").onclick = startDaily;
  $$("[data-cont]", m).forEach(b => b.onclick = () => continuePath(b.dataset.cont));
  $$("[data-open]", m).forEach(b => b.onclick = () => { S.pathId = b.dataset.open; go("path"); });
  $$("[data-q]", m).forEach(b => b.onclick = () => ({ mini:startMini, adv:startAdv, wrong:startWrong, tense:() => { S.gseg = "tense"; go("grammar"); }, prog:() => go("progress") })[b.dataset.q]());
  $$("[data-weak]", m).forEach(b => b.onclick = () => startWeak(b.dataset.weak));
  wireChart(m);
}
function startWeak(k) {
  const map = { p1:POOL.p1, p2:POOL.p2, p3:POOL.p3, p4:POOL.p4, p5:POOL.p5.filter(u => /^(v5|a5)/.test(u.id)), p6:POOL.p6, p7:POOL.p7, tense:tenseAll(), gram:gramAll(), pron:[...POOL.pair, ...POOL.ed, ...POOL.se, ...POOL.stress], vocab:POOL.vm, dict:POOL.dict };
  const units = shuffle(map[k] || []).sort((a, b) => { const r = x => ustatus(x) === 1 ? 0 : ustatus(x) === 0 ? 1 : 2; return r(a) - r(b); }).slice(0, ["p3","p4","p6","p7"].includes(k) ? 3 : 12);
  startSession("Luyện phần yếu · " + SEC[k], units);
}

function viewParts(m) {
  const lv = S.level;
  const cards = keys => keys.map(k => {
    const pool = lv === "all" ? POOL[k] : POOL[k].filter(u => !u.lv || u.lv === lv);
    const st = stat(allQIds(pool)); const info = PART_INFO[k];
    return `<button class="part ${info.s === "Listening" ? "L" : "R"}" data-p="${k}">
      <span class="pn">${partNum(k)}</span>
      <span class="pbody"><b>${info.n}</b><span class="muted">${st.total} câu · đã làm ${st.n}${st.pct != null ? ` · ${st.pct}% đúng` : ""}</span>
      <span class="pbar"><span style="width:${st.total ? st.n / st.total * 100 : 0}%"></span></span></span>
      <span class="pgo">${ICON.arrow}</span></button>`;
  }).join("");
  m.innerHTML = `<h1 class="vt">Luyện theo Part</h1>
  <div class="seg" role="tablist">${[["b","Cơ bản"],["a","Nâng cao 700+"],["all","Tất cả"]].map(([k, t]) => `<button data-lv="${k}" class="${lv === k ? "on" : ""}">${t}</button>`).join("")}</div>
  <p class="muted small">Mỗi lượt ưu tiên câu chưa làm, rồi đến câu từng làm sai.</p>
  <h2 class="sh L">Listening</h2><div class="parts">${cards(["p1","p2","p3","p4"])}</div>
  <h2 class="sh R">Reading</h2><div class="parts">${cards(["p5","p6","p7"])}</div>
  <div class="quick two"><button class="qcard" id="mini"><b>Đề rút gọn</b><span>Trộn cả 7 Part</span></button><button class="qcard adv" id="adv"><b>Thử thách 700+</b><span>Chỉ câu nâng cao</span></button></div>`;
  $$("[data-lv]", m).forEach(b => b.onclick = () => { S.level = b.dataset.lv; save(); render(); });
  $$("[data-p]", m).forEach(b => b.onclick = () => startPart(b.dataset.p));
  $("#mini").onclick = startMini; $("#adv").onclick = startAdv;
}

function viewGrammar(m) {
  const seg = S.gseg;
  m.innerHTML = `<h1 class="vt">Ngữ pháp</h1><div class="seg">${[["found","Nền tảng"],["tense","Các thì"],["topic","Chủ đề"]].map(([k, t]) => `<button data-s="${k}" class="${seg === k ? "on" : ""}">${t}</button>`).join("")}</div><div id="gbody"></div>`;
  $$("[data-s]", m).forEach(b => b.onclick = () => { S.gseg = b.dataset.s; save(); render(); });
  const g = $("#gbody", m);
  if (seg === "found") {
    const st = stat(allQIds(POOL.found));
    g.innerHTML = `<div class="card"><div class="card-h">Đọc phần này trước</div><p>Phần lớn câu Part 5 chỉ cần xác định đúng 4 thứ: <b>động từ chính</b>, <b>chủ ngữ</b>, <b>tân ngữ</b>, và phía sau chỗ trống là <b>mệnh đề</b> hay <b>cụm danh từ</b>. Mở từng mục để xem cách nhận diện và ví dụ phân tích.</p>
      <p class="muted small">${st.n}/${st.total} câu nhận diện đã làm${st.pct != null ? ` · ${st.pct}% đúng` : ""}</p><button class="btn pri" id="fqGo">Luyện nhận diện ${POOL.found.length} câu</button></div>
      <div class="tlist">${Object.keys(TERMS).map(k => { const open = S.openTerm === k; return `<div class="tcard${open ? " open" : ""}"><button class="t-head" data-tm="${k}"><b>${TERMS[k].name}</b><span class="t-meta">${open ? "Thu gọn" : "Xem"}</span></button>${open ? `<div class="t-body">${termBody(k)}</div>` : ""}</div>`; }).join("")}</div>`;
    $("#fqGo").onclick = () => startSession("Luyện nhận diện thành phần câu", pick(POOL.found, POOL.found.length));
    $$("[data-tm]", g).forEach(b => b.onclick = () => { S.openTerm = S.openTerm === b.dataset.tm ? null : b.dataset.tm; save(); render(); });
    return;
  }
  if (seg === "tense") {
    const all = tenseAll(), st = stat(allQIds(all));
    g.innerHTML = `
    <div class="row gap wrap"><button class="btn pri" id="tMix">Trộn ${Math.min(15, all.length)} câu các thì</button><button class="btn" id="tTc">Mệnh đề thời gian</button><button class="btn" id="tPv">Bị động theo thì</button></div>
    <p class="muted small">${st.n}/${st.total} câu đã làm${st.pct != null ? ` · ${st.pct}% đúng` : ""}</p>
    <div class="card tips"><div class="card-h">5 quy tắc chọn thì nhanh trong Part 5</div><ol>${TENSE_TIPS.map(t => `<li>${t}</li>`).join("")}</ol>${stepsHTML("tense")}</div>
    <div class="tlist">${TENSE_REF.map(t => {
      const pool = POOL.tense[t.id] || [], s2 = stat(allQIds(pool)), open = S.openTense === t.id;
      return `<div class="tcard${open ? " open" : ""}"><button class="t-head" data-t="${t.id}"><span><b>${t.name}</b><span class="muted"> · ${t.en}</span></span><span class="t-meta">${s2.n}/${s2.total}${s2.pct != null ? ` · ${s2.pct}%` : ""}</span></button>
      ${open ? `<div class="t-body">
        <div class="forms"><div><span class="fk">+</span><code>${esc(t.f[0])}</code></div><div><span class="fk">−</span><code>${esc(t.f[1])}</code></div><div><span class="fk">?</span><code>${esc(t.f[2])}</code></div></div>
        <p><b>Dùng khi:</b> ${t.use}</p><p><b>Dấu hiệu:</b> <span class="sig">${t.sig}</span></p><p class="ex">${t.ex}</p>
        ${pool.length ? `<button class="btn pri sm" data-tp="${t.id}">Luyện ${pool.length} câu</button>` : ""}</div>` : ""}</div>`;
    }).join("")}</div>`;
    $("#tMix").onclick = () => startSession("Trộn các thì", pick(all, 15));
    $("#tTc").onclick = () => startSession("Mệnh đề thời gian", pick(POOL.tense.tc || [], 10));
    $("#tPv").onclick = () => startSession("Bị động theo thì", pick(POOL.tense.pv || [], 10));
    $$("[data-t]", g).forEach(b => b.onclick = () => { S.openTense = S.openTense === b.dataset.t ? null : b.dataset.t; save(); render(); });
    $$("[data-tp]", g).forEach(b => b.onclick = () => startSession(TNAME[b.dataset.tp], pick(POOL.tense[b.dataset.tp], 12)));
  } else {
    g.innerHTML = `<div class="row gap wrap"><button class="btn pri" id="gMix">Trộn 15 câu mọi chủ đề</button></div><div class="tlist">${GRAM.map(t => {
      const pool = POOL.gram[t.id], s2 = stat(allQIds(pool)), open = S.openTopic === t.id;
      return `<div class="tcard${open ? " open" : ""}"><button class="t-head" data-g="${t.id}"><b>${t.name}</b><span class="t-meta">${s2.n}/${s2.total}${s2.pct != null ? ` · ${s2.pct}%` : ""}</span></button>
      ${open ? `<div class="t-body"><div class="rules">${t.rules.map(r => `<div class="rule"><b>${r[0]}</b>${r[1] ? `<code>${esc(r[1])}</code>` : ""}${r[2] ? `<span class="ex">${r[2]}</span>` : ""}</div>`).join("")}</div>
        <div class="callout sig"><b>Mẹo</b><span>${t.sig}</span></div><div class="callout trap"><b>Bẫy</b><span>${t.trap}</span></div>${stepsHTML(t.id)}
        <button class="btn pri sm" data-gp="${t.id}">Luyện ${pool.length} câu</button></div>` : ""}</div>`;
    }).join("")}</div>`;
    $("#gMix").onclick = () => startSession("Trộn chủ đề ngữ pháp", pick(gramAll(), 15));
    $$("[data-g]", g).forEach(b => b.onclick = () => { S.openTopic = S.openTopic === b.dataset.g ? null : b.dataset.g; save(); render(); });
    $$("[data-gp]", g).forEach(b => b.onclick = () => { const t = GRAM.find(x => x.id === b.dataset.gp); startSession(t.name, pick(POOL.gram[t.id], 12)); });
  }
}

function viewSkills(m) {
  const seg = S.kseg;
  m.innerHTML = `<h1 class="vt">Từ vựng & Phát âm</h1><div class="seg">${[["vocab","Từ vựng"],["pron","Phát âm"],["dict","Chép chính tả"]].map(([k, t]) => `<button data-s="${k}" class="${seg === k ? "on" : ""}">${t}</button>`).join("")}</div><div id="kbody"></div>`;
  $$("[data-s]", m).forEach(b => b.onclick = () => { S.kseg = b.dataset.s; save(); render(); });
  const k = $("#kbody", m);
  if (seg === "vocab") {
    const groups = Object.keys(V), g = S.vgroup, isMine = g === "@";
    const mineList = Object.keys(S.mine).map(mineV).sort((a, b) => (b.d || "").localeCompare(a.d || ""));
    const list = isMine ? mineList : g === "*" ? ALLV : g === "!" ? ALLV.filter(x => !S.known[x.w]) : ALLV.filter(x => x.g === g);
    const vmPool = isMine ? mineUnits("vm") : list.map(x => U["vm." + x.w]);
    const vsPool = isMine ? mineUnits("vs") : list.map(x => U["vs." + x.w]);
    const known = ALLV.filter(x => S.known[x.w]).length;
    k.innerHTML = `
      <div class="known"><div class="row between"><span><b>${known}</b> / ${ALLV.length} từ đã thuộc</span><span class="muted small">${Math.round(known / ALLV.length * 100)}%</span></div><div class="pbar"><span style="width:${known / ALLV.length * 100}%"></span></div></div>
      <div class="chips-scroll">${[["@",`Từ của tôi (${mineList.length})`],["*","Tất cả"],["!","Chưa thuộc"], ...groups.map(x => [x, x])].map(([v, t]) => `<button class="gchip${g === v ? " on" : ""}" data-g="${esc(v)}">${esc(t)}</button>`).join("")}</div>
      <div class="actions3"><button class="act" id="vCards"><b>Thẻ ghi nhớ</b><span>${Math.min(20, list.length)} thẻ</span></button><button class="act" id="vMean"><b>Nghe chọn nghĩa</b><span>${Math.min(12, vmPool.length)} câu</span></button><button class="act" id="vSpell"><b>Nghe – viết</b><span>${Math.min(10, vsPool.length)} câu</span></button></div>
      ${isMine ? `<p class="muted small">Từ bạn lưu khi làm bài. Ghi nghĩa để dùng được trong Nghe chọn nghĩa và Nghe – viết.</p><div class="vlist">${mineList.map(x => `<div class="vrow mine"><button class="icon-btn spk sm" data-w="${esc(x.w)}" aria-label="Nghe ${esc(x.w)}">${ICON.spk}</button>
        <div class="vmain"><div><b>${esc(x.w)}</b>${x.ipa ? ` <span class="ipa">/${esc(x.ipa)}/</span>` : ""}${x.pos ? ` <span class="pos">${esc(x.pos)}</span>` : ""}</div><input class="inp mm" id="mm_${esc(x.w)}" data-mm="${esc(x.w)}" value="${esc(x.m)}" placeholder="Ghi nghĩa…" autocomplete="off">${x.n ? `<div class="muted small ctx">${esc(x.n)}</div>` : ""}</div>
        <button class="icon-btn sm" data-del="${esc(x.w)}" aria-label="Xóa ${esc(x.w)}">${ICON.x}</button></div>`).join("") || `<div class="empty"><b>Chưa có từ nào.</b><span>Khi làm bài, sau khi chọn đáp án, chạm vào từ bạn chưa biết trong phần dịch hoặc bài đọc để lưu vào đây.</span></div>`}</div>` : `
      <div class="vlist">${list.map(x => `<div class="vrow${S.known[x.w] ? " known" : ""}"><button class="icon-btn spk sm" data-w="${esc(x.w)}" aria-label="Nghe ${esc(x.w)}">${ICON.spk}</button>
        <div class="vmain"><div><b>${esc(x.w)}</b> <span class="ipa">/${esc(x.ipa)}/</span> <span class="pos">${esc(x.pos)}</span></div><div class="vm">${esc(x.m)}${x.n ? ` <span class="muted">· ${esc(x.n)}</span>` : ""}</div></div>
        <label class="kn"><input type="checkbox" data-k="${esc(x.w)}" ${S.known[x.w] ? "checked" : ""}><span>Thuộc</span></label></div>`).join("") || `<p class="muted">Không còn từ nào trong nhóm này.</p>`}</div>`}`;
    $$("[data-mm]", k).forEach(i => i.onchange = () => { const w = i.dataset.mm; if (S.mine[w]) { S.mine[w].m = i.value.trim(); save(); } });
    $$("[data-del]", k).forEach(b => b.onclick = () => { delete S.mine[b.dataset.del]; save(); render(); });
    $$("[data-g]", k).forEach(b => b.onclick = () => { S.vgroup = b.dataset.g; save(); render(); });
    $$("[data-w]", k).forEach(b => b.onclick = () => say(b.dataset.w, 0.85));
    $$("[data-k]", k).forEach(c => c.onchange = () => { S.known[c.dataset.k] = c.checked; save(); c.closest(".vrow").classList.toggle("known", c.checked); });
    $("#vCards").onclick = () => startSession("Thẻ ghi nhớ", shuffle(list.filter(x => !S.known[x.w]).concat(list.filter(x => S.known[x.w]))).slice(0, 20).map(x => ({ kind:"card", id:"card." + x.w, ids:[], v:x })).sort((a, b) => (S.known[a.v.w] ? 1 : 0) - (S.known[b.v.w] ? 1 : 0)));
    $("#vMean").onclick = () => startSession("Nghe chọn nghĩa", pick(vmPool, 12));
    $("#vSpell").onclick = () => startSession("Nghe – viết từ", pick(vsPool, 10));
  } else if (seg === "pron") {
    const s = pool => { const st = stat(allQIds(pool)); return `${st.n}/${st.total}${st.pct != null ? ` · ${st.pct}%` : ""}`; };
    k.innerHTML = `
      <div class="actions2">
        <button class="act" data-pp="pair"><b>Nghe phân biệt âm</b><span>${s(POOL.pair)}</span></button>
        <button class="act" data-pp="ed"><b>Đuôi -ed</b><span>${s(POOL.ed)}</span></button>
        <button class="act" data-pp="se"><b>Đuôi -s / -es</b><span>${s(POOL.se)}</span></button>
        <button class="act" data-pp="stress"><b>Trọng âm</b><span>${s(POOL.stress)}</span></button>
      </div>
      <div class="split">
        <div class="card"><div class="card-h">Đuôi -ed</div><p><span class="ipa">/ɪd/</span> sau /t/, /d/ · <span class="ipa">/t/</span> sau âm vô thanh /p k f s ʃ tʃ/ · <span class="ipa">/d/</span> còn lại.</p></div>
        <div class="card"><div class="card-h">Đuôi -s / -es</div><p><span class="ipa">/ɪz/</span> sau /s z ʃ tʃ dʒ/ · <span class="ipa">/s/</span> sau /p t k f θ/ · <span class="ipa">/z/</span> còn lại.</p></div>
        <div class="card"><div class="card-h">Trọng âm</div><p>Danh/tính từ 2 âm tiết thường nhấn âm 1, động từ 2 âm tiết nhấn âm 2. Đuôi -tion, -ic, -ial, -ity nhấn âm ngay trước đuôi. Đuôi -ee, -eer nhấn vào đuôi.</p></div>
      </div>
      <h2 class="sh">Âm khó với người Việt</h2>
      <div class="sounds">${SOUNDS.map(x => `<div class="card snd"><div class="snd-h"><span class="ipa big">${x.ipa}</span><b>${x.t}</b></div><p>${x.how}</p><div class="wchips">${x.w.map(w => `<button class="wchip" data-say="${esc(w)}">${esc(w)}</button>`).join("")}</div><div class="wchips">${x.p.map(p => `<button class="wchip pair" data-pair="${esc(p.join("|"))}">${esc(p[0])} · ${esc(p[1])}</button>`).join("")}</div></div>`).join("")}</div>
      <h2 class="sh">Nối âm</h2>
      <div class="sounds">${LINKS.map(x => `<div class="card snd"><b>${x.t}</b><div class="wchips">${x.ex.map(w => `<button class="wchip" data-say="${esc(w)}">${esc(w)}</button>`).join("")}</div></div>`).join("")}</div>`;
    $$("[data-pp]", k).forEach(b => b.onclick = () => { const t = { pair:"Nghe phân biệt âm", ed:"Đuôi -ed", se:"Đuôi -s / -es", stress:"Trọng âm" }[b.dataset.pp]; startSession(t, pick(POOL[b.dataset.pp], 15)); });
    $$("[data-say]", k).forEach(b => b.onclick = () => say(b.dataset.say, 0.8));
    $$("[data-pair]", k).forEach(b => b.onclick = () => { const [x, y] = b.dataset.pair.split("|"); speak([{ text:x, pause:650 }, { text:y, pause:650 }, { text:x, pause:650 }, { text:y }], 0.8); });
  } else {
    const st = stat(allQIds(POOL.dict));
    k.innerHTML = `<div class="card"><div class="card-h">Chép chính tả</div><p>Nghe một câu, gõ lại toàn bộ, rồi kiểm tra từng từ. Đây là cách nhanh nhất để sửa lỗi không nghe được âm cuối và nối âm.</p>
      <p class="muted small">${st.n}/${st.total} câu đã làm${st.pct != null ? ` · ${st.pct}% chép đúng hoàn toàn` : ""}</p>
      <div class="row gap wrap"><button class="btn pri" id="dStart">Chép 10 câu</button><button class="btn" id="dP1">Chép câu Part 1</button></div></div>
      <div class="card"><div class="card-h">Cách luyện hiệu quả</div><ol class="steps"><li>Nghe ở tốc độ 0.85×, gõ lại cả câu.</li><li>Sai từ nào → bấm Chậm, đọc ghi chú nối âm.</li><li>Nghe lại ở 1.0× và đọc to theo (shadowing) 3 lần.</li></ol></div>`;
    $("#dStart").onclick = () => startSession("Chép chính tả", pick(POOL.dict, 10));
    $("#dP1").onclick = () => startSession("Chép câu Part 1", shuffle(P1).slice(0, 8).map((p, i) => ({ kind:"dict", id:"d1." + P1.indexOf(p), ids:[], text:p[1][p[2]], note:p[3] })).map(u => (u.ids = [u.id], u)));
  }
}

/* ---------------- charts ---------------- */
function lastDays(n) { const out = []; const d = new Date(); d.setDate(d.getDate() - (n - 1)); for (let i = 0; i < n; i++) { const k = dkey(d); out.push({ k, d:new Date(d), ...dayLog(k) }); d.setDate(d.getDate() + 1); } return out; }
function niceMax(v) { if (v <= 5) return 5; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; }
function barChart(n, metric, compact) {
  const days = lastDays(n);
  const val = x => metric === "q" ? x.q : Math.round(x.sec / 60);
  const max = niceMax(Math.max(metric === "min" ? S.goal : 5, ...days.map(val)));
  const mainEl = $("#main"); const mw = mainEl ? mainEl.getBoundingClientRect().width - 2 * parseFloat(getComputedStyle(mainEl).paddingLeft || 0) - 40 : 600;
  const W = Math.round(Math.max(280, Math.min(880, mw || 600))), H = compact ? 150 : 210, L = 34, R = 8, T = 12, B = 30;
  const iw = W - L - R, ih = H - T - B, bw = iw / n, barW = Math.min(34, bw * 0.62);
  const y = v => T + ih - (v / max) * ih;
  const ticks = [0, max / 2, max];
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${metric === "q" ? "Số câu" : "Số phút"} mỗi ngày">`;
  ticks.forEach(t => { s += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${L - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`; });
  if (metric === "min") s += `<line class="goal" x1="${L}" x2="${W - R}" y1="${y(S.goal)}" y2="${y(S.goal)}"/><text class="axis goal-t" x="${W - R}" y="${y(S.goal) - 5}" text-anchor="end">mục tiêu ${S.goal}′</text>`;
  days.forEach((x, i) => {
    const v = val(x), cx = L + bw * i + bw / 2, h = Math.max(v > 0 ? 3 : 0, (v / max) * ih), top = T + ih - h;
    const r = Math.min(4, barW / 2, h);
    const isToday = i === n - 1;
    if (h > 0) s += `<path class="bar${isToday ? " today" : ""}" d="M${cx - barW/2},${T + ih} V${top + r} Q${cx - barW/2},${top} ${cx - barW/2 + r},${top} H${cx + barW/2 - r} Q${cx + barW/2},${top} ${cx + barW/2},${top + r} V${T + ih} Z"/>`;
    const lbl = n <= 7 ? WD[x.d.getDay()] : (i % 2 === (n - 1) % 2 ? x.d.getDate() + "" : "");
    s += `<text class="axis${isToday ? " strong" : ""}" x="${cx}" y="${H - 10}" text-anchor="middle">${lbl}</text>`;
    s += `<rect class="hit" x="${L + bw * i}" y="${T}" width="${bw}" height="${ih}" data-tip="${x.d.getDate()}/${x.d.getMonth() + 1}|${Math.round(x.sec / 60)}|${x.q}|${x.q ? Math.round(x.ok / x.q * 100) : -1}"/>`;
  });
  s += `<line class="base" x1="${L}" x2="${W - R}" y1="${T + ih}" y2="${T + ih}"/></svg>`;
  return `<div class="chart-wrap">${s}<div class="tip" hidden></div></div>`;
}
function wireChart(root) {
  $$(".chart-wrap", root).forEach(w => {
    const tip = $(".tip", w);
    const show = (r, e) => {
      const [d, mi, q, p] = r.dataset.tip.split("|");
      tip.innerHTML = `<b>${d}</b><span>${mi} phút</span><span>${q} câu${+p >= 0 ? ` · ${p}% đúng` : ""}</span>`;
      tip.hidden = false;
      const wb = w.getBoundingClientRect(), rb = r.getBoundingClientRect();
      let x = rb.left - wb.left + rb.width / 2; x = Math.max(60, Math.min(wb.width - 60, x));
      tip.style.left = x + "px";
      $$(".hit", w).forEach(h => h.classList.toggle("act", h === r));
    };
    $$(".hit", w).forEach(r => { r.addEventListener("pointerenter", e => show(r, e)); r.addEventListener("click", e => show(r, e)); });
    w.addEventListener("pointerleave", () => { tip.hidden = true; $$(".hit", w).forEach(h => h.classList.remove("act")); });
  });
}
function heatmap(weeks = 17) {
  const end = new Date(); const start = new Date(end); start.setDate(end.getDate() - (weeks * 7 - 1));
  const off = (start.getDay() + 6) % 7; start.setDate(start.getDate() - off);
  const cell = 14, gap = 3, L = 24, T = 16;
  const totalDays = Math.round((end - start) / 864e5) + 1, cols = Math.ceil(totalDays / 7);
  const W = L + cols * (cell + gap), H = T + 7 * (cell + gap);
  let s = `<svg class="heat" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Lịch học theo ngày">`;
  ["T2","","T4","","T6","","CN"].forEach((t, i) => { if (t) s += `<text class="axis" x="0" y="${T + i * (cell + gap) + 11}">${t}</text>`; });
  const d = new Date(start); let lastMonth = -1;
  for (let i = 0; i < totalDays; i++) {
    const c = Math.floor(i / 7), r = i % 7, k = dkey(d), m = Math.round(dayLog(k).sec / 60);
    const lvl = m === 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : m < 30 ? 3 : 4;
    if (r === 0 && d.getMonth() !== lastMonth) { s += `<text class="axis" x="${L + c * (cell + gap)}" y="10">Th${d.getMonth() + 1}</text>`; lastMonth = d.getMonth(); }
    s += `<rect class="hc l${lvl}" x="${L + c * (cell + gap)}" y="${T + r * (cell + gap)}" width="${cell}" height="${cell}" rx="3"><title>${d.getDate()}/${d.getMonth() + 1}: ${m} phút, ${dayLog(k).q} câu</title></rect>`;
    d.setDate(d.getDate() + 1);
  }
  return s + `</svg>`;
}

function viewProgress(m) {
  const logs = Object.values(S.log), totSec = logs.reduce((a, l) => a + l.sec, 0), totQ = logs.reduce((a, l) => a + l.q, 0), totOk = logs.reduce((a, l) => a + l.ok, 0);
  const metric = S.metric || "min";
  const secRows = Object.keys(SEC).map(k => { const ids = ALLIDS.filter(id => secOf(id) === k); return { k, ...stat(ids) }; });
  const days7 = lastDays(7), avg7 = Math.round(days7.reduce((a, x) => a + x.sec, 0) / 7 / 60);
  m.innerHTML = `<h1 class="vt">Tiến độ</h1>
  <div class="tiles">
    <div class="tile"><span>Tổng thời gian</span><b>${fmtDur(totSec)}</b></div>
    <div class="tile"><span>Trung bình 7 ngày</span><b>${avg7} phút/ngày</b></div>
    <div class="tile"><span>Tổng câu đã làm</span><b>${totQ}</b></div>
    <div class="tile"><span>Độ chính xác</span><b>${totQ ? Math.round(totOk / totQ * 100) + "%" : "—"}</b></div>
    <div class="tile"><span>Chuỗi hiện tại</span><b>${streak()} ngày</b></div>
    <div class="tile"><span>Chuỗi dài nhất</span><b>${bestStreak()} ngày</b></div>
  </div>
  <section class="card"><div class="card-h row between wrap"><span>14 ngày gần đây</span><div class="seg sm">${[["min","Phút"],["q","Số câu"]].map(([k, t]) => `<button data-m="${k}" class="${metric === k ? "on" : ""}">${t}</button>`).join("")}</div></div>${barChart(14, metric)}<p class="muted small">Chạm vào cột để xem chi tiết. Thời gian chỉ được tính khi bạn đang làm bài trong một lượt luyện, không tính lúc ở ngoài menu. Một ngày được tính vào chuỗi khi luyện từ 5 phút hoặc 10 câu.</p></section>
  <section class="card"><div class="card-h">Lịch học</div><div class="heat-wrap">${heatmap()}</div><div class="legend"><span>Ít</span>${[0,1,2,3,4].map(l => `<i class="hc l${l}"></i>`).join("")}<span>Nhiều (≥30 phút)</span></div></section>
  <section class="card"><div class="card-h">Độ chính xác theo phần</div>
    <div class="acc">${secRows.map(r => `<div class="acc-row"><span class="acc-l">${SEC[r.k]}</span><span class="acc-t"><span style="width:${r.pct ?? 0}%"></span></span><span class="acc-v">${r.pct != null ? r.pct + "%" : "—"}</span><span class="acc-c muted">${r.n}/${r.total}${r.n >= 5 && r.pct < 60 ? ` <em class="weak-pill">Yếu</em>` : ""}</span></div>`).join("")}</div>
    <p class="muted small">Phần trăm tính theo lần làm gần nhất của mỗi câu. Số bên phải: câu đã làm / tổng số câu.</p>
    ${wrongUnits().length ? `<button class="btn pri" id="pWrong">Ôn ${Math.min(20, wrongUnits().length)} mục đã sai</button>` : ""}</section>
  <section class="card"><div class="card-h">Cài đặt</div>
    <div class="set-row"><span>Mục tiêu mỗi ngày</span><div class="seg sm">${[15,20,30,45,60].map(g => `<button data-goal="${g}" class="${S.goal === g ? "on" : ""}">${g}′</button>`).join("")}</div></div>
    <div class="set-row"><label for="voiceSel">Giọng đọc</label><select id="voiceSel"></select></div>
    <div class="set-row"><span>Tốc độ đọc</span><div class="seg sm">${[0.6,0.75,0.85,1].map(r => `<button data-rate="${r}" class="${S.rate === r ? "on" : ""}">${r}×</button>`).join("")}</div></div>
    <div class="set-row"><label for="apChk">Tự phát âm thanh khi sang câu mới</label><input type="checkbox" id="apChk" ${S.autoplay ? "checked" : ""}></div>
    <div class="set-row"><span>Thử giọng</span><button class="btn sm" id="tryV">${ICON.spk} Nghe thử</button></div>
    <div class="set-row"><span>Xóa toàn bộ tiến độ</span><span id="resetBox"><button class="btn sm bad-o" id="reset">Xóa dữ liệu</button></span></div>
  </section>`;
  wireChart(m);
  $$("[data-m]", m).forEach(b => b.onclick = () => { S.metric = b.dataset.m; save(); render(); });
  $$("[data-goal]", m).forEach(b => b.onclick = () => { S.goal = +b.dataset.goal; save(); render(); });
  $$("[data-rate]", m).forEach(b => b.onclick = () => { S.rate = +b.dataset.rate; save(); render(); });
  const vs = $("#voiceSel", m); fillVoiceSel(vs); vs.onchange = () => { S.voice = +vs.value; save(); };
  $("#apChk").onchange = e => { S.autoplay = e.target.checked; save(); };
  $("#tryV").onclick = () => speak([{ text:"Welcome to your daily TOEIC practice.", who:"W", pause:400 }, { text:"Let's get started.", who:"M" }]);
  const pw = $("#pWrong"); if (pw) pw.onclick = startWrong;
  $("#reset").onclick = () => { $("#resetBox").innerHTML = `<span class="muted small">Chắc chắn?</span> <button class="btn sm bad-o" id="reset2">Xóa hết</button> <button class="btn sm" id="cancel">Hủy</button>`;
    $("#reset2").onclick = () => { S.ans = {}; S.log = {}; S.known = {}; S.path = {}; save(); toast("Đã xóa tiến độ."); render(); };
    $("#cancel").onclick = render; };
  const hw = $(".heat-wrap", m); if (hw) hw.scrollLeft = hw.scrollWidth;
}

/* ---------------- boot ---------------- */
let rzT, lastW = innerWidth;
addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { if (Math.abs(innerWidth - lastW) > 40 && !SES && (S.view === "home" || S.view === "progress")) { lastW = innerWidth; render(); } }, 250); });
$$(".nav-btn").forEach(b => b.onclick = () => go(b.dataset.v));
$("#brandHome").onclick = () => go("home");
if (!HAS_REC && !synth) setTimeout(() => toast("Trình duyệt không hỗ trợ đọc giọng nói — phần nghe sẽ không có âm thanh."), 800);
if (HAS_REC) setTimeout(() => { const ric = window.requestIdleCallback || (f => setTimeout(f, 1500)); ric(() => ["l","c","d","v","p"].reduce((pr, p) => pr.then(() => loadPack(p)), Promise.resolve())); }, 2500);
render();
window.__t650 = { U, POOL, S };
})();
