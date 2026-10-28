/**
 * ============================================================================
 * LEARNISH • MODERN İNGİLİZCE KELİME PLATFORMU
 * Mimari: Maarif 5. Sınıf Modülü | YDS & YÖKDİL Akademik | The Oxford 5000
 * Tasarım: Swiss Minimalist & Editorial Slate (Stripe / Raycast Stili)
 * Web Speech API, Web Audio API Synthesizer, PWA, Cloze Test & Flashcards
 * ============================================================================
 */

(function () {
  'use strict';

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
    return `<span class="cefr-pill ${safeCls}" style="background: var(--${safeCls}-bg, rgba(148,163,184,0.12)); color: var(--${safeCls}-text, #94a3b8); border-color: var(--${safeCls}-border, rgba(148,163,184,0.3));">${raw}</span>`;
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

    // Update brand info subtitle
    const brandSub = document.getElementById('app-brand-subtitle');
    if (brandSub) {
      if (moduleName === 'maarif') brandSub.innerText = '5. Sınıf Maarif Modeli • 817 Kelime & 8 Tema';
      else if (moduleName === 'yds') brandSub.innerText = 'YDS & YÖKDİL Akademik • 2.894 B2/C1 Sınav Kelimesi';
      else if (moduleName === 'oxford') brandSub.innerText = 'The Oxford 5000 • 5.841 Kelime (A1-C1)';
      else brandSub.innerText = 'Tüm Kütüphane • 6.658 Kelime Birleşik Havuz';
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
      bannerTitle = `🎯 Gün ${STATE.currentDay} • YDS & YÖKDİL Akademik Workout`;
      bannerDesc = `Bugünkü <strong>${batchSize} hedef akademik kelime</strong> (Sıra: ${(STATE.currentDay - 1) * batchSize + 1} – ${Math.min(STATE.currentDay * batchSize, targetPool.length)} / ${targetPool.length} B2-C1 Kelime)`;
    } else if (module === 'oxford') {
      targetPool = WORDS_DATA.filter(w => w.dataset === 'oxford');
      batchSize = 25;
      heroClass = 'module-hero-oxford';
      progressFillClass = 'progress-fill-oxford';
      bannerTitle = `🌍 Gün ${STATE.currentDay} • The Oxford 5000 Kelime Paketi`;
      bannerDesc = `Bugünkü <strong>${batchSize} kelime</strong> (Sıra: ${(STATE.currentDay - 1) * batchSize + 1} – ${Math.min(STATE.currentDay * batchSize, targetPool.length)} / ${targetPool.length} Oxford)`;
    } else {
      // Default: Maarif Modeli
      targetPool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
      batchSize = 10;
      heroClass = 'module-hero-maarif';
      progressFillClass = 'progress-fill-maarif';
      bannerTitle = `🎓 Gün ${STATE.currentDay} • 5. Sınıf Maarif Modeli`;
      bannerDesc = `Bugünkü <strong>10 hedef kelime</strong> (Sıra: ${(STATE.currentDay - 1) * 10 + 1} – ${Math.min(STATE.currentDay * 10, targetPool.length)} / ${targetPool.length} Maarif)`;
    }

    const totalDays = Math.ceil(targetPool.length / batchSize) || 1;
    if (STATE.currentDay > totalDays) STATE.currentDay = 1;

    const startIndex = (STATE.currentDay - 1) * batchSize;
    const dayWords = targetPool.slice(startIndex, startIndex + batchSize);
    const dayLearnedCount = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const dayPercent = Math.round((dayLearnedCount / (dayWords.length || 1)) * 100);

    // Build Day options dropdown
    let dayOptionsHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      dayOptionsHtml += `<option value="${d}" ${d === STATE.currentDay ? 'selected' : ''}>Gün ${d} / ${totalDays}</option>`;
    }

    let cardsHtml = '';
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
              <button class="speak-btn" data-word="${w.en}" title="Dinle (${STATE.settings.accent})">🔊</button>
            </div>
            <div class="word-tr">${w.tr || '<span style="color:var(--text-dim); font-style:italic;">(Anlamı ekleniyor)</span>'}</div>
            <div class="word-pos">${w.desc} • ${w.cat || ''}</div>
            ${w.definition ? `<div class="word-def">"${w.definition}"</div>` : ''}
            ${syn ? `<div class="yds-syn-tag"><strong>Eş Anlam:</strong> ${syn}</div>` : ''}
            ${w.example ? `<div class="word-example">“${w.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
          </div>

          <div class="card-footer">
            <div class="card-action-bar">
              <button class="status-badge-btn ${isLearned ? 'learned' : ''}" onclick="window.APP.toggleLearned(${w.id})">
                ${isLearned ? '✅ Öğrendim' : 'Öğren'}
              </button>
              <button class="status-badge-btn ${isReview ? 'review' : ''}" onclick="window.APP.toggleReview(${w.id})">
                ${isReview ? '🔄 Tekrar Et' : 'Zor'}
              </button>
            </div>
            <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="window.APP.toggleStarred(${w.id})" title="Favori">
              ${isStarred ? '★' : '☆'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="module-hero-card ${heroClass} glass-panel">
        <div class="hero-info">
          <h2>${bannerTitle}</h2>
          <p>${bannerDesc}</p>
        </div>
        <div class="day-picker-control">
          <button class="day-step-btn" id="prev-day-btn" ${STATE.currentDay <= 1 ? 'disabled' : ''}>&larr;</button>
          <select class="day-select-input" id="day-select-dropdown">
            ${dayOptionsHtml}
          </select>
          <button class="day-step-btn" id="next-day-btn" ${STATE.currentDay >= totalDays ? 'disabled' : ''}>&rarr;</button>
        </div>
      </div>

      <div class="daily-progress-box glass-panel">
        <div class="progress-header">
          <span>Günün İlerlemesi: <strong>${dayLearnedCount} / ${dayWords.length}</strong> Kelime</span>
          <span style="color: var(--accent-emerald); font-weight:700;">%${dayPercent} Tamamlandı</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill ${progressFillClass}" style="width: ${dayPercent}%;"></div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
          <button class="ctrl-btn" onclick="window.APP.startDailyFlashcards()">
            🗂️ Günün Kartlarıyla Çalış
          </button>
          <button class="ctrl-btn" onclick="window.APP.startDailyQuiz()">
            🧩 Günün Mini Testini Çöz
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
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>🎯 Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>🎯 Tüm YDS/YÖKDİL Kelimeleri (2.894)</option>
        <option value="yds_verbs" ${sourceVal === 'yds_verbs' ? 'selected' : ''}>⚡ Akademik Fiiller (1.100+ Kelime)</option>
        <option value="yds_nouns" ${sourceVal === 'yds_nouns' ? 'selected' : ''}>⚡ Akademik İsimler (900+ Kelime)</option>
        <option value="yds_adj_adv" ${sourceVal === 'yds_adj_adv' ? 'selected' : ''}>⚡ Sıfatlar & Zarflar (800+ Kelime)</option>
        <option value="yds_c1" ${sourceVal === 'yds_c1' ? 'selected' : ''}>💎 C1 İleri Akademik (1.357 Kelime)</option>
        <option value="yds_b2" ${sourceVal === 'yds_b2' ? 'selected' : ''}>💎 B2 Orta-İleri (1.537 Kelime)</option>
      ` : `
        <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün Kelimeleri (Gün ${STATE.currentDay})</option>
        <option value="maarif_all" ${sourceVal === 'maarif_all' ? 'selected' : ''}>🎓 5. Sınıf Maarif Modeli (817 Kelime)</option>
        <option value="yds_all" ${sourceVal === 'yds_all' ? 'selected' : ''}>🎯 YDS & YÖKDİL Akademik (2.894 Kelime)</option>
        <option value="oxford_all" ${sourceVal === 'oxford_all' ? 'selected' : ''}>🌍 The Oxford 5000 (Tümü - 5.841)</option>
        <option value="oxford_a1" ${sourceVal === 'oxford_a1' ? 'selected' : ''}>Oxford 5000: A1 Başlangıç</option>
        <option value="oxford_a2" ${sourceVal === 'oxford_a2' ? 'selected' : ''}>Oxford 5000: A2 Temel</option>
        <option value="oxford_b1" ${sourceVal === 'oxford_b1' ? 'selected' : ''}>Oxford 5000: B1 Orta</option>
      `}
      <option value="all" ${sourceVal === 'all' ? 'selected' : ''}>🌟 Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
      <option value="review" ${sourceVal === 'review' ? 'selected' : ''}>⚠️ Tekrar Edilecekler (${STATE.userData.review.size})</option>
      <option value="starred" ${sourceVal === 'starred' ? 'selected' : ''}>⭐ Favorilerim (${STATE.userData.starred.size})</option>
    `;

    if (pool.length === 0) {
      container.innerHTML = `
        <div class="flashcard-wrapper">
          <div class="flashcard-toolbar">
            <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()">
              ${flashcardSourceOptions}
            </select>
          </div>
          <div class="glass-panel" style="padding: 48px 24px; text-align: center; width: 100%;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">📭</div>
            <h3>Bu grupta henüz kelime bulunmuyor.</h3>
            <p style="color: var(--text-muted); margin-top: 6px;">Lütfen yukarıdan başka bir kelime grubu seçin.</p>
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
          <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()">
            ${flashcardSourceOptions}
          </select>

          <div class="flashcard-counter">
            ${STATE.activeFlashcardIndex + 1} / ${pool.length}
          </div>

          <button class="ctrl-btn" onclick="window.APP.shuffleFlashcards()" title="Kartları Karıştır">
            🔀 Karıştır
          </button>
        </div>

        <div class="card-scene" id="flashcard-scene" title="Kartı çevirmek için tıklayın veya [Space] tuşuna basın">
          <div class="flashcard-inner ${STATE.flashcardFlipped ? 'flipped' : ''}" id="flashcard-inner">
            
            <!-- Front Face -->
            <div class="card-face card-face-front">
              <div class="fc-header">
                <div class="fc-badges">
                  ${getCefrBadgeHtml(currentWord.cefr)}
                  ${currentWord.themeCode ? getThemeBadgeHtml(currentWord.themeCode, currentWord.themeTitle) : ''}
                  ${prepBadge ? `<span class="yds-prep-tag">${prepBadge}</span>` : ''}
                </div>
                <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle">
                  🔊
                </button>
              </div>

              <div class="fc-main">
                <div class="fc-word-en">${currentWord.en}</div>
                ${currentWord.phonetic ? `<div style="font-family:var(--font-mono); color:var(--accent-cyan); font-size:1.05rem; margin-bottom:8px;">${currentWord.phonetic}</div>` : ''}
                <div class="fc-category-desc">${currentWord.desc || ''} ${currentWord.cat ? '• ' + currentWord.cat : ''}</div>
                ${syn ? `<div class="yds-syn-tag" style="margin-top:10px; font-size:0.85rem;"><strong>Eş Anlam:</strong> ${syn}</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">👆 Tıkla veya <span class="kbd-badge">Space</span> ile Türkçe anlamı gör</span>
                <span>#${currentWord.no || currentWord.id}</span>
              </div>
            </div>

            <!-- Back Face -->
            <div class="card-face card-face-back">
              <div class="fc-header">
                <span class="theme-pill" style="color: #34d399; border-color: rgba(16,185,129,0.3);">TÜRKÇE ANLAMI</span>
                <button class="speak-btn" data-word="${currentWord.en}" onclick="event.stopPropagation(); window.APP.speakCurrentWord('${currentWord.en}')" title="Dinle">
                  🔊
                </button>
              </div>

              <div class="fc-main">
                <div class="fc-word-tr">${currentWord.tr || '(Anlamı yakında eklenecek)'}</div>
                <div style="font-size: 0.88rem; color: var(--text-muted); font-weight: 600; margin-bottom: 8px;">
                  ${currentWord.en} — ${currentWord.desc || ''}
                </div>
                ${currentWord.definition ? `<div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:8px; font-style:italic;">“${currentWord.definition}”</div>` : ''}
                ${currentWord.example ? `<div style="font-size:0.82rem; color:#93c5fd; font-style:italic;">“${currentWord.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">👆 Tıkla veya <span class="kbd-badge">Space</span> ile İngilizceye dön</span>
                <span>${currentWord.cat || ''}</span>
              </div>
            </div>

          </div>
        </div>

        <div class="fc-controls">
          <button class="fc-action-btn" onclick="window.APP.prevFlashcard()">
            &larr; Önceki
          </button>
          
          <button class="fc-action-btn ${isReview ? 'btn-review' : ''}" onclick="window.APP.toggleReview(${currentWord.id})">
            🔄 Tekrar Et <span class="kbd-badge">1</span>
          </button>

          <button class="fc-action-btn ${isLearned ? 'btn-learned' : ''}" onclick="window.APP.toggleLearned(${currentWord.id})">
            ✅ Öğrendim <span class="kbd-badge">2</span>
          </button>

          <button class="fc-action-btn" onclick="window.APP.nextFlashcard()">
            Sonraki &rarr;
          </button>
        </div>

        <div class="fc-shortcuts-hint">
          <span><span class="kbd-badge">Space</span> Çevir</span>
          <span><span class="kbd-badge">&larr; / &rarr;</span> Değiştir</span>
          <span><span class="kbd-badge">P</span> Dinle</span>
          <span><span class="kbd-badge">1</span> Tekrar</span>
          <span><span class="kbd-badge">2</span> Öğrendim</span>
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

      container.innerHTML = `
        <div class="quiz-wrapper">
          <div class="quiz-setup-card glass-panel">
            <h2>${isYds ? '🎯 YDS & YÖKDİL Akademik Sınav Simülatörü' : '🧩 İngilizce Kelime Testi & Quiz'}</h2>
            <p>${isYds ? 'ÖSYM sınav formatında cümle tamamlama (cloze), akademik tanım eşleştirme ve kelime soruları.' : 'Bilgilerinizi pekiştirin, çoktan seçmeli sorularla kendinizi test edin.'}</p>

            <div class="quiz-config-grid">
              <div class="config-group">
                <label>Soru Türü</label>
                <select id="quiz-mode-select">
                  <option value="en-tr">🇬🇧 İngilizce &rarr; 🇹🇷 Türkçe (Anlamını Bul)</option>
                  <option value="tr-en">🇹🇷 Türkçe &rarr; 🇬🇧 İngilizce (Kelimeyi Bul)</option>
                  ${isYds ? `
                    <option value="cloze">📝 Cümle Tamamlama (YDS Cloze Test)</option>
                    <option value="definition">📖 İngilizce Tanımdan Kelimeyi Bulma</option>
                  ` : ''}
                  <option value="listening">🎧 Dinleme & Anlama (Sesi Dinle)</option>
                </select>
              </div>

              <div class="config-group">
                <label>Soru Kaynağı</label>
                <select id="quiz-source-select">
                  ${isYds ? `
                    <option value="yds_all">🎯 Tüm YDS/YÖKDİL Havuzu (2.894 Kelime)</option>
                    <option value="yds_verbs">⚡ Akademik Fiiller (Verbs)</option>
                    <option value="yds_nouns">⚡ Akademik İsimler (Nouns)</option>
                    <option value="yds_adj_adv">⚡ Sıfatlar & Zarflar</option>
                    <option value="daily">Günün 20 Hedefi (YDS Gün ${STATE.currentDay})</option>
                  ` : `
                    <option value="daily">Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
                    <option value="maarif">🎓 5. Sınıf Maarif Modeli (817 Kelime)</option>
                    <option value="oxford_all">🌍 The Oxford 5000 (Tüm Havuz)</option>
                    <option value="all">🌟 Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
                  `}
                  <option value="review">⚠️ Zorlandıklarım / Tekrar Edilecekler (${STATE.userData.review.size})</option>
                </select>
              </div>

              <div class="config-group">
                <label>Soru Sayısı</label>
                <select id="quiz-count-select">
                  <option value="10">10 Soru</option>
                  <option value="20">20 Soru</option>
                  <option value="all">Tüm Uygun Kelimeler</option>
                </select>
              </div>

              <div class="config-group">
                <label>Zorluk Seviyesi</label>
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
              🚀 Sınava / Teste Başla
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Active Quiz View
    const qState = STATE.quizState;
    if (qState.currentIndex >= qState.questions.length) {
      // Quiz Finished Screen
      const accuracy = Math.round((qState.score / qState.questions.length) * 100);
      
      // Update statistics
      STATE.userData.stats.quizzesPlayed++;
      STATE.userData.stats.correctAnswers += qState.score;
      STATE.userData.stats.totalQuestions += qState.questions.length;
      if (qState.streak > STATE.userData.stats.bestStreak) {
        STATE.userData.stats.bestStreak = qState.streak;
      }
      saveUserData();

      if (accuracy >= 80) triggerConfetti();

      container.innerHTML = `
        <div class="quiz-wrapper">
          <div class="quiz-setup-card glass-panel" style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 8px;">${accuracy >= 80 ? '🏆' : (accuracy >= 50 ? '👏' : '📚')}</div>
            <h2>Test Tamamlandı!</h2>
            <p>Harika bir çalışma seansı geçirdiniz.</p>

            <div class="stats-summary-grid" style="margin: 20px 0;">
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--accent-emerald);">${qState.score} / ${qState.questions.length}</div>
                <div class="metric-title">Doğru Sayısı</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--yds-accent);">%${accuracy}</div>
                <div class="metric-title">Başarı Oranı</div>
              </div>
              <div class="stat-metric-card glass-panel">
                <div class="metric-val" style="color: var(--accent-cyan);">${qState.streak} 🔥</div>
                <div class="metric-title">En Yüksek Seri</div>
              </div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center;">
              <button class="fc-action-btn" onclick="window.APP.quitQuiz()">
                Yeniden Test Çöz
              </button>
              <button class="fc-action-btn" onclick="window.APP.switchView('daily')">
                Günün Çalışmasına Dön
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const currentQ = qState.questions[qState.currentIndex];
    const targetWord = currentQ.targetWord;

    let questionContentHtml = '';
    if (qState.mode === 'cloze') {
      const regex = new RegExp(`\\b${targetWord.en}[a-z]*\\b`, 'i');
      const clozeText = currentQ.clozeSentence || (targetWord.example ? targetWord.example.replace(regex, '<span class="cloze-blank">_______</span>') : `${targetWord.tr} anlamına gelen kelimeyi seçiniz: <span class="cloze-blank">_______</span>`);
      questionContentHtml = `
        <div class="quiz-mode-label">📝 Cümle Tamamlama (Cloze Soru)</div>
        <div class="quiz-cloze-sentence">“${clozeText}”</div>
        <div style="font-size:0.78rem; color:var(--text-dim); margin-top:8px;">[${targetWord.desc} • ${targetWord.cefr}]</div>
      `;
    } else if (qState.mode === 'definition') {
      questionContentHtml = `
        <div class="quiz-mode-label">📖 İngilizce Tanım Eşleştirme</div>
        <div style="font-size: 1.15rem; color: var(--text-main); line-height: 1.5; font-style: italic;">“${targetWord.definition || targetWord.tr}”</div>
        <div style="font-size:0.78rem; color:var(--text-dim); margin-top:8px;">[${targetWord.desc} • ${targetWord.cefr}]</div>
      `;
    } else if (qState.mode === 'listening') {
      questionContentHtml = `
        <div class="quiz-mode-label">🎧 Telaffuzu Dinleyin</div>
        <button class="speak-btn" style="width: 56px; height: 56px; font-size: 1.6rem; margin: 12px auto;" onclick="window.APP.replayQuizAudio()">
          🔊
        </button>
        <div style="font-size:0.82rem; color:var(--text-muted); margin-top:6px;">Sesi tekrar dinlemek için butona basın</div>
      `;
    } else if (qState.mode === 'tr-en') {
      questionContentHtml = `
        <div class="quiz-mode-label">🇹🇷 Türkçe Anlamı Verilen Kelimeyi Seçin</div>
        <div class="quiz-target-word">${targetWord.tr}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${targetWord.desc} • ${targetWord.cefr}</div>
      `;
    } else {
      // en-tr
      questionContentHtml = `
        <div class="quiz-mode-label">🇬🇧 Kelimenin Türkçe Anlamını Seçin</div>
        <div class="quiz-target-word">${targetWord.en}</div>
        <div style="font-size:0.8rem; color:var(--text-muted);">${targetWord.desc} • ${targetWord.cefr}</div>
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
            <span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-muted); font-weight:700;">
              Soru ${qState.currentIndex + 1} / ${qState.questions.length}
            </span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="theme-pill" style="color:var(--yds-accent);">Skor: ${qState.score}</span>
              <button class="ctrl-btn" style="height: 28px; padding: 0 8px; font-size:0.72rem;" onclick="window.APP.quitQuiz()">Çıkış</button>
            </div>
          </div>

          <div class="progress-track" style="margin-bottom: 20px;">
            <div class="progress-fill" style="width: ${((qState.currentIndex) / qState.questions.length) * 100}%; background:var(--accent-blue);"></div>
          </div>

          <div class="quiz-target-box">
            ${questionContentHtml}
          </div>

          <div class="quiz-options-grid">
            ${optionsHtml}
          </div>
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

    // Module-specific initial scoping
    if (isYdsModule) {
      pool = WORDS_DATA.filter(isYDSWord);
    } else if (filters.dataset === 'oxford') {
      pool = WORDS_DATA.filter(w => w.dataset === 'oxford');
    } else if (filters.dataset === 'maarif') {
      pool = WORDS_DATA.filter(w => w.dataset === 'maarif' || !w.dataset);
    }

    // YDS POS filter
    if (filters.pos && filters.pos !== 'all') {
      pool = pool.filter(w => getWordPOS(w) === filters.pos);
    }

    // Theme filter
    if (filters.theme && filters.theme !== 'all') {
      pool = pool.filter(w => w.themeNum === parseInt(filters.theme, 10));
    }

    // CEFR filter
    if (filters.cefr && filters.cefr !== 'all') {
      pool = pool.filter(w => w.cefr === filters.cefr);
    }

    // Status filter
    if (filters.status === 'learned') {
      pool = pool.filter(w => STATE.userData.learned.has(w.id));
    } else if (filters.status === 'review') {
      pool = pool.filter(w => STATE.userData.review.has(w.id));
    } else if (filters.status === 'starred') {
      pool = pool.filter(w => STATE.userData.starred.has(w.id));
    }

    // Search query filter
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
              <button class="speak-btn" data-word="${w.en}">🔊</button>
            </div>
            <div class="word-tr">${w.tr || '<span style="color:var(--text-dim); font-style:italic;">(Anlamı ekleniyor)</span>'}</div>
            <div class="word-pos">${w.desc} • ${w.cat || ''}</div>
            ${w.definition ? `<div class="word-def">"${w.definition}"</div>` : ''}
            ${syn ? `<div class="yds-syn-tag"><strong>Eş Anlam:</strong> ${syn}</div>` : ''}
            ${w.example ? `<div class="word-example">“${w.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
          </div>

          <div class="card-footer">
            <div class="card-action-bar">
              <button class="status-badge-btn ${isLearned ? 'learned' : ''}" onclick="window.APP.toggleLearned(${w.id})">
                ${isLearned ? '✅ Öğrendim' : 'Öğren'}
              </button>
              <button class="status-badge-btn ${isReview ? 'review' : ''}" onclick="window.APP.toggleReview(${w.id})">
                ${isReview ? '🔄 Tekrar' : 'Zor'}
              </button>
            </div>
            <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="window.APP.toggleStarred(${w.id})">
              ${isStarred ? '★' : '☆'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="directory-controls glass-panel">
        <div class="search-input-box">
          <span class="search-icon">🔍</span>
          <input type="text" class="search-input" id="dir-search-input" placeholder="İngilizce, Türkçe veya eş anlam ara... (ör: abandon, advocate, relieve)" value="${filters.search}">
        </div>

        ${isYdsModule ? `
          <!-- YDS POS Filter Chips -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">YDS Kelime Türleri</div>
            <div class="filter-chips-group" id="yds-pos-chips">
              <button class="filter-chip ${filters.pos === 'all' ? 'active' : ''}" data-val="all">Tüm YDS (2.894)</button>
              <button class="filter-chip ${filters.pos === 'verb' ? 'active' : ''}" data-val="verb">⚡ Akademik Fiiller (Verbs)</button>
              <button class="filter-chip ${filters.pos === 'noun' ? 'active' : ''}" data-val="noun">⚡ Akademik İsimler (Nouns)</button>
              <button class="filter-chip ${filters.pos === 'adj_adv' ? 'active' : ''}" data-val="adj_adv">⚡ Sıfatlar &amp; Zarflar</button>
            </div>
          </div>
        ` : `
          <!-- Dataset Filter Chips -->
          <div style="margin-bottom: 10px;">
            <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">Kelime Kütüphanesi</div>
            <div class="filter-chips-group" id="dataset-chips">
              <button class="filter-chip ${filters.dataset === 'all' ? 'active' : ''}" data-val="all">Tüm Kütüphaneler (${WORDS_DATA.length})</button>
              <button class="filter-chip ${filters.dataset === 'oxford' ? 'active' : ''}" data-val="oxford" style="color:var(--oxford-accent);">🌍 The Oxford 5000 (5.841)</button>
              <button class="filter-chip ${filters.dataset === 'maarif' ? 'active' : ''}" data-val="maarif" style="color:var(--maarif-accent);">🎓 5. Sınıf Maarif Modeli (817)</button>
            </div>
          </div>
        `}

        <!-- CEFR Filter Chips -->
        <div style="margin-bottom: 10px;">
          <div style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">CEFR Düzeyleri</div>
          <div class="filter-chips-group" id="cefr-chips">
            <button class="filter-chip ${filters.cefr === 'all' ? 'active' : ''}" data-val="all">Tüm Düzeyler</button>
            <button class="filter-chip ${filters.cefr === 'A1' ? 'active' : ''}" data-val="A1">A1</button>
            <button class="filter-chip ${filters.cefr === 'A2' ? 'active' : ''}" data-val="A2">A2</button>
            <button class="filter-chip ${filters.cefr === 'B1' ? 'active' : ''}" data-val="B1">B1</button>
            <button class="filter-chip ${filters.cefr === 'B2' ? 'active' : ''}" data-val="B2">B2 (Orta-İleri)</button>
            <button class="filter-chip ${filters.cefr === 'C1' ? 'active' : ''}" data-val="C1">C1 (İleri Akademik)</button>
          </div>
        </div>

        <!-- Status Filter Chips -->
        <div>
          <div class="filter-chips-group" id="status-chips">
            <button class="filter-chip ${filters.status === 'all' ? 'active' : ''}" data-val="all">Tümü</button>
            <button class="filter-chip ${filters.status === 'learned' ? 'active' : ''}" data-val="learned">✅ Öğrenilenler (${STATE.userData.learned.size})</button>
            <button class="filter-chip ${filters.status === 'review' ? 'active' : ''}" data-val="review">🔄 Tekrar Edilecekler (${STATE.userData.review.size})</button>
            <button class="filter-chip ${filters.status === 'starred' ? 'active' : ''}" data-val="starred">⭐ Favoriler (${STATE.userData.starred.size})</button>
          </div>
        </div>

        <div class="dir-results-info">
          ${filtered.length} kelime listeleniyor ${filtered.length > 100 ? '(İlk 100 gösteriliyor)' : ''}
        </div>
      </div>

      <div class="words-grid">
        ${cardsHtml}
      </div>
    `;

    // Search input
    document.getElementById('dir-search-input')?.addEventListener('input', (e) => {
      STATE.directoryFilters.search = e.target.value;
      renderDirectoryView();
    });

    // Chip bindings
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

    const totalLearned = STATE.userData.learned.size;
    const totalWords = WORDS_DATA.length;
    const progressPercent = Math.round((totalLearned / totalWords) * 100);

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
      const tMeta = THEMES_DATA[t] || { code: `THEME ${t}`, title: `Tema ${t}`, titleTr: '', badgeBg: '#10b981' };

      themesBreakdownHtml += `
        <div class="theme-stat-row">
          <div style="width: 220px;">
            <div class="theme-stat-name">${tMeta.code}: ${tMeta.title}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${tMeta.titleTr}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${tPct}%; background: ${tMeta.badgeBg}; border-radius: 4px;"></div>
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; min-width: 80px; text-align: right;">
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
      { name: 'C1 İleri Akademik Kelimeler', words: ydsC1, color: '#f59e0b' },
      { name: 'B2 Orta-İleri Kelimeler', words: ydsB2, color: '#8b5cf6' },
      { name: 'Akademik Fiiller (Verbs)', words: ydsVerbs, color: '#3b82f6' },
      { name: 'Akademik İsimler (Nouns)', words: ydsNouns, color: '#10b981' },
      { name: 'Sıfatlar & Zarflar', words: ydsAdjs, color: '#06b6d4' }
    ];

    let ydsBreakdownHtml = '';
    ydsItems.forEach(item => {
      const learned = item.words.filter(w => STATE.userData.learned.has(w.id)).length;
      const pct = Math.round((learned / (item.words.length || 1)) * 100);
      ydsBreakdownHtml += `
        <div class="theme-stat-row">
          <div style="width: 240px;">
            <div class="theme-stat-name" style="color: ${item.color};">${item.name}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${pct}%; background: ${item.color}; border-radius: 4px;"></div>
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; min-width: 80px; text-align: right;">
            ${learned} / ${item.words.length} (%${pct})
          </div>
        </div>
      `;
    });

    // 3. Oxford CEFR breakdown
    const cefrLevels = [
      { level: 'A1', name: 'A1 Başlangıç (Beginner)', color: '#10b981' },
      { level: 'A2', name: 'A2 Temel (Elementary)', color: '#06b6d4' },
      { level: 'B1', name: 'B1 Eşik / Orta (Intermediate)', color: '#3b82f6' },
      { level: 'B2', name: 'B2 Orta-İleri (Upper Intermediate)', color: '#8b5cf6' },
      { level: 'C1', name: 'C1 İleri (Advanced)', color: '#f59e0b' }
    ];

    let oxfordBreakdownHtml = '';
    cefrLevels.forEach(item => {
      const cWords = oxfordWords.filter(w => w.cefr === item.level);
      const cLearned = cWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const cPct = Math.round((cLearned / (cWords.length || 1)) * 100);

      oxfordBreakdownHtml += `
        <div class="theme-stat-row">
          <div style="width: 220px;">
            <div class="theme-stat-name" style="color: ${item.color}; font-weight: 700;">CEFR ${item.level}</div>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${item.name}</div>
          </div>
          <div class="theme-stat-bar-container">
            <div style="height: 100%; width: ${cPct}%; background: ${item.color}; border-radius: 4px;"></div>
          </div>
          <div style="font-size: 0.82rem; font-weight: 700; min-width: 80px; text-align: right;">
            ${cLearned} / ${cWords.length} (%${cPct})
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="stats-summary-grid">
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--maarif-accent);">${maarifLearned} <span style="font-size: 0.9rem; opacity: 0.7;">/ ${maarifWords.length}</span></div>
          <div class="metric-title">5. Sınıf Maarif Modeli (%${maarifPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--yds-accent);">${ydsLearned} <span style="font-size: 0.9rem; opacity: 0.7;">/ ${ydsWords.length}</span></div>
          <div class="metric-title">YDS &amp; YÖKDİL Akademik (%${ydsPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--oxford-accent);">${oxfordLearned} <span style="font-size: 0.9rem; opacity: 0.7;">/ ${oxfordWords.length}</span></div>
          <div class="metric-title">The Oxford 5000 (%${oxfordPct})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: #60a5fa;">${quizAccuracy}%</div>
          <div class="metric-title">Quiz Doğruluğu (En İyi Seri: ${quizStats.bestStreak} 🔥)</div>
        </div>
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
          <span>🎯 YDS &amp; YÖKDİL Akademik Seviye &amp; Tür Dağılımı</span>
        </h3>
        ${ydsBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
          <span>🎓 5. Sınıf Maarif Modeli (8 Tema İlerlemesi)</span>
        </h3>
        ${themesBreakdownHtml}
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 20px;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 12px; display:flex; align-items:center; gap:8px;">
          <span>🌍 The Oxford 5000 (CEFR Seviye Dağılımı)</span>
        </h3>
        ${oxfordBreakdownHtml}
      </div>

      <div class="glass-panel" style="padding: 16px; text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">İlerlemenizi sıfırlayıp baştan başlamak ister misiniz?</p>
        <button class="ctrl-btn" style="color: var(--accent-rose); border-color: rgba(244,63,94,0.4); margin: 0 auto;" onclick="window.APP.resetAllProgress()">
          ⚠️ İlerlemeyi Sıfırla
        </button>
      </div>
    `;
  }

  // ==========================================================================
  // CONFETTI CELEBRATION
  // ==========================================================================
  function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.7) * 15,
        size: Math.random() * 7 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    let frame = 0;
    function anim() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.vr;
        p.alpha -= 0.014;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 80) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = 'none';
      }
    }
    anim();
  }

  // ==========================================================================
  // VIEW SWITCHER & DISPATCHER
  // ==========================================================================
  function switchView(viewName) {
    STATE.currentView = viewName;
    if (window.location.hash !== '#' + viewName) {
      window.location.hash = viewName;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

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
  // QUIZ LOGIC
  // ==========================================================================
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
      answered: false
    };

    renderQuizView();
  }

  function handleQuizAnswer(optionIdx) {
    if (STATE.quizState.answered) return;
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
    } else {
      STATE.quizState.streak = 0;
      playSound('wrong');
      STATE.userData.review.add(currentQ.targetWord.id);
      saveUserData();
    }

    setTimeout(() => {
      STATE.quizState.currentIndex++;
      STATE.quizState.answered = false;
      renderQuizView();
    }, 1100);
  }

  function quitQuiz() {
    STATE.quizState.active = false;
    renderQuizView();
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
  }

  function prevFlashcard() {
    if (STATE.filteredFlashcards.length === 0) return;
    STATE.activeFlashcardIndex = (STATE.activeFlashcardIndex - 1 + STATE.filteredFlashcards.length) % STATE.filteredFlashcards.length;
    STATE.flashcardFlipped = false;
    renderFlashcardView();
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
  // KEYBOARD SHORTCUTS
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
      accentBtn.innerHTML = STATE.settings.accent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US';
      accentBtn.addEventListener('click', () => {
        STATE.settings.accent = STATE.settings.accent === 'en-GB' ? 'en-US' : 'en-GB';
        localStorage.setItem('mk_accent', STATE.settings.accent);
        accentBtn.innerHTML = STATE.settings.accent === 'en-GB' ? '🇬🇧 UK' : '🇺🇸 US';
      });
    }

    // Speed Switcher
    const speedBtn = document.getElementById('speed-toggle-btn');
    if (speedBtn) {
      speedBtn.innerHTML = `⚡ ${STATE.settings.speed}x`;
      speedBtn.addEventListener('click', () => {
        STATE.settings.speed = STATE.settings.speed === 1.0 ? 0.8 : 1.0;
        localStorage.setItem('mk_speed', STATE.settings.speed.toString());
        speedBtn.innerHTML = `⚡ ${STATE.settings.speed}x`;
      });
    }

    // Sound effects toggle
    const soundBtn = document.getElementById('sound-toggle-btn');
    if (soundBtn) {
      soundBtn.innerHTML = STATE.settings.soundEffects ? '🔔 Ses Açık' : '🔕 Sessiz';
      soundBtn.addEventListener('click', () => {
        STATE.settings.soundEffects = !STATE.settings.soundEffects;
        localStorage.setItem('mk_sound', STATE.settings.soundEffects.toString());
        soundBtn.innerHTML = STATE.settings.soundEffects ? '🔔 Ses Açık' : '🔕 Sessiz';
      });
    }

    // Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = STATE.settings.theme === 'dark' ? '☀️ Açık' : '🌙 Koyu';
      themeBtn.addEventListener('click', () => {
        STATE.settings.theme = STATE.settings.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', STATE.settings.theme);
        localStorage.setItem('mk_theme', STATE.settings.theme);
        themeBtn.innerHTML = STATE.settings.theme === 'dark' ? '☀️ Açık' : '🌙 Koyu';
      });
    }

    // Hash routing
    const validViews = ['daily', 'flashcard', 'quiz', 'directory', 'stats'];
    const initialHash = window.location.hash.replace('#', '');
    const initialView = validViews.includes(initialHash) ? initialHash : 'daily';
    switchView(initialView);

    window.addEventListener('hashchange', () => {
      const hView = window.location.hash.replace('#', '');
      if (validViews.includes(hView) && hView !== STATE.currentView) {
        switchView(hView);
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
    quitQuiz,
    replayQuizAudio,
    renderFlashcardView,
    resetAllProgress,
    switchView,
    switchModule,
    speakCurrentWord
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
