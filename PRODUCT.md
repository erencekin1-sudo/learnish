# Learnish — Product Definition

## Overview
Learnish is an interactive English lexical acquisition and exam preparation instrument built for Turkish learners across three structured tracks:
1. **MEB 5. Sınıf Maarif Modeli:** 817 curriculum words organized into 8 thematic units and 82 daily micro-batches (10 words/day).
2. **YDS & YÖKDİL Akademik:** 2,894 high-yield B2/C1 academic words with collocations, prepositions, synonyms, and ÖSYM-style cloze/definition simulators.
3. **The Oxford 5000:** 5,841 international CEFR-graded (A1–C1) core vocabulary entries.

## Core Workflows & Views
- **`#daily` (Günlük Çalışma / Workout):** Structured daily lexical batches with Web Speech API native pronunciation (UK/US, variable speed), phonetic transcription, example context, and mastery state toggles (`Öğrendim`, `Tekrar`, `Favori`).
- **`#flashcard` (Kart Çalışması):** Tactile two-sided lexical inspection cards with keyboard-first navigation (`Space`, `ArrowLeft`, `ArrowRight`, `P`, `1`, `2`).
- **`#quiz` (Sınav & Test Simülatörü):** Multiple-choice, listening, definition-matching, and YDS Cloze tests with `localStorage` session persistence and mandatory pedagogical error review before advancing on incorrect answers.
- **`#directory` (Kelime Havuzu):** Instant search and multi-facet filtering across all 6,658 entries by dataset, POS, CEFR level, and mastery state.
- **`#stats` (Telemetri & Analiz):** Quantitative breakdown of lexical acquisition across themes, CEFR tiers, and academic parts of speech.
