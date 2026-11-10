# Learnish — Product Definition

## Overview
Learnish is an interactive English lexical acquisition and exam preparation instrument built for Turkish learners across three structured tracks:
1. **MEB 5. Sınıf Maarif Modeli:** 815 müfredat kelimesi, 8 tematik ünite ve 82 günlük mikro-çalışma paketi (10 kelime/gün).
2. **YDS & YÖKDİL Akademik:** 7.387 yüksek verimli akademik kelime ve kalıp (2020–2026 ÖSYM sınavları: isimler, fiiller, edatlı fiiller, phrasal verbs, edat alan sözcükler, edatlar, bağlaçlar, eşdizimler ve fiil tamamlama kalıpları).
3. **The Oxford 5000:** 4.886 uluslararası CEFR seviyeli (A1–C1) temel kelime dağarcığı.
*Genel Toplam: 9.234 benzersiz kelime ve kalıp (sıfır tekrar - tam tekilleştirilmiş birleşik havuz).*

## Core Workflows & Views
- **`#daily` (Günlük Çalışma / Workout):** Structured daily lexical batches with Web Speech API native pronunciation (UK/US, variable speed), phonetic transcription, example context, and mastery state toggles (`Öğrendim`, `Tekrar`, `Favori`).
- **`#flashcard` (Kart Çalışması):** Tactile two-sided lexical inspection cards with keyboard-first navigation (`Space`, `ArrowLeft`, `ArrowRight`, `P`, `1`, `2`).
- **`#quiz` (Sınav & Test Simülatörü):** Multiple-choice, listening, definition-matching, and YDS Cloze tests with `localStorage` session persistence and mandatory pedagogical error review before advancing on incorrect answers.
- **`#directory` (Kelime Havuzu):** Instant search and multi-facet filtering across all 9,234 entries by dataset, POS, CEFR level, and mastery state.
- **`#stats` (Telemetri & Analiz):** Quantitative breakdown of lexical acquisition across themes, CEFR tiers, and academic parts of speech.

