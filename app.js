/**
 * ============================================================================
 * LEARNISH • SOPHISTICATED PLAYFUL SYSTEM
 * Mimari: Maarif 5. Sınıf Modülü | YDS & YÖKDİL Akademik | The Oxford 5000
 * Tasarım: Sophisticated Playful (DESIGN.md Design System)
 * Web Speech API, Web Audio API Synthesizer, PWA, Cloze Test & Flashcards
 * ============================================================================
 */

(function () {
  'use strict';

  // Fallback tema metaverisi (words-data.js yeniden üretildiğinde THEMES_DATA eksik kalırsa devreye girer)
  const THEMES_DATA = (typeof window !== 'undefined' && window.THEMES_DATA) ? window.THEMES_DATA : {
    "1": { num: 1, code: "THEME 1", title: "SCHOOL LIFE", titleTr: "Okul Yaşamı", full: "THEME 1: SCHOOL LIFE", color: "#1e3a8a", badgeBg: "#1d4ed8", border: "#3b82f6" },
    "2": { num: 2, code: "THEME 2", title: "CLASSROOM LIFE", titleTr: "Sınıf Yaşamı", full: "THEME 2: CLASSROOM LIFE", color: "#0f766e", badgeBg: "#0d9488", border: "#14b8a6" },
    "3": { num: 3, code: "THEME 3", title: "PERSONAL LIFE", titleTr: "Kişisel Yaşam", full: "THEME 3: PERSONAL LIFE", color: "#b45309", badgeBg: "#d97706", border: "#f59e0b" },
    "4": { num: 4, code: "THEME 4", title: "FAMILY LIFE", titleTr: "Aile Yaşamı", full: "THEME 4: FAMILY LIFE", color: "#be123c", badgeBg: "#e11d48", border: "#f43f5e" },
    "5": { num: 5, code: "THEME 5", title: "LIFE IN THE NEIGHBOURHOOD AND CITY", titleTr: "Mahalle ve Şehirde Yaşam", full: "THEME 5: LIFE IN THE NEIGHBOURHOOD AND CITY", color: "#4338ca", badgeBg: "#4f46e5", border: "#6366f1" },
    "6": { num: 6, code: "THEME 6", title: "LIFE IN THE WORLD", titleTr: "Dünyada Yaşam — Beslenme & Kültür", full: "THEME 6: LIFE IN THE WORLD", color: "#15803d", badgeBg: "#16a34a", border: "#22c55e" },
    "7": { num: 7, code: "THEME 7", title: "LIFE IN NATURE", titleTr: "Doğada Yaşam — Hayvanlar, Bitkiler & Çevre", full: "THEME 7: LIFE IN NATURE", color: "#047857", badgeBg: "#059669", border: "#10b981" },
    "8": { num: 8, code: "THEME 8", title: "LIFE IN THE UNIVERSE AND FUTURE", titleTr: "Evrende ve Gelecekte Yaşam & İleri Kavramlar", full: "THEME 8: LIFE IN THE UNIVERSE AND FUTURE", color: "#6b21a8", badgeBg: "#9333ea", border: "#a855f7" },
    "9": { num: 9, code: "KÜTÜPHANE", title: "KELİME KÜTÜPHANESİ", titleTr: "Kelime Kütüphanesi (A1-C1 Dünya Standardı)", full: "KELİME KÜTÜPHANESİ (A1-C1)", color: "#0284c7", badgeBg: "#0284c7", border: "#38bdf8" },
    "10": { num: 10, code: "YDS/YÖKDİL", title: "YDS & YÖKDİL AKADEMİK", titleTr: "YDS & YÖKDİL Akademik Sınav Hazırlık (2020–2026)", full: "YDS & YÖKDİL AKADEMİK (B2-C1)", color: "#7c3aed", badgeBg: "#8b5cf6", border: "#a78bfa" }
  };

  // Geometric 2px-stroke square-cap SVG icons
  const ICONS = {
    speaker: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    repeat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
    starOutline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    shuffle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
    mic: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`
  };

  // Minimalist Monochrome Vector Iconography System (Sophisticated Playful)
  const UI_ICONS = {
    school: '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/>',
    bookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    brain: '<path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-5.04z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-5.04z"/>',
    repeat: '<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
    alert: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
    zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
    fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    cross: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    speaker: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    starOutline: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    starFilled: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    refresh: '<path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
    sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
    compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    tools: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.76.76 1.23 1.52 1.41 2.5"/>',
    bug: '<rect x="8" y="9" width="8" height="10" rx="4"/><path d="m19 7-3 2"/><path d="m5 7 3 2"/><path d="m19 19-3-2"/><path d="m5 19 3-2"/><path d="M20 13h-4"/><path d="M4 13h4"/><path d="m10 4 1 2"/><path d="m14 4-1 2"/>',
    headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
    circleDot: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    mail: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    chevronDown: '<polyline points="6 9 12 15 18 9"/>'
  };

  function renderIcon(name, size = 18, className = '', strokeWidth = 2.2) {
    const path = UI_ICONS[name] || UI_ICONS.sparkles;
    const cls = className ? `ui-icon ${className}` : 'ui-icon';
    const isFilled = name === 'starFilled';
    const fillAttr = isFilled ? 'currentColor' : 'none';
    return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fillAttr}" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" data-icon="${name}">${path}</svg>`;
  }

  // ==========================================================================
  // YDS AKADEMİK EŞ ANLAM VE PREPOSITION SÖZLÜĞÜ (High-Yield Collocations)
  // ==========================================================================
  const YDS_SYNONYM_MAP = {
    'abandon': 'relinquish, forsake, give up',
    'abolish': 'eliminate, eradicate, annul',
    'abundant': 'plentiful, ample, copious',
    'accelerate': 'expedite, speed up, hasten',
    'accommodate': 'lodge, adapt, adjust',
    'accumulate': 'amass, hoard, gather',
    'accurate': 'precise, exact, correct',
    'achieve': 'accomplish, attain, realize',
    'acknowledge': 'admit, recognize, concede',
    'acquire': 'obtain, gain, procure',
    'adapt': 'adjust, accommodate, modify',
    'adequate': 'sufficient, ample, enough',
    'adhere': 'stick, comply, cling',
    'adjacent': 'neighboring, adjoining, proximate',
    'adjust': 'modify, alter, adapt',
    'administer': 'manage, govern, supervise',
    'advocate': 'champion, support, defend',
    'alleviate': 'mitigate, relieve, ease',
    'allocate': 'assign, distribute, allot',
    'alter': 'change, modify, transform',
    'ambiguity': 'vagueness, obscurity, uncertainty',
    'anticipate': 'expect, predict, foresee',
    'apparent': 'obvious, evident, manifest',
    'appreciate': 'value, esteem, acknowledge',
    'approach': 'method, strategy, tactic',
    'appropriate': 'suitable, proper, fitting',
    'approximate': 'estimated, rough, near',
    'arbitrary': 'random, capricious, whimsical',
    'aspect': 'facet, feature, side',
    'assemble': 'gather, collect, congregate',
    'assess': 'evaluate, judge, appraise',
    'assign': 'allocate, allot, appoint',
    'assume': 'presume, suppose, postulate',
    'attain': 'achieve, accomplish, gain',
    'attribute': 'ascribe, assign, credit',
    'authority': 'power, command, jurisdiction',
    'available': 'accessible, obtainable, handy',
    'benefit': 'advantage, profit, gain',
    'brief': 'short, concise, succinct',
    'capable': 'competent, able, proficient',
    'capacity': 'volume, ability, potential',
    'cease': 'stop, terminate, halt',
    'channel': 'direct, guide, funnel',
    'clarify': 'elucidate, explain, illuminate',
    'collapse': 'cave in, fall down, disintegrate',
    'commence': 'begin, start, initiate',
    'compensate': 'recompense, reimburse, make up',
    'compile': 'assemble, gather, collect',
    'comprehensive': 'exhaustive, complete, extensive',
    'comprise': 'consist of, include, encompass',
    'conceive': 'envisage, imagine, formulate',
    'conclude': 'deduce, infer, terminate',
    'conduct': 'carry out, execute, perform',
    'confirm': 'verify, corroborate, substantiate',
    'conform': 'comply, obey, adhere',
    'consent': 'agree, approve, acquiesce',
    'consequent': 'resulting, following, subsequent',
    'considerable': 'substantial, significant, sizeable',
    'consist': 'comprise, contain, include',
    'constant': 'continual, persistent, ceaseless',
    'constitute': 'make up, form, compose',
    'constrain': 'restrict, curb, limit',
    'construct': 'build, assemble, erect',
    'consult': 'confer, advise, discuss',
    'consume': 'ingest, deplete, expend',
    'contradict': 'refute, dispute, oppose',
    'contrary': 'opposite, conflicting, opposed',
    'contribute': 'give, donate, add',
    'controversy': 'dispute, argument, debate',
    'conventional': 'traditional, standard, customary',
    'convert': 'transform, change, turn',
    'convey': 'communicate, impart, transmit',
    'convince': 'persuade, assure, satisfy',
    'crucial': 'vital, critical, essential',
    'decline': 'decrease, diminish, refuse',
    'deduce': 'infer, conclude, derive',
    'demonstrate': 'exhibit, display, prove',
    'denote': 'indicate, signify, mean',
    'deny': 'reject, refute, disclaim',
    'depict': 'portray, describe, illustrate',
    'deprive': 'divest, strip, dispossess',
    'derive': 'originate, stem, obtain',
    'deteriorate': 'worsen, decline, degenerate',
    'deviate': 'diverge, depart, stray',
    'differentiate': 'distinguish, discern, discriminate',
    'diminish': 'decrease, lessen, shrink',
    'discrete': 'distinct, separate, individual',
    'discriminate': 'differentiate, distinguish, single out',
    'displace': 'dislodge, supplant, replace',
    'display': 'exhibit, show, expose',
    'dispose': 'incline, arrange, discard',
    'distinct': 'clear, discrete, noticeable',
    'distort': 'warp, twist, misrepresent',
    'distribute': 'allot, allocate, disperse',
    'diverse': 'varied, sundry, manifold',
    'dominate': 'govern, rule, control',
    'drastic': 'severe, radical, extreme',
    'eliminate': 'eradicate, exterminate, remove',
    'emerge': 'arise, surface, appear',
    'emphasize': 'stress, underline, highlight',
    'empirical': 'observational, experimental, factual',
    'enable': 'empower, facilitate, allow',
    'encounter': 'meet, confront, face',
    'enhance': 'improve, augment, boost',
    'enormous': 'immense, colossal, gigantic',
    'ensure': 'guarantee, secure, assure',
    'equivalent': 'equal, identical, comparable',
    'erode': 'wear away, corrode, deteriorate',
    'establish': 'found, institute, set up',
    'estimate': 'gauge, calculate, approximate',
    'evaluate': 'appraise, assess, judge',
    'evident': 'obvious, apparent, patent',
    'evolve': 'develop, progress, unfold',
    'exceed': 'surpass, outstrip, transcend',
    'exclude': 'bar, omit, preclude',
    'exhibit': 'display, show, demonstrate',
    'expand': 'enlarge, swell, broaden',
    'exploit': 'utilize, leverage, abuse',
    'expose': 'reveal, uncover, disclose',
    'extract': 'withdraw, pull out, deduce',
    'facilitate': 'ease, simplify, expedite',
    'fluctuate': 'vacillate, waver, oscillate',
    'fundamental': 'basic, primary, essential',
    'generate': 'produce, create, engender',
    'guarantee': 'assure, warrant, ensure',
    'highlight': 'accentuate, emphasize, spotlight',
    'hypothesis': 'theory, proposition, premise',
    'identify': 'recognize, distinguish, determine',
    'illustrate': 'exemplify, depict, demonstrate',
    'impact': 'effect, influence, collision',
    'implement': 'execute, enforce, realize',
    'implicate': 'incriminate, involve, entangle',
    'implicit': 'implied, tacit, unspoken',
    'imply': 'insinuate, suggest, hint',
    'impose': 'inflict, enforce, levy',
    'incentive': 'stimulus, inducement, motive',
    'incline': 'predispose, tend, slope',
    'indicate': 'signify, point out, show',
    'inevitable': 'unavoidable, inescapable, fated',
    'infer': 'deduce, gather, conclude',
    'inherent': 'intrinsic, innate, essential',
    'inhibit': 'impede, restrain, hinder',
    'initiate': 'commence, begin, launch',
    'innovate': 'originate, pioneer, introduce',
    'insight': 'intuition, discernment, understanding',
    'inspect': 'examine, scrutinize, audit',
    'instance': 'case, example, occurrence',
    'institute': 'establish, set up, initiate',
    'integral': 'essential, fundamental, indispensable',
    'integrate': 'incorporate, merge, blend',
    'integrity': 'honesty, probity, uprightness',
    'intensity': 'strength, severity, fervor',
    'interact': 'reciprocate, communicate, interface',
    'intermediate': 'middle, transitional, halfway',
    'interpret': 'explain, elucidate, translate',
    'intervene': 'intercede, mediate, intrude',
    'intrinsic': 'inherent, innate, essential',
    'invoke': 'call upon, summon, appeal to',
    'isolate': 'segregate, detach, insulate',
    'jeopardize': 'endanger, threaten, imperil',
    'justify': 'vindicate, substantiate, defend',
    'legislate': 'enact, ordain, codify',
    'maintain': 'sustain, preserve, uphold',
    'manifest': 'evident, apparent, display',
    'manipulate': 'maneuver, control, falsify',
    'mediate': 'arbitrate, reconcile, intercede',
    'migrate': 'relocate, wander, move',
    'minimize': 'curtail, downplay, lessen',
    'modify': 'alter, amend, adjust',
    'monitor': 'oversee, track, observe',
    'negate': 'nullify, invalidate, contradict',
    'neutral': 'impartial, unbiased, objective',
    'nevertheless': 'however, nonetheless, still',
    'notion': 'idea, concept, belief',
    'obvious': 'evident, patent, distinct',
    'occupy': 'inhabit, reside, possess',
    'occur': 'happen, transpire, take place',
    'offset': 'counterbalance, neutralize, compensate',
    'ongoing': 'continuous, progressive, in progress',
    'orient': 'align, direct, guide',
    'outcome': 'result, consequence, effect',
    'parallel': 'analogous, corresponding, matching',
    'perceive': 'discern, notice, comprehend',
    'persist': 'persevere, continue, endure',
    'perspective': 'viewpoint, outlook, angle',
    'phenomenon': 'occurrence, marvel, event',
    'plausible': 'credible, believable, reasonable',
    'potential': 'possible, latent, prospective',
    'practitioner': 'professional, clinician, specialist',
    'precede': 'forego, antecede, predate',
    'precise': 'exact, accurate, definite',
    'predict': 'forecast, foresee, foretell',
    'predominant': 'paramount, prevailing, dominant',
    'preliminary': 'initial, preparatory, introductory',
    'presume': 'assume, suppose, deduce',
    'primary': 'chief, main, essential',
    'prime': 'foremost, pristine, chief',
    'principal': 'main, chief, cardinal',
    'prior': 'previous, earlier, antecedent',
    'priority': 'precedence, urgency, preference',
    'proceed': 'continue, progress, advance',
    'prohibit': 'forbid, ban, disallow',
    'prominent': 'conspicuous, distinguished, eminent',
    'promote': 'encourage, foster, advance',
    'prospect': 'expectation, outlook, possibility',
    'radical': 'fundamental, extreme, thorough',
    'random': 'arbitrary, haphazard, chance',
    'range': 'span, spectrum, extent',
    'ratio': 'proportion, relationship, percentage',
    'rational': 'logical, sensible, reasonable',
    'react': 'respond, retaliate, behave',
    'recover': 'recuperate, regain, retrieve',
    'refine': 'polish, purify, improve',
    'regime': 'system, government, rule',
    'regulate': 'control, direct, adjust',
    'reinforce': 'strengthen, bolster, fortify',
    'reject': 'decline, refuse, spurn',
    'reluctant': 'unwilling, hesitant, disinclined',
    'rely': 'depend, count, trust',
    'require': 'demand, necessitate, need',
    'reside': 'dwell, live, inhabit',
    'resolve': 'settle, solve, determine',
    'resource': 'asset, reserve, supply',
    'respond': 'reply, answer, react',
    'restore': 'reinstate, repair, revive',
    'restrain': 'curb, suppress, check',
    'restrict': 'confine, limit, restrain',
    'retain': 'keep, maintain, preserve',
    'reveal': 'disclose, divulge, unveil',
    'revenue': 'income, earnings, yield',
    'reverse': 'invert, overturn, annul',
    'revise': 'alter, edit, rectify',
    'revolution': 'transformation, upheaval, revolt',
    'rigid': 'stiff, inflexible, unyielding',
    'role': 'function, capacity, part',
    'route': 'course, path, direction',
    'scarcely': 'barely, hardly, seldom',
    'scenario': 'situation, plot, outline',
    'schedule': 'timetable, plan, agenda',
    'scheme': 'system, blueprint, stratagem',
    'scope': 'extent, range, ambit',
    'section': 'segment, portion, part',
    'sector': 'division, area, branch',
    'secure': 'safe, protected, reliable',
    'seek': 'search for, pursue, hunt',
    'select': 'choose, pick, opt',
    'sequence': 'succession, order, series',
    'shift': 'change, move, transfer',
    'significant': 'meaningful, important, considerable',
    'simulate': 'imitate, replicate, model',
    'sole': 'single, solitary, exclusive',
    'somewhat': 'rather, slightly, moderately',
    'source': 'origin, wellspring, cause',
    'specific': 'particular, precise, explicit',
    'specify': 'state, designate, detail',
    'sphere': 'realm, globe, domain',
    'stable': 'steady, firm, secure',
    'status': 'prestige, standing, rank',
    'straightforward': 'uncomplicated, simple, direct',
    'strategy': 'plan, approach, scheme',
    'stress': 'accentuate, emphasize, strain',
    'structure': 'organization, architecture, form',
    'subsequent': 'following, consequent, succeeding',
    'subsidy': 'grant, endowment, aid',
    'substitute': 'replace, alternate, exchange',
    'successor': 'heir, inheritor, replacement',
    'sufficient': 'adequate, ample, enough',
    'sum': 'total, aggregate, amount',
    'summary': 'synopsis, abstract, overview',
    'supplement': 'augment, add to, complement',
    'survey': 'examine, poll, inspect',
    'survive': 'outlive, endure, persist',
    'suspend': 'defer, postpone, interrupt',
    'sustain': 'maintain, nourish, uphold',
    'symbol': 'emblem, token, sign',
    'target': 'objective, goal, mark',
    'task': 'assignment, job, chore',
    'team': 'squad, crew, group',
    'technical': 'scientific, specialized, skilled',
    'technique': 'method, procedure, style',
    'technology': 'engineering, machinery, know-how',
    'temporary': 'transitory, provisional, brief',
    'tense': 'tight, taut, nervous',
    'terminate': 'end, conclude, finish',
    'text': 'words, passage, transcript',
    'theme': 'topic, subject, motif',
    'theory': 'hypothesis, conjecture, concept',
    'thereby': 'thus, consequently, so',
    'thesis': 'dissertation, argument, premise',
    'topic': 'subject, theme, issue',
    'trace': 'track, find, outline',
    'tradition': 'custom, heritage, lore',
    'transfer': 'convey, relocate, shift',
    'transform': 'metamorphose, alter, convert',
    'transit': 'passage, transport, carriage',
    'transmit': 'broadcast, convey, send',
    'transport': 'convey, move, carry',
    'trigger': 'activate, provoke, spark',
    'ultimate': 'final, conclusive, supreme',
    'undergo': 'experience, endure, suffer',
    'underlie': 'support, ground, substantiate',
    'undertake': 'attempt, initiate, shoulder',
    'uniform': 'homogeneous, consistent, regular',
    'unify': 'consolidate, integrate, merge',
    'unique': 'singular, unparalleled, peerless',
    'utilize': 'employ, exploit, use',
    'valid': 'legitimate, sound, authentic',
    'vary': 'diverge, differ, fluctuate',
    'vehicle': 'medium, conduit, conveyance',
    'version': 'edition, rendition, variant',
    'via': 'through, by means of, through the medium of',
    'violate': 'infringe, contravene, breach',
    'virtual': 'near, practical, simulated',
    'visible': 'apparent, conspicuous, noticeable',
    'vision': 'foresight, perception, sight',
    'visual': 'optical, graphic, pictorial',
    'volume': 'quantity, mass, loudness',
    'voluntary': 'optional, unpaid, deliberate',
    'welfare': 'well-being, health, prosperity',
    'whereas': 'while, on the other hand, although',
    'whereby': 'by which, according to which',
    'widespread': 'pervasive, prevalent, extensive'
  };

  // Veri şema sürümü — artırıldığında localStorage'daki eski yapı güvenle taşınır.
  const SCHEMA_VERSION = 3;

  // Güvenli localStorage okuma: depolama engelliyse (gizli sekme, kısıtlı okul tarayıcısı) ya da
  // kayıtlı veri bozulmuşsa uygulama açılışta çökmesin; varsayılan değerle devam edilsin.
  function lsGet(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v === null ? fallback : v; } catch (e) { return fallback; }
  }
  function lsSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { console.warn('[Learnish] localStorage yazma hatası:', key); }
  }
  function lsJSON(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v === null) return fallback;
      const parsed = JSON.parse(v);
      if (parsed === null || typeof parsed !== typeof fallback) return fallback;
      if (Array.isArray(fallback) !== Array.isArray(parsed)) return fallback;
      return parsed;
    } catch (e) {
      console.warn('[Learnish] Bozuk kayıt sıfırlandı:', key);
      return fallback;
    }
  }

  // Şema versiyonu kontrolü: eski yapı varsa güvenli sıfırlama yerine sadece eksik alanları tamamla.
  (function migrateSchema() {
    try {
      const storedVer = parseInt(lsGet('mk_schema_version', '0'), 10);
      if (storedVer < 1) {
        // v0→v1: mk_srs ve mk_mistakes anahtarları eklendi; varsa koru, yoksa default bırak.
      }
      if (storedVer < 2) {
        // v1→v2: activityLog yapısı değişti; bozuk array ise sıfırla.
        const log = lsJSON('mk_activity_log', null);
        if (log !== null && (!Array.isArray(log) || (log.length > 0 && typeof log[0] !== 'object'))) {
          lsSet('mk_activity_log', '[]');
        }
      }
      lsSet('mk_schema_version', String(SCHEMA_VERSION));
    } catch (e) { /* sessiz devam */ }
  })();

  // Sınıf havuzu önbellekleri (bkz. getActiveGradePool) — açılışta takvim hesaplanırken hazır olmalı
  const _wordIndex = new Map();          // küçük harf İngilizce → kelime
  const _compactIndex = new Map();       // boşluk/tire/nokta farkı yok sayılır: "free-time" = "free time" = "freetime"
  const _gradePoolCache = new Map();     // sınıf → { pool, meta: Map(id → {weekNum, unitNum, unitTitle, unitTitleTr}) }

  // State Management
  const STATE = {
    activeModule: lsGet('learnish_active_module') || 'maarif', // 'maarif' | 'yds' | 'oxford' | 'all'
    selectedGrade: Math.max(2, Math.min(12, parseInt(lsGet('learnish_selected_grade'), 10) || 5)), // 2-12
    activeCurriculumWeek: null, // null = current academic week, or 1-36
    currentView: 'home', // 'home', 'daily', 'flashcard', 'quiz', 'directory', 'stats'
    viewHistory: ['home'],
    currentDay: 1, // Maarif: 1-82, YDS: 1-145
    activeFlashcardIndex: 0,
    filteredFlashcards: [],
    flashcardFlipped: false,
    flashcardSource: 'daily',
    flashcardIsShuffled: false,
    quizState: {
      active: false,
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      mode: 'en-tr', // 'en-tr', 'tr-en', 'cloze', 'definition', 'listening'
      source: 'daily',
      answered: false
    },
    directoryFilters: {
      search: '',
      dataset: 'all', // 'all', 'oxford', 'maarif'
      theme: 'all',
      cefr: 'all',
      status: 'all',
      pos: 'all' // 'all', 'verb', 'noun', 'adj_adv' (especially for YDS)
    },
    library: { letter: null, rendered: 0, bookId: null, searchOpen: false, filtersOpen: false, dirty: false },
    settings: {
      accent: lsGet('mk_accent') || 'en-GB', // 'en-GB' or 'en-US'
      speed: parseFloat(lsGet('mk_speed') || '1.0') || 1.0,
      soundEffects: lsGet('mk_sound') !== 'false',
      theme: lsGet('mk_theme') || 'light'
    },
    userData: {
      learned: new Set(lsJSON('mk_learned', [])),
      review: new Set(lsJSON('mk_review', [])),
      starred: new Set(lsJSON('mk_starred', [])),
      stats: Object.assign({
        quizzesPlayed: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        bestStreak: 0,
        speakingAttempts: 0,
        speakingSuccesses: 0
      }, lsJSON('mk_stats', {})),
      activityLog: lsJSON('mk_activity_log', []),
      srs: lsJSON('mk_srs', {}),
      mistakes: lsJSON('mk_mistakes', {})
    }
  };

  // ==========================================================================
  // MEB Yıllık Çerçeve Planı Takvim Eşleştirme Motoru (36 Hafta, 82 Gün)
  // ==========================================================================
  /**
   * Seçili sınıf için "bugün" bilgisi. Tarih tahmini yapılmaz: yıllık plandaki gerçek hafta tarihleri
   * ve tatiller (CURRICULUM_CLASSIFIER.getSchedule) kullanılır. "day", günde 10 kelimelik çalışmada
   * bu haftanın kelimelerinin başladığı gündür.
   */
  function getMEBCalendarInfo(date = new Date()) {
    const trMonths = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const trDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dateFormatted = `${date.getDate()} ${trMonths[date.getMonth() + 1]} ${trDays[date.getDay()]}`;
    const classifier = (typeof window !== 'undefined') ? window.CURRICULUM_CLASSIFIER : null;
    const gNum = getActiveGrade();
    if (!classifier) {
      return { day: 1, weekNum: 1, themeNum: 1, themeName: '', dateFormatted, isBreak: false, breakName: '', weekType: 'theme', schedule: null };
    }
    const s = classifier.getSchedule(gNum, date);
    const pool = getActiveGradePool(gNum);
    const positions = new Map(pool.map((w, i) => [w.id, i]));
    let firstIdx = -1;
    (s.targetWords || []).forEach(t => {
      const w = lookupCurriculumWord(t);
      const i = w ? positions.get(w.id) : undefined;
      if (i !== undefined && (firstIdx < 0 || i < firstIdx)) firstIdx = i;
    });
    const day = Math.floor(Math.max(0, firstIdx) / 10) + 1;
    let themeName;
    if (s.isBreak) themeName = `${s.breakName} • ${s.unitTitleTr || s.unitTitle} tekrarı`;
    else if (s.weekType === 'theme') themeName = `${s.unitCode}: ${s.unitTitle} (${s.unitTitleTr})`;
    else themeName = `${s.weekLabelTr} • ${s.unitTitleTr || s.unitTitle}`;
    return {
      day, weekNum: s.weekNum, themeNum: s.unitNum, themeName, dateFormatted,
      isBreak: s.isBreak, breakName: s.breakName, weekType: s.weekType, schedule: s
    };
  }

  // Ensure current day is restored or defaults to MEB calendar day
  const todayMEBInitial = getMEBCalendarInfo();
  const savedDay = parseInt(localStorage.getItem('mk_current_day'), 10);
  if (savedDay && savedDay >= 1 && savedDay <= 150) {
    STATE.currentDay = savedDay;
  } else if (STATE.activeModule === 'maarif') {
    STATE.currentDay = todayMEBInitial.day;
  }

  // ==========================================================================
  // Web Audio API Synthesizer (Zero External Audio Files)
  // ==========================================================================
  
  // Fisher-Yates (Knuth) Shuffle Algorithm (True Random Distribution)
  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = copy[i];
      copy[i] = copy[j];
      copy[j] = temp;
    }
    return copy;
  }

  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!STATE.settings.soundEffects) return;
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      if (type === 'correct') {
        // Melodic major chord
        [659.25, 830.61, 987.77].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.06);
          gain.gain.setValueAtTime(0.16, now + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.3);
        });
      } else if (type === 'wrong') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(130, now + 0.25);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'flip') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio playback note:', e);
    }
  }

  // ==========================================================================
  // Web Speech API (Native TTS Pronunciation) — Güvenilir ses servisi
  // ==========================================================================
  let synthVoices = [];
  let _ttsSupported = null; // null = henüz test edilmedi

  // Yüksek kaliteli İngilizce ses öncelik sırası (yerel > Google > genel)
  const _VOICE_PRIORITY = ['Daniel', 'Karen', 'Moira', 'Samantha', 'Google UK English', 'Google US English', 'Google English', 'Natural'];

  function _selectBestVoice(lang) {
    if (!synthVoices.length) return null;
    const prefix = lang.substring(0, 2).toLowerCase(); // 'en'
    // Önce tam eşleşme + öncelikli isimler
    for (const name of _VOICE_PRIORITY) {
      const v = synthVoices.find(v => v.lang.toLowerCase().startsWith(prefix) && v.name.includes(name));
      if (v) return v;
    }
    // Sonra yerel (localService) ses
    const local = synthVoices.find(v => v.lang.toLowerCase().startsWith(prefix) && v.localService);
    if (local) return local;
    // Herhangi bir İngilizce ses
    return synthVoices.find(v => v.lang.toLowerCase().startsWith(prefix)) || null;
  }

  function loadVoices() {
    if (!('speechSynthesis' in window && window.speechSynthesis)) {
      _ttsSupported = false;
      return;
    }
    _ttsSupported = true;
    const update = () => {
      synthVoices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
    };
    update();
    // Bazı tarayıcılarda sesler asenkron yüklenir
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = update;
    }
    // Chrome'da onvoiceschanged bazen tetiklenmez; 500ms sonra bir kez daha kontrol et
    setTimeout(update, 500);
  }
  loadVoices();

  function speakWord(text, onEndCallback) {
    if (!text || typeof text !== 'string') {
      if (onEndCallback) onEndCallback();
      return;
    }
    if (!('speechSynthesis' in window && window.speechSynthesis)) {
      if (onEndCallback) onEndCallback();
      _showNoTtsHint();
      return;
    }

    try {
      // Kuyruk kilitlenmesini önle: yeni istek başlamadan önce mevcut sesi iptal et
      window.speechSynthesis.cancel();
      const cleanWord = text.replace(/\[.*?\]/g, '').replace(/[\/\\()]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanWord);
      utterance.lang = STATE.settings.accent || 'en-GB';
      utterance.rate = STATE.settings.speed || 1.0;
      utterance.pitch = 1.0;

      const bestVoice = _selectBestVoice(utterance.lang);
      if (bestVoice) utterance.voice = bestVoice;

      utterance.onend = () => { if (onEndCallback) onEndCallback(); };
      utterance.onerror = () => { if (onEndCallback) onEndCallback(); };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      if (onEndCallback) onEndCallback();
    }
  }

  // Cihazda TTS yoksa veya sesler henüz yoksa tek seferlik ipucu göster
  let _noTtsHintShown = false;
  function _showNoTtsHint() {
    if (_noTtsHintShown) return;
    _noTtsHintShown = true;
    const banner = document.createElement('div');
    banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:var(--dp-color-surface-1);border:1px solid var(--dp-color-border);color:var(--dp-color-ink);padding:10px 18px;border-radius:8px;font-size:0.85rem;z-index:var(--z-toast);box-shadow:0 4px 16px rgba(0,0,0,.18);';
    banner.textContent = 'Bu cihazda telaffuz sesi desteklenmiyor.';
    document.body.appendChild(banner);
    setTimeout(() => banner.remove(), 4000);
  }

  // ==========================================================================
  // ETKİLEŞİMLİ BECERİLER: SPEAKING & TELAFFUZ KOÇU (Speech Recognition & Phonetics)
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  const COACH_STATE = {
    active: false,
    targetWord: null, // word object
    isListening: false,
    interimTranscript: '',
    finalTranscript: '',
    lastEvaluation: null,
    errorMessage: '',
    errorCode: '',
    phase: 'idle',
    recordState: 'idle', // 'idle' | 'recording' | 'ready'
    recordUrl: null
  };

  const COACH_PHASE_TEXT = {
    preparing: 'Mikrofon hazırlanıyor...',
    permission: 'Tarayıcının mikrofon izin penceresini onaylayın',
    listening: 'Dinliyorum — şimdi kelimeyi söyleyin',
    speech: 'Sesiniz algılandı, devam edin...',
    processing: 'Telaffuzunuz çözümleniyor...'
  };

  function isSpeechRecognitionSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  function cleanSpeechText(text) {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ==========================================================================
  // ORTAK KONUŞMA TANIMA MOTORU (Speaking Koçu + Quiz Speaking)
  // - Aynı anda tek bir tanıyıcı; eski oturumun geç gelen olayları yok sayılır
  // - Başlamadan önce TTS ve AudioContext serbest bırakılır (mobilde mikrofonu kilitliyordu)
  // - Her hata kodu için açık Türkçe çözüm mesajı
  // ==========================================================================
  const SPEECH_ENGINE = {
    rec: null,
    session: 0,
    timers: [],
    meter: null,
    requestStop: null
  };

  function isMobileDevice() {
    const ua = navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function getSpeechErrorMessage(code) {
    const host = (window.location && window.location.origin) || '';
    const messages = {
      'unsupported': '⚠️ Bu tarayıcı konuşma tanımayı desteklemiyor (ör. Firefox). Lütfen Google Chrome, Microsoft Edge veya Safari kullanın. Aşağıdan kendi sesinizi kaydedip doğru telaffuzla karşılaştırabilirsiniz.',
      'insecure': `⚠️ Mikrofon bu adreste engellendi (${host}). Tarayıcılar mikrofonu yalnızca https:// veya localhost üzerinden açar. Telefonda http://192.168… yerine uygulamanın https (GitHub Pages) adresini kullanın.`,
      'brave': '⚠️ Brave tarayıcısı konuşma tanıma servisini engeller. Lütfen Google Chrome, Edge veya Safari kullanın.',
      'not-allowed': 'Mikrofon izni reddedildi. Adres çubuğundaki kilit simgesinden Mikrofon → İzin Ver seçip sayfayı yenileyin. Mac’te ayrıca Sistem Ayarları → Gizlilik ve Güvenlik → Mikrofon’dan tarayıcıya izin verin.',
      'service-not-allowed': 'Mikrofon çalışıyor ama konuşma tanıma servisi kapalı. Safari’de: Sistem Ayarları → Klavye → Dikte açık olmalı. Chrome’da sayfayı yenileyip tekrar deneyin.',
      'audio-capture': 'Mikrofona erişilemedi. Mikrofonun bağlı/açık olduğundan ve sistem ayarlarında tarayıcıya izin verildiğinden emin olun.',
      'no-mic': 'Bu cihazda mikrofon bulunamadı. Mikrofon/kulaklık bağlayıp tekrar deneyin.',
      'mic-busy': 'Mikrofon başka bir uygulama veya sekme tarafından kullanılıyor (Zoom, Meet, WhatsApp vb.). Kapatıp tekrar deneyin.',
      'network': 'Konuşma tanıma sunucusuna ulaşılamadı. Chrome/Edge konuşmayı tanımak için internet gerektirir. Bağlantınızı kontrol edin; VPN veya reklam engelleyici açıksa kapatmayı deneyin.',
      'no-speech': 'Ses algılanamadı. Mikrofona yakın ve net şekilde kelimeyi söyleyip tekrar deneyin.',
      'no-audio': 'Mikrofondan hiç ses gelmedi. Doğru mikrofonun seçili olduğunu kontrol edin (Mac: Sistem Ayarları → Ses → Giriş; Chrome: adres çubuğundaki mikrofon simgesi) ve tekrar deneyin.',
      'service-no-result': '⚠️ Sesiniz mikrofona ulaşıyor ama tarayıcının konuşma tanıma servisi yanıt vermedi. Chrome/Edge internet ister (VPN/reklam engelleyiciyi kapatın); Safari’de Dikte açık olmalı. Arc, Opera, Vivaldi gibi tarayıcılarda bu servis çalışmayabilir — Google Chrome deneyin. Bu arada aşağıdan sesinizi kaydedip karşılaştırabilirsiniz.',
      'aborted': 'Dinleme yarıda kesildi. Tekrar denemek için mikrofona dokunun.',
      'language-not-supported': '⚠️ Seçilen aksan bu cihazda desteklenmiyor. UK/US aksanını değiştirip tekrar deneyin.',
      'start-timeout': '⚠️ Mikrofon başlatılamadı. İzin penceresini onaylayın veya sayfayı yenileyip tekrar deneyin.',
      'start-failed': '⚠️ Mikrofon başlatılamadı. Sayfayı yenileyip tekrar deneyin.'
    };
    return messages[code] || `Mikrofon hatası (${code}). Tekrar denemek için mikrofona dokunun.`;
  }

  /** Kayıt & karşılaştırma yedeğinin önerilmesi gereken (tanıma servisi kaynaklı) hatalar */
  function isRecognitionServiceError(code) {
    return ['unsupported', 'brave', 'service-not-allowed', 'network', 'service-no-result', 'start-timeout', 'start-failed', 'language-not-supported'].includes(code);
  }

  function getSpeechEnvironmentProblem() {
    if (!isSpeechRecognitionSupported()) return 'unsupported';
    if (window.isSecureContext === false) return 'insecure';
    if (navigator.brave) return 'brave';
    return null;
  }

  // Tanıma servisi izin/mikrofon hatası verdiğinde gerçek nedeni getUserMedia ile netleştirir
  async function diagnoseMicError(code) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return code;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      // Mikrofon çalışıyor ama tanıma servisi reddediyor
      return code === 'not-allowed' ? 'service-not-allowed' : code;
    } catch (err) {
      const name = (err && err.name) || '';
      if (name === 'NotAllowedError' || name === 'SecurityError') return 'not-allowed';
      if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-mic';
      if (name === 'NotReadableError' || name === 'AbortError') return 'mic-busy';
      return code;
    }
  }

  function addSpeechTimer(fn, ms) {
    const id = setTimeout(fn, ms);
    SPEECH_ENGINE.timers.push(id);
    return id;
  }

  function clearSpeechTimers() {
    SPEECH_ENGINE.timers.forEach(id => clearTimeout(id));
    SPEECH_ENGINE.timers = [];
  }

  // --------------------------------------------------------------------------
  // Gerçek mikrofon seviye göstergesi (masaüstü): kullanıcı sesinin gerçekten
  // alındığını görür; ayrıca "ses var ama servis yanıt vermiyor" teşhisini sağlar.
  // Mobilde ikinci bir mikrofon akışı tanımayı bozabildiği için kapalıdır.
  // --------------------------------------------------------------------------
  function startMicLevelMeter(session, onLevel) {
    if (isMobileDevice() || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      if (session !== SPEECH_ENGINE.session) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      let ctx;
      try {
        ctx = new AC();
      } catch (e) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      const buf = new Uint8Array(analyser.fftSize);
      const meter = { stream, ctx, raf: 0, peak: 0 };
      const tick = () => {
        analyser.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          const v = (buf[i] - 128) / 128;
          sum += v * v;
        }
        const level = Math.min(1, Math.sqrt(sum / buf.length) * 7);
        if (level > meter.peak) meter.peak = level;
        if (onLevel) onLevel(level);
        meter.raf = requestAnimationFrame(tick);
      };
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      SPEECH_ENGINE.meter = meter;
      tick();
    }).catch(() => {});
  }

  function stopMicLevelMeter() {
    const m = SPEECH_ENGINE.meter;
    SPEECH_ENGINE.meter = null;
    if (!m) return null;
    cancelAnimationFrame(m.raf);
    m.stream.getTracks().forEach(t => t.stop());
    try { m.ctx.close(); } catch (e) {}
    return m.peak;
  }

  /** Dalga formu çubuklarını gerçek ses seviyesine göre boyar */
  function renderLevelBars(container, level) {
    if (!container) return;
    container.classList.add('live');
    const bars = container.querySelectorAll('.wave-bar');
    const n = bars.length;
    bars.forEach((bar, i) => {
      const center = 1 - Math.abs(i - (n - 1) / 2) / ((n - 1) / 2 || 1);
      const h = 6 + level * (12 + center * 22) * (0.75 + Math.random() * 0.5);
      bar.style.height = `${Math.min(34, h).toFixed(1)}px`;
    });
  }

  function resetLevelBars(container) {
    if (!container) return;
    container.classList.remove('live');
    container.querySelectorAll('.wave-bar').forEach(bar => { bar.style.height = ''; });
  }

  /** Dinlemeyi nazikçe bitirir; o ana kadar duyulanlar değerlendirilir. */
  function stopSpeechSession() {
    if (SPEECH_ENGINE.requestStop) SPEECH_ENGINE.requestStop();
  }

  /** Oturumu tamamen iptal eder; bekleyen olaylar yok sayılır. */
  function cancelSpeechSession() {
    SPEECH_ENGINE.session++;
    clearSpeechTimers();
    stopMicLevelMeter();
    SPEECH_ENGINE.requestStop = null;
    const rec = SPEECH_ENGINE.rec;
    SPEECH_ENGINE.rec = null;
    if (rec) {
      rec.onstart = rec.onaudiostart = rec.onsoundstart = rec.onspeechstart = null;
      rec.onresult = rec.onerror = rec.onend = rec.onspeechend = rec.onnomatch = null;
      try { rec.abort(); } catch (e) {}
    }
  }

  /**
   * opts: {
   *   lang,
   *   onPhase(phase)   // 'preparing' | 'permission' | 'listening' | 'speech' | 'processing'
   *   onLevel(level)   // 0..1 gerçek mikrofon seviyesi (yalnızca masaüstü)
   *   onInterim(text),
   *   onError(code, message),
   *   onEnd(alternatives[], errored)
   * }
   * Her durumda onEnd tam olarak bir kez çağrılır (bekçi zamanlayıcılar sayesinde
   * tarayıcı 'end' olayını hiç göndermese bile arayüz "dinliyorum"da takılı kalmaz).
   */
  function startSpeechSession(opts) {
    const problem = getSpeechEnvironmentProblem();
    if (problem) {
      if (opts.onError) opts.onError(problem, getSpeechErrorMessage(problem));
      if (opts.onEnd) opts.onEnd([], true);
      return false;
    }

    const hadPrevious = !!SPEECH_ENGINE.rec;
    cancelSpeechSession();
    const mySession = SPEECH_ENGINE.session;
    const isStale = () => mySession !== SPEECH_ENGINE.session;
    const phase = (p) => { if (!isStale() && opts.onPhase) opts.onPhase(p); };

    phase('preparing');

    // Ses çıkışlarını serbest bırak: konuşan TTS veya açık AudioContext mobilde mikrofonu kilitliyor
    let delay = hadPrevious ? 250 : 0;
    if (window.speechSynthesis && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
      window.speechSynthesis.cancel();
      delay = Math.max(delay, 300);
    }
    if (audioCtx && audioCtx.state === 'running') {
      try { audioCtx.suspend(); } catch (e) {}
    }

    const begin = () => {
      if (isStale()) return;
      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      let rec;
      try {
        rec = new SpeechRec();
      } catch (e) {
        if (opts.onError) opts.onError('start-failed', getSpeechErrorMessage('start-failed'));
        if (opts.onEnd) opts.onEnd([], true);
        return;
      }
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 5;
      rec.lang = opts.lang || 'en-GB';
      SPEECH_ENGINE.rec = rec;

      let started = false;
      let heardSpeech = false;
      let stopRequested = false;
      let finished = false;
      let errored = false;
      let finalAlternatives = [];
      let interimText = '';

      const finish = (reason) => {
        if (finished || isStale()) return;
        finished = true;
        clearSpeechTimers();
        SPEECH_ENGINE.requestStop = null;
        const peak = stopMicLevelMeter();
        if (SPEECH_ENGINE.rec === rec) SPEECH_ENGINE.rec = null;
        if (reason !== 'end') {
          // Tarayıcı 'end' göndermedi: tanıyıcıyı zorla kapat
          rec.onstart = rec.onaudiostart = rec.onsoundstart = rec.onspeechstart = null;
          rec.onresult = rec.onerror = rec.onend = rec.onspeechend = rec.onnomatch = null;
          try { rec.abort(); } catch (e) {}
        }

        const alternatives = finalAlternatives.length ? finalAlternatives : (interimText ? [interimText] : []);
        if (!alternatives.length && !errored) {
          // Hiç sonuç yok: nedenini olabildiğince net söyle
          let code = 'no-speech';
          if (peak !== null && peak !== undefined) {
            code = peak >= 0.08 ? 'service-no-result' : 'no-audio';
          } else if (heardSpeech) {
            code = 'service-no-result';
          }
          errored = true;
          if (opts.onError) opts.onError(code, getSpeechErrorMessage(code));
        }
        if (opts.onEnd) opts.onEnd(alternatives, errored && !alternatives.length);
      };

      const requestStop = () => {
        if (finished || isStale()) return;
        if (!started) {
          // Henüz başlamadıysa beklemeye gerek yok
          finish('user');
          return;
        }
        if (stopRequested) return;
        stopRequested = true;
        phase('processing');
        try { rec.stop(); } catch (e) {}
        // Bazı tarayıcılar stop() sonrası 'end' olayını hiç göndermiyor
        addSpeechTimer(() => finish('watchdog'), 2500);
      };
      SPEECH_ENGINE.requestStop = requestStop;

      rec.onstart = () => {
        if (isStale()) return;
        started = true;
        phase('listening');
        startMicLevelMeter(mySession, (lvl) => {
          if (!isStale() && opts.onLevel) opts.onLevel(lvl);
        });
        // Azami dinleme süresi: tek kelime için 7 sn fazlasıyla yeter
        addSpeechTimer(requestStop, 7000);
      };

      const markSpeech = () => {
        if (isStale() || heardSpeech) return;
        heardSpeech = true;
        if (!stopRequested) phase('speech');
      };
      rec.onsoundstart = markSpeech;
      rec.onspeechstart = markSpeech;

      rec.onresult = (evt) => {
        if (isStale()) return;
        heardSpeech = true;
        let interim = '';
        const finals = [];
        for (let i = 0; i < evt.results.length; i++) {
          const result = evt.results[i];
          if (result.isFinal) {
            for (let j = 0; j < result.length; j++) {
              const t = (result[j].transcript || '').trim();
              if (t && !finals.includes(t)) finals.push(t);
            }
          } else {
            interim += result[0].transcript;
          }
        }
        if (finals.length) finalAlternatives = finals;
        interimText = interim.trim();
        if (opts.onInterim) opts.onInterim(finals[0] || interimText);
        if (finals.length) {
          // Kesin sonuç geldi: 'end' gecikirse beklemeden sonuçlandır
          addSpeechTimer(() => finish('final'), 900);
        }
      };

      // Konuşma bitince hemen sonuçlandır (bazı mobil cihazlar aksi halde zaman aşımına düşüyor)
      rec.onspeechend = () => {
        if (isStale()) return;
        requestStop();
      };

      rec.onerror = (evt) => {
        if (isStale()) return;
        const code = (evt && evt.error) || 'unknown';
        // Sonuç zaten geldiyse "no-speech/aborted" gibi geç hataları önemseme
        if ((code === 'no-speech' || code === 'aborted') && (finalAlternatives.length || interimText)) return;
        // no-speech: kendi teşhisimiz (seviye ölçer) daha açıklayıcı mesaj üretir
        if (code === 'no-speech') return;
        errored = true;
        console.warn('Speech recognition error:', code, evt && evt.message);
        if (code === 'not-allowed' || code === 'audio-capture') {
          diagnoseMicError(code).then(realCode => {
            if (opts.onError) opts.onError(realCode, getSpeechErrorMessage(realCode));
          });
        } else if (opts.onError) {
          opts.onError(code, getSpeechErrorMessage(code));
        }
        // Hata sonrası 'end' gelmezse takılı kalma
        addSpeechTimer(() => finish('watchdog'), 1500);
      };

      rec.onend = () => {
        if (isStale()) return;
        finish('end');
      };

      // İzin penceresi açıkken kullanıcıyı yönlendir
      addSpeechTimer(() => {
        if (!isStale() && !started && !finished) phase('permission');
      }, 1500);

      // Servis hiç başlamazsa kullanıcıyı bekletme
      addSpeechTimer(() => {
        if (isStale() || started || finished) return;
        errored = true;
        if (opts.onError) opts.onError('start-timeout', getSpeechErrorMessage('start-timeout'));
        finish('watchdog');
      }, 15000);

      try {
        rec.start();
      } catch (e) {
        console.error('Speech recognition start failed:', e);
        errored = true;
        if (opts.onError) opts.onError('start-failed', getSpeechErrorMessage('start-failed'));
        finish('watchdog');
      }
    };

    if (delay) setTimeout(begin, delay);
    else begin();
    return true;
  }

  // --------------------------------------------------------------------------
  // YEDEK MOD: Kaydet & Karşılaştır (tanıma servisi çalışmadığında da işlevsel)
  // --------------------------------------------------------------------------
  const SELF_RECORDER = { recorder: null, stream: null, chunks: [], url: null, timer: null };

  function isSelfRecordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  function stopSelfRecordingStream() {
    if (SELF_RECORDER.timer) clearTimeout(SELF_RECORDER.timer);
    SELF_RECORDER.timer = null;
    if (SELF_RECORDER.stream) SELF_RECORDER.stream.getTracks().forEach(t => t.stop());
    SELF_RECORDER.stream = null;
  }

  function discardSelfRecording() {
    if (SELF_RECORDER.recorder && SELF_RECORDER.recorder.state !== 'inactive') {
      SELF_RECORDER.recorder.onstop = null;
      try { SELF_RECORDER.recorder.stop(); } catch (e) {}
    }
    SELF_RECORDER.recorder = null;
    stopSelfRecordingStream();
    if (SELF_RECORDER.url) URL.revokeObjectURL(SELF_RECORDER.url);
    SELF_RECORDER.url = null;
  }

  /** onState('recording' | 'ready' | 'error', urlOrMessage) */
  function toggleSelfRecording(onState) {
    if (SELF_RECORDER.recorder && SELF_RECORDER.recorder.state === 'recording') {
      SELF_RECORDER.recorder.stop();
      return;
    }
    if (!isSelfRecordingSupported()) {
      onState('error', 'Bu tarayıcı ses kaydını desteklemiyor.');
      return;
    }
    cancelSpeechSession();
    discardSelfRecording();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      SELF_RECORDER.stream = stream;
      SELF_RECORDER.chunks = [];
      let rec;
      try {
        rec = new MediaRecorder(stream);
      } catch (e) {
        stopSelfRecordingStream();
        onState('error', 'Ses kaydı başlatılamadı.');
        return;
      }
      SELF_RECORDER.recorder = rec;
      rec.ondataavailable = (e) => { if (e.data && e.data.size) SELF_RECORDER.chunks.push(e.data); };
      rec.onstop = () => {
        stopSelfRecordingStream();
        const blob = new Blob(SELF_RECORDER.chunks, { type: rec.mimeType || 'audio/webm' });
        if (SELF_RECORDER.url) URL.revokeObjectURL(SELF_RECORDER.url);
        SELF_RECORDER.url = URL.createObjectURL(blob);
        SELF_RECORDER.recorder = null;
        onState('ready', SELF_RECORDER.url);
      };
      rec.start();
      onState('recording');
      SELF_RECORDER.timer = setTimeout(() => {
        if (rec.state === 'recording') rec.stop();
      }, 5000);
    }).catch(err => {
      diagnoseMicError('not-allowed').then(code => {
        const realCode = (err && err.name === 'NotAllowedError') ? 'not-allowed' : code;
        onState('error', getSpeechErrorMessage(realCode));
      });
    });
  }

  /** Tanıyıcının verdiği alternatifler içinden hedefe en yakın olanı seçer. */
  function pickBestSpokenAlternative(alternatives, targetEn) {
    let best = null;
    alternatives.forEach(alt => {
      const evalResult = evaluatePronunciation(alt, targetEn);
      if (!best || evalResult.score > best.evalResult.score) best = { spoken: alt, evalResult };
    });
    return best;
  }

  function calculateLevenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;

    const dp = [];
    for (let i = 0; i <= m; i++) dp[i] = [i];
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,       // deletion
          dp[i][j - 1] + 1,       // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return dp[m][n];
  }

  function evaluatePronunciation(spokenText, targetWordEn) {
    const cleanTarget = cleanSpeechText(targetWordEn);
    const cleanSpoken = cleanSpeechText(spokenText);

    if (!cleanSpoken) {
      return {
        score: 0,
        tier: 'retry',
        title: 'Ses Algılanamadı',
        message: 'Mikrofona biraz daha yaklaşarak kelimeyi net seslendirin.',
        spoken: '—',
        target: targetWordEn
      };
    }

    // Exact match
    if (cleanSpoken === cleanTarget) {
      return {
        score: 100,
        tier: 'excellent',
        title: 'Mükemmel Telaffuz!',
        message: 'Kusursuz akıcılık ve birebir fonetik eşleşme.',
        spoken: cleanSpoken,
        target: cleanTarget
      };
    }

    // Substring / containment match
    if (cleanSpoken.includes(cleanTarget) || cleanTarget.includes(cleanSpoken)) {
      const shorter = Math.min(cleanTarget.length, cleanSpoken.length);
      const longer = Math.max(cleanTarget.length, cleanSpoken.length);
      const containment = Math.round((shorter / longer) * 100);
      if (containment >= 70) {
        const score = Math.max(86, containment);
        return {
          score: Math.min(98, score),
          tier: score >= 90 ? 'excellent' : 'good',
          title: score >= 90 ? 'Harika Telaffuz!' : 'Gayet Başarılı!',
          message: 'Kelime net olarak anlaşıldı ve doğru telaffuz edildi.',
          spoken: cleanSpoken,
          target: cleanTarget
        };
      }
    }

    // Levenshtein character similarity
    const maxLen = Math.max(cleanTarget.length, cleanSpoken.length);
    const dist = calculateLevenshteinDistance(cleanTarget, cleanSpoken);
    const charSim = Math.max(0, 1 - (dist / maxLen));
    let finalScore = Math.round(charSim * 100);

    // Token overlap bonus for idioms and compound words
    const targetTokens = cleanTarget.split(' ').filter(Boolean);
    const spokenTokens = cleanSpoken.split(' ').filter(Boolean);
    if (targetTokens.length > 1) {
      const matchCount = targetTokens.filter(t => spokenTokens.includes(t)).length;
      const tokenRatio = matchCount / targetTokens.length;
      finalScore = Math.round((finalScore * 0.4) + (tokenRatio * 100 * 0.6));
    }

    let tier = 'retry';
    let title = 'Tekrar Deneyin';
    let message = 'Hedef telaffuz ile duyulan ses arasında fark var.';

    if (finalScore >= 88) {
      tier = 'excellent';
      title = 'Mükemmel Telaffuz!';
      message = 'Native seviyesinde berrak ve akıcı bir telaffuz.';
    } else if (finalScore >= 70) {
      tier = 'good';
      title = 'Çok İyi!';
      message = 'Anlaşılır ve doğru sesletim. Harika ilerleme!';
    } else if (finalScore >= 50) {
      tier = 'moderate';
      title = 'Yaklaştınız!';
      message = 'Vurguyu ve ses tonunu biraz daha belirginleştirmeyi deneyin.';
    }

    return {
      score: finalScore,
      tier: tier,
      title: title,
      message: message,
      spoken: cleanSpoken,
      target: cleanTarget
    };
  }

  function resolveWordObject(wordOrEn) {
    if (!wordOrEn) return null;
    if (typeof wordOrEn === 'object' && wordOrEn.en) return wordOrEn;
    if (typeof wordOrEn === 'number' || (typeof wordOrEn === 'string' && /^\d+$/.test(wordOrEn.trim()))) {
      const numId = Number(wordOrEn);
      const byId = WORDS_DATA.find(w => w.id === numId || w.no === numId);
      if (byId) return byId;
    }
    const clean = String(wordOrEn).trim().toLowerCase();
    const found = WORDS_DATA.find(w => w.en.toLowerCase() === clean);
    if (found) return found;
    return {
      id: 999999,
      en: String(wordOrEn).trim(),
      tr: '',
      desc: '',
      phonetic: '',
      cefr: 'B1'
    };
  }

  function openSpeechCoach(wordOrEn) {
    const word = resolveWordObject(wordOrEn);
    if (!word) return;

    COACH_STATE.targetWord = word;
    COACH_STATE.active = true;
    COACH_STATE.lastEvaluation = null;
    COACH_STATE.interimTranscript = '';
    COACH_STATE.finalTranscript = '';
    COACH_STATE.errorMessage = '';
    COACH_STATE.errorCode = '';
    COACH_STATE.phase = 'idle';
    COACH_STATE.recordState = 'idle';
    COACH_STATE.recordUrl = null;
    discardSelfRecording();
    cancelSpeechSession();
    COACH_STATE.isListening = false;

    renderSpeechCoachDialog();

    const backdrop = document.getElementById('speech-coach-backdrop');
    const dialog = document.getElementById('speech-coach-dialog');
    if (backdrop) backdrop.classList.add('active');
    if (dialog) dialog.classList.add('active');
  }

  function closeSpeechCoach() {
    cancelSpeechSession();
    discardSelfRecording();
    COACH_STATE.recordState = 'idle';
    COACH_STATE.recordUrl = null;
    COACH_STATE.isListening = false;
    COACH_STATE.active = false;
    const backdrop = document.getElementById('speech-coach-backdrop');
    const dialog = document.getElementById('speech-coach-dialog');
    if (backdrop) backdrop.classList.remove('active');
    if (dialog) dialog.classList.remove('active');
  }

  function toggleCoachAccent() {
    const current = (STATE.settings.accent || 'en-GB');
    const newAccent = current.includes('US') ? 'en-GB' : 'en-US';
    STATE.settings.accent = newAccent;
    localStorage.setItem('mk_accent', newAccent);
    const pill = document.getElementById('accent-toggle-btn');
    if (pill) pill.textContent = newAccent.includes('GB') ? 'UK' : 'US';
    renderSpeechCoachDialog();
  }

  function renderSpeechCoachDialog() {
    const dialog = document.getElementById('speech-coach-dialog');
    if (!dialog || !COACH_STATE.targetWord) return;

    const w = COACH_STATE.targetWord;
    const isSupported = isSpeechRecognitionSupported();
    const accentCode = (STATE.settings.accent || 'en-GB').includes('US') ? 'US' : 'UK';

    const evalResult = COACH_STATE.lastEvaluation;
    let evalHtml = '';

    if (evalResult) {
      let tierColor = 'var(--dp-color-emphasis)';
      let tierBadgeClass = 'score-good';
      if (evalResult.tier === 'excellent') {
        tierColor = '#008744';
        tierBadgeClass = 'score-excellent';
      } else if (evalResult.tier === 'retry') {
        tierColor = 'var(--dp-color-red)';
        tierBadgeClass = 'score-retry';
      }

      evalHtml = `
        <div class="speech-eval-result-card ${tierBadgeClass}">
          <div class="speech-eval-header">
            <div class="speech-score-ring" style="border-color:${tierColor}; color:${tierColor};">
              <span class="speech-score-number">%${evalResult.score}</span>
              <span class="speech-score-label">DOĞRULUK</span>
            </div>
            <div class="speech-eval-details">
              <div class="speech-eval-title" style="color:${tierColor};">${evalResult.title}</div>
              <div class="speech-eval-msg">${evalResult.message}</div>
            </div>
          </div>

          <div class="speech-comparison-box">
            <div class="comparison-row">
              <span class="comparison-label">HEDEF:</span>
              <span class="comparison-val target">${escapeHtml(w.en)}</span>
            </div>
            <div class="comparison-row">
              <span class="comparison-label">DUYULAN:</span>
              <span class="comparison-val heard">${escapeHtml(evalResult.spoken)}</span>
            </div>
          </div>

          <div class="speech-eval-actions">
            <button type="button" class="ctrl-btn" onclick="window.APP.startCoachListening()">
              ${renderIcon('mic', 15)} <span>Yeniden Söyle</span>
            </button>
            <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(w.en)}')">
              ${renderIcon('speaker', 15)} <span>Doğruyu Dinle</span>
            </button>
            <button type="button" class="fc-action-btn learned-btn" onclick="window.APP.closeSpeechCoach()" style="padding: 0 18px; min-height: 42px;">
              ${renderIcon('check', 15)} <span>Tamamla</span>
            </button>
          </div>
        </div>
      `;
    }

    dialog.innerHTML = `
      <div class="speech-coach-header">
        <div class="speech-coach-title-wrap">
          <div class="speech-coach-icon-badge">${renderIcon('mic', 18)}</div>
          <div>
            <h3 id="speech-coach-title" class="speech-coach-title">Speaking &amp; Telaffuz Koçu</h3>
            <p class="speech-coach-sub">Yapay Zeka Destekli Fonetik Değerlendirme</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="coach-accent-btn" onclick="window.APP.toggleCoachAccent()" title="Aksanı Değiştir (UK / US)">
            ${accentCode} (${accentCode === 'US' ? 'en-US' : 'en-GB'})
          </button>
          <button type="button" class="coach-close-btn" onclick="window.APP.closeSpeechCoach()" aria-label="Kapat">${renderIcon('cross', 18)}</button>
        </div>
      </div>

      <div class="speech-coach-body">
        
        <!-- Word Target Banner -->
        <div class="coach-target-card">
          <div class="coach-target-top">
            <div class="coach-target-en">${escapeHtml(w.en)}</div>
            <button type="button" class="coach-listen-btn" onclick="window.APP.speakWord('${escapeHtml(w.en)}')" title="Doğru Telaffuzu Dinle" aria-label="Dinle">
              ${ICONS.speaker} <span>Dinle (${accentCode})</span>
            </button>
          </div>
          ${w.phonetic ? `<div class="coach-target-phonetic">${escapeHtml(w.phonetic)}</div>` : ''}
          <div class="coach-target-meta">
            ${w.tr ? `<span class="coach-target-tr">${escapeHtml(w.tr)}</span>` : ''}
            ${w.desc ? `<span class="coach-target-pos">[${escapeHtml(w.desc)}]</span>` : ''}
            ${w.cefr ? getCefrBadgeHtml(w.cefr) : ''}
          </div>
          ${w.example ? `<div class="coach-target-example">“${highlightWordInText(w.example.replace(/^["“”]|["“”]$/g, ''), w.en)}”</div>` : ''}
        </div>

        ${!isSupported ? `
          <div class="coach-unsupported-alert">
            <span style="display:inline-flex;">${renderIcon('alert', 22)}</span>
            <div>
              <strong>Web Speech API Desteği Gerekli</strong>
              <p>Tarayıcınız mikrofonla konuşma tanıma API'sini doğrudan desteklemiyor olabilir. En iyi deneyim için Chrome, Edge veya Safari kullanabilirsiniz. Yine de yukarıdaki butonla doğru telaffuzu dinleyebilirsiniz!</p>
            </div>
          </div>
        ` : `
          <!-- Interactive Microphone Stage -->
          <div class="coach-mic-stage ${COACH_STATE.isListening ? 'listening' : ''}">
            <div class="coach-mic-pulse-rings">
              <span class="pulse-ring ring-1"></span>
              <span class="pulse-ring ring-2"></span>
              <span class="pulse-ring ring-3"></span>
            </div>

            <button type="button" class="coach-mic-record-btn ${COACH_STATE.isListening ? 'active' : ''}" id="coach-record-btn" onclick="window.APP.toggleCoachListening()" title="${COACH_STATE.isListening ? 'Dinlemeyi Durdur' : 'Konuşmak İçin Dokunun'}" aria-label="Mikrofon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>

            <!-- Audio Waveform Visualizer -->
            <div class="coach-waveform ${COACH_STATE.isListening ? 'active' : ''}" aria-hidden="true">
              <span class="wave-bar bar-1"></span>
              <span class="wave-bar bar-2"></span>
              <span class="wave-bar bar-3"></span>
              <span class="wave-bar bar-4"></span>
              <span class="wave-bar bar-5"></span>
              <span class="wave-bar bar-6"></span>
              <span class="wave-bar bar-7"></span>
            </div>

            <div class="coach-status-text" id="coach-status-text" ${(!COACH_STATE.isListening && COACH_STATE.errorMessage) ? 'role="alert" style="color: var(--dp-color-accent-ink); font-weight: 600;"' : 'aria-live="polite"'}>
              ${COACH_STATE.isListening 
                ? (COACH_PHASE_TEXT[COACH_STATE.phase] || COACH_PHASE_TEXT.preparing) 
                : (COACH_STATE.errorMessage ? escapeHtml(COACH_STATE.errorMessage) : 'Mikrofona dokunun ve kelimeyi okuyun')}
            </div>

            <div class="coach-live-transcript ${COACH_STATE.interimTranscript ? 'has-text' : ''}" id="coach-live-transcript">
              ${COACH_STATE.interimTranscript 
                ? `“${escapeHtml(COACH_STATE.interimTranscript)}”` 
                : '<span style="color:var(--dp-color-ink-muted); font-size:0.85rem;">[ Telaffuz algılanınca burada belirecek ]</span>'}
            </div>
          </div>
        `}

        <div id="speech-eval-slot">
          ${evalHtml}
        </div>

        ${renderSelfRecordBlock(isSupported)}

      </div>
    `;
  }

  function renderSelfRecordBlock(isSupported) {
    const show = isSelfRecordingSupported() && (
      !isSupported ||
      isRecognitionServiceError(COACH_STATE.errorCode) ||
      COACH_STATE.recordState !== 'idle'
    );
    if (!show || !COACH_STATE.targetWord) return '';
    const w = COACH_STATE.targetWord;
    const isRec = COACH_STATE.recordState === 'recording';
    const hasRec = COACH_STATE.recordState === 'ready' && COACH_STATE.recordUrl;
    return `
      <div class="coach-self-record">
        <div class="coach-self-record-head">
          <strong>${renderIcon('headphones', 14)} Kaydet &amp; Karşılaştır</strong>
          <span>Otomatik puanlama çalışmasa da kendi sesinizi kaydedip doğru telaffuzla karşılaştırabilirsiniz.</span>
        </div>
        <div class="coach-self-record-actions">
          <button type="button" class="ctrl-btn ${isRec ? 'is-recording' : ''}" onclick="window.APP.toggleCoachSelfRecording()">
            ${isRec ? `${renderIcon('cross', 13)} Kaydı Bitir` : (hasRec ? `${renderIcon('repeat', 13)} Yeniden Kaydet` : `${renderIcon('mic', 13)} Sesimi Kaydet`)}
          </button>
          <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(w.en)}')">${renderIcon('speaker', 14)} Doğruyu Dinle</button>
        </div>
        ${isRec ? '<div class="coach-self-record-note">Kayıt yapılıyor... kelimeyi söyleyin (en fazla 5 sn)</div>' : ''}
        ${hasRec ? `<audio class="coach-self-record-audio" controls src="${COACH_STATE.recordUrl}"></audio>` : ''}
      </div>
    `;
  }

  function toggleCoachSelfRecording() {
    toggleSelfRecording((state, payload) => {
      if (!COACH_STATE.active) return;
      if (state === 'recording') {
        COACH_STATE.recordState = 'recording';
      } else if (state === 'ready') {
        COACH_STATE.recordState = 'ready';
        COACH_STATE.recordUrl = payload;
      } else {
        COACH_STATE.recordState = 'idle';
        COACH_STATE.errorMessage = payload;
      }
      renderSpeechCoachDialog();
    });
  }

  function toggleCoachListening() {
    if (COACH_STATE.isListening) {
      stopCoachListening();
    } else {
      startCoachListening();
    }
  }

  function startCoachListening() {
    if (!COACH_STATE.targetWord) return;

    COACH_STATE.interimTranscript = '';
    COACH_STATE.finalTranscript = '';
    COACH_STATE.errorMessage = '';
    COACH_STATE.errorCode = '';
    COACH_STATE.lastEvaluation = null;
    COACH_STATE.isListening = true;
    COACH_STATE.phase = 'preparing';
    if (COACH_STATE.recordState === 'recording') discardSelfRecording();
    if (COACH_STATE.recordState !== 'ready') COACH_STATE.recordState = 'idle';
    renderSpeechCoachDialog();

    const targetEn = COACH_STATE.targetWord.en;
    const accentCode = (STATE.settings.accent || 'en-GB').includes('US') ? 'en-US' : 'en-GB';

    startSpeechSession({
      lang: accentCode,
      onPhase: (phase) => {
        if (!COACH_STATE.active || !COACH_STATE.isListening) return;
        COACH_STATE.phase = phase;
        const statusEl = document.getElementById('coach-status-text');
        if (statusEl) statusEl.textContent = COACH_PHASE_TEXT[phase] || '';
        const stage = document.querySelector('.coach-mic-stage');
        if (stage) stage.classList.toggle('processing', phase === 'processing');
      },
      onLevel: (level) => {
        renderLevelBars(document.querySelector('#speech-coach-dialog .coach-waveform'), level);
      },
      onInterim: (text) => {
        COACH_STATE.interimTranscript = text;
        const transcriptEl = document.getElementById('coach-live-transcript');
        if (transcriptEl && text) {
          transcriptEl.textContent = `“${text}”`;
          transcriptEl.classList.add('has-text');
        }
      },
      onError: (code, message) => {
        COACH_STATE.isListening = false;
        COACH_STATE.errorMessage = message;
        COACH_STATE.errorCode = code;
        if (COACH_STATE.active) renderSpeechCoachDialog();
      },
      onEnd: (alternatives, errored) => {
        COACH_STATE.isListening = false;
        if (!COACH_STATE.active) return;

        if (!errored && alternatives.length) {
          const best = pickBestSpokenAlternative(alternatives, targetEn);
          COACH_STATE.finalTranscript = best.spoken;
          COACH_STATE.interimTranscript = best.spoken;
          COACH_STATE.lastEvaluation = best.evalResult;

          STATE.userData.stats.speakingAttempts = (STATE.userData.stats.speakingAttempts || 0) + 1;
          if (best.evalResult.score >= 70) {
            STATE.userData.stats.speakingSuccesses = (STATE.userData.stats.speakingSuccesses || 0) + 1;
            playSound('correct');
          } else {
            playSound('wrong');
          }
          saveUserData();
        } else if (!errored) {
          COACH_STATE.errorMessage = getSpeechErrorMessage('no-speech');
        }

        renderSpeechCoachDialog();
      }
    });
  }

  function stopCoachListening() {
    // Dinlemeyi bitir; o ana kadar duyulan değerlendirilir (onEnd arayüzü günceller)
    stopSpeechSession();
  }

  // ==========================================================================
  // Persistence Helpers
  // ==========================================================================
  function saveUserData() {
    try {
      localStorage.setItem('mk_learned', JSON.stringify(Array.from(STATE.userData.learned)));
      localStorage.setItem('mk_review', JSON.stringify(Array.from(STATE.userData.review)));
      localStorage.setItem('mk_starred', JSON.stringify(Array.from(STATE.userData.starred)));
      localStorage.setItem('mk_stats', JSON.stringify(STATE.userData.stats));
      localStorage.setItem('mk_activity_log', JSON.stringify(STATE.userData.activityLog || []));
      localStorage.setItem('mk_current_day', STATE.currentDay.toString());
      localStorage.setItem('mk_srs', JSON.stringify(STATE.userData.srs || {}));
      localStorage.setItem('mk_mistakes', JSON.stringify(STATE.userData.mistakes || {}));
      localStorage.setItem('mk_schema_version', String(SCHEMA_VERSION));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // ==========================================================================
  // VERİ YEDEKLEME, GERİ YÜKLEME VE SIFIRLAMA
  // ==========================================================================

  function exportProgress() {
    try {
      const payload = {
        learnish_backup: true,
        schema: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        settings: {
          accent: STATE.settings.accent,
          speed: STATE.settings.speed,
          theme: STATE.settings.theme,
          soundEffects: STATE.settings.soundEffects
        },
        userData: {
          learned: Array.from(STATE.userData.learned),
          review: Array.from(STATE.userData.review),
          starred: Array.from(STATE.userData.starred),
          stats: STATE.userData.stats,
          activityLog: STATE.userData.activityLog,
          srs: STATE.userData.srs,
          mistakes: STATE.userData.mistakes
        },
        currentDay: STATE.currentDay,
        activeModule: STATE.activeModule,
        selectedGrade: STATE.selectedGrade
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnish-yedek-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      _showToast('İlerleme yedeği indirildi.', 'success');
    } catch (e) {
      _showToast('Dışa aktarma hatası: ' + e.message, 'error');
    }
  }

  function importProgress() {
    document.getElementById('import-file-input')?.click();
  }

  function handleImportFile(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || !data.learnish_backup) throw new Error('Geçersiz Learnish yedeği.');
        if (!confirm('Bu yedek mevcut tüm ilerlemenizin üzerine yazacak. Devam etmek istiyor musunuz?')) { input.value = ''; return; }

        // Veriyi yükle
        const ud = data.userData || {};
        STATE.userData.learned = new Set(Array.isArray(ud.learned) ? ud.learned : []);
        STATE.userData.review = new Set(Array.isArray(ud.review) ? ud.review : []);
        STATE.userData.starred = new Set(Array.isArray(ud.starred) ? ud.starred : []);
        STATE.userData.stats = Object.assign({ quizzesPlayed: 0, correctAnswers: 0, totalQuestions: 0, bestStreak: 0 }, ud.stats || {});
        STATE.userData.activityLog = Array.isArray(ud.activityLog) ? ud.activityLog : [];
        STATE.userData.srs = ud.srs && typeof ud.srs === 'object' ? ud.srs : {};
        STATE.userData.mistakes = ud.mistakes && typeof ud.mistakes === 'object' ? ud.mistakes : {};

        if (data.settings) {
          if (data.settings.accent) STATE.settings.accent = data.settings.accent;
          if (data.settings.theme) {
            STATE.settings.theme = data.settings.theme;
            document.documentElement.setAttribute('data-theme', STATE.settings.theme);
          }
        }
        if (data.currentDay) STATE.currentDay = data.currentDay;
        if (data.activeModule) STATE.activeModule = data.activeModule;
        if (data.selectedGrade) STATE.selectedGrade = data.selectedGrade;

        saveUserData();
        input.value = '';
        _showToast('Yedek başarıyla geri yüklendi!', 'success');
        setTimeout(() => location.reload(), 1200);
      } catch (err) {
        _showToast('Geri yükleme hatası: ' + err.message, 'error');
        input.value = '';
      }
    };
    reader.readAsText(file);
  }

  function resetProgress() {
    if (!confirm('Tüm öğrenme ilerlemeniz, hata defteriniz ve istatistikleriniz silinecek.\nBu işlem GERİ ALINAMAZ. Devam etmek istiyor musunuz?')) return;
    if (!confirm('Emin misiniz? Bu işlemi geri alamazsınız.')) return;
    const keysToRemove = ['mk_learned', 'mk_review', 'mk_starred', 'mk_stats', 'mk_activity_log', 'mk_srs', 'mk_mistakes', 'mk_current_day', 'mk_schema_version'];
    keysToRemove.forEach(k => { try { localStorage.removeItem(k); } catch (_) {} });
    _showToast('Tüm ilerleme sıfırlandı. Sayfa yenileniyor...', 'success');
    setTimeout(() => location.reload(), 1000);
  }

  function _showToast(msg, type = 'info') {
    const el = document.createElement('div');
    const bg = type === 'success' ? '#047857' : type === 'error' ? '#ca0013' : '#374151';
    el.style.cssText = `position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:${bg};color:#fff;padding:10px 20px;border-radius:8px;font-size:0.88rem;font-weight:600;z-index:var(--z-toast);box-shadow:0 4px 16px rgba(0,0,0,.22);white-space:nowrap;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  function logActivity(moduleTitle, resultText) {
    if (!STATE.userData.activityLog) STATE.userData.activityLog = [];
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    STATE.userData.activityLog.unshift({
      date: dateStr,
      module: moduleTitle,
      result: resultText
    });
    if (STATE.userData.activityLog.length > 8) {
      STATE.userData.activityLog = STATE.userData.activityLog.slice(0, 8);
    }
    saveUserData();
  }

  function updateWordCardDOM(wordId) {
    wordId = parseInt(wordId, 10);
    const isLearned = STATE.userData.learned.has(wordId);
    const isReview = STATE.userData.review.has(wordId);
    const isStarred = STATE.userData.starred.has(wordId);

    syncLibrarySpine(wordId);

    // 1. Directory word cards & feed cards (match on data-id)
    const cards = document.querySelectorAll(`[data-id="${wordId}"]`);
    cards.forEach(card => {
      if (card.classList && card.classList.contains('secondary-feed-card')) {
        card.classList.toggle('is-learned', isLearned);
      }

      const buttons = card.querySelectorAll ? card.querySelectorAll('button') : [];
      buttons.forEach(btn => {
        const onclickAttr = btn.getAttribute ? (btn.getAttribute('onclick') || '') : '';

        if (onclickAttr.includes('toggleLearned')) {
          if (btn.classList && btn.classList.contains('status-badge-btn')) {
            btn.classList.toggle('learned', isLearned);
            btn.innerHTML = `${ICONS.check} <span>${isLearned ? 'ÖĞRENDİM' : 'ÖĞREN'}</span>`;
          } else if (btn.classList && btn.classList.contains('feed-trailing-btn')) {
            btn.classList.toggle('checked', isLearned);
            btn.title = isLearned ? 'Öğrenildi' : 'Öğrenildi Olarak İşaretle';
          }
        }

        if (onclickAttr.includes('toggleReview')) {
          if (btn.classList && btn.classList.contains('status-badge-btn')) {
            btn.classList.toggle('review', isReview);
            btn.innerHTML = `${ICONS.repeat} <span>${isReview ? 'TEKRARDA' : 'TEKRAR'}</span>`;
          }
        }

        if (onclickAttr.includes('toggleStarred')) {
          if (btn.classList && btn.classList.contains('star-btn')) {
            btn.classList.toggle('starred', isStarred);
            btn.innerHTML = isStarred ? ICONS.starFilled : ICONS.starOutline;
          } else if (btn.classList && btn.classList.contains('feed-trailing-btn')) {
            btn.classList.toggle('active', isStarred);
            btn.title = isStarred ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
            btn.innerHTML = renderIcon(isStarred ? 'starFilled' : 'starOutline', 16);
            btn.setAttribute('aria-pressed', String(!!isStarred));
          }
        }
      });
    });

    // 2. Also check any loose buttons across the DOM
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => {
      const onclickAttr = btn.getAttribute ? (btn.getAttribute('onclick') || '') : '';
      if (onclickAttr.includes(`toggleLearned(${wordId})`)) {
        if (btn.classList && btn.classList.contains('status-badge-btn')) {
          btn.classList.toggle('learned', isLearned);
          btn.innerHTML = `${ICONS.check} <span>${isLearned ? 'ÖĞRENDİM' : 'ÖĞREN'}</span>`;
        } else if (btn.classList && btn.classList.contains('feed-trailing-btn')) {
          btn.classList.toggle('checked', isLearned);
          btn.title = isLearned ? 'Öğrenildi' : 'Öğrenildi Olarak İşaretle';
        }
      }
      if (onclickAttr.includes(`toggleReview(${wordId})`)) {
        if (btn.classList && btn.classList.contains('status-badge-btn')) {
          btn.classList.toggle('review', isReview);
          btn.innerHTML = `${ICONS.repeat} <span>${isReview ? 'TEKRARDA' : 'TEKRAR'}</span>`;
        }
      }
      if (onclickAttr.includes(`toggleStarred(${wordId})`)) {
        if (btn.classList && btn.classList.contains('star-btn')) {
          btn.classList.toggle('starred', isStarred);
          btn.innerHTML = isStarred ? ICONS.starFilled : ICONS.starOutline;
        } else if (btn.classList && btn.classList.contains('feed-trailing-btn')) {
          btn.classList.toggle('active', isStarred);
          btn.title = isStarred ? 'Favorilerden Çıkar' : 'Favorilere Ekle';
          btn.innerHTML = renderIcon(isStarred ? 'starFilled' : 'starOutline', 16);
            btn.setAttribute('aria-pressed', String(!!isStarred));
        }
      }
    });

    // 3. Update status chips counts in directory controls
    syncDirectoryStatusChips();
  }

  function toggleLearned(wordId) {
    wordId = parseInt(wordId, 10);
    const wordObj = WORDS_DATA.find(w => w.id === wordId);
    if (STATE.userData.learned.has(wordId)) {
      STATE.userData.learned.delete(wordId);
    } else {
      STATE.userData.learned.add(wordId);
      STATE.userData.review.delete(wordId);
      const modMap = {
        maarif: `MEB ${getActiveGrade()}. SINIF`,
        yds: 'YDS & YÖKDİL AKADEMİK',
        oxford: 'KELİME KÜTÜPHANESİ',
        all: 'TÜM KÜTÜPHANE'
      };
      const modTitle = modMap[STATE.activeModule] || modMap.maarif;
      const wEn = wordObj ? wordObj.en.toUpperCase() : `#${wordId}`;
      logActivity(`${modTitle} • GÜN ${STATE.currentDay}`, `KELİME DOĞRULANDI [${wEn}] • TOPLAM: ${STATE.userData.learned.size}`);
    }
    saveUserData();
    updateWordCardDOM(wordId);
  }

  function toggleReview(wordId) {
    wordId = parseInt(wordId, 10);
    if (STATE.userData.review.has(wordId)) {
      STATE.userData.review.delete(wordId);
    } else {
      STATE.userData.review.add(wordId);
      STATE.userData.learned.delete(wordId);
    }
    saveUserData();
    updateWordCardDOM(wordId);
  }

  function toggleStarred(wordId) {
    wordId = parseInt(wordId, 10);
    if (STATE.userData.starred.has(wordId)) {
      STATE.userData.starred.delete(wordId);
    } else {
      STATE.userData.starred.add(wordId);
    }
    saveUserData();
    updateWordCardDOM(wordId);
  }

  // ==========================================================================
  // PEDAGOJİK HAFIZA & ARALIKLI TEKRAR MOTORU (SM-2 SRS & MISTAKE VAULT)
  // ==========================================================================

  function getTodayDateString(offsetDays = 0) {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getWordSRSData(wordId) {
    if (!wordId) return null;
    return STATE.userData.srs[wordId] || null;
  }

  function getWordMistakeData(wordId) {
    if (!wordId) return null;
    return STATE.userData.mistakes[wordId] || null;
  }

  /**
   * SuperMemo SM-2 Algoritması
   * quality dereceleri:
   *  1: Tekrar / Zor (Again) -> interval: 1 gün, repetitions: 0, EF düşüşü
   *  4: İyi / Hatırladım (Good) -> Normal genişleme (1 -> 3 -> 6 -> interval * EF)
   *  5: Çok Kolay (Easy) -> Hızlı genişleme (3 -> 6 -> interval * EF * 1.35), EF artışı
   */
  function calculateSRS(wordId, quality) {
    wordId = parseInt(wordId, 10);
    const todayStr = getTodayDateString();
    let record = STATE.userData.srs[wordId];

    if (!record) {
      record = {
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        lastReview: todayStr,
        nextReview: todayStr,
        streak: 0,
        state: 'new'
      };
    }

    if (quality < 3) {
      // Zor / Tekrar: Başa döner
      record.repetitions = 0;
      record.interval = 1;
      record.easeFactor = Math.max(1.3, Number((record.easeFactor - 0.2).toFixed(2)));
      record.streak = 0;
      record.state = 'learning';
    } else if (quality === 4) {
      // İyi / Hatırladım
      if (record.repetitions === 0) {
        record.interval = 1;
      } else if (record.repetitions === 1) {
        record.interval = 3;
      } else if (record.repetitions === 2) {
        record.interval = 6;
      } else {
        record.interval = Math.min(3650, Math.max(7, Math.round(record.interval * record.easeFactor)));
      }
      record.repetitions++;
      record.streak = (record.streak || 0) + 1;
      record.state = record.interval >= 14 ? 'mastered' : 'reviewing';
    } else if (quality >= 5) {
      // Çok Kolay / Zihnimde
      if (record.repetitions === 0) {
        record.interval = 3;
      } else if (record.repetitions === 1) {
        record.interval = 6;
      } else {
        record.interval = Math.min(3650, Math.max(8, Math.round(record.interval * record.easeFactor * 1.35)));
      }
      record.repetitions++;
      record.streak = (record.streak || 0) + 1;
      record.easeFactor = Math.min(3.0, Number((record.easeFactor + 0.15).toFixed(2)));
      record.state = record.interval >= 14 ? 'mastered' : 'reviewing';
    }

    record.lastReview = todayStr;
    record.nextReview = getTodayDateString(record.interval);
    STATE.userData.srs[wordId] = record;

    // Learned ve Review Setleri ile senkronizasyon
    if (quality >= 3) {
      STATE.userData.learned.add(wordId);
      STATE.userData.review.delete(wordId);
    } else {
      STATE.userData.review.add(wordId);
      STATE.userData.learned.delete(wordId);
    }

    saveUserData();
    return record;
  }

  /**
   * Hata Defterine yanlış cevap kaydı
   */
  function recordMistake(wordId, context = 'quiz') {
    wordId = parseInt(wordId, 10);
    const todayStr = getTodayDateString();
    let mistake = STATE.userData.mistakes[wordId];

    if (!mistake) {
      mistake = {
        wrongCount: 1,
        lastWrongDate: todayStr,
        context: context,
        consecutiveCorrect: 0,
        cleared: false
      };
    } else {
      mistake.wrongCount = (mistake.wrongCount || 0) + 1;
      mistake.lastWrongDate = todayStr;
      mistake.context = context;
      mistake.consecutiveCorrect = 0;
      mistake.cleared = false;
    }

    STATE.userData.mistakes[wordId] = mistake;
    STATE.userData.review.add(wordId);
    saveUserData();
    return mistake;
  }

  /**
   * Hata Defterindeki kelime doğru bilindiğinde
   * 2 ardışık doğru cevap kelimeyi "Kurtarılmış / Temizlenmiş" kılar.
   */
  function recordMistakeSuccess(wordId) {
    wordId = parseInt(wordId, 10);
    const mistake = STATE.userData.mistakes[wordId];
    if (!mistake || mistake.cleared) return null;

    mistake.consecutiveCorrect = (mistake.consecutiveCorrect || 0) + 1;
    let justCleared = false;

    if (mistake.consecutiveCorrect >= 2) {
      mistake.cleared = true;
      justCleared = true;
      const wObj = WORDS_DATA.find(w => w.id === wordId);
      const wName = wObj ? wObj.en.toUpperCase() : '#' + wordId;
      logActivity(
        'KURTARMA KAMPI • HATA DEFTERİ',
        `KURTARILDI: [${wName}] 2 kez üst üste doğru bilinerek Hata Defterinden temizlendi!`
      );
    }

    saveUserData();
    return { cleared: justCleared, mistake };
  }

  /**
   * Bugün aralıklı tekrarı gelmiş kelimeleri listeler
   */
  function getSRSDueWords(moduleFilter = null) {
    const todayStr = getTodayDateString();
    const activeMod = moduleFilter || STATE.activeModule;

    let pool = WORDS_DATA;
    if (activeMod === 'maarif') pool = getActiveGradePool();
    else if (activeMod === 'yds') pool = WORDS_DATA.filter(isYDSWord);
    else if (activeMod === 'oxford') pool = WORDS_DATA.filter(isOxfordWord);

    return pool.filter(w => {
      const srs = STATE.userData.srs[w.id];
      if (srs && srs.nextReview <= todayStr) return true;
      // Kullanıcı kelimeyi tekrar listesine almış ama henüz SRS kaydı yoksa bugün due say
      if (!srs && STATE.userData.review.has(w.id)) return true;
      return false;
    });
  }

  /**
   * Hata Defterindeki aktif (kurtarılmamış) kelimeleri hata sıklığına göre döndürür
   */
  function getActiveMistakeWords(moduleFilter = null) {
    const activeMod = moduleFilter || STATE.activeModule;

    let pool = WORDS_DATA;
    if (activeMod === 'maarif') pool = getActiveGradePool();
    else if (activeMod === 'yds') pool = WORDS_DATA.filter(isYDSWord);
    else if (activeMod === 'oxford') pool = WORDS_DATA.filter(isOxfordWord);

    const mistakeEntries = Object.entries(STATE.userData.mistakes)
      .filter(([id, m]) => !m.cleared && m.wrongCount > 0)
      .map(([id, m]) => ({ id: parseInt(id, 10), ...m }));

    mistakeEntries.sort((a, b) => (b.wrongCount || 0) - (a.wrongCount || 0));

    const validIds = new Set(mistakeEntries.map(m => m.id));
    return pool
      .filter(w => validIds.has(w.id))
      .sort((a, b) => {
        const countA = STATE.userData.mistakes[a.id]?.wrongCount || 0;
        const countB = STATE.userData.mistakes[b.id]?.wrongCount || 0;
        return countB - countA;
      });
  }

  /**
   * Aralıklı Tekrar İstatistikleri
   */
  function getSRSStats(moduleFilter = null) {
    const todayStr = getTodayDateString();
    const activeMod = moduleFilter || STATE.activeModule;

    let pool = WORDS_DATA;
    if (activeMod === 'maarif') pool = getActiveGradePool();
    else if (activeMod === 'yds') pool = WORDS_DATA.filter(isYDSWord);
    else if (activeMod === 'oxford') pool = WORDS_DATA.filter(isOxfordWord);

    let dueCount = 0;
    let newCount = 0;
    let learningCount = 0;
    let reviewingCount = 0;
    let masteredCount = 0;

    const countedIds = new Set();
    pool.forEach(w => {
      countedIds.add(w.id);
      const srs = STATE.userData.srs[w.id];
      if (!srs) {
        if (STATE.userData.review.has(w.id)) {
          dueCount++;
          learningCount++;
        } else if (STATE.userData.learned.has(w.id)) {
          reviewingCount++;
        } else {
          newCount++;
        }
      } else {
        if (srs.nextReview <= todayStr) dueCount++;
        if (srs.state === 'mastered' || srs.interval >= 14) {
          masteredCount++;
        } else if (srs.state === 'reviewing' || srs.interval >= 4) {
          reviewingCount++;
        } else {
          learningCount++;
        }
      }
    });

    Object.keys(STATE.userData.srs).forEach(idStr => {
      const id = parseInt(idStr, 10);
      if (!countedIds.has(id)) {
        const srs = STATE.userData.srs[id];
        if (srs) {
          if (srs.nextReview <= todayStr) dueCount++;
          if (srs.state === 'mastered' || srs.interval >= 14) {
            masteredCount++;
          } else if (srs.state === 'reviewing' || srs.interval >= 4) {
            reviewingCount++;
          } else {
            learningCount++;
          }
        }
      }
    });

    const totalActive = learningCount + reviewingCount + masteredCount;
    const retentionRate = totalActive > 0 ? Math.round((masteredCount / totalActive) * 100) : 0;

    return {
      total: pool.length,
      dueCount,
      newCount,
      learningCount,
      reviewingCount,
      masteredCount,
      totalActive,
      retentionRate
    };
  }

  /**
   * Hata Defteri İstatistikleri
   */
  function getMistakeStats(moduleFilter = null) {
    const activeMod = moduleFilter || STATE.activeModule;
    let pool = WORDS_DATA;
    if (activeMod === 'maarif') pool = getActiveGradePool();
    else if (activeMod === 'yds') pool = WORDS_DATA.filter(isYDSWord);
    else if (activeMod === 'oxford') pool = WORDS_DATA.filter(isOxfordWord);

    const poolIds = new Set(pool.map(w => w.id));

    let totalMistakeEvents = 0;
    let activeMistakes = 0;
    let clearedMistakes = 0;

    Object.entries(STATE.userData.mistakes).forEach(([idStr, m]) => {
      const id = parseInt(idStr, 10);
      if (poolIds.has(id)) {
        totalMistakeEvents += (m.wrongCount || 0);
        if (m.cleared) {
          clearedMistakes++;
        } else if (m.wrongCount > 0) {
          activeMistakes++;
        }
      }
    });

    const totalTracked = activeMistakes + clearedMistakes;
    const recoveryRate = totalTracked > 0 ? Math.round((clearedMistakes / totalTracked) * 100) : 0;

    return {
      totalMistakeEvents,
      activeMistakes,
      clearedMistakes,
      totalTracked,
      recoveryRate
    };
  }

  /**
   * Pedagojik Metin Vurgulayıcı:
   * Cümle içinde hedef kelimenin kök ve eklerini vurgular.
   */
  function highlightWordInText(text, word) {
    if (!text || !word) return text || '';
    let cleanWord = word
      .replace(/\(.*?\)/g, '')
      .replace(/\b(sb|sth|to do|doing)\b/gi, '')
      .replace(/\/[a-z]+/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (!cleanWord) cleanWord = word.trim().toLowerCase();
    const escaped = cleanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b(${escaped}(?:s|es|ed|d|ing)?)\\b`, 'gi');
    return text.replace(regex, '<mark class="pedagogy-word-highlight">$1</mark>');
  }

  /**
   * Kurtarma başarısı bildirimi (Toast)
   */
  function showRecoveryToast(word) {
    const toast = document.createElement('div');
    toast.className = 'recovery-toast-alert';
    toast.innerHTML = `
      <div class="recovery-toast-icon">${renderIcon('sparkles', 20)}</div>
      <div class="recovery-toast-content">
        <strong>KURTARMA BAŞARILI!</strong>
        <span><strong>${word.en.toUpperCase()}</strong> 2 kez doğru bilindi ve Hata Defterinden temizlendi!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ==========================================================================
  // Data Filtering & Helpers for YDS, Maarif & Oxford (Unified Pool)
  // ==========================================================================
  function isMaarifWord(w) {
    return Boolean(w.isMaarif || w.dataset === 'maarif' || (w.datasets && w.datasets.includes('maarif')) || (w.id && w.id <= 815));
  }

  function isOxfordWord(w) {
    return Boolean(w.isOxford || w.dataset === 'oxford' || (w.datasets && w.datasets.includes('oxford')));
  }

  function isYDSWord(w) {
    return Boolean(w.isYds || w.dataset === 'yds' || (w.datasets && w.datasets.includes('yds')) || (w.dataset === 'oxford' && (w.cefr === 'B2' || w.cefr === 'C1')));
  }

  function getWordPOS(w) {
    const p = (w.pos || w.desc || '').toLowerCase();
    // Önce sıfat/zarf kontrolü: "adverb" içinde "verb" geçtiği için aksi halde zarflar fiil sayılıyordu.
    if (p.includes('adverb') || p.includes('zarf')) return 'adj_adv';
    if (p.includes('verb') || p.includes('fiil')) return 'verb';
    if (p.includes('noun') || p.includes('isim')) return 'noun';
    if (p.includes('adj') || p.includes('sıfat') || p.includes('adv') || p.includes('zarf')) return 'adj_adv';
    return 'other';
  }

  /**
   * Akıllı çeldirici (yanlış şık) seçici.
   * Rastgele 9.000 kelime yerine hedef kelimeye benzeyen şıklar seçer; böylece soru
   * "Avustralya / foton" gibi bariz şıklarla kendiliğinden çözülmez.
   * Kademeler (yeterli şık bulunana kadar sırayla genişler):
   *   1) Aynı modül + aynı kelime türü + aynı tema (Maarif) / aynı CEFR (YDS-Oxford)
   *   2) Aynı modül + aynı kelime türü
   *   3) Aynı modül
   *   4) preferredPool (kullanıcının seçtiği havuz), en son tüm kelimeler
   * Aynı Türkçe/İngilizce karşılığa sahip şıklar elenir (iki doğru cevap çıkmasın).
   */
  const _distractorIndexCache = { maarif: null, yds: null, oxford: null };
  function _moduleOf(w) {
    if (isMaarifWord(w)) return 'maarif';
    if (w.isYds || w.dataset === 'yds') return 'yds';
    return 'oxford';
  }
  function _moduleWords(mod) {
    if (!_distractorIndexCache[mod]) {
      const test = mod === 'maarif' ? isMaarifWord : (mod === 'yds' ? (w => w.isYds || w.dataset === 'yds') : isOxfordWord);
      _distractorIndexCache[mod] = WORDS_DATA.filter(test);
    }
    return _distractorIndexCache[mod];
  }
  function _normMeaning(s) {
    return String(s || '').toLocaleLowerCase('tr').split(/[;,]/)[0].replace(/\(.*?\)/g, '').trim();
  }
  // ==========================================================================
  // SINIF (KADEME) HAVUZU — Maarif rotası 1-12. sınıfların hepsine hizmet eder.
  // Seçili sınıfın kelimeleri yıllık plandaki hafta sırasıyla (CURRICULUM_DATA.calendar) gelir.
  // Eskiden 18 yerde sabit "5. sınıf 817 kelime" listesi (isMaarifWord) kullanılıyordu.
  // ==========================================================================

  function _ensureWordIndex() {
    if (_wordIndex.size) return;
    WORDS_DATA.forEach(w => {
      const k = String(w.en || '').toLowerCase().trim();
      if (k && !_wordIndex.has(k)) _wordIndex.set(k, w);
      const c = _compactKey(k);
      if (c && !_compactIndex.has(c)) _compactIndex.set(c, w);
    });
  }

  function _compactKey(k) {
    return String(k || '').toLowerCase().replace(/[\s\-.'’]+/g, '');
  }

  function _normalizeCurriculumTerm(raw) {
    return String(raw || '').trim()
      .replace(/^[—\-\*•\s]*[A-Za-z0-9\s/&]+:\s*/, '')
      .replace(/^(verbs?|nouns?|adjectives?|adverbs?):\s*/i, '')
      .replace(/^(to|a|an)\s+/i, '')
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/[.,;:!?]+$/, '')
      .trim()
      .toLowerCase();
  }

  // Kalıcı kimlik: aynı kelime her oturumda aynı id'yi alır (öğrendim/hata defteri kayıtları bozulmaz)
  function _stableCurriculumId(key) {
    let h = 0x811c9dc5;
    for (let i = 0; i < key.length; i++) {
      h ^= key.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return 1000000 + (h % 8999999);
  }

  /**
   * Müfredat kelimesini (ör. "a notice board", "apples") kelime veritabanında bulur.
   * Yalnızca tam eşleşme ve basit çoğul eki denenir; "pen" → "open" gibi içerik eşleşmesi YAPILMAZ.
   * Veritabanında yoksa müfredat sözlüğündeki Türkçe karşılıkla bir kez oluşturulup WORDS_DATA'ya eklenir
   * (böylece id ile yapılan tüm aramalar — öğrendim, hata defteri, istatistik — çalışır).
   */
  function lookupCurriculumWord(raw) {
    if (raw && typeof raw === 'object' && raw.en) return raw;
    _ensureWordIndex();
    const key = _normalizeCurriculumTerm(raw);
    if (!key) return null;
    const variants = [key, key.replace(/^the\s+/, '')];
    if (key.length > 3 && /[^su]s$/.test(key)) variants.push(key.slice(0, -1));   // eggs → egg
    if (key.length > 4 && /ies$/.test(key)) variants.push(key.slice(0, -3) + 'y');  // cherries → cherry
    if (key.length > 4 && /(ch|sh|x|ss|o)es$/.test(key)) variants.push(key.slice(0, -2)); // boxes → box, potatoes → potato
    for (const v of variants) {
      if (_wordIndex.has(v)) return _wordIndex.get(v);
    }
    for (const v of variants) {
      const c = _compactKey(v);
      if (_compactIndex.has(c)) return _compactIndex.get(c);
    }
    const dict = (typeof window !== 'undefined' && window.CURRICULUM_DICTIONARY) || null;
    const entry = dict && (dict[key] || dict[variants[1]]);
    if (!entry || !entry.tr) return null;
    const enDisplay = entry.en || (key.charAt(0).toUpperCase() + key.slice(1));
    let id = _stableCurriculumId(key);
    while (WORDS_DATA.some(w => w.id === id)) id++;   // olası çakışmaya karşı
    const word = {
      id, no: id, en: enDisplay, tr: entry.tr,
      isMaarif: false, isOxford: false, isYds: false,
      dataset: 'meb', datasets: ['meb'],
      desc: entry.desc || '', pos: entry.pos || '', cefr: entry.cefr || '',
      cat: '', themeNum: 1, themeCode: '', themeTitle: '', themeTitleTr: '',
      phonetic: entry.phonetic || '', example: entry.example || '', definition: '',
      ydsStats: '', ydsExample: '', day: 0, alt: ''
    };
    WORDS_DATA.push(word);
    _wordIndex.set(key, word);
    _compactIndex.set(_compactKey(key), word);
    return word;
  }

  function getActiveGrade() {
    return Math.max(2, Math.min(12, parseInt(STATE.selectedGrade, 10) || 5));
  }

  function _buildGradePool(gNum) {
    const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum];
    const pool = [];
    const meta = new Map();
    const seen = new Set();
    if (!gData) return { pool, meta };
    const add = (raw, w, u) => {
      const word = lookupCurriculumWord(raw);
      if (!word || seen.has(word.id)) return;
      seen.add(word.id);
      pool.push(word);
      meta.set(word.id, {
        weekNum: w ? w.weekNum : 0,
        unitNum: u ? u.unitNum : 0,
        unitTitle: u ? u.title : '',
        unitTitleTr: u ? u.titleTr : ''
      });
    };
    const unitOf = n => gData.units.find(u => u.unitNum === n);
    // 1) Yıllık plan sırası: önce ders haftaları ve tekrar haftaları, hafta hafta
    (gData.calendar || []).forEach(w => (w.targetWords || []).forEach(t => add(t, w, unitOf(w.unitNum))));
    // 2) Haftalara düşmemiş kalan tema kelimeleri
    gData.units.forEach(u => (u.targetVocab || []).forEach(t => add(t, null, u)));
    return { pool, meta };
  }

  /** Seçili (veya verilen) sınıfın kelime havuzu, yıllık plan hafta sırasıyla. */
  function getActiveGradePool(gNum = getActiveGrade()) {
    if (!_gradePoolCache.has(gNum)) _gradePoolCache.set(gNum, _buildGradePool(gNum));
    return _gradePoolCache.get(gNum).pool;
  }

  /** Kelimenin seçili sınıftaki hafta/tema bilgisi (yoksa null). */
  function gradeWordMeta(wordId, gNum = getActiveGrade()) {
    getActiveGradePool(gNum);
    return _gradePoolCache.get(gNum).meta.get(wordId) || null;
  }

  function pickDistractors(target, count = 3, preferredPool = null) {
    const mod = _moduleOf(target);
    const pos = getWordPOS(target);
    const modWords = _moduleWords(mod);
    const sameGroup = mod === 'maarif'
      ? (w => w.themeNum === target.themeNum)
      : (w => w.cefr && w.cefr === target.cefr);

    // Seçili sınıf/kapsam havuzu verildiyse (ör. 7. sınıf müfredatı) önce oradan aynı türde şık aranır
    const pref = preferredPool && preferredPool.length >= 4 ? preferredPool : [];
    const sameUnit = w => {
      const a = gradeWordMeta(target.id), b = gradeWordMeta(w.id);
      return a && b ? a.unitNum === b.unitNum : w.cefr === target.cefr;
    };
    const tiers = [
      pref.filter(w => getWordPOS(w) === pos && sameUnit(w)),
      pref.filter(w => getWordPOS(w) === pos),
      pref,
      modWords.filter(w => getWordPOS(w) === pos && sameGroup(w)),
      modWords.filter(w => getWordPOS(w) === pos),
      modWords,
      WORDS_DATA
    ];

    const picked = [];
    const usedMeanings = new Set([_normMeaning(target.tr)]);
    const usedEn = new Set([String(target.en).toLowerCase()]);
    for (const tier of tiers) {
      if (picked.length >= count) break;
      for (const w of shuffleArray(tier)) {
        if (picked.length >= count) break;
        if (w.id === target.id || !w.tr) continue;
        const m = _normMeaning(w.tr);
        const e = String(w.en).toLowerCase();
        if (usedMeanings.has(m) || usedEn.has(e)) continue;
        picked.push(w);
        usedMeanings.add(m);
        usedEn.add(e);
      }
    }
    return picked;
  }

  /**
   * Esnek cevap karşılaştırma: büyük/küçük harf, baş/son boşluk, tek karakter yazım hataları
   * ve kısa kelimeler için Levenshtein mesafesi ile toleranslı eşleşme sağlar.
   * Kullanım: checkFlexibleAnswer(userInput, correctAnswer) → boolean
   */
  function checkFlexibleAnswer(input, correct) {
    if (!input || !correct) return false;
    const norm = s => String(s).trim().toLowerCase().replace(/[''`]/g, "'").replace(/\s+/g, ' ');
    const a = norm(input);
    const b = norm(correct);
    if (a === b) return true;
    // Tek karakter fark toleransı (ör. "abondon" = "abandon")
    if (Math.abs(a.length - b.length) > 2) return false;
    return _levenshtein(a, b) <= 1;
  }

  function _levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 1; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[m][n];
  }

  function extractPreposition(w) {
    if (!w.example && !w.definition) return null;
    const text = (w.example + ' ' + (w.definition || '')).toLowerCase();
    const word = w.en.toLowerCase();
    const preps = ['to', 'with', 'from', 'of', 'in', 'on', 'for', 'by', 'into', 'against', 'at', 'about', 'upon'];
    for (const prep of preps) {
      const regex = new RegExp(`\\b${word}\\s+(?:(?:somebody|someone|something|sb|sth|the|a|an|his|her|their|its)\\s+)?${prep}\\b`, 'i');
      if (regex.test(text)) {
        return `+ ${prep.toUpperCase()}`;
      }
    }
    return null;
  }

  function getWordSynonym(w) {
    if (w.synonym) return w.synonym;
    const key = w.en.toLowerCase();
    return YDS_SYNONYM_MAP[key] || '';
  }

  function getCefrBadgeHtml(level) {
    const raw = (level || 'A1').trim();
    const safeCls = `cefr-${raw.toLowerCase().replace('+', 'plus')}`;
    return `<span class="cefr-pill ${safeCls}">${raw}</span>`;
  }

  function getThemeBadgeHtml(themeCode, themeTitle) {
    return `<span class="theme-pill">${themeCode} • ${themeTitle}</span>`;
  }

  // ==========================================================================
  // TOP MODULE SWITCHER
  // ==========================================================================

  // ==========================================================================
  // BAUHAUS MOBİL PENCERELERİ (MODÜL & MÜFREDAT MODAL DIALOGLARI)
  // ==========================================================================
  function isAnyModalOpen() {
    const modalIds = ['settings-dialog', 'grade-dialog', 'classifier-dialog', 'pdf-dialog', 'feedback-dialog', 'speech-coach-dialog'];
    return modalIds.some(id => {
      const el = document.getElementById(id);
      return !!(el && el.classList && el.classList.contains('active'));
    });
  }

  function syncBodyModalLock() {
    if (document.body && document.body.classList) {
      document.body.classList.toggle('modal-open', isAnyModalOpen());
    }
  }

  function openSettingsModal() {
    const backdrop = document.getElementById('settings-modal-backdrop');
    const dialog = document.getElementById('settings-dialog');
    if (backdrop) backdrop.classList.add('active');
    if (dialog) dialog.classList.add('active');
    syncBodyModalLock();
  }

  function closeSettingsModal() {
    const backdrop = document.getElementById('settings-modal-backdrop');
    const dialog = document.getElementById('settings-dialog');
    if (backdrop) backdrop.classList.remove('active');
    if (dialog) dialog.classList.remove('active');
    syncBodyModalLock();
  }

  function openCurriculumModal() {
    openSettingsModal();
  }

  function openModesModal() {
    openSettingsModal();
  }

  function closeModals() {
    closeSettingsModal();
    closeGradeModal();
    closeClassifierModal();
    closePdfStudio();
    closeFeedbackModal();
    if (typeof closeSpeechCoach === 'function' && COACH_STATE && COACH_STATE.active) {
      closeSpeechCoach();
    }
  }

  function switchModuleAndClose(moduleKey) {
    closeGradeModal();
    closeSettingsModal();
    switchModule(moduleKey);
  }

  function selectModuleAndGo(moduleKey) {
    switchModule(moduleKey);
    switchView('daily');
  }

  function switchViewAndClose(viewKey) {
    switchView(viewKey);
    closeModals();
  }

  function startQuizSession(count = 10) {
    startQuiz();
  }

  function handleFabAction() {
    if (STATE.currentView === 'home') {
      switchView('daily');
    } else if (STATE.currentView === 'daily') {
      startDailyQuiz();
    } else if (STATE.currentView === 'flashcard') {
      startDailyQuiz();
    } else if (STATE.currentView === 'quiz') {
      startQuiz();
    } else {
      switchView('daily');
    }
  }

  function updateMobileTriggerLabels() {
    const titleEl = document.getElementById('header-user-title');
    const gNum = STATE.selectedGrade || 5;
    const gData = (typeof window !== 'undefined' && window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]) || { name: `${gNum}. Sınıf` };
    const modTitles = {
      maarif: `${gData.name} Müfredatı`,
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'Kelime Kütüphanesi',
      all: 'Tüm Kütüphane'
    };
    if (titleEl && STATE.currentView === 'home') {
      titleEl.textContent = modTitles[STATE.activeModule] || `${gData.name} Müfredatı`;
    }
  }

  function switchModule(moduleName) {
    STATE.activeModule = moduleName;
    localStorage.setItem('learnish_active_module', moduleName);

    // Update active tab buttons in horizontal scroll selector
    document.querySelectorAll('.module-btn').forEach(btn => {
      const isActive = btn.getAttribute('data-module') === moduleName;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const gNum = STATE.selectedGrade || 5;
    const gData = (typeof window !== 'undefined' && window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]) || { name: `${gNum}. Sınıf`, units: [] };

    const modTitles = {
      maarif: `${gData.name} Müfredatı`,
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'Kelime Kütüphanesi',
      all: 'Tüm Kütüphane'
    };
    const titleEl = document.getElementById('header-user-title');
    if (titleEl && STATE.currentView === 'home') {
      titleEl.textContent = modTitles[moduleName] || `${gData.name} Müfredatı`;
    }

    // Update brand info subtitle - Architectural micro-goal telemetry
    const brandSub = document.getElementById('app-brand-subtitle');
    if (brandSub) {
      if (moduleName === 'maarif') brandSub.innerText = `MEB Müfredatı • ${gData.name} (${gData.units.length} Ünite • 36 Hafta Planı)`;
      else if (moduleName === 'yds') brandSub.innerText = 'YDS & YÖKDİL Akademik • Günlük Hedef: 20 Kelime';
      else if (moduleName === 'oxford') brandSub.innerText = 'Kelime Kütüphanesi • Günlük Hedef: 25 Kelime';
      else brandSub.innerText = 'Tüm Kütüphane • Akademik Kelime Arşivi';
    }

    const mebMeta = document.getElementById('mod-tab-meb-meta');
    if (mebMeta) {
      mebMeta.innerText = `${gData.name} • Planlı`;
    }

    // Update Header Route Pill
    const hrIcon = document.getElementById('header-route-icon');
    const hrLabel = document.getElementById('header-route-label');
    const hrPill = document.getElementById('header-route-pill-btn');
    if (hrIcon) {
      const iconKey = moduleName === 'maarif' ? 'school' : (moduleName === 'yds' ? 'target' : 'book');
      hrIcon.innerHTML = renderIcon(iconKey, 18, 'hrp-svg-icon');
      hrIcon.setAttribute('data-icon', iconKey);
    }
    if (hrLabel) {
      if (moduleName === 'maarif') hrLabel.textContent = `${gData.name} MEB`;
      else if (moduleName === 'yds') hrLabel.textContent = 'YDS / YÖKDİL';
      else if (moduleName === 'oxford') hrLabel.textContent = 'Kütüphane';
      else hrLabel.textContent = 'Tüm Kütüphane';
    }
    if (hrPill) hrPill.setAttribute('data-active-module', moduleName);

    // Dynamic Navigation Labels
    const dailyText = document.getElementById('tab-daily-text');
    const flashText = document.getElementById('tab-flashcard-text');
    const quizText = document.getElementById('tab-quiz-text');
    const dirText = document.getElementById('tab-directory-text');
    const statsText = document.getElementById('tab-stats-text');

    if (moduleName === 'yds') {
      if (dailyText) dailyText.innerText = "YDS Workout";
      if (flashText) flashText.innerText = "Sınav Kartları";
      if (quizText) quizText.innerText = "YDS Simülatör";
      if (dirText) dirText.innerText = "Akademik Havuz";
      if (statsText) statsText.innerText = "YDS Analizi";
      STATE.directoryFilters.dataset = 'yds';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.flashcardSource = 'yds_all';
    } else if (moduleName === 'maarif') {
      if (dailyText) dailyText.innerText = `${gData.name} Takibi`;
      if (flashText) flashText.innerText = `${gData.name} Kartları`;
      if (quizText) quizText.innerText = `${gData.name} Sınavı`;
      if (dirText) dirText.innerText = "Kelime Kütüphanesi";
      if (statsText) statsText.innerText = "Kazanım Analizi";
      STATE.directoryFilters.dataset = 'all';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.flashcardSource = 'daily';
    } else if (moduleName === 'oxford') {
      if (dailyText) dailyText.innerText = "Günün Kelimeleri";
      if (flashText) flashText.innerText = "Kütüphane Kartları";
      if (quizText) quizText.innerText = "Seviye Testi";
      if (dirText) dirText.innerText = "Kütüphane";
      if (statsText) statsText.innerText = "Kütüphane Analizi";
      STATE.directoryFilters.dataset = 'oxford';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.flashcardSource = 'daily';
    } else {
      if (dailyText) dailyText.innerText = "Günün 10'lusu";
      if (flashText) flashText.innerText = "Flashcard";
      if (quizText) quizText.innerText = "Quiz & Test";
      if (dirText) dirText.innerText = "Kelime Havuzu";
      if (statsText) statsText.innerText = "İstatistik";
      STATE.directoryFilters.dataset = 'all';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.flashcardSource = 'all';
    }

    updateUI();
  }

  // ==========================================================================
  // K-12 KADEME VE SINIF SEÇİCİ MODAL (Grade & Curriculum Modal Controller)
  // ==========================================================================
  function openGradeModal() {
    const dialog = document.getElementById('grade-dialog');
    const backdrop = document.getElementById('grade-modal-backdrop');
    const body = document.getElementById('grade-dialog-body');
    if (!dialog || !backdrop || !body) return;

    const curGrade = STATE.selectedGrade || 5;
    const curMod = STATE.activeModule;

    const stages = [
      {
        id: 'ilkokul',
        title: 'İLKOKUL',
        badge: '1 - 4. SINIF',
        badgeClass: 'stage-badge-ilkokul',
        grades: [1, 2, 3, 4]
      },
      {
        id: 'ortaokul',
        title: 'ORTAOKUL & LGS',
        badge: '5 - 8. SINIF',
        badgeClass: 'stage-badge-ortaokul',
        grades: [5, 6, 7, 8]
      },
      {
        id: 'lise',
        title: 'LİSE & YDT',
        badge: '9 - 12. SINIF',
        badgeClass: 'stage-badge-lise',
        grades: [9, 10, 11, 12]
      }
    ];

    let html = `
      <div class="stage-group-card">
        <div class="stage-group-header">
          <span class="stage-group-title">AKADEMİK &amp; GENEL HAVUZLAR</span>
          <span class="stage-group-badge stage-badge-akademik">SINAV &amp; DÜNYA</span>
        </div>
        <div class="stage-grade-grid">
          <button type="button" class="stage-grade-btn ${curMod === 'yds' ? 'active' : ''}" onclick="window.APP.switchModuleAndClose('yds')">
            <div class="sgb-info">
              <span class="sgb-name">YDS &amp; YÖKDİL</span>
              <span class="sgb-meta">B2–C1 • ${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')} Kelime</span>
            </div>
            <span class="sgb-check">${renderIcon('check', 14, '', 3)}</span>
          </button>
          <button type="button" class="stage-grade-btn ${curMod === 'oxford' ? 'active' : ''}" onclick="window.APP.switchModuleAndClose('oxford')">
            <div class="sgb-info">
              <span class="sgb-name">Kelime Kütüphanesi</span>
              <span class="sgb-meta">A1–C1 • ${WORDS_DATA.filter(isOxfordWord).length.toLocaleString('tr-TR')} Kelime</span>
            </div>
            <span class="sgb-check">${renderIcon('check', 14, '', 3)}</span>
          </button>
          <button type="button" class="stage-grade-btn ${curMod === 'all' ? 'active' : ''}" onclick="window.APP.switchModuleAndClose('all')">
            <div class="sgb-info">
              <span class="sgb-name">Tüm Kütüphane</span>
              <span class="sgb-meta">Birleşik ${WORDS_DATA.length.toLocaleString('tr-TR')} Kelime</span>
            </div>
            <span class="sgb-check">${renderIcon('check', 14, '', 3)}</span>
          </button>
        </div>
      </div>
    `;

    for (const st of stages) {
      html += `
        <div class="stage-group-card">
          <div class="stage-group-header">
            <span class="stage-group-title">${st.title}</span>
            <span class="stage-group-badge ${st.badgeClass}">${st.badge}</span>
          </div>
          <div class="stage-grade-grid">
      `;

      for (const gNum of st.grades) {
        const gData = (window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]) || { name: `${gNum}. Sınıf`, cefr: 'A1', units: [] };
        const isCurrentActive = (curMod === 'maarif' && curGrade === gNum);
        const hasPlan = gData.hasPlan !== false;

        html += hasPlan ? `
          <button type="button" class="stage-grade-btn ${isCurrentActive ? 'active' : ''}" onclick="window.APP.switchGrade(${gNum})">
            <div class="sgb-info">
              <span class="sgb-name">${gData.name}</span>
              <span class="sgb-meta">CEFR ${gData.cefr} • ${gData.units.length} Ünite</span>
            </div>
            <span class="sgb-check">${renderIcon('check', 14, '', 3)}</span>
          </button>
        ` : `
          <button type="button" class="stage-grade-btn disabled" disabled style="opacity:.45;cursor:not-allowed">
            <div class="sgb-info">
              <span class="sgb-name">${gData.name}</span>
              <span class="sgb-meta">Plan Yok</span>
            </div>
          </button>
        `;
      }

      html += `
          </div>
        </div>
      `;
    }

    body.innerHTML = html;
    body.style.overflowY = 'auto';
    body.style.maxHeight = 'calc(86vh - 82px)';
    body.style.flex = '1 1 auto';
    body.style.minHeight = '0';
    body.style.overscrollBehavior = 'contain';
    body.scrollTop = 0;
    backdrop.classList.add('active');
    dialog.classList.add('active');
    syncBodyModalLock();
  }

  function closeGradeModal() {
    const dialog = document.getElementById('grade-dialog');
    const backdrop = document.getElementById('grade-modal-backdrop');
    if (dialog) dialog.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    syncBodyModalLock();
  }

  function switchGrade(gradeNum) {
    const gNum = Math.max(2, Math.min(12, parseInt(gradeNum, 10) || 5));
    STATE.selectedGrade = gNum;
    STATE.activeModule = 'maarif';
    STATE.activeCurriculumWeek = null;
    // Her sınıfın havuzu farklıdır: günlük çalışma o sınıfın bu haftasına konumlanır
    STATE.currentDay = getMEBCalendarInfo().day;
    try {
      localStorage.setItem('learnish_selected_grade', gNum.toString());
      localStorage.setItem('learnish_active_module', 'maarif');
      localStorage.setItem('mk_current_day', String(STATE.currentDay));
    } catch (e) { /* depolama kapalıysa yalnızca oturumda geçerli */ }

    closeGradeModal();
    switchModule('maarif');
    if (STATE.currentView === 'daily') {
      renderDailyView();
    }
  }

  // ==========================================================================
  // SEMANTİK BAĞLAMA MOTORU MODAL (Curriculum Context Classifier Modal)
  // ==========================================================================
  function openClassifierForWord(wordInput) {
    const dialog = document.getElementById('classifier-dialog');
    const backdrop = document.getElementById('classifier-modal-backdrop');
    const body = document.getElementById('classifier-dialog-body');
    if (!dialog || !backdrop || !body || !window.CURRICULUM_CLASSIFIER) return;

    let wordObj = null;
    let wordStr = '';
    if (typeof wordInput === 'object') {
      wordObj = wordInput;
      wordStr = wordObj.en || '';
    } else {
      wordStr = String(wordInput || '').trim();
      wordObj = WORDS_DATA.find(w => w.en.toLowerCase() === wordStr.toLowerCase()) || { en: wordStr, tr: '', phonetic: '', cefr: '' };
    }

    const result = window.CURRICULUM_CLASSIFIER.classify(wordObj);
    const scorePercent = Math.round(result.confidence * 100);

    let alternatesHtml = '';
    if (result.alternateMatches && result.alternateMatches.length > 0) {
      alternatesHtml = `
        <div class="classifier-alternates-section">
          <span class="cas-title">DİĞER İLİŞKİLİ KADEME VE ÜNİTELER:</span>
          ${result.alternateMatches.map(alt => `
            <div class="cas-item">
              <span class="cas-item-name">${alt.gradeName} • ${alt.unitTitle} (${alt.unitTitleTr || ''})</span>
              <span class="cas-item-score">%${Math.round(alt.confidence * 100)} UYUM</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    body.innerHTML = `
      <div class="classifier-word-banner">
        <div class="cwb-left">
          <span class="cwb-word">${escapeHtml(wordObj.en)}</span>
          <span class="cwb-meta">${escapeHtml(wordObj.phonetic ? `/${wordObj.phonetic}/ • ` : '')}${escapeHtml(wordObj.tr || 'Türkçe karşılık')}</span>
        </div>
        <button type="button" class="s-action-circle" onclick="window.APP.speakWord('${escapeHtml(wordObj.en)}')" title="Dinle">
          ${ICONS.speaker}
        </button>
      </div>

      <div class="classifier-result-card">
        <div class="crc-badge-row">
          <span class="crc-tag">${result.matchType === 'canonical_curriculum' ? '★ RESMİ MEB MÜFREDAT HEDEFİ' : `${renderIcon('sparkles', 12)} SEMANTİK BAĞLAM EŞLEŞMESİ`}</span>
          <span class="crc-score">%${scorePercent} GÜVEN</span>
        </div>
        <h3 class="crc-title">${result.gradeName} • ${result.unitTitle}</h3>
        <p class="crc-desc">${result.unitTitleTr}</p>
      </div>

      <div class="classifier-rationale-box">
        <strong>Pedagojik Bağlama Gerekçesi:</strong>
        <p style="margin: 4px 0 0 0;">${result.rationale}</p>
      </div>

      ${alternatesHtml}

      <div class="classifier-action-row">
        <button type="button" class="classifier-go-btn" onclick="window.APP.goToCurriculumUnit(${result.grade}, ${result.unitNum})">
          ${renderIcon('school', 15)} ${result.gradeName} Bu Ünitenin Haftalık Planına Git
        </button>
      </div>
    `;

    backdrop.classList.add('active');
    dialog.classList.add('active');
    syncBodyModalLock();
  }

  function closeClassifierModal() {
    const dialog = document.getElementById('classifier-dialog');
    const backdrop = document.getElementById('classifier-modal-backdrop');
    if (dialog) dialog.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    syncBodyModalLock();
  }

  function goToCurriculumUnit(grade, unitNum) {
    grade = Math.max(2, Math.min(12, parseInt(grade, 10) || 5));
    STATE.selectedGrade = grade;
    STATE.activeModule = 'maarif';
    const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[grade];
    if (gData && gData.calendar) {
      const matchWeek = gData.calendar.find(w => w.unitNum === unitNum);
      STATE.activeCurriculumWeek = matchWeek ? matchWeek.weekNum : 1;
    }
    closeClassifierModal();
    switchModule('maarif');
    switchView('daily');
  }

  function changeScheduleWeek(targetWeekNum) {
    STATE.activeCurriculumWeek = Math.max(1, Math.min(36, parseInt(targetWeekNum, 10) || 1));
    renderDailyView();
  }

  function goToTodayCurriculumWeek() {
    STATE.activeCurriculumWeek = null;
    renderDailyView();
  }

  function toggleCurriculumOutcomes(btn) {
    const drawer = document.getElementById('cocAllOutcomesDrawer');
    if (!drawer) return;
    const isHidden = drawer.style.display === 'none';
    if (isHidden) {
      drawer.style.display = 'flex';
      if (btn) {
        btn.classList.add('expanded');
        btn.innerHTML = `<span>Kazanımları Gizle</span> ▴`;
      }
    } else {
      drawer.style.display = 'none';
      if (btn) {
        btn.classList.remove('expanded');
        const total = btn.getAttribute('data-total') || '';
        btn.innerHTML = `<span>Tüm Kazanımları Gör (${total} Kazanım)</span> ▾`;
      }
    }
  }

  // ==========================================================================
  // PDF & ÇALIŞMA KAĞIDI STÜDYOSU (Printable Worksheet & PDF Studio)
  // ==========================================================================
  const PDF_STUDIO_STATE = {
    template: 'mistakes', // 'mistakes' | 'curriculum' | 'quiz' | 'flashcards'
    grade: 5,             // 1-12, 'yds', 'oxford'
    scope: 'mistakes',     // 'mistakes', 'current_week', 'unit', 'starred', 'all'
    unitNum: 1,
    limit: 15,
    fillExtra: false,     // Hata Defteri: hata sayısı limitten azsa müfredat kelimeleriyle tamamla (varsayılan kapalı)
    showTr: true,
    showPhonetic: true,
    showExamples: true,
    showWritingPractice: true,
    showMatching: true,
    includeAnswerKey: true,
    studentName: ''
  };

  // Eski imza korunuyor; tüm çözümleme lookupCurriculumWord üzerinden (kalıcı id, yalnızca tam eşleşme)
  function resolveCurriculumWord(wStr) {
    return lookupCurriculumWord(wStr);
  }

  function resolveWorksheetWord(rawItem) {
    return lookupCurriculumWord(rawItem);
  }

  function getWorksheetTargetWords(state = PDF_STUDIO_STATE) {
    const { template, grade, scope, unitNum, limit } = state;
    let list = [];
    const targetLimit = limit === 'all' ? 50 : (parseInt(limit, 10) || 10);

    const getGradePool = () => {
      if (grade === 'yds') {
        return WORDS_DATA.filter(isYDSWord);
      } else if (grade === 'oxford') {
        return WORDS_DATA.filter(isOxfordWord);
      } else {
        const gNum = parseInt(grade, 10) || 5;
        const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum];
        const currWords = (gData && gData.units) ? gData.units.flatMap(u => (u.targetVocab || []).map(resolveWorksheetWord)).filter(Boolean) : [];
        return currWords.length > 0 ? currWords : getActiveGradePool();
      }
    };

    if (template === 'mistakes' || scope === 'mistakes') {
      const activeMistakes = getActiveMistakeWords();
      if (grade && grade !== 'all' && grade !== 'yds' && grade !== 'oxford') {
        const gNum = parseInt(grade, 10);
        const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum];
        if (gData && gData.units) {
          const gKeywords = new Set(gData.units.flatMap(u => (u.targetVocab || []).concat(u.semanticKeywords || [])).map(s => String(s).toLowerCase()));
          // Yalnızca seçilen sınıfa ait yanlışlar alınır. Boşsa başka modüllerin (ör. YDS) yanlışlarına
          // geri DÖNÜLMEZ; eksik kısım aşağıda sınıfın kendi müfredat havuzundan tamamlanır.
          list = activeMistakes.filter(w => gKeywords.has(w.en.toLowerCase()) || (gNum === 5 && isMaarifWord(w)));
        } else {
          list = activeMistakes;
        }
      } else if (grade === 'yds') {
        list = activeMistakes.filter(isYDSWord);
      } else if (grade === 'oxford') {
        list = activeMistakes.filter(isOxfordWord);
      } else {
        list = activeMistakes;
      }

      // Hata Defteri föyü varsayılan olarak YALNIZCA gerçek hataları içerir; limit hata sayısına
      // göre kısılır. Kullanıcı "fillExtra" seçeneğini elle açarsa, kalan kısım sınıf müfredat
      // havuzundan tamamlanır (hatalar en başta kalır).
      if (state.fillExtra && list.length < targetLimit) {
        const poolFiller = getGradePool();
        const existingIds = new Set(list.map(w => w.id));
        for (const w of poolFiller) {
          if (!existingIds.has(w.id)) {
            list.push(w);
            existingIds.add(w.id);
            if (list.length >= targetLimit) break;
          }
        }
      }
    } else if (scope === 'current_week') {
      const gNum = parseInt(grade, 10) || 5;
      if (window.CURRICULUM_CLASSIFIER) {
        const sched = window.CURRICULUM_CLASSIFIER.getSchedule(gNum);
        const rawTargetWords = sched.targetWords || [];
        list = rawTargetWords.map(resolveWorksheetWord).filter(Boolean);
      }
      if (list.length < targetLimit) {
        const poolFiller = getGradePool();
        const existingIds = new Set(list.map(w => w.id));
        for (const w of poolFiller) {
          if (!existingIds.has(w.id)) {
            list.push(w);
            existingIds.add(w.id);
            if (list.length >= targetLimit) break;
          }
        }
      }
    } else if (scope === 'unit') {
      const gNum = parseInt(grade, 10) || 5;
      const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum];
      if (gData && gData.units) {
        const targetUnit = gData.units.find(u => u.unitNum === parseInt(unitNum, 10)) || gData.units[0];
        const rawWords = (targetUnit.targetVocab || []).concat(targetUnit.semanticKeywords || []);
        list = rawWords.map(resolveWorksheetWord).filter(Boolean);
      }
      if (list.length < targetLimit) {
        const poolFiller = getGradePool();
        const existingIds = new Set(list.map(w => w.id));
        for (const w of poolFiller) {
          if (!existingIds.has(w.id)) {
            list.push(w);
            existingIds.add(w.id);
            if (list.length >= targetLimit) break;
          }
        }
      }
    } else if (scope === 'starred') {
      const starredIds = Array.from(STATE.userData.starred || []);
      list = WORDS_DATA.filter(w => starredIds.includes(w.id));
      if (list.length < targetLimit) {
        const poolFiller = getGradePool();
        const existingIds = new Set(list.map(w => w.id));
        for (const w of poolFiller) {
          if (!existingIds.has(w.id)) {
            list.push(w);
            existingIds.add(w.id);
            if (list.length >= targetLimit) break;
          }
        }
      }
    } else { // 'all'
      const gNum = parseInt(grade, 10);
      if (gNum >= 1 && gNum <= 12) {
        const gData = window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum];
        if (gData && gData.units) {
          list = gData.units.flatMap(u => (u.targetVocab || []).map(resolveWorksheetWord)).filter(Boolean);
        }
        if (list.length === 0) list = getActiveGradePool();
      } else if (grade === 'yds') {
        list = WORDS_DATA.filter(isYDSWord);
      } else if (grade === 'oxford') {
        list = WORDS_DATA.filter(isOxfordWord);
      } else {
        list = WORDS_DATA.slice(0, 50);
      }
    }

    const seen = new Set();
    const unique = [];
    for (const w of list) {
      if (!w || !w.en) continue;
      const key = w.en.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(w);
      }
    }

    const numLimit = parseInt(limit, 10);
    return !isNaN(numLimit) && numLimit > 0 ? unique.slice(0, numLimit) : unique;
  }

  function generateWorksheetHTML(state = PDF_STUDIO_STATE, isForPrint = false) {
    const words = getWorksheetTargetWords(state);
    const dateFormatted = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    const gNum = parseInt(state.grade, 10);
    let gradeLabel = '5. Sınıf (MEB)';
    if (gNum >= 1 && gNum <= 12) {
      gradeLabel = `${gNum}. Sınıf (${gNum <= 4 ? 'İlkokul' : gNum <= 8 ? 'Ortaokul' : 'Lise'})`;
    } else if (state.grade === 'yds') {
      gradeLabel = 'YDS &amp; YÖKDİL';
    } else if (state.grade === 'oxford') {
      gradeLabel = 'Kelime Kütüphanesi (A1-C1)';
    }

    let titleMain = 'KAZANIM VE KELİME ÇALIŞMA FÖYÜ';
    let subTitle = `MEB İngilizce Maarif Modeli • ${gradeLabel}`;
    let bannerHtml = '';

    if (state.template === 'mistakes') {
      titleMain = 'AKILLI HATA DEFTERİ &amp; KURTARMA ÇALIŞMA FÖYÜ';
      subTitle = `Bilişsel Hata Analizi • ${gradeLabel} • Toplam ${words.length} Kritik Kelime`;
      bannerHtml = `
        <div class="ws-banner">
          <span class="ws-banner-title">${renderIcon('alert', 15)} BİLİŞSEL GELİŞİM VE HATA AYIKLAMA YÖNERGESİ:</span>
          <span class="ws-banner-desc">Bu çalışma föyü testlerde yanlış cevaplanan kelimelerinizden derlenmiştir. Anlamları inceleyiniz, kelimeleri 3 kez yazım alanına yazınız ve örnek cümle kurarak kalıcı hafızaya aktarınız.</span>
        </div>
      `;
    } else if (state.template === 'curriculum') {
      let focusText = 'Haftalık hedef kelimeler ve iletişimsel dil işlevleri.';
      if (window.CURRICULUM_CLASSIFIER && gNum >= 1 && gNum <= 12) {
        const sched = window.CURRICULUM_CLASSIFIER.getSchedule(gNum);
        if (sched && sched.focus) focusText = sched.focus;
      }
      titleMain = 'MEB MAARİF MODELİ HAFTALIK ÇALIŞMA FÖYÜ';
      subTitle = `${gradeLabel} • Hedef Müfredat Kelimeleri`;
      bannerHtml = `
        <div class="ws-banner banner-curriculum">
          <span class="ws-banner-title">${renderIcon('book', 15)} HAFTANIN ODAĞI &amp; KAZANIMI:</span>
          <span class="ws-banner-desc">${escapeHtml(focusText)}</span>
        </div>
      `;
    } else if (state.template === 'quiz') {
      const qCount = state.limit === 'all' ? words.length : (parseInt(state.limit, 10) || 10);
      const durationMinutes = Math.max(10, Math.round(qCount * 1.5));
      titleMain = 'KELİME KAZANIM DEĞERLENDİRME TESTİ (QUIZ)';
      subTitle = `${gradeLabel} • Toplam ${qCount} Soru • Süre: ${durationMinutes} Dakika • Puan: 100`;
      bannerHtml = `
        <div class="ws-banner banner-quiz">
          <span class="ws-banner-title">${renderIcon('fileText', 15)} SINAV YÖNERGESİ:</span>
          <span class="ws-banner-desc">Soruları dikkatle okuyunuz ve doğru seçeneği işaretleyiniz. Cevap anahtarı sayfanın en altında yer almaktadır.</span>
        </div>
      `;
    } else if (state.template === 'flashcards') {
      titleMain = 'YAZDIRILABİLİR KES &amp; KATLA KELİME KARTLARI';
      subTitle = `${gradeLabel} • Çift Taraflı Çalışma Kartları`;
      bannerHtml = `
        <div class="ws-banner banner-flashcards">
          <span class="ws-banner-title">${renderIcon('scissors', 15)} KULLANIM KILAVUZU:</span>
          <span class="ws-banner-desc">Kesik çizgilerden (---) kesiniz, ortadaki noktalı çizgiden (:::) ikiye katlayınız. Bir yüzü İngilizce, diğer yüzü Türkçe taşınabilir kartınız hazır!</span>
        </div>
      `;
    }

    const studentTableHtml = `
      <table class="ws-student-table">
        <tr>
          <td style="width: 50%;">
            <span class="ws-field-label">ÖĞRENCİ ADI SOYADI:</span>
            <span class="ws-field-blank">${state.studentName ? escapeHtml(state.studentName) : '...................................................'}</span>
          </td>
          <td style="width: 25%;">
            <span class="ws-field-label">SINIF / ŞUBE:</span>
            <span class="ws-field-blank">........... / ...........</span>
          </td>
          <td style="width: 25%;">
            <span class="ws-field-label">TARİH:</span>
            <span class="ws-field-blank">${dateFormatted}</span>
          </td>
        </tr>
      </table>
    `;

    let bodyHtml = '';

    if (state.template === 'mistakes' || state.template === 'curriculum') {
      bodyHtml += `<div class="ws-cards-list">`;
      words.forEach((w, idx) => {
        const mistakeData = STATE.userData.mistakes[w.id];
        const mistakeCount = (mistakeData && mistakeData.wrongCount) || 1;
        const posText = w.pos || w.desc || 'kelime';

        bodyHtml += `
          <div class="ws-word-card">
            <div class="ws-wc-top">
              <div class="ws-wc-left">
                <span class="ws-wc-index">#${idx + 1}</span>
                <span class="ws-wc-en">${escapeHtml(w.en)}</span>
                ${state.showPhonetic && w.phonetic ? `<span class="ws-wc-phonetic">${escapeHtml(w.phonetic)}</span>` : ''}
                <span class="ws-wc-pos">${escapeHtml(posText)}</span>
                ${w.cefr ? `<span class="ws-wc-pos" style="background:#fef3c7; border-color:#fde68a; color:#b45309;">${escapeHtml(w.cefr)}</span>` : ''}
              </div>
              ${state.template === 'mistakes' ? `<span class="ws-wc-badge">⚠️ ${mistakeCount}x Yanlış Yapıldı</span>` : ''}
            </div>

            ${state.showTr ? `<div class="ws-wc-tr"><strong>Türkçe Anlamı:</strong> ${escapeHtml(w.tr || '—')}</div>` : ''}
            ${state.showExamples && (w.example || w.definition) ? `
              <div class="ws-wc-example"><strong>Örnek Cümle:</strong> “${escapeHtml(w.example || w.definition)}”</div>
            ` : ''}

            ${state.showWritingPractice ? `
              <div class="ws-practice-grid">
                <div class="ws-practice-line-row">
                  <span>Doğru Yazım (3x):</span>
                  <span class="ws-dotted-blank"></span>
                  <span class="ws-dotted-blank"></span>
                  <span class="ws-dotted-blank"></span>
                </div>
                <div class="ws-practice-line-row" style="margin-top:2px;">
                  <span>Kendi Cümleniz:</span>
                  <span class="ws-dotted-blank"></span>
                </div>
              </div>
            ` : ''}
          </div>
        `;
      });
      bodyHtml += `</div>`;

      if (state.showMatching && words.length >= 4) {
        const matchSlice = words.slice(0, Math.min(6, words.length));
        const shuffledTr = matchSlice.map((w, i) => ({ tr: w.tr, originalIndex: i }))
                                     .sort(() => 0.5 - Math.random());

        bodyHtml += `
          <div class="ws-matching-section">
            <div class="ws-matching-title">BÖLÜM B: HIZLI EŞLEŞTİRME ALIŞTIRMASI (MATCHING CHALLENGE)</div>
            <div style="font-size:10.5px; color:#64748b; margin-bottom:8px;">Sol taraftaki İngilizce kelimeleri sağ taraftaki doğru Türkçe karşılıkları ile ok çekerek eşleştiriniz:</div>
            <div class="ws-matching-columns">
              <div>
                ${matchSlice.map((w, i) => `
                  <div class="ws-match-item">
                    <span class="ws-match-bullet"></span>
                    <strong>${i + 1}.</strong>
                    <span>${escapeHtml(w.en)}</span>
                  </div>
                `).join('')}
              </div>
              <div>
                ${shuffledTr.map((item, i) => `
                  <div class="ws-match-item">
                    <span class="ws-match-bullet"></span>
                    <strong>${String.fromCharCode(65 + i)})</strong>
                    <span>${escapeHtml(item.tr)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }
    } else if (state.template === 'quiz') {
      const targetLimit = state.limit === 'all' ? words.length : (parseInt(state.limit, 10) || 10);
      const quizWords = words.slice(0, targetLimit);
      const answerKey = [];

      bodyHtml += `<div class="ws-quiz-list">`;
      quizWords.forEach((w, qIdx) => {
        const distractors = pickDistractors(w, 3, words).map(d => d.tr);

        const correctLetterIdx = Math.floor(Math.random() * 4);
        const letters = ['A', 'B', 'C', 'D'];
        answerKey.push(`${qIdx + 1}-${letters[correctLetterIdx]}`);

        const options = [];
        let dIdx = 0;
        for (let i = 0; i < 4; i++) {
          if (i === correctLetterIdx) {
            options.push(w.tr);
          } else {
            options.push(distractors[dIdx++] || '—');
          }
        }

        bodyHtml += `
          <div class="ws-quiz-item">
            <div class="ws-quiz-q-title">${qIdx + 1}. "${escapeHtml(w.en)}" kelimesinin Türkçe karşılığı aşağıdakilerden hangisidir?</div>
            <div class="ws-quiz-options-grid">
              ${options.map((opt, oIdx) => `
                <div class="ws-quiz-opt">
                  <span class="ws-opt-letter">${letters[oIdx]})</span>
                  <span>${escapeHtml(opt)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      });
      bodyHtml += `</div>`;

      if (state.includeAnswerKey) {
        bodyHtml += `
          <div class="ws-answer-key-box">
            <div class="ws-answer-key-title">${renderIcon('scissors', 14)} CEVAP ANAHTARI (ANSWER KEY):</div>
            <div class="ws-answer-key-content">${answerKey.join('   •   ')}</div>
          </div>
        `;
      }
    } else if (state.template === 'flashcards') {
      const targetLimit = state.limit === 'all' ? words.length : (parseInt(state.limit, 10) || 8);
      const fcWords = words.slice(0, targetLimit);
      bodyHtml += `<div class="ws-flashcards-grid">`;
      fcWords.forEach((w, idx) => {
        bodyHtml += `
          <div class="ws-fc-cut-card">
            <div class="ws-fc-side-en">
              <span style="font-size:9px; font-weight:800; color:#94a3b8;">KART #${idx + 1}</span>
              <div style="font-size:16px; font-weight:900; color:#171e19; margin:4px 0 2px 0;">${escapeHtml(w.en)}</div>
              ${w.phonetic ? `<div style="font-size:10px; color:#64748b; font-style:italic;">${escapeHtml(w.phonetic)}</div>` : ''}
              <div style="font-size:9.5px; font-weight:700; color:#0284c7; margin-top:4px;">${escapeHtml(w.desc || w.pos || 'kelime')}</div>
            </div>
            <div class="ws-fc-side-tr">
              <span style="font-size:9px; font-weight:800; color:#94a3b8;">TÜRKÇE / ÖRNEK</span>
              <div style="font-size:13px; font-weight:800; color:#334155; margin:4px 0 2px 0;">${escapeHtml(w.tr || '—')}</div>
              ${w.example ? `<div style="font-size:10px; color:#475569; font-style:italic; line-height:1.3;">“${escapeHtml(w.example)}”</div>` : ''}
            </div>
          </div>
        `;
      });
      bodyHtml += `</div>`;
    }

    return `
      <div class="ws-doc">
        <header class="ws-header">
          <div class="ws-brand-wrap">
            <span class="ws-logo-text">LEARNISH</span>
            <span style="font-size:10px; font-weight:800; background:#ca0013; color:#fff; padding:2px 6px; border-radius:4px;">STUDY SHEET</span>
          </div>
          <div class="ws-title-wrap">
            <h1 class="ws-main-title">${titleMain}</h1>
            <p class="ws-sub-title">${subTitle}</p>
          </div>
        </header>

        ${studentTableHtml}
        ${bannerHtml}
        ${bodyHtml}

        <footer class="ws-footer">
          <span>Learnish Akıllı İngilizce Öğrenim Sistemi • MEB Maarif Modeli</span>
          <span>${dateFormatted} • Başarılar Dileriz!</span>
        </footer>
      </div>
    `;
  }

  function openPdfStudio(presetMode = null) {
    if (presetMode === 'mistakes') {
      PDF_STUDIO_STATE.template = 'mistakes';
      PDF_STUDIO_STATE.scope = 'mistakes';
    } else if (presetMode === 'daily') {
      PDF_STUDIO_STATE.template = 'curriculum';
      PDF_STUDIO_STATE.scope = 'current_week';
      PDF_STUDIO_STATE.grade = STATE.selectedGrade || 5;
    } else if (presetMode === 'quiz') {
      PDF_STUDIO_STATE.template = 'quiz';
    } else if (presetMode === 'flashcards') {
      PDF_STUDIO_STATE.template = 'flashcards';
    }

    const dialog = document.getElementById('pdf-dialog');
    const backdrop = document.getElementById('pdf-modal-backdrop');
    if (!dialog || !backdrop) return;

    renderPdfStudio();
    backdrop.classList.add('active');
    dialog.classList.add('active');
    fitPdfPreview();
    syncBodyModalLock();
  }

  function closePdfStudio() {
    const dialog = document.getElementById('pdf-dialog');
    const backdrop = document.getElementById('pdf-modal-backdrop');
    if (dialog) dialog.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    syncBodyModalLock();
  }

  function updatePdfStudioOption(key, value) {
    PDF_STUDIO_STATE[key] = value;
    if (key === 'template' && value === 'mistakes') {
      PDF_STUDIO_STATE.scope = 'mistakes';
    }
    renderPdfPreview();
    if (key === 'template' || key === 'grade' || key === 'scope') {
      renderPdfStudio();
    }
  }

  function renderPdfStudio() {
    const body = document.getElementById('pdf-dialog-body');
    if (!body) return;
    const state = PDF_STUDIO_STATE;

    body.innerHTML = `
      <div class="pdf-studio-layout">
        <!-- Sol Kontrol Paneli -->
        <div class="pdf-controls-pane">
          <!-- 1. Şablon Seçimi -->
          <div class="pdf-form-group">
            <label class="pdf-group-label">1. ÇALIŞMA ŞABLONU SEÇİN</label>
            <div class="pdf-template-grid">
              <button type="button" class="pdf-template-btn ${state.template === 'mistakes' ? 'active' : ''}" onclick="window.APP.updatePdfStudioOption('template', 'mistakes')">
                <span class="ptb-icon">${renderIcon('alert', 22)}</span>
                <div class="ptb-info">
                  <span class="ptb-title">Hata Kampı &amp; Yanlışlar</span>
                  <span class="ptb-desc">Yanlış yapılan kelimeler, 3x yazım &amp; kurtarma</span>
                </div>
              </button>
              <button type="button" class="pdf-template-btn ${state.template === 'curriculum' ? 'active' : ''}" onclick="window.APP.updatePdfStudioOption('template', 'curriculum')">
                <span class="ptb-icon">${renderIcon('book', 22)}</span>
                <div class="ptb-info">
                  <span class="ptb-title">Sınıf Müfredat Föyü</span>
                  <span class="ptb-desc">Seçilen sınıf ve haftanın hedef kelimeleri</span>
                </div>
              </button>
              <button type="button" class="pdf-template-btn ${state.template === 'quiz' ? 'active' : ''}" onclick="window.APP.updatePdfStudioOption('template', 'quiz')">
                <span class="ptb-icon">${renderIcon('fileText', 22)}</span>
                <div class="ptb-info">
                  <span class="ptb-title">Yazdırılabilir Test &amp; Quiz</span>
                  <span class="ptb-desc">Çoktan seçmeli sınav kağıdı + Cevap Anahtarı</span>
                </div>
              </button>
              <button type="button" class="pdf-template-btn ${state.template === 'flashcards' ? 'active' : ''}" onclick="window.APP.updatePdfStudioOption('template', 'flashcards')">
                <span class="ptb-icon">${renderIcon('scissors', 22)}</span>
                <div class="ptb-info">
                  <span class="ptb-title">Kes &amp; Katla Kartları</span>
                  <span class="ptb-desc">A4 basılıp katlanan çift taraflı cep kartları</span>
                </div>
              </button>
            </div>
          </div>

          <!-- 2. Sınıf ve Kapsam -->
          <div class="pdf-form-group">
            <label class="pdf-group-label">2. SINIF VE KAPSAM AYARI</label>
            <div class="pdf-form-row">
              <div class="pdf-field-wrap">
                <span class="pdf-field-title">Sınıf / Havuz:</span>
                <select id="pdf-grade-select" class="pdf-select" onchange="window.APP.updatePdfStudioOption('grade', this.value)">
                  <optgroup label="İlkokul (MEB)">
                    <option value="2" ${state.grade == 2 ? 'selected' : ''}>2. Sınıf</option>
                    <option value="3" ${state.grade == 3 ? 'selected' : ''}>3. Sınıf</option>
                    <option value="4" ${state.grade == 4 ? 'selected' : ''}>4. Sınıf</option>
                  </optgroup>
                  <optgroup label="Ortaokul &amp; LGS (MEB)">
                    <option value="5" ${state.grade == 5 ? 'selected' : ''}>5. Sınıf (Maarif Modeli)</option>
                    <option value="6" ${state.grade == 6 ? 'selected' : ''}>6. Sınıf (Maarif Modeli)</option>
                    <option value="7" ${state.grade == 7 ? 'selected' : ''}>7. Sınıf</option>
                    <option value="8" ${state.grade == 8 ? 'selected' : ''}>8. Sınıf (LGS)</option>
                  </optgroup>
                  <optgroup label="Lise &amp; YDT (MEB)">
                    <option value="9" ${state.grade == 9 ? 'selected' : ''}>9. Sınıf</option>
                    <option value="10" ${state.grade == 10 ? 'selected' : ''}>10. Sınıf</option>
                    <option value="11" ${state.grade == 11 ? 'selected' : ''}>11. Sınıf</option>
                    <option value="12" ${state.grade == 12 ? 'selected' : ''}>12. Sınıf</option>
                  </optgroup>
                  <optgroup label="Akademik &amp; Kütüphane">
                    <option value="yds" ${state.grade === 'yds' ? 'selected' : ''}>YDS &amp; YÖKDİL (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')} Kelime)</option>
                    <option value="oxford" ${state.grade === 'oxford' ? 'selected' : ''}>Kelime Kütüphanesi (A1-C1)</option>
                  </optgroup>
                </select>
              </div>

              <div class="pdf-field-wrap">
                <span class="pdf-field-title">Kapsam:</span>
                <select id="pdf-scope-select" class="pdf-select" onchange="window.APP.updatePdfStudioOption('scope', this.value)">
                  <option value="mistakes" ${state.scope === 'mistakes' ? 'selected' : ''}>Yanlışlarım (Hata Defteri)</option>
                  <option value="current_week" ${state.scope === 'current_week' ? 'selected' : ''}>Bu Haftanın Hedef Kelimeleri</option>
                  <option value="unit" ${state.scope === 'unit' ? 'selected' : ''}>Seçili Ünite Kelimeleri</option>
                  <option value="starred" ${state.scope === 'starred' ? 'selected' : ''}>Yıldızlı / Favorilerim</option>
                  <option value="all" ${state.scope === 'all' ? 'selected' : ''}>Sınıf Genel Havuzu</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 3. Kelime Limiti & Öğrenci Adı -->
          <div class="pdf-form-group">
            <div class="pdf-form-row">
              <div class="pdf-field-wrap">
                <span class="pdf-field-title">${state.template === 'quiz' ? 'Soru Sayısı:' : 'Kelime Sayısı Limiti:'}</span>
                <select id="pdf-limit-select" class="pdf-select" onchange="window.APP.updatePdfStudioOption('limit', this.value)">
                  <option value="10" ${state.limit == 10 ? 'selected' : ''}>${state.template === 'quiz' ? '10 Soru (1 Sayfa İdeal)' : '10 Kelime (1 Sayfa İdeal)'}</option>
                  <option value="15" ${state.limit == 15 ? 'selected' : ''}>${state.template === 'quiz' ? '15 Soru' : '15 Kelime'}</option>
                  <option value="20" ${state.limit == 20 ? 'selected' : ''}>${state.template === 'quiz' ? '20 Soru (2 Sayfa İdeal)' : '20 Kelime (2 Sayfa)'}</option>
                  <option value="30" ${state.limit == 30 ? 'selected' : ''}>${state.template === 'quiz' ? '30 Soru' : '30 Kelime'}</option>
                  <option value="all" ${state.limit === 'all' ? 'selected' : ''}>Tüm Liste</option>
                </select>
              </div>
              <div class="pdf-field-wrap">
                <span class="pdf-field-title">Öğrenci Adı (Opsiyonel):</span>
                <input type="text" id="pdf-student-input" class="pdf-input" placeholder="Örn: Ahmet Yılmaz" value="${escapeHtml(state.studentName)}" oninput="window.APP.updatePdfStudioOption('studentName', this.value)">
              </div>
            </div>
          </div>

          <!-- 4. İçerik Ayarları -->
          <div class="pdf-form-group">
            <label class="pdf-group-label">3. ÇALIŞMA KAĞIDI AYARLARI</label>
            <div class="pdf-checkbox-grid">
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.showTr ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('showTr', this.checked)">
                <span>Türkçe Anlamları Göster</span>
              </label>
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.showExamples ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('showExamples', this.checked)">
                <span>Örnek Cümleleri Ekle</span>
              </label>
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.showWritingPractice ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('showWritingPractice', this.checked)">
                <span>3x Yazım Çizgisi Ekle</span>
              </label>
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.showMatching ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('showMatching', this.checked)">
                <span>Eşleştirme Bölümü Ekle</span>
              </label>
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.includeAnswerKey ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('includeAnswerKey', this.checked)">
                <span>Cevap Anahtarı Ekle</span>
              </label>
              ${(state.template === 'mistakes' || state.scope === 'mistakes') ? `
              <label class="pdf-checkbox-label">
                <input type="checkbox" ${state.fillExtra ? 'checked' : ''} onchange="window.APP.updatePdfStudioOption('fillExtra', this.checked)">
                <span>Hata azsa müfredat kelimeleriyle tamamla</span>
              </label>` : ''}
            </div>
          </div>

          <!-- Eylem Butonları -->
          <div class="pdf-actions-footer">
            <button type="button" class="pdf-cta-print-btn" onclick="window.APP.printWorksheet()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              <span>PDF Olarak Kaydet / Yazdır</span>
            </button>
            <button type="button" class="pdf-secondary-download-btn" onclick="window.APP.downloadWorksheetHtml()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              <span>HTML İndir</span>
            </button>
          </div>
        </div>

        <!-- Sağ Canlı Önizleme Paneli -->
        <div class="pdf-preview-pane">
          <div class="pdf-preview-header">
            <span class="pph-title">${renderIcon('fileText', 16)} Canlı A4 Baskı Önizlemesi</span>
            <span class="pph-badge" id="pdf-preview-page-count">Standart A4 • 210 x 297 mm</span>
          </div>
          <div class="pdf-preview-scroll-wrap">
            <div class="pdf-a4-preview-viewport" id="pdf-live-preview-viewport">
              <!-- Rendered dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;

    renderPdfPreview();
  }

  function renderPdfPreview() {
    const previewContainer = document.getElementById('pdf-live-preview-viewport');
    if (!previewContainer) return;
    previewContainer.innerHTML = generateWorksheetHTML(PDF_STUDIO_STATE, false);
    fitPdfPreview();
  }

  // Show the preview as a real A4 page (≈718px between print margins), scaled to fit the pane.
  // Very narrow panes (phones) keep a readable single-column sheet instead of a tiny page.
  const A4_PREVIEW_PX = 718;
  function fitPdfPreview() {
    const sheet = document.getElementById('pdf-live-preview-viewport');
    const wrap = sheet && sheet.parentElement;
    if (!wrap) return;
    const avail = wrap.clientWidth - 40;
    const fits = avail >= 340;
    sheet.classList.toggle('a4-scaled', fits);
    sheet.style.zoom = fits ? String(Math.min(1, avail / A4_PREVIEW_PX)) : '';
  }
  window.addEventListener('resize', fitPdfPreview);

  function printWorksheet() {
    const printContainer = document.getElementById('learnish-printable-sheet');
    if (!printContainer) return;
    printContainer.innerHTML = generateWorksheetHTML(PDF_STUDIO_STATE, true);
    window.print();
  }

  function downloadWorksheetHtml() {
    const sheetHtml = generateWorksheetHTML(PDF_STUDIO_STATE, true);
    const styleContent = document.querySelector('style') ? document.querySelector('style').innerHTML : '';
    const fullDoc = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learnish - Çalışma Föyü</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    body { font-family: 'Nunito', -apple-system, sans-serif; background: #ffffff; color: #171e19; margin: 0; padding: 18px; }
    ${styleContent}
  </style>
</head>
<body>
  ${sheetHtml}
</body>
</html>`;
    const blob = new Blob([fullDoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnish-calisma-foyu-${PDF_STUDIO_STATE.template}-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // ==========================================================================
  // BİZE ULAŞIN & GERİ BİLDİRİM / HATA RAPORLAMA MODÜLÜ (Feedback & Bug Reporter)
  // ==========================================================================
  function openFeedbackModal(initialTopic = null) {
    closeSettingsModal();
    const backdrop = document.getElementById('feedback-modal-backdrop');
    const dialog = document.getElementById('feedback-dialog');
    if (!backdrop || !dialog) return;

    // Reset status toast
    const statusBanner = document.getElementById('feedback-status-banner');
    if (statusBanner) {
      statusBanner.style.display = 'none';
      statusBanner.textContent = '';
      statusBanner.className = 'feedback-status-banner';
    }

    // Set topic if provided
    const topicSelect = document.getElementById('feedback-topic');
    if (topicSelect && initialTopic) {
      const opts = topicSelect.options || topicSelect.children || [];
      let matched = false;
      for (let i = 0; i < opts.length; i++) {
        const optVal = opts[i].value || (opts[i].getAttribute && opts[i].getAttribute('value')) || opts[i].textContent || '';
        if (optVal.toLowerCase().includes(initialTopic.toLowerCase())) {
          topicSelect.selectedIndex = i;
          topicSelect.value = optVal;
          matched = true;
          break;
        }
      }
      if (!matched && initialTopic.trim()) {
        topicSelect.value = initialTopic;
      }
    }

    // Update telemetry diagnostics preview
    updateFeedbackTelemetryPreview();

    backdrop.classList.add('active');
    dialog.classList.add('active');
    syncBodyModalLock();

    // Auto-focus message textarea after transition
    setTimeout(() => {
      const msgArea = document.getElementById('feedback-message');
      if (msgArea) msgArea.focus();
    }, 150);
  }

  function closeFeedbackModal() {
    const backdrop = document.getElementById('feedback-modal-backdrop');
    const dialog = document.getElementById('feedback-dialog');
    if (backdrop) backdrop.classList.remove('active');
    if (dialog) dialog.classList.remove('active');
    syncBodyModalLock();
  }

  function toggleTelemetryInReport(isChecked) {
    const previewBox = document.getElementById('feedback-telemetry-preview');
    if (previewBox) {
      previewBox.style.opacity = isChecked ? '1' : '0.4';
    }
  }

  function getFeedbackTelemetryString() {
    const moduleNames = {
      maarif: `MEB Maarif Modeli (${STATE.selectedGrade || 5}. Sınıf)`,
      yds: 'YDS/YÖKDİL Akademik Sınav Modülü',
      oxford: 'Kelime Kütüphanesi (A1-C1)',
      all: 'Tüm Kütüphane Birleşik Havuz'
    };
    const viewNames = {
      home: 'Kontrol Merkezi (Home)',
      daily: 'Günün Çalışması (Daily)',
      flashcard: 'Flashcard Kartları',
      quiz: 'Quiz & Test',
      directory: 'Kelime Havuzu & Sözlük',
      stats: 'İstatistik & Analiz'
    };

    const activeModName = moduleNames[STATE.activeModule] || STATE.activeModule || 'MEB Maarif';
    const activeViewName = viewNames[STATE.currentView] || STATE.currentView || 'home';
    const learnedCount = (STATE.userData && STATE.userData.learned) ? STATE.userData.learned.size : 0;
    const reviewCount = (STATE.userData && STATE.userData.review) ? STATE.userData.review.size : 0;
    const streak = (STATE.quizState && STATE.quizState.streak) || 0;
    const screenRes = typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A';
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A';
    const timestamp = new Date().toLocaleString('tr-TR');

    return [
      `[Sistem & Telemetri Tanı Bilgileri]`,
      `• Aktif Rota      : ${activeModName}`,
      `• Açık Ekran      : ${activeViewName}`,
      `• İlerleme        : ${learnedCount} kelime öğrenildi, ${reviewCount} tekrar kuyruğunda`,
      `• Günlük Seri     : ${streak} gün`,
      `• Cihaz / Ekran   : ${screenRes}`,
      `• Zaman Damgası   : ${timestamp}`,
      `• Sürüm & Motor   : Learnish v12 (Web / PWA)`,
      `• Tarayıcı / UA   : ${userAgent}`
    ].join('\n');
  }

  function updateFeedbackTelemetryPreview() {
    const previewEl = document.getElementById('feedback-telemetry-preview');
    if (!previewEl) return;
    previewEl.textContent = getFeedbackTelemetryString();
  }

  function showFeedbackStatus(message, type = 'info') {
    const banner = document.getElementById('feedback-status-banner');
    if (!banner) return;
    banner.className = `feedback-status-banner status-${type}`;
    banner.textContent = message;
    banner.style.display = 'block';
  }

  function buildFeedbackReport() {
    const topicEl = document.getElementById('feedback-topic');
    const senderEl = document.getElementById('feedback-sender');
    const messageEl = document.getElementById('feedback-message');
    const includeTelemetryEl = document.getElementById('feedback-include-telemetry');

    const topic = topicEl ? topicEl.value : 'Hata / Teknik Problem';
    const sender = senderEl && senderEl.value.trim() ? senderEl.value.trim() : 'Belirtilmedi (Anonim Kullanıcı)';
    const message = messageEl ? messageEl.value.trim() : '';
    const includeTelemetry = includeTelemetryEl ? includeTelemetryEl.checked : true;

    if (!message || message.length < 5) {
      showFeedbackStatus('⚠️ Lütfen iletmek istediğiniz hata veya deneyim açıklamasını en az 5 karakter olarak yazınız.', 'warning');
      if (messageEl) messageEl.focus();
      return null;
    }

    const lines = [
      '====================================================',
      'LEARNISH ÖĞRETMEN & KULLANICI GERİ BİLDİRİM RAPORU',
      '====================================================',
      `Konu     : ${topic}`,
      `Gönderen : ${sender}`,
      `Tarih    : ${new Date().toLocaleString('tr-TR')}`,
      '',
      'AÇIKLAMA / YAŞANAN DENEYİM & HATA:',
      '----------------------------------------------------',
      message,
      '----------------------------------------------------'
    ];

    if (includeTelemetry) {
      lines.push('', getFeedbackTelemetryString(), '====================================================');
    } else {
      lines.push('====================================================');
    }

    return {
      topic,
      sender,
      message,
      fullText: lines.join('\n')
    };
  }

  function sendFeedbackViaMail() {
    const report = buildFeedbackReport();
    if (!report) return;

    const targetEmail = 'erencekin@gmail.com';
    const subject = `[Learnish Bildirim] ${report.topic} - ${report.sender}`;
    const body = report.fullText;
    const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    showFeedbackStatus('E-posta istemciniz açılıyor... Gönder butonuna basarak bize iletebilirsiniz.', 'success');
    window.location.href = mailtoUrl;
  }

  function sendFeedbackViaWhatsApp() {
    const report = buildFeedbackReport();
    if (!report) return;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(report.fullText)}`;
    showFeedbackStatus('WhatsApp açılıyor... Mesajı dilediğiniz kişiye veya gruba iletebilirsiniz.', 'success');
    window.open(whatsappUrl, '_blank');
  }

  function fallbackCopyText(text) {
    try {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.style.position = 'fixed';
      tempArea.style.left = '-9999px';
      document.body.appendChild(tempArea);
      tempArea.focus();
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      showFeedbackStatus('Rapor panoya kopyalandı! WhatsApp veya dilediğiniz kanaldan iletebilirsiniz.', 'success');
    } catch (e) {
      showFeedbackStatus('Kopyalama başarısız oldu, lütfen metni seçip manuel kopyalayınız.', 'warning');
    }
  }

  function copyFeedbackToClipboard() {
    const report = buildFeedbackReport();
    if (!report) return;

    const text = report.fullText;
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showFeedbackStatus('Rapor panoya kopyalandı! WhatsApp, e-posta veya dilediğiniz kanaldan iletebilirsiniz.', 'success');
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  }

  // ==========================================================================
  // VIEW 0: KONTROL MERKEZİ / IDE COMMAND CENTER (#home)
  // ==========================================================================
  function retestDebugWord(wordEn) {
    speakWord(wordEn);
    const target = WORDS_DATA.find(w => w.en.toLowerCase() === wordEn.toLowerCase()) || {
      id: 999999,
      en: wordEn,
      tr: 'Bilinmeyen Kelime',
      desc: 'kelime',
      cefr: 'B1'
    };

    // İlgili kelimeyi tekrar listesine ekle
    STATE.userData.review.add(target.id);
    saveUserData();

    // 5 soruluk odaklı hızlı test oluştur: Tıklanan kelime 1. soru olarak garantilenir
    const reviewPool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id) && w.id !== target.id);
    const fillerPool = WORDS_DATA.filter(w => w.id !== target.id);
    const extraQuestions = [...shuffleArray(reviewPool), ...shuffleArray(fillerPool)].slice(0, 4);
    const quizTargets = [target, ...extraQuestions];

    const questions = quizTargets.map(t => {
      const distractors = pickDistractors(t, 3);

      const options = [t, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map(w => ({
          id: w.id,
          text: w.tr || w.en,
          isCorrect: w.id === t.id
        }));

      return {
        targetWord: t,
        clozeSentence: null,
        options: options
      };
    });

    STATE.quizState = {
      active: true,
      questions: questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      mode: 'en-tr',
      source: 'debug_retest',
      answered: false,
      waitingFeedback: false
    };

    saveQuizState();
    switchView('quiz');
  }

  function selectHeatmapUnit(dayNum) {
    STATE.currentDay = parseInt(dayNum, 10) || 1;
    saveUserData();
    switchView('daily');
  }

  function renderHomeView() {
    const container = document.getElementById('view-home');
    if (!container) return;

    const module = STATE.activeModule;

    const moduleLabels = {
      maarif: `MEB ${getActiveGrade()}. Sınıf`,
      yds: 'YDS/YÖKDİL Akademik',
      oxford: 'Kelime Kütüphanesi (A1–C1)',
      all: `Tüm Kütüphane (${WORDS_DATA.length.toLocaleString('tr-TR')} kelime)`
    };

    const quizStats = STATE.userData.stats || { quizzesPlayed: 0, correctAnswers: 0, totalQuestions: 0, bestStreak: 0 };
    const streakDays = Math.max(STATE.quizState.streak || 0, quizStats.bestStreak || 0);

    const srsDueWords = getSRSDueWords();
    const activeMistakes = getActiveMistakeWords();
    const srsStats = getSRSStats();

    container.innerHTML = `
      <!-- HERO: Aktif Rota + CTA + 4 Metrik -->
      <article class="hero-feature-card home-orientation-hero">
        <div class="hero-decorative-blob" aria-hidden="true"></div>
        <div style="position:relative;z-index:1;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
            <div>
              <span class="hero-tag-label">AKTİF ROTA</span>
              <h2 class="hero-card-title" style="font-size:22px;margin-top:4px;">${escapeHtml(moduleLabels[module] || moduleLabels.maarif)}</h2>
            </div>
            <button type="button" class="hero-primary-cta-btn" onclick="window.APP.switchView('daily')">
              <span>${module === 'yds' ? "GÜNÜN 20'SİNİ BAŞLAT" : "GÜNÜN 10'LUSUNU BAŞLAT"}</span>
              <span class="cta-arrow">→</span>
            </button>
          </div>

          <div class="bento-metrics-grid" style="margin-top:20px;">
            <div class="bento-metric-card">
              <span class="bento-card-title">GÜNLÜK SERİ</span>
              <div class="bento-card-content">
                <div class="bento-circular-icon">${renderIcon('flame', 18)}</div>
                <span class="bento-val">${String(streakDays).padStart(2, '0')} GÜN</span>
              </div>
            </div>
            <div class="bento-metric-card">
              <span class="bento-card-title">HAFIZA KALICILIĞI</span>
              <div class="bento-card-content">
                <div class="bento-circular-icon">${renderIcon('brain', 18)}</div>
                <span class="bento-val">%${srsStats.retentionRate} (${srsStats.masteredCount} USTA)</span>
              </div>
            </div>
            <div class="bento-metric-card ${srsDueWords.length > 0 ? 'metric-highlight-due' : ''}">
              <span class="bento-card-title">ARALIKLI TEKRAR</span>
              <div class="bento-card-content">
                <div class="bento-circular-icon">${renderIcon('repeat', 18)}</div>
                <span class="bento-val">${srsDueWords.length} BEKLEYEN</span>
              </div>
            </div>
            <div class="bento-metric-card ${activeMistakes.length > 0 ? 'metric-highlight-mistake' : ''}">
              <span class="bento-card-title">HATA DEFTERİ</span>
              <div class="bento-card-content">
                <div class="bento-circular-icon">${renderIcon('alert', 18)}</div>
                <span class="bento-val">${activeMistakes.length} ZAYIF NOKTA</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <!-- HIZLI ERİŞİM -->
      <section class="home-guide-section" aria-label="Hızlı Erişim">
        <div class="home-quick-actions-grid">
          <button type="button" class="home-qa-btn" onclick="window.APP.switchView('daily')">${renderIcon('calendar', 20)}<span>Günlük</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.switchView('flashcard')">${renderIcon('layers', 20)}<span>Kartlar</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.switchView('quiz')">${renderIcon('zap', 20)}<span>Quiz</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.startSRSDueFlashcards()">${renderIcon('repeat', 20)}<span>Tekrar</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.startMistakeQuiz()">${renderIcon('alert', 20)}<span>Hatalar</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.switchView('directory')">${renderIcon('search', 20)}<span>Sözlük</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.openSpeechCoach('pronunciation')">${renderIcon('mic', 20)}<span>Telaffuz</span></button>
          <button type="button" class="home-qa-btn" onclick="window.APP.openPdfStudio()">${renderIcon('printer', 20)}<span>PDF</span></button>
        </div>
      </section>

      <!-- ÖĞRENME ROTALARI -->
      <section class="home-guide-section" aria-label="Öğrenim Rotaları">
        <div class="home-section-header">
          <div class="hsh-left">
            <span class="home-section-badge">${renderIcon('compass', 13)} ÖĞRENME ROTASI</span>
            <h3 class="home-section-title">Aktif Rotanı Seç</h3>
          </div>
        </div>

        <div class="home-routes-grid">
          <!-- Rota 1: MEB Maarif Modeli -->
          <article class="home-route-card ${module === 'maarif' ? 'is-active-route' : ''}">
            <div class="hrc-header">
              <span class="hrc-tag tag-maarif">1. – 12. SINIFLAR • K-12 MÜFREDAT</span>
              <div class="hrc-icon-circle">${renderIcon('school', 26)}</div>
            </div>
            <h4 class="hrc-title">MEB Türkiye Yüzyılı Maarif Modeli</h4>
            <p class="hrc-desc">
              İlkokul (1-4), ortaokul (5-8) ve lise (9-12) düzeyindeki tüm MEB İngilizce müfredatına tam uyumludur. 36 haftalık resmi akademik takvime göre haftanın odak teması, hedef kelimeleri ve resmi kazanım kodları (<code>ENG.5.2.L1</code>) ile çalışılır.
            </p>
            <div class="hrc-target-pill">
              <strong>Kimler İçin:</strong> Okul derslerine destek, LGS &amp; YKS hazırlığı, MEB kazanımlarıyla adım adım ilerlemek isteyen öğrenciler ve veliler.
            </div>
            <ul class="hrc-features-list">
              <li><span>${renderIcon('check', 13)}</span> 36 haftalık resmi çerçeve planı ve haftanın odağı</li>
              <li><span>${renderIcon('check', 13)}</span> Kazanım kodları (Listening, Speaking, Reading, Writing)</li>
              <li><span>${renderIcon('check', 13)}</span> Sınıfa özel haftalık kelime listesi, kartlar ve testler</li>
              <li><span>${renderIcon('check', 13)}</span> MEB Maarif formatında A4 yazdırılabilir çalışma kağıdı</li>
            </ul>
            <div class="hrc-actions">
              <button type="button" class="hrc-primary-btn" onclick="window.APP.selectModuleAndGo('maarif')">
                ${module === 'maarif' ? '✓ Aktif Rota • Müfredata Git' : 'Müfredat Moduna Geç →'}
              </button>
              <button type="button" class="hrc-secondary-btn" onclick="window.APP.openGradeModal()">
                ${renderIcon('school', 15)} Sınıf Değiştir (${STATE.selectedGrade || 5}. Sınıf)
              </button>
            </div>
          </article>

          <!-- Rota 2: YDS & YÖKDİL -->
          <article class="home-route-card ${module === 'yds' ? 'is-active-route' : ''}">
            <div class="hrc-header">
              <span class="hrc-tag tag-yds">ÖSYM B2–C1 • AKADEMİK SINAVLAR</span>
              <div class="hrc-icon-circle">${renderIcon('target', 26)}</div>
            </div>
            <h4 class="hrc-title">YDS, YÖKDİL, YDT &amp; TIPDİL</h4>
            <p class="hrc-desc">
              ÖSYM sınavlarında yüksek puan hedefleyenler için B2–C1 seviye yoğun kelime ve kalıp antrenmanıdır. 2020–2026 sınavlarında çıkmış gerçek soru kökleri, akademik paragraf bağlamları, sık sorulan edatlar ve eş anlamlılar içerir.
            </p>
            <div class="hrc-target-pill">
              <strong>Kimler İçin:</strong> Yüksek lisans, doktora, doçentlik, kamu personeli veya üniversite dil sınavlarına hazırlanan yetişkinler ve adaylar.
            </div>
            <ul class="hrc-features-list">
              <li><span>${renderIcon('check', 13)}</span> 2020–2026 ÖSYM çıkmış cümle ve akademik kaynak etiketleri</li>
              <li><span>${renderIcon('check', 13)}</span> Sık sorulan edat kalıpları (Prepositions: in, on, at, by...)</li>
              <li><span>${renderIcon('check', 13)}</span> Kritik eş anlamlılar (Synonyms) ve çeldirici analizleri</li>
              <li><span>${renderIcon('check', 13)}</span> Günde 20 kelimelik yoğun antrenman &amp; kümülatif sınavlar</li>
            </ul>
            <div class="hrc-actions">
              <button type="button" class="hrc-primary-btn" onclick="window.APP.selectModuleAndGo('yds')">
                ${module === 'yds' ? '✓ Aktif Rota • YDS Workout' : 'YDS Moduna Geç →'}
              </button>
            </div>
          </article>

          <!-- Rota 3: Kelime Kütüphanesi -->
          <article class="home-route-card ${module === 'oxford' ? 'is-active-route' : ''}">
            <div class="hrc-header">
              <span class="hrc-tag tag-oxford">CEFR A1–C1 • KÜTÜPHANE</span>
              <div class="hrc-icon-circle">${renderIcon('book', 26)}</div>
            </div>
            <h4 class="hrc-title">Kelime Kütüphanesi (A1–C1)</h4>
            <p class="hrc-desc">
              İngilizce konuşulan ve yazılan tüm metinlerin %90'ından fazlasını kapsayan, A1'den C1'e uluslararası standartlarda 4.886 temel ve ileri düzey kelimelik zengin başvuru kütüphanesidir.
            </p>
            <div class="hrc-target-pill">
              <strong>Kimler İçin:</strong> Genel İngilizce konuşma ve anlama becerisini geliştirmek, uluslararası standartta kelime dağarcığı oluşturmak isteyenler.
            </div>
            <ul class="hrc-features-list">
              <li><span>${renderIcon('check', 13)}</span> CEFR A1, A2, B1, B2 ve C1 seviye etiketleri</li>
              <li><span>${renderIcon('check', 13)}</span> Tam IPA fonetik telaffuz transkripsiyonu ve seslendirme</li>
              <li><span>${renderIcon('check', 13)}</span> ${WORDS_DATA.length.toLocaleString('tr-TR')} kelimelik birleşik arama ve filtreleme kütüphanesi</li>
              <li><span>${renderIcon('check', 13)}</span> Serbest tempolu flashcard ve test antrenmanları</li>
            </ul>
            <div class="hrc-actions">
              <button type="button" class="hrc-primary-btn" onclick="window.APP.selectModuleAndGo('oxford')">
                ${module === 'oxford' ? '✓ Aktif Rota • Kütüphane' : 'Kütüphane Moduna Geç →'}
              </button>
              <button type="button" class="hrc-secondary-btn" onclick="window.APP.switchView('directory')">
                ${renderIcon('search', 15)} Sözlükte Ara
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- PEDAGOJİ İSTASYONU -->
      <section class="pedagogy-station-section" aria-label="Akıllı Hafıza &amp; Tekrar İstasyonu">
        <div class="pedagogy-station-header">
          <div>
            <span class="pedagogy-station-badge">${renderIcon('brain', 13)} AKILLI PEDAGOJİ SİSTEMİ</span>
            <h3 class="pedagogy-station-title">Bilişsel Hafıza &amp; Hata Ayıklama İstasyonu</h3>
          </div>
          <span class="pedagogy-station-subtitle">SM-2 Spaced Repetition + Hata Defteri</span>
        </div>

        <div class="pedagogy-station-grid">
          <!-- Kart 1: Aralıklı Tekrar -->
          <div class="pedagogy-card srs-card ${srsDueWords.length > 0 ? 'has-due' : ''}">
            <div class="ped-card-top">
              <span class="ped-tag">${renderIcon('repeat', 13)} BİLİŞSEL TEKRAR KUYRUĞU</span>
              <div class="ped-count-badge ${srsDueWords.length > 0 ? 'active' : ''}">${srsDueWords.length} KELİME</div>
            </div>
            <h4 class="ped-card-title">Bugün Zamanı Gelen Aralıklı Tekrarlar</h4>
            <p class="ped-card-desc">
              ${srsDueWords.length > 0
                ? `Unutma eğrisine göre bugün gözden geçirilmesi gereken <strong>${srsDueWords.length} kelime</strong> var. Kalıcı belleğe aktarmak için hemen drill başlatın.`
                : `Bugün için bekleyen aralıklı tekrarınız yok! Bilişsel hafıza durumunuz tam kapasite güncel.`}
            </p>
            <div class="ped-card-actions">
              <button type="button" class="ped-btn ped-btn-primary" onclick="window.APP.startSRSDueFlashcards()" ${srsDueWords.length === 0 ? 'disabled' : ''}>
                ${renderIcon('layers', 15)} Kartlarla Tekrar Et (${srsDueWords.length})
              </button>
              <button type="button" class="ped-btn ped-btn-secondary" onclick="window.APP.startSRSDueQuiz()" ${srsDueWords.length === 0 ? 'disabled' : ''}>
                ${renderIcon('zap', 15)} Hızlı SRS Testi
              </button>
            </div>
          </div>

          <!-- Kart 2: Akıllı Hata Defteri -->
          <div class="pedagogy-card mistake-card ${activeMistakes.length > 0 ? 'has-mistakes' : ''}">
            <div class="ped-card-top">
              <span class="ped-tag">${renderIcon('alert', 13)} ZAYIF NOKTALAR &amp; GELİŞİM</span>
              <div class="ped-count-badge mistake ${activeMistakes.length > 0 ? 'active' : ''}">${activeMistakes.length} KRİTİK</div>
            </div>
            <h4 class="ped-card-title">Akıllı Hata Defteri &amp; Kurtarma Kampı</h4>
            <p class="ped-card-desc">
              ${activeMistakes.length > 0
                ? `Test ve kartlarda yanıldığınız <strong>${activeMistakes.length} kelime</strong> tespit edildi. 2 ardışık doğru cevapla kelimeleri Hata Defterinden temizleyin.`
                : `Hata Defteriniz tertemiz! Yanlış yaptığınız kelimeler otomatik olarak burada hedeflenir.`}
            </p>

            ${activeMistakes.length > 0 ? `
              <div class="mistake-chips-preview">
                ${activeMistakes.slice(0, 3).map(w => {
                  const m = STATE.userData.mistakes[w.id];
                  return `<button type="button" class="mistake-preview-pill" onclick="window.APP.retestDebugWord('${w.en.replace(/'/g, "\\'")}')" title="Bu kelimeyi test et"><strong>${w.en}</strong> (${m ? m.wrongCount : 1}x hata) ↺</button>`;
                }).join('')}
              </div>
            ` : ''}

            <div class="ped-card-actions">
              <button type="button" class="ped-btn ped-btn-mistake" onclick="window.APP.startMistakeQuiz()" ${activeMistakes.length === 0 ? 'disabled' : ''}>
                ${renderIcon('target', 15)} Kurtarma Kampı Sınavı
              </button>
              <button type="button" class="ped-btn ped-btn-secondary" onclick="window.APP.startMistakeFlashcards()" ${activeMistakes.length === 0 ? 'disabled' : ''}>
                ${renderIcon('layers', 15)} Hata Kartları
              </button>
              <button type="button" class="ped-btn ped-btn-pdf" onclick="window.APP.openPdfStudio('mistakes')" title="Yanlışlarımı PDF / Yazdırılabilir Çalışma Kağıdı Olarak İndir">
                ${renderIcon('fileText', 15)} Yanlışları PDF Çıkart
              </button>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // ==========================================================================
  // VIEW 1: GÜNLÜK ÇALIŞMA / WORKOUT (Maarif vs YDS vs Oxford)
  // ==========================================================================
  function renderDailyView() {
    const container = document.getElementById('view-daily');
    if (!container) return;

    const module = STATE.activeModule;

    // A. MEB K-12 MÜFREDAT VE GÜNLÜK TAKİP (1. Sınıftan 12. Sınıfa Kadar)
    if (module === 'maarif') {
      const gNum = STATE.selectedGrade || 5;
      const gData = (typeof window !== 'undefined' && window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]) || null;
      let sched = null;
      if (typeof window !== 'undefined' && window.CURRICULUM_CLASSIFIER) {
        sched = STATE.activeCurriculumWeek 
          ? window.CURRICULUM_CLASSIFIER.getWeekByNumber(gNum, STATE.activeCurriculumWeek)
          : window.CURRICULUM_CLASSIFIER.getSchedule(gNum);
      }
      if (!sched && gData && gData.calendar) {
        sched = gData.calendar[0];
      }

      const targetWordsList = (sched && sched.targetWords) ? sched.targetWords : [];
      const isViewingToday = !STATE.activeCurriculumWeek;

      // Haftalık Hedef Kelime Kartları
      let cardsHtml = '';
      let weekLearnedCount = 0;

      targetWordsList.forEach((wStr, idx) => {
        const item = resolveCurriculumWord(wStr, gNum, idx);
        if (!item) return;
        const wId = item.id;
        const wEn = item.en;
        const wTr = item.tr;
        const wPhonetic = item.phonetic || '';
        const wCefr = item.cefr || (gData ? gData.cefr : 'A1');
        const wDesc = item.desc || 'hedef kelime';
        const wExample = item.example || `In our English class, we learn the word "${wEn}".`;

        const isLearned = STATE.userData.learned.has(wId);
        const isStarred = STATE.userData.starred.has(wId);
        if (isLearned) weekLearnedCount++;

        cardsHtml += `
          <article class="secondary-feed-card word-card-item ${isLearned ? 'is-learned' : ''}" data-id="${wId}">
            <div class="feed-audio-cluster" style="display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;">
              <button type="button" class="feed-icon-box speak-btn" data-word="${escapeHtml(wEn)}" title="Sesli Telaffuz (${STATE.settings.accent})" aria-label="Dinle: ${escapeHtml(wEn)}">
                ${renderIcon('speaker', 15)}
              </button>
              <button type="button" class="feed-icon-box coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(wEn)}')" title="Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu: ${escapeHtml(wEn)}" style="background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.2);">
                ${renderIcon('mic', 15)}
              </button>
            </div>

            <div class="feed-content-wrap">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h4 class="feed-card-title">${escapeHtml(wEn)}</h4>
                ${wPhonetic ? `<span class="feed-card-meta">${escapeHtml(wPhonetic)}</span>` : ''}
                ${getCefrBadgeHtml(wCefr)}
                <button type="button" class="word-context-btn" onclick="event.stopPropagation(); window.APP.openClassifierForWord('${escapeHtml(wEn)}')" title="Bu kelimeyi müfredata bağla">${renderIcon('sparkles', 12)} Bağlamı İncele</button>
              </div>
              <div class="feed-card-tr">${escapeHtml(wTr)}</div>
              <div class="feed-card-meta">${escapeHtml(wDesc)}</div>
              ${wExample ? `<div class="feed-card-example">“${highlightWordInText(wExample.replace(/^["“”]|["“”]$/g, ''), wEn)}”</div>` : ''}
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <button type="button" class="feed-trailing-btn ${isLearned ? 'checked' : ''}" onclick="window.APP.toggleLearned(${wId})" title="${isLearned ? 'Öğrenildi' : 'Öğrenildi Olarak İşaretle'}" aria-label="Öğrenildi"></button>
              <button type="button" class="feed-trailing-btn ${isStarred ? 'active' : ''}" onclick="window.APP.toggleStarred(${wId})" title="${isStarred ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}" aria-label="Favori" aria-pressed="${isStarred ? 'true' : 'false'}" style="font-size: 14px;">
                ${renderIcon(isStarred ? 'starFilled' : 'starOutline', 16)}
              </button>
            </div>
          </article>
        `;
      });

      // Bağlama Motoru ile Zenginleştirilen Kelimeler (Contextually Enriched Words)
      let enrichedDeckHtml = '';
      if (window.CURRICULUM_CLASSIFIER && sched) {
        const targetWordsLower = targetWordsList.map(w => w.toLowerCase());
        const enrichedList = [];
        for (const w of WORDS_DATA) {
          if (targetWordsLower.includes(w.en.toLowerCase())) continue;
          const cls = window.CURRICULUM_CLASSIFIER.classify(w, gNum);
          if (cls.unitNum === sched.unitNum && cls.confidence >= 0.4) {
            enrichedList.push({ word: w, confidence: cls.confidence });
            if (enrichedList.length >= 8) break;
          }
        }

        if (enrichedList.length > 0) {
          enrichedDeckHtml = `
            <div class="curriculum-enriched-deck">
              <div class="ced-header">
                <span class="ced-title">
                  ${renderIcon('sparkles', 14)} BAĞLAMA MOTORU İLE İLİŞKİLENDİRİLEN EK KELİMELER
                </span>
                <span class="ced-badge">THE OXFORD 5000 &bull; ÜNİTEYE BAĞLI</span>
              </div>
              <p style="font-size: 12px; color: var(--dp-color-ink-muted); margin: 0 0 10px 0;">
                Bu kelimeler yıllık plan listesi dışından, semantik bağlam motoru tarafından <strong>${sched.unitTitle}</strong> ünitesine bağlanmıştır:
              </p>
              <div class="ced-grid">
                ${enrichedList.map(item => `
                  <button type="button" class="ced-word-chip" onclick="window.APP.openClassifierForWord('${escapeHtml(item.word.en)}')">
                    <span class="ced-word-body">
                      <span class="ced-word-en">${escapeHtml(item.word.en)}</span>
                      <span class="ced-word-tr">${escapeHtml(item.word.tr ? item.word.tr.slice(0, 24) + '...' : '')}</span>
                    </span>
                    <span style="font-family: var(--dp-typography-mono); font-size: 10px; font-weight: 800; color: var(--dp-ink-sky);">%${Math.round(item.confidence * 100)}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }
      }

      const weekPercent = Math.round((weekLearnedCount / (targetWordsList.length || 1)) * 100);

      container.innerHTML = `
        <div class="curriculum-tracker-deck">
          
          <!-- Tracker Header -->
          <div class="curriculum-tracker-header">
            <div class="cth-badge-row">
              <span class="cth-grade-badge">${sched ? sched.badge : `${gNum}. SINIF`}</span>
              <span class="cth-stage-badge">${sched ? sched.stageTr : 'MEB'}</span>
              <span class="cth-week-badge">HAFTA ${sched ? sched.weekNum : 1} &bull; ${sched ? sched.dates : ''}</span>
              <button type="button" class="cth-switch-grade-btn" onclick="window.APP.openGradeModal()">SINIF DEĞİŞTİR ▾</button>
            </div>

            <div class="cth-unit-card">
              <div class="cth-unit-left">
                <span class="cth-unit-code">${sched ? sched.unitCode : 'UNIT'}</span>
                <h2 class="cth-unit-title">${sched ? sched.unitTitle : 'MÜFREDAT DERSİ'}</h2>
                <span class="cth-unit-title-tr">${sched ? sched.unitTitleTr : ''}</span>
              </div>

              <div class="cth-week-nav">
                <button type="button" class="cth-nav-btn" onclick="window.APP.changeScheduleWeek(${(sched ? sched.weekNum : 1) - 1})" ${(sched && sched.weekNum <= 1) ? 'disabled' : ''}>◀ Önceki</button>
                <span class="cth-nav-label">${sched ? sched.weekNum : 1} / 36</span>
                <button type="button" class="cth-nav-btn" onclick="window.APP.changeScheduleWeek(${(sched ? sched.weekNum : 1) + 1})" ${(sched && sched.weekNum >= 36) ? 'disabled' : ''}>Sonraki ▶</button>
              </div>
            </div>

            ${!isViewingToday ? `
              <div style="margin-top: 10px; display: flex; align-items: center; justify-content: space-between; background: rgba(217, 119, 6, 0.1); border: 1px solid rgba(217, 119, 6, 0.25); border-radius: 8px; padding: 6px 12px; font-size: 11.5px;">
                <span style="display:inline-flex; align-items:center; gap:6px;">${renderIcon('pin', 13)} Özel hafta inceleniyor (Hafta ${sched.weekNum})</span>
                <button type="button" style="background:transparent; border:none; color:var(--dp-color-amber); font-weight:800; cursor:pointer;" onclick="window.APP.goToTodayCurriculumWeek()">Bugünün Haftasına Dön</button>
              </div>
            ` : ''}
          </div>

          <!-- Outcomes Card -->
          <div class="curriculum-outcomes-card">
            <div class="coc-item coc-focus-row">
              <strong class="coc-label">Haftanın Odağı:</strong>
              <span class="coc-focus-text">${sched ? escapeHtml(sched.focus) : 'Müfredat konuları'}</span>
            </div>
            ${sched && sched.outcomesList && sched.outcomesList.length > 0 ? `
              <div class="coc-item coc-outcomes-block">
                <div class="coc-outcomes-header">
                  <strong class="coc-label">Kazanımlar &amp; İletişimsel İşlevler:</strong>
                  <span class="coc-count-pill">${sched.outcomesList.length} Kazanım</span>
                </div>
                <div class="coc-outcomes-preview">
                  ${sched.outcomesList.slice(0, 2).map(o => `
                    <div class="coc-outcome-row">
                      <span class="coc-code-badge">${escapeHtml(o.code)}</span>
                      <span class="coc-skill-badge skill-${escapeHtml(o.skill.toLowerCase())}">${escapeHtml(o.skill)}</span>
                      <span class="coc-outcome-text">${escapeHtml(o.text)}</span>
                    </div>
                  `).join('')}
                </div>
                ${sched.outcomesList.length > 2 ? `
                  <div id="cocAllOutcomesDrawer" class="coc-outcomes-drawer" style="display: none;">
                    ${sched.outcomesList.slice(2).map(o => `
                      <div class="coc-outcome-row">
                        <span class="coc-code-badge">${escapeHtml(o.code)}</span>
                        <span class="coc-skill-badge skill-${escapeHtml(o.skill.toLowerCase())}">${escapeHtml(o.skill)}</span>
                        <span class="coc-outcome-text">${escapeHtml(o.text)}</span>
                      </div>
                    `).join('')}
                  </div>
                  <button type="button" class="coc-toggle-btn" onclick="window.APP.toggleCurriculumOutcomes(this)" data-total="${sched.outcomesList.length}" data-remaining="${sched.outcomesList.length - 2}">
                    <span>Tüm Kazanımları Gör (${sched.outcomesList.length} Kazanım)</span> ▾
                  </button>
                ` : ''}
              </div>
            ` : (sched && sched.outcomes ? `
              <div class="coc-item">
                <strong class="coc-label">Kazanımlar &amp; İletişimsel İşlevler:</strong>
                <span>${escapeHtml(sched.outcomes)}</span>
              </div>
            ` : '')}
            ${sched && sched.importantDays ? `
              <div class="coc-item coc-celebration">
                <strong class="coc-label">Önemli Gün &amp; Etkinlik:</strong>
                <span>${escapeHtml(sched.importantDays)}</span>
              </div>
            ` : ''}
          </div>

          <!-- Progress Bar & Actions -->
          <div class="daily-progress-bar-wrap" style="margin: 4px 0;">
            <div class="daily-progress-fill" style="width: ${weekPercent}%;"></div>
          </div>

          <div style="display: flex; gap: 10px; margin: 4px 0 12px 0; flex-wrap: wrap;">
            <button type="button" class="fc-action-btn" onclick="window.APP.startDailyFlashcards(false)">
              ${renderIcon('layers', 15)} <span>Haftanın Kartlarıyla Çalış (${targetWordsList.length})</span>
            </button>
            <button type="button" class="fc-action-btn" onclick="window.APP.startDailyFlashcards(true)" title="Kelimeleri rastgele karıştırarak başlat">
              ${renderIcon('repeat', 15)} <span>Karışık Kartlar</span>
            </button>
            <button type="button" class="fc-action-btn learned-btn" onclick="window.APP.startDailyQuiz()">
              ${renderIcon('zap', 15)} <span>Haftalık Kazanım Testi &rarr;</span>
            </button>
            <button type="button" class="fc-action-btn pdf-btn" onclick="window.APP.openPdfStudio('daily')" title="Bu haftanın çalışma föyünü PDF olarak çıkart" style="background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.25);">
              ${renderIcon('fileText', 15)} <span>Haftalık Föyü İndir (PDF)</span>
            </button>
          </div>

          <!-- Target Words List -->
          <div class="section-header-row" style="margin-top: 14px;">
            <span class="section-title">HAFTALIK HEDEF KELİMELER (${targetWordsList.length} KELİME)</span>
            <span style="font-family:var(--dp-typography-mono); font-size:11px; font-weight:800; color:var(--dp-color-amber-ink);">%${weekPercent} TAMAMLANDI</span>
          </div>

          <div class="daily-feed-column">
            ${cardsHtml || `
              <div class="daily-feed-empty" style="padding:18px; border:1px dashed var(--dp-color-border, #ccc); border-radius:10px; font-size:0.9rem; color:var(--dp-color-ink-muted);">
                ${sched && sched.weekType === 'orientation'
                  ? 'Uyum haftası: yıllık planda bu hafta için hedef kelime yok. Tanışma, sınıf kuralları ve ders materyalleri tanıtılır.'
                  : 'Yıllık planda bu hafta için hedef kelime bulunmuyor.'}
              </div>`}
          </div>

          <!-- Enriched Words via Context Classifier -->
          ${enrichedDeckHtml}

        </div>
      `;

      container.querySelectorAll('.speak-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const word = btn.getAttribute('data-word');
          speakWord(word);
        });
      });
      return;
    }

    // B. YDS / OXFORD / TÜM KÜTÜPHANE WORKOUT MODU (Mevcut Günlük Akış)
    let targetPool = [];
    let batchSize = 10;
    let bannerTitle = '';
    let bannerDesc = '';

    if (module === 'yds') {
      targetPool = WORDS_DATA.filter(isYDSWord);
      batchSize = 20;
      bannerTitle = `GÜN ${STATE.currentDay} • YDS & YÖKDİL AKADEMİK WORKOUT`;
      bannerDesc = `Günde ${batchSize} hedef akademik kelime ile B2–C1 seviye sınav hazırlığı.`;
    } else if (module === 'oxford') {
      targetPool = WORDS_DATA.filter(isOxfordWord);
      batchSize = 25;
      bannerTitle = `GÜN ${STATE.currentDay} • THE OXFORD 5000`;
      bannerDesc = `Günde ${batchSize} hedef kelime ile uluslararası A1–C1 kelime standardı.`;
    } else if (module === 'all') {
      targetPool = WORDS_DATA;
      batchSize = 25;
      bannerTitle = `GÜN ${STATE.currentDay} • TÜM KÜTÜPHANE BİRLEŞİK HAVUZ`;
      bannerDesc = `Günde ${batchSize} hedef kelime ile ${WORDS_DATA.length.toLocaleString('tr-TR')} kelimelik kapsamlı çalışma.`;
    } else {
      targetPool = getActiveGradePool();
      batchSize = 10;
      const gNum = getActiveGrade();
      const firstWord = targetPool[(STATE.currentDay - 1) * batchSize];
      const meta = firstWord ? gradeWordMeta(firstWord.id, gNum) : null;
      const unitLabel = meta && meta.unitNum ? `TEMA ${meta.unitNum}: ${(meta.unitTitleTr || meta.unitTitle).toLocaleUpperCase('tr')}` : 'MÜFREDAT';
      const weekLabel = meta && meta.weekNum ? ` • ${meta.weekNum}. HAFTA` : '';
      bannerTitle = `GÜN ${STATE.currentDay} • ${gNum}. SINIF MEB${weekLabel} • ${unitLabel}`;
      bannerDesc = `MEB ${gNum}. Sınıf İngilizce yıllık plan kelimeleri, hafta sırasıyla günlük ${batchSize} kelimelik odaklı çalışma.`;
    }
    const totalDays = Math.ceil(targetPool.length / batchSize) || 1;
    if (STATE.currentDay > totalDays) STATE.currentDay = 1;

    // MEB Annual Calendar Anchor Banner
    let mebCalendarHtml = '';
    const todayMEB = getMEBCalendarInfo();
    if (module === 'maarif') {
      const isViewingToday = (STATE.currentDay === todayMEB.day);
      if (isViewingToday) {
        mebCalendarHtml = `
          <div class="daily-meb-calendar-banner is-today">
            <div class="dmc-left">
              <span class="dmc-icon-badge">${renderIcon('calendar', 16)}</span>
              <div class="dmc-info">
                <span class="dmc-tag">MEB 2026-2027 YILLIK ÇERÇEVE PLANI • BUGÜNÜN DERSİ</span>
                <span class="dmc-title">${todayMEB.dateFormatted} • Hafta ${todayMEB.weekNum} • ${todayMEB.themeName} (Gün ${todayMEB.day})</span>
              </div>
            </div>
            <div style="font-size:12px; font-weight:800; color:var(--dp-color-accent, #008744); display:flex; align-items:center; gap:6px;">
              <span>●</span> Bugünün Planı Aktif
            </div>
          </div>
        `;
      } else {
        mebCalendarHtml = `
          <div class="daily-meb-calendar-banner not-today">
            <div class="dmc-left">
              <span class="dmc-icon-badge">${renderIcon('pin', 16)}</span>
              <div class="dmc-info">
                <span class="dmc-tag">ÖZEL SEÇİM İNCELENİYOR (GÜN ${STATE.currentDay})</span>
                <span class="dmc-title">Şu an seçtiğiniz günün kelimelerini inceliyorsunuz. MEB takvimine göre bugünün dersi: Gün ${todayMEB.day} (${todayMEB.dateFormatted})</span>
              </div>
            </div>
            <button type="button" class="dmc-return-btn" onclick="window.APP.goToTodayMEBDay()">
              ${renderIcon('pin', 14)} <span>Bugünün MEB Planına Dön (Gün ${todayMEB.day})</span>
            </button>
          </div>
        `;
      }
    }

    // Cumulative Past Days Review & Quiz Card
    let cumulativeCardHtml = '';
    const cumulativeCount = Math.min(STATE.currentDay * batchSize, targetPool.length);
    if (STATE.currentDay > 1) {
      cumulativeCardHtml = `
        <section class="daily-cumulative-card">
          <div class="dcr-header-row">
            <span class="dcr-tag-badge">${renderIcon('book', 12)} KÜMÜLATİF TEKRAR & PEKİŞTİRME</span>
            <span class="dcr-meta-badge">1. GÜN &rarr; ${STATE.currentDay}. GÜN TOPLAMI (${cumulativeCount} KELİME)</span>
          </div>
          <div class="dcr-body">
            <h3 class="dcr-title">Geçmiş Günlerin Kelimelerini Tekrar Et & Test Ol</h3>
            <p class="dcr-desc">
              1. günden ${STATE.currentDay}. güne kadar işlenen tüm geçmiş kelimeleri (${cumulativeCount} kelime) hafızada kalıcı hale getirmek için kartları baştan sona gözden geçirebilir veya kümülatif değerlendirme testine katılabilirsiniz.
            </p>
            <div class="dcr-actions-row">
              <button type="button" class="fc-action-btn dcr-action-btn" onclick="window.APP.startPastDaysFlashcards(false)">
                ${renderIcon('layers', 15)} <span>Geçmiş Kartları Tekrar Et (${cumulativeCount})</span>
              </button>
              <button type="button" class="fc-action-btn dcr-action-btn" onclick="window.APP.startPastDaysFlashcards(true)" title="Geçmiş günlerin tüm kelimelerini rastgele karıştırarak kart çalışması başlat">
                ${renderIcon('repeat', 15)} <span>Karışık Kart Tekrarı</span>
              </button>
              <button type="button" class="fc-action-btn learned-btn dcr-action-btn" onclick="window.APP.startPastDaysQuiz()">
                ${renderIcon('zap', 15)} <span>Geçmiş Günlerin Testi (Kümülatif Sınav) &rarr;</span>
              </button>
            </div>
          </div>
        </section>
      `;
    }

    const startIndex = (STATE.currentDay - 1) * batchSize;
    const dayWords = targetPool.slice(startIndex, startIndex + batchSize);
    const dayLearnedCount = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const dayPercent = Math.round((dayLearnedCount / (dayWords.length || 1)) * 100);

    // Build Day options dropdown
    let dayOptionsHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      let dayThemeTitle = '';
      if (module === 'maarif') {
        const dStart = (d - 1) * batchSize;
        const dWords = targetPool.slice(dStart, dStart + batchSize);
        const tNum = (dWords[0] && dWords[0].themeNum) ? dWords[0].themeNum : Math.min(8, Math.max(1, Math.ceil(d / 10)));
        const t = (typeof THEMES_DATA !== 'undefined' && THEMES_DATA[tNum]) ? THEMES_DATA[tNum].titleTr : '';
        dayThemeTitle = t ? ` (${t})` : '';
      }
      dayOptionsHtml += `<option value="${d}" ${d === STATE.currentDay ? 'selected' : ''}>Gün ${d}${dayThemeTitle}</option>`;
    }

    let celebrationHtml = '';
    if (dayLearnedCount === dayWords.length && dayWords.length > 0) {
      celebrationHtml = `
        <div class="hero-alert-box" style="margin-bottom: 20px; background: rgba(0, 135, 68, 0.12); border: 1px solid rgba(0, 135, 68, 0.3);">
          <span class="alert-icon">${renderIcon('sparkles', 16)}</span>
          <span class="alert-text"><strong>Tebrikler!</strong> Günün tüm kelimelerini öğrendiniz (%100). Kazanımı pekiştirmek için günün testini başlatın.</span>
        </div>
      `;
    }

    let cardsHtml = '';
    if (dayWords.length === 0) {
      cardsHtml = `
        <div class="secondary-feed-card" style="justify-content: center; text-align: center; padding: 36px 20px;">
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Bu gün için kelime bulunamadı</h4>
            <p class="feed-card-desc">Lütfen yukarıdaki seçiciden başka bir çalışma günü seçin.</p>
          </div>
        </div>
      `;
    } else {
      dayWords.forEach(w => {
        const isLearned = STATE.userData.learned.has(w.id);
        const isStarred = STATE.userData.starred.has(w.id);
        const prepBadge = extractPreposition(w);
        const syn = getWordSynonym(w);
        const curSRS = getWordSRSData(w.id);
        const curMistake = getWordMistakeData(w.id);

        cardsHtml += `
          <article class="secondary-feed-card word-card-item ${isLearned ? 'is-learned' : ''}" data-id="${w.id}">
            <!-- 56px Audio & Speaking Action Cluster -->
            <div class="feed-audio-cluster" style="display: flex; flex-direction: column; gap: 6px; align-items: center; justify-content: center;">
              <button type="button" class="feed-icon-box speak-btn" data-word="${w.en}" title="Sesli Telaffuz (${STATE.settings.accent})" aria-label="Dinle: ${w.en}">
                ${renderIcon('speaker', 15)}
              </button>
              <button type="button" class="feed-icon-box coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(w.en)}')" title="Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu: ${w.en}" style="background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.2);">
                ${renderIcon('mic', 15)}
              </button>
            </div>

            <!-- Content Wrap -->
            <div class="feed-content-wrap">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h4 class="feed-card-title">${w.en}</h4>
                ${w.phonetic ? `<span class="feed-card-meta">${w.phonetic}</span>` : ''}
                ${getCefrBadgeHtml(w.cefr)}
                ${prepBadge ? `<span class="yds-prep-tag" title="Sık kullanılan edat">${prepBadge}</span>` : ''}
                ${curMistake && !curMistake.cleared ? `<span class="pedagogy-badge mistake-badge" title="Hata Defterinde (${curMistake.wrongCount}x Yanlış)">${renderIcon('alert', 12)} ${curMistake.wrongCount}x Hata</span>` : ''}
                ${curSRS ? `<span class="pedagogy-badge srs-badge ${curSRS.state}" title="Aralıklı Tekrar Aralığı: ${curSRS.interval} gün">${renderIcon('repeat', 12)} ${curSRS.state === 'mastered' ? 'Kalıcı' : (curSRS.interval || 1) + 'g'}</span>` : ''}
              </div>
              <div class="feed-card-tr">${w.tr || '<span style="color:var(--dp-color-ink-muted); font-style:italic;">(Anlamı ekleniyor)</span>'}</div>
              <div class="feed-card-meta">${w.desc || ''} ${w.cat ? '• ' + w.cat : ''}</div>
              ${w.definition && w.definition.toLowerCase().trim() !== (w.tr || '').toLowerCase().trim() ? `<div class="feed-card-desc">"${w.definition}"</div>` : ''}
              ${syn ? `<div class="feed-card-meta" style="color:var(--dp-color-accent-ink);"><strong>EŞ ANLAM:</strong> ${syn}</div>` : ''}
              ${w.example ? `<div class="feed-card-example">“${highlightWordInText(w.example.replace(/^["“”]|["“”]$/g, ''), w.en)}”</div>` : ''}
            </div>

            <!-- Trailing Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <!-- 40px Circular Trailing Learned Checkbox Button -->
              <button type="button" class="feed-trailing-btn ${isLearned ? 'checked' : ''}" onclick="window.APP.toggleLearned(${w.id})" title="${isLearned ? 'Öğrenildi' : 'Öğrenildi Olarak İşaretle'}" aria-label="Öğrenildi"></button>
              <!-- Star / Repeat toggle -->
              <button type="button" class="feed-trailing-btn ${isStarred ? 'active' : ''}" onclick="window.APP.toggleStarred(${w.id})" title="${isStarred ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}" aria-label="Favori" aria-pressed="${isStarred ? 'true' : 'false'}" style="font-size: 14px;">
                ${renderIcon(isStarred ? 'starFilled' : 'starOutline', 16)}
              </button>
            </div>
          </article>
        `;
      });
    }

    container.innerHTML = `
      ${celebrationHtml}
      ${mebCalendarHtml}

      <!-- DAILY HEADER CARD (40px Radius & Soft Atmospheric Depth) -->
      <section class="daily-header-card">
        <div class="daily-header-top">
          <div>
            <span class="hero-tag-label">ÇALIŞMA PLANI • GÜN ${STATE.currentDay} / ${totalDays}</span>
            <h2 class="hero-card-title" style="font-size: 26px; margin-top: 4px;">${bannerTitle}</h2>
            <p class="hero-card-desc">${bannerDesc}</p>
          </div>

          <div class="daily-select-wrap">
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" class="fc-action-btn" id="prev-day-btn" ${STATE.currentDay <= 1 ? 'disabled' : ''} aria-label="Önceki Gün" style="min-height: 42px; padding: 0 14px;">← Önceki</button>
              <select id="day-select-dropdown" aria-label="Çalışma Günü Seçimi">
                ${dayOptionsHtml}
              </select>
              <button type="button" class="fc-action-btn" id="next-day-btn" ${STATE.currentDay >= totalDays ? 'disabled' : ''} aria-label="Sonraki Gün" style="min-height: 42px; padding: 0 14px;">Sonraki →</button>
            </div>
          </div>
        </div>

        <!-- Bento Metrics Grid -->
        <div class="bento-metrics-grid" style="margin-top: 18px;">
          <div class="bento-metric-card">
            <span class="bento-card-title">GÜNLÜK İLERLEME</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">${renderIcon('target', 18)}</div>
              <span class="bento-val">${dayLearnedCount} / ${dayWords.length} KELİME</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">BAŞARI YÜZDESİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">${renderIcon('zap', 18)}</div>
              <span class="bento-val">%${dayPercent} TAMAMLANDI</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">KÜTÜPHANE İNDEKSİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">${renderIcon('book', 18)}</div>
              <span class="bento-val">${startIndex + 1}–${Math.min(startIndex + batchSize, targetPool.length)} / ${targetPool.length}</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">HEDEF ZAMANLAMA</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">${renderIcon('calendar', 18)}</div>
              <span class="bento-val">~10 DAKİKA</span>
            </div>
          </div>
        </div>

        <!-- Progress Bar Wrap -->
        <div class="daily-progress-bar-wrap">
          <div class="daily-progress-fill" style="width: ${dayPercent}%;"></div>
        </div>

        <!-- Quick Action Buttons -->
        <div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
          <button type="button" class="fc-action-btn" onclick="window.APP.startDailyFlashcards(false)">
            ${renderIcon('layers', 15)} <span>Günün Kartlarıyla Çalış</span>
          </button>
          <button type="button" class="fc-action-btn" onclick="window.APP.startDailyFlashcards(true)" title="Kelimeleri rastgele karıştırarak başlat">
            ${renderIcon('repeat', 15)} <span>Karışık Başlat</span>
          </button>
          <button type="button" class="fc-action-btn learned-btn" onclick="window.APP.startDailyQuiz()">
            ${renderIcon('zap', 15)} <span>Günün Testini Başlat →</span>
          </button>
          <button type="button" class="fc-action-btn pdf-btn" onclick="window.APP.openPdfStudio('daily')" title="Bu günün çalışma föyünü PDF olarak çıkart" style="background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.25);">
            ${renderIcon('fileText', 15)} <span>Föyü İndir (PDF)</span>
          </button>
        </div>
      </section>

      ${cumulativeCardHtml}

      <!-- SECONDARY FEED LIST (WORDS) -->
      <section class="secondary-feed-section" aria-label="Günün Kelimeleri Listesi">
        <div class="feed-section-heading">
          <span>GÜNÜN KELİMELERİ (${dayWords.length})</span>
          <span class="feed-section-badge">%${dayPercent} TAMAMLANDI</span>
        </div>
        ${cardsHtml}
      </section>
    `;

    // Event Bindings
    document.getElementById('prev-day-btn')?.addEventListener('click', () => {
      if (STATE.currentDay > 1) {
        STATE.currentDay--;
        saveUserData();
        updateUI();
      }
    });

    document.getElementById('next-day-btn')?.addEventListener('click', () => {
      if (STATE.currentDay < totalDays) {
        STATE.currentDay++;
        saveUserData();
        updateUI();
      }
    });

    document.getElementById('day-select-dropdown')?.addEventListener('change', (e) => {
      STATE.currentDay = parseInt(e.target.value, 10);
      saveUserData();
      updateUI();
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        speakWord(word);
      });
    });
  }
  

  // ==========================================================================
  // VIEW 2: 3D FLASHCARD MODU
  // ==========================================================================
  function renderFlashcardView(preservePool = false) {
    const container = document.getElementById('view-flashcard');
    if (!container) return;

    const sourceSelect = document.getElementById('fc-source-select');
    const sourceVal = sourceSelect ? sourceSelect.value : (STATE.flashcardSource || 'daily');
    const sourceChanged = (STATE.flashcardSource !== sourceVal);
    STATE.flashcardSource = sourceVal;

    let pool = [];
    if (!sourceChanged && (preservePool || STATE.flashcardIsShuffled) && STATE.filteredFlashcards && STATE.filteredFlashcards.length > 0) {
      pool = STATE.filteredFlashcards;
    } else {
      if (sourceVal === 'daily') {
        const isYDS = STATE.activeModule === 'yds';
        const isOxford = STATE.activeModule === 'oxford';
        const isAll = STATE.activeModule === 'all';
        if (!isYDS && !isOxford && !isAll) {
          // Maarif mode: synchronize with 36-week curriculum schedule
          const gNum = STATE.selectedGrade || 5;
          let sched = null;
          if (typeof window !== 'undefined' && window.CURRICULUM_CLASSIFIER) {
            sched = STATE.activeCurriculumWeek 
              ? window.CURRICULUM_CLASSIFIER.getWeekByNumber(gNum, STATE.activeCurriculumWeek)
              : window.CURRICULUM_CLASSIFIER.getSchedule(gNum);
          }
          if (!sched && typeof window !== 'undefined' && window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]?.calendar) {
            sched = window.CURRICULUM_DATA[gNum].calendar[0];
          }
          const targetWordsList = (sched && sched.targetWords) ? sched.targetWords : [];
          if (targetWordsList.length > 0) {
            pool = targetWordsList.map((wStr, idx) => resolveCurriculumWord(wStr, gNum, idx)).filter(Boolean);
          } else {
            const targetPool = getActiveGradePool();
            const bSize = 10;
            const start = (STATE.currentDay - 1) * bSize;
            pool = targetPool.slice(start, start + bSize);
          }
        } else {
          const targetPool = isYDS 
            ? WORDS_DATA.filter(isYDSWord) 
            : (isOxford ? WORDS_DATA.filter(isOxfordWord) : WORDS_DATA);
          const bSize = isYDS ? 20 : 25;
          const start = (STATE.currentDay - 1) * bSize;
          pool = targetPool.slice(start, start + bSize);
        }
      } else if (sourceVal === 'past_cumulative') {
        const isYDS = STATE.activeModule === 'yds';
        const isOxford = STATE.activeModule === 'oxford';
        const isAll = STATE.activeModule === 'all';
        const targetPool = isYDS 
          ? WORDS_DATA.filter(isYDSWord) 
          : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : getActiveGradePool()));
        const bSize = isYDS ? 20 : (isOxford || isAll ? 25 : 10);
        const end = Math.min(STATE.currentDay * bSize, targetPool.length);
        pool = targetPool.slice(0, end);
      } else if (sourceVal === 'yds_all') {
        pool = WORDS_DATA.filter(isYDSWord);
      } else if (sourceVal === 'yds_verbs') {
        pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'verb');
      } else if (sourceVal === 'yds_nouns') {
        pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'noun');
      } else if (sourceVal === 'yds_adj_adv') {
        pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'adj_adv');
      } else if (sourceVal === 'yds_c1') {
        pool = WORDS_DATA.filter(w => isYDSWord(w) && w.cefr === 'C1');
      } else if (sourceVal === 'yds_b2') {
        pool = WORDS_DATA.filter(w => isYDSWord(w) && w.cefr === 'B2');
      } else if (sourceVal === 'maarif_all') {
        pool = getActiveGradePool();
      } else if (sourceVal === 'oxford_all') {
        pool = WORDS_DATA.filter(isOxfordWord);
      } else if (sourceVal === 'oxford_a1') {
        pool = WORDS_DATA.filter(w => isOxfordWord(w) && w.cefr === 'A1');
      } else if (sourceVal === 'oxford_a2') {
        pool = WORDS_DATA.filter(w => isOxfordWord(w) && w.cefr === 'A2');
      } else if (sourceVal === 'oxford_b1') {
        pool = WORDS_DATA.filter(w => isOxfordWord(w) && w.cefr === 'B1');
      } else if (sourceVal === 'review') {
        pool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id));
      } else if (sourceVal === 'starred') {
        pool = WORDS_DATA.filter(w => STATE.userData.starred.has(w.id));
      } else if (sourceVal === 'learned') {
        pool = WORDS_DATA.filter(w => STATE.userData.learned.has(w.id));
      } else if (sourceVal === 'srs_due') {
        pool = getSRSDueWords();
      } else if (sourceVal === 'mistakes') {
        pool = getActiveMistakeWords();
      } else {
        pool = WORDS_DATA;
      }
      STATE.filteredFlashcards = pool;
      if (sourceChanged) {
        STATE.flashcardIsShuffled = false;
        STATE.activeFlashcardIndex = 0;
      }
    }

    if (STATE.activeFlashcardIndex >= pool.length) {
      STATE.activeFlashcardIndex = Math.max(0, pool.length - 1);
    }

    const isYdsMod = STATE.activeModule === 'yds';
    const srsDueList = getSRSDueWords();
    const activeMistakesList = getActiveMistakeWords();

    const flashcardSourceOptions = `
      <optgroup label="Akıllı Pedagoji &amp; Hafıza">
        <option value="srs_due" ${sourceVal === 'srs_due' ? 'selected' : ''}>Aralıklı Tekrar: Bugün Bekleyenler (${srsDueList.length})</option>
        <option value="mistakes" ${sourceVal === 'mistakes' ? 'selected' : ''}>Akıllı Hata Defteri: Kurtarma Kampı (${activeMistakesList.length})</option>
      </optgroup>
      ${isYdsMod ? `
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
        <option value="past_cumulative" ${sourceVal === 'past_cumulative' ? 'selected' : ''}>Geçmiş Günler Havuzu (1–${STATE.currentDay}. Gün)</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>Tüm YDS/YÖKDİL Kelimeleri (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')})</option>
        <option value="yds_verbs" ${sourceVal === 'yds_verbs' ? 'selected' : ''}>Akademik Fiiller</option>
        <option value="yds_nouns" ${sourceVal === 'yds_nouns' ? 'selected' : ''}>Akademik İsimler</option>
        <option value="yds_adj_adv" ${sourceVal === 'yds_adj_adv' ? 'selected' : ''}>Sıfatlar &amp; Zarflar</option>
        <option value="yds_c1" ${sourceVal === 'yds_c1' ? 'selected' : ''}>C1 İleri Akademik</option>
        <option value="yds_b2" ${sourceVal === 'yds_b2' ? 'selected' : ''}>B2 Orta-İleri</option>
      ` : `
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün Kelimeleri (Gün ${STATE.currentDay})</option>
        <option value="past_cumulative" ${sourceVal === 'past_cumulative' ? 'selected' : ''}>Geçmiş Günler Havuzu (1–${STATE.currentDay}. Gün)</option>
        <option value="maarif_all" ${sourceVal === 'maarif_all' ? 'selected' : ''}>MEB: ${getActiveGrade()}. Sınıf Müfredatı (${getActiveGradePool().length.toLocaleString('tr-TR')} Kelime)</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>YDS &amp; YÖKDİL Akademik (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')} Kelime)</option>
        <option value="oxford_all" ${sourceVal === 'oxford_all' ? 'selected' : ''}>Kelime Kütüphanesi (Tümü - ${WORDS_DATA.filter(isOxfordWord).length.toLocaleString('tr-TR')})</option>
        <option value="oxford_a1" ${sourceVal === 'oxford_a1' ? 'selected' : ''}>Kütüphane: A1 Başlangıç</option>
        <option value="oxford_a2" ${sourceVal === 'oxford_a2' ? 'selected' : ''}>Kütüphane: A2 Temel</option>
        <option value="oxford_b1" ${sourceVal === 'oxford_b1' ? 'selected' : ''}>Kütüphane: B1 Orta</option>
      `}
      <option value="all" ${sourceVal === 'all' ? 'selected' : ''}>Tüm Kelime Havuzu (${WORDS_DATA.length.toLocaleString('tr-TR')})</option>
      <option value="review" ${sourceVal === 'review' ? 'selected' : ''}>Tekrar Edilecekler (${STATE.userData.review.size})</option>
      <option value="starred" ${sourceVal === 'starred' ? 'selected' : ''}>Favorilerim (${STATE.userData.starred.size})</option>
    `;

    if (pool.length === 0) {
      container.innerHTML = `
        <div class="flashcard-wrapper">
          <div class="flashcard-toolbar">
            <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()" aria-label="Kart Kaynağı Seçimi">
              ${flashcardSourceOptions}
            </select>
          </div>
          <div class="glass-panel" style="padding: 48px 24px; text-align: center; width: 100%;">
            <div style="margin-bottom: 12px; color: var(--dp-color-ink-muted);">${renderIcon('layers', 40)}</div>
            <h3>${sourceVal === 'srs_due' ? 'Bugün için bekleyen aralıklı tekrarınız yok. Harika!' : (sourceVal === 'mistakes' ? 'Hata Defteriniz tertemiz! Zayıf nokta bulunmuyor.' : 'Bu filtre grubunda henüz kelime bulunmuyor.')}</h3>
            <p style="color: var(--dp-color-ink-muted); margin-top: 6px;">Lütfen yukarıdaki menüden başka bir kelime havuzu seçin.</p>
          </div>
        </div>
      `;
      return;
    }

    const currentWord = pool[STATE.activeFlashcardIndex];
    const isLearned = STATE.userData.learned.has(currentWord.id);
    const isReview = STATE.userData.review.has(currentWord.id);
    const prepBadge = extractPreposition(currentWord);
    const syn = getWordSynonym(currentWord);
    const curSRS = getWordSRSData(currentWord.id);
    const curMistake = getWordMistakeData(currentWord.id);

    let nextGoodDays = 3;
    let nextEasyDays = 6;
    if (!curSRS || curSRS.repetitions === 0) {
      nextGoodDays = 1;
      nextEasyDays = 3;
    } else if (curSRS.repetitions === 1) {
      nextGoodDays = 3;
      nextEasyDays = 6;
    } else {
      nextGoodDays = Math.max(4, Math.round(curSRS.interval * curSRS.easeFactor));
      nextEasyDays = Math.max(7, Math.round(curSRS.interval * curSRS.easeFactor * 1.35));
    }

    container.innerHTML = `
      <div class="flashcard-wrapper">
        <div class="flashcard-toolbar">
          <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()" aria-label="Kart Kaynağı Seçimi">
            ${flashcardSourceOptions}
          </select>

          <div class="flashcard-counter">
            ${STATE.activeFlashcardIndex + 1} / ${pool.length}
          </div>

          <div class="fc-shuffle-group" style="display:inline-flex; align-items:center; gap:6px;">
            <button class="ctrl-btn ${STATE.flashcardIsShuffled ? 'active' : ''}" onclick="window.APP.shuffleFlashcards()" title="${STATE.flashcardIsShuffled ? 'Yeniden Karıştır' : 'Destedeki Kartları Karıştır'}">
              ${ICONS.shuffle} <span>${STATE.flashcardIsShuffled ? 'YENİDEN KARIŞTIR' : 'KARIŞTIR'}</span>
            </button>
            ${STATE.flashcardIsShuffled ? `
              <button class="ctrl-btn" onclick="window.APP.unshuffleFlashcards()" title="Orijinal Alfabetik Sıraya Dön" style="padding:0 8px; font-size:0.75rem;">
                A→Z
              </button>
            ` : ''}
          </div>
        </div>

        <div class="card-scene" id="flashcard-scene" tabindex="0" role="button" aria-label="Kartı çevirmek için tıklayın veya Space tuşuna basın">
          <div class="flashcard-inner ${STATE.flashcardFlipped ? 'flipped' : ''}" id="flashcard-inner">
            
            <!-- Front Face -->
            <div class="card-face card-face-front">
              <div class="fc-header">
                <div class="fc-badges">
                  ${getCefrBadgeHtml(currentWord.cefr)}
                  ${currentWord.themeCode ? getThemeBadgeHtml(currentWord.themeCode, currentWord.themeTitle) : ''}
                  ${prepBadge ? `<span class="yds-prep-tag">${prepBadge}</span>` : ''}
                  ${curMistake && !curMistake.cleared ? `<span class="pedagogy-badge mistake-badge" title="Hata Defterinde">${renderIcon('alert', 12)} ${curMistake.wrongCount}x HATA</span>` : ''}
                  ${curSRS ? `<span class="pedagogy-badge srs-badge ${curSRS.state}" title="Aralıklı Tekrar Aralığı: ${curSRS.interval} gün">${renderIcon('repeat', 12)} ${curSRS.state === 'mastered' ? 'Kalıcı Bellek' : (curSRS.interval || 1) + 'g Tekrar'}</span>` : ''}
                </div>
                <div class="fc-audio-action-group" style="display:inline-flex; gap:6px; align-items:center;">
                  <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle" aria-label="Dinle">
                    ${ICONS.speaker}
                  </button>
                  <button class="speak-btn coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(currentWord.en)}')" title="Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu">
                    ${ICONS.mic}
                  </button>
                </div>
              </div>

              <div class="fc-main">
                <div class="fc-word-en">${currentWord.en}</div>
                ${currentWord.phonetic ? `<div class="word-phonetic" style="font-size:1.05rem; margin-bottom:8px;">${currentWord.phonetic}</div>` : ''}
                <div class="fc-category-desc">${currentWord.desc || ''} ${currentWord.cat ? '• ' + currentWord.cat : ''}</div>
                ${syn ? `<div class="yds-syn-tag" style="margin-top:10px; font-size:0.85rem;"><strong>EŞ ANLAM:</strong> ${syn}</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">
                  <span class="fc-hint-desktop">ÇEVİRMEK İÇİN TIKLA <span class="fc-kbd-inline">SPACE</span></span>
                  <span class="fc-hint-mobile">ÇEVİRMEK İÇİN DOKUNUN</span>
                </span>
                <span>#${currentWord.no || currentWord.id}</span>
              </div>
            </div>

            <!-- Back Face -->
            <div class="card-face card-face-back">
              <div class="fc-header">
                <span class="cefr-pill">TÜRKÇE ANLAMI</span>
                <div class="fc-audio-action-group" style="display:inline-flex; gap:6px; align-items:center;">
                  <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle" aria-label="Dinle">
                    ${ICONS.speaker}
                  </button>
                  <button class="speak-btn coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(currentWord.en)}')" title="Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu">
                    ${ICONS.mic}
                  </button>
                </div>
              </div>

              <div class="fc-main">
                <div class="fc-word-tr">${currentWord.tr || '(Anlamı yakında eklenecek)'}</div>
                <div style="font-size: 0.9rem; color: var(--dp-color-ink-muted); font-weight: 600; margin-bottom: 8px;">
                  ${currentWord.en} — ${currentWord.desc || ''}
                </div>

                <!-- Pedagogical Memory Retention Bar -->
                <div class="srs-card-pedagogy-meta">
                  <span class="srs-pill-item">${renderIcon('repeat', 12)} <strong>Tekrar Aralığı:</strong> ${curSRS ? (curSRS.interval || 1) + ' Gün' : 'Yeni'}</span>
                  <span class="srs-pill-item">${renderIcon('zap', 12)} <strong>Hafıza Gücü:</strong> %${curSRS ? Math.round(curSRS.easeFactor * 100) : 250}</span>
                  ${curMistake && !curMistake.cleared ? `
                    <span class="srs-pill-item srs-pill-mistake">${renderIcon('alert', 12)} <strong>Hata Geçmişi:</strong> ${curMistake.wrongCount}x Yanlış (${Math.max(0, 2 - (curMistake.consecutiveCorrect || 0))} doğru sonra temizlenir)</span>
                  ` : ''}
                </div>

                ${currentWord.definition && currentWord.definition.toLowerCase().trim() !== (currentWord.tr || '').toLowerCase().trim() ? `<div class="word-def" style="max-width: 52ch;">“${currentWord.definition}”</div>` : ''}
                ${currentWord.example ? `<div class="word-example" style="max-width: 52ch;">“${highlightWordInText(currentWord.example.replace(/^["“”]|["“”]$/g, ''), currentWord.en)}”</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">
                  <span class="fc-hint-desktop">İNGİLİZCE YÜZE DÖN <span class="fc-kbd-inline">SPACE</span></span>
                  <span class="fc-hint-mobile">İNGİLİZCE YÜZE DÖNÜN</span>
                </span>
                <span>${currentWord.cat || ''}</span>
              </div>
            </div>

          </div>
        </div>

        <div class="fc-controls fc-controls-srs">
          <button class="fc-action-btn fc-btn-prev" onclick="window.APP.prevFlashcard()" title="Önceki Kart">
            &larr; ÖNCEKİ
          </button>
          
          <button class="fc-action-btn fc-btn-again ${isReview ? 'active' : ''}" onclick="window.APP.markFlashcardSRS(${currentWord.id}, 1)" title="Zorlandım / Hatırlamadım (1 gün sonra tekrar sor)">
            <span class="fc-btn-top">${renderIcon('alert', 13)} ZOR / TEKRAR</span>
            <span class="fc-btn-sub">1 gün sonra</span>
            <span class="kbd-badge">1</span>
          </button>

          <button class="fc-action-btn fc-btn-good ${isLearned ? 'active' : ''}" onclick="window.APP.markFlashcardSRS(${currentWord.id}, 4)" title="İyi / Hatırladım">
            <span class="fc-btn-top">${renderIcon('zap', 13)} İYİ / HATIRLADIM</span>
            <span class="fc-btn-sub">${nextGoodDays} gün sonra</span>
            <span class="kbd-badge">2</span>
          </button>

          <button class="fc-action-btn fc-btn-easy" onclick="window.APP.markFlashcardSRS(${currentWord.id}, 5)" title="Çok Kolay / Zihnimde">
            <span class="fc-btn-top">${renderIcon('check', 13)} KOLAY / ZİHNİMDE</span>
            <span class="fc-btn-sub">${nextEasyDays} gün sonra</span>
            <span class="kbd-badge">3</span>
          </button>

          <button class="fc-action-btn fc-btn-next" onclick="window.APP.nextFlashcard()" title="Sonraki Kart">
            SONRAKİ &rarr;
          </button>
        </div>
      </div>
    `;

    document.getElementById('flashcard-scene')?.addEventListener('click', () => {
      STATE.flashcardFlipped = !STATE.flashcardFlipped;
      playSound('flip');
      document.getElementById('flashcard-inner')?.classList.toggle('flipped', STATE.flashcardFlipped);
    });
  }

  // ==========================================================================
  // VIEW 3: QUIZ & TEST (YDS Cloze Test & Multiple Choice)
  // ==========================================================================
  function renderQuizView() {
    const container = document.getElementById('view-quiz');
    if (!container) return;

    if (!STATE.quizState.active) {
      const isYds = STATE.activeModule === 'yds';

      // Check saved quiz
      const savedQuizJson = localStorage.getItem('learnish_active_quiz');
      let resumeCardHtml = '';
      if (savedQuizJson) {
        try {
          const sq = JSON.parse(savedQuizJson);
          if (sq && sq.questions && sq.currentIndex < sq.questions.length) {
            resumeCardHtml = `
              <div class="resume-quiz-card glass-panel">
                <div class="resume-quiz-info">
                  <span class="resume-quiz-badge">${renderIcon('pin', 12)} OTURUM KAYDEDİLDİ</span>
                  <div class="resume-quiz-title">Yarım kalan bir test oturumunuz bulunuyor</div>
                  <div class="resume-quiz-meta">
                    SORU ${sq.currentIndex + 1} / ${sq.questions.length} • MEVCUT SKOR: ${sq.score}
                  </div>
                </div>
                <div class="resume-quiz-actions">
                  <button class="ctrl-btn resume-continue-btn" onclick="window.APP.resumeQuiz()">
                    OTURUMA DEVAM ET &rarr;
                  </button>
                  <button class="ctrl-btn resume-discard-btn" onclick="window.APP.discardSavedQuiz()">
                    YENİ TEST BAŞLAT
                  </button>
                </div>
              </div>
            `;
          }
        } catch (e) {
          localStorage.removeItem('learnish_active_quiz');
        }
      }

      container.innerHTML = `
        <div class="quiz-wrapper">
          ${resumeCardHtml}
          <div class="quiz-setup-card glass-panel">
            <h2>${isYds ? 'YDS & YÖKDİL AKADEMİK SINAV SİMÜLATÖRÜ' : 'KELİME DEĞERLENDİRME & TEST MODÜLÜ'}</h2>
            <p>${isYds ? 'ÖSYM sınav formatında cümle tamamlama (cloze), akademik tanım eşleştirme ve kelime soruları.' : 'Kelime kazanımlarınızı çoktan seçmeli sorularla doğrulayın. Yanlış cevaplanan kelimeler otomatik olarak tekrar listesine alınır.'}</p>

            <div class="quiz-config-grid">
              <div class="config-group">
                <label for="quiz-mode-select">Soru Türü</label>
                <select id="quiz-mode-select">
                  <option value="en-tr">İngilizce &rarr; Türkçe (Anlamını Bul)</option>
                  <option value="tr-en">Türkçe &rarr; İngilizce (Kelimeyi Bul)</option>
                  ${isYds ? `
                    <option value="cloze">Cümle Tamamlama (YDS Cloze Test)</option>
                    <option value="definition">İngilizce Tanımdan Kelimeyi Bulma</option>
                  ` : ''}
                  <option value="listening">Dinleme &amp; Anlama (Sesli Telaffuz)</option>
                  <option value="speaking">Telaffuz &amp; Speaking Sınavı (Mikrofonla Oku)</option>
                </select>
              </div>

              <div class="config-group">
                <label for="quiz-source-select">Soru Kaynağı</label>
                <select id="quiz-source-select">
                  <optgroup label="Akıllı Pedagoji &amp; Hafıza">
                    <option value="srs_due">Aralıklı Tekrar: Bugün Bekleyenler (${getSRSDueWords().length} Kelime)</option>
                    <option value="mistakes">Akıllı Hata Defteri: Kurtarma Kampı (${getActiveMistakeWords().length} Kelime)</option>
                  </optgroup>
                  ${isYds ? `
                    <option value="yds_all">Tüm YDS/YÖKDİL Havuzu (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')} Kelime)</option>
                    <option value="yds_verbs">Akademik Fiiller (Verbs)</option>
                    <option value="yds_nouns">Akademik İsimler (Nouns)</option>
                    <option value="yds_adj_adv">Sıfatlar &amp; Zarflar</option>
                    <option value="daily">Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
                    <option value="past_cumulative">Geçmiş Günler Havuzu (1–${STATE.currentDay}. Gün)</option>
                  ` : `
                    <option value="daily">Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
                    <option value="past_cumulative">Geçmiş Günler Havuzu (1–${STATE.currentDay}. Gün)</option>
                    <option value="maarif">MEB: ${getActiveGrade()}. Sınıf Müfredatı</option>
                    <option value="oxford_all">Kelime Kütüphanesi (Tüm Havuz)</option>
                    <option value="all">Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
                  `}
                  <option value="review">Tekrar Edilecekler (${STATE.userData.review.size})</option>
                </select>
              </div>

              <div class="config-group">
                <label for="quiz-count-select">Soru Sayısı</label>
                <select id="quiz-count-select">
                  <option value="10">10 Soru</option>
                  <option value="20">20 Soru</option>
                  <option value="all">Tüm Uygun Kelimeler</option>
                </select>
              </div>

              <div class="config-group">
                <label for="quiz-level-select">Zorluk Seviyesi</label>
                <select id="quiz-level-select">
                  <option value="all">Tüm Seviyeler</option>
                  <option value="A1">A1 Başlangıç</option>
                  <option value="A2">A2 Temel</option>
                  <option value="B1">B1 Orta</option>
                  <option value="B2">B2 Orta-İleri</option>
                  <option value="C1">C1 İleri / Akademik</option>
                </select>
              </div>
            </div>

            <button class="start-quiz-btn" onclick="window.APP.startQuiz()">
              TEST OTURUMUNU BAŞLAT &rarr;
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Active Quiz View
    const qState = STATE.quizState;
    if (qState.currentIndex >= qState.questions.length) {
      const totalQ = qState.questions.length;
      const accuracy = Math.round((qState.score / (totalQ || 1)) * 100);
      const earnedXP = qState.score * 15;

      if (qState.active) {
        qState.active = false;
        localStorage.removeItem('learnish_active_quiz');
        STATE.userData.stats.quizzesPlayed++;
        STATE.userData.stats.correctAnswers += qState.score;
        STATE.userData.stats.totalQuestions += totalQ;
        if (qState.streak > STATE.userData.stats.bestStreak) {
          STATE.userData.stats.bestStreak = qState.streak;
        }
        logActivity(
          STATE.activeModule === 'yds' ? 'YDS SİMÜLATÖR TESTİ' : 'DEĞERLENDİRME TESTİ',
          `OTURUM TAMAMLANDI — ${qState.score}/${totalQ} DOĞRU (%${accuracy})`
        );
        saveUserData();
      }

      let statusCode = '[ OTURUM TAMAMLANDI ]';
      let titleMessage = 'DEĞERLENDİRME TAMAMLANDI';
      let subMessage = 'Yanlış cevaplanan kelimeler tekrar listesine eklendi.';
      if (accuracy >= 90) {
        statusCode = '[ ÜSTÜN BAŞARI • %' + accuracy + ' ]';
        titleMessage = 'YÜKSEK DOĞRULUK ORANI';
        subMessage = 'Hedef kelimelerin tamamına yakını doğrulandı.';
      } else if (accuracy >= 70) {
        statusCode = '[ HEDEF ONAYLANDI • %' + accuracy + ' ]';
        titleMessage = 'BAŞARILI PERFORMANS';
        subMessage = 'Hedef kelimelerin büyük çoğunluğu kalıcı olarak pekiştirildi.';
      }

      container.innerHTML = `
        <div class="quiz-wrapper">
          <div class="quiz-setup-card glass-panel" style="text-align: center;">
            <div style="font-family: var(--dp-typography-mono); font-size: 0.9rem; font-weight: 700; color: var(--dp-color-accent-ink); margin-bottom: 10px; letter-spacing: 0.06em;">${statusCode}</div>
            <h2>${titleMessage}</h2>
            <p>${subMessage}</p>

            <div class="stats-summary-grid" style="margin: 20px 0;">
              <div class="stat-metric-card glass-panel">
                <div class="metric-val">${qState.score} / ${totalQ}</div>
                <div class="metric-title">DOĞRU SAYISI</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--dp-color-accent-ink);">%${accuracy}</div>
                <div class="metric-title">BAŞARI ORANI</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--dp-color-emphasis);">+${earnedXP}</div>
                <div class="metric-title">KAZANIM PUANI</div>
              </div>
            </div>

            <div class="quiz-finished-actions" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-top: 24px;">
              <button class="fc-action-btn" onclick="window.APP.goHome()" style="min-height: 48px; min-width: 160px; font-weight: 700;">
                ANA SAYFAYA DÖN
              </button>
              <button class="fc-action-btn" onclick="window.APP.quitQuiz()" style="min-height: 48px; min-width: 160px;">
                YENİ TEST BAŞLAT
              </button>
              <button class="fc-action-btn" onclick="window.APP.switchView('daily')" style="min-height: 48px; min-width: 160px;">
                GÜNLÜK ÇALIŞMA
              </button>
              ${(STATE.userData.mistakes && Object.keys(STATE.userData.mistakes).length > 0) ? `
                <button class="fc-action-btn pdf-btn" onclick="window.APP.openPdfStudio('mistakes')" style="min-height: 48px; min-width: 160px; background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.25);">
                  ${renderIcon('fileText', 14)} <span>Yanlışları PDF Çıkart</span>
                </button>
              ` : `
                <button class="fc-action-btn pdf-btn" onclick="window.APP.openPdfStudio('quiz')" style="min-height: 48px; min-width: 160px; background: rgba(202, 0, 19, 0.08); color: var(--dp-color-accent-ink); border-color: rgba(202, 0, 19, 0.25);">
                  ${renderIcon('fileText', 14)} <span>Test Föyünü İndir (PDF)</span>
                </button>
              `}
            </div>
          </div>
        </div>
      `;
      return;
    }

    const currentQ = qState.questions[qState.currentIndex];
    const targetWord = currentQ.targetWord;

    const modeLabels = {
      'cloze': 'CÜMLE TAMAMLAMA',
      'definition': 'TANIM EŞLEŞTİRME',
      'listening': 'DİNLEME TESTİ',
      'speaking': 'TELAFFUZ & SPEAKING',
      'tr-en': 'TR → EN',
      'en-tr': 'EN → TR'
    };
    const activeModeTitle = modeLabels[qState.mode] || 'EN → TR';

    let questionContentHtml = '';
    if (qState.mode === 'cloze') {
      const regex = new RegExp(`\\b${targetWord.en}[a-z]*\\b`, 'i');
      const clozeText = currentQ.clozeSentence || (targetWord.example ? targetWord.example.replace(regex, '<span class="cloze-blank">_______</span>') : `${targetWord.tr} anlamına gelen kelimeyi seçiniz: <span class="cloze-blank">_______</span>`);
      questionContentHtml = `
        <div class="quiz-cloze-sentence">“${clozeText}”</div>
        <div style="font-family:var(--dp-typography-mono); font-size:0.78rem; color:var(--dp-color-ink-muted); margin-top:10px;">[${targetWord.desc} • ${targetWord.cefr}]</div>
      `;
    } else if (qState.mode === 'definition') {
      questionContentHtml = `
        <div style="font-size: 1.15rem; color: var(--dp-color-ink); line-height: 1.5; font-style: italic;">“${targetWord.definition || targetWord.tr}”</div>
        <div style="font-family:var(--dp-typography-mono); font-size:0.78rem; color:var(--dp-color-ink-muted); margin-top:10px;">[${targetWord.desc} • ${targetWord.cefr}]</div>
      `;
    } else if (qState.mode === 'listening') {
      questionContentHtml = `
        <button class="speak-btn" style="width: 56px; height: 56px; margin: 8px auto;" onclick="window.APP.replayQuizAudio()" aria-label="Sesi Tekrar Dinle">
          ${ICONS.speaker}
        </button>
        <div style="font-family:var(--dp-typography-mono); font-size:0.82rem; color:var(--dp-color-ink-muted); margin-top:8px;">SESİ TEKRAR DİNLEMEK İÇİN TIKLAYIN <span class="quiz-kbd-hint">(VEYA <span class="fc-kbd-inline">R</span> TUŞU)</span></div>
      `;
    } else if (qState.mode === 'speaking') {
      questionContentHtml = `
        <div style="font-family:var(--dp-typography-mono); font-size:0.8rem; color:var(--dp-color-emphasis); margin-bottom:6px; letter-spacing:0.04em;">[ MİKROFONLA SESLENDİRİN ]</div>
        <div class="quiz-target-word">${escapeHtml(targetWord.en)}</div>
        ${targetWord.phonetic ? `<div class="word-phonetic" style="font-size:1.15rem; margin-top:4px;">${escapeHtml(targetWord.phonetic)}</div>` : ''}
        <div style="font-family:var(--dp-typography-mono); font-size:0.82rem; color:var(--dp-color-ink-muted); margin-top:8px;">${escapeHtml(targetWord.desc || '')} • ${escapeHtml(targetWord.tr || '')}</div>
      `;
    } else if (qState.mode === 'tr-en') {
      questionContentHtml = `
        <div class="quiz-target-word">${targetWord.tr}</div>
        <div style="font-family:var(--dp-typography-mono); font-size:0.8rem; color:var(--dp-color-ink-muted);">${targetWord.desc} • ${targetWord.cefr}</div>
      `;
    } else {
      questionContentHtml = `
        <div class="quiz-target-word">${targetWord.en}</div>
        <div style="font-family:var(--dp-typography-mono); font-size:0.8rem; color:var(--dp-color-ink-muted);">${targetWord.desc} • ${targetWord.cefr}</div>
      `;
    }

    let interactiveAreaHtml = '';
    if (qState.mode === 'speaking') {
      interactiveAreaHtml = `
        <div class="quiz-speaking-panel">
          <div class="quiz-speaking-controls-row">
            <button type="button" class="quiz-speaking-mic-btn" id="quiz-mic-btn" onclick="window.APP.triggerQuizSpeaking()" title="Konuşmak İçin Dokunun (veya Space)">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
              <span id="quiz-mic-btn-label">MİKROFONA DOKUN &amp; OKU</span>
            </button>
            <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(targetWord.en)}')" title="Doğru Telaffuzu Dinle" style="min-height:50px; padding:0 18px;">
              ${ICONS.speaker} <span>Doğruyu Dinle</span>
            </button>
          </div>

          <div class="quiz-speaking-waveform" id="quiz-speaking-waveform" aria-hidden="true">
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
            <span class="wave-bar"></span>
          </div>

          <div class="quiz-speaking-status" id="quiz-speaking-status">
            Mikrofona dokunun ve kelimeyi net seslendirin <span class="quiz-kbd-hint">(veya <span class="fc-kbd-inline">SPACE</span> tuşuna basın)</span>
          </div>

          <div class="quiz-speaking-heard" id="quiz-speaking-heard"></div>
          <div class="quiz-speaking-feedback" id="quiz-speaking-feedback"></div>
        </div>
      `;
    } else {
      const optionsHtml = currentQ.options.map((opt, idx) => `
        <button class="quiz-opt-btn" onclick="window.APP.handleQuizAnswer(${idx})">
          <span class="kbd-badge">${String.fromCharCode(65 + idx)}</span>
          <span>${opt.text}</span>
        </button>
      `).join('');

      interactiveAreaHtml = `
        <div class="quiz-options-grid">
          ${optionsHtml}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="quiz-wrapper">
        <div class="quiz-active-card glass-panel">
          <div class="quiz-top-bar">
            <span style="font-family:var(--dp-typography-mono); font-size:0.85rem; color:var(--dp-color-ink-muted); font-weight:700;">
              SORU ${qState.currentIndex + 1} / ${qState.questions.length} • ${activeModeTitle}
            </span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="theme-pill" style="color:var(--dp-color-emphasis);">SKOR: ${qState.score}</span>
              <button class="ctrl-btn" style="min-height: 36px; padding: 0 12px; font-size:0.75rem;" onclick="window.APP.quitQuiz()">ÇIKIŞ</button>
            </div>
          </div>

          <div class="progress-track" style="margin-bottom: 20px;">
            <div class="progress-fill" style="width: ${((qState.currentIndex) / qState.questions.length) * 100}%;"></div>
          </div>

          <div class="quiz-target-box">
            ${questionContentHtml}
          </div>

          ${interactiveAreaHtml}

          <div id="quiz-feedback-container"></div>
        </div>
      </div>
    `;

    if (qState.mode === 'listening') {
      setTimeout(() => speakWord(targetWord.en), 200);
    }
  }

  // ==========================================================================
  // VIEW 4: KELİME HAVUZU & ARAMA (Akıllı Arama, Sıfır Odak Kaybı & Sayfalama)
  // ==========================================================================
  function getFilteredDirectoryWords() {
    const filters = STATE.directoryFilters;
    const isYdsModule = STATE.activeModule === 'yds';

    let pool = WORDS_DATA;

    if (isYdsModule || filters.dataset === 'yds') {
      pool = WORDS_DATA.filter(isYDSWord);
    } else if (filters.dataset === 'oxford') {
      pool = WORDS_DATA.filter(isOxfordWord);
    } else if (filters.dataset === 'maarif') {
      pool = getActiveGradePool();
    }

    if (filters.pos && filters.pos !== 'all') {
      pool = pool.filter(w => getWordPOS(w) === filters.pos);
    }

    if (filters.theme && filters.theme !== 'all') {
      pool = pool.filter(w => w.themeNum === parseInt(filters.theme, 10));
    }

    if (filters.cefr && filters.cefr !== 'all') {
      pool = pool.filter(w => w.cefr === filters.cefr);
    }

    if (filters.status === 'learned') {
      pool = pool.filter(w => STATE.userData.learned.has(w.id));
    } else if (filters.status === 'review') {
      pool = pool.filter(w => STATE.userData.review.has(w.id));
    } else if (filters.status === 'starred') {
      pool = pool.filter(w => STATE.userData.starred.has(w.id));
    }

    // Arama rafı süzmez (kitaplık spec §6.6); arama yalnızca öneri listesini besler.

    // Deduplication safeguard: ensure each normalized English headword appears strictly once
    const seenWords = new Set();
    pool = pool.filter(w => {
      const k = (w.en || '').trim().toLowerCase().replace(/[\.\!\?,;:]+$/g, '').replace(/[\s\-_~]+/g, '');
      if (seenWords.has(k)) return false;
      seenWords.add(k);
      return true;
    });

    return pool;
  }

  // ==========================================================================
  // KİTAPLIK: VERİ (raf = harf, kitap = kelime)
  // ==========================================================================
  // İlk iki harfi (aksansız, büyük) döndürür; harf olmayanlar atlanmaz, olduğu gibi kalır
  function _libraryFold(s) {
    return String(s || '').trim().normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  }

  function libraryLetterOf(word) {
    const c = _libraryFold(word && word.en).charAt(0);
    return c >= 'A' && c <= 'Z' ? c : '#';
  }

  function buildLibraryIndex(words) {
    const byLetter = {};
    for (const w of words) {
      const L = libraryLetterOf(w);
      (byLetter[L] || (byLetter[L] = [])).push(w);
    }
    const cmp = (a, b) => String(a.en).localeCompare(String(b.en), 'en', { sensitivity: 'base' });
    Object.values(byLetter).forEach(list => list.sort(cmp));
    const letters = Object.keys(byLetter).filter(L => L !== '#').sort();
    if (byLetter['#']) letters.push('#');
    return { letters, byLetter };
  }

  const SPINE_TONES = { A1: 'tone-a1', A2: 'tone-a2', B1: 'tone-b1', B2: 'tone-b2', C1: 'tone-c1', C2: 'tone-c2', 'C2+': 'tone-c2' };
  function spineToneClass(cefr) {
    return SPINE_TONES[String(cefr || '').toUpperCase()] || 'tone-a2';
  }

  function spineHeightPx(word) {
    const len = String((word && word.en) || '').length;
    return 130 + Math.min(len, 14) * 4 + ((Number(word && word.id) || 0) % 3) * 2;
  }

  function spineLabel(en) {
    const s = String(en || '');
    return s.length > 22 ? s.slice(0, 21) + '…' : s;
  }

  // Arama önerileri: önce filtreye uyanlar, eksik kalırsa filtre dışı eşleşmeler (outsideFilter)
  function librarySuggest(query, filteredWords, allWords, limit = 6) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return [];
    const tierOf = (w) => {
      const en = String(w.en || '').toLowerCase();
      if (en.startsWith(q)) return 0;
      if (en.includes(q)) return 1;
      return ['alt', 'tr', 'synonym', 'definition'].some(k => w[k] && String(w[k]).toLowerCase().includes(q)) ? 2 : -1;
    };
    const ranked = (list) => list
      .map(w => ({ w, t: tierOf(w) }))
      .filter(x => x.t >= 0)
      .sort((a, b) => a.t - b.t || String(a.w.en).localeCompare(String(b.w.en), 'en', { sensitivity: 'base' }));
    const out = [];
    const seen = new Set();
    for (const { w } of ranked(filteredWords)) {
      if (out.length >= limit) break;
      seen.add(w.id); out.push({ word: w, outsideFilter: false });
    }
    if (out.length < limit) {
      for (const { w } of ranked(allWords)) {
        if (out.length >= limit) break;
        if (seen.has(w.id)) continue;
        seen.add(w.id); out.push({ word: w, outsideFilter: true });
      }
    }
    return out;
  }

  // Harf içi atlama cetveli: ilk iki harfe göre kovalar, en fazla 8; fazlası en küçük komşu çiftler birleşerek azalır
  function shelfRulerGroups(words) {
    if (!words || words.length < 60) return [];
    const buckets = [];
    words.forEach((w, i) => {
      const f = _libraryFold(w.en);
      const key = /[A-Z]/.test(f.charAt(1)) ? f.slice(0, 2) : f.charAt(0);
      const last = buckets[buckets.length - 1];
      if (last && last.last === key) last.count++;
      else buckets.push({ first: key, last: key, index: i, count: 1 });
    });
    while (buckets.length > 8) {
      let best = 0;
      for (let i = 1; i < buckets.length - 1; i++) {
        if (buckets[i].count + buckets[i + 1].count < buckets[best].count + buckets[best + 1].count) best = i;
      }
      const a = buckets[best], b = buckets[best + 1];
      buckets.splice(best, 2, { first: a.first, last: b.last, index: a.index, count: a.count + b.count });
    }
    return buckets.map(b => ({ label: b.first === b.last ? b.first : `${b.first}–${b.last}`, index: b.index }));
  }

  // Kısa ve sade kelime türü rozeti etiketleri
  const POS_LABELS = {
    noun: 'NOUN', verb: 'VERB', adjective: 'ADJ', adverb: 'ADV',
    adj_adv: 'ADJ/ADV', preposition: 'PREP', pronoun: 'PRON',
    conjunction: 'CONJ', determiner: 'DET', phrase: 'PHRASE', idiom: 'IDIOM'
  };

  function syncDirectoryStatusChips() {
    const container = document.getElementById('status-chips');
    if (!container) return;
    const buttons = container.querySelectorAll ? container.querySelectorAll('button') : [];
    for (const btn of buttons) {
      const val = btn.getAttribute ? btn.getAttribute('data-val') : null;
      if (val === 'learned') btn.innerText = `ÖĞRENİLENLER (${STATE.userData.learned.size})`;
      if (val === 'review') btn.innerText = `TEKRAR EDİLECEKLER (${STATE.userData.review.size})`;
      if (val === 'starred') btn.innerText = `FAVORİLER (${STATE.userData.starred.size})`;
    }
  }

  function clearDirectoryFilters() {
    STATE.directoryFilters = { search: '', dataset: 'all', theme: 'all', cefr: 'all', status: 'all', pos: 'all' };
    renderDirectoryView(false);
  }

  // ==========================================================================
  // KİTAPLIK: RAF (tek raf = tek harf, harf çarkı, raf cetveli)
  // ==========================================================================
  const LIBRARY_CHUNK = 80;
  const LIBRARY_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');
  let _libraryIndex = null;
  let _libraryObserver = null;
  let _libraryWheelTimer = null;

  function getLibraryIndex() {
    if (!_libraryIndex) _libraryIndex = buildLibraryIndex(getFilteredDirectoryWords());
    return _libraryIndex;
  }

  function libraryShelfWords() {
    const idx = getLibraryIndex();
    return (STATE.library.letter && idx.byLetter[STATE.library.letter]) || [];
  }

  function libraryShelfName(L) {
    return L === '#' ? '# Rafı' : `${L} Rafı`;
  }

  function libraryBookHtml(w) {
    const ud = STATE.userData;
    let cls = `lib-book ${spineToneClass(w.cefr)}`;
    if (ud.learned.has(w.id)) cls += ' is-learned';
    if (ud.review.has(w.id)) cls += ' is-review';
    if (ud.starred.has(w.id)) cls += ' is-starred';
    const label = `${w.en}${w.cefr ? ' — ' + w.cefr : ''}`;
    return `<button type="button" class="${cls}" data-id="${w.id}" style="height:${spineHeightPx(w)}px" aria-label="${escapeHtml(label)}"><span class="lib-spine-text">${escapeHtml(spineLabel(w.en))}</span></button>`;
  }

  function libraryBooksSliceHtml(words, from, to) {
    let html = '';
    for (let i = from; i < to; i++) html += libraryBookHtml(words[i]);
    return html;
  }

  function libraryShelfInnerHtml(words) {
    if (!words.length) {
      return `<div class="lib-empty"><p>Bu filtrelerle rafta kitap yok</p><button type="button" class="lib-empty-btn" onclick="window.APP.clearDirectoryFilters()">Filtreleri temizle</button></div>`;
    }
    const sentinel = STATE.library.rendered < words.length ? '<span class="lib-sentinel" aria-hidden="true"></span>' : '';
    return libraryBooksSliceHtml(words, 0, STATE.library.rendered) + sentinel;
  }

  function libraryRulerHtml(words) {
    return shelfRulerGroups(words)
      .map(g => `<button type="button" class="lib-ruler-g" data-index="${g.index}">${escapeHtml(g.label)}</button>`)
      .join('');
  }

  function libraryWheelHtml() {
    const idx = getLibraryIndex();
    return LIBRARY_ALPHABET.map(L => {
      const active = L === STATE.library.letter;
      const empty = !idx.byLetter[L];
      return `<button type="button" role="tab" class="lib-wheel-l${active ? ' is-active' : ''}${empty ? ' is-empty' : ''}" data-letter="${L}" aria-selected="${active}" tabindex="${active ? 0 : -1}"${empty ? ' aria-disabled="true"' : ''} aria-label="${L === '#' ? 'Diğer' : L} rafı">${L}</button>`;
    }).join('');
  }

  function libraryFilterLabelText() {
    return typeof libraryFilterSummary === 'function' ? libraryFilterSummary() : 'Tüm kütüphaneler · Tüm düzeyler';
  }

  function renderDirectoryView() {
    const container = document.getElementById('view-directory');
    if (!container) return;

    _libraryIndex = null; // filtreler/modül/kullanıcı verisi değişmiş olabilir
    const idx = getLibraryIndex();
    const lib = STATE.library;
    if (!lib.letter || !idx.byLetter[lib.letter]) {
      lib.letter = idx.letters[0] || null;
      lib.rendered = 0;
    }
    const words = libraryShelfWords();
    lib.rendered = Math.min(words.length, Math.max(LIBRARY_CHUNK, lib.rendered));
    const L = lib.letter;

    container.innerHTML = `
      <div class="lib">
        <div class="lib-head">
          <div>
            <div class="lib-kicker">KELİME KÜTÜPHANESİ</div>
            <h2 class="lib-title" id="lib-title">${L ? libraryShelfName(L) : 'Boş Raf'}</h2>
          </div>
          <button type="button" class="lib-icon-btn" id="lib-search-btn" aria-label="Kelime ara" data-lib-action="search">${ICONS.search}</button>
        </div>
        <div class="lib-meta">
          <button type="button" class="lib-label" id="lib-filter-label" data-lib-action="filters" aria-label="Filtreler: ${escapeHtml(libraryFilterLabelText())}">
            <span class="lib-label-text">${escapeHtml(libraryFilterLabelText())}</span><span aria-hidden="true">▾</span>
          </button>
          <span class="lib-count" id="lib-count">${words.length.toLocaleString('tr-TR')} KİTAP</span>
        </div>
        <div class="lib-shelf-wrap">
          <div class="lib-shelf" id="lib-shelf" role="group" aria-label="${L ? libraryShelfName(L) : 'Raf'}">${libraryShelfInnerHtml(words)}</div>
          <div class="lib-board" aria-hidden="true"></div>
        </div>
        <div class="lib-ruler" id="lib-ruler" aria-label="Raf içinde atla">${libraryRulerHtml(words)}</div>
        <div class="lib-wheel-wrap">
          <div class="lib-wheel" id="lib-wheel" role="tablist" aria-label="Harfler">${libraryWheelHtml()}</div>
        </div>
      </div>
      ${typeof libraryOverlaysHtml === 'function' ? libraryOverlaysHtml() : ''}
    `;

    container.onclick = libraryClickHandler;
    container.onkeydown = libraryKeyHandler;
    bindLibraryShelf();
    bindLibraryBookGestures();
    bindLibrarySearchInput();
    centerLibraryWheel(false);
  }

  // Raf, cetvel, başlık, sayaç ve çark durumunu yerinde günceller; hedefler yoksa tam çizim
  function refreshLibraryShelf() {
    const shelf = document.getElementById('lib-shelf');
    const ruler = document.getElementById('lib-ruler');
    const title = document.getElementById('lib-title');
    const count = document.getElementById('lib-count');
    const wheel = document.getElementById('lib-wheel');
    if (!shelf || !ruler || !title || !count || !wheel) { renderDirectoryView(); return; }
    const words = libraryShelfWords();
    const L = STATE.library.letter;
    title.textContent = libraryShelfName(L);
    count.textContent = `${words.length.toLocaleString('tr-TR')} KİTAP`;
    shelf.setAttribute('aria-label', libraryShelfName(L));
    shelf.innerHTML = libraryShelfInnerHtml(words);
    shelf.scrollLeft = 0;
    ruler.innerHTML = libraryRulerHtml(words);
    wheel.querySelectorAll('.lib-wheel-l').forEach(b => {
      const on = b.getAttribute('data-letter') === L;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    bindLibraryShelf();
  }

  function selectLibraryLetter(letter) {
    const idx = getLibraryIndex();
    if (!idx.byLetter[letter]) return;
    STATE.library.letter = letter;
    STATE.library.rendered = Math.min(LIBRARY_CHUNK, idx.byLetter[letter].length);
    refreshLibraryShelf();
    centerLibraryWheel(true);
    announceStatus(`${letter === '#' ? 'Diğer' : letter} rafı, ${idx.byLetter[letter].length} kitap`);
  }

  function appendLibraryBooks() {
    const words = libraryShelfWords();
    const from = STATE.library.rendered;
    if (from >= words.length) return;
    const to = Math.min(words.length, from + LIBRARY_CHUNK);
    STATE.library.rendered = to;
    const shelf = document.getElementById('lib-shelf');
    if (!shelf) return;
    const sentinel = shelf.querySelector('.lib-sentinel');
    if (sentinel) sentinel.remove();
    shelf.insertAdjacentHTML('beforeend', libraryBooksSliceHtml(words, from, to) + (to < words.length ? '<span class="lib-sentinel" aria-hidden="true"></span>' : ''));
    bindLibraryShelf();
  }

  function jumpLibraryRuler(index) {
    const words = libraryShelfWords();
    const target = words[index];
    if (!target) return;
    while (STATE.library.rendered <= index) appendLibraryBooks();
    const shelf = document.getElementById('lib-shelf');
    const el = shelf && shelf.querySelector(`.lib-book[data-id="${target.id}"]`);
    if (el) el.scrollIntoView({ inline: 'start', block: 'nearest', behavior: libraryReducedMotion() ? 'auto' : 'smooth' });
  }

  function libraryReducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  // Sona yaklaşınca sıradaki 80 kitabı ekle; IntersectionObserver yoksa kaydırma olayı
  function bindLibraryShelf() {
    const shelf = document.getElementById('lib-shelf');
    if (!shelf) return;
    if (_libraryObserver) { _libraryObserver.disconnect(); _libraryObserver = null; }
    const sentinel = shelf.querySelector('.lib-sentinel');
    if (!sentinel) return;
    if (typeof IntersectionObserver !== 'undefined') {
      _libraryObserver = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) appendLibraryBooks();
      }, { root: shelf, rootMargin: '0px 400px 0px 0px' });
      _libraryObserver.observe(sentinel);
    } else if (!shelf._libScrollBound) {
      shelf._libScrollBound = true;
      shelf.addEventListener('scroll', () => {
        if (shelf.scrollLeft + shelf.clientWidth > shelf.scrollWidth - 400) appendLibraryBooks();
      }, { passive: true });
    }
  }

  function centerLibraryWheel(smooth) {
    const wheel = document.getElementById('lib-wheel');
    const active = wheel && wheel.querySelector('.lib-wheel-l.is-active');
    if (!active || typeof wheel.scrollTo !== 'function') return;
    wheel._libProgrammatic = true;
    const left = active.offsetLeft - (wheel.clientWidth - active.offsetWidth) / 2;
    wheel.scrollTo({ left, behavior: smooth && !libraryReducedMotion() ? 'smooth' : 'auto' });
    clearTimeout(wheel._libProgTimer);
    wheel._libProgTimer = setTimeout(() => { wheel._libProgrammatic = false; }, 400);
    if (!wheel._libScrollBound) {
      wheel._libScrollBound = true;
      wheel.addEventListener('scroll', onLibraryWheelScroll, { passive: true });
    }
  }

  // Çark parmakla çevrilip durunca ortadaki dolu harf seçilir
  function onLibraryWheelScroll() {
    const wheel = document.getElementById('lib-wheel');
    if (!wheel || wheel._libProgrammatic) return;
    clearTimeout(_libraryWheelTimer);
    _libraryWheelTimer = setTimeout(() => {
      const mid = wheel.scrollLeft + wheel.clientWidth / 2;
      let best = null, bestDist = Infinity;
      wheel.querySelectorAll('.lib-wheel-l:not(.is-empty)').forEach(b => {
        const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - mid);
        if (d < bestDist) { bestDist = d; best = b; }
      });
      const L = best && best.getAttribute('data-letter');
      if (L && L !== STATE.library.letter) selectLibraryLetter(L);
      else centerLibraryWheel(true);
    }, 120);
  }

  function libraryClickHandler(e) {
    const t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#lib-book-layer')) {
      if (t.closest('[data-lib-close]')) { closeLibraryBook(); return; }
      const syn = t.closest('.lib-syn');
      if (syn) { searchDirectory(syn.getAttribute('data-term')); return; }
      const act = t.closest('[data-act]');
      if (act && !act.disabled) libraryBookAction(act.getAttribute('data-act'));
      return;
    }
    const book = t.closest('.lib-book');
    if (book) {
      if (window.APP && typeof window.APP.openLibraryBook === 'function') window.APP.openLibraryBook(parseInt(book.getAttribute('data-id'), 10));
      return;
    }
    const letter = t.closest('.lib-wheel-l');
    if (letter) {
      if (!letter.classList.contains('is-empty')) selectLibraryLetter(letter.getAttribute('data-letter'));
      return;
    }
    const g = t.closest('.lib-ruler-g');
    if (g) { jumpLibraryRuler(parseInt(g.getAttribute('data-index'), 10)); return; }
    const item = t.closest('.lib-suggest-item');
    if (item) { pickLibrarySuggestion(item.getAttribute('data-id')); return; }
    const act = t.closest('[data-lib-action]');
    const fn = act && {
      search: () => openLibrarySearch(''),
      'search-close': () => closeLibrarySearch(),
      filters: () => { if (typeof openLibraryFilters === 'function') openLibraryFilters(); }
    }[act.getAttribute('data-lib-action')];
    if (fn) fn();
  }

  function libraryKeyHandler(e) {
    const t = e.target;
    if (!t || !t.closest) return;
    if (STATE.library.bookId != null && t.closest('#lib-book-layer')) {
      if (e.key === 'Escape') { e.preventDefault(); closeLibraryBook(); }
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !t.closest('input, textarea')) {
        e.preventDefault(); turnLibraryPage(e.key === 'ArrowRight' ? 1 : -1);
      }
      return;
    }
    if (!t.closest('.lib-wheel')) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const letters = getLibraryIndex().letters;
    const i = letters.indexOf(STATE.library.letter);
    const next = letters[i + (e.key === 'ArrowRight' ? 1 : -1)];
    if (next) {
      selectLibraryLetter(next);
      const btn = document.querySelector(`.lib-wheel-l[data-letter="${next}"]`);
      if (btn) btn.focus();
    }
  }

  // Durum değişince ilgili sırtın işaretlerini yerinde güncelle (raf kaydırma konumu korunur)
  function syncLibrarySpine(wordId) {
    const shelf = document.getElementById('lib-shelf');
    const el = shelf && shelf.querySelector(`.lib-book[data-id="${wordId}"]`);
    if (STATE.library.bookId === wordId) {
      STATE.library.dirty = true;
      refreshLibraryBook();
    }
    if (!el) return;
    const ud = STATE.userData;
    el.classList.toggle('is-learned', ud.learned.has(wordId));
    el.classList.toggle('is-review', ud.review.has(wordId));
    el.classList.toggle('is-starred', ud.starred.has(wordId));
  }

  // ==========================================================================
  // KİTAPLIK: KİTAP (çift sayfa)
  // ==========================================================================
  let _libraryBookReturnFocus = null;

  function libraryWordById(id) {
    return WORDS_DATA.find(w => w.id === id) || null;
  }

  function librarySetsHtml(w) {
    const sets = [];
    if (isMaarifWord(w)) sets.push('MAARİF');
    if (isOxfordWord(w)) sets.push('OXFORD');
    if (isYDSWord(w)) sets.push('YDS');
    return sets.length ? `<div class="lib-sets">${sets.map(s => `<span>${s}</span>`).join('')}</div>` : '';
  }

  function libraryBookLayerHtml() {
    const w = libraryWordById(STATE.library.bookId);
    if (!w) return '';
    const ud = STATE.userData;
    const learned = ud.learned.has(w.id), review = ud.review.has(w.id), starred = ud.starred.has(w.id);
    const posLabel = w.pos ? (POS_LABELS[w.pos] || String(w.pos).toUpperCase()) : '';
    const kicker = [w.cefr, posLabel].filter(Boolean).join(' · ');
    const ipa = String(w.phonetic || '').trim();
    const prep = extractPreposition(w);
    const descLine = [w.desc, w.cat].filter(Boolean).join(' • ');
    const syns = String(getWordSynonym(w) || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
    const example = (STATE.activeModule === 'yds' && w.ydsExample) ? w.ydsExample : w.example;
    const exampleText = example ? String(example).replace(/^["“”]|["“”]$/g, '') : '';
    const shelf = libraryShelfWords();
    const pos = shelf.findIndex(x => x.id === w.id);
    const tool = (act, icon, label, pressed) =>
      `<button type="button" class="lib-tool${pressed ? ' is-on' : ''}" data-act="${act}"${pressed === undefined ? '' : ` aria-pressed="${!!pressed}"`}>${icon}<span>${label}</span></button>`;

    return `
      <div class="lib-book-layer" id="lib-book-layer">
        <div class="lib-book-backdrop" data-lib-close></div>
        <div class="lib-spread" id="lib-spread" role="dialog" aria-modal="true" aria-labelledby="lib-book-word" tabindex="-1">
          <div class="lib-page lib-page-l">
            ${kicker ? `<div class="lib-page-kicker">${escapeHtml(kicker)}</div>` : ''}
            <h3 class="lib-book-word" id="lib-book-word">${escapeHtml(w.en)}</h3>
            ${w.alt ? `<div class="lib-alt">(${escapeHtml(w.alt)})</div>` : ''}
            ${ipa ? `<div class="lib-ipa">${escapeHtml(ipa)}</div>` : ''}
            <div class="lib-book-actions">
              <button type="button" class="lib-round" data-act="speak" aria-label="Dinle: ${escapeHtml(w.en)}">${ICONS.speaker}</button>
              <button type="button" class="lib-round lib-fav${starred ? ' is-on' : ''}" data-act="star" aria-pressed="${starred}" aria-label="${starred ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${starred ? ICONS.starFilled : ICONS.starOutline}</button>
            </div>
            ${librarySetsHtml(w)}
            <div class="lib-tools">
              ${tool('learned', ICONS.check, learned ? 'Öğrendim' : 'Öğren', learned)}
              ${tool('review', ICONS.repeat, review ? 'Tekrarda' : 'Tekrar', review)}
              ${tool('coach', ICONS.mic, 'Telaffuz')}
              ${tool('context', renderIcon('sparkles', 16), 'Bağlam')}
            </div>
          </div>
          <div class="lib-page lib-page-r">
            ${w.tr ? `<div class="lib-sec">Anlamı</div><p class="lib-tr">${escapeHtml(w.tr)}</p>` : ''}
            ${prep ? `<p class="lib-note">Edat ipucu: <b>${escapeHtml(prep)}</b></p>` : ''}
            ${descLine ? `<p class="lib-note">${escapeHtml(descLine)}</p>` : ''}
            ${syns.length ? `<div class="lib-sec">Eş anlam</div><div class="lib-syns">${syns.map(s => `<button type="button" class="lib-syn" data-term="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}</div>` : ''}
            ${w.definition ? `<div class="lib-sec">Tanım</div><p class="lib-def">${escapeHtml(w.definition)}</p>` : ''}
            ${exampleText ? `<div class="lib-sec">Örnek</div><p class="lib-ex">“${escapeHtml(exampleText)}”</p>` : ''}
          </div>
          <div class="lib-book-nav">
            <button type="button" class="lib-round" data-act="prev" aria-label="Önceki kitap"${pos <= 0 ? ' disabled' : ''}>‹</button>
            ${pos >= 0 ? `<span class="lib-book-pos">${(pos + 1).toLocaleString('tr-TR')} / ${shelf.length.toLocaleString('tr-TR')}</span>` : ''}
            <button type="button" class="lib-round" data-act="next" aria-label="Sonraki kitap"${pos < 0 || pos >= shelf.length - 1 ? ' disabled' : ''}>›</button>
            <button type="button" class="lib-round lib-close" data-lib-close aria-label="Kitabı kapat">${renderIcon('cross', 18)}</button>
          </div>
        </div>
      </div>
    `;
  }

  // Kitap katmanını yerinde (yeniden) çiz; raf DOM'u yoksa tam çizim
  function refreshLibraryBook() {
    const container = document.getElementById('view-directory');
    const shelf = document.getElementById('lib-shelf');
    if (!container || !shelf) { renderDirectoryView(); return; }
    const old = document.getElementById('lib-book-layer');
    if (old) old.remove();
    if (STATE.library.bookId == null) return;
    container.insertAdjacentHTML('beforeend', libraryBookLayerHtml());
    bindLibraryBookGestures();
    const spread = document.getElementById('lib-spread');
    if (spread) spread.focus({ preventScroll: true });
  }

  function openLibraryBook(id) {
    id = parseInt(id, 10);
    const w = libraryWordById(id);
    if (!w) return;
    const wasOpen = STATE.library.bookId != null;
    const idx = getLibraryIndex();
    const L = libraryLetterOf(w);
    const shelf = idx.byLetter[L] || [];
    const i = shelf.findIndex(x => x.id === id);
    if (i >= 0) {
      if (STATE.library.letter !== L) {
        STATE.library.letter = L;
        STATE.library.rendered = Math.min(shelf.length, Math.max(LIBRARY_CHUNK, Math.ceil((i + 1) / LIBRARY_CHUNK) * LIBRARY_CHUNK));
        refreshLibraryShelf();
        centerLibraryWheel(false);
      } else {
        while (STATE.library.rendered <= i) appendLibraryBooks();
      }
    }
    if (!wasOpen) {
      _libraryBookReturnFocus = id;
      try { if (window.history && history.pushState) history.pushState({ libBook: true }, '', location.hash || '#directory'); } catch (e) { /* geri tuşu desteği isteğe bağlı */ }
    }
    STATE.library.bookId = id;
    refreshLibraryBook();
    const spine = document.querySelector(`.lib-book[data-id="${id}"]`);
    if (spine && spine.scrollIntoView) spine.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'auto' });
  }

  function closeLibraryBook(fromHistory) {
    if (STATE.library.bookId == null) return;
    const returnId = _libraryBookReturnFocus;
    STATE.library.bookId = null;
    if (STATE.library.dirty) {
      STATE.library.dirty = false;
      renderDirectoryView(); // durum filtresine artık uymayan kitap raftan düşer
    } else {
      refreshLibraryBook();
    }
    if (!fromHistory) {
      try { if (history.state && history.state.libBook && history.back) history.back(); } catch (e) { /* yok say */ }
    }
    const spine = returnId != null && document.querySelector(`.lib-book[data-id="${returnId}"]`);
    if (spine && spine.focus) spine.focus({ preventScroll: true });
  }

  function turnLibraryPage(delta) {
    const shelf = libraryShelfWords();
    const i = shelf.findIndex(x => x.id === STATE.library.bookId);
    if (i < 0) return;
    const next = shelf[i + delta];
    if (!next) return; // rafın başı/sonu: sarmaz
    _libraryBookReturnFocus = next.id;
    openLibraryBook(next.id);
  }

  function libraryBookAction(act) {
    const w = libraryWordById(STATE.library.bookId);
    if (!w) return;
    if (act === 'speak') speakWord(w.en);
    else if (act === 'star') toggleStarred(w.id);
    else if (act === 'learned') toggleLearned(w.id);
    else if (act === 'review') toggleReview(w.id);
    else if (act === 'coach') openSpeechCoach(w.en);
    else if (act === 'context') openClassifierForWord(w.en);
    else if (act === 'prev') turnLibraryPage(-1);
    else if (act === 'next') turnLibraryPage(1);
  }

  // Yatay sürükleme = sayfa çevir; aşağı sürükleme = kapat (sayfa metni kaydırılmışken değil).
  // Dokunmada touch olayları kullanılır: tarayıcı dikey kaydırmayı üstlenince pointer olayları iptal olur.
  function libraryGestureEnd(start, x, y, target) {
    const dx = x - start.x, dy = y - start.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { turnLibraryPage(dx < 0 ? 1 : -1); return; }
    const page = target && target.closest && target.closest('.lib-page');
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) && start.scrollTop === 0 && (!page || page.scrollTop === 0)) closeLibraryBook();
  }

  function bindLibraryBookGestures() {
    const spread = document.getElementById('lib-spread');
    if (!spread || !spread.addEventListener) return;
    let start = null;
    const pageTop = (t) => { const p = t && t.closest && t.closest('.lib-page'); return p ? p.scrollTop : 0; };
    spread.addEventListener('touchstart', (e) => {
      const p = e.changedTouches[0];
      start = { x: p.clientX, y: p.clientY, scrollTop: pageTop(e.target) };
    }, { passive: true });
    spread.addEventListener('touchend', (e) => {
      if (!start) return;
      const p = e.changedTouches[0];
      libraryGestureEnd(start, p.clientX, p.clientY, e.target);
      start = null;
    }, { passive: true });
    spread.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      start = { x: e.clientX, y: e.clientY, scrollTop: pageTop(e.target) };
    });
    spread.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'touch' || !start) return;
      libraryGestureEnd(start, e.clientX, e.clientY, e.target);
      start = null;
    });
  }

  function libraryOverlaysHtml() {
    return (STATE.library.searchOpen ? librarySearchHtml() : '') +
      (STATE.library.bookId != null ? libraryBookLayerHtml() : '');
  }

  window.addEventListener('popstate', () => {
    if (STATE.library.bookId != null) closeLibraryBook(true);
  });

  // ==========================================================================
  // KİTAPLIK: ARAMA (rafı süzmez; öneri seçilince kitaba götürür)
  // ==========================================================================
  let _librarySearchTimer = null;

  function librarySuggestionsHtml() {
    const q = String(STATE.directoryFilters.search || '').trim();
    if (!q) return '<p class="lib-suggest-hint">İngilizce kelimeyi, Türkçe anlamını ya da eş anlamını yaz.</p>';
    const list = librarySuggest(q, getFilteredDirectoryWords(), WORDS_DATA);
    if (!list.length) return '<p class="lib-suggest-hint">Eşleşen kelime yok</p>';
    return list.map(({ word: w, outsideFilter }) => `
      <button type="button" role="option" class="lib-suggest-item${outsideFilter ? ' is-outside' : ''}" data-id="${w.id}">
        <span class="lib-s-en">${escapeHtml(w.en)}</span>
        ${w.tr ? `<span class="lib-s-tr">${escapeHtml(w.tr)}</span>` : ''}
        ${outsideFilter ? '<span class="lib-s-out">filtre dışında</span>' : ''}
      </button>`).join('');
  }

  function librarySearchHtml() {
    return `
      <div class="lib-search-layer" id="lib-search">
        <div class="lib-search-backdrop" data-lib-action="search-close"></div>
        <div class="lib-search-sheet" role="search">
          <div class="lib-search-bar">
            <span class="lib-search-icon" aria-hidden="true">${ICONS.search}</span>
            <input type="search" id="lib-search-input" class="lib-search-input" placeholder="İngilizce, Türkçe veya eş anlam ara…"
                   value="${escapeHtml(STATE.directoryFilters.search || '')}" autocomplete="off" spellcheck="false"
                   aria-label="Kelime ara" aria-controls="lib-suggest" aria-autocomplete="list">
            <button type="button" class="lib-round" data-lib-action="search-close" aria-label="Aramayı kapat">${renderIcon('cross', 18)}</button>
          </div>
          <div class="lib-suggest" id="lib-suggest" role="listbox" aria-label="Öneriler">${librarySuggestionsHtml()}</div>
        </div>
      </div>
    `;
  }

  function renderLibrarySuggestions() {
    const box = document.getElementById('lib-suggest');
    if (!box) { renderDirectoryView(); return; }
    box.innerHTML = librarySuggestionsHtml();
  }

  function bindLibrarySearchInput() {
    const input = document.getElementById('lib-search-input');
    if (!input || input._libBound || !input.addEventListener) return;
    input._libBound = true;
    input.addEventListener('input', () => {
      STATE.directoryFilters.search = input.value;
      clearTimeout(_librarySearchTimer);
      _librarySearchTimer = setTimeout(renderLibrarySuggestions, 250);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeLibrarySearch(); return; }
      if (e.key === 'ArrowDown') {
        const first = document.querySelector('.lib-suggest-item');
        if (first) { e.preventDefault(); first.focus(); }
        return;
      }
      if (e.key !== 'Enter') return;
      e.preventDefault();
      STATE.directoryFilters.search = input.value;
      const q = input.value.trim().toLowerCase();
      const list = librarySuggest(q, getFilteredDirectoryWords(), WORDS_DATA);
      const hit = list.find(s => String(s.word.en).toLowerCase() === q) || list[0];
      if (hit) pickLibrarySuggestion(hit.word.id);
    });
  }

  function openLibrarySearch(term = '') {
    if (STATE.library.bookId != null) closeLibraryBook(); // arama kitabın arkasında kalmasın
    STATE.library.searchOpen = true;
    STATE.directoryFilters.search = String(term || '');
    const container = document.getElementById('view-directory');
    const shelf = document.getElementById('lib-shelf');
    if (!container || !shelf) { renderDirectoryView(); return; }
    const old = document.getElementById('lib-search');
    if (old) old.remove();
    container.insertAdjacentHTML('beforeend', librarySearchHtml());
    bindLibrarySearchInput();
    const input = document.getElementById('lib-search-input');
    if (input) { input.focus(); const n = input.value.length; try { input.setSelectionRange(n, n); } catch (e) { /* type=search */ } }
  }

  function closeLibrarySearch(silent) {
    STATE.library.searchOpen = false;
    STATE.directoryFilters.search = '';
    clearTimeout(_librarySearchTimer);
    const layer = document.getElementById('lib-search');
    if (layer) layer.remove();
    else if (!document.getElementById('lib-shelf')) renderDirectoryView();
    if (!silent) { const btn = document.getElementById('lib-search-btn'); if (btn) btn.focus(); }
  }

  function pickLibrarySuggestion(id) {
    id = parseInt(id, 10);
    if (!libraryWordById(id)) return;
    closeLibrarySearch(true);
    const inFilter = getFilteredDirectoryWords().some(w => w.id === id);
    if (!inFilter) {
      const f = STATE.directoryFilters;
      Object.assign(f, { dataset: 'all', theme: 'all', cefr: 'all', status: 'all', pos: 'all' });
      renderDirectoryView(); // indeks yeniden kurulur, raf etiketi "Tümü"nü gösterir
    }
    openLibraryBook(id);
  }

  // Eş anlam çipleri ve diğer ekranlar: tam eşleşen kelime varsa doğrudan kitabını aç
  function searchDirectory(term) {
    const q = String(term || '').trim();
    const exact = q && WORDS_DATA.find(w => String(w.en).toLowerCase() === q.toLowerCase());
    if (exact) pickLibrarySuggestion(exact.id);
    else openLibrarySearch(q);
  }

  // ==========================================================================
  // VIEW 5: İSTATİSTİKLER & ANALİZ (Maarif vs YDS vs Oxford)
  // ==========================================================================
  function renderStatsView() {
    const container = document.getElementById('view-stats');
    if (!container) return;

    const maarifWords = getActiveGradePool();
    const maarifLearned = maarifWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const maarifPct = Math.round((maarifLearned / (maarifWords.length || 1)) * 100);

    const ydsWords = WORDS_DATA.filter(isYDSWord);
    const ydsLearned = ydsWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const ydsPct = Math.round((ydsLearned / (ydsWords.length || 1)) * 100);

    const oxfordWords = WORDS_DATA.filter(isOxfordWord);
    const oxfordLearned = oxfordWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const oxfordPct = Math.round((oxfordLearned / (oxfordWords.length || 1)) * 100);

    const quizStats = STATE.userData.stats;
    const quizAccuracy = quizStats.totalQuestions > 0 ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100) : 0;

    const srsStats = getSRSStats();
    const mistakeStats = getMistakeStats();
    const activeMistakesList = getActiveMistakeWords();

    // 1. Maarif 8 Themes breakdown
    let themesBreakdownHtml = '';
    const statGrade = getActiveGrade();
    const statUnits = (window.CURRICULUM_DATA && window.CURRICULUM_DATA[statGrade]) ? window.CURRICULUM_DATA[statGrade].units : [];
    for (const unit of statUnits) {
      const tWords = maarifWords.filter(w => (gradeWordMeta(w.id, statGrade) || {}).unitNum === unit.unitNum);
      const tLearned = tWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const tPct = Math.round((tLearned / (tWords.length || 1)) * 100);
      const tMeta = { code: unit.code, title: unit.title, titleTr: unit.titleTr };

      themesBreakdownHtml += `
        <div class="theme-stat-row">
          <div class="theme-stat-label">
            <div class="theme-stat-name">${tMeta.code}: ${tMeta.title}</div>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; color: var(--dp-color-ink-muted);">${tMeta.titleTr}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${tPct}%; background: var(--dp-color-accent);"></div>
          </div>
          <div style="font-family: var(--dp-typography-mono); font-size: 0.82rem; font-weight: 700; min-width: 96px; text-align: right;">
            ${tLearned} / ${tWords.length} (%${tPct})
          </div>
        </div>
      `;
    }

    // 2. YDS POS & Level Breakdown
    const ydsVerbs = ydsWords.filter(w => getWordPOS(w) === 'verb');
    const ydsNouns = ydsWords.filter(w => getWordPOS(w) === 'noun');
    const ydsAdjs = ydsWords.filter(w => getWordPOS(w) === 'adj_adv');
    const ydsB2 = ydsWords.filter(w => w.cefr === 'B2');
    const ydsC1 = ydsWords.filter(w => w.cefr === 'C1');

    const ydsItems = [
      { name: 'C1 İleri Akademik Kelimeler', words: ydsC1 },
      { name: 'B2 Orta-İleri Kelimeler', words: ydsB2 },
      { name: 'Akademik Fiiller (Verbs)', words: ydsVerbs },
      { name: 'Akademik İsimler (Nouns)', words: ydsNouns },
      { name: 'Sıfatlar & Zarflar', words: ydsAdjs }
    ];

    let ydsBreakdownHtml = '';
    ydsItems.forEach(item => {
      const learned = item.words.filter(w => STATE.userData.learned.has(w.id)).length;
      const pct = Math.round((learned / (item.words.length || 1)) * 100);
      ydsBreakdownHtml += `
        <div class="theme-stat-row">
          <div class="theme-stat-label">
            <div class="theme-stat-name">${item.name}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${pct}%; background: var(--dp-color-accent);"></div>
          </div>
          <div style="font-family: var(--dp-typography-mono); font-size: 0.82rem; font-weight: 700; min-width: 96px; text-align: right;">
            ${learned} / ${item.words.length} (%${pct})
          </div>
        </div>
      `;
    });

    // 3. Oxford CEFR breakdown
    const cefrLevels = [
      { level: 'A1', name: 'A1 Başlangıç (Beginner)' },
      { level: 'A2', name: 'A2 Temel (Elementary)' },
      { level: 'B1', name: 'B1 Eşik / Orta (Intermediate)' },
      { level: 'B2', name: 'B2 Orta-İleri (Upper Intermediate)' },
      { level: 'C1', name: 'C1 İleri (Advanced)' }
    ];

    let oxfordBreakdownHtml = '';
    cefrLevels.forEach(item => {
      const cWords = oxfordWords.filter(w => w.cefr === item.level);
      const cLearned = cWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const cPct = Math.round((cLearned / (cWords.length || 1)) * 100);

      oxfordBreakdownHtml += `
        <div class="theme-stat-row">
          <div class="theme-stat-label">
            <div class="theme-stat-name" style="color: var(--dp-color-emphasis); font-weight: 700;">CEFR ${item.level}</div>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; color: var(--dp-color-ink-muted);">${item.name}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${cPct}%; background: var(--dp-color-accent);"></div>
          </div>
          <div style="font-family: var(--dp-typography-mono); font-size: 0.82rem; font-weight: 700; min-width: 96px; text-align: right;">
            ${cLearned} / ${cWords.length} (%${cPct})
          </div>
        </div>
      `;
    });

    // Aktif Müfredat Verileri (Home'dan taşınan hedef kontrolü)
    const statSched = getMEBCalendarInfo().schedule;
    let activeCurriculumTitle = `MEB Müfredatı (${statGrade}. Sınıf)`;
    let activeFocusName = statSched ? `${statSched.unitCode}: ${statSched.unitTitleTr || statSched.unitTitle}` : 'Tüm Temalar';
    let activeWords = maarifWords;
    let activeLearned = maarifLearned;
    let activePct = maarifPct;

    if (STATE.activeModule === 'yds') {
      activeCurriculumTitle = 'YDS & YÖKDİL Akademik Kelime Havuzu';
      activeFocusName = 'B2 - C1 İleri Akademik Kelimeler';
      activeWords = ydsWords;
      activeLearned = ydsLearned;
      activePct = ydsPct;
    } else if (STATE.activeModule === 'oxford') {
      activeCurriculumTitle = 'Kelime Kütüphanesi Standartları';
      activeFocusName = 'A1 - C1 Düzey CEFR Kelimeleri';
      activeWords = oxfordWords;
      activeLearned = oxfordLearned;
      activePct = oxfordPct;
    } else if (STATE.activeModule === 'all') {
      activeCurriculumTitle = 'Tüm Kelime Kütüphanesi';
      activeFocusName = `${WORDS_DATA.length.toLocaleString('tr-TR')} Birleşik Kelime Arşivi`;
      activeWords = WORDS_DATA;
      activeLearned = STATE.userData.learned.size;
      activePct = Math.round((activeLearned / (WORDS_DATA.length || 1)) * 100);
    }

    container.innerHTML = `
      <!-- AKTİF HEDEF MÜFREDAT & KAZANIM İSTASYONU (Home'dan Taşınan Modül) -->
      <div class="stats-curriculum-station" style="border: var(--dp-border-rule) solid var(--dp-color-border); border-radius: var(--dp-radius-card); background: var(--dp-color-surface); padding: 24px; box-shadow: 0 4px 16px -2px rgba(23, 30, 25, 0.06); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 800; color: var(--dp-color-accent-ink); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.04em; display: flex; align-items: center; gap: 6px;">
              ${renderIcon('target', 15)} <span>[ AKTİF HEDEF MÜFREDAT KAZANIM İSTASYONU ]</span>
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em;">
              ${activeCurriculumTitle}
            </h2>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.82rem; color: var(--dp-color-ink-muted); margin-top: 4px;">
              Mevcut Odak: <strong style="color: var(--dp-color-ink);">${activeFocusName}</strong>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="ctrl-btn" onclick="window.APP.switchView('directory')" style="font-size: 0.78rem; padding: 6px 12px; background: var(--dp-color-ground); border: 1px solid var(--dp-color-border); border-radius: var(--dp-radius-nested); box-shadow: 0 4px 16px -2px rgba(23, 30, 25, 0.06); color: var(--dp-color-ink); display: inline-flex; align-items: center; gap: 6px;">
              ${renderIcon('book', 14)} <span>KELİME DİZİNİ</span>
            </button>
            <button class="ctrl-btn" onclick="window.APP.switchView('quiz')" style="font-size: 0.78rem; padding: 6px 12px; background: var(--dp-color-field-support); color: var(--dp-color-ink); border: 1px solid var(--dp-color-border); border-radius: var(--dp-radius-nested); box-shadow: 0 4px 16px -2px rgba(23, 30, 25, 0.06); display: inline-flex; align-items: center; gap: 6px;">
              ${renderIcon('zap', 14)} <span>KAZANIM TESTİ</span>
            </button>
          </div>
        </div>

        <div style="background: var(--dp-color-ground); border: 1px solid var(--dp-color-border); border-radius: var(--dp-radius-nested); padding: 16px; box-shadow: 0 4px 16px -2px rgba(23, 30, 25, 0.06);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <span style="font-family: var(--dp-typography-mono); font-size: 0.76rem; font-weight: 800; text-transform: uppercase;">
              MÜFREDAT TAMAMLANMA ORANI
            </span>
            <span style="font-family: var(--dp-typography-mono); font-size: 0.95rem; font-weight: 900; color: var(--dp-color-accent-ink);">
              %${activePct} (${activeLearned} / ${activeWords.length} KELİME)
            </span>
          </div>
          <div style="height: 16px; border: 1px solid var(--dp-color-border); border-radius: var(--dp-radius-pill); background: var(--dp-color-surface); overflow: hidden;">
            <div style="height: 100%; width: ${activePct}%; background: var(--dp-color-field); border-radius: var(--dp-radius-pill); transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);"></div>
          </div>
        </div>
      </div>

      <div class="stats-summary-grid">
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${maarifLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${maarifWords.length}</span></div>
          <div class="metric-title">MEB ${statGrade}. SINIF (%${maarifPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--dp-color-accent-ink);">${ydsLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${ydsWords.length}</span></div>
          <div class="metric-title">YDS &amp; YÖKDİL AKADEMİK (%${ydsPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${oxfordLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${oxfordWords.length}</span></div>
          <div class="metric-title">KELİME KÜTÜPHANESİ (%${oxfordPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--dp-color-emphasis);">${quizAccuracy}%</div>
          <div class="metric-title">TEST DOĞRULUĞU (MAKS SERİ: ${quizStats.bestStreak})</div>
        </div>
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em;">
          YDS &amp; YÖKDİL AKADEMİK SEVİYE VE TÜR DAĞILIMI
        </h3>
        ${ydsBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em;">
          MEB ${statGrade}. SINIF MÜFREDATI (${statUnits.length} TEMA/ÜNİTE İLERLEMESİ)
        </h3>
        ${themesBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em;">
          KELİME KÜTÜPHANESİ (CEFR SEVİYE DAĞILIMI)
        </h3>
        ${oxfordBreakdownHtml}
      </div>

      <!-- 4. SM-2 ARALIKLI TEKRAR & BİLİŞSEL HAFIZA MATRİSİ -->
      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em; display:flex; align-items:center; gap:8px;">
            ${renderIcon('brain', 16)} <span>SM-2 BİLİŞSEL HAFIZA &amp; KALICILIK MATRİSİ</span>
          </h3>
          <span class="pedagogy-station-badge">HAFIZA GÜCÜ: %${srsStats.retentionRate}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--dp-color-ink-muted); margin-bottom:16px;">
          Kelimelerin kısa vadeli bellekten uzun vadeli kalıcı belleğe geçiş aşamaları:
        </p>
        
        <div class="srs-retention-tier-grid">
          <div class="srs-tier-card tier-new">
            <div class="srs-tier-top">
              <span class="srs-tier-name" style="display:inline-flex; align-items:center; gap:6px;">${renderIcon('circleDot', 13)} Yeni / Henüz Başlanmadı</span>
              <strong class="srs-tier-num">${srsStats.newCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.newCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">0 tekrar (havuzda bekliyor)</span>
          </div>

          <div class="srs-tier-card tier-learning">
            <div class="srs-tier-top">
              <span class="srs-tier-name" style="display:inline-flex; align-items:center; gap:6px;">${renderIcon('zap', 13)} Öğreniliyor (1–3 Gün)</span>
              <strong class="srs-tier-num">${srsStats.learningCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.learningCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">Kısa vadeli hafıza aşamasında</span>
          </div>

          <div class="srs-tier-card tier-reviewing">
            <div class="srs-tier-top">
              <span class="srs-tier-name" style="display:inline-flex; align-items:center; gap:6px;">${renderIcon('sparkles', 13)} Pekiştiriliyor (4–14 Gün)</span>
              <strong class="srs-tier-num">${srsStats.reviewingCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.reviewingCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">Orta vadeli bellek aktarımı</span>
          </div>

          <div class="srs-tier-card tier-mastered">
            <div class="srs-tier-top">
              <span class="srs-tier-name" style="display:inline-flex; align-items:center; gap:6px;">${renderIcon('check', 13)} Kalıcı Bellek (15+ Gün)</span>
              <strong class="srs-tier-num">${srsStats.masteredCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.masteredCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">Kalıcı olarak zihne yerleşti</span>
          </div>
        </div>
      </div>

      <!-- 5. AKILLI HATA DEFTERİ & KURTARMA TELEMETRİSİ -->
      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em; display:flex; align-items:center; gap:8px;">
            ${renderIcon('alert', 16)} <span>AKILLI HATA DEFTERİ &amp; ZAYIF NOKTALAR</span>
          </h3>
          <span class="pedagogy-station-badge mistake">KURTARMA BAŞARISI: %${mistakeStats.recoveryRate}</span>
        </div>

        <div class="stats-summary-grid" style="margin-bottom:16px;">
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem;">${mistakeStats.totalMistakeEvents}</div>
            <div class="metric-title">TOPLAM HATA OLAYI</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color: var(--dp-color-accent-ink);">${mistakeStats.activeMistakes}</div>
            <div class="metric-title">AKTİF BEKLEYEN ZAYIF NOKTA</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:#008744;">${mistakeStats.clearedMistakes}</div>
            <div class="metric-title">KURTARILAN / TEMİZLENEN</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color: var(--dp-color-accent-ink);">%${mistakeStats.recoveryRate}</div>
            <div class="metric-title">HATA KURTARMA ORANI</div>
          </div>
        </div>

        ${activeMistakesList.length === 0 ? `
          <div style="padding: 24px 12px; color: var(--dp-color-ink-muted); font-size: 0.88rem; text-align: center;">
            [ 0 HATA ] Hata Defteriniz tertemiz! Yanıldığınız kelimeler otomatik olarak burada hedeflenir.
          </div>
        ` : `
          <div class="mistake-table-container">
            <table class="dash-terminal-table" style="width:100%; font-size:0.85rem;">
              <thead>
                <tr>
                  <th>KELİME</th>
                  <th>ANLAMI</th>
                  <th>HATA SAYISI</th>
                  <th>SON HATA</th>
                  <th>İŞLEM</th>
                </tr>
              </thead>
              <tbody>
                ${activeMistakesList.slice(0, 8).map(w => {
                  const m = STATE.userData.mistakes[w.id];
                  return `
                    <tr>
                      <td><strong>${w.en}</strong></td>
                      <td>${w.tr || '-'}</td>
                      <td><span class="pedagogy-badge mistake-badge">${m ? m.wrongCount : 1}x Hata</span></td>
                      <td>${m ? m.lastWrongDate : '-'}</td>
                      <td>
                        <button type="button" class="ctrl-btn" style="padding:4px 8px; font-size:0.75rem;" onclick="window.APP.retestDebugWord('${w.en.replace(/'/g, "\\'")}')">
                          Test Et ↺
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- 6. SPEAKING & TELAFFUZ KOÇU TELEMETRİSİ -->
      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em; display:flex; align-items:center; gap:8px;">
            ${renderIcon('mic', 16)} <span>SPEAKING &amp; TELAFFUZ KOÇU TELEMETRİSİ</span>
          </h3>
          <span class="pedagogy-station-badge" style="border-color:var(--dp-color-emphasis); color:var(--dp-color-emphasis);">
            AKSAN: ${STATE.settings.accent || 'en-GB'}
          </span>
        </div>
        <p style="font-size:0.85rem; color:var(--dp-color-ink-muted); margin-bottom:16px;">
          Mikrofon destekli konuşma tanıma ve fonetik benzerlik testlerinin sonuçları:
        </p>

        <div class="stats-summary-grid">
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem;">${quizStats.speakingAttempts || 0}</div>
            <div class="metric-title">TOPLAM SPEAKING DENEMESİ</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:#008744;">${quizStats.speakingSuccesses || 0}</div>
            <div class="metric-title">BAŞARILI TELAFFUZ (≥%70)</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:var(--dp-color-emphasis);">
              %${quizStats.speakingAttempts > 0 ? Math.round(((quizStats.speakingSuccesses || 0) / quizStats.speakingAttempts) * 100) : 0}
            </div>
            <div class="metric-title">TELAFFUZ BAŞARI ORANI</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color: var(--dp-color-accent-ink);">
              ${isSpeechRecognitionSupported() ? 'AKTİF ✓' : 'DESTEKLENMİYOR ✕'}
            </div>
            <div class="metric-title">TARAYICI SES MOTORU</div>
          </div>
        </div>
      </div>

      <div class="glass-panel" style="padding: 20px; text-align: center;">
        <p style="color: var(--dp-color-ink-muted); font-size: 0.85rem; margin-bottom: 12px;">Tüm yerel ilerleme verilerini sıfırlamak ister misiniz?</p>
        <button class="ctrl-btn" style="border-color: var(--dp-color-error); margin: 0 auto;" onclick="window.APP.resetAllProgress()">
          İLERLEME VERİLERİNİ SIFIRLA
        </button>
      </div>
    `;
  }

  // ==========================================================================
  // TOP CONTEXT CANOPY ("İŞTE BURADASINIZ" HABER VERİCİ ÇİZGİSİ)
  // Mobil ve masaüstünde aktif modül (MEB/YDS/Oxford) ve istasyon oryantasyonu
  // ==========================================================================
  let canopyTimer = null;

  function updateContextCanopy(viewName, triggerExpand = false) {
    const mod = STATE.activeModule || 'maarif';
    const view = viewName || STATE.currentView || 'home';

    // Update Header Route Pill (Primary Route & Grade Indicator)
    const hrIcon = document.getElementById('header-route-icon');
    const hrLabel = document.getElementById('header-route-label');
    const hrPill = document.getElementById('header-route-pill-btn');
    if (hrIcon) {
      const iconKey = mod === 'maarif' ? 'school' : (mod === 'yds' ? 'target' : 'book');
      hrIcon.innerHTML = renderIcon(iconKey, 18, 'hrp-svg-icon');
      hrIcon.setAttribute('data-icon', iconKey);
    }
    if (hrLabel) {
      if (mod === 'maarif') {
        const gNum = STATE.selectedGrade || 5;
        hrLabel.textContent = `${gNum}. Sınıf MEB`;
      } else if (mod === 'yds') {
        hrLabel.textContent = 'YDS / YÖKDİL';
      } else if (mod === 'oxford') {
        hrLabel.textContent = 'Kütüphane';
      } else {
        hrLabel.textContent = 'Tüm Kütüphane';
      }
    }
    if (hrPill) hrPill.setAttribute('data-active-module', mod);

    // Safely update legacy canopy if element exists
    const canopy = document.getElementById('context-canopy');
    if (!canopy) return;

    const modBadges = {
      maarif: 'MEB',
      yds: 'YDS',
      oxford: 'KÜT',
      all: 'TÜM'
    };

    const modFullNames = {
      maarif: 'K-12 MEB Müfredatı',
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'Kelime Kütüphanesi',
      all: 'Tüm Kütüphane'
    };

    let modBadge = modBadges[mod] || 'MEB';
    let modFullName = modFullNames[mod] || 'MEB Müfredatı';

    if (mod === 'maarif') {
      const gNum = STATE.selectedGrade || 5;
      const gData = (typeof window !== 'undefined' && window.CURRICULUM_DATA && window.CURRICULUM_DATA[gNum]) || null;
      if (gData) {
        modBadge = gData.badge || `${gNum}. SINIF`;
        const sched = (typeof window !== 'undefined' && window.CURRICULUM_CLASSIFIER) ? (STATE.activeCurriculumWeek ? window.CURRICULUM_CLASSIFIER.getWeekByNumber(gNum, STATE.activeCurriculumWeek) : window.CURRICULUM_CLASSIFIER.getSchedule(gNum)) : null;
        const uTitle = sched ? sched.unitTitle : (gData.units[0]?.title || 'Müfredat');
        modFullName = `${gData.name} • ${uTitle}`;
      }
    }

    const viewTitles = {
      home: 'Kontrol Merkezi',
      daily: mod === 'yds' ? "Günün 20'si (Workout)" : (mod === 'maarif' ? "Müfredat Takibi" : "Günün Çalışması"),
      flashcard: 'Flashcard Kartları',
      quiz: mod === 'yds' ? 'YDS Cloze & Test' : (mod === 'maarif' ? 'Kazanım Değerlendirme' : 'Quiz & Sınav'),
      directory: 'Kelime Havuzu',
      stats: 'İlerleme & Analiz'
    };

    const badgeEl = document.getElementById('canopy-module-badge');
    const nameEl = document.getElementById('canopy-module-name');
    const viewEl = document.getElementById('canopy-view-name');

    if (badgeEl) badgeEl.textContent = modBadge;
    if (nameEl) nameEl.textContent = modFullName;
    if (viewEl) viewEl.textContent = viewTitles[view] || view;

    // Set theme class on canopy
    canopy.classList.remove('mod-maarif', 'mod-yds', 'mod-oxford', 'mod-all');
    canopy.classList.add(`mod-${mod}`);

    if (triggerExpand) {
      if (canopyTimer) clearTimeout(canopyTimer);
      canopy.classList.remove('canopy-docked');
      canopy.classList.add('canopy-expanded');

      canopyTimer = setTimeout(() => {
        canopy.classList.remove('canopy-expanded');
        canopy.classList.add('canopy-docked');
      }, 3200);
    }
  }

  // ==========================================================================
  // NAVIGATION & BREADCRUMB CONTROLLERS (Live Architectural Telemetry)
  // ==========================================================================
  function updateBreadcrumb(viewName) {
    const modText = document.getElementById('breadcrumb-module-text') || document.getElementById('breadcrumb-module-label');
    const viewLabel = document.getElementById('breadcrumb-view-label');
    const badgeContainer = document.getElementById('breadcrumb-dynamic-badge') || document.getElementById('breadcrumb-context-badge');
    const backBtn = document.getElementById('breadcrumb-back-btn');
    const sidebarTelemetry = document.getElementById('sidebar-telemetry-badge');

    if (!modText && !viewLabel && !badgeContainer && !backBtn && !sidebarTelemetry) {
      return;
    }

    const moduleNames = {
      maarif: `MEB MÜFREDATI • ${getActiveGrade()}. SINIF`,
      yds: 'YDS & YÖKDİL AKADEMİK',
      oxford: 'KELİME KÜTÜPHANESİ',
      all: 'TÜM KÜTÜPHANE'
    };

    const viewNames = {
      home: "KONTROL MERKEZİ",
      daily: STATE.activeModule === 'yds' ? "YDS WORKOUT" : "GÜNÜN 10'LUSU",
      flashcard: "FLASHCARD KARTLARI",
      quiz: STATE.activeModule === 'yds' ? "YDS SİMÜLATÖR" : "DEĞERLENDİRME TESTİ",
      directory: "KELİME HAVUZU",
      stats: "İLERLEME VE ANALİZ"
    };

    if (modText) {
      modText.innerText = moduleNames[STATE.activeModule] || moduleNames.maarif;
    }
    if (viewLabel) {
      viewLabel.innerText = viewNames[viewName] || viewName;
    }

    // Compute Daily Goal telemetry for both sidebar footer & daily view badge
    const isYds = STATE.activeModule === 'yds';
    const isOxford = STATE.activeModule === 'oxford';
    const targetPool = isYds 
      ? WORDS_DATA.filter(isYDSWord) 
      : (isOxford ? WORDS_DATA.filter(isOxfordWord) : getActiveGradePool());
    
    const bSize = isYds ? 20 : (isOxford ? 25 : 10);
    const start = (STATE.currentDay - 1) * bSize;
    const dayWords = targetPool.slice(start, start + bSize);
    const dayLearned = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const totalDay = dayWords.length || bSize;
    const dayPct = Math.round((dayLearned / (totalDay || 1)) * 100);
    const themeNum = (dayWords[0] && dayWords[0].themeNum) ? dayWords[0].themeNum : Math.min(8, Math.max(1, Math.ceil(STATE.currentDay / 10)));
    const dayTitle = isYds ? `GÜN ${STATE.currentDay}` : (isOxford ? `GÜN ${STATE.currentDay}` : `GÜN ${STATE.currentDay} • TEMA ${themeNum}`);
    const isDone = dayLearned >= totalDay && totalDay > 0;

    const dailyTelemetryHtml = `
      <div class="badge-live-progress ${isDone ? 'celebrating' : ''}" title="Günlük Hedef İlerlemesi (%${dayPct})">
        <div class="badge-live-header">
          <span class="badge-day-label">${dayTitle}</span>
          <span class="badge-live-counter"><strong>${dayLearned}</strong>/${totalDay} KELİME</span>
          <span class="badge-live-stars">%${dayPct}</span>
        </div>
        <div class="badge-mini-track" role="progressbar" aria-valuenow="${dayPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="badge-mini-fill ${isDone ? 'completed' : ''}" style="width: ${dayPct}%;"></div>
        </div>
      </div>
    `;

    if (sidebarTelemetry) {
      sidebarTelemetry.innerHTML = dailyTelemetryHtml;
    }

    if (badgeContainer) {
      if (viewName === 'daily' || viewName === 'home') {
        badgeContainer.innerHTML = dailyTelemetryHtml;
        badgeContainer.style.display = 'inline-flex';

      } else if (viewName === 'quiz') {
        const qState = STATE.quizState;
        if (qState && qState.active && qState.questions && qState.questions.length > 0) {
          const currentIdx = Math.min(qState.currentIndex + 1, qState.questions.length);
          const totalQ = qState.questions.length;
          const qPct = Math.round(((qState.currentIndex) / totalQ) * 100);

          badgeContainer.innerHTML = `
            <div class="badge-live-progress quiz-mode" title="Canlı Test Telemetrisi">
              <div class="badge-live-header">
                <span class="badge-day-label">SORU ${currentIdx}/${totalQ}</span>
                <span class="badge-live-counter">DOĞRU: ${qState.score}</span>
                <span class="badge-streak-flame">SERİ: ${qState.streak}</span>
              </div>
              <div class="badge-mini-track" role="progressbar" aria-valuenow="${qPct}" aria-valuemin="0" aria-valuemax="100">
                <div class="badge-mini-fill fill-quiz" style="width: ${qPct}%;"></div>
              </div>
            </div>
          `;
        } else {
          badgeContainer.innerHTML = `
            <div class="badge-live-progress" title="Test Modu">
              <div class="badge-live-header">
                <span class="badge-day-label">TEST MODÜLÜ</span>
                <span class="badge-live-counter">HAZIR</span>
              </div>
              <div class="badge-mini-track">
                <div class="badge-mini-fill fill-quiz" style="width: 100%;"></div>
              </div>
            </div>
          `;
        }
        badgeContainer.style.display = 'inline-flex';

      } else if (viewName === 'flashcard') {
        const totalFc = STATE.filteredFlashcards ? STATE.filteredFlashcards.length : 0;
        const currentFc = totalFc > 0 ? (STATE.activeFlashcardIndex + 1) : 0;
        const fcPct = totalFc > 0 ? Math.round((currentFc / totalFc) * 100) : 0;

        badgeContainer.innerHTML = `
          <div class="badge-live-progress fc-mode" title="Flashcard İlerlemesi">
            <div class="badge-live-header">
              <span class="badge-day-label">KART ${currentFc}/${totalFc}</span>
              <span class="badge-live-counter">%${fcPct}</span>
            </div>
            <div class="badge-mini-track" role="progressbar" aria-valuenow="${fcPct}" aria-valuemin="0" aria-valuemax="100">
              <div class="badge-mini-fill fill-fc" style="width: ${fcPct}%;"></div>
            </div>
          </div>
        `;
        badgeContainer.style.display = 'inline-flex';

      } else {
        const label = STATE.activeModule === 'yds' ? 'YDS/YÖKDİL' : (STATE.activeModule === 'oxford' ? 'KÜTÜPHANE' : 'MAARİF MODELİ');
        badgeContainer.innerHTML = `
          <span class="badge-day">${label}</span>
        `;
        badgeContainer.style.display = 'inline-flex';
      }
    }

    if (backBtn) {
      if (viewName === 'home') {
        backBtn.style.opacity = '0.55';
        backBtn.title = 'Zaten Kontrol Merkezindesiniz';
      } else {
        backBtn.style.opacity = '1';
        backBtn.title = 'Önceki Görünüme Dön';
      }
    }
  }

  function goHome() {
    switchView('home');
  }

  function goBack() {
    if (STATE.viewHistory && STATE.viewHistory.length > 1) {
      STATE.viewHistory.pop();
      const prev = STATE.viewHistory.pop();
      switchView(prev || 'home');
    } else {
      switchView('home');
    }
  }

  // ==========================================================================
  // VIEW SWITCHER & DISPATCHER (With 0.25s View-Transition Fade)
  // ==========================================================================
  function switchView(viewName, pushHash = true) {
    const viewAliases = { 'word-list': 'directory', 'words': 'directory' };
    const resolved = viewAliases[viewName] || viewName;
    cancelQuizSpeaking();
    if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const vt = document.startViewTransition(() => {
        executeSwitchView(resolved, pushHash);
      });
      // rapid switches skip the previous transition; swallow the expected aborts
      vt.ready.catch(() => {});
      vt.finished.catch(() => {});
    } else {
      executeSwitchView(resolved, pushHash);
    }
  }

  function executeSwitchView(viewName, pushHash = true) {
    STATE.currentView = viewName;
    if (!STATE.viewHistory) STATE.viewHistory = ['home'];
    if (STATE.viewHistory[STATE.viewHistory.length - 1] !== viewName) {
      STATE.viewHistory.push(viewName);
    }

    if (pushHash && window.location.hash !== '#' + viewName) {
      try {
        history.pushState(null, '', '#' + viewName);
      } catch (e) {
        window.location.hash = viewName;
      }
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

    const titleEl = document.getElementById('header-user-title');
    const labelEl = document.getElementById('header-greeting-label');
    const modTitles = {
      maarif: 'MEB Müfredatı',
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'Kelime Kütüphanesi',
      all: 'Tüm Kütüphane'
    };
    const viewLabels = {
      home: 'GÜNLÜK HEDEF • LEARNISH',
      daily: 'GÜNLÜK ÇALIŞMA • WORKOUT',
      flashcard: 'FLASHCARD • KART İNCELEME',
      quiz: 'KAZANIM SINAVI • TEST',
      directory: 'KELİME HAVUZU • ARAMA',
      stats: 'ÖĞRENİM TELEMETRİSİ • ANALİZ'
    };
    const activeModName = modTitles[STATE.activeModule] || 'MEB Müfredatı';
    if (labelEl) {
      const baseLabel = viewLabels[viewName] || 'GÜNLÜK HEDEF • LEARNISH';
      labelEl.textContent = `${baseLabel} • ${activeModName.toUpperCase()}`;
    }
    if (titleEl) {
      if (viewName === 'home') titleEl.textContent = activeModName;
      else if (viewName === 'daily') titleEl.textContent = STATE.activeModule === 'yds' ? "Günün 20'si (YDS)" : "Günün 10'lusu (MEB)";
      else if (viewName === 'flashcard') titleEl.textContent = `Flashcard (${activeModName})`;
      else if (viewName === 'quiz') titleEl.textContent = `Quiz & Test (${activeModName})`;
      else if (viewName === 'directory') titleEl.textContent = `Kelime Havuzu (${activeModName})`;
      else if (viewName === 'stats') titleEl.textContent = `İstatistik (${activeModName})`;
    }

    // Trigger Context Canopy ("İşte Buradasınız" Tülü & Haber Verici Çizgisi)
    updateContextCanopy(viewName, true);

    if (viewName === 'home') renderHomeView();
    if (viewName === 'daily') renderDailyView();
    if (viewName === 'flashcard') renderFlashcardView();
    if (viewName === 'quiz') renderQuizView();
    if (viewName === 'directory') renderDirectoryView();
    if (viewName === 'stats') renderStatsView();
  }

  function updateUI() {
    switchView(STATE.currentView);
  }

  // ==========================================================================
  // QUIZ LOGIC & SESSION PERSISTENCE
  // ==========================================================================
  function saveQuizState() {
    if (STATE.quizState.active && STATE.quizState.currentIndex < STATE.quizState.questions.length) {
      try {
        localStorage.setItem('learnish_active_quiz', JSON.stringify({
          active: true,
          questions: STATE.quizState.questions,
          currentIndex: STATE.quizState.currentIndex,
          score: STATE.quizState.score,
          streak: STATE.quizState.streak,
          mode: STATE.quizState.mode,
          source: STATE.quizState.source
        }));
      } catch (e) {
        console.warn('Quiz state save error:', e);
      }
    } else {
      localStorage.removeItem('learnish_active_quiz');
    }
  }

  function resumeQuiz() {
    const saved = localStorage.getItem('learnish_active_quiz');
    if (!saved) return;
    try {
      const q = JSON.parse(saved);
      STATE.quizState = {
        active: true,
        questions: q.questions,
        currentIndex: q.currentIndex || 0,
        score: q.score || 0,
        streak: q.streak || 0,
        mode: q.mode || 'en-tr',
        source: q.source || 'daily',
        answered: false,
        waitingFeedback: false
      };
      renderQuizView();
    } catch (e) {
      console.warn('Resume error:', e);
      localStorage.removeItem('learnish_active_quiz');
    }
  }

  function discardSavedQuiz() {
    localStorage.removeItem('learnish_active_quiz');
    renderQuizView();
  }

  function startQuiz(forcedSource = null) {
    cancelQuizSpeaking();
    const modeSelect = document.getElementById('quiz-mode-select');
    const sourceSelect = document.getElementById('quiz-source-select');
    const countSelect = document.getElementById('quiz-count-select');
    const levelSelect = document.getElementById('quiz-level-select');

    const mode = modeSelect ? modeSelect.value : 'en-tr';
    const source = forcedSource || (sourceSelect ? sourceSelect.value : 'daily');
    if (sourceSelect && forcedSource) sourceSelect.value = forcedSource;
    const countVal = countSelect ? countSelect.value : '10';
    const levelVal = levelSelect ? levelSelect.value : 'all';

    let pool = [];
    if (source === 'daily') {
      const isYds = STATE.activeModule === 'yds';
      const isOxford = STATE.activeModule === 'oxford';
      const isAll = STATE.activeModule === 'all';
      const targetPool = isYds 
        ? WORDS_DATA.filter(isYDSWord) 
        : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : getActiveGradePool()));
      const bSize = isYds ? 20 : (isOxford || isAll ? 25 : 10);
      const start = (STATE.currentDay - 1) * bSize;
      pool = targetPool.slice(start, start + bSize);
    } else if (source === 'past_cumulative') {
      const isYds = STATE.activeModule === 'yds';
      const isOxford = STATE.activeModule === 'oxford';
      const isAll = STATE.activeModule === 'all';
      const targetPool = isYds 
        ? WORDS_DATA.filter(isYDSWord) 
        : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : getActiveGradePool()));
      const bSize = isYds ? 20 : (isOxford || isAll ? 25 : 10);
      const end = Math.min(STATE.currentDay * bSize, targetPool.length);
      pool = targetPool.slice(0, end);
    } else if (source === 'srs_due') {
      pool = getSRSDueWords();
      if (pool.length === 0) {
        alert('Bugün için planlanmış aralıklı tekrar kelimeniz bulunmuyor. Harika! Hafızanız güncel.');
        return;
      }
    } else if (source === 'mistakes') {
      pool = getActiveMistakeWords();
      if (pool.length === 0) {
        alert('Hata Defteriniz şu an tertemiz! Zayıf nokta bulunmuyor.');
        return;
      }
    } else if (source === 'review') {
      pool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id));
    } else if (source === 'maarif') {
      pool = getActiveGradePool();
    } else if (source === 'yds_all') {
      pool = WORDS_DATA.filter(isYDSWord);
    } else if (source === 'yds_verbs') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'verb');
    } else if (source === 'yds_nouns') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'noun');
    } else if (source === 'yds_adj_adv') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'adj_adv');
    } else if (source === 'oxford_all') {
      pool = WORDS_DATA.filter(isOxfordWord);
    } else {
      pool = WORDS_DATA;
    }

    if (levelVal !== 'all') {
      pool = pool.filter(w => w.cefr === levelVal);
    }

    if (pool.length === 0) {
      alert('Seçilen kriterlerde uygun kelime bulunamadı.');
      return;
    }

    if (pool.length < 4 && source !== 'srs_due' && source !== 'mistakes') {
      alert('Seçilen kriterlerde yeterli kelime (en az 4) bulunamadı. Lütfen tüm kelimeleri seçin.');
      return;
    }

    const shuffled = shuffleArray(pool);
    const qCount = countVal === 'all' ? shuffled.length : Math.min(parseInt(countVal, 10), shuffled.length);
    const selectedTargets = shuffled.slice(0, qCount);
    const questions = selectedTargets.map(target => {
      const distractors = pickDistractors(target, 3, pool);

      let clozeSentence = null;
      if (mode === 'cloze' && target.example) {
        const regex = new RegExp(`\\b${target.en}[a-z]*\\b`, 'i');
        clozeSentence = target.example.replace(regex, '<span class="cloze-blank">_______</span>');
      }

      const options = [target, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map(w => ({
          id: w.id,
          text: (mode === 'tr-en' || mode === 'cloze' || mode === 'definition') ? w.en : w.tr,
          isCorrect: w.id === target.id
        }));

      return {
        targetWord: target,
        clozeSentence: clozeSentence,
        options: options
      };
    });

    STATE.quizState = {
      active: true,
      questions: questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      mode: mode,
      source: source,
      answered: false,
      waitingFeedback: false
    };

    saveQuizState();
    renderQuizView();
  }

  // Screen-reader live region: colour-independent answer feedback
  function announceStatus(msg) {
    const el = document.getElementById('sr-live');
    if (!el) return;
    el.textContent = '';
    setTimeout(() => { el.textContent = msg; }, 30);
  }

  function handleQuizAnswer(optionIdx) {
    if (STATE.quizState.answered || STATE.quizState.waitingFeedback) return;
    STATE.quizState.answered = true;

    const currentQ = STATE.quizState.questions[STATE.quizState.currentIndex];
    const selectedOpt = currentQ.options[optionIdx];
    const optionBtns = document.querySelectorAll('.quiz-opt-btn');

    optionBtns.forEach((btn, idx) => {
      btn.disabled = true;
      if (currentQ.options[idx].isCorrect) {
        btn.classList.add('correct');
      } else if (idx === optionIdx) {
        btn.classList.add('wrong');
      }
    });

    announceStatus(selectedOpt.isCorrect ? 'Doğru cevap' : 'Yanlış cevap. Doğru seçenek vurgulandı');

    if (selectedOpt.isCorrect) {
      STATE.quizState.score++;
      STATE.quizState.streak++;
      playSound('correct');

      // SM-2 Aralıklı Tekrar ve Hata Defteri senkronizasyonu
      calculateSRS(currentQ.targetWord.id, 4);
      const rec = recordMistakeSuccess(currentQ.targetWord.id);
      if (rec && rec.cleared) {
        showRecoveryToast(currentQ.targetWord);
      }

      saveQuizState();
      updateBreadcrumb('quiz');

      setTimeout(() => {
        STATE.quizState.currentIndex++;
        STATE.quizState.answered = false;
        STATE.quizState.waitingFeedback = false;
        saveQuizState();
        renderQuizView();
        updateBreadcrumb('quiz');
      }, 900);
    } else {
      STATE.quizState.streak = 0;
      playSound('wrong');

      // Hata Defterine kaydet ve Aralıklı Tekrarı başa al
      calculateSRS(currentQ.targetWord.id, 1);
      recordMistake(currentQ.targetWord.id, `quiz_${STATE.quizState.mode}`);

      saveUserData();
      saveQuizState();
      updateBreadcrumb('quiz');

      showQuizFeedbackCard(currentQ, selectedOpt);
    }
  }

  function showQuizFeedbackCard(currentQ, selectedOpt) {
    STATE.quizState.waitingFeedback = true;
    const targetWord = currentQ.targetWord;
    const feedbackBox = document.getElementById('quiz-feedback-container');
    if (!feedbackBox) {
      setTimeout(nextQuizQuestion, 2000);
      return;
    }

    feedbackBox.innerHTML = `
      <div class="quiz-feedback-card glass-panel">
        <div class="feedback-header">
          <span class="feedback-badge-wrong">[ YANLIŞ CEVAP ]</span>
          <span class="feedback-hint">HATA DEFTERİNE VE ARALIKLI TEKRARA EKLENDİ</span>
        </div>
        
        <div class="feedback-pedagogy-alert">
          <span class="ped-alert-icon">${renderIcon('brain', 16)}</span>
          <div class="ped-alert-text">
            <strong>Bilişsel Aralıklı Tekrar:</strong> Bu kelime <strong>Hata Defterinize</strong> eklendi ve unutulmaması için yarınki <strong>Aralıklı Tekrar</strong> programınıza dahil edildi.
          </div>
        </div>

        <div class=”feedback-body”>
          <div class=”feedback-word-row”>
            <span class=”feedback-word-en”>${escapeHtml(targetWord.en)}</span>
            <button class=”speak-btn” style=”width:40px; height:40px;” onclick=”window.APP.speakCurrentWord('${escapeHtml(targetWord.en)}')” title=”Telaffuzu Dinle” aria-label=”Telaffuzu Dinle”>${ICONS.speaker}</button>
            <span class=”feedback-word-pos”>${escapeHtml(targetWord.desc || '')} ${targetWord.cefr ? '• ' + escapeHtml(targetWord.cefr) : ''}</span>
          </div>
          ${targetWord.phonetic ? `<div style=”font-family:var(--dp-typography-mono);font-size:0.9rem;color:var(--dp-color-ink-muted);margin-bottom:6px;”>/${escapeHtml(targetWord.phonetic)}/</div>` : ''}
          <div class=”feedback-meaning-row”>
            <span class=”feedback-meaning-label”>DOĞRU ANLAM:</span>
            <strong class=”feedback-meaning-tr”>${escapeHtml(targetWord.tr)}</strong>
          </div>
          ${targetWord.example ? `
            <div class=”feedback-example-row”>
              <span class=”feedback-ex-label”>ÖRNEK KULLANIM:</span>
              <p class=”feedback-example”>”${highlightWordInText(targetWord.example, targetWord.en)}”</p>
            </div>
          ` : ''}
          ${(STATE.quizState.mode === 'cloze' || STATE.quizState.mode === 'definition') ? (() => {
            const syn = getWordSynonym(targetWord);
            const prep = extractPreposition(targetWord);
            if (!syn && !prep) return '';
            return `<div class=”feedback-cloze-extras”>
              ${syn ? `<div><span class=”feedback-ex-label”>EŞ ANLAM (YDS):</span> <span style=”color:var(--dp-color-ink)”>${escapeHtml(syn)}</span></div>` : ''}
              ${prep ? `<div><span class=”feedback-ex-label”>YAPI (EDAT):</span> <span style=”font-weight:700;color:var(--dp-color-emphasis)”>${escapeHtml(targetWord.en)} ${escapeHtml(prep)}</span></div>` : ''}
            </div>`;
          })() : ''}
        </div>
        <div class="feedback-footer">
          <button class="ctrl-btn quiz-next-btn" onclick="window.APP.nextQuizQuestion()">
            ANLADIM, SIRADAKİ SORUYA GEÇ [ENTER] &rarr;
          </button>
        </div>
      </div>
    `;

    setTimeout(() => speakWord(targetWord.en), 250);
    feedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function nextQuizQuestion() {
    STATE.quizState.currentIndex++;
    STATE.quizState.answered = false;
    STATE.quizState.waitingFeedback = false;
    saveQuizState();
    renderQuizView();
    updateBreadcrumb('quiz');
  }

  function quitQuiz() {
    STATE.quizState.active = false;
    localStorage.removeItem('learnish_active_quiz');
    renderQuizView();
    updateBreadcrumb('quiz');
  }

  function replayQuizAudio() {
    const qState = STATE.quizState;
    if (qState.active && qState.questions[qState.currentIndex]) {
      speakWord(qState.questions[qState.currentIndex].targetWord.en);
    }
  }

  // ==========================================================================
  // QUIZ SPEAKING & PRONUNCIATION INTERACTION
  // ==========================================================================
  let QUIZ_SPEECH_RECOGNIZER = null;

  function cancelQuizSpeaking() {
    if (QUIZ_SPEECH_RECOGNIZER) {
      cancelSpeechSession();
      QUIZ_SPEECH_RECOGNIZER = null;
    }
  }

  function triggerQuizSpeaking() {
    if (!STATE.quizState.active || STATE.quizState.answered || STATE.quizState.waitingFeedback) return;

    const currentQ = STATE.quizState.questions[STATE.quizState.currentIndex];
    const targetWord = currentQ.targetWord;
    const questionIndex = STATE.quizState.currentIndex;

    const getEls = () => ({
      micBtn: document.getElementById('quiz-mic-btn'),
      label: document.getElementById('quiz-mic-btn-label'),
      waveform: document.getElementById('quiz-speaking-waveform'),
      statusEl: document.getElementById('quiz-speaking-status'),
      heardEl: document.getElementById('quiz-speaking-heard')
    });

    // Zaten dinliyorsa ikinci dokunuş dinlemeyi bitirir (çift tetiklenmeyi önler)
    if (QUIZ_SPEECH_RECOGNIZER) {
      stopSpeechSession();
      return;
    }

    const resetMicUi = () => {
      const { micBtn, waveform, label } = getEls();
      if (micBtn) micBtn.classList.remove('active');
      if (waveform) waveform.classList.remove('active');
      resetLevelBars(waveform);
      if (label) label.textContent = 'MİKROFONA DOKUN & OKU';
    };
    const isSameQuestion = () => STATE.quizState.active && STATE.quizState.currentIndex === questionIndex;

    QUIZ_SPEECH_RECOGNIZER = true;
    const { statusEl: initialStatus, label: initialLabel } = getEls();
    if (initialStatus) {
      initialStatus.style.color = '';
      initialStatus.textContent = 'Mikrofon hazırlanıyor...';
    }
    if (initialLabel) initialLabel.textContent = 'HAZIRLANIYOR...';

    const quizPhaseText = {
      permission: ['İZİN BEKLENİYOR...', 'Tarayıcının mikrofon izin penceresini onaylayın'],
      listening: ['DİNLENİYOR... ŞİMDİ KONUŞUN', 'Dinliyorum — hedef kelimeyi söyleyin.'],
      speech: ['SES ALGILANDI...', 'Sesiniz algılandı, devam edin...'],
      processing: ['ÇÖZÜMLENİYOR...', 'Telaffuzunuz değerlendiriliyor...']
    };

    const started = startSpeechSession({
      lang: (STATE.settings.accent || 'en-GB').includes('US') ? 'en-US' : 'en-GB',
      onPhase: (phase) => {
        if (!isSameQuestion() || !quizPhaseText[phase]) return;
        const { micBtn, label, waveform, statusEl } = getEls();
        if (phase === 'listening' || phase === 'speech') {
          if (micBtn) micBtn.classList.add('active');
          if (waveform) waveform.classList.add('active');
        }
        if (label) label.textContent = quizPhaseText[phase][0];
        if (statusEl) {
          statusEl.style.color = '';
          statusEl.textContent = quizPhaseText[phase][1];
        }
      },
      onLevel: (level) => {
        if (!isSameQuestion()) return;
        renderLevelBars(getEls().waveform, level);
      },
      onInterim: (text) => {
        if (!isSameQuestion() || !text) return;
        const { heardEl } = getEls();
        if (heardEl) heardEl.innerHTML = `<span class="heard-bubble">Duyulan: “${escapeHtml(text)}”</span>`;
      },
      onError: (code, message) => {
        if (!isSameQuestion()) return;
        resetMicUi();
        const { statusEl } = getEls();
        if (statusEl) {
          statusEl.textContent = message;
          statusEl.style.color = 'var(--dp-color-red)';
        }
        // Tanıma servisi çalışmıyorsa kullanıcı soruda takılı kalmasın
        const feedbackSlot = document.getElementById('quiz-speaking-feedback');
        if (feedbackSlot && code !== 'no-speech' && code !== 'aborted') {
          feedbackSlot.innerHTML = `
            <div class="quiz-speaking-retry-actions" style="justify-content:center;">
              <button type="button" class="ctrl-btn" onclick="window.APP.retryQuizSpeaking()">${renderIcon('repeat', 13)} <span>Tekrar Dene</span></button>
              <button type="button" class="ctrl-btn" onclick="window.APP.skipQuizSpeaking()" style="color:var(--dp-color-ink-muted);">Bu Soruyu Atla &rarr;</button>
            </div>
          `;
        }
      },
      onEnd: (alternatives, errored) => {
        QUIZ_SPEECH_RECOGNIZER = null;
        if (!isSameQuestion()) return;
        resetMicUi();
        if (errored) return;

        if (!alternatives.length) {
          const { statusEl } = getEls();
          if (statusEl) {
            statusEl.textContent = getSpeechErrorMessage('no-speech');
            statusEl.style.color = 'var(--dp-color-red)';
          }
          return;
        }

        const best = pickBestSpokenAlternative(alternatives, targetWord.en);
        handleQuizSpeakingEvaluation(best.spoken, targetWord);
      }
    });

    if (!started) QUIZ_SPEECH_RECOGNIZER = null;
  }

  function handleQuizSpeakingEvaluation(spoken, targetWord) {
    if (STATE.quizState.answered || STATE.quizState.waitingFeedback) return;
    const evalResult = evaluatePronunciation(spoken, targetWord.en);

    STATE.userData.stats.speakingAttempts = (STATE.userData.stats.speakingAttempts || 0) + 1;

    const feedbackSlot = document.getElementById('quiz-speaking-feedback');
    const isPassing = evalResult.score >= 70;

    if (isPassing) {
      STATE.quizState.answered = true;
      STATE.quizState.score++;
      STATE.quizState.streak++;
      STATE.userData.stats.speakingSuccesses = (STATE.userData.stats.speakingSuccesses || 0) + 1;
      playSound('correct');

      calculateSRS(targetWord.id, 4);
      const rec = recordMistakeSuccess(targetWord.id);
      if (rec && rec.cleared) showRecoveryToast(targetWord);
      saveUserData();

      if (feedbackSlot) {
        feedbackSlot.innerHTML = `
          <div class="quiz-speaking-result-badge success">
            <span class="result-score">%${evalResult.score}</span>
            <div>
              <strong>${evalResult.title}</strong>
              <p>${evalResult.message}</p>
            </div>
          </div>
        `;
      }

      setTimeout(() => {
        STATE.quizState.currentIndex++;
        STATE.quizState.answered = false;
        STATE.quizState.waitingFeedback = false;
        saveQuizState();
        renderQuizView();
        updateBreadcrumb('quiz');
      }, 1200);
    } else {
      STATE.quizState.waitingFeedback = true;
      STATE.quizState.streak = 0;
      playSound('wrong');

      calculateSRS(targetWord.id, 1);
      recordMistake(targetWord.id, 'quiz_speaking');
      saveUserData();

      if (feedbackSlot) {
        feedbackSlot.innerHTML = `
          <div class="quiz-speaking-result-badge wrong">
            <span class="result-score">%${evalResult.score}</span>
            <div style="flex:1;">
              <strong>${evalResult.title}</strong>
              <p>Duyulan: “${escapeHtml(evalResult.spoken)}” • Hedef: “${escapeHtml(targetWord.en)}”</p>
              <div class="quiz-speaking-retry-actions">
                <button type="button" class="ctrl-btn" onclick="window.APP.retryQuizSpeaking()">
                  ${renderIcon('repeat', 13)} <span>Tekrar Dene</span>
                </button>
                <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(targetWord.en)}')">
                  ${renderIcon('speaker', 13)} <span>Örnek Dinle</span>
                </button>
                <button type="button" class="ctrl-btn" onclick="window.APP.skipQuizSpeaking()" style="color:var(--dp-color-ink-muted);">
                  Sonraki Soru &rarr;
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }
  }

  function retryQuizSpeaking() {
    STATE.quizState.waitingFeedback = false;
    STATE.quizState.answered = false;
    const feedbackSlot = document.getElementById('quiz-speaking-feedback');
    if (feedbackSlot) feedbackSlot.innerHTML = '';
    const heardEl = document.getElementById('quiz-speaking-heard');
    if (heardEl) heardEl.innerHTML = '';
    triggerQuizSpeaking();
  }

  function skipQuizSpeaking() {
    cancelQuizSpeaking();
    STATE.quizState.currentIndex++;
    STATE.quizState.answered = false;
    STATE.quizState.waitingFeedback = false;
    saveQuizState();
    renderQuizView();
    updateBreadcrumb('quiz');
  }

  // ==========================================================================
  // FLASHCARD ACTIONS
  // ==========================================================================
  function nextFlashcard() {
    if (STATE.filteredFlashcards.length === 0) return;
    STATE.activeFlashcardIndex = (STATE.activeFlashcardIndex + 1) % STATE.filteredFlashcards.length;
    STATE.flashcardFlipped = false;
    renderFlashcardView(true);
    updateBreadcrumb('flashcard');
  }

  function prevFlashcard() {
    if (STATE.filteredFlashcards.length === 0) return;
    STATE.activeFlashcardIndex = (STATE.activeFlashcardIndex - 1 + STATE.filteredFlashcards.length) % STATE.filteredFlashcards.length;
    STATE.flashcardFlipped = false;
    renderFlashcardView(true);
    updateBreadcrumb('flashcard');
  }

  function markFlashcardSRS(wordId, quality) {
    wordId = parseInt(wordId, 10);
    const wordObj = WORDS_DATA.find(w => w.id === wordId);
    const srsRec = calculateSRS(wordId, quality);

    if (quality < 3) {
      recordMistake(wordId, 'flashcard');
      playSound('flip');
    } else {
      const rec = recordMistakeSuccess(wordId);
      if (rec && rec.cleared) {
        showRecoveryToast(wordObj || { en: '#' + wordId });
      }
      playSound('correct');
    }

    const modMap = {
      maarif: `MEB ${getActiveGrade()}. SINIF`,
      yds: 'YDS & YÖKDİL AKADEMİK',
      oxford: 'KELİME KÜTÜPHANESİ',
      all: 'TÜM KÜTÜPHANE'
    };
    const modTitle = modMap[STATE.activeModule] || modMap.maarif;
    const wEn = wordObj ? wordObj.en.toUpperCase() : `#${wordId}`;
    const qualLabels = { 1: 'ZOR/TEKRAR (1g)', 4: `İYİ (${srsRec.interval}g)`, 5: `KOLAY (${srsRec.interval}g)` };
    logActivity(`${modTitle} • SRS DEĞERLENDİRME`, `[${wEn}] -> ${qualLabels[quality] || 'GÜNCELLENDİ'}`);

    saveUserData();
    nextFlashcard();
  }

  function markFlashcardKnown(wordId) {
    markFlashcardSRS(wordId, 4);
  }

  function markFlashcardReview(wordId) {
    markFlashcardSRS(wordId, 1);
  }

  function shuffleFlashcards() {
    if (!STATE.filteredFlashcards || STATE.filteredFlashcards.length <= 1) return;
    STATE.filteredFlashcards = shuffleArray(STATE.filteredFlashcards);
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    STATE.flashcardIsShuffled = true;
    playSound('flip');
    renderFlashcardView(true);
  }

  function unshuffleFlashcards() {
    STATE.flashcardIsShuffled = false;
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    renderFlashcardView(false);
  }

  function startDailyFlashcards(andShuffle = false) {
    STATE.flashcardSource = 'daily';
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    if (andShuffle) {
      STATE.flashcardIsShuffled = true;
      STATE.filteredFlashcards = [];
    } else {
      STATE.flashcardIsShuffled = false;
    }
    switchView('flashcard');
    if (andShuffle) {
      setTimeout(() => {
        shuffleFlashcards();
      }, 50);
    }
  }

  function startDailyQuiz() {
    STATE.quizState.active = false;
    switchView('quiz');
    startQuiz('daily');
  }

  function startPastDaysFlashcards(andShuffle = false) {
    STATE.flashcardSource = 'past_cumulative';
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    if (andShuffle) {
      STATE.flashcardIsShuffled = true;
      STATE.filteredFlashcards = [];
    } else {
      STATE.flashcardIsShuffled = false;
    }
    switchView('flashcard');
    if (andShuffle) {
      setTimeout(() => {
        shuffleFlashcards();
      }, 50);
    }
  }

  function startPastDaysQuiz() {
    STATE.quizState.active = false;
    switchView('quiz');
    startQuiz('past_cumulative');
  }

  function startSRSDueFlashcards() {
    STATE.flashcardSource = 'srs_due';
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    STATE.flashcardIsShuffled = false;
    switchView('flashcard');
  }

  function startSRSDueQuiz() {
    startDedicatedQuiz('srs_due');
  }

  function startMistakeFlashcards() {
    STATE.flashcardSource = 'mistakes';
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    STATE.flashcardIsShuffled = false;
    switchView('flashcard');
  }

  function startMistakeQuiz() {
    startDedicatedQuiz('mistakes');
  }

  function startDedicatedQuiz(sourceType) {
    let pool = [];
    if (sourceType === 'srs_due') {
      pool = getSRSDueWords();
      if (pool.length === 0) {
        alert('Bugün için planlanmış aralıklı tekrar kelimeniz bulunmuyor. Harika! Hafızanız güncel.');
        return;
      }
    } else if (sourceType === 'mistakes') {
      pool = getActiveMistakeWords();
      if (pool.length === 0) {
        alert('Hata Defteriniz şu an tertemiz! Zayıf nokta bulunmuyor.');
        return;
      }
    }

    const shuffled = shuffleArray(pool);
    const selectedTargets = shuffled.slice(0, Math.min(10, shuffled.length));
    const questions = selectedTargets.map(target => {
      const distractors = pickDistractors(target, 3, pool);

      const options = [target, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map(w => ({
          id: w.id,
          text: w.tr || w.en,
          isCorrect: w.id === target.id
        }));

      return {
        targetWord: target,
        clozeSentence: null,
        options: options
      };
    });

    STATE.quizState = {
      active: true,
      questions: questions,
      currentIndex: 0,
      score: 0,
      streak: 0,
      mode: 'en-tr',
      source: sourceType,
      answered: false,
      waitingFeedback: false
    };

    saveQuizState();
    switchView('quiz');
  }

  function goToTodayMEBDay() {
    const todayInfo = getMEBCalendarInfo();
    STATE.currentDay = todayInfo.day;
    saveUserData();
    updateUI();
  }

  function speakCurrentWord(word) {
    speakWord(word);
  }

  function resetAllProgress() {
    if (confirm('Tüm öğrenme geçmişiniz, aralıklı tekrar ve hata defteri kayıtlarınız sıfırlanacak. Emin misiniz?')) {
      STATE.userData.learned.clear();
      STATE.userData.review.clear();
      STATE.userData.starred.clear();
      STATE.userData.stats = { quizzesPlayed: 0, correctAnswers: 0, totalQuestions: 0, bestStreak: 0 };
      STATE.userData.activityLog = [];
      STATE.userData.srs = {};
      STATE.userData.mistakes = {};
      STATE.currentDay = 1;
      saveUserData();
      updateUI();
    }
  }

  // ==========================================================================
  // KEYBOARD SHORTCUTS (Home, Flashcard & Quiz Mechanical Ergonomics)
  // ==========================================================================
  // Backdrop click closes the open modal (replaces inline onclick on non-interactive divs)
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t && t.id && /-backdrop$/.test(t.id)) closeModals();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (COACH_STATE.active || isAnyModalOpen())) {
      e.preventDefault();
      closeModals();
      return;
    }

    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const onButton = !!(e.target && e.target.closest && e.target.closest('button'));

    if (COACH_STATE.active) {
      if (e.code === 'Space') {
        if (onButton || e.repeat) return;
        e.preventDefault();
        toggleCoachListening();
        return;
      }
      return;
    }

    if (isAnyModalOpen()) {
      return;
    }

    if (STATE.currentView === 'home') {
      const keyUpper = (e.key || '').toUpperCase();
      if (keyUpper === 'F') {
        e.preventDefault();
        switchView('flashcard');
      } else if (keyUpper === 'Q') {
        e.preventDefault();
        switchView('quiz');
      } else if (e.code === 'Enter') {
        e.preventDefault();
        switchView('daily');
      }
      return;
    }

    if (STATE.currentView === 'flashcard' && STATE.filteredFlashcards.length > 0) {
      const currentWord = STATE.filteredFlashcards[STATE.activeFlashcardIndex];
      if (e.code === 'Space') {
        if (onButton || e.repeat || (document.activeElement && ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName))) return;
        e.preventDefault();
        STATE.flashcardFlipped = !STATE.flashcardFlipped;
        playSound('flip');
        document.getElementById('flashcard-inner')?.classList.toggle('flipped', STATE.flashcardFlipped);
      } else if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        nextFlashcard();
      } else if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        prevFlashcard();
      } else if (e.key === 'p' || e.key === 'P' || e.code === 'Enter') {
        e.preventDefault();
        speakWord(currentWord.en);
      } else if (e.key === 's' || e.key === 'S' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        openSpeechCoach(currentWord.en);
      } else if (e.key === '1') {
        e.preventDefault();
        markFlashcardSRS(currentWord.id, 1);
      } else if (e.key === '2') {
        e.preventDefault();
        markFlashcardSRS(currentWord.id, 4);
      } else if (e.key === '3') {
        e.preventDefault();
        markFlashcardSRS(currentWord.id, 5);
      }
    } else if (STATE.currentView === 'quiz' && STATE.quizState.active) {
      if (STATE.quizState.mode === 'speaking') {
        if (e.code === 'Space' || e.code === 'Enter') {
          if (onButton || e.repeat) return;
          e.preventDefault();
          if (STATE.quizState.waitingFeedback) {
            retryQuizSpeaking();
          } else {
            triggerQuizSpeaking();
          }
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          replayQuizAudio();
        }
        return;
      }

      if (STATE.quizState.waitingFeedback && (e.code === 'Enter' || e.code === 'Space')) {
        e.preventDefault();
        nextQuizQuestion();
      } else if (!STATE.quizState.answered && !STATE.quizState.waitingFeedback) {
        const keyUpper = (e.key || '').toUpperCase();
        if (keyUpper === '1' || keyUpper === 'A') {
          e.preventDefault();
          handleQuizAnswer(0);
        } else if (keyUpper === '2' || keyUpper === 'B') {
          e.preventDefault();
          handleQuizAnswer(1);
        } else if (keyUpper === '3' || keyUpper === 'C') {
          e.preventDefault();
          handleQuizAnswer(2);
        } else if (keyUpper === '4' || keyUpper === 'D') {
          e.preventDefault();
          handleQuizAnswer(3);
        } else if (keyUpper === 'R') {
          e.preventDefault();
          replayQuizAudio();
        }
      }
    }
  });

  // ==========================================================================
  // INITIALIZATION & SETTINGS BINDINGS
  // ==========================================================================
  function initApp() {
    document.documentElement.setAttribute('data-theme', STATE.settings.theme);
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', STATE.settings.theme === 'dark' ? '#171e19' : '#eeebe3');
    }

    // Hash routing — default landing page is #home (Kontrol Merkezi)
    const validViews = ['home', 'daily', 'flashcard', 'quiz', 'directory', 'stats'];
    const viewAliases = { 'word-list': 'directory', 'words': 'directory' };
    const resolveView = (h) => {
      const clean = (h || '').replace('#', '').trim();
      const mapped = viewAliases[clean] || clean;
      return validViews.includes(mapped) ? mapped : null;
    };

    const initialView = resolveView(window.location.hash) || 'home';
    STATE.currentView = initialView;

    // Apply saved module
    switchModule(STATE.activeModule);

    // Bind Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    function syncAllSettingsButtons() {
      const accentText = STATE.settings.accent === 'en-GB' ? 'UK' : 'US';
      const speedText = `${STATE.settings.speed.toFixed(1)}x`;
      const soundText = STATE.settings.soundEffects ? 'SES: AÇIK' : 'SES: KAPALI';
      const themeText = STATE.settings.theme === 'dark' ? 'TEMA: KOYU' : 'TEMA: AÇIK';

      const dAccent = document.getElementById('accent-toggle-btn');
      if (dAccent) dAccent.innerText = accentText;

      const dSpeed = document.getElementById('speed-toggle-btn');
      if (dSpeed) dSpeed.innerText = speedText;

      const dSound = document.getElementById('sound-toggle-btn');
      if (dSound) dSound.innerText = soundText;

      const dTheme = document.getElementById('theme-toggle-btn');
      if (dTheme) dTheme.innerText = themeText;
    }

    function toggleAccentSetting() {
      STATE.settings.accent = STATE.settings.accent === 'en-GB' ? 'en-US' : 'en-GB';
      localStorage.setItem('mk_accent', STATE.settings.accent);
      syncAllSettingsButtons();
    }

    function toggleSpeedSetting() {
      STATE.settings.speed = STATE.settings.speed === 1.0 ? 0.8 : (STATE.settings.speed === 0.8 ? 1.2 : 1.0);
      localStorage.setItem('mk_speed', STATE.settings.speed.toString());
      syncAllSettingsButtons();
    }

    function toggleSoundSetting() {
      STATE.settings.soundEffects = !STATE.settings.soundEffects;
      localStorage.setItem('mk_sound', STATE.settings.soundEffects.toString());
      syncAllSettingsButtons();
    }

    function toggleThemeSetting() {
      STATE.settings.theme = STATE.settings.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', STATE.settings.theme);
      localStorage.setItem('mk_theme', STATE.settings.theme);
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', STATE.settings.theme === 'dark' ? '#171e19' : '#eeebe3');
      }
      syncAllSettingsButtons();
    }

    document.getElementById('accent-toggle-btn')?.addEventListener('click', toggleAccentSetting);
    document.getElementById('speed-toggle-btn')?.addEventListener('click', toggleSpeedSetting);
    document.getElementById('sound-toggle-btn')?.addEventListener('click', toggleSoundSetting);
    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleThemeSetting);

    syncAllSettingsButtons();
    updateMobileTriggerLabels();

    switchView(initialView, !window.location.hash);

    window.addEventListener('hashchange', () => {
      const resolved = resolveView(window.location.hash);
      if (resolved && resolved !== STATE.currentView) {
        switchView(resolved, false);
      } else if (!window.location.hash.replace('#', '').trim() && STATE.currentView !== 'home') {
        switchView('home', false);
      }
    });

    // Service Worker kaydı ve güncelleme bildirimi
    let _swWaitingWorker = null;
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('./service-worker.js').then(reg => {
        // Yeni SW yüklendiyse kullanıcıya bildir
        reg.onupdatefound = () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.onstatechange = () => {
            if (nw.state === 'installed' && navigator.serviceWorker.controller) {
              _swWaitingWorker = nw;
              const banner = document.getElementById('sw-update-banner');
              if (banner) banner.style.display = 'flex';
            }
          };
        };
      }).catch(err => {
        console.log('SW registration note:', err);
      });

      // Sayfa, yeni SW'ın kontrolü almasından sonra yenilenir
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }

    function applySwUpdate() {
      if (_swWaitingWorker) {
        _swWaitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        window.location.reload();
      }
    }
    window.APP.applySwUpdate = applySwUpdate;
  }

  // Export to Global Scope
  window.APP = {
    openSettingsModal,
    closeSettingsModal,
    handleFabAction,
    speakWord,
    openCurriculumModal,
    openModesModal,
    closeModals,
    switchModuleAndClose,
    selectModuleAndGo,
    switchViewAndClose,
    startQuizSession,
    toggleLearned,
    toggleWordLearned: toggleLearned,
    toggleReview,
    toggleWordReview: toggleReview,
    toggleStarred,
    toggleWordFavorite: toggleStarred,
    markFlashcardKnown,
    markFlashcardReview,
    markFlashcardSRS,
    nextFlashcard,
    prevFlashcard,
    shuffleFlashcards,
    unshuffleFlashcards,
    startDailyFlashcards,
    startDailyQuiz,
    startPastDaysFlashcards,
    startPastDaysQuiz,
    startSRSDueFlashcards,
    startSRSDueQuiz,
    startMistakeFlashcards,
    startMistakeQuiz,
    getSRSDueWords,
    getActiveMistakeWords,
    getSRSStats,
    getMistakeStats,
    exportProgress,
    importProgress,
    handleImportFile,
    resetProgress,
    checkFlexibleAnswer,
    goToTodayMEBDay,
    startQuiz,
    handleQuizAnswer,
    nextQuizQuestion,
    resumeQuiz,
    discardSavedQuiz,
    quitQuiz,
    replayQuizAudio,
    triggerQuizSpeaking,
    retryQuizSpeaking,
    skipQuizSpeaking,
    openSpeechCoach,
    closeSpeechCoach,
    toggleCoachAccent,
    toggleCoachListening,
    toggleCoachSelfRecording,
    startCoachListening,
    stopCoachListening,
    evaluatePronunciation,
    renderFlashcardView,
    renderDirectoryView,
    searchDirectory,
    getFilteredDirectoryWords,
    libraryLetterOf,
    buildLibraryIndex,
    spineToneClass,
    spineHeightPx,
    spineLabel,
    shelfRulerGroups,
    selectLibraryLetter,
    appendLibraryBooks,
    jumpLibraryRuler,
    openLibraryBook,
    closeLibraryBook,
    turnLibraryPage,
    openLibrarySearch,
    closeLibrarySearch,
    renderLibrarySuggestions,
    pickLibrarySuggestion,
    librarySuggest,
    clearDirectoryFilters,
    resetAllProgress,
    switchView,
    switchModule,
    speakCurrentWord,
    retestDebugWord,
    selectHeatmapUnit,
    updateContextCanopy,
    openGradeModal,
    closeGradeModal,
    switchGrade,
    openClassifierForWord,
    closeClassifierModal,
    goToCurriculumUnit,
    changeScheduleWeek,
    goToTodayCurriculumWeek,
    toggleCurriculumOutcomes,
    goHome,
    goBack,
    openPdfStudio,
    closePdfStudio,
    updatePdfStudioOption,
    printWorksheet,
    downloadWorksheetHtml,
    generateWorksheetHTML,
    getWorksheetTargetWords,
    resolveCurriculumWord,
    lookupCurriculumWord,
    getActiveGradePool,
    gradeWordMeta,
    getMEBCalendarInfo,
    pickDistractors,
    PDF_STUDIO_STATE,
    openFeedbackModal,
    closeFeedbackModal,
    updateFeedbackTelemetryPreview,
    getFeedbackTelemetryString,
    toggleTelemetryInReport,
    showFeedbackStatus,
    buildFeedbackReport,
    sendFeedbackViaMail,
    sendFeedbackViaWhatsApp,
    copyFeedbackToClipboard,
    getState: () => STATE
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
