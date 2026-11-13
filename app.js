/**
 * ============================================================================
 * LEARNISH • DARK GEOMETRIC & AMBER PRECISION SYSTEM
 * Mimari: Maarif 5. Sınıf Modülü | YDS & YÖKDİL Akademik | The Oxford 5000
 * Tasarım: Dark Geometric & Amber Precision (Neo-Brutalist Academic Instrument)
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
    "9": { num: 9, code: "OXFORD 5000", title: "THE OXFORD 5000", titleTr: "The Oxford 5000 (A1-C1 Dünya Standardı)", full: "THE OXFORD 5000 (A1-C1)", color: "#0284c7", badgeBg: "#0284c7", border: "#38bdf8" },
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

  // State Management
  const STATE = {
    activeModule: localStorage.getItem('learnish_active_module') || 'maarif', // 'maarif' | 'yds' | 'oxford' | 'all'
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
    directoryPage: 1,
    directoryPageSize: 60,
    settings: {
      accent: localStorage.getItem('mk_accent') || 'en-GB', // 'en-GB' or 'en-US'
      speed: parseFloat(localStorage.getItem('mk_speed') || '1.0'),
      soundEffects: localStorage.getItem('mk_sound') !== 'false',
      theme: localStorage.getItem('mk_theme') || 'light'
    },
    userData: {
      learned: new Set(JSON.parse(localStorage.getItem('mk_learned') || '[]')),
      review: new Set(JSON.parse(localStorage.getItem('mk_review') || '[]')),
      starred: new Set(JSON.parse(localStorage.getItem('mk_starred') || '[]')),
      stats: Object.assign({
        quizzesPlayed: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        bestStreak: 0,
        speakingAttempts: 0,
        speakingSuccesses: 0
      }, JSON.parse(localStorage.getItem('mk_stats') || '{}')),
      activityLog: JSON.parse(localStorage.getItem('mk_activity_log') || '[]'),
      srs: JSON.parse(localStorage.getItem('mk_srs') || '{}'),
      mistakes: JSON.parse(localStorage.getItem('mk_mistakes') || '{}')
    }
  };

  // ==========================================================================
  // MEB Yıllık Çerçeve Planı Takvim Eşleştirme Motoru (36 Hafta, 82 Gün)
  // ==========================================================================
  function getMEBCalendarInfo(date = new Date()) {
    const month = date.getMonth() + 1; // 1-12
    const day = date.getDate();
    const trMonths = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const trDays = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dateFormatted = `${day} ${trMonths[month]} ${trDays[date.getDay()]}`;

    let targetDay = 18;
    let weekNum = 8;
    let themeNum = 2;
    let themeName = 'Theme 2: Classroom Life (Sınıf Yaşamı)';

    // MEB 2026-2027 İngilizce 5. Sınıf Maarif Modeli Taslak Yıllık Çerçeve Planı (TYMM 5)
    if (month === 9) { // Eylül
      if (day < 21) { targetDay = 1; weekNum = 1; themeNum = 1; themeName = 'Orientation & Uyum'; }
      else if (day < 28) { targetDay = 2; weekNum = 2; themeNum = 1; themeName = 'Revision & Hazırlık'; }
      else { targetDay = 4; weekNum = 3; themeNum = 1; themeName = 'Revision & Hazırlık'; }
    } else if (month === 10) { // Ekim (Theme 1: School Life)
      themeNum = 1; themeName = 'Theme 1: School Life (Okul Yaşamı)';
      if (day < 11) { targetDay = 7; weekNum = 4; }
      else if (day < 18) { targetDay = 10; weekNum = 5; }
      else if (day < 25) { targetDay = 13; weekNum = 6; }
      else { targetDay = 16; weekNum = 7; }
    } else if (month === 11) { // Kasım (Theme 2: Classroom Life)
      themeNum = 2; themeName = 'Theme 2: Classroom Life (Sınıf Yaşamı)';
      if (day <= 7) { targetDay = 18; weekNum = 8; }
      else if (day <= 15) { targetDay = 18; weekNum = 9; themeName = '1. Ara Tatil & Pekiştirme'; }
      else if (day <= 22) { targetDay = 20; weekNum = 9; }
      else if (day <= 28) { targetDay = 22; weekNum = 10; }
      else { targetDay = 24; weekNum = 11; }
    } else if (month === 12) { // Aralık
      if (day <= 12) { targetDay = 25; weekNum = 12; themeNum = 2; themeName = 'Theme 2: Classroom Life'; }
      else if (day <= 19) { targetDay = 28; weekNum = 13; themeNum = 3; themeName = 'Theme 3: Personal Life'; }
      else if (day <= 26) { targetDay = 31; weekNum = 14; themeNum = 3; themeName = 'Theme 3: Personal Life'; }
      else { targetDay = 34; weekNum = 15; themeNum = 3; themeName = 'Theme 3: Personal Life'; }
    } else if (month === 1) { // Ocak
      if (day <= 9) { targetDay = 35; weekNum = 16; themeNum = 3; themeName = 'Theme 3: Personal Life'; }
      else if (day <= 16) { targetDay = 38; weekNum = 17; themeNum = 4; themeName = 'Theme 4: Family Life'; }
      else if (day <= 23) { targetDay = 41; weekNum = 18; themeNum = 4; themeName = 'Theme 4: Family Life'; }
      else { targetDay = 41; weekNum = 18; themeNum = 4; themeName = 'Yarıyıl Tatili'; }
    } else if (month === 2) { // Şubat
      if (day <= 7) { targetDay = 41; weekNum = 18; themeNum = 4; themeName = 'Yarıyıl Tatili'; }
      else if (day <= 13) { targetDay = 43; weekNum = 19; themeNum = 4; themeName = 'Theme 4: Family Life'; }
      else if (day <= 20) { targetDay = 45; weekNum = 20; themeNum = 4; themeName = 'Theme 4: Family Life'; }
      else { targetDay = 48; weekNum = 21; themeNum = 5; themeName = 'Theme 5: Life in the City'; }
    } else if (month === 3) { // Mart
      themeNum = 5; themeName = 'Theme 5: Life in the City';
      if (day <= 6) { targetDay = 51; weekNum = 22; }
      else if (day <= 13) { targetDay = 53; weekNum = 23; }
      else if (day <= 20) { targetDay = 55; weekNum = 24; }
      else if (day <= 27) { targetDay = 58; weekNum = 25; themeNum = 6; themeName = 'Theme 6: Life in the World'; }
      else { targetDay = 61; weekNum = 26; themeNum = 6; themeName = 'Theme 6: Life in the World'; }
    } else if (month === 4) { // Nisan
      if (day <= 10) { targetDay = 63; weekNum = 27; themeNum = 6; themeName = 'Theme 6: Life in the World'; }
      else if (day <= 17) { targetDay = 63; weekNum = 27; themeNum = 6; themeName = '2. Ara Tatil & Tekrar'; }
      else if (day <= 24) { targetDay = 65; weekNum = 28; themeNum = 6; themeName = 'Theme 6: Life in the World'; }
      else { targetDay = 68; weekNum = 29; themeNum = 7; themeName = 'Theme 7: Life in Nature'; }
    } else if (month === 5) { // Mayıs
      themeNum = 7; themeName = 'Theme 7: Life in Nature';
      if (day <= 8) { targetDay = 71; weekNum = 30; }
      else if (day <= 15) { targetDay = 73; weekNum = 31; }
      else if (day <= 22) { targetDay = 75; weekNum = 32; }
      else if (day <= 29) { targetDay = 77; weekNum = 33; themeNum = 8; themeName = 'Theme 8: Life in the Universe'; }
      else { targetDay = 79; weekNum = 34; themeNum = 8; themeName = 'Theme 8: Life in the Universe'; }
    } else if (month === 6) { // Haziran
      themeNum = 8; themeName = 'Theme 8: Life in the Universe & Future';
      if (day <= 11) { targetDay = 81; weekNum = 35; }
      else { targetDay = 82; weekNum = 36; }
    } else {
      targetDay = 18; weekNum = 8; themeNum = 2; themeName = 'Yıllık Plan İnceleme';
    }

    return { day: targetDay, weekNum, themeNum, themeName, dateFormatted };
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
  // Web Speech API (Native TTS Pronunciation)
  // ==========================================================================
  let synthVoices = [];

  function loadVoices() {
    if ('speechSynthesis' in window) {
      synthVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        synthVoices = window.speechSynthesis.getVoices();
      };
    }
  }
  loadVoices();

  function speakWord(text, onEndCallback) {
    if (!text || typeof text !== 'string') {
      if (onEndCallback) onEndCallback();
      return;
    }
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli telaffuz özelliğini desteklemiyor.');
      if (onEndCallback) onEndCallback();
      return;
    }

    window.speechSynthesis.cancel();
    const cleanWord = text.replace(/\[.*?\]/g, '').replace(/[\/\\()]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanWord);
    utterance.lang = STATE.settings.accent || 'en-GB';
    utterance.rate = STATE.settings.speed || 1.0;
    utterance.pitch = 1.0;

    if (synthVoices.length > 0) {
      const preferred = synthVoices.find(v => v.lang.startsWith(utterance.lang.substring(0, 2)) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Daniel') || v.name.includes('Samantha')));
      if (preferred) utterance.voice = preferred;
    }

    utterance.onend = () => {
      if (onEndCallback) onEndCallback();
    };
    utterance.onerror = () => {
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
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
    errorMessage: ''
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
    startTimer: null,
    safetyTimer: null
  };

  function getSpeechErrorMessage(code) {
    const host = (window.location && window.location.origin) || '';
    const messages = {
      'unsupported': '⚠️ Bu tarayıcı konuşma tanımayı desteklemiyor (ör. Firefox). Lütfen Google Chrome, Microsoft Edge veya Safari kullanın.',
      'insecure': `⚠️ Mikrofon bu adreste engellendi (${host}). Tarayıcılar mikrofonu yalnızca https:// veya localhost üzerinden açar. Telefonda http://192.168… yerine uygulamanın https (GitHub Pages) adresini kullanın.`,
      'brave': '⚠️ Brave tarayıcısı konuşma tanıma servisini engeller. Lütfen Google Chrome, Edge veya Safari kullanın.',
      'not-allowed': '⚠️ Mikrofon izni reddedildi. Adres çubuğundaki kilit 🔒 simgesinden Mikrofon → İzin Ver seçip sayfayı yenileyin. Mac’te ayrıca Sistem Ayarları → Gizlilik ve Güvenlik → Mikrofon’dan tarayıcıya izin verin.',
      'service-not-allowed': '⚠️ Konuşma tanıma servisi kapalı. iPhone/Mac Safari’de Ayarlar → Klavye → Dikte (ve Siri) açık olmalı. Chrome’da sayfayı yenileyip tekrar deneyin.',
      'audio-capture': '⚠️ Mikrofona erişilemedi. Mikrofonun bağlı/açık olduğundan ve sistem ayarlarında tarayıcıya izin verildiğinden emin olun.',
      'no-mic': '⚠️ Bu cihazda mikrofon bulunamadı. Mikrofon/kulaklık bağlayıp tekrar deneyin.',
      'mic-busy': '⚠️ Mikrofon başka bir uygulama veya sekme tarafından kullanılıyor (Zoom, Meet, WhatsApp vb.). Kapatıp tekrar deneyin.',
      'network': '⚠️ Konuşma tanıma sunucusuna ulaşılamadı. Chrome/Edge konuşmayı tanımak için internet gerektirir. Bağlantınızı kontrol edin; VPN veya reklam engelleyici açıksa kapatmayı deneyin.',
      'no-speech': 'Ses algılanamadı. Mikrofona yakın ve net şekilde kelimeyi söyleyip tekrar deneyin.',
      'aborted': 'Dinleme yarıda kesildi. Tekrar denemek için mikrofona dokunun.',
      'language-not-supported': '⚠️ Seçilen aksan bu cihazda desteklenmiyor. UK/US aksanını değiştirip tekrar deneyin.',
      'start-timeout': '⚠️ Mikrofon başlatılamadı. İzin penceresini onaylayın veya sayfayı yenileyip tekrar deneyin.',
      'start-failed': '⚠️ Mikrofon başlatılamadı. Sayfayı yenileyip tekrar deneyin.'
    };
    return messages[code] || `Mikrofon hatası (${code}). Tekrar denemek için mikrofona dokunun.`;
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

  function clearSpeechTimers() {
    if (SPEECH_ENGINE.startTimer) clearTimeout(SPEECH_ENGINE.startTimer);
    if (SPEECH_ENGINE.safetyTimer) clearTimeout(SPEECH_ENGINE.safetyTimer);
    SPEECH_ENGINE.startTimer = null;
    SPEECH_ENGINE.safetyTimer = null;
  }

  /** Dinlemeyi nazikçe bitirir; o ana kadar duyulanlar değerlendirilir. */
  function stopSpeechSession() {
    clearSpeechTimers();
    if (SPEECH_ENGINE.rec) {
      try { SPEECH_ENGINE.rec.stop(); } catch (e) {}
    }
  }

  /** Oturumu tamamen iptal eder; bekleyen olaylar yok sayılır. */
  function cancelSpeechSession() {
    SPEECH_ENGINE.session++;
    clearSpeechTimers();
    const rec = SPEECH_ENGINE.rec;
    SPEECH_ENGINE.rec = null;
    if (rec) {
      rec.onstart = rec.onresult = rec.onerror = rec.onend = rec.onspeechend = null;
      try { rec.abort(); } catch (e) {}
    }
  }

  /**
   * opts: { lang, onStart(), onInterim(text), onError(code, message), onEnd(alternatives[], errored) }
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
      let errored = false;
      let finalAlternatives = [];
      let interimText = '';

      rec.onstart = () => {
        if (isStale()) return;
        started = true;
        if (SPEECH_ENGINE.startTimer) clearTimeout(SPEECH_ENGINE.startTimer);
        if (opts.onStart) opts.onStart();
        SPEECH_ENGINE.safetyTimer = setTimeout(() => {
          if (!isStale()) { try { rec.stop(); } catch (e) {} }
        }, 8000);
      };

      rec.onresult = (evt) => {
        if (isStale()) return;
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
      };

      // Konuşma bitince hemen sonuçlandır (bazı mobil cihazlar aksi halde zaman aşımına düşüyor)
      rec.onspeechend = () => {
        if (isStale()) return;
        try { rec.stop(); } catch (e) {}
      };

      rec.onerror = (evt) => {
        if (isStale()) return;
        const code = (evt && evt.error) || 'unknown';
        // Sonuç zaten geldiyse "no-speech/aborted" gibi geç hataları önemseme
        if ((code === 'no-speech' || code === 'aborted') && (finalAlternatives.length || interimText)) return;
        errored = true;
        console.warn('Speech recognition error:', code, evt && evt.message);
        if (code === 'not-allowed' || code === 'audio-capture') {
          diagnoseMicError(code).then(realCode => {
            if (opts.onError) opts.onError(realCode, getSpeechErrorMessage(realCode));
          });
        } else if (opts.onError) {
          opts.onError(code, getSpeechErrorMessage(code));
        }
      };

      rec.onend = () => {
        if (isStale()) return;
        clearSpeechTimers();
        if (SPEECH_ENGINE.rec === rec) SPEECH_ENGINE.rec = null;
        const alternatives = finalAlternatives.length ? finalAlternatives : (interimText ? [interimText] : []);
        if (opts.onEnd) opts.onEnd(alternatives, errored);
      };

      // İzin penceresi onaylanmadan / servis hiç başlamazsa kullanıcıyı bekletme
      SPEECH_ENGINE.startTimer = setTimeout(() => {
        if (isStale() || started) return;
        cancelSpeechSession();
        if (opts.onError) opts.onError('start-timeout', getSpeechErrorMessage('start-timeout'));
        if (opts.onEnd) opts.onEnd([], true);
      }, 12000);

      try {
        rec.start();
      } catch (e) {
        console.error('Speech recognition start failed:', e);
        cancelSpeechSession();
        if (opts.onError) opts.onError('start-failed', getSpeechErrorMessage('start-failed'));
        if (opts.onEnd) opts.onEnd([], true);
      }
    };

    if (delay) setTimeout(begin, delay);
    else begin();
    return true;
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
        title: 'Mükemmel Telaffuz! 🎯',
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
          title: score >= 90 ? 'Harika Telaffuz! 🌟' : 'Gayet Başarılı! 👍',
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
      title = 'Mükemmel Telaffuz! 🎯';
      message = 'Native seviyesinde berrak ve akıcı bir telaffuz.';
    } else if (finalScore >= 70) {
      tier = 'good';
      title = 'Çok İyi! 👍';
      message = 'Anlaşılır ve doğru sesletim. Harika ilerleme!';
    } else if (finalScore >= 50) {
      tier = 'moderate';
      title = 'Yaklaştınız! 💡';
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
              🎙️ <span>Yeniden Söyle</span>
            </button>
            <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(w.en)}')">
              🔊 <span>Doğruyu Dinle</span>
            </button>
            <button type="button" class="fc-action-btn learned-btn" onclick="window.APP.closeSpeechCoach()" style="padding: 0 18px; min-height: 42px;">
              ✓ <span>Tamamla</span>
            </button>
          </div>
        </div>
      `;
    }

    dialog.innerHTML = `
      <div class="speech-coach-header">
        <div class="speech-coach-title-wrap">
          <div class="speech-coach-icon-badge">🎙️</div>
          <div>
            <h3 id="speech-coach-title" class="speech-coach-title">Speaking &amp; Telaffuz Koçu</h3>
            <p class="speech-coach-sub">Yapay Zeka Destekli Fonetik Değerlendirme</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <button type="button" class="coach-accent-btn" onclick="window.APP.toggleCoachAccent()" title="Aksanı Değiştir (UK / US)">
            ${accentCode} (${accentCode === 'US' ? 'en-US' : 'en-GB'})
          </button>
          <button type="button" class="coach-close-btn" onclick="window.APP.closeSpeechCoach()" aria-label="Kapat">✕</button>
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
            <span style="font-size:1.4rem;">⚠️</span>
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

            <div class="coach-status-text" id="coach-status-text" ${(!COACH_STATE.isListening && COACH_STATE.errorMessage) ? 'role="alert" style="color: var(--dp-color-red); font-weight: 600;"' : ''}>
              ${COACH_STATE.isListening 
                ? 'Sizi dinliyorum... Kelimeyi seslendirin 🎙️' 
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

      </div>
    `;
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
    COACH_STATE.lastEvaluation = null;
    COACH_STATE.isListening = true;
    renderSpeechCoachDialog();

    const targetEn = COACH_STATE.targetWord.en;
    const accentCode = (STATE.settings.accent || 'en-GB').includes('US') ? 'en-US' : 'en-GB';

    startSpeechSession({
      lang: accentCode,
      onStart: () => {
        const statusEl = document.getElementById('coach-status-text');
        if (statusEl) statusEl.textContent = 'Dinleniyor... Lütfen konuşun 🎙️';
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
    stopSpeechSession();
    COACH_STATE.isListening = false;
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
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
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

  function toggleLearned(wordId) {
    wordId = parseInt(wordId, 10);
    const wordObj = WORDS_DATA.find(w => w.id === wordId);
    if (STATE.userData.learned.has(wordId)) {
      STATE.userData.learned.delete(wordId);
    } else {
      STATE.userData.learned.add(wordId);
      STATE.userData.review.delete(wordId);
      const modMap = {
        maarif: 'MEB 5. SINIF MAARİF',
        yds: 'YDS & YÖKDİL AKADEMİK',
        oxford: 'THE OXFORD 5000',
        all: 'TÜM KÜTÜPHANE'
      };
      const modTitle = modMap[STATE.activeModule] || '5. SINIF MAARİF MODELİ';
      const wEn = wordObj ? wordObj.en.toUpperCase() : `#${wordId}`;
      logActivity(`${modTitle} • GÜN ${STATE.currentDay}`, `KELİME DOĞRULANDI [${wEn}] • TOPLAM: ${STATE.userData.learned.size}`);
    }
    saveUserData();
    updateUI();
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
    updateUI();
  }

  function toggleStarred(wordId) {
    wordId = parseInt(wordId, 10);
    if (STATE.userData.starred.has(wordId)) {
      STATE.userData.starred.delete(wordId);
    } else {
      STATE.userData.starred.add(wordId);
    }
    saveUserData();
    updateUI();
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
        record.interval = Math.max(7, Math.round(record.interval * record.easeFactor));
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
        record.interval = Math.max(8, Math.round(record.interval * record.easeFactor * 1.35));
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
    if (activeMod === 'maarif') pool = WORDS_DATA.filter(isMaarifWord);
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
    if (activeMod === 'maarif') pool = WORDS_DATA.filter(isMaarifWord);
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
    if (activeMod === 'maarif') pool = WORDS_DATA.filter(isMaarifWord);
    else if (activeMod === 'yds') pool = WORDS_DATA.filter(isYDSWord);
    else if (activeMod === 'oxford') pool = WORDS_DATA.filter(isOxfordWord);

    let dueCount = 0;
    let newCount = 0;
    let learningCount = 0;
    let reviewingCount = 0;
    let masteredCount = 0;

    pool.forEach(w => {
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
    if (activeMod === 'maarif') pool = WORDS_DATA.filter(isMaarifWord);
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
      <div class="recovery-toast-icon">🎉</div>
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
    if (p.includes('verb') || p.includes('fiil')) return 'verb';
    if (p.includes('noun') || p.includes('isim')) return 'noun';
    if (p.includes('adj') || p.includes('sıfat') || p.includes('adv') || p.includes('zarf')) return 'adj_adv';
    return 'other';
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
  function openSettingsModal() {
    const backdrop = document.getElementById('settings-modal-backdrop');
    const dialog = document.getElementById('settings-dialog');
    if (backdrop) backdrop.classList.add('active');
    if (dialog) dialog.classList.add('active');
    document.body.classList.add('modal-open');
  }

  function closeSettingsModal() {
    const backdrop = document.getElementById('settings-modal-backdrop');
    const dialog = document.getElementById('settings-dialog');
    if (backdrop) backdrop.classList.remove('active');
    if (dialog) dialog.classList.remove('active');
    document.body.classList.remove('modal-open');
  }

  function openCurriculumModal() {
    openSettingsModal();
  }

  function openModesModal() {
    openSettingsModal();
  }

  function closeModals() {
    closeSettingsModal();
  }

  function switchModuleAndClose(moduleKey) {
    switchModule(moduleKey);
    closeModals();
  }

  function switchViewAndClose(viewKey) {
    switchView(viewKey);
    closeModals();
  }

  function handleFabAction() {
    if (STATE.currentView === 'home') {
      switchView('daily');
    } else if (STATE.currentView === 'daily') {
      startDailyQuiz();
    } else if (STATE.currentView === 'flashcard') {
      startDailyQuiz();
    } else if (STATE.currentView === 'quiz') {
      startQuizSession(10);
    } else {
      switchView('daily');
    }
  }

  function updateMobileTriggerLabels() {
    const titleEl = document.getElementById('header-user-title');
    const modTitles = {
      maarif: 'MEB Müfredatı',
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'The Oxford 5000',
      all: 'Tüm Kütüphane'
    };
    if (titleEl && STATE.currentView === 'home') {
      titleEl.textContent = modTitles[STATE.activeModule] || '5. Sınıf Maarif Modeli';
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

    const modTitles = {
      maarif: 'MEB Müfredatı',
      yds: 'YDS & YÖKDİL Akademik',
      oxford: 'The Oxford 5000',
      all: 'Tüm Kütüphane'
    };
    const titleEl = document.getElementById('header-user-title');
    if (titleEl && STATE.currentView === 'home') {
      titleEl.textContent = modTitles[moduleName] || '5. Sınıf Maarif Modeli';
    }

    // Update brand info subtitle - Architectural micro-goal telemetry
    const brandSub = document.getElementById('app-brand-subtitle');
    if (brandSub) {
      if (moduleName === 'maarif') brandSub.innerText = 'MEB Müfredatı • 5. Sınıf Maarif Modeli (817 Kelime)';
      else if (moduleName === 'yds') brandSub.innerText = 'YDS & YÖKDİL Akademik • Günlük Hedef: 20 Kelime';
      else if (moduleName === 'oxford') brandSub.innerText = 'The Oxford 5000 • Günlük Hedef: 25 Kelime';
      else brandSub.innerText = 'Tüm Kütüphane • Akademik Kelime Arşivi';
    }

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
      STATE.directoryPage = 1;
      STATE.flashcardSource = 'yds_all';
    } else if (moduleName === 'maarif') {
      if (dailyText) dailyText.innerText = "MEB Günün 10'lusu";
      if (flashText) flashText.innerText = "MEB Kartları";
      if (quizText) quizText.innerText = "MEB Quiz";
      if (dirText) dirText.innerText = "MEB 5. Sınıf Havuzu";
      if (statsText) statsText.innerText = "MEB Kazanım Analizi";
      STATE.directoryFilters.dataset = 'maarif';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.directoryPage = 1;
      STATE.flashcardSource = 'daily';
    } else if (moduleName === 'oxford') {
      if (dailyText) dailyText.innerText = "Günün Kelimeleri";
      if (flashText) flashText.innerText = "CEFR Kartları";
      if (quizText) quizText.innerText = "Seviye Testi";
      if (dirText) dirText.innerText = "Oxford 5000";
      if (statsText) statsText.innerText = "CEFR Analizi";
      STATE.directoryFilters.dataset = 'oxford';
      STATE.directoryFilters.cefr = 'all';
      STATE.directoryFilters.search = '';
      STATE.directoryPage = 1;
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
      STATE.directoryPage = 1;
      STATE.flashcardSource = 'all';
    }

    updateUI();
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
      const distractors = WORDS_DATA
        .filter(w => w.id !== t.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

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
    const curriculumSubtitles = {
      maarif: 'MEB MÜFREDATI • 5. SINIF MAARİF MODELİ',
      yds: 'HEDEF MÜFREDAT • YDS & YÖKDİL AKADEMİK',
      oxford: 'HEDEF MÜFREDAT • THE OXFORD 5000',
      all: 'HEDEF MÜFREDAT • TÜM AKADEMİK KÜTÜPHANE'
    };
    const activeCurriculumSubtitle = curriculumSubtitles[module] || 'MEB MÜFREDATI • 5. SINIF MAARİF MODELİ';

    const maarifPool = WORDS_DATA.filter(isMaarifWord);
    const ydsPool = WORDS_DATA.filter(isYDSWord);
    const oxfordPool = WORDS_DATA.filter(isOxfordWord);

    const curMaarifThemeNum = Math.min(8, Math.max(1, Math.ceil((STATE.currentDay || 1) / 10)));
    const curMaarifTheme = THEMES_DATA[curMaarifThemeNum] || { code: `THEME ${curMaarifThemeNum}`, titleTr: 'Okul Yaşamı' };

    const unitTitles = {
      maarif: `MEB 5. Sınıf Maarif • ${curMaarifTheme.code}: ${curMaarifTheme.titleTr}`,
      yds: 'YDS/YÖKDİL • 2020–2026 Akademik Sınav Soruları & Kalıpları',
      oxford: 'Oxford 5000 • CEFR A1–C1 Uluslararası Standart',
      all: `Learnish Arşiv: ${WORDS_DATA.length.toLocaleString('tr-TR')} Kelimelik Birleşik Kütüphane`
    };
    const activeUnitTitle = unitTitles[module] || unitTitles.maarif;

    const moduleTotalDays = {
      maarif: Math.ceil(maarifPool.length / 10),
      yds: Math.ceil(ydsPool.length / 20),
      oxford: Math.ceil(oxfordPool.length / 25),
      all: Math.ceil(WORDS_DATA.length / 25)
    };
    const totalDayCount = moduleTotalDays[module] || 82;

    // Telemetry Metrics (Live Data)
    const learnedCount = STATE.userData.learned.size;
    const quizStats = STATE.userData.stats || { quizzesPlayed: 0, correctAnswers: 0, totalQuestions: 0, bestStreak: 0 };
    const streakDays = Math.max(STATE.quizState.streak || 0, quizStats.bestStreak || 0);
    const streakFormatted = String(streakDays).padStart(2, '0') + ' GÜN';
    const accuracyVal = quizStats.totalQuestions > 0
      ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100)
      : 0;
    const accuracyText = quizStats.totalQuestions > 0 ? `%${accuracyVal} DOĞRULUK` : '%0 DOĞRULUK';

    const srsDueWords = getSRSDueWords();
    const activeMistakes = getActiveMistakeWords();
    const srsStats = getSRSStats();

    // Row 3 Block A: Debug Queue (Zayıf Halkalar - Gerçek Tekrar Verileri)
    const reviewWords = WORDS_DATA.filter(w => STATE.userData.review.has(w.id)).slice(0, 3);
    let debugListHtml = '';
    if (reviewWords.length === 0) {
      debugListHtml = `
        <div style="padding: 24px 12px; color: var(--dp-color-ink-muted); font-size: 0.85rem; text-align: center;">
          ✨ Şu an tekrar kuyruğunuz temiz. Testlerde yanlış cevaplanan kelimeler anında buraya eklenir.
        </div>
      `;
    } else {
      debugListHtml = reviewWords.map(item => `
        <div class="dash-debug-row">
          <div class="dash-debug-word-group">
            <span class="dash-debug-en">${item.en}</span>
            <span class="dash-debug-tr">${item.tr}</span>
          </div>
          <button type="button" class="dash-retest-btn" onclick="window.APP.retestDebugWord('${item.en.replace(/'/g, "\\'")}')">
            Yeniden Test Et ↺
          </button>
        </div>
      `).join('');
    }

    // Row 3 Block B: Mastery Heatmap (Gerçek Tema & Kazanım İlerlemesi)
    const heatmapCategories = ['Nouns', 'Verbs', 'Adjectives', 'Phrases', 'Collocations', 'Review'];
    const totalSquares = 48; // 8 tema x 6 kazanım hücresi
    let heatmapSquaresHtml = '';
    for (let i = 0; i < totalSquares; i++) {
      const unitNum = Math.floor(i / 6) + 1;
      const catName = heatmapCategories[i % heatmapCategories.length];
      const themeWords = WORDS_DATA.filter(w => w.themeNum === unitNum);
      const learnedInTheme = themeWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const stepThreshold = Math.max(1, Math.ceil((themeWords.length / 6) * ((i % 6) + 1)));
      const isMastered = learnedInTheme >= stepThreshold && learnedInTheme > 0;
      const statusLabel = isMastered ? 'Kazanıldı' : 'Bekliyor';
      const themeName = THEMES_DATA[unitNum]?.titleTr || `Tema ${unitNum}`;
      const titleText = `Tema ${unitNum} (${themeName}) - ${catName}: ${statusLabel} (${learnedInTheme}/${themeWords.length} kelime)`;
      heatmapSquaresHtml += `<button type="button" class="heatmap-cell ${isMastered ? 'mastered' : ''}" title="${titleText}" aria-label="${titleText}" onclick="window.APP.selectHeatmapUnit(${unitNum})"></button>`;
    }

    // Row 4: Terminal Log / Recent Activity (Gerçek Aktivite Günlüğü)
    const savedLogs = Array.isArray(STATE.userData.activityLog) && STATE.userData.activityLog.length > 0
      ? STATE.userData.activityLog.slice(0, 5)
      : [];

    let terminalRowsHtml = '';
    if (savedLogs.length === 0) {
      terminalRowsHtml = `
        <tr>
          <td colspan="4" style="text-align: center; padding: 24px; color: var(--dp-color-ink-muted); font-size: 0.85rem;">
            Henüz bir aktivite kaydı bulunmuyor. Günün kelimelerini veya test modüllerini tamamladıkça kayıtlar buraya işlenir.
          </td>
        </tr>
      `;
    } else {
      terminalRowsHtml = savedLogs.map(row => `
        <tr>
          <td>${row.date}</td>
          <td>${row.module}</td>
          <td>${row.action || 'Öğrenme Oturumu'}</td>
          <td class="dash-terminal-result">${row.result}</td>
        </tr>
      `).join('');
    }

    container.innerHTML = `
      <!-- HERO FEATURE CARD (40px Radius & Atmospheric Depth) -->
      <article class="hero-feature-card">
        <!-- 1. Semi-transparent decorative blob (#b7c6c2/20) in top-right -->
        <div class="hero-decorative-blob" aria-hidden="true"></div>

        <!-- 2. 64x64px white square icon holder with an emoji -->
        <div class="hero-icon-holder" aria-hidden="true">
          <span>🎯</span>
        </div>

        <!-- Labels & Headings -->
        <div class="hero-label-wrap">
          <span class="hero-tag-label">${activeCurriculumSubtitle}</span>
          <h2 class="hero-card-title">${activeUnitTitle}</h2>
          <p class="hero-card-desc">Günün mikro kelime hedefini tamamlayarak aktif kelime dağarcığını kalıcı kıl.</p>
        </div>

        <!-- 3. Nested 2-column grid for metrics (Bento Metric Cards) -->
        <div class="bento-metrics-grid">
          <div class="bento-metric-card">
            <span class="bento-card-title">GÜNLÜK SERİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">🔥</div>
              <span class="bento-val">${streakFormatted}</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">HAFIZA KALICILIĞI</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">🧠</div>
              <span class="bento-val">%${srsStats.retentionRate} (${srsStats.masteredCount} USTA)</span>
            </div>
          </div>

          <div class="bento-metric-card ${srsDueWords.length > 0 ? 'metric-highlight-due' : ''}">
            <span class="bento-card-title">ARALIKLI TEKRAR</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">🔁</div>
              <span class="bento-val">${srsDueWords.length} BEKLEYEN</span>
            </div>
          </div>

          <div class="bento-metric-card ${activeMistakes.length > 0 ? 'metric-highlight-mistake' : ''}">
            <span class="bento-card-title">HATA DEFTERİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">🛑</div>
              <span class="bento-val">${activeMistakes.length} ZAYIF NOKTA</span>
            </div>
          </div>
        </div>

        <!-- 4. Alert/info box at the bottom using #b7c6c2/20 background -->
        <div class="hero-alert-box">
          <span class="alert-icon">💡</span>
          <span class="alert-text"><strong>Bilişsel Pedagoji:</strong> SM-2 aralıklı tekrar algoritması, kelimeleri unutmaya en yakın olduğunuz anda hatırlatarak hafıza kalıcılığını 4 katına çıkarır.</span>
        </div>

        <!-- Primary High-Impact CTA in Red (#ca0013) -->
        <button type="button" class="hero-primary-cta-btn" onclick="window.APP.switchView('daily')">
          <span>${module === 'yds' ? "GÜNÜN 20'SİNİ BAŞLAT" : "GÜNÜN 10'LUSUNU BAŞLAT"}</span>
          <span class="cta-arrow">→</span>
        </button>
      </article>

      <!-- AKILLI PEDAGOJİ & TEKRAR MERKEZİ (Station Cards) -->
      <section class="pedagogy-station-section" aria-label="Akıllı Hafıza &amp; Tekrar İstasyonu">
        <div class="pedagogy-station-header">
          <div>
            <span class="pedagogy-station-badge">🧠 AKILLI PEDAGOJİ SİSTEMİ</span>
            <h3 class="pedagogy-station-title">Bilişsel Hafıza &amp; Hata Ayıklama İstasyonu</h3>
          </div>
          <span class="pedagogy-station-subtitle">SM-2 Spaced Repetition + Hata Defteri</span>
        </div>

        <div class="pedagogy-station-grid">
          <!-- Kart 1: Aralıklı Tekrar -->
          <div class="pedagogy-card srs-card ${srsDueWords.length > 0 ? 'has-due' : ''}">
            <div class="ped-card-top">
              <span class="ped-tag">🔁 BİLİŞSEL TEKRAR KUYRUĞU</span>
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
                🃏 Kartlarla Tekrar Et (${srsDueWords.length})
              </button>
              <button type="button" class="ped-btn ped-btn-secondary" onclick="window.APP.startSRSDueQuiz()" ${srsDueWords.length === 0 ? 'disabled' : ''}>
                ⚡ Hızlı SRS Testi
              </button>
            </div>
          </div>

          <!-- Kart 2: Akıllı Hata Defteri -->
          <div class="pedagogy-card mistake-card ${activeMistakes.length > 0 ? 'has-mistakes' : ''}">
            <div class="ped-card-top">
              <span class="ped-tag">🛑 ZAYIF NOKTALAR &amp; GELİŞİM</span>
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
                  return `<span class="mistake-preview-pill" onclick="window.APP.retestDebugWord('${w.en.replace(/'/g, "\\'")}')" title="Bu kelimeyi test et"><strong>${w.en}</strong> (${m ? m.wrongCount : 1}x hata) ↺</span>`;
                }).join('')}
              </div>
            ` : ''}

            <div class="ped-card-actions">
              <button type="button" class="ped-btn ped-btn-mistake" onclick="window.APP.startMistakeQuiz()" ${activeMistakes.length === 0 ? 'disabled' : ''}>
                🎯 Kurtarma Kampı Sınavı
              </button>
              <button type="button" class="ped-btn ped-btn-secondary" onclick="window.APP.startMistakeFlashcards()" ${activeMistakes.length === 0 ? 'disabled' : ''}>
                🃏 Hata Kartları
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- SECONDARY FEED ITEMS (24px Radius, White, #b7c6c2/30 Border) -->
      <section class="secondary-feed-section" aria-label="Öğrenim Akışı ve Aktiviteler">
        <div class="feed-section-heading">
          <span>ÖĞRENİM AKIŞI &amp; AKTİVİTELER</span>
          <span class="feed-section-badge">GÜNLÜK MODÜLLER</span>
        </div>

        <!-- Feed Item 1: Tekrar Kuyruğu -->
        <div class="secondary-feed-card">
          <div class="feed-icon-box">🔁</div>
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Hata Ayıklama &amp; Tekrar Kuyruğu</h4>
            <p class="feed-card-desc">
              ${reviewWords.length > 0
                ? `${reviewWords.length} kelime tekrar bekliyor: <strong>${reviewWords.map(w => w.en).join(', ')}</strong>`
                : 'Tekrar listeniz temiz, harika gidiyorsunuz!'}
            </p>
          </div>
          <button type="button" class="feed-trailing-btn" onclick="window.APP.switchView('flashcard')" aria-label="Tekrarı Başlat" title="Tekrarı Başlat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Feed Item 2: Flashcard -->
        <div class="secondary-feed-card">
          <div class="feed-icon-box">🗂️</div>
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Flashcard İnceleme Kartları</h4>
            <p class="feed-card-desc">İki yüzlü interaktif kartlar, fonetik telaffuz ve örnek cümle bağlamları.</p>
          </div>
          <button type="button" class="feed-trailing-btn" onclick="window.APP.switchView('flashcard')" aria-label="Kartları İncele" title="Kartları İncele">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Feed Item 3: Quiz Test -->
        <div class="secondary-feed-card">
          <div class="feed-icon-box">⚡</div>
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Kazanım Sınavı &amp; Aktif Hatırlama</h4>
            <p class="feed-card-desc">Çoktan seçmeli, dinleme ve anlam eşleştirme sorularıyla kendini sına.</p>
          </div>
          <button type="button" class="feed-trailing-btn" onclick="window.APP.switchView('quiz')" aria-label="Testi Başlat" title="Testi Başlat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Feed Item 4: Kelime Havuzu -->
        <div class="secondary-feed-card">
          <div class="feed-icon-box">📚</div>
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Kelime Kütüphanesi &amp; Arama</h4>
            <p class="feed-card-desc">${WORDS_DATA.length.toLocaleString('tr-TR')} kelimelik birleşik sözlük veritabanında anında arama ve filtreleme.</p>
          </div>
          <button type="button" class="feed-trailing-btn" onclick="window.APP.switchView('directory')" aria-label="Kütüphaneye Git" title="Kütüphaneye Git">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <!-- Feed Item 5: İstatistikler -->
        <div class="secondary-feed-card">
          <div class="feed-icon-box">📊</div>
          <div class="feed-content-wrap">
            <h4 class="feed-card-title">Öğrenim Telemetrisi &amp; Analiz</h4>
            <p class="feed-card-desc">Tema bazlı ilerleme, başarı grafiği ve çalışma oturumu geçmişi.</p>
          </div>
          <button type="button" class="feed-trailing-btn" onclick="window.APP.switchView('stats')" aria-label="İstatistikleri İncele" title="İstatistikleri İncele">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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
      targetPool = WORDS_DATA.filter(isMaarifWord);
      batchSize = 10;
      const curThemeNum = (targetPool[(STATE.currentDay - 1) * batchSize] && targetPool[(STATE.currentDay - 1) * batchSize].themeNum) || Math.min(8, Math.max(1, Math.ceil(STATE.currentDay / 10)));
      const curTheme = (typeof THEMES_DATA !== 'undefined' && THEMES_DATA[curThemeNum]) ? THEMES_DATA[curThemeNum] : { titleTr: 'Okul Yaşamı' };
      bannerTitle = `GÜN ${STATE.currentDay} • MEB 5. SINIF MAARİF • TEMA ${curThemeNum}: ${(curTheme.titleTr || curTheme.title || 'Okul Yaşamı').toUpperCase()}`;
      bannerDesc = `MEB 5. Sınıf İngilizce Maarif Modeli günlük ${batchSize} kelimelik odaklı çalışma.`;
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
              <span class="dmc-icon-badge">📅</span>
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
              <span class="dmc-icon-badge">📌</span>
              <div class="dmc-info">
                <span class="dmc-tag">ÖZEL SEÇİM İNCELENİYOR (GÜN ${STATE.currentDay})</span>
                <span class="dmc-title">Şu an seçtiğiniz günün kelimelerini inceliyorsunuz. MEB takvimine göre bugünün dersi: Gün ${todayMEB.day} (${todayMEB.dateFormatted})</span>
              </div>
            </div>
            <button type="button" class="dmc-return-btn" onclick="window.APP.goToTodayMEBDay()">
              📍 <span>Bugünün MEB Planına Dön (Gün ${todayMEB.day})</span>
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
            <span class="dcr-tag-badge">📚 KÜMÜLATİF TEKRAR & PEKİŞTİRME</span>
            <span class="dcr-meta-badge">1. GÜN &rarr; ${STATE.currentDay}. GÜN TOPLAMI (${cumulativeCount} KELİME)</span>
          </div>
          <div class="dcr-body">
            <h3 class="dcr-title">Geçmiş Günlerin Kelimelerini Tekrar Et & Test Ol</h3>
            <p class="dcr-desc">
              1. günden ${STATE.currentDay}. güne kadar işlenen tüm geçmiş kelimeleri (${cumulativeCount} kelime) hafızada kalıcı hale getirmek için kartları baştan sona gözden geçirebilir veya kümülatif değerlendirme testine katılabilirsiniz.
            </p>
            <div class="dcr-actions-row">
              <button type="button" class="fc-action-btn dcr-action-btn" onclick="window.APP.startPastDaysFlashcards(false)">
                🗂️ <span>Geçmiş Kartları Tekrar Et (${cumulativeCount})</span>
              </button>
              <button type="button" class="fc-action-btn dcr-action-btn" onclick="window.APP.startPastDaysFlashcards(true)" title="Geçmiş günlerin tüm kelimelerini rastgele karıştırarak kart çalışması başlat">
                🔀 <span>Karışık Kart Tekrarı</span>
              </button>
              <button type="button" class="fc-action-btn learned-btn dcr-action-btn" onclick="window.APP.startPastDaysQuiz()">
                ⚡ <span>Geçmiş Günlerin Testi (Kümülatif Sınav) &rarr;</span>
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
          <span class="alert-icon">🎉</span>
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
                🔊
              </button>
              <button type="button" class="feed-icon-box coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(w.en)}')" title="🎙️ Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu: ${w.en}" style="background: rgba(202, 0, 19, 0.08); color: var(--dp-color-red); border-color: rgba(202, 0, 19, 0.2);">
                🎙️
              </button>
            </div>

            <!-- Content Wrap -->
            <div class="feed-content-wrap">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
                <h4 class="feed-card-title">${w.en}</h4>
                ${w.phonetic ? `<span class="feed-card-meta">${w.phonetic}</span>` : ''}
                ${getCefrBadgeHtml(w.cefr)}
                ${prepBadge ? `<span class="yds-prep-tag" title="Sık kullanılan edat">${prepBadge}</span>` : ''}
                ${curMistake && !curMistake.cleared ? `<span class="pedagogy-badge mistake-badge" title="Hata Defterinde (${curMistake.wrongCount}x Yanlış)">🛑 ${curMistake.wrongCount}x Hata</span>` : ''}
                ${curSRS ? `<span class="pedagogy-badge srs-badge ${curSRS.state}" title="Aralıklı Tekrar Aralığı: ${curSRS.interval} gün">🔁 ${curSRS.state === 'mastered' ? 'Kalıcı' : (curSRS.interval || 1) + 'g'}</span>` : ''}
              </div>
              <div class="feed-card-tr">${w.tr || '<span style="color:var(--dp-color-ink-muted); font-style:italic;">(Anlamı ekleniyor)</span>'}</div>
              <div class="feed-card-meta">${w.desc || ''} ${w.cat ? '• ' + w.cat : ''}</div>
              ${w.definition && w.definition.toLowerCase().trim() !== (w.tr || '').toLowerCase().trim() ? `<div class="feed-card-desc">"${w.definition}"</div>` : ''}
              ${syn ? `<div class="feed-card-meta" style="color:var(--dp-color-red);"><strong>EŞ ANLAM:</strong> ${syn}</div>` : ''}
              ${w.example ? `<div class="feed-card-example">“${highlightWordInText(w.example.replace(/^["“”]|["“”]$/g, ''), w.en)}”</div>` : ''}
              ${w.ydsExample ? `<div class="yds-exam-cite-tag">📝 <strong>ÖSYM Sınav Kaynağı:</strong> ${escapeHtml(w.ydsExample)}</div>` : ''}
            </div>

            <!-- Trailing Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 8px; align-items: center;">
              <!-- 40px Circular Trailing Learned Checkbox Button -->
              <button type="button" class="feed-trailing-btn ${isLearned ? 'checked' : ''}" onclick="window.APP.toggleLearned(${w.id})" title="${isLearned ? 'Öğrenildi' : 'Öğrenildi Olarak İşaretle'}" aria-label="Öğrenildi"></button>
              <!-- Star / Repeat toggle -->
              <button type="button" class="feed-trailing-btn ${isStarred ? 'active' : ''}" onclick="window.APP.toggleStarred(${w.id})" title="${isStarred ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}" aria-label="Favori" style="font-size: 14px;">
                ${isStarred ? '★' : '☆'}
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
              <div class="bento-circular-icon">🎯</div>
              <span class="bento-val">${dayLearnedCount} / ${dayWords.length} KELİME</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">BAŞARI YÜZDESİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">⚡</div>
              <span class="bento-val">%${dayPercent} TAMAMLANDI</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">KÜTÜPHANE İNDEKSİ</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">📚</div>
              <span class="bento-val">${startIndex + 1}–${Math.min(startIndex + batchSize, targetPool.length)} / ${targetPool.length}</span>
            </div>
          </div>

          <div class="bento-metric-card">
            <span class="bento-card-title">HEDEF ZAMANLAMA</span>
            <div class="bento-card-content">
              <div class="bento-circular-icon">⏱️</div>
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
            🗂️ <span>Günün Kartlarıyla Çalış</span>
          </button>
          <button type="button" class="fc-action-btn" onclick="window.APP.startDailyFlashcards(true)" title="Kelimeleri rastgele karıştırarak başlat">
            🔀 <span>Karışık Başlat</span>
          </button>
          <button type="button" class="fc-action-btn learned-btn" onclick="window.APP.startDailyQuiz()">
            ⚡ <span>Günün Testini Başlat →</span>
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
        const targetPool = isYDS 
          ? WORDS_DATA.filter(isYDSWord) 
          : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : WORDS_DATA.filter(isMaarifWord)));
        const bSize = isYDS ? 20 : (isOxford || isAll ? 25 : 10);
        const start = (STATE.currentDay - 1) * bSize;
        pool = targetPool.slice(start, start + bSize);
      } else if (sourceVal === 'past_cumulative') {
        const isYDS = STATE.activeModule === 'yds';
        const isOxford = STATE.activeModule === 'oxford';
        const isAll = STATE.activeModule === 'all';
        const targetPool = isYDS 
          ? WORDS_DATA.filter(isYDSWord) 
          : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : WORDS_DATA.filter(isMaarifWord)));
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
        pool = WORDS_DATA.filter(isMaarifWord);
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
      <optgroup label="🧠 Akıllı Pedagoji &amp; Hafıza">
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
        <option value="maarif_all" ${sourceVal === 'maarif_all' ? 'selected' : ''}>MEB: 5. Sınıf Maarif Modeli (${WORDS_DATA.filter(isMaarifWord).length.toLocaleString('tr-TR')} Kelime)</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>YDS &amp; YÖKDİL Akademik (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')} Kelime)</option>
        <option value="oxford_all" ${sourceVal === 'oxford_all' ? 'selected' : ''}>The Oxford 5000 (Tümü - ${WORDS_DATA.filter(isOxfordWord).length.toLocaleString('tr-TR')})</option>
        <option value="oxford_a1" ${sourceVal === 'oxford_a1' ? 'selected' : ''}>Oxford 5000: A1 Başlangıç</option>
        <option value="oxford_a2" ${sourceVal === 'oxford_a2' ? 'selected' : ''}>Oxford 5000: A2 Temel</option>
        <option value="oxford_b1" ${sourceVal === 'oxford_b1' ? 'selected' : ''}>Oxford 5000: B1 Orta</option>
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
            <div style="font-size: 2rem; margin-bottom: 12px;">🗂️</div>
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
                  ${curMistake && !curMistake.cleared ? `<span class="pedagogy-badge mistake-badge" title="Hata Defterinde">🛑 ${curMistake.wrongCount}x HATA</span>` : ''}
                  ${curSRS ? `<span class="pedagogy-badge srs-badge ${curSRS.state}" title="Aralıklı Tekrar Aralığı: ${curSRS.interval} gün">🔁 ${curSRS.state === 'mastered' ? 'Kalıcı Bellek' : (curSRS.interval || 1) + 'g Tekrar'}</span>` : ''}
                </div>
                <div class="fc-audio-action-group" style="display:inline-flex; gap:6px; align-items:center;">
                  <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle" aria-label="Dinle">
                    ${ICONS.speaker}
                  </button>
                  <button class="speak-btn coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(currentWord.en)}')" title="🎙️ Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu">
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
                  <button class="speak-btn coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(currentWord.en)}')" title="🎙️ Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu">
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
                  <span class="srs-pill-item">🔁 <strong>Tekrar Aralığı:</strong> ${curSRS ? (curSRS.interval || 1) + ' Gün' : 'Yeni'}</span>
                  <span class="srs-pill-item">⚡ <strong>Hafıza Gücü:</strong> %${curSRS ? Math.round(curSRS.easeFactor * 100) : 250}</span>
                  ${curMistake && !curMistake.cleared ? `
                    <span class="srs-pill-item srs-pill-mistake">🛑 <strong>Hata Geçmişi:</strong> ${curMistake.wrongCount}x Yanlış (${Math.max(0, 2 - (curMistake.consecutiveCorrect || 0))} doğru sonra temizlenir)</span>
                  ` : ''}
                </div>

                ${currentWord.definition && currentWord.definition.toLowerCase().trim() !== (currentWord.tr || '').toLowerCase().trim() ? `<div class="word-def" style="max-width: 52ch;">“${currentWord.definition}”</div>` : ''}
                ${currentWord.example ? `<div class="word-example" style="max-width: 52ch;">“${highlightWordInText(currentWord.example.replace(/^["“”]|["“”]$/g, ''), currentWord.en)}”</div>` : ''}
                ${currentWord.ydsExample ? `<div class="yds-exam-cite-tag" style="margin-top:8px;">📝 <strong>ÖSYM Sınav Kaynağı:</strong> ${escapeHtml(currentWord.ydsExample)}</div>` : ''}
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
            <span class="fc-btn-top">🛑 ZOR / TEKRAR</span>
            <span class="fc-btn-sub">1 gün sonra</span>
            <span class="kbd-badge">1</span>
          </button>

          <button class="fc-action-btn fc-btn-good ${isLearned ? 'active' : ''}" onclick="window.APP.markFlashcardSRS(${currentWord.id}, 4)" title="İyi / Hatırladım">
            <span class="fc-btn-top">⚡ İYİ / HATIRLADIM</span>
            <span class="fc-btn-sub">${nextGoodDays} gün sonra</span>
            <span class="kbd-badge">2</span>
          </button>

          <button class="fc-action-btn fc-btn-easy" onclick="window.APP.markFlashcardSRS(${currentWord.id}, 5)" title="Çok Kolay / Zihnimde">
            <span class="fc-btn-top">✨ KOLAY / ZİHNİMDE</span>
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
                  <span class="resume-quiz-badge">📌 OTURUM KAYDEDİLDİ</span>
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
                  <option value="speaking">🎙️ Telaffuz &amp; Speaking Sınavı (Mikrofonla Oku)</option>
                </select>
              </div>

              <div class="config-group">
                <label for="quiz-source-select">Soru Kaynağı</label>
                <select id="quiz-source-select">
                  <optgroup label="🧠 Akıllı Pedagoji &amp; Hafıza">
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
                    <option value="maarif">MEB: 5. Sınıf Maarif Modeli</option>
                    <option value="oxford_all">The Oxford 5000 (Tüm Havuz)</option>
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
      'speaking': '🎙️ TELAFFUZ & SPEAKING',
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
      pool = WORDS_DATA.filter(isMaarifWord);
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

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      pool = pool.filter(w => 
        w.en.toLowerCase().includes(q) || 
        (w.tr && w.tr.toLowerCase().includes(q)) ||
        (w.synonym && w.synonym.toLowerCase().includes(q)) ||
        (w.definition && w.definition.toLowerCase().includes(q))
      );
    }
    return pool;
  }

  function generateWordCardsHtml(words) {
    if (!words || words.length === 0) {
      return `
        <div class="empty-state-box glass-panel" style="grid-column: 1 / -1; margin: 32px 0; text-align: center; padding: 32px; border: 2px solid var(--dp-color-border); background: var(--dp-color-surface);">
          <div class="empty-icon" style="font-size: 2rem; margin-bottom: 8px;">[ 0 ]</div>
          <div class="empty-title" style="font-weight: 800; font-size: 1.1rem;">Arama kriterlerine uygun kelime bulunamadı</div>
          <div class="empty-desc" style="color: var(--dp-color-ink-muted); font-size: 0.85rem; margin-top: 6px;">Filtreleri değiştirerek veya farklı bir kelime aratarak tekrar deneyin.</div>
        </div>
      `;
    }
    return words.map(w => {
      const isLearned = STATE.userData.learned.has(w.id);
      const isReview = STATE.userData.review.has(w.id);
      const isStarred = STATE.userData.starred.has(w.id);
      const prepBadge = extractPreposition(w);
      const syn = getWordSynonym(w);

      return `
        <div class="word-card glass-panel" data-id="${w.id}">
          <div class="card-top">
            <div class="card-tags">
              ${getCefrBadgeHtml(w.cefr)}
              ${w.themeCode ? getThemeBadgeHtml(w.themeCode, w.themeTitle) : ''}
              ${prepBadge ? `<span class="yds-prep-tag">${prepBadge}</span>` : ''}
            </div>
            <span class="word-number">#${w.no || w.id}</span>
          </div>

          <div class="card-body">
            <div class="word-en-row">
              <span class="word-en">${w.en}</span>
              ${w.phonetic ? `<span class="word-phonetic">${w.phonetic}</span>` : ''}
              <div class="card-audio-btns" style="display:inline-flex; gap:6px; margin-left:auto; align-items:center;">
                <button class="speak-btn" data-word="${w.en}" aria-label="Dinle: ${w.en}">${ICONS.speaker}</button>
                <button class="speak-btn coach-mic-btn" onclick="event.stopPropagation(); window.APP.openSpeechCoach('${escapeHtml(w.en)}')" title="🎙️ Speaking Koçu ile Telaffuz Et" aria-label="Telaffuz Koçu: ${w.en}">
                  ${ICONS.mic}
                </button>
              </div>
            </div>
            <div class="word-tr">${w.tr || '<span style="color:var(--dp-color-ink-muted); font-style:italic;">(Anlamı ekleniyor)</span>'}</div>
            <div class="word-pos">${w.desc} ${w.cat ? '• ' + w.cat : ''}</div>
            ${w.definition ? `<div class="word-def">"${w.definition}"</div>` : ''}
            ${syn ? `<div class="yds-syn-tag"><strong>EŞ ANLAM:</strong> ${syn}</div>` : ''}
            ${w.example ? `<div class="word-example">“${w.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
          </div>

          <div class="card-footer">
            <div class="card-action-bar">
              <button class="status-badge-btn ${isLearned ? 'learned' : ''}" onclick="window.APP.toggleLearned(${w.id})">
                ${ICONS.check} <span>${isLearned ? 'ÖĞRENDİM' : 'ÖĞREN'}</span>
              </button>
              <button class="status-badge-btn ${isReview ? 'review' : ''}" onclick="window.APP.toggleReview(${w.id})">
                ${ICONS.repeat} <span>${isReview ? 'TEKRARDA' : 'TEKRAR'}</span>
              </button>
            </div>
            <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="window.APP.toggleStarred(${w.id})" aria-label="Favori">
              ${isStarred ? ICONS.starFilled : ICONS.starOutline}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function generateDirectoryPaginationHtml(totalCount, currentPage, pageSize) {
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    if (totalPages <= 1) return '';

    return `
      <div class="dir-pagination-container">
        <button type="button" class="dir-page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="window.APP.setDirectoryPage(1)" title="İlk Sayfa">
          &laquo; İLK
        </button>
        <button type="button" class="dir-page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="window.APP.setDirectoryPage(${currentPage - 1})" title="Önceki Sayfa">
          &larr; ÖNCEKİ
        </button>
        <span class="dir-page-indicator">SAYFA ${currentPage} / ${totalPages}</span>
        <button type="button" class="dir-page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="window.APP.setDirectoryPage(${currentPage + 1})" title="Sonraki Sayfa">
          SONRAKİ &rarr;
        </button>
        <button type="button" class="dir-page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="window.APP.setDirectoryPage(${totalPages})" title="Son Sayfa">
          SON &raquo;
        </button>
      </div>
    `;
  }

  function bindDirectoryCardAudio(scopeEl) {
    scopeEl.querySelectorAll('.speak-btn:not(.coach-mic-btn)').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        if (word) {
          btn.classList.add('speaking');
          speakWord(word, () => btn.classList.remove('speaking'));
        }
      });
    });
  }

  function syncDirectoryStatusChips() {
    const chipLearned = document.querySelector('#status-chips button[data-val="learned"]');
    const chipReview = document.querySelector('#status-chips button[data-val="review"]');
    const chipStarred = document.querySelector('#status-chips button[data-val="starred"]');
    if (chipLearned) chipLearned.innerText = `ÖĞRENİLENLER (${STATE.userData.learned.size})`;
    if (chipReview) chipReview.innerText = `TEKRAR EDİLECEKLER (${STATE.userData.review.size})`;
    if (chipStarred) chipStarred.innerText = `FAVORİLER (${STATE.userData.starred.size})`;
  }

  function setDirectoryPage(pageNum) {
    STATE.directoryPage = parseInt(pageNum, 10) || 1;
    renderDirectoryView(true);
    const grid = document.getElementById('dir-words-grid');
    if (grid) {
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function renderDirectoryView(cardsOnly = false) {
    const container = document.getElementById('view-directory');
    if (!container) return;

    const filters = STATE.directoryFilters;
    const isYdsModule = STATE.activeModule === 'yds';

    const filtered = getFilteredDirectoryWords();
    const pageSize = STATE.directoryPageSize || 60;
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    if (STATE.directoryPage > totalPages) STATE.directoryPage = totalPages;
    if (STATE.directoryPage < 1) STATE.directoryPage = 1;

    const startIdx = (STATE.directoryPage - 1) * pageSize;
    const paginatedWords = filtered.slice(startIdx, startIdx + pageSize);
    const resultText = `${filtered.length} KAYIT BULUNDU • SAYFA ${STATE.directoryPage} / ${totalPages} (${filtered.length > 0 ? (startIdx + 1) : 0} - ${Math.min(startIdx + pageSize, filtered.length)})`;

    const controlsBox = document.getElementById('dir-controls-box');
    const wordsGrid = document.getElementById('dir-words-grid');
    const resultsInfo = document.getElementById('dir-results-info');
    const paginationContainer = document.getElementById('dir-pagination-container');

    // Akıllı kısmi güncelleme: Arama kutusu yok edilmez, klavye odağı ASLA kaybolmaz!
    if (cardsOnly && controlsBox && wordsGrid && resultsInfo && paginationContainer) {
      resultsInfo.innerText = resultText;
      wordsGrid.innerHTML = generateWordCardsHtml(paginatedWords);
      paginationContainer.innerHTML = generateDirectoryPaginationHtml(filtered.length, STATE.directoryPage, pageSize);
      bindDirectoryCardAudio(wordsGrid);
      syncDirectoryStatusChips();
      return;
    }

    container.innerHTML = `
      <div class="directory-controls glass-panel" id="dir-controls-box">
        <div class="search-input-box">
          <span class="search-icon">${ICONS.search}</span>
          <input type="text" class="search-input" id="dir-search-input" placeholder="İngilizce, Türkçe veya eş anlam ara... (ör: abandon, advocate, relieve)" value="${filters.search}" aria-label="Kelime Ara">
        </div>

        ${isYdsModule ? `
          <div style="margin-bottom: 12px;">
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--dp-color-ink-muted); margin-bottom: 6px;">YDS KELİME TÜRLERİ</div>
            <div class="filter-chips-group" id="yds-pos-chips">
              <button class="filter-chip ${filters.pos === 'all' ? 'active' : ''}" data-val="all">TÜM YDS (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')})</button>
              <button class="filter-chip ${filters.pos === 'verb' ? 'active' : ''}" data-val="verb">AKADEMİK FİİLLER (VERBS)</button>
              <button class="filter-chip ${filters.pos === 'noun' ? 'active' : ''}" data-val="noun">AKADEMİK İSİMLER (NOUNS)</button>
              <button class="filter-chip ${filters.pos === 'adj_adv' ? 'active' : ''}" data-val="adj_adv">SIFATLAR &amp; ZARFLAR</button>
            </div>
          </div>
        ` : `
          <div style="margin-bottom: 12px;">
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--dp-color-ink-muted); margin-bottom: 6px;">KELİME KÜTÜPHANESİ</div>
            <div class="filter-chips-group" id="dataset-chips">
              <button class="filter-chip ${filters.dataset === 'all' ? 'active' : ''}" data-val="all">TÜM KÜTÜPHANELER (${WORDS_DATA.length.toLocaleString('tr-TR')})</button>
              <button class="filter-chip ${filters.dataset === 'yds' ? 'active' : ''}" data-val="yds">YDS &amp; YÖKDİL (${WORDS_DATA.filter(isYDSWord).length.toLocaleString('tr-TR')})</button>
              <button class="filter-chip ${filters.dataset === 'oxford' ? 'active' : ''}" data-val="oxford">THE OXFORD 5000 (${WORDS_DATA.filter(isOxfordWord).length.toLocaleString('tr-TR')})</button>
              <button class="filter-chip ${filters.dataset === 'maarif' ? 'active' : ''}" data-val="maarif">MEB: 5. SINIF MAARİF (${WORDS_DATA.filter(isMaarifWord).length.toLocaleString('tr-TR')})</button>
            </div>
          </div>
        `}

        <div style="margin-bottom: 12px;">
          <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--dp-color-ink-muted); margin-bottom: 6px;">CEFR DÜZEYLERİ</div>
          <div class="filter-chips-group" id="cefr-chips">
            <button class="filter-chip ${filters.cefr === 'all' ? 'active' : ''}" data-val="all">TÜM DÜZEYLER</button>
            <button class="filter-chip ${filters.cefr === 'A1' ? 'active' : ''}" data-val="A1">A1</button>
            <button class="filter-chip ${filters.cefr === 'A2' ? 'active' : ''}" data-val="A2">A2</button>
            <button class="filter-chip ${filters.cefr === 'B1' ? 'active' : ''}" data-val="B1">B1</button>
            <button class="filter-chip ${filters.cefr === 'B2' ? 'active' : ''}" data-val="B2">B2 (ORTA-İLERİ)</button>
            <button class="filter-chip ${filters.cefr === 'C1' ? 'active' : ''}" data-val="C1">C1 (İLERİ AKADEMİK)</button>
          </div>
        </div>

        <div>
          <div class="filter-chips-group" id="status-chips">
            <button class="filter-chip ${filters.status === 'all' ? 'active' : ''}" data-val="all">TÜMÜ</button>
            <button class="filter-chip ${filters.status === 'learned' ? 'active' : ''}" data-val="learned">ÖĞRENİLENLER (${STATE.userData.learned.size})</button>
            <button class="filter-chip ${filters.status === 'review' ? 'active' : ''}" data-val="review">TEKRAR EDİLECEKLER (${STATE.userData.review.size})</button>
            <button class="filter-chip ${filters.status === 'starred' ? 'active' : ''}" data-val="starred">FAVORİLER (${STATE.userData.starred.size})</button>
          </div>
        </div>

        <div class="dir-results-info" id="dir-results-info">
          ${resultText}
        </div>
      </div>

      <div class="words-grid" id="dir-words-grid">
        ${generateWordCardsHtml(paginatedWords)}
      </div>

      <div id="dir-pagination-container">
        ${generateDirectoryPaginationHtml(filtered.length, STATE.directoryPage, pageSize)}
      </div>
    `;

    const searchInput = document.getElementById('dir-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        STATE.directoryFilters.search = e.target.value;
        STATE.directoryPage = 1;
        renderDirectoryView(true);
      });
    }

    container.querySelectorAll('#yds-pos-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('#yds-pos-chips .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.directoryFilters.pos = btn.getAttribute('data-val');
        STATE.directoryPage = 1;
        renderDirectoryView(true);
      });
    });

    container.querySelectorAll('#dataset-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('#dataset-chips .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.directoryFilters.dataset = btn.getAttribute('data-val');
        STATE.directoryPage = 1;
        renderDirectoryView(true);
      });
    });

    container.querySelectorAll('#cefr-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('#cefr-chips .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.directoryFilters.cefr = btn.getAttribute('data-val');
        STATE.directoryPage = 1;
        renderDirectoryView(true);
      });
    });

    container.querySelectorAll('#status-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('#status-chips .filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.directoryFilters.status = btn.getAttribute('data-val');
        STATE.directoryPage = 1;
        renderDirectoryView(true);
      });
    });

    bindDirectoryCardAudio(container.querySelector('#dir-words-grid') || container);
  }

  // ==========================================================================
  // VIEW 5: İSTATİSTİKLER & ANALİZ (Maarif vs YDS vs Oxford)
  // ==========================================================================
  function renderStatsView() {
    const container = document.getElementById('view-stats');
    if (!container) return;

    const maarifWords = WORDS_DATA.filter(isMaarifWord);
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
    for (let t = 1; t <= 8; t++) {
      const tWords = WORDS_DATA.filter(w => w.themeNum === t);
      const tLearned = tWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const tPct = Math.round((tLearned / (tWords.length || 1)) * 100);
      const tMeta = THEMES_DATA[t] || { code: `THEME ${t}`, title: `Tema ${t}`, titleTr: '' };

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
    const curMaarifThemeNum = Math.min(8, Math.max(1, Math.ceil(STATE.currentDay / 10)));
    let activeCurriculumTitle = 'MEB Müfredatı (5. Sınıf Maarif)';
    let activeFocusName = THEMES_DATA[curMaarifThemeNum]?.titleTr ? `Tema ${curMaarifThemeNum}: ${THEMES_DATA[curMaarifThemeNum].titleTr}` : 'Tüm Temalar';
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
      activeCurriculumTitle = 'The Oxford 5000™ Kelime Standartları';
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
      <div class="stats-curriculum-station" style="border: var(--dp-border-rule) solid var(--dp-color-border); background: var(--dp-color-surface); padding: 24px; box-shadow: 6px 6px 0 #000000; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 800; color: var(--dp-color-field); text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.04em;">
              🎯 [ AKTİF HEDEF MÜFREDAT KAZANIM İSTASYONU ]
            </div>
            <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0; letter-spacing: -0.02em;">
              ${activeCurriculumTitle}
            </h2>
            <div style="font-family: var(--dp-typography-mono); font-size: 0.82rem; color: var(--dp-color-ink-muted); margin-top: 4px;">
              Mevcut Odak: <strong style="color: var(--dp-color-ink);">${activeFocusName}</strong>
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <button class="ctrl-btn" onclick="window.APP.switchView('directory')" style="font-size: 0.78rem; padding: 6px 12px; background: var(--dp-color-ground); border: 2px solid var(--dp-color-border); box-shadow: 3px 3px 0 #000000;">
              📚 KELİME DİZİNİ
            </button>
            <button class="ctrl-btn" onclick="window.APP.switchView('quiz')" style="font-size: 0.78rem; padding: 6px 12px; background: var(--dp-color-field-support); color: #000000; border: 2px solid var(--dp-color-border); box-shadow: 3px 3px 0 #000000;">
              ⚡ KAZANIM TESTİ
            </button>
          </div>
        </div>

        <div style="background: var(--dp-color-ground); border: 2px solid var(--dp-color-border); padding: 16px; box-shadow: 3px 3px 0 #000000;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 8px;">
            <span style="font-family: var(--dp-typography-mono); font-size: 0.76rem; font-weight: 800; text-transform: uppercase;">
              MÜFREDAT TAMAMLANMA ORANI
            </span>
            <span style="font-family: var(--dp-typography-mono); font-size: 0.95rem; font-weight: 900; color: var(--dp-color-accent);">
              %${activePct} (${activeLearned} / ${activeWords.length} KELİME)
            </span>
          </div>
          <div style="height: 16px; border: 2px solid var(--dp-color-border); background: var(--dp-color-surface); overflow: hidden;">
            <div style="height: 100%; width: ${activePct}%; background: var(--dp-color-field); transition: width 0.3s cubic-bezier(0.2, 0, 0, 1);"></div>
          </div>
        </div>
      </div>

      <div class="stats-summary-grid">
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${maarifLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${maarifWords.length}</span></div>
          <div class="metric-title">MEB 5. SINIF MAARİF (%${maarifPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--dp-color-accent-ink);">${ydsLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${ydsWords.length}</span></div>
          <div class="metric-title">YDS &amp; YÖKDİL AKADEMİK (%${ydsPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${oxfordLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${oxfordWords.length}</span></div>
          <div class="metric-title">THE OXFORD 5000 (%${oxfordPct})</div>
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
          MEB 5. SINIF MAARİF MODELİ (8 TEMA KAZANIM İLERLEMESİ)
        </h3>
        ${themesBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em;">
          THE OXFORD 5000 (CEFR SEVİYE DAĞILIMI)
        </h3>
        ${oxfordBreakdownHtml}
      </div>

      <!-- 4. SM-2 ARALIKLI TEKRAR & BİLİŞSEL HAFIZA MATRİSİ -->
      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:14px;">
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em;">
            🧠 SM-2 BİLİŞSEL HAFIZA &amp; KALICILIK MATRİSİ
          </h3>
          <span class="pedagogy-station-badge">HAFIZA GÜCÜ: %${srsStats.retentionRate}</span>
        </div>
        <p style="font-size:0.85rem; color:var(--dp-color-ink-muted); margin-bottom:16px;">
          Kelimelerin kısa vadeli bellekten uzun vadeli kalıcı belleğe geçiş aşamaları:
        </p>
        
        <div class="srs-retention-tier-grid">
          <div class="srs-tier-card tier-new">
            <div class="srs-tier-top">
              <span class="srs-tier-name">🥚 Yeni / Henüz Başlanmadı</span>
              <strong class="srs-tier-num">${srsStats.newCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.newCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">0 tekrar (havuzda bekliyor)</span>
          </div>

          <div class="srs-tier-card tier-learning">
            <div class="srs-tier-top">
              <span class="srs-tier-name">🌱 Öğreniliyor (1–3 Gün)</span>
              <strong class="srs-tier-num">${srsStats.learningCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.learningCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">Kısa vadeli hafıza aşamasında</span>
          </div>

          <div class="srs-tier-card tier-reviewing">
            <div class="srs-tier-top">
              <span class="srs-tier-name">🌿 Pekiştiriliyor (4–14 Gün)</span>
              <strong class="srs-tier-num">${srsStats.reviewingCount}</strong>
            </div>
            <div class="srs-tier-bar-bg"><div class="srs-tier-bar-fill" style="width:${Math.round((srsStats.reviewingCount / (srsStats.total || 1)) * 100)}%;"></div></div>
            <span class="srs-tier-desc">Orta vadeli bellek aktarımı</span>
          </div>

          <div class="srs-tier-card tier-mastered">
            <div class="srs-tier-top">
              <span class="srs-tier-name">🌳 Kalıcı Bellek (15+ Gün)</span>
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
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em;">
            🛑 AKILLI HATA DEFTERİ &amp; ZAYIF NOKTALAR
          </h3>
          <span class="pedagogy-station-badge mistake">KURTARMA BAŞARISI: %${mistakeStats.recoveryRate}</span>
        </div>

        <div class="stats-summary-grid" style="margin-bottom:16px;">
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem;">${mistakeStats.totalMistakeEvents}</div>
            <div class="metric-title">TOPLAM HATA OLAYI</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:var(--dp-color-red);">${mistakeStats.activeMistakes}</div>
            <div class="metric-title">AKTİF BEKLEYEN ZAYIF NOKTA</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:#008744;">${mistakeStats.clearedMistakes}</div>
            <div class="metric-title">KURTARILAN / TEMİZLENEN</div>
          </div>
          <div class="stat-metric-card glass-panel" style="padding:14px;">
            <div class="metric-val" style="font-size:1.4rem; color:var(--dp-color-field);">%${mistakeStats.recoveryRate}</div>
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
          <h3 style="margin:0; text-transform: uppercase; letter-spacing: 0.03em;">
            🎙️ SPEAKING &amp; TELAFFUZ KOÇU TELEMETRİSİ
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
            <div class="metric-val" style="font-size:1.4rem; color:var(--dp-color-field);">
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

  // No-op: childish gamification / confetti disabled by Dark Geometric & Amber Precision spec
  function triggerConfetti() {}

  // ==========================================================================
  // NAVIGATION & BREADCRUMB CONTROLLERS (Live Architectural Telemetry)
  // ==========================================================================
  function updateBreadcrumb(viewName) {
    const modText = document.getElementById('breadcrumb-module-text') || document.getElementById('breadcrumb-module-label');
    const viewLabel = document.getElementById('breadcrumb-view-label');
    const badgeContainer = document.getElementById('breadcrumb-dynamic-badge') || document.getElementById('breadcrumb-context-badge');
    const backBtn = document.getElementById('breadcrumb-back-btn');

    const moduleNames = {
      maarif: 'MEB MÜFREDATI • 5. SINIF',
      yds: 'YDS & YÖKDİL AKADEMİK',
      oxford: 'THE OXFORD 5000',
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
      modText.innerText = moduleNames[STATE.activeModule] || '5. SINIF MAARİF MODELİ';
    }
    if (viewLabel) {
      viewLabel.innerText = viewNames[viewName] || viewName;
    }

    const sidebarTelemetry = document.getElementById('sidebar-telemetry-badge');

    // Compute Daily Goal telemetry for both sidebar footer & daily view badge
    const isYds = STATE.activeModule === 'yds';
    const isOxford = STATE.activeModule === 'oxford';
    const targetPool = isYds 
      ? WORDS_DATA.filter(isYDSWord) 
      : (isOxford ? WORDS_DATA.filter(isOxfordWord) : WORDS_DATA.filter(isMaarifWord));
    
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
        const label = STATE.activeModule === 'yds' ? 'YDS/YÖKDİL' : (STATE.activeModule === 'oxford' ? 'OXFORD 5000' : 'MAARİF MODELİ');
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
    cancelQuizSpeaking();
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        executeSwitchView(viewName, pushHash);
      });
    } else {
      executeSwitchView(viewName, pushHash);
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
      oxford: 'The Oxford 5000',
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
    if (labelEl) labelEl.textContent = viewLabels[viewName] || 'GÜNLÜK HEDEF • LEARNISH';
    if (titleEl) {
      if (viewName === 'home') titleEl.textContent = modTitles[STATE.activeModule] || 'İngilizce Çalışması';
      else if (viewName === 'daily') titleEl.textContent = STATE.activeModule === 'yds' ? "Günün 20'si" : "Günün 10'lusu";
      else if (viewName === 'flashcard') titleEl.textContent = 'Flashcard Kartları';
      else if (viewName === 'quiz') titleEl.textContent = 'Quiz & Test';
      else if (viewName === 'directory') titleEl.textContent = 'Kelime Havuzu';
      else if (viewName === 'stats') titleEl.textContent = 'İstatistik & Analiz';
    }

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

  function startQuiz() {
    cancelQuizSpeaking();
    const modeSelect = document.getElementById('quiz-mode-select');
    const sourceSelect = document.getElementById('quiz-source-select');
    const countSelect = document.getElementById('quiz-count-select');
    const levelSelect = document.getElementById('quiz-level-select');

    const mode = modeSelect ? modeSelect.value : 'en-tr';
    const source = sourceSelect ? sourceSelect.value : 'daily';
    const countVal = countSelect ? countSelect.value : '10';
    const levelVal = levelSelect ? levelSelect.value : 'all';

    let pool = [];
    if (source === 'daily') {
      const isYds = STATE.activeModule === 'yds';
      const isOxford = STATE.activeModule === 'oxford';
      const isAll = STATE.activeModule === 'all';
      const targetPool = isYds 
        ? WORDS_DATA.filter(isYDSWord) 
        : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : WORDS_DATA.filter(isMaarifWord)));
      const bSize = isYds ? 20 : (isOxford || isAll ? 25 : 10);
      const start = (STATE.currentDay - 1) * bSize;
      pool = targetPool.slice(start, start + bSize);
    } else if (source === 'past_cumulative') {
      const isYds = STATE.activeModule === 'yds';
      const isOxford = STATE.activeModule === 'oxford';
      const isAll = STATE.activeModule === 'all';
      const targetPool = isYds 
        ? WORDS_DATA.filter(isYDSWord) 
        : (isOxford ? WORDS_DATA.filter(isOxfordWord) : (isAll ? WORDS_DATA : WORDS_DATA.filter(isMaarifWord)));
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
      pool = WORDS_DATA.filter(isMaarifWord);
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
    const distractorPool = pool.length >= 10 ? pool : WORDS_DATA;

    const questions = selectedTargets.map(target => {
      const distractors = distractorPool
        .filter(w => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

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
          <span class="ped-alert-icon">🧠</span>
          <div class="ped-alert-text">
            <strong>Bilişsel Aralıklı Tekrar:</strong> Bu kelime <strong>Hata Defterinize</strong> eklendi ve unutulmaması için yarınki <strong>Aralıklı Tekrar</strong> programınıza dahil edildi.
          </div>
        </div>

        <div class="feedback-body">
          <div class="feedback-word-row">
            <span class="feedback-word-en">${targetWord.en}</span>
            <button class="speak-btn" style="width:40px; height:40px;" onclick="window.APP.speakCurrentWord('${targetWord.en}')" title="Telaffuzu Dinle" aria-label="Telaffuzu Dinle">${ICONS.speaker}</button>
            <span class="feedback-word-pos">${targetWord.desc || ''} ${targetWord.cefr ? '• ' + targetWord.cefr : ''}</span>
          </div>
          <div class="feedback-meaning-row">
            <span class="feedback-meaning-label">DOĞRU ANLAM:</span>
            <strong class="feedback-meaning-tr">${targetWord.tr}</strong>
          </div>
          ${targetWord.example ? `
            <div class="feedback-example-row">
              <span class="feedback-ex-label">ÖRNEK KULLANIM:</span>
              <p class="feedback-example">“${highlightWordInText(targetWord.example, targetWord.en)}”</p>
            </div>
          ` : ''}
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

    const started = startSpeechSession({
      lang: (STATE.settings.accent || 'en-GB').includes('US') ? 'en-US' : 'en-GB',
      onStart: () => {
        if (!isSameQuestion()) return;
        const { micBtn, label, waveform, statusEl } = getEls();
        if (micBtn) micBtn.classList.add('active');
        if (label) label.textContent = 'DİNLENİYOR... ŞİMDİ KONUŞUN 🎙️';
        if (waveform) waveform.classList.add('active');
        if (statusEl) statusEl.textContent = 'Sizi dinliyorum, hedef kelimeyi seslendirin...';
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
                  🔄 Tekrar Dene
                </button>
                <button type="button" class="ctrl-btn" onclick="window.APP.speakWord('${escapeHtml(targetWord.en)}')">
                  🔊 Örnek Dinle
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
      maarif: '5. SINIF MAARİF MODELİ',
      yds: 'YDS & YÖKDİL AKADEMİK',
      oxford: 'THE OXFORD 5000',
      all: 'TÜM KÜTÜPHANE'
    };
    const modTitle = modMap[STATE.activeModule] || '5. SINIF MAARİF MODELİ';
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
    setTimeout(() => {
      const srcSelect = document.getElementById('quiz-source-select');
      if (srcSelect) srcSelect.value = 'daily';
      startQuiz();
    }, 100);
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
    setTimeout(() => {
      const srcSelect = document.getElementById('quiz-source-select');
      if (srcSelect) srcSelect.value = 'past_cumulative';
      startQuiz();
    }, 100);
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
    const distractorPool = pool.length >= 10 ? pool : WORDS_DATA;

    const questions = selectedTargets.map(target => {
      const distractors = distractorPool
        .filter(w => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

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
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const onButton = !!(e.target && e.target.closest && e.target.closest('button'));

    if (COACH_STATE.active) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSpeechCoach();
        return;
      }
      if (e.code === 'Space') {
        if (onButton || e.repeat) return;
        e.preventDefault();
        toggleCoachListening();
        return;
      }
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
      metaThemeColor.setAttribute('content', STATE.settings.theme === 'dark' ? '#0A0A0A' : '#F5F4EE');
    }

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
      const mAccent = document.getElementById('m-accent-toggle-btn');
      if (dAccent) dAccent.innerText = accentText;
      if (mAccent) mAccent.innerText = accentText;

      const dSpeed = document.getElementById('speed-toggle-btn');
      const mSpeed = document.getElementById('m-speed-toggle-btn');
      if (dSpeed) dSpeed.innerText = speedText;
      if (mSpeed) mSpeed.innerText = speedText;

      const dSound = document.getElementById('sound-toggle-btn');
      const mSound = document.getElementById('m-sound-toggle-btn');
      if (dSound) dSound.innerText = soundText;
      if (mSound) mSound.innerText = soundText;

      const dTheme = document.getElementById('theme-toggle-btn');
      const mTheme = document.getElementById('m-theme-toggle-btn');
      if (dTheme) dTheme.innerText = themeText;
      if (mTheme) mTheme.innerText = themeText;
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
        metaThemeColor.setAttribute('content', STATE.settings.theme === 'dark' ? '#0A0A0A' : '#F5F4EE');
      }
      syncAllSettingsButtons();
    }

    document.getElementById('accent-toggle-btn')?.addEventListener('click', toggleAccentSetting);
    document.getElementById('m-accent-toggle-btn')?.addEventListener('click', toggleAccentSetting);

    document.getElementById('speed-toggle-btn')?.addEventListener('click', toggleSpeedSetting);
    document.getElementById('m-speed-toggle-btn')?.addEventListener('click', toggleSpeedSetting);

    document.getElementById('sound-toggle-btn')?.addEventListener('click', toggleSoundSetting);
    document.getElementById('m-sound-toggle-btn')?.addEventListener('click', toggleSoundSetting);

    document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleThemeSetting);
    document.getElementById('m-theme-toggle-btn')?.addEventListener('click', toggleThemeSetting);

    syncAllSettingsButtons();
    updateMobileTriggerLabels();

    // Hash routing — default landing page is #home (Kontrol Merkezi)
    const validViews = ['home', 'daily', 'flashcard', 'quiz', 'directory', 'stats'];
    const initialHash = window.location.hash.replace('#', '');
    const initialView = validViews.includes(initialHash) ? initialHash : 'home';
    switchView(initialView, !initialHash);

    window.addEventListener('hashchange', () => {
      const hView = window.location.hash.replace('#', '');
      if (validViews.includes(hView) && hView !== STATE.currentView) {
        switchView(hView, false);
      } else if (!hView && STATE.currentView !== 'home') {
        switchView('home', false);
      }
    });

    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('./service-worker.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }
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
    switchViewAndClose,
    toggleLearned,
    toggleReview,
    toggleStarred,
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
    startCoachListening,
    stopCoachListening,
    evaluatePronunciation,
    renderFlashcardView,
    renderDirectoryView,
    setDirectoryPage,
    resetAllProgress,
    switchView,
    switchModule,
    speakCurrentWord,
    retestDebugWord,
    selectHeatmapUnit,
    goHome,
    goBack
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
