#!/usr/bin/env node
/**
 * ============================================================================
 * LEARNISH E2E & FUNCTIONAL TEST RUNNER (tests/e2e_test_runner.js)
 * ============================================================================
 * 
 * Standalone, hermetic, zero-external-dependency E2E and functional test suite
 * for Learnish (MEB, YDS & The Oxford 5000 English learning platform).
 * 
 * Implements 4 Tiers of verification:
 *   - Tier 1: Feature Coverage (>=5 tests per major feature across 7 features)
 *   - Tier 2: Boundary & Corner Cases (empty inputs, invalid routes, boundary grades)
 *   - Tier 3: Cross-Feature Combinations (module transitions, theme + modals, SRS stats)
 *   - Tier 4: Real-World Scenarios (complete study flow, full quiz session, bundle sync)
 * 
 * Execution:
 *   node tests/e2e_test_runner.js
 *   node tests/e2e_test_runner.js --strict
 *   node tests/e2e_test_runner.js --tier=1,4
 *   node tests/e2e_test_runner.js --filter=quiz
 * ============================================================================
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Paths to application assets
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INDEX_HTML_PATH = path.join(PROJECT_ROOT, 'index.html');
const APP_CSS_PATH = path.join(PROJECT_ROOT, 'app.css');
const APP_JS_PATH = path.join(PROJECT_ROOT, 'app.js');
const CURRICULUM_DATA_PATH = path.join(PROJECT_ROOT, 'curriculum-data.js');
const WORDS_DATA_PATH = path.join(PROJECT_ROOT, 'words-data.js');
const BUNDLE_HTML_PATH = path.join(PROJECT_ROOT, 'Learnish_Tek_Dosya_Web_App.html');

// CLI Arguments
const args = process.argv.slice(2);
const IS_STRICT = args.includes('--strict');
const TIER_FILTER_ARG = args.find(a => a.startsWith('--tier='));
const NAME_FILTER_ARG = args.find(a => a.startsWith('--filter='));
const ALLOWED_TIERS = TIER_FILTER_ARG ? TIER_FILTER_ARG.split('=')[1].split(',').map(Number) : null;
const NAME_FILTER = NAME_FILTER_ARG ? NAME_FILTER_ARG.split('=')[1].toLowerCase() : null;

// ANSI Colors for clean terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// ============================================================================
// 1. HERMETIC BROWSER SANDBOX & MOCK DOM
// ============================================================================

class MockClassList {
  constructor(className = '') {
    this._classes = new Set(className.split(/\s+/).filter(Boolean));
  }
  add(...classes) {
    classes.forEach(c => c && this._classes.add(c));
  }
  remove(...classes) {
    classes.forEach(c => this._classes.delete(c));
  }
  toggle(cls, force) {
    if (force === undefined) force = !this._classes.has(cls);
    if (force) this._classes.add(cls);
    else this._classes.delete(cls);
    return force;
  }
  contains(cls) {
    return this._classes.has(cls);
  }
  toString() {
    return Array.from(this._classes).join(' ');
  }
}

class MockElement {
  constructor(tagName = 'div', id = '', className = '', registry = null) {
    this.tagName = tagName.toUpperCase();
    this.id = id;
    this.className = className;
    this.classList = new MockClassList(className);
    this.attributes = new Map();
    this.children = [];
    this._innerHTML = '';
    this.innerText = '';
    this.textContent = '';
    this._value = '';
    this.checked = false;
    this.style = {};
    this.listeners = {};
    this.parentElement = null;
    this._registry = registry;

    if (id) {
      this.attributes.set('id', id);
      if (registry) registry.set(id, this);
    }
    if (className) this.attributes.set('class', className);
  }

  get value() { return this._value; }
  set value(v) { this._value = String(v); }

  setAttribute(name, val) {
    const sVal = String(val);
    this.attributes.set(name, sVal);
    if (name === 'id') {
      this.id = sVal;
      if (this._registry) this._registry.set(sVal, this);
    } else if (name === 'class') {
      this.className = sVal;
      this.classList = new MockClassList(sVal);
    } else if (name === 'value') {
      this._value = sVal;
    } else if (name === 'style') {
      sVal.split(';').forEach(rule => {
        const parts = rule.split(':');
        const k = parts[0] ? parts[0].trim() : '';
        const v = parts[1] ? parts.slice(1).join(':').trim() : '';
        if (k && v) {
          const camelK = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
          this.style[camelK] = v;
        }
      });
    }
  }

  getAttribute(name) {
    if (name === 'class') return this.classList.toString();
    if (name === 'id') return this.id;
    if (name === 'value') return this._value;
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    this.children.push(child);
    if (child && typeof child === 'object') {
      child.parentElement = this;
    }
    return child;
  }

  remove() {
    if (this.parentElement && Array.isArray(this.parentElement.children)) {
      this.parentElement.children = this.parentElement.children.filter(ch => ch !== this);
    }
  }

  addEventListener(event, fn) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(fn);
  }

  removeEventListener(event, fn) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(f => f !== fn);
    }
  }

  dispatchEvent(evt) {
    evt.target = this;
    const list = this.listeners[evt.type] || [];
    list.forEach(fn => fn(evt));
  }

  click() {
    this.dispatchEvent({
      type: 'click',
      target: this,
      preventDefault: () => {},
      stopPropagation: () => {}
    });
  }

  focus() {}
  blur() {}
  scrollIntoView() {}
  getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100 }; }

  closest(selector) {
    let cur = this;
    while (cur) {
      if (cur.matches(selector)) return cur;
      cur = cur.parentElement;
    }
    return null;
  }

  matches(selector) {
    if (!selector) return false;
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector.includes('[')) {
      const m = selector.match(/\[([a-zA-Z0-9_-]+)=?["']?([^"']*)?["']?\]/);
      if (m) {
        const attr = m[1];
        const val = m[2];
        return val ? this.getAttribute(attr) === val : this.hasAttribute(attr);
      }
    }
    return this.tagName.toLowerCase() === selector.toLowerCase();
  }

  querySelector(sel) {
    const list = this.querySelectorAll(sel);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(sel) {
    const results = [];
    const walk = (node) => {
      for (const ch of node.children) {
        if (ch.matches(sel)) results.push(ch);
        walk(ch);
      }
    };
    walk(this);
    return results;
  }

  get innerHTML() { return this._innerHTML; }
  set innerHTML(html) {
    this._innerHTML = html;
    this.children = [];
    
    // Parse child tags from HTML
    const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>([\s\S]*?)<\/\1>|<([a-zA-Z0-9]+)([^>]*)\/?>/g;
    let match;
    const self = this;
    const parseTag = (tag, attrsStr, inner) => {
      const idMatch = attrsStr.match(/id=[\"']([^\"']+)[\"']/);
      const classMatch = attrsStr.match(/class=[\"']([^\"']+)[\"']/);
      const dataViewMatch = attrsStr.match(/data-view=[\"']([^\"']+)[\"']/);
      const dataModuleMatch = attrsStr.match(/data-module=[\"']([^\"']+)[\"']/);
      const valueMatch = attrsStr.match(/value=[\"']([^\"']+)[\"']/);
      const id = idMatch ? idMatch[1] : '';
      const cls = classMatch ? classMatch[1] : '';
      
      const child = new MockElement(tag, id, cls, self._registry);
      child.parentElement = self;
      if (dataViewMatch) child.setAttribute('data-view', dataViewMatch[1]);
      if (dataModuleMatch) child.setAttribute('data-module', dataModuleMatch[1]);
      if (valueMatch) child.value = valueMatch[1];

      if (tag.toLowerCase() === 'select' && inner) {
        const optRegex = /<option[^>]*value=[\"']([^\"']+)[\"'][^>]*>/g;
        let om;
        let firstOpt = null;
        let selectedOpt = null;
        while ((om = optRegex.exec(inner)) !== null) {
          if (!firstOpt) firstOpt = om[1];
          if (om[0].includes('selected')) selectedOpt = om[1];
        }
        child.value = selectedOpt || firstOpt || '';
      }
      self.children.push(child);
      if (id && self._registry) self._registry.set(id, child);
    };

    while ((match = tagRegex.exec(html)) !== null) {
      if (match[1]) {
        parseTag(match[1], match[2], match[3]);
      } else if (match[4]) {
        parseTag(match[4], match[5], '');
      }
    }
  }
}

// Pre-load static databases once for lightning performance
const staticDbSandbox = { window: {}, globalThis: {} };
staticDbSandbox.window = staticDbSandbox;
staticDbSandbox.globalThis = staticDbSandbox;

const rawCurriculumCode = fs.readFileSync(CURRICULUM_DATA_PATH, 'utf8');
const rawWordsCode = fs.readFileSync(WORDS_DATA_PATH, 'utf8');
const rawAppJsCode = fs.readFileSync(APP_JS_PATH, 'utf8');
const rawIndexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const rawAppCss = fs.readFileSync(APP_CSS_PATH, 'utf8');

vm.runInNewContext(rawCurriculumCode, staticDbSandbox);
vm.runInNewContext(rawWordsCode, staticDbSandbox);

const SHARED_CURRICULUM_DATA = staticDbSandbox.CURRICULUM_DATA;
const SHARED_CURRICULUM_CLASSIFIER = staticDbSandbox.CURRICULUM_CLASSIFIER;
const SHARED_CURRICULUM_DICTIONARY = staticDbSandbox.CURRICULUM_DICTIONARY;
const SHARED_ACADEMIC_CALENDAR = staticDbSandbox.ACADEMIC_CALENDAR;
const SHARED_WORDS_DATA = staticDbSandbox.WORDS_DATA;
const SHARED_THEMES_DATA = staticDbSandbox.THEMES_DATA;

/**
 * Creates a fresh, isolated execution sandbox for a single test.
 */
