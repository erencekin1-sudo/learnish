/**
 * ============================================================================
 * 5. SINIF İNGİLİZCE KELİME DÜNYASI (MAARİF MODELİ & CEFR)
 * Ana Uygulama Mantığı: Web Speech API, Web Audio API, PWA, Quiz & Flashcard
 * ============================================================================
 */

(function () {
  'use strict';

  // State Management
  const STATE = {
    currentView: 'daily', // 'daily', 'flashcard', 'quiz', 'directory', 'stats'
    currentDay: 1, // 1 to 82 (dinamik)
    activeFlashcardIndex: 0,
    filteredFlashcards: [],
    flashcardFlipped: false,
    quizState: {
      active: false,
      questions: [],
      currentIndex: 0,
      score: 0,
      streak: 0,
      mode: 'en-tr', // 'en-tr', 'tr-en', 'listening'
      source: 'daily', // 'daily', 'all', 'review'
      answered: false
    },
    directoryFilters: {
      search: '',
      theme: 'all',
      cefr: 'all',
      status: 'all' // 'all', 'learned', 'review', 'starred'
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
  const maxInitialDays = (typeof WORDS_DATA !== 'undefined' && Array.isArray(WORDS_DATA)) ? Math.max(...WORDS_DATA.map(w => w.day)) : 82;
  if (savedDay && savedDay >= 1 && savedDay <= maxInitialDays) {
    STATE.currentDay = savedDay;
  }

  // ==========================================================================
  // Web Audio API Synthesizer (Zero external audio files needed)
  // ==========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
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
        // Melodic major chord (E5, G#5, B5)
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.18, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.35);
        });
      } else if (type === 'wrong') {
        // Subtle descending buzz
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(140, now + 0.28);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else if (type === 'flip') {
        // Soft click
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  // ==========================================================================
  // Web Speech API (English Voice Pronunciation)
  // ==========================================================================
  let availableVoices = [];

  function loadVoices() {
    if ('speechSynthesis' in window) {
      availableVoices = window.speechSynthesis.getVoices();
    }
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakWord(text, onComplete) {
    if (!('speechSynthesis' in window)) {
      alert('Tarayıcınız sesli telaffuzu desteklemiyor.');
      return;
    }

    initAudioContext();
    window.speechSynthesis.cancel(); // Stop prior speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = STATE.settings.accent;
    utterance.rate = STATE.settings.speed;

    // Pick best matching voice
    if (availableVoices.length > 0) {
      const preferred = availableVoices.find(v => 
        v.lang.startsWith(STATE.settings.accent.slice(0, 2)) && 
        (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Daniel') || v.name.includes('Samantha'))
      ) || availableVoices.find(v => v.lang.startsWith(STATE.settings.accent.slice(0, 2)));

      if (preferred) utterance.voice = preferred;
    }

    if (onComplete) {
      utterance.onend = onComplete;
      utterance.onerror = onComplete;
    }

    window.speechSynthesis.speak(utterance);
  }

  // ==========================================================================
  // Persistence Utilities
  // ==========================================================================
  function saveUserData() {
    localStorage.setItem('mk_learned', JSON.stringify(Array.from(STATE.userData.learned)));
    localStorage.setItem('mk_review', JSON.stringify(Array.from(STATE.userData.review)));
    localStorage.setItem('mk_starred', JSON.stringify(Array.from(STATE.userData.starred)));
    localStorage.setItem('mk_stats', JSON.stringify(STATE.userData.stats));
    localStorage.setItem('mk_current_day', STATE.currentDay.toString());
  }

  function toggleLearned(wordId) {
    wordId = parseInt(wordId, 10);
    if (STATE.userData.learned.has(wordId)) {
      STATE.userData.learned.delete(wordId);
    } else {
      STATE.userData.learned.add(wordId);
      STATE.userData.review.delete(wordId);
      playSound('correct');
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
  // Helper Formatters
  // ==========================================================================
  function getCefrBadgeHtml(level) {
    const raw = (level || 'A1').trim();
    const safeCls = `cefr-${raw.toLowerCase().replace('+', 'plus')}`;
    return `<span class="cefr-pill ${safeCls}" style="background: var(--${safeCls}-bg, rgba(148,163,184,0.15)); color: var(--${safeCls}-text, #94a3b8); border-color: var(--${safeCls}-border, rgba(148,163,184,0.3));">${raw}</span>`;
  }

  function getThemeBadgeHtml(themeCode, themeTitle) {
    return `<span class="theme-pill">${themeCode} • ${themeTitle}</span>`;
  }

  // ==========================================================================
  // VIEW RENDERERS
  // ==========================================================================

  // 1. GÜNÜN 10'LUSU (DAILY WORKOUT)
  function renderDailyView() {
    const container = document.getElementById('view-daily');
    if (!container) return;

    const totalDays = Math.max(...WORDS_DATA.map(w => w.day));
    const dayWords = WORDS_DATA.filter(w => w.day === STATE.currentDay);
    const dayLearnedCount = dayWords.filter(w => STATE.userData.learned.has(w.id)).length;
    const dayPercent = Math.round((dayLearnedCount / (dayWords.length || 10)) * 100);

    // Build Day select options
    let dayOptionsHtml = '';
    for (let d = 1; d <= totalDays; d++) {
      dayOptionsHtml += `<option value="${d}" ${d === STATE.currentDay ? 'selected' : ''}>Gün ${d} / ${totalDays}</option>`;
    }

    let cardsHtml = '';
    dayWords.forEach(w => {
      const isLearned = STATE.userData.learned.has(w.id);
      const isReview = STATE.userData.review.has(w.id);
      const isStarred = STATE.userData.starred.has(w.id);

      cardsHtml += `
        <div class="word-card glass-panel" data-id="${w.id}">
          <div class="card-top">
            <div class="card-tags">
              ${getCefrBadgeHtml(w.cefr)}
              ${getThemeBadgeHtml(w.themeCode, w.themeTitle)}
            </div>
            <span class="word-number">#${w.no}</span>
          </div>

          <div class="card-body">
            <div class="word-en-row">
              <span class="word-en">${w.en}</span>
              <button class="speak-btn" data-word="${w.en}" title="Dinle (${STATE.settings.accent})">
                🔊
              </button>
            </div>
            <div class="word-tr">
              <span style="display:inline-block; font-size:10px; font-weight:800; padding:2px 5px; border-radius:4px; background:var(--cefr-a1-bg); color:var(--accent-emerald);">TR</span>
              ${w.tr || '<span style="color:var(--text-dim); font-style:italic;">(Anlamı yakında eklenecek)</span>'}
            </div>
            <div class="word-pos">${w.desc} • ${w.cat}</div>
            ${w.synonym ? `<div class="word-synonym" style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;"><strong>Eş Anlam:</strong> ${w.synonym}</div>` : ''}
            ${w.example ? `<div class="word-example" style="font-size:0.75rem; color:var(--accent-cyan); font-style:italic; margin-top:3px; opacity:0.9;">“${w.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
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
            <button class="star-btn ${isStarred ? 'starred' : ''}" onclick="window.APP.toggleStarred(${w.id})" title="Favorilere Ekle">
              ${isStarred ? '★' : '☆'}
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div class="daily-banner glass-panel">
        <div class="daily-banner-text">
          <h2>📅 Gün ${STATE.currentDay} Kelimeleri</h2>
          <p>Bugün üzerinde çalışacağınız <strong>10 hedef kelime</strong> (Sıra: ${(STATE.currentDay - 1) * 10 + 1} – ${Math.min(STATE.currentDay * 10, WORDS_DATA.length)} / ${WORDS_DATA.length})</p>
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
          <span>Günün İlerlemesi: ${dayLearnedCount} / ${dayWords.length} Kelime</span>
          <span style="color: var(--accent-emerald);">%${dayPercent} Tamamlandı</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width: ${dayPercent}%;"></div>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap;">
          <button class="fc-btn" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.APP.startDailyFlashcards()">
            🗂️ Bu Günün Kartlarıyla Çalış
          </button>
          <button class="fc-btn" style="padding: 8px 16px; font-size: 0.85rem;" onclick="window.APP.startDailyQuiz()">
            🧩 Bu Günün Mini Testini Çöz
          </button>
        </div>
      </div>

      <div class="words-grid">
        ${cardsHtml}
      </div>
    `;

    // Bind Day navigation
    document.getElementById('prev-day-btn')?.addEventListener('click', () => {
      if (STATE.currentDay > 1) {
        STATE.currentDay--;
        saveUserData();
        updateUI();
      }
    });

    document.getElementById('next-day-btn')?.addEventListener('click', () => {
      const maxDays = (typeof WORDS_DATA !== 'undefined' && Array.isArray(WORDS_DATA)) ? Math.max(...WORDS_DATA.map(w => w.day)) : 82;
      if (STATE.currentDay < maxDays) {
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

    // Bind speak buttons
    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        btn.classList.add('speaking');
        speakWord(word, () => btn.classList.remove('speaking'));
      });
    });
  }

  // 2. 3D FLASHCARD MODU
  function renderFlashcardView() {
    const container = document.getElementById('view-flashcard');
    if (!container) return;

    // Filter cards based on selected source
    const sourceSelect = document.getElementById('fc-source-select');
    const sourceVal = sourceSelect ? sourceSelect.value : (STATE.flashcardSource || 'daily');
    STATE.flashcardSource = sourceVal;

    let pool = [];
    if (sourceVal === 'daily') {
      pool = WORDS_DATA.filter(w => w.day === STATE.currentDay);
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

    if (pool.length === 0) {
      container.innerHTML = `
        <div class="flashcard-wrapper">
          <div class="flashcard-toolbar">
            <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()">
              <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
              <option value="all" ${sourceVal === 'all' ? 'selected' : ''}>Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
              <option value="review" ${sourceVal === 'review' ? 'selected' : ''}>Tekrar Edilecekler (${STATE.userData.review.size})</option>
              <option value="starred" ${sourceVal === 'starred' ? 'selected' : ''}>Favorilerim (${STATE.userData.starred.size})</option>
            </select>
          </div>
          <div class="glass-panel" style="padding: 48px 24px; text-align: center; width: 100%;">
            <div style="font-size: 3rem; margin-bottom: 12px;">📭</div>
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

    container.innerHTML = `
      <div class="flashcard-wrapper">
        <div class="flashcard-toolbar">
          <select class="filter-source-select" id="fc-source-select" onchange="window.APP.renderFlashcardView()">
            <option value="daily" ${sourceVal === 'daily' ? 'selected' : ''}>Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
            <option value="all" ${sourceVal === 'all' ? 'selected' : ''}>Tüm Kelime Havuzu (${WORDS_DATA.length})</option>
            <option value="review" ${sourceVal === 'review' ? 'selected' : ''}>Tekrar Edilecekler (${STATE.userData.review.size})</option>
            <option value="starred" ${sourceVal === 'starred' ? 'selected' : ''}>Favorilerim (${STATE.userData.starred.size})</option>
          </select>

          <div class="flashcard-counter">
            ${STATE.activeFlashcardIndex + 1} / ${pool.length}
          </div>

          <button class="ctrl-btn" onclick="window.APP.shuffleFlashcards()" title="Kartları Karıştır">
            🔀 Karıştır
          </button>
        </div>

        <div class="card-scene" id="flashcard-scene" title="Kartı çevirmek için tıklayın veya Boşluk (Space) tuşuna basın">
          <div class="flashcard-inner ${STATE.flashcardFlipped ? 'flipped' : ''}" id="flashcard-inner">
            
            <!-- Front Face -->
            <div class="card-face card-face-front">
              <div class="fc-header">
                <div class="fc-badges">
                  ${getCefrBadgeHtml(currentWord.cefr)}
                  ${getThemeBadgeHtml(currentWord.themeCode, currentWord.themeTitle)}
                </div>
                <button class="speak-btn" id="fc-speak-btn" title="Telaffuzu Dinle">🔊</button>
              </div>

              <div class="fc-main">
                <div class="fc-word-en">${currentWord.en}</div>
                <div class="fc-category-desc">${currentWord.desc} • ${currentWord.cat}</div>
              </div>

              <div class="fc-footer">
                <span class="fc-hint">👆 Tıkla veya [Space] ile Türkçe anlamını gör</span>
                <span>#${currentWord.no}</span>
              </div>
            </div>

            <!-- Back Face -->
            <div class="card-face card-face-back">
              <div class="fc-header">
                <div class="fc-badges">
                  <span class="cefr-pill" style="background: rgba(16,185,129,0.2); color:#34d399; border-color:#10b981;">TÜRKÇE KARŞILIĞI</span>
                </div>
                <button class="speak-btn" id="fc-speak-back-btn" title="Telaffuzu Dinle">🔊</button>
              </div>

              <div class="fc-main">
                <div class="fc-word-tr">${currentWord.tr || '<span style="color:var(--text-dim); font-style:italic;">(Anlamı yakında eklenecek)</span>'}</div>
                <div class="fc-category-desc">${currentWord.en} &mdash; ${currentWord.desc}</div>
                ${currentWord.synonym ? `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:6px;"><strong>Eş Anlam:</strong> ${currentWord.synonym}</div>` : ''}
                ${currentWord.example ? `<div style="font-size:0.8rem; color:var(--accent-cyan); font-style:italic; margin-top:6px; max-width:92%;">“${currentWord.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
              </div>

              <div class="fc-footer">
                <span class="fc-hint">👆 Tıkla veya [Space] ile İngilizce yüzüne dön</span>
                <span>${currentWord.themeTitleTr}</span>
              </div>
            </div>

          </div>
        </div>

        <!-- Controls -->
        <div class="fc-controls">
          <button class="fc-btn" id="fc-prev-btn" title="Önceki Kelime">&larr; Önceki</button>
          
          <button class="fc-btn review-btn ${isReview ? 'active' : ''}" onclick="window.APP.toggleReview(${currentWord.id}); window.APP.nextFlashcard();">
            🔄 Tekrar Et [1]
          </button>
          
          <button class="fc-btn learned-btn ${isLearned ? 'active' : ''}" onclick="window.APP.toggleLearned(${currentWord.id}); window.APP.nextFlashcard();">
            ✅ Öğrendim [2]
          </button>
          
          <button class="fc-btn" id="fc-next-btn" title="Sonraki Kelime">Sonraki &rarr;</button>
        </div>

        <div class="keyboard-hints">
          <span><span class="kb-key">Space</span> Çevir</span>
          <span><span class="kb-key">&larr;</span> / <span class="kb-key">&rarr;</span> Değiştir</span>
          <span><span class="kb-key">P</span> Dinle</span>
          <span><span class="kb-key">1</span> Tekrar Et</span>
          <span><span class="kb-key">2</span> Öğrendim</span>
        </div>
      </div>
    `;

    // Flip Event
    const scene = document.getElementById('flashcard-scene');
    scene?.addEventListener('click', () => {
      STATE.flashcardFlipped = !STATE.flashcardFlipped;
      playSound('flip');
      const inner = document.getElementById('flashcard-inner');
      inner?.classList.toggle('flipped', STATE.flashcardFlipped);
    });

    // Speak buttons
    const speakBtn = document.getElementById('fc-speak-btn');
    const speakBackBtn = document.getElementById('fc-speak-back-btn');
    [speakBtn, speakBackBtn].forEach(btn => {
      btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        btn.classList.add('speaking');
        speakWord(currentWord.en, () => btn.classList.remove('speaking'));
      });
    });

    // Next / Prev buttons
    document.getElementById('fc-prev-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.APP.prevFlashcard();
    });

    document.getElementById('fc-next-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.APP.nextFlashcard();
    });
  }

  // 3. QUIZ & TEST MODU
  function renderQuizView() {
    const container = document.getElementById('view-quiz');
    if (!container) return;

    if (!STATE.quizState.active) {
      // Quiz Setup Screen
      container.innerHTML = `
        <div class="quiz-wrapper">
          <div class="quiz-setup-card glass-panel">
            <h2>🧩 İngilizce Kelime Testi & Quiz</h2>
            <p>Bilgilerinizi pekiştirin, çoktan seçmeli sorularla kendinizi test edin ve skorunuzu artırın.</p>

            <div class="quiz-config-grid">
              <div class="config-group">
                <label>Soru Türü</label>
                <select id="quiz-mode-select">
                  <option value="en-tr">🇬🇧 İngilizce &rarr; 🇹🇷 Türkçe (Anlamını Bul)</option>
                  <option value="tr-en">🇹🇷 Türkçe &rarr; 🇬🇧 İngilizce (Kelimeyi Yaz/Bul)</option>
                  <option value="listening">🎧 Dinleme & Anlama (Sesi Dinle)</option>
                </select>
              </div>

              <div class="config-group">
                <label>Soru Kaynağı</label>
                <select id="quiz-source-select">
                  <option value="daily">Günün 10 Kelimesi (Gün ${STATE.currentDay})</option>
                  <option value="all">Tüm Kelime Havuzu (${WORDS_DATA.length} Kelime)</option>
                  <option value="review">Zorlandıklarım / Tekrar Edilecekler (${STATE.userData.review.size})</option>
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
                  <option value="all">Tüm Seviyeler (A1 - C2)</option>
                  <option value="A1">Yalnızca A1 Seviyesi</option>
                  <option value="A2">Yalnızca A2 Seviyesi</option>
                  <option value="B1">Yalnızca B1 Seviyesi</option>
                  <option value="B2">B2 ve İleri Düzey</option>
                </select>
              </div>
            </div>

            <button class="start-quiz-btn" onclick="window.APP.startQuiz()">
              🚀 Teste Başla
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Active Quiz Question Screen
    const qState = STATE.quizState;
    if (qState.currentIndex >= qState.questions.length) {
      renderQuizResults(container);
      return;
    }

    const currentQ = qState.questions[qState.currentIndex];

    let optionsHtml = '';
    currentQ.options.forEach((opt, idx) => {
      optionsHtml += `
        <button class="quiz-opt-btn" onclick="window.APP.handleQuizAnswer(${idx})" data-idx="${idx}">
          <span><strong>${String.fromCharCode(65 + idx)})</strong> &nbsp; ${opt.text}</span>
          <span class="opt-feedback-icon"></span>
        </button>
      `;
    });

    let questionHeader = '';
    if (qState.mode === 'listening') {
      questionHeader = `
        <div class="quiz-prompt-label">🎧 Telaffuzu Dinleyin ve Doğru Kelimeyi Seçin</div>
        <div style="margin: 18px 0;">
          <button class="speak-btn" style="width: 64px; height: 64px; font-size: 1.8rem; margin: 0 auto;" onclick="window.APP.replayQuizAudio()">
            🔊
          </button>
        </div>
        <div style="font-size: 0.9rem; color: var(--text-muted);">${currentQ.targetWord.desc} • ${currentQ.targetWord.cat}</div>
      `;
    } else if (qState.mode === 'tr-en') {
      questionHeader = `
        <div class="quiz-prompt-label">🇹🇷 Türkçe Anlamı Verilen İngilizce Kelimeyi Bulun</div>
        <div class="quiz-question-text" style="color: var(--accent-emerald);">${currentQ.targetWord.tr}</div>
        <div style="font-size: 0.85rem; color: var(--text-dim);">${currentQ.targetWord.desc} • ${currentQ.targetWord.themeTitle}</div>
      `;
    } else {
      questionHeader = `
        <div class="quiz-prompt-label">🇬🇧 Kelimenin Türkçe Anlamını Seçin</div>
        <div class="quiz-question-text">${currentQ.targetWord.en}</div>
        <div style="font-size: 0.85rem; color: var(--text-dim);">${currentQ.targetWord.desc} • ${currentQ.targetWord.cat}</div>
      `;
    }

    container.innerHTML = `
      <div class="quiz-wrapper">
        <div class="quiz-active-card glass-panel">
          <div class="quiz-top-bar">
            <span class="quiz-progress-num">Soru ${qState.currentIndex + 1} / ${qState.questions.length}</span>
            <div style="display: flex; gap: 8px; align-items: center;">
              <span class="quiz-streak-pill">${qState.streak > 1 ? '🔥 ' + qState.streak + ' Kombo' : 'Skor: ' + qState.score}</span>
              <button class="ctrl-btn" style="height: 30px; font-size: 0.72rem; padding: 0 8px;" onclick="window.APP.quitQuiz()">Çıkış</button>
            </div>
          </div>

          <div class="progress-track" style="margin-bottom: 20px;">
            <div class="progress-fill" style="width: ${(qState.currentIndex / qState.questions.length) * 100}%;"></div>
          </div>

          <div class="quiz-question-box">
            ${questionHeader}
          </div>

          <div class="quiz-options-list">
            ${optionsHtml}
          </div>

          <div id="quiz-feedback-box" style="display: none; padding: 14px; border-radius: var(--radius-md); text-align: center; font-weight: 700; margin-top: 14px;"></div>
        </div>
      </div>
    `;

    // Auto-play audio if in listening mode
    if (qState.mode === 'listening') {
      speakWord(currentQ.targetWord.en);
    }
  }

  function renderQuizResults(container) {
    const qState = STATE.quizState;
    const total = qState.questions.length;
    const correct = qState.score;
    const percent = Math.round((correct / (total || 1)) * 100);

    // Update global stats
    STATE.userData.stats.quizzesPlayed++;
    STATE.userData.stats.totalQuestions += total;
    STATE.userData.stats.correctAnswers += correct;
    if (qState.streak > STATE.userData.stats.bestStreak) {
      STATE.userData.stats.bestStreak = qState.streak;
    }
    saveUserData();

    // Trigger confetti if high score
    if (percent >= 80) {
      triggerConfetti();
    }

    container.innerHTML = `
      <div class="quiz-wrapper">
        <div class="quiz-results-card glass-panel">
          <div class="results-score-circle">
            <span class="results-score-num">%${percent}</span>
            <span class="results-score-label">${correct} / ${total} Doğru</span>
          </div>

          <h2 style="font-family: var(--font-heading); margin-bottom: 8px;">
            ${percent >= 80 ? '🎉 Harika Başarı!' : percent >= 50 ? '👏 Tebrikler, İyi Çalışma!' : '💪 Pratik Yapmaya Devam!'}
          </h2>
          <p style="color: var(--text-muted); margin-bottom: 24px;">
            ${percent >= 80 ? 'Kelimeleri gayet iyi kavramışsınız. Öğrenme seriniz güçleniyor!' : 'Zorlandığınız kelimeleri Flashcard üzerinden tekrar etmenizi öneririz.'}
          </p>

          <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
            <button class="fc-btn" onclick="window.APP.startQuiz()">🔄 Tekrar Çöz</button>
            <button class="fc-btn" style="background: var(--primary); color: #fff;" onclick="window.APP.switchView('flashcard')">🗂️ Kartlarla Çalış</button>
            <button class="ctrl-btn" onclick="window.APP.quitQuiz()">Ana Sayfaya Dön</button>
          </div>
        </div>
      </div>
    `;
  }

  // 4. KELİME BANKASI (DIRECTORY)
  function renderDirectoryView() {
    const container = document.getElementById('view-directory');
    if (!container) return;

    const filters = STATE.directoryFilters;

    let filtered = WORDS_DATA.filter(w => {
      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchEn = w.en.toLowerCase().includes(query);
        const matchTr = (w.tr || '').toLowerCase().includes(query);
        const matchCat = (w.cat || '').toLowerCase().includes(query);
        if (!matchEn && !matchTr && !matchCat) return false;
      }

      // Theme filter
      if (filters.theme !== 'all' && w.themeNum !== parseInt(filters.theme, 10)) {
        return false;
      }

      // CEFR filter
      if (filters.cefr !== 'all' && w.cefr !== filters.cefr) {
        return false;
      }

      // Status filter
      if (filters.status === 'learned' && !STATE.userData.learned.has(w.id)) return false;
      if (filters.status === 'review' && !STATE.userData.review.has(w.id)) return false;
      if (filters.status === 'starred' && !STATE.userData.starred.has(w.id)) return false;

      return true;
    });

    let cardsHtml = '';
    filtered.slice(0, 100).forEach(w => {
      const isLearned = STATE.userData.learned.has(w.id);
      const isReview = STATE.userData.review.has(w.id);
      const isStarred = STATE.userData.starred.has(w.id);

      cardsHtml += `
        <div class="word-card glass-panel" data-id="${w.id}">
          <div class="card-top">
            <div class="card-tags">
              ${getCefrBadgeHtml(w.cefr)}
              ${getThemeBadgeHtml(w.themeCode, w.themeTitle)}
            </div>
            <span class="word-number">#${w.no}</span>
          </div>

          <div class="card-body">
            <div class="word-en-row">
              <span class="word-en">${w.en}</span>
              <button class="speak-btn" data-word="${w.en}">🔊</button>
            </div>
            <div class="word-tr">${w.tr || '<span style="color:var(--text-dim); font-style:italic;">(Anlamı yakında eklenecek)</span>'}</div>
            <div class="word-pos">${w.desc} • ${w.cat} • Gün ${w.day}</div>
            ${w.synonym ? `<div class="word-synonym" style="font-size:0.75rem; color:var(--text-muted); margin-top:4px;"><strong>Eş Anlam:</strong> ${w.synonym}</div>` : ''}
            ${w.example ? `<div class="word-example" style="font-size:0.75rem; color:var(--accent-cyan); font-style:italic; margin-top:3px; opacity:0.9;">“${w.example.replace(/^["“”]|["“”]$/g, '')}”</div>` : ''}
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
          <input type="text" class="search-input" id="dir-search-input" placeholder="İngilizce veya Türkçe kelime ara... (ör: teacher, okul, hospital)" value="${filters.search}">
        </div>

        <!-- Theme Filter Chips -->
        <div style="margin-bottom: 10px;">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">Maarif Modeli Temaları</div>
          <div class="filter-chips-group" id="theme-chips">
            <button class="filter-chip ${filters.theme === 'all' ? 'active' : ''}" data-val="all">Tüm Temalar (${WORDS_DATA.length})</button>
            <button class="filter-chip ${filters.theme === '1' ? 'active' : ''}" data-val="1">Theme 1: School (${WORDS_DATA.filter(w=>w.themeNum===1).length})</button>
            <button class="filter-chip ${filters.theme === '2' ? 'active' : ''}" data-val="2">Theme 2: Classroom (${WORDS_DATA.filter(w=>w.themeNum===2).length})</button>
            <button class="filter-chip ${filters.theme === '3' ? 'active' : ''}" data-val="3">Theme 3: Personal (${WORDS_DATA.filter(w=>w.themeNum===3).length})</button>
            <button class="filter-chip ${filters.theme === '4' ? 'active' : ''}" data-val="4">Theme 4: Family (${WORDS_DATA.filter(w=>w.themeNum===4).length})</button>
            <button class="filter-chip ${filters.theme === '5' ? 'active' : ''}" data-val="5">Theme 5: City (${WORDS_DATA.filter(w=>w.themeNum===5).length})</button>
            <button class="filter-chip ${filters.theme === '6' ? 'active' : ''}" data-val="6">Theme 6: World (${WORDS_DATA.filter(w=>w.themeNum===6).length})</button>
            <button class="filter-chip ${filters.theme === '7' ? 'active' : ''}" data-val="7">Theme 7: Nature (${WORDS_DATA.filter(w=>w.themeNum===7).length})</button>
            <button class="filter-chip ${filters.theme === '8' ? 'active' : ''}" data-val="8">Theme 8: Future (${WORDS_DATA.filter(w=>w.themeNum===8).length})</button>
          </div>
        </div>

        <!-- CEFR Filter Chips -->
        <div style="margin-bottom: 10px;">
          <div style="font-size: 0.72rem; font-weight: 800; text-transform: uppercase; color: var(--text-dim); margin-bottom: 6px;">CEFR Düzeyleri</div>
          <div class="filter-chips-group" id="cefr-chips">
            <button class="filter-chip ${filters.cefr === 'all' ? 'active' : ''}" data-val="all">Tüm Düzeyler</button>
            <button class="filter-chip ${filters.cefr === 'A1' ? 'active' : ''}" data-val="A1">A1</button>
            <button class="filter-chip ${filters.cefr === 'A2' ? 'active' : ''}" data-val="A2">A2</button>
            <button class="filter-chip ${filters.cefr === 'B1' ? 'active' : ''}" data-val="B1">B1</button>
            <button class="filter-chip ${filters.cefr === 'B2' ? 'active' : ''}" data-val="B2">B2</button>
            <button class="filter-chip ${filters.cefr === 'C1' ? 'active' : ''}" data-val="C1">C1</button>
            <button class="filter-chip ${filters.cefr === 'C2' ? 'active' : ''}" data-val="C2">C2</button>
            <button class="filter-chip ${filters.cefr === 'C2+' ? 'active' : ''}" data-val="C2+">C2+</button>
          </div>
        </div>

        <!-- Status Filter Chips -->
        <div>
          <div class="filter-chips-group" id="status-chips">
            <button class="filter-chip ${filters.status === 'all' ? 'active' : ''}" data-val="all">Tüm Kelimeler</button>
            <button class="filter-chip ${filters.status === 'learned' ? 'active' : ''}" data-val="learned">✅ Öğrenilenler (${STATE.userData.learned.size})</button>
            <button class="filter-chip ${filters.status === 'review' ? 'active' : ''}" data-val="review">🔄 Tekrar Edilecekler (${STATE.userData.review.size})</button>
            <button class="filter-chip ${filters.status === 'starred' ? 'active' : ''}" data-val="starred">⭐ Favoriler (${STATE.userData.starred.size})</button>
          </div>
        </div>

        <div class="dir-results-info">
          ${WORDS_DATA.length} kelimeden <strong>${filtered.length} tanesi</strong> listeleniyor ${filtered.length > 100 ? '(İlk 100 gösteriliyor)' : ''}
        </div>
      </div>

      <div class="words-grid">
        ${cardsHtml}
      </div>
    `;

    // Bind search
    document.getElementById('dir-search-input')?.addEventListener('input', (e) => {
      STATE.directoryFilters.search = e.target.value;
      renderDirectoryView();
    });

    // Bind chip groups
    container.querySelectorAll('#theme-chips .filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        STATE.directoryFilters.theme = btn.getAttribute('data-val');
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

    // Speak buttons
    container.querySelectorAll('.speak-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const word = btn.getAttribute('data-word');
        btn.classList.add('speaking');
        speakWord(word, () => btn.classList.remove('speaking'));
      });
    });
  }

  // 5. İSTATİSTİKLER (STATS & MASTERY)
  function renderStatsView() {
    const container = document.getElementById('view-stats');
    if (!container) return;

    const totalLearned = STATE.userData.learned.size;
    const totalReview = STATE.userData.review.size;
    const totalWords = WORDS_DATA.length;
    const progressPercent = Math.round((totalLearned / totalWords) * 100);

    const quizStats = STATE.userData.stats;
    const quizAccuracy = quizStats.totalQuestions > 0 ? Math.round((quizStats.correctAnswers / quizStats.totalQuestions) * 100) : 0;

    // Theme breakdown
    let themesBreakdownHtml = '';
    for (let t = 1; t <= 8; t++) {
      const tWords = WORDS_DATA.filter(w => w.themeNum === t);
      const tLearned = tWords.filter(w => STATE.userData.learned.has(w.id)).length;
      const tPct = Math.round((tLearned / (tWords.length || 1)) * 100);
      const tMeta = THEMES_DATA[t];

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

    container.innerHTML = `
      <div class="stats-summary-grid">
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--accent-emerald);">${totalLearned}</div>
          <div class="metric-title">Öğrenilen Kelimeler (%${progressPercent})</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--accent-amber);">${totalReview}</div>
          <div class="metric-title">Tekrar Listesi</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--primary-light);">${quizAccuracy}%</div>
          <div class="metric-title">Quiz Doğruluk Oranı</div>
        </div>
        <div class="stat-metric-card glass-panel">
          <div class="metric-val" style="color: var(--accent-cyan);">${quizStats.bestStreak}</div>
          <div class="metric-title">En Yüksek Soru Kombosu 🔥</div>
        </div>
      </div>

      <div class="themes-breakdown-card glass-panel" style="margin-bottom: 24px;">
        <h3 style="font-family: var(--font-heading); margin-bottom: 14px;">📚 8 Maarif Teması Kazanım & İlerleme Tablosu</h3>
        ${themesBreakdownHtml}
      </div>

      <div class="glass-panel" style="padding: 20px; text-align: center;">
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 12px;">İlerlemenizi sıfırlayıp baştan başlamak ister misiniz?</p>
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
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
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
        p.vy += 0.35; // gravity
        p.rotation += p.vr;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frame++;
      if (frame < 90) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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

    // Update navigation tabs
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
    });

    // Update view containers
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewName}`);
    });

    // Render active view
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
      pool = WORDS_DATA.filter(w => w.day === STATE.currentDay);
    } else if (source === 'review') {
      pool = WORDS_DATA.filter(w => STATE.userData.review.has(w.id));
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

    // Shuffle pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const qCount = countVal === 'all' ? shuffled.length : Math.min(parseInt(countVal, 10), shuffled.length);
    const selectedTargets = shuffled.slice(0, qCount);

    const questions = selectedTargets.map(target => {
      // Pick 3 distractors
      const distractors = WORDS_DATA
        .filter(w => w.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const options = [target, ...distractors]
        .sort(() => Math.random() - 0.5)
        .map(w => ({
          id: w.id,
          text: mode === 'tr-en' ? w.en : w.tr,
          isCorrect: w.id === target.id
        }));

      return {
        targetWord: target,
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
      // Mark as review
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
    // Only handle if not typing in input
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
    // Apply theme
    document.documentElement.setAttribute('data-theme', STATE.settings.theme);

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

    // Speed Switcher (1x / 0.8x)
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

    // Theme toggle (Dark / Light)
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

    // Initial view render with hash routing
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

    // Register service worker if available
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker.register('./service-worker.js').catch(err => {
        console.log('SW registration note:', err);
      });
    }
  }

  // Export to Global Scope for HTML Event Handlers
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
    switchView
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
