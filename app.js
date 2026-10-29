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

  // Geometric 2px-stroke square-cap SVG icons
  const ICONS = {
    speaker: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    repeat: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
    starOutline: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starFilled: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    shuffle: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>`,
    search: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
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
    currentView: 'daily', // 'daily', 'flashcard', 'quiz', 'directory', 'stats'
    viewHistory: ['daily'],
    currentDay: 1, // Maarif: 1-82, YDS: 1-145
    activeFlashcardIndex: 0,
    filteredFlashcards: [],
    flashcardFlipped: false,
    flashcardSource: 'daily',
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
    settings: {
      accent: localStorage.getItem('mk_accent') || 'en-GB', // 'en-GB' or 'en-US'
      speed: parseFloat(localStorage.getItem('mk_speed') || '1.0'),
      soundEffects: localStorage.getItem('mk_sound') !== 'false',
      theme: localStorage.getItem('mk_theme') || 'dark'
    },
    userData: {
      learned: new Set(JSON.parse(localStorage.getItem('mk_learned') || '[]')),
      review: new Set(JSON.parse(localStorage.getItem('mk_review') || '[]')),
      starred: new Set(JSON.parse(localStorage.getItem('mk_starred') || '[]')),
      stats: JSON.parse(localStorage.getItem('mk_stats') || '{"quizzesPlayed":0,"correctAnswers":0,"totalQuestions":0,"bestStreak":0}')
    }
  };

  // Ensure current day is restored or defaults to 1
  const savedDay = parseInt(localStorage.getItem('mk_current_day'), 10);
  if (savedDay && savedDay >= 1 && savedDay <= 150) {
    STATE.currentDay = savedDay;
  }

  // ==========================================================================
  // Web Audio API Synthesizer (Zero External Audio Files)
  // ==========================================================================
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
  // Persistence Helpers
  // ==========================================================================
  function saveUserData() {
    try {
      localStorage.setItem('mk_learned', JSON.stringify(Array.from(STATE.userData.learned)));
      localStorage.setItem('mk_review', JSON.stringify(Array.from(STATE.userData.review)));
      localStorage.setItem('mk_starred', JSON.stringify(Array.from(STATE.userData.starred)));
      localStorage.setItem('mk_stats', JSON.stringify(STATE.userData.stats));
      localStorage.setItem('mk_current_day', STATE.currentDay.toString());
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function toggleLearned(wordId) {
    wordId = parseInt(wordId, 10);
    if (STATE.userData.learned.has(wordId)) {
      STATE.userData.learned.delete(wordId);
    } else {
      STATE.userData.learned.add(wordId);
      STATE.userData.review.delete(wordId);
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
  // Data Filtering & Helpers for YDS & Maarif
  // ==========================================================================
  function isYDSWord(w) {
    if (w.dataset !== 'oxford') return false;
    return w.cefr === 'B2' || w.cefr === 'C1';
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
  function switchModule(moduleName) {
    STATE.activeModule = moduleName;
    localStorage.setItem('learnish_active_module', moduleName);

    // Update active tab buttons in top bar
    document.querySelectorAll('.module-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-module') === moduleName);
    });

    // Update brand info subtitle - Architectural micro-goal telemetry
    const brandSub = document.getElementById('app-brand-subtitle');
    if (brandSub) {
      if (moduleName === 'maarif') brandSub.innerText = '5. Sınıf Maarif Modeli • Günlük Hedef: 10 Kelime';
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
      STATE.directoryFilters.dataset = 'oxford';
      STATE.directoryFilters.cefr = 'all';
      STATE.flashcardSource = 'yds_all';
    } else if (moduleName === 'maarif') {
      if (dailyText) dailyText.innerText = "Günün 10'lusu";
      if (flashText) flashText.innerText = "Maarif Kartları";
      if (quizText) quizText.innerText = "Maarif Quiz";
      if (dirText) dirText.innerText = "8 Tema Havuzu";
      if (statsText) statsText.innerText = "Kazanım Analizi";
      STATE.directoryFilters.dataset = 'maarif';
      STATE.directoryFilters.cefr = 'all';
      STATE.flashcardSource = 'daily';
    } else if (moduleName === 'oxford') {
      if (dailyText) dailyText.innerText = "Günün Kelimeleri";
      if (flashText) flashText.innerText = "CEFR Kartları";
      if (quizText) quizText.innerText = "Seviye Testi";
      if (dirText) dirText.innerText = "Oxford 5000";
      if (statsText) statsText.innerText = "CEFR Analizi";
      STATE.directoryFilters.dataset = 'oxford';
      STATE.directoryFilters.cefr = 'all';
      STATE.flashcardSource = 'oxford_all';
    } else {
      if (dailyText) dailyText.innerText = "Günün 10'lusu";
      if (flashText) flashText.innerText = "Flashcard";
      if (quizText) quizText.innerText = "Quiz & Test";
      if (dirText) dirText.innerText = "Kelime Havuzu";
      if (statsText) statsText.innerText = "İstatistik";
      STATE.directoryFilters.dataset = 'all';
      STATE.directoryFilters.cefr = 'all';
      STATE.flashcardSource = 'all';
    }

    updateUI();
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
    let heroClass = 'module-hero-maarif';
    let progressFillClass = 'progress-fill-maarif';

    if (module === 'yds') {
      targetPool = WORDS_DATA.filter(isYDSWord);
      batchSize = 20;
      heroClass = 'module-hero-yds';
      progressFillClass = 'progress-fill-yds';
      bannerTitle = `GÜN ${STATE.currentDay} • YDS & YÖKDİL AKADEMİK WORKOUT`;
      bannerDesc = `Günlük <strong>${batchSize} hedef akademik kelime</strong> — İndeks: ${(STATE.currentDay - 1) * batchSize + 1}–${Math.min(STATE.currentDay * batchSize, targetPool.length)} / ${targetPool.length} (B2–C1)`;
    } else if (module === 'oxford') {
      targetPool = WORDS_DATA.filter(w => w.dataset === 'oxford');
      batchSize = 25;
      heroClass = 'module-hero-oxford';
      progressFillClass = 'progress-fill-oxford';
      bannerTitle = `GÜN ${STATE.currentDay} • THE OXFORD 5000 KELİME MODÜLÜ`;
      bannerDesc = `Günlük <strong>${batchSize} hedef kelime</strong> — İndeks: ${(STATE.currentDay - 1) * batchSize + 1}–${Math.min(STATE.currentDay * batchSize, targetPool.length)} / ${targetPool.length}`;
    } else {
      targetPool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
      batchSize = 10;
      heroClass = 'module-hero-maarif';
      progressFillClass = 'progress-fill-maarif';
      const curThemeNum = Math.ceil(STATE.currentDay / 10);
      const curTheme = (typeof THEMES_DATA !== 'undefined' && THEMES_DATA[curThemeNum]) ? THEMES_DATA[curThemeNum] : { titleTr: 'Okul Yaşamı' };
      bannerTitle = `GÜN ${STATE.currentDay} • TEMA ${curThemeNum}: ${(curTheme.titleTr || curTheme.title || 'Okul Yaşamı').toUpperCase()}`;
      bannerDesc = `Günlük <strong>10 hedef kelime</strong> • Odaklı öğrenim ve kalıcı kelime kazanımı`;
    }

    const totalDays = Math.ceil(targetPool.length / batchSize) || 1;
    if (STATE.currentDay > totalDays) STATE.currentDay = 1;

    const startIndex = (STATE.currentDay - 1) * batchSize;
    const dayWords = targetPool.slice(startIndex, startIndex + batchSize);
    const dayLearnedCount = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const dayPercent = Math.round((dayLearnedCount / (dayWords.length || 1)) * 100);

    // Build Day options dropdown with Themes
    let dayOptionsHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      let dayThemeTitle = '';
      if (module === 'maarif') {
        const themeNum = Math.ceil(d / 10);
        const t = (typeof THEMES_DATA !== 'undefined' && THEMES_DATA[themeNum]) ? THEMES_DATA[themeNum].titleTr : '';
        dayThemeTitle = t ? ` (${t})` : '';
      }
      dayOptionsHtml += `<option value="${d}" ${d === STATE.currentDay ? 'selected' : ''}>Gün ${d}${dayThemeTitle}</option>`;
    }

    let celebrationHtml = '';
    if (dayLearnedCount === dayWords.length && dayWords.length > 0) {
      celebrationHtml = `
        <div class="daily-celebration-banner glass-panel">
          <div class="celebration-icon">[ ${dayWords.length}/${dayWords.length} ]</div>
          <div class="celebration-body">
            <h3>GÜNLÜK HEDEF TAMAMLANDI (${dayWords.length} / ${dayWords.length} KELİME)</h3>
            <p>Bu çalışma günündeki tüm kelimeler öğrenildi olarak işaretlendi. Kazanımı doğrulamak için günün testini başlatın.</p>
          </div>
          <button class="celebration-action-btn" onclick="window.APP.startDailyQuiz()">
            GÜNÜN TESTİNİ BAŞLAT &rarr;
          </button>
        </div>
      `;
    }

    let cardsHtml = '';
    if (dayWords.length === 0) {
      cardsHtml = `
        <div class="empty-state-box glass-panel" style="grid-column: 1 / -1; margin: 24px 0;">
          <div class="empty-icon">[ 0 ]</div>
          <div class="empty-title">Bu gün için kelime kaydı bulunamadı</div>
          <div class="empty-desc">Lütfen gün seçiciden başka bir çalışma günü seçin veya Gün 1'e dönün.</div>
          <button class="ctrl-btn" onclick="window.APP.goHome()" style="margin-top: 14px; min-height: 44px; padding: 0 16px;">GÜN 1'E DÖN</button>
        </div>
      `;
    }
    dayWords.forEach(w => {
      const isLearned = STATE.userData.learned.has(w.id);
      const isReview = STATE.userData.review.has(w.id);
      const isStarred = STATE.userData.starred.has(w.id);
      const prepBadge = extractPreposition(w);
      const syn = getWordSynonym(w);

      const cardModClass = module === 'yds' ? 'word-card-yds' : (module === 'oxford' ? 'word-card-oxford' : 'word-card-maarif');

      cardsHtml += `
        <div class="word-card ${cardModClass} glass-panel" data-id="${w.id}">
          <div class="card-top">
            <div class="card-tags">
              ${getCefrBadgeHtml(w.cefr)}
              ${w.themeCode ? getThemeBadgeHtml(w.themeCode, w.themeTitle) : ''}
              ${prepBadge ? `<span class="yds-prep-tag" title="Sık kullanılan edat">${prepBadge}</span>` : ''}
            </div>
            <span class="word-number">#${w.no || w.id}</span>
          </div>

          <div class="card-body">
            <div class="word-en-row">
              <span class="word-en">${w.en}</span>
              ${w.phonetic ? `<span class="word-phonetic">${w.phonetic}</span>` : ''}
              <button class="speak-btn" data-word="${w.en}" title="Sesli Telaffuz (${STATE.settings.accent})" aria-label="Telaffuzu dinle: ${w.en}">${ICONS.speaker}</button>
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
            <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="window.APP.toggleStarred(${w.id})" title="Favorilere Ekle" aria-label="Favori">
              ${isStarred ? ICONS.starFilled : ICONS.starOutline}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      ${celebrationHtml}
      <div class="module-hero-card ${heroClass} glass-panel">
        <div class="hero-info">
          <h2>${bannerTitle}</h2>
          <p>${bannerDesc}</p>
        </div>
        <div class="day-picker-control">
          <button class="day-step-btn" id="prev-day-btn" ${STATE.currentDay <= 1 ? 'disabled' : ''} aria-label="Önceki Gün">&larr;</button>
          <select class="day-select-input" id="day-select-dropdown" aria-label="Çalışma Günü Seçimi">
            ${dayOptionsHtml}
          </select>
          <button class="day-step-btn" id="next-day-btn" ${STATE.currentDay >= totalDays ? 'disabled' : ''} aria-label="Sonraki Gün">&rarr;</button>
        </div>
      </div>

      <div class="daily-progress-box glass-panel">
        <div class="progress-header">
          <span>GÜNLÜK İLERLEME: <strong>${dayLearnedCount} / ${dayWords.length}</strong> KELİME</span>
          <span style="color: var(--dp-color-field-support); font-weight:700;">%${dayPercent} TAMAMLANDI</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${progressFillClass}" style="width: ${dayPercent}%;"></div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
          <button class="ctrl-btn" onclick="window.APP.startDailyFlashcards()">
            GÜNÜN KARTLARIYLA ÇALIŞ
          </button>
          <button class="ctrl-btn" onclick="window.APP.startDailyQuiz()">
            GÜNÜN TESTİNİ BAŞLAT
          </button>
        </div>
      </div>

      <div class="words-grid">
        ${cardsHtml}
      </div>
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
        btn.classList.add('speaking');
        speakWord(word, () => btn.classList.remove('speaking'));
      });
    });
  }

  // ==========================================================================
  // VIEW 2: 3D FLASHCARD MODU
  // ==========================================================================
  function renderFlashcardView() {
    const container = document.getElementById('view-flashcard');
    if (!container) return;

    const sourceSelect = document.getElementById('fc-source-select');
    const sourceVal = sourceSelect ? sourceSelect.value : (STATE.flashcardSource || 'daily');
    STATE.flashcardSource = sourceVal;

    let pool = [];
    if (sourceVal === 'daily') {
      const isYDS = STATE.activeModule === 'yds';
      const targetPool = isYDS ? WORDS_DATA.filter(isYDSWord) : WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
      const bSize = isYDS ? 20 : 10;
      const start = (STATE.currentDay - 1) * bSize;
      pool = targetPool.slice(start, start + bSize);
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
      pool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
    } else if (sourceVal === 'oxford_all') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford');
    } else if (sourceVal === 'oxford_a1') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford' && w.cefr === 'A1');
    } else if (sourceVal === 'oxford_a2') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford' && w.cefr === 'A2');
    } else if (sourceVal === 'oxford_b1') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford' && w.cefr === 'B1');
    } else if (sourceVal === 'review') {
      pool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id));
    } else if (sourceVal === 'starred') {
      pool = WORDS_DATA.filter(w => STATE.userData.starred.has(w.id));
    } else if (sourceVal === 'learned') {
      pool = WORDS_DATA.filter(w => STATE.userData.learned.has(w.id));
    } else {
      pool = WORDS_DATA;
    }

    STATE.filteredFlashcards = pool;
    if (STATE.activeFlashcardIndex >= pool.length) {
      STATE.activeFlashcardIndex = Math.max(0, pool.length - 1);
    }

    const isYdsMod = STATE.activeModule === 'yds';

    const flashcardSourceOptions = `
      ${isYdsMod ? `
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>Tüm YDS/YÖKDİL Kelimeleri (2.894)</option>
        <option value="yds_verbs" ${sourceVal === 'yds_verbs' ? 'selected' : ''}>Akademik Fiiller (1.100+ Kelime)</option>
        <option value="yds_nouns" ${sourceVal === 'yds_nouns' ? 'selected' : ''}>Akademik İsimler (900+ Kelime)</option>
        <option value="yds_adj_adv" ${sourceVal === 'yds_adj_adv' ? 'selected' : ''}>Sıfatlar & Zarflar (800+ Kelime)</option>
        <option value="yds_c1" ${sourceVal === 'yds_c1' ? 'selected' : ''}>C1 İleri Akademik (1.357 Kelime)</option>
        <option value="yds_b2" ${sourceVal === 'yds_b2' ? 'selected' : ''}>B2 Orta-İleri (1.537 Kelime)</option>
      ` : `
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün Kelimeleri (Gün ${STATE.currentDay})</option>
        <option value="maarif_all" ${sourceVal === 'maarif_all' ? 'selected' : ''}>5. Sınıf Maarif Modeli (817 Kelime)</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>YDS & YÖKDİL Akademik (2.894 Kelime)</option>
        <option value="oxford_all" ${sourceVal === 'oxford_all' ? 'selected' : ''}>The Oxford 5000 (Tümü - 5.841)</option>
        <option value="oxford_a1" ${sourceVal === 'oxford_a1' ? 'selected' : ''}>Oxford 5000: A1 Başlangıç</option>
        <option value="oxford_a2" ${sourceVal === 'oxford_a2' ? 'selected' : ''}>Oxford 5000: A2 Temel</option>
        <option value="oxford_b1" ${sourceVal === 'oxford_b1' ? 'selected' : ''}>Oxford 5000: B1 Orta</option>
      `}
      <option value="all" ${sourceVal === 'all' ? 'selected' : ''}>Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
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
            <div style="font-family: var(--dp-typography-mono); font-size: 1.5rem; color: var(--dp-color-accent); margin-bottom: 12px;">[ 0 KART ]</div>
            <h3>Bu filtre grubunda henüz kelime bulunmuyor.</h3>
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

    container.innerHTML = `
      <div class="flashcard-wrapper">
        <div class="flashcard-toolbar">
          <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()" aria-label="Kart Kaynağı Seçimi">
            ${flashcardSourceOptions}
          </select>

          <div class="flashcard-counter">
            ${STATE.activeFlashcardIndex + 1} / ${pool.length}
          </div>

          <button class="ctrl-btn" onclick="window.APP.shuffleFlashcards()" title="Kartları Karıştır">
            ${ICONS.shuffle} <span>KARIŞTIR</span>
          </button>
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
                </div>
                <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle" aria-label="Dinle">
                  ${ICONS.speaker}
                </button>
              </div>

              <div class="fc-main">
                <div class="fc-word-en">${currentWord.en}</div>
                ${currentWord.phonetic ? `<div class="word-phonetic" style="font-size:1.05rem; margin-bottom:8px;">${currentWord.phonetic}</div>` : ''}
                <div class="fc-category-desc">${currentWord.desc || ''} ${currentWord.cat ? '• ' + currentWord.cat : ''}</div>
                ${syn ? `<div class="yds-syn-tag" style="margin-top:10px; font-size:0.85rem;"><strong>EŞ ANLAM:</strong> ${syn}</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">ÇEVİRMEK İÇİN TIKLA VEYA <span class="kbd-badge">SPACE</span></span>
                <span>#${currentWord.no || currentWord.id}</span>
              </div>
            </div>

            <!-- Back Face -->
            <div class="card-face card-face-back">
              <div class="fc-header">
                <span class="cefr-pill">TÜRKÇE ANLAMI</span>
                <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle" aria-label="Dinle">
                  ${ICONS.speaker}
                </button>
              </div>

              <div class="fc-main">
                <div class="fc-word-tr">${currentWord.tr || '(Anlamı yakında eklenecek)'}</div>
                <div style="font-size: 0.9rem; color: var(--dp-color-ink-muted); font-weight: 600; margin-bottom: 8px;">
                  ${currentWord.en} — ${currentWord.desc || ''}
                </div>
                ${currentWord.definition ? `<div class="word-def" style="max-width: 52ch;">“${currentWord.definition}”</div>` : ''}
                ${currentWord.example ? `<div class="word-example" style="max-width: 52ch;">“${currentWord.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">İNGİLİZCE YÜZE DÖNMEK İÇİN <span class="kbd-badge">SPACE</span></span>
                <span>${currentWord.cat || ''}</span>
              </div>
            </div>

          </div>
        </div>

        <div class="fc-controls">
          <button class="fc-action-btn" onclick="window.APP.prevFlashcard()">
            &larr; ÖNCEKİ
          </button>
          
          <button class="fc-action-btn ${isReview ? 'btn-review' : ''}" onclick="window.APP.toggleReview(${currentWord.id})">
            ${ICONS.repeat} <span>TEKRAR ET</span> <span class="kbd-badge">1</span>
          </button>

          <button class="fc-action-btn ${isLearned ? 'btn-learned' : ''}" onclick="window.APP.toggleLearned(${currentWord.id})">
            ${ICONS.check} <span>ÖĞRENDİM</span> <span class="kbd-badge">2</span>
          </button>

          <button class="fc-action-btn" onclick="window.APP.nextFlashcard()">
            SONRAKİ &rarr;
          </button>
        </div>

        <div class="fc-shortcuts-hint">
          <span><span class="kbd-badge">SPACE</span> ÇEVİR</span>
          <span><span class="kbd-badge">&larr; / &rarr;</span> GEÇİŞ</span>
          <span><span class="kbd-badge">P</span> DİNLE</span>
          <span><span class="kbd-badge">1</span> TEKRAR</span>
          <span><span class="kbd-badge">2</span> ÖĞRENDİM</span>
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
                  <span class="resume-quiz-badge">[ OTURUM KAYDEDİLDİ ]</span>
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
                </select>
              </div>

              <div class="config-group">
                <label for="quiz-source-select">Soru Kaynağı</label>
                <select id="quiz-source-select">
                  ${isYds ? `
                    <option value="yds_all">Tüm YDS/YÖKDİL Havuzu (2.894 Kelime)</option>
                    <option value="yds_verbs">Akademik Fiiller (Verbs)</option>
                    <option value="yds_nouns">Akademik İsimler (Nouns)</option>
                    <option value="yds_adj_adv">Sıfatlar &amp; Zarflar</option>
                    <option value="daily">Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
                  ` : `
                    <option value="daily">Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
                    <option value="maarif">5. Sınıf Maarif Modeli</option>
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
      localStorage.removeItem('learnish_active_quiz');
      const totalQ = qState.questions.length;
      const accuracy = Math.round((qState.score / (totalQ || 1)) * 100);
      const earnedXP = qState.score * 15;

      STATE.userData.stats.quizzesPlayed++;
      STATE.userData.stats.correctAnswers += qState.score;
      STATE.userData.stats.totalQuestions += totalQ;
      if (qState.streak > STATE.userData.stats.bestStreak) {
        STATE.userData.stats.bestStreak = qState.streak;
      }
      saveUserData();

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
            <div style="font-family: var(--dp-typography-mono); font-size: 0.9rem; font-weight: 700; color: var(--dp-color-accent); margin-bottom: 10px; letter-spacing: 0.06em;">${statusCode}</div>
            <h2>${titleMessage}</h2>
            <p>${subMessage}</p>

            <div class="stats-summary-grid" style="margin: 20px 0;">
              <div class="stat-metric-card glass-panel">
                <div class="metric-val">${qState.score} / ${totalQ}</div>
                <div class="metric-title">DOĞRU SAYISI</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--dp-color-accent);">%${accuracy}</div>
                <div class="metric-title">BAŞARI ORANI</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--dp-color-field-support);">+${earnedXP}</div>
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
        <div style="font-family:var(--dp-typography-mono); font-size:0.82rem; color:var(--dp-color-ink-muted); margin-top:8px;">SESİ TEKRAR DİNLEMEK İÇİN TIKLAYIN VEYA [R] TUŞUNA BASIN</div>
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

    const optionsHtml = currentQ.options.map((opt, idx) => `
      <button class="quiz-opt-btn" onclick="window.APP.handleQuizAnswer(${idx})">
        <span class="kbd-badge">${String.fromCharCode(65 + idx)}</span>
        <span>${opt.text}</span>
      </button>
    `).join('');

    container.innerHTML = `
      <div class="quiz-wrapper">
        <div class="quiz-active-card glass-panel">
          <div class="quiz-top-bar">
            <span style="font-family:var(--dp-typography-mono); font-size:0.85rem; color:var(--dp-color-ink-muted); font-weight:700;">
              SORU ${qState.currentIndex + 1} / ${qState.questions.length} • ${activeModeTitle}
            </span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="theme-pill" style="color:var(--dp-color-field-support);">SKOR: ${qState.score}</span>
              <button class="ctrl-btn" style="min-height: 36px; padding: 0 12px; font-size:0.75rem;" onclick="window.APP.quitQuiz()">ÇIKIŞ</button>
            </div>
          </div>

          <div class="progress-track" style="margin-bottom: 20px;">
            <div class="progress-fill" style="width: ${((qState.currentIndex) / qState.questions.length) * 100}%;"></div>
          </div>

          <div class="quiz-target-box">
            ${questionContentHtml}
          </div>

          <div class="quiz-options-grid">
            ${optionsHtml}
          </div>

          <div id="quiz-feedback-container"></div>
        </div>
      </div>
    `;

    if (qState.mode === 'listening') {
      setTimeout(() => speakWord(targetWord.en), 200);
    }
  }

  // ==========================================================================
  // VIEW 4: KELİME HAVUZU & ARAMA
  // ==========================================================================
  function renderDirectoryView() {
    const container = document.getElementById('view-directory');
    if (!container) return;

    const filters = STATE.directoryFilters;
    const isYdsModule = STATE.activeModule === 'yds';

    let pool = WORDS_DATA;

    if (isYdsModule) {
      pool = WORDS_DATA.filter(isYDSWord);
    } else if (filters.dataset === 'oxford') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford');
    } else if (filters.dataset === 'maarif') {
      pool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
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

    const filtered = pool;
    const paginatedWords = filtered.slice(0, 100);

    let cardsHtml = '';
    paginatedWords.forEach(w => {
      const isLearned = STATE.userData.learned.has(w.id);
      const isReview = STATE.userData.review.has(w.id);
      const isStarred = STATE.userData.starred.has(w.id);
      const prepBadge = extractPreposition(w);
      const syn = getWordSynonym(w);

      cardsHtml += `
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
              <button class="speak-btn" data-word="${w.en}" aria-label="Dinle: ${w.en}">${ICONS.speaker}</button>
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
    });

    container.innerHTML = `
      <div class="directory-controls glass-panel">
        <div class="search-input-box">
          <span class="search-icon">${ICONS.search}</span>
          <input type="text" class="search-input" id="dir-search-input" placeholder="İngilizce, Türkçe veya eş anlam ara... (ör: abandon, advocate, relieve)" value="${filters.search}" aria-label="Kelime Ara">
        </div>

        ${isYdsModule ? `
          <div style="margin-bottom: 12px;">
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--dp-color-ink-muted); margin-bottom: 6px;">YDS KELİME TÜRLERİ</div>
            <div class="filter-chips-group" id="yds-pos-chips">
              <button class="filter-chip ${filters.pos === 'all' ? 'active' : ''}" data-val="all">TÜM YDS (2.894)</button>
              <button class="filter-chip ${filters.pos === 'verb' ? 'active' : ''}" data-val="verb">AKADEMİK FİİLLER (VERBS)</button>
              <button class="filter-chip ${filters.pos === 'noun' ? 'active' : ''}" data-val="noun">AKADEMİK İSİMLER (NOUNS)</button>
              <button class="filter-chip ${filters.pos === 'adj_adv' ? 'active' : ''}" data-val="adj_adv">SIFATLAR &amp; ZARFLAR</button>
            </div>
          </div>
        ` : `
          <div style="margin-bottom: 12px;">
            <div style="font-family: var(--dp-typography-mono); font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--dp-color-ink-muted); margin-bottom: 6px;">KELİME KÜTÜPHANESİ</div>
            <div class="filter-chips-group" id="dataset-chips">
              <button class="filter-chip ${filters.dataset === 'all' ? 'active' : ''}" data-val="all">TÜM KÜTÜPHANELER (${WORDS_DATA.length})</button>
              <button class="filter-chip ${filters.dataset === 'oxford' ? 'active' : ''}" data-val="oxford">THE OXFORD 5000 (5.841)</button>
              <button class="filter-chip ${filters.dataset === 'maarif' ? 'active' : ''}" data-val="maarif">5. SINIF MAARİF MODELİ (817)</button>
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

        <div class="dir-results-info">
          ${filtered.length} KAYIT LİSTELENİYOR ${filtered.length > 100 ? '(İLK 100 GÖSTERİLİYOR)' : ''}
        </div>
      </div>

      <div class="words-grid">
        ${cardsHtml}
      </div>
    `;

    document.getElementById('dir-search-input')?.addEventListener('input', (e) => {
      STATE.directoryFilters.search = e.target.value;
      renderDirectoryView();
    });

    container.querySelectorAll('#yds-pos-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.directoryFilters.pos = btn.getAttribute('data-val');
        renderDirectoryView();
      });
    });

    container.querySelectorAll('#dataset-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.directoryFilters.dataset = btn.getAttribute('data-val');
        renderDirectoryView();
      });
    });

    container.querySelectorAll('#cefr-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.directoryFilters.cefr = btn.getAttribute('data-val');
        renderDirectoryView();
      });
    });

    container.querySelectorAll('#status-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.directoryFilters.status = btn.getAttribute('data-val');
        renderDirectoryView();
      });
    });

    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        btn.classList.add('speaking');
        speakWord(word, () => btn.classList.remove('speaking'));
      });
    });
  }

  // ==========================================================================
  // VIEW 5: İSTATİSTİKLER & ANALİZ (Maarif vs YDS vs Oxford)
  // ==========================================================================
  function renderStatsView() {
    const container = document.getElementById('view-stats');
    if (!container) return;

    const maarifWords = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
    const maarifLearned = maarifWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const maarifPct = Math.round((maarifLearned / (maarifWords.length || 1)) * 100);

    const ydsWords = WORDS_DATA.filter(isYDSWord);
    const ydsLearned = ydsWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const ydsPct = Math.round((ydsLearned / (ydsWords.length || 1)) * 100);

    const oxfordWords = WORDS_DATA.filter(w => w.dataset === 'oxford');
    const oxfordLearned = oxfordWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const oxfordPct = Math.round((oxfordLearned / (oxfordWords.length || 1)) * 100);

    const quizStats = STATE.userData.stats;
    const quizAccuracy = quizStats.totalQuestions > 0 ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100) : 0;

    // 1. Maarif 8 Themes breakdown
    let themesBreakdownHtml = '';
    for (let t = 1; t <= 8; t++) {
      const tWords = WORDS_DATA.filter(w => w.themeNum === t);
      const tLearned = tWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const tPct = Math.round((tLearned / (tWords.length || 1)) * 100);
      const tMeta = THEMES_DATA[t] || { code: `THEME ${t}`, title: `Tema ${t}`, titleTr: '' };

      themesBreakdownHtml += `
        <div class="theme-stat-row">
          <div style="width: 240px;">
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
          <div style="width: 240px;">
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
          <div style="width: 240px;">
            <div class="theme-stat-name" style="color: var(--dp-color-field-support); font-weight: 700;">CEFR ${item.level}</div>
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

    container.innerHTML = `
      <div class="stats-summary-grid">
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${maarifLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${maarifWords.length}</span></div>
          <div class="metric-title">5. SINIF MAARİF MODELİ (%${maarifPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--dp-color-accent);">${ydsLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${ydsWords.length}</span></div>
          <div class="metric-title">YDS &amp; YÖKDİL AKADEMİK (%${ydsPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val">${oxfordLearned} <span style="font-size: 0.9rem; color: var(--dp-color-ink-muted);">/ ${oxfordWords.length}</span></div>
          <div class="metric-title">THE OXFORD 5000 (%${oxfordPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--dp-color-field-support);">${quizAccuracy}%</div>
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
          5. SINIF MAARİF MODELİ (8 TEMA İLERLEMESİ)
        </h3>
        ${themesBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.03em;">
          THE OXFORD 5000 (CEFR SEVİYE DAĞILIMI)
        </h3>
        ${oxfordBreakdownHtml}
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
      maarif: '5. SINIF MAARİF MODELİ',
      yds: 'YDS & YÖKDİL AKADEMİK',
      oxford: 'THE OXFORD 5000',
      all: 'TÜM KÜTÜPHANE'
    };

    const viewNames = {
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

    if (badgeContainer) {
      if (viewName === 'daily') {
        const isYds = STATE.activeModule === 'yds';
        const isOxford = STATE.activeModule === 'oxford';
        const targetPool = isYds 
          ? WORDS_DATA.filter(isYDSWord) 
          : (isOxford ? WORDS_DATA.filter(w => w.dataset === 'oxford') : WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset));
        
        const bSize = isYds ? 20 : (isOxford ? 25 : 10);
        const start = (STATE.currentDay - 1) * bSize;
        const dayWords = targetPool.slice(start, start + bSize);
        const dayLearned = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
        const totalDay = dayWords.length || bSize;
        const dayPct = Math.round((dayLearned / (totalDay || 1)) * 100);

        const themeNum = Math.ceil(STATE.currentDay / 10);
        const dayTitle = isYds ? `GÜN ${STATE.currentDay}` : (isOxford ? `GÜN ${STATE.currentDay}` : `GÜN ${STATE.currentDay} • TEMA ${themeNum}`);
        const isDone = dayLearned >= totalDay && totalDay > 0;

        badgeContainer.innerHTML = `
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
      if (viewName === 'daily') {
        backBtn.style.opacity = '0.55';
        backBtn.title = 'Zaten Ana Çalışma Alanındasınız';
      } else {
        backBtn.style.opacity = '1';
        backBtn.title = 'Önceki Görünüme Dön';
      }
    }
  }

  function goHome() {
    switchView('daily');
  }

  function goBack() {
    if (STATE.viewHistory && STATE.viewHistory.length > 1) {
      STATE.viewHistory.pop();
      const prev = STATE.viewHistory.pop();
      switchView(prev || 'daily');
    } else {
      switchView('daily');
    }
  }

  // ==========================================================================
  // VIEW SWITCHER & DISPATCHER
  // ==========================================================================
  function switchView(viewName, pushHash = true) {
    STATE.currentView = viewName;
    if (!STATE.viewHistory) STATE.viewHistory = ['daily'];
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

    updateBreadcrumb(viewName);

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
      const targetPool = isYds ? WORDS_DATA.filter(isYDSWord) : WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
      const bSize = isYds ? 20 : 10;
      const start = (STATE.currentDay - 1) * bSize;
      pool = targetPool.slice(start, start + bSize);
    } else if (source === 'review') {
      pool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id));
    } else if (source === 'maarif') {
      pool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
    } else if (source === 'yds_all') {
      pool = WORDS_DATA.filter(isYDSWord);
    } else if (source === 'yds_verbs') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'verb');
    } else if (source === 'yds_nouns') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'noun');
    } else if (source === 'yds_adj_adv') {
      pool = WORDS_DATA.filter(w => isYDSWord(w) && getWordPOS(w) === 'adj_adv');
    } else if (source === 'oxford_all') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford');
    } else {
      pool = WORDS_DATA;
    }

    if (levelVal !== 'all') {
      pool = pool.filter(w => w.cefr === levelVal);
    }

    if (pool.length < 4) {
      alert('Seçilen kriterlerde yeterli kelime (en az 4) bulunamadı. Lütfen tüm kelimeleri seçin.');
      return;
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);
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
      STATE.userData.review.add(currentQ.targetWord.id);
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
          <span class="feedback-hint">KELİME TEKRAR LİSTESİNE EKLENDİ • DOĞRU KARŞILIK:</span>
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
              <p class="feedback-example">“${targetWord.example}”</p>
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
  // FLASHCARD ACTIONS
  // ==========================================================================
  function nextFlashcard() {
    if (STATE.filteredFlashcards.length === 0) return;
    STATE.activeFlashcardIndex = (STATE.activeFlashcardIndex + 1) % STATE.filteredFlashcards.length;
    STATE.flashcardFlipped = false;
    renderFlashcardView();
    updateBreadcrumb('flashcard');
  }

  function prevFlashcard() {
    if (STATE.filteredFlashcards.length === 0) return;
    STATE.activeFlashcardIndex = (STATE.activeFlashcardIndex - 1 + STATE.filteredFlashcards.length) % STATE.filteredFlashcards.length;
    STATE.flashcardFlipped = false;
    renderFlashcardView();
    updateBreadcrumb('flashcard');
  }

  function shuffleFlashcards() {
    STATE.filteredFlashcards.sort(() => Math.random() - 0.5);
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    renderFlashcardView();
  }

  function startDailyFlashcards() {
    STATE.flashcardSource = 'daily';
    STATE.activeFlashcardIndex = 0;
    STATE.flashcardFlipped = false;
    switchView('flashcard');
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

  function speakCurrentWord(word) {
    speakWord(word);
  }

  function resetAllProgress() {
    if (confirm('Tüm öğrenme geçmişiniz ve istatistikleriniz sıfırlanacak. Emin misiniz?')) {
      STATE.userData.learned.clear();
      STATE.userData.review.clear();
      STATE.userData.starred.clear();
      STATE.userData.stats = { quizzesPlayed: 0, correctAnswers: 0, totalQuestions: 0, bestStreak: 0 };
      STATE.currentDay = 1;
      saveUserData();
      updateUI();
    }
  }

  // ==========================================================================
  // KEYBOARD SHORTCUTS (Flashcard & Quiz Mechanical Ergonomics)
  // ==========================================================================
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
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
      } else if (e.key === '1') {
        e.preventDefault();
        toggleReview(currentWord.id);
        nextFlashcard();
      } else if (e.key === '2') {
        e.preventDefault();
        toggleLearned(currentWord.id);
        nextFlashcard();
      }
    } else if (STATE.currentView === 'quiz' && STATE.quizState.active) {
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

    // Apply saved module
    switchModule(STATE.activeModule);

    // Bind Navigation Buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        switchView(view);
      });
    });

    // Accent Switcher (UK / US)
    const accentBtn = document.getElementById('accent-toggle-btn');
    if (accentBtn) {
      accentBtn.innerText = STATE.settings.accent === 'en-GB' ? 'UK' : 'US';
      accentBtn.addEventListener('click', () => {
        STATE.settings.accent = STATE.settings.accent === 'en-GB' ? 'en-US' : 'en-GB';
        localStorage.setItem('mk_accent', STATE.settings.accent);
        accentBtn.innerText = STATE.settings.accent === 'en-GB' ? 'UK' : 'US';
      });
    }

    // Speed Switcher
    const speedBtn = document.getElementById('speed-toggle-btn');
    if (speedBtn) {
      speedBtn.innerText = `${STATE.settings.speed.toFixed(1)}x`;
      speedBtn.addEventListener('click', () => {
        STATE.settings.speed = STATE.settings.speed === 1.0 ? 0.8 : 1.0;
        localStorage.setItem('mk_speed', STATE.settings.speed.toString());
        speedBtn.innerText = `${STATE.settings.speed.toFixed(1)}x`;
      });
    }

    // Sound effects toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.innerText = STATE.settings.soundEffects ? 'SES: AÇIK' : 'SES: KAPALI';
      soundBtn.addEventListener('click', () => {
        STATE.settings.soundEffects = !STATE.settings.soundEffects;
        localStorage.setItem('mk_sound', STATE.settings.soundEffects.toString());
        soundBtn.innerText = STATE.settings.soundEffects ? 'SES: AÇIK' : 'SES: KAPALI';
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerText = STATE.settings.theme === 'dark' ? 'TEMA: KOYU' : 'TEMA: AÇIK';
      themeBtn.addEventListener('click', () => {
        STATE.settings.theme = STATE.settings.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', STATE.settings.theme);
        localStorage.setItem('mk_theme', STATE.settings.theme);
        themeBtn.innerText = STATE.settings.theme === 'dark' ? 'TEMA: KOYU' : 'TEMA: AÇIK';
      });
    }

    // Hash routing
    const validViews = ['daily', 'flashcard', 'quiz', 'directory', 'stats'];
    const initialHash = window.location.hash.replace('#', '');
    const initialView = validViews.includes(initialHash) ? initialHash : 'daily';
    switchView(initialView, false);

    window.addEventListener('hashchange', () => {
      const hView = window.location.hash.replace('#', '');
      if (validViews.includes(hView) && hView !== STATE.currentView) {
        switchView(hView, false);
      } else if (!hView && STATE.currentView !== 'daily') {
        switchView('daily', false);
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
    toggleLearned,
    toggleReview,
    toggleStarred,
    nextFlashcard,
    prevFlashcard,
    shuffleFlashcards,
    startDailyFlashcards,
    startDailyQuiz,
    startQuiz,
    handleQuizAnswer,
    nextQuizQuestion,
    resumeQuiz,
    discardSavedQuiz,
    quitQuiz,
    replayQuizAudio,
    renderFlashcardView,
    resetAllProgress,
    switchView,
    switchModule,
    speakCurrentWord,
    goHome,
    goBack
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