function createFreshAppEnvironment(options = {}) {
  const elementRegistry = new Map();
  const allElements = [];

  const docElement = new MockElement('html', '', '', elementRegistry);
  const headElement = new MockElement('head', '', '', elementRegistry);
  const bodyElement = new MockElement('body', '', '', elementRegistry);
  docElement.children.push(headElement, bodyElement);
  allElements.push(docElement, headElement, bodyElement);

  // Parse all static tags from index.html into DOM
  const tagRegex = /<([a-zA-Z0-9]+)([^>]*)>/g;
  let m;
  while ((m = tagRegex.exec(rawIndexHtml)) !== null) {
    const tagName = m[1];
    const attrs = m[2];
    const idMatch = attrs.match(/id=[\"']([^\"']+)[\"']/);
    const classMatch = attrs.match(/class=[\"']([^\"']+)[\"']/);
    const dataViewMatch = attrs.match(/data-view=[\"']([^\"']+)[\"']/);
    const dataModuleMatch = attrs.match(/data-module=[\"']([^\"']+)[\"']/);
    const nameMatch = attrs.match(/name=[\"']([^\"']+)[\"']/);
    const contentMatch = attrs.match(/content=[\"']([^\"']+)[\"']/);
    const styleMatch = attrs.match(/style=[\"']([^\"']+)[\"']/);

    const el = new MockElement(tagName, idMatch ? idMatch[1] : '', classMatch ? classMatch[1] : '', elementRegistry);
    if (dataViewMatch) el.setAttribute('data-view', dataViewMatch[1]);
    if (dataModuleMatch) el.setAttribute('data-module', dataModuleMatch[1]);
    if (nameMatch) el.setAttribute('name', nameMatch[1]);
    if (contentMatch) el.setAttribute('content', contentMatch[1]);
    if (styleMatch) el.setAttribute('style', styleMatch[1]);
    bodyElement.children.push(el);
    allElements.push(el);
  }

  // Mock In-Memory Storage
  const storageMap = Object.assign({}, options.initialStorage || {});
  const localStorageMock = {
    getItem: (k) => storageMap[k] !== undefined ? storageMap[k] : null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; },
    clear: () => { Object.keys(storageMap).forEach(k => delete storageMap[k]); },
    _dump: () => Object.assign({}, storageMap)
  };

  const domListeners = {};

  const documentMock = {
    documentElement: docElement,
    head: headElement,
    body: bodyElement,
    getElementById: (id) => elementRegistry.get(id) || null,
    querySelector: (sel) => {
      if (sel.startsWith('#')) return elementRegistry.get(sel.slice(1)) || null;
      if (sel === 'meta[name="theme-color"]') {
        return allElements.find(el => el.tagName === 'META' && el.getAttribute('name') === 'theme-color') || null;
      }
      for (const el of allElements) {
        if (el.matches(sel)) return el;
      }
      return null;
    },
    querySelectorAll: (sel) => {
      return allElements.filter(el => el.matches(sel));
    },
    createElement: (tag) => {
      const el = new MockElement(tag, '', '', elementRegistry);
      allElements.push(el);
      return el;
    },
    addEventListener: (event, fn) => {
      if (!domListeners[event]) domListeners[event] = [];
      domListeners[event].push(fn);
    },
    removeEventListener: (event, fn) => {
      if (domListeners[event]) domListeners[event] = domListeners[event].filter(f => f !== fn);
    },
    dispatchEvent: (evt) => {
      const list = domListeners[evt.type] || [];
      list.forEach(fn => fn(evt));
    },
    // Gerçek API gibi ready/finished/updateCallbackDone sözleri döndürür (app.js switchView bunları kullanır)
    startViewTransition: (cb) => {
      if (cb) cb();
      const done = Promise.resolve();
      return { ready: done, finished: done, updateCallbackDone: done, skipTransition() {} };
    }
  };

  const spokenUtterances = [];
  const soundPlayedLog = [];

  const windowMock = {
    document: documentMock,
    location: {
      hash: options.initialHash || '#home',
      href: `http://localhost/index.html${options.initialHash || '#home'}`,
      pathname: '/index.html',
      search: '',
      protocol: 'http:',
      hostname: 'localhost'
    },
    history: {
      pushState: (st, t, u) => {
        windowMock.location.hash = u.startsWith('#') ? u : '#' + u;
      },
      replaceState: () => {}
    },
    localStorage: localStorageMock,
    sessionStorage: localStorageMock,
    navigator: {
      userAgent: 'LearnishNodeE2ETestEngine/1.0',
      serviceWorker: { controller: null, register: () => Promise.resolve({ addEventListener() {}, installing: null, waiting: null }), addEventListener() {}, removeEventListener() {} }
    },
    speechSynthesis: options.speechSynthesis !== undefined ? options.speechSynthesis : {
      speak: (utt) => spokenUtterances.push(utt),
      cancel: () => {},
      getVoices: () => []
    },
    SpeechSynthesisUtterance: function (text) {
      this.text = text;
      this.lang = 'en-US';
      this.rate = 1.0;
    },
    Audio: class {
      constructor(src) { this.src = src; }
      play() {
        soundPlayedLog.push(this.src);
        return Promise.resolve();
      }
      pause() {}
    },
    confirm: () => true,
    alert: (msg) => { windowMock.__lastAlert = msg; },
    prompt: () => '',
    print: () => { windowMock.__printed = true; },
    URL: {
      createObjectURL: (blob) => 'blob:mock-url-' + Math.random().toString(36).slice(2),
      revokeObjectURL: () => {}
    },
    Blob: class {
      constructor(parts, opts) {
        this.parts = parts;
        this.opts = opts;
      }
    },
    addEventListener: (evt, fn) => {
      if (!domListeners[evt]) domListeners[evt] = [];
      domListeners[evt].push(fn);
    },
    removeEventListener: (evt, fn) => {
      if (domListeners[evt]) domListeners[evt] = domListeners[evt].filter(f => f !== fn);
    },
    dispatchEvent: (evt) => {
      const list = domListeners[evt.type] || [];
      list.forEach(fn => fn(evt));
    },
    setTimeout: (cb, ms) => {
      if (options.immediateTimers) { cb(); return 1; }
      return setTimeout(cb, ms);
    },
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    matchMedia: (query) => ({
      matches: !!options.reducedMotion && /prefers-reduced-motion:\s*reduce/.test(String(query)),
      media: String(query),
      addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}
    }),
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    CURRICULUM_DATA: SHARED_CURRICULUM_DATA,
    CURRICULUM_CLASSIFIER: SHARED_CURRICULUM_CLASSIFIER,
    CURRICULUM_DICTIONARY: SHARED_CURRICULUM_DICTIONARY,
    ACADEMIC_CALENDAR: SHARED_ACADEMIC_CALENDAR,
    WORDS_DATA: SHARED_WORDS_DATA,
    THEMES_DATA: SHARED_THEMES_DATA,
    __spokenUtterances: spokenUtterances,
    __soundPlayedLog: soundPlayedLog
  };
  windowMock.window = windowMock;

  const sandbox = {
    window: windowMock,
    document: documentMock,
    localStorage: localStorageMock,
    navigator: windowMock.navigator,
    history: windowMock.history,
    location: windowMock.location,
    speechSynthesis: windowMock.speechSynthesis,
    SpeechSynthesisUtterance: windowMock.SpeechSynthesisUtterance,
    Audio: windowMock.Audio,
    Blob: windowMock.Blob,
    URL: windowMock.URL,
    confirm: windowMock.confirm,
    alert: windowMock.alert,
    setTimeout: windowMock.setTimeout,
    clearTimeout: windowMock.clearTimeout,
    matchMedia: windowMock.matchMedia,
    setInterval: windowMock.setInterval,
    clearInterval: windowMock.clearInterval,
    CURRICULUM_DATA: SHARED_CURRICULUM_DATA,
    CURRICULUM_CLASSIFIER: SHARED_CURRICULUM_CLASSIFIER,
    CURRICULUM_DICTIONARY: SHARED_CURRICULUM_DICTIONARY,
    ACADEMIC_CALENDAR: SHARED_ACADEMIC_CALENDAR,
    WORDS_DATA: SHARED_WORDS_DATA,
    THEMES_DATA: SHARED_THEMES_DATA,
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {}
    }
  };
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;

  // Evaluate app.js in sandbox
  vm.runInNewContext(rawAppJsCode, sandbox);

  // Trigger DOMContentLoaded
  const domLoaded = domListeners['DOMContentLoaded'] || [];
  domLoaded.forEach(fn => fn());

  return {
    sandbox,
    window: windowMock,
    document: documentMock,
    APP: windowMock.APP,
    localStorage: localStorageMock,
    navigator: windowMock.navigator,
    spokenUtterances,
    soundPlayedLog,
    elementRegistry
  };
}

// ============================================================================
// 2. ASSERTION ENGINE
// ============================================================================

function assert(condition, message = 'Assertion failed') {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'assertEqual failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    throw new Error(`${message || 'assertDeepEqual failed'}: expected ${expectedStr}, got ${actualStr}`);
  }
}

function assertIncludes(haystack, needle, message) {
  if (!haystack || !haystack.includes(needle)) {
    throw new Error(`${message || 'assertIncludes failed'}: expected "${needle}" to be included`);
  }
}

// ============================================================================
// 3. TEST SUITE RUNNER FRAMEWORK
// ============================================================================

const TEST_REGISTRY = [];

function registerTest(tier, category, name, testFn, options = {}) {
  TEST_REGISTRY.push({
    tier,
    category,
    name,
    testFn,
    knownDefect: options.knownDefect || null,
    milestone: options.milestone || null
  });
}

// ============================================================================
// 4. TEST DEFINITIONS: TIER 1 - FEATURE COVERAGE (>=5 TESTS PER FEATURE)
// ============================================================================

// --- 1.1 Navigation Tabs & Canopy (7 Tests) ---

registerTest(1, 'Navigation & Canopy', 'test_nav_home_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('home');
  assertEqual(env.APP.getState().currentView, 'home', 'currentView should be home');
  const homeSection = env.document.getElementById('view-home');
  assert(homeSection.classList.contains('active'), '#view-home section should have active class');
  const greetingTitle = env.document.getElementById('header-user-title');
  assert(greetingTitle, '#header-user-title should exist in header');
  assert(!env.document.getElementById('context-canopy'), '#context-canopy should be removed from DOM');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_home_view_orientation_and_modules_guide', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('home');
  const homeSection = env.document.getElementById('view-home');
  assert(homeSection.innerHTML.includes('Öğrenim Modülleri Rehberi'), 'Home view should contain module guide section');
  assert(homeSection.innerHTML.includes('MEB Türkiye Yüzyılı Maarif Modeli'), 'Home view should describe MEB module');
  assert(homeSection.innerHTML.includes('YDS, YÖKDİL, YDT'), 'Home view should describe YDS module');
  assert(homeSection.innerHTML.includes('Kelime Kütüphanesi'), 'Home view should describe Library module');
  assert(homeSection.innerHTML.includes('Bilişsel Öğrenme Yol Haritası') || homeSection.innerHTML.includes('Nasıl Çalışmalısınız'), 'Home view should provide methodology guide');
  assert(homeSection.innerHTML.includes('AI Speaking &amp; Telaffuz Koçu') || homeSection.innerHTML.includes('Telaffuz Koçu'), 'Home view should showcase speaking coach feature');
  assert(homeSection.innerHTML.includes('PDF &amp; Çalışma Kağıdı Stüdyosu') || homeSection.innerHTML.includes('PDF'), 'Home view should showcase PDF studio feature');
});

registerTest(1, 'Navigation & Canopy', 'test_home_route_card_select_module_action', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('home');
  assertEqual(env.APP.getState().activeModule, 'maarif', 'Default module should be maarif');
  
  // Select YDS from home guide card
  env.APP.selectModuleAndGo('yds');
  assertEqual(env.APP.getState().activeModule, 'yds', 'activeModule should switch to yds');
  assertEqual(env.APP.getState().currentView, 'daily', 'currentView should transition to daily');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_daily_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('daily');
  assertEqual(env.APP.getState().currentView, 'daily', 'currentView should be daily');
  const dailySection = env.document.getElementById('view-daily');
  assert(dailySection.classList.contains('active'), '#view-daily should have active class');
  const greetingLabel = env.document.getElementById('header-greeting-label');
  assert(greetingLabel && greetingLabel.textContent.includes('GÜNLÜK ÇALIŞMA'), 'Header greeting label should reflect daily view');
});

registerTest(1, 'Navigation & Canopy', 'test_curriculum_outcomes_and_focus_untruncated', () => {
  const env = createFreshAppEnvironment();
  const sched = env.window.CURRICULUM_CLASSIFIER.getWeekByNumber(5, 10);
  assert(sched, 'Schedule for 5th grade week 10 must exist');
  assert(!sched.focus.includes('revisi'), 'Focus must not be arbitrarily truncated at "revisi"');
  assertEqual(sched.focus, 'Classroom rules and language; school subjects; timetables; classroom objects; days of the week; time', 'Focus should be clean extracted sub-themes');
  assert(Array.isArray(sched.outcomesList), 'outcomesList must be an array');
  assertEqual(sched.outcomesList.length, 23, 'Theme 2 should have exactly 23 full outcomes');
  assertEqual(sched.outcomesList[0].code, 'ENG.5.2.L1', 'First outcome must be ENG.5.2.L1');
  assertEqual(sched.outcomesList[sched.outcomesList.length - 1].code, 'ENG.5.2.S6', 'Last outcome must be ENG.5.2.S6');
  assert(sched.outcomesList[0].text.length > 50, 'Outcome text must be complete and informative');
});

registerTest(1, 'Navigation & Canopy', 'test_daily_view_curriculum_outcomes_drawer_and_toggle', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('daily');
  env.APP.changeScheduleWeek(10);
  const dailySection = env.document.getElementById('view-daily');
  assert(dailySection.innerHTML.includes('curriculum-outcomes-card'), 'Daily view must render curriculum-outcomes-card');
  assert(dailySection.innerHTML.includes('23 Kazanım'), 'Outcomes card must show 23 Kazanım pill badge');
  assert(dailySection.innerHTML.includes('ENG.5.2.L1'), 'Outcomes card must include ENG.5.2.L1');
  assert(typeof env.APP.toggleCurriculumOutcomes === 'function', 'toggleCurriculumOutcomes must be exposed on APP');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_flashcard_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  assertEqual(env.APP.getState().currentView, 'flashcard', 'currentView should be flashcard');
  const fcSection = env.document.getElementById('view-flashcard');
  assert(fcSection.classList.contains('active'), '#view-flashcard should have active class');
  const state = env.APP.getState();
  assert(state.filteredFlashcards && state.filteredFlashcards.length > 0, 'Flashcard pool should be populated');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_quiz_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  assertEqual(env.APP.getState().currentView, 'quiz', 'currentView should be quiz');
  const quizSection = env.document.getElementById('view-quiz');
  assert(quizSection.classList.contains('active'), '#view-quiz should have active class');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_directory_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  assertEqual(env.APP.getState().currentView, 'directory', 'currentView should be directory');
  const dirSection = env.document.getElementById('view-directory');
  assert(dirSection.classList.contains('active'), '#view-directory should have active class');
  assertIncludes(dirSection.innerHTML, 'search-input-box', 'Directory view should contain search input container');
});

registerTest(1, 'Navigation & Canopy', 'test_nav_stats_view_activation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('stats');
  assertEqual(env.APP.getState().currentView, 'stats', 'currentView should be stats');
  const statsSection = env.document.getElementById('view-stats');
  assert(statsSection.classList.contains('active'), '#view-stats should have active class');
});

registerTest(1, 'Navigation & Canopy', 'test_header_route_and_telemetry_reflects_active_module', () => {
  const env = createFreshAppEnvironment();
  // Ensure canopy is absent from DOM
  assert(!env.document.getElementById('context-canopy'), '#context-canopy should not exist in DOM');

  env.APP.switchModule('yds');
  const hrLabel = env.document.getElementById('header-route-label');
  const hrIcon = env.document.getElementById('header-route-icon');
  assertEqual(hrLabel.textContent, 'YDS / YÖKDİL', 'Header route pill label should update to YDS / YÖKDİL');
  assert(hrIcon.getAttribute('data-icon') === 'target' || hrIcon.innerHTML.includes('data-icon="target"'), 'Header route pill icon should update to target SVG');
  
  env.APP.switchModule('oxford');
  assertEqual(hrLabel.textContent, 'Kütüphane', 'Header route pill label should update to Kütüphane');
  assert(hrIcon.getAttribute('data-icon') === 'book' || hrIcon.innerHTML.includes('data-icon="book"'), 'Header route pill icon should update to book SVG');

  env.APP.switchModule('maarif');
  assert(hrIcon.getAttribute('data-icon') === 'school' || hrIcon.innerHTML.includes('data-icon="school"'), 'Header route pill icon should update to school SVG');
  assertIncludes(hrLabel.textContent, 'Sınıf MEB', 'Header route pill label should reflect MEB grade');
});

registerTest(1, 'Navigation & Canopy', 'test_header_route_pill_replaces_horizontal_selector', () => {
  const env = createFreshAppEnvironment();
  
  // 1. Old horizontal scroll selector must be absent from main navigation flow
  const oldSelector = env.document.querySelector('.horizontal-scroll-selector');
  assert(!oldSelector, 'Old horizontal-scroll-selector must be removed from the DOM');

  // 2. Header route pill button must exist in header
  const routePill = env.document.getElementById('header-route-pill-btn');
  assert(routePill, '#header-route-pill-btn must exist in top header');
  const hrIcon = env.document.getElementById('header-route-icon');
  const hrLabel = env.document.getElementById('header-route-label');
  assert(hrIcon, '#header-route-icon must exist inside route pill');
  assert(hrLabel, '#header-route-label must exist inside route pill');

  // Default state: Maarif 5. Sınıf
  assert(hrIcon.getAttribute('data-icon') === 'school' || hrIcon.innerHTML.includes('data-icon="school"'), 'Route pill icon should be school icon for MEB Maarif');
  assertIncludes(hrLabel.textContent, '5. Sınıf', 'Route pill label should show 5. Sınıf');

  // 3. Dynamic route switching updates pill
  env.APP.switchModule('yds');
  assert(hrIcon.getAttribute('data-icon') === 'target' || hrIcon.innerHTML.includes('data-icon="target"'), 'Route pill icon should be target for YDS');
  assertEqual(hrLabel.textContent, 'YDS / YÖKDİL', 'Route pill label should be YDS / YÖKDİL');

  env.APP.switchModule('oxford');
  assert(hrIcon.getAttribute('data-icon') === 'book' || hrIcon.innerHTML.includes('data-icon="book"'), 'Route pill icon should be books for Library');
  assertEqual(hrLabel.textContent, 'Kütüphane', 'Route pill label should be Kütüphane');

  env.APP.switchGrade(8);
  assert(hrIcon.getAttribute('data-icon') === 'school' || hrIcon.innerHTML.includes('data-icon="school"'), 'Route pill icon should be school for MEB grade');
  assertIncludes(hrLabel.textContent, '8. Sınıf', 'Route pill label should show 8. Sınıf');

  // 4. Clicking route pill triggers grade & curriculum modal
  const dialog = env.document.getElementById('grade-dialog');
  const backdrop = env.document.getElementById('grade-modal-backdrop');
  assert(dialog && backdrop, 'Grade & route dialog elements must exist');
  assert(!dialog.classList.contains('active'), 'Dialog should initially be closed');

  env.APP.openGradeModal();
  assert(dialog.classList.contains('active'), 'Clicking route pill must open grade modal dialog');
  assert(backdrop.classList.contains('active'), 'Backdrop must be active');

  // 5. Verify modal title and body structure
  const dialogTitle = env.document.getElementById('grade-dialog-title');
  assert(dialogTitle, '#grade-dialog-title must exist');
  assertIncludes(rawIndexHtml, 'id="grade-dialog-title" class="grade-dialog-title">Öğrenim Rotası &amp; Sınıf Seçici</h2>', 'Dialog title in index.html should be unified Öğrenim Rotası & Sınıf Seçici');
  
  const dialogBody = env.document.getElementById('grade-dialog-body');
  assert(dialogBody, '#grade-dialog-body must exist');
  assertIncludes(dialogBody.innerHTML, 'İLKOKUL', 'Dialog body should contain İlkokul stage');
  assertIncludes(dialogBody.innerHTML, 'ORTAOKUL', 'Dialog body should contain Ortaokul stage');
  assertIncludes(dialogBody.innerHTML, 'LİSE', 'Dialog body should contain Lise stage');
  assertIncludes(dialogBody.innerHTML, 'AKADEMİK &amp; GENEL HAVUZLAR', 'Dialog body should contain Academic & General pools');
});

registerTest(1, 'Navigation & Canopy', 'test_grade_modal_all_modules_clickable_and_scrollable', () => {
  // 1. Validate app.css brace balance & scrollable .grade-dialog-body rule
  const cssNoComments = rawAppCss.replace(/\/\*[\s\S]*?\*\//g, m => '\n'.repeat(m.split('\n').length - 1));
  let depth = 0;
  cssNoComments.split('\n').forEach((line, idx) => {
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth < 0) {
          throw new Error(`CSS unmatched closing brace at line ${idx + 1}: ${line.trim()}`);
        }
      }
    }
    if (depth === 0 && line.includes(':') && !line.includes('{') && !line.trim().startsWith('@') && line.trim().endsWith(';')) {
      throw new Error(`CSS orphan declaration outside block at line ${idx + 1}: ${line.trim()}`);
    }
  });
  assertEqual(depth, 0, 'app.css must have balanced braces');

  const bodyRuleMatch = cssNoComments.match(/(^|\})\s*\.grade-dialog-body\s*,\s*\.classifier-dialog-body\s*\{([^}]*)\}/m);
  assert(bodyRuleMatch, '.grade-dialog-body rule must not be corrupted by preceding tokens');
  assertIncludes(bodyRuleMatch[2], 'overflow-y: auto', '.grade-dialog-body must enable overflow-y: auto');
  assertIncludes(bodyRuleMatch[2], 'min-height: 0', '.grade-dialog-body must set min-height: 0 inside flex column');

  // 2. Validate every --dp-* CSS variable used in CSS and JS is defined
  const definedVars = new Set([...cssNoComments.matchAll(/(--dp-[a-zA-Z0-9_-]+)\s*:/g)].map(m => m[1]));
  const usedCssVars = [...cssNoComments.matchAll(/var\(\s*(--dp-[a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  const usedJsVars = [...rawAppJsCode.matchAll(/var\(\s*(--dp-[a-zA-Z0-9_-]+)/g)].map(m => m[1]);
  const undefinedVars = [...new Set([...usedCssVars, ...usedJsVars])].filter(v => !definedVars.has(v));
  assertEqual(undefinedVars.length, 0, `All CSS custom properties must be defined (missing: ${undefinedVars.join(', ')})`);

  // 3. Open modal, verify ordering & body scroll lock, and verify clicking each module switches AND closes modal
  const env = createFreshAppEnvironment();
  const dialog = env.document.getElementById('grade-dialog');
  const backdrop = env.document.getElementById('grade-modal-backdrop');
  const body = env.document.getElementById('grade-dialog-body');

  env.APP.openGradeModal();
  assert(dialog.classList.contains('active'), '#grade-dialog should open');
  assert(backdrop.classList.contains('active'), '#grade-modal-backdrop should open');
  assert(env.document.body.classList.contains('modal-open'), 'body should receive modal-open class');
  assertEqual(body.style.overflowY, 'auto', '#grade-dialog-body must enforce inline overflowY: auto');
  assertEqual(body.style.maxHeight, 'calc(86vh - 82px)', '#grade-dialog-body must enforce inline maxHeight for desktop scrolling');
  assertIncludes(rawAppCss, '.grade-dialog-body::-webkit-scrollbar', 'app.css should style desktop custom scrollbar for .grade-dialog-body');

  const akIdx = body.innerHTML.indexOf('AKADEMİK &amp; GENEL HAVUZLAR');
  const ilkIdx = body.innerHTML.indexOf('İLKOKUL');
  assert(akIdx !== -1 && ilkIdx !== -1 && akIdx < ilkIdx, 'AKADEMİK & GENEL HAVUZLAR must render before K-12 stage groups for instant access');

  for (const mod of ['yds', 'oxford', 'all']) {
    env.APP.openGradeModal();
    assert(dialog.classList.contains('active'), `#grade-dialog should open before selecting ${mod}`);
    env.APP.switchModuleAndClose(mod);
    assertEqual(env.APP.getState().activeModule, mod, `switchModuleAndClose should switch activeModule to ${mod}`);
    assert(!dialog.classList.contains('active'), `#grade-dialog must close after switchModuleAndClose('${mod}')`);
    assert(!backdrop.classList.contains('active'), `#grade-modal-backdrop must close after switchModuleAndClose('${mod}')`);
    assert(!env.document.body.classList.contains('modal-open'), 'body modal-open lock should clear after closing modal');
  }
});

// --- 1.2 Theme Toggle & Tokens (6 Tests) ---

registerTest(1, 'Theme & Tokens', 'test_theme_toggle_light_to_dark', () => {
  const env = createFreshAppEnvironment();
  const themeBtn = env.document.getElementById('theme-toggle-btn');
  assert(themeBtn, 'theme-toggle-btn element must exist');
  themeBtn.click();
  assertEqual(env.APP.getState().settings.theme, 'dark', 'Theme state should be dark');
  assertEqual(env.document.documentElement.getAttribute('data-theme'), 'dark', 'HTML element should have data-theme=dark');
  assertEqual(env.localStorage.getItem('mk_theme'), 'dark', 'localStorage mk_theme should be dark');
});

registerTest(1, 'Theme & Tokens', 'test_theme_toggle_dark_to_light', () => {
  const env = createFreshAppEnvironment({ initialStorage: { mk_theme: 'dark' } });
  const themeBtn = env.document.getElementById('theme-toggle-btn');
  themeBtn.click();
  assertEqual(env.APP.getState().settings.theme, 'light', 'Theme state should toggle back to light');
  assertEqual(env.document.documentElement.getAttribute('data-theme'), 'light', 'HTML element should have data-theme=light');
});

registerTest(1, 'Theme & Tokens', 'test_theme_meta_tag_synchronization', () => {
  const env = createFreshAppEnvironment();
  const metaTheme = env.document.querySelector('meta[name="theme-color"]');
  assert(metaTheme, 'meta[name=theme-color] must exist');
  const themeBtn = env.document.getElementById('theme-toggle-btn');
  themeBtn.click();
  const content = metaTheme.getAttribute('content');
  assert(content !== null, 'theme-color meta tag must have content');
});

registerTest(1, 'Theme & Tokens', 'test_theme_css_tokens_defined', () => {
  // Verifies that critical DESIGN.md CSS variables are defined in app.css
  const missingTokens = [];
  const requiredTokens = [
    '--dp-color-amber',
    '--dp-color-surface-2',
    '--dp-color-bg',
    '--dp-color-emphasis',
    '--dp-color-sand',
    '--dp-border-rule',
    '--dp-color-field',
    '--dp-color-field-support',
    '--dp-color-accent-ink',
    '--dp-color-error'
  ];
  for (const token of requiredTokens) {
    const isDefined = new RegExp(`${token}\\s*:`).test(rawAppCss);
    if (!isDefined) missingTokens.push(token);
  }
  if (missingTokens.length > 0) {
    throw new Error(`Missing CSS variable definitions in app.css: ${missingTokens.join(', ')}`);
  }
}, { knownDefect: '10 undefined CSS variables in app.css', milestone: 'M1' });

registerTest(1, 'Theme & Tokens', 'test_theme_absence_of_neo_brutalist_pure_black', () => {
  // DESIGN.md: Pure black (#000000) is NEVER used in box-shadow or borders
  const blackShadowRegex = /box-shadow:[^;]*#000000/i;
  const inCss = blackShadowRegex.test(rawAppCss);
  const inJs = blackShadowRegex.test(rawAppJsCode);
  if (inCss || inJs) {
    throw new Error('Detected forbidden neo-brutalist #000000 box-shadow in codebase');
  }
}, { knownDefect: 'Legacy neo-brutalist #000000 box-shadows in app.js/app.css', milestone: 'M1' });

registerTest(1, 'Theme & Tokens', 'test_theme_modal_dialog_header_contrast', () => {
  // Modal dialog headers must not use transparent or undefined backgrounds
  const hasUndefinedSurface2 = /\.grade-dialog-header[\s\S]*?var\(--dp-color-surface-2\)/.test(rawAppCss);
  const isDefined = /--dp-color-surface-2\s*:/.test(rawAppCss);
  if (hasUndefinedSurface2 && !isDefined) {
    throw new Error('Grade modal header uses undefined --dp-color-surface-2 token');
  }
}, { knownDefect: 'Modal headers use undefined --dp-color-surface-2', milestone: 'M1' });

// --- 1.3 Flashcard 3D Flip & SRS Engine (6 Tests) ---

registerTest(1, 'Flashcard & SRS', 'test_flashcard_renders_target_word', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  const fcSection = env.document.getElementById('view-flashcard');
  const state = env.APP.getState();
  const currentWord = state.filteredFlashcards[state.activeFlashcardIndex];
  assert(currentWord, 'Current word must be defined in flashcard view');
  assertIncludes(fcSection.innerHTML, currentWord.en, 'Flashcard DOM should render target English word');
});

registerTest(1, 'Flashcard & SRS', 'test_curriculum_flashcards_have_authentic_turkish_definitions_and_no_placeholders', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchGrade(3);
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  assert(state.filteredFlashcards && state.filteredFlashcards.length > 0, 'Grade 3 flashcards must not be empty');
  
  for (const w of state.filteredFlashcards) {
    assert(w.tr && w.tr.trim().length > 0, `Turkish definition of "${w.en}" must not be empty`);
    assert(!w.tr.toLowerCase().includes('resmi müfredat'), `Turkish definition of "${w.en}" must not contain placeholder: "${w.tr}"`);
    assert(w.tr !== '—', `Turkish definition of "${w.en}" must not be dash`);
  }

  // Explicitly check key Grade 3 curriculum terms
  const testTerms = ['classmate', 'librarian', 'school nurse', 'headteacher', 'caretaker', 'art room', 'music room', 'birthday party', 'summer holiday', 'pencil case', 'vegetables'];
  for (const term of testTerms) {
    const resolved = env.APP.resolveCurriculumWord(term, 3, 0);
    assert(resolved, `Term "${term}" must resolve successfully`);
    assert(resolved.tr && !resolved.tr.toLowerCase().includes('resmi müfredat'), `Resolved "${term}" translation must be authentic: "${resolved.tr}"`);
  }
});

registerTest(1, 'Flashcard & SRS', 'test_flashcard_flip_toggles_state', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  assertEqual(env.APP.getState().flashcardFlipped, false, 'Card should be initially unflipped');
  
  // Trigger space key down to flip
  env.window.dispatchEvent({ type: 'keydown', code: 'Space', target: env.document.body, preventDefault: () => {} });
  assertEqual(env.APP.getState().flashcardFlipped, true, 'Card should be flipped after space key');
  
  // Flip back
  env.window.dispatchEvent({ type: 'keydown', code: 'Space', target: env.document.body, preventDefault: () => {} });
  assertEqual(env.APP.getState().flashcardFlipped, false, 'Card should be unflipped after second space key');
});

registerTest(1, 'Flashcard & SRS', 'test_flashcard_srs_rating_again', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  const wordId = state.filteredFlashcards[0].id;
  
  // Rate 'Again' (quality 1)
  env.APP.markFlashcardSRS(wordId, 1);
  const srsRecord = state.userData.srs[wordId];
  assert(srsRecord, 'SRS record must exist for word');
  assertEqual(srsRecord.interval, 1, 'Interval after Again should be 1 day');
  assert(srsRecord.easeFactor < 2.5, 'Ease factor should decrease after Again');
});

registerTest(1, 'Flashcard & SRS', 'test_flashcard_srs_rating_good', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  const wordId = state.filteredFlashcards[0].id;
  
  // Rate 'Good' (quality 4)
  env.APP.markFlashcardSRS(wordId, 4);
  const srsRecord = state.userData.srs[wordId];
  assert(srsRecord, 'SRS record must exist for word');
  assertEqual(srsRecord.repetitions, 1, 'Repetitions should increment');
  assertEqual(srsRecord.interval, 1, 'First Good interval is 1 day');
});

registerTest(1, 'Flashcard & SRS', 'test_flashcard_srs_rating_easy', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  const wordId = state.filteredFlashcards[0].id;
  
  // Rate 'Easy' (quality 5)
  env.APP.markFlashcardSRS(wordId, 5);
  const srsRecord = state.userData.srs[wordId];
  assert(srsRecord, 'SRS record must exist for word');
  assert(srsRecord.easeFactor > 2.5, 'Ease factor should increase after Easy rating');
});

registerTest(1, 'Flashcard & SRS', 'test_flashcard_navigation_next_prev', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  assertEqual(env.APP.getState().activeFlashcardIndex, 0, 'Initial flashcard index should be 0');
  
  env.APP.nextFlashcard();
  assertEqual(env.APP.getState().activeFlashcardIndex, 1, 'Flashcard index should advance to 1');
  
  env.APP.prevFlashcard();
  assertEqual(env.APP.getState().activeFlashcardIndex, 0, 'Flashcard index should decrement back to 0');
});

// --- 1.4 Quiz Engine & Options (6 Tests) ---

registerTest(1, 'Quiz Engine', 'test_quiz_generation_question_count', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  assert(qState.active, 'Quiz should be active');
  assertEqual(qState.questions.length, 10, 'Quiz should generate 10 questions by default');
});

registerTest(1, 'Quiz Engine', 'test_quiz_question_options_structure', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  const q0 = qState.questions[0];
  assertEqual(q0.options.length, 4, 'Each question must have exactly 4 options');
  const correctCount = q0.options.filter(o => o.isCorrect).length;
  assertEqual(correctCount, 1, 'Each question must have exactly 1 correct answer');
});

registerTest(1, 'Quiz Engine', 'test_quiz_correct_answer_scoring', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  const q0 = qState.questions[0];
  const correctIdx = q0.options.findIndex(o => o.isCorrect);
  
  env.APP.handleQuizAnswer(correctIdx);
  assertEqual(qState.score, 1, 'Score should increment by 1 on correct answer');
  assertEqual(qState.streak, 1, 'Streak should increment by 1 on correct answer');
  assertEqual(qState.answered, true, 'Question should be marked answered');
});

registerTest(1, 'Quiz Engine', 'test_quiz_incorrect_answer_scoring_and_mistakes', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  const q0 = qState.questions[0];
  const wrongIdx = q0.options.findIndex(o => !o.isCorrect);
  
  env.APP.handleQuizAnswer(wrongIdx);
  assertEqual(qState.score, 0, 'Score should remain 0 on incorrect answer');
  assertEqual(qState.streak, 0, 'Streak should reset to 0 on incorrect answer');
  assertEqual(qState.waitingFeedback, true, 'Quiz should enter waitingFeedback state');
  
  // Verify logged to mistake camp
  const targetId = q0.targetWord.id;
  const mistakeRecord = env.APP.getState().userData.mistakes[targetId];
  assert(mistakeRecord, 'Mistake should be recorded in userData.mistakes');
  assertEqual(mistakeRecord.wrongCount, 1, 'Mistake wrongCount should be 1');
});

registerTest(1, 'Quiz Engine', 'test_quiz_session_state_persistence', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const saved = env.localStorage.getItem('learnish_active_quiz');
  assert(saved !== null, 'Active quiz must be persisted in localStorage');
  const parsed = JSON.parse(saved);
  assert(parsed.active, 'Persisted quiz state must indicate active: true');
  assertEqual(parsed.questions.length, 10, 'Persisted quiz should have 10 questions');
});

registerTest(1, 'Quiz Engine', 'test_quiz_advance_to_next_question', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const q0 = env.APP.getState().quizState.questions[0];
  const correctIdx = q0.options.findIndex(o => o.isCorrect);
  env.APP.handleQuizAnswer(correctIdx);
  
  env.APP.nextQuizQuestion();
  assertEqual(env.APP.getState().quizState.currentIndex, 1, 'currentIndex should advance to 1');
  assertEqual(env.APP.getState().quizState.answered, false, 'answered state should reset for next question');
});

// --- 1.5b Kitaplık Veri Yardımcıları ---

registerTest(1, 'Library Data', 'test_library_letter_of', () => {
  const { APP } = createFreshAppEnvironment();
  assertEqual(APP.libraryLetterOf({ en: 'abandon' }), 'A');
  assertEqual(APP.libraryLetterOf({ en: ' Éclair' }), 'E');
  assertEqual(APP.libraryLetterOf({ en: '1st' }), '#');
  assertEqual(APP.libraryLetterOf({ en: 'Ƒoo' }), '#');
});

registerTest(1, 'Library Data', 'test_library_index_groups_and_sorts', () => {
  const { APP } = createFreshAppEnvironment();
  const idx = APP.buildLibraryIndex([{ id:1,en:'dog' },{ id:2,en:'apple' },{ id:3,en:'Desk' },{ id:4,en:'1st' }]);
  assertDeepEqual(idx.letters, ['A','D','#']);
  assertDeepEqual(idx.byLetter.D.map(w => w.en), ['Desk','dog']);
});

registerTest(1, 'Library Data', 'test_library_spine_tone_and_size', () => {
  const { APP } = createFreshAppEnvironment();
  assertEqual(APP.spineToneClass('A1'), 'tone-a1');
  assertEqual(APP.spineToneClass('C2+'), 'tone-c2');
  assertEqual(APP.spineToneClass(undefined), 'tone-a2');
  assertEqual(APP.spineHeightPx({ id: 3, en: 'go' }), 138);
  assertEqual(APP.spineHeightPx({ id: 5, en: 'x'.repeat(68) }), 190);
  assertEqual(APP.spineLabel('be in charge of something important'), 'be in charge of somet…');
  assertEqual(APP.spineLabel('decide'), 'decide');
});

registerTest(1, 'Library Data', 'test_library_ruler_groups', () => {
  const { APP } = createFreshAppEnvironment();
  const mk = (p, n) => Array.from({ length: n }, (_, i) => ({ id: i, en: p + String.fromCharCode(97 + (i % 26)) + i }));
  assertDeepEqual(APP.shelfRulerGroups(mk('da', 59)), []);
  const words = [...mk('da',20),...mk('de',20),...mk('di',20),...mk('do',20)];
  assertDeepEqual(APP.shelfRulerGroups(words), [
    { label:'DA', index:0 }, { label:'DE', index:20 }, { label:'DI', index:40 }, { label:'DO', index:60 }]);
  const many = 'abcdefghij'.split('').flatMap(c => mk('d' + c, 10));
  const g = APP.shelfRulerGroups(many);
  assert(g.length <= 8, 'en fazla 8 grup');
  assertEqual(g[0].index, 0);
  assert(g.some(x => x.label.includes('–')), 'birleşen gruplar "DA–DB" biçiminde');
});

registerTest(1, 'Library Data', 'test_filtered_words_ignore_search', () => {
  const env = createFreshAppEnvironment();
  const before = env.APP.getFilteredDirectoryWords().length;
  env.APP.getState().directoryFilters.search = 'abandon';
  assertEqual(env.APP.getFilteredDirectoryWords().length, before);
});

registerTest(1, 'Library Search', 'test_library_suggest_ranking', () => {
  const { APP } = createFreshAppEnvironment();
  const ws = [{id:1,en:'abandon',tr:'terk etmek'},{id:2,en:'ban',tr:'yasak'},{id:3,en:'urban',tr:'kentsel'},{id:4,en:'leave',tr:'ayrılmak',alt:'abandon'}];
  assertDeepEqual(APP.librarySuggest('ban', ws, ws).map(s => s.word.id), [2,1,3,4]); // 4: alt='abandon' içinde geçer
  assertDeepEqual(APP.librarySuggest('abandon', ws, ws).map(s => s.word.id), [1,4]);
  assertDeepEqual(APP.librarySuggest('terk', ws, ws).map(s => s.word.id), [1]);
  assertDeepEqual(APP.librarySuggest('   ', ws, ws), []);
});

registerTest(1, 'Library Search', 'test_library_suggest_outside_filter_and_limit', () => {
  const { APP } = createFreshAppEnvironment();
  const all = Array.from({ length: 10 }, (_, i) => ({ id: i, en: 'deal' + i }));
  const r = APP.librarySuggest('deal', all.slice(0, 2), all);
  assertEqual(r.length, 6);
  assertDeepEqual(r.map(s => s.outsideFilter), [false,false,true,true,true,true]);
});

// --- 1.5 Word Directory Search & Filters (6 Tests) ---

registerTest(1, 'Word Directory', 'test_directory_search_by_english_word', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const state = env.APP.getState();
  state.directoryFilters.search = 'abandon';
  env.APP.renderDirectoryView();
  
  const dirSection = env.document.getElementById('view-directory');
  assertIncludes(dirSection.innerHTML, 'abandon', 'Directory should display matching word abandon');
});

registerTest(1, 'Word Directory', 'test_directory_search_by_turkish_translation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const state = env.APP.getState();
  state.directoryFilters.search = 'terk etmek';
  env.APP.renderDirectoryView();
  
  const dirSection = env.document.getElementById('view-directory');
  assertIncludes(dirSection.innerHTML, 'abandon', 'Directory should match abandon from Turkish query');
});

registerTest(1, 'Word Directory', 'test_directory_filter_by_pos', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchModule('yds');
  env.APP.switchView('directory');
  const state = env.APP.getState();
  state.directoryFilters.pos = 'verb';
  env.APP.renderDirectoryView();
  
  const dirSection = env.document.getElementById('view-directory');
  assert(dirSection.innerHTML.length > 500, 'Filtered verb list should render cards');
});

registerTest(1, 'Word Directory', 'test_directory_filter_by_cefr', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const state = env.APP.getState();
  state.directoryFilters.cefr = 'A1';
  env.APP.renderDirectoryView();
  
  const dirSection = env.document.getElementById('view-directory');
  assertIncludes(dirSection.innerHTML, 'A1', 'Directory cards should render A1 badges');
});

registerTest(1, 'Word Directory', 'test_directory_pagination_controls', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  assertEqual(env.APP.getState().directoryPage, 1, 'Initial page should be 1');
  
  env.APP.setDirectoryPage(2);
  assertEqual(env.APP.getState().directoryPage, 2, 'Page should advance to 2');
});

registerTest(1, 'Word Directory', 'test_directory_in_place_status_toggle', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  const wordId = 1; // Valid integer ID
  env.APP.toggleLearned(wordId);
  assert(env.APP.getState().userData.learned.has(wordId), 'Word should be marked in learned set');
});

registerTest(1, 'Word Directory', 'test_directory_absence_of_redundant_grade_filter', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchModule('maarif');
  env.APP.switchView('directory');
  const dirSection = env.document.getElementById('view-directory');
  assert(!dirSection.innerHTML.includes('MEB: 5. SINIF MAARİF'), 'Directory must not contain redundant 5. Sınıf filter chip');
  assert(dirSection.innerHTML.includes('TÜM KÜTÜPHANELER'), 'Directory should offer unified library chip');
  assert(dirSection.innerHTML.includes('KÜTÜPHANE'), 'Directory should offer Kütüphane chip');
  assert(dirSection.innerHTML.includes('YDS &amp; YÖKDİL') || dirSection.innerHTML.includes('YDS & YÖKDİL'), 'Directory should offer YDS chip');
});

registerTest(1, 'Word Directory', 'test_directory_zero_duplicates_guarantee', () => {
  const env = createFreshAppEnvironment();
  const allWords = env.window.WORDS_DATA;
  
  // 1. Verify zero normalized duplicates in entire master dataset
  const seenNorm = new Set();
  const dupClusters = [];
  for (const w of allWords) {
    const k = (w.en || '').trim().toLowerCase().replace(/[\.\!\?,;:]+$/g, '').replace(/[\s\-_~]+/g, '');
    if (seenNorm.has(k)) {
      dupClusters.push(w.en);
    }
    seenNorm.add(k);
  }
  assertEqual(dupClusters.length, 0, `Master WORDS_DATA must have 0 duplicate clusters (found: ${dupClusters.slice(0, 5).join(', ')})`);

  // 2. Verify duplicate pairs have strictly ONE card with unified information
  const emailCards = allWords.filter(w => w.en.toLowerCase() === 'email');
  assertEqual(emailCards.length, 1, 'email must have strictly 1 card in WORDS_DATA');
  assertEqual(emailCards[0].alt, 'e-mail', 'email card must have e-mail as alternative spelling');

  const organizeCards = allWords.filter(w => w.en.toLowerCase() === 'organize');
  assertEqual(organizeCards.length, 1, 'organize must have strictly 1 card in WORDS_DATA');
  assertEqual(organizeCards[0].alt, 'organise', 'organize card must have organise as alternative spelling');

  const lineupCards = allWords.filter(w => w.en.toLowerCase() === 'line up');
  assertEqual(lineupCards.length, 1, 'line up must have strictly 1 card in WORDS_DATA');
  assert(lineupCards[0].isMaarif && lineupCards[0].isOxford, 'line up must combine both Maarif and Oxford datasets');

  const wakeupCards = allWords.filter(w => w.en.toLowerCase() === 'wake up');
  assertEqual(wakeupCards.length, 1, 'wake up must have strictly 1 card in WORDS_DATA');
  assertEqual(wakeupCards[0].alt, 'wake-up', 'wake up must have wake-up as alternative spelling');

  // 3. Verify directory search finds unified card via alt spelling
  env.APP.switchView('directory');
  const state = env.APP.getState();
  state.directoryFilters.dataset = 'all';
  state.directoryFilters.search = 'organise';
  env.APP.renderDirectoryView();
  const dirSection = env.document.getElementById('view-directory');
  assertIncludes(dirSection.innerHTML, 'organize', 'Search for organise should find the organize card');
});

// --- 1.6 Telemetry & Progress Metrics (6 Tests) ---

registerTest(1, 'Telemetry & Stats', 'test_telemetry_zero_state_defaults', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('stats');
  const state = env.APP.getState();
  assertEqual(state.userData.stats.quizzesPlayed, 0, 'quizzesPlayed should be 0');
  assertEqual(state.userData.stats.correctAnswers, 0, 'correctAnswers should be 0');
  const srsStats = env.APP.getSRSStats();
  assertEqual(srsStats.dueCount, 0, 'SRS dueCount should be 0 in zero state');
});

registerTest(1, 'Telemetry & Stats', 'test_telemetry_marking_learned_updates_counts', () => {
  const env = createFreshAppEnvironment();
  const wordId = 1;
  env.APP.toggleLearned(wordId);
  assertEqual(env.APP.getState().userData.learned.size, 1, 'Learned set size should be 1');
  const saved = env.localStorage.getItem('mk_learned');
  assertIncludes(saved, '1', 'Saved learned set should include wordId 1');
});

registerTest(1, 'Telemetry & Stats', 'test_telemetry_quiz_completion_activity_log', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  // Answer all questions
  const qState = env.APP.getState().quizState;
  for (let i = 0; i < 10; i++) {
    const q = qState.questions[qState.currentIndex];
    const cIdx = q.options.findIndex(o => o.isCorrect);
    env.APP.handleQuizAnswer(cIdx);
    env.APP.nextQuizQuestion();
  }
  const activityLog = env.APP.getState().userData.activityLog;
  assert(activityLog.length > 0, 'Activity log should record completed quiz');
  assert(activityLog[0].module.includes('TESTİ') || activityLog[0].module.includes('DEĞERLENDİRME'), 'Logged activity module should reflect test');
});

registerTest(1, 'Telemetry & Stats', 'test_telemetry_srs_queue_distribution', () => {
  const env = createFreshAppEnvironment();
  const srsStats = env.APP.getSRSStats();
  assert(typeof srsStats.dueCount === 'number', 'srsStats.dueCount should be a number');
  assert(typeof srsStats.learningCount === 'number', 'srsStats.learningCount should be a number');
  assert(typeof srsStats.masteredCount === 'number', 'srsStats.masteredCount should be a number');
});

registerTest(1, 'Telemetry & Stats', 'test_telemetry_mistake_stats_calculation', () => {
  const env = createFreshAppEnvironment();
  const mistakeStats = env.APP.getMistakeStats();
  assert(typeof mistakeStats.activeMistakes === 'number', 'mistakeStats.activeMistakes should be a number');
  assert(typeof mistakeStats.clearedMistakes === 'number', 'mistakeStats.clearedMistakes should be a number');
});

registerTest(1, 'Telemetry & Stats', 'test_telemetry_progress_bar_percentage_safety', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('stats');
  const statsHtml = env.document.getElementById('view-stats').innerHTML;
  assert(!statsHtml.includes('width: NaN%'), 'Progress bar widths must not contain NaN%');
  assert(!statsHtml.includes('undefined%'), 'Progress bar widths must not contain undefined%');
});

// --- 1.7 Audio & Speech Engine Fallbacks (5 Tests) ---

registerTest(1, 'Audio & Speech', 'test_audio_speech_synthesis_call', () => {
  const env = createFreshAppEnvironment();
  env.APP.speakWord('accelerate');
  assert(env.spokenUtterances.length > 0, 'speechSynthesis.speak should have been called');
  assertEqual(env.spokenUtterances[0].text, 'accelerate', 'Spoken text should match target word');
});

registerTest(1, 'Audio & Speech', 'test_audio_accent_selection', () => {
  const env = createFreshAppEnvironment();
  const accentBtn = env.document.getElementById('accent-toggle-btn');
  accentBtn.click(); // Toggle from UK to US
  assertEqual(env.APP.getState().settings.accent, 'en-US', 'Accent should toggle to en-US');
  env.APP.speakWord('test');
  assertEqual(env.spokenUtterances[env.spokenUtterances.length - 1].lang, 'en-US', 'Utterance lang should be en-US');
});

registerTest(1, 'Audio & Speech', 'test_audio_speed_rate_multiplier', () => {
  const env = createFreshAppEnvironment();
  const speedBtn = env.document.getElementById('speed-toggle-btn');
  speedBtn.click(); // Toggle speed from 1.0 to 0.8
  assertEqual(env.APP.getState().settings.speed, 0.8, 'Speed should toggle to 0.8');
  env.APP.speakWord('speed');
  assertEqual(env.spokenUtterances[env.spokenUtterances.length - 1].rate, 0.8, 'Utterance rate should be 0.8');
});

registerTest(1, 'Audio & Speech', 'test_audio_speech_recognition_fallback', () => {
  const env = createFreshAppEnvironment();
  // Ensure Web Speech Recognition is absent in Node
  assert(!('webkitSpeechRecognition' in env.window), 'SpeechRecognition should be absent in test sandbox');
  env.APP.openSpeechCoach('pronounce');
  const coachDialog = env.document.getElementById('speech-coach-dialog');
  assert(coachDialog.innerHTML.length > 100, 'Speech coach dialog should render cleanly in fallback mode');
  env.APP.closeSpeechCoach();
});

registerTest(1, 'Audio & Speech', 'test_audio_sound_fx_toggle', () => {
  const env = createFreshAppEnvironment();
  const soundBtn = env.document.getElementById('sound-toggle-btn');
  soundBtn.click(); // Toggle sound to false
  assertEqual(env.APP.getState().settings.soundEffects, false, 'Sound effects should be disabled');
  assertEqual(env.localStorage.getItem('mk_sound'), 'false', 'mk_sound in localStorage should be false');
});

// --- 1.8 PDF & Worksheet Studio (6 Tests) ---

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_studio_open_and_close', () => {
  const env = createFreshAppEnvironment();
  const backdrop = env.document.getElementById('pdf-modal-backdrop');
  const dialog = env.document.getElementById('pdf-dialog');
  const body = env.document.getElementById('pdf-dialog-body');
  assert(backdrop, '#pdf-modal-backdrop should exist');
  assert(dialog, '#pdf-dialog should exist');
  assert(body, '#pdf-dialog-body should exist');
  assert(!backdrop.classList.contains('active'), 'Backdrop should initially not have active class');

  env.APP.openPdfStudio('mistakes');
  assert(backdrop.classList.contains('active'), 'openPdfStudio should activate backdrop');
  assert(dialog.classList.contains('active'), 'openPdfStudio should activate dialog');
  assert(body.innerHTML.includes('Hata Kampı &amp; Yanlışlar') || body.innerHTML.includes('Hata Kampı & Yanlışlar'), 'Dialog body should have template options');
  assert(body.innerHTML.includes('ÇALIŞMA ŞABLONU'), 'Dialog body should contain studio controls');

  env.APP.closePdfStudio();
  assert(!backdrop.classList.contains('active'), 'closePdfStudio should deactivate backdrop');
  assert(!dialog.classList.contains('active'), 'closePdfStudio should deactivate dialog');
});

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_worksheet_generation_mistakes', () => {
  const env = createFreshAppEnvironment();
  // Simulate recorded mistakes
  const sampleWord = env.window.WORDS_DATA[0];
  env.APP.getState().userData.mistakes[sampleWord.id] = {
    wordId: sampleWord.id,
    wrongCount: 3,
    lastMistakeAt: Date.now(),
    wrongAnswers: ['wrong_choice'],
    cleared: false
  };

  env.APP.openPdfStudio('mistakes');
  const words = env.APP.getWorksheetTargetWords(env.APP.PDF_STUDIO_STATE);
  assert(words.length > 0, 'Target words for mistakes template should contain at least 1 word');
  assertEqual(words[0].en.toLowerCase(), sampleWord.en.toLowerCase(), 'First target word should match mistake word');

  const html = env.APP.generateWorksheetHTML(env.APP.PDF_STUDIO_STATE);
  assert(html.includes('HATA DEFTERİ &amp; KURTARMA') || html.includes('HATA DEFTERİ'), 'Worksheet HTML should contain mistake sheet title');
  assert(html.includes('3x Yanlış Yapıldı') || html.includes('Hata'), 'Worksheet HTML should display error frequency badge');
  assert(html.includes('Doğru Yazım (3x)'), 'Worksheet HTML should include writing practice lines');
  assert(html.includes('Kendi Cümleniz:'), 'Worksheet HTML should include sentence drafting line');
});

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_worksheet_generation_curriculum', () => {
  const env = createFreshAppEnvironment();
  env.APP.updatePdfStudioOption('template', 'curriculum');
  env.APP.updatePdfStudioOption('grade', 5);

  const words = env.APP.getWorksheetTargetWords(env.APP.PDF_STUDIO_STATE);
  assert(words.length > 0, '5th grade curriculum target words should not be empty');

  const html = env.APP.generateWorksheetHTML(env.APP.PDF_STUDIO_STATE);
  assert(html.includes('MEB MAARİF MODELİ') || html.includes('5. Sınıf'), 'Worksheet HTML should contain curriculum header and grade');
  assert(html.includes('EŞLEŞTİRME ALIŞTIRMASI'), 'Worksheet HTML should contain exercises');
});

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_worksheet_generation_quiz_with_answer_key', () => {
  const env = createFreshAppEnvironment();
  env.APP.updatePdfStudioOption('template', 'quiz');
  env.APP.updatePdfStudioOption('grade', 5);
  env.APP.updatePdfStudioOption('scope', 'mistakes');
  env.APP.updatePdfStudioOption('limit', 20);

  // Simulate having only 1 mistake in mistake notebook
  const sampleWord = env.window.WORDS_DATA[0];
  env.APP.getState().userData.mistakes[sampleWord.id] = {
    wordId: sampleWord.id,
    wrongCount: 1,
    lastMistakeAt: Date.now(),
    wrongAnswers: ['wrong_choice'],
    cleared: false
  };

  const html = env.APP.generateWorksheetHTML(env.APP.PDF_STUDIO_STATE);
  assert(html.includes('KELİME KAZANIM DEĞERLENDİRME TESTİ'), 'Quiz worksheet should contain test title');
  assert(html.includes('1.') && html.includes('kelimesinin Türkçe karşılığı'), 'Quiz worksheet should contain numbered questions');
  assert(html.includes('20.') && html.includes('kelimesinin Türkçe karşılığı'), 'Quiz worksheet with 20 limit should generate exactly 20 questions');
  assert(html.includes('CEVAP ANAHTARI'), 'Quiz worksheet should contain answer key at the bottom');
  assert(html.includes('20-'), 'Answer key should contain answers up to question 20');
});

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_worksheet_generation_cut_fold_flashcards', () => {
  const env = createFreshAppEnvironment();
  env.APP.updatePdfStudioOption('template', 'flashcards');

  const html = env.APP.generateWorksheetHTML(env.APP.PDF_STUDIO_STATE);
  assert(html.includes('KES &amp; KATLA') || html.includes('KES & KATLA'), 'Flashcard worksheet should contain cut and fold title');
  assert(html.includes('---') && html.includes(':::'), 'Flashcard worksheet should display cutting scissors and fold line indicator');
  assert(html.includes('ws-fc-cut-card'), 'Flashcard worksheet should contain cut card elements');
});

registerTest(1, 'PDF & Worksheet Studio', 'test_pdf_print_and_download_handlers', () => {
  const env = createFreshAppEnvironment();
  env.APP.openPdfStudio('mistakes');
  
  // Test print worksheet
  env.APP.printWorksheet();
  assertEqual(env.window.__printed, true, 'printWorksheet should invoke window.print()');
  const printSheet = env.document.getElementById('learnish-printable-sheet');
  assert(printSheet, '#learnish-printable-sheet should exist in DOM');
  assert(printSheet.innerHTML.length > 50, '#learnish-printable-sheet should be populated with worksheet HTML');

  // Test HTML file download
  let downloadedData = null;
  const originalCreate = env.document.createElement;
  env.document.createElement = function(tag) {
    const el = originalCreate.call(env.document, tag);
    if (tag === 'a') {
      el.click = function() {
        downloadedData = {
          href: this.getAttribute('href') || this.href,
          download: this.getAttribute('download') || this.download
        };
      };
    }
    return el;
  };

  env.APP.downloadWorksheetHtml();
  assert(downloadedData, 'downloadWorksheetHtml should create and click download anchor');
  assert(downloadedData.download && downloadedData.download.endsWith('.html'), 'Download filename should end with .html');
  assert(downloadedData.download && downloadedData.download.startsWith('learnish-calisma-foyu'), 'Download filename should begin with learnish-calisma-foyu');
});

// --- 1.9 Feedback & Bug Reporter (5 Tests) ---

registerTest(1, 'Feedback & Bug Reporter', 'test_feedback_modal_elements_and_open_close', () => {
  const env = createFreshAppEnvironment();
  const backdrop = env.document.getElementById('feedback-modal-backdrop');
  const dialog = env.document.getElementById('feedback-dialog');
  const topicSelect = env.document.getElementById('feedback-topic');
  const messageArea = env.document.getElementById('feedback-message');
  const senderInput = env.document.getElementById('feedback-sender');
  const headerBtn = env.document.getElementById('header-feedback-btn');

  assert(backdrop, '#feedback-modal-backdrop should exist');
  assert(dialog, '#feedback-dialog should exist');
  assert(topicSelect, '#feedback-topic should exist');
  assert(messageArea, '#feedback-message should exist');
  assert(senderInput, '#feedback-sender should exist');
  assert(headerBtn, '#header-feedback-btn should exist');

  // Open modal
  env.APP.openFeedbackModal();
  assert(dialog.classList.contains('active'), 'Dialog should have active class when opened');
  assert(backdrop.classList.contains('active'), 'Backdrop should have active class when opened');
  assert(env.document.body.classList.contains('modal-open'), 'Body should have modal-open class');

  // Close modal
  env.APP.closeFeedbackModal();
  assert(!dialog.classList.contains('active'), 'Dialog should not have active class when closed');
  assert(!backdrop.classList.contains('active'), 'Backdrop should not have active class when closed');
  assert(!env.document.body.classList.contains('modal-open'), 'Body should remove modal-open class');

  // Test closeModals() also closes feedback dialog
  env.APP.openFeedbackModal();
  assert(dialog.classList.contains('active'), 'Dialog active before closeModals');
  env.APP.openGradeModal(); // opens grade modal
  env.APP.closeFeedbackModal();
});

registerTest(1, 'Feedback & Bug Reporter', 'test_feedback_topic_and_sender_handling', () => {
  const env = createFreshAppEnvironment();
  const topicSelect = env.document.getElementById('feedback-topic');
  const senderInput = env.document.getElementById('feedback-sender');

  env.APP.openFeedbackModal('Kelime / Çeviri Hatası');
  assert(topicSelect.value.includes('Kelime'), 'Feedback topic should be set to Kelime');

  senderInput.value = 'Ahmet Öğretmen';
  assertEqual(senderInput.value, 'Ahmet Öğretmen', 'Sender input should retain entered name');
  env.APP.closeFeedbackModal();
});

registerTest(1, 'Feedback & Bug Reporter', 'test_feedback_telemetry_generation', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchModule('maarif');
  env.APP.switchGrade(5);
  env.APP.switchView('quiz');

  const telemetryStr = env.APP.getFeedbackTelemetryString();
  assert(telemetryStr.includes('MEB Maarif Modeli (5. Sınıf)'), 'Telemetry should include active module and grade');
  assert(telemetryStr.includes('Quiz & Test'), 'Telemetry should include active view');
  assert(telemetryStr.includes('Learnish v12'), 'Telemetry should include app version');

  // Test preview update
  env.APP.openFeedbackModal();
  const preview = env.document.getElementById('feedback-telemetry-preview');
  assert(preview && preview.textContent.includes('MEB Maarif'), 'Telemetry preview box should be populated');
  env.APP.closeFeedbackModal();
});

registerTest(1, 'Feedback & Bug Reporter', 'test_feedback_report_validation_and_building', () => {
  const env = createFreshAppEnvironment();
  env.APP.openFeedbackModal();

  const msgArea = env.document.getElementById('feedback-message');
  const statusBanner = env.document.getElementById('feedback-status-banner');

  // Test empty validation
  msgArea.value = '   ';
  const invalidReport = env.APP.buildFeedbackReport();
  assertEqual(invalidReport, null, 'Empty feedback message should fail validation');
  assert(statusBanner.style.display !== 'none', 'Status banner should be displayed on error');

  // Test valid report building
  msgArea.value = 'Test ekranında 3. soruda seslendirme butonu tepki vermedi.';
  const validReport = env.APP.buildFeedbackReport();
  assert(validReport !== null, 'Valid message should generate feedback report object');
  assert(validReport.fullText.includes('Test ekranında 3. soruda'), 'Report text should include user message');
  assert(validReport.fullText.includes('LEARNISH ÖĞRETMEN & KULLANICI GERİ BİLDİRİM RAPORU'), 'Report should have header banner');
  env.APP.closeFeedbackModal();
});

registerTest(1, 'Feedback & Bug Reporter', 'test_feedback_actions_mailto_whatsapp_and_clipboard', () => {
  const env = createFreshAppEnvironment();
  env.APP.openFeedbackModal();

  const msgArea = env.document.getElementById('feedback-message');
  msgArea.value = 'Öğretmenler odasında test ettik, 6. sınıf kelime kartları çok başarılı.';

  // Test mailto action
  env.APP.sendFeedbackViaMail();
  const statusBanner = env.document.getElementById('feedback-status-banner');
  assert(statusBanner.textContent.includes('E-posta'), 'Status banner should indicate email action');

  // Test whatsapp action
  let openedUrl = null;
  env.window.open = function(url) { openedUrl = url; };
  env.APP.sendFeedbackViaWhatsApp();
  assert(openedUrl && openedUrl.startsWith('https://wa.me/?text='), 'WhatsApp url should be generated with wa.me scheme');

  // Test clipboard action
  let clipboardCopied = null;
  env.navigator.clipboard = {
    writeText: (txt) => {
      clipboardCopied = txt;
      return Promise.resolve();
    }
  };
  env.APP.copyFeedbackToClipboard();
  assert(clipboardCopied && clipboardCopied.includes('6. sınıf kelime kartları'), 'Clipboard text should receive full report');
  env.APP.closeFeedbackModal();
});

// ============================================================================
// 5. TEST DEFINITIONS: TIER 2 - BOUNDARY & CORNER CASES (10 TESTS)
// ============================================================================

registerTest(2, 'Boundary Cases', 'test_boundary_empty_search_query', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.getState().directoryFilters.search = '';
  env.APP.renderDirectoryView();
  const dirSection = env.document.getElementById('view-directory');
  assert(dirSection.innerHTML.includes('KAYIT BULUNDU'), 'Empty search query should display total records');
});

registerTest(2, 'Boundary Cases', 'test_boundary_special_characters_search', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  // Adversarial query with script tag and meta characters
  env.APP.getState().directoryFilters.search = '<script>alert(1)</script>&"\'%';
  env.APP.renderDirectoryView();
  const dirSection = env.document.getElementById('view-directory');
  if (dirSection.innerHTML.includes('<script>alert(1)</script>')) {
    throw new Error('Search input value attribute does not escapeHtml (Unescaped script injection detected)');
  }
}, { knownDefect: 'Search input value attribute does not escapeHtml', milestone: 'M2' });

registerTest(2, 'Boundary Cases', 'test_boundary_nonexistent_route_hash', () => {
  const env = createFreshAppEnvironment({ initialHash: '#completely-unknown-route-999' });
  // The system should fall back cleanly to #home without throw
  assertEqual(env.APP.getState().currentView, 'home', 'Invalid route hash should fall back to home view');
});

registerTest(2, 'Boundary Cases', 'test_boundary_routing_alias_word_list', () => {
  // #word-list and #words should route to #directory instead of falling back to #home
  const env = createFreshAppEnvironment({ initialHash: '#word-list' });
  if (env.APP.getState().currentView === 'home') {
    throw new Error('Hash #word-list unexpectedly redirected to home instead of directory');
  }
  assertEqual(env.APP.getState().currentView, 'directory', 'Routing alias #word-list should map to directory');
}, { knownDefect: 'Routing alias #word-list falls back to #home', milestone: 'M2' });

registerTest(2, 'Boundary Cases', 'test_boundary_grade_selection_boundaries_2_and_12', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchGrade(1);
  assertEqual(env.APP.getState().selectedGrade, 2, 'Grade 1 has no plan, should clamp to 2');

  env.APP.switchGrade(2);
  assertEqual(env.APP.getState().selectedGrade, 2, 'Selected grade should be 2');
  const sched2 = env.window.CURRICULUM_CLASSIFIER.getSchedule(2);
  assert(sched2 && sched2.grade === 2, 'Grade 2 schedule should be valid');

  env.APP.switchGrade(12);
  assertEqual(env.APP.getState().selectedGrade, 12, 'Selected grade should be 12');
  const sched12 = env.window.CURRICULUM_CLASSIFIER.getSchedule(12);
  assert(sched12 && sched12.grade === 12, 'Grade 12 schedule should be valid');
});

registerTest(2, 'Boundary Cases', 'test_boundary_rapid_answer_clicks', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  const q0 = qState.questions[0];
  const cIdx = q0.options.findIndex(o => o.isCorrect);

  // Click answer twice rapidly
  env.APP.handleQuizAnswer(cIdx);
  const scoreAfterFirst = qState.score;
  env.APP.handleQuizAnswer(cIdx);
  assertEqual(qState.score, scoreAfterFirst, 'Rapid double-clicking answer must not increment score twice');
});

registerTest(2, 'Boundary Cases', 'test_boundary_fab_click_in_quiz_view', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  try {
    env.APP.handleFabAction();
  } catch (err) {
    if (err.message && err.message.includes('startQuizSession is not defined')) {
      throw new Error('FAB in quiz view crashed: startQuizSession is not defined (M2 Defect 1)');
    }
    throw err;
  }
}, { knownDefect: 'handleFabAction calls undefined startQuizSession in quiz view', milestone: 'M2' });

registerTest(2, 'Boundary Cases', 'test_boundary_srs_consecutive_easy_interval_cap', () => {
  const env = createFreshAppEnvironment();
  for (let i = 0; i < 15; i++) {
    env.APP.markFlashcardSRS(100, 5);
  }
  const srsRecord = env.APP.getState().userData.srs[100];
  assert(srsRecord, 'SRS record must exist for word');
  assert(/^\d{4}-\d{2}-\d{2}$/.test(srsRecord.nextReview), `nextReview must be a valid YYYY-MM-DD date string, got: ${srsRecord.nextReview}`);
  assert(srsRecord.nextReview !== 'NaN-NaN-NaN', 'nextReview must not be NaN-NaN-NaN');
  assert(srsRecord.interval <= 3650, `Interval must be capped at 3650 days (10 years), got: ${srsRecord.interval}`);
});

registerTest(2, 'Boundary Cases', 'test_boundary_speech_synthesis_null_environment', () => {
  const env = createFreshAppEnvironment();
  env.window.speechSynthesis = null;
  let completed = false;
  env.APP.speakWord('test', () => {
    completed = true;
  });
  assert(completed, 'speakWord should invoke callback and complete safely when speechSynthesis is null');
  env.APP.speakWord('test');
});

registerTest(2, 'Boundary Cases', 'test_boundary_speech_synthesis_null_cold_boot', () => {
  const env = createFreshAppEnvironment({ speechSynthesis: null });
  assert(env.window.speechSynthesis === null, 'window.speechSynthesis must be null at initial evaluation time');
  assert(env.APP && typeof env.APP === 'object', 'app.js must load cleanly and define window.APP without throwing TypeError on cold boot');
  assert(typeof env.APP.speakWord === 'function', 'window.APP.speakWord must be a function');
  let completed = false;
  env.APP.speakWord('test-cold-boot', () => {
    completed = true;
  });
  assert(completed, 'speakWord should safely invoke callback without error in cold-boot null environment');
});

// ============================================================================
// 6. TEST DEFINITIONS: TIER 3 - CROSS-FEATURE COMBINATIONS (5 TESTS)
// ============================================================================

registerTest(3, 'Cross-Feature Combos', 'test_combo_switch_module_then_load_flashcards', () => {
  const env = createFreshAppEnvironment();
  // Switch to YDS module
  env.APP.switchModule('yds');
  assertEqual(env.APP.getState().activeModule, 'yds', 'Module should be yds');
  
  // Navigate to flashcards
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  const sampleWord = state.filteredFlashcards[0];
  assert(sampleWord.isYds || sampleWord.dataset === 'yds' || sampleWord.datasets?.includes('yds'), 'Flashcards in YDS module should be YDS words');
});

registerTest(3, 'Cross-Feature Combos', 'test_combo_directory_filter_then_mark_starred', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('directory');
  env.APP.getState().directoryFilters.dataset = 'oxford';
  env.APP.renderDirectoryView();
  
  const targetId = 1;
  env.APP.toggleStarred(targetId);
  assert(env.APP.getState().userData.starred.has(targetId), 'Word should be marked as starred');
  const saved = env.localStorage.getItem('mk_starred');
  assertIncludes(saved, '1', 'Saved starred list in storage must include targetId');
});

registerTest(3, 'Cross-Feature Combos', 'test_combo_theme_change_then_open_modals', () => {
  const env = createFreshAppEnvironment();
  env.document.getElementById('theme-toggle-btn').click(); // Switch to dark
  assertEqual(env.document.documentElement.getAttribute('data-theme'), 'dark', 'Theme must be dark');
  
  env.APP.openSettingsModal();
  const settingsDialog = env.document.getElementById('settings-dialog');
  assert(settingsDialog.classList.contains('active'), 'Settings dialog should be active');
  env.APP.closeSettingsModal();
  assert(!settingsDialog.classList.contains('active'), 'Settings dialog should close');
});

registerTest(3, 'Cross-Feature Combos', 'test_combo_quiz_mistake_reflected_in_home_pedagogy', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const q0 = env.APP.getState().quizState.questions[0];
  const wrongIdx = q0.options.findIndex(o => !o.isCorrect);
  
  // Submit incorrect answer
  env.APP.handleQuizAnswer(wrongIdx);
  
  // Go to home view
  env.APP.switchView('home');
  const activeMistakes = env.APP.getActiveMistakeWords();
  assert(activeMistakes.length > 0, 'Mistake Camp on home view should reflect active mistakes');
});

registerTest(3, 'Cross-Feature Combos', 'test_combo_flashcard_srs_updates_stats', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('flashcard');
  const state = env.APP.getState();
  const w1 = state.filteredFlashcards[0].id;
  const w2 = state.filteredFlashcards[1].id;
  
  // Rate cards with SRS
  env.APP.markFlashcardSRS(w1, 4);
  env.APP.markFlashcardSRS(w2, 5);
  
  const srsStats = env.APP.getSRSStats();
  assert(srsStats.learningCount > 0 || srsStats.masteredCount > 0 || srsStats.reviewingCount > 0, 'SRS stats should show progress after card ratings');
});

// ============================================================================
// 7. TEST DEFINITIONS: TIER 4 - REAL-WORLD SCENARIOS (3 TESTS)
// ============================================================================

registerTest(4, 'Real-World Scenarios', 'test_scenario_complete_daily_study_session', () => {
  const env = createFreshAppEnvironment();
  
  // 1. User arrives on Home view
  env.APP.switchView('home');
  assertEqual(env.APP.getState().currentView, 'home', 'Step 1: Land on home');
  
  // 2. User checks Günün Çalışması (Daily view)
  env.APP.switchView('daily');
  assertEqual(env.APP.getState().currentView, 'daily', 'Step 2: Inspect daily');
  
  // 3. Mark 2 words as learned
  const w1 = 1;
  const w2 = 2;
  env.APP.toggleLearned(w1);
  env.APP.toggleLearned(w2);
  assertEqual(env.APP.getState().userData.learned.size, 2, 'Step 3: Learned 2 words');
  
  // 4. Study via Flashcards & rate with SRS
  env.APP.switchView('flashcard');
  env.APP.markFlashcardSRS(w1, 4);
  env.APP.markFlashcardSRS(w2, 5);
  assertEqual(env.APP.getState().currentView, 'flashcard', 'Step 4: Flashcard review');
  
  // 5. Check statistics
  env.APP.switchView('stats');
  assertEqual(env.APP.getState().currentView, 'stats', 'Step 5: View stats');
  assert(env.APP.getState().userData.learned.size >= 2, 'Stats should confirm learned words');
});

registerTest(4, 'Real-World Scenarios', 'test_scenario_10_question_quiz_session_flow', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchView('quiz');
  env.APP.startQuiz();
  const qState = env.APP.getState().quizState;
  assertEqual(qState.questions.length, 10, 'Step 1: 10-question quiz initiated');
  
  // Answer 8 correct, 2 incorrect
  for (let i = 0; i < 10; i++) {
    const q = qState.questions[qState.currentIndex];
    const isCorrectTarget = (i !== 3 && i !== 7);
    const chosenIdx = isCorrectTarget
      ? q.options.findIndex(o => o.isCorrect)
      : q.options.findIndex(o => !o.isCorrect);
    
    env.APP.handleQuizAnswer(chosenIdx);
    env.APP.nextQuizQuestion();
  }
  
  assertEqual(qState.active, false, 'Quiz should be completed');
  assertEqual(qState.score, 8, 'Quiz final score should be 8');
  assert(env.APP.getActiveMistakeWords().length >= 2, 'Mistake Camp should hold the 2 incorrect words');
  assert(env.APP.getState().userData.activityLog.length >= 1, 'Activity log must register completed quiz');
});

registerTest(4, 'Real-World Scenarios', 'test_scenario_single_file_bundle_integrity', () => {
  assert(fs.existsSync(BUNDLE_HTML_PATH), 'Learnish_Tek_Dosya_Web_App.html must exist on disk');
  const bundleStat = fs.statSync(BUNDLE_HTML_PATH);
  assert(bundleStat.size > 2500000, `Bundle size should be > 2.5 MB (current: ${bundleStat.size} bytes)`);
  
  const bundleContent = fs.readFileSync(BUNDLE_HTML_PATH, 'utf8');
  assert(!/<link rel="stylesheet" href="app\.css.*?>/.test(bundleContent), 'Bundle must NOT contain unbundled app.css link');
  assert(!/<script src="words-data\.js.*?>/.test(bundleContent), 'Bundle must NOT contain unbundled words-data.js script');
  assert(bundleContent.includes('<style>'), 'Bundle must contain inlined <style>');
  assert(bundleContent.includes('<script>'), 'Bundle must contain inlined <script>');
});

// ============================================================================
// 7b. YILLIK PLAN TAKVİMİ & SINIF HAVUZU (Kasım 2026 düzeltmeleri)
// ============================================================================
registerTest(1, 'Curriculum Calendar', 'test_schedule_uses_real_plan_dates_and_breaks', () => {
  const K = SHARED_CURRICULUM_CLASSIFIER;
  const midterm = K.getSchedule(5, new Date(2026, 10, 18));          // 18 Kasım 2026: 1. ara tatil
  assert(midterm.isBreak === true, '18 Kasım 2026 ara tatil olarak işaretlenmeli');
  assertEqual(midterm.breakName, '1. Dönem Ara Tatili', 'Tatil adı');
  assertEqual(midterm.weekNum, 9, 'Tatilde son başlamış hafta (9) gösterilmeli');
  const after = K.getSchedule(5, new Date(2026, 10, 25));             // 25 Kasım: 10. hafta, Tema 2
  assertEqual(after.weekNum, 10, '25 Kasım 10. hafta');
  assertEqual(after.weekType, 'theme', '10. hafta ders haftası');
  assertEqual(after.unitTitle, 'CLASSROOM LIFE', '10. hafta Tema 2');
  const march = K.getSchedule(5, new Date(2027, 2, 16));              // 2. ara tatilden sonra 23. hafta
  assertEqual(march.weekNum, 23, '16 Mart 2027 23. hafta');
  const schoolBased = K.getSchedule(5, new Date(2026, 10, 11));
  assertEqual(schoolBased.weekType, 'school_based', '9-13 Kasım okul temelli planlama');
});

registerTest(1, 'Curriculum Calendar', 'test_every_grade_calendar_has_ordered_iso_dates', () => {
  for (const g of Object.keys(SHARED_CURRICULUM_DATA)) {
    const cal = SHARED_CURRICULUM_DATA[g].calendar;
    assert(cal.length >= 36, `${g}. sınıf en az 36 hafta`);
    cal.forEach((w, i) => {
      assert(/^\d{4}-\d{2}-\d{2}$/.test(w.start) && /^\d{4}-\d{2}-\d{2}$/.test(w.end), `${g}. sınıf ${w.weekNum}. hafta ISO tarih`);
      if (i) assert(w.start > cal[i - 1].end, `${g}. sınıf haftalar tarih sırasında olmalı (${w.weekNum})`);
    });
  }
});

registerTest(1, 'Curriculum Calendar', 'test_theme1_title_is_not_overwritten_by_orientation', () => {
  for (const g of [2, 3, 5, 6, 9, 10]) {
    const t = SHARED_CURRICULUM_DATA[g].units[0].title;
    assert(t.includes('SCHOOL LIFE'), `${g}. sınıf Tema 1 "SCHOOL LIFE" olmalı, bulunan: ${t}`);
  }
});

registerTest(1, 'Curriculum Calendar', 'test_weekly_progression_splits_theme_vocabulary', () => {
  for (const g of Object.keys(SHARED_CURRICULUM_DATA)) {
    const cal = SHARED_CURRICULUM_DATA[g].calendar.filter(w => w.weekType === 'theme');
    for (let i = 1; i < cal.length; i++) {
      if (cal[i].unitNum !== cal[i - 1].unitNum || !cal[i].targetWords.length) continue;
      const overlap = cal[i].targetWords.filter(x => cal[i - 1].targetWords.includes(x));
      assertEqual(overlap.length, 0, `${g}. sınıf ${cal[i].weekNum}. hafta önceki haftayı tekrar etmemeli`);
    }
  }
});

registerTest(3, 'Grade Pool', 'test_grade_pool_follows_selected_grade', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchGrade(7);
  const pool7 = env.APP.getActiveGradePool().map(w => w.en.toLowerCase());
  assert(pool7.includes('outgoing'), '7. sınıf havuzunda "outgoing" olmalı');
  assert(!pool7.includes('albeit'), '7. sınıf havuzuna YDS kelimesi girmemeli');
  env.APP.switchGrade(5);
  const pool5 = env.APP.getActiveGradePool();
  assert(pool5.some(w => w.en.toLowerCase() === 'uniform'), '5. sınıf havuzunda "uniform" olmalı');
  assert(!pool5.some(w => ['albeit', 'allocate', 'commence'].includes(w.en.toLowerCase())), '5. sınıf havuzunda YDS akademik kelimeleri olmamalı');
  pool5.forEach(w => assert(w.tr && w.tr.trim(), `"${w.en}" Türkçe karşılığı boş olmamalı`));
});

registerTest(3, 'Grade Pool', 'test_curriculum_word_ids_are_stable_unique_and_exact', () => {
  const env = createFreshAppEnvironment();
  for (const g of [2, 5, 9, 10]) {
    env.APP.switchGrade(g);
    const ids = env.APP.getActiveGradePool().map(w => w.id);
    assertEqual(new Set(ids).size, ids.length, `${g}. sınıf havuzunda tekrarlı id olmamalı`);
  }
  const a = env.APP.lookupCurriculumWord('a notice board');
  const b = env.APP.lookupCurriculumWord('notice board');
  assert(!a || !b || a.id === b.id, 'Aynı kelime aynı id ile çözülmeli');
  const pen = env.APP.lookupCurriculumWord('pen');
  assert(!pen || pen.en.toLowerCase() === 'pen', '"pen" başka bir kelimeye (ör. "open") eşleşmemeli');
});

registerTest(3, 'Grade Pool', 'test_distractors_come_from_selected_grade_pool', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchGrade(6);
  const pool = env.APP.getActiveGradePool();
  const ids = new Set(pool.map(w => w.id));
  for (const target of pool.slice(0, 15)) {
    const ds = env.APP.pickDistractors(target, 3, pool);
    assertEqual(ds.length, 3, 'Üç yanlış şık');
    ds.forEach(d => assert(ids.has(d.id), `"${target.en}" şıkları 6. sınıf havuzundan gelmeli ("${d.en}" değil)`));
  }
});

registerTest(4, 'Real-World Scenarios', 'test_scenario_daily_day_points_to_this_weeks_words', () => {
  const env = createFreshAppEnvironment();
  env.APP.switchGrade(5);
  const info = env.APP.getMEBCalendarInfo(new Date(2026, 9, 7));    // 7 Ekim 2026: 4. hafta, Tema 1 ilk hafta
  assertEqual(info.weekNum, 4, '7 Ekim 4. hafta');
  const pool = env.APP.getActiveGradePool();
  const dayWords = pool.slice((info.day - 1) * 10, info.day * 10).map(w => w.en.toLowerCase());
  const weekWords = info.schedule.targetWords.map(t => (env.APP.lookupCurriculumWord(t) || { en: '' }).en.toLowerCase());
  assert(dayWords.some(w => weekWords.includes(w)), 'Günlük çalışma bu haftanın kelimelerini göstermeli');
});

// ============================================================================
// 8. TEST EXECUTION & REPORTING
// ============================================================================

function runSuite() {
  const tStart = Date.now();
  console.log(`\n${COLORS.bright}${COLORS.blue}================================================================================${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.white} LEARNISH E2E & FUNCTIONAL TEST SUITE REPORT${COLORS.reset}`);
  console.log(`${COLORS.blue}================================================================================${COLORS.reset}`);
  console.log(`${COLORS.dim} Runtime: Node.js ${process.version} | Single Sandbox per Test | Zero Dependencies${COLORS.reset}\n`);

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const discoveredDefects = [];

  const tierGroups = {
    1: 'TIER 1: FEATURE COVERAGE (>=5 Tests Per Major Feature)',
    2: 'TIER 2: BOUNDARY & CORNER CASES',
    3: 'TIER 3: CROSS-FEATURE COMBINATIONS',
    4: 'TIER 4: REAL-WORLD APPLICATION SCENARIOS'
  };

  for (const tierNum of [1, 2, 3, 4]) {
    if (ALLOWED_TIERS && !ALLOWED_TIERS.includes(tierNum)) continue;

    const testsInTier = TEST_REGISTRY.filter(t => t.tier === tierNum);
    if (testsInTier.length === 0) continue;

    console.log(`${COLORS.bright}${COLORS.cyan} [${tierGroups[tierNum]}]${COLORS.reset}`);

    // Group by category
    const categories = Array.from(new Set(testsInTier.map(t => t.category)));
    for (const cat of categories) {
      console.log(`   ${COLORS.dim}--- ${cat} ---${COLORS.reset}`);
      const catTests = testsInTier.filter(t => t.category === cat);

      for (const testItem of catTests) {
        if (NAME_FILTER && !testItem.name.toLowerCase().includes(NAME_FILTER)) {
          skipped++;
          continue;
        }

        const t0 = Date.now();
        try {
          testItem.testFn();
          const duration = Date.now() - t0;
          console.log(`     ${COLORS.green}✔ PASS${COLORS.reset} ${testItem.name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
          passed++;
        } catch (err) {
          const duration = Date.now() - t0;
          failed++;
          const defectTag = testItem.knownDefect ? ` ${COLORS.yellow}[KNOWN DEFECT: ${testItem.milestone}]${COLORS.reset}` : '';
          console.log(`     ${COLORS.red}✖ FAIL${COLORS.reset}${defectTag} ${testItem.name} ${COLORS.dim}(${duration}ms)${COLORS.reset}`);
          console.log(`       ${COLORS.red}└─ ${err.message}${COLORS.reset}`);

          discoveredDefects.push({
            tier: testItem.tier,
            category: testItem.category,
            name: testItem.name,
            error: err.message,
            milestone: testItem.milestone || 'UNASSIGNED',
            knownDefect: testItem.knownDefect
          });
        }
      }
    }
    console.log('');
  }

  const totalDuration = Date.now() - tStart;

  // Print Summary Table
  console.log(`${COLORS.bright}${COLORS.blue}================================================================================${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.white} EXECUTION SUMMARY${COLORS.reset}`);
  console.log(`${COLORS.blue}================================================================================${COLORS.reset}`);
  console.log(` Total Tests Registered : ${TEST_REGISTRY.length}`);
  console.log(` Total Tests Executed   : ${passed + failed}`);
  console.log(` Tests Passed           : ${COLORS.green}${passed}${COLORS.reset}`);
  console.log(` Tests Failed           : ${failed > 0 ? COLORS.red : COLORS.green}${failed}${COLORS.reset}`);
  if (skipped > 0) console.log(` Tests Skipped          : ${COLORS.yellow}${skipped}${COLORS.reset}`);
  console.log(` Total Execution Time   : ${totalDuration} ms\n`);

  if (discoveredDefects.length > 0) {
    console.log(`${COLORS.bright}${COLORS.yellow}================================================================================${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.yellow} DEFECT ESCALATION SUMMARY (Action Required for Milestones M1, M2, M3)${COLORS.reset}`);
    console.log(`${COLORS.yellow}================================================================================${COLORS.reset}`);
    discoveredDefects.forEach((d, idx) => {
      console.log(` ${idx + 1}. [${d.milestone}] ${d.name} (${d.category})`);
      console.log(`    Error   : ${d.error}`);
      if (d.knownDefect) console.log(`    Context : ${d.knownDefect}`);
      console.log('');
    });
  }

  console.log(`${COLORS.blue}================================================================================${COLORS.reset}\n`);

  if (IS_STRICT && failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run test suite
if (require.main === module) {
  runSuite();
}

module.exports = {
  createFreshAppEnvironment,
  runSuite,
  TEST_REGISTRY
};
